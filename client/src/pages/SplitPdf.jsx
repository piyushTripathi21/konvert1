import ToolCard from '../components/ui/ToolCard';
import { splitPdf } from '../services/api';
import './SubPage.css';

export default function SplitPdf() {
  return (
    <div className="sub-page">
      <h2>Split PDF</h2>
      <p className="sub-page-desc">
        Extract specific pages by range. Enter page ranges like <code>1-3,5,8-10</code> to split your PDF.
      </p>
      <div className="sub-page-card">
        <ToolCard
          title="Split PDF"
          color="#4a90e2"
          icon={
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
              <line x1="8" y1="20" x2="40" y2="20" stroke="#4a90e2" strokeWidth="2.5"/>
              <line x1="24" y1="20" x2="24" y2="42" stroke="#4a90e2" strokeWidth="2" strokeDasharray="3 2"/>
            </svg>
          }
          fields={[
            { name: 'file', type: 'file', accept: '.pdf', required: true },
            { name: 'ranges', type: 'text', placeholder: 'e.g., 1-3,5,8-10' },
          ]}
          apiCall={(data) => splitPdf(data.file, data.ranges)}
        />
      </div>
    </div>
  );
}
