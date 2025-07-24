#!/usr/bin/env python3
"""
AI舞台系统后端启动脚本
"""

import os
import sys
import subprocess

def main():
    print("🎭 启动AI舞台系统后端...")
    
    # 检查Python版本
    if sys.version_info < (3, 8):
        print("❌ 需要Python 3.8或更高版本")
        sys.exit(1)
    
    # 切换到backend目录
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)
    
    # 检查依赖
    try:
        import fastapi
        import uvicorn
        print("✅ 依赖检查通过")
    except ImportError as e:
        print(f"❌ 缺少依赖: {e}")
        print("请运行: pip install -r requirements.txt")
        sys.exit(1)
    
    # 启动服务器
    try:
        print("🚀 启动FastAPI服务器...")
        print("📍 访问地址: http://localhost:8000")
        print("📖 API文档: http://localhost:8000/docs")
        print("按 Ctrl+C 停止服务器")
        
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()