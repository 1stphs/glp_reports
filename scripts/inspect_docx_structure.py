import docx
import sys

def extract_headings(docx_path):
    try:
        doc = docx.Document(docx_path)
        print(f"--- Structure of: {docx_path.split('/')[-1]} ---")
        for para in doc.paragraphs:
            if para.style.name.startswith('Heading'):
                print(f"{para.style.name}: {para.text}")
    except Exception as e:
        print(f"Error reading {docx_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python inspect_docx_structure.py <file1> <file2> ...")
        sys.exit(1)
    
    for file_path in sys.argv[1:]:
        extract_headings(file_path)
