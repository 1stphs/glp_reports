import TOS from '@volcengine/tos-sdk';

// Initialize TOS Client
// Note: We are using process.env which is polyfilled by Vite's define plugin
// Using type assertion to bypass potential TS issues with meta.env
const isDev = (import.meta as any).env?.DEV;

// Sanitize Endpoint (remove protocol if present)
const rawEndpoint = process.env.TOS_ENDPOINT || 'tos-cn-beijing.volces.com';
const sdkEndpoint = rawEndpoint.replace(/^https?:\/\//, '');

// Always use the real endpoint for SDK to generate correct signatures/URLs
const client = new TOS({
    accessKeyId: process.env.TOS_ACCESS_KEY || '',
    accessKeySecret: process.env.TOS_SECRET_KEY || '',
    region: process.env.TOS_REGION || 'cn-beijing',
    endpoint: sdkEndpoint,
    // Force path style so signature is generated for /bucket/key resource used by proxy
    enablePathStyle: true
} as any);

const BUCKET_NAME = process.env.TOS_BUCKET || '';

export const uploadFileToTos = async (file: File): Promise<string> => {
    if (!BUCKET_NAME) {
        throw new Error('TOS_BUCKET is not defined in environment variables.');
    }

    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    try {
        // 1. Get Pre-Signed URL for PUT
        // With enablePathStyle: true, this should be https://{endpoint}/{bucket}/{key}?signature...
        const urlStr = client.getPreSignedUrl({
            bucket: BUCKET_NAME,
            key: fileName,
            method: 'PUT',
            expires: 3600
        });

        // 2. Upload via Fetch
        let uploadUrl = urlStr;

        if (isDev) {
            // In Dev, rewrite to use local proxy
            // SDK generates Virtual-Hosted Style URL: https://bucket.endpoint/key?signature...
            // We need to rewrite it to: /tos-proxy/key?signature...
            // Because our proxy target is https://bucket.endpoint

            const vhostRegex = new RegExp(`^https?://${BUCKET_NAME}\\.${sdkEndpoint.replace(/\./g, '\\.')}`);
            if (vhostRegex.test(uploadUrl)) {
                // Replace https://bio-knowledgebase.tos-cn-beijing.volces.com with /tos-proxy
                uploadUrl = uploadUrl.replace(vhostRegex, '/tos-proxy');
            }
        }

        console.log('[TOS] Original URL:', urlStr);
        console.log('[TOS] Proxy URL:', uploadUrl);

        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: file
            // NOTE: Do NOT add Content-Type header!
            // The pre-signed URL signature does not include it, so adding it causes 403
        });

        if (!response.ok) {
            throw new Error(`TOS Upload Failed: ${response.status} ${response.statusText}`);
        }

        // 3. Generate Signed GET URL for Backend
        // The backend needs to download the file. Signed URL ensures access even if private.
        // The example in api.md shows a signed URL, so we follow that pattern.
        const signedGetUrl = client.getPreSignedUrl({
            bucket: BUCKET_NAME,
            key: fileName,
            method: 'GET',
            expires: 3600 // 1 hour validity for backend to fetch
        });

        console.log('[TOS] Signed GET URL:', signedGetUrl);
        return signedGetUrl;

    } catch (error) {
        console.error("TOS Upload Error:", error);
        throw new Error(`TOS Upload Failed: ${(error as any).message || error}`);
    }
};
