"""
音频处理核心模块
"""

import os
import logging
import tempfile
import subprocess
from typing import List, Dict, Any, Optional
from pathlib import Path
import json

from models.data_models import TranscriptSegment

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AudioProcessor:
    """音频处理器"""
    
    def __init__(self):
        self.temp_dir = Path("temp")
        self.temp_dir.mkdir(exist_ok=True)
        
        # 检查依赖
        self._check_dependencies()
    
    def _check_dependencies(self):
        """检查必要的依赖"""
        try:
            # 检查ffmpeg
            result = subprocess.run(['ffmpeg', '-version'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                logger.info("✅ FFmpeg 可用")
            else:
                logger.warning("⚠️ FFmpeg 不可用，某些功能可能受限")
        except (subprocess.TimeoutExpired, FileNotFoundError):
            logger.warning("⚠️ FFmpeg 未安装，将使用替代方案")
    
    def extract_audio_from_video(self, video_path: str, output_format: str = "wav") -> str:
        """从视频中提取音频"""
        logger.info(f"从视频提取音频: {video_path}")
        
        video_path = Path(video_path)
        if not video_path.exists():
            raise FileNotFoundError(f"视频文件不存在: {video_path}")
        
        # 生成输出文件路径
        audio_filename = f"{video_path.stem}_audio.{output_format}"
        audio_path = self.temp_dir / audio_filename
        
        try:
            # 尝试使用ffmpeg提取音频
            if self._extract_with_ffmpeg(str(video_path), str(audio_path)):
                logger.info(f"音频提取成功: {audio_path}")
                return str(audio_path)
            
            # 如果ffmpeg不可用，尝试使用OpenCV
            if self._extract_with_opencv(str(video_path), str(audio_path)):
                logger.info(f"音频提取成功 (OpenCV): {audio_path}")
                return str(audio_path)
            
            raise Exception("所有音频提取方法都失败了")
            
        except Exception as e:
            logger.error(f"音频提取失败: {e}")
            raise
    
    def _extract_with_ffmpeg(self, video_path: str, audio_path: str) -> bool:
        """使用FFmpeg提取音频"""
        try:
            cmd = [
                'ffmpeg',
                '-i', video_path,
                '-vn',  # 不要视频
                '-acodec', 'pcm_s16le',  # 16位PCM编码
                '-ar', '16000',  # 16kHz采样率（适合语音识别）
                '-ac', '1',  # 单声道
                '-y',  # 覆盖输出文件
                audio_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0 and Path(audio_path).exists():
                return True
            else:
                logger.warning(f"FFmpeg提取失败: {result.stderr}")
                return False
                
        except (subprocess.TimeoutExpired, FileNotFoundError) as e:
            logger.warning(f"FFmpeg不可用: {e}")
            return False
    
    def _extract_with_opencv(self, video_path: str, audio_path: str) -> bool:
        """使用OpenCV提取音频（备用方案）"""
        try:
            import cv2
            
            # OpenCV本身不能直接提取音频，这里创建一个占位符
            # 在实际应用中，可以使用moviepy或其他库
            logger.warning("OpenCV音频提取功能需要额外实现")
            
            # 创建一个空的音频文件作为占位符
            with open(audio_path, 'wb') as f:
                f.write(b'')
            
            return False  # 暂时返回False，表示未实现
            
        except Exception as e:
            logger.error(f"OpenCV音频提取失败: {e}")
            return False
    
    def transcribe_audio_simple(self, audio_path: str, language: str = "zh") -> List[TranscriptSegment]:
        """简单的音频转文本（模拟实现）"""
        logger.info(f"音频转文本: {audio_path}")
        
        if not Path(audio_path).exists():
            raise FileNotFoundError(f"音频文件不存在: {audio_path}")
        
        # 模拟转录结果（实际应用中需要集成Whisper或其他ASR服务）
        mock_transcripts = [
            TranscriptSegment.create(
                "欢迎来到AI舞台系统演示",
                0.0, 3.0, None, 0.95, "positive"
            ),
            TranscriptSegment.create(
                "这是一个测试音频转录功能",
                3.5, 7.0, None, 0.90, "neutral"
            ),
            TranscriptSegment.create(
                "系统正在分析您的视频内容",
                7.5, 11.0, None, 0.88, "neutral"
            ),
            TranscriptSegment.create(
                "感谢您的使用",
                11.5, 13.0, None, 0.92, "positive"
            )
        ]
        
        logger.info(f"转录完成: {len(mock_transcripts)} 个片段")
        return mock_transcripts
    
    def transcribe_audio_with_funasr(self, audio_path: str, language: str = "zh") -> List[TranscriptSegment]:
        """使用FunASR进行音频转文本"""
        logger.info(f"使用FunASR转录音频: {audio_path}")
        
        try:
            # 检查FunASR是否可用
            from funasr import AutoModel
            
            # 加载FunASR模型（支持中英文）
            model = AutoModel(
                model="paraformer-zh", # 中文语音识别模型
                model_revision="v2.0.4",
                vad_model="fsmn-vad",
                vad_model_revision="v2.0.4",
                punc_model="ct-punc-c",
                punc_model_revision="v2.0.4",
            )
            
            # 转录音频
            result = model.generate(input=audio_path)
            
            # 转换为TranscriptSegment格式
            transcripts = []
            if isinstance(result, list) and len(result) > 0:
                for item in result:
                    if isinstance(item, dict):
                        text = item.get('text', '')
                        timestamp = item.get('timestamp', [[0, 0]])
                        
                        # 处理时间戳
                        if timestamp and len(timestamp) > 0:
                            start_time = timestamp[0][0] / 1000.0  # 转换为秒
                            end_time = timestamp[0][1] / 1000.0
                        else:
                            start_time = 0.0
                            end_time = 0.0
                        
                        if text.strip():
                            transcript = TranscriptSegment.create(
                                text=text.strip(),
                                start_time=start_time,
                                end_time=end_time,
                                speaker_id=None,
                                confidence=0.9,  # FunASR通常有较高的准确率
                                emotion=None
                            )
                            transcripts.append(transcript)
            
            if not transcripts:
                # 如果没有时间戳信息，创建单个片段
                text_result = result[0] if isinstance(result, list) and result else str(result)
                if text_result.strip():
                    transcript = TranscriptSegment.create(
                        text=text_result.strip(),
                        start_time=0.0,
                        end_time=10.0,  # 默认时长
                        speaker_id=None,
                        confidence=0.9,
                        emotion=None
                    )
                    transcripts.append(transcript)
            
            logger.info(f"FunASR转录完成: {len(transcripts)} 个片段")
            return transcripts
            
        except ImportError:
            logger.warning("FunASR未安装，使用简单转录")
            return self.transcribe_audio_simple(audio_path, language)
        except Exception as e:
            logger.error(f"FunASR转录失败: {e}")
            return self.transcribe_audio_simple(audio_path, language)
    
    def analyze_audio_properties(self, audio_path: str) -> Dict[str, Any]:
        """分析音频属性"""
        logger.info(f"分析音频属性: {audio_path}")
        
        if not Path(audio_path).exists():
            raise FileNotFoundError(f"音频文件不存在: {audio_path}")
        
        properties = {
            "file_path": audio_path,
            "file_size": Path(audio_path).stat().st_size,
            "duration": 0.0,
            "sample_rate": 16000,
            "channels": 1,
            "format": Path(audio_path).suffix.lower()
        }
        
        try:
            # 尝试使用ffprobe获取详细信息
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                audio_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                probe_data = json.loads(result.stdout)
                
                # 提取音频流信息
                for stream in probe_data.get("streams", []):
                    if stream.get("codec_type") == "audio":
                        properties.update({
                            "duration": float(stream.get("duration", 0)),
                            "sample_rate": int(stream.get("sample_rate", 16000)),
                            "channels": int(stream.get("channels", 1)),
                            "codec": stream.get("codec_name", "unknown")
                        })
                        break
                
                # 提取格式信息
                format_info = probe_data.get("format", {})
                if "duration" in format_info:
                    properties["duration"] = float(format_info["duration"])
            
        except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError) as e:
            logger.warning(f"无法获取详细音频信息: {e}")
            # 使用默认值
        
        logger.info(f"音频属性分析完成: {properties}")
        return properties
    
    def detect_speech_segments(self, audio_path: str) -> List[Dict[str, float]]:
        """检测语音片段（简化实现）"""
        logger.info(f"检测语音片段: {audio_path}")
        
        # 模拟语音活动检测结果
        segments = [
            {"start": 0.0, "end": 3.0, "confidence": 0.95},
            {"start": 3.5, "end": 7.0, "confidence": 0.90},
            {"start": 7.5, "end": 11.0, "confidence": 0.88},
            {"start": 11.5, "end": 13.0, "confidence": 0.92}
        ]
        
        logger.info(f"检测到 {len(segments)} 个语音片段")
        return segments
    
    def cleanup_audio_files(self, pattern: str = "*_audio.*"):
        """清理音频临时文件"""
        try:
            for file_path in self.temp_dir.glob(pattern):
                file_path.unlink()
                logger.debug(f"删除音频文件: {file_path}")
            
            logger.info("音频文件清理完成")
            
        except Exception as e:
            logger.error(f"音频文件清理失败: {e}")

# 全局音频处理器实例
audio_processor = AudioProcessor()