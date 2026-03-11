import { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Brain, 
  TrendingUp, 
  Briefcase, 
  Building, 
  Trash2,
  Eye,
  Sparkles,
  X,
  ChevronRight,
  Target,
  Award,
  BookOpen,
  Lightbulb,
  RefreshCcw,
  Download
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { checkOllamaAvailability, analyzeResume } from './services/ollama.js';
import { extractTextFromPDF, isPDF } from './services/pdfParser.js';
import { saveResume, getAllResumes, deleteResume, getResume } from './services/storage.js';

/**
 * Score Badge Component
 */
function ScoreBadge({ score, size = 'md' }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  const sizeClasses = size === 'lg' ? 'w-20 h-20 text-3xl' : 'w-12 h-12 text-lg';
  
  return (
    <div className={`${color} ${sizeClasses} rounded-full flex items-center justify-center font-bold text-white`}>
      {score}
    </div>
  );
}

/**
 * Score Gauge Component
 */
function ScoreGauge({ score, label, icon: Icon }) {
  const percentage = score;
  const color = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500';
  const bgColor = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-300">
          {Icon && <Icon className="w-5 h-5" />}
          <span className="font-medium">{label}</span>
        </div>
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${bgColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Tips List Component
 */
function TipsList({ tips }) {
  if (!tips || tips.length === 0) return null;
  
  return (
    <div className="space-y-2">
      {tips.map((tip, index) => (
        <div 
          key={index}
          className={`flex items-start gap-3 p-3 rounded-lg ${
            tip.type === 'good' 
              ? 'bg-emerald-500/10 border border-emerald-500/30' 
              : 'bg-amber-500/10 border border-amber-500/30'
          }`}
        >
          {tip.type === 'good' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          )}
          <span className={tip.type === 'good' ? 'text-emerald-200' : 'text-amber-200'}>
            {tip.tip}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Resume Card Component
 */
function ResumeCard({ resume, onView, onDelete }) {
  const feedback = resume.analysis;
  
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{resume.jobTitle}</h3>
            <p className="text-slate-400">{resume.companyName || 'No company specified'}</p>
          </div>
        </div>
        <ScoreBadge score={feedback?.overallScore || 0} />
      </div>
      
      <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
        <span className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          {resume.pages} pages
        </span>
        <span>•</span>
        <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
      </div>
      
      {feedback?.summary && (
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{feedback.summary}</p>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={() => onView(resume.id)}
          className="flex-1 py-2 bg-sky-500/20 text-sky-400 rounded-lg font-medium hover:bg-sky-500/30 transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Analysis
        </button>
        <button
          onClick={() => onDelete(resume.id)}
          className="py-2 px-4 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Home Screen - List all resumes
 */
function HomeScreen({ onUpload, onViewResume }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResumes();
  }, []);

  async function loadResumes() {
    setLoading(true);
    try {
      const allResumes = await getAllResumes();
      setResumes(allResumes);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    await deleteResume(id);
    loadResumes();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3 rounded-full">
          <Brain className="w-8 h-8 text-white" />
          <h1 className="text-3xl font-bold text-white">AI Resume Analyzer</h1>
        </div>
        <p className="text-slate-400 text-lg">
          Get ATS scores and personalized feedback using local AI
        </p>
      </div>

      {/* Upload CTA */}
      <div className="bg-gradient-to-r from-sky-500/10 to-violet-500/10 border border-sky-500/30 rounded-xl p-8 text-center">
        <Upload className="w-12 h-12 text-sky-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Analyze Your Resume</h2>
        <p className="text-slate-400 mb-6">
          Upload your resume and get detailed feedback tailored to your target job
        </p>
        <button
          onClick={onUpload}
          className="px-8 py-3 bg-gradient-to-r from-sky-500 to-violet-500 text-white rounded-lg font-semibold hover:from-sky-400 hover:to-violet-400 transition-all inline-flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Upload Resume
        </button>
      </div>

      {/* Resumes List */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-400" />
          Your Resumes
        </h2>
        
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            Loading resumes...
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No resumes yet. Upload your first resume to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onView={(id) => onViewResume(id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Upload Screen - Upload and analyze resume
 */
function UploadScreen({ onComplete, onBack }) {
  const [file, setFile] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState(null);

  useEffect(() => {
    checkOllamaAvailability().then(setOllamaStatus);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError(null);
      }
    }
  });

  async function handleAnalyze() {
    if (!file) return;
    if (!jobTitle.trim()) {
      setError('Please enter a job title');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Step 1: Extract text from PDF
      setStatusText('Extracting text from PDF...');
      const pdfData = await extractTextFromPDF(file);
      
      if (!pdfData.text || pdfData.text.length < 50) {
        throw new Error('Could not extract enough text from the PDF. Please ensure it\'s a valid resume.');
      }

      // Step 2: Analyze with AI
      setStatusText('Analyzing resume with AI...');
      const analysis = await analyzeResume(
        pdfData.text,
        jobTitle,
        jobDescription,
        companyName
      );

      // Step 3: Save resume
      setStatusText('Saving analysis...');
      const resumeData = {
        fileName: file.name,
        fileSize: file.size,
        companyName,
        jobTitle,
        jobDescription,
        pages: pdfData.pages,
        metadata: pdfData.metadata,
        extractedText: pdfData.text,
        analysis
      };

      const saved = await saveResume(resumeData);
      
      onComplete(saved.id);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Analysis failed. Please try again.');
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white">
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <h1 className="text-2xl font-bold text-white">Upload Resume</h1>
      </div>

      {!ollamaStatus?.available && (
        <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 text-amber-200">
          <AlertCircle className="w-5 h-5 inline mr-2" />
          <strong>Ollama Required:</strong> Install from{' '}
          <a href="https://ollama.ai" target="_blank" className="underline hover:text-amber-100">
            ollama.ai
          </a>{' '}
          and run: <code className="bg-amber-500/30 px-2 py-1 rounded">ollama run llama3.1</code>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          <AlertCircle className="w-5 h-5 inline mr-2" />
          {error}
        </div>
      )}

      {isAnalyzing ? (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700 text-center space-y-6">
          <Sparkles className="w-12 h-12 text-violet-400 mx-auto animate-pulse" />
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Analyzing Your Resume</h2>
            <p className="text-slate-400">{statusText}</p>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-500 to-violet-500 animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 space-y-6">
          {/* Job Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 font-medium mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Company Name (optional)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Google, Microsoft, Apple"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Job Title *
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Frontend Developer"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Job Description (optional)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here for more targeted feedback..."
                rows={6}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 resize-none"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-slate-300 font-medium mb-2">
              <Upload className="w-4 h-4 inline mr-2" />
              Upload Resume (PDF) *
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-sky-500 bg-sky-500/10'
                  : file
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-center gap-3 text-emerald-400">
                  <CheckCircle className="w-8 h-8" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-slate-400">{Math.round(file.size / 1024)} KB</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-300 mb-2">
                    {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume, or click to browse'}
                  </p>
                  <p className="text-slate-500 text-sm">PDF format only</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onBack}
              className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!file || !jobTitle.trim() || !ollamaStatus?.available}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                file && jobTitle.trim() && ollamaStatus?.available
                  ? 'bg-gradient-to-r from-sky-500 to-violet-500 text-white hover:from-sky-400 hover:to-violet-400'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Analyze Resume
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Analysis Screen - View detailed analysis
 */
function AnalysisScreen({ resumeId, onBack }) {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResume();
  }, [resumeId]);

  async function loadResume() {
    setLoading(true);
    try {
      const data = await getResume(resumeId);
      setResume(data);
    } catch (error) {
      console.error('Failed to load resume:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !resume) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12 text-slate-400">
        Loading analysis...
      </div>
    );
  }

  const analysis = resume.analysis;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white">
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{resume.jobTitle}</h1>
          <p className="text-slate-400">{resume.companyName || 'No company specified'}</p>
        </div>
        <ScoreBadge score={analysis.overallScore} size="lg" />
      </div>

      {/* Summary */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          Overall Assessment
        </h2>
        <p className="text-slate-300 leading-relaxed mb-4">{analysis.summary}</p>
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-violet-400 font-medium">Recommendation: </span>
              <span className="text-violet-200">{analysis.recommendation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ScoreGauge score={analysis.ats.score} label="ATS Score" icon={Target} />
        <ScoreGauge score={analysis.toneAndStyle.score} label="Tone & Style" icon={Award} />
        <ScoreGauge score={analysis.content.score} label="Content" icon={FileText} />
        <ScoreGauge score={analysis.structure.score} label="Structure" icon={TrendingUp} />
        <ScoreGauge score={analysis.skills.score} label="Skills" icon={Brain} />
      </div>

      {/* Detailed Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ATS Feedback */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-400" />
            ATS Optimization
          </h3>
          <TipsList tips={analysis.ats.tips} />
        </div>

        {/* Tone & Style */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            Tone & Style
          </h3>
          <TipsList tips={analysis.toneAndStyle.tips} />
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            Content Quality
          </h3>
          <TipsList tips={analysis.content.tips} />
        </div>

        {/* Structure */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Structure & Format
          </h3>
          <TipsList tips={analysis.structure.tips} />
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-pink-400" />
          Skills Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.skills.matchedSkills?.length > 0 && (
            <div>
              <h4 className="text-emerald-400 font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Matched Skills ({analysis.skills.matchedSkills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.skills.matchedSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {analysis.skills.missingSkills?.length > 0 && (
            <div>
              <h4 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Missing Skills ({analysis.skills.missingSkills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.skills.missingSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-4">
          <TipsList tips={analysis.skills.tips} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

/**
 * Main App Component
 */
export default function App() {
  const [screen, setScreen] = useState('home');
  const [selectedResumeId, setSelectedResumeId] = useState(null);

  function handleUploadComplete(resumeId) {
    setSelectedResumeId(resumeId);
    setScreen('analysis');
  }

  function handleViewResume(id) {
    setSelectedResumeId(id);
    setScreen('analysis');
  }

  function handleBackToHome() {
    setSelectedResumeId(null);
    setScreen('home');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-violet-900 p-6">
      {screen === 'home' && (
        <HomeScreen 
          onUpload={() => setScreen('upload')} 
          onViewResume={handleViewResume}
        />
      )}
      {screen === 'upload' && (
        <UploadScreen 
          onComplete={handleUploadComplete}
          onBack={handleBackToHome}
        />
      )}
      {screen === 'analysis' && (
        <AnalysisScreen 
          resumeId={selectedResumeId}
          onBack={handleBackToHome}
        />
      )}
    </div>
  );
}
