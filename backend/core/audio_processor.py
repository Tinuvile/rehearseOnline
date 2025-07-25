"""
音频处理核心模块 - 基于FunClip
"""

import os
import re
import logging
import numpy as np
import librosa
import moviepy.editor as mpy
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path

from models.data_models import TranscriptSegment
from .asr_config import asr_config

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FunClip工具函数 - 直接移植
def convert_pcm_to_float(data):
    """PCM数据转换为浮点"""
    if data.dtype == np.float64:
        return data
    elif data.dtype == np.float32:
        return data.astype(np.float64)
    elif data.dtype == np.int16:
        bit_depth = 16
    elif data.dtype == np.int32:
        bit_depth = 32
    elif data.dtype == np.int8:
        bit_depth = 8
    else:
        raise ValueError("Unsupported audio data type")

    # Now handle the integer types
    max_int_value = float(2 ** (bit_depth - 1))
    if bit_depth == 8:
        data = data - 128
    return (data.astype(np.float64) / max_int_value)

def time_convert(ms):
    """时间转换函数"""
    ms = int(ms)
    tail = ms % 1000
    s = ms // 1000
    mi = s // 60
    s = s % 60
    h = mi // 60
    mi = mi % 60
    h = "00" if h == 0 else str(h)
    mi = "00" if mi == 0 else str(mi)
    s = "00" if s == 0 else str(s)
    tail = str(tail).zfill(3)
    if len(h) == 1: h = '0' + h
    if len(mi) == 1: mi = '0' + mi
    if len(s) == 1: s = '0' + s
    return "{}:{}:{},{}".format(h, mi, s, tail)

def str2list(text):
    """文本分词"""
    pattern = re.compile(r'[\u4e00-\u9fff]|[\w-]+', re.UNICODE)
    elements = pattern.findall(text)
    return elements

class Text2SRT:
    """文本转SRT字幕"""
    def __init__(self, text, timestamp, offset=0):
        self.token_list = text
        self.timestamp = timestamp
        start, end = timestamp[0][0] - offset, timestamp[-1][1] - offset
        self.start_sec, self.end_sec = start, end
        self.start_time = time_convert(start)
        self.end_time = time_convert(end)
    
    def text(self):
        if isinstance(self.token_list, str):
            return self.token_list.rstrip("、。，")
        else:
            res = ""
            for word in self.token_list:
                if '\u4e00' <= word <= '\u9fff':
                    res += word
                else:
                    res += " " + word
            return res.lstrip().rstrip("、。，")
    
    def srt(self, acc_ost=0.0):
        return "{} --> {}\n{}\n".format(
            time_convert(self.start_sec+acc_ost*1000),
            time_convert(self.end_sec+acc_ost*1000), 
            self.text())
    
    def time(self, acc_ost=0.0):
        return (self.start_sec/1000+acc_ost, self.end_sec/1000+acc_ost)

def generate_srt(sentence_list):
    """生成SRT字幕"""
    srt_total = ''
    for i, sent in enumerate(sentence_list):
        t2s = Text2SRT(sent['text'], sent['timestamp'])
        if 'spk' in sent:
            srt_total += "{}  spk{}\n{}".format(i + 1, sent['spk'], t2s.srt())
        else:
            srt_total += "{}\n{}\n".format(i + 1, t2s.srt())
    return srt_total

