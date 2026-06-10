# 🛡️ CoastGuard — AI Tariff Monitor for SMB Importers

> **AWS Hackathon Entry — AI-powered supply chain co-pilot for small and mid-size importers**

## 📖 Project Overview

**CoastGuard** is an agentic AI system built for small and mid-size importers who lack the in-house trade-compliance teams that large enterprises take for granted. When a tariff change drops on a Friday afternoon — a 25% US duty on Vietnamese cotton (HS 6109) — CoastGuard fires a 5-agent reasoning pipeline that calculates your dollar exposure, finds alternative suppliers, verifies import compliance, and delivers a human-reviewable action plan in under 60 seconds.

> 💡 *"Tariff changes don't wait for Monday morning. Neither should your supply chain intelligence."*

### 🌍 Who it helps

A small clothing brand with a $40,000 pending order due August 1, 2026 suddenly faces a +25% tariff that turns a profitable shipment into a loss. CoastGuard:
- 💸 Calculates exact dollar impact on every open purchase order
- 🔍 Finds alternative suppliers in Bangladesh and India with pre-vetted compliance records
- 📋 Checks HS code rules, customs documentation, and sanctions lists automatically
- 🧠 Explains every recommendation with a transparent Chain-of-Thought — no black boxes

## 🌟 Core Features

### 1. 🤖 5-Agent Tariff Reasoning Engine

A team of specialized AI agents working in sequence:

- **🔭 TariffMonitor**: Scans USITC HTS schedules and GDELT news feeds for new tariff announcements affecting your HS codes.
- **💸 ImpactCalculator**: Calculates the exact dollar impact on every open purchase order — duty increases, freight cost deltas, margin erosion.
- **🔍 AlternativesFinder**: Searches your supplier database and external trade records for compliant alternative sourcing options (Bangladesh, India, nearshore).
- **📋 ImportCompliance**: Verifies customs documentation requirements, OFAC/UN sanctions checks, and certificate-of-origin rules for each alternative.
- **⚖️ Adversarial**: Red-teams every recommendation before it reaches the human — catches hallucinations, conflicts of interest, and overlooked edge cases.

### 2. 🧠 Transparent Chain-of-Thought Reasoning

- **Step-by-step display**: Every agent's reasoning is shown line-by-line as it runs — no black boxes.
- **RAG citations**: Each conclusion is pinned to the source document (USITC HTS entry, GDELT article, internal supplier record).
- **Confidence scores**: Each reasoning step carries a 0–1 confidence value so users can judge reliability at a glance.

### 3. 👤 Human-in-the-Loop (HITL)

- All recommendations require explicit human approval before any action is logged.
- Users can override or escalate any step with full audit trail.

### 4. 🗺️ Interactive Global Map (Deck.gl)

- Visualizes affected trade routes, origin ports, and alternative supplier locations.
- Risk zones pulse in real-time as the agent pipeline fires.
- Click any port or route segment for detailed cargo and compliance data.

### 5. 📄 RAG-Powered Trade Document Library

- Maritime regulations, USITC tariff schedules, and customs guides loaded into ChromaDB.
- Each compliance agent query retrieves the most relevant regulatory chunks before reasoning.

## 🎯 Target Customers

| Segment | Example Companies | Key User |
| :--- | :--- | :--- |
| Small Importers / Brands | Boutique apparel, specialty food importers | Owner / Ops Manager |
| Mid-size Manufacturers | Contract electronics, industrial parts | Supply Chain Manager |
| Freight Forwarders | Regional 3PLs | Trade Compliance Officer |

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| Backend | Python 3.11 + FastAPI |
| AI Orchestration | CrewAI (multi-agent) |
| LLM | AWS Bedrock / Gemini (configurable) |
| Vector Store | ChromaDB (RAG knowledge base) |
| Database | SQLite (Phase 1) → Aurora PostgreSQL (Phase 3) |
| Frontend | React + TypeScript + Vite |
| Map | Deck.gl |
| Real-time | WebSocket |

## 🚀 Quick Start

### 1. Start Backend

`ash
cd backend
python -m venv .venv
# Windows:
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Copy .env.example to .env and set keys (all optional in mock mode)
cp .env.example .env
python start_server.py
`
Backend runs at http://localhost:8000

### 2. Start Frontend

`ash
cd frontend
pnpm install
pnpm dev
`
Frontend runs at http://localhost:5173

### 3. Demo Scenario

The default demo simulates a **Vietnamese Textile Tariff Crisis**:
- Trigger: US adds 25% tariff to HS 6109.10 (cotton T-shirts) from Vietnam, effective July 1, 2026
- A clothing brand has a $40,000 pending order with Mekong Textiles Co.
- Watch all 5 agents reason through the problem and produce an action plan.
- Approve or override the recommendation in the UI.

## 📂 Key Files

- ackend/demo/cot_data.py — Demo scenario data (tariff crisis chain-of-thought)
- ackend/core/crew_orchestrator.py — 5-agent pipeline orchestration
- ackend/api/v2/demo_routes.py — WebSocket demo API
- rontend/src/pages/DemoPage.tsx — Main demo UI
- rontend/src/components/AgentCoTPanel.tsx — Chain-of-thought reasoning display

## 📝 License

MIT
