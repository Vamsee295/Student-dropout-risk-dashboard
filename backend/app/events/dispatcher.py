from typing import Callable, Dict, List, Any
import logging
from fastapi import BackgroundTasks

logger = logging.getLogger(__name__)

class EventDispatcher:
    def __init__(self):
        self._handlers: Dict[str, List[Callable]] = {}

    def subscribe(self, event_name: str, handler: Callable):
        if event_name not in self._handlers:
            self._handlers[event_name] = []
        self._handlers[event_name].append(handler)
        logger.info(f"Subscribed {handler.__name__} to event {event_name}")

    def dispatch(self, event_name: str, payload: Any, background_tasks: BackgroundTasks = None):
        """
        Dispatches an event. If background_tasks is provided, handlers run asynchronously in the background.
        Otherwise, they run synchronously (useful for testing, but blocks API).
        """
        if event_name not in self._handlers:
            logger.warning(f"No handlers registered for event: {event_name}")
            return
            
        for handler in self._handlers[event_name]:
            logger.info(f"Dispatching event {event_name} to handler {handler.__name__}")
            if background_tasks:
                background_tasks.add_task(handler, payload)
            else:
                try:
                    handler(payload)
                except Exception as e:
                    logger.error(f"Error executing synchronous handler for {event_name}: {str(e)}")

dispatcher = EventDispatcher()
