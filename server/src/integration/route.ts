import { Context, Hono } from "hono";
import { download } from "@lib/download";
import frameExtraction from "@lib/frameExtraction";
import { createTask, getTask, updateTaskStatus, updateTaskResult, getTaskResultPaths, cleanupTask, VideoProcessingTaskData } from "@lib/taskManager";
import * as fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import * as path from 'path';
import env from "@lib/env";

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

    await llmReturnResult(currentTask.result.tree_analysis.phenological_period, currentTask.result.tree_analysis.tree_potential, currentTask.result.tree_analysis.leaf_plum_ratio, taskId, ctx);


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
    "endpoint": "predict/treevigor"
  },
  {
    "name": "phenological_period",
    "service": "service:7dlqgjwrt10dnvffuyfk",//物候期
    "endpoint": "predict/phenology"
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

  const pushEntry = (label: any, confRaw: any) => {
    if (!label) return;
    const conf = typeof confRaw === 'number' ? confRaw : (typeof confRaw === 'string' ? parseFloat(confRaw) : 0);
    entries.push({ label, confidence: isNaN(conf) ? 0 : conf });
  };

  for (const item of result) {
    if (!item) continue;

    // 新接口：直接返回 { phenophase, phenophase_confidence }
    if (typeof item.phenophase === "string") {
      pushEntry(item.phenophase, item.phenophase_confidence ?? item.confidence ?? item['置信度']);
      continue;
    }

    // 树势接口：{ tree_vigor, tree_vigor_confidence }
    if (typeof item.tree_vigor === "string") {
      pushEntry(item.tree_vigor, item.tree_vigor_confidence ?? item.confidence ?? item['置信度']);
      continue;
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

async function llmReturnResult(phenologicalPeriod: string, treePotential: string, LeafPlumRatio: number, taskId: string, ctx: Context) {

  try {
    const apiUrl = `${new URL(ctx.req.url).origin}/assistants/query`;
    const prompt = `你是一位资深果树栽培专家，专注于脆李（Prunus salicina ‘Cuili’）的科学管理。请根据我提供的以下三项实时观测指标：
1. 物候期：${phenologicalPeriod}
2. 树势：${treePotential}
3. 叶果比：${LeafPlumRatio}

请完成以下分析与建议：

📌 树体健康综合评估

结合三项指标，判断当前树体营养分配是否合理，是否存在负载过重、营养失衡或生长衰弱风险；
指出主要限制因子（如：叶果比偏低→光合供应不足；树势弱+花量大→易早衰等）。
📌 分项农事指导建议（按优先级排序）

疏花疏果：
是否需要疏除？建议疏除时期、方法（疏花穗/疏幼果）、目标留果量或目标叶果比；
均衡施肥：
当前阶段推荐肥料类型（N-P-K配比）、施肥量（kg/株或亩）、施用方式（基肥/追肥/叶面喷施）；
特别关注：是否需补钙防裂果、补钾促膨大、控氮防徒长等；
修枝整形：
是否需夏剪/冬剪？重点操作（如：疏除直立旺枝、回缩衰弱枝、拉枝开角等）；
针对树势调整修剪强度（强树轻剪、弱树重剪促更新）；
病虫害防治与防控：
当前物候期高发病虫害（如：李实蜂、蚜虫、褐腐病、细菌性穿孔病等）；
推荐绿色防控措施（物理/生物/低毒药剂），注明关键防治窗口期；
针对树势弱的植株，提出增强抗性的辅助建议（如：喷施海藻素、氨基寡糖素等）。
📌 风险预警与后续监测建议

未来15–30天需重点关注的潜在问题（如：高温落果、水分胁迫、二次花芽分化异常等）；
建议补充监测的指标（如：土壤墒情、新梢封顶率、果实横径日增量等）。`
    // 流式获取大模型响应，避免一次性读入
    const response = await axios.post(apiUrl, {
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
      services: [],
      knowledge: env.CRISPPLUM_KNOWLEDGE_ID,
      llm: { model: "glm-4-air", system_prompt: "回答中不要出现”根据文档“这些字。", temperature: 0.95, top_p: 0.7 },
      options: { retrieval: true }
    }, {
      headers: {
        'x-api-key': ctx.req.raw.headers.get('x-api-key')
      },
      responseType: 'stream'
    });

    // 解析流式 SSE（形如 "event: message" + "data: {...}"）
    let buffer = "";
    const assembled: { content: string[] } = { content: [] };

    await new Promise<void>((resolve, reject) => {
      response.data.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        let idx: number;
        // 按换行分割，逐行解析
        while ((idx = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line) continue;
          // 只处理 data: 开头的行，忽略 event: 等
          if (!line.startsWith("data:")) continue;
          const jsonPart = line.slice("data:".length).trim();
          if (!jsonPart) continue;
          try {
            const msg = JSON.parse(jsonPart);
            // if (msg?.role) assembled.role = msg.role;
            if (Array.isArray(msg?.content)) {
              for (const c of msg.content) {
                if (typeof c === "string") assembled.content.push(c);
              }
            } else if (typeof msg?.content === "string") {
              assembled.content.push(msg.content);
            }
          } catch (e) {
            // 丢弃无法解析的行，防止阻塞
            console.error("LLM流解析失败行:", line, e);
          }
        }
      });
      response.data.on('end', () => resolve());
      response.data.on('error', reject);
    });

    // 将流式片段拼接成完整字符串
    const advisePayload = assembled.content.join("");

    updateTaskResult(taskId, {
      advise: advisePayload
    });

    console.log("LLM返回结果:", advisePayload);
    return;
  } catch (error: any) {
    console.error('LLM结果获取失败:', error);
    return null;
  }
}