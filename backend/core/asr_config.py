"""
ASR (自动语音识别) 配置管理 - 基于FunClip
"""

import os
from typing import Dict, Any

class ASRConfig:
    """ASR配置管理器 - 简化版，基于FunClip"""
    
    def __init__(self):
        self.language = "zh"  # 默认中文
    
    def get_funasr_models_config(self, language: str = "zh") -> Dict[str, str]:
        """获取FunASR模型配置 - 与FunClip完全一致"""
        if language == "en":
            # 英文模型配置
            return {
                "model": "iic/speech_paraformer_asr-en-16k-vocab4199-pytorch",
                "vad_model": "damo/speech_fsmn_vad_zh-cn-16k-common-pytorch",
                "punc_model": "damo/punc_ct-transformer_zh-cn-common-vocab272727-pytorch",
                "spk_model": "damo/speech_campplus_sv_zh-cn_16k-common"
            }
        else:
            # 中文模型配置（默认）
            return {
                "model": "iic/speech_seaco_paraformer_large_asr_nat-zh-cn-16k-common-vocab8404-pytorch",
                "vad_model": "damo/speech_fsmn_vad_zh-cn-16k-common-pytorch", 
                "punc_model": "damo/punc_ct-transformer_zh-cn-common-vocab272727-pytorch",
                "spk_model": "damo/speech_campplus_sv_zh-cn_16k-common"
            }
    
    def get_recognition_params(self, language: str = "zh", enable_speaker_diarization: bool = False, hotwords: str = "") -> Dict[str, Any]:
        """获取识别参数 - 与FunClip完全一致"""
        params = {
            "return_raw_text": True,
            "is_final": True,
            "hotword": hotwords,
            "pred_timestamp": language == 'en',
            "en_post_proc": language == 'en',
            "cache": {}
        }
        
        if enable_speaker_diarization:
            params.update({
                "return_spk_res": True
            })
        else:
            params.update({
                "return_spk_res": False,
                "sentence_timestamp": True
            })
        
        return params

# 全局配置实例
asr_config = ASRConfig()
