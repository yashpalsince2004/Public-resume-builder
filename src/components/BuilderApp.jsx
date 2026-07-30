import { useState, useCallback, useEffect } from 'react';
import defaultProfile from '../assets/profile.json';
import ResumeBuilderScreen1 from './ResumeBuilderScreen1.jsx';
import ResumeBuilderScreen2 from './ResumeBuilderScreen2.jsx';
import RateLimitModal from './RateLimitModal.jsx';
import {
  analyzeJdWithGemini,
  generateTailoredResumeWithGemini,
  evaluateResumeWithGemini,
} from '../engine/geminiKeywordExtractor.js';
import { matchProfile } from '../engine/resumeMatcher.js';

export default function BuilderApp({ initialStep = 0 }) {
  const [currentStep, setCurrentStep] = useState(initialStep); // 0 = Screen 1 (Input), 1 = Screen 2 (Preview/Score)
  const [profile, setProfile] = useState(defaultProfile);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [atsScore, setATSScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState('');
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState('Rate limit exceeded');

  // Sync initial state if navigated via URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/preview') || path.includes('/result')) {
        const cachedJd = localStorage.getItem('app_jd');
        if (cachedJd) {
          setJobDescription(cachedJd);
          handleGenerateResume(cachedJd, profile);
        }
      }
    }
  }, []);

  const handleUpdateProfile = useCallback((updatedProfile) => {
    setProfile(updatedProfile);
  }, []);

  const handleGenerateResume = useCallback(async (jdText = jobDescription, currentProf = profile) => {
    if (!jdText || jdText.trim().length < 10) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem('app_jd', jdText);
    }

    setIsLoading(true);
    setError('');

    try {
      // Step 1: Query Gemini 3.6 Flash to analyze Job Description & requirements
      setLoadingStatus('✨ Extracting keywords & requirements with Gemini 3.6 Flash...');
      const geminiAnalysis = await analyzeJdWithGemini(jdText);
      const { roleTitle, companyInfo, exactRequirements, keywords } = geminiAnalysis;

      // Step 2: Match profile keywords
      const matchReport = matchProfile(keywords, currentProf);

      // Step 3: Ask Gemini 3.6 Flash to generate the ATS-optimized tailored resume
      setLoadingStatus('✨ Gemini 3.6 Flash is tailoring profile summary, experience & projects for higher ATS score...');
      const tailoredResume = await generateTailoredResumeWithGemini(jdText, currentProf, geminiAnalysis);

      // Step 4: Ask Gemini 3.6 Flash to calculate the harsh ATS evaluation score
      setLoadingStatus('✨ Gemini 3.6 Flash is evaluating strict ATS match score & feedback...');
      const harshScore = await evaluateResumeWithGemini(jdText, tailoredResume);

      setAnalysisResult({ roleTitle, companyInfo, exactRequirements, keywords, matchReport });
      setGeneratedResume(tailoredResume);
      setATSScore(harshScore);
      setCurrentStep(1); // Navigate to Screen 2

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Gemini API Error:', err);
      const msg = err.message || '';
      if (
        msg.toLowerCase().includes('quota') ||
        msg.toLowerCase().includes('rate') ||
        msg.toLowerCase().includes('429') ||
        msg.toLowerCase().includes('limit') ||
        msg.toLowerCase().includes('resource_exhausted')
      ) {
        setRateLimitMessage('Rate limit exceeded. Please wait a few moments and try again.');
      } else {
        setRateLimitMessage('Rate limit exceeded');
      }
      setShowRateLimitModal(true);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  }, [jobDescription, profile]);

  const handleBackToEdit = useCallback(() => {
    setCurrentStep(0); // Move back to Screen 1
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="builder-app-wrapper">
      {/* Apple Dark Frosted Navigation Bar */}
      <header className="apple-nav">
        <div className="apple-nav-inner">
          <a href="/" className="apple-brand">
            <span>Resume Builder</span>
          </a>

          <div className="apple-nav-steps">
            <span className={`step-badge ${currentStep === 0 ? 'active' : ''}`}>
              1. Job Description & Details
            </span>
            <span className="step-arrow">→</span>
            <span className={`step-badge ${currentStep === 1 ? 'active' : ''}`}>
              2. Preview & Score
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="builder-main">
        {currentStep === 0 ? (
          <ResumeBuilderScreen1
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            jobDescription={jobDescription}
            onJdChange={setJobDescription}
            onGenerate={() => handleGenerateResume(jobDescription, profile)}
            isLoading={isLoading}
            loadingStatus={loadingStatus}
            error={error}
          />
        ) : (
          <ResumeBuilderScreen2
            resume={generatedResume}
            atsScore={atsScore}
            jobDescription={jobDescription}
            profile={profile}
            matchReport={analysisResult?.matchReport}
            companyInfo={analysisResult?.companyInfo}
            exactRequirements={analysisResult?.exactRequirements}
            onBackToEdit={handleBackToEdit}
          />
        )}
      </main>

      <RateLimitModal
        isOpen={showRateLimitModal}
        onClose={() => setShowRateLimitModal(false)}
        message={rateLimitMessage}
      />

      <style>{`
        .builder-app-wrapper {
          min-height: 100vh;
          background-color: var(--color-canvas-parchment);
        }

        .apple-nav-steps {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--color-body-muted);
        }

        .step-badge {
          padding: 4px 12px;
          border-radius: var(--radius-pill);
          transition: all 0.2s ease;
        }

        .step-badge.active {
          background-color: rgba(41, 151, 255, 0.15);
          color: var(--color-primary-on-dark);
          font-weight: 600;
        }

        .step-arrow {
          font-size: 12px;
          color: var(--color-body-muted);
        }

        @media (max-width: 640px) {
          .apple-nav-steps {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
