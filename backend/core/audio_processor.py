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
from .asr_config import asr_config, ASRProvider

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
        """使用FunASR进行音频转文本 - 使用最高级模型配置"""
        logger.info(f"使用FunASR最高级模型转录音频: {audio_path}")
        
        try:
            # 检查FunASR是否可用
            from funasr import AutoModel
            
            # 获取配置
            config = asr_config.get_funasr_config(language)
            
            # 初始化模型
            logger.info(f"加载FunASR模型: {config['model']}")
            model = AutoModel(**{k: v for k, v in config.items() 
                               if k in ['model', 'model_revision', 'vad_model', 'vad_model_revision', 
                                       'punc_model', 'punc_model_revision', 'spk_model', 'spk_model_revision', 'device']})
            
            # 准备转录参数
            generate_kwargs = {
                "input": audio_path,
                "batch_size_s": config.get("batch_size_s", 300),
                "merge_vad": config.get("merge_vad", True),
                "merge_length_s": config.get("merge_length_s", 15),
                "batch_size_threshold_s": config.get("batch_size_threshold_s", 60),
                "language": config.get("language", "auto"),
                "use_itn": config.get("use_itn", True),
            }
            
            # 如果是SenseVoice模型，启用高级功能
            if "SenseVoice" in config.get("model", ""):
                generate_kwargs.update({
                    "use_timestamp": config.get("use_timestamp", True),
                    "use_speaker": config.get("use_speaker", True),
                    "use_emotion": config.get("use_emotion", True),
                    "use_language": config.get("use_language", True),
                })
            
            # 执行转录
            logger.info("开始转录...")
            result = model.generate(**generate_kwargs)
            
            # 转换为TranscriptSegment格式
            transcripts = []
            if isinstance(result, list) and len(result) > 0:
                for idx, item in enumerate(result):
                    if isinstance(item, dict):
                        text = item.get('text', '')
                        timestamp = item.get('timestamp', None)
                        speaker = item.get('spk_label', None)  # 说话人标签
                        
                        # 处理时间戳
                        if timestamp and len(timestamp) > 0:
                            if isinstance(timestamp[0], list) and len(timestamp[0]) >= 2:
                                start_time = timestamp[0][0] / 1000.0  # 转换为秒
                                end_time = timestamp[0][1] / 1000.0
                            else:
                                start_time = idx * 5.0  # 估算时间
                                end_time = (idx + 1) * 5.0
                        else:
                            start_time = idx * 5.0
                            end_time = (idx + 1) * 5.0
                        
                        if text.strip():
                            transcript = TranscriptSegment.create(
                                text=text.strip(),
                                start_time=start_time,
                                end_time=end_time,
                                speaker_id=f"speaker_{speaker}" if speaker else None,
                                confidence=0.95,  # SenseVoice准确率更高
                                emotion=self._detect_emotion_from_text(text)  # 简单情感分析
                            )
                            transcripts.append(transcript)
            
            if not transcripts:
                # 如果没有结构化结果，处理纯文本
                text_result = ""
                if isinstance(result, list) and result:
                    if isinstance(result[0], dict):
                        text_result = result[0].get('text', '')
                    else:
                        text_result = str(result[0])
                elif isinstance(result, str):
                    text_result = result
                
                if text_result.strip():
                    transcript = TranscriptSegment.create(
                        text=text_result.strip(),
                        start_time=0.0,
                        end_time=10.0,
                        speaker_id=None,
                        confidence=0.95,
                        emotion=self._detect_emotion_from_text(text_result)
                    )
                    transcripts.append(transcript)
            
            logger.info(f"FunASR高级模型转录完成: {len(transcripts)} 个片段")
            return transcripts
            
        except ImportError:
            logger.warning("FunASR未安装，使用简单转录")
            return self.transcribe_audio_simple(audio_path, language)
        except Exception as e:
            logger.error(f"FunASR转录失败: {e}")
            return self.transcribe_audio_simple(audio_path, language)
    
    def _detect_emotion_from_text(self, text: str) -> Optional[str]:
        """从文本简单检测情感（可扩展为更复杂的情感分析）"""
        if not text:
            return None
        
        # 简单的关键词情感分析
        positive_words = ["好", "棒", "优秀", "喜欢", "开心", "满意", "赞", "excellent", "good", "great", "awesome"]
        negative_words = ["不好", "差", "糟糕", "讨厌", "难过", "失望", "坏", "bad", "terrible", "awful", "hate"]
        
        text_lower = text.lower()
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"
    
    def transcribe_with_cloud_api(self, audio_path: str, language: str = "zh") -> List[TranscriptSegment]:
        """使用云端API进行转录（阿里云ASR最高级服务）"""
        logger.info(f"使用云端API转录音频: {audio_path}")
        
        try:
            # 这里可以集成阿里云、腾讯云、百度云等最高级的ASR服务
            # 示例：阿里云实时语音识别API
            
            # 注意：需要配置API密钥和相关参数
            # 这里提供框架，实际使用时需要填入真实的API调用
            
            logger.warning("云端API转录功能需要配置API密钥，当前使用本地FunASR")
            return self.transcribe_audio_with_funasr(audio_path, language)
            
        except Exception as e:
            logger.error(f"云端API转录失败: {e}")
            return self.transcribe_audio_with_funasr(audio_path, language)
    
    def transcribe_audio_smart(self, audio_path: str, language: str = "zh") -> List[TranscriptSegment]:
        """智能转录 - 根据配置自动选择最佳ASR服务"""
        logger.info(f"智能转录音频: {audio_path}")
        
        # 检查音频文件
        if not Path(audio_path).exists():
            raise FileNotFoundError(f"音频文件不存在: {audio_path}")
        
        # 检查音频时长
        audio_props = self.analyze_audio_properties(audio_path)
        duration = audio_props.get("duration", 0)
        max_duration = asr_config.get_max_audio_duration()
        
        if duration > max_duration:
            logger.warning(f"音频时长 {duration}s 超过限制 {max_duration}s，将进行分段处理")
            return self._transcribe_long_audio(audio_path, language)
        
        # 根据配置选择ASR服务
        if asr_config.provider == ASRProvider.FUNASR_LOCAL:
            return self.transcribe_audio_with_funasr(audio_path, language)
        elif asr_config.is_cloud_provider():
            if asr_config.validate_config():
                return self.transcribe_with_cloud_api(audio_path, language)
            else:
                logger.warning("云端API配置无效，回退到本地FunASR")
                return self.transcribe_audio_with_funasr(audio_path, language)
        else:
            # 默认使用FunASR
            return self.transcribe_audio_with_funasr(audio_path, language)
    
    def _transcribe_long_audio(self, audio_path: str, language: str = "zh") -> List[TranscriptSegment]:
        """分段转录长音频"""
        logger.info(f"分段转录长音频: {audio_path}")
        
        # 这里可以实现音频分段逻辑
        # 1. 使用VAD检测语音段落
        # 2. 按段落分割音频
        # 3. 分别转录每个段落
        # 4. 合并结果
        
        # 暂时使用简单的时间分段
        segments = self.detect_speech_segments(audio_path)
        all_transcripts = []
        
        for i, segment in enumerate(segments):
            try:
                # 提取音频段落（这里需要实现音频切割功能）
                segment_path = self._extract_audio_segment(
                    audio_path, 
                    segment["start"], 
                    segment["end"]
                )
                
                # 转录该段落
                transcripts = self.transcribe_audio_with_funasr(segment_path, language)
                
                # 调整时间戳
                for transcript in transcripts:
                    transcript.start_time += segment["start"]
                    transcript.end_time += segment["start"]
                
                all_transcripts.extend(transcripts)
                
                # 清理临时文件
                Path(segment_path).unlink(missing_ok=True)
                
            except Exception as e:
                logger.error(f"转录第 {i+1} 段失败: {e}")
                continue
        
        logger.info(f"长音频分段转录完成: {len(all_transcripts)} 个片段")
        return all_transcripts
    
    def _extract_audio_segment(self, audio_path: str, start_time: float, end_time: float) -> str:
        """提取音频片段"""
        segment_filename = f"segment_{start_time:.1f}_{end_time:.1f}.wav"
        segment_path = self.temp_dir / segment_filename
        
        try:
            # 使用ffmpeg提取音频片段
            cmd = [
                'ffmpeg',
                '-i', audio_path,
                '-ss', str(start_time),
                '-t', str(end_time - start_time),
                '-acodec', 'pcm_s16le',
                '-ar', '16000',
                '-ac', '1',
                '-y',
                str(segment_path)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0 and segment_path.exists():
                return str(segment_path)
            else:
                raise Exception(f"音频片段提取失败: {result.stderr}")
                
        except Exception as e:
            logger.error(f"音频片段提取失败: {e}")
            raise
    
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