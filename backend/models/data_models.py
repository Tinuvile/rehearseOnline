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

    def to_dict(self) -> Dict[str, Any]:
        """将TranscriptSegment对象转换为字典"""
        return {
            "id": self.id,
            "text": self.text,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "speaker_id": self.speaker_id,
            "confidence": self.confidence,
            "emotion": self.emotion
        }

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
    processing_results: Optional[Dict[str, Any]] = None  # 存储各种处理结果
    
    @classmethod
    def create(cls, filename: str, file_path: str):
        return cls(
            id=str(uuid.uuid4()),
            filename=filename,
            file_path=file_path,
            created_at=datetime.now().isoformat(),
            processing_results={}
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

# 3D转2D相关数据模型

@dataclass
class StageCorner:
    """舞台角点"""
    x: float
    y: float

@dataclass
class StageAnnotation:
    """舞台标注信息"""
    corners: List[StageCorner]  # 舞台四个角的坐标
    depth_reference: float  # 参考深度值
    real_width: float  # 实际舞台宽度（米）
    real_height: float  # 实际舞台高度（米）
    
    @classmethod
    def create(cls, corners: List[Dict[str, float]], depth_reference: float, 
               real_width: float, real_height: float):
        corner_objects = [StageCorner(x=c["x"], y=c["y"]) for c in corners]
        return cls(
            corners=corner_objects,
            depth_reference=depth_reference,
            real_width=real_width,
            real_height=real_height
        )

@dataclass
class PersonPosition3D:
    """人员3D位置信息"""
    frame_number: int
    timestamp: float
    person_id: str
    position_3d: Position3D  # 3D坐标
    position_2d: Position2D  # 转换后的2D平面坐标
    confidence: float
    keypoints: Optional[Dict[str, Dict[str, float]]] = None  # 关键点信息
    
    @classmethod
    def create(cls, frame_number: int, timestamp: float, person_id: str,
               position_3d: Position3D, position_2d: Position2D, confidence: float,
               keypoints: Optional[Dict[str, Dict[str, float]]] = None):
        return cls(
            frame_number=frame_number,
            timestamp=timestamp,
            person_id=person_id,
            position_3d=position_3d,
            position_2d=position_2d,
            confidence=confidence,
            keypoints=keypoints
        )

@dataclass
class DepthInfo:
    """深度信息"""
    frame_number: int
    depth_file_path: str
    min_depth: float
    max_depth: float
    mean_depth: float
    width: int
    height: int

@dataclass
class AlphaPoseResult:
    """AlphaPose检测结果"""
    frame_number: int
    person_id: str
    bbox: List[float]  # [x, y, width, height]
    keypoints: List[float]  # 关键点坐标和置信度
    score: float
    center_point: Position2D

@dataclass
class Video3DTo2DResult:
    """视频3D转2D处理结果"""
    video_id: str
    stage_annotation: StageAnnotation
    positions: List[PersonPosition3D]
    processing_time: float
    frame_count: int
    persons_detected: List[str]  # 检测到的人员ID列表
    
    @classmethod
    def create(cls, video_id: str, stage_annotation: StageAnnotation,
               positions: List[PersonPosition3D], processing_time: float):
        return cls(
            video_id=video_id,
            stage_annotation=stage_annotation,
            positions=positions,
            processing_time=processing_time,
            frame_count=len(positions),
            persons_detected=list(set(pos.person_id for pos in positions))
        )