const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UPLOAD_DIR, filenameForStorage } = require('../utils/fileHelpers');

/**
 * Create a multer storage engine for a specific subdirectory under uploads/
 */
function createStorage(subdir = '') {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const targetDir = subdir ? path.join(UPLOAD_DIR, subdir) : UPLOAD_DIR;
      fs.mkdirSync(targetDir, { recursive: true });
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const storageName = filenameForStorage(file.originalname);
      cb(null, storageName);
    },
  });
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_PDF_EXTS = ['.pdf'];
const ALLOWED_IMG_EXTS = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'];

function pdfFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_PDF_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
}

function imgFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_IMG_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, BMP, TIFF, WebP) are allowed'), false);
  }
}

function wordFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.docx'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only Word files (.docx) are allowed'), false);
  }
}

function excelFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.xlsx', '.xls', '.csv'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xlsx, .xls, .csv) are allowed'), false);
  }
}

// Pre-configured upload instances for common use cases
const uploadPdf = (subdir) =>
  multer({
    storage: createStorage(subdir),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: pdfFilter,
  });

const uploadImages = (subdir) =>
  multer({
    storage: createStorage(subdir),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: imgFilter,
  });

const uploadWord = (subdir) =>
  multer({
    storage: createStorage(subdir),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: wordFilter,
  });

const uploadExcel = (subdir) =>
  multer({
    storage: createStorage(subdir),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: excelFilter,
  });

const uploadAny = (subdir) =>
  multer({
    storage: createStorage(subdir),
    limits: { fileSize: MAX_FILE_SIZE },
  });

module.exports = {
  uploadPdf,
  uploadImages,
  uploadWord,
  uploadExcel,
  uploadAny,
  MAX_FILE_SIZE,
};
