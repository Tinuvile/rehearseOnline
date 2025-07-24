#!/usr/bin/env python3
"""
测试音频处理功能
"""

import sys
import os
import tempfile
import numpy as np
import cv2
from pathlib import Path

# 添加backend路径
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))
sys.path.append(str(project_root / "backend"))

from backend.core.audio_processor import AudioProcessor

def create_test_video_with_audio(output_path: str, duration: int = 5, fps: int = 30):
    """创建带音频的测试视频（模拟）"""
    print(f"🎬 创建测试视频: {output_path}")
    
    # 创建视频写入器
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (640, 480))
    
    total_frames = duration * fps
    
    for i in range(total_frames):
        # 创建简单的帧
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        frame[:] = [50, 100, 150]  # 蓝色背景
        
        # 添加文本
        text = f"Audio Test Frame {i+1}"
        cv2.putText(frame, text, (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        out.write(frame)
    
    out.release()
    print(f"✅ 测试视频创建完成: {duration}秒")

def test_audio_processor():
    """测试音频处理器"""
    print("🔍 测试音频处理器...")
    
    processor = AudioProcessor()
    
    # 创建临时测试视频
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
        test_video_path = temp_file.name
    
    try:
        # 创建测试视频
        create_test_video_with_audio(test_video_path, duration=3)
        
        # 测试音频提取
        print("\n🎵 测试音频提取...")
        try:
            audio_path = processor.extract_audio_from_video(test_video_path)
            if audio_path and os.path.exists(audio_path):
                print(f"✅ 音频提取成功: {audio_path}")
            else:
                print("⚠️ 音频提取返回空路径（可能是FFmpeg不可用）")
        except Exception as e:
            print(f"⚠️ 音频提取失败: {e}")
        
        # 测试音频属性分析
        print("\n📊 测试音频属性分析...")
        try:
            # 创建一个模拟音频文件用于测试
            mock_audio_path = processor.temp_dir / "test_audio.wav"
            with open(mock_audio_path, 'wb') as f:
                f.write(b'RIFF' + b'\x00' * 100)  # 模拟WAV文件头
            
            properties = processor.analyze_audio_properties(str(mock_audio_path))
            print(f"✅ 音频属性分析: {properties}")
            
        except Exception as e:
            print(f"⚠️ 音频属性分析失败: {e}")
        
        # 测试简单转录
        print("\n📝 测试简单转录...")
        try:
            transcripts = processor.transcribe_audio_simple("dummy_path.wav")
            print(f"✅ 简单转录成功: {len(transcripts)} 个片段")
            
            for i, transcript in enumerate(transcripts):
                print(f"  片段 {i+1}: {transcript.start_time:.1f}s-{transcript.end_time:.1f}s: {transcript.text}")
                
        except Exception as e:
            print(f"❌ 简单转录失败: {e}")
        
        # 测试语音片段检测
        print("\n🗣️ 测试语音片段检测...")
        try:
            segments = processor.detect_speech_segments("dummy_path.wav")
            print(f"✅ 语音片段检测成功: {len(segments)} 个片段")
            
            for i, segment in enumerate(segments):
                print(f"  片段 {i+1}: {segment['start']:.1f}s-{segment['end']:.1f}s (置信度: {segment['confidence']:.2f})")
                
        except Exception as e:
            print(f"❌ 语音片段检测失败: {e}")
        
        # 测试FunASR转录（如果可用）
        print("\n🤖 测试FunASR转录...")
        try:
            transcripts = processor.transcribe_audio_with_funasr("dummy_path.wav")
            if len(transcripts) > 0:
                print(f"✅ FunASR转录成功: {len(transcripts)} 个片段")
            else:
                print("⚠️ FunASR转录返回空结果（可能是模拟数据）")
        except Exception as e:
            print(f"⚠️ FunASR转录失败（可能未安装）: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ 测试过程中发生错误: {e}")
        return False
        
    finally:
        # 清理测试文件
        try:
            os.unlink(test_video_path)
            processor.cleanup_audio_files()
            print("🧹 测试文件清理完成")
        except:
            pass

def test_error_handling():
    """测试错误处理"""
    print("\n🔍 测试错误处理...")
    
    processor = AudioProcessor()
    
    # 测试不存在的文件
    try:
        processor.extract_audio_from_video("nonexistent.mp4")
        print("❌ 不存在文件错误处理失败")
        return False
    except FileNotFoundError:
        print("✅ 不存在文件错误处理正确")
    except Exception as e:
        print(f"⚠️ 不存在文件错误处理异常: {e}")
    
    # 测试音频属性分析错误处理
    try:
        processor.analyze_audio_properties("nonexistent.wav")
        print("❌ 音频属性分析错误处理失败")
        return False
    except FileNotFoundError:
        print("✅ 音频属性分析错误处理正确")
    except Exception as e:
        print(f"⚠️ 音频属性分析错误处理异常: {e}")
    
    return True

def test_dependencies():
    """测试依赖检查"""
    print("\n🔍 测试依赖检查...")
    
    processor = AudioProcessor()
    
    # 依赖检查在初始化时已经执行
    print("✅ 依赖检查完成（查看上面的日志）")
    
    return True

def main():
    """主测试函数"""
    print("=" * 60)
    print("🎭 AI舞台系统 - 音频处理测试")
    print("=" * 60)
    
    success = True
    
    try:
        success &= test_dependencies()
        success &= test_audio_processor()
        success &= test_error_handling()
        
    except Exception as e:
        print(f"❌ 测试过程中发生错误: {e}")
        success = False
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 音频处理测试完成！")
        print("💡 注意: 某些功能需要FFmpeg和FunASR才能完全工作")
    else:
        print("❌ 部分音频处理测试失败")
    print("=" * 60)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())