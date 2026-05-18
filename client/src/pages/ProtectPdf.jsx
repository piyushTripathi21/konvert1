import ToolCard from '../components/ui/ToolCard';
import { protectPdf } from '../services/api';
import './SubPage.css';

export default function ProtectPdf() {
  return (
    <div className="sub-page">
      <h2>Protect PDF</h2>
      <p className="sub-page-desc">
        Encrypt your PDF with a password to restrict access.
      </p>
      <div className="sub-page-card">
        <ToolCard
          title="Protect PDF"
          color="#e74c3c"
          icon={
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 6L10 12v12c0 8 6 15 14 18 8-3 14-10 14-18V12L24 6z" fill="white" fillOpacity="0.9"/>
              <rect x="19" y="22" width="10" height="8" rx="1.5" fill="#e74c3c"/>
              <path d="M20 22v-3a4 4 0 018 0v3" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          }
          fields={[
            { name: 'file', type: 'file', accept: '.pdf', required: true },
            { name: 'password', type: 'password', placeholder: 'Password', required: true },
          ]}
          apiCall={(data) => protectPdf(data.file, data.password)}
        />
      </div>
    </div>
  );
}
