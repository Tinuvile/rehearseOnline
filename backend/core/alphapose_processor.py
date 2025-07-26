"""
AlphaPose姿势识别处理器
集成AlphaPose进行视频姿势识别和人员追踪
"""

import os
import sys
import json
import asyncio
import subprocess
import logging
from typing import Dict, List, Any, Optional
from pathlib import Path
import cv2
import numpy as np

logger = logging.getLogger(__name__)

class AlphaPoseProcessor:
    """AlphaPose处理器"""
    
    def __init__(self):
        self.alphapose_dir = Path("AlphaPose")
        self.conda_env = "alphapose"
        self.frame_extractor_script = "run_frame_extractor.py"
        
        # 注意：在初始化时不检查目录，而是在实际使用时检查
    
    async def process_video(self, video_path: str, output_dir: str, frames_dir: str) -> Dict[str, Any]:
        """
        处理视频，提取帧并进行姿势识别
        
        Args:
            video_path: 视频文件路径
            output_dir: AlphaPose输出目录
            frames_dir: 帧提取输出目录
        
        Returns:
            处理结果字典
        """
        logger.info(f"开始AlphaPose处理: {video_path}")
        
        try:
            # 1. 创建必要的目录
            Path(output_dir).mkdir(parents=True, exist_ok=True)
            Path(frames_dir).mkdir(parents=True, exist_ok=True)
            
            # 2. 运行AlphaPose的帧提取和姿势识别
            await self._run_alphapose(video_path, output_dir)
            
            # 3. 解析AlphaPose输出结果
            results = await self._parse_alphapose_results(output_dir)
            
            # 4. 进行人员追踪
            tracked_results = await self._track_persons(results)
            
            # 5. 提取帧文件信息
            frame_files = await self._get_frame_files(output_dir)
            
            return {
                "status": "success",
                "output_dir": output_dir,
                "frame_files": frame_files,
                "pose_results": tracked_results,
                "total_frames": len(frame_files),
                "persons_detected": len(set(person["person_id"] for person in tracked_results))
            }
            
        except Exception as e:
            logger.error(f"AlphaPose处理失败: {str(e)}")
            return {
                "status": "failed",
                "error": str(e),
                "output_dir": output_dir
            }
    
    async def _run_alphapose(self, video_path: str, output_dir: str):
        """运行AlphaPose进行姿势识别"""
        
        # 检查AlphaPose目录是否存在
        if not self.alphapose_dir.exists():
            raise FileNotFoundError(f"AlphaPose目录不存在: {self.alphapose_dir}")
        
        # 构建命令
        cmd = [
            "conda", "run", "-n", self.conda_env,
            "python", str(self.alphapose_dir / self.frame_extractor_script),
            "--video", video_path,
            "--output", output_dir
        ]
        
        logger.info(f"执行AlphaPose命令: {' '.join(cmd)}")
        
        # 执行命令
        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=str(self.alphapose_dir),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            error_msg = f"AlphaPose执行失败: {stderr.decode()}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
        
        logger.info("AlphaPose执行成功")
        logger.debug(f"AlphaPose输出: {stdout.decode()}")
    
    async def _parse_alphapose_results(self, output_dir: str) -> List[Dict[str, Any]]:
        """解析AlphaPose输出结果"""
        
        results = []
        output_path = Path(output_dir)
        
        # 查找AlphaPose的输出文件
        # AlphaPose通常会生成alphapose-results.json文件
        result_files = list(output_path.glob("alphapose-results*.json"))
        
        if not result_files:
            logger.warning(f"未找到AlphaPose结果文件在目录: {output_dir}")
            return results
        
        # 读取结果文件
        result_file = result_files[0]
        logger.info(f"解析AlphaPose结果文件: {result_file}")
        
        try:
            with open(result_file, 'r', encoding='utf-8') as f:
                alphapose_data = json.load(f)
            
            # 解析每个检测结果
            for detection in alphapose_data:
                result = {
                    "image_id": detection.get("image_id", ""),
                    "category_id": detection.get("category_id", 1),
                    "keypoints": detection.get("keypoints", []),
                    "score": detection.get("score", 0.0),
                    "bbox": detection.get("bbox", []),
                    "frame_number": self._extract_frame_number(detection.get("image_id", "")),
                    "person_id": None  # 将在追踪阶段分配
                }
                results.append(result)
            
            logger.info(f"解析完成，共{len(results)}个检测结果")
            return results
            
        except Exception as e:
            logger.error(f"解析AlphaPose结果失败: {str(e)}")
            return results
    
    async def _track_persons(self, pose_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """进行人员追踪，为同一个人分配相同的ID"""
        
        if not pose_results:
            return pose_results
        
        # 按帧号排序
        pose_results.sort(key=lambda x: x["frame_number"])
        
        # 简单的追踪算法：基于bbox中心点距离
        tracked_results = []
        next_person_id = 1
        
        # 维护当前活跃的人员
        active_persons = {}  # person_id -> last_bbox_center
        
        for result in pose_results:
            bbox = result["bbox"]
            if len(bbox) >= 4:
                # 计算bbox中心点
                center_x = bbox[0] + bbox[2] / 2
                center_y = bbox[1] + bbox[3] / 2
                current_center = (center_x, center_y)
                
                # 寻找最近的已知人员
                min_distance = float('inf')
                assigned_person_id = None
                
                for person_id, last_center in active_persons.items():
                    distance = np.sqrt((current_center[0] - last_center[0])**2 + 
                                     (current_center[1] - last_center[1])**2)
                    if distance < min_distance and distance < 100:  # 距离阈值
                        min_distance = distance
                        assigned_person_id = person_id
                
                # 如果没有找到匹配的人员，创建新的人员ID
                if assigned_person_id is None:
                    assigned_person_id = f"person_{next_person_id}"
                    next_person_id += 1
                
                # 更新人员位置
                active_persons[assigned_person_id] = current_center
                
                # 添加人员ID到结果
                result["person_id"] = assigned_person_id
                
                # 添加中心点坐标
                result["center_point"] = {
                    "x": center_x,
                    "y": center_y
                }
            else:
                result["person_id"] = f"person_{next_person_id}"
                next_person_id += 1
                result["center_point"] = {"x": 0, "y": 0}
            
            tracked_results.append(result)
        
        logger.info(f"人员追踪完成，识别出{len(active_persons)}个人员")
        return tracked_results
    
    async def _get_frame_files(self, output_dir: str) -> List[str]:
        """获取提取的帧文件列表"""
        
        output_path = Path(output_dir)
        frame_files = []
        
        # 查找图片文件
        for ext in [".jpg", ".jpeg", ".png"]:
            frame_files.extend(list(output_path.glob(f"*{ext}")))
        
        # 按文件名排序
        frame_files.sort(key=lambda x: x.name)
        
        return [str(f) for f in frame_files]
    
    def _extract_frame_number(self, image_id: str) -> int:
        """从图片ID中提取帧号"""
        try:
            # 尝试从文件名中提取数字
            import re
            numbers = re.findall(r'\d+', image_id)
            if numbers:
                return int(numbers[-1])  # 取最后一个数字作为帧号
            return 0
        except:
            return 0
    
    def get_keypoint_names(self) -> List[str]:
        """获取关键点名称列表（COCO格式）"""
        return [
            "nose", "left_eye", "right_eye", "left_ear", "right_ear",
            "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
            "left_wrist", "right_wrist", "left_hip", "right_hip",
            "left_knee", "right_knee", "left_ankle", "right_ankle"
        ]
    
    def extract_person_keypoints(self, pose_result: Dict[str, Any]) -> Dict[str, Dict[str, float]]:
        """提取人员的关键点坐标"""
        
        keypoints = pose_result.get("keypoints", [])
        keypoint_names = self.get_keypoint_names()
        
        person_keypoints = {}
        
        # 关键点格式：[x, y, confidence] * 17
        for i, name in enumerate(keypoint_names):
            if i * 3 + 2 < len(keypoints):
                person_keypoints[name] = {
                    "x": keypoints[i * 3],
                    "y": keypoints[i * 3 + 1],
                    "confidence": keypoints[i * 3 + 2]
                }
            else:
                person_keypoints[name] = {
                    "x": 0,
                    "y": 0,
                    "confidence": 0
                }
        
        return person_keypoints 