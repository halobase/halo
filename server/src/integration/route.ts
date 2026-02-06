import { Hono } from "hono";
import { download } from "@lib/download";
import frameExtraction from "@lib/frameExtraction";
import { createTask, getTask, updateTaskStatus, updateTaskResult, getTaskResultPaths, cleanupTask, VideoProcessingTaskData } from "@lib/taskManager";
import * as fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import * as path from 'path';
import env from "@lib/env";
import { openai } from "@lib/openai";
const app = new Hono();
import { ChatCompletionMessageParam} from "openai/resources/index";
// 新增: 引入 p-queue 并初始化全局队列
import PQueue from "p-queue";
const totalTaskQueue = new PQueue({ concurrency: 10 });
const reconstructionQueue = new PQueue({ concurrency: 5 });

type ReqEnv = { baseUrl: string; apiKey: string | null };
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
    "name": "flower_analysis",
    "service": "service:ec1wkxtabt9lpgx5gwkr",//花数量
    "endpoint": "flower_analysis"
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
async function performTreeAnalysis(framePaths: string[], reqEnv: ReqEnv, taskId: string): Promise<any> {
  // 调用树势分析API的代码
  const combinedResults = {
    phenological_period: "",
    tree_potential: "",
    leaf_plum_ratio: 0,
    density_map_url: ""
  };
  try {
    for (const service of services_url) {
      const apiUrl = `${reqEnv.baseUrl}/services/${service.service}/fetch/${service.endpoint}`;
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
            'x-api-key': reqEnv.apiKey
          }
        })
          .then(response => {
            results.push(response.data);
          })
          .catch(error => {
            console.error('请求错误:', error);
          });
      }
      console.log(results);
      
      if (service.name === "tree_potential" || service.name === "phenological_period") {
        combinedResults[service.name] = getMaxPhenophase(results);
      }
      if (service.name === "leaf_plum_ratio") {
        const sum = results.reduce((acc: number, curr: any) => acc + (typeof curr?.leaf_plum_ratio === "number" ? curr.leaf_plum_ratio : 0), 0);
        combinedResults.leaf_plum_ratio = results.length > 0 ? sum / results.length : 0;
      }
      if (service.name === "flower_analysis") {
        const first = results.find((r: any) => typeof r?.density_map_url === "string" && r.density_map_url.length > 0);
        if (first) {
          (combinedResults as any).density_map_url = first.density_map_url;
        }
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

// 创建视频处理任务
app.post("/crispplum", async (ctx) => {
  const baseUrl = new URL(ctx.req.url).origin;
  const apiKey = ctx.req.raw.headers.get("x-api-key");
  const reqEnv: ReqEnv = { baseUrl, apiKey };
  const init = await ctx.req.json();
  const filetime = Date.now().toString();
  const fileName = filetime + ".mp4";
  console.log("视频链接："+init.video_url);
  
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

  // 并发受控: 将任务加入总任务队列
  totalTaskQueue.add(() => processVideoTask(task.id, reqEnv)).catch(error => {
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
async function processVideoTask(taskId: string, reqEnv: ReqEnv): Promise<void> {
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
    setTimeout(async () => {
      // 删除视频文件
      cleanupTask(taskId);
      // 删除帧图片（异步，减少阻塞）
      try {
        if (framePaths && framePaths.length > 0) {
          for (const framePath of framePaths) {
            if (fs.existsSync(framePath)) {
              await fs.promises.unlink(framePath);
              console.log(`已删除帧图片: ${framePath}`);
            }
          }
        }
      } catch (err) {
        console.error('删除帧图片失败:', err);
      }
    }, 60 * 60 * 1000);

    // 树势分析 - 调用外部API
    await performTreeAnalysis(framePaths, reqEnv, taskId);
    // 获取任务结果，检查物候期
    const currentTask = getTask(taskId);
    if (!currentTask || !currentTask.result || !currentTask.result.tree_analysis) {
      throw new Error("无法获取树势分析结果");
    }
    console.log("树势检测完成");
    // 异步触发 LLM 建议生成，避免阻塞主流程
    await llmReturnResult(currentTask.result.tree_analysis.phenological_period, currentTask.result.tree_analysis.tree_potential, currentTask.result.tree_analysis.leaf_plum_ratio, taskId);
    const updatedTask = getTask(taskId);
    const phenologicalPeriod = updatedTask?.result.tree_analysis.phenological_period;
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
    try {
      await treeReconstruction(data.video_url, reqEnv, taskId);
    } catch(err) {
      console.error("三维重建失败:", err);
    }
  } catch (error: any) {
    console.error(`处理任务 ${taskId} 失败:`, error);
    updateTaskStatus(taskId, "任务失败", null, error.message);
  }
}
async function treeReconstruction(videoUrl: string, reqEnv: ReqEnv, taskId: string){
  return reconstructionQueue.add(async () => {
    updateTaskStatus(taskId, '三维重建中进度：0%');

    try {
      // 初次提交三维重建任务
      const apiUrlSubmit = `${reqEnv.baseUrl}/services/service:j60xz6fozzgoup2h0e5p/fetch/three_dimensional_reconstruction`;

      const maxSubmitAttempts = 20; // 最大提交重试次数
      let submitResponse;
      let attempt = 0;

      while (attempt < maxSubmitAttempts) {
        try {
          submitResponse = await axios.post(apiUrlSubmit, { video_url: videoUrl }, {
            headers: { 'x-api-key': reqEnv.apiKey },
            timeout: 10 * 1000 // 提交请求超时 30 秒
          });
          break; // 成功拿到响应就跳出重试循环
        } catch (submitError: any) {
          attempt++;
          console.warn(`提交三维重建任务失败，第 ${attempt} 次:`, submitError.message);
          if (attempt >= maxSubmitAttempts) throw new Error('提交三维重建任务失败，超过最大重试次数');
          // 等待一小段时间再重试
          await new Promise(res => setTimeout(res, 3000 + Math.random() * 2000));
        }
      }

      const externalTaskId = submitResponse?.data.task_id;
      console.log("三维重建任务提交成功:", externalTaskId);

      // 轮询检查三维重建状态
      const apiUrlStatus = `${reqEnv.baseUrl}/services/service:j60xz6fozzgoup2h0e5p/fetch/three_dimensional_reconstruction/${externalTaskId}/status`;

      let attempts = 0;
      const maxAttempts = 200; // 最大尝试次数提高
      const interval = 30 * 1000; // 轮询间隔 30 秒

      while (attempts < maxAttempts) {
        try {
          const statusResponse = await axios.get(apiUrlStatus, {
            headers: {
              'x-api-key': reqEnv.apiKey
            },
            timeout: 30 * 1000 // 每次轮询请求超时 30 秒
          });

          const statusData = statusResponse.data;
          console.log(`轮询状态(${attempts + 1}):`, statusData);

          if (statusData.status === 'completed') {
            updateTaskResult(taskId, { treeReconstruction: statusData });
            updateTaskStatus(taskId, "三维重建完成");
            const objUrl = statusData.tree_Obj_download_url;
            await Promise.allSettled([
              canopyStructure(objUrl, reqEnv, taskId),
              light(objUrl, reqEnv, taskId)
            ]);
            return;
          }

          if (statusData.status === 'failed' || statusData.status === 'error') {
            throw new Error(`三维重建服务返回失败: ${statusData.message || '未知错误'}`);
          }

          // 更新任务状态进度
          if (typeof statusData.overall_progress === 'number') {
            updateTaskStatus(taskId, `三维重建中进度：${statusData.overall_progress}%`);
          }

        } catch (pollError: any) {
          console.warn(`轮询请求出错，尝试第 ${attempts + 1} 次:`, pollError.message);
          // 可选择继续重试，避免任务卡住
        }

        attempts++;
        // 随机化间隔，减少多个任务同时轮询导致压力
        await new Promise(resolve => setTimeout(resolve, interval + Math.random() * 5000));
      }

      throw new Error('三维重建超时，超过最大轮询次数');

    } catch (error: any) {
      console.error('三维重建失败:', error.message || error);
      updateTaskStatus(taskId, "三维重建失败");
      updateTaskResult(taskId, {
        error: "三维重建失败",
        details: error.message || error.toString()
      });
      throw error; // 让上层知道任务失败
    }
  });
}
async function light(obj_urls: any, reqEnv: ReqEnv, taskId: string): Promise<any> {
  const light_url = `${reqEnv.baseUrl}/services/service:79l000pbaans608sqyf6/fetch/simulate_obj_light`;
  try {
    const result = axios.post(light_url, { model_url: obj_urls }, {
      headers: {
        'x-api-key': reqEnv.apiKey
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
async function canopyStructure(obj_url: any, reqEnv: ReqEnv, taskId: string): Promise<any> {
  updateTaskStatus(taskId, '冠层结构分析中进度：0%');
  try {
    // 调用冠层结构分析API
    const apiUrl1 = `${reqEnv.baseUrl}/services/service:09yb6hgxv9wvoe77ly9n/fetch/process_model`;
    // const apiUrl1 = `https://api.platform.archivemodel.cn/services/service:09yb6hgxv9wvoe77ly9n/fetch/process_model`;
    const response = await axios.post(apiUrl1, {
      obj_url
    }, {
      headers: {
        'x-api-key': reqEnv.apiKey
      }
    });
    const task_id = response.data.task_id;
    console.log(task_id);

    // 轮询检查状态
    const apiUrl2 = `${reqEnv.baseUrl}/services/service:09yb6hgxv9wvoe77ly9n/fetch/task_status/${task_id}`;
    // const apiUrl2 = `https://api.platform.archivemodel.cn/services/service:09yb6hgxv9wvoe77ly9n/fetch/task_status/${task_id}`;
    let result;
    let attempts = 0;
    const maxAttempts = 100;
    const interval = 20000;

    while (attempts < maxAttempts) {
      result = await axios.get(apiUrl2, {
        headers: {
          'x-api-key': reqEnv.apiKey
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

async function llmReturnResult(
  phenologicalPeriod: string,
  treePotential: string,
  LeafPlumRatio: number,
  taskId: string
) {
  try {
    updateTaskStatus(taskId, "LLM 分析中");

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
建议补充监测的指标（如：土壤墒情、新梢封顶率、果实横径日增量等）。`;

    // 构造 messages（无 system role，直接 user）
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: prompt
      }
    ];
    const retrievalTool = {
      type: "retrieval",
      retrieval: {
        knowledge_id: env.CRISPPLUM_KNOWLEDGE_ID
      }
    } as any; // @ts-ignore 兼容你的结构

    // 调用 LLM（非流式，不传 tools）
    const res = await openai.chat.completions.create({
      stream: false,
      model: "glm-4-air",
      messages,
      tools:[retrievalTool]
    });
    const content = res.choices[0]?.message?.content?.trim() || "";
    if (!content) {
      throw new Error("LLM returned empty content");
    }
    updateTaskResult(taskId, {
      advise: content
    });
    updateTaskStatus(taskId, "农事指导获取已完成");
    return;
  } catch (error) {
    console.error("LLM analysis with knowledge failed:", error);
    updateTaskStatus(taskId, "农事指导获取失败");
  }
}

export default app;