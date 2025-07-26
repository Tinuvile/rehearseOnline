"""
AI舞台系统后端主入口 (简化版)
"""

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from pathlib import Path

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

@app.on_event("startup")
async def startup_event():
    """应用启动时初始化"""
    # 创建必要的目录
    Path("uploads").mkdir(exist_ok=True)
    Path("static").mkdir(exist_ok=True)
    Path("temp").mkdir(exist_ok=True)
    Path("data").mkdir(exist_ok=True)
    
    print("🎭 AI舞台系统启动成功!")

@app.get("/")
async def root():
    return {"message": "AI舞台系统API", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "data_store": "connected"}

@app.get("/api/dialogue/supported-formats")
async def supported_formats():
    """返回支持的格式"""
    return {
        "supported_video_formats": ["mp4", "avi", "mov"],
        "supported_audio_formats": ["mp3", "wav"],
        "max_file_size_mb": 500
    }

@app.get("/api/stage/project")
async def get_project():
    """返回项目信息"""
    return {
        "project": {
            "name": "示例项目",
            "created_at": "2023-07-01T12:00:00Z",
            "updated_at": "2023-07-15T14:30:00Z"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )