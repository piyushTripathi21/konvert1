import ToolCard from '../components/ui/ToolCard';
import { pdfToWord } from '../services/api';
import './SubPage.css';

export default function PdfToWord() {
  return (
    <div className="sub-page">
      <h2>PDF to Word</h2>
      <p className="sub-page-desc">
        Convert your PDF to an editable Word document containing text and images.
      </p>
      <div className="sub-page-card">
        <ToolCard
          title="PDF to Word"
          color="#005a9c"
          icon={
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M26 8v32l-14 4V4l14 4z" fill="white" fillOpacity="0.8"/>
              <path d="M26 12h12v24H26" stroke="white" strokeOpacity="0.8" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M12 18l3 12h2l2-7 2 7h2l3-12h-2l-2 9-2-7h-2l-2 7-2-9h-2z" fill="white"/>
            </svg>
          }
          fields={[
            { name: 'file', type: 'file', accept: '.pdf', required: true },
          ]}
          apiCall={(data) => pdfToWord(data.file)}
        />
      </div>
    </div>
  );
}
