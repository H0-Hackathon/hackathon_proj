import React, { useState } from 'react';
import { Package } from 'lucide-react';
import {
  SectionHeader,
  SettingsCard,
  CardTitle,
  FieldRow,
  FieldLabel,
  TagInput,
  RadioGroup,
  SaveFooter,
} from './SettingsUI';

interface Props {
  onSave: () => void;
  saveFlash: boolean;
}

const RISK_TOLERANCE_OPTIONS = [
  {
    value: 'low',
    label: 'Conservative',
    description: 'Alert on any tariff or disruption signal. Prioritise supply chain stability over cost.',
  },
  {
    value: 'medium',
    label: 'Balanced',
    description: 'Surface medium-to-high severity events. Recommended for most SMB importers.',
  },
  {
    value: 'high',
    label: 'Aggressive',
    description: 'Only flag critical or high-severity disruptions. Suitable for experienced traders.',
  },
];

export function SupplyChainSection({ onSave, saveFlash }: Props) {
  const [products, setProducts]         = useState<string[]>(['Cotton T-shirts', 'Denim Jeans', 'Knitwear']);
  const [supplierCountries, setSupplierCountries] = useState<string[]>(['Vietnam', 'Bangladesh', 'India']);
  const [criticalRegions, setCriticalRegions]     = useState<string[]>(['Southeast Asia', 'South Asia']);
  const [riskTolerance, setRiskTolerance]         = useState('medium');

  const addTag = (list: string[], setter: (v: string[]) => void) => (tag: string) => {
    if (!list.includes(tag)) setter([...list, tag]);
  };
  const removeTag = (list: string[], setter: (v: string[]) => void) => (tag: string) => {
    setter(list.filter((t) => t !== tag));
  };

  return (
    <div>
      <SectionHeader
        icon={Package}
        title="Supply Chain Profile"
        description="Define the products you import, where your suppliers are, and how sensitive your operations are to trade disruptions. This data drives CoastGuard's AI monitoring and alternative supplier recommendations."
      />

      <SettingsCard>
        <CardTitle>Products &amp; Sourcing</CardTitle>

        <FieldRow>
          <FieldLabel hint="Press Enter or comma to add a product. Helps CoastGuard target relevant HS codes.">
            Products Imported
          </FieldLabel>
          <TagInput
            tags={products}
            onAdd={addTag(products, setProducts)}
            onRemove={removeTag(products, setProducts)}
            placeholder="e.g. Cotton T-shirts"
          />
        </FieldRow>

        <FieldRow>
          <FieldLabel hint="Countries where your active suppliers are based">
            Supplier Countries
          </FieldLabel>
          <TagInput
            tags={supplierCountries}
            onAdd={addTag(supplierCountries, setSupplierCountries)}
            onRemove={removeTag(supplierCountries, setSupplierCountries)}
            placeholder="e.g. Vietnam"
          />
        </FieldRow>

        <FieldRow last>
          <FieldLabel hint="Regions critical to your supply chain — used to weight disruption alerts">
            Critical Sourcing Regions
          </FieldLabel>
          <TagInput
            tags={criticalRegions}
            onAdd={addTag(criticalRegions, setCriticalRegions)}
            onRemove={removeTag(criticalRegions, setCriticalRegions)}
            placeholder="e.g. Southeast Asia"
          />
        </FieldRow>
      </SettingsCard>

      <SettingsCard>
        <CardTitle>Risk Tolerance</CardTitle>

        <div style={{ padding: '16px 20px' }}>
          <p style={{
            fontSize: 11.5,
            color: 'rgba(107,106,94,0.8)',
            marginBottom: 14,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.5,
          }}>
            Sets the sensitivity of CoastGuard&apos;s agent pipeline. A lower tolerance means more alerts and more cautious AI recommendations.
          </p>
          <RadioGroup
            options={RISK_TOLERANCE_OPTIONS}
            value={riskTolerance}
            onChange={setRiskTolerance}
          />
        </div>
      </SettingsCard>

      <SaveFooter onSave={onSave} flash={saveFlash} />
    </div>
  );
}
