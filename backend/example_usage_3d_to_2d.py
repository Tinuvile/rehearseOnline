#!/usr/bin/env python3
"""
视频3D转2D平面位置处理示例
演示如何使用API进行视频处理和坐标转换

使用方法:
1. 确保已安装所有依赖: pip install -r requirements.txt
2. 确保AlphaPose和MiDaS环境已正确配置
3. 启动后端服务: python backend/main.py
4. 运行此示例: python backend/example_usage_3d_to_2d.py
"""

import asyncio
import requests
import json
import time
from pathlib import Path

# API配置
API_BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}

def upload_video(video_path: str) -> str:
    """上传视频文件"""
    print(f"正在上传视频: {video_path}")
    
    with open(video_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{API_BASE_URL}/api/video/upload", files=files)
    
    if response.status_code == 200:
        result = response.json()
        video_id = result['video']['id']
        print(f"视频上传成功，ID: {video_id}")
        return video_id
    else:
        print(f"视频上传失败: {response.text}")
        return None

def process_video_3d_to_2d(video_id: str, stage_annotation: dict, tracking_person_id: str = None) -> dict:
    """处理视频3D转2D"""
    print(f"开始处理视频3D转2D: {video_id}")
    
    request_data = {
        "video_id": video_id,
        "stage_annotation": stage_annotation,
        "tracking_person_id": tracking_person_id
    }
    
    print(f"请求URL: {API_BASE_URL}/api/video-3d-to-2d/process")
    print(f"请求数据: {json.dumps(request_data, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/video-3d-to-2d/process",
            json=request_data,
            headers=HEADERS,
            timeout=300  # 5分钟超时
        )
        
        print(f"响应状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        print(f"响应内容: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"处理成功，共识别{result['frame_count']}帧，{len(result['positions'])}个位置")
            return result
        else:
            print(f"处理失败: {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        print("请求超时 - 处理可能需要更长时间")
        return None
    except requests.exceptions.RequestException as e:
        print(f"请求异常: {str(e)}")
        return None

def get_processing_status(video_id: str) -> dict:
    """获取处理状态"""
    response = requests.get(f"{API_BASE_URL}/api/video-3d-to-2d/status/{video_id}")
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"获取状态失败: {response.text}")
        return None

def get_processing_results(video_id: str) -> dict:
    """获取处理结果"""
    response = requests.get(f"{API_BASE_URL}/api/video-3d-to-2d/results/{video_id}")
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"获取结果失败: {response.text}")
        return None

def analyze_movement_patterns(positions: list) -> dict:
    """分析移动模式"""
    if not positions:
        return {"error": "没有位置数据"}
    
    # 计算基本统计
    x_positions = [pos["position_2d"]["x"] for pos in positions]
    y_positions = [pos["position_2d"]["y"] for pos in positions]
    
    analysis = {
        "total_frames": len(positions),
        "x_range": {"min": min(x_positions), "max": max(x_positions)},
        "y_range": {"min": min(y_positions), "max": max(y_positions)},
        "average_position": {
            "x": sum(x_positions) / len(x_positions),
            "y": sum(y_positions) / len(y_positions)
        }
    }
    
    # 计算移动距离
    total_distance = 0
    for i in range(1, len(positions)):
        prev_pos = positions[i-1]["position_2d"]
        curr_pos = positions[i]["position_2d"]
        distance = ((curr_pos["x"] - prev_pos["x"])**2 + (curr_pos["y"] - prev_pos["y"])**2)**0.5
        total_distance += distance
    
    analysis["total_movement_distance"] = total_distance
    analysis["average_speed"] = total_distance / len(positions) if len(positions) > 1 else 0
    
    return analysis

