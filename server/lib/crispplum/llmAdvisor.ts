import type { ChatCompletionMessageParam } from "openai/resources/index";
import env from "@lib/env";
import { openai } from "@lib/openai";
import { updateTaskStatus, updateTaskResult } from "@lib/taskManager";

export async function llmReturnResult(
  phenologicalPeriod: string,
  treePotential: string | null,
  leafPlumRatio: string | number | null,
  taskId: string
): Promise<void> {
  try {
    updateTaskStatus(taskId, "LLM 分析中");

    const indicators = [`1. 物候期：${phenologicalPeriod}`];
    if (treePotential) {
      indicators.push(`${indicators.length + 1}. 树势：${treePotential}`);
    }
    if (leafPlumRatio) {
      indicators.push(`${indicators.length + 1}. 叶果比：${leafPlumRatio}`);
    }

    const prompt = `你是一位资深果树栽培专家，专注于脆李（Prunus salicina 'Cuili'）的科学管理。请根据我提供的以下实时观测指标：
${indicators.join("\n")}

请完成以下分析与建议：

📌 树体健康综合评估

结合上述指标，判断当前树体营养分配是否合理，是否存在负载过重、营养失衡或生长衰弱风险；
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

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: prompt,
      },
    ];

    const retrievalTool = {
      type: "retrieval",
      retrieval: {
        knowledge_id: env.CRISPPLUM_KNOWLEDGE_ID,
      },
    } as any;

    const res = await openai.chat.completions.create({
      stream: false,
      model: "glm-4-air",
      messages,
      tools: [retrievalTool],
    });

    const content = res.choices[0]?.message?.content?.trim() || "";
    if (!content) {
      throw new Error("LLM returned empty content");
    }

    updateTaskResult(taskId, { advise: content });
  } catch (error: any) {
    console.error("LLM analysis with knowledge failed:", error);
    updateTaskStatus(taskId, "农事指导获取失败");
    updateTaskResult(taskId, {
      error: "农事指导获取失败",
      details: error?.message ?? error?.toString?.(),
    });
  }
}