class AudioProcessor:
    """音频处理器 - 基于FunClip核心功能"""
    
    def __init__(self):
        self.temp_dir = Path("temp")
        self.temp_dir.mkdir(exist_ok=True)
        self.funasr_model = None
        self.language = "zh"
    
    def _init_funasr_model(self, language: str = "zh"):
        """初始化FunASR模型"""
        if self.funasr_model is not None and self.language == language:
            return  # 已经初始化且语言一致
        
        try:
            from funasr import AutoModel
            
            logger.info(f"初始化FunASR模型（语言: {language}）...")
            
            # 获取模型配置
            model_config = asr_config.get_funasr_models_config(language)
            
            self.funasr_model = AutoModel(
                model=model_config["model"],
                vad_model=model_config["vad_model"],
                punc_model=model_config["punc_model"],
                spk_model=model_config["spk_model"]
            )
            
            self.language = language
            logger.info("✅ FunASR模型初始化成功!")
            
        except ImportError:
            logger.error("❌ FunASR未安装，请运行: pip install funasr")
            raise
        except Exception as e:
            logger.error(f"❌ FunASR模型初始化失败: {e}")
            raise
    
    def extract_audio_from_video(self, video_path: str) -> str:
        """从视频中提取音频"""
        logger.info(f"从视频提取音频: {video_path}")
        
        video_path = Path(video_path)
        if not video_path.exists():
            raise FileNotFoundError(f"视频文件不存在: {video_path}")
        
        try:
            # 使用moviepy提取音频
            video = mpy.VideoFileClip(str(video_path))
            
            if video.audio is None:
                raise Exception("视频中没有音频信息")
            
            # 生成临时音频文件路径
            audio_filename = f"{video_path.stem}_temp_audio.wav"
            audio_path = self.temp_dir / audio_filename
            
            # 提取音频
            video.audio.write_audiofile(str(audio_path), verbose=False, logger=None)
            
            # 清理视频对象
            video.close()
            
            logger.info(f"音频提取成功: {audio_path}")
            return str(audio_path)
            
        except Exception as e:
            logger.error(f"音频提取失败: {e}")
            raise
    
    def recognize_audio_data(self, audio_data: Tuple[int, np.ndarray], language: str = "zh", 
                           enable_speaker_diarization: bool = False, hotwords: str = "") -> Dict[str, Any]:
        """识别音频数据"""
        try:
            # 初始化模型
            self._init_funasr_model(language)
            
            sr, data = audio_data
            
            # 数据预处理
            data = convert_pcm_to_float(data)
            
            if sr != 16000:
                data = librosa.resample(data, orig_sr=sr, target_sr=16000)
            
            if len(data.shape) == 2:
                logger.warning(f"多声道音频，只保留第一个声道")
                data = data[:, 0]
            
            logger.info("开始语音识别...")
            
            # 获取识别参数
            params = asr_config.get_recognition_params(language, enable_speaker_diarization, hotwords)
            
            # 执行识别
            rec_result = self.funasr_model.generate(data, **params)
            
            # 生成结果
            result_text = rec_result[0]['text']
            result_srt = generate_srt(rec_result[0]['sentence_info'])
            
            logger.info("✅ 语音识别完成!")
            
            return {
                'text': result_text,
                'srt': result_srt,
                'sentences': rec_result[0]['sentence_info'],
                'raw_text': rec_result[0]['raw_text'],
                'timestamp': rec_result[0]['timestamp']
            }
            
        except Exception as e:
            logger.error(f"语音识别失败: {e}")
            raise
    
    def recognize_audio_file(self, audio_path: str, language: str = "zh", 
                           enable_speaker_diarization: bool = False, hotwords: str = "") -> Dict[str, Any]:
        """识别音频文件"""
        try:
            logger.info(f"加载音频文件: {audio_path}")
            wav, sr = librosa.load(audio_path, sr=16000)
            return self.recognize_audio_data((sr, wav), language, enable_speaker_diarization, hotwords)
        except Exception as e:
            logger.error(f"音频文件处理失败: {e}")
            raise
    
    def recognize_video_file(self, video_path: str, language: str = "zh", 
                           enable_speaker_diarization: bool = False, hotwords: str = "") -> Dict[str, Any]:
        """识别视频文件"""
        try:
            logger.info(f"处理视频文件: {video_path}")
            
            # 提取音频
            audio_path = self.extract_audio_from_video(video_path)
            
            # 加载音频数据
            wav, sr = librosa.load(audio_path, sr=16000)
            
            # 删除临时音频文件
            try:
                os.remove(audio_path)
            except:
                pass
            
            # 执行音频识别
            return self.recognize_audio_data((sr, wav), language, enable_speaker_diarization, hotwords)
            
        except Exception as e:
            logger.error(f"视频文件处理失败: {e}")
            raise
    
    def convert_to_transcript_segments(self, sentences: List[Dict], video_id: str = None) -> List[TranscriptSegment]:
        """将FunClip的句子信息转换为TranscriptSegment格式"""
        try:
            transcripts = []
            
            for sentence in sentences:
                # 获取时间戳
                if 'timestamp' in sentence and sentence['timestamp']:
                    # timestamp是[[start_ms, end_ms], ...]格式
                    start_time = sentence['timestamp'][0][0] / 1000.0  # 转换为秒
                    end_time = sentence['timestamp'][-1][1] / 1000.0
                else:
                    # 如果没有时间戳，使用估计值
                    start_time = 0.0
                    end_time = 5.0
                
                # 获取文本
                text = sentence.get('text', '').strip()
                if not text:
                    continue
                
                # 获取说话人ID
                speaker_id = None
                if 'spk' in sentence and sentence['spk'] is not None:
                    speaker_id = f"spk_{sentence['spk']}"
                
                # 创建TranscriptSegment
                transcript = TranscriptSegment.create(
                    text=text,
                    start_time=start_time,
                    end_time=end_time,
                    speaker_id=speaker_id,
                    confidence=0.95,  # FunASR通常有较高准确率
                    emotion=None  # 不进行情感分析，与用户要求一致
                )
                
                transcripts.append(transcript)
            
            logger.info(f"转换完成，生成 {len(transcripts)} 个转录片段")
            return transcripts
            
        except Exception as e:
            logger.error(f"转录片段转换失败: {e}")
            return []
    
    def transcribe_audio_with_funasr(self, audio_path: str, language: str = "zh") -> List[TranscriptSegment]:
        """使用FunASR进行音频转文本，返回TranscriptSegment格式"""
        try:
            # 执行识别
            result = self.recognize_audio_file(audio_path, language)
            
            # 转换为TranscriptSegment格式
            return self.convert_to_transcript_segments(result['sentences'])
            
        except Exception as e:
            logger.error(f"FunASR转录失败: {e}")
            raise
    
    def get_speaker_statistics(self, sentences: List[Dict]) -> Dict[str, Any]:
        """获取说话人统计信息"""
        try:
            speaker_stats = {}
            total_duration = 0
            
            for sentence in sentences:
                if 'spk' in sentence and sentence['spk'] is not None:
                    spk_id = f"spk_{sentence['spk']}"
                    
                    # 计算时长
                    if 'timestamp' in sentence and sentence['timestamp']:
                        duration = (sentence['timestamp'][-1][1] - sentence['timestamp'][0][0]) / 1000.0
                    else:
                        duration = 5.0  # 默认估计
                    
                    if spk_id not in speaker_stats:
                        speaker_stats[spk_id] = {
                            'name': spk_id,
                            'total_duration': 0,
                            'sentence_count': 0,
                            'text_segments': []
                        }
                    
                    speaker_stats[spk_id]['total_duration'] += duration
                    speaker_stats[spk_id]['sentence_count'] += 1
                    speaker_stats[spk_id]['text_segments'].append(sentence.get('text', ''))
                    
                    total_duration += duration
            
            # 计算说话比例
            for spk_id in speaker_stats:
                if total_duration > 0:
                    speaker_stats[spk_id]['percentage'] = (speaker_stats[spk_id]['total_duration'] / total_duration) * 100
                else:
                    speaker_stats[spk_id]['percentage'] = 0
            
            return {
                'speakers': speaker_stats,
                'total_speakers': len(speaker_stats),
                'total_duration': total_duration
            }
            
        except Exception as e:
            logger.error(f"说话人统计失败: {e}")
            return {'speakers': {}, 'total_speakers': 0, 'total_duration': 0}
    
    def cleanup_temp_files(self):
        """清理临时文件"""
        try:
            for file_path in self.temp_dir.glob("*_temp_audio.*"):
                file_path.unlink()
                logger.debug(f"删除临时文件: {file_path}")
            
            logger.info("临时文件清理完成")
            
        except Exception as e:
            logger.error(f"临时文件清理失败: {e}")

# 全局音频处理器实例
audio_processor = AudioProcessor()