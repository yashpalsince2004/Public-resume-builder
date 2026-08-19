import { useApp } from '../../context/AppContext.jsx';
import { Card, Badge } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';

const PLANS = [
  {
    id: 'free',
    name: 'Free Starter',
    credits: '10 credits / month',
    price: '$0',
    features: ['10 Free monthly credits', 'AI Resume Tailoring (3 credits)', 'Cover Letter Generation (2 credits)', 'Unlimited Job Scans (0 credits)', 'LaTeX & PDF Export'],
    isCurrent: true,
  },
  {
    id: 'pro',
    name: 'Pro Career',
    credits: '500 credits / month',
    price: '$19 / mo',
    features: ['500 Monthly credits', 'AI Resume Tailoring', 'Cover Letter Generator', 'LinkedIn Profile Optimizer', 'Priority AI processing', 'Unlimited PDF/DOCX exports'],
    popular: true,
  },
  {
    id: 'power',
    name: 'Power Job Hunter',
    credits: '1,500 credits / month',
    price: '$39 / mo',
    features: ['1,500 Monthly credits', 'Everything in Pro', 'Unlimited AI Tailoring', 'Executive Cover Letters', 'Custom Prompts & Tone', 'Dedicated support'],
  },
];

export default function CreditsPage() {
  const { credits, creditHistory, CREDIT_COSTS, addToast } = useApp();

  return (
    <div className="credits-container">
      <div className="credits-header">
        <h1 className="credits-title">Plans & Credits</h1>
        <p className="credits-subtitle">Track your credit wallet, view transparent action costs, and manage your plan.</p>
      </div>

      {/* Current Balance Card */}
      <Card style={{ marginBottom: 'var(--ds-space-6)', background: 'var(--ds-surface-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--ds-space-4)' }}>
          <div>
            <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Balance</span>
            <div style={{ fontSize: 'var(--ds-text-3xl)', fontWeight: 700, color: 'var(--ds-accent-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✦</span>
              <span>{credits} Credits</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--ds-space-6)', fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)' }}>
            <div><strong style={{ color: 'var(--ds-text-primary)', display: 'block', fontSize: 'var(--ds-text-sm)' }}>{CREDIT_COSTS.resume_tailoring}</strong> Tailoring</div>
            <div><strong style={{ color: 'var(--ds-text-primary)', display: 'block', fontSize: 'var(--ds-text-sm)' }}>{CREDIT_COSTS.cover_letter}</strong> Cover Letter</div>
            <div><strong style={{ color: 'var(--ds-text-primary)', display: 'block', fontSize: 'var(--ds-text-sm)' }}>{CREDIT_COSTS.linkedin_optimization}</strong> LinkedIn</div>
            <div><strong style={{ color: 'var(--ds-text-primary)', display: 'block', fontSize: 'var(--ds-text-sm)' }}>0</strong> Job Scan</div>
          </div>
        </div>
      </Card>

      {/* Plans */}
      <h2 style={{ fontSize: 'var(--ds-text-lg)', fontWeight: 600, margin: '0 0 var(--ds-space-4)' }}>Available Plans</h2>
      <div className="plans-grid" style={{ marginBottom: 'var(--ds-space-8)' }}>
        {PLANS.map((plan) => (
          <Card key={plan.id} style={{ border: plan.popular ? '1px solid var(--ds-accent)' : undefined, position: 'relative' }}>
            {plan.popular && (
              <div style={{ position: 'absolute', top: '-10px', right: '16px' }}>
                <Badge variant="accent">MOST POPULAR</Badge>
              </div>
            )}
            <h3 style={{ fontSize: 'var(--ds-text-md)', margin: '0 0 4px' }}>{plan.name}</h3>
            <div style={{ fontSize: 'var(--ds-text-2xl)', fontWeight: 700, color: 'var(--ds-text-primary)', margin: 'var(--ds-space-2) 0' }}>{plan.price}</div>
            <div style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-accent-text)', marginBottom: 'var(--ds-space-4)' }}>{plan.credits}</div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--ds-space-6) 0', fontSize: 'var(--ds-text-xs)', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--ds-text-secondary)' }}>
              {plan.features.map((f, i) => (
                <li key={i}>✓ {f}</li>
              ))}
            </ul>

            <Button
              variant={plan.isCurrent ? 'secondary' : plan.popular ? 'primary' : 'secondary'}
              fullWidth
              disabled={plan.isCurrent}
              onClick={() => addToast(`Subscribed to ${plan.name}!`, 'success')}
            >
              {plan.isCurrent ? 'Current Plan' : 'Upgrade Plan'}
            </Button>
          </Card>
        ))}
      </div>

      {/* Credit Usage History Ledger */}
      <Card>
        <h2 style={{ fontSize: 'var(--ds-text-md)', fontWeight: 600, margin: '0 0 var(--ds-space-4)' }}>Usage History Ledger</h2>
        {creditHistory.length === 0 ? (
          <div style={{ padding: 'var(--ds-space-6) 0', textAlign: 'center', color: 'var(--ds-text-muted)', fontSize: 'var(--ds-text-sm)' }}>
            No credit transactions recorded yet.
          </div>
        ) : (
          <div className="ledger-table" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {creditHistory.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--ds-surface-secondary)', borderRadius: 'var(--ds-radius-sm)', fontSize: 'var(--ds-text-xs)' }}>
                <div>
                  <span style={{ fontWeight: 500, color: 'var(--ds-text-primary)', textTransform: 'capitalize' }}>{item.type.replace(/_/g, ' ')}</span>
                  <span style={{ color: 'var(--ds-text-muted)', marginLeft: '12px' }}>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ color: item.amount < 0 ? 'var(--ds-error)' : 'var(--ds-success)', fontWeight: 600 }}>
                  {item.amount > 0 ? `+${item.amount}` : item.amount} credits
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <style>{`
        .credits-container { max-width: 1100px; }
        .credits-header { margin-bottom: var(--ds-space-6); }
        .credits-title { font-size: var(--ds-text-2xl); font-weight: 700; color: var(--ds-text-primary); margin: 0; }
        .credits-subtitle { font-size: var(--ds-text-sm); color: var(--ds-text-muted); margin: 4px 0 0; }
        .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--ds-space-4); }
        @media (max-width: 768px) { .plans-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
