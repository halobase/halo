import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// 任务过期时间配置（毫秒）
const TASK_EXPIRATION_TIME = 60 * 60 * 1000 * 2; // 2小时

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// 任务类型
export interface Task {
  id: string;
  type: string;
  status: TaskStatus;
  data: any;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 视频处理任务数据
export interface VideoProcessingTaskData {
  video_url: string;
  filetime: string;
  fileName: string;
  outputDir: string;
  extractMode: string;
  outputFormat: string;
}

// 内存中存储任务的映射表
const tasks: Map<string, Task> = new Map();

// 检查任务是否过期
function isTaskExpired(task: Task): boolean {
  const now = new Date();
  const taskAge = now.getTime() - task.createdAt.getTime();
  return taskAge > TASK_EXPIRATION_TIME;
}

// 清理所有过期任务
export function cleanupExpiredTasks(): void {
  console.log('开始清理过期任务...');
  const expiredTaskIds: string[] = [];

  // 找出所有过期的任务
  tasks.forEach((task, taskId) => {
    if (isTaskExpired(task)) {
      expiredTaskIds.push(taskId);
    }
  });

  // 清理过期任务
  expiredTaskIds.forEach(taskId => {
    // 先清理任务相关资源
    cleanupTask(taskId);
    // 从映射表中删除任务
    tasks.delete(taskId);
    console.log(`已删除过期任务: ${taskId}`);
  });

  console.log(`清理完成，共删除 ${expiredTaskIds.length} 个过期任务`);
}

// 启动定期清理任务
const cleanupInterval = setInterval(cleanupExpiredTasks, 15 * 60 * 1000); // 每15分钟清理一次

// 获取临时目录路径
function getTempDir(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const parentDir = path.resolve(__dirname, '..');
  return path.resolve(parentDir, 'temp');
}

// 创建新任务
export function createTask(type: string, data: any): Task {
  const taskId = uuidv4();
  const now = new Date();

  const task: Task = {
    id: taskId,
    type,
    status: TaskStatus.PENDING,
    data,
    createdAt: now,
    updatedAt: now,
    result: null
  };

  tasks.set(taskId, task);
  return task;
}

// 获取任务
export function getTask(taskId: string): Task | undefined {
  return tasks.get(taskId);
}

// 更新任务状态
export function updateTaskStatus(taskId: string, status: TaskStatus, result?: any, error?: string): Task | undefined {
  const task = tasks.get(taskId);
  if (!task) return undefined;

  task.status = status;
  task.updatedAt = new Date();

  if (result !== undefined) {
    task.result = result;
  }

  if (error !== undefined) {
    task.error = error;
  }

  return task;
}

// 获取任务结果路径
export function getTaskResultPaths(task: Task): string[] {
  // if (task.type !== 'video-processing' || task.status !== TaskStatus.COMPLETED) {
  //   return [];
  // }
  const data = task.data as VideoProcessingTaskData;
  const tempDir = getTempDir();
  const framesDir = path.join(tempDir, 'frames');

  try {
    // 读取生成的帧文件
    const frameFiles = fs.readdirSync(framesDir)
      .filter(file => file.startsWith(data.filetime))
      .map(file => path.join(framesDir, file));

    return frameFiles;
  } catch (error) {
    console.error('Error reading frame files:', error);
    return [];
  }
}

// 清理任务资源
export function cleanupTask(taskId: string): void {
  const task = tasks.get(taskId);
  if (!task || task.type !== 'video-processing') return;

  const data = task.data as VideoProcessingTaskData;
  const tempDir = getTempDir();
  const videoPath = path.join(tempDir, data.fileName);

  // 删除下载的视频文件
  try {
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
      console.log(`Cleaned up video file: ${videoPath}`);
    }
  } catch (error) {
    console.error(`Failed to delete video file: ${videoPath}`, error);
  }
}

// 获取所有任务
export function getAllTasks(): Task[] {
  return Array.from(tasks.values());
}

// 手动触发清理过期任务
export function triggerCleanupExpiredTasks(): void {
  cleanupExpiredTasks();
}

// 停止定时清理（在应用关闭时调用）
export function stopCleanupInterval(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    console.log('已停止任务过期清理定时器');
  }
}

// 添加任务结果数据（不改变任务状态，合并新字段到现有结果）
export function updateTaskResult(taskId: string, result: any): Task | undefined {
  const task = tasks.get(taskId);
  if (!task) return undefined;

  // 如果已有结果且为对象，则合并新字段，否则直接赋值
  if (task.result && typeof task.result === 'object' && !Array.isArray(task.result)) {
    task.result = { ...task.result, ...result };
  } else {
    task.result = result;
  }

  task.updatedAt = new Date();

  return task;
}