"""
视频分析API路由
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from typing import List, Dict, Any
import os
import shutil
import logging
from pathlib import Path

from backend.models.data_models import Video, dataclass_to_dict
from backend.core.data_store import InMemoryDataStore
from backend.core.video_processor import video_processor
from backend.core.audio_processor import audio_processor

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# 依赖注入：获取数据存储实例
def get_data_store() -> InMemoryDataStore:
    from backend.main import data_store
    return data_store

@router.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """上传视频文件"""
    
    logger.info(f"开始上传视频: {file.filename}")
    
    # 基础验证
    if not file.filename:
        raise HTTPException(status_code=400, detail="文件名不能为空")
    
    # 检查文件类型（基于扩展名）
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in video_processor.SUPPORTED_FORMATS:
        supported = ", ".join(video_processor.SUPPORTED_FORMATS.keys())
        raise HTTPException(
            status_code=400, 
            detail=f"不支持的文件格式: {file_ext}。支持的格式: {supported}"
        )
    
    # 检查文件大小
    file_size = 0
    if hasattr(file, 'size') and file.size:
        file_size = file.size
        if file_size > video_processor.MAX_FILE_SIZE:
            max_mb = video_processor.MAX_FILE_SIZE / (1024 * 1024)
            current_mb = file_size / (1024 * 1024)
            raise HTTPException(
                status_code=400, 
                detail=f"文件过大: {current_mb:.1f}MB (最大: {max_mb:.1f}MB)"
            )
    
    # 创建上传目录
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    # 生成唯一文件名（避免冲突）
    import uuid
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = upload_dir / unique_filename
    
    # 保存文件
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"文件保存成功: {file_path}")
        
    except Exception as e:
        logger.error(f"文件保存失败: {e}")
        raise HTTPException(status_code=500, detail=f"文件保存失败: {str(e)}")
    
    # 验证保存的文件
    try:
        validation_result = video_processor.validate_video_file(str(file_path), file_size)
        
        if not validation_result["valid"]:
            # 删除无效文件
            file_path.unlink(missing_ok=True)
            errors = "; ".join(validation_result["errors"])
            raise HTTPException(status_code=400, detail=f"视频文件验证失败: {errors}")
        
        # 记录警告
        for warning in validation_result.get("warnings", []):
            logger.warning(f"视频文件警告: {warning}")
            
    except HTTPException:
        raise
    except Exception as e:
        # 删除文件
        file_path.unlink(missing_ok=True)
        logger.error(f"文件验证失败: {e}")
        raise HTTPException(status_code=500, detail=f"文件验证失败: {str(e)}")
    
    # 创建视频记录
    video = data_store.add_video(file.filename, str(file_path))
    
    # 后台任务：提取视频信息
    background_tasks.add_task(extract_video_info_task, video.id, str(file_path), data_store)
    
    # 保存数据
    try:
        data_store.save_to_json("data/project_data.json")
    except Exception as e:
        logger.error(f"数据保存失败: {e}")
        # 不抛出异常，因为视频已经上传成功
    
    logger.info(f"视频上传成功: {video.id}")
    
    return {
        "message": "视频上传成功，正在后台处理...",
        "video": dataclass_to_dict(video)
    }

async def extract_video_info_task(video_id: str, file_path: str, data_store: InMemoryDataStore):
    """后台任务：提取视频信息"""
    try:
        logger.info(f"开始提取视频信息: {video_id}")
        
        # 提取视频信息
        video_info = video_processor.extract_video_info(file_path)
        
        # 更新视频记录
        data_store.update_video_status(
            video_id, 
            "processed", 
            duration=video_info["duration"], 
            fps=int(video_info["fps"])
        )
        
        # 更新分辨率信息
        video = data_store.get_video(video_id)
        if video:
            video.resolution = video_info["resolution"]
        
        # 保存数据
        data_store.save_to_json("data/project_data.json")
        
        logger.info(f"视频信息提取完成: {video_id}")
        
    except Exception as e:
        logger.error(f"视频信息提取失败: {video_id}, {e}")
        
        # 更新状态为错误
        data_store.update_video_status(video_id, "error")
        data_store.save_to_json("data/project_data.json")

@router.post("/{video_id}/extract-audio")
async def extract_audio(
    video_id: str,
    background_tasks: BackgroundTasks,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """提取视频音频"""
    
    video = data_store.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    if not os.path.exists(video.file_path):
        raise HTTPException(status_code=404, detail="视频文件不存在")
    
    # 后台任务：提取音频
    background_tasks.add_task(extract_audio_task, video_id, video.file_path, data_store)
    
    return {
        "message": "音频提取任务已启动",
        "video_id": video_id
    }

async def extract_audio_task(video_id: str, video_path: str, data_store: InMemoryDataStore):
    """后台任务：提取音频"""
    try:
        logger.info(f"开始提取音频: {video_id}")
        
        # 提取音频
        audio_path = audio_processor.extract_audio_from_video(video_path)
        
        # 分析音频属性
        audio_properties = audio_processor.analyze_audio_properties(audio_path)
        
        logger.info(f"音频提取完成: {video_id}, 音频文件: {audio_path}")
        
        # 这里可以保存音频路径到数据存储中
        # 暂时只记录日志
        
    except Exception as e:
        logger.error(f"音频提取失败: {video_id}, {e}")

@router.post("/{video_id}/transcribe")
async def transcribe_video(
    video_id: str,
    background_tasks: BackgroundTasks,
    use_whisper: bool = False,
    language: str = "zh",
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """转录视频音频为文本"""
    
    video = data_store.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    if not os.path.exists(video.file_path):
        raise HTTPException(status_code=404, detail="视频文件不存在")
    
    # 后台任务：音频转录
    background_tasks.add_task(
        transcribe_audio_task, 
        video_id, 
        video.file_path, 
        use_whisper, 
        language, 
        data_store
    )
    
    return {
        "message": "音频转录任务已启动",
        "video_id": video_id,
        "use_whisper": use_whisper,
        "language": language
    }

async def transcribe_audio_task(
    video_id: str, 
    video_path: str, 
    use_whisper: bool, 
    language: str, 
    data_store: InMemoryDataStore
):
    """后台任务：音频转录"""
    try:
        logger.info(f"开始音频转录: {video_id}")
        
        # 提取音频
        audio_path = audio_processor.extract_audio_from_video(video_path)
        
        # 转录音频
        if use_whisper:
            transcripts = audio_processor.transcribe_audio_with_funasr(audio_path, language)
        else:
            transcripts = audio_processor.transcribe_audio_simple(audio_path, language)
        
        # 保存转录结果
        data_store.add_transcripts(video_id, transcripts)
        
        # 更新视频状态
        video = data_store.get_video(video_id)
        if video and video.status != "error":
            data_store.update_video_status(video_id, "transcribed")
        
        # 保存数据
        data_store.save_to_json("data/project_data.json")
        
        logger.info(f"音频转录完成: {video_id}, {len(transcripts)} 个片段")
        
    except Exception as e:
        logger.error(f"音频转录失败: {video_id}, {e}")
        
        # 更新状态为错误
        data_store.update_video_status(video_id, "error")
        data_store.save_to_json("data/project_data.json")

@router.get("/{video_id}/audio-info")
async def get_audio_info(
    video_id: str,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """获取音频信息"""
    
    video = data_store.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    if not os.path.exists(video.file_path):
        raise HTTPException(status_code=404, detail="视频文件不存在")
    
    try:
        # 提取音频（如果还没有的话）
        audio_path = audio_processor.extract_audio_from_video(video.file_path)
        
        # 分析音频属性
        audio_properties = audio_processor.analyze_audio_properties(audio_path)
        
        # 检测语音片段
        speech_segments = audio_processor.detect_speech_segments(audio_path)
        
        return {
            "video_id": video_id,
            "audio_properties": audio_properties,
            "speech_segments": speech_segments
        }
        
    except Exception as e:
        logger.error(f"获取音频信息失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取音频信息失败: {str(e)}")

@router.get("/{video_id}/info")
async def get_video_info(
    video_id: str,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """获取视频基础信息"""
    
    video = data_store.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    return {
        "video": dataclass_to_dict(video)
    }

@router.get("/{video_id}/details")
async def get_video_details(
    video_id: str,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """获取视频详细信息"""
    
    video = data_store.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    # 基础信息
    result = {
        "video": dataclass_to_dict(video),
        "file_exists": False,
        "detailed_info": None,
        "validation": None
    }
    
    # 检查文件是否存在
    if os.path.exists(video.file_path):
        result["file_exists"] = True
        
        try:
            # 获取详细信息
            detailed_info = video_processor.extract_video_info(video.file_path)
            result["detailed_info"] = detailed_info
            
            # 验证文件
            validation = video_processor.validate_video_content(video.file_path)
            result["validation"] = validation
            
        except Exception as e:
            logger.error(f"获取视频详细信息失败: {e}")
            result["error"] = str(e)
    
    return result

@router.get("/{video_id}/thumbnail")
async def get_video_thumbnail(
    video_id: str,
    timestamp: float = 1.0,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """获取视频缩略图"""
    
    video = data_store.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    if not os.path.exists(video.file_path):
        raise HTTPException(status_code=404, detail="视频文件不存在")
    
    try:
        thumbnail_path = video_processor.extract_thumbnail(video.file_path, timestamp)
        
        if thumbnail_path and os.path.exists(thumbnail_path):
            from fastapi.responses import FileResponse
            return FileResponse(
                thumbnail_path,
                media_type="image/jpeg",
                filename=f"{video_id}_thumbnail.jpg"
            )
        else:
            raise HTTPException(status_code=500, detail="缩略图生成失败")
            
    except Exception as e:
        logger.error(f"缩略图生成失败: {e}")
        raise HTTPException(status_code=500, detail=f"缩略图生成失败: {str(e)}")

@router.post("/{video_id}/validate")
async def validate_video(
    video_id: str,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """验证视频文件完整性"""
    
    video = data_store.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    if not os.path.exists(video.file_path):
        raise HTTPException(status_code=404, detail="视频文件不存在")
    
    try:
        # 文件验证
        file_validation = video_processor.validate_video_file(video.file_path)
        
        # 内容验证
        content_validation = video_processor.validate_video_content(video.file_path)
        
        return {
            "video_id": video_id,
            "file_validation": file_validation,
            "content_validation": content_validation,
            "overall_valid": file_validation["valid"] and content_validation["valid"]
        }
        
    except Exception as e:
        logger.error(f"视频验证失败: {e}")
        raise HTTPException(status_code=500, detail=f"视频验证失败: {str(e)}")

@router.get("/{video_id}/analysis")
async def get_analysis_result(
    video_id: str,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """获取视频分析结果"""
    
    video = data_store.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    # 获取分析结果
    transcripts = data_store.get_transcripts(video_id)
    positions = data_store.get_actor_positions(video_id)
    
    return {
        "video": dataclass_to_dict(video),
        "transcripts": [dataclass_to_dict(t) for t in transcripts],
        "actor_positions": [dataclass_to_dict(p) for p in positions],
        "analysis_status": video.status
    }

@router.post("/{video_id}/process")
async def process_video(
    video_id: str,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """处理视频（提取音频和位置信息）"""
    
    video = data_store.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    # 更新状态为处理中
    data_store.update_video_status(video_id, "processing")
    
    try:
        # TODO: 这里将实现实际的视频处理逻辑
        # 1. 音频提取和转文本
        # 2. 人体姿态检测
        # 3. 位置数据提取
        
        # 暂时返回模拟数据
        from models.data_models import TranscriptSegment, ActorPosition, Position2D, Actor
        
        # 创建示例演员
        actor = data_store.add_actor("演员A", "#FF5733")
        
        # 模拟转录数据
        mock_transcripts = [
            TranscriptSegment.create("欢迎来到舞台", 0.0, 2.0, actor.id, 0.95, "positive"),
            TranscriptSegment.create("让我们开始表演", 2.5, 5.0, actor.id, 0.90, "neutral"),
            TranscriptSegment.create("这是一个精彩的演出", 5.5, 8.0, actor.id, 0.88, "positive")
        ]
        
        # 模拟位置数据
        mock_positions = [
            ActorPosition.create(actor.id, 0.0, Position2D(100, 200), 0.9),
            ActorPosition.create(actor.id, 1.0, Position2D(120, 210), 0.85),
            ActorPosition.create(actor.id, 2.0, Position2D(140, 220), 0.88),
            ActorPosition.create(actor.id, 3.0, Position2D(160, 200), 0.92),
            ActorPosition.create(actor.id, 4.0, Position2D(180, 180), 0.87)
        ]
        
        # 保存分析结果
        data_store.add_transcripts(video_id, mock_transcripts)
        data_store.add_actor_positions(video_id, mock_positions)
        
        # 更新视频状态
        data_store.update_video_status(video_id, "processed", duration=10.0, fps=30)
        
        # 保存数据
        data_store.save_to_json("data/project_data.json")
        
        return {
            "message": "视频处理完成",
            "video": dataclass_to_dict(data_store.get_video(video_id)),
            "transcripts_count": len(mock_transcripts),
            "positions_count": len(mock_positions)
        }
        
    except Exception as e:
        # 处理失败，更新状态
        data_store.update_video_status(video_id, "error")
        raise HTTPException(status_code=500, detail=f"视频处理失败: {str(e)}")

@router.get("/")
async def list_videos(data_store: InMemoryDataStore = Depends(get_data_store)):
    """获取所有视频列表"""
    
    videos = list(data_store.videos.values())
    return {
        "videos": [dataclass_to_dict(video) for video in videos],
        "count": len(videos)
    }