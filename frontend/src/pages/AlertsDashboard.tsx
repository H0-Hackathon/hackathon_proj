import React from 'react';
import { RefreshCw } from 'lucide-react';
import { AlertCard, AlertSeverity, AlertType } from '../components/AlertCard';

/**
 * AlertsDashboard — Main CoastGuard dashboard page.
 *
 * Phase 1: Displays hardcoded mock alerts with empty-state fallback.
 *          No API calls yet (backend models added in Phase 2).
 *
 * Phase 2: Replace MOCK_ALERTS with real API calls to
 *          GET /api/v2/alerts?customer_id=1
 */

// ── Hardcoded mock alerts for Phase 1 demo ──────────────────
const MOCK_ALERTS = [
  {
    id: 1,
    alert_type: 'tariff_change' as AlertType,
    severity: 'high' as AlertSeverity,
    summary:
      'Your pending $40,000 order from Mekong Textiles Co (Vietnam, HS 6109.10) will cost $10,000 more due to a new 25% US tariff effective July 1, 2026.',
    agent_output: JSON.stringify({
      tariff_monitor: {
        risk_detected: true,
        event: '25% tariff added on HS 6109.10 from VN',
        confidence: 0.92,
        source: 'mock_usitc',
      },
      impact_calculator: {
        extra_cost_usd: 10000,
        severity: 'high',
        affected_orders: 1,
      },
      alternatives_finder: {
        options: [
          { supplier: 'Dhaka Garments Ltd', country: 'BD', lead_time_weeks: 8 },
          { supplier: 'Mumbai Exports', country: 'IN', lead_time_weeks: 5 },
        ],
      },
      import_compliance: {
        BD: ['Certificate of Origin', 'Commercial Invoice update'],
        IN: ['BIS certification check', 'Certificate of Origin'],
      },
      adversarial: {
        verdict: 'CAUTION',
        flags: ['Bangladesh misses Aug 1 deadline by ~1 week'],
        recommendation:
          'Use Mumbai Exports (IN). Negotiate 1-week extension with buyer.',
      },
    }),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
  },
  {
    id: 2,
    alert_type: 'geopolitical' as AlertType,
    severity: 'medium' as AlertSeverity,
    summary:
      'Political unrest reported in the Mekong Delta region near your supplier\'s manufacturing hub. No current shipping impact, but monitor closely.',
    agent_output: null,
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 1d ago
  },
];

type FilterSeverity = 'all' | AlertSeverity;

const FILTER_OPTIONS: FilterSeverity[] = ['all', 'critical', 'high', 'medium', 'low'];

export const AlertsDashboard: React.FC = () => {
  const [alerts, setAlerts] = React.useState(MOCK_ALERTS);
  const [filter, setFilter] = React.useState<FilterSeverity>('all');
  const [isRunning, setIsRunning] = React.useState(false);

  const filtered = filter === 'all'
    ? alerts
    : alerts.filter((a) => a.severity === filter);

  function handleDismiss(id: number) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  function handleResolve(id: number) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleRunMonitor() {
    setIsRunning(true);
    // Phase 1: simulate a 2s delay then show a new mock alert
    await new Promise((r) => setTimeout(r, 2000));
    setAlerts((prev) => [
      {
        id: Date.now(),
        alert_type: 'port_disruption' as AlertType,
        severity: 'medium' as AlertSeverity,
        summary:
          'Storm warning issued for the South China Sea shipping lanes. Your shipment from Ho Chi Minh City may experience a 3–5 day delay.',
        agent_output: null,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    setIsRunning(false);
  }

  const stats = {
    active: alerts.length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high: alerts.filter((a) => a.severity === 'high').length,
  };

  return (
    <main className="page-with-sidebar">
      {/* Page heading */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--primary)',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 4,
            }}
          >
            Supply Chain Alerts
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            business_id = 1 · mock mode · Phase 1
          </p>
        </div>

        <button
          className="btn-accent"
          onClick={handleRunMonitor}
          disabled={isRunning}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} style={{ animation: isRunning ? 'spin 1s linear infinite' : 'none' }} />
          {isRunning ? 'Scanning...' : 'Run Monitor'}
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Active Alerts</div>
          <div className="stat-value">{stats.active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">High Priority</div>
          <div className="stat-value" style={{ color: '#F97316' }}>{stats.high}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monitored Suppliers</div>
          <div className="stat-value">2</div>
        </div>
      </div>

      {/* Two-column layout: alerts + map */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24 }}>

        {/* Left: Alert list */}
        <div>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 14px',
                  borderRadius: 20,
                  border: '1px solid var(--border)',
                  background: filter === f ? 'var(--primary)' : 'var(--card)',
                  color: filter === f ? 'white' : 'var(--text-muted)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Alert cards */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <h3>No alerts</h3>
              <p>Your supply chain looks healthy. Click "Run Monitor" to scan for new risks.</p>
            </div>
          ) : (
            filtered.map((alert) => (
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

        {/* Right: Map placeholder + mini stats */}
        <div>
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--primary)',
              marginBottom: 12,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Supplier Map
          </h2>

          {/* Globe placeholder — Phase 2 wires in SupplierMap (deck.gl) */}
          <div
            style={{
              height: 320,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: '#EFF6FF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            <span style={{ fontSize: 32, marginBottom: 8 }}>🌏</span>
            <p style={{ fontWeight: 600 }}>Supplier Map</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>Globe visualization — Phase 2</p>
          </div>

          {/* Supplier list preview */}
          <div className="card">
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>
              Tracked Suppliers
            </p>
            {[
              { name: 'Mekong Textiles Co', country: 'Vietnam', flag: '🇻🇳', status: 'at-risk' },
              { name: 'Dhaka Garments Ltd', country: 'Bangladesh', flag: '🇧🇩', status: 'ok' },
            ].map((s) => (
              <div
                key={s.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 0',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 12,
                }}
              >
                <span style={{ fontSize: 18 }}>{s.flag}</span>
                <div>
                  <p style={{ fontWeight: 600 }}>{s.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{s.country}</p>
                </div>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 10,
                    fontWeight: 700,
                    color: s.status === 'at-risk' ? '#EF4444' : '#10B981',
                  }}
                >
                  {s.status === 'at-risk' ? '⚠ AT RISK' : '✓ OK'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};
