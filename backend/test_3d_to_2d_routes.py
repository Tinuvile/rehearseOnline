#!/usr/bin/env python3
"""
测试3D转2D路由是否正确注册
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from backend.api.video_3d_to_2d import router as video_3d_to_2d_router

app = FastAPI()
app.include_router(video_3d_to_2d_router, prefix="/api/video-3d-to-2d", tags=["视频3D转2D"])

print("路由注册成功！")
print("可用路由:")
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        print(f"  {route.methods} {route.path}")

# 检查特定路由
target_routes = [
    "/api/video-3d-to-2d/process",
    "/api/video-3d-to-2d/status/{video_id}",
    "/api/video-3d-to-2d/results/{video_id}"
]

print("\n检查目标路由:")
for target in target_routes:
    found = False
    for route in app.routes:
        if hasattr(route, 'path') and target.replace('{video_id}', 'video_id') in route.path:
            print(f"  ✅ 找到: {route.path}")
            found = True
            break
    if not found:
        print(f"  ❌ 未找到: {target}") 