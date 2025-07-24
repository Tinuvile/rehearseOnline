"""
ASR (自动语音识别) 配置管理
支持本地FunASR和云端API服务的配置
"""

import os
from typing import Dict, Any, Optional
from enum import Enum

class ASRProvider(Enum):
    """ASR服务提供商"""
    FUNASR_LOCAL = "funasr_local"      # 本地FunASR
    FUNASR_CLOUD = "funasr_cloud"      # FunASR云端服务
    ALIBABA_CLOUD = "alibaba_cloud"    # 阿里云语音服务
    TENCENT_CLOUD = "tencent_cloud"    # 腾讯云语音服务
    BAIDU_CLOUD = "baidu_cloud"        # 百度云语音服务
    OPENAI_WHISPER = "openai_whisper"  # OpenAI Whisper API

class ASRConfig:
    """ASR配置管理器"""
    
    def __init__(self):
        self.provider = ASRProvider.FUNASR_LOCAL
        self.load_from_env()
    
    def load_from_env(self):
        """从环境变量加载配置"""
        provider_name = os.getenv("ASR_PROVIDER", "funasr_local")
        try:
            self.provider = ASRProvider(provider_name)
        except ValueError:
            self.provider = ASRProvider.FUNASR_LOCAL
    
    def get_funasr_config(self, language: str = "zh") -> Dict[str, Any]:
        """获取FunASR配置"""
        if language == "en":
            return {
                "model": "paraformer-en",
                "model_revision": "v2.0.4",
                "vad_model": "fsmn-vad",
                "vad_model_revision": "v2.0.4",
                "punc_model": "ct-punc-en", 
                "punc_model_revision": "v2.0.4",
                "spk_model": "cam++",
                "spk_model_revision": "v2.0.2",
                "device": "auto",
                "batch_size_s": 300,
                "merge_vad": True,
                "merge_length_s": 15,
                "use_itn": True
            }
        else:
            # 使用最新的SenseVoice模型，支持多语言和情感识别
            return {
                "model": "iic/SenseVoiceSmall",  # 最新的多模态语音模型
                "vad_model": "fsmn-vad",
                "vad_model_revision": "v2.0.4",
                "punc_model": "ct-punc-c",
                "punc_model_revision": "v2.0.4", 
                "spk_model": "cam++",
                "spk_model_revision": "v2.0.2",
                "device": "auto",
                "batch_size_s": 300,
                "merge_vad": True,
                "merge_length_s": 15,
                "use_itn": True,
                "language": "auto",  # 自动检测语言
                # SenseVoice特有配置
                "use_timestamp": True,
                "use_speaker": True, 
                "use_emotion": True,  # 启用情感识别
                "use_language": True  # 启用语言识别
            }
    
    def get_cloud_config(self) -> Dict[str, Any]:
        """获取云端服务配置"""
        configs = {
            ASRProvider.ALIBABA_CLOUD: {
                "access_key_id": os.getenv("ALIBABA_ACCESS_KEY_ID"),
                "access_key_secret": os.getenv("ALIBABA_ACCESS_KEY_SECRET"),
                "region": os.getenv("ALIBABA_REGION", "cn-shanghai"),
                "endpoint": "https://nls-meta.cn-shanghai.aliyuncs.com",
                "app_key": os.getenv("ALIBABA_ASR_APP_KEY"),
                "features": {
                    "real_time": True,
                    "speaker_diarization": True,
                    "emotion_recognition": True,
                    "language_detection": True
                }
            },
            ASRProvider.TENCENT_CLOUD: {
                "secret_id": os.getenv("TENCENT_SECRET_ID"),
                "secret_key": os.getenv("TENCENT_SECRET_KEY"),
                "region": os.getenv("TENCENT_REGION", "ap-shanghai"),
                "endpoint": "asr.tencentcloudapi.com",
                "features": {
                    "real_time": True,
                    "speaker_diarization": True
                }
            },
            ASRProvider.BAIDU_CLOUD: {
                "api_key": os.getenv("BAIDU_API_KEY"),
                "secret_key": os.getenv("BAIDU_SECRET_KEY"),
                "endpoint": "https://vop.baidu.com/server_api",
                "features": {
                    "real_time": True,
                    "punctuation": True
                }
            },
            ASRProvider.OPENAI_WHISPER: {
                "api_key": os.getenv("OPENAI_API_KEY"),
                "model": "whisper-1",
                "endpoint": "https://api.openai.com/v1/audio/transcriptions",
                "features": {
                    "multilingual": True,
                    "translation": True,
                    "timestamps": True
                }
            }
        }
        
        return configs.get(self.provider, {})
    
    def is_cloud_provider(self) -> bool:
        """检查是否为云端服务提供商"""
        return self.provider in [
            ASRProvider.ALIBABA_CLOUD,
            ASRProvider.TENCENT_CLOUD, 
            ASRProvider.BAIDU_CLOUD,
            ASRProvider.OPENAI_WHISPER,
            ASRProvider.FUNASR_CLOUD
        ]
    
    def get_model_cache_dir(self) -> str:
        """获取模型缓存目录"""
        base_dir = os.getenv("MODEL_CACHE_DIR", "./models")
        return os.path.join(base_dir, "funasr")
    
    def should_use_gpu(self) -> bool:
        """检查是否应该使用GPU"""
        return os.getenv("USE_GPU", "true").lower() == "true"
    
    def get_max_audio_duration(self) -> int:
        """获取最大音频时长限制（秒）"""
        return int(os.getenv("MAX_AUDIO_DURATION", "3600"))  # 默认1小时
    
    def validate_config(self) -> bool:
        """验证当前配置是否有效"""
        if self.is_cloud_provider():
            config = self.get_cloud_config()
            # 检查必要的API密钥是否存在
            if self.provider == ASRProvider.ALIBABA_CLOUD:
                return all([
                    config.get("access_key_id"),
                    config.get("access_key_secret"),
                    config.get("app_key")
                ])
            elif self.provider == ASRProvider.OPENAI_WHISPER:
                return bool(config.get("api_key"))
            # 其他云服务的验证逻辑...
        
        return True  # 本地FunASR不需要额外验证

# 全局配置实例
asr_config = ASRConfig()
