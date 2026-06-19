import React from 'react';
import {
  TrendingUp, Zap, Search, ShieldCheck, Gavel,
  CheckCircle2, Loader2, ChevronDown, ExternalLink,
} from 'lucide-react';

/** Agent 1 (TariffMonitor) — core/monitor_agent.get_latest_event */
export interface TariffMonitorOutput {
  risk_detected?: boolean;
  event?: string;
  event_type?: string | null;
  country?: string | null;
  product?: string | null;
  tariff_rate?: number | null;
  severity?: string | null;
  confidence?: number | null;
  source?: string | null;
  source_url?: string | null;
  summary?: string | null;
}

/** Agent 2 (ImpactCalculator) — services/impact_service.calculate_impact */
export interface ImpactCalculatorOutput {
  affected?: boolean;
  direct_cost?: number | null;
  extra_cost_usd?: number | null;
  exposure_score?: number | null;
  risk_score?: number | null;
  severity?: string | null;
  affected_orders?: number | null;
  eta_risk?: string | null;
  supplier_dependency?: number | null;
  reasons?: string[];
}

// Agents 3-5 are LLM-backed (CrewAI + Gemini); shapes are loose.
export type AgentResults = Record<string, any>;
export type AgentStatusMap = Record<string, 'running' | 'done'>;

type StepStatus = 'done' | 'running' | 'pending';

interface LiveAgentResultsProps {
  agents?: AgentResults | null;
  agentStatus?: AgentStatusMap;
  supplier?: string | null;
  updatedAt?: string | null;
  live?: boolean;
}

interface ChainStep {
  key: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  desc: string;
}

// The fixed reasoning chain, in execution order.
const CHAIN: ChainStep[] = [
  { key: 'tariff_monitor',      label: 'TariffMonitor',       shortLabel: 'Monitor',     icon: TrendingUp,  color: '#f59e0b', desc: 'Scanning tariffs, sanctions & trade policy' },
  { key: 'impact_calculator',   label: 'ImpactCalculator',    shortLabel: 'Impact',      icon: Zap,         color: '#dc2626', desc: 'Calculating financial exposure' },
  { key: 'alternatives_finder', label: 'AlternativesFinder',  shortLabel: 'Alternatives', icon: Search,      color: '#14b8a6', desc: 'Sourcing backup suppliers' },
  { key: 'import_compliance',   label: 'ImportCompliance',    shortLabel: 'Compliance',  icon: ShieldCheck, color: '#10b981', desc: 'Verifying FTA / USMCA / GSP eligibility' },
  { key: 'adversarial',         label: 'Adversarial',         shortLabel: 'Validate',    icon: Gavel,       color: '#a78bfa', desc: 'Red-teaming recommendations' },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#dc2626', high: '#ef4444', medium: '#f59e0b', low: '#10b981',
  caution: '#f59e0b', clear: '#10b981', block: '#dc2626',
};
const sev = (s?: string | null) => (s || 'unknown').toString().toLowerCase();
const sevColor = (s?: string | null) => SEVERITY_COLOR[sev(s)] || '#6b7280';
const money = (n?: number | null) => (n == null ? '—' : `$${Math.round(n).toLocaleString('en-US')}`);

const Pill: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <span style={{
    fontSize: 8, fontWeight: 700, letterSpacing: '0.05em',
    color, background: `${color}15`, border: `1px solid ${color}28`,
    borderRadius: 3, padding: '1.5px 5px', textTransform: 'uppercase',
    whiteSpace: 'nowrap', flexShrink: 0,
  }}>{text}</span>
);

const KVRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
    <span style={{ fontSize: 9, color: 'rgba(140,130,100,0.7)' }}>{label}</span>
    <span style={{ fontSize: 9.5, color: '#e8e3d8', fontWeight: 600, textAlign: 'right' }}>{children}</span>
  </div>
);

const BulletList: React.FC<{ items?: string[] }> = ({ items }) =>
  items && items.length > 0 ? (
    <ul style={{ margin: '5px 0 0', paddingLeft: 12, listStyle: 'disc' }}>
      {items.slice(0, 3).map((r, i) => (
        <li key={i} style={{ fontSize: 9, color: 'rgba(170,160,130,0.85)', lineHeight: 1.45, marginBottom: 2 }}>{r}</li>
      ))}
    </ul>
  ) : null;

