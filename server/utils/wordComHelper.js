/**
 * wordComHelper.js
 * Persistent Warm Office COM engine (Windows local/VM) +Headless LibreOffice engine (Linux/Docker/Render).
 * Universal, platform-agnostic document conversion.
 */
const { execSync, spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);
const { UPLOAD_DIR, OUTPUT_DIR } = require('./fileHelpers');

const TIMEOUT = 90000; // 90s hard timeout
const IS_WINDOWS = process.platform === 'win32';
const USE_LIBREOFFICE = process.env.OFFICE_ENGINE === 'libreoffice' || !IS_WINDOWS;

/**
 * Configure MS Word & Excel's Trust Center settings in Registry.
 * Mark our uploads and output folders as "Trusted Locations" (bypasses Protected View).
 */
function ensureTrustedLocations() {
  if (!IS_WINDOWS || USE_LIBREOFFICE) return;
  try {
    const pathsToTrust = [
      { name: 'KonvertUploads', path: path.resolve(UPLOAD_DIR) },
      { name: 'KonvertOutput', path: path.resolve(OUTPUT_DIR) }
    ];
    
    const officeVersions = ['16.0', '15.0'];
    const commands = [
      "$ErrorActionPreference = 'SilentlyContinue'"
    ];
    
    pathsToTrust.forEach(item => {
      const safePath = item.path.replace(/\\/g, '\\\\');
      officeVersions.forEach(v => {
        // Word Trusted Locations
        const wordReg = `HKCU:\\SOFTWARE\\Microsoft\\Office\\${v}\\Word\\Security\\Trusted Locations\\${item.name}`;
        commands.push(`if (!(Test-Path -Path '${wordReg}')) { New-Item -Path '${wordReg}' -Force | Out-Null }`);
        commands.push(`Set-ItemProperty -Path '${wordReg}' -Name 'Path' -Value '${safePath}' -Force`);
        commands.push(`Set-ItemProperty -Path '${wordReg}' -Name 'AllowSubfolders' -Value 1 -Type DWord -Force`);
        commands.push(`Set-ItemProperty -Path '${wordReg}' -Name 'Description' -Value 'Konvert App Folder' -Force`);

        // Excel Trusted Locations
        const excelReg = `HKCU:\\SOFTWARE\\Microsoft\\Office\\${v}\\Excel\\Security\\Trusted Locations\\${item.name}`;
        commands.push(`if (!(Test-Path -Path '${excelReg}')) { New-Item -Path '${excelReg}' -Force | Out-Null }`);
        commands.push(`Set-ItemProperty -Path '${excelReg}' -Name 'Path' -Value '${safePath}' -Force`);
        commands.push(`Set-ItemProperty -Path '${excelReg}' -Name 'AllowSubfolders' -Value 1 -Type DWord -Force`);
        commands.push(`Set-ItemProperty -Path '${excelReg}' -Name 'Description' -Value 'Konvert App Folder' -Force`);
      });
    });
    
    const psScript = commands.join('; ');
    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psScript}"`, { windowsHide: true });
    console.log('[OfficeCOM] Configured uploads and output folders in Word & Excel Trust Center Settings.');
  } catch (err) {
    console.warn('[OfficeCOM] Failed to register Trusted Locations in Office:', err.message);
  }
}

/**
 * Run a PowerShell command via spawn and return a promise (Windows COM fallback).
 */
function runPsCommand(psCommand) {
  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-Command', psCommand,
    ], {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('Office conversion timed out after 90s'));
    }, TIMEOUT);

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0 && stdout.includes('OK')) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Office conversion failed (code ${code}): ${stderr || stdout}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/**
 * Headless LibreOffice conversion wrapper (Linux/Docker/Render).
 */
