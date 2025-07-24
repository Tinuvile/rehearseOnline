#!/usr/bin/env python3
"""
测试视频处理功能
"""

import sys
import os
import tempfile
import numpy as np
import cv2
from pathlib import Path

# 添加backend路径
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from core.video_processor import VideoProcessor

def create_test_video(output_path: str, duration: int = 5, fps: int = 30, width: int = 640, height: int = 480):
    """创建测试视频文件"""
    print(f"🎬 创建测试视频: {output_path}")
    
    # 创建视频写入器
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    total_frames = duration * fps
    
    for i in range(total_frames):
        # 创建彩色帧
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # 添加渐变背景
        for y in range(height):
            for x in range(width):
                frame[y, x] = [
                    int(255 * (x / width)),  # Red
                    int(255 * (y / height)), # Green
                    int(255 * (i / total_frames))  # Blue
                ]
        
        # 添加文本
        text = f"Frame {i+1}/{total_frames}"
        cv2.putText(frame, text, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        # 添加时间戳
        timestamp = f"Time: {i/fps:.2f}s"
        cv2.putText(frame, timestamp, (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        out.write(frame)
    
    out.release()
    print(f"✅ 测试视频创建完成: {duration}秒, {fps}fps, {width}x{height}")

def test_video_processor():
    """测试视频处理器"""
    print("🔍 测试视频处理器...")
    
    processor = VideoProcessor()
    
    # 创建临时测试视频
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
        test_video_path = temp_file.name
    
    try:
        # 创建测试视频
        create_test_video(test_video_path, duration=3, fps=25)
        
        # 测试文件验证
        print("\n📋 测试文件验证...")
        validation = processor.validate_video_file(test_video_path)
        if validation["valid"]:
            print("✅ 文件验证通过")
        else:
            print(f"❌ 文件验证失败: {validation['errors']}")
            return False
        
        # 测试视频信息提取
        print("\n📊 测试视频信息提取...")
        info = processor.extract_video_info(test_video_path)
        print(f"✅ 视频信息: {info}")
        
        # 验证信息准确性
        expected_duration = 3.0
        if abs(info["duration"] - expected_duration) < 0.1:
            print("✅ 时长信息准确")
        else:
            print(f"⚠️ 时长信息可能不准确: {info['duration']} vs {expected_duration}")
        
        if info["fps"] == 25:
            print("✅ 帧率信息准确")
        else:
            print(f"⚠️ 帧率信息可能不准确: {info['fps']} vs 25")
        
        # 测试内容验证
        print("\n🔍 测试内容验证...")
        content_validation = processor.validate_video_content(test_video_path)
        if content_validation["valid"]:
            print(f"✅ 内容验证通过: {content_validation['readable_frames']}/{content_validation['total_frames']} 帧可读")
        else:
            print(f"❌ 内容验证失败: {content_validation['errors']}")
        
        # 测试缩略图提取
        print("\n🖼️ 测试缩略图提取...")
        thumbnail_path = processor.extract_thumbnail(test_video_path, 1.5)
        if thumbnail_path and os.path.exists(thumbnail_path):
            print(f"✅ 缩略图提取成功: {thumbnail_path}")
            
            # 验证缩略图
            thumbnail = cv2.imread(thumbnail_path)
            if thumbnail is not None:
                h, w = thumbnail.shape[:2]
                print(f"✅ 缩略图尺寸: {w}x{h}")
            else:
                print("❌ 缩略图文件损坏")
        else:
            print("❌ 缩略图提取失败")
        
        # 测试帧样本提取
        print("\n🎞️ 测试帧样本提取...")
        samples = processor.get_video_frames_sample(test_video_path, 5)
        if samples:
            print(f"✅ 帧样本提取成功: {len(samples)} 个样本")
            for i, (timestamp, frame_path) in enumerate(samples):
                if os.path.exists(frame_path):
                    print(f"  样本 {i+1}: {timestamp:.2f}s -> {frame_path}")
                else:
                    print(f"  ❌ 样本 {i+1} 文件不存在: {frame_path}")
        else:
            print("❌ 帧样本提取失败")
        
        return True
        
    except Exception as e:
        print(f"❌ 测试过程中发生错误: {e}")
        return False
        
    finally:
        # 清理测试文件
        try:
            os.unlink(test_video_path)
            processor.cleanup_temp_files()
            print("🧹 测试文件清理完成")
        except:
            pass

def test_error_handling():
    """测试错误处理"""
    print("\n🔍 测试错误处理...")
    
    processor = VideoProcessor()
    
    # 测试不存在的文件
    validation = processor.validate_video_file("nonexistent.mp4")
    if not validation["valid"] and "文件不存在" in validation["errors"][0]:
        print("✅ 不存在文件错误处理正确")
    else:
        print("❌ 不存在文件错误处理失败")
    
    # 测试不支持的格式
    with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as temp_file:
        temp_file.write(b"This is not a video file")
        temp_path = temp_file.name
    
    try:
        validation = processor.validate_video_file(temp_path)
        if not validation["valid"] and "不支持的文件格式" in validation["errors"][0]:
            print("✅ 不支持格式错误处理正确")
        else:
            print("❌ 不支持格式错误处理失败")
    finally:
        os.unlink(temp_path)
    
    return True

def main():
    """主测试函数"""
    print("=" * 60)
    print("🎭 AI舞台系统 - 视频处理测试")
    print("=" * 60)
    
    success = True
    
    try:
        # 检查OpenCV
        print(f"📹 OpenCV版本: {cv2.__version__}")
        
        success &= test_video_processor()
        success &= test_error_handling()
        
    except Exception as e:
        print(f"❌ 测试过程中发生错误: {e}")
        success = False
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 所有视频处理测试通过！")
    else:
        print("❌ 部分视频处理测试失败")
    print("=" * 60)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())