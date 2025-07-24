#!/usr/bin/env python3
"""
FunASR语音识别测试脚本
"""

import sys
import os
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent
sys.path.append(str(project_root))
sys.path.append(str(project_root / "backend"))

from backend.core.audio_processor import AudioProcessor

def test_funasr_transcription(video_path):
    """测试FunASR转录功能"""
    print(f"🎬 测试视频: {video_path}")
    
    try:
        # 初始化处理器
        audio_processor = AudioProcessor()
        
        # 提取音频
        print("🎵 提取音频...")
        audio_path = audio_processor.extract_audio_from_video(video_path)
        print(f"✅ 音频提取完成: {audio_path}")
        
        # FunASR转录
        print("🤖 开始FunASR转录...")
        transcripts = audio_processor.transcribe_audio_with_funasr(audio_path, "zh")
        
        # 显示结果
        print(f"✅ 转录完成: {len(transcripts)} 个片段")
        for i, transcript in enumerate(transcripts):
            print(f"片段 {i+1}: [{transcript.start_time:.1f}s-{transcript.end_time:.1f}s] {transcript.text}")
        
    except Exception as e:
        print(f"❌ 转录失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("用法: python test_funasr.py <video_path>")
        sys.exit(1)
    
    video_path = sys.argv[1]
    test_funasr_transcription(video_path)
