import ToolCard from '../components/ui/ToolCard';
import { watermarkPdf } from '../services/api';
import './SubPage.css';

export default function WatermarkPdf() {
  return (
    <div className="sub-page">
      <h2>Watermark PDF</h2>
      <p className="sub-page-desc">
        Add a text watermark to every page of your PDF document.
      </p>
      <div className="sub-page-card">
        <ToolCard
          title="Watermark"
          color="#9b59b6"
          icon={
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
              <text x="24" y="30" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#9b59b6" opacity="0.7" fontFamily="Inter, sans-serif">WM</text>
            </svg>
          }
          fields={[
            { name: 'file', type: 'file', accept: '.pdf', required: true },
            { name: 'text', type: 'text', placeholder: 'Watermark text' },
          ]}
          apiCall={(data) => watermarkPdf(data.file, data.text)}
        />
      </div>
    </div>
  );
}
