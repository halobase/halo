import { Hono } from "hono";
import * as fs from "fs";
import PQueue from "p-queue";
import { download } from "@lib/download";
import frameExtraction from "@lib/frameExtraction";
import {
  createTask,
  getTask,
  updateTaskStatus,
  updateTaskResult,
  getTaskResultPaths,
  cleanupTask,
  VideoProcessingTaskData,
} from "@lib/taskManager";
import env from "@lib/env";
import { performTreeAnalysis } from "@lib/crispplum/treeAnalysis";
import { llmReturnResult } from "@lib/crispplum/llmAdvisor";
import { treeReconstruction } from "@lib/crispplum/reconstruction";
import type { ReqEnv } from "@lib/crispplum/constants";
import { VALID_PERIODS_FOR_RECONSTRUCTION } from "@lib/crispplum/constants";

const app = new Hono();

const totalTaskQueue = new PQueue({ concurrency: Number(env.CRISPPLUM_TOTAL_TASK_CONCURRENCY) || 10 });
const reconstructionQueue = new PQueue({ concurrency: Number(env.CRISPPLUM_RECONSTRUCTION_CONCURRENCY) || 3 });

// 创建视频处理任务
app.post("/crispplum", async (ctx) => {
  const baseUrl = new URL(ctx.req.url).origin;
  const apiKey = ctx.req.raw.headers.get("x-api-key");
  const reqEnv: ReqEnv = { baseUrl, apiKey: apiKey || null };
  const init = await ctx.req.json();
  const filetime = Date.now().toString();
  const fileName = filetime + ".mp4";
  console.log("视频链接：" + init.video_url);

  const taskData: VideoProcessingTaskData = {
    video_url: init.video_url,
    filetime,
    fileName,
    outputDir: `./temp/frames`,
    extractMode: init.extractMode || "random",
    outputFormat: init.outputFormat || "jpg",
  };

  const task = createTask("video-processing", taskData);

  totalTaskQueue.add(() => processVideoTask(task.id, reqEnv)).catch((error) => {
    console.error(`处理任务 ${task.id} 失败:`, error);
    updateTaskStatus(task.id, "任务失败", undefined, error?.message ?? String(error));
  });

  return ctx.json({ task_id: task.id });
});

// 查询任务状态和结果
app.get("/crispplum/:taskId", async (ctx) => {
  const { taskId } = ctx.req.param();
  const task = getTask(taskId);

  if (!task) {
    return ctx.json({ error: "任务不存在" }, 404);
  }

  let displayStatus = task.status;
  if (task.status === "pending") {
    displayStatus = "前方还有任务未完成，正在排队请稍等。";
  }

  const response: any = {
    task_id: task.id,
    status: displayStatus,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    result: task.result,
  };

  if (task.status === "任务失败") {
    response.error = task.error;
  }
  return ctx.json(response);
});

async function processVideoTask(taskId: string, reqEnv: ReqEnv): Promise<void> {
  const task = getTask(taskId);
  if (!task) return;

  try {
    const data = task.data as VideoProcessingTaskData;

    updateTaskStatus(taskId, "视频处理中");
    await download(data.video_url, data.fileName);

    await frameExtraction({
      filetime: data.filetime,
      inputPath: `./temp/${data.fileName}`,
      outputDir: data.outputDir,
      extractMode: data.extractMode as "random" | "uniform",
      frameCount: 5,
      outputFormat: data.outputFormat,
    });

    // 获取最新任务对象以读取最新的结果路径
    const latestTaskAfterExtraction = getTask(taskId) || task;
    const framePaths = getTaskResultPaths(latestTaskAfterExtraction);

    // 校验是否成功提取到帧，避免后续直接空指针或传入非法参数
    if (!framePaths || framePaths.length === 0) {
      const msg = "未能提取到帧图片，无法继续处理";
      console.error(msg);
      updateTaskStatus(taskId, "任务失败", undefined, msg);
      return;
    }

    setTimeout(async () => {
      try {
        // 清理任务元数据
        cleanupTask(taskId);

        // 删除帧图片
        if (framePaths && framePaths.length > 0) {
          for (const framePath of framePaths) {
            if (fs.existsSync(framePath)) {
              await fs.promises.unlink(framePath);
              console.log(`已删除帧图片: ${framePath}`);
            }
          }
        }

        // 删除临时视频文件（若存在）
        const videoTempPath = `./temp/${data.fileName}`;
        if (fs.existsSync(videoTempPath)) {
          await fs.promises.unlink(videoTempPath);
          console.log(`已删除临时视频: ${videoTempPath}`);
        }
      } catch (err) {
        console.error("删除临时文件失败:", err);
      }
    }, 60 * 60 * 1000);

    updateTaskStatus(taskId, "树体分析中");
    await performTreeAnalysis(framePaths, reqEnv, taskId);

    const currentTask = getTask(taskId);
    if (!currentTask || !currentTask.result || !currentTask.result.tree_analysis) {
      throw new Error("无法获取树势分析结果");
    }


    const treeAnalysis = currentTask.result.tree_analysis;
    await llmReturnResult(
      treeAnalysis.phenological_period,
      treeAnalysis.tree_potential,
      treeAnalysis.leaf_plum_ratio,
      taskId
    );

    const updatedTask = getTask(taskId);
    const phenologicalPeriod = updatedTask?.result?.tree_analysis?.phenological_period;

    if (phenologicalPeriod && !VALID_PERIODS_FOR_RECONSTRUCTION.includes(phenologicalPeriod)) {
      console.log(`检测到物候期为${phenologicalPeriod}，不进行后续处理`);
      updateTaskResult(taskId, {
        processing_status: `检测到物候期为${phenologicalPeriod}，不进行后续处理`,
      });
      updateTaskStatus(taskId, "任务完成");
      return;
    }

    try {
      updateTaskStatus(taskId, "三维重建中");
      await treeReconstruction(reconstructionQueue, data.video_url, reqEnv, taskId);
      // 重建成功后标记任务完成
      updateTaskStatus(taskId, "任务完成");
    } catch (err: any) {
      console.error("三维重建失败:", err);
      // 将重建错误记录到结果中并标记任务失败
      updateTaskResult(taskId, { reconstruction_error: err?.message ?? String(err) });
      updateTaskStatus(taskId, "任务失败", undefined, err?.message ?? String(err));
      return;
    }
  } catch (error: any) {
    console.error(`处理任务 ${taskId} 失败:`, error);
    updateTaskStatus(taskId, "任务失败", undefined, error.message);
  }

  // 最后尝试立即删除临时视频文件（兜底）
  try {
    const latest = getTask(taskId);
    const filename = (latest?.data as VideoProcessingTaskData)?.fileName || task.data.fileName;
    const videoPath = `./temp/${filename}`;
    if (videoPath && fs.existsSync(videoPath)) {
      await fs.promises.unlink(videoPath);
      console.log(`已删除临时视频: ${videoPath}`);
    }
  } catch (err) {
    console.error("删除临时视频失败:", err);
  }
}

export default app;
