
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, '../../original docs/markdown_docs');
const OUTPUT_FILE = path.resolve(__dirname, '../src/services/mock/auto_generated_templates.json');
const TOC_FILE = path.resolve(__dirname, '../dev/验证报告目录.md');

console.log(`🔍 Scanning directory: ${SOURCE_DIR}`);

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.md')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });
    return arrayOfFiles;
}

function parseStandardTOC() {
    if (!fs.existsSync(TOC_FILE)) {
        console.warn(`⚠️ Standard TOC file not found at ${TOC_FILE}`);
        return null;
    }
    const content = fs.readFileSync(TOC_FILE, 'utf-8');
    const lines = content.split('\n');
    const root = [];
    let stack = [];

    lines.forEach(line => {
        const clean = line.trim();
        if (!clean || clean === '目录' || clean === '缩略语表' || clean === '附表目录' || clean === '附图目录') return;

        // Pattern for "1. Title" or "1.1 Title"
        const match = clean.match(/^(\d+(\.\d+)*)\s+(.*)/);
        if (match) {
            const numberStr = match[1];
            const title = match[3].replace(/\t\d+$/, ''); // Remove page numbers if present
            const level = numberStr.split('.').length;
            const id = `CH-${numberStr.replace(/\./g, '-')}`;

            const node = {
                id,
                title: `${numberStr} ${title}`,
                type: level > 1 ? 'subsection' : 'section',
                children: []
            };

            if (level === 1) {
                root.push(node);
                stack = [{ level, node }];
            } else {
                // Pop stack until parent is found
                while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                    stack.pop();
                }

                if (stack.length > 0) {
                    stack[stack.length - 1].node.children.push(node);
                    stack.push({ level, node });
                } else {
                    root.push(node);
                    stack = [{ level, node }];
                }
            }
        }
    });
    console.log(`✅ Parsed Standard TOC with ${root.length} root chapters.`);
    return root;
}

function extractMetadata(filePath, content) {
    const filename = path.basename(filePath);
    let species = "Unknown Species";
    let matrix = "Unknown Matrix";
    let type = "General Study";
    const studyIdMatch = filename.match(/([NS]\S+\d{5}[A-Z]+\d+)/);
    const studyId = studyIdMatch ? studyIdMatch[1] : `AUTO-${Date.now()}`;

    if (/rat|大鼠/i.test(filename) || /rat|大鼠/i.test(content)) species = "Rat (SD)";
    if (/monkey|食蟹猴/i.test(filename) || /monkey|食蟹猴/i.test(content)) species = "Cynomolgus Monkey";
    if (/mouse|小鼠/i.test(filename) || /mouse|小鼠/i.test(content)) species = "Mouse (Nude/Balb-c)";
    if (/pig|猪/i.test(filename) || /pig|猪/i.test(content)) species = "Minipig";

    if (/plasma/i.test(filename) || /plasma/i.test(content)) matrix = "Plasma";
    if (/serum/i.test(filename) || /serum/i.test(content)) matrix = "Serum";

    if (/validation/i.test(filename) || /验证/i.test(filename)) type = "Method Validation";
    if (/summary/i.test(filename) || /汇总/i.test(filename)) type = "Data Summary";

    return { studyId, species, matrix, type };
}

function extractNarrativeExamples(content) {
    const lines = content.split('\n');
    const examples = [];
    const regexScientific = /(\d+\.?\d*)\s*(ng\/mL|pg\/mL|%|days|hours|°C)/;

    for (const line of lines) {
        if (regexScientific.test(line) && line.length > 50 && line.length < 500) {
            const cleanLine = line.replace(/^\s*> /, '').trim();
            if (!cleanLine.startsWith('#') && !cleanLine.startsWith('-')) {
                examples.push(cleanLine);
            }
        }
        if (examples.length >= 3) break;
    }
    return examples;
}

