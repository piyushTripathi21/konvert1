import ToolCard from '../components/ui/ToolCard';
import { compressPdf } from '../services/api';
import './SubPage.css';

export default function CompressPdf() {
  return (
    <div className="sub-page">
      <h2>Compress PDF</h2>
      <p className="sub-page-desc">
        Reduce your PDF file size by recompressing embedded images. Choose a compression level that suits your needs.
      </p>
      <div className="sub-page-card">
        <ToolCard
          title="Compress PDF"
          color="#2ecc71"
          icon={
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
              <path d="M18 18l6 6 6-6M18 28l6-6 6 6" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
          fields={[
            { name: 'file', type: 'file', accept: '.pdf', required: true },
            {
              name: 'level',
              type: 'select',
              options: [
                { value: 'screen',   label: 'Maximum Compression' },
                { value: 'ebook',    label: 'Recommended' },
                { value: 'printer',  label: 'Good Quality' },
                { value: 'prepress', label: 'Best Quality' },
              ],
            },
          ]}
          apiCall={(data) => compressPdf(data.file, data.level)}
        />
      </div>
    </div>
  );
}
