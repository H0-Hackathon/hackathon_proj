import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Radio, ArrowRight, Check, AlertTriangle, Database, Filter, Star, RefreshCw } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { TradeGlobe } from '../components/TradeGlobe';
import { StatusPill } from '../components/common/StatusPill';
import { PALETTE } from '../styles/palette';
import { MOTION } from '../motion/tokens';

// ─── Synthetic demo data ────────────────────────────────────────────────────
// Never show real customer data on a public, unauthenticated page — this is
// a fixed, made-up supply chain used purely to drive the hero globe's motion.
const DEMO_HQ = { name: 'Distribution HQ', country: 'United States', latitude: 34.0522, longitude: -118.2437 };
const DEMO_SUPPLIERS = [
  { name: 'Pacific Components Ltd.', country: 'Taiwan', countryCode: 'TW', latitude: 23.6978, longitude: 120.9605, reliabilityScore: 88 },
  { name: 'Origin Textiles Co.', country: 'Vietnam', countryCode: 'VN', latitude: 14.0583, longitude: 108.2772, reliabilityScore: 81 },
  { name: 'Andes Metals Group', country: 'Chile', countryCode: 'CL', latitude: -35.6751, longitude: -71.5430, reliabilityScore: 90 },
  { name: 'Nordic Components AB', country: 'Sweden', countryCode: 'SE', latitude: 60.1282, longitude: 18.6435, reliabilityScore: 93 },
];
const DEMO_DISRUPTIONS = [{
  incident_id: 'demo-1',
  title: 'Port Congestion — Haiphong, Vietnam',
  location_name: 'Haiphong, Vietnam',
  latitude: 20.8449,
  longitude: 106.6881,
  severity: 'high',
  countries_affected: ['Vietnam'],
}];

const STATS = [
  { value: '25,000+', label: 'Verified global suppliers' },
  { value: '12', label: 'Sourcing regions monitored' },
  { value: '5', label: 'AI agents working for you' },
  { value: '24/7', label: 'Real-time disruption monitoring' },
];

const FEATURES: Array<{
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
}> = [
  {
    eyebrow: 'Visibility',
    title: 'Know which suppliers are actually at risk',
    body: 'When a tariff hits Vietnam or a port backs up in the Red Sea, you don’t need to read the news to find out if it matters to you. Your dashboard shows exactly which of your suppliers are exposed — and which ones are fine — the moment it happens.',
    bullets: ['Live map of every supplier you depend on', 'Disruptions pinned to the exact country they hit', 'Healthy vs. at-risk, at a glance — no digging'],
  },
  {
    eyebrow: 'Automation',
    title: 'An AI team that reads the news so you don’t have to',
    body: 'Five specialized agents run every time something changes in global trade — watching for tariffs, sizing up the financial hit, checking compliance, and double-checking their own work before anything reaches you.',
    bullets: [],
  },
  {
    eyebrow: 'Resilience',
    title: 'Already know your next supplier, before you need one',
    body: 'If a supplier goes down, you shouldn’t be starting your search from zero. Suppliance keeps a directory of 25,000+ verified suppliers ready, so a backup option is already sitting in front of you.',
    bullets: ['Searchable by region, category, and country', 'Reliability scores on every alternative', 'Built from your own product categories at signup'],
  },
];

// Option A visual for the Resilience section — a small composed grid of
// capability icons rather than one big centered glyph.
const RESILIENCE_ICONS = [
  { icon: Database, label: '25,000+ verified suppliers in the directory' },
  { icon: Filter, label: 'Filter by region, category, and country' },
  { icon: Star, label: 'Reliability score on every match' },
  { icon: RefreshCw, label: 'Swap in a backup the moment you need one' },
];

const AGENTS = [
  { name: 'Tariff Risk Monitor', desc: 'Scans global trade news and tariff filings for anything that touches your supply chain.' },
  { name: 'Financial Impact Calculator', desc: 'Translates a disruption into an actual dollar number against your import volume.' },
  { name: 'Alternative Supplier Finder', desc: 'Searches the supplier directory for a ready replacement the moment one is needed.' },
  { name: 'Import Compliance Specialist', desc: 'Checks the new situation against compliance and documentation requirements.' },
  { name: 'Risk Challenger', desc: 'Reviews the other four agents’ findings and pushes back before anything reaches you.' },
];

