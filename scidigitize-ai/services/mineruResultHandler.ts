import JSZip from 'jszip';
import { SubItem } from '../types';

interface MineruLayoutItem {
    id: number;
    type: string;
    bbox: [number, number, number, number];
    img_path?: string; // Path in the zip, e.g. "images/0.jpg"
    text_content?: string;
}

export const processMineruZip = async (
    zipBlob: Blob,
    fileName: string
): Promise<SubItem[]> => {
    const zip = await JSZip.loadAsync(zipBlob);
    const subItems: SubItem[] = [];

    // 1. Find the Layout JSON (usually named {filename}_layout.json or similar, or just check any .json)
    // Mineru structure typically has a json file describing the content.
    // If not found, we fallback to just extracting images.
    let layoutData: MineruLayoutItem[] = [];
    let layoutFile = Object.keys(zip.files).find(path => path.endsWith('.json') && !path.startsWith('__MACOSX'));

    if (layoutFile) {
        try {
            const content = await zip.file(layoutFile)?.async('string');
            if (content) {
                // Mineru json structure varies, sometimes it's a wrapper. 
                // We'll handle generic "array of items" or "dict with specific keys".
                const parsed = JSON.parse(content);
                // Assume it's an array for now, or extract the array from a key like 'pdf_info'
                layoutData = Array.isArray(parsed) ? parsed : (parsed.pdf_info || []);
            }
        } catch (e) {
            console.warn("Failed to parse Mineru layout JSON", e);
        }
    }

    // 2. Extract Images
    const imageFiles = Object.keys(zip.files).filter(path =>
        (path.startsWith('images/') || path.includes('/images/')) &&
        /\.(png|jpg|jpeg)$/i.test(path) &&
        !path.startsWith('__MACOSX')
    );

    for (const imgPath of imageFiles) {
        const fileData = await zip.file(imgPath)?.async('blob');
        if (!fileData) continue;

        // Find metadata if possible
        // The imgPath usually looks like "images/0.png".
        // Layout data might reference it.
        // If layout data relies on "0.jpg" but we have "images/0.jpg", we match fuzzily.
        const meta = layoutData.find(l => l.img_path && (imgPath.endsWith(l.img_path) || l.img_path.endsWith(imgPath)));

        const generateId = () => Math.random().toString(36).substring(2, 9);
        const subId = generateId();

        const type = meta?.type === 'table' ? 'complex_table' : 'standard_chart'; // Default to standard_chart for figures

        // Create a File object from blob for compatibility
        const fileObj = new File([fileData], imgPath.split('/').pop() || 'image.jpg', { type: 'image/jpeg' });

        subItems.push({
            id: subId,
            type: type,
            reason: `Detected by Mineru (${meta?.type || 'image'})`,
            file: fileObj,
            previewUrl: URL.createObjectURL(fileData),
            context: meta?.text_content || "Context from Mineru result",
            pageNumber: 0, // Mineru layout might not explicitly say page number in simple json, defaulting to 0 or we'd need deeper parsing
            status: 'idle'
        });
    }

    return subItems;
};
