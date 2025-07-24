#!/usr/bin/env python3
"""
AI舞台系统前端启动脚本
"""

import os
import sys
import subprocess
import shutil

def main():
    print("🎭 启动AI舞台系统前端...")
    
    # 检查Node.js
    if not shutil.which('node'):
        print("❌ 需要安装Node.js")
        print("请访问 https://nodejs.org/ 下载安装")
        sys.exit(1)
    
    if not shutil.which('npm'):
        print("❌ 需要安装npm")
        sys.exit(1)
    
    # 切换到frontend目录
    frontend_dir = os.path.join(os.path.dirname(__file__), 'frontend')
    os.chdir(frontend_dir)
    
    # 检查node_modules
    if not os.path.exists('node_modules'):
        print("📦 安装依赖...")
        try:
            subprocess.run(['npm', 'install'], check=True)
            print("✅ 依赖安装完成")
        except subprocess.CalledProcessError:
            print("❌ 依赖安装失败")
            sys.exit(1)
    
    # 启动开发服务器
    try:
        print("🚀 启动React开发服务器...")
        print("📍 访问地址: http://localhost:3000")
        print("按 Ctrl+C 停止服务器")
        
        subprocess.run(['npm', 'start'])
    except KeyboardInterrupt:
        print("\n👋 前端服务器已停止")
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()