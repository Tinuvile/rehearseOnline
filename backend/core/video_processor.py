"""
视频处理核心模块
"""

import os
import cv2
import logging
from typing import Dict, Any, Optional, Tuple, List
from pathlib import Path
import mimetypes

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoProcessor:
    """视频处理器"""
    
    # 支持的视频格式
    SUPPORTED_FORMATS = {
        '.mp4': 'video/mp4',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
        '.mkv': 'video/x-matroska',
        '.wmv': 'video/x-ms-wmv',
        '.flv': 'video/x-flv',
        '.webm': 'video/webm'
    }
    
    # 最大文件大小 (500MB)
    MAX_FILE_SIZE = 500 * 1024 * 1024
    
    def __init__(self):
        self.temp_dir = Path("temp")
        self.temp_dir.mkdir(exist_ok=True)
    
    def validate_video_file(self, file_path: str, file_size: int = None) -> Dict[str, Any]:
        """验证视频文件"""
        result = {
            "valid": False,
            "errors": [],
            "warnings": []
        }
        
        file_path = Path(file_path)
        
        # 检查文件是否存在
        if not file_path.exists():
            result["errors"].append("文件不存在")
            return result
        
        # 检查文件扩展名
        file_ext = file_path.suffix.lower()
        if file_ext not in self.SUPPORTED_FORMATS:
            result["errors"].append(f"不支持的文件格式: {file_ext}")
            result["warnings"].append(f"支持的格式: {', '.join(self.SUPPORTED_FORMATS.keys())}")
            return result
        
        # 检查文件大小
        actual_size = file_path.stat().st_size
        if file_size and abs(actual_size - file_size) > 1024:  # 允许1KB误差
            result["warnings"].append("文件大小与预期不符")
        
        if actual_size > self.MAX_FILE_SIZE:
            result["errors"].append(f"文件过大: {actual_size / (1024*1024):.1f}MB (最大: {self.MAX_FILE_SIZE / (1024*1024):.1f}MB)")
            return result
        
        # 检查MIME类型
        mime_type, _ = mimetypes.guess_type(str(file_path))
        expected_mime = self.SUPPORTED_FORMATS.get(file_ext)
        if mime_type and mime_type != expected_mime:
            result["warnings"].append(f"MIME类型不匹配: {mime_type} vs {expected_mime}")
        
        result["valid"] = True
        return result
    
    def extract_video_info(self, file_path: str) -> Dict[str, Any]:
        """提取视频基础信息"""
        logger.info(f"提取视频信息: {file_path}")
        
        try:
            # 使用OpenCV读取视频
            cap = cv2.VideoCapture(file_path)
            
            if not cap.isOpened():
                raise Exception("无法打开视频文件")
            
            # 获取视频属性
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            # 计算时长
            duration = frame_count / fps if fps > 0 else 0
            
            # 获取编码信息
            fourcc = int(cap.get(cv2.CAP_PROP_FOURCC))
            codec = "".join([chr((fourcc >> 8 * i) & 0xFF) for i in range(4)])
            
            # 获取文件大小
            file_size = Path(file_path).stat().st_size
            
            cap.release()
            
            info = {
                "duration": round(duration, 2),
                "fps": round(fps, 2),
                "frame_count": frame_count,
                "resolution": f"{width}x{height}",
                "width": width,
                "height": height,
                "codec": codec.strip(),
                "file_size": file_size,
                "file_size_mb": round(file_size / (1024 * 1024), 2)
            }
            
            logger.info(f"视频信息提取成功: {info}")
            return info
            
        except Exception as e:
            logger.error(f"视频信息提取失败: {e}")
            raise Exception(f"视频信息提取失败: {str(e)}")
    
    def validate_video_content(self, file_path: str) -> Dict[str, Any]:
        """验证视频内容完整性"""
        logger.info(f"验证视频内容: {file_path}")
        
        result = {
            "valid": False,
            "readable_frames": 0,
            "total_frames": 0,
            "corruption_detected": False,
            "errors": []
        }
        
        try:
            cap = cv2.VideoCapture(file_path)
            
            if not cap.isOpened():
                result["errors"].append("无法打开视频文件")
                return result
            
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            result["total_frames"] = total_frames
            
            # 采样检查帧（每10帧检查一次，最多检查100帧）
            check_interval = max(1, total_frames // 100)
            readable_frames = 0
            
            for i in range(0, total_frames, check_interval):
                cap.set(cv2.CAP_PROP_POS_FRAMES, i)
                ret, frame = cap.read()
                
                if ret and frame is not None:
                    readable_frames += 1
                else:
                    logger.warning(f"帧 {i} 读取失败")
            
            cap.release()
            
            result["readable_frames"] = readable_frames
            checked_frames = min(100, total_frames // check_interval)
            
            # 如果超过10%的帧无法读取，认为视频可能损坏
            if readable_frames < checked_frames * 0.9:
                result["corruption_detected"] = True
                result["errors"].append("检测到视频文件可能损坏")
            else:
                result["valid"] = True
            
            logger.info(f"视频内容验证完成: 可读帧 {readable_frames}/{checked_frames}")
            return result
            
        except Exception as e:
            logger.error(f"视频内容验证失败: {e}")
            result["errors"].append(f"验证过程出错: {str(e)}")
            return result
    
    def extract_thumbnail(self, file_path: str, timestamp: float = 1.0) -> Optional[str]:
        """提取视频缩略图"""
        logger.info(f"提取缩略图: {file_path} at {timestamp}s")
        
        try:
            cap = cv2.VideoCapture(file_path)
            
            if not cap.isOpened():
                raise Exception("无法打开视频文件")
            
            # 设置到指定时间戳
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_number = int(timestamp * fps)
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
            
            ret, frame = cap.read()
            cap.release()
            
            if not ret or frame is None:
                raise Exception("无法读取指定时间戳的帧")
            
            # 保存缩略图
            file_stem = Path(file_path).stem
            thumbnail_path = self.temp_dir / f"{file_stem}_thumbnail.jpg"
            
            # 调整大小（最大宽度320px）
            height, width = frame.shape[:2]
            if width > 320:
                scale = 320 / width
                new_width = 320
                new_height = int(height * scale)
                frame = cv2.resize(frame, (new_width, new_height))
            
            success = cv2.imwrite(str(thumbnail_path), frame)
            
            if success:
                logger.info(f"缩略图保存成功: {thumbnail_path}")
                return str(thumbnail_path)
            else:
                raise Exception("缩略图保存失败")
                
        except Exception as e:
            logger.error(f"缩略图提取失败: {e}")
            return None
    
    def get_video_frames_sample(self, file_path: str, sample_count: int = 10) -> List[Tuple[float, str]]:
        """获取视频帧样本（用于后续分析）"""
        logger.info(f"获取视频帧样本: {file_path}, 样本数: {sample_count}")
        
        samples = []
        
        try:
            cap = cv2.VideoCapture(file_path)
            
            if not cap.isOpened():
                raise Exception("无法打开视频文件")
            
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            duration = total_frames / fps
            
            # 计算采样间隔
            interval = max(1, total_frames // sample_count)
            
            file_stem = Path(file_path).stem
            
            for i in range(0, total_frames, interval):
                if len(samples) >= sample_count:
                    break
                
                cap.set(cv2.CAP_PROP_POS_FRAMES, i)
                ret, frame = cap.read()
                
                if ret and frame is not None:
                    timestamp = i / fps
                    frame_path = self.temp_dir / f"{file_stem}_frame_{i:06d}.jpg"
                    
                    if cv2.imwrite(str(frame_path), frame):
                        samples.append((timestamp, str(frame_path)))
            
            cap.release()
            
            logger.info(f"帧样本提取完成: {len(samples)} 帧")
            return samples
            
        except Exception as e:
            logger.error(f"帧样本提取失败: {e}")
            return []
    
    def cleanup_temp_files(self, pattern: str = None):
        """清理临时文件"""
        try:
            if pattern:
                # 清理特定模式的文件
                for file_path in self.temp_dir.glob(pattern):
                    file_path.unlink()
                    logger.debug(f"删除临时文件: {file_path}")
            else:
                # 清理所有临时文件
                for file_path in self.temp_dir.iterdir():
                    if file_path.is_file():
                        file_path.unlink()
                        logger.debug(f"删除临时文件: {file_path}")
                        
            logger.info("临时文件清理完成")
            
        except Exception as e:
            logger.error(f"临时文件清理失败: {e}")

# 全局视频处理器实例
video_processor = VideoProcessor()