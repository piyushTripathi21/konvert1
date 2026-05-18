const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const fs = require('fs');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model fallback chain — try each in order if rate-limited
const MODEL_CHAIN = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

/**
 * Try generating content with fallback models and retry logic.
 */
async function generateWithRetry(prompt, maxRetries = 2) {
  let lastError;
  for (const modelName of MODEL_CHAIN) {
    const model = genAI.getGenerativeModel({ model: modelName });
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[AI] Trying ${modelName} (attempt ${attempt + 1})...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(`[AI] Success with ${modelName}`);
        return text;
      } catch (err) {
        lastError = err;
        const msg = err.message || '';
        const isRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
        const isNotFound = msg.includes('404') || msg.includes('not found');

        if (isNotFound) {
          console.log(`[AI] ${modelName} not available, trying next model...`);
          break; // Skip to next model
        }
        if (isRateLimit && attempt < maxRetries) {
          const waitMs = (attempt + 1) * 3000;
          console.log(`[AI] Rate limited on ${modelName}, waiting ${waitMs}ms...`);
          await new Promise(r => setTimeout(r, waitMs));
          continue;
        }
        if (isRateLimit) {
          console.log(`[AI] ${modelName} exhausted, trying next model...`);
          break;
        }
        // Non-recoverable error
        throw err;
      }
    }
  }
  throw lastError || new Error('QUOTA_EXHAUSTED');
}

/**
 * POST /api/ai/summarize
 * Upload a PDF → extract text → send to Gemini → return summary as JSON.
 */
async function summarizePdf(req, res, next) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Upload a PDF.' });

    // Extract text from PDF
    const pdfBytes = fs.readFileSync(file.path);
    let textContent = '';
    try {
      const data = await pdfParse(pdfBytes);
      textContent = data.text || '';
    } catch {
      return res.status(400).json({ error: 'Could not read text from this PDF.' });
    }

    if (!textContent.trim()) {
      return res.status(400).json({ error: 'No readable text found in this PDF. It may be a scanned/image PDF.' });
    }

    // Truncate to ~30,000 chars to stay within token limits
    const maxChars = 30000;
    const truncated = textContent.length > maxChars
      ? textContent.substring(0, maxChars) + '\n\n[... text truncated due to length ...]'
      : textContent;

    const prompt = `You are an expert document summarizer. Analyze the following PDF text and provide a comprehensive, well-structured summary.

Your summary should:
- Start with a one-line "TL;DR" overview
- Include key points organized with bullet points
- Highlight important data, dates, names, and figures
- Be concise but thorough (aim for 300-500 words)
- Use clear headings and formatting with markdown

Here is the PDF text:

---
${truncated}
---

Provide the summary now:`;

    const summary = await generateWithRetry(prompt);

    // Cleanup uploaded file
    try { fs.unlinkSync(file.path); } catch {}

    res.json({
      success: true,
      summary,
      originalLength: textContent.length,
      truncated: textContent.length > maxChars,
    });
  } catch (err) {
    // Cleanup on error
    if (req.file) try { fs.unlinkSync(req.file.path); } catch {}

    if (err.message === 'QUOTA_EXHAUSTED') {
      return res.status(429).json({ error: 'AI quota temporarily exceeded. Please wait 1-2 minutes and try again.' });
    }
    if (err.message?.includes('API_KEY') || err.message?.includes('401')) {
      return res.status(500).json({ error: 'Invalid or missing Gemini API key. Check your .env file.' });
    }
    console.error('[AI Summarize Error]', err.message);
    next(err);
  }
}

/**
 * POST /api/ai/translate
 * Upload a PDF → extract text → translate via Gemini → return translated text as JSON.
 */
async function translatePdf(req, res, next) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Upload a PDF.' });

    const targetLanguage = req.body.language || 'Hindi';

    // Extract text from PDF
    const pdfBytes = fs.readFileSync(file.path);
    let textContent = '';
    try {
      const data = await pdfParse(pdfBytes);
      textContent = data.text || '';
    } catch {
      return res.status(400).json({ error: 'Could not read text from this PDF.' });
    }

    if (!textContent.trim()) {
      return res.status(400).json({ error: 'No readable text found in this PDF. It may be a scanned/image PDF.' });
    }

    // Truncate to ~25,000 chars (translations are longer, so keep input shorter)
    const maxChars = 25000;
    const truncated = textContent.length > maxChars
      ? textContent.substring(0, maxChars) + '\n\n[... text truncated due to length ...]'
      : textContent;

    const prompt = `You are a professional translator. Translate the following text into ${targetLanguage}.

Rules:
- Maintain the original formatting and structure as much as possible
- Keep proper nouns, brand names, and technical terms in their original form (with translation in parentheses if needed)
- Ensure the translation is natural and fluent, not word-by-word
- Preserve paragraph breaks
- If there are headings or bullet points, keep that structure

Text to translate:

---
${truncated}
---

Provide only the ${targetLanguage} translation:`;

    const translation = await generateWithRetry(prompt);

    // Cleanup uploaded file
    try { fs.unlinkSync(file.path); } catch {}

    res.json({
      success: true,
      translation,
      language: targetLanguage,
      originalLength: textContent.length,
      truncated: textContent.length > maxChars,
    });
  } catch (err) {
    // Cleanup on error
    if (req.file) try { fs.unlinkSync(req.file.path); } catch {}

    if (err.message === 'QUOTA_EXHAUSTED') {
      return res.status(429).json({ error: 'AI quota temporarily exceeded. Please wait 1-2 minutes and try again.' });
    }
    if (err.message?.includes('API_KEY') || err.message?.includes('401')) {
      return res.status(500).json({ error: 'Invalid or missing Gemini API key. Check your .env file.' });
    }
    console.error('[AI Translate Error]', err.message);
    next(err);
  }
}

module.exports = { summarizePdf, translatePdf };