const PLANS = [
  {
    id: 'standard',
    name: 'Standard',
    price: 49,
    yearly: 39,
    tagline: 'Full platform access for importers',
    color: '#548C92',
    features: ['Risk Intelligence Dashboard', 'Disruption Alerts', 'AI Pipeline (5 Agents)', 'Import Compliance Checker', 'Disruption Event Globe', 'Settings & Team Profile'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 149,
    yearly: 119,
    tagline: 'Standard + Global Supplier Panel',
    color: '#84D7D8',
    badge: 'Most Popular',
    features: ['Everything in Standard', 'Global Supplier Panel', 'Alternative Supplier Finder', 'Supplier Reliability Scores', 'Priority Support'],
  },
] as const;

// ─── Scroll-reveal wrapper ──────────────────────────────────────────────────
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; style?: React.CSSProperties }> = ({ children, delay = 0, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      style={style}
      initial={{ opacity: 0, y: prefersReduced ? 0 : 26 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: MOTION.reveal.duration, ease: MOTION.reveal.ease, delay }}
    >
      {children}
    </motion.div>
  );
};

// ─── Shared styles ──────────────────────────────────────────────────────────
const sectionStyle: React.CSSProperties = { maxWidth: 1180, margin: '0 auto', padding: '0 40px' };

const primaryBtn = (big = false): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: big ? '14px 26px' : '10px 18px',
  background: 'linear-gradient(135deg,#548C92,#84D7D8)',
  color: '#0E2025', fontSize: big ? 15.5 : 14, fontWeight: 700,
  border: 'none', borderRadius: 9, cursor: 'pointer',
  fontFamily: 'var(--font)', transition: 'transform 0.18s ease-out, box-shadow 0.18s ease-out',
});

const ghostBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid var(--border-soft)', color: 'var(--foreground)',
  borderRadius: 9, padding: '9px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  fontFamily: 'var(--font)', transition: 'background 0.18s ease-out',
};

