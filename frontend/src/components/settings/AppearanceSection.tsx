import React, { useState } from 'react';
import { Palette, Monitor, Sun, Moon } from 'lucide-react';
import {
  SectionHeader,
  SettingsCard,
  CardTitle,
  FieldRow,
  FieldLabel,
  ToggleSwitch,
  SaveFooter,
} from './SettingsUI';

interface Props {
  onSave: () => void;
  saveFlash: boolean;
}

type Theme = 'dark' | 'light' | 'system';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ElementType;
  preview: { bg: string; surface: string; accent: string; text: string };
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon,
    preview: { bg: '#0e0e10', surface: '#141416', accent: '#f59e0b', text: '#e8e3d8' },
  },
  {
    value: 'light',
    label: 'Light',
    icon: Sun,
    preview: { bg: '#f8f7f4', surface: '#ffffff', accent: '#d97706', text: '#1a1a18' },
  },
  {
    value: 'system',
    label: 'System',
    icon: Monitor,
    preview: { bg: '#1c1c1f', surface: '#28282c', accent: '#f59e0b', text: '#c8c2b6' },
  },
];

function ThemeCard({
  option,
  active,
  onClick,
}: {
  option: ThemeOption;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = option.icon;
  const p = option.preview;

  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 1 0',
        border: `2px solid ${active ? '#f59e0b' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 9,
        background: active ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)',
        cursor: 'pointer',
        padding: '12px 12px 14px',
        textAlign: 'left',
        transition: 'all 0.18s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Mini preview */}
      <div style={{
        borderRadius: 5,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 10,
        height: 52,
        background: p.bg,
        display: 'flex',
        gap: 4,
        padding: 5,
      }}>
        {/* Fake sidebar */}
        <div style={{ width: 16, background: p.surface, borderRadius: 3, flexShrink: 0 }}>
          {[0,1,2,3].map((i) => (
            <div key={i} style={{
              height: 4,
              background: i === 0 ? p.accent : 'rgba(255,255,255,0.08)',
              borderRadius: 2,
              margin: '4px 2px 0',
            }} />
          ))}
        </div>
        {/* Main area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ height: 6, background: p.surface, borderRadius: 2, width: '70%' }} />
          <div style={{ display: 'flex', gap: 3, flex: 1 }}>
            <div style={{ flex: 1, background: p.surface, borderRadius: 3 }}>
              <div style={{ height: 3, background: p.accent, borderRadius: 2, margin: '4px 3px 0', width: '60%', opacity: 0.7 }} />
            </div>
            <div style={{ flex: 1, background: p.surface, borderRadius: 3 }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon size={12} color={active ? '#f59e0b' : '#6b6a5e'} />
        <span style={{
          fontSize: 12,
          fontWeight: active ? 600 : 400,
          color: active ? '#e8e3d8' : 'rgba(160,150,120,0.7)',
          fontFamily: 'Inter, sans-serif',
        }}>
          {option.label}
        </span>
        {active && (
          <span style={{
            marginLeft: 'auto',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#f59e0b',
            boxShadow: '0 0 6px rgba(245,158,11,0.5)',
          }} />
        )}
      </div>
    </button>
  );
}

export function AppearanceSection({ onSave, saveFlash }: Props) {
  const [theme, setTheme]           = useState<Theme>('dark');
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);

  return (
    <div>
      <SectionHeader
        icon={Palette}
        title="Appearance"
        description="Customize how CoastGuard looks and feels. The dark theme is optimized for extended monitoring sessions and low-light trading environments."
      />

      <SettingsCard>
        <CardTitle>Theme</CardTitle>

        <div style={{ padding: '16px 20px' }}>
          <p style={{
            fontSize: 11,
            color: 'rgba(107,106,94,0.7)',
            marginBottom: 14,
            fontFamily: 'Inter, sans-serif',
          }}>
            Choose the color scheme for your CoastGuard workspace.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {THEME_OPTIONS.map((opt) => (
              <ThemeCard
                key={opt.value}
                option={opt}
                active={theme === opt.value}
                onClick={() => setTheme(opt.value)}
              />
            ))}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard>
        <CardTitle>Display Options</CardTitle>

        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#c4bfb0', fontFamily: 'Inter, sans-serif' }}>
              Compact Mode
            </div>
            <div style={{ fontSize: 10, color: 'rgba(107,106,94,0.7)', marginTop: 3, fontFamily: 'Inter, sans-serif' }}>
              Reduce padding and increase information density across all panels
            </div>
          </div>
          <ToggleSwitch checked={compactMode} onChange={setCompactMode} />
        </div>

        <div style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#c4bfb0', fontFamily: 'Inter, sans-serif' }}>
              Animations
            </div>
            <div style={{ fontSize: 10, color: 'rgba(107,106,94,0.7)', marginTop: 3, fontFamily: 'Inter, sans-serif' }}>
              Enable pulsing dots, scroll animations, and agent activity indicators
            </div>
          </div>
          <ToggleSwitch checked={animations} onChange={setAnimations} />
        </div>
      </SettingsCard>

      <SaveFooter onSave={onSave} flash={saveFlash} />
    </div>
  );
}
