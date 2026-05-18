import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header      from './components/layout/Header';
import Footer      from './components/layout/Footer';
import Home        from './pages/Home';
import MergePdf    from './pages/MergePdf';
import PdfToWord   from './pages/PdfToWord';
import SplitPdf    from './pages/SplitPdf';
import CompressPdf from './pages/CompressPdf';
import RotatePdf   from './pages/RotatePdf';
import WatermarkPdf from './pages/WatermarkPdf';
import PageNumbers from './pages/PageNumbers';
import ProtectPdf  from './pages/ProtectPdf';
import UnlockPdf   from './pages/UnlockPdf';
import ImagesToPdf from './pages/ImagesToPdf';
import Reorder     from './pages/Reorder';
import Extract     from './pages/Extract';
import Metadata    from './pages/Metadata';
import PdfToImages from './pages/PdfToImages';
import PdfEditor   from './pages/PdfEditor';
import AiSummarizer from './pages/AiSummarizer';
import AiTranslator from './pages/AiTranslator';
import ImageEditor  from './pages/ImageEditor';
import WordToPdf   from './pages/WordToPdf';
import ExcelToPdf  from './pages/ExcelToPdf';

export default function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/merge"         element={<MergePdf />} />
          <Route path="/pdf-to-word"   element={<PdfToWord />} />
          <Route path="/word-to-pdf"   element={<WordToPdf />} />
          <Route path="/excel-to-pdf"   element={<ExcelToPdf />} />
          <Route path="/split"         element={<SplitPdf />} />
          <Route path="/compress"      element={<CompressPdf />} />
          <Route path="/rotate"        element={<RotatePdf />} />
          <Route path="/watermark"     element={<WatermarkPdf />} />
          <Route path="/page-numbers"  element={<PageNumbers />} />
          <Route path="/protect"       element={<ProtectPdf />} />
          <Route path="/unlock"        element={<UnlockPdf />} />
          <Route path="/images-to-pdf" element={<ImagesToPdf />} />
          <Route path="/reorder"       element={<Reorder />} />
          <Route path="/extract"       element={<Extract />} />
          <Route path="/metadata"      element={<Metadata />} />
          <Route path="/pdf-to-images" element={<PdfToImages />} />
          <Route path="/edit-pdf"      element={<PdfEditor />} />
          <Route path="/ai-summarizer" element={<AiSummarizer />} />
          <Route path="/ai-translator"  element={<AiTranslator />} />
          <Route path="/image-editor"  element={<ImageEditor />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
