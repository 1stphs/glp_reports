import { MineruBatchResponse, MineruResultResponse } from '../types';

const MINERU_BASE_URL = '/mineru-api/api/v4';

const getHeaders = () => {
    // Note: Environment variables in Vite start with VITE_ usually, but per user request, we check standard env process or direct shim
    // We'll trust the user provided .env.local was correct, but Vite requires import.meta.env for client side.
    // However, if process is shimmed or we are in a hybrid env, we try both.
    // Given the previous code uses process.env.API_KEY, we assume process.env defined or replaced by Vite define.
    const token = process.env.mineru_token || (import.meta as any).env?.VITE_MINERU_TOKEN;

    if (!token) {
        console.warn("Mineru Token missing!");
    }
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export const initiateBatchUpload = async (files: File[]): Promise<MineruBatchResponse> => {
    const url = `${MINERU_BASE_URL}/file-urls/batch`;
    const fileMetadata = files.map(f => ({ name: f.name }));

    const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            files: fileMetadata,
            model_version: 'vlm'
        })
    });

    if (!response.ok) {
        throw new Error(`Batch init failed: ${response.statusText}`);
    }

    return response.json();
};

export const uploadFileToUrl = async (url: string, file: File) => {
    // Rewrite URL to use local proxy if it points to the known OSS domain to avoid CORS
    // Target: https://mineru.oss-cn-shanghai.aliyuncs.com/...
    let fetchUrl = url;
    if (url.includes('mineru.oss-cn-shanghai.aliyuncs.com')) {
        fetchUrl = url.replace('https://mineru.oss-cn-shanghai.aliyuncs.com', '/mineru-oss');
    }

    const response = await fetch(fetchUrl, {
        method: 'PUT',
        body: file,
        headers: {
            // AWS/OSS pre-signed URLs often require no specific content-type or matching content-type
            // "Content-Type": file.type 
        }
    });

    if (!response.ok) {
        throw new Error(`File upload failed: ${response.statusText}`);
    }
    return response;
};

export const pollBatchResult = async (batchId: string): Promise<MineruResultResponse> => {
    const url = `${MINERU_BASE_URL}/extract-results/batch/${batchId}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
    });

    if (!response.ok) {
        throw new Error(`Polling failed: ${response.statusText}`);
    }

    return response.json();
};
