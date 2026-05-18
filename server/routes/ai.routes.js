const express = require('express');
const router = express.Router();
const { uploadPdf } = require('../middleware/upload');
const aiCtrl = require('../controllers/ai.controller');

// AI-powered PDF operations
router.post('/summarize', uploadPdf('ai_summarize').single('file'), aiCtrl.summarizePdf);
router.post('/translate', uploadPdf('ai_translate').single('file'), aiCtrl.translatePdf);

module.exports = router;
