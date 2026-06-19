/**
 * SettingsUI — shared primitive components for all settings sections.
 * Styled to match the CoastGuard Bloomberg-dark design system.
 */

import React from 'react';
import { Save, Check, Info } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────────────────────────
export function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={16} color="#f59e0b" />
        </div>
        <h2 style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#e8e3d8',
          letterSpacing: '-0.2px',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1,
        }}>
          {title}
        </h2>
      </div>
      <p style={{
        fontSize: 11.5,
        color: 'rgba(107,106,94,0.85)',
        fontFamily: 'Inter, sans-serif',
        lineHeight: 1.5,
        paddingLeft: 48,
      }}>
        {description}
      </p>
    </div>
  );
}

export function SettingsCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#141416',
      border: '1px solid rgba(245,158,11,0.09)',
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 16,
      ...style,
    }}>
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '12px 20px',
      borderBottom: '1px solid rgba(245,158,11,0.07)',
      background: 'rgba(245,158,11,0.025)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'rgba(150,140,100,0.7)',
      fontFamily: 'Inter, sans-serif',
    }}>
      {children}
    </div>
  );
}

export function FieldRow({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.04)',
      display: 'grid',
      gridTemplateColumns: '180px 1fr',
      alignItems: 'start',
      gap: 16,
    }}>
      {children}
    </div>
  );
}

export function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <div style={{
        fontSize: 12,
        fontWeight: 500,
        color: '#c4bfb0',
        fontFamily: 'Inter, sans-serif',
        lineHeight: 1.4,
      }}>
        {children}
      </div>
      {hint && (
        <div style={{
          fontSize: 10,
          color: 'rgba(107,106,94,0.7)',
          marginTop: 3,
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.4,
        }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Form controls
// ─────────────────────────────────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 12,
  color: '#e8e3d8',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        borderColor: focused ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.09)',
        boxShadow: focused ? '0 0 0 2px rgba(245,158,11,0.08)' : 'none',
      }}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6a5e' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        paddingRight: 32,
        borderColor: focused ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.09)',
        boxShadow: focused ? '0 0 0 2px rgba(245,158,11,0.08)' : 'none',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: '#1c1c1f', color: '#e8e3d8' }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
}) {
  const [input, setInput] = React.useState('');
  const [focused, setFocused] = React.useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      onAdd(input.trim().replace(/,$/, ''));
      setInput('');
    }
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${focused ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.09)'}`,
      borderRadius: 6,
      padding: '6px 10px',
      minHeight: 38,
      boxShadow: focused ? '0 0 0 2px rgba(245,158,11,0.08)' : 'none',
      transition: 'border-color 0.15s',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      alignItems: 'center',
    }}>
      {tags.map((tag) => (
        <span key={tag} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 4,
          padding: '2px 7px',
          fontSize: 11,
          color: '#f59e0b',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
        }}>
          {tag}
          <button
            onClick={() => onRemove(tag)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(245,158,11,0.6)',
              fontSize: 12,
              lineHeight: 1,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={tags.length === 0 ? placeholder : 'Add more…'}
        style={{
          background: 'none',
          border: 'none',
          outline: 'none',
          fontSize: 12,
          color: '#e8e3d8',
          fontFamily: 'Inter, sans-serif',
          minWidth: 120,
          flex: 1,
        }}
      />
    </div>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        background: checked ? '#f59e0b' : 'rgba(255,255,255,0.1)',
        border: `1px solid ${checked ? '#f59e0b' : 'rgba(255,255,255,0.12)'}`,
        cursor: 'pointer',
        padding: 0,
        position: 'relative',
        transition: 'background 0.2s, border-color 0.2s',
        flexShrink: 0,
        boxShadow: checked ? '0 0 10px rgba(245,158,11,0.25)' : 'none',
      }}
    >
      <span style={{
        position: 'absolute',
        top: 2,
        left: checked ? 20 : 2,
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: checked ? '#0e0e10' : 'rgba(200,190,160,0.5)',
        transition: 'left 0.2s',
      }} />
    </button>
  );
}

export function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; description?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 7,
              border: `1px solid ${active ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`,
              background: active ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            {/* Radio circle */}
            <div style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: `2px solid ${active ? '#f59e0b' : 'rgba(255,255,255,0.2)'}`,
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1,
              transition: 'border-color 0.15s',
            }}>
              {active && (
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#f59e0b',
                }} />
              )}
            </div>
            <div>
              <div style={{
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                color: active ? '#e8e3d8' : 'rgba(160,150,120,0.8)',
                fontFamily: 'Inter, sans-serif',
              }}>
                {opt.label}
              </div>
              {opt.description && (
                <div style={{
                  fontSize: 10.5,
                  color: 'rgba(107,106,94,0.7)',
                  marginTop: 2,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {opt.description}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Save footer
// ─────────────────────────────────────────────────────────────────────────────
export function SaveFooter({
  onSave,
  flash,
}: {
  onSave: () => void;
  flash: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      background: 'rgba(14,14,10,0.6)',
      border: '1px solid rgba(245,158,11,0.09)',
      borderRadius: 10,
      marginTop: 24,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        fontSize: 11,
        color: 'rgba(107,106,94,0.7)',
        fontFamily: 'Inter, sans-serif',
      }}>
        <Info size={13} color="rgba(107,106,94,0.6)" />
        Changes personalize your CoastGuard monitoring and AI recommendations.
      </div>

      <button
        onClick={onSave}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '8px 18px',
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif',
          background: flash ? '#10b981' : '#f59e0b',
          color: '#0e0e10',
          transition: 'background 0.25s',
          boxShadow: flash ? '0 0 14px rgba(16,185,129,0.35)' : '0 0 12px rgba(245,158,11,0.3)',
        }}
      >
        {flash ? (
          <>
            <Check size={13} />
            Saved
          </>
        ) : (
          <>
            <Save size={13} />
            Save Changes
          </>
        )}
      </button>
    </div>
  );
}
