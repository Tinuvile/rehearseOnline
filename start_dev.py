#!/usr/bin/env python3
"""
开发环境启动脚本 - 同时启动前端和后端服务
"""

import os
import sys
import subprocess
import time
import threading
from pathlib import Path

def print_banner():
    """打印启动横幅"""
    print("=" * 60)
    print("🎭 AI舞台系统 - 开发环境启动")
    print("=" * 60)
    print("🔗 前端地址: http://localhost:3000")
    print("🔗 后端地址: http://localhost:8000")
    print("🔗 API文档: http://localhost:8000/docs")
    print("=" * 60)

def check_dependencies():
    """检查依赖"""
    print("📋 检查依赖...")
    
    # 检查Python依赖
    try:
        import fastapi
        import uvicorn
        print("✅ Python后端依赖检查通过")
    except ImportError as e:
        print(f"❌ Python依赖缺失: {e}")
        print("请运行: pip install -r requirements.txt")
        return False
    
    # 检查Node.js (加载nvm环境)
    try:
        nvm_cmd = 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && node --version'
        result = subprocess.run(nvm_cmd, capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print(f"✅ Node.js版本: {result.stdout.strip()}")
        else:
            raise FileNotFoundError
    except FileNotFoundError:
        print("❌ Node.js未安装")
        return False
    
    # 检查npm (加载nvm环境)
    try:
        nvm_cmd = 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && npm --version'
        result = subprocess.run(nvm_cmd, capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print(f"✅ npm版本: {result.stdout.strip()}")
        else:
            raise FileNotFoundError
    except (FileNotFoundError, subprocess.CalledProcessError):
        print("❌ npm未安装")
        return False
    
    return True

def start_backend():
    """启动后端服务"""
    print("🚀 启动后端服务...")
    
    # 切换到项目根目录
    os.chdir(Path(__file__).parent)
    
    # 创建必要目录
    for dir_name in ['uploads', 'temp', 'data', 'static']:
        Path(dir_name).mkdir(exist_ok=True)
    
    try:
        # 启动FastAPI服务
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "backend.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ 后端启动失败: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 后端服务已停止")

def start_frontend():
    """启动前端服务"""
    print("🚀 启动前端服务...")
    
    # 切换到前端目录
    frontend_dir = Path(__file__).parent / "frontend"
    os.chdir(frontend_dir)
    
    # 检查node_modules
    if not (frontend_dir / "node_modules").exists():
        print("📦 安装前端依赖...")
        try:
            nvm_cmd = 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && npm install'
            subprocess.run(nvm_cmd, check=True, shell=True)
        except subprocess.CalledProcessError as e:
            print(f"❌ 前端依赖安装失败: {e}")
            sys.exit(1)
    
    try:
        # 启动React服务
        nvm_cmd = 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && npm start'
        subprocess.run(nvm_cmd, check=True, shell=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ 前端启动失败: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 前端服务已停止")

def main():
    """主函数"""
    print_banner()
    
    # 检查依赖
    if not check_dependencies():
        print("❌ 依赖检查失败，请先安装所需依赖")
        sys.exit(1)
    
    print("\n🎯 启动开发服务...")
    
    try:
        # 创建线程启动后端
        backend_thread = threading.Thread(target=start_backend, daemon=True)
        backend_thread.start()
        
        # 等待后端启动
        print("⏳ 等待后端服务启动...")
        time.sleep(3)
        
        # 启动前端（主线程）
        start_frontend()
        
    except KeyboardInterrupt:
        print("\n\n🛑 开发服务已停止")
        print("👋 感谢使用AI舞台系统！")

if __name__ == "__main__":
    main() 