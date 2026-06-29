import React, { useState, useEffect } from 'react';
import { Globe2, AlertTriangle, MapPin } from 'lucide-react';
import { SectionHeader, SettingsCard, FieldRow, SelectInput, TextInput, TagInput, SaveButton } from './SettingsShared';

export interface SupplyChainSaveData {
  product_categories: string[];
  primary_origin_countries: string[];
  risk_tolerance: string;
  import_region: string;
  rss_keywords: string[];
  destination_country: string;
  destination_port: string;
}

interface Props {
  onSave: (data: SupplyChainSaveData) => void;
  saving: boolean;
  initialData?: {
    product_categories?: string[];
    primary_origin_countries?: string[];
    risk_tolerance?: string;
    import_region?: string;
    rss_keywords?: string[];
    destination_country?: string;
    destination_port?: string;
  };
}

// Where shipments actually arrive — this is what anchors the dashboard
// globe's HQ pin and the supplier-to-HQ trade routes, so it needs to be
// editable after onboarding, not just set once at signup.
const DEST_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Netherlands', 'Japan', 'South Korea', 'Singapore', 'UAE', 'India', 'Brazil',
  'Mexico', 'Italy', 'Spain', 'Poland', 'Sweden', 'Switzerland', 'Belgium',
];

const PORTS_BY_COUNTRY: Record<string, string[]> = {
  'United States': ['Port of Los Angeles', 'Port of Long Beach', 'Port of New York', 'Port of Seattle', 'Port of Houston', 'Port of Savannah', 'Port of Charleston'],
  'United Kingdom': ['Port of Felixstowe', 'Port of Southampton', 'Port of London', 'Port of Liverpool'],
  'Germany': ['Port of Hamburg', 'Port of Bremen'],
  'Netherlands': ['Port of Rotterdam'],
  'Japan': ['Port of Tokyo', 'Port of Yokohama', 'Port of Osaka'],
  'Australia': ['Port of Melbourne', 'Port of Sydney', 'Port of Brisbane'],
  'Canada': ['Port of Vancouver', 'Port of Montreal', 'Port of Halifax'],
  'Singapore': ['Port of Singapore'],
  'UAE': ['Port of Jebel Ali', 'Port of Dubai'],
  'India': ['Port of Mumbai', 'Port of Chennai', 'Port of Nhava Sheva'],
  'France': ['Port of Le Havre', 'Port of Marseille'],
};

const RISK_LEVELS = [
  { id: 'low',    label: 'Low',    color: 'var(--harbor)',       desc: 'Disruptions under 10% supply impact are acceptable' },
  { id: 'medium', label: 'Medium', color: 'var(--harbor-light)', desc: 'Alert on anything with >5% supply probability' },
  { id: 'high',   label: 'High',   color: 'var(--driftwood)',    desc: 'Maximum vigilance — alert on all upstream signals' },
] as const;

