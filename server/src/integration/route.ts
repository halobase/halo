import { Context, Hono } from "hono";
import { download } from "@lib/download";
import frameExtraction from "@lib/frameExtraction";
import { createTask, getTask, updateTaskStatus, updateTaskResult, getTaskResultPaths, cleanupTask, VideoProcessingTaskData } from "@lib/taskManager";
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
    updateTaskStatus(task.id, "任务失败", null, error.message);
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

  if (task.status === "任务失败") {
    response.error = task.error;
  }
  return ctx.json(response);
});

// 处理视频任务的异步函数
async function processVideoTask(taskId: string, ctx: Context): Promise<void> {
  const task = getTask(taskId);
  if (!task) return;
  try {
    updateTaskStatus(taskId, "任务进行中");
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

    // 设置一小时后删除视频和帧图片
    setTimeout(() => {
      // 删除视频文件
      cleanupTask(taskId);

      // 删除帧图片
      try {
        if (framePaths && framePaths.length > 0) {
          framePaths.forEach(framePath => {
            if (fs.existsSync(framePath)) {
              fs.unlinkSync(framePath);
              console.log(`已删除帧图片: ${framePath}`);
            }
          });
        }
      } catch (err) {
        console.error('删除帧图片失败:', err);
      }
    }, 30 * 60 * 1000); // 1小时后执行

    // 树势分析 - 调用外部API
    await performTreeAnalysis(framePaths, ctx, taskId);
    // 获取任务结果，检查物候期
    const currentTask = getTask(taskId);
    if (!currentTask || !currentTask.result || !currentTask.result.tree_analysis) {
      throw new Error("无法获取树势分析结果");
    }
    const phenologicalPeriod = currentTask.result.tree_analysis.phenological_period;
    const validPeriods = ["休眠期", "萌动期", "露白期", "初花期", "盛花期", "谢花期"];

    // 如果物候期不是指定的几种，则不进行后续处理
    if (phenologicalPeriod && !validPeriods.includes(phenologicalPeriod)) {
      console.log(`检测到物候期为${phenologicalPeriod}，不进行后续处理`);
      // 将检测到的物候期信息更新到结果中
      updateTaskResult(taskId, {
        processing_status: `检测到物候期为${phenologicalPeriod}，不进行后续处理`,
      });
      updateTaskStatus(taskId, "任务完成");
      return;
    }

    //三维重建    
    const obj_url = await treeReconstruction(data.video_url, ctx, taskId);

    canopyStructure(obj_url, ctx, taskId);
    light(obj_url, ctx, taskId);

  } catch (error: any) {
    console.error(`处理任务 ${taskId} 失败:`, error);
    updateTaskStatus(taskId, "任务失败", null, error.message);
  }
}
const services_url = [
  {
    "name": "tree_potential",
    "service": "service:zru08qjthy1u8x6gflkc",//树势
    "endpoint": "predict"
  }, 
  {
    "name": "phenological_period",
    "service": "service:7dlqgjwrt10dnvffuyfk",//物候期
    "endpoint": "phenology/predict"
  },
  {
    "name": "flower_quantity",
    "service": "service:ec1wkxtabt9lpgx5gwkr",//花数量
    "endpoint": "flower_detection/v2"
  },
  {
    "name": "leaf_plum_ratio",
    "service": "service:5xnpuw2pkcnvqv5f9uu5",//果叶比
    "endpoint": "leaf_plum_ratio"
  }
]
const getMaxPhenophase = (result: Array<any>) => {
  if (!Array.isArray(result) || result.length === 0) return "";

  const entries: Array<{ label: string; confidence: number }> = [];

  for (const item of result) {
    if (item && Array.isArray(item.info)) {
      for (const info of item.info) {
        const label = (info?.predicted_class ?? info?.['物候期'] ?? info?.['树势评估']) as string | undefined;
        const confRaw = info?.confidence ?? info?.['置信度'];
        const conf = typeof confRaw === 'number' ? confRaw : (typeof confRaw === 'string' ? parseFloat(confRaw) : 0);
        if (label) entries.push({ label, confidence: isNaN(conf) ? 0 : conf });
      }
    } else {
      const label = (item?.predicted_class ?? item?.['物候期'] ?? item?.['树势评估']) as string | undefined;
      const confRaw = item?.confidence ?? item?.['置信度'];
      const conf = typeof confRaw === 'number' ? confRaw : (typeof confRaw === 'string' ? parseFloat(confRaw) : 0);
      if (label) entries.push({ label, confidence: isNaN(conf) ? 0 : conf });
    }
  }

  if (entries.length === 0) return "";

  const agg: Record<string, { count: number; sum: number }> = {};
  for (const e of entries) {
    if (!agg[e.label]) agg[e.label] = { count: 0, sum: 0 };
    agg[e.label].count += 1;
    agg[e.label].sum += e.confidence;
  }

  return Object.entries(agg)
    .sort((a, b) => b[1].count - a[1].count || b[1].sum - a[1].sum)[0]?.[0] ?? "";
}
// 树势分析函数 - 调用外部API
async function performTreeAnalysis(framePaths: string[], ctx: Context, taskId: string): Promise<any> {
  // 调用树势分析API的代码
  const combinedResults = {
    phenological_period: "",
    tree_potential: "",
    leaf_plum_ratio: 0,
  };
  try {
    for (const service of services_url) {
      const apiUrl = `${new URL(ctx.req.url).origin}/services/${service.service}/fetch/${service.endpoint}`;
      const results: any = [];
      for (const framePath of framePaths) {
        const form = new FormData();
        if (service.name === "tree_potential" || service.name === "phenological_period") {
          form.append('file', fs.createReadStream(framePath), {
            filename: path.basename(framePath),
            contentType: 'image/jpeg'
          });
          form.append('user', 'user');
        }
        else {
          form.append('picture', fs.createReadStream(framePath), {
            filename: path.basename(framePath),
            contentType: 'image/jpeg'
          });
        }
        await axios.post(apiUrl, form, {
          headers: {
            'x-api-key': ctx.req.raw.headers.get('x-api-key')
          }
        })
          .then(response => {
            results.push(response.data);
          })
          .catch(error => {
            console.error('请求错误:', error);
          });
      }
      if (service.name === "tree_potential" || service.name === "phenological_period") {
        combinedResults[service.name] = getMaxPhenophase(results);
      }
      if (service.name === "leaf_plum_ratio") {

        // 计算果叶比的平均值
        const sum = results.reduce((acc: any, curr: any) => acc + (curr.ratio || 0), 0);
        // 避免除以0的情况
        combinedResults.leaf_plum_ratio = results.length > 0 ? sum / results.length : 0;
      }
      if (service.name === "flower_quantity") {
        // 计算并添加花叶比和果叶比
        const phenologicalPeriod = combinedResults.phenological_period;
        const ratios = calculateFlowerLeafRatios(results, phenologicalPeriod);
        Object.assign(combinedResults, ratios);
      }
    }
    updateTaskResult(taskId, {
      tree_analysis: combinedResults
    });
    return;
  } catch (error) {
    return null;
  }
}
async function treeReconstruction(videoUrl: string, ctx: Context, taskId: string): Promise<any> {
  updateTaskStatus(taskId, '三维重建中进度：0%');
  try {
    // 调用三维重建API
    updateTaskStatus(taskId, '三维重建中进度：0%');
    const apiUrl1 = `${new URL(ctx.req.url).origin}/services/service:j60xz6fozzgoup2h0e5p/fetch/three_dimensional_reconstruction`;
    const response = await axios.post(apiUrl1, {
      video_url: videoUrl
    }, {
      headers: {
        'x-api-key': ctx.req.raw.headers.get('x-api-key')
      }
    });
    const task_id = response.data.task_id;
    console.log("三维重建:", task_id);
    // 轮询检查状态
    const apiUrl2 = `${new URL(ctx.req.url).origin}/services/service:j60xz6fozzgoup2h0e5p/fetch/three_dimensional_reconstruction/${task_id}/status`;
    let result;
    let attempts = 0;
    const maxAttempts = 100; // 最大尝试次数
    const interval = 30000;

    while (attempts < maxAttempts) {
      result = await axios.get(apiUrl2, {
        headers: {
          'x-api-key': ctx.req.raw.headers.get('x-api-key')
        }
      });
      console.log(result.data);
      if (result.data.status === 'complete_tree_completed') {
        updateTaskResult(taskId, {
          treeReconstruction: result.data
        });
        return result.data.tree_Obj_download_url;
      }
      updateTaskStatus(taskId, `三维重建中进度：${result.data.overall_progress}%`);
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

    updateTaskResult(taskId, {
      light: (await result).data
    });
    updateTaskStatus(taskId, "光效分析完成");
  } catch (error: any) {
    console.error('光效分析失败:', error);
    updateTaskStatus(taskId, "光效分析失败");
    updateTaskResult(taskId, {
      error: "光效分析失败",
      details: error.message
    });
    return { error: "光效分析失败", details: error.message };
  }
}

// 冠层结构分析函数
async function canopyStructure(obj_url: any, ctx: Context, taskId: string): Promise<any> {
  updateTaskStatus(taskId, '冠层结构分析中进度：0%');
  try {
    // 调用冠层结构分析API
    const apiUrl1 = `${new URL(ctx.req.url).origin}/services/service:09yb6hgxv9wvoe77ly9n/fetch/process_model`;
    // const apiUrl1 = `https://api.platform.archivemodel.cn/services/service:09yb6hgxv9wvoe77ly9n/fetch/process_model`;
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
    // const apiUrl2 = `https://api.platform.archivemodel.cn/services/service:09yb6hgxv9wvoe77ly9n/fetch/task_status/${task_id}`;
    let result;
    let attempts = 0;
    const maxAttempts = 100;
    const interval = 20000;

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
        updateTaskStatus(taskId, "任务完成");
        return;
      }
      updateTaskStatus(taskId, `冠层结构分析中进度：${result.data.progress}`);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    if (attempts >= maxAttempts) {
      throw new Error('冠层结构分析超时');
    }
  } catch (error: any) {
    console.error('冠层结构分析失败:', error);
    updateTaskStatus(taskId, "冠层结构分析失败");
    updateTaskResult(taskId, {
      error: "冠层结构分析失败",
      details: error.message
    });
    // 返回错误信息而不是抛出异常
    return { error: "冠层结构分析失败", details: error.message };
  }
}

export default app;


// 计算花叶比和果叶比的函数
function calculateFlowerLeafRatios(results: any[], phenologicalPeriod: string) {
  // 计算总计平均的花叶比和果叶比
  let totalFlower = 0;
  let totalLeaf = 0;
  let totalPlum = 0;

  // 累加所有结果中的花、叶、果数量
  for (const result of results) {
    totalFlower += result.flower || 0;
    totalLeaf += result.leaf || 0;
    totalPlum += result.plum || 0;
  }
  const flowerPeriods = ["露白期", "初花期", "盛花期", "谢花期"];
  const leafPeriods = ["幼果期", "硬核期", "膨大期", "采收期", "采后期"];
  const plumPeriods = ["膨大期", "采收期"];

  // 只在特定物候期返回相应的值
  const ratios: { flower?: number, leaf?: number, plum?: number } = {};

  if (flowerPeriods.includes(phenologicalPeriod)) {
    ratios.flower = totalFlower;
  }

  if (leafPeriods.includes(phenologicalPeriod)) {
    ratios.leaf = totalLeaf;
  }

  if (plumPeriods.includes(phenologicalPeriod)) {
    ratios.plum = totalPlum;
  }

  return ratios;
}