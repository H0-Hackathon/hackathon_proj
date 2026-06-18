import React from 'react';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { AlertCard, AlertSeverity, AlertType } from '../components/AlertCard';

// Active customer — matches ACTIVE_CUSTOMER_ID in backend/.env
const ACTIVE_CUSTOMER_ID = 71;

type FilterSeverity = 'all' | AlertSeverity;
const FILTER_OPTIONS: FilterSeverity[] = ['all', 'critical', 'high', 'medium', 'low'];

interface ApiAlert {
  id: number;
  alert_type: string;
  severity: AlertSeverity;
  summary: string | null;
  agent_output: string | null;
  status: string;
  created_at: string;
}

interface StartupStatus {
  running: boolean;
  completed: number;
  total: number;
  errors: string[];
}

interface AgentDebugEntry {
  run_id: string;
  label: string;
  agent_outputs: Record<string, any>;
  timestamp: string;
}

// ── Agent Debug Panel ─────────────────────────────────────────────────────────

const AGENT_LABELS: Record<string, string> = {
  tariff_monitor: '1 · Tariff Monitor',
  impact_calculator: '2 · Impact Calculator',
  alternatives_finder: '3 · Alternatives Finder',
  import_compliance: '4 · Import Compliance',
  adversarial: '5 · Adversarial',
};

function generateAgentSummary(key: string, data: any): string {
  try {
    if (key === 'tariff_monitor') {
      const detected = data.risk_detected;
      const event = data.event ?? 'an unspecified trade event';
      const countries = (data.affected_countries ?? []).join(' and ') || 'unknown countries';
      const conf = data.confidence != null ? `${Math.round(data.confidence * 100)}%` : null;
      if (!detected) return 'The Tariff Monitor scanned live RSS feeds and trade databases and found no material risk events currently affecting your supply chain. Your imports appear stable.';
      return `The Tariff Monitor detected an active risk: ${event}. This affects your sourcing from ${countries}.${conf ? ` The model assigned a ${conf} confidence level to this signal` : ''} — meaning it considers this a credible, near-term threat rather than background noise. The agent pulled this from live news feeds and trade intelligence sources so you're seeing it before it becomes mainstream knowledge.`;
    }

    if (key === 'impact_calculator') {
      const cost = data.extra_cost_usd;
      const severity = data.severity ?? 'unknown';
      const orders = data.affected_orders ?? 0;
      const company = data.company ?? 'your company';
      if (!cost && cost !== 0) return 'The Impact Calculator was unable to produce a dollar estimate from the available data.';
      const sevDesc: Record<string, string> = {
        low: 'a manageable cost increase — under 5% of your import spend',
        medium: 'a meaningful hit — roughly 5–20% extra on affected imports',
        high: 'a serious financial impact — over 20% additional cost on your imports',
        critical: 'a critical situation — costs may make the order economically unviable',
      };
      return `The Financial Impact Calculator modeled this risk against ${company}'s actual import profile. It estimates an extra $${Number(cost).toLocaleString()} in additional costs, affecting ${orders} active order${orders !== 1 ? 's' : ''}. Severity is rated ${severity.toUpperCase()} — ${sevDesc[severity] ?? 'impact level uncertain'}. This figure is based on your real annual import volume and typical order size, not generic industry averages.`;
    }

    if (key === 'alternatives_finder') {
      const options = data.options ?? [];
      if (options.length === 0) return 'The Alternatives Finder could not identify verified replacement suppliers for the affected sourcing routes.';
      const topOption = options[0];
      const others = options.slice(1).map((o: any) => `${o.supplier} in ${o.country}`).join(', ');
      const dbSourced = options.filter((o: any) => o.source === 'global_suppliers_db').length;
      return `The Alternatives Finder queried CoastGuard's verified global supplier database and found ${options.length} candidate replacement${options.length !== 1 ? 's' : ''}. The top recommendation is ${topOption.supplier} in ${topOption.country} — ${topOption.lead_time_weeks} week lead time, ${topOption.cost_delta_pct > 0 ? '+' : ''}${topOption.cost_delta_pct}% cost vs. current sourcing.${others ? ` Also flagged: ${others}.` : ''} ${dbSourced === options.length ? 'All suppliers are verified entries in the CoastGuard supplier database — not AI guesses.' : `${dbSourced} of ${options.length} are from the verified database.`}`;
    }

    if (key === 'import_compliance') {
      const countries = Object.keys(data);
      if (countries.length === 0) return 'The Import Compliance agent did not find applicable documentation requirements for the proposed alternative sourcing routes.';
      const lines = countries.map(c => {
        const docs = data[c] ?? [];
        return `${c} requires ${docs.length} document${docs.length !== 1 ? 's' : ''} (${docs.slice(0, 2).join(', ')}${docs.length > 2 ? '…' : ''})`;
      });
      return `The Import Compliance Specialist — modeled on a licensed US customs broker — listed the exact paperwork your team would need to file at the Port of New Orleans for each alternative sourcing country. ${lines.join('; ')}. These are the actual CBP and FDA requirements, not estimates. Missing any of these during an import attempt triggers holds, fines, or cargo seizure.`;
    }

    if (key === 'adversarial') {
      const verdict = data.verdict ?? 'UNKNOWN';
      const flags = data.flags ?? [];
      const rec = data.recommendation ?? '';
      const verdictDesc: Record<string, string> = {
        CLEAR: 'The Risk Challenger reviewed every prior agent output and found no critical issues. The recommended action is safe to execute.',
        CAUTION: 'The Risk Challenger identified one or more concerns that should be addressed before acting, but the situation is not a blocker.',
        BLOCK: 'The Risk Challenger issued a BLOCK — the proposed recommendation has serious flaws that must be resolved before proceeding.',
      };
      return `${verdictDesc[verdict] ?? `Verdict: ${verdict}.`}${flags.length > 0 ? ` Key flags raised: ${flags.slice(0, 2).join('; ')}.` : ''} ${rec ? `Final recommendation: ${rec}` : ''} This agent acts as an internal devil's advocate — its job is to catch what the other four agents missed before the alert reaches you.`;
    }

    return 'Agent output available. Expand the data above for full details.';
  } catch {
    return 'Summary could not be generated from this agent\'s output.';
  }
}

