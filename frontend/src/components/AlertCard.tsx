import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

/**
 * AlertCard — Displays a single tariff alert with severity styling.
 *
 * Phase 1: Static display with hardcoded mock data.
 * Phase 2: Props will be wired to real TariffAlert objects from the API.
 */

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertType = 'tariff_change' | 'port_disruption' | 'geopolitical' | 'shipping_delay';

export interface AlertCardProps {
  id: number;
  alert_type: AlertType;
  severity: AlertSeverity;
  summary: string;
  agent_output?: string;  // JSON string — parsed to show reasoning accordion
  created_at: string;
  onDismiss?: (id: number) => void;
  onResolve?: (id: number) => void;
}

const SEVERITY_BORDER: Record<AlertSeverity, string> = {
  critical: '4px solid #EF4444',
  high:     '4px solid #F97316',
  medium:   '4px solid #F59E0B',
  low:      '4px solid #6B7280',
};

const SEVERITY_BADGE_CLASS: Record<AlertSeverity, string> = {
  critical: 'badge badge-critical',
  high:     'badge badge-high',
  medium:   'badge badge-medium',
  low:      'badge badge-low',
};

const ALERT_TYPE_ICON: Record<AlertType, string> = {
  tariff_change:   '$',
  port_disruption: '⚓',
  geopolitical:    '🌍',
  shipping_delay:  '⏰',
};

const ALERT_TYPE_LABEL: Record<AlertType, string> = {
  tariff_change:   'Tariff Change',
  port_disruption: 'Port Disruption',
  geopolitical:    'Geopolitical Event',
  shipping_delay:  'Shipping Delay',
};

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  id,
  alert_type,
  severity,
  summary,
  agent_output,
  created_at,
  onDismiss,
  onResolve,
}) => {
  const [showReasoning, setShowReasoning] = React.useState(false);

  let parsedOutput: Record<string, unknown> | null = null;
  if (agent_output) {
    try {
      parsedOutput = JSON.parse(agent_output);
    } catch {
      parsedOutput = null;
    }
  }

  return (
    <div
      style={{
        background: 'var(--card)',
        borderRadius: 'var(--radius-md)',
        borderLeft: SEVERITY_BORDER[severity],
        border: '1px solid var(--border)',
        borderLeftWidth: 4,
        padding: '16px 20px',
        marginBottom: 12,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }} title={ALERT_TYPE_LABEL[alert_type]}>
          {ALERT_TYPE_ICON[alert_type]}
        </span>
        <span className={SEVERITY_BADGE_CLASS[severity]}>{severity}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
          {ALERT_TYPE_LABEL[alert_type]}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
          {formatRelativeTime(created_at)}
        </span>
      </div>

      {/* Summary */}
      <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 12, lineHeight: 1.5 }}>
        {summary}
      </p>

      {/* Agent reasoning toggle */}
      {parsedOutput && (
        <div>
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              marginBottom: showReasoning ? 12 : 0,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {showReasoning ? '▲ Hide' : '▼ View'} Agent Reasoning
          </button>

          {showReasoning && (
            <AgentReasoningAccordion agentOutput={parsedOutput} />
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {onDismiss && (
          <button className="btn-ghost" onClick={() => onDismiss(id)}>
            Dismiss
          </button>
        )}
        {onResolve && (
          <button className="btn-primary" onClick={() => onResolve(id)} style={{ fontSize: 12 }}>
            Mark Resolved
          </button>
        )}
      </div>
    </div>
  );
};


/* ---------------------------------------------------------- */
/* AgentReasoningAccordion — inline, lives in this file        */
/* ---------------------------------------------------------- */

const AGENT_CONFIG: Record<string, { label: string; color: string }> = {
  tariff_monitor:      { label: 'TariffMonitor',      color: '#3B82F6' },
  impact_calculator:   { label: 'ImpactCalculator',   color: '#F97316' },
  alternatives_finder: { label: 'AlternativesFinder', color: '#10B981' },
  import_compliance:   { label: 'ImportCompliance',   color: '#8B5CF6' },
  adversarial:         { label: 'Adversarial',        color: '#EF4444' },
};

interface AgentReasoningAccordionProps {
  agentOutput: Record<string, unknown>;
}

const AgentReasoningAccordion: React.FC<AgentReasoningAccordionProps> = ({ agentOutput }) => {
  const [openAgent, setOpenAgent] = React.useState<string | null>(null);

  const agentKeys = Object.keys(AGENT_CONFIG).filter((k) => agentOutput[k]);

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        marginBottom: 8,
      }}
    >
      {agentKeys.map((key, idx) => {
        const config = AGENT_CONFIG[key];
        const isOpen = openAgent === key;
        const data = agentOutput[key] as Record<string, unknown>;

        return (
          <div key={key} style={{ borderTop: idx > 0 ? '1px solid var(--border)' : 'none' }}>
            <button
              onClick={() => setOpenAgent(isOpen ? null : key)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                background: isOpen ? '#F8FAFC' : 'white',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text)',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: config.color,
                  flexShrink: 0,
                }}
              />
              {config.label}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
                {isOpen ? '▲' : '▼'}
              </span>
            </button>

            {isOpen && (
              <div
                style={{
                  padding: '12px 14px',
                  background: '#FAFAFA',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {Object.entries(data).map(([k, v]) => (
                    <li
                      key={k}
                      style={{
                        fontSize: 12,
                        color: 'var(--text)',
                        padding: '3px 0',
                        display: 'flex',
                        gap: 8,
                      }}
                    >
                      <span style={{ color: config.color, fontWeight: 700, minWidth: 4 }}>•</span>
                      <span>
                        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                          {k.replace(/_/g, ' ')}:
                        </span>{' '}
                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
