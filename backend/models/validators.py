"""
数据验证工具
"""

from typing import Any, Dict, List, Optional
import re
from datetime import datetime

def validate_position_2d(position: Dict[str, Any]) -> bool:
    """验证2D位置数据"""
    if not isinstance(position, dict):
        return False
    
    required_fields = ['x', 'y']
    for field in required_fields:
        if field not in position:
            return False
        if not isinstance(position[field], (int, float)):
            return False
    
    return True

def validate_rgb_color(color: Dict[str, Any]) -> bool:
    """验证RGB颜色数据"""
    if not isinstance(color, dict):
        return False
    
    required_fields = ['r', 'g', 'b']
    for field in required_fields:
        if field not in color:
            return False
        value = color[field]
        if not isinstance(value, int) or value < 0 or value > 255:
            return False
    
    return True

def validate_hex_color(color: str) -> bool:
    """验证HEX颜色代码"""
    if not isinstance(color, str):
        return False
    
    # 匹配 #RRGGBB 格式
    pattern = r'^#[0-9A-Fa-f]{6}$'
    return bool(re.match(pattern, color))

def validate_timestamp(timestamp: Any) -> bool:
    """验证时间戳"""
    if not isinstance(timestamp, (int, float)):
        return False
    
    return timestamp >= 0

def validate_confidence(confidence: Any) -> bool:
    """验证置信度"""
    if not isinstance(confidence, (int, float)):
        return False
    
    return 0.0 <= confidence <= 1.0

def validate_intensity(intensity: Any) -> bool:
    """验证强度值"""
    if not isinstance(intensity, (int, float)):
        return False
    
    return 0.0 <= intensity <= 1.0

def validate_volume(volume: Any) -> bool:
    """验证音量值"""
    if not isinstance(volume, (int, float)):
        return False
    
    return 0.0 <= volume <= 1.0

def validate_transcript_segment(data: Dict[str, Any]) -> List[str]:
    """验证转录片段数据"""
    errors = []
    
    # 必需字段
    required_fields = ['text', 'start_time', 'end_time']
    for field in required_fields:
        if field not in data:
            errors.append(f"缺少必需字段: {field}")
    
    # 验证文本
    if 'text' in data and not isinstance(data['text'], str):
        errors.append("text必须是字符串")
    
    # 验证时间戳
    if 'start_time' in data and not validate_timestamp(data['start_time']):
        errors.append("start_time必须是非负数")
    
    if 'end_time' in data and not validate_timestamp(data['end_time']):
        errors.append("end_time必须是非负数")
    
    # 验证时间逻辑
    if ('start_time' in data and 'end_time' in data and 
        isinstance(data['start_time'], (int, float)) and 
        isinstance(data['end_time'], (int, float))):
        if data['start_time'] >= data['end_time']:
            errors.append("start_time必须小于end_time")
    
    # 验证置信度
    if 'confidence' in data and not validate_confidence(data['confidence']):
        errors.append("confidence必须在0.0到1.0之间")
    
    return errors

def validate_actor_position(data: Dict[str, Any]) -> List[str]:
    """验证演员位置数据"""
    errors = []
    
    # 必需字段
    required_fields = ['actor_id', 'timestamp', 'position_2d']
    for field in required_fields:
        if field not in data:
            errors.append(f"缺少必需字段: {field}")
    
    # 验证actor_id
    if 'actor_id' in data and not isinstance(data['actor_id'], str):
        errors.append("actor_id必须是字符串")
    
    # 验证时间戳
    if 'timestamp' in data and not validate_timestamp(data['timestamp']):
        errors.append("timestamp必须是非负数")
    
    # 验证位置
    if 'position_2d' in data and not validate_position_2d(data['position_2d']):
        errors.append("position_2d格式无效")
    
    # 验证置信度
    if 'confidence' in data and not validate_confidence(data['confidence']):
        errors.append("confidence必须在0.0到1.0之间")
    
    return errors

def validate_lighting_cue(data: Dict[str, Any]) -> List[str]:
    """验证灯光提示数据"""
    errors = []
    
    # 必需字段
    required_fields = ['timestamp', 'lights']
    for field in required_fields:
        if field not in data:
            errors.append(f"缺少必需字段: {field}")
    
    # 验证时间戳
    if 'timestamp' in data and not validate_timestamp(data['timestamp']):
        errors.append("timestamp必须是非负数")
    
    # 验证灯光列表
    if 'lights' in data:
        if not isinstance(data['lights'], list):
            errors.append("lights必须是列表")
        else:
            for i, light in enumerate(data['lights']):
                light_errors = validate_light_state(light)
                for error in light_errors:
                    errors.append(f"lights[{i}]: {error}")
    
    # 验证过渡时长
    if 'transition_duration' in data and not validate_timestamp(data['transition_duration']):
        errors.append("transition_duration必须是非负数")
    
    return errors

