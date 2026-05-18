import ToolCard from '../components/ui/ToolCard';
import { rotatePdf } from '../services/api';
import './SubPage.css';

export default function RotatePdf() {
  return (
    <div className="sub-page">
      <h2>Rotate PDF</h2>
      <p className="sub-page-desc">
        Rotate all pages of your PDF by a given angle — 90°, 180°, or 270°.
      </p>
      <div className="sub-page-card">
        <ToolCard
          title="Rotate PDF"
          color="#f39c12"
          icon={
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="28" height="28" rx="3" fill="white" fillOpacity="0.9"/>
              <path d="M30 10 A14 14 0 0 1 38 24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <polyline points="38,18 38,24 32,24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
          fields={[
            { name: 'file', type: 'file', accept: '.pdf', required: true },
            {
              name: 'degrees',
              type: 'select',
              options: [
                { value: '90', label: '90°' },
                { value: '180', label: '180°' },
                { value: '270', label: '270°' },
              ],
            },
          ]}
          apiCall={(data) => rotatePdf(data.file, data.degrees)}
        />
      </div>
    </div>
  );
}
