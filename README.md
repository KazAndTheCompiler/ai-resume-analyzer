# AI Resume Analyzer - Local Edition

A **100% FREE** AI-powered resume analyzer that runs entirely on your machine. No cloud services, no API costs, no subscriptions.

## Features

- 📄 **PDF Parsing**: Extract text from resumes client-side
- 🧠 **AI Analysis**: Local LLM via Ollama for detailed feedback
- 📊 **ATS Scoring**: Get scored on ATS compatibility
- 💡 **Actionable Tips**: Specific improvement suggestions
- 🎯 **Job Matching**: Compare against job descriptions
- 💾 **Local Storage**: All data stored in IndexedDB (private)
- 🎨 **Modern UI**: Beautiful dark theme with Tailwind CSS

## What Gets Analyzed

| Category | Description |
|----------|-------------|
| **ATS Score** | Keyword optimization, formatting, readability |
| **Tone & Style** | Professional language, action verbs, clarity |
| **Content** | Achievements, quantification, relevance |
| **Structure** | Layout, sections, visual hierarchy |
| **Skills** | Matched vs missing skills for the role |

## Tech Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| Frontend | React + Vite + Tailwind | Free |
| PDF Parsing | pdfjs-dist | Free |
| AI Model | Ollama (Llama 3.1) | Free (Local) |
| Storage | IndexedDB | Free (Local) |

## Prerequisites

### 1. Install Ollama

Download from [ollama.ai](https://ollama.ai)

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Pull a model:**
```bash
ollama pull llama3.1
# or
ollama pull mistral
```

### 2. Node.js 18+

Download from [nodejs.org](https://nodejs.org)

## Installation

```bash
cd ai-resume-analyzer-local
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

1. **Start Ollama** (if not running):
   ```bash
   ollama serve
   ```

2. **Open the app** in Chrome/Edge/Firefox

3. **Click "Upload Resume"**

4. **Fill in job details**:
   - Company name (optional)
   - Job title (required)
   - Job description (optional, for better matching)

5. **Upload your resume** (PDF format)

6. **Get instant analysis** with:
   - Overall score
   - Category breakdowns
   - Specific tips for improvement
   - Skills gap analysis

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Edge | ✅ Full |
| Firefox | ✅ Full |
| Safari | ⚠️ Limited |

## Project Structure

```
src/
├── App.jsx              # Main app component
├── services/
│   ├── ollama.js        # AI integration
│   ├── pdfParser.js     # PDF text extraction
│   └── storage.js       # IndexedDB storage
├── main.jsx             # Entry point
└── index.css            # Tailwind styles
```

## How It Works

1. **Upload**: Select a PDF resume file
2. **Parse**: Extract text using pdfjs-dist (client-side)
3. **Analyze**: Send text to local Ollama instance
4. **Store**: Save analysis in IndexedDB
5. **Display**: Show scores and actionable feedback

## Privacy

- ✅ All processing happens locally
- ✅ No data sent to external servers
- ✅ No account required
- ✅ No tracking or analytics

## Troubleshooting

### "Ollama not available"
- Ensure Ollama is running: `ollama serve`
- Check model is installed: `ollama list`
- Verify model exists: `ollama run llama3.1`

### "Could not extract text from PDF"
- Ensure the PDF is not scanned/ image-based
- Try converting to a text-based PDF
- Check if the file is corrupted

### Analysis is slow
- Use a smaller model: `ollama pull mistral:7b`
- Close other applications to free RAM
- Consider shorter job descriptions

## Comparison: Cloud vs Local

| Feature | Cloud Services | This App |
|---------|---------------|----------|
| Cost | $10-30/month | Free |
| Privacy | Data uploaded | 100% local |
| Speed | Fast (API) | Depends on hardware |
| Limits | API rate limits | Unlimited |
| Setup | None | Install Ollama |


[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-orange?style=flat&logo=buy-me-a-coffee)](https://buymeacoffee.com/kazandthecompiler)

## License

MIT - Build your own version, extend it, share it!
