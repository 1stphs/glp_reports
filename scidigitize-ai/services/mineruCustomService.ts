import { MineruExtractResult } from '../types';

const TRIGGER_URL = 'https://foxuai.com/api/webhook:trigger/yqwfx0r97q9';

// This interface matches API Docs result format (docs/mineru_api_results.md)
interface CustomMineruResponse {
    [key: string]: {
        images: string[];
        content_list: string;
        full: string;
        layout: string;
        origin: string;
    } | boolean; // Matches the weird "ryyutaonzsu": true at top level if present
}

export const triggerCustomMineruParsing = async (fileUrl: string, fileName: string): Promise<MineruExtractResult[]> => {
    console.log('[Mineru] Triggering parsing for:', fileUrl);

    const response = await fetch(TRIGGER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // No auth mentioned in docs/api.md? "参数" section implies simple JSON body.
        },
        body: JSON.stringify({
            url: fileUrl,
            title: fileName,
            model_version: 'vlm'
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[Mineru] API Error:', response.status, errorText);
        throw new Error(`Mineru Webhook Failed: ${response.status} ${response.statusText}`);
    }

    // Get response as text first to debug
    const responseText = await response.text();
    console.log('[Mineru] Raw Response:', responseText);

    if (!responseText || responseText.trim() === '') {
        throw new Error('Mineru API returned empty response');
    }

    let data: CustomMineruResponse;
    try {
        data = JSON.parse(responseText);
    } catch (e) {
        console.error('[Mineru] JSON Parse Error:', e);
        throw new Error(`Mineru API returned invalid JSON: ${responseText.substring(0, 200)}`);
    }

    console.log('[Mineru] Parsed Response:', data);

    // Parse the dynamic key result.
    // The sample shows keys like "lg79da2k01k". We need to find the one that has "images".
    const results: MineruExtractResult[] = [];

    for (const key in data) {
        if (typeof data[key] === 'object' && data[key] !== null && 'images' in (data[key] as any)) {
            const item = data[key] as any;
            results.push({
                file_name: fileName,
                state: 'done', // Webhook seems to return completed data directly
                // We map custom format to our internal type or use it directly in handler
                // Storing raw data in a way our handler can process.
                // We need to pass the images list mainly.
                extract_progress: {
                    extracted_pages: (item.images || []).length,
                    total_pages: (item.images || []).length,
                    start_time: new Date().toISOString()
                },
                // Hacking the type slightly to pass the images array. 
                // Ideally we update the type definition, but for now we put it in a custom property 
                // or assume checks in handler. Let's start with a cleaner type update in next step.
                // For now, I'll return the object and let the handler deal with it if I update types.ts
                ...item
            });
        }
    }

    return results;
};
