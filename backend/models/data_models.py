"""
AI舞台系统核心数据模型
"""

from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import uuid

@dataclass
class Position2D:
    x: float
    y: float

@dataclass
class Position3D:
    x: float
    y: float
    z: float

@dataclass
class RGB:
    r: int
    g: int
    b: int

@dataclass
class TranscriptSegment:
    id: str
    text: str
    start_time: float
    end_time: float
    speaker_id: Optional[str] = None
    confidence: float = 0.0
    emotion: Optional[str] = None
    
    @classmethod
    def create(cls, text: str, start_time: float, end_time: float, 
               speaker_id: Optional[str] = None, confidence: float = 0.0, 
               emotion: Optional[str] = None):
        return cls(
            id=str(uuid.uuid4()),
            text=text,
            start_time=start_time,
            end_time=end_time,
            speaker_id=speaker_id,
            confidence=confidence,
            emotion=emotion
        )

@dataclass
class ActorPosition:
    id: str
    actor_id: str
    timestamp: float
    position_2d: Position2D
    confidence: float = 0.0
    
    @classmethod
    def create(cls, actor_id: str, timestamp: float, position_2d: Position2D, confidence: float = 0.0):
        return cls(
            id=str(uuid.uuid4()),
            actor_id=actor_id,
            timestamp=timestamp,
            position_2d=position_2d,
            confidence=confidence
        )

@dataclass
class Waypoint:
    position: Position2D
    timestamp: float
    action: Optional[str] = None

@dataclass
class MovementPath:
    actor_id: str
    # 或许可以把离散路径点换成拟合路径
    waypoints: List[Waypoint]
    duration: float

@dataclass
class LightState:
    light_id: str
    color: RGB
    intensity: float
    position: Optional[Position3D] = None

@dataclass
class LightingCue:
    id: str
    timestamp: float
    lights: List[LightState]
    transition_duration: float = 1.0
    
    @classmethod
    def create(cls, timestamp: float, lights: List[LightState], transition_duration: float = 1.0):
        return cls(
            id=str(uuid.uuid4()),
            timestamp=timestamp,
            lights=lights,
            transition_duration=transition_duration
        )

@dataclass
class MusicCue:
    id: str
    timestamp: float
    action: str  # "start", "stop", "fade_in", "fade_out"
    track_id: Optional[str] = None
    volume: float = 1.0
    fade_duration: float = 0.0
    
    @classmethod
    def create(cls, timestamp: float, action: str, track_id: Optional[str] = None, 
               volume: float = 1.0, fade_duration: float = 0.0):
        return cls(
            id=str(uuid.uuid4()),
            timestamp=timestamp,
            action=action,
            track_id=track_id,
            volume=volume,
            fade_duration=fade_duration
        )

@dataclass
class Actor:
    id: str
    name: str
    color: str  # HEX颜色代码
    
    @classmethod
    def create(cls, name: str, color: str = "#FF5733"):
        return cls(
            id=str(uuid.uuid4()),
            name=name,
            color=color
        )

@dataclass
class Video:
    id: str
    filename: str
    file_path: str
    duration: float = 0.0
    fps: int = 30
    resolution: str = "1920x1080"
    status: str = "uploaded"  # uploaded, processing, processed, error
    created_at: str = ""
    
    @classmethod
    def create(cls, filename: str, file_path: str):
        return cls(
            id=str(uuid.uuid4()),
            filename=filename,
            file_path=file_path,
            created_at=datetime.now().isoformat()
        )

@dataclass
class Project:
    id: str
    name: str
    description: str = ""
    created_at: str = ""
    
    @classmethod
    def create(cls, name: str, description: str = ""):
        return cls(
            id=str(uuid.uuid4()),
            name=name,
            description=description,
            created_at=datetime.now().isoformat()
        )

# 辅助函数
def dataclass_to_dict(obj) -> Dict[str, Any]:
    """将dataclass对象转换为字典"""
    if hasattr(obj, '__dataclass_fields__'):
        return asdict(obj)
    return obj

def dict_to_dataclass(cls, data: Dict[str, Any]):
    """将字典转换为dataclass对象"""
    if isinstance(data, dict):
        # 处理嵌套的dataclass
        field_types = {field.name: field.type for field in cls.__dataclass_fields__.values()}
        processed_data = {}
        
        for key, value in data.items():
            if key in field_types:
                field_type = field_types[key]
                # 处理Optional类型
                if hasattr(field_type, '__origin__') and field_type.__origin__ is Union:
                    field_type = field_type.__args__[0]  # 获取Optional的实际类型
                
                # 如果是dataclass类型，递归转换
                if hasattr(field_type, '__dataclass_fields__'):
                    processed_data[key] = dict_to_dataclass(field_type, value)
                elif isinstance(value, list) and len(value) > 0:
                    # 处理List类型
                    if hasattr(field_type, '__args__'):
                        list_type = field_type.__args__[0]
                        if hasattr(list_type, '__dataclass_fields__'):
                            processed_data[key] = [dict_to_dataclass(list_type, item) for item in value]
                        else:
                            processed_data[key] = value
                    else:
                        processed_data[key] = value
                else:
                    processed_data[key] = value
            else:
                processed_data[key] = value
        
        return cls(**processed_data)
    return data