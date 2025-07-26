"""
内存数据存储管理器
"""

import json
import os
import logging
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime

from backend.models.data_models import (
    Project, Video, Actor, TranscriptSegment, ActorPosition,
    LightingCue, MusicCue, dataclass_to_dict, dict_to_dataclass
)
from backend.models.validators import (
    validate_project, validate_video, validate_actor,
    validate_transcript_segment, validate_actor_position,
    validate_lighting_cue, validate_music_cue
)

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InMemoryDataStore:
    """内存数据存储管理器，支持JSON文件持久化"""
    
    def __init__(self):
        self.projects: Dict[str, Project] = {}
        self.videos: Dict[str, Video] = {}
        self.actors: Dict[str, Actor] = {}
        self.transcripts: Dict[str, List[TranscriptSegment]] = {}  # video_id -> transcripts
        self.actor_positions: Dict[str, List[ActorPosition]] = {}  # video_id -> positions
        self.lighting_cues: Dict[str, List[LightingCue]] = {}  # project_id -> cues
        self.music_cues: Dict[str, List[MusicCue]] = {}  # project_id -> cues
        
        # 当前活动项目
        self.current_project_id: Optional[str] = None
    
    def generate_video_id(self) -> str:
        """生成唯一的视频ID"""
        return str(uuid.uuid4())
    
    def save_video_data(self, video_id: str, video_data: Dict[str, Any]) -> None:
        """保存视频数据和转录信息"""
        # 创建Video对象
        video = Video(
            id=video_id,
            filename=video_data.get("filename", "unknown"),
            file_path=video_data.get("file_path", ""),
            created_at=datetime.now().isoformat()
        )
        self.videos[video_id] = video
        
        # 保存转录片段
        if "transcripts" in video_data:
            transcripts = []
            for segment_data in video_data["transcripts"]:
                segment = TranscriptSegment(**segment_data)
                transcripts.append(segment)
            self.transcripts[video_id] = transcripts
    
    def get_video_data(self, video_id: str) -> Optional[Dict[str, Any]]:
        """获取视频数据和转录信息"""
        video = self.videos.get(video_id)
        if not video:
            return None
            
        # 组装视频数据
        video_data = {
            "id": video.id,
            "filename": video.filename,
            "file_path": video.file_path,
            "duration": video.duration,
            "fps": video.fps,
            "resolution": video.resolution,
            "status": video.status,
            "created_at": video.created_at,
            "transcripts": []
        }
        
        # 添加转录数据
        transcripts = self.transcripts.get(video_id, [])
        video_data["transcripts"] = [
            {
                "id": t.id,
                "text": t.text, 
                "start_time": t.start_time,
                "end_time": t.end_time,
                "speaker_id": t.speaker_id,
                "confidence": t.confidence,
                "emotion": t.emotion
            } for t in transcripts
        ]
        
        return video_data
    
    def create_project(self, name: str, description: str = "") -> Project:
        """创建新项目"""
        project = Project.create(name, description)
        self.projects[project.id] = project
        self.current_project_id = project.id
        return project
    
    def get_project(self, project_id: str) -> Optional[Project]:
        """获取项目"""
        return self.projects.get(project_id)
    
    def get_current_project(self) -> Optional[Project]:
        """获取当前活动项目"""
        if self.current_project_id:
            return self.projects.get(self.current_project_id)
        return None
    
    def add_video(self, filename: str, file_path: str) -> Video:
        """添加视频"""
        video = Video.create(filename, file_path)
        self.videos[video.id] = video
        return video
    
    def get_video(self, video_id: str) -> Optional[Video]:
        """获取视频"""
        return self.videos.get(video_id)
    
    def update_video_status(self, video_id: str, status: str, duration: float = 0, fps: int = 30):
        """更新视频状态"""
        if video_id in self.videos:
            self.videos[video_id].status = status
            if duration > 0:
                self.videos[video_id].duration = duration
            if fps > 0:
                self.videos[video_id].fps = fps
    
    def add_actor(self, name: str, color: str = "#FF5733") -> Actor:
        """添加演员"""
        actor = Actor.create(name, color)
        self.actors[actor.id] = actor
        return actor
    
    def get_actor(self, actor_id: str) -> Optional[Actor]:
        """获取演员"""
        return self.actors.get(actor_id)
    
    def get_all_actors(self) -> List[Actor]:
        """获取所有演员"""
        return list(self.actors.values())
    
    def add_transcripts(self, video_id: str, transcripts: List[TranscriptSegment]):
        """添加转录文本"""
        self.transcripts[video_id] = transcripts
    
    def get_transcripts(self, video_id: str) -> List[TranscriptSegment]:
        """获取转录文本"""
        return self.transcripts.get(video_id, [])
    
    def add_actor_positions(self, video_id: str, positions: List[ActorPosition]):
        """添加演员位置数据"""
        self.actor_positions[video_id] = positions
    
    def get_actor_positions(self, video_id: str) -> List[ActorPosition]:
        """获取演员位置数据"""
        return self.actor_positions.get(video_id, [])
    
    def add_lighting_cue(self, project_id: str, cue: LightingCue):
        """添加灯光提示"""
        if project_id not in self.lighting_cues:
            self.lighting_cues[project_id] = []
        self.lighting_cues[project_id].append(cue)
    
    def get_lighting_cues(self, project_id: str) -> List[LightingCue]:
        """获取灯光提示"""
        return self.lighting_cues.get(project_id, [])
    
    def add_music_cue(self, project_id: str, cue: MusicCue):
        """添加音乐提示"""
        if project_id not in self.music_cues:
            self.music_cues[project_id] = []
        self.music_cues[project_id].append(cue)
    
    def get_music_cues(self, project_id: str) -> List[MusicCue]:
        """获取音乐提示"""
        return self.music_cues.get(project_id, [])
    
    def get_project_data(self, project_id: str) -> Dict[str, Any]:
        """获取项目的所有相关数据"""
        project = self.get_project(project_id)
        if not project:
            return {}
        
        # 获取项目相关的所有视频
        project_videos = [video for video in self.videos.values()]
        
        data = {
            "project": dataclass_to_dict(project),
            "videos": [dataclass_to_dict(video) for video in project_videos],
            "actors": [dataclass_to_dict(actor) for actor in self.actors.values()],
            "transcripts": {},
            "actor_positions": {},
            "lighting_cues": [dataclass_to_dict(cue) for cue in self.get_lighting_cues(project_id)],
            "music_cues": [dataclass_to_dict(cue) for cue in self.get_music_cues(project_id)]
        }
        
        # 添加每个视频的转录和位置数据
        for video in project_videos:
            data["transcripts"][video.id] = [
                dataclass_to_dict(t) for t in self.get_transcripts(video.id)
            ]
            data["actor_positions"][video.id] = [
                dataclass_to_dict(p) for p in self.get_actor_positions(video.id)
            ]
        
        return data
    
    def save_to_json(self, file_path: str):
        """将内存数据保存到JSON文件"""
        data = {
            "projects": {pid: dataclass_to_dict(project) for pid, project in self.projects.items()},
            "videos": {vid: dataclass_to_dict(video) for vid, video in self.videos.items()},
            "actors": {aid: dataclass_to_dict(actor) for aid, actor in self.actors.items()},
            "transcripts": {
                vid: [dataclass_to_dict(t) for t in transcripts] 
                for vid, transcripts in self.transcripts.items()
            },
            "actor_positions": {
                vid: [dataclass_to_dict(p) for p in positions] 
                for vid, positions in self.actor_positions.items()
            },
            "lighting_cues": {
                pid: [dataclass_to_dict(c) for c in cues] 
                for pid, cues in self.lighting_cues.items()
            },
            "music_cues": {
                pid: [dataclass_to_dict(c) for c in cues] 
                for pid, cues in self.music_cues.items()
            },
            "current_project_id": self.current_project_id,
            "saved_at": datetime.now().isoformat()
        }
        
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def load_from_json(self, file_path: str):
        """从JSON文件加载数据到内存"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"数据文件不存在: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 加载项目
        self.projects = {
            pid: dict_to_dataclass(Project, project_data) 
            for pid, project_data in data.get("projects", {}).items()
        }
        
        # 加载视频
        self.videos = {
            vid: dict_to_dataclass(Video, video_data) 
            for vid, video_data in data.get("videos", {}).items()
        }
        
        # 加载演员
        self.actors = {
            aid: dict_to_dataclass(Actor, actor_data) 
            for aid, actor_data in data.get("actors", {}).items()
        }
        
        # 加载转录文本
        self.transcripts = {
            vid: [dict_to_dataclass(TranscriptSegment, t) for t in transcripts] 
            for vid, transcripts in data.get("transcripts", {}).items()
        }
        
        # 加载演员位置
        self.actor_positions = {
            vid: [dict_to_dataclass(ActorPosition, p) for p in positions] 
            for vid, positions in data.get("actor_positions", {}).items()
        }
        
        # 加载灯光提示
        self.lighting_cues = {
            pid: [dict_to_dataclass(LightingCue, c) for c in cues] 
            for pid, cues in data.get("lighting_cues", {}).items()
        }
        
        # 加载音乐提示
        self.music_cues = {
            pid: [dict_to_dataclass(MusicCue, c) for c in cues] 
            for pid, cues in data.get("music_cues", {}).items()
        }
        
        # 设置当前项目
        self.current_project_id = data.get("current_project_id")
    
    def clear_all(self):
        """清空所有数据"""
        logger.info("清空所有数据")
        self.projects.clear()
        self.videos.clear()
        self.actors.clear()
        self.transcripts.clear()
        self.actor_positions.clear()
        self.lighting_cues.clear()
        self.music_cues.clear()
        self.current_project_id = None
    
    def get_data_statistics(self) -> Dict[str, Any]:
        """获取数据统计信息"""
        return {
            "projects_count": len(self.projects),
            "videos_count": len(self.videos),
            "actors_count": len(self.actors),
            "transcripts_count": sum(len(transcripts) for transcripts in self.transcripts.values()),
            "positions_count": sum(len(positions) for positions in self.actor_positions.values()),
            "lighting_cues_count": sum(len(cues) for cues in self.lighting_cues.values()),
            "music_cues_count": sum(len(cues) for cues in self.music_cues.values()),
            "current_project_id": self.current_project_id,
            "memory_usage_mb": self._estimate_memory_usage()
        }
    
    def _estimate_memory_usage(self) -> float:
        """估算内存使用量（MB）"""
        import sys
        
        total_size = 0
        total_size += sys.getsizeof(self.projects)
        total_size += sys.getsizeof(self.videos)
        total_size += sys.getsizeof(self.actors)
        total_size += sys.getsizeof(self.transcripts)
        total_size += sys.getsizeof(self.actor_positions)
        total_size += sys.getsizeof(self.lighting_cues)
        total_size += sys.getsizeof(self.music_cues)
        
        return total_size / (1024 * 1024)  # 转换为MB
    
    def validate_data_integrity(self) -> List[str]:
        """验证数据完整性"""
        errors = []
        
        # 检查项目引用
        if self.current_project_id and self.current_project_id not in self.projects:
            errors.append(f"当前项目ID {self.current_project_id} 不存在")
        
        # 检查演员位置中的演员引用
        for video_id, positions in self.actor_positions.items():
            if video_id not in self.videos:
                errors.append(f"位置数据引用的视频ID {video_id} 不存在")
            
            for position in positions:
                if position.actor_id not in self.actors:
                    errors.append(f"位置数据引用的演员ID {position.actor_id} 不存在")
        
        # 检查转录中的演员引用
        for video_id, transcripts in self.transcripts.items():
            if video_id not in self.videos:
                errors.append(f"转录数据引用的视频ID {video_id} 不存在")
            
            for transcript in transcripts:
                if transcript.speaker_id and transcript.speaker_id not in self.actors:
                    errors.append(f"转录数据引用的演员ID {transcript.speaker_id} 不存在")
        
        # 检查灯光提示中的项目引用
        for project_id in self.lighting_cues.keys():
            if project_id not in self.projects:
                errors.append(f"灯光提示引用的项目ID {project_id} 不存在")
        
        # 检查音乐提示中的项目引用
        for project_id in self.music_cues.keys():
            if project_id not in self.projects:
                errors.append(f"音乐提示引用的项目ID {project_id} 不存在")
        
        return errors
    
    def cleanup_orphaned_data(self):
        """清理孤立数据"""
        logger.info("开始清理孤立数据")
        
        # 清理引用不存在视频的数据
        orphaned_video_ids = []
        for video_id in list(self.transcripts.keys()):
            if video_id not in self.videos:
                orphaned_video_ids.append(video_id)
                del self.transcripts[video_id]
        
        for video_id in list(self.actor_positions.keys()):
            if video_id not in self.videos:
                if video_id not in orphaned_video_ids:
                    orphaned_video_ids.append(video_id)
                del self.actor_positions[video_id]
        
        # 清理引用不存在项目的数据
        orphaned_project_ids = []
        for project_id in list(self.lighting_cues.keys()):
            if project_id not in self.projects:
                orphaned_project_ids.append(project_id)
                del self.lighting_cues[project_id]
        
        for project_id in list(self.music_cues.keys()):
            if project_id not in self.projects:
                if project_id not in orphaned_project_ids:
                    orphaned_project_ids.append(project_id)
                del self.music_cues[project_id]
        
        # 重置当前项目ID如果项目不存在
        if self.current_project_id and self.current_project_id not in self.projects:
            logger.warning(f"当前项目ID {self.current_project_id} 不存在，重置为None")
            self.current_project_id = None
        
        if orphaned_video_ids or orphaned_project_ids:
            logger.info(f"清理完成: 孤立视频数据 {len(orphaned_video_ids)} 个, 孤立项目数据 {len(orphaned_project_ids)} 个")
    
    def backup_data(self, backup_path: str):
        """备份数据到指定路径"""
        try:
            # 创建备份目录
            os.makedirs(os.path.dirname(backup_path), exist_ok=True)
            
            # 添加时间戳到备份文件名
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = backup_path.replace('.json', f'_backup_{timestamp}.json')
            
            self.save_to_json(backup_file)
            logger.info(f"数据备份成功: {backup_file}")
            return backup_file
            
        except Exception as e:
            logger.error(f"数据备份失败: {e}")
            raise
    
    def restore_from_backup(self, backup_path: str):
        """从备份文件恢复数据"""
        try:
            self.load_from_json(backup_path)
            logger.info(f"数据恢复成功: {backup_path}")
            
        except Exception as e:
            logger.error(f"数据恢复失败: {e}")
            raise