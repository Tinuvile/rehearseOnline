/**
 * API服务 - 前后端通信接口
 */

const API_BASE_URL = "http://localhost:8000";

// API响应类型
interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// 视频上传响应
interface VideoUploadResponse {
  success: boolean;
  video_id: string;
  filename: string;
  total_segments: number;
  total_duration: number;
  speaker_count: number;
  transcripts: any[];
  speaker_statistics: any;
  full_text: string;
  srt_content: string;
}

// 舞台台词格式响应
interface StageDialogueResponse {
  success: boolean;
  video_id: string;
  total_dialogues: number;
  dialogues: any[];
  speaker_mapping: Record<string, string>;
  note: string;
}

/**
 * 上传视频并提取台词
 */
export const uploadVideoForDialogue = async (
  file: File,
  language: string = "zh",
  enableSpeakerDiarization: boolean = true,
  hotwords: string = ""
): Promise<VideoUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);
  formData.append(
    "enable_speaker_diarization",
    enableSpeakerDiarization.toString()
  );
  formData.append("hotwords", hotwords);

  const response = await fetch(`${API_BASE_URL}/api/dialogue/upload-video`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "网络错误" }));
    throw new Error(
      errorData.detail || errorData.error || `HTTP ${response.status}`
    );
  }

  return await response.json();
};

/**
 * 获取视频的台词信息
 */
export const getVideoDialogues = async (
  videoId: string
): Promise<ApiResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/dialogue/video/${videoId}/dialogues`
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
};

/**
 * 将视频台词转换为舞台编辑器格式
 */
export const convertVideoToStageFormat = async (
  videoId: string
): Promise<StageDialogueResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/dialogue/video/${videoId}/convert-to-stage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "转换失败" }));
    throw new Error(
      errorData.detail || errorData.error || `HTTP ${response.status}`
    );
  }

  return await response.json();
};

/**
 * 导出台词（JSON/SRT/TXT格式）
 */
export const exportVideoDialogues = async (
  videoId: string,
  format: "json" | "srt" | "txt" = "json"
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("format", format);

  const response = await fetch(
    `${API_BASE_URL}/api/dialogue/video/${videoId}/export-dialogues`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
};

/**
 * 获取支持的文件格式
 */
export const getSupportedFormats = async (): Promise<ApiResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/dialogue/supported-formats`
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
};

/**
 * 健康检查
 */
export const healthCheck = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
};

/**
 * 舞台管理API
 */
export const stageApi = {
  // 获取当前项目
  getCurrentProject: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/stage/project`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  // 获取所有演员
  getAllActors: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/stage/actors`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  // 创建演员
  createActor: async (
    name: string,
    color: string = "#FF5733"
  ): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/stage/actors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  // 更新演员位置
  updateActorPosition: async (
    actorId: string,
    position: { x: number; y: number },
    timestamp: number
  ): Promise<ApiResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/stage/actors/${actorId}/position`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          x: position.x,
          y: position.y,
          timestamp,
        }),
      }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  // 获取时间轴数据
  getTimelineData: async (videoId: string): Promise<ApiResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/stage/timeline/${videoId}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },
};

/**
 * 视频分析API
 */
export const videoApi = {
  // 上传视频进行分析
  uploadVideo: async (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/api/video/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  // 处理视频
  processVideo: async (videoId: string): Promise<ApiResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/video/${videoId}/process`,
      {
        method: "POST",
      }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  // 获取视频分析结果
  getAnalysisResult: async (videoId: string): Promise<ApiResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/video/${videoId}/analysis`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },
};

/**
 * API工具函数
 */
export const apiUtils = {
  // 格式化错误信息
  formatError: (error: any): string => {
    return handleApiError(error);
  },

  // 检查网络连接
  checkConnection: async (): Promise<boolean> => {
    return await checkBackendConnection();
  },

  // 获取基础URL
  getBaseUrl: (): string => {
    return API_BASE_URL;
  },
};

/**
 * 错误处理工具
 */
export const handleApiError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "未知错误";
};

/**
 * 检查后端连接状态
 */
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    await healthCheck();
    return true;
  } catch {
    return false;
  }
};
