import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
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

const INDUSTRIES = [
  { value: '', label: 'Select industry…' },
  { value: 'apparel', label: 'Apparel & Textiles' },
  { value: 'electronics', label: 'Electronics & Hardware' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'automotive', label: 'Automotive Parts' },
  { value: 'chemicals', label: 'Chemicals & Materials' },
  { value: 'furniture', label: 'Furniture & Home Goods' },
  { value: 'medical', label: 'Medical & Healthcare' },
  { value: 'industrial', label: 'Industrial Equipment' },
  { value: 'retail', label: 'Retail & Consumer Goods' },
  { value: 'other', label: 'Other' },
];

const COUNTRIES = [
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'CA', label: '🇨🇦 Canada' },
  { value: 'GB', label: '🇬🇧 United Kingdom' },
  { value: 'DE', label: '🇩🇪 Germany' },
  { value: 'AU', label: '🇦🇺 Australia' },
  { value: 'SG', label: '🇸🇬 Singapore' },
  { value: 'JP', label: '🇯🇵 Japan' },
  { value: 'FR', label: '🇫🇷 France' },
  { value: 'NL', label: '🇳🇱 Netherlands' },
  { value: 'other', label: '🌍 Other' },
];

const REVENUE_RANGES = [
  { value: '', label: 'Select range…' },
  { value: 'under1m', label: 'Under $1M' },
  { value: '1m-5m', label: '$1M – $5M' },
  { value: '5m-25m', label: '$5M – $25M' },
  { value: '25m-100m', label: '$25M – $100M' },
  { value: '100m-500m', label: '$100M – $500M' },
  { value: 'over500m', label: 'Over $500M' },
];

const EMPLOYEE_RANGES = [
  { value: '', label: 'Select range…' },
  { value: '1-10', label: '1 – 10' },
  { value: '11-50', label: '11 – 50' },
  { value: '51-200', label: '51 – 200' },
  { value: '201-1000', label: '201 – 1,000' },
  { value: '1001-5000', label: '1,001 – 5,000' },
  { value: 'over5000', label: 'Over 5,000' },
];

export function CompanyProfileSection({ onSave, saveFlash }: Props) {
  const [companyName, setCompanyName]   = useState('Apex Imports LLC');
  const [industry, setIndustry]         = useState('apparel');
  const [country, setCountry]           = useState('US');
  const [revenue, setRevenue]           = useState('1m-5m');
  const [employees, setEmployees]       = useState('11-50');

  return (
    <div>
      <SectionHeader
        icon={Building2}
        title="Company Profile"
        description="Your business identity helps CoastGuard calibrate risk exposure, tariff impact calculations, and supplier recommendations to your specific industry and scale."
      />

      <SettingsCard>
        <CardTitle>Business Identity</CardTitle>

        <FieldRow>
          <FieldLabel hint="Displayed across your CoastGuard workspace">
            Company Name
          </FieldLabel>
          <TextInput
            value={companyName}
            onChange={setCompanyName}
            placeholder="e.g. Apex Imports LLC"
          />
        </FieldRow>

        <FieldRow last>
          <FieldLabel hint="Used to filter relevant tariff schedules and HS codes">
            Industry
          </FieldLabel>
          <SelectInput
            value={industry}
            onChange={setIndustry}
            options={INDUSTRIES}
          />
        </FieldRow>
      </SettingsCard>

      <SettingsCard>
        <CardTitle>Location &amp; Scale</CardTitle>

        <FieldRow>
          <FieldLabel hint="Your primary importing country determines applicable duty rates">
            Country of Operations
          </FieldLabel>
          <SelectInput
            value={country}
            onChange={setCountry}
            options={COUNTRIES}
          />
        </FieldRow>

        <FieldRow>
          <FieldLabel hint="Helps size your exposure calculations and financial impact estimates">
            Annual Revenue Range
          </FieldLabel>
          <SelectInput
            value={revenue}
            onChange={setRevenue}
            options={REVENUE_RANGES}
          />
        </FieldRow>

        <FieldRow last>
          <FieldLabel hint="Affects supplier matching and compliance recommendations">
            Employee Count
          </FieldLabel>
          <SelectInput
            value={employees}
            onChange={setEmployees}
            options={EMPLOYEE_RANGES}
          />
        </FieldRow>
      </SettingsCard>

      <SaveFooter onSave={onSave} flash={saveFlash} />
    </div>
  );
}