// ─── Nav ────────────────────────────────────────────────────────────────────
const NavBar: React.FC<{ onSignIn: () => void }> = ({ onSignIn }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px',
        background: scrolled ? 'rgba(22,50,58,0.86)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--border-soft)' : 'transparent'}`,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      <Logo size={30} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Product</a>
        <a href="#pricing" style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Pricing</a>
        <button onClick={onSignIn} style={ghostBtn}>Sign in</button>
        <button onClick={onSignIn} style={primaryBtn()}>Get started</button>
      </div>
    </div>
  );
};

// ─── Page ───────────────────────────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const goToSignIn = () => navigate('/sign-in');

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--foreground)', overflowX: 'hidden' }}>
      <NavBar onSignIn={goToSignIn} />

      {/* ── Hero ── */}
      <section style={{ ...sectionStyle, minHeight: '92vh', display: 'flex', alignItems: 'center', gap: 56, flexWrap: 'wrap', paddingTop: 120, paddingBottom: 60 }}>
        <motion.div
          style={{ flex: '1 1 440px', minWidth: 320 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION.hero.duration, ease: MOTION.hero.ease }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(132,215,216,0.1)', border: '1px solid rgba(132,215,216,0.25)',
            borderRadius: 20, padding: '5px 12px', fontSize: 12, fontWeight: 600,
            color: 'var(--seafoam)', marginBottom: 22,
          }}>
            <Radio size={11} /> Live trade risk monitoring
          </div>
          <h1 style={{ fontSize: 'clamp(34px, 4.6vw, 54px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
            See the disruption<br />before it hits your<br />supply chain.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text-secondary)', maxWidth: 460, margin: '0 0 32px' }}>
            Suppliance watches tariffs, sanctions, and shipping disruptions in real time, and tells you exactly which of your suppliers are at risk &mdash; before it shows up in the news.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <button onClick={goToSignIn} style={primaryBtn(true)}>
              Get started free <ArrowRight size={16} />
            </button>
            <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: 14.5, fontWeight: 600, textDecoration: 'none' }}>
              See how it works &rarr;
            </a>
          </div>
        </motion.div>

        <motion.div
          style={{ flex: '1 1 420px', minWidth: 300, maxWidth: 480 }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: MOTION.hero.duration, ease: MOTION.hero.ease, delay: 0.15 }}
        >
          <div style={{
            height: 420, borderRadius: 20, overflow: 'hidden', position: 'relative',
            background: 'radial-gradient(circle at 30% 30%, rgba(84,140,146,0.18), rgba(22,50,58,0.6))',
            border: '1px solid var(--border-soft)', boxShadow: '0 24px 70px rgba(0,0,0,0.4)',
          }}>
            <TradeGlobe
              suppliers={DEMO_SUPPLIERS}
              disruptions={DEMO_DISRUPTIONS}
              hqLocation={DEMO_HQ}
              autoRotateEnabled
              compact
            />
          </div>
        </motion.div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ ...sectionStyle, padding: '40px 40px 80px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24,
          borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)',
          padding: '36px 0',
        }}>
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * MOTION.stagger}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--seafoam)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Feature 1: visibility ── */}
      <section id="features" style={{ ...sectionStyle, padding: '40px 40px 100px' }}>
        <FeatureRow feature={FEATURES[0]} reverse={false} visual={<SupplierStatusCard />} />
      </section>

      {/* ── Feature 2: the 5 agents ── */}
      <section style={{ ...sectionStyle, padding: '0 40px 100px' }}>
        <div style={{ display: 'flex', gap: 56, alignItems: 'center', flexWrap: 'wrap' }}>
          <Reveal style={{ flex: '1 1 360px', minWidth: 300 }}>
            <div style={{
              background: 'rgba(22,50,58,0.55)', border: '1px solid var(--border-soft)',
              borderRadius: 16, padding: 28,
            }}>
              {AGENTS.map((a, i) => (
                <AgentRow key={a.name} agent={a} index={i} />
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1} style={{ flex: '1 1 380px', minWidth: 300 }}>
            <Eyebrow>{FEATURES[1].eyebrow}</Eyebrow>
            <h2 style={titleStyle}>{FEATURES[1].title}</h2>
            <p style={bodyStyle}>{FEATURES[1].body}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Feature 3: alternatives ── */}
      <section style={{ ...sectionStyle, padding: '0 40px 110px' }}>
        <FeatureRow feature={FEATURES[2]} reverse visual={<AlternativesIconCluster />} />
      </section>

      {/* ── Pricing teaser ── */}
      <section id="pricing" style={{ ...sectionStyle, padding: '0 40px 120px' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <Eyebrow center>Pricing</Eyebrow>
            <h2 style={{ ...titleStyle, fontSize: 32 }}>Simple plans, no surprises</h2>
          </div>
        </Reveal>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {PLANS.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.12} style={{ flex: '0 1 320px', minWidth: 280 }}>
              <div style={{
                position: 'relative', height: '100%',
                background: 'rgba(22,50,58,0.55)',
                border: `1px solid ${plan.badge ? plan.color + '55' : 'var(--border-soft)'}`,
                borderRadius: 16, padding: '28px 26px',
              }}>
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: `linear-gradient(135deg,#548C92,#84D7D8)`, color: '#0E2025',
                    fontSize: 10, fontWeight: 800, padding: '3px 14px', borderRadius: 100,
                    letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  {plan.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>{plan.tagline}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 38, fontWeight: 800, color: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }}>${plan.price}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/mo</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 22 }}>or ${plan.yearly}/mo billed yearly</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)' }}>
                      <Check size={13} color={plan.color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={goToSignIn}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font)', fontSize: 14, fontWeight: 700, color: '#0E2025',
                    background: plan.badge ? 'linear-gradient(135deg,#548C92,#84D7D8)' : 'rgba(84,140,146,0.25)',
                  }}
                >
                  Get {plan.name}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ ...sectionStyle, padding: '0 40px 110px', textAlign: 'center' }}>
        <Reveal>
          <h2 style={{ fontSize: 'clamp(28px, 3.6vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 18px' }}>
            Stop finding out about disruptions from the news.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: '0 0 30px' }}>
            Set up your supply chain profile in a couple of minutes and let Suppliance watch the rest.
          </p>
          <button onClick={goToSignIn} style={primaryBtn(true)}>
            Get started free <ArrowRight size={16} />
          </button>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border-soft)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <Logo size={24} />
        <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          &copy; {new Date().getFullYear()} Suppliance. Trade risk intelligence for importers.
        </div>
        <button onClick={goToSignIn} style={{ ...ghostBtn, padding: '7px 14px', fontSize: 13 }}>Sign in</button>
      </footer>
    </div>
  );
};

// ─── Shared sub-pieces ──────────────────────────────────────────────────────
const titleStyle: React.CSSProperties = { fontSize: 28, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.25, margin: '0 0 16px' };
const bodyStyle: React.CSSProperties = { fontSize: 15.5, lineHeight: 1.7, color: 'var(--text-secondary)', margin: '0 0 18px', maxWidth: 460 };

const Eyebrow: React.FC<{ children: React.ReactNode; center?: boolean }> = ({ children, center }) => (
  <div style={{
    fontSize: 12.5, fontWeight: 700, color: 'var(--seafoam)', textTransform: 'uppercase',
    letterSpacing: '0.1em', marginBottom: 10, textAlign: center ? 'center' : 'left',
  }}>
    {children}
  </div>
);

