import os
import pandas as pd
from pathlib import Path

def split_excel_sheets(base_dir):
    """
    Traverses the directory, finds .xlsx files, creates a folder for each,
    and saves each sheet as a separate .xlsx file.
    """
    base_path = Path(base_dir)
    if not base_path.exists():
        print(f"Directory not found: {base_dir}")
        return

    print(f"Scanning directory: {base_path.resolve()}")

    # Collect all files first to avoid processing newly created files during iteration
    all_files = list(base_path.rglob('*.xlsx'))
    print(f"Found {len(all_files)} Excel files to process.")

    for file_path in all_files:
        # Skip temporary files
        if file_path.name.startswith('~$'):
            continue

        print(f"Processing file: {file_path}")
        
        try:
            # Create a directory with the same name as the file (without extension)
            output_dir = file_path.parent / file_path.stem
            output_dir.mkdir(exist_ok=True)
            print(f"  Created directory: {output_dir}")

            # Read all sheets
            excel_file = pd.ExcelFile(file_path)
            sheet_names = excel_file.sheet_names
            print(f"  Found sheets: {sheet_names}")

            for sheet_name in sheet_names:
                # Read the specific sheet
                df = pd.read_excel(file_path, sheet_name=sheet_name)
                
                # Sanitize sheet name for filename compatibility
                safe_sheet_name = "".join([c for c in sheet_name if c.isalpha() or c.isdigit() or c in (' ', '-', '_')]).strip()
                if not safe_sheet_name:
                    safe_sheet_name = "Sheet" # Fallback if name is all invalid chars
                
                output_file = output_dir / f"{safe_sheet_name}.xlsx"
                
                # Save as new Excel file
                df.to_excel(output_file, index=False)
                print(f"    Saved sheet '{sheet_name}' to {output_file}")
                
        except Exception as e:
            print(f"  Error processing {file_path}: {e}")

if __name__ == "__main__":
    target_directory = "original docs/小分子非临床中文验证模板/"
    # Ensure the path is absolute or correct relative to where script is run
    script_dir = Path(__file__).parent.parent
    full_target_path = script_dir / target_directory
    
    split_excel_sheets(full_target_path)
