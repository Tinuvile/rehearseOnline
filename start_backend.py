#!/usr/bin/env python3
"""
简单的后端启动脚本
"""

import uvicorn
import sys
import os
from pathlib import Path

# 确保在正确的目录
project_root = Path(__file__).parent
os.chdir(project_root)

# 创建必要的目录
for dir_name in ['uploads', 'temp', 'data', 'static']:
    Path(dir_name).mkdir(exist_ok=True)

print("🎭 启动AI舞台系统后端服务...")
print("🔗 后端地址: http://localhost:8000")
print("🔗 API文档: http://localhost:8000/docs")
print("=" * 50)

if __name__ == "__main__":
    try:
        uvicorn.run(
            "backend.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🛑 后端服务已停止")
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        sys.exit(1)
