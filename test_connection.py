#!/usr/bin/env python3
"""
前后端连接测试脚本
"""

import requests
import json
import time
from pathlib import Path

# API配置
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

def test_backend_health():
    """测试后端健康状态"""
    print("🔍 测试后端连接...")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 后端服务正常: {data}")
            return True
        else:
            print(f"❌ 后端返回状态码: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ 后端连接失败: {e}")
        return False

def test_supported_formats():
    """测试支持的格式接口"""
    print("🔍 测试支持格式接口...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/dialogue/supported-formats", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ 支持格式接口正常:")
            print(f"   视频格式: {data.get('supported_video_formats', [])}")
            print(f"   音频格式: {data.get('supported_audio_formats', [])}")
            print(f"   最大文件大小: {data.get('max_file_size_mb', 0)}MB")
            return True
        else:
            print(f"❌ 格式接口返回状态码: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ 格式接口连接失败: {e}")
        return False

def test_stage_api():
    """测试舞台管理接口"""
    print("🔍 测试舞台管理接口...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/stage/project", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ 舞台管理接口正常:")
            print(f"   项目信息: {data.get('project', {}).get('name', 'Unknown')}")
            return True
        else:
            print(f"❌ 舞台管理接口返回状态码: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ 舞台管理接口连接失败: {e}")
        return False

def test_frontend_availability():
    """测试前端可用性"""
    print("🔍 测试前端连接...")
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print("✅ 前端服务正常")
            return True
        else:
            print(f"❌ 前端返回状态码: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ 前端连接失败: {e}")
        print("   请确保前端服务已启动 (npm start)")
        return False

def test_cors():
    """测试CORS配置"""
    print("🔍 测试CORS配置...")
    try:
        # 模拟前端的OPTIONS请求
        response = requests.options(
            f"{BACKEND_URL}/api/dialogue/supported-formats",
            headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            timeout=5
        )
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        
        if cors_headers['Access-Control-Allow-Origin']:
            print("✅ CORS配置正常:")
            for key, value in cors_headers.items():
                if value:
                    print(f"   {key}: {value}")
            return True
        else:
            print("❌ CORS配置可能有问题")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ CORS测试失败: {e}")
        return False

def test_sample_upload():
    """测试样例文件上传（如果有的话）"""
    print("🔍 检查测试文件...")
    
    # 检查是否有测试音频文件
    test_files = [
        Path("test/sample.wav"),
        Path("test/sample.mp3"),
        Path("examples/demo.mp4")
    ]
    
    available_files = [f for f in test_files if f.exists()]
    
    if available_files:
        print(f"✅ 找到测试文件: {[str(f) for f in available_files]}")
        print("   可以手动测试上传功能")
    else:
        print("ℹ️  未找到测试文件，可以手动准备音频/视频文件进行测试")
    
    return True

def main():
    """主测试函数"""
    print("=" * 60)
    print("🎭 AI舞台系统 - 连接测试")
    print("=" * 60)
    
    tests = [
        ("后端健康检查", test_backend_health),
        ("支持格式接口", test_supported_formats),
        ("舞台管理接口", test_stage_api),
        ("前端可用性", test_frontend_availability),
        ("CORS配置", test_cors),
        ("测试文件检查", test_sample_upload),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name}发生异常: {e}")
            results.append((test_name, False))
        
        time.sleep(0.5)  # 短暂延迟
    
    # 汇总结果
    print("\n" + "=" * 60)
    print("📊 测试结果汇总:")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{test_name:<20} {status}")
        if result:
            passed += 1
    
    print("-" * 60)
    print(f"总计: {passed}/{total} 测试通过")
    
    if passed == total:
        print("🎉 所有测试通过！系统已准备就绪")
        print("\n🚀 使用说明:")
        print("1. 启动服务: python start_dev.py")
        print("2. 打开浏览器: http://localhost:3000")
        print("3. 进入视频分析页面上传视频")
        print("4. 提取台词后进入舞台编辑器查看结果")
    else:
        print("⚠️  部分测试失败，请检查服务状态")
        print("\n🔧 故障排除:")
        print("- 确保后端服务已启动: cd AdventureX2025 && python -m uvicorn backend.main:app --reload")
        print("- 确保前端服务已启动: cd AdventureX2025/frontend && npm start")
        print("- 检查端口是否被占用: 8000 (后端), 3000 (前端)")

if __name__ == "__main__":
    main() 