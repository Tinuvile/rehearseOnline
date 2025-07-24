import axios from 'axios';
import { 
  VideoUploadResponse, 
  AnalysisResult, 
  TimelineData, 
  Actor, 
  Project,
  MovementSuggestion,
  LightingSuggestion,
  MusicSuggestion
} from '../types';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// 视频相关API
export const videoApi = {
  // 上传视频
  uploadVideo: async (file: File): Promise<VideoUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/video/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // 获取视频信息
  getVideoInfo: async (videoId: string) => {
    const response = await api.get(`/video/${videoId}/info`);
    return response.data;
  },

  // 获取分析结果
  getAnalysisResult: async (videoId: string): Promise<AnalysisResult> => {
    const response = await api.get(`/video/${videoId}/analysis`);
    return response.data;
  },

  // 处理视频
  processVideo: async (videoId: string) => {
    const response = await api.post(`/video/${videoId}/process`);
    return response.data;
  },

  // 获取视频列表
  getVideoList: async () => {
    const response = await api.get('/video/');
    return response.data;
  },
};

// 舞台管理相关API
export const stageApi = {
  // 获取当前项目
  getCurrentProject: async (): Promise<{ project: Project }> => {
    const response = await api.get('/stage/project');
    return response.data;
  },

  // 获取项目数据
  getProjectData: async (projectId: string) => {
    const response = await api.get(`/stage/project/${projectId}`);
    return response.data;
  },

  // 获取所有演员
  getAllActors: async (): Promise<{ actors: Actor[]; count: number }> => {
    const response = await api.get('/stage/actors');
    return response.data;
  },

  // 创建演员
  createActor: async (name: string, color: string = '#FF5733'): Promise<{ actor: Actor }> => {
    const response = await api.post('/stage/actors', { name, color });
    return response.data;
  },

  // 获取演员信息
  getActor: async (actorId: string): Promise<{ actor: Actor }> => {
    const response = await api.get(`/stage/actors/${actorId}`);
    return response.data;
  },

  // 更新演员位置
  updateActorPosition: async (
    actorId: string, 
    position: { x: number; y: number }, 
    timestamp: number, 
    videoId: string
  ) => {
    const response = await api.put(
      `/stage/actors/${actorId}/position?timestamp=${timestamp}&video_id=${videoId}`,
      position
    );
    return response.data;
  },

  // 获取时间轴数据
  getTimelineData: async (videoId: string): Promise<TimelineData> => {
    const response = await api.get(`/stage/timeline/${videoId}`);
    return response.data;
  },
};

// AI建议相关API
export const aiApi = {
  // 获取走位建议
  getMovementSuggestions: async (videoId: string, actorId: string): Promise<{
    suggestions: MovementSuggestion[];
    video_id: string;
    actor_id: string;
  }> => {
    const response = await api.post('/ai/movement-suggestions', {
      video_id: videoId,
      actor_id: actorId,
    });
    return response.data;
  },

  // 获取灯光建议
  getLightingSuggestions: async (videoId: string): Promise<{
    suggestions: LightingSuggestion[];
    video_id: string;
  }> => {
    const response = await api.post('/ai/lighting-suggestions', {
      video_id: videoId,
    });
    return response.data;
  },

  // 获取音乐建议
  getMusicSuggestions: async (videoId: string): Promise<{
    suggestions: MusicSuggestion[];
    video_id: string;
  }> => {
    const response = await api.post('/ai/music-suggestions', {
      video_id: videoId,
    });
    return response.data;
  },

  // 应用建议
  applySuggestion: async (suggestionType: 'lighting' | 'music', suggestionData: any) => {
    const response = await api.post(`/ai/apply-suggestion?suggestion_type=${suggestionType}`, suggestionData);
    return response.data;
  },

  // 获取情感分析
  getEmotionAnalysis: async (videoId: string) => {
    const response = await api.get(`/ai/emotions/${videoId}`);
    return response.data;
  },
};

// 通用API工具
export const apiUtils = {
  // 健康检查
  healthCheck: async () => {
    const response = await api.get('/health', { baseURL: '' });
    return response.data;
  },

  // 获取系统信息
  getSystemInfo: async () => {
    const response = await api.get('/', { baseURL: '' });
    return response.data;
  },
};

export default api;