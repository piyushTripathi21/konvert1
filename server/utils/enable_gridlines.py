import sys
import os

def main():
    if len(sys.argv) < 2:
        print("Usage: enable_gridlines.py <excel_file_path>")
        sys.exit(1)
        
    filepath = sys.argv[1]
    if not os.path.exists(filepath):
        print(f"ERROR: File not found at: {filepath}")
        sys.exit(1)
        
    try:
        import openpyxl
        wb = openpyxl.load_workbook(filepath)
        for sheet in wb.worksheets:
            # 1. Force gridlines visible in editor/view
            try:
                sheet.sheet_view.showGridLines = True
            except Exception as e:
                print(f"Warning (showGridLines): {e}")

            # 2. Force gridlines printed in PDF export
            try:
                sheet.print_options.gridLines = True
            except Exception as e:
                print(f"Warning (print_options): {e}")
                
            # 3. Force entire worksheet to scale and fit on exactly 1 page
            try:
                sheet.sheet_properties.pageSetUpPr.fitToPage = True
                sheet.page_setup.fitToWidth = 1
                sheet.page_setup.fitToHeight = 1
            except Exception as e:
                print(f"Warning (page_setup): {e}")

        wb.save(filepath)
        print("SUCCESS")
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
