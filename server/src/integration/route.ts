import { Hono } from "hono";
import { download } from "@lib/download";
import frameExtraction from "@lib/frameExtraction";
import { createTask, getTask, updateTaskStatus, getTaskResultPaths, TaskStatus, VideoProcessingTaskData } from "@lib/taskManager";
import * as fs from 'fs';
import * as path from 'path';

const app = new Hono();

// 创建视频处理任务
app.post("/crispplum", async(ctx) => {
  const init = await ctx.req.json();
  const filetime = Date.now().toString();
  const fileName = filetime + ".mp4";
  
  // 创建任务
  const taskData: VideoProcessingTaskData = {
    video_url: init.video_url,
    filetime,
    fileName,
    outputDir: "./temp/frames",
    extractMode: init.extractMode || "random",
    outputFormat: init.outputFormat || "jpg"
  };
  
  const task = createTask("video-processing", taskData);
  
  // 异步处理任务
  processVideoTask(task.id, ctx).catch(error => {
    console.error(`处理任务 ${task.id} 失败:`, error);
    updateTaskStatus(task.id, TaskStatus.FAILED, null, error.message);
  });
  
  return ctx.json({ task_id: task.id});
});

// 查询任务状态和结果
app.get("/crispplum/:taskId", async(ctx) => {
  const { taskId } = ctx.req.param();
  const task = getTask(taskId);
  
  if (!task) {
    return ctx.json({ error: "任务不存在" }, 404);
  }
  
  const response: any = {
    task_id: task.id,
    status: task.status,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    result: null,
  };
  
  if (task.status === TaskStatus.COMPLETED) {
    response.result = {
      frame_paths: getTaskResultPaths(task),
      tree_analysis: task.result?.tree_analysis || null
    };
  } else if (task.status === TaskStatus.FAILED) {
    response.error = task.error;
  }
  return ctx.json(response);
});

// 处理视频任务的异步函数
async function processVideoTask(taskId: string, ctx?: any): Promise<void> {
  const task = getTask(taskId);
  if (!task) return;
  try {
    updateTaskStatus(taskId, TaskStatus.PROCESSING);
    const data = task.data as VideoProcessingTaskData;
    
    // 下载视频
    await download(data.video_url, data.fileName);
    
    // 提取帧
    await frameExtraction({
      filetime: data.filetime,
      inputPath: `./temp/${data.fileName}`,
      outputDir: data.outputDir,
      extractMode: data.extractMode as 'random' | 'uniform',
      frameCount: 5, // 默认提取5帧
      outputFormat: data.outputFormat
    });
    
    // 获取提取的帧路径
    const framePaths = getTaskResultPaths(task);
    
    // 树势分析 - 调用外部API
    const treeAnalysisResults = await performTreeAnalysis(framePaths, ctx);
    
    // 更新任务状态为完成
    updateTaskStatus(taskId, TaskStatus.COMPLETED, {
      message: "视频处理完成",
      tree_analysis: treeAnalysisResults
    });
  } catch (error: any) {
    console.error(`处理任务 ${taskId} 失败:`, error);
    updateTaskStatus(taskId, TaskStatus.FAILED, null, error.message);
  }
}

// 树势分析函数 - 调用外部API
async function performTreeAnalysis(framePaths: string[], ctx?: any): Promise<any> {
  // 调用树势分析API的代码
  try {
    // 树势分析API地址
    const apiUrl = "https://api.platform.archivemodel.cn/services/service:zru08qjthy1u8x6gflkc/fetch/predict";
    
    // 获取原始请求头
    const headers: Record<string, string> = {};
    if (ctx) {
      // 复制原始请求头
      for (const [key, value] of ctx.req.raw.headers.entries()) {
        headers[key] = value;
      }
    }
    
    // 确保Content-Type正确设置为multipart/form-data
    delete headers['content-length']; // 删除content-length以避免冲突
    
    // 处理每个图片文件并发送到API
    const results = [];
    for (const framePath of framePaths) {
      // 读取图片文件
      const fileBuffer = fs.readFileSync(framePath);
      
      // 创建FormData
      const formData = new FormData();
      const fileName = path.basename(framePath);
      const fileBlob = new Blob([fileBuffer]);
      formData.append('file', fileBlob, fileName);
      
      // 发送请求到树势分析API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      results.push(result);
    }
    
    // 处理并合并所有图片的分析结果
    const combinedResults = {
      health_score: results.reduce((sum, r) => sum + (r.health_score || 0), 0) / results.length,
      growth_potential: results.length > 0 ? results[0].growth_potential : "未知",
      branch_analysis: results.length > 0 ? results[0].branch_analysis : {},
      recommendations: results.length > 0 ? results[0].recommendations : [],
      detailed_results: results // 保存每张图片的详细分析结果
    };
    
    return combinedResults;
  } catch (error) {
    console.error("树势分析API调用失败:", error);
    return null;
  }
}


export default app;