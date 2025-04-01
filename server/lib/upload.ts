import { readFileSync } from 'fs';
import { statSync } from 'fs';
import { basename } from 'path';
import mime from 'mime-types';

interface PresignResponse {
  object_key: string;
  url: string;
}

interface FinalResponse {
  url: string;
  id: string;
  [key: string]: any;
}

async function uploaded<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  
  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function uploadFile(filepath: string): Promise<FinalResponse> {
  // 配置参数（替换为你的实际值）
  const PRESIGN_URL = "https://1";
  const SIGNED_URL = "https://2";
  const API_KEY = "3";

  // 1. 获取文件信息
  const filename = basename(filepath);
  const filemime = 'image/jpeg';
  const filesize = statSync(filepath).size;

  try {
    // 2. 获取预签名URL
    const presignResponse = await uploaded<PresignResponse>(PRESIGN_URL, {
      method: 'POST',
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: filename,
        method: "PUT"
      })
    });
    
    console.log('Presign response:', presignResponse);

    // 3. 上传文件内容
    const fileContent = readFileSync(filepath);
    const uploadResponse = await fetch(presignResponse.url, {
      method: 'PUT',
      headers: {
        'Content-Type': filemime,
        'Content-Length': filesize.toString()
      },
      body: fileContent
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }
    console.log('File uploaded successfully');

    // 4. 获取最终签名URL
    return await uploaded<FinalResponse>(SIGNED_URL, {
      method: 'POST',
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: filemime,
        name: filename,
        size: filesize,
        object_key: presignResponse.object_key
      })
    });
  } catch (error) {
    console.error('Upload failed:', error instanceof Error ? error.message : error);
    throw error;
  }
}

// 使用示例
const filepath = '/path/to/your/file.ply';
uploadFile(filepath)
  .then(result => console.log('Upload result:', result))
  .catch(() => process.exit(1));