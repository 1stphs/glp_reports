import { MineruExtractResult } from '../types';

const isDev = (import.meta as any).env?.DEV;
const CALLBACK_URL = (import.meta as any).env.VITE_CALLBACK_URL;
// In Prod, usually requires Nginx config or works directly if browser allows. 
// We use relative path in Prod hoping for a proxy/backend on same domain.
const RELAY_POLL_URL = isDev ? 'http://localhost:3001/api/poll-results' : '/api/poll-results';

// In Dev, route through Vite proxy (/foxu-api) to support 5+ minute timeouts via 'proxyTimeout'
// In Prod, usually requires Nginx config or works directly if browser allows
const TRIGGER_URL = isDev
    ? '/foxu-api/webhook:trigger/yqwfx0r97q9'
    : 'https://foxuai.com/api/webhook:trigger/yqwfx0r97q9';

// This interface matches API Docs result format (docs/mineru_api_results.md)
interface CustomMineruResponse {
    [key: string]: {
        images: string[];
        content_list: string;
        full: string;
        layout: string;
        origin: string;
    } | boolean;
}

export const triggerCustomMineruParsing = async (fileUrl: string, fileName: string): Promise<MineruExtractResult[]> => {
    console.log('[Mineru] Triggering parsing for:', fileUrl);

    if (!CALLBACK_URL) {
        throw new Error("Configuration Error: VITE_CALLBACK_URL is missing. Please set up Ngrok and .env.local");
    }

    const payload = {
        url: fileUrl,
        title: fileName,
        model_version: 'vlm',
        callback_url: CALLBACK_URL
    };
    console.log('[Mineru] Sending Payload with Callback:', JSON.stringify(payload, null, 2));

    // 1. Trigger the Job
    const response = await fetch(TRIGGER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[Mineru] API Error:', response.status, errorText);
        throw new Error(`Mineru Webhook Trigger Failed: ${response.status} ${response.statusText}`);
    }

    console.log('[Mineru] Job Triggered. Starting Polling Loop (Waiting for Callback)...');

    // 2. Poll the Relay Server for Results
    const startTime = Date.now();
    const TIMEOUT_MS = 600000; // 10 Minutes
    const POLLING_INTERVAL = 10000; // 10 Seconds

    while (Date.now() - startTime < TIMEOUT_MS) {
        try {
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));

            const pollResponse = await fetch(RELAY_POLL_URL);
            if (!pollResponse.ok) {
                console.warn('[Relay] Poll skipped (server likely down)');
                continue;
            }

            const db: CustomMineruResponse = await pollResponse.json();

            // Check for any valid result
            // Ideally we match by 'origin' === fileUrl, but signed URL might have expired params variance?
            // Let's look for ANY result that contains 'images' for now (Single User Dev Mode assumption)
            // Or match the filename if we could.
            // We'll iterate all keys.

            const results: MineruExtractResult[] = [];
            let found = false;

            for (const key in db) {
                const item = db[key];
                // Check if it's a result object
                if (typeof item === 'object' && item !== null && 'images' in (item as any)) {
                    const resultItem = item as any;
                    // Optional: Check if origin matches. 
                    // const origin = resultItem.origin; 
                    // if (origin && origin !== fileUrl) continue; 

                    console.log(`[Mineru] Found result for key: ${key}`);
                    results.push({
                        file_name: fileName,
                        state: 'done',
                        extract_progress: {
                            extracted_pages: (resultItem.images || []).length,
                            total_pages: (resultItem.images || []).length,
                            start_time: new Date().toISOString()
                        },
                        ...resultItem
                    });
                    found = true;
                }
            }

            if (found) {
                console.log('[Mineru] Polling Success! Results received.');
                return results;
            }

            console.log('[Mineru] Still waiting... (Time elapsed: ' + Math.round((Date.now() - startTime) / 1000) + 's)');

        } catch (pollErr) {
            console.warn('[Relay] Polling Error (ignoring):', pollErr);
        }
    }

    throw new Error("Timeout: Mineru analysis did not complete within 10 minutes.");
};
