"""
3D坐标转2D平面位置转换器
结合AlphaPose识别位置、MiDaS深度预测和舞台标注，将3D位置转换为2D平面坐标
"""

import logging
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
import cv2
from pathlib import Path

from backend.core.midas_processor import MiDaSProcessor

logger = logging.getLogger(__name__)

class CoordinateConverter:
    """坐标转换器"""
    
    def __init__(self):
        self.midas_processor = MiDaSProcessor()
    
    async def convert_positions(
        self,
        alphapose_results: Dict[str, Any],
        depth_results: Dict[str, Any],
        stage_annotation: Any,  # StageAnnotation对象
        tracking_person_id: Optional[str] = None
    ) -> List[Any]:  # 返回PersonPosition对象列表
        """
        转换3D位置为2D平面坐标
        
        Args:
            alphapose_results: AlphaPose处理结果
            depth_results: MiDaS深度预测结果
            stage_annotation: 舞台标注信息
            tracking_person_id: 要追踪的特定人员ID
        
        Returns:
            转换后的人员位置列表
        """
        logger.info("开始坐标转换...")
        
        positions = []
        
        # 获取姿势识别结果
        pose_results = alphapose_results.get("pose_results", [])
        if not pose_results:
            logger.warning("没有找到姿势识别结果")
            return positions
        
        # 获取深度预测结果
        depth_data = depth_results.get("depth_results", [])
        if not depth_data:
            logger.warning("没有找到深度预测结果")
            return positions
        
        # 创建深度数据索引（按帧号）
        depth_index = {item["frame_number"]: item for item in depth_data}
        
        # 过滤特定人员（如果指定）
        if tracking_person_id:
            pose_results = [r for r in pose_results if r.get("person_id") == tracking_person_id]
        
        logger.info(f"处理{len(pose_results)}个姿势检测结果")
        
        # 逐帧处理
        for pose_result in pose_results:
            try:
                position = await self._convert_single_position(
                    pose_result, depth_index, stage_annotation
                )
                if position:
                    positions.append(position)
            except Exception as e:
                logger.error(f"转换位置失败: {str(e)}")
                continue
        
        logger.info(f"坐标转换完成，共处理{len(positions)}个位置")
        return positions
    
    async def _convert_single_position(
        self,
        pose_result: Dict[str, Any],
        depth_index: Dict[int, Dict[str, Any]],
        stage_annotation: Any
    ) -> Optional[Any]:
        """转换单个位置"""
        
        frame_number = pose_result.get("frame_number", 0)
        person_id = pose_result.get("person_id", "unknown")
        
        # 获取对应帧的深度数据
        depth_info = depth_index.get(frame_number)
        if not depth_info:
            logger.warning(f"帧{frame_number}没有深度数据")
            return None
        
        # 获取人员在图像中的位置
        person_image_pos = self._get_person_image_position(pose_result)
        if not person_image_pos:
            return None
        
        # 获取该位置的深度值
        depth_value = await self._get_depth_at_person_position(
            depth_info, person_image_pos
        )
        
        # 转换为3D坐标
        position_3d = self._convert_to_3d_coordinates(
            person_image_pos, depth_value, depth_info
        )
        
        # 转换为2D平面坐标
        position_2d = self._convert_to_stage_coordinates(
            position_3d, stage_annotation
        )
        
        # 创建返回对象（模拟PersonPosition）
        from backend.api.video_3d_to_2d import PersonPosition
        
        return PersonPosition(
            frame_number=frame_number,
            timestamp=frame_number / 30.0,  # 假设30fps
            person_id=person_id,
            position_3d=position_3d,
            position_2d=position_2d,
            confidence=pose_result.get("score", 0.0)
        )
    
    def _get_person_image_position(self, pose_result: Dict[str, Any]) -> Optional[Dict[str, int]]:
        """获取人员在图像中的位置"""
        
        # 优先使用中心点
        if "center_point" in pose_result:
            center = pose_result["center_point"]
            return {
                "x": int(center["x"]),
                "y": int(center["y"])
            }
        
        # 使用bbox中心
        bbox = pose_result.get("bbox", [])
        if len(bbox) >= 4:
            center_x = int(bbox[0] + bbox[2] / 2)
            center_y = int(bbox[1] + bbox[3] / 2)
            return {"x": center_x, "y": center_y}
        
        # 使用关键点计算中心
        keypoints = pose_result.get("keypoints", [])
        if len(keypoints) >= 6:  # 至少有两个关键点
            # 计算有效关键点的平均位置
            valid_points = []
            for i in range(0, len(keypoints), 3):
                if i + 2 < len(keypoints) and keypoints[i + 2] > 0.1:  # 置信度阈值
                    valid_points.append((keypoints[i], keypoints[i + 1]))
            
            if valid_points:
                avg_x = sum(p[0] for p in valid_points) / len(valid_points)
                avg_y = sum(p[1] for p in valid_points) / len(valid_points)
                return {"x": int(avg_x), "y": int(avg_y)}
        
        return None
    
    async def _get_depth_at_person_position(
        self,
        depth_info: Dict[str, Any],
        person_pos: Dict[str, int]
    ) -> float:
        """获取人员位置的深度值"""
        
        depth_file = depth_info.get("depth_file", "")
        if not depth_file:
            return 0.5  # 默认深度值
        
        try:
            depth_value = await self.midas_processor.get_depth_at_position(
                depth_file, person_pos["x"], person_pos["y"]
            )
            return depth_value
        except Exception as e:
            logger.error(f"获取深度值失败: {str(e)}")
            return 0.5
    
    def _convert_to_3d_coordinates(
        self,
        image_pos: Dict[str, int],
        depth_value: float,
        depth_info: Dict[str, Any]
    ) -> Dict[str, float]:
        """将图像坐标和深度值转换为3D坐标"""
        
        # 获取图像尺寸
        depth_data = depth_info.get("depth_data", {})
        image_width = depth_data.get("width", 1920)
        image_height = depth_data.get("height", 1080)
        
        # 归一化图像坐标到[-1, 1]范围
        norm_x = (image_pos["x"] / image_width) * 2 - 1
        norm_y = (image_pos["y"] / image_height) * 2 - 1
        
        # 简化的3D坐标计算
        # 这里使用基本的透视投影逆变换
        # 在实际应用中，可能需要相机内参数进行更精确的计算
        
        # 假设相机的视场角和距离
        fov_horizontal = 70  # 度
        fov_vertical = 45    # 度
        
        # 根据深度值计算实际的3D坐标
        # 深度值越小表示越远（MiDaS的输出特性）
        actual_depth = (1.0 - depth_value) * 10.0 + 1.0  # 转换为1-11米的范围
        
        # 计算3D坐标
        x_3d = norm_x * actual_depth * np.tan(np.radians(fov_horizontal / 2))
        y_3d = -norm_y * actual_depth * np.tan(np.radians(fov_vertical / 2))  # Y轴向上为正
        z_3d = actual_depth
        
        return {
            "x": float(x_3d),
            "y": float(y_3d),
            "z": float(z_3d)
        }
    
    def _convert_to_stage_coordinates(
        self,
        position_3d: Dict[str, float],
        stage_annotation: Any
    ) -> Dict[str, float]:
        """将3D坐标转换为舞台2D平面坐标"""
        
        try:
            # 获取舞台标注信息
            corners = stage_annotation.corners
            real_width = stage_annotation.real_width
            real_height = stage_annotation.real_height
            depth_reference = stage_annotation.depth_reference
            
            if len(corners) < 4:
                logger.warning("舞台角点数量不足")
                return {"x": 0.0, "y": 0.0}
            
            # 计算舞台的变换矩阵
            stage_transform = self._calculate_stage_transform(
                corners, real_width, real_height, depth_reference
            )
            
            # 应用透视变换
            position_2d = self._apply_perspective_transform(
                position_3d, stage_transform
            )
            
            return position_2d
            
        except Exception as e:
            logger.error(f"舞台坐标转换失败: {str(e)}")
            return {"x": 0.0, "y": 0.0}
    
    def _calculate_stage_transform(
        self,
        corners: List[Dict[str, float]],
        real_width: float,
        real_height: float,
        depth_reference: float
    ) -> Dict[str, Any]:
        """计算舞台变换矩阵"""
        
        # 提取角点坐标
        corner_points = np.array([
            [corner["x"], corner["y"]] for corner in corners[:4]
        ], dtype=np.float32)
        
        # 定义舞台实际坐标系的四个角点（米）
        stage_points = np.array([
            [0, 0],                    # 左上角
            [real_width, 0],           # 右上角
            [real_width, real_height], # 右下角
            [0, real_height]           # 左下角
        ], dtype=np.float32)
        
        # 计算透视变换矩阵
        perspective_matrix = cv2.getPerspectiveTransform(corner_points, stage_points)
        
        return {
            "perspective_matrix": perspective_matrix,
            "depth_reference": depth_reference,
            "real_width": real_width,
            "real_height": real_height
        }
    
    def _apply_perspective_transform(
        self,
        position_3d: Dict[str, float],
        stage_transform: Dict[str, Any]
    ) -> Dict[str, float]:
        """应用透视变换"""
        
        try:
            # 获取变换信息
            perspective_matrix = stage_transform["perspective_matrix"]
            depth_reference = stage_transform["depth_reference"]
            
            # 考虑深度的影响
            # 如果深度与参考深度不同，需要调整位置
            depth_scale = depth_reference / max(position_3d["z"], 0.1)
            
            # 调整3D位置到参考深度平面
            adjusted_x = position_3d["x"] * depth_scale
            adjusted_y = position_3d["y"] * depth_scale
            
            # 应用透视变换
            # 这里简化处理，假设已经投影到图像平面
            # 在实际应用中需要更复杂的相机模型
            
            # 将3D坐标投影到舞台平面
            # 使用简化的正交投影
            stage_x = adjusted_x + stage_transform["real_width"] / 2
            stage_y = adjusted_y + stage_transform["real_height"] / 2
            
            # 边界检查
            stage_x = max(0, min(stage_x, stage_transform["real_width"]))
            stage_y = max(0, min(stage_y, stage_transform["real_height"]))
            
            return {
                "x": float(stage_x),
                "y": float(stage_y)
            }
            
        except Exception as e:
            logger.error(f"透视变换失败: {str(e)}")
            return {"x": 0.0, "y": 0.0}
    
    def calculate_movement_speed(
        self,
        positions: List[Any],  # PersonPosition列表
        time_window: float = 1.0
    ) -> List[Dict[str, float]]:
        """计算移动速度"""
        
        speeds = []
        
        if len(positions) < 2:
            return speeds
        
        for i in range(1, len(positions)):
            prev_pos = positions[i-1]
            curr_pos = positions[i]
            
            # 计算时间差
            time_diff = curr_pos.timestamp - prev_pos.timestamp
            if time_diff <= 0:
                continue
            
            # 计算位置差
            dx = curr_pos.position_2d["x"] - prev_pos.position_2d["x"]
            dy = curr_pos.position_2d["y"] - prev_pos.position_2d["y"]
            
            # 计算速度
            distance = np.sqrt(dx*dx + dy*dy)
            speed = distance / time_diff
            
            speeds.append({
                "frame_number": curr_pos.frame_number,
                "speed": float(speed),
                "direction": {
                    "x": float(dx / time_diff) if time_diff > 0 else 0.0,
                    "y": float(dy / time_diff) if time_diff > 0 else 0.0
                }
            })
        
        return speeds
    
    def detect_stage_boundaries(
        self,
        positions: List[Any],  # PersonPosition列表
        stage_width: float,
        stage_height: float
    ) -> List[Dict[str, Any]]:
        """检测出界事件"""
        
        boundary_events = []
        
        for pos in positions:
            x = pos.position_2d["x"]
            y = pos.position_2d["y"]
            
            # 检查是否出界
            out_of_bounds = False
            boundary_type = None
            
            if x < 0:
                out_of_bounds = True
                boundary_type = "left"
            elif x > stage_width:
                out_of_bounds = True
                boundary_type = "right"
            elif y < 0:
                out_of_bounds = True
                boundary_type = "top"
            elif y > stage_height:
                out_of_bounds = True
                boundary_type = "bottom"
            
            if out_of_bounds:
                boundary_events.append({
                    "frame_number": pos.frame_number,
                    "timestamp": pos.timestamp,
                    "person_id": pos.person_id,
                    "boundary_type": boundary_type,
                    "position": pos.position_2d
                })
        
        return boundary_events 