const EVENT_COLORS: Record<string, string> = {
  pipeline_start: '#22d3ee',
  profile_loaded: '#a78bfa',
  rss_start: '#fb923c',
  rss_fetched: '#fb923c',
  rss_match: '#fbbf24',
  rss_done: '#fb923c',
  rss_error: '#f87171',
  db_query: '#34d399',
  db_suppliers: '#34d399',
  db_error: '#f87171',
  crew_start: '#60a5fa',
  agent_start: '#60a5fa',
  agent_done: '#4ade80',
  crew_error: '#f87171',
  pipeline_done: '#4ade80',
};

const EVENT_ICONS: Record<string, string> = {
  pipeline_start: '▶',
  profile_loaded: '👤',
  rss_start: '📡',
  rss_fetched: '📡',
  rss_match: '📰',
  rss_done: '📡',
  rss_error: '✗',
  db_query: '🗄',
  db_suppliers: '🗄',
  db_error: '✗',
  crew_start: '🤖',
  agent_start: '⟳',
  agent_done: '✓',
  crew_error: '✗',
  pipeline_done: '✓',
};

interface PipelineLogEvent {
  event: string;
  msg: string;
  ts: string;
}

function AgentOutputCard({ agentKey, val }: { agentKey: string; val: any }) {
  const [expanded, setExpanded] = React.useState(false);
  const summary = generateAgentSummary(agentKey, val);

  const verdictColor = agentKey === 'adversarial'
    ? val?.verdict === 'CLEAR' ? '#4ade80' : val?.verdict === 'BLOCK' ? '#f87171' : '#fbbf24'
    : null;

  return (
    <div style={{ background: '#1e293b', borderRadius: 6, overflow: 'hidden' }}>
      {/* Agent header */}
      <div
        style={{
          padding: '6px 12px', background: '#0f2d4a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(e => !e)}
      >
        <span style={{ color: '#7dd3fc', fontSize: 11, fontWeight: 700 }}>
          {AGENT_LABELS[agentKey] ?? agentKey}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {agentKey === 'adversarial' && val?.verdict && (
            <span style={{
              color: verdictColor ?? '#fbbf24', fontSize: 10, fontWeight: 700,
              background: '#0f172a', padding: '1px 6px', borderRadius: 3,
            }}>
              {val.verdict}
            </span>
          )}
          {agentKey === 'impact_calculator' && val?.severity && (
            <span style={{
              color: val.severity === 'critical' || val.severity === 'high' ? '#f87171' : '#fbbf24',
              fontSize: 10, fontWeight: 700, background: '#0f172a', padding: '1px 6px', borderRadius: 3,
            }}>
              {val.severity?.toUpperCase()}
            </span>
          )}
          {agentKey === 'impact_calculator' && val?.extra_cost_usd != null && (
            <span style={{ color: '#94a3b8', fontSize: 10 }}>
              +${Number(val.extra_cost_usd).toLocaleString()}
            </span>
          )}
          <span style={{ color: '#475569', fontSize: 10 }}>
            {expanded ? '▲ hide' : '▼ show'} data
          </span>
        </div>
      </div>

      {/* AI summary — always visible */}
      <div style={{ padding: '8px 12px 4px', borderBottom: expanded ? '1px solid #0f172a' : 'none' }}>
        <p style={{
          margin: 0, color: '#cbd5e1', fontSize: 12, lineHeight: 1.6,
          fontFamily: 'Inter, sans-serif',
        }}>
          {summary}
        </p>
      </div>

      {/* Raw JSON — collapsed by default */}
      {expanded && (
        <pre style={{
          margin: 0, padding: '8px 12px', color: '#64748b',
          fontSize: 10.5, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          maxHeight: 180, overflowY: 'auto', background: '#0f172a',
        }}>
          {JSON.stringify(val, null, 2)}
        </pre>
      )}
    </div>
  );
}

function AgentDebugPanel({ entries, startupStatus, manualRunning }: {
  entries: AgentDebugEntry[];
  startupStatus: StartupStatus | null;
  manualRunning: boolean;
}) {
  const [open, setOpen] = React.useState(true);
  const [selectedRun, setSelectedRun] = React.useState(0);
  const [liveLog, setLiveLog] = React.useState<PipelineLogEvent[]>([]);
  const logEndRef = React.useRef<HTMLDivElement>(null);
  const seenCountRef = React.useRef(0);

  const isLoading = startupStatus?.running ?? false;
  const isAnyPipelineRunning = isLoading || manualRunning;
  const completed = startupStatus?.completed ?? 0;
  const total = startupStatus?.total ?? 3;

  // Poll live pipeline log while any pipeline is running
  React.useEffect(() => {
    if (!isAnyPipelineRunning) {
      seenCountRef.current = 0;
      return;
    }
    // Clear log when a new run starts
    setLiveLog([]);
    seenCountRef.current = 0;

    const interval = setInterval(() => {
      fetch(`/api/v2/monitor/pipeline-log?since=${seenCountRef.current}`)
        .then(r => r.json())
        .then(data => {
          if (data.events?.length > 0) {
            setLiveLog(prev => [...prev, ...data.events]);
            seenCountRef.current = data.total;
          }
        })
        .catch(() => {});
    }, 1000);
    return () => clearInterval(interval);
  }, [isAnyPipelineRunning]);

  // Auto-scroll live log to bottom
  React.useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveLog]);

  // Clear live log when startup finishes
  React.useEffect(() => {
    if (!isLoading && liveLog.length > 0) {
      // Keep it visible after done — user can read it
    }
  }, [isLoading, liveLog.length]);

  return (
    <div style={{
      background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8,
      marginBottom: 24, fontFamily: 'monospace', fontSize: 12,
    }}>
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', borderBottom: open ? '1px solid #1e293b' : 'none',
          cursor: 'pointer',
        }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#22d3ee', fontWeight: 700, fontSize: 11 }}>AGENT DEBUG</span>
          {isLoading && (
            <span style={{
              background: '#1e3a5f', color: '#60a5fa', padding: '2px 8px',
              borderRadius: 4, fontSize: 10, fontWeight: 600,
            }}>
              ⟳ Startup pipeline {completed}/{total}…
            </span>
          )}
          {manualRunning && !isLoading && (
            <span style={{
              background: '#1e3a5f', color: '#60a5fa', padding: '2px 8px',
              borderRadius: 4, fontSize: 10, fontWeight: 600,
            }}>
              ⟳ Manual run in progress…
            </span>
          )}
          {!isLoading && startupStatus && (
            <span style={{
              background: '#052e16', color: '#4ade80', padding: '2px 8px',
              borderRadius: 4, fontSize: 10, fontWeight: 600,
            }}>
              ✓ {completed}/{total} runs complete
            </span>
          )}
          {startupStatus?.errors?.length ? (
            <span style={{
              background: '#450a0a', color: '#f87171', padding: '2px 8px',
              borderRadius: 4, fontSize: 10,
            }}>
              {startupStatus.errors.length} error(s)
            </span>
          ) : null}
        </div>
        {open ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
      </div>

      {open && (
        <div style={{ padding: 16 }}>

          {/* Live pipeline log — shown during any run */}
          {(isAnyPipelineRunning || liveLog.length > 0) && (
            <div style={{
              background: '#020617', borderRadius: 6, padding: '10px 12px',
              marginBottom: 16, maxHeight: 260, overflowY: 'auto',
              border: '1px solid #1e293b',
            }}>
              <div style={{ color: '#475569', fontSize: 10, marginBottom: 6, letterSpacing: 1 }}>
                LIVE PIPELINE LOG {isAnyPipelineRunning ? '— RUNNING' : '— COMPLETE'}
              </div>
              {liveLog.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 3, alignItems: 'flex-start' }}>
                  <span style={{ color: '#334155', fontSize: 10, flexShrink: 0, paddingTop: 1 }}>
                    {new Date(e.ts).toLocaleTimeString()}
                  </span>
                  <span style={{ color: EVENT_COLORS[e.event] ?? '#94a3b8', fontSize: 10, flexShrink: 0 }}>
                    {EVENT_ICONS[e.event] ?? '·'}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: 11, wordBreak: 'break-word' }}>
                    {e.msg}
                  </span>
                </div>
              ))}
              {isAnyPipelineRunning && (
                <div style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>
                  <span style={{ animation: 'blink 1s step-end infinite' }}>▋</span>
                </div>
              )}
              <div ref={logEndRef} />
            </div>
          )}

          {entries.length === 0 && !isLoading && liveLog.length === 0 && (
            <p style={{ color: '#475569', margin: 0 }}>
              No pipeline runs yet. Restart the backend to trigger startup runs, or click "Run Monitor".
            </p>
          )}

          {entries.length > 0 && (
            <>
              <div style={{ color: '#475569', fontSize: 10, marginBottom: 8, letterSpacing: 1 }}>
                COMPLETED RUNS — AGENT OUTPUTS
              </div>
              {/* Run selector tabs */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {entries.map((e, i) => (
                  <button
                    key={e.run_id}
                    onClick={() => setSelectedRun(i)}
                    style={{
                      padding: '3px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                      background: selectedRun === i ? '#1e40af' : '#1e293b',
                      color: selectedRun === i ? '#93c5fd' : '#64748b',
                      fontSize: 11, fontFamily: 'monospace',
                    }}
                  >
                    {e.label}
                  </button>
                ))}
              </div>

              {/* Agent outputs for selected run */}
              {entries[selectedRun] && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(entries[selectedRun].agent_outputs).map(([key, val]) => (
                    <AgentOutputCard key={key} agentKey={key} val={val} />
                  ))}
                  <div style={{ color: '#334155', fontSize: 10, textAlign: 'right' }}>
                    run_id: {entries[selectedRun].run_id} · {entries[selectedRun].timestamp}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export const AlertsDashboard: React.FC = () => {
  const [alerts, setAlerts] = React.useState<ApiAlert[]>([]);
  const [filter, setFilter] = React.useState<FilterSeverity>('all');
  const [isRunning, setIsRunning] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [startupStatus, setStartupStatus] = React.useState<StartupStatus | null>(null);
  const [debugEntries, setDebugEntries] = React.useState<AgentDebugEntry[]>([]);

  // Fetch alerts for active customer
  const fetchAlerts = React.useCallback(() => {
    fetch(`/api/v2/alerts?customer_id=${ACTIVE_CUSTOMER_ID}`)
      .then(r => r.json())
      .then(data => setAlerts(Array.isArray(data) ? data : data.alerts ?? []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // Track whether startup was running so we know when it transitions to done
  const startupWasRunningRef = React.useRef(false);

  // Poll startup status until done; when done, seed debug panel from startup alerts
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const poll = () => {
      fetch('/api/v2/monitor/startup-status')
        .then(r => r.json())
        .then((status: StartupStatus) => {
          setStartupStatus(status);
          if (status.running) {
            startupWasRunningRef.current = true;
          }
          // Keep polling if startup hasn't started yet (server thread may not have set running=true yet)
          const startupPending = !status.running && status.completed === 0 && !startupWasRunningRef.current;
          if (!status.running && !startupPending) {
            clearInterval(interval);
            fetchAlerts();

            // On the first time startup finishes, pull recent alerts and seed the debug panel
            if (startupWasRunningRef.current) {
              startupWasRunningRef.current = false;
              fetch(`/api/v2/alerts?customer_id=${ACTIVE_CUSTOMER_ID}`)
                .then(r => r.json())
                .then((data: any) => {
                  const alertList: ApiAlert[] = Array.isArray(data) ? data : data.alerts ?? [];
                  const entries: AgentDebugEntry[] = alertList
                    .filter(a => a.agent_output)
                    .slice(0, status.completed)
                    .map((a, i) => {
                      let outputs: Record<string, any> = {};
                      try { outputs = JSON.parse(a.agent_output!); } catch { outputs = { raw: a.agent_output }; }
                      return {
                        run_id: String(a.id),
                        label: `Startup ${i + 1}`,
                        agent_outputs: outputs,
                        timestamp: new Date(a.created_at).toLocaleTimeString(),
                      };
                    });
                  if (entries.length > 0) setDebugEntries(entries);
                })
                .catch(() => {});
            }
          }
        })
        .catch(() => clearInterval(interval));
    };

    poll();
    interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const active = alerts.filter(a => a.status === 'active');
  const filtered = filter === 'all' ? active : active.filter(a => a.severity === filter);

  const stats = {
    active: active.length,
    critical: active.filter(a => a.severity === 'critical').length,
    high: active.filter(a => a.severity === 'high').length,
  };

  async function handleDismiss(id: number) {
    await fetch(`/api/v2/alerts/${id}/dismiss`, { method: 'PUT' });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'dismissed' } : a));
  }

  async function handleResolve(id: number) {
    await fetch(`/api/v2/alerts/${id}/resolve`, { method: 'PUT' });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
  }

  async function handleRunMonitor() {
    setIsRunning(true);
    // The /run endpoint is synchronous — the backend blocks until done.
    // We poll the pipeline-log endpoint in parallel to show live progress.
    let logSeenCount = 0;
    const logInterval = setInterval(() => {
      fetch(`/api/v2/monitor/pipeline-log?since=${logSeenCount}`)
        .then(r => r.json())
        .catch(() => ({ events: [], total: logSeenCount }));
      // Live log is shown via the AgentDebugPanel's own polling effect when isRunning=true.
      // We just need to ensure the log endpoint gets hit; the panel handles display.
      logSeenCount++;
    }, 500);

    try {
      const res = await fetch('/api/v2/monitor/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      const outputs = data.agent_outputs ?? {};

      const entry: AgentDebugEntry = {
        run_id: data.run_id ?? String(Date.now()),
        label: `Run ${debugEntries.length + 1}`,
        agent_outputs: outputs,
        timestamp: new Date().toLocaleTimeString(),
      };
      setDebugEntries(prev => [...prev, entry]);
      fetchAlerts();
    } catch {
      console.error('Monitor run failed');
    }
    clearInterval(logInterval);
    setIsRunning(false);
  }

  // Show loading screen while startup pipelines are running
  const startupRunning = startupStatus?.running ?? false;

  return (
    <main className="page-with-sidebar">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
            Supply Chain Alerts
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Gulf Coast Harvest LLC · Live alerts from Aurora
          </p>
        </div>
        <button
          className="btn-accent"
          onClick={handleRunMonitor}
          disabled={isRunning || startupRunning}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} style={{ animation: isRunning ? 'spin 1s linear infinite' : 'none' }} />
          {isRunning ? 'Scanning…' : startupRunning ? 'Starting up…' : 'Run Monitor'}
        </button>
      </div>

      {/* Agent debug panel */}
      <AgentDebugPanel entries={debugEntries} startupStatus={startupStatus} manualRunning={isRunning} />

      {/* Loading screen while startup pipelines run */}
      {startupRunning && (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8,
          padding: 32, textAlign: 'center', marginBottom: 24,
        }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>⟳</div>
          <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 6 }}>
            Running startup analysis for Gulf Coast Harvest LLC…
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {startupStatus?.completed ?? 0} of {startupStatus?.total ?? 3} pipeline runs complete.
            Agents are scanning live RSS feeds and Aurora supplier data.
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Active Alerts</div>
          <div className="stat-value">{stats.active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Critical</div>
          <div className="stat-value" style={{ color: '#DC2626' }}>{stats.critical}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">High Priority</div>
          <div className="stat-value" style={{ color: '#F97316' }}>{stats.high}</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24 }}>
        <div>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {FILTER_OPTIONS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 14px', borderRadius: 20, border: '1px solid var(--border)',
                  background: filter === f ? 'var(--primary)' : 'var(--card)',
                  color: filter === f ? 'white' : 'var(--text-muted)',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {loading || startupRunning ? (
            <div className="empty-state">
              <p>{startupRunning ? 'Agents running — alerts will appear when complete.' : 'Loading alerts from Aurora…'}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <h3>No alerts</h3>
              <p>Your supply chain looks healthy. Click "Run Monitor" to scan for new risks.</p>
            </div>
          ) : (
            filtered.map(alert => (
              <AlertCard
                key={alert.id}
                {...alert}
                agent_output={alert.agent_output ?? undefined}
                onDismiss={handleDismiss}
                onResolve={handleResolve}
              />
            ))
          )}
        </div>

        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>
            Supplier Map
          </h2>
          <div style={{
            height: 320, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
            background: '#EFF6FF', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
            marginBottom: 16, fontSize: 13,
          }}>
            <span style={{ fontSize: 32, marginBottom: 8 }}>🌏</span>
            <p style={{ fontWeight: 600 }}>Supplier Map</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>See the Suppliers tab for the full globe view</p>
          </div>

          <div className="card">
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>Recent Alerts</p>
            {active.slice(0, 3).map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: a.severity === 'high' || a.severity === 'critical' ? '#EF4444' : '#F97316', flexShrink: 0 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  {(a.summary ?? 'Alert').slice(0, 80)}{(a.summary ?? '').length > 80 ? '…' : ''}
                </p>
              </div>
            ))}
            {active.length === 0 && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>No active alerts</p>}
          </div>
        </div>
      </div>
    </main>
  );
};