function extractChaptersHeuristic(content) {
    const lines = content.split('\n');
    const chapters = [];
    let idCounter = 1;

    const headerKeywords = ["摘要", "Abstract", "引言", "Introduction", "材料和方法", "Materials and Methods", "结果", "Results"];

    lines.forEach(line => {
        const clean = line.trim();
        let isHeader = false;
        let title = "";

        if (clean.startsWith('#')) {
            isHeader = true;
            title = clean.replace(/^#+\s*/, '');
        } else if (headerKeywords.includes(clean)) {
            isHeader = true;
            title = clean;
        }

        if (isHeader && title) {
            chapters.push({
                id: `CH-${idCounter++}`,
                title: title,
                type: 'section',
                children: []
            });
        }
    });

    if (chapters.length === 0) {
        return [
            { id: "CH-001", title: "Overview", type: "section" }
        ];
    }
    return chapters;
}

function cleanText(str) {
    if (!str) return null;
    return str.replace(/[|]/g, ' ').replace(/\bnan\b/g, '').replace(/\s+/g, ' ').trim();
}

function extractMethodVariables(content) {
    const variables = {};

    // 1. Instrument
    const instrumentMatch = content.match(/(AB SCIEX|Shimadzu|Agilent|Waters)[^\n\r]*/i);
    if (instrumentMatch) variables['Instrument System'] = cleanText(instrumentMatch[0]);

    // 2. Column
    const columnMatch = content.match(/Column[:|：]\s*([^\n\r]+)/i) || content.match(/色谱柱[:|：]\s*([^\n\r]+)/i);
    if (columnMatch) variables['Column'] = cleanText(columnMatch[1]);

    // 3. Linearity Range
    const rangeMatch = content.match(/线性范围[:|：]\s*待测物[A-Z]*[：:]\s*([\d\.]+[~-][\d\.]+)\s*ng\/mL/i);
    if (rangeMatch) variables['Calibration Range'] = rangeMatch[1] + " ng/mL";

    // 4. LLOQ
    const lloqMatch = content.match(/LLOQ[:|：]\s*待测物[A-Z]*[：:]\s*([\d\.]+)\s*ng\/mL/i);
    if (lloqMatch) variables['LLOQ'] = lloqMatch[1] + " ng/mL";

    // 5. QC Levels (Heuristic: Look for line with QC and multiple numbers)
    const qcLine = content.match(/质控浓度.*QC.*[:|：]\s*([^\n\r]+)/i);
    if (qcLine) variables['QC Levels'] = cleanText(qcLine[1]);

    return variables;
}

// Main Execution
const standardChapters = parseStandardTOC();

try {
    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
        process.exit(1);
    }

    const files = getAllFiles(SOURCE_DIR);
    console.log(`📄 Found ${files.length} markdown files.`);

    const templates = files.map(filePath => {
        const content = fs.readFileSync(filePath, 'utf-8');
        const meta = extractMetadata(filePath, content);
        const examples = extractNarrativeExamples(content);
        const variables = extractMethodVariables(content); // Extract Deep Variables


        if (examples.length === 0) return null;

        // Apply Standard TOC for Validation Reports
        let chapters = null;
        if (meta.type === "Method Validation" && standardChapters) {
            chapters = JSON.parse(JSON.stringify(standardChapters));
        } else {
            chapters = extractChaptersHeuristic(content);
        }

        return {
            id: meta.studyId,
            name: `${meta.type} - ${meta.species} - ${meta.matrix}`,
            version: "v1.0 (Auto)",
            species: [meta.species],
            regulation: "NMPA/FDA",
            status: "Published",
            lastModified: new Date().toISOString().split('T')[0],
            author: "System Extractor",
            description: `Auto-generated template from ${path.basename(filePath)}`,
            variables: variables, // Add extracted variables
            examples: examples,
            chapters: chapters
        };
    }).filter(t => t !== null);

    const uniqueTemplates = Array.from(new Map(templates.map(item => [item.id, item])).values());

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueTemplates, null, 2));
    console.log(`✅ Successfully generated ${uniqueTemplates.length} templates at ${OUTPUT_FILE}`);

} catch (err) {
    console.error("❌ Error running extraction:", err);
    process.exit(1);
}
