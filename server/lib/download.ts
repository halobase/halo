import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import { fileURLToPath } from 'url';
import * as delfs from "fs/promises";

export async function download(fileUrl: string, filename: string): Promise<string> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const parentDir = path.resolve(__dirname, '..');
  const tempDir = path.resolve(parentDir, 'temp');
  const destPath = path.resolve(tempDir, filename);

  return new Promise((resolve, reject) => {
    const url = new URL(fileUrl);
    const client = url.protocol === 'https:' ? https : http;

    try {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
    } catch (err: any) {
      reject(new Error(`无法创建目录: ${tempDir}, 错误: ${err.message}`));
      return;
    }

    // 创建写入流
    let file: fs.WriteStream;
    try {
      file = fs.createWriteStream(destPath);
    } catch (err: any) {
      reject(new Error(`无法创建文件: ${destPath}, 错误: ${err.message}`));
      return;
    }

    // 发起请求
    const request = client.get(fileUrl, (response) => {
      // 检查请求是否成功
      if (response.statusCode !== 200) {
        fs.unlink(destPath, () => { }); // 删除临时文件
        reject(new Error(`请求失败，状态码: ${response.statusCode}`));
        return;
      }

      // 通过管道传输数据
      response.pipe(file);

      // 处理完成事件
      file.on('finish', () => {
        file.close();
        console.log(`文件下载完成: ${destPath}`);
        resolve(destPath); // 返回文件路径
      });
    });

    // 处理请求错误
    request.on('error', (err) => {
      fs.unlink(destPath, (unlinkErr) => {
        if (unlinkErr) {
          console.error(`无法删除临时文件: ${destPath}, 错误: ${unlinkErr.message}`);
        }
        reject(err);
      });
    });

    // 处理文件写入错误
    file.on('error', (err) => {
      fs.unlink(destPath, (unlinkErr) => {
        if (unlinkErr) {
          console.error(`无法删除临时文件: ${destPath}, 错误: ${unlinkErr.message}`);
        }
        reject(err);
      });
    });
  });
}
export async function deleteFile(filePath: string) {
  try {
    await delfs.unlink(filePath);
    console.log(`文件已删除: ${filePath}`);
  } catch (err: any) {
    console.error(`删除文件失败: ${err.message}`);
  }
}