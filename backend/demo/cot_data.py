"""
CoastGuard — Chain-of-Thought Demo Data

Scenario: Vietnamese Textile Tariff Crisis
  A 25% US tariff is added to HS 6109.10 (cotton T-shirts) from Vietnam.
  A small clothing brand has a $40,000 pending order due August 1, 2026.
  The 5-agent pipeline fires and produces the recommendations below.
"""

# Data sources cited by the TariffMonitor agent during RAG retrieval
RAG_SOURCES = [
    {
        "document_id": "usitc-hts-6109",
        "title": "USITC HTS Schedule — Chapter 61: T-shirts, singlets (HS 6109)",
        "source": "mock_usitc",
        "relevance": 0.96,
    },
    {
        "document_id": "gdelt-vn-tariff-2026",
        "title": "GDELT News: US-Vietnam Trade Policy Update, June 2026",
        "source": "mock_gdelt",
        "relevance": 0.91,
    },
    {
        "document_id": "sentinel-hcmc-port",
        "title": "Sentinel Hub: Ho Chi Minh City Port Activity — June 2026",
        "source": "mock_sentinel",
        "relevance": 0.74,
    },
    {
        "document_id": "supplier-history-mekong",
        "title": "Historical Supplier Record: Mekong Textiles Co (VN)",
        "source": "internal_db",
        "relevance": 0.88,
    },
    {
        "document_id": "trade-compliance-bd-in",
        "title": "Trade Compliance Database: Bangladesh & India Import Requirements",
        "source": "internal_db",
        "relevance": 0.82,
    },
]


# 10-step CoT reasoning chain for the tariff alert scenario
COT_REASONING_STEPS = [
    {
        "step": 1,
        "agent": "TariffMonitor",
        "title": "Scanning USITC tariff database",
        "thought": "Querying USITC HTS for HS 6109.10 (cotton T-shirts) from Vietnam (VN). "
                   "Current rate: 16.5%. New rate effective July 1, 2026: 41.5% (+25%).",
        "confidence": 0.96,
        "source": "mock_usitc",
    },
    {
        "step": 2,
        "agent": "TariffMonitor",
        "title": "Cross-referencing GDELT news",
        "thought": "GDELT confirms tariff announcement is official US trade policy, "
                   "not a rumor. 3 major news outlets corroborate. Confidence raised.",
        "confidence": 0.94,
        "source": "mock_gdelt",
    },
    {
        "step": 3,
        "agent": "TariffMonitor",
        "title": "Checking satellite port data",
        "thought": "Ho Chi Minh City port congestion index: 72/100. No blockage detected. "
                   "Shipping timeline unaffected — this is a tariff-only risk.",
        "confidence": 0.91,
        "source": "mock_sentinel",
    },
    {
        "step": 4,
        "agent": "ImpactCalculator",
        "title": "Calculating dollar impact on pending orders",
        "thought": "Customer has 1 pending order: $40,000 from Mekong Textiles Co, "
                   "expected Aug 1 2026. New tariff adds 25% on import value → "
                   "extra cost = $40,000 × 0.25 = $10,000. Severity: HIGH.",
        "confidence": 0.99,
        "source": "internal_db",
    },
    {
        "step": 5,
        "agent": "ImpactCalculator",
        "title": "Assessing timeline risk",
        "thought": "Order ships June 15. Tariff effective July 1. If goods arrive "
                   "before July 1, old rate applies. But customs clearance typically "
                   "takes 5–10 business days → high probability of new rate applying.",
        "confidence": 0.85,
        "source": "internal_db",
    },
    {
        "step": 6,
        "agent": "AlternativesFinder",
        "title": "Searching for alternative suppliers",
        "thought": "Querying supplier database for HS 6109 cotton T-shirts. "
                   "Found 2 candidates: (1) Dhaka Garments Ltd, Bangladesh — "
                   "0% US tariff, 8-week lead time. (2) Mumbai Exports, India — "
                   "8% US tariff, 5-week lead time.",
        "confidence": 0.88,
        "source": "internal_db",
    },
    {
        "step": 7,
        "agent": "AlternativesFinder",
        "title": "Comparing cost deltas",
        "thought": "Bangladesh (BD): saves $10,000 tariff but -12% unit cost offset. "
                   "Net saving vs staying with VN: +$5,200. India (IN): 8% tariff "
                   "= $3,200 extra vs BD, but 3 weeks faster. Net saving vs VN: +$6,800.",
        "confidence": 0.83,
        "source": "internal_db",
    },
    {
        "step": 8,
        "agent": "ImportCompliance",
        "title": "Checking Bangladesh compliance requirements",
        "thought": "BD requires: Certificate of Origin (Form A), updated Commercial Invoice, "
                   "and GSP declaration. Processing time: 5 business days. No BIS issues.",
        "confidence": 0.92,
        "source": "internal_db",
    },
    {
        "step": 9,
        "agent": "ImportCompliance",
        "title": "Checking India compliance requirements",
        "thought": "IN requires: BIS certification check for cotton textiles, "
                   "Certificate of Origin (non-preferential). Processing time: 3 business days. "
                   "No additional permits for HS 6109.",
        "confidence": 0.90,
        "source": "internal_db",
    },
    {
        "step": 10,
        "agent": "Adversarial",
        "title": "Adversarial challenge: challenging both recommendations",
        "thought": "CAUTION flags raised: (1) Bangladesh option misses Aug 1 deadline by "
                   "~1 week given 8-week lead time from today June 8. (2) India option has "
                   "no prior transaction history with this buyer — quality risk unknown. "
                   "Recommend: use India supplier, negotiate 1-week deadline extension with buyer.",
        "confidence": 0.78,
        "source": "adversarial_agent",
    },
]


