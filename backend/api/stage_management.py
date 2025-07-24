"""
舞台管理API路由
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel

from models.data_models import Position2D, dataclass_to_dict
from core.data_store import InMemoryDataStore

router = APIRouter()

# 请求模型
class UpdatePositionRequest(BaseModel):
    x: float
    y: float

class CreateActorRequest(BaseModel):
    name: str
    color: str = "#FF5733"

# 依赖注入：获取数据存储实例
def get_data_store() -> InMemoryDataStore:
    from main import data_store
    return data_store

@router.get("/project")
async def get_current_project(data_store: InMemoryDataStore = Depends(get_data_store)):
    """获取当前项目信息"""
    
    project = data_store.get_current_project()
    if not project:
        # 如果没有当前项目，创建一个默认项目
        project = data_store.create_project("默认舞台项目", "AI舞台系统默认项目")
        data_store.save_to_json("data/project_data.json")
    
    return {
        "project": dataclass_to_dict(project)
    }

@router.get("/project/{project_id}")
async def get_project_data(
    project_id: str,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """获取项目的完整数据"""
    
    project_data = data_store.get_project_data(project_id)
    if not project_data:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    return project_data

@router.get("/actors")
async def get_all_actors(data_store: InMemoryDataStore = Depends(get_data_store)):
    """获取所有演员"""
    
    actors = data_store.get_all_actors()
    return {
        "actors": [dataclass_to_dict(actor) for actor in actors],
        "count": len(actors)
    }

@router.post("/actors")
async def create_actor(
    request: CreateActorRequest,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """创建新演员"""
    
    actor = data_store.add_actor(request.name, request.color)
    data_store.save_to_json("data/project_data.json")
    
    return {
        "message": "演员创建成功",
        "actor": dataclass_to_dict(actor)
    }

@router.get("/actors/{actor_id}")
async def get_actor(
    actor_id: str,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """获取演员信息"""
    
    actor = data_store.get_actor(actor_id)
    if not actor:
        raise HTTPException(status_code=404, detail="演员不存在")
    
    return {
        "actor": dataclass_to_dict(actor)
    }

@router.put("/actors/{actor_id}/position")
async def update_actor_position(
    actor_id: str,
    request: UpdatePositionRequest,
    timestamp: float,
    video_id: str,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """更新演员位置（用于拖拽操作）"""
    
    actor = data_store.get_actor(actor_id)
    if not actor:
        raise HTTPException(status_code=404, detail="演员不存在")
    
    video = data_store.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    # 获取现有位置数据
    positions = data_store.get_actor_positions(video_id)
    
    # 查找对应时间戳的位置数据并更新
    updated = False
    for pos in positions:
        if pos.actor_id == actor_id and abs(pos.timestamp - timestamp) < 0.1:  # 允许0.1秒的误差
            pos.position_2d.x = request.x
            pos.position_2d.y = request.y
            updated = True
            break
    
    if not updated:
        # 如果没有找到对应的位置数据，创建新的
        from models.data_models import ActorPosition
        new_position = ActorPosition.create(
            actor_id, timestamp, Position2D(request.x, request.y), 1.0
        )
        positions.append(new_position)
    
    # 更新数据存储
    data_store.add_actor_positions(video_id, positions)
    data_store.save_to_json("data/project_data.json")
    
    return {
        "message": "位置更新成功",
        "actor_id": actor_id,
        "timestamp": timestamp,
        "position": {"x": request.x, "y": request.y}
    }

@router.get("/timeline/{video_id}")
async def get_timeline_data(
    video_id: str,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """获取时间轴数据"""
    
    video = data_store.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    transcripts = data_store.get_transcripts(video_id)
    positions = data_store.get_actor_positions(video_id)
    
    # 获取项目的灯光和音乐数据
    project = data_store.get_current_project()
    lighting_cues = []
    music_cues = []
    
    if project:
        lighting_cues = data_store.get_lighting_cues(project.id)
        music_cues = data_store.get_music_cues(project.id)
    
    return {
        "video": dataclass_to_dict(video),
        "transcripts": [dataclass_to_dict(t) for t in transcripts],
        "actor_positions": [dataclass_to_dict(p) for p in positions],
        "lighting_cues": [dataclass_to_dict(c) for c in lighting_cues],
        "music_cues": [dataclass_to_dict(c) for c in music_cues]
    }