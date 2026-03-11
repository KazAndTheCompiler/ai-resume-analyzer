/**
 * PDF Parser Service - Extract text from PDF files
 * Uses pdfjs-dist for client-side PDF processing
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js';

/**
 * Extract text content from a PDF file
 * @param {File|Blob} file - PDF file to parse
 * @returns {Promise<{text: string, pages: number, metadata: object}>}
 */
export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    const pageTexts = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      pageTexts.push(pageText);
      fullText += pageText + '\n';
    }
    
    const metadata = await pdf.getMetadata();
    
    return {
      text: fullText.trim(),
      pages: pdf.numPages,
      metadata: {
        title: metadata?.info?.Title || '',
        author: metadata?.info?.Author || '',
        subject: metadata?.info?.Subject || '',
        keywords: metadata?.info?.Keywords || '',
        creator: metadata?.info?.Creator || '',
        producer: metadata?.info?.Producer || '',
        creationDate: metadata?.info?.CreationDate || ''
      }
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Validate if a file is a PDF
 * @param {File} file 
 * @returns {boolean}
 */
export function isPDF(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Get PDF file size in KB
 * @param {File} file 
 * @returns {number}
 */
export function getPDFSizeKB(file) {
  return Math.round(file.size / 1024);
}
