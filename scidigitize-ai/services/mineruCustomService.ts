import { MineruExtractResult } from '../types';

const isDev = (import.meta as any).env?.DEV;

// Use Proxy in Dev, Direct in Prod
const BASE_URL = isDev ? '/foxu-api' : 'https://foxuai.com/api';
const TRIGGER_ENDPOINT = `${BASE_URL}/webhook:trigger/e6n65lqcahs`;
const POLL_ENDPOINT = `${BASE_URL}/webhook:trigger/acow278h6om`;

export const triggerCustomMineruParsing = async (fileUrl: string, fileName: string): Promise<MineruExtractResult[]> => {
    console.log('[Mineru] Triggering parsing via Direct Polling for:', fileUrl);

    // 1. Trigger the Job
    const triggerResponse = await fetch(TRIGGER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            url: fileUrl,
            title: fileName,
            model_version: 'vlm'
        })
    });

    if (!triggerResponse.ok) {
        throw new Error(`Mineru Trigger Failed: ${triggerResponse.status}`);
    }

    const triggerData = await triggerResponse.json();
    console.log('[Mineru] Trigger Response:', triggerData);

    // Robustly find file_id (could be at root or in data object)
    const fileId = triggerData.file_id || (triggerData.data && triggerData.data.file_id) || (triggerData as any)?.data;

    if (!fileId) {
        console.error("Invalid Trigger Response", triggerData);
        throw new Error("Mineru API did not return a valid file_id");
    }

    console.log(`[Mineru] Task Started. File ID: ${fileId}. Starting Polling...`);

    // 2. Poll for Results
    const startTime = Date.now();
    const TIMEOUT_MS = 600000; // 10 Minutes
    const POLLING_INTERVAL = 5000; // 5 Seconds

    while (Date.now() - startTime < TIMEOUT_MS) {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));

        try {
            const pollResponse = await fetch(POLL_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_id: fileId })
            });

            if (!pollResponse.ok) {
                console.warn('[Mineru] Poll request failed, retrying...');
                continue;
            }

            const pollJson = await pollResponse.json();

            // Handle { statusCode, body } wrapper structure
            const responseBody = pollJson.body || pollJson;

            // console.log(`[Mineru] Poll Status: ${responseBody.message}`);

            // Check completion criteria based on 'message'
            if (responseBody.message === 'completed') {
                console.log('[Mineru] Parsing Completed!', responseBody);

                // Find the dynamic key containing 'unzip' data
                let unzipData = null;
                const dataObj = responseBody.data || {};

                // Iterate over object values to find the one with 'unzip' property
                for (const val of Object.values(dataObj)) {
                    if (val && typeof val === 'object' && (val as any).unzip) {
                        unzipData = (val as any).unzip;
                        break;
                    }
                }

                if (unzipData) {
                    let images = unzipData.images || [];

                    // In DEV, proxy the images to avoid CORS
                    if (isDev) {
                        images = images.map((imgUrl: string) => {
                            if (imgUrl.startsWith('https://nocobse.foxuai.com')) {
                                return imgUrl.replace('https://nocobse.foxuai.com', '/foxu-images-proxy');
                            }
                            return imgUrl;
                        });
                    }

                    // Map to Result Format
                    return [{
                        file_name: fileName,
                        state: 'done',
                        extract_progress: {
                            extracted_pages: images.length,
                            total_pages: images.length,
                            start_time: new Date(startTime).toISOString()
                        },
                        images: images,
                        full: unzipData.full,
                        layout: unzipData.layout,
                        origin: unzipData.origin,
                        content_list: unzipData.content_list
                    }];
                } else {
                    console.warn('[Mineru] Status completed but no unzip data found in:', responseBody.data);
                }
            }

            // If message is 'uploading' or anything else, we continue polling untill timeout.
            // Note: success is always true according to docs, so we rely on message.

        } catch (pollErr) {
            console.warn('[Mineru] Polling Error:', pollErr);
        }
    }

    throw new Error("Timeout: Mineru analysis did not complete within 10 minutes.");
};
