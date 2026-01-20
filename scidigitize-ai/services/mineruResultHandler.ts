import { SubItem } from '../types';
import { v4 as uuidv4 } from 'uuid'; // Ideally use crypto.randomUUID

export const processMineruDirectResponse = async (
    imageUrls: string[],
    layoutUrl?: string
): Promise<SubItem[]> => {
    const subItems: SubItem[] = [];

    // Optional: Fetch layout if provided to get precise bounding boxes or types
    // For now, based on user request "return file url... then return result", 
    // we focus on the images list which is the high fidelity output.

    for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        try {
            // We need to fetch the image to create a local blob for preview/drag-drop to work naturally
            // OR we can just use the URL if we trust it persists (OSS). 
            // Better to use URL for previewUrl, but for 'file' property (needed for Gemini), 
            // we might need a Blob/File object.

            // NOTE: Fetching from OSS might need CORS, but we set up proxy for Mineru OSS.
            // If the returned URLs are NOT mineru OSS, we might have issues.
            // The sample docs show: https://nocobse.foxuai.com/... 
            // This is a DIFFERENT domain "foxuai.com". We might need another proxy 
            // OR assume "scidigitize-ai" runs on local and backend allows CORS?
            // "nocobse.foxuai.com" sounds like the user's domain.

            // Let's assume we can fetch or just use the URL.
            // App.tsx usually calls `analyzeChartImage(item.file...)`. 
            // Geminiservice expects a File object. So we MUST fetch.

            const res = await fetch(url);
            if (!res.ok) continue;

            const blob = await res.blob();
            const filename = url.split('/').pop() || `image_${i}.jpg`;
            const fileObj = new File([blob], filename, { type: 'image/jpeg' });

            subItems.push({
                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36),
                type: 'standard_chart', // Default
                reason: 'Detected by Mineru (Cloud)',
                file: fileObj,
                previewUrl: URL.createObjectURL(blob), // Local object URL is faster/safer for canvas
                context: "Context from Cloud extraction",
                pageNumber: i + 1,
                status: 'idle'
            });

        } catch (e) {
            console.warn("Failed to load image from result", url, e);
        }
    }

    return subItems;
};