const FeatureRow: React.FC<{ feature: typeof FEATURES[number]; reverse: boolean; visual: React.ReactNode }> = ({ feature, reverse, visual }) => {
  return (
    <div style={{ display: 'flex', gap: 56, alignItems: 'center', flexWrap: 'wrap', flexDirection: reverse ? 'row-reverse' : 'row' }}>
      <Reveal style={{ flex: '1 1 380px', minWidth: 300 }}>
        <Eyebrow>{feature.eyebrow}</Eyebrow>
        <h2 style={titleStyle}>{feature.title}</h2>
        <p style={bodyStyle}>{feature.body}</p>
        {feature.bullets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {feature.bullets.map((b) => (
              <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 14.5, color: 'var(--text-secondary)' }}>
                <Check size={15} color="var(--seafoam)" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
                {b}
              </div>
            ))}
          </div>
        )}
      </Reveal>
      <Reveal delay={0.1} style={{ flex: '1 1 340px', minWidth: 280 }}>
        {visual}
      </Reveal>
    </div>
  );
};

// ─── Feature 1 visual (Option B) — a live-looking recreation of the real
// dashboard's supplier status, using the same StatusPill component and the
// same demo data driving the hero globe, so it isn't a generic stock graphic. ───
const SupplierStatusCard: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const event = DEMO_DISRUPTIONS[0];
  const affected = new Set(event.countries_affected.map((c) => c.toUpperCase()));

  return (
    <div
      ref={ref}
      style={{
        borderRadius: 16, border: '1px solid var(--border-soft)',
        background: 'rgba(22,50,58,0.55)', padding: 22, boxShadow: '0 16px 44px rgba(0,0,0,0.22)',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%', background: 'var(--seafoam)',
          boxShadow: '0 0 6px var(--seafoam)', animation: 'pulse-dot 1.6s ease-in-out infinite',
        }} />
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Live supplier status
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: MOTION.reveal.ease }}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 10,
          background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.22)',
        }}
      >
        <AlertTriangle size={14} color={PALETTE.critical} style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: PALETTE.critical }}>{event.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Affects {event.countries_affected.join(', ')}
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {DEMO_SUPPLIERS.map((s, i) => {
          const atRisk = affected.has(s.country.toUpperCase());
          return (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.15 + i * MOTION.stagger, ease: MOTION.reveal.ease }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                padding: '9px 11px', borderRadius: 9,
                background: 'rgba(232,226,216,0.03)', border: '1px solid rgba(232,226,216,0.06)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{s.country}</div>
              </div>
              <StatusPill tone={atRisk ? 'critical' : 'safe'} dot pulse={atRisk}>
                {atRisk ? 'At Risk' : 'Healthy'}
              </StatusPill>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Feature 3 visual (Option A) — a composed grid of capability icons,
// each with its own label, instead of one oversized centered glyph. ───────────
const AlternativesIconCluster: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <div
      ref={ref}
      style={{
        borderRadius: 16, border: '1px solid var(--border-soft)',
        background: 'rgba(22,50,58,0.5)', padding: 22, boxShadow: '0 16px 44px rgba(0,0,0,0.22)',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
      }}
    >
      {RESILIENCE_ICONS.map(({ icon: Icon, label }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: i * MOTION.stagger, ease: MOTION.reveal.ease }}
          style={{
            display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 14px', borderRadius: 12,
            background: 'rgba(132,215,216,0.05)', border: '1px solid rgba(132,215,216,0.12)',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(132,215,216,0.12)', flexShrink: 0,
          }}>
            <Icon size={16} color="var(--seafoam)" />
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {label}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const AgentRow: React.FC<{ agent: typeof AGENTS[number]; index: number }> = ({ agent, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -14 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.18, ease: MOTION.reveal.ease }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 4px',
        borderBottom: index < AGENTS.length - 1 ? '1px solid var(--border-soft)' : 'none',
      }}
    >
      <motion.span
        initial={{ scale: 0.6, opacity: 0.4 }}
        animate={inView ? { scale: [0.6, 1.15, 1], opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: index * 0.18 + 0.15 }}
        style={{
          width: 9, height: 9, borderRadius: '50%', background: 'var(--seafoam)',
          boxShadow: '0 0 8px var(--seafoam)', flexShrink: 0, marginTop: 5,
        }}
      />
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>{agent.name}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{agent.desc}</div>
      </div>
    </motion.div>
  );
};

export default LandingPage;
