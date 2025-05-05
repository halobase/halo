import { Context, Hono } from "hono";
import { download } from "@lib/download";
import frameExtraction from "@lib/frameExtraction";
import { createTask, getTask, updateTaskStatus, updateTaskResult, getTaskResultPaths, TaskStatus, VideoProcessingTaskData } from "@lib/taskManager";
import * as fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import * as path from 'path';

const app = new Hono();

// 创建视频处理任务
app.post("/crispplum", async (ctx) => {
  const init = await ctx.req.json();
  const filetime = Date.now().toString();
  const fileName = filetime + ".mp4";

  // 创建任务
  const taskData: VideoProcessingTaskData = {
    video_url: init.video_url,
    filetime,
    fileName,
    outputDir: `./temp/frames`,
    extractMode: init.extractMode || "random",
    outputFormat: init.outputFormat || "jpg"
  };

  const task = createTask("video-processing", taskData);

  // 异步处理任务
  processVideoTask(task.id, ctx).catch(error => {
    console.error(`处理任务 ${task.id} 失败:`, error);
    updateTaskStatus(task.id, TaskStatus.FAILED, null, error.message);
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

  const response: any = {
    task_id: task.id,
    status: task.status,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    result: task.result,
  };

  if (task.status === TaskStatus.FAILED) {
    response.error = task.error;
  }
  return ctx.json(response);
});

// 处理视频任务的异步函数
async function processVideoTask(taskId: string, ctx: Context): Promise<void> {
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
    performTreeAnalysis(framePaths, ctx, taskId);
    //三维重建    
    const obj_url = await treeReconstruction(data.video_url, ctx, taskId);

    canopyStructure(obj_url, ctx, taskId);
    light(obj_url, ctx, taskId);

    // 更新任务状态为完成
    // updateTaskStatus(taskId, TaskStatus.COMPLETED, {
    //   message: "视频处理完成",
    //   tree_analysis: treeAnalysisResults,
    // });
  } catch (error: any) {
    console.error(`处理任务 ${taskId} 失败:`, error);
    updateTaskStatus(taskId, TaskStatus.FAILED, null, error.message);
  }
}
const services_url = [{
  "name": "tree_potential",
  "service": "service:zru08qjthy1u8x6gflkc",//树势
  "endpoint": "predict"
}, {
  "name": "phenological_period",
  "service": "service:7dlqgjwrt10dnvffuyfk",//物候期
  "endpoint": "predict_whq"
},]
const getMaxPhenophase = (result: Array<{ info: Array<{ [key: string]: string; 置信度: string }> }>) => {
  const fieldName = result[0]?.info[0]?.['物候期'] ? '物候期' : '树势评估';

  return Object.entries(
    result.flatMap(item => item.info).reduce((acc, info) => ({
      ...acc,
      [info[fieldName]]: {
        count: (acc[info[fieldName]]?.count || 0) + 1,
        sum: (acc[info[fieldName]]?.sum || 0) + parseFloat(info['置信度'])
      }
    }), {} as Record<string, { count: number; sum: number }>)
  ).sort((a, b) =>
    b[1].count - a[1].count ||
    b[1].sum - a[1].sum
  )[0]?.[0];
}
// 树势分析函数 - 调用外部API
async function performTreeAnalysis(framePaths: string[], ctx: Context, taskId: string): Promise<any> {
  // 调用树势分析API的代码
  const combinedResults = {
    phenological_period: "",
    tree_potential: "",
    flower_quantity: ""
  };
  try {
    for (const service of services_url) {
      const apiUrl = `${new URL(ctx.req.url).origin}/services/${service.service}/fetch/${service.endpoint}`;
      const results: any = [];
      for (const framePath of framePaths) {
        const form = new FormData();
        form.append('file', fs.createReadStream(framePath), {
          filename: path.basename(framePath),
          contentType: 'image/jpeg'
        });
        form.append('user', 'user');
        await axios.post(apiUrl, form, {
          headers: {
            'x-api-key': ctx.req.raw.headers.get('x-api-key')
          }
        })
          .then(response => {
            results.push(response.data);
            console.log(response.data);
          })
          .catch(error => {
            console.error('请求错误:', error);
          });
      }
      if (service.name === "tree_potential" || service.name === "phenological_period") {
        combinedResults[service.name] = getMaxPhenophase(results);
      }
      // else{

      // }
    }
    updateTaskResult(taskId, {
      tree_analysis: combinedResults
    });
    return;
    // return combinedResults;
  } catch (error) {
    return null;
  }
}
async function treeReconstruction(videoUrl: string, ctx: Context, taskId: string): Promise<any> {
  try {
    // 调用三维重建API
    const apiUrl1 = `${new URL(ctx.req.url).origin}/services/service:j60xz6fozzgoup2h0e5p/fetch/three_dimensional_reconstruction`;
    const response = await axios.post(apiUrl1, {
      video_url: videoUrl
    }, {
      headers: {
        'x-api-key': ctx.req.raw.headers.get('x-api-key')
      }
    });
    const task_id = response.data.task_id;

    // 轮询检查状态
    const apiUrl2 = `${new URL(ctx.req.url).origin}/services/service:j60xz6fozzgoup2h0e5p/fetch/three_dimensional_reconstruction/${task_id}/status`;
    let result;
    let attempts = 0;
    const maxAttempts = 100; // 最大尝试次数
    const interval = 20000;

    while (attempts < maxAttempts) {
      result = await axios.get(apiUrl2, {
        headers: {
          'x-api-key': ctx.req.raw.headers.get('x-api-key')
        }
      });

      if (result.data.tree_obj_download_url) {
        return result.data.tree_obj_download_url;
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    if (attempts >= maxAttempts) {
      throw new Error('三维重建超时');
    }
  } catch (error) {
    console.error('三维重建失败:', error);
    throw error;
  }
}
async function light(obj_urls: string, ctx: Context, taskId: string): Promise<any> {
  const light_url = `${new URL(ctx.req.url).origin}/services/service:79l000pbaans608sqyf6/fetch/simulate_obj_light`;
  try {
    const result = axios.post(light_url, { model_url: obj_urls }, {
      headers: {
        'x-api-key': ctx.req.raw.headers.get('x-api-key')
      }
    })
    console.log(await result);

    updateTaskResult(taskId, {
      light: (await result).data
    });
  } catch (error) {
    console.error('光效分析失败:', error);
    throw error;
  }
}

// 冠层结构分析函数
async function canopyStructure(obj_url: any, ctx: Context, taskId: string): Promise<any> {

  try {
    // 调用冠层结构分析API
    const apiUrl1 = `${new URL(ctx.req.url).origin}/services/service:09yb6hgxv9wvoe77ly9n/fetch/process_model`;
    const response = await axios.post(apiUrl1, {
      obj_url
    }, {
      headers: {
        'x-api-key': ctx.req.raw.headers.get('x-api-key')
      }
    });
    const task_id = response.data.task_id;
    console.log(task_id);

    // 轮询检查状态
    const apiUrl2 = `${new URL(ctx.req.url).origin}/services/service:09yb6hgxv9wvoe77ly9n/fetch/task_status/${task_id}`;
    let result;
    let attempts = 0;
    const maxAttempts = 60; // 最大尝试次数
    const interval = 20000; // 20秒间隔

    while (attempts < maxAttempts) {
      result = await axios.get(apiUrl2, {
        headers: {
          'x-api-key': ctx.req.raw.headers.get('x-api-key')
        }
      });

      if (result.data.status === 'success') {
        updateTaskResult(taskId, {
          canopyStructure: result.data
        });
        updateTaskStatus(taskId, TaskStatus.COMPLETED);
        return;
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    if (attempts >= maxAttempts) {
      throw new Error('冠层结构分析超时');
    }
  } catch (error) {
    console.error('冠层结构分析失败:', error);
    throw error;
  }
}

export default app;