#!/usr/bin/env python3
"""
测试前端编译和启动
"""

import subprocess
import os
import sys
import time

def test_frontend_build():
    """测试前端编译"""
    print("🔍 测试前端编译...")
    
    frontend_dir = "frontend"
    if not os.path.exists(frontend_dir):
        print("❌ frontend目录不存在")
        return False
    
    os.chdir(frontend_dir)
    
    try:
        # 检查TypeScript编译
        print("📦 检查TypeScript编译...")
        result = subprocess.run(['npx', 'tsc', '--noEmit'], 
                              capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ TypeScript编译通过")
        else:
            print("❌ TypeScript编译失败:")
            print(result.stderr)
            return False
        
        return True
        
    except subprocess.TimeoutExpired:
        print("❌ TypeScript编译超时")
        return False
    except Exception as e:
        print(f"❌ 编译测试失败: {e}")
        return False

def main():
    print("=" * 50)
    print("🎭 前端编译测试")
    print("=" * 50)
    
    if test_frontend_build():
        print("✅ 前端编译测试通过")
        print("💡 可以尝试运行: npm start")
    else:
        print("❌ 前端编译测试失败")
        print("💡 请检查代码语法和依赖")

if __name__ == "__main__":
    main()