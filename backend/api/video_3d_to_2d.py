"""
视频3D转2D平面位置处理API
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import shutil
import logging
import json
from pathlib import Path

from backend.models.data_models import dataclass_to_dict
from backend.core.data_store import InMemoryDataStore
from backend.core.alphapose_processor import AlphaPoseProcessor
from backend.core.midas_processor import MiDaSProcessor
from backend.core.coordinate_converter import CoordinateConverter

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# 请求模型
class StageAnnotation(BaseModel):
    """舞台标注信息"""
    corners: List[Dict[str, float]]  # 舞台四个角的坐标
    depth_reference: float  # 参考深度值
    real_width: float  # 实际舞台宽度（米）
    real_height: float  # 实际舞台高度（米）

class Video3DTo2DRequest(BaseModel):
    """3D转2D处理请求"""
    video_id: str
    stage_annotation: StageAnnotation
    tracking_person_id: Optional[str] = None  # 要追踪的特定人员ID

# 响应模型
class PersonPosition(BaseModel):
    """人员位置信息"""
    frame_number: int
    timestamp: float
    person_id: str
    position_3d: Dict[str, float]  # x, y, z坐标
    position_2d: Dict[str, float]  # 转换后的2D平面坐标
    confidence: float

class Video3DTo2DResponse(BaseModel):
    """3D转2D处理响应"""
    video_id: str
    status: str
    positions: List[PersonPosition]
    processing_time: float
    frame_count: int

# 依赖注入
def get_data_store() -> InMemoryDataStore:
    from backend.main import data_store
    return data_store

# 处理器实例
alphapose_processor = AlphaPoseProcessor()
midas_processor = MiDaSProcessor()
coordinate_converter = CoordinateConverter()

@router.post("/process", response_model=Video3DTo2DResponse)
async def process_video_3d_to_2d(
    background_tasks: BackgroundTasks,
    request: Video3DTo2DRequest,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """
    处理视频3D转2D平面位置
    """
    logger.info(f"开始处理视频3D转2D: {request.video_id}")
    
    try:
        # 1. 获取视频信息
        video = data_store.get_video(request.video_id)
        if not video:
            raise HTTPException(status_code=404, detail="视频未找到")
        
        video_path = video.file_path
        if not os.path.exists(video_path):
            raise HTTPException(status_code=404, detail="视频文件不存在")
        
        # 2. 设置输出目录
        output_dir = Path(f"temp/video_3d_to_2d/{request.video_id}")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        frames_dir = output_dir / "frames"
        alphapose_output_dir = output_dir / "alphapose_output"
        midas_output_dir = output_dir / "midas_output"
        
        # 3. 使用AlphaPose处理视频
        logger.info("开始AlphaPose姿势识别...")
        alphapose_results = await alphapose_processor.process_video(
            video_path=video_path,
            output_dir=str(alphapose_output_dir),
            frames_dir=str(frames_dir)
        )
        
        # 4. 使用MiDaS生成深度预测
        logger.info("开始MiDaS深度预测...")
        depth_results = await midas_processor.process_frames(
            frames_dir=str(frames_dir),
            output_dir=str(midas_output_dir)
        )
        
        # 5. 整合数据并转换坐标
        logger.info("开始坐标转换...")
        positions = await coordinate_converter.convert_positions(
            alphapose_results=alphapose_results,
            depth_results=depth_results,
            stage_annotation=request.stage_annotation,
            tracking_person_id=request.tracking_person_id
        )
        
        # 6. 保存结果
        result_data = {
            "video_id": request.video_id,
            "stage_annotation": request.stage_annotation.dict(),
            "positions": [pos.dict() for pos in positions],
            "processing_metadata": {
                "frame_count": len(positions),
                "alphapose_results": alphapose_results,
                "depth_results": depth_results
            }
        }
        
        result_file = output_dir / "result.json"
        with open(result_file, 'w', encoding='utf-8') as f:
            json.dump(result_data, f, ensure_ascii=False, indent=2)
        
        # 7. 更新数据存储
        video.processing_results = video.processing_results or {}
        video.processing_results["3d_to_2d"] = {
            "status": "completed",
            "result_file": str(result_file),
            "positions_count": len(positions)
        }
        data_store.update_video(video)
        
        logger.info(f"视频3D转2D处理完成: {request.video_id}")
        
        return Video3DTo2DResponse(
            video_id=request.video_id,
            status="completed",
            positions=positions,
            processing_time=0.0,  # TODO: 实际计算处理时间
            frame_count=len(positions)
        )
        
    except Exception as e:
        logger.error(f"处理视频3D转2D时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"处理失败: {str(e)}")

@router.get("/status/{video_id}")
async def get_processing_status(
    video_id: str,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """获取处理状态"""
    video = data_store.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频未找到")
    
    processing_results = video.processing_results or {}
    status = processing_results.get("3d_to_2d", {"status": "not_started"})
    
    return {
        "video_id": video_id,
        "status": status.get("status", "not_started"),
        "positions_count": status.get("positions_count", 0)
    }

@router.get("/results/{video_id}")
async def get_processing_results(
    video_id: str,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """获取处理结果"""
    video = data_store.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频未找到")
    
    processing_results = video.processing_results or {}
    result_info = processing_results.get("3d_to_2d")
    
    if not result_info or result_info.get("status") != "completed":
        raise HTTPException(status_code=404, detail="处理结果未找到或处理未完成")
    
    result_file = result_info.get("result_file")
    if not result_file or not os.path.exists(result_file):
        raise HTTPException(status_code=404, detail="结果文件不存在")
    
    try:
        with open(result_file, 'r', encoding='utf-8') as f:
            results = json.load(f)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"读取结果文件失败: {str(e)}") 