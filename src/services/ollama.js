/**
 * Ollama AI Service - Local Resume Analysis
 * Requires Ollama to be installed: https://ollama.ai
 */

const OLLAMA_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.1';

/**
 * Check if Ollama is available
 */
export async function checkOllamaAvailability() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    if (response.ok) {
      const data = await response.json();
      return {
        available: true,
        models: data.models?.map(m => m.name) || [],
        hasRecommended: data.models?.some(m => 
          m.name.includes('llama3') || m.name.includes('mistral')
        ) || false
      };
    }
  } catch (error) {
    console.log('Ollama not available:', error.message);
  }
  return { available: false, models: [], hasRecommended: false };
}

/**
 * Send a chat message to Ollama
 */
async function chatWithOllama(messages, model = DEFAULT_MODEL, options = {}) {
  const { stream = false, temperature = 0.3 } = options;
  
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream,
        options: { temperature }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    return data.message?.content || '';
  } catch (error) {
    throw new Error(`Failed to connect to Ollama: ${error.message}`);
  }
}

/**
 * Analyze a resume against a job description
 * @param {string} resumeText - Extracted text from resume
 * @param {string} jobTitle - Target job title
 * @param {string} jobDescription - Job description text
 * @param {string} companyName - Company name (optional)
 * @returns {Promise<AnalysisResult>}
 */
export async function analyzeResume(resumeText, jobTitle, jobDescription, companyName = '') {
  const systemPrompt = `You are an expert ATS (Applicant Tracking System) and career advisor.
Your role is to analyze resumes and provide detailed, constructive feedback.
Be thorough but fair. Highlight both strengths and areas for improvement.
Score each section from 0-100.`;

  const userPrompt = `Analyze this resume for the following job position:

${companyName ? `**Company:** ${companyName}` : ''}
**Job Title:** ${jobTitle}
**Job Description:** 
${jobDescription || 'No job description provided. Evaluate based on general standards for this role.'}

**Resume Text:**
${resumeText}

Provide your analysis in this EXACT JSON format (no additional text, no markdown):
{
  "overallScore": number (0-100),
  "ats": {
    "score": number (0-100),
    "tips": [
      {"type": "good"|"improve", "tip": "specific actionable feedback"}
    ]
  },
  "toneAndStyle": {
    "score": number (0-100),
    "tips": [
      {"type": "good"|"improve", "tip": "specific actionable feedback"}
    ]
  },
  "content": {
    "score": number (0-100),
    "tips": [
      {"type": "good"|"improve", "tip": "specific actionable feedback"}
    ]
  },
  "structure": {
    "score": number (0-100),
    "tips": [
      {"type": "good"|"improve", "tip": "specific actionable feedback"}
    ]
  },
  "skills": {
    "score": number (0-100),
    "tips": [
      {"type": "good"|"improve", "tip": "specific actionable feedback"}
    ],
    "matchedSkills": ["list", "of", "matched", "skills"],
    "missingSkills": ["list", "of", "missing", "skills"]
  },
  "summary": "brief 2-3 sentence overall assessment",
  "recommendation": "clear recommendation on whether to apply and what to improve first"
}

Provide 3-5 tips for each category. Be specific and actionable.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const response = await chatWithOllama(messages, DEFAULT_MODEL, { temperature: 0.3 });
  
  try {
    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    // Return a basic structure if parsing fails
    return {
      overallScore: 50,
      ats: { score: 50, tips: [{ type: 'improve', tip: 'Could not parse resume properly. Please ensure your resume is well-formatted.' }] },
      toneAndStyle: { score: 50, tips: [{ type: 'improve', tip: 'Analysis failed' }] },
      content: { score: 50, tips: [{ type: 'improve', tip: 'Analysis failed' }] },
      structure: { score: 50, tips: [{ type: 'improve', tip: 'Analysis failed' }] },
      skills: { score: 50, tips: [{ type: 'improve', tip: 'Analysis failed' }], matchedSkills: [], missingSkills: [] },
      summary: 'Analysis encountered an error. Please try again.',
      recommendation: 'Please retry the analysis.'
    };
  }
}

/**
 * Generate a quick summary of a resume
 */
export async function summarizeResume(resumeText) {
  const systemPrompt = 'You are a resume expert. Summarize resumes concisely.';
  
  const userPrompt = `Summarize this resume in 2-3 sentences, highlighting the candidate's main strengths and experience level:

${resumeText}

Respond with just the summary, no additional text.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  return chatWithOllama(messages);
}

/**
 * Extract skills from resume
 */
export async function extractSkills(resumeText) {
  const systemPrompt = 'You are a skills extractor. Identify technical and soft skills from resumes.';
  
  const userPrompt = `Extract all skills from this resume. Categorize them as technical or soft skills.

${resumeText}

Respond in JSON format:
{
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"]
}

Respond with just the JSON, no additional text.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const response = await chatWithOllama(messages);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response;
    return JSON.parse(jsonStr);
  } catch (error) {
    return { technicalSkills: [], softSkills: [] };
  }
}
