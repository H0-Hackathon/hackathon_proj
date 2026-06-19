import React from 'react';
import {
  RefreshCw,
  Globe,
  AlertTriangle,
  Layers,
  DollarSign,
  Users,
  MapPin,
  Activity,
} from 'lucide-react';
import { TradeGlobe, DisruptionPoint, TradeGlobeSupplier } from '../components/TradeGlobe';
import { AgentDebugPanel, AgentState, AgentDebugTarget } from '../components/AgentDebugPanel';
import { NewsTicker } from '../components/dashboard/NewsTicker';
import { LiveAgentResults, AgentResults } from '../components/dashboard/LiveAgentResults';
import api from '../services/api';

/**
 * AlertsDashboard — Main CoastGuard command center.
 *
 * Visual design / layout: frontend redesign (map-centric command center).
 * Backend integration preserved from the Samved branch:
 *   - GET  /api/v2/alerts?customer_id=N            alert feed
 *   - GET  /api/v2/disruptions?customer_id=N       globe markers
 *   - GET  /api/v2/suppliers + /api/v2/geo/...     suppliers with coordinates
 *   - POST /api/v2/monitor/run                     trigger pipeline run
 *   - GET  /api/v2/monitor/pipeline-log?since=N    poll live log during run
 *   - PUT  /api/v2/alerts/{id}/dismiss|resolve     alert actions
 *
 * Auth is removed; ACTIVE_CUSTOMER_ID is set to the seeded demo customer.
 * Replace with the auth token's customer id once Clerk is wired.
 */

const ACTIVE_CUSTOMER_ID = 69;

type Severity = 'critical' | 'high' | 'medium' | 'low';

interface ApiAlert {
  id: number;
  alert_type: string;
  severity: Severity;
  summary: string | null;
  agent_output: string | null;
  status: string;
  created_at: string;
}

interface ApiSupplier {
  id: number;
  name: string;
  country: string;
  product_category: string | null;
  reliability_score: number;
  is_active: boolean;
}

interface GeoCoords {
  country: string;
  code: string | null;
  latitude: number;
  longitude: number;
  location_name: string;
}

interface SupplierWithGeo extends ApiSupplier {
  latitude: number | null;
  longitude: number | null;
  countryCode: string | null;
}

export interface MonitorTarget {
  supplier_country: string;
  country_name: string;
  hs_code: string;
  supplier_name: string | null;
  product_category: string | null;
}

interface DebugState {
  target?: AgentDebugTarget | null;
  targetIndex?: number;
  totalTargets?: number;
  agentStates: Record<string, AgentState>;
  logs: string[];
}

const MAP_LAYERS = [
  { id: 'suppliers',   label: 'Suppliers',       color: '#10b981' },
  { id: 'routes',      label: 'Exposure Routes', color: '#f59e0b' },
  { id: 'risk',        label: 'Risk Zones',      color: '#dc2626' },
  { id: 'alt',         label: 'Alternatives',    color: '#14b8a6' },
];

