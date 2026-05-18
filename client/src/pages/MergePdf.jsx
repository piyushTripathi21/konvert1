import ToolCard from '../components/ui/ToolCard';
import { mergePdfs } from '../services/api';
import './SubPage.css';

export default function MergePdf() {
  return (
    <div className="sub-page">
      <h2>Merge PDF</h2>
      <p className="sub-page-desc">
        Combine multiple PDF files into one unified document. Simply upload your files and click convert.
      </p>
      <div className="sub-page-card">
        <ToolCard
          title="Merge PDF"
          color="#e2514a"
          icon={
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="8" width="14" height="18" rx="2" fill="white" fillOpacity="0.9"/>
              <rect x="28" y="8" width="14" height="18" rx="2" fill="white" fillOpacity="0.9"/>
              <path d="M13 26v6l11 6 11-6v-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
          fields={[
            { name: 'files', type: 'file', accept: '.pdf', multiple: true, required: true },
          ]}
          apiCall={(data) => mergePdfs(data.files)}
        />
      </div>
    </div>
  );
}
