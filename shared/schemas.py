from pydantic import BaseModel, Field
from datetime import datetime
from typing import Any, Dict, Optional, List
from enum import Enum

class EventType(str, Enum):
    ARTICLE_COLLECTED = "veille.article_collected"
    PUBLICATION_SYNCED = "biblio.publication_synced"
    SIMULATION_COMPLETED = "sim.completed"
    OPTIMIZATION_COMPLETED = "opt.completed"
    DATA_VALIDATION_FAILED = "qual.validation_failed"
    TASK_ASSIGNED = "orch.task_assigned"
    # Add more as needed

class Event(BaseModel):
    id: str
    type: EventType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    source_agent: str
    payload: Dict[str, Any]

class ActionStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    REQUIRES_APPROVAL = "requires_approval"
    REJECTED = "rejected"

class AgentAction(BaseModel):
    id: str
    agent_name: str
    action_type: str
    params: Dict[str, Any]
    status: ActionStatus = ActionStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
class ActionResult(BaseModel):
    action_id: str
    status: ActionStatus
    result_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    completed_at: datetime = Field(default_factory=datetime.utcnow)

class AuditEntry(BaseModel):
    agent_name: str
    action: str
    entity_type: str
    entity_id: str
    user_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Dict[str, Any] = Field(default_factory=dict)
