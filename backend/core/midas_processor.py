"""
MiDaS深度预测处理器
集成MiDaS进行深度预测
"""

import os
import asyncio
import subprocess
import logging
import json
from typing import Dict, List, Any, Optional
from pathlib import Path
import cv2
import numpy as np

logger = logging.getLogger(__name__)

class MiDaSProcessor:
    """MiDaS深度预测处理器"""
    
    def __init__(self):
        self.midas_dir = Path("MiDaS")
        self.conda_env = "midas-py310"
        self.model_type = "dpt_swin2_large_384"
        
        # 注意：在初始化时不检查目录，而是在实际使用时检查
    
    async def process_frames(self, frames_dir: str, output_dir: str) -> Dict[str, Any]:
        """
        处理帧图片，生成深度预测
        
        Args:
            frames_dir: 输入帧图片目录
            output_dir: 深度预测输出目录
        
        Returns:
            处理结果字典
        """
        logger.info(f"开始MiDaS深度预测: {frames_dir}")
        
        try:
            # 1. 创建必要的目录
            Path(output_dir).mkdir(parents=True, exist_ok=True)
            
            # 2. 准备输入目录（复制或链接帧文件到MiDaS输入目录）
            midas_input_dir = await self._prepare_input_frames(frames_dir)
            
            # 3. 运行MiDaS深度预测
            await self._run_midas(midas_input_dir, output_dir)
            
            # 4. 解析深度预测结果
            depth_results = await self._parse_depth_results(output_dir, frames_dir)
            
            return {
                "status": "success",
                "output_dir": output_dir,
                "depth_results": depth_results,
                "total_frames": len(depth_results)
            }
            
        except Exception as e:
            logger.error(f"MiDaS深度预测失败: {str(e)}")
            return {
                "status": "failed",
                "error": str(e),
                "output_dir": output_dir
            }
    
    async def _prepare_input_frames(self, frames_dir: str) -> str:
        """准备MiDaS输入帧"""
        
        # 使用MiDaS的input目录
        midas_input_dir = str(self.midas_dir / "input")
        
        # 清空并创建输入目录
        input_path = Path(midas_input_dir)
        if input_path.exists():
            import shutil
            shutil.rmtree(input_path)
        input_path.mkdir(parents=True, exist_ok=True)
        
        # 复制帧文件到MiDaS输入目录
        frames_path = Path(frames_dir)
        for frame_file in frames_path.glob("*"):
            if frame_file.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                import shutil
                shutil.copy2(frame_file, input_path / frame_file.name)
        
        logger.info(f"准备输入帧完成: {midas_input_dir}")
        return midas_input_dir
    
    async def _run_midas(self, input_dir: str, output_dir: str):
        """运行MiDaS深度预测"""
        
        # 检查MiDaS目录是否存在
        if not self.midas_dir.exists():
            raise FileNotFoundError(f"MiDaS目录不存在: {self.midas_dir}")
        
        # 设置MiDaS输出目录
        midas_output_dir = str(self.midas_dir / "output")
        
        # 构建命令
        cmd = [
            "conda", "run", "-n", self.conda_env,
            "python", "run.py",
            "--model_type", self.model_type,
            "--input_path", "input",
            "--output_path", "output"
        ]
        
        logger.info(f"执行MiDaS命令: {' '.join(cmd)}")
        
        # 执行命令
        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=str(self.midas_dir),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            error_msg = f"MiDaS执行失败: {stderr.decode()}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
        
        # 复制结果到指定输出目录
        await self._copy_midas_results(midas_output_dir, output_dir)
        
        logger.info("MiDaS执行成功")
        logger.debug(f"MiDaS输出: {stdout.decode()}")
    
    async def _copy_midas_results(self, midas_output_dir: str, target_output_dir: str):
        """复制MiDaS结果到目标目录"""
        
        import shutil
        source_path = Path(midas_output_dir)
        target_path = Path(target_output_dir)
        
        if source_path.exists():
            for file in source_path.glob("*"):
                if file.is_file():
                    shutil.copy2(file, target_path / file.name)
        
        logger.info(f"复制MiDaS结果完成: {target_output_dir}")
    
    async def _parse_depth_results(self, output_dir: str, original_frames_dir: str) -> List[Dict[str, Any]]:
        """解析深度预测结果"""
        
        results = []
        output_path = Path(output_dir)
        original_frames_path = Path(original_frames_dir)
        
        # 获取所有深度图文件
        depth_files = list(output_path.glob("*.png")) + list(output_path.glob("*.jpg"))
        depth_files.sort(key=lambda x: x.name)
        
        for depth_file in depth_files:
            # 找到对应的原始帧文件
            original_frame = self._find_corresponding_frame(depth_file.name, original_frames_path)
            
            if original_frame:
                result = {
                    "frame_file": str(original_frame),
                    "depth_file": str(depth_file),
                    "frame_number": self._extract_frame_number(depth_file.name)
                }
                
                # 读取深度图数据
                depth_data = await self._load_depth_data(str(depth_file))
                result["depth_data"] = depth_data
                
                results.append(result)
        
        logger.info(f"解析深度结果完成，共{len(results)}个文件")
        return results
    
    def _find_corresponding_frame(self, depth_filename: str, frames_dir: Path) -> Optional[Path]:
        """找到对应的原始帧文件"""
        
        # 去掉扩展名
        base_name = Path(depth_filename).stem
        
        # 尝试不同的扩展名
        for ext in [".jpg", ".jpeg", ".png"]:
            frame_file = frames_dir / f"{base_name}{ext}"
            if frame_file.exists():
                return frame_file
        
        return None
    
    async def _load_depth_data(self, depth_file_path: str) -> Dict[str, Any]:
        """加载深度图数据"""
        
        try:
            # 读取深度图
            depth_image = cv2.imread(depth_file_path, cv2.IMREAD_UNCHANGED)
            
            if depth_image is None:
                return {"error": "无法读取深度图"}
            
            # 计算深度统计信息
            height, width = depth_image.shape[:2]
            
            # 如果是3通道图像，转换为单通道
            if len(depth_image.shape) == 3:
                depth_image = cv2.cvtColor(depth_image, cv2.COLOR_BGR2GRAY)
            
            # 归一化深度值到0-1范围
            depth_normalized = depth_image.astype(np.float32) / 255.0
            
            return {
                "width": width,
                "height": height,
                "min_depth": float(np.min(depth_normalized)),
                "max_depth": float(np.max(depth_normalized)),
                "mean_depth": float(np.mean(depth_normalized)),
                "depth_map_path": depth_file_path
            }
            
        except Exception as e:
            logger.error(f"加载深度数据失败: {str(e)}")
            return {"error": str(e)}
    
    def _extract_frame_number(self, filename: str) -> int:
        """从文件名中提取帧号"""
        try:
            import re
            numbers = re.findall(r'\d+', filename)
            if numbers:
                return int(numbers[-1])
            return 0
        except:
            return 0
    
    async def get_depth_at_position(self, depth_file_path: str, x: int, y: int) -> float:
        """获取指定位置的深度值"""
        
        try:
            # 读取深度图
            depth_image = cv2.imread(depth_file_path, cv2.IMREAD_UNCHANGED)
            
            if depth_image is None:
                return 0.0
            
            # 如果是3通道图像，转换为单通道
            if len(depth_image.shape) == 3:
                depth_image = cv2.cvtColor(depth_image, cv2.COLOR_BGR2GRAY)
            
            height, width = depth_image.shape
            
            # 边界检查
            x = max(0, min(x, width - 1))
            y = max(0, min(y, height - 1))
            
            # 获取深度值并归一化
            depth_value = depth_image[y, x].astype(np.float32) / 255.0
            
            return float(depth_value)
            
        except Exception as e:
            logger.error(f"获取深度值失败: {str(e)}")
            return 0.0
    
    async def get_depth_at_positions(self, depth_file_path: str, positions: List[Dict[str, int]]) -> List[float]:
        """批量获取多个位置的深度值"""
        
        depths = []
        for pos in positions:
            depth = await self.get_depth_at_position(depth_file_path, pos["x"], pos["y"])
            depths.append(depth)
        
        return depths 