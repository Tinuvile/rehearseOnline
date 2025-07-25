#!/usr/bin/env python3
# -*- encoding: utf-8 -*-
"""
测试FunClip功能迁移到backend的集成测试
"""

import sys
import os
sys.path.append('backend')

def test_asr_config():
    """测试ASR配置"""
    print("🔧 测试ASR配置...")
    
    try:
        from backend.core.asr_config import asr_config
        
        # 测试中文配置
        zh_config = asr_config.get_funasr_models_config("zh")
        print(f"✅ 中文模型配置: {zh_config['model']}")
        
        # 测试英文配置
        en_config = asr_config.get_funasr_models_config("en")
        print(f"✅ 英文模型配置: {en_config['model']}")
        
        # 测试识别参数
        params = asr_config.get_recognition_params("zh", True, "测试 热词")
        print(f"✅ 识别参数: return_spk_res={params['return_spk_res']}")
        
        return True
        
    except Exception as e:
        print(f"❌ ASR配置测试失败: {e}")
        return False

def test_audio_processor():
    """测试音频处理器"""
    print("\n🎵 测试音频处理器...")
    
    try:
        from backend.core.audio_processor import audio_processor, convert_pcm_to_float, time_convert
        
        # 测试工具函数
        import numpy as np
        test_data = np.array([1000, 2000, 3000], dtype=np.int16)
        converted = convert_pcm_to_float(test_data)
        print(f"✅ PCM转换测试通过: {converted.dtype}")
        
        # 测试时间转换
        time_str = time_convert(123456)
        print(f"✅ 时间转换测试通过: {time_str}")
        
        # 测试处理器初始化
        print(f"✅ 音频处理器创建成功: {type(audio_processor).__name__}")
        
        return True
        
    except Exception as e:
        print(f"❌ 音频处理器测试失败: {e}")
        return False

def test_data_models():
    """测试数据模型"""
    print("\n📋 测试数据模型...")
    
    try:
        from backend.models.data_models import TranscriptSegment
        
        # 创建测试转录片段
        segment = TranscriptSegment.create(
            text="这是一个测试文本",
            start_time=0.0,
            end_time=5.0,
            speaker_id="spk_0",
            confidence=0.95,
            emotion=None
        )
        
        print(f"✅ TranscriptSegment创建成功: {segment.text}")
        print(f"✅ 时间戳: {segment.start_time} - {segment.end_time}")
        print(f"✅ 说话人: {segment.speaker_id}")
        
        return True
        
    except Exception as e:
        print(f"❌ 数据模型测试失败: {e}")
        return False

def test_funclip_compatibility():
    """测试与FunClip的兼容性"""
    print("\n🔄 测试FunClip兼容性...")
    
    try:
        # 模拟FunASR返回的数据格式
        mock_sentence = {
            'text': '这是一个测试句子',
            'timestamp': [[0, 5000]],  # 0-5秒，以毫秒为单位
            'spk': 0
        }
        
        from backend.core.audio_processor import audio_processor
        
        # 测试转换函数
        segments = audio_processor.convert_to_transcript_segments([mock_sentence])
        
        if segments and len(segments) > 0:
            segment = segments[0]
            print(f"✅ FunClip数据转换成功:")
            print(f"   文本: {segment.text}")
            print(f"   时间: {segment.start_time} - {segment.end_time}秒")
            print(f"   说话人: {segment.speaker_id}")
            return True
        else:
            print("❌ 转换结果为空")
            return False
        
    except Exception as e:
        print(f"❌ FunClip兼容性测试失败: {e}")
        return False

def check_dependencies():
    """检查依赖"""
    print("📦 检查依赖...")
    
    dependencies = {
        'numpy': 'numpy',
        'librosa': 'librosa', 
        'moviepy': 'moviepy.editor'
    }
    
    all_ok = True
    for name, module in dependencies.items():
        try:
            __import__(module)
            print(f"✅ {name}: 已安装")
        except ImportError:
            print(f"❌ {name}: 未安装")
            all_ok = False
    
    # FunASR是可选的
    try:
        import funasr
        print(f"✅ funasr: 已安装 (可以进行实际语音识别)")
    except ImportError:
        print(f"⚠️  funasr: 未安装 (只能测试框架功能)")
    
    return all_ok

def main():
    """主测试函数"""
    print("🧪 FunClip到Backend迁移集成测试")
    print("=" * 50)
    
    # 检查依赖
    if not check_dependencies():
        print("\n❌ 依赖检查失败，请先安装缺少的依赖")
        return False
    
    # 运行测试
    tests = [
        ("ASR配置", test_asr_config),
        ("音频处理器", test_audio_processor), 
        ("数据模型", test_data_models),
        ("FunClip兼容性", test_funclip_compatibility)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name}测试出现异常: {e}")
            results.append((test_name, False))
    
    # 汇总结果
    print("\n" + "=" * 50)
    print("📊 测试结果汇总:")
    
    passed = 0
    for test_name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"   {test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n总计: {passed}/{len(results)} 个测试通过")
    
    if passed == len(results):
        print("🎉 所有测试通过！FunClip功能已成功迁移到backend！")
        print("\n📋 使用说明:")
        print("1. 在backend代码中使用: from backend.core.audio_processor import audio_processor")
        print("2. 调用音频识别: audio_processor.transcribe_audio_with_funasr(audio_path)")
        print("3. 调用视频识别: audio_processor.recognize_video_file(video_path)")
        return True
    else:
        print("⚠️  部分测试失败，请检查相关问题")
        return False

if __name__ == "__main__":
    main() 