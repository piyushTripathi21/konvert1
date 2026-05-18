const express = require('express');
const router = express.Router();
const { uploadPdf, uploadImages, uploadWord, uploadExcel } = require('../middleware/upload');
const ctrl = require('../controllers/pdf.controller');

// PDF operations (single file)
router.post('/merge', uploadPdf('merge').array('files', 50), ctrl.mergePdfs);
router.post('/split', uploadPdf('split').single('file'), ctrl.splitPdf);
router.post('/compress', uploadPdf('compress').single('file'), ctrl.compressPdf);
router.post('/rotate', uploadPdf('rotate').single('file'), ctrl.rotatePdf);
router.post('/watermark', uploadPdf('watermark').single('file'), ctrl.watermarkPdf);
router.post('/paginate', uploadPdf('paginate').single('file'), ctrl.paginatePdf);
router.post('/protect', uploadPdf('protect').single('file'), ctrl.protectPdf);
router.post('/unlock', uploadPdf('unlock').single('file'), ctrl.unlockPdf);
router.post('/images-to-pdf', uploadImages('images_to_pdf').array('images', 100), ctrl.imagesToPdf);
router.post('/pdf-to-images', uploadPdf('pdf_to_images').single('file'), ctrl.pdfToImages);
router.post('/pdf-to-word', uploadPdf('pdf_to_word').single('file'), ctrl.pdfToWord);
router.post('/word-to-pdf', uploadWord('word_to_pdf').single('file'), ctrl.wordToPdf);
router.post('/excel-to-pdf', uploadExcel('excel_to_pdf').single('file'), ctrl.excelToPdf);
router.post('/reorder', uploadPdf('reorder').single('file'), ctrl.reorderPages);
router.post('/extract', uploadPdf('extract').single('file'), ctrl.extractItems);
router.post('/metadata', uploadPdf('metadata').single('file'), ctrl.editMetadata);

// Delete uploaded file
router.delete('/delete/:storageName', ctrl.deleteFile);

module.exports = router;