// ── Compact summary badges shown in the collapsed stage header ────────────────
function stageSummary(key: string, agents: AgentResults, status: StepStatus): React.ReactNode {
  if (status !== 'done') return null;
  const d = agents[key];
  if (!d) return null;
  switch (key) {
    case 'tariff_monitor': {
      const country = (d.affected_countries?.[0] ?? d.country) as string | null;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {d.tariff_rate != null && <Pill text={`+${d.tariff_rate}%`} color="#ef4444" />}
          {d.event_type && <Pill text={d.event_type} color="#f59e0b" />}
          {country && <Pill text={country} color="#94a3b8" />}
        </div>
      );
    }
    case 'impact_calculator':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Pill text={money(d.direct_cost ?? d.extra_cost_usd)} color="#dc2626" />
          <Pill text={sev(d.severity)} color={sevColor(d.severity)} />
        </div>
      );
    case 'alternatives_finder': {
      const n = Array.isArray(d.options) ? d.options.length : Array.isArray(d.alternatives) ? d.alternatives.length : 0;
      return n ? <Pill text={`${n} option${n !== 1 ? 's' : ''}`} color="#14b8a6" /> : null;
    }
    case 'import_compliance': {
      if (d.no_viable_option) return <Pill text="BLOCKED" color="#dc2626" />;
      return d.recommended_country ? <Pill text={d.recommended_country} color="#10b981" /> : null;
    }
    case 'adversarial':
      return d.verdict ? <Pill text={d.verdict} color={sevColor(d.verdict)} /> : null;
    default:
      return null;
  }
}

