"""
台词提取API - 处理视频上传和台词提取
"""

import os
import logging
import tempfile
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from fastapi.responses import JSONResponse

from backend.core.audio_processor import audio_processor
from backend.models.data_models import TranscriptSegment
from backend.core.data_store import InMemoryDataStore

# 配置日志
logger = logging.getLogger(__name__)

# 创建API路由
router = APIRouter(prefix="/api/dialogue", tags=["dialogue"])

# 依赖注入：获取数据存储实例
def get_data_store() -> InMemoryDataStore:
    from backend.main import data_store
    return data_store

# 支持的视频格式
SUPPORTED_VIDEO_FORMATS = {".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv"}
SUPPORTED_AUDIO_FORMATS = {".wav", ".mp3", ".flac", ".aac", ".ogg"}

@router.post("/upload-video")
async def upload_video_for_dialogue_extraction(
    file: UploadFile = File(...),
    language: str = Form("zh"),
    enable_speaker_diarization: bool = Form(True),
    hotwords: str = Form(""),
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """
    上传视频文件并提取台词
    
    Args:
        file: 上传的视频文件
        language: 语音识别语言 (zh/en)
        enable_speaker_diarization: 是否启用说话人分离
        hotwords: 热词列表，逗号分隔
    
    Returns:
        包含台词信息的JSON响应
    """
    try:
        # 验证文件类型
        file_extension = Path(file.filename or "").suffix.lower()
        if file_extension not in SUPPORTED_VIDEO_FORMATS and file_extension not in SUPPORTED_AUDIO_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"不支持的文件格式：{file_extension}。支持的格式：{SUPPORTED_VIDEO_FORMATS | SUPPORTED_AUDIO_FORMATS}"
            )
        
        # 验证文件大小（限制200MB）
        if file.size and file.size > 200 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="文件大小不能超过200MB"
            )
        
        logger.info(f"开始处理上传的文件: {file.filename} ({file.size} bytes)")
        
        # 创建临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            # 保存上传的文件
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # 根据文件类型进行处理
            if file_extension in SUPPORTED_VIDEO_FORMATS:
                # 视频文件：提取音频后识别
                logger.info("处理视频文件，开始提取音频...")
                result = audio_processor.recognize_video_file(
                    temp_file_path, 
                    language=language,
                    enable_speaker_diarization=enable_speaker_diarization,
                    hotwords=hotwords
                )
            else:
                # 音频文件：直接识别
                logger.info("处理音频文件，开始语音识别...")
                result = audio_processor.recognize_audio_file(
                    temp_file_path,
                    language=language, 
                    enable_speaker_diarization=enable_speaker_diarization,
                    hotwords=hotwords
                )
            
            # 转换为TranscriptSegment格式
            transcript_segments = audio_processor.convert_to_transcript_segments(
                result['sentences'],
                video_id=f"uploaded_{file.filename}"
            )
            
            # 获取说话人统计信息
            speaker_stats = audio_processor.get_speaker_statistics(result['sentences'])
            
            # 生成视频ID并保存数据
            video_id = data_store.generate_video_id()
            video_data = {
                "id": video_id,
                "filename": file.filename,
                "file_size": file.size,
                "language": language,
                "enable_speaker_diarization": enable_speaker_diarization,
                "hotwords": hotwords,
                "transcripts": [segment.to_dict() for segment in transcript_segments],
                "speaker_statistics": speaker_stats,
                "raw_result": {
                    "text": result['text'],
                    "srt": result['srt'],
                    "sentences": result['sentences']
                }
            }
            
            # 保存到数据存储
            data_store.save_video_data(video_id, video_data)
            
            logger.info(f"台词提取完成，共提取 {len(transcript_segments)} 个片段")
            
            return JSONResponse({
                "success": True,
                "video_id": video_id,
                "filename": file.filename,
                "total_segments": len(transcript_segments),
                "total_duration": max([seg.end_time for seg in transcript_segments]) if transcript_segments else 0,
                "language": language,
                "speaker_count": speaker_stats['total_speakers'],
                "transcripts": [segment.to_dict() for segment in transcript_segments],
                "speaker_statistics": speaker_stats,
                "full_text": result['text'],
                "srt_content": result['srt']
            })
            
        finally:
            # 清理临时文件
            try:
                os.unlink(temp_file_path)
            except:
                pass
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"台词提取失败: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"台词提取失败: {str(e)}"
        )

