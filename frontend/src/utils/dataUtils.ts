/**
 * 数据处理工具函数
 */

import { 
  Position2D, 
  RGB, 
  TranscriptSegment, 
  ActorPosition, 
  LightingCue, 
  MusicCue,
  Actor,
  Video,
  Project
} from '../types';

// 颜色工具函数
export const rgbToHex = (rgb: RGB): string => {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
};

export const hexToRgb = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const isValidHexColor = (hex: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(hex);
};

// 时间工具函数
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimeWithMilliseconds = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
};

export const parseTimeString = (timeStr: string): number => {
  const parts = timeStr.split(':');
  if (parts.length !== 2) return 0;
  
  const mins = parseInt(parts[0], 10) || 0;
  const secs = parseFloat(parts[1]) || 0;
  
  return mins * 60 + secs;
};

// 位置工具函数
export const calculateDistance = (pos1: Position2D, pos2: Position2D): number => {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const interpolatePosition = (pos1: Position2D, pos2: Position2D, t: number): Position2D => {
  return {
    x: pos1.x + (pos2.x - pos1.x) * t,
    y: pos1.y + (pos2.y - pos1.y) * t
  };
};

export const isPositionInBounds = (position: Position2D, bounds: { width: number; height: number }): boolean => {
  return position.x >= 0 && position.x <= bounds.width && 
         position.y >= 0 && position.y <= bounds.height;
};

// 数据查找工具函数
export const findTranscriptAtTime = (transcripts: TranscriptSegment[], time: number): TranscriptSegment | null => {
  return transcripts.find(t => time >= t.start_time && time <= t.end_time) || null;
};

export const findActorPositionAtTime = (positions: ActorPosition[], actorId: string, time: number, tolerance: number = 0.5): ActorPosition | null => {
  return positions.find(p => 
    p.actor_id === actorId && Math.abs(p.timestamp - time) <= tolerance
  ) || null;
};

export const findLightingCueAtTime = (cues: LightingCue[], time: number, tolerance: number = 1.0): LightingCue | null => {
  return cues.find(c => Math.abs(c.timestamp - time) <= tolerance) || null;
};

export const findMusicCueAtTime = (cues: MusicCue[], time: number, tolerance: number = 1.0): MusicCue | null => {
  return cues.find(c => Math.abs(c.timestamp - time) <= tolerance) || null;
};

// 数据排序工具函数
export const sortTranscriptsByTime = (transcripts: TranscriptSegment[]): TranscriptSegment[] => {
  return [...transcripts].sort((a, b) => a.start_time - b.start_time);
};

export const sortPositionsByTime = (positions: ActorPosition[]): ActorPosition[] => {
  return [...positions].sort((a, b) => a.timestamp - b.timestamp);
};

export const sortLightingCuesByTime = (cues: LightingCue[]): LightingCue[] => {
  return [...cues].sort((a, b) => a.timestamp - b.timestamp);
};

export const sortMusicCuesByTime = (cues: MusicCue[]): MusicCue[] => {
  return [...cues].sort((a, b) => a.timestamp - b.timestamp);
};

// 数据过滤工具函数
export const filterPositionsByActor = (positions: ActorPosition[], actorId: string): ActorPosition[] => {
  return positions.filter(p => p.actor_id === actorId);
};

export const filterTranscriptsByActor = (transcripts: TranscriptSegment[], actorId: string): TranscriptSegment[] => {
  return transcripts.filter(t => t.speaker_id === actorId);
};

export const filterTranscriptsByEmotion = (transcripts: TranscriptSegment[], emotion: string): TranscriptSegment[] => {
  return transcripts.filter(t => t.emotion === emotion);
};

export const filterCuesByTimeRange = <T extends { timestamp: number }>(cues: T[], startTime: number, endTime: number): T[] => {
  return cues.filter(c => c.timestamp >= startTime && c.timestamp <= endTime);
};

// 数据统计工具函数
export const getEmotionStats = (transcripts: TranscriptSegment[]): Record<string, number> => {
  const stats: Record<string, number> = {};
  
  transcripts.forEach(t => {
    if (t.emotion) {
      stats[t.emotion] = (stats[t.emotion] || 0) + 1;
    }
  });
  
  return stats;
};

export const getActorSpeakingTime = (transcripts: TranscriptSegment[], actorId: string): number => {
  return transcripts
    .filter(t => t.speaker_id === actorId)
    .reduce((total, t) => total + (t.end_time - t.start_time), 0);
};

export const getAverageConfidence = (items: { confidence: number }[]): number => {
  if (items.length === 0) return 0;
  
  const total = items.reduce((sum, item) => sum + item.confidence, 0);
  return total / items.length;
};

// 数据验证工具函数
export const validatePosition2D = (position: any): position is Position2D => {
  return typeof position === 'object' && 
         position !== null &&
         typeof position.x === 'number' && 
         typeof position.y === 'number';
};

export const validateRGB = (color: any): color is RGB => {
  return typeof color === 'object' && 
         color !== null &&
         typeof color.r === 'number' && color.r >= 0 && color.r <= 255 &&
         typeof color.g === 'number' && color.g >= 0 && color.g <= 255 &&
         typeof color.b === 'number' && color.b >= 0 && color.b <= 255;
};

export const validateTimestamp = (timestamp: any): boolean => {
  return typeof timestamp === 'number' && timestamp >= 0;
};

export const validateConfidence = (confidence: any): boolean => {
  return typeof confidence === 'number' && confidence >= 0 && confidence <= 1;
};

// 数据生成工具函数
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const generateRandomColor = (): string => {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33',
    '#33FFF5', '#F533FF', '#57FF33', '#FF3357', '#5733FF'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 数据转换工具函数
export const createEmptyProject = (name: string): Omit<Project, 'id' | 'created_at'> => {
  return {
    name,
    description: ''
  };
};

export const createEmptyActor = (name: string, color?: string): Omit<Actor, 'id'> => {
  return {
    name,
    color: color || generateRandomColor()
  };
};

// 数据导出工具函数
export const exportToJSON = (data: any, filename: string): void => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// 数据导入工具函数
export const importFromJSON = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('无效的JSON文件'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    reader.readAsText(file);
  });
};