def main():
    """主函数"""
    print("=== 视频3D转2D平面位置处理示例 ===\n")
    
    # 示例配置
    video_path = "test/访谈.mp4"  # 实际视频路径
    
    # 舞台标注信息（示例）
    stage_annotation = {
        "corners": [
            {"x": 100, "y": 100},  # 左上角
            {"x": 800, "y": 120},  # 右上角
            {"x": 780, "y": 600},  # 右下角
            {"x": 120, "y": 580}   # 左下角
        ],
        "depth_reference": 5.0,  # 参考深度（米）
        "real_width": 4.0,       # 实际舞台宽度（米）
        "real_height": 3.0       # 实际舞台高度（米）
    }
    
    # 检查视频文件是否存在
    if not Path(video_path).exists():
        print(f"错误：视频文件不存在: {video_path}")
        print("请确保视频文件路径正确")
        return
    
    try:
        # 1. 上传视频
        video_id = upload_video(video_path)
        if not video_id:
            return
        
        print("\n" + "="*50)
        
        # 2. 处理视频3D转2D
        result = process_video_3d_to_2d(video_id, stage_annotation)
        if not result:
            return
        
        print("\n" + "="*50)
        
        # 3. 分析结果
        positions = result.get("positions", [])
        if positions:
            analysis = analyze_movement_patterns(positions)
            print("\n=== 移动模式分析 ===")
            print(f"总帧数: {analysis['total_frames']}")
            print(f"X坐标范围: {analysis['x_range']['min']:.2f} - {analysis['x_range']['max']:.2f}米")
            print(f"Y坐标范围: {analysis['y_range']['min']:.2f} - {analysis['y_range']['max']:.2f}米")
            print(f"平均位置: ({analysis['average_position']['x']:.2f}, {analysis['average_position']['y']:.2f})米")
            print(f"总移动距离: {analysis['total_movement_distance']:.2f}米")
            print(f"平均移动速度: {analysis['average_speed']:.2f}米/帧")
            
            # 显示前5个位置作为示例
            print("\n=== 前5个位置示例 ===")
            for i, pos in enumerate(positions[:5]):
                print(f"帧{pos['frame_number']}: "
                      f"2D位置({pos['position_2d']['x']:.2f}, {pos['position_2d']['y']:.2f})米, "
                      f"3D位置({pos['position_3d']['x']:.2f}, {pos['position_3d']['y']:.2f}, {pos['position_3d']['z']:.2f})米, "
                      f"置信度: {pos['confidence']:.2f}")
        
        print("\n" + "="*50)
        
        # 4. 保存结果到文件
        output_file = f"temp/3d_to_2d_result_{video_id}.json"
        Path("temp").mkdir(exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        print(f"结果已保存到: {output_file}")
        
        # 5. 检查是否有人员出界
        stage_width = stage_annotation["real_width"]
        stage_height = stage_annotation["real_height"]
        
        out_of_bounds = []
        for pos in positions:
            x, y = pos["position_2d"]["x"], pos["position_2d"]["y"]
            if x < 0 or x > stage_width or y < 0 or y > stage_height:
                out_of_bounds.append(pos)
        
        if out_of_bounds:
            print(f"\n=== 检测到{len(out_of_bounds)}个出界事件 ===")
            for pos in out_of_bounds[:3]:  # 只显示前3个
                print(f"帧{pos['frame_number']}: 位置({pos['position_2d']['x']:.2f}, {pos['position_2d']['y']:.2f})米")
        else:
            print("\n=== 没有检测到出界事件 ===")
        
        print(f"\n=== 处理完成 ===")
        print(f"视频ID: {video_id}")
        print(f"共处理{len(positions)}个位置")
        
    except Exception as e:
        print(f"\n错误: {str(e)}")
        import traceback
        traceback.print_exc()

def test_api_connectivity():
    """测试API连接"""
    print("测试API连接...")
    
    try:
        # 测试基本连接
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            print("✅ API基本连接正常")
        else:
            print(f"❌ API基本连接失败: {response.status_code}")
            return False
            
        # 测试路由列表
        print("\n检查可用的API路由...")
        try:
            response = requests.get(f"{API_BASE_URL}/docs")
            if response.status_code == 200:
                print("✅ Swagger文档可访问")
            else:
                print(f"⚠️  Swagger文档访问异常: {response.status_code}")
        except:
            print("⚠️  无法访问Swagger文档")
        
        # 检查具体的3D转2D路由
        print("\n测试3D转2D路由...")
        try:
            # 这应该返回422 (Unprocessable Entity) 因为没有提供必要参数，但至少说明路由存在
            response = requests.post(f"{API_BASE_URL}/api/video-3d-to-2d/process")
            print(f"3D转2D路由状态码: {response.status_code}")
            if response.status_code == 422:
                print("✅ 3D转2D路由存在且可访问")
            elif response.status_code == 404:
                print("❌ 3D转2D路由不存在")
                return False
            else:
                print(f"⚠️  3D转2D路由状态异常: {response.status_code}")
        except Exception as e:
            print(f"❌ 无法访问3D转2D路由: {str(e)}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ 无法连接到API: {str(e)}")
        print("请确保后端服务正在运行: python backend/main.py")
        return False

if __name__ == "__main__":
    # 首先测试API连接
    if test_api_connectivity():
        main()
    else:
        print("\n请先启动后端服务:")
        print("1. cd 到项目根目录")
        print("2. 运行: python backend/main.py")
        print("3. 等待服务启动后重新运行此脚本") 