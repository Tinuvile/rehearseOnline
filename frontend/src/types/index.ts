// 核心数据类型定义

export interface Position2D {
  x: number;
  y: number;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  start_time: number;
  end_time: number;
  speaker_id?: string;
  confidence: number;
  emotion?: string;
}

export interface ActorPosition {
  id: string;
  actor_id: string;
  timestamp: number;
  position_2d: Position2D;
  confidence: number;
}

export interface Waypoint {
  position: Position2D;
  timestamp: number;
  action?: string;
}

export interface MovementPath {
  actor_id: string;
  waypoints: Waypoint[];
  duration: number;
}

export interface LightState {
  light_id: string;
  color: RGB;
  intensity: number;
  position?: Position3D;
}

export interface LightingCue {
  id: string;
  timestamp: number;
  lights: LightState[];
  transition_duration: number;
}

export interface MusicCue {
  id: string;
  timestamp: number;
  action: string; // "start", "stop", "fade_in", "fade_out"
  track_id?: string;
  volume: number;
  fade_duration: number;
}

export interface Actor {
  id: string;
  name: string;
  color: string;
}

export interface Video {
  id: string;
  filename: string;
  file_path: string;
  duration: number;
  fps: number;
  resolution: string;
  status: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

// API响应类型
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface VideoUploadResponse {
  message: string;
  video: Video;
}

export interface AnalysisResult {
  video: Video;
  transcripts: TranscriptSegment[];
  actor_positions: ActorPosition[];
  analysis_status: string;
}

export interface TimelineData {
  video: Video;
  transcripts: TranscriptSegment[];
  actor_positions: ActorPosition[];
  lighting_cues: LightingCue[];
  music_cues: MusicCue[];
}

// AI建议类型
export interface MovementSuggestion {
  id: string;
  timestamp: number;
  suggestion: string;
  position: Position2D;
  confidence: number;
  reason: string;
}

export interface LightingSuggestion {
  timestamp: number;
  suggestion: string;
  lighting_cue: LightingCue;
  confidence: number;
  reason: string;
}

export interface MusicSuggestion {
  timestamp: number;
  suggestion: string;
  music_cue: MusicCue;
  confidence: number;
  reason: string;
}

export interface AISuggestions {
  movement?: MovementSuggestion[];
  lighting?: LightingSuggestion[];
  music?: MusicSuggestion[];
}

// 应用状态类型
export interface AppState {
  currentProject?: Project;
  currentVideo?: Video;
  actors: Actor[];
  transcripts: TranscriptSegment[];
  actorPositions: ActorPosition[];
  lightingCues: LightingCue[];
  musicCues: MusicCue[];
  currentTime: number;
  isPlaying: boolean;
  aiSuggestions: AISuggestions;
  loading: boolean;
  error?: string;
}