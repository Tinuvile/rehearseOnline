"""
AI建议API路由
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel

from models.data_models import (
    LightingCue, MusicCue, LightState, RGB, 
    dataclass_to_dict
)
from core.data_store import InMemoryDataStore

router = APIRouter()

# 请求模型
class MovementSuggestionRequest(BaseModel):
    video_id: str
    actor_id: str

class LightingSuggestionRequest(BaseModel):
    video_id: str

class MusicSuggestionRequest(BaseModel):
    video_id: str

class ActorlineSuggestionRequest(BaseModel):
    video_id: str
    actorline_id: str

# 依赖注入：获取数据存储实例
def get_data_store() -> InMemoryDataStore:
    from main import data_store
    return data_store

@router.post("/movement-suggestions")
async def get_movement_suggestions(
    request: MovementSuggestionRequest,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """获取走位建议"""
    
    video = data_store.get_video(request.video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    actor = data_store.get_actor(request.actor_id)
    if not actor:
        raise HTTPException(status_code=404, detail="演员不存在")
    
    # TODO: 实现实际的AI走位建议算法
    # 这里返回模拟的建议数据
    
    suggestions = [
        {
            "id": "suggestion_1",
            "timestamp": 2.0,
            "suggestion": "建议演员向舞台中央移动，增强表现力",
            "position": {"x": 300, "y": 250},
            "confidence": 0.85,
            "reason": "基于台词情感分析，此时需要更强的舞台存在感"
        },
        {
            "id": "suggestion_2", 
            "timestamp": 5.5,
            "suggestion": "建议演员向左侧移动，与其他演员形成对话关系",
            "position": {"x": 200, "y": 200},
            "confidence": 0.78,
            "reason": "空间布局优化，改善视觉平衡"
        }
    ]
    
    return {
        "video_id": request.video_id,
        "actor_id": request.actor_id,
        "suggestions": suggestions,
        "generated_at": "2024-01-01T12:00:00Z"
    }

@router.post("/lighting-suggestions")
async def get_lighting_suggestions(
    request: LightingSuggestionRequest,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """获取灯光建议"""
    
    video = data_store.get_video(request.video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    transcripts = data_store.get_transcripts(request.video_id)
    
    # TODO: 实现基于情感分析的灯光建议
    # 这里返回模拟的建议数据
    
    suggestions = []
    
    for transcript in transcripts:
        if transcript.emotion == "positive":
            # 积极情感 - 暖色调
            light_state = LightState(
                light_id="main_light",
                color=RGB(255, 200, 100),  # 暖黄色
                intensity=0.8
            )
            suggestion = {
                "timestamp": transcript.start_time,
                "suggestion": "使用暖色调灯光增强积极情感",
                "lighting_cue": dataclass_to_dict(
                    LightingCue.create(transcript.start_time, [light_state], 2.0)
                ),
                "confidence": 0.9,
                "reason": f"台词'{transcript.text}'表达积极情感"
            }
            suggestions.append(suggestion)
            
        elif transcript.emotion == "negative":
            # 消极情感 - 冷色调
            light_state = LightState(
                light_id="main_light",
                color=RGB(100, 150, 255),  # 冷蓝色
                intensity=0.6
            )
            suggestion = {
                "timestamp": transcript.start_time,
                "suggestion": "使用冷色调灯光配合消极情感",
                "lighting_cue": dataclass_to_dict(
                    LightingCue.create(transcript.start_time, [light_state], 1.5)
                ),
                "confidence": 0.85,
                "reason": f"台词'{transcript.text}'表达消极情感"
            }
            suggestions.append(suggestion)
    
    return {
        "video_id": request.video_id,
        "suggestions": suggestions,
        "generated_at": "2024-01-01T12:00:00Z"
    }

@router.post("/music-suggestions")
async def get_music_suggestions(
    request: MusicSuggestionRequest,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """获取音乐建议"""
    
    video = data_store.get_video(request.video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    transcripts = data_store.get_transcripts(request.video_id)
    
    # TODO: 实现基于剧情转折点的音乐建议
    # 这里返回模拟的建议数据
    
    suggestions = []
    
    # 检测情感变化点
    prev_emotion = None
    for i, transcript in enumerate(transcripts):
        if prev_emotion and prev_emotion != transcript.emotion:
            # 情感转换点，建议音乐切换
            if transcript.emotion == "positive":
                music_cue = MusicCue.create(
                    transcript.start_time - 0.5,  # 提前0.5秒开始
                    "fade_in",
                    "upbeat_background",
                    0.7,
                    2.0
                )
                suggestion = {
                    "timestamp": transcript.start_time - 0.5,
                    "suggestion": "淡入轻快背景音乐",
                    "music_cue": dataclass_to_dict(music_cue),
                    "confidence": 0.82,
                    "reason": f"情感从{prev_emotion}转为{transcript.emotion}"
                }
                suggestions.append(suggestion)
                
            elif transcript.emotion == "negative":
                music_cue = MusicCue.create(
                    transcript.start_time - 0.5,
                    "fade_out",
                    "upbeat_background",
                    0.3,
                    1.5
                )
                suggestion = {
                    "timestamp": transcript.start_time - 0.5,
                    "suggestion": "淡出背景音乐或切换到低沉音乐",
                    "music_cue": dataclass_to_dict(music_cue),
                    "confidence": 0.78,
                    "reason": f"情感从{prev_emotion}转为{transcript.emotion}"
                }
                suggestions.append(suggestion)
        
        prev_emotion = transcript.emotion
    
    return {
        "video_id": request.video_id,
        "suggestions": suggestions,
        "generated_at": "2024-01-01T12:00:00Z"
    }

@router.post("/actorline-suggestions")
async def get_actorline_suggestions(
    request: ActorlineSuggestionRequest,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """获取演员台词建议"""

    video = data_store.get_video(request.video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    actorline = data_store.get_actorline(request.actorline_id)
    if not actorline:
        raise HTTPException(status_code=404, detail="演员台词不存在")
    
    # TODO: 实现基于演员台词的AI建议
    # 这里返回模拟的建议数据
    
    suggestions = [
        {
            "id": "suggestion_1",
            "timestamp": 2.0,
            "suggestion": "建议此句台词改为...",
            "confidence": 0.85,
            "reason": "基于台词情感分析，此时需要更强的舞台存在感"
        },
    ]
    
    return {
        "video_id": request.video_id,
        "actorline_id": request.actorline_id,
        "suggestions": suggestions,
        "generated_at": "2024-01-01T12:00:00Z"
    }

@router.post("/apply-suggestion")
async def apply_suggestion(
    suggestion_type: str,  # "lighting" or "music"
    suggestion_data: Dict[str, Any],
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """应用AI建议"""
    
    project = data_store.get_current_project()
    if not project:
        raise HTTPException(status_code=404, detail="没有当前项目")
    
    try:
        if suggestion_type == "movement":
            # 应用走位建议
            movement_cue_data = suggestion_data.get("movement_cue")
            if movement_cue_data:
                from models.data_models import dict_to_dataclass
                movement_cue = dict_to_dataclass(MovementCue, movement_cue_data)
                data_store.add_movement_cue(project.id, movement_cue)
        
        if suggestion_type == "lighting":
            # 应用灯光建议
            lighting_cue_data = suggestion_data.get("lighting_cue")
            if lighting_cue_data:
                from models.data_models import dict_to_dataclass
                lighting_cue = dict_to_dataclass(LightingCue, lighting_cue_data)
                data_store.add_lighting_cue(project.id, lighting_cue)
        
        if suggestion_type == "music":
            # 应用音乐建议
            music_cue_data = suggestion_data.get("music_cue")
            if music_cue_data:
                from models.data_models import dict_to_dataclass
                music_cue = dict_to_dataclass(MusicCue, music_cue_data)
                data_store.add_music_cue(project.id, music_cue)

        elif suggestion_type == "actorline":
            # 应用演员台词建议
            actorline_data = suggestion_data.get("actorline_data")
            if actorline_data:
                from models.data_models import dict_to_dataclass
                actorline = dict_to_dataclass(Actorline, actorline_data)
                data_store.add_actorline(project.id, actorline)
        
        else:
            raise HTTPException(status_code=400, detail="不支持的建议类型")
        
        # 保存数据
        data_store.save_to_json("data/project_data.json")
        
        return {
            "message": f"{suggestion_type}建议应用成功",
            "suggestion_type": suggestion_type
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"应用建议失败: {str(e)}")

@router.get("/emotions/{video_id}")
async def get_emotion_analysis(
    video_id: str,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """获取情感分析结果"""
    
    video = data_store.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    transcripts = data_store.get_transcripts(video_id)
    
    # 统计情感分布
    emotion_stats = {"positive": 0, "negative": 0, "neutral": 0}
    emotion_timeline = []
    
    for transcript in transcripts:
        if transcript.emotion:
            emotion_stats[transcript.emotion] = emotion_stats.get(transcript.emotion, 0) + 1
            emotion_timeline.append({
                "timestamp": transcript.start_time,
                "emotion": transcript.emotion,
                "text": transcript.text,
                "confidence": transcript.confidence
            })
    
    return {
        "video_id": video_id,
        "emotion_stats": emotion_stats,
        "emotion_timeline": emotion_timeline,
        "total_segments": len(transcripts)
    }