# Adversarial debate exchanges
DEBATE_EXCHANGES = [
    {
        "round": 1,
        "topic": "Bangladesh vs India supplier",
        "pro_agent": "AlternativesFinder",
        "pro_argument": "Bangladesh saves more money (-12% unit cost + 0% tariff). "
                        "Net savings of $5,200 make it the financially optimal choice.",
        "adversarial_agent": "Adversarial",
        "adversarial_argument": "Bangladesh delivery takes 8 weeks. From June 8, that's Aug 3 — "
                                 "2 days past the buyer's Aug 1 deadline. Late delivery may incur "
                                 "penalties exceeding the $5,200 savings. This option fails on deadline.",
        "verdict": "ADVERSARIAL WINS — deadline constraint invalidates Bangladesh",
    },
    {
        "round": 2,
        "topic": "Reliability of India supplier",
        "pro_agent": "AlternativesFinder",
        "pro_argument": "Mumbai Exports has strong industry ratings and meets the "
                        "5-week delivery window (arrival ~July 13), well before Aug 1.",
        "adversarial_agent": "Adversarial",
        "adversarial_argument": "No prior transaction history with this buyer. Quality inspection "
                                 "risk is unquantified. Recommend a 10-unit sample order first — "
                                 "but that is not feasible on this timeline.",
        "verdict": "PARTIAL AGREEMENT — India is best available option; flag quality risk to buyer",
    },
]


# Final recommendation output from the Adversarial agent
FINAL_DECISION = {
    "verdict": "CAUTION",
    "recommended_action": "Switch to Mumbai Exports (India)",
    "flags": [
        "Bangladesh misses Aug 1 deadline by ~1 week",
        "India supplier has no prior history with this buyer",
    ],
    "recommendation": (
        "Use Mumbai Exports (IN). Tariff cost = $3,200 vs $10,000 for staying with Vietnam. "
        "Net saving: $6,800. Negotiate a 1-week delivery extension with your buyer to reduce "
        "quality risk. Require a pre-shipment quality inspection report from Mumbai Exports."
    ),
    "cost_comparison": {
        "stay_with_vietnam": {"extra_tariff_usd": 10000, "total_cost": 50000},
        "switch_to_india": {"extra_tariff_usd": 3200, "total_cost": 43200},
        "net_saving_usd": 6800,
    },
}


# --- Helper functions used by the autoplay controller ---

def get_reasoning_steps_for_demo() -> list:
    """Return the 10-step CoT reasoning chain for the tariff alert scenario."""
    return COT_REASONING_STEPS


def get_debate_exchanges_for_demo() -> list:
    """Return the adversarial debate exchanges."""
    return DEBATE_EXCHANGES


def get_final_decision_for_demo() -> dict:
    """Return the final adversarial decision."""
    return FINAL_DECISION


def get_rag_sources_for_demo() -> list:
    """Return the RAG data sources cited during analysis."""
    return RAG_SOURCES
