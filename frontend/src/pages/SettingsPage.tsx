import React, { useState } from 'react';
import {
  Building2,
  Package,
  Bell,
  Palette,
  User,
  ChevronRight,
  Save,
  Check,
} from 'lucide-react';
import { CompanyProfileSection }    from '../components/settings/CompanyProfileSection';
import { SupplyChainSection }       from '../components/settings/SupplyChainSection';
import { AlertPreferencesSection }  from '../components/settings/AlertPreferencesSection';
import { AppearanceSection }        from '../components/settings/AppearanceSection';
import { AccountSection }           from '../components/settings/AccountSection';

// ─────────────────────────────────────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────────────────────────────────────

export type SectionId =
  | 'company'
  | 'supply-chain'
  | 'alerts'
  | 'appearance'
  | 'account';

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ElementType;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'company',      label: 'Company Profile',    icon: Building2, description: 'Business identity & industry' },
  { id: 'supply-chain', label: 'Supply Chain',        icon: Package,   description: 'Products, suppliers & risk' },
  { id: 'alerts',       label: 'Alert Preferences',  icon: Bell,      description: 'Thresholds & notifications' },
  { id: 'appearance',   label: 'Appearance',          icon: Palette,   description: 'Theme & display options' },
  { id: 'account',      label: 'Account',             icon: User,      description: 'Your profile & credentials' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Settings nav item
// ─────────────────────────────────────────────────────────────────────────────
function SettingsNavItem({
  item,
  active,
  saved,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  saved: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 14px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        background: active
          ? 'linear-gradient(90deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 100%)'
          : 'transparent',
        borderLeft: active ? '2px solid #f59e0b' : '2px solid transparent',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }
      }}
    >
      {/* Icon container */}
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 7,
        background: active ? 'rgba(245,158,11,0.14)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.15s',
      }}>
        <Icon size={14} color={active ? '#f59e0b' : '#6b6a5e'} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5,
          fontWeight: active ? 600 : 400,
          color: active ? '#e8e3d8' : 'rgba(160,150,120,0.7)',
          lineHeight: 1.2,
          fontFamily: 'Inter, sans-serif',
        }}>
          {item.label}
        </div>
        <div style={{
          fontSize: 10,
          color: 'rgba(107,106,94,0.7)',
          marginTop: 2,
          fontFamily: 'Inter, sans-serif',
        }}>
          {item.description}
        </div>
      </div>

      {saved && (
        <Check size={12} color="#10b981" style={{ flexShrink: 0 }} />
      )}
      {active && !saved && (
        <ChevronRight size={12} color="rgba(245,158,11,0.6)" style={{ flexShrink: 0 }} />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main SettingsPage
// ─────────────────────────────────────────────────────────────────────────────
export const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('company');
  const [savedSections, setSavedSections] = useState<Set<SectionId>>(new Set());
  const [saveFlash, setSaveFlash] = useState<SectionId | null>(null);

  const handleSave = (sectionId: SectionId) => {
    setSavedSections((prev) => new Set([...prev, sectionId]));
    setSaveFlash(sectionId);
    setTimeout(() => setSaveFlash(null), 2500);
  };

  const renderSection = () => {
    const props = {
      onSave: () => handleSave(activeSection),
      saveFlash: saveFlash === activeSection,
    };
    switch (activeSection) {
      case 'company':      return <CompanyProfileSection   {...props} />;
      case 'supply-chain': return <SupplyChainSection      {...props} />;
      case 'alerts':       return <AlertPreferencesSection {...props} />;
      case 'appearance':   return <AppearanceSection       {...props} />;
      case 'account':      return <AccountSection          {...props} />;
    }
  };

  const currentItem = NAV_ITEMS.find((n) => n.id === activeSection)!;

  return (
    <main
      className="page-with-sidebar"
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Top bar ── */}
      <div style={{
        padding: '13px 24px',
        borderBottom: '1px solid rgba(245,158,11,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(14,14,10,0.95)',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{
            fontSize: 17,
            fontWeight: 800,
            color: '#e8e3d8',
            letterSpacing: '-0.3px',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1,
            marginBottom: 4,
          }}>
            Settings
          </h1>
          <div style={{
            fontSize: 11,
            color: 'rgba(130,120,90,0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span>Personalize CoastGuard monitoring &amp; recommendations</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 10,
          color: 'rgba(107,106,94,0.8)',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 6px #10b981',
            display: 'inline-block',
          }} />
          CoastGuard v0.1.0 — Phase 1
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '228px 1fr',
        minHeight: 0,
      }}>

        {/* ── Left nav ── */}
        <div style={{
          borderRight: '1px solid rgba(245,158,11,0.07)',
          background: 'rgba(14,14,10,0.6)',
          padding: '20px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          <div style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(150,140,100,0.55)',
            padding: '0 14px 10px',
          }}>
            Configuration
          </div>

          {NAV_ITEMS.map((item) => (
            <SettingsNavItem
              key={item.id}
              item={item}
              active={activeSection === item.id}
              saved={savedSections.has(item.id)}
              onClick={() => setActiveSection(item.id)}
            />
          ))}

          {/* Hint */}
          <div style={{
            marginTop: 'auto',
            padding: '16px 14px 0',
            borderTop: '1px solid rgba(245,158,11,0.06)',
          }}>
            <div style={{
              fontSize: 10,
              color: 'rgba(107,106,94,0.7)',
              lineHeight: 1.5,
              fontFamily: 'Inter, sans-serif',
            }}>
              Settings personalize your risk thresholds, supplier monitoring, and CoastGuard&apos;s AI recommendations.
            </div>
          </div>
        </div>

        {/* ── Right content ── */}
        <div style={{
          overflowY: 'auto',
          padding: '28px 32px',
          background: 'var(--bg)',
        }}>
          {/* Section breadcrumb */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
          }}>
            <span style={{ fontSize: 10, color: 'rgba(107,106,94,0.6)', fontFamily: 'Inter, sans-serif' }}>
              Settings
            </span>
            <ChevronRight size={10} color="rgba(107,106,94,0.4)" />
            <span style={{
              fontSize: 10,
              color: '#f59e0b',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.02em',
            }}>
              {currentItem.label}
            </span>
          </div>

          {/* Section content */}
          {renderSection()}
        </div>
      </div>
    </main>
  );
};