export const SupplyChainSection: React.FC<Props> = ({ onSave, saving, initialData }) => {
  const [productCategories, setProductCategories] = useState<string[]>(initialData?.product_categories ?? []);
  const [supplierCountries, setSupplierCountries] = useState<string[]>(initialData?.primary_origin_countries ?? []);
  const [criticalRegions, setCriticalRegions] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>(
    (initialData?.risk_tolerance as 'low' | 'medium' | 'high') ?? 'medium'
  );
  const [importRegion, setImportRegion] = useState(initialData?.import_region ?? 'asia-pacific');
  const [destinationCountry, setDestinationCountry] = useState(initialData?.destination_country ?? '');
  const [destinationPort, setDestinationPort] = useState(initialData?.destination_port ?? '');

  useEffect(() => {
    if (initialData) {
      if (initialData.product_categories?.length)  setProductCategories(initialData.product_categories);
      if (initialData.primary_origin_countries?.length) setSupplierCountries(initialData.primary_origin_countries);
      if (initialData.risk_tolerance) setRiskTolerance(initialData.risk_tolerance as 'low' | 'medium' | 'high');
      if (initialData.import_region)  setImportRegion(initialData.import_region);
      if (initialData.destination_country) setDestinationCountry(initialData.destination_country);
      if (initialData.destination_port)    setDestinationPort(initialData.destination_port);
    }
  }, [
    initialData?.product_categories?.join(','),
    initialData?.primary_origin_countries?.join(','),
    initialData?.risk_tolerance,
    initialData?.import_region,
    initialData?.destination_country,
    initialData?.destination_port,
  ]);

  const knownPorts = PORTS_BY_COUNTRY[destinationCountry] ?? [];

  const handleDestinationCountryChange = (country: string) => {
    setDestinationCountry(country);
    const ports = PORTS_BY_COUNTRY[country];
    setDestinationPort(ports?.length ? ports[0] : '');
  };

  const handleSave = () => onSave({
    product_categories: productCategories,
    primary_origin_countries: supplierCountries,
    risk_tolerance: riskTolerance,
    import_region: importRegion,
    rss_keywords: initialData?.rss_keywords ?? [],
    destination_country: destinationCountry,
    destination_port: destinationPort,
  });

  return (
    <div>
      <SectionHeader
        icon={Globe2}
        title="Supply Chain Profile"
        subtitle="Maps your sourcing footprint so Suppliance can surface the disruption signals most relevant to your trade flows."
        badge="Critical"
      />

      <SettingsCard
        title="Imported Products"
        description="Product categories you source internationally. Used to match tariff schedules and disruption events."
        impact="Powers tariff impact calculator & commodity alerts"
      >
        <FieldRow label="Product Categories" hint="Press Enter or comma to add" full>
          <TagInput tags={productCategories} onChange={setProductCategories} placeholder="e.g. Semiconductors, Steel, Pharmaceuticals…" />
        </FieldRow>

        <FieldRow label="Primary Sourcing Region" hint="Where most volume originates">
          <SelectInput value={importRegion} onChange={e => setImportRegion(e.target.value)}>
            <option value="asia-pacific">Asia-Pacific</option>
            <option value="Southeast Asia">Southeast Asia</option>
            <option value="East Asia">East Asia (China, Taiwan, Korea)</option>
            <option value="South Asia">South Asia (India, Bangladesh)</option>
            <option value="europe">Europe</option>
            <option value="Latin America">Latin America</option>
            <option value="North America">North America</option>
            <option value="South America">South America</option>
            <option value="middle-east">Middle East & Africa</option>
          </SelectInput>
        </FieldRow>
      </SettingsCard>

      <SettingsCard
        title="Import Destination"
        description="Where your shipments actually arrive — your HQ or primary distribution hub. Anchors the dashboard globe's HQ marker and every supplier-to-HQ trade route."
        impact="Powers the globe's HQ pin and trade-route arcs"
        index={1}
      >
        <FieldRow label="Destination Country" hint="Where goods clear customs and arrive">
          <SelectInput value={destinationCountry} onChange={e => handleDestinationCountryChange(e.target.value)}>
            <option value="">Select country…</option>
            {DEST_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </SelectInput>
        </FieldRow>

        <FieldRow label="Port / Hub" hint="Specific arrival port, if known">
          {knownPorts.length > 0 ? (
            <SelectInput value={destinationPort} onChange={e => setDestinationPort(e.target.value)}>
              {knownPorts.map(p => <option key={p} value={p}>{p}</option>)}
            </SelectInput>
          ) : (
            <TextInput
              value={destinationPort}
              onChange={e => setDestinationPort(e.target.value)}
              placeholder="e.g. Port of Rotterdam"
              disabled={!destinationCountry}
            />
          )}
        </FieldRow>
      </SettingsCard>

      <SettingsCard
        title="Supplier Countries"
        description="Countries where your key suppliers are based. Drives geopolitical risk scoring and tariff monitoring."
        impact="Directly maps to tariff watch-list and sanctions screening"
        index={2}
      >
        <FieldRow label="Countries" hint="Press Enter or comma to add" full>
          <TagInput tags={supplierCountries} onChange={setSupplierCountries} placeholder="e.g. China, Vietnam, Germany…" />
        </FieldRow>

        {supplierCountries.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {supplierCountries.map((country, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', background: 'rgba(232,226,216,0.03)',
                border: '1px solid rgba(232,226,216,0.07)', borderRadius: 6,
                fontSize: 12.5, color: 'var(--text-secondary)',
              }}>
                <MapPin size={10} color="rgba(132,215,216,0.5)" />
                {country}
              </div>
            ))}
          </div>
        )}
      </SettingsCard>

      <SettingsCard
        title="Critical Sourcing Regions"
        description="High-priority geographic zones where any disruption triggers immediate alerts regardless of severity."
        impact="Bypasses severity filters — always generates alerts"
        index={3}
      >
        <FieldRow label="Regions" hint="Geopolitical hotspots, choke points" full>
          <TagInput tags={criticalRegions} onChange={setCriticalRegions} placeholder="e.g. Strait of Malacca, Red Sea, Taiwan Strait…" />
        </FieldRow>

        <div style={{
          marginTop: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.05)',
          border: '1px solid rgba(239,68,68,0.12)', borderRadius: 7,
          fontSize: 13, color: '#E8A5A5', display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <AlertTriangle size={13} style={{ marginTop: 1, flexShrink: 0 }} />
          Any event in these regions will generate a <strong style={{ color: '#F0BFBF' }}>Critical</strong> alert regardless of your minimum severity threshold.
        </div>
      </SettingsCard>

      <SettingsCard
        title="Risk Tolerance"
        description="Determines the sensitivity of the AI risk engine. Higher tolerance means fewer, higher-confidence alerts."
        impact="Controls alert volume and AI recommendation aggressiveness"
        index={4}
      >
        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          {RISK_LEVELS.map(({ id, label, color, desc }) => {
            const isSelected = riskTolerance === id;
            return (
              <button
                key={id}
                onClick={() => setRiskTolerance(id)}
                style={{
                  flex: 1, padding: '14px 12px', borderRadius: 9,
                  border: `1px solid ${isSelected ? color + '40' : 'rgba(232,226,216,0.07)'}`,
                  background: isSelected ? color + '10' : 'rgba(232,226,216,0.02)',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s', fontFamily: 'var(--font)',
                }}
              >
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: isSelected ? color : 'rgba(232,226,216,0.2)',
                  margin: '0 auto 8px',
                  boxShadow: isSelected ? `0 0 8px ${color}` : 'none', transition: 'all 0.2s',
                }} />
                <div style={{ fontSize: 14, fontWeight: isSelected ? 700 : 500, color: isSelected ? color : 'var(--text-muted)', marginBottom: 5 }}>
                  {label}
                </div>
                <div style={{ fontSize: 12, color: isSelected ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: 1.4 }}>
                  {desc}
                </div>
              </button>
            );
          })}
        </div>
      </SettingsCard>

      <SaveButton onSave={handleSave} saving={saving} label="Save Supply Chain Profile" />
    </div>
  );
};