@router.get("/video/{video_id}/dialogues")
async def get_video_dialogues(
    video_id: str,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """
    获取指定视频的台词信息
    
    Args:
        video_id: 视频ID
        
    Returns:
        台词信息JSON
    """
    try:
        video_data = data_store.get_video_data(video_id)
        if not video_data:
            raise HTTPException(
                status_code=404,
                detail=f"未找到视频ID: {video_id}"
            )
        
        return JSONResponse({
            "success": True,
            "video_id": video_id,
            "filename": video_data.get("filename"),
            "transcripts": video_data.get("transcripts", []),
            "speaker_statistics": video_data.get("speaker_statistics", {}),
            "full_text": video_data.get("raw_result", {}).get("text", ""),
            "srt_content": video_data.get("raw_result", {}).get("srt", "")
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取台词信息失败: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"获取台词信息失败: {str(e)}"
        )

@router.post("/video/{video_id}/export-dialogues")
async def export_video_dialogues(
    video_id: str,
    format: str = Form("json"),  # json, srt, txt
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """
    导出视频台词到不同格式
    
    Args:
        video_id: 视频ID
        format: 导出格式 (json/srt/txt)
        
    Returns:
        导出的台词内容
    """
    try:
        video_data = data_store.get_video_data(video_id)
        if not video_data:
            raise HTTPException(
                status_code=404,
                detail=f"未找到视频ID: {video_id}"
            )
        
        if format == "srt":
            content = video_data.get("raw_result", {}).get("srt", "")
            media_type = "text/plain"
            filename = f"{video_data.get('filename', 'dialogue')}.srt"
        elif format == "txt":
            content = video_data.get("raw_result", {}).get("text", "")
            media_type = "text/plain"
            filename = f"{video_data.get('filename', 'dialogue')}.txt"
        else:  # json
            content = {
                "video_id": video_id,
                "filename": video_data.get("filename"),
                "transcripts": video_data.get("transcripts", []),
                "speaker_statistics": video_data.get("speaker_statistics", {}),
            }
            media_type = "application/json"
            filename = f"{video_data.get('filename', 'dialogue')}.json"
        
        return JSONResponse({
            "success": True,
            "format": format,
            "filename": filename,
            "content": content
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"导出台词失败: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"导出台词失败: {str(e)}"
        )

@router.get("/supported-formats")
async def get_supported_formats():
    """
    获取支持的文件格式
    
    Returns:
        支持的格式列表
    """
    return JSONResponse({
        "success": True,
        "supported_video_formats": list(SUPPORTED_VIDEO_FORMATS),
        "supported_audio_formats": list(SUPPORTED_AUDIO_FORMATS),
        "max_file_size_mb": 200,
        "supported_languages": ["zh", "en"],
        "features": {
            "speaker_diarization": True,
            "hotwords": True,
            "emotion_analysis": False  # 与用户要求一致
        }
    })

# 辅助函数
def convert_transcripts_to_stage_dialogues(transcripts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    将转录片段转换为舞台编辑器可用的台词格式
    
    Args:
        transcripts: 转录片段列表
        
    Returns:
        舞台台词格式列表
    """
    stage_dialogues = []
    
    for i, transcript in enumerate(transcripts):
        # 基础映射
        dialogue = {
            "id": f"dialogue_{i+1}",
            "actorId": 1,  # 默认演员ID，用户可后续调整
            "content": transcript.get("text", ""),
            "startTime": transcript.get("start_time", 0),
            "duration": transcript.get("end_time", 5) - transcript.get("start_time", 0),
            "emotion": None,  # 不进行情感分析
            "volume": 80,  # 默认音量
        }
        
        # 如果有说话人信息，尝试映射到不同演员
        if transcript.get("speaker_id"):
            speaker_id = transcript["speaker_id"]
            # 简单映射：spk_0->演员1, spk_1->演员2, spk_2->演员3
            if speaker_id == "spk_0":
                dialogue["actorId"] = 1
            elif speaker_id == "spk_1":
                dialogue["actorId"] = 2
            elif speaker_id == "spk_2":
                dialogue["actorId"] = 3
            else:
                # 其他说话人映射到演员1
                dialogue["actorId"] = 1
        
        stage_dialogues.append(dialogue)
    
    return stage_dialogues

@router.post("/video/{video_id}/convert-to-stage")
async def convert_video_to_stage_format(
    video_id: str,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """
    将视频台词转换为舞台编辑器格式
    
    Args:
        video_id: 视频ID
        
    Returns:
        舞台编辑器格式的台词数据
    """
    try:
        video_data = data_store.get_video_data(video_id)
        if not video_data:
            raise HTTPException(
                status_code=404,
                detail=f"未找到视频ID: {video_id}"
            )
        
        transcripts = video_data.get("transcripts", [])
        stage_dialogues = convert_transcripts_to_stage_dialogues(transcripts)
        
        return JSONResponse({
            "success": True,
            "video_id": video_id,
            "total_dialogues": len(stage_dialogues),
            "dialogues": stage_dialogues,
            "speaker_mapping": {
                "spk_0": "演员1 (主角)",
                "spk_1": "演员2 (配角A)", 
                "spk_2": "演员3 (配角B)"
            },
            "note": "可在舞台编辑器中进一步调整演员分配和台词内容"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"转换台词格式失败: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"转换台词格式失败: {str(e)}"
        ) 