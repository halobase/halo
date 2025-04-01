import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import ffprobeStatic from 'ffprobe-static';

// FFmpeg 路径配置
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// 验证并设置 FFmpeg
if (ffmpegPath && fs.existsSync(ffmpegPath)) {
  ffmpeg.setFfmpegPath(ffmpegPath);
} else {
  console.error(`❌ FFmpeg not found: ${ffmpegPath}`);
  process.exit(1);
}

// 设置 FFprobe 路径
if (ffprobeStatic.path && fs.existsSync(ffprobeStatic.path)) {
  ffmpeg.setFfprobePath(ffprobeStatic.path);
} else {
  console.error(`❌ FFprobe not found: ${ffprobeStatic.path}`);
  process.exit(1);
}

interface ExtractFramesOptions {
  filetime:string;
  inputPath: string;
  outputDir: string;
  frameRate?: number;       // 均匀提取时的帧率
  frameCount?: number;      // 随机提取时的帧数
  extractMode?: 'random' | 'uniform';
  outputFormat?: string;
}

export async function extractFrames(options: ExtractFramesOptions): Promise<void> {
  const {
    filetime,
    inputPath,
    outputDir,
    frameRate = 24,
    frameCount = 5,
    extractMode = 'random',
    outputFormat = 'png'
  } = options;

  // 输入验证
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }
  
  // 创建输出目录（如果不存在）
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 验证目录可写性
  try {
    fs.accessSync(outputDir, fs.constants.W_OK);
  } catch (err) {
    throw new Error(`Cannot write to output directory: ${outputDir}`);
  }

  // 获取视频元数据
  const metadata = await new Promise<any>((resolve, reject) => {
    ffmpeg(inputPath).ffprobe((err, data) => {
      err ? reject(err) : resolve(data);
    });
  });

  const duration = parseFloat(metadata.format.duration);

  if (extractMode === 'random') {
    // 使用全局随机生成时间点
    const timePoints = generateUniformRandomTimepoints(duration, frameCount);
    // 对每个时间点单独调用 ffmpeg 提取一帧
    const promises = timePoints.map((time, idx) => {
      return new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .seekInput(time)
          .frames(1)
          .output(path.join(outputDir, `${filetime}-${String(idx + 1).padStart(1, '0')}.${outputFormat}`))
          .outputOptions(['-qscale:v 2', '-loglevel error'])
          .on('start', (cmd) => console.log(`🚀 Starting extraction at ${time.toFixed(3)}s: ${cmd}`))
          .on('end', () => {
            resolve();
          })
          .on('error', (err) => {
            console.error(`❌ Error at ${time.toFixed(3)}s: ${err.message}`);
            reject(err);
          })
          .run();
      });
    });
    await Promise.all(promises);
  } else {
    // 均匀提取模式：利用 fps 滤镜
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .output(path.join(outputDir, `frame-%04d.${outputFormat}`))
        .outputOptions([`-vf fps=${frameRate}`, '-qscale:v 2', '-loglevel error'])
        .on('start', (cmd) => console.log(`🚀 Starting uniform extraction: ${cmd}`))
        .on('end', () => {
          resolve();
        })
        .on('error', (err) => {
          console.error(`❌ Error: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }
}

// 全局随机生成时间点的函数
function generateUniformRandomTimepoints(duration: number, count: number): number[] {
  const SAFETY_MARGIN = 0.5; // 首尾保护时间
  const effectiveDuration = duration - 2 * SAFETY_MARGIN;
  const points: number[] = [];
  for (let i = 0; i < count; i++) {
    const point = Number((SAFETY_MARGIN + Math.random() * effectiveDuration).toFixed(3));
    points.push(point);
  }
  // 排序后确保时间点从小到大
  return points.sort((a, b) => a - b);
}

export default extractFrames;
// extractFrames({
//   inputPath: 'D:\\project\\halo\\server\\temp\\48e61df544d9a3fe99c962852fafd200.mp4',
//   outputDir: './temp/frames',
//   extractMode: 'random',
//   frameCount: 6,
//   outputFormat: 'jpg'
// }).catch(console.error);
