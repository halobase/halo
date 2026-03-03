/** 轮询结果：成功 / 失败 / 继续等待 */
export type PollOutcome = "success" | "failure" | "pending";

export interface PollUntilOptions<T> {
  /** 拉取当前状态的函数 */
  fetch: () => Promise<T>;
  /** 根据本次结果判断是否结束：success 返回数据，failure 抛错，pending 继续轮询 */
  check: (data: T) => PollOutcome | Promise<PollOutcome>;
  /** 失败时错误信息，仅当 check 返回 "failure" 时使用 */
  getFailureMessage?: (data: T) => string;
  /** 每次拿到数据后调用（可用于更新进度），attempt 为当前轮询次数（从 1 开始） */
  onProgress?: (data: T, attempt: number) => void;
  /** 最大轮询次数 */
  maxAttempts: number;
  /** 轮询间隔（毫秒） */
  intervalMs: number;
  /** 间隔随机加数（毫秒），用于错峰，默认 0 */
  intervalJitterMs?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomJitter(maxMs: number): number {
  return maxMs <= 0 ? 0 : Math.random() * maxMs;
}

/**
 * 通用轮询：反复调用 fetch，根据 check 结果返回、抛错或继续等待。
 * 超时或 check 返回 failure 时抛出错误。
 */
export async function pollUntil<T>(options: PollUntilOptions<T>): Promise<T> {
  const {
    fetch,
    check,
    getFailureMessage,
    onProgress,
    maxAttempts,
    intervalMs,
    intervalJitterMs = 0,
  } = options;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let data: T;
    try {
      data = await fetch();
    } catch (err: any) {
      console.warn(`轮询请求出错，第 ${attempt + 1}/${maxAttempts} 次:`, err?.message ?? err);
      await sleep(intervalMs + randomJitter(intervalJitterMs));
      continue;
    }

    onProgress?.(data, attempt + 1);
    const outcome = await check(data);

    if (outcome === "success") return data;
    if (outcome === "failure") {
      const msg = getFailureMessage?.(data) ?? (data as any)?.message ?? "任务失败";
      throw new Error(msg);
    }

    await sleep(intervalMs + randomJitter(intervalJitterMs));
  }

  throw new Error(`轮询超时，已尝试 ${maxAttempts} 次`);
}
