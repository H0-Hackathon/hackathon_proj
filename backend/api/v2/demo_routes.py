"""
CoastGuard — Demo Routes

Phase 1: Stub routes. The demo WebSocket infrastructure is kept for future
use in Phase 3 when the 5-agent pipeline autoplay scenario is implemented.

The frontend shows a "Demo Coming Soon" placeholder for now.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from demo.autoplay_controller import TariffAlertController
import uuid
import logging
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v2/demo", tags=["Demo"])

# In-memory registry of active demo sessions: demo_id -> controller
active_sessions: dict = {}


@router.post("/start", summary="Start a demo session")
async def start_demo(scenario: str = "tariff_alert"):
    """
    Create a new demo session and return its ID + WebSocket URL.

    Scenarios available:
    - tariff_alert: Vietnamese textile tariff crisis (25% tariff on HS 6109)
    """
    demo_id = str(uuid.uuid4())
    logger.info(f"Starting demo session {demo_id} for scenario: {scenario}")

    controller = TariffAlertController()
    active_sessions[demo_id] = controller

    return {
        "demo_id": demo_id,
        "status": "started",
        "scenario": scenario,
        "websocket_url": f"ws://localhost:8000/api/v2/demo/ws?demo_id={demo_id}",
        "note": "Demo autoplay coming in Phase 3. Connect via WebSocket and send {action: 'play'}.",
    }


@router.websocket("/ws")
async def websocket_demo(websocket: WebSocket, demo_id: str):
    """
    WebSocket endpoint for demo autoplay.
    Accepts JSON commands: {action: 'play'}, {action: 'confirm', confirmation_type: 'approve'},
    {action: 'ping'}.
    """
    await websocket.accept()
    logger.info(f"WebSocket connected: demo_id={demo_id}")

    controller = active_sessions.get(demo_id)
    if not controller:
        logger.warning(f"Demo session not found: {demo_id}")
        await websocket.close(code=1008, reason="Invalid demo_id")
        return

    demo_task = None

    try:
        while True:
            data = await websocket.receive_json()
            logger.info(f"Demo command received: {data}")

            if data.get("action") == "play":
                if not controller.is_playing:
                    controller.is_playing = True
                    demo_task = asyncio.create_task(
                        controller.run_demo_sequence(websocket)
                    )
                    logger.info("Demo sequence started")

            elif data.get("action") == "confirm":
                confirmation_type = data.get("confirmation_type", "approve")
                logger.info(f"User confirmed: {confirmation_type}")
                controller.confirm_decision(confirmation_type)

            elif data.get("action") == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: demo_id={demo_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.close(code=1011)
        except Exception:
            pass
    finally:
        if demo_task and not demo_task.done():
            demo_task.cancel()
        active_sessions.pop(demo_id, None)


@router.get("/health", summary="Demo route health check")
async def demo_health():
    """Returns demo route status and active session count."""
    return {
        "status": "ok",
        "active_sessions": len(active_sessions),
        "note": "Full demo autoplay available in Phase 3.",
    }
