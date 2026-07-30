/**
 * Step Navigation Component
 *
 * Displays a horizontal step indicator with glassmorphism styling,
 * animated progress bar, and clickable past steps.
 */
export default function Navigation({ steps, currentStep, onStepClick }) {
  const progressPercent = ((currentStep) / (steps.length - 1)) * 100;

  return (
    <nav className="nav-container" aria-label="Builder progress">
      <div className="nav-inner">
        {/* Logo */}
        <div className="nav-logo">
          <span className="nav-logo-icon">◆</span>
          <span className="nav-logo-text">ResumeATS</span>
        </div>

        {/* Steps */}
        <div className="nav-steps">
          {/* Progress track */}
          <div className="nav-progress-track">
            <div
              className="nav-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="nav-step-indicators">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isComplete = index < currentStep;
              const isClickable = index < currentStep;

              return (
                <button
                  key={index}
                  className={`nav-step ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  aria-current={isActive ? 'step' : undefined}
                  title={step.label}
                >
                  <span className="nav-step-circle">
                    {isComplete ? '✓' : (
                      <span className="nav-step-number">{index + 1}</span>
                    )}
                  </span>
                  <span className="nav-step-label">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .nav-container {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(7, 7, 14, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-glass);
          padding: var(--space-md) var(--space-lg);
        }

        .nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: var(--space-xl);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          flex-shrink: 0;
        }

        .nav-logo-icon {
          font-size: 1.5rem;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-logo-text {
          font-size: 1.125rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-steps {
          flex: 1;
          position: relative;
          max-width: 600px;
          margin: 0 auto;
        }

        .nav-progress-track {
          position: absolute;
          top: 50%;
          left: 40px;
          right: 40px;
          height: 3px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 2px;
          transform: translateY(-50%);
          z-index: 0;
        }

        .nav-progress-fill {
          height: 100%;
          background: var(--gradient-primary);
          border-radius: 2px;
          transition: width var(--transition-slow);
        }

        .nav-step-indicators {
          display: flex;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .nav-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
          background: none;
          border: none;
          cursor: default;
          padding: 0;
          font-family: var(--font-body);
        }

        .nav-step:not(:disabled) {
          cursor: pointer;
        }

        .nav-step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8125rem;
          font-weight: 600;
          background: var(--bg-secondary);
          border: 2px solid var(--border-glass);
          color: var(--text-tertiary);
          transition: all var(--transition-base);
        }

        .nav-step.active .nav-step-circle {
          background: var(--gradient-primary);
          border-color: var(--color-primary);
          color: white;
          box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
        }

        .nav-step.complete .nav-step-circle {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }

        .nav-step-number {
          font-variant-numeric: tabular-nums;
        }

        .nav-step-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-tertiary);
          white-space: nowrap;
          transition: color var(--transition-fast);
        }

        .nav-step.active .nav-step-label {
          color: var(--text-primary);
        }

        .nav-step.complete .nav-step-label {
          color: var(--text-secondary);
        }

        @media (max-width: 640px) {
          .nav-step-label {
            display: none;
          }

          .nav-logo-text {
            display: none;
          }

          .nav-inner {
            justify-content: center;
          }
        }
      `}</style>
    </nav>
  );
}
