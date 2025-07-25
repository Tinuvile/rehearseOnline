#!/usr/bin/env python3
# -*- encoding: utf-8 -*-
"""
多人说话视频测试工具
基于迁移的FunClip功能，支持说话人区分
支持交互模式和批处理模式
"""

import os
import sys
import argparse
import time
from pathlib import Path

# 添加backend路径
sys.path.append('backend')

def parse_args():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description="多人说话视频语音识别测试工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用示例:
  python test_video_cli.py                               # 启动交互模式
  python test_video_cli.py --interactive                 # 启动交互模式
  python test_video_cli.py video.mp4                    # 批处理模式 - 基本识别
  python test_video_cli.py video.mp4 --speaker          # 批处理模式 - 启用说话人区分
  python test_video_cli.py video.mp4 --lang en          # 批处理模式 - 英文识别
  python test_video_cli.py video.mp4 --output results/  # 批处理模式 - 指定输出目录
  python test_video_cli.py video.mp4 --hotwords "重要 关键词"  # 批处理模式 - 添加热词
        """)
    
    parser.add_argument("video_path", nargs='?', help="视频文件路径（可选，如不提供则启动交互模式）")
    parser.add_argument("--speaker", "-s", action="store_true", 
                       help="启用说话人区分（适合多人对话）")
    parser.add_argument("--language", "--lang", "-l", default="zh", 
                       choices=["zh", "en"], help="语言设置 (默认: zh)")
    parser.add_argument("--hotwords", "-w", default="", 
                       help="热词列表，用空格分隔")
    parser.add_argument("--output", "-o", default="./output", 
                       help="输出目录 (默认: ./output)")
    parser.add_argument("--verbose", "-v", action="store_true",
                       help="显示详细信息")
    parser.add_argument("--interactive", "-i", action="store_true",
                       help="启动交互模式")
    
    return parser.parse_args()

def check_file(video_path):
    """检查视频文件"""
    if not os.path.exists(video_path):
        print(f"❌ 错误: 视频文件不存在: {video_path}")
        return False
    
    # 检查文件扩展名
    supported_formats = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm']
    file_ext = Path(video_path).suffix.lower()
    
    if file_ext not in supported_formats:
        print(f"⚠️  警告: 文件格式 {file_ext} 可能不被支持")
        print(f"   支持的格式: {', '.join(supported_formats)}")
    
    # 显示文件信息
    file_size = os.path.getsize(video_path) / (1024 * 1024)  # MB
    print(f"📁 视频文件: {video_path}")
    print(f"📏 文件大小: {file_size:.1f} MB")
    
    return True

def save_results(results, output_dir, filename_base, verbose=False):
    """保存识别结果"""
    os.makedirs(output_dir, exist_ok=True)
    
    if not results:
        print("❌ 没有识别结果可保存")
        return
    
    try:
        # 保存完整文本
        text_file = os.path.join(output_dir, f"{filename_base}_transcript.txt")
        with open(text_file, 'w', encoding='utf-8') as f:
            f.write("=" * 50 + "\n")
            f.write("语音识别完整文本\n")
            f.write("=" * 50 + "\n\n")
            f.write(results['text'])
            f.write("\n\n")
        print(f"📝 完整文本已保存: {text_file}")
        
        # 保存SRT字幕文件
        srt_file = os.path.join(output_dir, f"{filename_base}_subtitle.srt")
        with open(srt_file, 'w', encoding='utf-8') as f:
            f.write(results['srt'])
        print(f"🎬 SRT字幕已保存: {srt_file}")
        
        # 保存详细信息（JSON格式）
        import json
        detail_file = os.path.join(output_dir, f"{filename_base}_details.json")
        
        # 准备详细数据
        detail_data = {
            "text": results['text'],
            "raw_text": results.get('raw_text', ''),
            "sentences": results.get('sentences', []),
            "timestamp": results.get('timestamp', [])
        }
        
        with open(detail_file, 'w', encoding='utf-8') as f:
            json.dump(detail_data, f, ensure_ascii=False, indent=2)
        print(f"📋 详细信息已保存: {detail_file}")
        
        if verbose:
            print(f"✅ 所有结果文件已保存到: {output_dir}")
            
    except Exception as e:
        print(f"❌ 保存结果时出错: {e}")

def analyze_speakers(sentences, verbose=False):
    """分析说话人信息"""
    if not sentences:
        return None
    
    speaker_stats = {}
    total_duration = 0
    
    for sentence in sentences:
        if 'spk' in sentence and sentence['spk'] is not None:
            spk_id = f"说话人{sentence['spk']}"
            
            # 计算时长
            if 'timestamp' in sentence and sentence['timestamp']:
                duration = (sentence['timestamp'][-1][1] - sentence['timestamp'][0][0]) / 1000.0
            else:
                duration = 3.0  # 默认估计
            
            if spk_id not in speaker_stats:
                speaker_stats[spk_id] = {
                    'duration': 0,
                    'sentences': 0,
                    'texts': []
                }
            
            speaker_stats[spk_id]['duration'] += duration
            speaker_stats[spk_id]['sentences'] += 1
            speaker_stats[spk_id]['texts'].append(sentence.get('text', ''))
            
            total_duration += duration
    
    if not speaker_stats:
        return None
    
    # 计算说话比例
    for spk_id in speaker_stats:
        if total_duration > 0:
            speaker_stats[spk_id]['percentage'] = (speaker_stats[spk_id]['duration'] / total_duration) * 100
        else:
            speaker_stats[spk_id]['percentage'] = 0
    
    return {
        'speakers': speaker_stats,
        'total_speakers': len(speaker_stats),
        'total_duration': total_duration
    }

def display_results(results, speaker_analysis=None, verbose=False):
    """显示识别结果"""
    print("\n" + "=" * 60)
    print("🎯 语音识别结果")
    print("=" * 60)
    
    # 显示完整文本
    print("📝 识别文本:")
    print("-" * 40)
    print(results['text'])
    print()
    
    # 显示说话人分析
    if speaker_analysis and speaker_analysis['total_speakers'] > 0:
        print("👥 说话人分析:")
        print("-" * 40)
        print(f"检测到 {speaker_analysis['total_speakers']} 个说话人")
        print(f"总时长: {speaker_analysis['total_duration']:.1f} 秒")
        print()
        
        for spk_id, stats in speaker_analysis['speakers'].items():
            print(f"  {spk_id}:")
            print(f"    说话时长: {stats['duration']:.1f}秒 ({stats['percentage']:.1f}%)")
            print(f"    句子数量: {stats['sentences']}句")
            if verbose and stats['texts']:
                print(f"    示例内容: {stats['texts'][0][:50]}...")
            print()
    
    # 显示时间轴信息
    if verbose and 'sentences' in results:
        print("⏰ 时间轴详情:")
        print("-" * 40)
        for i, sentence in enumerate(results['sentences'][:5]):  # 只显示前5句
            if 'timestamp' in sentence and sentence['timestamp']:
                start_time = sentence['timestamp'][0][0] / 1000.0
                end_time = sentence['timestamp'][-1][1] / 1000.0
                spk_info = f" [说话人{sentence['spk']}]" if 'spk' in sentence else ""
                print(f"  {i+1:2d}. {start_time:6.1f}s - {end_time:6.1f}s{spk_info}: {sentence['text'][:40]}...")
        
        if len(results['sentences']) > 5:
            print(f"     ... (还有 {len(results['sentences']) - 5} 句)")

def process_video(video_path, language='zh', enable_speaker=False, hotwords='', output_dir='./output', verbose=False):
    """处理视频文件"""
    try:
        # 导入处理器
        from backend.core.audio_processor import audio_processor
        
        print("🔄 开始处理视频...")
        start_time = time.time()
        
        # 执行识别
        results = audio_processor.recognize_video_file(
            video_path=video_path,
            language=language,
            enable_speaker_diarization=enable_speaker,
            hotwords=hotwords
        )
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        print(f"✅ 处理完成! 耗时: {processing_time:.1f} 秒")
        
        # 分析说话人（如果启用）
        speaker_analysis = None
        if enable_speaker and 'sentences' in results:
            speaker_analysis = analyze_speakers(results['sentences'], verbose)
        
        # 显示结果
        display_results(results, speaker_analysis, verbose)
        
        # 保存结果
        filename_base = Path(video_path).stem
        save_results(results, output_dir, filename_base, verbose)
        
        print(f"\n🎉 处理完成! 结果已保存到: {output_dir}")
        
        return True
        
    except ImportError as e:
        print(f"❌ 导入错误: {e}")
        print("请确保已正确安装依赖: pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ 处理失败: {e}")
        if verbose:
            import traceback
            traceback.print_exc()
        return False

def interactive_mode():
    """交互模式"""
    print("\n🎤 多人说话视频语音识别测试工具 - 交互模式")
    print("=" * 60)
    
    while True:
        print("\n" + "=" * 60)
        print("📁 请选择视频文件:")
        
        # 获取视频文件路径
        video_path = input("🎯 视频文件路径 (或输入 'quit' 退出): ").strip()
        
        if video_path.lower() == 'quit':
            print("👋 再见!")
            break
        
        # 检查文件
        if not check_file(video_path):
            continue
        
        print("\n🔧 配置选项:")
        
        # 语言选择
        while True:
            lang = input("🌐 请选择语言 (zh/en) [默认: zh]: ").strip().lower()
            if not lang:
                lang = 'zh'
            if lang in ['zh', 'en']:
                break
            print("❌ 请输入 'zh' 或 'en'")
        
        # 说话人区分选择
        sd_choice = input("👥 是否启用说话人区分? (y/n) [默认: y]: ").strip().lower()
        if not sd_choice:
            sd_choice = 'y'
        enable_speaker = sd_choice in ['y', 'yes', '是']
        
        # 热词输入
        hotwords = input("🔥 热词 (可选，多个用空格分隔): ").strip()
        
        # 输出目录
        output_dir = input("📂 输出目录 [默认: ./output]: ").strip()
        if not output_dir:
            output_dir = "./output"
        
        # 详细模式
        verbose_choice = input("📊 显示详细信息? (y/n) [默认: y]: ").strip().lower()
        if not verbose_choice:
            verbose_choice = 'y'
        verbose = verbose_choice in ['y', 'yes', '是']
        
        # 显示配置摘要
        print(f"\n🔧 配置摘要:")
        print(f"   语言: {'中文' if lang == 'zh' else '英文'}")
        print(f"   说话人区分: {'启用' if enable_speaker else '禁用'}")
        if hotwords:
            print(f"   热词: {hotwords}")
        print(f"   输出目录: {output_dir}")
        print(f"   详细模式: {'启用' if verbose else '禁用'}")
        
        # 确认开始处理
        confirm = input("\n🚀 开始处理? (y/n) [默认: y]: ").strip().lower()
        if not confirm:
            confirm = 'y'
        
        if confirm in ['y', 'yes', '是']:
            success = process_video(video_path, lang, enable_speaker, hotwords, output_dir, verbose)
            
            if success:
                print("\n✨ 处理完成!")
                
                # 询问是否查看详细结果
                if not verbose:
                    show_details = input("📋 是否查看详细结果? (y/n) [默认: n]: ").strip().lower()
                    if show_details in ['y', 'yes', '是']:
                        # 重新显示结果，但这次包含详细信息
                        print("重新显示详细结果...")
            else:
                print("\n❌ 处理失败，请检查错误信息")
        else:
            print("❌ 取消处理")
        
        # 询问是否继续
        continue_choice = input("\n🔄 是否处理另一个视频? (y/n) [默认: n]: ").strip().lower()
        if continue_choice not in ['y', 'yes', '是']:
            print("👋 再见!")
            break

def main():
    """主函数"""
    print("🎤 多人说话视频语音识别测试工具")
    print("基于FunClip功能，支持说话人区分")
    print("=" * 60)
    
    # 解析参数
    args = parse_args()
    
    # 如果没有提供视频路径，或者明确指定了交互模式，则启动交互模式
    if not args.video_path or args.interactive:
        interactive_mode()
        return 0
    
    # 批处理模式
    print("📦 批处理模式")
    
    # 检查文件
    if not check_file(args.video_path):
        return 1
    
    # 显示配置
    print(f"🔧 识别配置:")
    print(f"   语言: {'中文' if args.language == 'zh' else '英文'}")
    print(f"   说话人区分: {'启用' if args.speaker else '禁用'}")
    if args.hotwords:
        print(f"   热词: {args.hotwords}")
    print(f"   输出目录: {args.output}")
    print()
    
    # 处理视频
    success = process_video(
        args.video_path, 
        args.language, 
        args.speaker, 
        args.hotwords, 
        args.output, 
        args.verbose
    )
    
    return 0 if success else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code) 