// ── Expanded detail content per agent ────────────────────────────────────────
function stageDetail(key: string, agents: AgentResults, supplier?: string | null): React.ReactNode {
  const d = agents[key];
  if (!d) return null;

  if (key === 'tariff_monitor') {
    const country = (d.affected_countries?.[0] ?? d.country) as string | null;
    const product = (d.affected_product_name ?? d.product) as string | null;
    return (
      <>
        {d.event && (
          <div style={{ fontSize: 10, color: '#f1f5f9', fontWeight: 600, lineHeight: 1.4, marginBottom: 7 }}>{d.event}</div>
        )}
        {country && <KVRow label="Country">{country}</KVRow>}
        {supplier && <KVRow label="Supplier">{supplier}</KVRow>}
        {product && <KVRow label="Product">{product}</KVRow>}
        {Array.isArray(d.affected_hs_codes) && d.affected_hs_codes.length > 0 && (
          <KVRow label="HS codes">{d.affected_hs_codes.join(', ')}</KVRow>
        )}
        <KVRow label="Tariff change">{d.tariff_rate != null ? <span style={{ color: '#ef4444' }}>+{d.tariff_rate}%</span> : '—'}</KVRow>
        {d.confidence != null && <KVRow label="Confidence">{Math.round(d.confidence * 100)}%</KVRow>}
        <KVRow label="Source">{d.source || d.risk_source || '—'}</KVRow>
        {d.source_url && (
          <a href={d.source_url} target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5, fontSize: 9.5, color: '#60a5fa', textDecoration: 'none' }}>
            <ExternalLink size={9} /> View source
          </a>
        )}
      </>
    );
  }

  if (key === 'impact_calculator') {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 9 }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#dc2626', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {money(d.direct_cost ?? d.extra_cost_usd)}
          </span>
          <span style={{ fontSize: 9, color: 'rgba(140,130,100,0.7)' }}>direct cost</span>
        </div>
        <KVRow label="Affected orders">{d.affected_orders ?? 0}</KVRow>
        {d.risk_score != null && <KVRow label="Risk score">{d.risk_score}</KVRow>}
        {d.eta_risk && <KVRow label="ETA risk">{d.eta_risk}</KVRow>}
        {d.supplier_dependency != null && <KVRow label="Dependency">{Math.round(d.supplier_dependency * 100)}%</KVRow>}
        {d.historical_basis && (
          <div style={{ fontSize: 9, color: 'rgba(140,130,100,0.75)', marginTop: 5, lineHeight: 1.4 }}>{d.historical_basis}</div>
        )}
        <BulletList items={d.reasons} />
      </>
    );
  }

  if (key === 'alternatives_finder') {
    const altList: any[] = Array.isArray(d.options) ? d.options : Array.isArray(d.alternatives) ? d.alternatives : [];
    return (
      <>
        {altList.length === 0 && (
          <div style={{ fontSize: 9.5, color: 'rgba(140,130,100,0.7)' }}>No alternatives returned.</div>
        )}
        {altList.slice(0, 3).map((alt, i) => (
          <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: i < Math.min(altList.length, 3) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#e8e3d8' }}>
                #{i + 1} {alt.supplier ?? alt.supplier_name ?? 'Alternative'}
              </span>
              {(alt.country ?? alt.country_full) && (
                <Pill text={alt.country ?? alt.country_full} color="#14b8a6" />
              )}
              {alt.source === 'global_suppliers_db' && (
                <Pill text="verified" color="#10b981" />
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, fontSize: 9, color: 'rgba(170,160,130,0.85)' }}>
              {alt.lead_time_weeks != null && <span>{alt.lead_time_weeks}w lead</span>}
              {alt.cost_delta_pct != null && (
                <span style={{ color: alt.cost_delta_pct <= 0 ? '#10b981' : '#ef4444' }}>
                  {alt.cost_delta_pct > 0 ? '+' : ''}{alt.cost_delta_pct}% cost
                </span>
              )}
            </div>
            {(alt.stability_note ?? alt.selection_reasoning) && (
              <div style={{ fontSize: 9, color: 'rgba(140,130,100,0.75)', marginTop: 3, lineHeight: 1.35 }}>
                {alt.stability_note ?? alt.selection_reasoning}
              </div>
            )}
          </div>
        ))}
      </>
    );
  }

  if (key === 'import_compliance') {
    if (d.no_viable_option) {
      return (
        <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, lineHeight: 1.4 }}>
          BLOCKED — {d.reason ?? 'No viable alternative found.'}
        </div>
      );
    }
    const docs: string[] = Array.isArray(d.required_documents) ? d.required_documents : [];
    const risks: string[] = Array.isArray(d.risk_factors) ? d.risk_factors : [];
    return (
      <>
        {d.recommended_supplier && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#e8e3d8' }}>{d.recommended_supplier}</span>
            {d.recommended_country && <Pill text={d.recommended_country} color="#10b981" />}
            {d.compliance_feasibility && <Pill text={`${d.compliance_feasibility} feasibility`} color="#10b981" />}
          </div>
        )}
        {d.lead_time_weeks != null && <KVRow label="Lead time">{d.lead_time_weeks}w</KVRow>}
        {d.cost_delta_pct != null && (
          <KVRow label="Cost delta">
            <span style={{ color: d.cost_delta_pct <= 0 ? '#10b981' : '#ef4444' }}>
              {d.cost_delta_pct > 0 ? '+' : ''}{d.cost_delta_pct}%
            </span>
          </KVRow>
        )}
        {d.rationale && (
          <div style={{ fontSize: 9, color: 'rgba(170,160,130,0.85)', marginTop: 5, lineHeight: 1.4 }}>{d.rationale}</div>
        )}
        {docs.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 8, color: 'rgba(140,130,100,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Required docs</div>
            {docs.slice(0, 4).map((doc, i) => (
              <div key={i} style={{ fontSize: 9, color: 'rgba(170,160,130,0.8)', lineHeight: 1.4 }}>· {doc}</div>
            ))}
            {docs.length > 4 && <div style={{ fontSize: 9, color: 'rgba(120,110,80,0.6)' }}>+{docs.length - 4} more</div>}
          </div>
        )}
        {risks.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 8, color: 'rgba(220,38,38,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Risk factors</div>
            {risks.slice(0, 2).map((r, i) => (
              <div key={i} style={{ fontSize: 9, color: 'rgba(220,38,38,0.75)', lineHeight: 1.4 }}>· {r}</div>
            ))}
          </div>
        )}
      </>
    );
  }

  if (key === 'adversarial') {
    const flags: any[] = Array.isArray(d.flags) ? d.flags : [];
    const challenged: any[] = Array.isArray(d.challenged_assumptions) ? d.challenged_assumptions : [];
    const recommendation = d.recommendation ?? d.recommended_action;
    const confidence = d.confidence ?? d.confidence_in_recommendation;
    const verdictColor = sevColor(d.verdict);
    return (
      <>
        {d.verdict && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: verdictColor, letterSpacing: '0.05em' }}>{d.verdict}</span>
            {confidence != null && (
              <span style={{ fontSize: 9, color: 'rgba(140,130,100,0.7)' }}>{Math.round(confidence * 100)}% confidence</span>
            )}
          </div>
        )}
        {recommendation && (
          <div style={{ fontSize: 9.5, color: '#f1f5f9', fontWeight: 500, lineHeight: 1.5, marginBottom: 7 }}>{recommendation}</div>
        )}
        {flags.length > 0 && (
          <div style={{ marginBottom: 5 }}>
            <div style={{ fontSize: 8, color: 'rgba(220,38,38,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Flags</div>
            <BulletList items={flags.map((f: any) => (typeof f === 'string' ? f : f.flag || JSON.stringify(f)))} />
          </div>
        )}
        {challenged.length > 0 && (
          <div>
            <div style={{ fontSize: 8, color: 'rgba(167,139,250,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Challenged assumptions</div>
            <BulletList items={challenged.map((c: any) => (typeof c === 'string' ? c : JSON.stringify(c)))} />
          </div>
        )}
      </>
    );
  }

  return null;
}

// ── Status node in the pipeline rail ─────────────────────────────────────────
const StageNode: React.FC<{ status: StepStatus; index: number; color: string }> = ({ status, index, color }) => {
  if (status === 'done') {
    return (
      <div style={{
        width: 22, height: 22,
        borderRadius: '50%',
        background: 'rgba(16,185,129,0.12)',
        border: '1.5px solid rgba(16,185,129,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <CheckCircle2 size={13} color="#10b981" />
      </div>
    );
  }
  if (status === 'running') {
    return (
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        background: `${color}12`,
        border: `1.5px solid ${color}50`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 10px ${color}30`,
        animation: 'pulse-dot 1.2s ease-in-out infinite',
        flexShrink: 0,
      }}>
        <Loader2 size={12} color={color} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }
  // pending
  return (
    <div style={{
      width: 22, height: 22, borderRadius: '50%',
      border: '1.5px solid rgba(120,110,80,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(120,110,80,0.4)', lineHeight: 1 }}>{index + 1}</span>
    </div>
  );
};

export const LiveAgentResults: React.FC<LiveAgentResultsProps> = ({
  agents, agentStatus, supplier, updatedAt, live,
}) => {
  const a = agents || {};
  const statusMap = agentStatus || {};

  const stepStatus = (key: string): StepStatus => {
    if (statusMap[key] === 'done' || a[key]) return 'done';
    if (statusMap[key] === 'running') return 'running';
    return 'pending';
  };

  const hasAny = CHAIN.some((s) => stepStatus(s.key) !== 'pending');

  const runningKey = CHAIN.find((s) => stepStatus(s.key) === 'running')?.key ?? null;
  const lastDoneKey = [...CHAIN].reverse().find((s) => stepStatus(s.key) === 'done')?.key ?? null;
  const autoTarget = runningKey || lastDoneKey;

  const [expandedKey, setExpandedKey] = React.useState<string | null>(autoTarget);
  const lastAutoRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (autoTarget && autoTarget !== lastAutoRef.current) {
      lastAutoRef.current = autoTarget;
      setExpandedKey(autoTarget);
    }
  }, [autoTarget]);

  const ts = updatedAt
    ? new Date(updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  // How many stages are done
  const doneCount = CHAIN.filter((s) => stepStatus(s.key) === 'done').length;

  return (
    <div>
      {/* Pipeline header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: live ? '#dc2626' : hasAny ? '#10b981' : 'rgba(130,120,90,0.4)',
            boxShadow: live || hasAny ? `0 0 5px ${live ? '#dc2626' : '#10b981'}` : 'none',
            animation: live ? 'pulse-dot 1.2s ease-in-out infinite' : 'none',
          }} />
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: live ? '#fca5a5' : hasAny ? '#6ee7b7' : 'rgba(140,130,100,0.6)',
          }}>
            {live ? 'Live · Reasoning Chain' : hasAny ? 'Reasoning Chain' : 'Agent Pipeline'}
          </span>
        </div>
        {hasAny && (
          <span style={{
            fontSize: 8.5,
            color: 'rgba(120,110,80,0.7)',
            fontFamily: 'JetBrains Mono, monospace',
            marginLeft: 'auto',
          }}>
            {doneCount}/{CHAIN.length}
            {ts && ` · ${ts}`}
          </span>
        )}
      </div>

      {/* Empty state */}
      {!hasAny && (
        <div style={{
          padding: '14px 0 6px',
          fontSize: 10,
          color: 'rgba(120,110,80,0.8)',
          lineHeight: 1.5,
        }}>
          Click <strong style={{ color: '#e8e3d8' }}>Run Analysis</strong> to start the intelligence chain.
        </div>
      )}

      {/* Pipeline stages */}
      <div>
        {CHAIN.map((step, idx) => {
          const status = stepStatus(step.key);
          const isLast = idx === CHAIN.length - 1;
          const isExpanded = expandedKey === step.key && status === 'done';
          const Icon = step.icon;
          const isDim = status === 'pending';
          const isActive = status === 'running';
          const isDone = status === 'done';
          const lineColor = isDone ? 'rgba(16,185,129,0.35)' : 'rgba(120,110,80,0.1)';

          return (
            <div key={step.key} style={{ display: 'flex', gap: 10 }}>
              {/* Rail */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 22, flexShrink: 0 }}>
                <StageNode status={status} index={idx} color={step.color} />
                {!isLast && (
                  <div style={{
                    flex: 1,
                    width: 1.5,
                    minHeight: 14,
                    marginTop: 3,
                    background: lineColor,
                    transition: 'background 0.5s ease',
                  }} />
                )}
              </div>

              {/* Stage content */}
              <div style={{
                flex: 1,
                minWidth: 0,
                paddingBottom: isLast ? 0 : 10,
              }}>
                {/* Stage header — clickable when done */}
                <button
                  onClick={() => isDone && setExpandedKey(isExpanded ? null : step.key)}
                  disabled={!isDone}
                  style={{
                    width: '100%',
                    background: isActive ? `${step.color}07` : 'none',
                    border: isActive ? `1px solid ${step.color}18` : '1px solid transparent',
                    borderRadius: 6,
                    padding: '5px 7px 5px 6px',
                    textAlign: 'left',
                    cursor: isDone ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Top row: icon + label + status/spinner */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: isDone ? 4 : 0 }}>
                    <Icon size={11} color={isDim ? 'rgba(120,110,80,0.35)' : step.color} />
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isDim ? 'rgba(140,130,100,0.45)' : '#e8e3d8',
                      letterSpacing: '-0.1px',
                    }}>
                      {step.shortLabel}
                    </span>
                    {isActive && (
                      <span style={{
                        fontSize: 8, fontWeight: 700, letterSpacing: '0.07em',
                        color: step.color, marginLeft: 2,
                      }}>
                        RUNNING
                      </span>
                    )}
                    {isDone && (
                      <ChevronDown
                        size={12}
                        color="rgba(140,130,100,0.5)"
                        style={{
                          marginLeft: 'auto',
                          transform: isExpanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>

                  {/* Summary pills row */}
                  {isDone && (
                    <div style={{ paddingLeft: 17 }}>
                      {stageSummary(step.key, a, status)}
                    </div>
                  )}

                  {/* Running sub-text */}
                  {isActive && (
                    <div style={{
                      paddingLeft: 17,
                      fontSize: 9,
                      color: 'rgba(160,150,110,0.7)',
                      fontStyle: 'italic',
                      marginTop: 2,
                    }}>
                      {step.desc}…
                    </div>
                  )}

                  {/* Pending desc */}
                  {isDim && (
                    <div style={{
                      paddingLeft: 17,
                      fontSize: 9,
                      color: 'rgba(100,92,70,0.45)',
                      marginTop: 1,
                    }}>
                      {step.desc}
                    </div>
                  )}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{
                    margin: '5px 0 3px 7px',
                    padding: '10px 12px',
                    background: 'rgba(0,0,0,0.22)',
                    border: `1px solid ${step.color}18`,
                    borderRadius: 7,
                    animation: 'slide-up 0.18s ease',
                  }}>
                    {stageDetail(step.key, a, supplier)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