export const AlertsDashboard: React.FC = () => {
  const [alerts, setAlerts] = React.useState<ApiAlert[]>([]);
  const [disruptions, setDisruptions] = React.useState<DisruptionPoint[]>([]);
  const [suppliers, setSuppliers] = React.useState<SupplierWithGeo[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [debugState, setDebugState] = React.useState<DebugState | null>(null);
  const [activeLayers, setActiveLayers] = React.useState<Set<string>>(
    new Set(['suppliers', 'routes', 'risk'])
  );
  const [lastSync] = React.useState(() => new Date().toISOString());

  // Real agent outputs (TariffMonitor, ImpactCalculator, AlternativesFinder,
  // ImportCompliance, Adversarial), surfaced live from the SSE stream during a
  // run and from the latest persisted alert (TariffAlert.agent_output) on load.
  const [agentResults, setAgentResults] = React.useState<AgentResults>({});
  const [agentStatus, setAgentStatus] = React.useState<Record<string, 'running' | 'done'>>({});
  const [agentsUpdatedAt, setAgentsUpdatedAt] = React.useState<string | null>(null);
  const [agentSupplier, setAgentSupplier] = React.useState<string | null>(null);
  const [lastRunAt, setLastRunAt] = React.useState<string | null>(null);

  // ── Data fetching (backend integration) ──────────────────────────────────
  async function fetchAlerts() {
    const res = await api.get<ApiAlert[]>('/v2/alerts', { params: { customer_id: ACTIVE_CUSTOMER_ID } });
    setAlerts(res.data);
  }

  async function fetchDisruptions() {
    const res = await api.get<DisruptionPoint[]>('/v2/disruptions', { params: { customer_id: ACTIVE_CUSTOMER_ID } });
    setDisruptions(res.data);
  }

  async function fetchSuppliers() {
    const res = await api.get<ApiSupplier[]>('/v2/suppliers', { params: { customer_id: ACTIVE_CUSTOMER_ID } });
    const withGeo = await Promise.all(
      res.data.map(async (s): Promise<SupplierWithGeo> => {
        try {
          const geo = await api.get<GeoCoords>('/v2/geo/supplier-coords', { params: { country: s.country } });
          return { ...s, latitude: geo.data.latitude, longitude: geo.data.longitude, countryCode: geo.data.code };
        } catch {
          return { ...s, latitude: null, longitude: null, countryCode: null };
        }
      })
    );
    setSuppliers(withGeo);
  }

  React.useEffect(() => {
    (async () => {
      try {
        await Promise.all([fetchAlerts(), fetchDisruptions(), fetchSuppliers()]);
      } catch (err) {
        // backend offline — globe falls back to its built-in demo data
        console.error('Failed to load dashboard data', err);
      }
    })();
  }, []);

  // Surface the most recent persisted agent run (TariffAlert.agent_output) so
  // real Agent 1/2 data is visible on page load without re-running. Skipped
  // while a live run is streaming (SSE updates take precedence).
  React.useEffect(() => {
    if (isRunning) return;
    for (const a of alerts) {
      if (!a.agent_output) continue;
      try {
        const parsed = JSON.parse(a.agent_output);
        if (parsed && (parsed.tariff_monitor || parsed.impact_calculator)) {
          setAgentResults(parsed);
          setAgentsUpdatedAt(a.created_at);
          setAgentSupplier(parsed.tariff_monitor?.country ?? null);
          break;
        }
      } catch {
        // non-JSON agent_output — skip
      }
    }
  }, [alerts, isRunning]);

  // ── Alert actions (backend integration) ──────────────────────────────────
  async function handleDismiss(id: number) {
    await api.put(`/v2/alerts/${id}/dismiss`);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'dismissed' } : a)));
  }

  async function handleResolve(id: number) {
    await api.put(`/v2/alerts/${id}/resolve`);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'resolved' } : a)));
  }

  // ── Monitor run: POST /monitor/run + poll /monitor/pipeline-log ──────────
  // Fires the synchronous pipeline endpoint and polls the live log every
  // 1.5 s so the user sees text progress during the 1–3 min run.
  // Structured `agent_result` events (emitted by the pipeline after parsing)
  // are picked up by the poller and surface in LiveAgentResults + AgentDebugPanel.
  async function handleRunMonitor() {
    setIsRunning(true);
    setDebugState({ agentStates: {}, logs: [] });
    setAgentResults({});
    setAgentStatus({});
    setAgentsUpdatedAt(null);
    setAgentSupplier(null);

    let pollSince = 0;

    const poll = async () => {
      try {
        const res = await api.get<{
          events: Array<{ event: string; msg: string; ts: string }>;
          total: number;
        }>('/v2/monitor/pipeline-log', { params: { since: pollSince } });
        const { events, total } = res.data;
        pollSince = total;
        for (const ev of events) {
          if (ev.event === 'agent_result') {
            try {
              const payload = JSON.parse(ev.msg) as { agent: string; output: Record<string, unknown> };
              const { agent, output } = payload;
              setAgentResults((prev) => ({ ...prev, [agent]: output }));
              setAgentStatus((prev) => ({ ...prev, [agent]: 'done' }));
              setDebugState((prev) =>
                prev
                  ? { ...prev, agentStates: { ...prev.agentStates, [agent]: { status: 'done', output } } }
                  : prev,
              );
              setAgentsUpdatedAt(new Date().toISOString());
              if (agent === 'tariff_monitor') {
                setAgentSupplier((output as { country?: string }).country ?? null);
              }
            } catch {
              // malformed agent_result payload — skip
            }
          } else {
            // Text log event — surface in the debug log panel
            const text = `[${ev.event}] ${ev.msg}`;
            setDebugState((prev) =>
              prev ? { ...prev, logs: [...prev.logs.slice(-300), text] } : prev,
            );
          }
        }
      } catch {
        // Poll failure — ignore, will retry on next interval
      }
    };

    const pollInterval = setInterval(poll, 1500);

    try {
      await api.post('/v2/monitor/run', { customer_id: ACTIVE_CUSTOMER_ID });
      // Final poll to catch any events emitted in the last interval window
      await poll();
      await Promise.all([fetchAlerts(), fetchDisruptions()]);
      setLastRunAt(new Date().toISOString());
    } catch (err) {
      console.error('Run Analysis failed', err);
    } finally {
      clearInterval(pollInterval);
      setIsRunning(false);
    }
  }

  function toggleLayer(id: string) {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const active = alerts.filter((a) => a.status === 'active');
  const critical = active.filter((a) => a.severity === 'critical').length;
  const countryCount = new Set(suppliers.map((s) => s.country)).size;

  // Real direct-cost figure from Agent 2 (ImpactCalculator); null until a run.
  const agentMonitor = agentResults.tariff_monitor;
  const agentImpact = agentResults.impact_calculator;
  const exposureValue = agentImpact?.direct_cost ?? agentImpact?.extra_cost_usd ?? null;

  // ── KPI cards derived from real monitor results (no hardcoded values) ──────
  // Cumulative direct-cost exposure across active alerts' ImpactCalculator output.
  const activeParsed = active.map((a) => {
    try { return a.agent_output ? JSON.parse(a.agent_output) : {}; } catch { return {}; }
  });
  const totalExposure = activeParsed.reduce(
    (sum, p) => sum + (p?.impact_calculator?.direct_cost ?? p?.impact_calculator?.extra_cost_usd ?? 0),
    0
  );
  const criticalEvents = active.filter((a) => a.severity === 'critical' || a.severity === 'high').length;
  const latestAo = activeParsed[0] ?? {};
  const proposedOptions: any[] = latestAo?.alternatives_finder?.options ?? latestAo?.alternatives_finder?.alternatives ?? [];
  const proposedSuppliersCount = proposedOptions.length;

  const fmtMoney = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}K` : `$${Math.round(n)}`;

  // Each card is only shown when its underlying real data exists; otherwise it
  // is hidden (no placeholder values).
  const kpiCards = [
    {
      key: 'exposure',
      available: totalExposure > 0,
      label: 'Trade Exposure',
      value: fmtMoney(totalExposure),
      sub: `${active.length} active alert${active.length !== 1 ? 's' : ''}`,
      icon: DollarSign, color: '#dc2626', bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.15)',
    },
    {
      key: 'proposed',
      available: proposedSuppliersCount > 0,
      label: 'Proposed Suppliers',
      value: String(proposedSuppliersCount),
      sub: 'before compliance review',
      icon: Users, color: '#ea580c', bg: 'rgba(234,88,12,0.06)', border: 'rgba(234,88,12,0.15)',
    },
    {
      key: 'events',
      available: active.length > 0,
      label: 'Critical Events',
      value: String(criticalEvents),
      sub: `${active.length} active alert${active.length !== 1 ? 's' : ''}`,
      icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)',
    },
    {
      key: 'countries',
      available: suppliers.length > 0,
      label: 'Countries',
      value: String(countryCount),
      sub: `${suppliers.length} supplier${suppliers.length !== 1 ? 's' : ''}`,
      icon: MapPin, color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)',
    },
  ].filter((c) => c.available);

  // Suppliers with resolved coordinates feed the globe (backend-driven risk).
  const tradeGlobeSuppliers: TradeGlobeSupplier[] = suppliers
    .filter((s): s is SupplierWithGeo & { latitude: number; longitude: number } => s.latitude != null && s.longitude != null)
    .map((s) => ({ name: s.name, country: s.country, countryCode: s.countryCode, latitude: s.latitude, longitude: s.longitude }));

  const syncTime = new Date(lastSync).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <main className="page-with-sidebar" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>

      {/* ── Command Bar ──────────────────────────────────────────────────── */}
      <div style={{
        height: 52,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px 0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.045)',
        background: 'rgba(10,10,12,0.97)',
        backdropFilter: 'blur(16px)',
        zIndex: 30,
      }}>
        {/* Left: title + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#e8e3d8',
              letterSpacing: '-0.2px',
              lineHeight: 1,
            }}>
              Trade Risk Intelligence
            </div>
            <div style={{
              fontSize: 10,
              color: 'rgba(120,110,80,0.75)',
              marginTop: 3,
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.02em',
            }}>
              {suppliers.length > 0
                ? `${suppliers.length} suppliers · ${countryCount} countries · synced ${syncTime}`
                : `synced ${syncTime}`}
            </div>
          </div>

          {/* Live pulse */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            background: 'rgba(16,185,129,0.07)',
            border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: 5,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 6px #10b981',
              display: 'inline-block',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', color: '#6ee7b7' }}>
              LIVE
            </span>
          </div>

          {/* Critical alert badge */}
          {critical > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              background: 'rgba(220,38,38,0.08)',
              border: '1px solid rgba(220,38,38,0.2)',
              borderRadius: 5,
            }}>
              <AlertTriangle size={10} color="#dc2626" />
              <span style={{ fontSize: 9.5, fontWeight: 700, color: '#fca5a5', letterSpacing: '0.06em' }}>
                {critical} CRITICAL
              </span>
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="btn-accent"
            onClick={handleRunMonitor}
            disabled={isRunning}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, padding: '6px 14px', borderRadius: 6,
            }}
          >
            <RefreshCw
              size={11}
              style={{ animation: isRunning ? 'spin 1s linear infinite' : 'none' }}
            />
            {isRunning ? 'Scanning…' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {/* ── Body: Globe (centre) + Panel (right) ─────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 288px',
        minHeight: 0,
        overflow: 'hidden',
      }}>

        {/* ── Globe column ────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
          position: 'relative',
        }}>

          {/* Globe fills the entire centre area */}
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            <TradeGlobe suppliers={tradeGlobeSuppliers} disruptions={disruptions} />

            {/* Globe label — top-left */}
            <div style={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(8,8,10,0.75)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(245,158,11,0.12)',
                borderRadius: 6,
                padding: '5px 10px',
              }}>
                <Globe size={11} color="#f59e0b" />
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(200,185,140,0.85)',
                }}>
                  Live Exposure Map
                </span>
              </div>
            </div>

            {/* Layer toggles overlay — top-right */}
            <div style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(8,8,10,0.78)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: '10px 13px',
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 7,
            }}>
              <div style={{
                fontSize: 8.5,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(130,120,90,0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                marginBottom: 1,
              }}>
                <Layers size={9} color="rgba(245,158,11,0.6)" />
                Layers
              </div>
              {MAP_LAYERS.map((layer) => {
                const on = activeLayers.has(layer.id);
                return (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '1px 0',
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: 2, flexShrink: 0,
                      background: on ? layer.color : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${on ? layer.color + '80' : 'rgba(255,255,255,0.08)'}`,
                      transition: 'background 0.15s, border-color 0.15s',
                      boxShadow: on ? `0 0 6px ${layer.color}50` : 'none',
                    }} />
                    <span style={{
                      fontSize: 10,
                      color: on ? 'rgba(232,227,216,0.9)' : 'rgba(100,90,70,0.7)',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'color 0.15s',
                    }}>
                      {layer.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Trade Wire ticker */}
          <div style={{ height: 52, flexShrink: 0 }}>
            <NewsTicker customerId={ACTIVE_CUSTOMER_ID} lastRunAt={lastRunAt} />
          </div>
        </div>

        {/* ── Right Intelligence Panel ────────────────────────────────────── */}
        <div style={{
          borderLeft: '1px solid rgba(255,255,255,0.045)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'rgba(10,10,12,0.92)',
        }}>

          {/* Panel header */}
          <div style={{
            padding: '12px 16px 10px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <Activity size={11} color="#f59e0b" />
            <span style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(180,165,120,0.7)',
            }}>
              Intelligence Panel
            </span>
            {isRunning && (
              <span style={{
                marginLeft: 'auto',
                fontSize: 8.5, fontWeight: 700,
                color: '#dc2626',
                letterSpacing: '0.08em',
                animation: 'pulse-dot 1.2s ease-in-out infinite',
              }}>
                RUNNING
              </span>
            )}
          </div>

          {/* KPI metric cards */}
          {kpiCards.length > 0 && (
            <div style={{
              padding: '12px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              flexShrink: 0,
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 6,
              }}>
                {kpiCards.map(({ key, label, value, sub, icon: Icon, color, bg, border }) => (
                  <div
                    key={key}
                    style={{
                      background: bg,
                      border: `1px solid ${border}`,
                      borderRadius: 7,
                      padding: '9px 11px',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginBottom: 6,
                    }}>
                      <Icon size={9} color={color} />
                      <span style={{
                        fontSize: 8,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'rgba(130,120,90,0.65)',
                      }}>
                        {label}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color,
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1,
                      marginBottom: 3,
                      letterSpacing: '-0.5px',
                    }}>
                      {value}
                    </div>
                    <div style={{
                      fontSize: 9,
                      color: 'rgba(110,100,75,0.8)',
                    }}>
                      {sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent reasoning chain + debug stream */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '14px 14px 16px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(245,158,11,0.08) transparent',
          }}>
            {/* Live agent pipeline */}
            <LiveAgentResults
              agents={agentResults}
              agentStatus={agentStatus}
              supplier={agentSupplier}
              updatedAt={agentsUpdatedAt}
              live={isRunning}
            />

            {/* Raw log stream while a run is in-flight */}
            {debugState && (
              <div style={{ marginTop: 12 }}>
                <AgentDebugPanel
                  agentStates={debugState.agentStates}
                  logs={debugState.logs}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