async function libreOfficeConvert(inputPath, outputPath) {
  const absInput = path.resolve(inputPath);
  const absOutputDir = path.dirname(path.resolve(outputPath));
  const filename = path.basename(absInput);

  // If it is an Excel file (.xlsx), run our python gridline enabler first!
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.xlsx') {
    try {
      const pythonCmd = IS_WINDOWS ? 'python' : 'python3';
      const pyScript = path.resolve(__dirname, 'enable_gridlines.py');
      await execPromise(`"${pythonCmd}" "${pyScript}" "${absInput}"`);
      console.log('[Office] Successfully enabled Calc gridlines inside spreadsheet.');
    } catch (err) {
      console.warn('[Office] Failed to enable Calc gridlines:', err.message);
    }
  }

  // Command to invoke headless LibreOffice
  // Runs perfectly on Render, AWS Linux, and Docker containers
  const cmd = `libreoffice --headless --convert-to pdf --outdir "${absOutputDir}" "${absInput}"`;

  try {
    await execPromise(cmd);

    // LibreOffice names output files automatically based on input file base name
    const inputExt = path.extname(filename);
    const defaultOutName = filename.replace(inputExt, '.pdf');
    const defaultOutPath = path.join(absOutputDir, defaultOutName);

    if (fs.existsSync(defaultOutPath)) {
      if (path.resolve(defaultOutPath) !== path.resolve(outputPath)) {
        fs.renameSync(defaultOutPath, outputPath);
      }
      return 'OK';
    } else {
      throw new Error(`Output PDF file was not created by LibreOffice at: ${defaultOutPath}`);
    }
  } catch (err) {
    throw new Error(`LibreOffice conversion failed: ${err.message}`);
  }
}

/**
 * Convert Word (.docx) -> PDF.
 * Uses Word COM on Windows and headless LibreOffice on Linux (Render/Docker).
 */
