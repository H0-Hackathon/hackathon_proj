import React, { useRef, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';

interface FeedEvent {
  id: string;
  time: string;
  category: 'tariff' | 'sanctions' | 'customs' | 'supplier' | 'disruption';
  message: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  impact?: string;
}

const CATEGORY_COLORS: Record<FeedEvent['category'], string> = {
  tariff:     '#f59e0b',
  sanctions:  '#dc2626',
  customs:    '#14b8a6',
  supplier:   '#10b981',
  disruption: '#ea580c',
};

const CATEGORY_LABELS: Record<FeedEvent['category'], string> = {
  tariff:     'TARIFF',
  sanctions:  'SANCTIONS',
  customs:    'CUSTOMS',
  supplier:   'SUPPLIER',
  disruption: 'DISRUPTION',
};

const MOCK_EVENTS: FeedEvent[] = [
  { id: '1',  time: '14:32', category: 'tariff',     severity: 'critical', impact: '+$40K',  message: 'US imposes 25% tariff on HS 6109.10 Vietnamese textiles — effective immediately' },
  { id: '2',  time: '14:31', category: 'disruption', severity: 'high',     impact: '$28K',   message: 'Mekong Textiles Co factory suspension — 3-week production halt confirmed' },
  { id: '3',  time: '14:29', category: 'customs',    severity: 'medium',   impact: '+7 days', message: 'CBP enhanced scrutiny on Vietnamese origin textiles — expect clearance delays' },
  { id: '4',  time: '14:27', category: 'sanctions',  severity: 'low',                        message: 'OFAC watchlist updated — no direct CoastGuard supplier matches found' },
  { id: '5',  time: '14:25', category: 'supplier',   severity: 'medium',   impact: '$12K',   message: 'Dhaka Garments capacity at 94% — redistribution recommended within 10 days' },
  { id: '6',  time: '14:23', category: 'tariff',     severity: 'low',      impact: '-18%',   message: 'USMCA preferential rate verified for HS 6109.10 via Mexico origin — $0 duty' },
  { id: '7',  time: '14:20', category: 'customs',    severity: 'low',                        message: 'Bangladesh GSP renewal approved — duty-free access extended through 2026' },
  { id: '8',  time: '14:18', category: 'disruption', severity: 'medium',   impact: '$9K',    message: 'Section 301 review expanded to include HS chapter 62 apparel — monitor closely' },
  { id: '9',  time: '14:15', category: 'supplier',   severity: 'low',                        message: 'MexiThread Guadalajara — production capacity confirmed at 18,000 units/month' },
  { id: '10', time: '14:12', category: 'tariff',     severity: 'high',     impact: '+$22K',  message: 'EU anti-dumping duty on synthetic fibres HS 5402 — affecting 3 suppliers' },
  { id: '11', time: '14:09', category: 'sanctions',  severity: 'medium',                     message: 'New Xinjiang supply chain traceability requirement — audit documentation needed' },
  { id: '12', time: '14:05', category: 'customs',    severity: 'low',                        message: 'India FTA tariff preference extended — HS 5205 cotton yarn duty reduced to 0%' },
];

export const EventFeed: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = 0;
  }, []);

  return (
    <div style={{
      background: 'rgba(10,10,12,0.97)',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <BarChart2 size={10} color="#f59e0b" />
        <span style={{
          fontSize: 9.5, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'rgba(180,165,120,0.65)',
        }}>
          Global Trade Intelligence Feed
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#dc2626',
            boxShadow: '0 0 5px #dc262650',
            animation: 'pulse-dot 1s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 9, color: '#fca5a5', fontWeight: 700, letterSpacing: '0.06em' }}>LIVE</span>
          <span style={{ fontSize: 9, color: 'rgba(110,100,75,0.6)', marginLeft: 4 }}>
            {MOCK_EVENTS.length} events
          </span>
        </div>
      </div>

      {/* Horizontally scrollable event row */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          alignItems: 'center',
          scrollbarWidth: 'none',
          padding: '0 4px',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 0,
          height: '100%',
        }}>
          {MOCK_EVENTS.map((event, i) => {
            const catColor = CATEGORY_COLORS[event.category];
            const severityDot =
              event.severity === 'critical' ? '#dc2626' :
              event.severity === 'high'     ? '#ea580c' :
              event.severity === 'medium'   ? '#d97706' : 'rgba(100,90,70,0.4)';
            const impactPositive = event.impact?.startsWith('+');

            return (
              <React.Fragment key={event.id}>
                {i > 0 && (
                  <div style={{
                    width: 1, height: 18,
                    background: 'rgba(255,255,255,0.05)',
                    flexShrink: 0,
                    margin: '0 16px',
                  }} />
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  flexShrink: 0,
                  maxWidth: 400,
                  padding: '2px 0',
                }}>
                  {/* Time */}
                  <span style={{
                    fontSize: 9,
                    color: 'rgba(110,100,75,0.65)',
                    fontFamily: 'JetBrains Mono, monospace',
                    flexShrink: 0,
                    letterSpacing: '0.02em',
                  }}>
                    {event.time}
                  </span>

                  {/* Category tag */}
                  <span style={{
                    fontSize: 8.5, fontWeight: 700, letterSpacing: '0.06em',
                    color: catColor,
                    background: `${catColor}10`,
                    border: `1px solid ${catColor}25`,
                    borderRadius: 3,
                    padding: '1.5px 5px',
                    flexShrink: 0,
                  }}>
                    {CATEGORY_LABELS[event.category]}
                  </span>

                  {/* Severity dot */}
                  {event.severity && event.severity !== 'low' && (
                    <div style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: severityDot,
                      boxShadow: `0 0 4px ${severityDot}`,
                      flexShrink: 0,
                    }} />
                  )}

                  {/* Message */}
                  <span style={{
                    fontSize: 11,
                    color: 'rgba(210,200,175,0.88)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    letterSpacing: '-0.1px',
                  }}>
                    {event.message}
                  </span>

                  {/* Impact badge */}
                  {event.impact && (
                    <span style={{
                      fontSize: 9.5, fontWeight: 700,
                      color: impactPositive ? '#fca5a5' : '#6ee7b7',
                      fontFamily: 'JetBrains Mono, monospace',
                      flexShrink: 0,
                      background: impactPositive ? 'rgba(220,38,38,0.08)' : 'rgba(16,185,129,0.08)',
                      border: `1px solid ${impactPositive ? 'rgba(220,38,38,0.18)' : 'rgba(16,185,129,0.18)'}`,
                      borderRadius: 3,
                      padding: '1.5px 6px',
                      letterSpacing: '0.02em',
                    }}>
                      {event.impact}
                    </span>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
