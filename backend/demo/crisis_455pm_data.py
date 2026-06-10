"""
CoastGuard — Tariff Alert Timeline Data

Scenario: 4:55 PM Wednesday, June 8, 2026.
A small clothing brand (Acme Imports) has a $40,000 order of cotton T-shirts
from Mekong Textiles Co (Vietnam, HS 6109.10) due August 1.

The US Trade Representative just announced a 25% tariff on Vietnamese textiles,
effective July 1, 2026. CoastGuard fires the 5-agent pipeline automatically.

This timeline drives the demo autoplay sequence.
"""

TARIFF_ALERT_TIMELINE = [
    {
        "t_seconds": 0,
        "phase": "normal",
        "description": "Normal monitoring state — supply chain is clear",
        "data": {
            "supplier": "Mekong Textiles Co",
            "country": "Vietnam",
            "hs_code": "6109.10",
            "pending_order_usd": 40000,
            "current_tariff_rate": "16.5%",
            "status": "clear",
        },
    },
    {
        "t_seconds": 5,
        "phase": "tariff_detected",
        "description": "TariffMonitor detects 25% tariff addition on HS 6109.10 from VN",
        "data": {
            "alert_type": "tariff_change",
            "new_rate": "41.5%",
            "delta": "+25%",
            "effective_date": "2026-07-01",
            "confidence": 0.92,
            "source": "mock_usitc",
        },
    },
    {
        "t_seconds": 8,
        "phase": "impact_calculated",
        "description": "ImpactCalculator: $10,000 extra cost on $40,000 pending order",
        "data": {
            "extra_cost_usd": 10000,
            "affected_orders": 1,
            "severity": "high",
            "deadline_at_risk": True,
        },
    },
    {
        "t_seconds": 20,
        "phase": "alternatives_found",
        "description": "AlternativesFinder: 2 backup suppliers identified",
        "data": {
            "alternatives": [
                {
                    "supplier": "Dhaka Garments Ltd",
                    "country": "Bangladesh",
                    "tariff_rate": "0%",
                    "lead_time_weeks": 8,
                    "cost_delta_pct": -12,
                    "meets_deadline": False,
                },
                {
                    "supplier": "Mumbai Exports",
                    "country": "India",
                    "tariff_rate": "8%",
                    "lead_time_weeks": 5,
                    "cost_delta_pct": 8,
                    "meets_deadline": True,
                },
            ]
        },
    },
    {
        "t_seconds": 32,
        "phase": "compliance_checked",
        "description": "ImportCompliance: required docs per alternative supplier",
        "data": {
            "BD": ["Certificate of Origin (Form A)", "Commercial Invoice update", "GSP declaration"],
            "IN": ["BIS certification check", "Certificate of Origin (non-preferential)"],
        },
    },
    {
        "t_seconds": 40,
        "phase": "adversarial_review",
        "description": "Adversarial Agent challenges both recommendations",
        "data": {
            "verdict": "CAUTION",
            "flags": [
                "Bangladesh misses Aug 1 deadline by ~1 week",
                "India supplier has no prior history with this buyer",
            ],
        },
    },
    {
        "t_seconds": 52,
        "phase": "human_decision",
        "description": "Final recommendation presented — awaiting human approval",
        "data": {
            "recommended_supplier": "Mumbai Exports (IN)",
            "net_saving_usd": 6800,
            "required_action": "Negotiate 1-week deadline extension with buyer",
        },
    },
]
