import React from 'react';
import { Play, Clock } from 'lucide-react';

/**
 * DemoPage — Coming Soon placeholder.
 *
 * Phase 3: This page will stream the 5-agent tariff alert autoplay
 * scenario via WebSocket, showing Chain-of-Thought reasoning and
 * the adversarial debate in real time.
 *
 * The backend demo WebSocket endpoint (/api/v2/demo/ws) is already
 * scaffolded and ready to connect.
 */
export const DemoPage: React.FC = () => {
  return (
    <main className="page-with-sidebar">
      <div
        style={{
          maxWidth: 560,
          margin: '80px auto',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <Play size={32} style={{ color: '#1E3A5F' }} />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1E3A5F', marginBottom: 12 }}>
          Demo Coming in Phase 3
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 32 }}>
          The live demo will stream a real-time tariff alert scenario over WebSocket,
          showing all 5 agents reasoning step-by-step: TariffMonitor → ImpactCalculator →
          AlternativesFinder → ImportCompliance → Adversarial.
        </p>

        {/* Timeline teaser */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '20px 24px',
            textAlign: 'left',
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#64748B',
              marginBottom: 14,
            }}
          >
            Demo Scenario — Vietnamese Textile Tariff Crisis
          </p>

          {[
            { t: 'T+0s',  label: 'Normal monitoring — supply chain clear' },
            { t: 'T+5s',  label: 'TariffMonitor: 25% tariff detected on HS 6109.10 from Vietnam' },
            { t: 'T+8s',  label: 'ImpactCalculator: $10,000 extra cost on $40k order' },
            { t: 'T+20s', label: 'AlternativesFinder: 2 backup suppliers identified' },
            { t: 'T+32s', label: 'ImportCompliance: docs required per alternative' },
            { t: 'T+40s', label: 'Adversarial: challenges both recommendations' },
            { t: 'T+52s', label: 'Final recommendation — awaiting your decision' },
          ].map(({ t, label }) => (
            <div
              key={t}
              style={{
                display: 'flex',
                gap: 12,
                marginBottom: 10,
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  color: '#F59E0B',
                  fontWeight: 700,
                  minWidth: 44,
                  marginTop: 1,
                }}
              >
                {t}
              </span>
              <span style={{ fontSize: 12, color: '#1A202C' }}>{label}</span>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 20, fontSize: 12, color: '#94A3B8' }}>
          <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Backend WebSocket endpoint scaffolded and ready at{' '}
          <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            /api/v2/demo/ws
          </code>
        </p>
      </div>
    </main>
  );
};
