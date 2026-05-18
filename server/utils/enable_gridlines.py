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
            # Enable gridlines in view
            if sheet.views and sheet.views.sheetView:
                sheet.views.sheetView[0].showGridLines = True
            # Enable gridlines in print/PDF export
            sheet.print_options.gridLines = True
        wb.save(filepath)
        print("SUCCESS")
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
