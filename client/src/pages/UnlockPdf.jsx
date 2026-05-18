import ToolCard from '../components/ui/ToolCard';
import { unlockPdf } from '../services/api';
import './SubPage.css';

export default function UnlockPdf() {
  return (
    <div className="sub-page">
      <h2>Unlock PDF</h2>
      <p className="sub-page-desc">
        Remove password protection from your PDF. Enter the known password to unlock.
      </p>
      <div className="sub-page-card">
        <ToolCard
          title="Unlock PDF"
          color="#e67e22"
          icon={
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="12" y="22" width="24" height="18" rx="3" fill="white" fillOpacity="0.9"/>
              <path d="M18 22v-5a6 6 0 0112 0" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="24" cy="31" r="2.5" fill="#e67e22"/>
            </svg>
          }
          fields={[
            { name: 'file', type: 'file', accept: '.pdf', required: true },
            { name: 'password', type: 'password', placeholder: 'Known password' },
          ]}
          apiCall={(data) => unlockPdf(data.file, data.password)}
        />
      </div>
    </div>
  );
}
