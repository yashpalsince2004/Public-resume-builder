import { useState, useCallback, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import ResumeBuilderScreen1 from '../ResumeBuilderScreen1.jsx';
import ResumeBuilderScreen2 from '../ResumeBuilderScreen2.jsx';
import RateLimitModal from '../RateLimitModal.jsx';
import {
  analyzeJdWithGemini,
  generateTailoredResumeWithGemini,
  evaluateResumeWithGemini,
} from '../../engine/geminiKeywordExtractor.js';
import { matchProfile } from '../../engine/resumeMatcher.js';

export default function TailorWorkflow() {
  const { profile, updateProfile, credits, deductCredits, refundCredits, addApplication, addToast, CREDIT_COSTS } = useApp();
  const [step, setStep] = useState(0);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [atsScore, setATSScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState('');
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState('');

  const requiredCredits = CREDIT_COSTS.resume_tailoring || 3;

  const handleGenerate = useCallback(async () => {
    if (!jobDescription || jobDescription.trim().length < 10) {
      addToast('Please paste a complete job description.', 'warning');
      return;
    }

    if (credits < requiredCredits) {
      addToast(`Insufficient credits! You need ${requiredCredits} credits to tailor a resume.`, 'error');
      return;
    }

    // Deduct credits before starting
    const costResult = await deductCredits(requiredCredits, 'resume_tailoring');
    if (!costResult.success) {
      addToast('Failed to deduct credits.', 'error');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      setLoadingStatus('✨ Analyzing Job Description requirements & extracting key skills...');
      const geminiAnalysis = await analyzeJdWithGemini(jobDescription);
      const matchReport = matchProfile(geminiAnalysis.keywords, profile);

      setLoadingStatus('✨ Tailoring profile summary, work experience, and project evidence...');
      const tailoredResume = await generateTailoredResumeWithGemini(jobDescription, profile, geminiAnalysis);

      setLoadingStatus('✨ Evaluating ATS match score & generating improvement recommendations...');
      const harshScore = await evaluateResumeWithGemini(jobDescription, tailoredResume);

      setAnalysisResult({
        roleTitle: geminiAnalysis.roleTitle,
        companyInfo: geminiAnalysis.companyInfo,
        exactRequirements: geminiAnalysis.exactRequirements,
        keywords: geminiAnalysis.keywords,
        matchReport,
      });
      setGeneratedResume(tailoredResume);
      setATSScore(harshScore);

      // Track application
      addApplication({
        company: geminiAnalysis.companyInfo?.name || 'Target Company',
        role: geminiAnalysis.roleTitle || 'Target Role',
        jobDescription,
        atsScore: harshScore?.overall || 85,
        status: 'tailored',
        tailoredResume,
      });

      setStep(1);
      addToast('Resume tailored successfully!', 'success');
    } catch (err) {
      console.error('Tailoring error:', err);
      // Refund credits on failure
      await refundCredits(requiredCredits, 'resume_tailoring');
      addToast('Generation failed. Your credits have been refunded.', 'error');

      const msg = err.message || '';
      if (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate') || msg.toLowerCase().includes('429')) {
        setRateLimitMessage('AI rate limit reached. Please wait a moment and try again.');
        setShowRateLimitModal(true);
      } else {
        setError(msg || 'An error occurred while tailoring your resume.');
      }
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  }, [jobDescription, profile, credits, requiredCredits, deductCredits, refundCredits, addApplication, addToast]);

  return (
    <div className="tailor-workflow-container">
      {step === 0 ? (
        <ResumeBuilderScreen1
          profile={profile}
          onUpdateProfile={updateProfile}
          jobDescription={jobDescription}
          onJdChange={setJobDescription}
          onGenerate={handleGenerate}
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
          onBackToEdit={() => setStep(0)}
        />
      )}

      <RateLimitModal
        isOpen={showRateLimitModal}
        onClose={() => setShowRateLimitModal(false)}
        message={rateLimitMessage}
      />
    </div>
  );
}
