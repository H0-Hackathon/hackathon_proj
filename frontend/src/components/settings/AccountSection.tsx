import React, { useState } from 'react';
import { User, Shield, KeyRound } from 'lucide-react';
import {
  SectionHeader,
  SettingsCard,
  CardTitle,
  FieldRow,
  FieldLabel,
  TextInput,
  SelectInput,
  SaveFooter,
} from './SettingsUI';

interface Props {
  onSave: () => void;
  saveFlash: boolean;
}

const COMPANY_ROLES = [
  { value: 'owner', label: 'Owner / Founder' },
  { value: 'ops', label: 'Operations Manager' },
  { value: 'supply-chain', label: 'Supply Chain Manager' },
  { value: 'trade-compliance', label: 'Trade Compliance Officer' },
  { value: 'finance', label: 'Finance / CFO' },
  { value: 'procurement', label: 'Procurement Manager' },
  { value: 'logistics', label: 'Logistics Coordinator' },
  { value: 'other', label: 'Other' },
];

export function AccountSection({ onSave, saveFlash }: Props) {
  const [firstName, setFirstName]   = useState('Alex');
  const [lastName, setLastName]     = useState('Chen');
  const [email, setEmail]           = useState('alex.chen@apexImports.com');
  const [role, setRole]             = useState('supply-chain');
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');

  const pwMismatch = newPw.length > 0 && confirmPw.length > 0 && newPw !== confirmPw;
  const pwStrong   = newPw.length >= 12;

  return (
    <div>
      <SectionHeader
        icon={User}
        title="Account"
        description="Manage your personal profile, login credentials, and workspace role. Your role affects the default views and AI recommendation framing."
      />

      <SettingsCard>
        <CardTitle>Personal Information</CardTitle>

        <FieldRow>
          <FieldLabel hint="Your display name across the CoastGuard workspace">
            Full Name
          </FieldLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <TextInput
              value={firstName}
              onChange={setFirstName}
              placeholder="First name"
            />
            <TextInput
              value={lastName}
              onChange={setLastName}
              placeholder="Last name"
            />
          </div>
        </FieldRow>

        <FieldRow>
          <FieldLabel hint="Used for notifications, daily briefings, and account recovery">
            Email Address
          </FieldLabel>
          <TextInput
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@company.com"
          />
        </FieldRow>

        <FieldRow last>
          <FieldLabel hint="Your position determines how CoastGuard frames recommendations and impact summaries">
            Company Role
          </FieldLabel>
          <SelectInput
            value={role}
            onChange={setRole}
            options={COMPANY_ROLES}
          />
        </FieldRow>
      </SettingsCard>

      <SettingsCard>
        <CardTitle>Security</CardTitle>

        <div style={{
          margin: '12px 20px',
          padding: '10px 14px',
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.15)',
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <Shield size={13} color="#10b981" />
          <span style={{ fontSize: 11, color: '#6ee7b7', fontFamily: 'Inter, sans-serif' }}>
            Your account is secured. Last login: Today at 9:14 AM
          </span>
        </div>

        <FieldRow>
          <FieldLabel>
            Current Password
          </FieldLabel>
          <TextInput
            type="password"
            value={currentPw}
            onChange={setCurrentPw}
            placeholder="Enter current password"
          />
        </FieldRow>

        <FieldRow>
          <FieldLabel hint="Minimum 12 characters recommended">
            New Password
          </FieldLabel>
          <div>
            <TextInput
              type="password"
              value={newPw}
              onChange={setNewPw}
              placeholder="New password"
            />
            {newPw.length > 0 && (
              <div style={{
                marginTop: 6,
                display: 'flex',
                gap: 4,
                alignItems: 'center',
              }}>
                {/* Strength meter */}
                {[1,2,3,4].map((i) => (
                  <div key={i} style={{
                    height: 3,
                    flex: 1,
                    borderRadius: 2,
                    background:
                      (i === 1 && newPw.length >= 4)  ? '#dc2626' :
                      (i === 2 && newPw.length >= 8)  ? '#d97706' :
                      (i === 3 && newPw.length >= 12) ? '#f59e0b' :
                      (i === 4 && pwStrong)            ? '#10b981' :
                      'rgba(255,255,255,0.06)',
                    transition: 'background 0.2s',
                  }} />
                ))}
                <span style={{
                  fontSize: 9.5,
                  fontFamily: 'Inter, sans-serif',
                  color:
                    newPw.length < 4  ? '#6b6a5e' :
                    newPw.length < 8  ? '#fca5a5' :
                    newPw.length < 12 ? '#fcd34d' : '#6ee7b7',
                  marginLeft: 4,
                  whiteSpace: 'nowrap',
                }}>
                  {newPw.length < 4  ? 'Too short' :
                   newPw.length < 8  ? 'Weak' :
                   newPw.length < 12 ? 'Fair' : 'Strong'}
                </span>
              </div>
            )}
          </div>
        </FieldRow>

        <FieldRow last>
          <FieldLabel>
            Confirm Password
          </FieldLabel>
          <div>
            <TextInput
              type="password"
              value={confirmPw}
              onChange={setConfirmPw}
              placeholder="Re-enter new password"
            />
            {pwMismatch && (
              <div style={{
                marginTop: 5,
                fontSize: 10.5,
                color: '#fca5a5',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <KeyRound size={10} />
                Passwords do not match
              </div>
            )}
          </div>
        </FieldRow>
      </SettingsCard>

      <SaveFooter onSave={onSave} flash={saveFlash} />
    </div>
  );
}
