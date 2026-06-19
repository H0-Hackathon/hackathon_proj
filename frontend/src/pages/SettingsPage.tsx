"use client";
import React, { useState } from 'react';
import { CompanyProfileSection } from '../components/settings/CompanyProfileSection';
import { SupplyChainSection } from '../components/settings/SupplyChainSection';
import { AlertPreferencesSection } from '../components/settings/AlertPreferencesSection';
import { AppearanceSection } from '../components/settings/AppearanceSection';
import { AccountSection } from '../components/settings/AccountSection';
import {
  Building2,
  Globe2,
  BellRing,
  Palette,
  UserCircle2,
  ChevronRight,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

const SECTIONS = [
  { id: 'company',    label: 'Company Profile',    icon: Building2,    desc: 'Business identity & classification' },
  { id: 'supply',     label: 'Supply Chain',        icon: Globe2,       desc: 'Trade exposure & risk parameters' },
  { id: 'alerts',     label: 'Alert Preferences',   icon: BellRing,     desc: 'Severity thresholds & notifications' },
  { id: 'appearance', label: 'Appearance',          icon: Palette,      desc: 'Theme, layout & animations' },
  { id: 'account',    label: 'Account',             icon: UserCircle2,  desc: 'Profile, email & role' },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

export const SettingsPage: React.FC = () => {
  const [active, setActive] = useState<SectionId>('company');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings saved', {
        description: 'Your configuration has been applied to the platform.',
        icon: <CheckCircle2 size={16} color="#f59e0b" />,
      });
    }, 900);
  };

  return (
    <div className="settings-page-root" style={{
      display: 'flex',
      minHeight: '100vh',
      paddingLeft: 'var(--sidebar-w, 224px)',
      background: '#090909',
      fontFamily: 'Inter, sans-serif',
    }}>
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: '#151510',
            border: '1px solid rgba(245,158,11,0.2)',
            color: '#e8e3d8',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />

      {/* Left nav rail */}
      <aside style={{
        width: 260,
        flexShrink: 0,
        borderRight: '1px solid rgba(245,158,11,0.08)',
        background: 'linear-gradient(180deg, #0c0c0a 0%, #0e0e0b 100%)',
        padding: '32px 0',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Section header */}
        <div style={{ padding: '0 20px 24px' }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(150,140,110,0.5)',
            marginBottom: 4,
          }}>
            Configuration
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#e8e3d8',
            letterSpacing: '-0.4px',
          }}>
            Platform Settings
          </div>
          <div style={{
            fontSize: 11.5,
            color: 'rgba(140,130,100,0.6)',
            marginTop: 4,
            lineHeight: 1.5,
          }}>
            Personalize CoastGuard to match your trade exposure profile
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {SECTIONS.map(({ id, label, icon: Icon, desc }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 20px',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(245,158,11,0.13) 0%, rgba(245,158,11,0.03) 100%)'
                    : 'transparent',
                  border: 'none',
                  borderLeft: isActive ? '2px solid #f59e0b' : '2px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.04)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: isActive ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isActive ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isActive ? '0 0 10px rgba(245,158,11,0.12)' : 'none',
                }}>
                  <Icon size={14} color={isActive ? '#f59e0b' : 'rgba(160,150,120,0.55)'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12.5,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#e8e3d8' : 'rgba(160,150,120,0.6)',
                    lineHeight: 1.3,
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize: 10.5,
                    color: 'rgba(120,110,80,0.45)',
                    lineHeight: 1.3,
                    marginTop: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {desc}
                  </div>
                </div>
                {isActive && <ChevronRight size={12} color="rgba(245,158,11,0.5)" />}
              </button>
            );
          })}
        </div>

        {/* Save button in nav */}
        <div style={{ padding: '20px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '11px 0',
              borderRadius: 8,
              background: saving
                ? 'rgba(245,158,11,0.1)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: saving ? '1px solid rgba(245,158,11,0.3)' : 'none',
              color: saving ? 'rgba(245,158,11,0.7)' : '#0a0a08',
              fontSize: 12.5,
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              letterSpacing: '0.03em',
              transition: 'all 0.2s',
              boxShadow: saving ? 'none' : '0 4px 16px rgba(245,158,11,0.25)',
            }}
          >
            <Save size={13} />
            {saving ? 'Saving…' : 'Save All Changes'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        padding: '40px 48px',
        overflowY: 'auto',
        maxWidth: 900,
      }}>
        {active === 'company'    && <CompanyProfileSection onSave={handleSave} saving={saving} />}
        {active === 'supply'     && <SupplyChainSection    onSave={handleSave} saving={saving} />}
        {active === 'alerts'     && <AlertPreferencesSection onSave={handleSave} saving={saving} />}
        {active === 'appearance' && <AppearanceSection     onSave={handleSave} saving={saving} />}
        {active === 'account'    && <AccountSection        onSave={handleSave} saving={saving} />}
      </main>
    </div>
  );
};

export default SettingsPage;
