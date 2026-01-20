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
        // Use the sanitized endpoint for matching
        const endpoint = sdkEndpoint;

        if (isDev) {
            // In Dev, rewrite to use local proxy
            // URL is https://endpoint/bucket/key... (Path Style)
            // Proxy Target: /tos-proxy -> https://endpoint

            // Matches https://endpoint or http://endpoint at start
            const endpointRegex = new RegExp(`^https?://${endpoint.replace(/\./g, '\\.')}`);

            if (endpointRegex.test(uploadUrl)) {
                // Replace https://tos-cn-beijing.volces.com with /tos-proxy
                uploadUrl = uploadUrl.replace(endpointRegex, '/tos-proxy');
            } else {
                // Fallback: If SDK ignored enablePathStyle (V-Host style), try to fix it.
                // URL: https://bucket.endpoint/key
                const vhostRegex = new RegExp(`^https?://${BUCKET_NAME}\\.${endpoint.replace(/\./g, '\\.')}`);
                if (vhostRegex.test(uploadUrl)) {
                    // rewrite to /tos-proxy/bucket
                    uploadUrl = uploadUrl.replace(vhostRegex, `/tos-proxy/${BUCKET_NAME}`);
                }
            }
        }

        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type || 'application/octet-stream'
            }
        });

        if (!response.ok) {
            throw new Error(`TOS Upload Failed: ${response.status} ${response.statusText}`);
        }

        // 3. Return Public URL for Backend
        // The backend likely needs a clean URL.
        const protocol = endpoint.startsWith('http') ? '' : 'https://';
        // Construct standard URL
        const publicUrl = `${protocol}${BUCKET_NAME}.${endpoint.replace(/^https?:\/\//, '')}/${fileName}`;

        return publicUrl;
    } catch (error) {
        console.error('TOS Upload Error:', error);
        throw error;
    }
};