def validate_light_state(data: Dict[str, Any]) -> List[str]:
    """验证灯光状态数据"""
    errors = []
    
    # 必需字段
    required_fields = ['light_id', 'color', 'intensity']
    for field in required_fields:
        if field not in data:
            errors.append(f"缺少必需字段: {field}")
    
    # 验证light_id
    if 'light_id' in data and not isinstance(data['light_id'], str):
        errors.append("light_id必须是字符串")
    
    # 验证颜色
    if 'color' in data and not validate_rgb_color(data['color']):
        errors.append("color格式无效")
    
    # 验证强度
    if 'intensity' in data and not validate_intensity(data['intensity']):
        errors.append("intensity必须在0.0到1.0之间")
    
    return errors

def validate_music_cue(data: Dict[str, Any]) -> List[str]:
    """验证音乐提示数据"""
    errors = []
    
    # 必需字段
    required_fields = ['timestamp', 'action']
    for field in required_fields:
        if field not in data:
            errors.append(f"缺少必需字段: {field}")
    
    # 验证时间戳
    if 'timestamp' in data and not validate_timestamp(data['timestamp']):
        errors.append("timestamp必须是非负数")
    
    # 验证动作
    valid_actions = ['start', 'stop', 'fade_in', 'fade_out']
    if 'action' in data:
        if not isinstance(data['action'], str):
            errors.append("action必须是字符串")
        elif data['action'] not in valid_actions:
            errors.append(f"action必须是以下值之一: {', '.join(valid_actions)}")
    
    # 验证音量
    if 'volume' in data and not validate_volume(data['volume']):
        errors.append("volume必须在0.0到1.0之间")
    
    # 验证淡入淡出时长
    if 'fade_duration' in data and not validate_timestamp(data['fade_duration']):
        errors.append("fade_duration必须是非负数")
    
    return errors

def validate_actor(data: Dict[str, Any]) -> List[str]:
    """验证演员数据"""
    errors = []
    
    # 必需字段
    required_fields = ['name']
    for field in required_fields:
        if field not in data:
            errors.append(f"缺少必需字段: {field}")
    
    # 验证名称
    if 'name' in data:
        if not isinstance(data['name'], str):
            errors.append("name必须是字符串")
        elif len(data['name'].strip()) == 0:
            errors.append("name不能为空")
    
    # 验证颜色
    if 'color' in data and not validate_hex_color(data['color']):
        errors.append("color必须是有效的HEX颜色代码 (如: #FF5733)")
    
    return errors

def validate_video(data: Dict[str, Any]) -> List[str]:
    """验证视频数据"""
    errors = []
    
    # 必需字段
    required_fields = ['filename', 'file_path']
    for field in required_fields:
        if field not in data:
            errors.append(f"缺少必需字段: {field}")
    
    # 验证文件名
    if 'filename' in data:
        if not isinstance(data['filename'], str):
            errors.append("filename必须是字符串")
        elif len(data['filename'].strip()) == 0:
            errors.append("filename不能为空")
    
    # 验证文件路径
    if 'file_path' in data:
        if not isinstance(data['file_path'], str):
            errors.append("file_path必须是字符串")
        elif len(data['file_path'].strip()) == 0:
            errors.append("file_path不能为空")
    
    # 验证时长
    if 'duration' in data and not validate_timestamp(data['duration']):
        errors.append("duration必须是非负数")
    
    # 验证帧率
    if 'fps' in data:
        if not isinstance(data['fps'], int) or data['fps'] <= 0:
            errors.append("fps必须是正整数")
    
    # 验证状态
    valid_statuses = ['uploaded', 'processing', 'processed', 'error']
    if 'status' in data:
        if not isinstance(data['status'], str):
            errors.append("status必须是字符串")
        elif data['status'] not in valid_statuses:
            errors.append(f"status必须是以下值之一: {', '.join(valid_statuses)}")
    
    return errors

def validate_project(data: Dict[str, Any]) -> List[str]:
    """验证项目数据"""
    errors = []
    
    # 必需字段
    required_fields = ['name']
    for field in required_fields:
        if field not in data:
            errors.append(f"缺少必需字段: {field}")
    
    # 验证名称
    if 'name' in data:
        if not isinstance(data['name'], str):
            errors.append("name必须是字符串")
        elif len(data['name'].strip()) == 0:
            errors.append("name不能为空")
    
    # 验证描述
    if 'description' in data and not isinstance(data['description'], str):
        errors.append("description必须是字符串")
    
    return errors