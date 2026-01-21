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

            const pollData = await pollResponse.json();
            // console.log('[Mineru] Poll Status:', pollData.success ? 'Success' : 'Processing...');

            // Check completion criteria
            if (pollData.success === true && pollData.data && pollData.data.unzip) {
                console.log('[Mineru] Parsing Completed!', pollData);

                const unzip = pollData.data.unzip;
                const images = unzip.images || [];

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
                    full: unzip.full,
                    layout: unzip.layout,
                    origin: unzip.origin,
                    content_list: unzip.content_list
                }];
            }

            // If message indicates failure?
            // "data": null or "message": "error..." ?
            // For now assume if not success, it's processing.

        } catch (pollErr) {
            console.warn('[Mineru] Polling Error:', pollErr);
        }
    }

    throw new Error("Timeout: Mineru analysis did not complete within 10 minutes.");
};
