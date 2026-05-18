import ToolCard from '../components/ui/ToolCard';
import { imagesToPdf } from '../services/api';
import './SubPage.css';

export default function ImagesToPdf() {
  return (
    <div className="sub-page">
      <h2>Images → PDF</h2>
      <p className="sub-page-desc">
        Convert multiple images into a single PDF document.
      </p>
      <div className="sub-page-card">
        <ToolCard
          title="Images → PDF"
          color="#3498db"
          icon={
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="10" width="24" height="20" rx="3" fill="white" fillOpacity="0.8"/>
              <rect x="18" y="18" width="24" height="20" rx="3" fill="white" fillOpacity="0.95"/>
              <circle cx="14" cy="17" r="3" fill="#3498db" opacity="0.6"/>
              <path d="M10 26l4-4 4 4 4-6 4 6" stroke="#3498db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
          fields={[
            { name: 'images', type: 'file', accept: 'image/*', multiple: true, required: true },
          ]}
          apiCall={(data) => imagesToPdf(data.images)}
        />
      </div>
    </div>
  );
}
