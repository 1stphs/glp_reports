
import os
import urllib.parse

MARKDOWN_DOCS_DIR = 'original docs/markdown_docs'
INDEX_FILE = 'original docs/docs_index.md'


def get_metadata(md_file_path):
    """
    Reads the markdown file and extracts:
    - Original path from metadata section
    - Summary from ## Summary section
    """
    original_path = None
    summary = None
    
    try:
        with open(md_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.splitlines()
            
            # Extract Original Path
            for line in lines[:20]:
                if line.strip().startswith('- **Original File**:'):
                    parts = line.split('`')
                    if len(parts) >= 2:
                        original_path = parts[1]
                        break
            
            # Extract Summary
            if '## Summary' in content:
                summary_parts = content.split('## Summary')
                if len(summary_parts) > 1:
                    # Take content after ## Summary
                    summary_text = summary_parts[1]
                    # Stop at next header if exists
                    if '\n## ' in summary_text:
                        summary_text = summary_text.split('\n## ')[0]
                    
                    summary = summary_text.strip()
                    
    except Exception as e:
        print(f"Error reading {md_file_path}: {e}")
        
    return original_path, summary

def generate_index():
    if not os.path.exists(MARKDOWN_DOCS_DIR):
        print(f"Directory {MARKDOWN_DOCS_DIR} not found!")
        return

    content_lines = ["# Documentation Index\n"]
    
    # Store entries by directory for grouping
    entries_by_dir = {}

    for root, dirs, files in os.walk(MARKDOWN_DOCS_DIR):
        for file in files:
            if file.endswith('.md'):
                md_path = os.path.join(root, file)
                
                # relative path from MARKDOWN_DOCS_DIR to group by subfolder
                rel_dir = os.path.relpath(root, MARKDOWN_DOCS_DIR)
                if rel_dir == '.':
                    rel_dir = "Root"
                
                if rel_dir not in entries_by_dir:
                    entries_by_dir[rel_dir] = []

                original_path, summary = get_metadata(md_path)
                
                rel_md_link = os.path.join('markdown_docs', os.path.relpath(md_path, MARKDOWN_DOCS_DIR))
                
                entry = {
                    'name': file,
                    'md_link': urllib.parse.quote(rel_md_link),
                    'original_link': urllib.parse.quote(original_path) if original_path else None,
                    'original_path_display': original_path if original_path else "Unknown",
                    'summary': summary
                }
                entries_by_dir[rel_dir].append(entry)

    # Sort directories
    sorted_dirs = sorted(entries_by_dir.keys())
    
    for dirname in sorted_dirs:
        content_lines.append(f"## {dirname}\n")
        sorted_files = sorted(entries_by_dir[dirname], key=lambda x: x['name'])
        
        for entry in sorted_files:
            # Use file basename as header
            title = os.path.splitext(entry['name'])[0]
            content_lines.append(f"### {title}")
            
            if entry['summary']:
                content_lines.append(f"> {entry['summary']}\n")
            
            content_lines.append(f"- **Document**: [{entry['name']}]({entry['md_link']})")
            if entry['original_link']:
                content_lines.append(f"- **Source**: [{entry['original_path_display']}]({entry['original_link']})")
            content_lines.append("")
        
        content_lines.append("")

    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        f.writelines(line + '\n' for line in content_lines)
    
    print(f"Index generated at: {INDEX_FILE}")

if __name__ == "__main__":
    generate_index()
