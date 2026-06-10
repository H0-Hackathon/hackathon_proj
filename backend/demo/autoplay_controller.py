"""
CoastGuard — Demo Autoplay Controller

Streams a tariff alert scenario over WebSocket for the demo page.
Phase 1: Placeholder skeleton. Full 5-agent sequence is implemented in Phase 3.

Scenario: Vietnamese textile tariff crisis
  - A 25% US tariff is added on HS 6109 (cotton T-shirts) imported from Vietnam
  - A $40,000 pending order is now $10,000 more expensive
  - The 5-agent pipeline fires and produces a recommended action
"""

import asyncio
import logging
from datetime import datetime
from fastapi import WebSocket

from demo.cot_data import (
    get_reasoning_steps_for_demo,
    get_debate_exchanges_for_demo,
    get_final_decision_for_demo,
)
from demo.crisis_455pm_data import TARIFF_ALERT_TIMELINE

logger = logging.getLogger(__name__)


class TariffAlertController:
    """
    Demo autoplay controller for the CoastGuard tariff alert scenario.

    Sends WebSocket events that drive the frontend demo page through phases:
    1. Normal state
    2. Tariff detected
    3. Impact calculated
    4. Alternatives found
    5. Compliance checked
    6. Adversarial review
    7. Human decision prompt
    """

    def __init__(self):
        self.timeline = TARIFF_ALERT_TIMELINE
        self.is_playing = False
        self.cot_steps = get_reasoning_steps_for_demo()
        self.debates = get_debate_exchanges_for_demo()
        self.final_decision = get_final_decision_for_demo()
        self.confirmation_event = asyncio.Event()
        self.confirmation_action: str | None = None

    def confirm_decision(self, action: str) -> None:
        """Receive the user's approve/override decision from the WebSocket client."""
        logger.info(f"User decision received: {action}")
        self.confirmation_action = action
        self.confirmation_event.set()

    async def run_demo_sequence(self, websocket: WebSocket) -> None:
        """
        Stream the full tariff alert demo sequence (~60 seconds).

        Timeline:
          T+0s   Normal state display
          T+5s   Tariff change detected
          T+8s   CoT reasoning chain (10 steps)
          T+40s  Adversarial debate
          T+52s  Final decision presentation
          T+60s  Demo complete — await human confirm
        """
        try:
            # ------------------------------------------------------------------
            # Phase 0: Normal State (0–5s)
            # ------------------------------------------------------------------
            logger.info("Demo T+0: Normal state")
            await websocket.send_json({
                "type": "phase_change",
                "phase": "normal",
                "message": "Monitoring supply chain... All clear.",
                "timestamp": datetime.utcnow().isoformat(),
                "data": {
                    "supplier": "Mekong Textiles Co",
                    "country": "Vietnam",
                    "hs_code": "6109.10",
                    "pending_order_value": 40000,
                    "status": "clear",
                },
            })
            await asyncio.sleep(5)

            # ------------------------------------------------------------------
            # Phase 1: Tariff Detected (T+5s)
            # ------------------------------------------------------------------
            logger.info("Demo T+5: Tariff detected")
            await websocket.send_json({
                "type": "phase_change",
                "phase": "tariff_detected",
                "message": "⚠ ALERT: US adds 25% tariff on HS 6109.10 imports from Vietnam",
                "timestamp": datetime.utcnow().isoformat(),
                "agent": "TariffMonitor",
                "data": {
                    "event": "25% tariff on HS 6109.10 from VN",
                    "confidence": 0.92,
                    "source": "mock_usitc",
                    "effective_date": "2026-07-01",
                },
            })
            await asyncio.sleep(3)

            # ------------------------------------------------------------------
            # Phase 2: CoT Reasoning Chain (T+8s — ~32s)
            # ------------------------------------------------------------------
            logger.info("Demo T+8: CoT reasoning chain")
            for i, step in enumerate(self.cot_steps):
                await websocket.send_json({
                    "type": "cot_step",
                    "step_index": i,
                    "total_steps": len(self.cot_steps),
                    **step,
                })
                await asyncio.sleep(3)

            # ------------------------------------------------------------------
            # Phase 3: Adversarial Debate (T+40s)
            # ------------------------------------------------------------------
            logger.info("Demo T+40: Adversarial debate")
            await websocket.send_json({
                "type": "phase_change",
                "phase": "adversarial_debate",
                "message": "Adversarial Agent challenging recommendations...",
                "timestamp": datetime.utcnow().isoformat(),
            })

            for exchange in self.debates:
                await websocket.send_json({"type": "debate_exchange", **exchange})
                await asyncio.sleep(3)

            # ------------------------------------------------------------------
            # Phase 4: Final Decision (T+52s)
            # ------------------------------------------------------------------
            logger.info("Demo T+52: Final decision")
            await websocket.send_json({
                "type": "final_decision",
                "phase": "human_decision",
                "message": "AI recommendation ready. Awaiting your decision.",
                "timestamp": datetime.utcnow().isoformat(),
                "decision": self.final_decision,
            })

            # Wait up to 120s for the human to confirm
            try:
                await asyncio.wait_for(self.confirmation_event.wait(), timeout=120)
                logger.info(f"Human confirmed: {self.confirmation_action}")
                await websocket.send_json({
                    "type": "confirmed",
                    "action": self.confirmation_action,
                    "message": f"Decision recorded: {self.confirmation_action}",
                    "timestamp": datetime.utcnow().isoformat(),
                })
            except asyncio.TimeoutError:
                logger.info("Demo timed out waiting for human confirm")
                await websocket.send_json({
                    "type": "timeout",
                    "message": "Demo session expired. No decision recorded.",
                })

            # ------------------------------------------------------------------
            # Phase 5: Demo Complete
            # ------------------------------------------------------------------
            await websocket.send_json({
                "type": "demo_complete",
                "message": "Demo complete. CoastGuard protected your $40k order.",
                "timestamp": datetime.utcnow().isoformat(),
            })

        except asyncio.CancelledError:
            logger.info("Demo sequence cancelled")
        except Exception as e:
            logger.error(f"Demo sequence error: {e}")
            try:
                await websocket.send_json({"type": "error", "message": str(e)})
            except Exception:
                pass
        finally:
            self.is_playing = False
