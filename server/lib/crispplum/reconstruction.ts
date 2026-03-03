import PQueue from "p-queue";
import axios from "axios";
import { pollUntil } from "@lib/pollUntil";
import { updateTaskStatus, updateTaskResult } from "@lib/taskManager";
import type { ReqEnv } from "./constants";

async function light(objUrls: any, reqEnv: ReqEnv, taskId: string): Promise<any> {
  const lightUrl = `${reqEnv.baseUrl}/services/service:79l000pbaans608sqyf6/fetch/simulate_obj_light`;
  updateTaskStatus(taskId, "光效分析中");
  try {
    const result = await axios.post(
      lightUrl,
      { model_url: objUrls },
      {
        headers: { "x-api-key": reqEnv.apiKey },
      }
    );
    updateTaskResult(taskId, { light: result.data });
  } catch (error: any) {
    console.error("光效分析失败:", error);
    updateTaskStatus(taskId, "任务失败");
    updateTaskResult(taskId, {
      error: "光效分析失败",
      details: error?.message ?? String(error),
    });
    return { error: "光效分析失败", details: error?.message ?? String(error) };
  }
}

async function canopyStructure(objUrl: any, reqEnv: ReqEnv, taskId: string): Promise<any> {
  updateTaskStatus(taskId, "冠层结构分析中");
  try {
    const apiUrl1 = `${reqEnv.baseUrl}/services/service:09yb6hgxv9wvoe77ly9n/fetch/process_model`;
    const response = await axios.post(
      apiUrl1,
      { obj_url: objUrl },
      {
        headers: { "x-api-key": reqEnv.apiKey },
      }
    );
    const task_id = response.data.task_id;

    const apiUrl2 = `${reqEnv.baseUrl}/services/service:09yb6hgxv9wvoe77ly9n/fetch/task_status/${task_id}`;

    const result = await pollUntil({
      fetch: () =>
        axios.get(apiUrl2, {
          headers: { "x-api-key": reqEnv.apiKey },
        }).then((r) => r.data),
      check: (data: any) => {
        if (data.status === "success") return "success";
        if (data.status === "failed" || data.progress === -1) return "failure";
        return "pending";
      },
      getFailureMessage: (data: any) =>
        `冠层结构分析失败: ${data.error || "未知错误"}`,
      onProgress: (data: any, attempt: number) => {
        console.log(`(${attempt})任务id:(${taskId})冠层结构分析轮询结果:`, JSON.stringify(data, null, 2));
        updateTaskStatus(taskId, `冠层结构分析中进度：${data.progress ?? 0}`);
      },
      maxAttempts: 100,
      intervalMs: 20000,
    });

    updateTaskResult(taskId, { canopyStructure: result });
    updateTaskStatus(taskId, "任务完成");
  } catch (error: any) {
    console.error("冠层结构分析失败:", error);
    updateTaskStatus(taskId, "任务失败");
    updateTaskResult(taskId, {
      error: "冠层结构分析失败",
      details: error?.message ?? String(error),
    });
    return { error: "冠层结构分析失败", details: error?.message ?? String(error) };
  }
}

export async function treeReconstruction(
  queue: PQueue,
  videoUrl: string,
  reqEnv: ReqEnv,
  taskId: string
): Promise<void> {
  return queue.add(async () => {
    updateTaskStatus(taskId, "三维重建中");
    try {
      const apiUrlSubmit = `${reqEnv.baseUrl}/services/service:j60xz6fozzgoup2h0e5p/fetch/three_dimensional_reconstruction`;
      const maxSubmitAttempts = 20;
      let submitResponse: any;
      let attempt = 0;

      while (attempt < maxSubmitAttempts) {
        try {
          submitResponse = await axios.post(
            apiUrlSubmit,
            { video_url: videoUrl },
            {
              headers: { "x-api-key": reqEnv.apiKey },
              timeout: 10 * 1000,
            }
          );
          break;
        } catch (submitError: any) {
          attempt++;
          console.warn(`提交三维重建任务失败，第 ${attempt} 次:`, submitError.message);
          if (attempt >= maxSubmitAttempts) {
            throw new Error("提交三维重建任务失败，超过最大重试次数");
          }
          await new Promise((res) => setTimeout(res, 3000 + Math.random() * 2000));
        }
      }

      if (!submitResponse?.data?.task_id) {
        throw new Error("三维重建任务提交失败，未获取到任务ID");
      }

      const externalTaskId = submitResponse.data.task_id;
      const apiUrlStatus = `${reqEnv.baseUrl}/services/service:j60xz6fozzgoup2h0e5p/fetch/three_dimensional_reconstruction/${externalTaskId}/status`;

      const statusData = await pollUntil({
        fetch: () =>
          axios.get(apiUrlStatus, {
            headers: { "x-api-key": reqEnv.apiKey },
            timeout: 30 * 1000,
          }).then((r) => r.data),
        check: (data: any) => {
          if (data.status === "completed") return "success";
          if (data.status === "failed" || data.status === "error") return "failure";
          return "pending";
        },
        getFailureMessage: (data: any) =>
          `三维重建服务返回失败: ${data.message || "未知错误"}`,
        onProgress: (data: any, attempt: number) => {
          console.log(`(${attempt})任务id:(${taskId})三维重建轮询结果:`, JSON.stringify(data, null, 2));
          if (typeof data.overall_progress === "number") {
            updateTaskStatus(taskId, `三维重建中进度：${data.overall_progress}%`);
          }
        },
        maxAttempts: 200,
        intervalMs: 30 * 1000,
        intervalJitterMs: 5000,
      });

      updateTaskResult(taskId, { treeReconstruction: statusData });
      updateTaskStatus(taskId, "三维重建完成");

      const objUrl = statusData.tree_Obj_download_url;
      await Promise.allSettled([
        canopyStructure(objUrl, reqEnv, taskId),
        light(objUrl, reqEnv, taskId),
      ]);
    } catch (error: any) {
      console.error("三维重建失败:", error?.message ?? error);
      updateTaskStatus(taskId, "任务失败");
      updateTaskResult(taskId, {
        error: "三维重建失败",
        details: error?.message ?? error?.toString?.(),
      });
      throw error;
    }
  }) as Promise<void>;
}
