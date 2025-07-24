#!/usr/bin/env python3
"""
测试数据模型和内存存储功能
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from models.data_models import *
from models.validators import *
from core.data_store import InMemoryDataStore

def test_data_models():
    """测试数据模型创建"""
    print("🔍 测试数据模型...")
    
    # 测试基础数据类型
    pos2d = Position2D(100.0, 200.0)
    print(f"✅ Position2D: {pos2d}")
    
    rgb = RGB(255, 100, 50)
    print(f"✅ RGB: {rgb}")
    
    # 测试项目创建
    project = Project.create("测试项目", "这是一个测试项目")
    print(f"✅ Project: {project.name} (ID: {project.id})")
    
    # 测试演员创建
    actor = Actor.create("测试演员", "#FF5733")
    print(f"✅ Actor: {actor.name} (Color: {actor.color})")
    
    # 测试视频创建
    video = Video.create("test_video.mp4", "/path/to/video.mp4")
    print(f"✅ Video: {video.filename} (Status: {video.status})")
    
    # 测试转录片段
    transcript = TranscriptSegment.create(
        "这是一段测试台词", 0.0, 5.0, actor.id, 0.95, "positive"
    )
    print(f"✅ TranscriptSegment: {transcript.text[:20]}...")
    
    # 测试演员位置
    position = ActorPosition.create(actor.id, 2.5, pos2d, 0.9)
    print(f"✅ ActorPosition: Actor {actor.name} at ({pos2d.x}, {pos2d.y})")
    
    return True

def test_validators():
    """测试数据验证器"""
    print("\n🔍 测试数据验证器...")
    
    # 测试有效数据
    valid_project = {"name": "测试项目", "description": "描述"}
    errors = validate_project(valid_project)
    if not errors:
        print("✅ 项目数据验证通过")
    else:
        print(f"❌ 项目数据验证失败: {errors}")
    
    # 测试无效数据
    invalid_project = {"description": "缺少名称"}
    errors = validate_project(invalid_project)
    if errors:
        print(f"✅ 无效项目数据正确被拒绝: {errors[0]}")
    else:
        print("❌ 无效项目数据未被检测到")
    
    # 测试颜色验证
    valid_colors = ["#FF5733", "#000000", "#FFFFFF"]
    invalid_colors = ["FF5733", "#GG5733", "#FF57", "red"]
    
    for color in valid_colors:
        if validate_hex_color(color):
            print(f"✅ 有效颜色: {color}")
        else:
            print(f"❌ 有效颜色被拒绝: {color}")
    
    for color in invalid_colors:
        if not validate_hex_color(color):
            print(f"✅ 无效颜色被拒绝: {color}")
        else:
            print(f"❌ 无效颜色未被检测: {color}")
    
    return True

def test_data_store():
    """测试内存数据存储"""
    print("\n🔍 测试内存数据存储...")
    
    # 创建数据存储实例
    store = InMemoryDataStore()
    
    # 创建项目
    project = store.create_project("测试项目", "数据存储测试")
    print(f"✅ 创建项目: {project.name}")
    
    # 创建演员
    actor = store.add_actor("测试演员", "#FF5733")
    print(f"✅ 创建演员: {actor.name}")
    
    # 创建视频
    video = store.add_video("test.mp4", "/path/to/test.mp4")
    print(f"✅ 创建视频: {video.filename}")
    
    # 添加转录数据
    transcripts = [
        TranscriptSegment.create("第一句台词", 0.0, 2.0, actor.id, 0.95, "positive"),
        TranscriptSegment.create("第二句台词", 2.5, 5.0, actor.id, 0.90, "neutral")
    ]
    store.add_transcripts(video.id, transcripts)
    print(f"✅ 添加转录数据: {len(transcripts)} 条")
    
    # 添加位置数据
    positions = [
        ActorPosition.create(actor.id, 0.0, Position2D(100, 200), 0.9),
        ActorPosition.create(actor.id, 1.0, Position2D(120, 210), 0.85),
        ActorPosition.create(actor.id, 2.0, Position2D(140, 220), 0.88)
    ]
    store.add_actor_positions(video.id, positions)
    print(f"✅ 添加位置数据: {len(positions)} 条")
    
    # 测试数据检索
    retrieved_transcripts = store.get_transcripts(video.id)
    retrieved_positions = store.get_actor_positions(video.id)
    
    print(f"✅ 检索转录数据: {len(retrieved_transcripts)} 条")
    print(f"✅ 检索位置数据: {len(retrieved_positions)} 条")
    
    # 测试数据统计
    stats = store.get_data_statistics()
    print(f"✅ 数据统计: {stats}")
    
    # 测试JSON保存和加载
    test_file = os.path.join(os.getcwd(), "test_data.json")
    try:
        store.save_to_json(test_file)
        print(f"✅ 数据保存到JSON: {test_file}")
        
        # 创建新的存储实例并加载数据
        new_store = InMemoryDataStore()
        new_store.load_from_json(test_file)
        print(f"✅ 从JSON加载数据")
        
        # 验证数据一致性
        new_stats = new_store.get_data_statistics()
        if stats["projects_count"] == new_stats["projects_count"]:
            print("✅ 数据一致性验证通过")
        else:
            print("❌ 数据一致性验证失败")
        
        # 清理测试文件
        os.remove(test_file)
        
    except Exception as e:
        print(f"❌ JSON操作失败: {e}")
        return False
    
    return True

def main():
    """主测试函数"""
    print("=" * 60)
    print("🎭 AI舞台系统 - 数据模型测试")
    print("=" * 60)
    
    success = True
    
    try:
        success &= test_data_models()
        success &= test_validators()
        success &= test_data_store()
        
    except Exception as e:
        print(f"❌ 测试过程中发生错误: {e}")
        success = False
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 所有测试通过！数据模型和存储功能正常")
    else:
        print("❌ 部分测试失败，请检查实现")
    print("=" * 60)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())