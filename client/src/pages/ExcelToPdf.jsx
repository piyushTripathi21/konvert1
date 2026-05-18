import ToolCard from '../components/ui/ToolCard';
import { excelToPdf } from '../services/api';
import './SubPage.css';

export default function ExcelToPdf() {
  return (
    <div className="sub-page">
      <h2>Excel to PDF</h2>
      <p className="sub-page-desc">
        Convert your Microsoft Excel (.xlsx, .xls) and CSV spreadsheets into formatted PDF tables.
      </p>
      <div className="sub-page-card">
        <ToolCard
          title="Excel to PDF"
          color="#1d6f42"
          icon={
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
              <path d="M14 14h20M14 20h20M14 26h20M14 32h20" stroke="#1d6f42" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M20 14v18M28 14v18" stroke="#1d6f42" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          }
          fields={[
            { name: 'file', type: 'file', accept: '.xlsx,.xls,.csv', required: true },
          ]}
          apiCall={(data) => excelToPdf(data.file)}
        />
      </div>
    </div>
  );
}
