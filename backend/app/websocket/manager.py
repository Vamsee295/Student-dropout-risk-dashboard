from fastapi import WebSocket
from typing import Dict, List
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Maps a channel name to a list of active WebSockets
        # Channels: 'student_{id}', 'faculty_{id}', 'dean', 'notifications', 'risk', 'dashboard'
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)
        logger.info(f"Client connected to channel: {channel}")

    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.active_connections:
            if websocket in self.active_connections[channel]:
                self.active_connections[channel].remove(websocket)
                if not self.active_connections[channel]:
                    del self.active_connections[channel]
            logger.info(f"Client disconnected from channel: {channel}")

    async def broadcast(self, channel: str, message: dict):
        if channel in self.active_connections:
            connections = self.active_connections[channel]
            for connection in connections:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to {channel}: {str(e)}")
                    # We might want to remove broken connections here, but disconnect usually handles it via exceptions in the receive loop

    async def broadcast_multiple(self, channels: List[str], message: dict):
        for channel in channels:
            await self.broadcast(channel, message)


manager = ConnectionManager()
