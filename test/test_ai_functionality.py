#!/usr/bin/env python3
"""
AI功能测试脚本
测试StageEditor的AI分析功能
"""

import asyncio
import json
import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.core.ai_service import ai_service

def create_test_stage_data():
    """创建测试舞台数据"""
    return {
        "actors": [
            {
                "id": 1,
                "name": "主角",
                "x": 200,
                "y": 120,
                "color": "#a8c090",
                "role": "主演",
                "speed": 1.2
            },
            {
                "id": 2,
                "name": "配角A",
                "x": 350,
                "y": 200,
                "color": "#81a1c1",
                "role": "配演",
                "speed": 1.0
            }
        ],
        "dialogues": [
            {
                "id": "1",
                "actorId": 1,
                "content": "大家好，欢迎来到今天的表演！",
                "startTime": 0,
                "duration": 3,
                "emotion": "喜悦",
                "volume": 80
            }
        ],
        "movements": [],
        "lights": [],
        "stage_elements": [],
        "areas": []
    }

async def test_quick_suggestions():
    """测试快速建议功能"""
    print("🔍 测试快速建议功能...")
    
    stage_data = create_test_stage_data()
    suggestions = ai_service.generate_quick_suggestions(stage_data)
    
    print(f"✅ 获得 {len(suggestions)} 条快速建议:")
    for i, suggestion in enumerate(suggestions, 1):
        print(f"  {i}. [{suggestion['priority']}] {suggestion['type']}: {suggestion['description']}")
    
    return suggestions

def test_ai_service_configuration():
    """测试AI服务配置"""
    print("⚙️ 检查AI服务配置...")
    
    print(f"  API Key: {'已配置' if ai_service.api_key else '未配置'}")
    print(f"  Base URL: {ai_service.base_url}")
    print(f"  Model: {ai_service.model}")
    
    if not ai_service.api_key:
        print("  ⚠️ 警告: API Key未配置，完整AI分析将无法使用")

async def main():
    """主测试函数"""
    print("🤖 AdventureX2025 AI功能测试")
    print("=" * 50)
    
    # 测试配置
    test_ai_service_configuration()
    
    # 测试快速建议
    await test_quick_suggestions()
    
    print("\n✅ AI功能测试完成!")
    print("\n📝 使用说明:")
    print("  1. 快速建议 - 基于规则的即时建议，无需API调用")
    print("  2. 完整AI分析 - 调用Kimi API进行深度分析")
    print("\n🚀 在StageEditor中点击'快速建议'或'AI分析'按钮来使用这些功能")

if __name__ == "__main__":
    asyncio.run(main()) 