async function wordToPdfConvert(inputPath, outputPath) {
  if (USE_LIBREOFFICE) {
    console.log('[Office] Using Linux headless LibreOffice for Word to PDF conversion.');
    return libreOfficeConvert(inputPath, outputPath);
  }

  const absInput = path.resolve(inputPath).replace(/"/g, '`"');
  const absOutput = path.resolve(outputPath).replace(/"/g, '`"');

  const psCommand = [
    '$ErrorActionPreference = "Stop"',
    `Unblock-File -Path "${absInput}"`,
    'try {',
    '  $word = [System.Runtime.InteropServices.Marshal]::GetActiveObject("Word.Application")',
    '} catch {',
    '  $word = New-Object -ComObject Word.Application',
    '  $word.Visible = $false',
    '}',
    '$word.DisplayAlerts = 0',
    `$doc = $word.Documents.Open("${absInput}")`,
    `$doc.SaveAs([ref] "${absOutput}", [ref] 17)`,
    '$doc.Close($false)',
    'Write-Output "OK"',
  ].join('; ');

  return runPsCommand(psCommand);
}

/**
 * Convert Excel (.xlsx, .xls, .csv) -> PDF.
 * Uses Excel COM on Windows (fits to 1 page + forces gridlines) and headless LibreOffice on Linux.
 */
async function excelToPdfConvert(inputPath, outputPath) {
  if (USE_LIBREOFFICE) {
    console.log('[Office] Using Linux headless LibreOffice for Excel to PDF conversion.');
    return libreOfficeConvert(inputPath, outputPath);
  }

  const absInput = path.resolve(inputPath).replace(/"/g, '`"');
  const absOutput = path.resolve(outputPath).replace(/"/g, '`"');

  const psCommand = [
    '$ErrorActionPreference = "Stop"',
    `Unblock-File -Path "${absInput}"`,
    'try {',
    '  $excel = [System.Runtime.InteropServices.Marshal]::GetActiveObject("Excel.Application")',
    '} catch {',
    '  $excel = New-Object -ComObject Excel.Application',
    '  $excel.Visible = $false',
    '}',
    '$excel.DisplayAlerts = $false',
    `$wb = $excel.Workbooks.Open("${absInput}", $false, $true)`,
    '$wb.Worksheets | ForEach-Object { $_.PageSetup.PrintGridlines = $true }',
    '$wb.Worksheets | ForEach-Object { $_.PageSetup.Zoom = $false; $_.PageSetup.FitToPagesWide = 1; $_.PageSetup.FitToPagesTall = 1 }',
    `$wb.ExportAsFixedFormat(0, "${absOutput}")`,
    '$wb.Close($false)',
    'Write-Output "OK"',
  ].join('; ');

  return runPsCommand(psCommand);
}

/**
 * Convert PDF -> Word (.docx) using Python's pdf2docx engine.
 * Fully compatible with both Windows and Linux (Render/Docker) platforms.
 */
async function pdfToWordConvert(inputPath, outputPath) {
  const absInput = path.resolve(inputPath);
  const absOutput = path.resolve(outputPath);

  return new Promise((resolve, reject) => {
    // Detect python executable name (python3 on Linux, python on Windows)
    const pythonCmd = IS_WINDOWS ? 'python' : 'python3';
    const pyCommand = `from pdf2docx import Converter; cv = Converter(r"${absInput}"); cv.convert(r"${absOutput}"); cv.close()`;
    
    const child = spawn(pythonCmd, ['-c', pyCommand], {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('PDF to Word conversion timed out after 90s'));
    }, TIMEOUT);

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve('OK');
      } else {
        reject(new Error(`PDF to Word conversion failed (code ${code}): ${stderr || stdout}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/**
 * Pre-warm Word & Excel by starting them in the background.
 */
function preWarmWord() {
  if (USE_LIBREOFFICE) {
    console.log('[Office] Headless Linux mode active. Background COM pre-warming bypassed.');
    return;
  }

  ensureTrustedLocations();

  // Pre-warm Word COM
  const wordPs = [
    'try {',
    '  $word = [System.Runtime.InteropServices.Marshal]::GetActiveObject("Word.Application")',
    '} catch {',
    '  $word = New-Object -ComObject Word.Application',
    '  $word.Visible = $false',
    '  $word.DisplayAlerts = 0',
    '}',
  ].join('; ');

  const wordChild = spawn('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy', 'Bypass',
    '-Command', wordPs,
  ], {
    stdio: 'ignore',
    windowsHide: true,
    detached: true,
  });
  wordChild.unref();

  // Pre-warm Excel COM
  const excelPs = [
    'try {',
    '  $excel = [System.Runtime.InteropServices.Marshal]::GetActiveObject("Excel.Application")',
    '} catch {',
    '  $excel = New-Object -ComObject Excel.Application',
    '  $excel.Visible = $false',
    '  $excel.DisplayAlerts = $false',
    '}',
  ].join('; ');

  const excelChild = spawn('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy', 'Bypass',
    '-Command', excelPs,
  ], {
    stdio: 'ignore',
    windowsHide: true,
    detached: true,
  });
  excelChild.unref();

  console.log('[OfficeCOM] Pre-warming Word & Excel background instances...');
}

/**
 * Quit background Word & Excel instances on server shutdown.
 */
function shutdownWord() {
  if (USE_LIBREOFFICE) return;
  try {
    execSync(
      'powershell -NoProfile -Command "try { $w = [System.Runtime.InteropServices.Marshal]::GetActiveObject(\'Word.Application\'); $w.Quit() } catch {}; try { $e = [System.Runtime.InteropServices.Marshal]::GetActiveObject(\'Excel.Application\'); $e.Quit() } catch {}"',
      { windowsHide: true, timeout: 5000 }
    );
  } catch (e) {
    // Office wasn't running, that's fine
  }
}

module.exports = {
  wordToPdfConvert,
  excelToPdfConvert,
  pdfToWordConvert,
  preWarmWord,
  shutdownWord
};
