"""
AI舞台系统后端主入口
"""

import sys
import os
from pathlib import Path

# 添加项目根目录到Python路径
current_dir = Path(__file__).parent
project_root = current_dir.parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

from backend.api.video_analysis import router as video_router
from backend.api.stage_management import router as stage_router
from backend.api.ai_suggestions import router as ai_router
from backend.api.dialogue_extraction import router as dialogue_router
from backend.api.ai_analysis import router as ai_analysis_router
from backend.api.video_3d_to_2d import router as video_3d_to_2d_router
from backend.core.data_store import InMemoryDataStore

# 创建FastAPI应用
app = FastAPI(
    title="AI舞台系统",
    description="用于舞台调试、走位和演示的AI系统",
    version="1.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件服务
app.mount("/static", StaticFiles(directory="static"), name="static")

# 全局数据存储实例
data_store = InMemoryDataStore()

# 路由注册
app.include_router(video_router, prefix="/api/video", tags=["视频分析"])
app.include_router(stage_router, prefix="/api/stage", tags=["舞台管理"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI建议"])
app.include_router(dialogue_router, tags=["台词提取"])
app.include_router(ai_analysis_router, tags=["AI分析"])
app.include_router(video_3d_to_2d_router, prefix="/api/video-3d-to-2d", tags=["视频3D转2D"])

@app.on_event("startup")
async def startup_event():
    """应用启动时初始化"""
    # 创建必要的目录
    Path("uploads").mkdir(exist_ok=True)
    Path("static").mkdir(exist_ok=True)
    Path("temp").mkdir(exist_ok=True)
    Path("data").mkdir(exist_ok=True)
    
    # 尝试加载已有数据
    try:
        data_store.load_from_json("data/project_data.json")
        print("✅ 已加载现有项目数据")
    except FileNotFoundError:
        print("📝 创建新的项目数据存储")
    
    print("🎭 AI舞台系统启动成功!")

@app.get("/")
async def root():
    return {"message": "AI舞台系统API", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "data_store": "connected"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )