import React from 'react';

/**
 * RateLimitModal Component — Apple Design System
 *
 * Conforms 100% to DESIGN-apple.md & global.css design tokens:
 * - SF Pro Display 600 headlines with negative letter-spacing (-0.28px)
 * - SF Pro Text 17px body copy at 1.47 line height (-0.374px tracking)
 * - Single Action Blue (#0071e3) primary CTA with {rounded.pill} (9999px)
 * - Active press micro-interaction transform: scale(0.95)
 * - Frosted glass backdrop-filter: blur(20px) saturate(180%)
 * - Card radius {rounded.lg} (18px) with hairline border
 */
export default function RateLimitModal({ isOpen, onClose, message = 'Rate limit exceeded. Please wait a few moments and try again.' }) {
  if (!isOpen) return null;

  return (
    <div className="apple-rate-limit-overlay" onClick={onClose}>
      <div className="apple-rate-limit-card" onClick={(e) => e.stopPropagation()}>
        <div className="apple-rate-limit-icon-chip">
          <svg className="apple-rate-limit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="apple-rate-limit-title">Rate Limit Exceeded</h3>
        <p className="apple-rate-limit-body">{message}</p>
        <button type="button" className="apple-rate-limit-cta" onClick={onClose}>
          Okay
        </button>
      </div>

      <style>{`
        .apple-rate-limit-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: appleModalFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .apple-rate-limit-card {
          background-color: var(--color-surface-tile-2, #222228);
          border: 1px solid var(--color-hairline, rgba(255, 255, 255, 0.12));
          border-radius: var(--radius-lg, 18px);
          padding: 32px 36px;
          max-width: 420px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);
          animation: appleModalScaleUp 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .apple-rate-limit-icon-chip {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-full, 9999px);
          background: rgba(255, 69, 58, 0.12);
          border: 1px solid rgba(255, 69, 58, 0.28);
          color: #ff453a;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px auto;
        }

        .apple-rate-limit-icon {
          width: 26px;
          height: 26px;
        }

        .apple-rate-limit-title {
          font-family: var(--font-display, "SF Pro Display", system-ui, -apple-system, sans-serif);
          font-size: 21px;
          font-weight: 600;
          line-height: 1.19;
          letter-spacing: -0.28px;
          color: var(--color-ink, #ffffff);
          margin-bottom: 10px;
        }

        .apple-rate-limit-body {
          font-family: var(--font-text, "SF Pro Text", system-ui, -apple-system, sans-serif);
          font-size: 15px;
          font-weight: 400;
          line-height: 1.47;
          letter-spacing: -0.374px;
          color: var(--color-body-muted, #98989d);
          margin-bottom: 24px;
        }

        .apple-rate-limit-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          background-color: var(--color-primary, #0071e3);
          color: #ffffff;
          font-family: var(--font-text, "SF Pro Text", system-ui, -apple-system, sans-serif);
          font-size: 17px;
          font-weight: 400;
          line-height: 1.47;
          letter-spacing: -0.374px;
          border-radius: var(--radius-pill, 9999px);
          padding: 11px 24px;
          border: none;
          cursor: pointer;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .apple-rate-limit-cta:hover {
          background-color: #0077ed;
        }

        .apple-rate-limit-cta:active {
          transform: scale(0.95);
        }

        .apple-rate-limit-cta:focus-visible {
          outline: 2px solid var(--color-primary-focus, #2997ff);
          outline-offset: 2px;
        }

        @keyframes appleModalScaleUp {
          from {
            opacity: 0;
            transform: scale(0.94);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes appleModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
