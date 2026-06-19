import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import {
  SectionHeader,
  SettingsCard,
  CardTitle,
  FieldRow,
  FieldLabel,
  SelectInput,
  ToggleSwitch,
  SaveFooter,
} from './SettingsUI';

interface Props {
  onSave: () => void;
  saveFlash: boolean;
}

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical only' },
  { value: 'high', label: 'High & above' },
  { value: 'medium', label: 'Medium & above' },
  { value: 'low', label: 'All (Low & above)' },
];

// Severity badge used inline
const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'rgba(220,38,38,0.15)',  text: '#fca5a5' },
  high:     { bg: 'rgba(234,88,12,0.15)',  text: '#fdba74' },
  medium:   { bg: 'rgba(217,119,6,0.15)',  text: '#fcd34d' },
  low:      { bg: 'rgba(107,114,128,0.15)', text: '#9ca3af' },
};

function SeverityBadge({ level }: { level: string }) {
  const c = SEVERITY_COLORS[level];
  if (!c) return null;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 7px',
      borderRadius: 4,
      fontSize: 9.5,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      background: c.bg,
      color: c.text,
      fontFamily: 'Inter, sans-serif',
      marginLeft: 6,
    }}>
      {level}
    </span>
  );
}

interface NotifRowProps {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
  badge?: string;
}

function NotifRow({ label, hint, checked, onChange, last, badge }: NotifRowProps) {
  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.04)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
    }}>
      <div>
        <div style={{
          fontSize: 12,
          fontWeight: 500,
          color: '#c4bfb0',
          fontFamily: 'Inter, sans-serif',
          display: 'flex',
          alignItems: 'center',
        }}>
          {label}
          {badge && <SeverityBadge level={badge} />}
        </div>
        <div style={{
          fontSize: 10,
          color: 'rgba(107,106,94,0.7)',
          marginTop: 3,
          fontFamily: 'Inter, sans-serif',
        }}>
          {hint}
        </div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

export function AlertPreferencesSection({ onSave, saveFlash }: Props) {
  const [severityThreshold, setSeverityThreshold] = useState('high');
  const [emailNotifs, setEmailNotifs]             = useState(true);
  const [browserNotifs, setBrowserNotifs]         = useState(true);
  const [dailyBriefing, setDailyBriefing]         = useState(true);
  const [tariffAlerts, setTariffAlerts]           = useState(true);
  const [supplierRiskAlerts, setSupplierRiskAlerts] = useState(true);
  const [complianceAlerts, setComplianceAlerts]   = useState(false);

  return (
    <div>
      <SectionHeader
        icon={Bell}
        title="Alert Preferences"
        description="Control how and when CoastGuard notifies you. The severity threshold filters which events trigger the AI agent pipeline and reach your inbox."
      />

      <SettingsCard>
        <CardTitle>Alert Thresholds</CardTitle>

        <FieldRow>
          <FieldLabel hint="Only events at or above this severity will trigger the 5-agent pipeline">
            Severity Threshold
          </FieldLabel>
          <div>
            <SelectInput
              value={severityThreshold}
              onChange={setSeverityThreshold}
              options={SEVERITY_OPTIONS}
            />
            <div style={{
              marginTop: 8,
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
            }}>
              {(['critical','high','medium','low'] as const).map((s) => {
                const active = (
                  s === 'critical' ||
                  (severityThreshold === 'high'   && ['critical','high'].includes(s)) ||
                  (severityThreshold === 'medium' && ['critical','high','medium'].includes(s)) ||
                  (severityThreshold === 'low')
                );
                return (
                  <span key={s} style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    background: active ? SEVERITY_COLORS[s].bg : 'rgba(255,255,255,0.04)',
                    color: active ? SEVERITY_COLORS[s].text : 'rgba(107,106,94,0.4)',
                    border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.04)'}`,
                    transition: 'all 0.2s',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {s}
                  </span>
                );
              })}
            </div>
          </div>
        </FieldRow>

        <FieldRow last>
          <FieldLabel hint="Alert types that will be monitored for your supply chain">
            Active Alert Types
          </FieldLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { key: 'tariff', label: 'Tariff changes & trade policy', checked: tariffAlerts, setter: setTariffAlerts },
              { key: 'supplier', label: 'Supplier risk & disruptions', checked: supplierRiskAlerts, setter: setSupplierRiskAlerts },
              { key: 'compliance', label: 'Import compliance & sanctions', checked: complianceAlerts, setter: setComplianceAlerts },
            ].map((item) => (
              <label
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  cursor: 'pointer',
                }}
              >
                <div
                  onClick={() => item.setter(!item.checked)}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: `1.5px solid ${item.checked ? '#f59e0b' : 'rgba(255,255,255,0.18)'}`,
                    background: item.checked ? 'rgba(245,158,11,0.2)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                  }}
                >
                  {item.checked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span style={{
                  fontSize: 12,
                  color: item.checked ? '#c4bfb0' : 'rgba(107,106,94,0.6)',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'color 0.15s',
                }}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </FieldRow>
      </SettingsCard>

      <SettingsCard>
        <CardTitle>Notification Delivery</CardTitle>

        <NotifRow
          label="Email Notifications"
          hint="Receive alert summaries and agent analysis reports via email"
          checked={emailNotifs}
          onChange={setEmailNotifs}
        />
        <NotifRow
          label="Browser Notifications"
          hint="Show desktop push notifications for new critical and high severity alerts"
          checked={browserNotifs}
          onChange={setBrowserNotifs}
        />
        <NotifRow
          label="Daily Briefing"
          hint="Morning digest of overnight tariff changes, news events, and supply chain status"
          checked={dailyBriefing}
          onChange={setDailyBriefing}
          last
        />
      </SettingsCard>

      <SaveFooter onSave={onSave} flash={saveFlash} />
    </div>
  );
}
