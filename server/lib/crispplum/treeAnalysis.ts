import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import FormData from "form-data";
import { updateTaskResult, updateTaskStatus } from "@lib/taskManager";
import type { ReqEnv } from "./constants";
import { SERVICES_URL, PHENOLOGICAL_PERIODS_FOR_LEAF_PLUM, PHENOLOGICAL_PERIODS_FOR_FLOWER } from "./constants";

function getMaxPhenophase(result: Array<any>): string {
  if (!Array.isArray(result) || result.length === 0) return "";

  const entries: Array<{ label: string; confidence: number }> = [];

  const pushEntry = (label: any, confRaw: any) => {
    if (!label) return;
    const conf =
      typeof confRaw === "number"
        ? confRaw
        : typeof confRaw === "string"
          ? parseFloat(confRaw)
          : 0;
    entries.push({ label, confidence: isNaN(conf) ? 0 : conf });
  };

  for (const item of result) {
    if (!item) continue;

    if (typeof item.phenophase === "string") {
      pushEntry(item.phenophase, item.phenophase_confidence ?? item.confidence ?? item["置信度"]);
      continue;
    }

    if (typeof item.tree_vigor === "string") {
      pushEntry(item.tree_vigor, item.tree_vigor_confidence ?? item.confidence ?? item["置信度"]);
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

  return (
    Object.entries(agg).sort(
      (a, b) => b[1].count - a[1].count || b[1].sum - a[1].sum
    )[0]?.[0] ?? ""
  );
}

export async function performTreeAnalysis(
  framePaths: string[],
  reqEnv: ReqEnv,
  taskId: string
): Promise<void | null> {
  const combinedResults = {
    phenological_period: "",
    tree_potential: "",
    leaf_plum_ratio: "",
    density_map_url: "",
  };

  try {
    for (const service of SERVICES_URL) {
      if (
        service.name === "leaf_plum_ratio" &&
        !PHENOLOGICAL_PERIODS_FOR_LEAF_PLUM.includes(combinedResults.phenological_period)
      ) {
        combinedResults.leaf_plum_ratio = null as any;
        continue;
      }
      if (
        service.name === "flower_analysis" &&
        !PHENOLOGICAL_PERIODS_FOR_FLOWER.includes(combinedResults.phenological_period)
      ) {
        combinedResults.density_map_url = null as any;
        continue;
      }

      const apiUrl = `${reqEnv.baseUrl}/services/${service.service}/fetch/${service.endpoint}`;
      const results: any[] = [];

      for (const framePath of framePaths) {
        const form = new FormData();
        if (service.name === "tree_potential" || service.name === "phenological_period") {
          form.append("file", fs.createReadStream(framePath), {
            filename: path.basename(framePath),
            contentType: "image/jpeg",
          });
        } else {
          form.append("picture", fs.createReadStream(framePath), {
            filename: path.basename(framePath),
            contentType: "image/jpeg",
          });
        }

        await axios
          .post(apiUrl, form, {
            headers: { "x-api-key": reqEnv.apiKey },
          })
          .then((response) => results.push(response.data))
          .catch((error) => {
            console.error("请求错误:", error);
          });
      }

      if (service.name === "tree_potential" || service.name === "phenological_period") {
        combinedResults[service.name] = getMaxPhenophase(results);
      }
      if (service.name === "leaf_plum_ratio") {
        const sum = results.reduce(
          (acc: number, curr: any) =>
            acc + (typeof curr?.leaf_plum_ratio === "number" ? curr.leaf_plum_ratio : 0),
          0
        );
        combinedResults.leaf_plum_ratio = (results.length > 0 ? sum / results.length : 0).toString();
      }
      if (service.name === "flower_analysis") {
        const first = results.find(
          (r: any) => typeof r?.density_map_url === "string" && r.density_map_url.length > 0
        );
        if (first) {
          (combinedResults as any).density_map_url = first.density_map_url;
        }
      }
    }

    updateTaskResult(taskId, { tree_analysis: combinedResults });
  } catch (error) {
    console.error("树势分析失败:", error);
    return null;
  }
}
