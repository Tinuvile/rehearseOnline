/**
 * AI分析服务 - 前端调用后端AI API
 */

const API_BASE_URL = "http://localhost:8000";

// AI分析请求类型
interface StageAnalysisRequest {
  actors: any[];
  dialogues: any[];
  movements?: any[];
  lights?: any[];
  stage_elements?: any[];
  areas?: any[];
  analysis_type?: "full" | "quick" | "specific";
}

// AI分析响应类型
interface AIAnalysisResponse {
  success: boolean;
  analysis_type: string;
  analysis?: {
    overall_score: number;
    analysis_summary: string;
    priority_suggestions: AISuggestion[];
    detailed_analysis?: any;
    creative_enhancements?: any[];
  };
  suggestions?: AISuggestion[];
  stats?: {
    actors_count: number;
    dialogues_count: number;
    movements_count: number;
    lights_count: number;
    elements_count: number;
    areas_count: number;
  };
  error?: string;
  timestamp: string;
}

// AI建议类型
export interface AISuggestion {
  id?: string;
  type: string;
  priority: "高" | "中" | "低";
  description: string;
  specific_action?: string;
  affected_actors?: string[];
  affected_elements?: string[];
  time_range?: string;
  icon?: React.ReactNode;
}

/**
 * AI舞台分析服务类
 */
class AIService {
  /**
   * 获取快速AI建议（基于规则，响应速度快）
   */
  async getQuickSuggestions(
    stageData: StageAnalysisRequest
  ): Promise<AISuggestion[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ai-analysis/quick-suggestions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_state: stageData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error("获取快速建议失败:", error);
      return this.getFallbackSuggestions();
    }
  }

  /**
   * 获取完整AI分析（调用Kimi API，响应较慢但更智能）
   */
  async getFullAnalysis(
    stageData: StageAnalysisRequest
  ): Promise<AIAnalysisResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ai-analysis/analyze-stage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...stageData,
            analysis_type: "full",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: AIAnalysisResponse = await response.json();
      return data;
    } catch (error) {
      console.error("完整AI分析失败:", error);
      return {
        success: false,
        analysis_type: "full",
        error: error instanceof Error ? error.message : "分析失败",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 分析特定方面
   */
  async analyzeSpecificAspect(
    aspect: "path_conflict" | "lighting" | "rhythm" | "spacing",
    stageData: StageAnalysisRequest
  ): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ai-analysis/analyze-specific?aspect=${aspect}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stageData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`${aspect}分析失败:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "分析失败",
      };
    }
  }

  /**
   * 检查AI服务健康状态
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-analysis/health`);
      const data = await response.json();
      return data.status === "healthy";
    } catch (error) {
      console.error("AI服务健康检查失败:", error);
      return false;
    }
  }

  /**
   * 构建舞台数据（从组件状态转换为API请求格式）
   */
  buildStageData(
    actors: any[],
    dialogues: any[],
    movements: any[] = [],
    lights: any[] = [],
    stageElements: any[] = [],
    areas: any[] = []
  ): StageAnalysisRequest {
    return {
      actors: actors.map((actor) => ({
        id: actor.id,
        name: actor.name,
        x: actor.x,
        y: actor.y,
        color: actor.color,
        role: actor.role,
        speed: actor.speed,
      })),
      dialogues: dialogues.map((dialogue) => ({
        id: dialogue.id,
        actorId: dialogue.actorId,
        content: dialogue.content,
        startTime: dialogue.startTime,
        duration: dialogue.duration,
        emotion: dialogue.emotion,
        volume: dialogue.volume,
      })),
      movements: movements.map((movement) => ({
        id: movement.id,
        actorId: movement.actorId,
        name: movement.name,
        startTime: movement.startTime,
        duration: movement.duration,
        path: movement.path,
        speed: movement.speed,
        pathType: movement.pathType,
      })),
      lights: lights.map((light) => ({
        id: light.id,
        name: light.name,
        x: light.x,
        y: light.y,
        type: light.type,
        color: light.color,
        intensity: light.intensity,
        beamAngle: light.beamAngle,
        startTime: light.startTime,
        duration: light.duration,
      })),
      stage_elements: stageElements.map((element) => ({
        id: element.id,
        type: element.type,
        name: element.name,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
      })),
      areas: areas.map((area) => ({
        id: area.id,
        name: area.name,
        type: area.type,
        points: area.points,
        color: area.color,
        opacity: area.opacity,
      })),
    };
  }

  /**
   * 获取备用建议（当AI服务不可用时）
   */
  private getFallbackSuggestions(): AISuggestion[] {
    return [
      {
        type: "系统提示",
        priority: "中",
        description: "AI分析服务暂时不可用，正在使用基础建议系统",
        specific_action: "请检查网络连接或稍后重试",
      },
      {
        type: "基础检查",
        priority: "低",
        description: "建议检查演员位置分布是否均匀",
        specific_action: "确保演员之间保持适当距离，避免过度聚集",
      },
      {
        type: "表演提示",
        priority: "低",
        description: "注意台词时长和表演节奏的协调",
        specific_action: "检查台词分配是否均衡，避免单个演员台词过长",
      },
    ];
  }

  /**
   * 为建议添加图标
   */
  addIconsToSuggestions(suggestions: AISuggestion[]): AISuggestion[] {
    return suggestions.map((suggestion) => ({
      ...suggestion,
      icon: this.getIconForSuggestionType(suggestion.type),
    }));
  }

  /**
   * 根据建议类型获取图标
   */
  getIconForSuggestionType(type: string): string {
    const iconMap: { [key: string]: string } = {
      路径优化: "🚶‍♂️",
      灯光优化: "💡",
      表演节奏: "🎵",
      位置调整: "📍",
      台词节奏: "💬",
      灯光设计: "🔆",
      空间创意: "🎭",
      互动创意: "🤝",
      AI分析: "🤖",
      系统提示: "⚠️",
      基础检查: "✅",
      表演提示: "🎪",
    };

    return iconMap[type] || "💡";
  }

  /**
   * 格式化建议优先级颜色
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case "高":
        return "#ff4d4f";
      case "中":
        return "#faad14";
      case "低":
        return "#52c41a";
      default:
        return "#d9d9d9";
    }
  }

  /**
   * 格式化时间范围显示
   */
  formatTimeRange(timeRange: string): string {
    if (!timeRange) return "";

    // 将秒数格式转换为分:秒格式
    const parts = timeRange.split("-");
    if (parts.length === 2) {
      const start = parseFloat(parts[0]);
      const end = parseFloat(parts[1]);

      const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`;
      };

      return `${formatTime(start)}-${formatTime(end)}`;
    }

    return timeRange;
  }
}

// 全局AI服务实例
export const aiService = new AIService();

// 导出类型
export type { StageAnalysisRequest, AIAnalysisResponse };
