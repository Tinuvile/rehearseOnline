import React, { useState, useCallback, useEffect } from "react";
import {
  Layout,
  Card,
  Button,
  Input,
  Row,
  Col,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  ColorPicker,
  Switch,
  Slider,
  Tooltip,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  UserAddOutlined,
  UserDeleteOutlined,
  AppstoreOutlined,
  BlockOutlined,
  BulbOutlined,
  SoundOutlined,
  CommentOutlined,
  ShareAltOutlined,
  PlusOutlined,
  MinusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  KeyOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  StopOutlined,
} from "@ant-design/icons";
import StageHeader from "../components/Layout/StageHeader";
import DialoguePanel from "../components/DialoguePanel/DialoguePanel";
import {
  samplePreviewData,
  getActorPositionAtTime,
  getDialoguesAtTime,
  type SampleDialogue,
  type SampleActorPosition,
} from "../data/sampleData";
import {
  aiService,
  type AISuggestion,
  type AIAnalysisResponse,
} from "../services/aiService";
import { stageApi } from "../services/api";

const { Sider, Content } = Layout;

interface Actor {
  id: number;
  name: string;
  x: number;
  y: number;
  color: string;
  role?: string;
  speed?: number;
}

interface StageElement {
  id: string;
  type: "prop" | "scenery";
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  icon: string;
}

interface PathPoint {
  x: number;
  y: number;
  time: number;
}

interface ActorPath {
  actorId: number;
  points: PathPoint[];
}

interface Movement {
  id: string;
  actorId: number;
  name: string;
  startTime: number;
  duration: number;
  path: PathPoint[];
  speed: number;
  pathType: "linear" | "curved" | "bezier";
}

interface Area {
  id: string;
  name: string;
  type: "performance" | "stage" | "backstage" | "audience";
  points: { x: number; y: number }[];
  color: string;
  opacity: number;
}

interface HistoryState {
  actors: Actor[];
  stageElements: StageElement[];
  lights: Light[];
  musicTracks: MusicTrack[];
  dialogues: Dialogue[];
  movements: Movement[];
  areas: Area[];
}

interface HistoryAction {
  id: string;
  type: string;
  description: string;
  timestamp: number;
  state: HistoryState;
}

interface Light {
  id: string;
  name: string;
  x: number;
  y: number;
  direction: number; // 角度 0-360
  type: "spot" | "flood" | "wash" | "follow";
  color: string;
  intensity: number; // 0-100
  beamAngle: number; // 光束角度
  startTime: number; // 开始时间（秒）
  duration: number; // 持续时间（秒）
}

interface MusicTrack {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  file?: string;
}

interface Dialogue {
  id: string;
  actorId: number;
  content: string;
  startTime: number;
  duration: number;
  emotion?: string;
  volume?: number;
}

interface TimelineSegment {
  id: string;
  label: string;
  start: number;
  width: number;
  color: string;
  type?: "dialogue" | "music" | "light" | "movement";
  data?: any;
}

interface TimelineTrack {
  id: string;
  name: string;
  segments: TimelineSegment[];
}

const StageEditor: React.FC = () => {
  const navigate = useNavigate();
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [currentTime, setCurrentTime] = useState("00:01:24");
  const [totalTime] = useState("00:05:30");
  const [isPlaying, setIsPlaying] = useState(false);
  const [actors, setActors] = useState<Actor[]>([]);
  const [stageElements, setStageElements] = useState<StageElement[]>([]);
  const [actorPaths, setActorPaths] = useState<ActorPath[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [isDraggingLight, setIsDraggingLight] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState<StageElement | null>(
    null
  );

  // 预览模式相关状态
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0); // 预览时间（秒）
  const [previewPlayInterval, setPreviewPlayInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [previewActorPositions, setPreviewActorPositions] = useState<{
    [actorId: number]: { x: number; y: number };
  }>({});
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 播放速度倍率
  const [dynamicActorPositions, setDynamicActorPositions] = useState<
    SampleActorPosition[]
  >([]); // 动态添加的位置点

  // 模态框状态
  const [addActorModalVisible, setAddActorModalVisible] = useState(false);
  const [addElementModalVisible, setAddElementModalVisible] = useState(false);
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [currentPath, setCurrentPath] = useState<PathPoint[]>([]);

  // 新增功能状态
  const [lights, setLights] = useState<Light[]>([]);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedLight, setSelectedLight] = useState<Light | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack | null>(null);
  const [selectedDialogue, setSelectedDialogue] = useState<Dialogue | null>(
    null
  );
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(
    null
  );
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  // 撤销/重做系统
  const [history, setHistory] = useState<HistoryAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoOperation, setIsUndoRedoOperation] = useState(false);

  // 绘制状态
  const [isDrawingArea, setIsDrawingArea] = useState(false);
  const [currentAreaPoints, setCurrentAreaPoints] = useState<
    { x: number; y: number }[]
  >([]);

  // AI分析相关状态
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] =
    useState<AIAnalysisResponse | null>(null);
  const [isAIHealthy, setIsAIHealthy] = useState(true);
  const [lastAIUpdate, setLastAIUpdate] = useState<number>(0);

  // 模态框状态
  const [lightModalVisible, setLightModalVisible] = useState(false);
  const [musicModalVisible, setMusicModalVisible] = useState(false);
  const [dialogueModalVisible, setDialogueModalVisible] = useState(false);
  const [movementModalVisible, setMovementModalVisible] = useState(false);
  const [areaModalVisible, setAreaModalVisible] = useState(false);

  // 表单
  const [actorForm] = Form.useForm();
  const [elementForm] = Form.useForm();
  const [lightForm] = Form.useForm();
  const [musicForm] = Form.useForm();
  const [dialogueForm] = Form.useForm();
  const [movementForm] = Form.useForm();
  const [areaForm] = Form.useForm();

  // 初始化数据
  React.useEffect(() => {
    if (actors.length === 0) {
      setActors([
        {
          id: 1,
          name: "主角",
          x: 200,
          y: 120,
          color: "#a8c090",
          role: "主演",
          speed: 1.2,
        },
        {
          id: 2,
          name: "配角A",
          x: 350,
          y: 200,
          color: "#81a1c1",
          role: "配演",
          speed: 1.0,
        },
        {
          id: 3,
          name: "配角B",
          x: 150,
          y: 250,
          color: "#e6b17a",
          role: "配演",
          speed: 0.8,
        },
      ]);

      setStageElements([
        {
          id: "chair1",
          type: "prop",
          name: "椅子",
          x: 400,
          y: 300,
          width: 40,
          height: 40,
          icon: "🪑",
        },
        {
          id: "table1",
          type: "prop",
          name: "桌子",
          x: 300,
          y: 150,
          width: 60,
          height: 40,
          icon: "🪑",
        },
      ]);

      // 尝试从localStorage加载提取的台词数据
      let loadedDialogues: Dialogue[] = [];

      try {
        const extractedDialogues = localStorage.getItem("extractedDialogues");
        const videoAnalysisResult = localStorage.getItem("videoAnalysisResult");

        if (extractedDialogues) {
          const parsedDialogues = JSON.parse(extractedDialogues);
          loadedDialogues = parsedDialogues;

          if (videoAnalysisResult) {
            const analysisData = JSON.parse(videoAnalysisResult);
            message.success(
              `已加载从视频"${analysisData.filename}"中提取的 ${parsedDialogues.length} 条台词`
            );
          }

          // 清除localStorage中的数据，避免重复使用
          localStorage.removeItem("extractedDialogues");
          localStorage.removeItem("videoAnalysisResult");
        }
      } catch (error) {
        console.error("加载提取的台词数据失败:", error);
      }

      // 如果没有从视频提取的台词，使用样例数据
      if (loadedDialogues.length === 0) {
        loadedDialogues = samplePreviewData.dialogues.map((dialogue) => ({
          id: dialogue.id,
          actorId: dialogue.actorId,
          content: dialogue.content,
          startTime: dialogue.startTime,
          duration: dialogue.duration,
          emotion: dialogue.emotion,
          volume: dialogue.volume,
        }));
      }

      setDialogues(loadedDialogues);
    }
  }, [actors.length]);

  // AI相关函数
  const checkAIHealth = useCallback(async () => {
    try {
      const healthy = await aiService.checkHealth();
      setIsAIHealthy(healthy);
      return healthy;
    } catch (error) {
      console.error("AI健康检查失败:", error);
      setIsAIHealthy(false);
      return false;
    }
  }, []);

  const updateAISuggestions = useCallback(
    async (forceFullAnalysis = false) => {
      // 避免频繁调用，限制更新频率（最多每5秒一次）
      const now = Date.now();
      if (!forceFullAnalysis && now - lastAIUpdate < 5000) {
        return;
      }

      try {
        setIsLoadingAI(true);
        setLastAIUpdate(now);

        // 构建舞台数据
        const stageData = aiService.buildStageData(
          actors,
          dialogues,
          movements,
          lights,
          stageElements,
          areas
        );

        if (forceFullAnalysis) {
          // 完整AI分析（调用Kimi API）
          const analysisResult = await aiService.getFullAnalysis(stageData);
          setAiAnalysisResult(analysisResult);

          if (
            analysisResult.success &&
            analysisResult.analysis?.priority_suggestions
          ) {
            const enhancedSuggestions = aiService.addIconsToSuggestions(
              analysisResult.analysis.priority_suggestions
            );
            setAiSuggestions(enhancedSuggestions);
            message.success(
              `AI分析完成！获得${enhancedSuggestions.length}条优化建议`
            );
          } else if (analysisResult.error) {
            message.error(`AI分析失败: ${analysisResult.error}`);
            // 使用快速建议作为备用
            const quickSuggestions = await aiService.getQuickSuggestions(
              stageData
            );
            setAiSuggestions(aiService.addIconsToSuggestions(quickSuggestions));
          }
        } else {
          // 快速建议（基于规则）
          const quickSuggestions = await aiService.getQuickSuggestions(
            stageData
          );
          setAiSuggestions(aiService.addIconsToSuggestions(quickSuggestions));
        }
      } catch (error) {
        console.error("更新AI建议失败:", error);
        message.error("获取AI建议失败，请稍后重试");
      } finally {
        setIsLoadingAI(false);
      }
    },
    [actors, dialogues, movements, lights, stageElements, areas, lastAIUpdate]
  );

  const handleAIOptimization = useCallback(
    async (type: "quick" | "full" = "quick") => {
      if (!isAIHealthy) {
        const healthy = await checkAIHealth();
        if (!healthy) {
          message.warning("AI服务暂时不可用，请检查网络连接");
          return;
        }
      }

      if (type === "full") {
        Modal.confirm({
          title: "完整AI分析",
          content: "将调用AI进行深度分析，可能需要10-30秒时间，是否继续？",
          okText: "开始分析",
          cancelText: "取消",
          onOk: () => updateAISuggestions(true),
        });
      } else {
        await updateAISuggestions(false);
      }
    },
    [isAIHealthy, checkAIHealth, updateAISuggestions]
  );

  const applyAISuggestion = useCallback((suggestion: AISuggestion) => {
    message.info(`正在应用建议: ${suggestion.type}`);
    // 这里可以根据建议类型实现具体的应用逻辑
    switch (suggestion.type) {
      case "路径优化":
        message.success("路径优化建议已应用，请检查演员移动路径");
        break;
      case "灯光优化":
        message.success("灯光优化建议已应用，请查看灯光设置");
        break;
      case "表演节奏":
        message.success("表演节奏建议已应用，请检查台词时长");
        break;
      default:
        message.info(`${suggestion.type}建议需要手动处理`);
    }
  }, []);

  // 初始化AI健康检查和获取建议
  useEffect(() => {
    if (actors.length > 0 && dialogues.length > 0) {
      checkAIHealth();
      updateAISuggestions(false); // 获取快速建议
    }
  }, [actors.length, dialogues.length, checkAIHealth, updateAISuggestions]);

  // 监听舞台数据变化，自动更新快速建议
  useEffect(() => {
    if (actors.length > 0) {
      const timer = setTimeout(() => {
        updateAISuggestions(false); // 延迟更新，避免频繁调用
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [actors, movements, lights, stageElements, areas, updateAISuggestions]);

  // 生成时间轴片段的tooltip内容
  const generateTooltipContent = (segment: TimelineSegment) => {
    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    };

    const startTime = segment.start / 10; // 像素转时间
    const duration = segment.width / 10;
    const endTime = startTime + duration;

    const timeInfo = `时间: ${formatTime(startTime)} - ${formatTime(
      endTime
    )} (${duration}秒)`;

    switch (segment.type) {
      case "dialogue":
        const dialogue = segment.data as Dialogue;
        return (
          <div style={{ maxWidth: 250 }}>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>
              💬 台词详情
            </div>
            <div style={{ marginBottom: 2 }}>内容: {dialogue.content}</div>
            <div style={{ marginBottom: 2 }}>{timeInfo}</div>
            {dialogue.emotion && (
              <div style={{ marginBottom: 2 }}>情感: {dialogue.emotion}</div>
            )}
            {dialogue.volume && <div>音量: {dialogue.volume}%</div>}
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              点击编辑台词
            </div>
          </div>
        );

      case "music":
        const music = segment.data as MusicTrack;
        return (
          <div style={{ maxWidth: 250 }}>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>
              🎵 音乐详情
            </div>
            <div style={{ marginBottom: 2 }}>名称: {music.name}</div>
            <div style={{ marginBottom: 2 }}>{timeInfo}</div>
            <div style={{ marginBottom: 2 }}>音量: {music.volume}%</div>
            {music.fadeIn > 0 && (
              <div style={{ marginBottom: 2 }}>淡入: {music.fadeIn}秒</div>
            )}
            {music.fadeOut > 0 && (
              <div style={{ marginBottom: 2 }}>淡出: {music.fadeOut}秒</div>
            )}
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              点击编辑音乐
            </div>
          </div>
        );

      case "light":
        const light = segment.data as Light;
        return (
          <div style={{ maxWidth: 250 }}>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>
              💡 灯光详情
            </div>
            <div style={{ marginBottom: 2 }}>名称: {light.name}</div>
            <div style={{ marginBottom: 2 }}>{timeInfo}</div>
            <div style={{ marginBottom: 2 }}>类型: {light.type}</div>
            <div style={{ marginBottom: 2 }}>
              位置: ({light.x}, {light.y})
            </div>
            <div style={{ marginBottom: 2 }}>亮度: {light.intensity}%</div>
            <div style={{ marginBottom: 2 }}>光束角度: {light.beamAngle}°</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              点击编辑灯光
            </div>
          </div>
        );

      case "movement":
        const movement = segment.data as Movement;
        return (
          <div style={{ maxWidth: 250 }}>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>
              🚶‍♂️ 移动详情
            </div>
            <div style={{ marginBottom: 2 }}>名称: {movement.name}</div>
            <div style={{ marginBottom: 2 }}>{timeInfo}</div>
            <div style={{ marginBottom: 2 }}>路径类型: {movement.pathType}</div>
            <div style={{ marginBottom: 2 }}>速度: {movement.speed}x</div>
            <div style={{ marginBottom: 2 }}>
              路径点数: {movement.path?.length || 0}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              点击编辑移动
            </div>
          </div>
        );

      default:
        return (
          <div>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>元素详情</div>
            <div>{timeInfo}</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              点击查看详情
            </div>
          </div>
        );
    }
  };

  // 动态生成时间轴轨道
  const generateTimelineTracks = (): TimelineTrack[] => {
    const tracks: TimelineTrack[] = [];

    // 演员轨道
    actors.forEach((actor) => {
      const actorDialogues = dialogues.filter((d) => d.actorId === actor.id);
      const actorMovements = movements.filter((m) => m.actorId === actor.id);

      const segments: TimelineSegment[] = [];

      // 添加台词片段
      actorDialogues.forEach((dialogue) => {
        segments.push({
          id: dialogue.id,
          label: "台词",
          start: dialogue.startTime * 10, // 时间转像素
          width: dialogue.duration * 10,
          color: actor.color,
          type: "dialogue" as const,
          data: dialogue,
        });
      });

      // 添加移动片段
      actorMovements.forEach((movement) => {
        segments.push({
          id: movement.id,
          label: "移动",
          start: movement.startTime * 10,
          width: movement.duration * 10,
          color: `${actor.color}88`, // 半透明显示移动
          type: "movement" as const,
          data: movement,
        });
      });

      tracks.push({
        id: `actor-${actor.id}`,
        name: actor.name,
        segments,
      });
    });

    // 音乐轨道
    if (musicTracks.length > 0) {
      const musicSegments = musicTracks.map((music) => ({
        id: music.id,
        label: "音乐",
        start: music.startTime * 10,
        width: music.duration * 10,
        color: "#81a1c1",
        type: "music" as const,
        data: music,
      }));

      tracks.push({
        id: "music",
        name: "音乐",
        segments: musicSegments,
      });
    }

    // 灯光轨道
    if (lights.length > 0) {
      const lightSegments = lights.map((light) => ({
        id: light.id,
        label: "灯光",
        start: light.startTime * 10,
        width: light.duration * 10,
        color: "#e6b17a",
        type: "light" as const,
        data: light,
      }));

      tracks.push({
        id: "lighting",
        name: "灯光",
        segments: lightSegments,
      });
    }

    return tracks;
  };

  // 预览模式相关函数
  const startPreview = () => {
    setIsPreviewMode(true);
    setPreviewCurrentTime(0);
    setIsPlaying(true);

    // 初始化演员位置
    const initialPositions: { [actorId: number]: { x: number; y: number } } =
      {};
    actors.forEach((actor) => {
      const position = getActorPositionAtTimeWithDynamic(actor.id, 0);
      initialPositions[actor.id] = position;
    });
    setPreviewActorPositions(initialPositions);

    // 开始播放动画
    const interval = setInterval(() => {
      setPreviewCurrentTime((prevTime) => {
        const newTime = prevTime + 0.1 * playbackSpeed; // 每100ms更新一次，考虑播放速度

        if (newTime >= samplePreviewData.totalDuration) {
          setIsPlaying(false);
          clearInterval(interval);
          setPreviewPlayInterval(null);
          return samplePreviewData.totalDuration;
        }

        // 更新演员位置
        const newPositions: { [actorId: number]: { x: number; y: number } } =
          {};
        actors.forEach((actor) => {
          const position = getActorPositionAtTimeWithDynamic(actor.id, newTime);
          newPositions[actor.id] = position;
        });
        setPreviewActorPositions(newPositions);

        return newTime;
      });
    }, 100 / playbackSpeed); // 根据播放速度调整间隔

    setPreviewPlayInterval(interval);
    message.success("开始预览模式");
  };

  const pausePreview = () => {
    setIsPlaying(false);
    if (previewPlayInterval) {
      clearInterval(previewPlayInterval);
      setPreviewPlayInterval(null);
    }
  };

  const resumePreview = () => {
    if (!isPreviewMode) return;

    setIsPlaying(true);
    const interval = setInterval(() => {
      setPreviewCurrentTime((prevTime) => {
        const newTime = prevTime + 0.1 * playbackSpeed;

        if (newTime >= samplePreviewData.totalDuration) {
          setIsPlaying(false);
          clearInterval(interval);
          setPreviewPlayInterval(null);
          return samplePreviewData.totalDuration;
        }

        // 更新演员位置
        const newPositions: { [actorId: number]: { x: number; y: number } } =
          {};
        actors.forEach((actor) => {
          const position = getActorPositionAtTimeWithDynamic(actor.id, newTime);
          newPositions[actor.id] = position;
        });
        setPreviewActorPositions(newPositions);

        return newTime;
      });
    }, 100 / playbackSpeed);

    setPreviewPlayInterval(interval);
  };

  const stopPreview = () => {
    setIsPreviewMode(false);
    setIsPlaying(false);
    setPreviewCurrentTime(0);
    setPreviewActorPositions({});
    setDynamicActorPositions([]); // 清除动态位置点

    if (previewPlayInterval) {
      clearInterval(previewPlayInterval);
      setPreviewPlayInterval(null);
    }

    message.info("退出预览模式");
  };

  // 清除动态位置点
  const clearDynamicPositions = () => {
    setDynamicActorPositions([]);
    message.success("已清除所有动态位置点");
  };

  // 导出合并后的位置数据
  const exportMergedPositions = () => {
    const mergedData = {
      dialogues: samplePreviewData.dialogues,
      actorPositions: [] as SampleActorPosition[],
      totalDuration: samplePreviewData.totalDuration,
      dynamicPositionsCount: dynamicActorPositions.length,
    };

    // 合并所有演员的位置数据
    actors.forEach((actor) => {
      const positions = getMergedActorPositions(actor.id);
      mergedData.actorPositions.push(...positions);
    });

    // 按时间排序
    mergedData.actorPositions.sort((a, b) => a.time - b.time);

    // 创建下载链接
    const dataStr = JSON.stringify(mergedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `merged_actor_positions_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success(
      `已导出合并数据，包含${mergedData.actorPositions.length}个位置点（其中${dynamicActorPositions.length}个为动态添加）`
    );
  };

  const seekToTime = (time: number) => {
    setPreviewCurrentTime(time);

    // 更新演员位置
    const newPositions: { [actorId: number]: { x: number; y: number } } = {};
    actors.forEach((actor) => {
      const position = getActorPositionAtTimeWithDynamic(actor.id, time);
      newPositions[actor.id] = position;
    });
    setPreviewActorPositions(newPositions);
  };

  const formatTimeDisplay = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  };

  // 获取演员当前位置（预览模式或编辑模式）
  const getActorDisplayPosition = (actor: Actor) => {
    if (isPreviewMode && previewActorPositions[actor.id]) {
      return previewActorPositions[actor.id];
    }
    return { x: actor.x, y: actor.y };
  };

  // 获取合并后的演员位置数据（原始数据 + 动态添加的数据）
  const getMergedActorPositions = (actorId: number): SampleActorPosition[] => {
    const originalPositions = samplePreviewData.actorPositions.filter(
      (pos) => pos.actorId === actorId
    );
    const dynamicPositions = dynamicActorPositions.filter(
      (pos) => pos.actorId === actorId
    );

    // 合并并排序
    const merged = [...originalPositions, ...dynamicPositions].sort(
      (a, b) => a.time - b.time
    );
    return merged;
  };

  // 根据时间获取演员位置（使用合并后的数据）
  const getActorPositionAtTimeWithDynamic = (
    actorId: number,
    time: number
  ): { x: number; y: number } => {
    const positions = getMergedActorPositions(actorId);

    if (positions.length === 0) {
      return { x: 200, y: 200 }; // 默认位置
    }

    // 找到最接近的时间点
    const sortedPositions = positions.sort((a, b) => a.time - b.time);

    // 如果时间小于第一个关键帧，返回第一个位置
    if (time <= sortedPositions[0].time) {
      return { x: sortedPositions[0].x, y: sortedPositions[0].y };
    }

    // 如果时间大于最后一个关键帧，返回最后一个位置
    if (time >= sortedPositions[sortedPositions.length - 1].time) {
      const lastPos = sortedPositions[sortedPositions.length - 1];
      return { x: lastPos.x, y: lastPos.y };
    }

    // 找到时间区间并插值
    for (let i = 0; i < sortedPositions.length - 1; i++) {
      const currentPos = sortedPositions[i];
      const nextPos = sortedPositions[i + 1];

      if (time >= currentPos.time && time <= nextPos.time) {
        // 线性插值
        const progress =
          (time - currentPos.time) / (nextPos.time - currentPos.time);
        const x = currentPos.x + (nextPos.x - currentPos.x) * progress;
        const y = currentPos.y + (nextPos.y - currentPos.y) * progress;

        return { x: Math.round(x), y: Math.round(y) };
      }
    }

    return { x: sortedPositions[0].x, y: sortedPositions[0].y };
  };

  // 在预览暂停时添加新的位置点
  const addDynamicPosition = (actorId: number, x: number, y: number) => {
    if (!isPreviewMode || isPlaying) {
      return; // 只在预览暂停时允许添加
    }

    const newPosition: SampleActorPosition = {
      actorId,
      time: previewCurrentTime,
      x: Math.round(x),
      y: Math.round(y),
    };

    setDynamicActorPositions((prev) => [...prev, newPosition]);

    // 立即更新预览位置
    setPreviewActorPositions((prev) => ({
      ...prev,
      [actorId]: { x: Math.round(x), y: Math.round(y) },
    }));

    message.success(
      `已为演员${actorId}在${formatTimeDisplay(previewCurrentTime)}添加位置点`
    );
  };

  const handleToolClick = (toolKey: string) => {
    console.log("Tool clicked:", toolKey); // 添加调试信息
    switch (toolKey) {
      case "add-actor":
        console.log("Opening add actor modal");
        setAddActorModalVisible(true);
        break;
      case "remove-actor":
        if (selectedActor) {
          deleteActor(selectedActor.id);
        } else {
          message.warning("请先选择要删除的演员");
        }
        break;
      case "add-props":
        console.log("Opening add props modal");
        elementForm.setFieldsValue({ type: "prop" });
        setAddElementModalVisible(true);
        break;
      case "add-scene":
        console.log("Opening add scene modal");
        elementForm.setFieldsValue({ type: "scenery" });
        setAddElementModalVisible(true);
        break;
      case "lighting":
        console.log("Opening lighting modal");
        setLightModalVisible(true);
        break;
      case "music":
        console.log("Opening music modal");
        setMusicModalVisible(true);
        break;
      case "script":
        if (selectedActor) {
          console.log("Opening dialogue modal for actor:", selectedActor.name);
          setDialogueModalVisible(true);
        } else {
          message.warning("请先选择演员添加台词");
        }
        break;
      case "path":
        if (selectedActor) {
          console.log("Starting path drawing for actor:", selectedActor.name);
          setIsDrawingPath(!isDrawingPath);
          if (!isDrawingPath) {
            setCurrentPath([]);
            message.info(
              `开始为 ${selectedActor.name} 绘制移动路径，点击舞台添加路径点`
            );
          } else {
            // 完成路径绘制，创建移动
            if (currentPath.length > 1) {
              setMovementModalVisible(true);
            } else {
              message.warning("路径至少需要2个点");
              setCurrentPath([]);
            }
            setIsDrawingPath(false);
          }
        } else {
          message.warning("请先选择一个演员来绘制路径");
        }
        break;
      case "area":
        console.log("Starting area drawing");
        setIsDrawingArea(!isDrawingArea);
        if (!isDrawingArea) {
          setCurrentAreaPoints([]);
          message.info("开始绘制区域，点击舞台添加顶点，双击完成");
        } else {
          // 完成区域绘制
          if (currentAreaPoints.length > 2) {
            setAreaModalVisible(true);
          } else {
            message.warning("区域至少需要3个顶点");
            setCurrentAreaPoints([]);
          }
          setIsDrawingArea(false);
        }
        break;
      default:
        message.info(`${toolKey} 功能开发中...`);
    }
  };

  const toolGroups = [
    {
      title: "演员管理",
      tools: [
        { key: "add-actor", icon: <UserAddOutlined />, label: "添加演员" },
        {
          key: "remove-actor",
          icon: <UserDeleteOutlined />,
          label: "删除演员",
        },
      ],
    },
    {
      title: "舞台元素",
      tools: [
        { key: "add-props", icon: <AppstoreOutlined />, label: "添加道具" },
        { key: "add-scene", icon: <BlockOutlined />, label: "添加布景" },
      ],
    },
    {
      title: "标记工具",
      tools: [
        { key: "lighting", icon: <BulbOutlined />, label: "灯光标记" },
        { key: "music", icon: <SoundOutlined />, label: "音乐标记" },
        { key: "script", icon: <CommentOutlined />, label: "台词标记" },
      ],
    },
    {
      title: "绘制工具",
      tools: [
        { key: "path", icon: <ShareAltOutlined />, label: "绘制路径" },
        { key: "area", icon: <AppstoreOutlined />, label: "绘制区域" },
      ],
    },
  ];

  // 演员管理功能
  const handleActorClick = (actor: Actor) => {
    console.log("点击演员:", actor.name, "ID:", actor.id);
    setSelectedActor(actor);
    message.success(`已选中演员: ${actor.name}`);
  };

  const addActor = () => {
    actorForm.validateFields().then((values) => {
      const newActor: Actor = {
        id: Date.now(),
        name: values.name,
        x: 400,
        y: 250,
        color: values.color || "#a8c090",
        role: values.role,
        speed: values.speed || 1.0,
      };
      setActors([...actors, newActor]);
      saveHistory("add_actor", `添加演员: ${values.name}`);
      message.success(`添加演员 ${values.name} 成功！`);
      setAddActorModalVisible(false);
      actorForm.resetFields();
    });
  };

  const deleteActor = (actorId: number) => {
    const actor = actors.find((a) => a.id === actorId);
    setActors(actors.filter((actor) => actor.id !== actorId));
    if (selectedActor?.id === actorId) {
      setSelectedActor(null);
    }
    saveHistory("delete_actor", `删除演员: ${actor?.name || actorId}`);
    message.success("删除演员成功！");
  };

  const updateActorPosition = async (actorId: number, x: number, y: number) => {
    const actor = actors.find((a) => a.id === actorId);

    // 更新本地状态
    setActors(
      actors.map((actor) => (actor.id === actorId ? { ...actor, x, y } : actor))
    );

    // 只在拖拽结束时保存历史和同步后台，避免频繁保存
    if (!isDragging && actor) {
      saveHistory("move_actor", `移动演员: ${actor.name}`);

      // 同步数据到后台
      try {
        await stageApi.updateActorPosition(
          actorId.toString(),
          { x, y },
          Date.now() // 使用当前时间戳
        );
        console.log(`演员位置已同步到后台: ${actor.name} (${x}, ${y})`);
      } catch (error) {
        console.error("同步演员位置到后台失败:", error);
        message.warning("演员位置保存失败，请检查网络连接");
      }
    }
  };

  const updateSelectedActor = (updates: Partial<Actor>) => {
    if (selectedActor) {
      const updatedActors = actors.map((actor) =>
        actor.id === selectedActor.id ? { ...actor, ...updates } : actor
      );
      setActors(updatedActors);
      setSelectedActor({ ...selectedActor, ...updates });
    }
  };

  // 拖拽功能
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, actor: Actor) => {
      e.preventDefault();

      // 在预览模式下，只有暂停时才允许拖拽
      if (isPreviewMode && isPlaying) {
        message.info("请先暂停预览后再拖拽演员");
        return;
      }

      setIsDragging(true);
      setSelectedActor(actor);

      const rect = (
        e.currentTarget.parentElement as HTMLElement
      ).getBoundingClientRect();

      // 获取当前演员的实际位置（预览模式使用预览位置，编辑模式使用演员位置）
      const currentPosition =
        isPreviewMode && previewActorPositions[actor.id]
          ? previewActorPositions[actor.id]
          : { x: actor.x, y: actor.y };

      setDragOffset({
        x: e.clientX - rect.left - currentPosition.x,
        y: e.clientY - rect.top - currentPosition.y,
      });
    },
    [isPreviewMode, isPlaying, previewActorPositions]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;

      if (isDragging && selectedActor) {
        // 演员限制在舞台内
        const boundedX = Math.max(20, Math.min(730, newX));
        const boundedY = Math.max(20, Math.min(430, newY));

        if (isPreviewMode && !isPlaying) {
          // 预览暂停时，实时更新预览位置
          setPreviewActorPositions((prev) => ({
            ...prev,
            [selectedActor.id]: { x: boundedX, y: boundedY },
          }));
        } else {
          // 编辑模式下，更新演员位置
          updateActorPosition(selectedActor.id, boundedX, boundedY);
        }
      } else if (isDraggingElement && selectedElement) {
        // 元素限制在舞台内
        const boundedX = Math.max(
          0,
          Math.min(800 - selectedElement.width, newX)
        );
        const boundedY = Math.max(
          0,
          Math.min(500 - selectedElement.height, newY)
        );
        updateElementPosition(selectedElement.id, boundedX, boundedY);
      } else if (isDraggingLight && selectedLight) {
        // 灯光允许在舞台外设置，扩大范围
        const boundedX = Math.max(-100, Math.min(900, newX));
        const boundedY = Math.max(-100, Math.min(600, newY));
        updateLightPosition(selectedLight.id, boundedX, boundedY);
      }
    },
    [
      isDragging,
      isDraggingElement,
      isDraggingLight,
      selectedActor,
      selectedElement,
      selectedLight,
      dragOffset,
      isPreviewMode,
      isPlaying,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging && selectedActor) {
      if (isPreviewMode && !isPlaying) {
        // 预览暂停时，添加新的位置点到动态数据中
        const currentPosition = previewActorPositions[selectedActor.id];
        if (currentPosition) {
          addDynamicPosition(
            selectedActor.id,
            currentPosition.x,
            currentPosition.y
          );
        }
        console.log(
          `预览模式下演员 ${selectedActor.name} 拖拽结束，位置: (${currentPosition?.x}, ${currentPosition?.y})`
        );
      } else {
        console.log(
          `演员 ${selectedActor.name} 拖拽结束，位置: (${selectedActor.x}, ${selectedActor.y})`
        );
        message.info(`${selectedActor.name} 位置已更新`);
      }
    }
    setIsDragging(false);
    setIsDraggingElement(false);
    setIsDraggingLight(false);
  }, [
    isDragging,
    selectedActor,
    isPreviewMode,
    isPlaying,
    previewActorPositions,
  ]);

  // 舞台元素拖拽处理
  const handleElementMouseDown = useCallback(
    (e: React.MouseEvent, element: StageElement) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingElement(true);
      setSelectedElement(element);
      const rect = (
        e.currentTarget.parentElement as HTMLElement
      ).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - element.x,
        y: e.clientY - rect.top - element.y,
      });
    },
    []
  );

  const updateElementPosition = (elementId: string, x: number, y: number) => {
    setStageElements((prev) =>
      prev.map((element) =>
        element.id === elementId ? { ...element, x, y } : element
      )
    );
  };

  // 灯光拖拽处理
  const handleLightMouseDown = useCallback(
    (e: React.MouseEvent, light: Light) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingLight(true);
      setSelectedLight(light);
      const rect = (
        e.currentTarget.parentElement as HTMLElement
      ).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - light.x,
        y: e.clientY - rect.top - light.y,
      });
    },
    []
  );

  const updateLightPosition = (lightId: string, x: number, y: number) => {
    setLights((prev) =>
      prev.map((light) => (light.id === lightId ? { ...light, x, y } : light))
    );
  };

  // 舞台元素管理
  const addStageElement = () => {
    console.log("Starting addStageElement"); // 调试日志
    elementForm
      .validateFields()
      .then((values) => {
        console.log("Form validation successful:", values); // 调试日志
        const newElement: StageElement = {
          id: Date.now().toString(),
          type: values.type,
          name: values.name,
          x: 400,
          y: 250,
          width: values.width || 40,
          height: values.height || 40,
          icon: values.icon || "📦",
        };
        console.log("New element created:", newElement); // 调试日志
        setStageElements([...stageElements, newElement]);
        saveHistory(
          "add_element",
          `添加${values.type === "prop" ? "道具" : "布景"}: ${values.name}`
        );
        message.success(
          `添加${values.type === "prop" ? "道具" : "布景"} ${
            values.name
          } 成功！`
        );
        setAddElementModalVisible(false);
        elementForm.resetFields();
      })
      .catch((error) => {
        message.error("请填写完整信息");
        console.error("添加舞台元素失败:", error);
      });
  };

  // 时间轴控制
  const togglePlayback = () => {
    if (isPreviewMode) {
      if (isPlaying) {
        pausePreview();
      } else {
        resumePreview();
      }
    } else {
      setIsPlaying(!isPlaying);
      message.info(isPlaying ? "暂停播放" : "开始播放");
    }
  };

  const addKeyframe = () => {
    if (selectedActor) {
      message.success(`为 ${selectedActor.name} 在 ${currentTime} 添加关键帧`);
      // 这里可以添加关键帧逻辑
    } else {
      message.warning("请先选择一个演员");
    }
  };

  // 灯光管理
  const addLight = () => {
    console.log("Starting addLight"); // 调试日志
    lightForm
      .validateFields()
      .then((values) => {
        console.log("Light form validation successful:", values); // 调试日志
        const newLight: Light = {
          id: Date.now().toString(),
          name: values.name,
          x: values.x || 400,
          y: values.y || 100,
          direction: values.direction || 0,
          type: values.type,
          color: values.color || "#FFFFFF",
          intensity: values.intensity || 100,
          beamAngle: values.beamAngle || 30,
          startTime: values.startTime || 0,
          duration: values.duration || 10,
        };
        console.log("New light created:", newLight); // 调试日志
        setLights([...lights, newLight]);
        saveHistory("add_light", `添加灯光: ${values.name}`);
        message.success(`添加灯光 ${values.name} 成功！`);
        setLightModalVisible(false);
        lightForm.resetFields();
      })
      .catch((error) => {
        message.error("请填写完整信息");
        console.error("添加灯光失败:", error);
      });
  };

  const deleteLight = (lightId: string) => {
    setLights(lights.filter((light) => light.id !== lightId));
    message.success("删除灯光成功！");
  };

  // 音乐管理
  const addMusic = () => {
    musicForm
      .validateFields()
      .then((values) => {
        const newMusic: MusicTrack = {
          id: Date.now().toString(),
          name: values.name,
          startTime: values.startTime || 0,
          duration: values.duration || 30,
          volume: values.volume || 80,
          fadeIn: values.fadeIn || 0,
          fadeOut: values.fadeOut || 0,
          file: values.file,
        };
        setMusicTracks([...musicTracks, newMusic]);
        saveHistory("add_music", `添加音乐: ${values.name}`);
        message.success(`添加音乐 ${values.name} 成功！`);
        setMusicModalVisible(false);
        musicForm.resetFields();
      })
      .catch((error) => {
        message.error("请填写完整信息");
        console.error("添加音乐失败:", error);
      });
  };

  const deleteMusic = (musicId: string) => {
    setMusicTracks(musicTracks.filter((music) => music.id !== musicId));
    message.success("删除音乐成功！");
  };

  // 台词管理
  const addDialogue = () => {
    if (!selectedActor) {
      message.warning("请先选择一个演员");
      return;
    }

    dialogueForm.validateFields().then((values) => {
      const newDialogue: Dialogue = {
        id: Date.now().toString(),
        actorId: selectedActor.id,
        content: values.content,
        startTime: values.startTime || 0,
        duration: values.duration || 5,
        emotion: values.emotion,
        volume: values.volume || 80,
      };
      setDialogues([...dialogues, newDialogue]);
      saveHistory(
        "add_dialogue",
        `为 ${selectedActor.name} 添加台词: ${values.content.substring(
          0,
          20
        )}...`
      );
      message.success(`为 ${selectedActor.name} 添加台词成功！`);
      setDialogueModalVisible(false);
      dialogueForm.resetFields();
    });
  };

  const deleteDialogue = (dialogueId: string) => {
    setDialogues(dialogues.filter((dialogue) => dialogue.id !== dialogueId));
    message.success("删除台词成功！");
  };

  const editDialogue = (dialogue: Dialogue) => {
    setSelectedDialogue(dialogue);
    dialogueForm.setFieldsValue(dialogue);
    setDialogueModalVisible(true);
  };

  const updateDialogue = () => {
    if (!selectedDialogue) return;

    dialogueForm.validateFields().then((values) => {
      const updatedDialogues = dialogues.map((dialogue) =>
        dialogue.id === selectedDialogue.id
          ? { ...dialogue, ...values }
          : dialogue
      );
      setDialogues(updatedDialogues);
      message.success("台词更新成功！");
      setDialogueModalVisible(false);
      setSelectedDialogue(null);
      dialogueForm.resetFields();
    });
  };

  // 移动管理
  const addMovement = () => {
    if (!selectedActor || currentPath.length < 2) {
      message.error("需要选择演员并绘制路径");
      return;
    }

    movementForm
      .validateFields()
      .then((values) => {
        const newMovement: Movement = {
          id: Date.now().toString(),
          actorId: selectedActor.id,
          name: values.name || `${selectedActor.name}的移动`,
          startTime: values.startTime || 0,
          duration: values.duration || 5,
          path: currentPath,
          speed: values.speed || 1,
          pathType: values.pathType || "linear",
        };
        setMovements([...movements, newMovement]);
        saveHistory(
          "add_movement",
          `为 ${selectedActor.name} 添加移动路径: ${
            values.name || newMovement.name
          }`
        );
        message.success(`为 ${selectedActor.name} 添加移动路径成功！`);
        setMovementModalVisible(false);
        setCurrentPath([]);
        movementForm.resetFields();
      })
      .catch((error) => {
        message.error("请填写完整信息");
        console.error("添加移动失败:", error);
      });
  };

  const deleteMovement = (movementId: string) => {
    setMovements(movements.filter((movement) => movement.id !== movementId));
    message.success("删除移动成功！");
  };

  // 区域管理
  const addArea = () => {
    if (currentAreaPoints.length < 3) {
      message.error("区域至少需要3个顶点");
      return;
    }

    areaForm
      .validateFields()
      .then((values) => {
        const newArea: Area = {
          id: Date.now().toString(),
          name: values.name,
          type: values.type,
          points: currentAreaPoints,
          color: values.color || "#a8c090",
          opacity: values.opacity || 0.3,
        };
        setAreas([...areas, newArea]);
        saveHistory("add_area", `添加区域: ${values.name}`);
        message.success(`添加区域 ${values.name} 成功！`);
        setAreaModalVisible(false);
        setCurrentAreaPoints([]);
        areaForm.resetFields();
      })
      .catch((error) => {
        message.error("请填写完整信息");
        console.error("添加区域失败:", error);
      });
  };

  const deleteArea = (areaId: string) => {
    setAreas(areas.filter((area) => area.id !== areaId));
    message.success("删除区域成功！");
  };

  // 撤销/重做系统核心函数
  const getCurrentState = (): HistoryState => ({
    actors,
    stageElements,
    lights,
    musicTracks,
    dialogues,
    movements,
    areas,
  });

  const saveHistory = useCallback(
    (actionType: string, description: string) => {
      if (isUndoRedoOperation) return; // 防止撤销/重做操作本身被记录

      const currentState = getCurrentState();
      const newAction: HistoryAction = {
        id: Date.now().toString(),
        type: actionType,
        description,
        timestamp: Date.now(),
        state: currentState,
      };

      // 如果当前不在历史记录的末尾，删除后面的记录
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newAction);

      // 限制历史记录数量（最多50条）
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setHistoryIndex(historyIndex + 1);
      }

      setHistory(newHistory);
      console.log("Saved history:", actionType, description);
    },
    [
      history,
      historyIndex,
      isUndoRedoOperation,
      actors,
      stageElements,
      lights,
      musicTracks,
      dialogues,
      movements,
      areas,
    ]
  );

  const restoreState = useCallback((state: HistoryState) => {
    setIsUndoRedoOperation(true);
    setActors(state.actors);
    setStageElements(state.stageElements);
    setLights(state.lights);
    setMusicTracks(state.musicTracks);
    setDialogues(state.dialogues);
    setMovements(state.movements);
    setAreas(state.areas);

    // 清除选择状态
    setSelectedActor(null);
    setSelectedElement(null);
    setSelectedLight(null);
    setSelectedMusic(null);
    setSelectedDialogue(null);
    setSelectedMovement(null);
    setSelectedArea(null);

    setTimeout(() => setIsUndoRedoOperation(false), 100);
  }, []);

  const undo = useCallback(() => {
    if (historyIndex >= 0 && history.length > 0) {
      const previousIndex = historyIndex - 1;
      if (previousIndex >= 0) {
        const previousState = history[previousIndex].state;
        restoreState(previousState);
        setHistoryIndex(previousIndex);
        message.success(`撤销: ${history[historyIndex].description}`);
      } else if (historyIndex === 0) {
        // 撤销到初始状态
        const initialState: HistoryState = {
          actors: [],
          stageElements: [],
          lights: [],
          musicTracks: [],
          dialogues: [],
          movements: [],
          areas: [],
        };
        restoreState(initialState);
        setHistoryIndex(-1);
        message.success("撤销到初始状态");
      }
    } else {
      message.warning("没有可撤销的操作");
    }
  }, [history, historyIndex, restoreState]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex].state;
      restoreState(nextState);
      setHistoryIndex(nextIndex);
      message.success(`重做: ${history[nextIndex].description}`);
    } else {
      message.warning("没有可重做的操作");
    }
  }, [history, historyIndex, restoreState]);

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);

  // 初始状态保存
  useEffect(() => {
    if (history.length === 0 && actors.length > 0) {
      saveHistory("init", "初始化舞台");
    }
  }, [actors.length, history.length, saveHistory]);

  return (
    <Layout
      style={{ minHeight: "100vh", height: "auto", background: "#0a0a0a" }}
    >
      <StageHeader />

      <Layout style={{ height: "auto", overflow: "visible" }}>
        {/* 左侧工具栏 */}
        <Sider
          width={240}
          style={{ background: "#151515", height: "auto", overflow: "visible" }}
        >
          <div
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              minHeight: "calc(100vh - 64px)",
              height: "auto",
            }}
          >
            <h3
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#f5f5f5",
                marginBottom: 16,
                margin: "0 0 16px 0",
              }}
            >
              编辑工具
            </h3>

            {toolGroups.map((group) => (
              <div key={group.title} style={{ marginBottom: 24 }}>
                <h4
                  style={{
                    color: "#c0c0c0",
                    fontSize: 12,
                    marginBottom: 12,
                    margin: "0 0 12px 0",
                  }}
                >
                  {group.title}
                </h4>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {group.tools.map((tool) => (
                    <Button
                      key={tool.key}
                      onClick={() => handleToolClick(tool.key)}
                      style={{
                        background:
                          tool.key === "path" && isDrawingPath
                            ? "#a8c090"
                            : "#1f1f1f",
                        color:
                          tool.key === "path" && isDrawingPath
                            ? "#1a1a1a"
                            : "#f5f5f5",
                        border:
                          selectedActor && tool.key === "remove-actor"
                            ? "1px solid #ff4d4f"
                            : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        padding: "8px 12px",
                        fontSize: 12,
                        height: "auto",
                      }}
                      icon={<span style={{ marginRight: 8 }}>{tool.icon}</span>}
                    >
                      {tool.label}
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginTop: "auto" }}>
              <div style={{ marginBottom: 8, display: "flex", gap: 4 }}>
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  loading={isLoadingAI}
                  onClick={() => handleAIOptimization("quick")}
                  style={{
                    background: isAIHealthy ? "#a8c090" : "#d08770",
                    borderColor: isAIHealthy ? "#a8c090" : "#d08770",
                    color: "#1a1a1a",
                    flex: 1,
                    fontSize: 10,
                    height: "auto",
                    padding: "6px 8px",
                  }}
                >
                  快速建议
                </Button>
                <Button
                  type="primary"
                  icon={<BulbOutlined />}
                  loading={isLoadingAI}
                  onClick={() => handleAIOptimization("full")}
                  disabled={!isAIHealthy}
                  style={{
                    background: isAIHealthy ? "#81a1c1" : "#555",
                    borderColor: isAIHealthy ? "#81a1c1" : "#555",
                    color: isAIHealthy ? "#1a1a1a" : "#888",
                    flex: 1,
                    fontSize: 10,
                    height: "auto",
                    padding: "6px 8px",
                  }}
                >
                  AI分析
                </Button>
              </div>
              <div style={{ textAlign: "center", fontSize: 8, color: "#888" }}>
                {isAIHealthy ? "🟢 AI服务正常" : "🔴 AI服务异常"}
              </div>
            </div>
          </div>
        </Sider>

        {/* 主编辑区域 */}
        <Layout
          style={{
            flexDirection: "column",
            height: "auto",
            overflow: "visible",
          }}
        >
          {/* 编辑工具栏 */}
          <div
            style={{
              background: "#151515",
              borderBottom: "1px solid #2a2a2a",
              padding: "12px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* 状态显示区域 */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 12, color: "#888" }}>
                演员总数: {actors.length}
              </div>
              {selectedActor && (
                <div
                  style={{ fontSize: 12, color: "#a8c090", fontWeight: "bold" }}
                >
                  已选中: {selectedActor.name} (ID: {selectedActor.id})
                </div>
              )}
              {!selectedActor && (
                <div style={{ fontSize: 12, color: "#d08770" }}>
                  未选中演员 - 点击演员进行选择
                </div>
              )}
            </div>
            <h3
              style={{
                color: "#f5f5f5",
                fontSize: 16,
                fontWeight: 500,
                margin: 0,
              }}
            >
              舞台编辑器
            </h3>
            <div style={{ display: "flex", gap: 12 }}>
              <Button
                type="text"
                onClick={undo}
                disabled={historyIndex < 0}
                style={{
                  color: historyIndex >= 0 ? "#c0c0c0" : "#555",
                  fontSize: 12,
                }}
                title={`撤销 (Ctrl+Z) ${
                  historyIndex >= 0 && history[historyIndex]
                    ? `- ${history[historyIndex].description}`
                    : ""
                }`}
              >
                撤销
              </Button>
              <Button
                type="text"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                style={{
                  color: historyIndex < history.length - 1 ? "#c0c0c0" : "#555",
                  fontSize: 12,
                }}
                title={`重做 (Ctrl+Y) ${
                  historyIndex < history.length - 1 && history[historyIndex + 1]
                    ? `- ${history[historyIndex + 1].description}`
                    : ""
                }`}
              >
                重做
              </Button>
              {!isPreviewMode ? (
                <Button
                  type="text"
                  onClick={startPreview}
                  style={{ color: "#c0c0c0", fontSize: 12 }}
                  icon={<EyeOutlined />}
                >
                  预览
                </Button>
              ) : (
                <>
                  <Button
                    type="text"
                    onClick={stopPreview}
                    style={{ color: "#ff4d4f", fontSize: 12 }}
                    icon={<StopOutlined />}
                  >
                    退出预览
                  </Button>
                  {dynamicActorPositions.length > 0 && (
                    <>
                      <Button
                        type="text"
                        onClick={clearDynamicPositions}
                        style={{ color: "#faad14", fontSize: 12 }}
                        size="small"
                      >
                        清除动态点({dynamicActorPositions.length})
                      </Button>
                      <Button
                        type="text"
                        onClick={exportMergedPositions}
                        style={{ color: "#52c41a", fontSize: 12 }}
                        size="small"
                      >
                        导出数据
                      </Button>
                    </>
                  )}
                </>
              )}
              <Button
                onClick={() => console.log("保存")}
                style={{
                  background: "#a8c090",
                  borderColor: "#a8c090",
                  color: "#1a1a1a",
                  fontSize: 12,
                }}
              >
                保存
              </Button>
              <Button
                onClick={() => {
                  console.log("=== 当前状态检查 ===");
                  console.log("演员数量:", actors.length);
                  console.log("舞台元素数量:", stageElements.length);
                  console.log("灯光数量:", lights.length);
                  console.log("音乐轨道数量:", musicTracks.length);
                  console.log("台词数量:", dialogues.length);
                  console.log("移动路径数量:", movements.length);
                  console.log("区域数量:", areas.length);
                  console.log("绘制状态:");
                  console.log("- 绘制路径:", isDrawingPath);
                  console.log("- 绘制区域:", isDrawingArea);
                  console.log("- 当前路径点数:", currentPath.length);
                  console.log("- 当前区域点数:", currentAreaPoints.length);
                  console.log("模态框状态:");
                  console.log("- 添加元素:", addElementModalVisible);
                  console.log("- 灯光:", lightModalVisible);
                  console.log("- 音乐:", musicModalVisible);
                  console.log("- 台词:", dialogueModalVisible);
                  console.log("- 移动:", movementModalVisible);
                  console.log("- 区域:", areaModalVisible);
                  console.log("历史记录:");
                  console.log("- 总数:", history.length);
                  console.log("- 当前索引:", historyIndex);
                  console.log("- 可撤销:", historyIndex >= 0);
                  console.log("- 可重做:", historyIndex < history.length - 1);
                  if (history.length > 0) {
                    console.log(
                      "最近5条记录:",
                      history.slice(-5).map((h) => h.description)
                    );
                  }
                  message.info("状态已输出到控制台，请按F12查看");
                }}
                style={{
                  background: "#d08770",
                  borderColor: "#d08770",
                  color: "#1a1a1a",
                  fontSize: 10,
                  marginLeft: 8,
                }}
                size="small"
              >
                调试
              </Button>
            </div>
          </div>

          {/* 舞台画布区域 */}
          <Content
            style={{
              background: "#0a0a0a",
              padding: 24,
              minHeight: "600px",
              height: "auto",
              position: "relative",
            }}
          >
            {/* 缩放控制 */}
            <div
              style={{
                position: "absolute",
                top: 24,
                left: 24,
                display: "flex",
                gap: 8,
                zIndex: 10,
              }}
            >
              <Button
                style={{
                  background: "#151515",
                  border: "none",
                  color: "#f5f5f5",
                  width: 32,
                  height: 32,
                  padding: 0,
                }}
                icon={<PlusOutlined />}
              />
              <Button
                style={{
                  background: "#151515",
                  border: "none",
                  color: "#f5f5f5",
                  width: 32,
                  height: 32,
                  padding: 0,
                }}
                icon={<MinusOutlined />}
              />
            </div>

            {/* 舞台画布 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 800,
                  height: 500,
                  background: "#151515",
                }}
              >
                {/* 舞台区域 */}
                <div
                  style={{
                    position: "absolute",
                    top: 24,
                    right: 24,
                    bottom: 24,
                    left: 24,
                    background: "#1f1f1f",
                    border: "1px solid #2a2a2a",
                    cursor:
                      isDrawingPath || isDrawingArea ? "crosshair" : "default",
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    if (isDrawingPath && selectedActor) {
                      // 添加路径点
                      const newPoint: PathPoint = { x, y, time: Date.now() };
                      setCurrentPath((prev) => [...prev, newPoint]);
                      console.log("Added path point:", newPoint);
                      message.info(
                        `已添加路径点 ${
                          currentPath.length + 1
                        }，再次点击工具按钮完成绘制`
                      );
                    } else if (isDrawingArea) {
                      // 添加区域顶点
                      const newPoint = { x, y };
                      setCurrentAreaPoints((prev) => [...prev, newPoint]);
                      console.log("Added area point:", newPoint);
                      message.info(
                        `已添加顶点 ${
                          currentAreaPoints.length + 1
                        }，双击或再次点击工具按钮完成`
                      );
                    }
                  }}
                  onDoubleClick={(e) => {
                    if (isDrawingArea && currentAreaPoints.length > 2) {
                      // 双击完成区域绘制
                      console.log("Finishing area drawing with double click");
                      setAreaModalVisible(true);
                      setIsDrawingArea(false);
                    }
                  }}
                >
                  {/* 区域渲染 */}
                  {areas.map((area) => {
                    const pathString =
                      area.points
                        .map(
                          (point, index) =>
                            `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
                        )
                        .join(" ") + " Z";

                    return (
                      <svg
                        key={area.id}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          pointerEvents: "none",
                          zIndex: 1,
                        }}
                      >
                        <path
                          d={pathString}
                          fill={area.color}
                          fillOpacity={area.opacity}
                          stroke={area.color}
                          strokeWidth="2"
                          strokeOpacity="0.8"
                        />
                        <text
                          x={area.points[0]?.x || 0}
                          y={(area.points[0]?.y || 0) - 5}
                          fill={area.color}
                          fontSize="12"
                          fontWeight="bold"
                        >
                          {area.name}
                        </text>
                      </svg>
                    );
                  })}

                  {/* 当前正在绘制的区域 */}
                  {isDrawingArea && currentAreaPoints.length > 0 && (
                    <svg
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                        zIndex: 2,
                      }}
                    >
                      {currentAreaPoints.map((point, index) => (
                        <circle
                          key={index}
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          fill="#a8c090"
                          stroke="#fff"
                          strokeWidth="2"
                        />
                      ))}
                      {currentAreaPoints.length > 2 && (
                        <path
                          d={
                            currentAreaPoints
                              .map(
                                (point, index) =>
                                  `${index === 0 ? "M" : "L"} ${point.x} ${
                                    point.y
                                  }`
                              )
                              .join(" ") + " Z"
                          }
                          fill="rgba(168, 192, 144, 0.2)"
                          stroke="#a8c090"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                      )}
                    </svg>
                  )}

                  {/* 当前正在绘制的路径 */}
                  {isDrawingPath && currentPath.length > 0 && (
                    <svg
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                        zIndex: 2,
                      }}
                    >
                      {currentPath.map((point, index) => (
                        <circle
                          key={index}
                          cx={point.x}
                          cy={point.y}
                          r="3"
                          fill={selectedActor?.color || "#a8c090"}
                          stroke="#fff"
                          strokeWidth="1"
                        />
                      ))}
                      {currentPath.length > 1 && (
                        <path
                          d={currentPath
                            .map(
                              (point, index) =>
                                `${index === 0 ? "M" : "L"} ${point.x} ${
                                  point.y
                                }`
                            )
                            .join(" ")}
                          fill="none"
                          stroke={selectedActor?.color || "#a8c090"}
                          strokeWidth="2"
                          strokeDasharray="3,3"
                        />
                      )}
                    </svg>
                  )}

                  {/* 已存在的移动路径渲染 */}
                  {movements.map((movement) => {
                    const actor = actors.find((a) => a.id === movement.actorId);
                    if (!actor || movement.path.length < 2) return null;

                    return (
                      <svg
                        key={movement.id}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          pointerEvents: "none",
                          zIndex: 1,
                        }}
                      >
                        <path
                          d={movement.path
                            .map(
                              (point, index) =>
                                `${index === 0 ? "M" : "L"} ${point.x} ${
                                  point.y
                                }`
                            )
                            .join(" ")}
                          fill="none"
                          stroke={actor.color}
                          strokeWidth="2"
                          strokeOpacity="0.6"
                        />
                        {movement.path.map((point, index) => (
                          <circle
                            key={index}
                            cx={point.x}
                            cy={point.y}
                            r="2"
                            fill={actor.color}
                            fillOpacity="0.8"
                          />
                        ))}
                      </svg>
                    );
                  })}

                  {/* 中心十字线 */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div
                      style={{
                        width: 2,
                        height: 24,
                        background: "#2a2a2a",
                      }}
                    />
                    <div
                      style={{
                        width: 24,
                        height: 2,
                        background: "#2a2a2a",
                        marginTop: -2,
                        marginLeft: -11,
                      }}
                    />
                  </div>

                  {/* 动态位置点显示 */}
                  {dynamicActorPositions.map((pos, index) => {
                    const actor = actors.find((a) => a.id === pos.actorId);
                    if (!actor) return null;

                    return (
                      <div
                        key={`dynamic-${pos.actorId}-${pos.time}-${index}`}
                        style={{
                          position: "absolute",
                          left: pos.x,
                          top: pos.y,
                          transform: "translate(-50%, -50%)",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: actor.color,
                          border: "2px solid #fff",
                          boxShadow: "0 0 4px rgba(0,0,0,0.5)",
                          zIndex: 5,
                          pointerEvents: "none",
                        }}
                        title={`${actor.name} - ${formatTimeDisplay(pos.time)}`}
                      />
                    );
                  })}

                  {/* 演员位置 */}
                  {actors.map((actor) => {
                    const displayPosition = getActorDisplayPosition(actor);
                    const canDrag =
                      !isPreviewMode || (isPreviewMode && !isPlaying);

                    return (
                      <div
                        key={actor.id}
                        style={{
                          position: "absolute",
                          left: displayPosition.x,
                          top: displayPosition.y,
                          transform: "translate(-50%, -50%)",
                          cursor: canDrag
                            ? isDragging
                              ? "grabbing"
                              : "grab"
                            : "default",
                          pointerEvents: canDrag ? "auto" : "none",
                          zIndex: 10, // 确保演员在最上层，可以被交互
                        }}
                        onClick={() => canDrag && handleActorClick(actor)}
                        onMouseDown={(e) =>
                          canDrag && handleMouseDown(e, actor)
                        }
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: actor.color,
                            color: "#1a1a1a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: "bold",
                            border:
                              selectedActor?.id === actor.id
                                ? "2px solid #fff"
                                : "none",
                            boxShadow:
                              selectedActor?.id === actor.id
                                ? "0 0 8px rgba(168, 192, 144, 0.5)"
                                : "none",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {actor.id}
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: -24,
                            left: "50%",
                            transform: "translateX(-50%)",
                            color:
                              selectedActor?.id === actor.id
                                ? "#a8c090"
                                : "#c0c0c0",
                            fontSize: 10,
                            whiteSpace: "nowrap",
                            fontWeight:
                              selectedActor?.id === actor.id
                                ? "bold"
                                : "normal",
                            textShadow:
                              selectedActor?.id === actor.id
                                ? "0 0 4px rgba(168, 192, 144, 0.5)"
                                : "none",
                          }}
                        >
                          {actor.name}
                        </div>
                      </div>
                    );
                  })}

                  {/* 舞台元素 */}
                  {stageElements.map((element) => (
                    <div
                      key={element.id}
                      style={{
                        position: "absolute",
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: element.width > 40 ? 24 : 16,
                        cursor: isDraggingElement ? "grabbing" : "grab",
                        userSelect: "none",
                        border:
                          selectedElement?.id === element.id
                            ? "2px solid #a8c090"
                            : "1px solid #2a2a2a",
                        borderRadius: "4px",
                        background:
                          selectedElement?.id === element.id
                            ? "rgba(168, 192, 144, 0.2)"
                            : "rgba(42, 42, 42, 0.1)",
                        boxShadow:
                          selectedElement?.id === element.id
                            ? "0 0 8px rgba(168, 192, 144, 0.5)"
                            : "none",
                        transition: "all 0.2s ease",
                      }}
                      title={element.name}
                      onClick={() => setSelectedElement(element)}
                      onMouseDown={(e) => handleElementMouseDown(e, element)}
                    >
                      {element.icon}
                      <div
                        style={{
                          position: "absolute",
                          bottom: -20,
                          left: "50%",
                          transform: "translateX(-50%)",
                          color:
                            selectedElement?.id === element.id
                              ? "#a8c090"
                              : "#c0c0c0",
                          fontSize: 8,
                          whiteSpace: "nowrap",
                          fontWeight:
                            selectedElement?.id === element.id
                              ? "bold"
                              : "normal",
                        }}
                      >
                        {element.name}
                      </div>
                    </div>
                  ))}

                  {/* 灯光效果渲染 */}
                  {lights.map((light) => (
                    <div key={`light-effect-${light.id}`}>
                      {/* 灯光照射区域 */}
                      <div
                        style={{
                          position: "absolute",
                          left: light.x,
                          top: light.y,
                          width: light.beamAngle * 4,
                          height: light.beamAngle * 4,
                          borderRadius: "50%",
                          background: `radial-gradient(circle, ${light.color}22 0%, ${light.color}11 50%, transparent 70%)`,
                          transform: "translate(-50%, -50%)",
                          pointerEvents: "none",
                          opacity: light.intensity / 200,
                          zIndex: 1,
                        }}
                      />
                      {/* 聚光灯光束 */}
                      {light.type === "spot" && (
                        <div
                          style={{
                            position: "absolute",
                            left: light.x,
                            top: light.y,
                            width: 200,
                            height: light.beamAngle,
                            background: `linear-gradient(90deg, ${light.color}33 0%, ${light.color}11 50%, transparent 100%)`,
                            transformOrigin: "0 50%",
                            transform: `translate(0, -50%) rotate(${light.direction}deg)`,
                            pointerEvents: "none",
                            opacity: light.intensity / 300,
                            zIndex: 1,
                            clipPath:
                              "polygon(0 20%, 100% 0%, 100% 100%, 0 80%)",
                          }}
                        />
                      )}
                      {/* 泛光灯效果 */}
                      {light.type === "flood" && (
                        <div
                          style={{
                            position: "absolute",
                            left: light.x,
                            top: light.y,
                            width: light.beamAngle * 6,
                            height: light.beamAngle * 6,
                            borderRadius: "50%",
                            background: `radial-gradient(circle, ${light.color}44 0%, ${light.color}22 30%, transparent 60%)`,
                            transform: "translate(-50%, -50%)",
                            pointerEvents: "none",
                            opacity: light.intensity / 150,
                            zIndex: 1,
                          }}
                        />
                      )}
                    </div>
                  ))}

                  {/* 灯光位置 */}
                  {lights.map((light) => (
                    <div
                      key={light.id}
                      onClick={(e) => {
                        if (!isDraggingLight) {
                          setSelectedLight(light);
                          lightForm.setFieldsValue(light);
                          setLightModalVisible(true);
                        }
                      }}
                      onMouseDown={(e) => handleLightMouseDown(e, light)}
                      style={{
                        position: "absolute",
                        left: light.x,
                        top: light.y,
                        transform: "translate(-50%, -50%)",
                        cursor: isDraggingLight ? "grabbing" : "grab",
                        zIndex: 10,
                      }}
                      title={`${light.name} - ${light.type} (${light.x}, ${light.y})`}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: light.color,
                          border:
                            selectedLight?.id === light.id
                              ? "3px solid #e6b17a"
                              : "2px solid #e6b17a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          color: "#1a1a1a",
                          boxShadow:
                            selectedLight?.id === light.id
                              ? "0 0 12px rgba(230, 177, 122, 0.8)"
                              : "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        💡
                      </div>
                      {/* 灯光方向指示器 */}
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          width: 40,
                          height: 2,
                          background: light.color,
                          transformOrigin: "0 50%",
                          transform: `translate(-50%, -50%) rotate(${light.direction}deg)`,
                          opacity: 0.6,
                          pointerEvents: "none",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: -20,
                          left: "50%",
                          transform: "translateX(-50%)",
                          color:
                            selectedLight?.id === light.id ? "#e6b17a" : "#888",
                          fontSize: 8,
                          whiteSpace: "nowrap",
                          fontWeight:
                            selectedLight?.id === light.id ? "bold" : "normal",
                          pointerEvents: "none",
                        }}
                      >
                        {light.name}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 刻度标尺 */}
                <div
                  style={{
                    position: "absolute",
                    top: -24,
                    left: 24,
                    right: 24,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 10,
                    color: "#909090",
                  }}
                >
                  <span>0m</span>
                  <span>5m</span>
                  <span>10m</span>
                  <span>15m</span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: -24,
                    top: 24,
                    bottom: 24,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    fontSize: 10,
                    color: "#909090",
                  }}
                >
                  <span>0m</span>
                  <span>3m</span>
                  <span>6m</span>
                  <span>9m</span>
                </div>
              </div>
            </div>
          </Content>

          {/* 时间轴区域 */}
          <div
            style={{
              background: "#151515",
              minHeight: 180,
              height: "auto",
              padding: 24,
            }}
          >
            {/* 播放控制 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <Button
                  onClick={togglePlayback}
                  style={{
                    background: isPlaying ? "#a8c090" : "#1f1f1f",
                    border: "none",
                    color: isPlaying ? "#1a1a1a" : "#f5f5f5",
                    width: 32,
                    height: 32,
                    marginRight: 8,
                  }}
                  icon={
                    isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />
                  }
                />

                {isPreviewMode ? (
                  <div
                    style={{ display: "flex", alignItems: "center", flex: 1 }}
                  >
                    <div
                      style={{
                        color: "#f5f5f5",
                        fontSize: 12,
                        marginRight: 16,
                      }}
                    >
                      {formatTimeDisplay(previewCurrentTime)} /{" "}
                      {formatTimeDisplay(samplePreviewData.totalDuration)}
                    </div>

                    {/* 时间轴拖拽条 */}
                    <div style={{ flex: 1, marginRight: 16 }}>
                      <Slider
                        min={0}
                        max={samplePreviewData.totalDuration}
                        step={0.1}
                        value={previewCurrentTime}
                        onChange={seekToTime}
                        tooltip={{
                          formatter: (value) => formatTimeDisplay(value || 0),
                        }}
                        trackStyle={{ backgroundColor: "#a8c090" }}
                        handleStyle={{
                          borderColor: "#a8c090",
                          backgroundColor: "#a8c090",
                        }}
                      />
                    </div>

                    {/* 播放速度控制 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginRight: 16,
                      }}
                    >
                      <span
                        style={{
                          color: "#c0c0c0",
                          fontSize: 10,
                          marginRight: 8,
                        }}
                      >
                        速度:
                      </span>
                      <Select
                        value={playbackSpeed}
                        onChange={setPlaybackSpeed}
                        size="small"
                        style={{ width: 60 }}
                        options={[
                          { value: 0.25, label: "0.25x" },
                          { value: 0.5, label: "0.5x" },
                          { value: 1, label: "1x" },
                          { value: 1.5, label: "1.5x" },
                          { value: 2, label: "2x" },
                        ]}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ color: "#f5f5f5", fontSize: 12 }}>
                    {currentTime} / {totalTime}
                  </div>
                )}
              </div>
              <Button
                onClick={addKeyframe}
                style={{
                  background: selectedActor ? "#a8c090" : "#1f1f1f",
                  color: selectedActor ? "#1a1a1a" : "#f5f5f5",
                  border: "none",
                  fontSize: 12,
                  height: "auto",
                  padding: "8px 12px",
                }}
                icon={<KeyOutlined />}
              >
                添加关键帧
              </Button>
            </div>

            {/* 时间轴标尺 */}
            <div
              style={{
                display: "flex",
                width: "100%",
                height: 24,
                borderBottom: "1px solid #2a2a2a",
              }}
            >
              <div
                style={{
                  width: 60,
                  color: "#909090",
                  borderRight: "1px solid #2a2a2a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                }}
              >
                轨道
              </div>
              <div style={{ flex: 1, position: "relative" }}>
                {/* 时间刻度 */}
                {Array.from({ length: 15 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${(i / 14) * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      background: "#2a2a2a",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 时间轴轨道 */}
            <div style={{ display: "flex", width: "100%" }}>
              <div style={{ width: 60 }}>
                {generateTimelineTracks().map((track: TimelineTrack) => (
                  <div
                    key={track.id}
                    style={{
                      height: 30,
                      color: "#c0c0c0",
                      borderRight: "1px solid #2a2a2a",
                      borderBottom: "1px solid #2a2a2a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                    }}
                  >
                    {track.name}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, position: "relative" }}>
                {/* 播放头 */}
                <div
                  style={{
                    position: "absolute",
                    left: 100,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: "#a8c090",
                    zIndex: 1,
                  }}
                />

                {generateTimelineTracks().map(
                  (track: TimelineTrack, trackIndex: number) => (
                    <div
                      key={track.id}
                      style={{
                        position: "relative",
                        height: 30,
                        borderBottom: "1px solid #2a2a2a",
                      }}
                    >
                      {track.segments.map((segment: TimelineSegment) => (
                        <Tooltip
                          key={segment.id}
                          title={generateTooltipContent(segment)}
                          placement="top"
                          overlayStyle={{ maxWidth: 300 }}
                        >
                          <div
                            onClick={() => {
                              // 处理点击事件
                              if (segment.type === "dialogue") {
                                editDialogue(segment.data);
                              } else if (segment.type === "music") {
                                setSelectedMusic(segment.data);
                                musicForm.setFieldsValue(segment.data);
                                setMusicModalVisible(true);
                              } else if (segment.type === "light") {
                                setSelectedLight(segment.data);
                                lightForm.setFieldsValue(segment.data);
                                setLightModalVisible(true);
                              } else if (segment.type === "movement") {
                                setSelectedMovement(segment.data);
                                movementForm.setFieldsValue(segment.data);
                                setMovementModalVisible(true);
                              }
                            }}
                            style={{
                              position: "absolute",
                              top: 5,
                              left: segment.start,
                              width: segment.width,
                              height: 20,
                              background: "#1f1f1f",
                              borderLeft: `2px solid ${segment.color}`,
                              display: "flex",
                              alignItems: "center",
                              paddingLeft: 4,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#2a2a2a";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#1f1f1f";
                            }}
                          >
                            <span style={{ color: "#f5f5f5", fontSize: 10 }}>
                              {segment.label}
                            </span>
                            {/* 删除按钮 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (segment.type === "dialogue") {
                                  deleteDialogue(segment.id);
                                } else if (segment.type === "music") {
                                  deleteMusic(segment.id);
                                } else if (segment.type === "light") {
                                  deleteLight(segment.id);
                                }
                              }}
                              style={{
                                position: "absolute",
                                right: 2,
                                top: 2,
                                width: 16,
                                height: 16,
                                background: "#ff4d4f",
                                border: "none",
                                borderRadius: "50%",
                                color: "#fff",
                                fontSize: 8,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              ×
                            </button>
                          </div>
                        </Tooltip>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </Layout>

        {/* 右侧属性面板 */}
        <Sider
          width={320}
          style={{ background: "#151515", height: "auto", overflow: "visible" }}
        >
          <div style={{ padding: 16 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#f5f5f5",
                marginBottom: 16,
                margin: "0 0 16px 0",
              }}
            >
              属性面板
            </h3>

            {/* 台词显示面板 */}
            <div style={{ marginBottom: 24 }}>
              <DialoguePanel
                currentTime={isPreviewMode ? previewCurrentTime : 0}
                dialogues={samplePreviewData.dialogues}
                actors={actors}
                isPreviewMode={isPreviewMode}
              />
            </div>

            {/* 演员列表 */}
            <div style={{ marginBottom: 24 }}>
              <h4
                style={{
                  color: "#c0c0c0",
                  fontSize: 12,
                  marginBottom: 12,
                  margin: "0 0 12px 0",
                }}
              >
                演员列表 ({actors.length})
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {actors.map((actor) => (
                  <div
                    key={actor.id}
                    onClick={() => handleActorClick(actor)}
                    style={{
                      padding: "8px 12px",
                      background:
                        selectedActor?.id === actor.id ? "#2a2a2a" : "#1f1f1f",
                      border:
                        selectedActor?.id === actor.id
                          ? `1px solid ${actor.color}`
                          : "1px solid #333",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedActor?.id !== actor.id) {
                        e.currentTarget.style.background = "#252525";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedActor?.id !== actor.id) {
                        e.currentTarget.style.background = "#1f1f1f";
                      }
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: actor.color,
                        color: "#1a1a1a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 8,
                        fontWeight: "bold",
                      }}
                    >
                      {actor.id}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          color: "#f5f5f5",
                          fontSize: 11,
                          fontWeight: "bold",
                        }}
                      >
                        {actor.name}
                      </div>
                      <div style={{ color: "#888", fontSize: 9 }}>
                        {actor.role} • ({Math.round(actor.x)},{" "}
                        {Math.round(actor.y)})
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      {selectedActor?.id === actor.id && (
                        <div style={{ color: actor.color, fontSize: 10 }}>
                          ✓
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          Modal.confirm({
                            title: "删除演员",
                            content: `确定要删除演员"${actor.name}"吗？`,
                            okText: "删除",
                            cancelText: "取消",
                            okType: "danger",
                            onOk: () => deleteActor(actor.id),
                          });
                        }}
                        style={{
                          width: 16,
                          height: 16,
                          background: "transparent",
                          border: "none",
                          color: "#888",
                          cursor: "pointer",
                          fontSize: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "2px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#ff4d4f";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#888";
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                {actors.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#888",
                      fontSize: 10,
                    }}
                  >
                    暂无演员，点击左侧"添加演员"按钮创建
                  </div>
                )}
              </div>
            </div>

            {/* 演员属性 */}
            <div style={{ marginBottom: 24 }}>
              <h4
                style={{
                  color: "#c0c0c0",
                  fontSize: 12,
                  marginBottom: 12,
                  margin: "0 0 12px 0",
                }}
              >
                演员属性 {selectedActor && `- ${selectedActor.name}`}
              </h4>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      color: "#909090",
                      fontSize: 10,
                      marginBottom: 4,
                    }}
                  >
                    名称
                  </label>
                  <Input
                    value={selectedActor?.name || "未选中演员"}
                    onChange={(e) =>
                      updateSelectedActor({ name: e.target.value })
                    }
                    disabled={!selectedActor}
                    style={{
                      background: "#1f1f1f",
                      color: "#f5f5f5",
                      border: "1px solid #2a2a2a",
                      fontSize: 12,
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      color: "#909090",
                      fontSize: 10,
                      marginBottom: 4,
                    }}
                  >
                    当前位置
                  </label>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Input
                        value={
                          selectedActor
                            ? `X: ${(selectedActor.x / 50).toFixed(1)}m`
                            : "X: -"
                        }
                        onChange={(e) => {
                          const x =
                            parseFloat(
                              e.target.value.replace("X: ", "").replace("m", "")
                            ) * 50;
                          if (!isNaN(x))
                            updateSelectedActor({
                              x: Math.max(20, Math.min(730, x)),
                            });
                        }}
                        disabled={!selectedActor}
                        style={{
                          background: "#1f1f1f",
                          color: "#f5f5f5",
                          border: "1px solid #2a2a2a",
                          fontSize: 12,
                        }}
                      />
                    </Col>
                    <Col span={12}>
                      <Input
                        value={
                          selectedActor
                            ? `Y: ${(selectedActor.y / 50).toFixed(1)}m`
                            : "Y: -"
                        }
                        onChange={(e) => {
                          const y =
                            parseFloat(
                              e.target.value.replace("Y: ", "").replace("m", "")
                            ) * 50;
                          if (!isNaN(y))
                            updateSelectedActor({
                              y: Math.max(20, Math.min(430, y)),
                            });
                        }}
                        disabled={!selectedActor}
                        style={{
                          background: "#1f1f1f",
                          color: "#f5f5f5",
                          border: "1px solid #2a2a2a",
                          fontSize: 12,
                        }}
                      />
                    </Col>
                  </Row>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      color: "#909090",
                      fontSize: 10,
                      marginBottom: 4,
                    }}
                  >
                    移动速度
                  </label>
                  <Input
                    value={
                      selectedActor ? `${selectedActor.speed || 1.0}m/s` : "-"
                    }
                    onChange={(e) => {
                      const speed = parseFloat(
                        e.target.value.replace("m/s", "")
                      );
                      if (!isNaN(speed)) updateSelectedActor({ speed });
                    }}
                    disabled={!selectedActor}
                    style={{
                      background: "#1f1f1f",
                      color: "#f5f5f5",
                      border: "1px solid #2a2a2a",
                      fontSize: 12,
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      color: "#909090",
                      fontSize: 10,
                      marginBottom: 4,
                    }}
                  >
                    标记颜色
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["#a8c090", "#81a1c1", "#e6b17a", "#d08770"].map(
                      (color) => (
                        <div
                          key={color}
                          onClick={() => updateSelectedActor({ color })}
                          style={{
                            width: 24,
                            height: 24,
                            background: color,
                            border:
                              selectedActor?.color === color
                                ? "2px solid #fff"
                                : "1px solid #2a2a2a",
                            cursor: selectedActor ? "pointer" : "not-allowed",
                            opacity: selectedActor ? 1 : 0.5,
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 舞台元素属性 */}
            {selectedElement && (
              <div style={{ marginBottom: 24 }}>
                <h4
                  style={{
                    color: "#81a1c1",
                    fontSize: 12,
                    marginBottom: 12,
                    margin: "0 0 12px 0",
                  }}
                >
                  📦 {selectedElement.type === "prop" ? "道具" : "布景"}属性
                </h4>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        color: "#909090",
                        fontSize: 10,
                        marginBottom: 4,
                      }}
                    >
                      名称
                    </label>
                    <Input
                      value={selectedElement.name}
                      onChange={(e) => {
                        const updatedElements = stageElements.map((element) =>
                          element.id === selectedElement.id
                            ? { ...element, name: e.target.value }
                            : element
                        );
                        setStageElements(updatedElements);
                        setSelectedElement({
                          ...selectedElement,
                          name: e.target.value,
                        });
                      }}
                      style={{
                        background: "#1f1f1f",
                        color: "#f5f5f5",
                        border: "1px solid #2a2a2a",
                        fontSize: 12,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        color: "#909090",
                        fontSize: 10,
                        marginBottom: 4,
                      }}
                    >
                      位置和大小
                    </label>
                    <Row gutter={8}>
                      <Col span={6}>
                        <Input
                          value={selectedElement.x}
                          onChange={(e) => {
                            const newX = parseInt(e.target.value) || 0;
                            updateElementPosition(
                              selectedElement.id,
                              newX,
                              selectedElement.y
                            );
                            setSelectedElement({ ...selectedElement, x: newX });
                          }}
                          style={{
                            background: "#1f1f1f",
                            color: "#f5f5f5",
                            border: "1px solid #2a2a2a",
                            fontSize: 10,
                          }}
                        />
                      </Col>
                      <Col span={6}>
                        <Input
                          value={selectedElement.y}
                          onChange={(e) => {
                            const newY = parseInt(e.target.value) || 0;
                            updateElementPosition(
                              selectedElement.id,
                              selectedElement.x,
                              newY
                            );
                            setSelectedElement({ ...selectedElement, y: newY });
                          }}
                          style={{
                            background: "#1f1f1f",
                            color: "#f5f5f5",
                            border: "1px solid #2a2a2a",
                            fontSize: 10,
                          }}
                        />
                      </Col>
                      <Col span={6}>
                        <Input
                          value={selectedElement.width}
                          onChange={(e) => {
                            const newWidth = parseInt(e.target.value) || 40;
                            const updatedElements = stageElements.map(
                              (element) =>
                                element.id === selectedElement.id
                                  ? { ...element, width: newWidth }
                                  : element
                            );
                            setStageElements(updatedElements);
                            setSelectedElement({
                              ...selectedElement,
                              width: newWidth,
                            });
                          }}
                          style={{
                            background: "#1f1f1f",
                            color: "#f5f5f5",
                            border: "1px solid #2a2a2a",
                            fontSize: 10,
                          }}
                        />
                      </Col>
                      <Col span={6}>
                        <Input
                          value={selectedElement.height}
                          onChange={(e) => {
                            const newHeight = parseInt(e.target.value) || 40;
                            const updatedElements = stageElements.map(
                              (element) =>
                                element.id === selectedElement.id
                                  ? { ...element, height: newHeight }
                                  : element
                            );
                            setStageElements(updatedElements);
                            setSelectedElement({
                              ...selectedElement,
                              height: newHeight,
                            });
                          }}
                          style={{
                            background: "#1f1f1f",
                            color: "#f5f5f5",
                            border: "1px solid #2a2a2a",
                            fontSize: 10,
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            )}

            {/* 灯光属性 */}
            {selectedLight && (
              <div style={{ marginBottom: 24 }}>
                <h4
                  style={{
                    color: "#e6b17a",
                    fontSize: 12,
                    marginBottom: 12,
                    margin: "0 0 12px 0",
                  }}
                >
                  💡 灯光属性
                </h4>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        color: "#909090",
                        fontSize: 10,
                        marginBottom: 4,
                      }}
                    >
                      名称
                    </label>
                    <Input
                      value={selectedLight.name}
                      onChange={(e) => {
                        const updatedLights = lights.map((light) =>
                          light.id === selectedLight.id
                            ? { ...light, name: e.target.value }
                            : light
                        );
                        setLights(updatedLights);
                        setSelectedLight({
                          ...selectedLight,
                          name: e.target.value,
                        });
                      }}
                      style={{
                        background: "#1f1f1f",
                        color: "#f5f5f5",
                        border: "1px solid #2a2a2a",
                        fontSize: 12,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        color: "#909090",
                        fontSize: 10,
                        marginBottom: 4,
                      }}
                    >
                      位置 (X, Y)
                    </label>
                    <Row gutter={8}>
                      <Col span={12}>
                        <Input
                          value={selectedLight.x}
                          onChange={(e) => {
                            const newX = parseInt(e.target.value) || 0;
                            updateLightPosition(
                              selectedLight.id,
                              newX,
                              selectedLight.y
                            );
                            setSelectedLight({ ...selectedLight, x: newX });
                          }}
                          style={{
                            background: "#1f1f1f",
                            color: "#f5f5f5",
                            border: "1px solid #2a2a2a",
                            fontSize: 12,
                          }}
                        />
                      </Col>
                      <Col span={12}>
                        <Input
                          value={selectedLight.y}
                          onChange={(e) => {
                            const newY = parseInt(e.target.value) || 0;
                            updateLightPosition(
                              selectedLight.id,
                              selectedLight.x,
                              newY
                            );
                            setSelectedLight({ ...selectedLight, y: newY });
                          }}
                          style={{
                            background: "#1f1f1f",
                            color: "#f5f5f5",
                            border: "1px solid #2a2a2a",
                            fontSize: 12,
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        color: "#909090",
                        fontSize: 10,
                        marginBottom: 4,
                      }}
                    >
                      亮度和角度
                    </label>
                    <Row gutter={8}>
                      <Col span={12}>
                        <Input
                          value={selectedLight.intensity}
                          onChange={(e) => {
                            const newIntensity = parseInt(e.target.value) || 0;
                            const updatedLights = lights.map((light) =>
                              light.id === selectedLight.id
                                ? { ...light, intensity: newIntensity }
                                : light
                            );
                            setLights(updatedLights);
                            setSelectedLight({
                              ...selectedLight,
                              intensity: newIntensity,
                            });
                          }}
                          style={{
                            background: "#1f1f1f",
                            color: "#f5f5f5",
                            border: "1px solid #2a2a2a",
                            fontSize: 12,
                          }}
                        />
                      </Col>
                      <Col span={12}>
                        <Input
                          value={selectedLight.direction}
                          onChange={(e) => {
                            const newDirection = parseInt(e.target.value) || 0;
                            const updatedLights = lights.map((light) =>
                              light.id === selectedLight.id
                                ? { ...light, direction: newDirection }
                                : light
                            );
                            setLights(updatedLights);
                            setSelectedLight({
                              ...selectedLight,
                              direction: newDirection,
                            });
                          }}
                          style={{
                            background: "#1f1f1f",
                            color: "#f5f5f5",
                            border: "1px solid #2a2a2a",
                            fontSize: 12,
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            )}

            {/* AI建议 */}
            <div>
              <h4
                style={{
                  color: "#c0c0c0",
                  fontSize: 12,
                  marginBottom: 12,
                  margin: "0 0 12px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                AI建议
                {isLoadingAI && (
                  <span style={{ fontSize: 10, color: "#a8c090" }}>
                    分析中...
                  </span>
                )}
              </h4>

              {aiSuggestions.length === 0 ? (
                <Card
                  style={{
                    background: "#1f1f1f",
                    border: "1px solid #2a2a2a",
                    marginBottom: 12,
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  <p style={{ color: "#888", fontSize: 10, margin: 0 }}>
                    {isLoadingAI
                      ? "正在分析舞台数据..."
                      : "暂无AI建议，点击上方按钮获取建议"}
                  </p>
                </Card>
              ) : (
                aiSuggestions.map((suggestion, index) => (
                  <Card
                    key={suggestion.id || index}
                    style={{
                      background: "#1f1f1f",
                      border: "none",
                      borderLeft: `3px solid ${aiService.getPriorityColor(
                        suggestion.priority
                      )}`,
                      marginBottom: 12,
                      padding: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          marginRight: 8,
                          fontSize: 14,
                        }}
                      >
                        {suggestion.icon ||
                          aiService.getIconForSuggestionType(suggestion.type)}
                      </span>
                      <h5
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#f5f5f5",
                          margin: 0,
                          flex: 1,
                        }}
                      >
                        {suggestion.type}
                      </h5>
                      <span
                        style={{
                          fontSize: 8,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: aiService.getPriorityColor(
                            suggestion.priority
                          ),
                          color: "#fff",
                          fontWeight: "bold",
                        }}
                      >
                        {suggestion.priority}
                      </span>
                    </div>
                    <p
                      style={{
                        color: "#c0c0c0",
                        fontSize: 10,
                        marginBottom: 8,
                        margin: "0 0 8px 0",
                        lineHeight: 1.4,
                      }}
                    >
                      {suggestion.description}
                    </p>
                    {suggestion.specific_action && (
                      <p
                        style={{
                          color: "#a8c090",
                          fontSize: 9,
                          marginBottom: 8,
                          margin: "0 0 8px 0",
                          fontStyle: "italic",
                        }}
                      >
                        💡 {suggestion.specific_action}
                      </p>
                    )}
                    {suggestion.time_range && (
                      <p
                        style={{
                          color: "#81a1c1",
                          fontSize: 9,
                          marginBottom: 8,
                          margin: "0 0 8px 0",
                        }}
                      >
                        ⏱️ {aiService.formatTimeRange(suggestion.time_range)}
                      </p>
                    )}
                    {suggestion.affected_actors &&
                      suggestion.affected_actors.length > 0 && (
                        <p
                          style={{
                            color: "#e6b17a",
                            fontSize: 9,
                            marginBottom: 8,
                            margin: "0 0 8px 0",
                          }}
                        >
                          👥 涉及演员: {suggestion.affected_actors.join(", ")}
                        </p>
                      )}
                    <Button
                      type="link"
                      onClick={() => applyAISuggestion(suggestion)}
                      style={{
                        color: "#a8c090",
                        fontSize: 10,
                        padding: 0,
                      }}
                    >
                      应用建议
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Sider>
      </Layout>

      {/* 底部间距 */}
      <div style={{ height: "48px", background: "#0a0a0a" }} />

      {/* 添加演员模态框 */}
      <Modal
        title="添加演员"
        open={addActorModalVisible}
        onOk={addActor}
        onCancel={() => {
          setAddActorModalVisible(false);
          actorForm.resetFields();
        }}
        okText="添加"
        cancelText="取消"
      >
        <Form form={actorForm} layout="vertical">
          <Form.Item
            label="演员姓名"
            name="name"
            rules={[{ required: true, message: "请输入演员姓名" }]}
          >
            <Input placeholder="请输入演员姓名" />
          </Form.Item>
          <Form.Item
            label="角色类型"
            name="role"
            rules={[{ required: true, message: "请选择角色类型" }]}
          >
            <Select placeholder="选择角色类型">
              <Select.Option value="主演">主演</Select.Option>
              <Select.Option value="配演">配演</Select.Option>
              <Select.Option value="群演">群演</Select.Option>
              <Select.Option value="特邀">特邀</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="移动速度 (m/s)" name="speed" initialValue={1.0}>
            <Input type="number" min={0.1} max={5.0} step={0.1} />
          </Form.Item>
          <Form.Item label="标记颜色" name="color" initialValue="#a8c090">
            <div style={{ display: "flex", gap: 8 }}>
              {[
                "#a8c090",
                "#81a1c1",
                "#e6b17a",
                "#d08770",
                "#b48ead",
                "#88c0d0",
              ].map((color) => (
                <div
                  key={color}
                  onClick={() => actorForm.setFieldsValue({ color })}
                  style={{
                    width: 32,
                    height: 32,
                    background: color,
                    border: "1px solid #2a2a2a",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                />
              ))}
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加舞台元素模态框 */}
      <Modal
        title="添加舞台元素"
        open={addElementModalVisible}
        onOk={() => {
          console.log("Element modal OK button clicked"); // 调试日志
          addStageElement();
        }}
        onCancel={() => {
          console.log("Element modal cancelled"); // 调试日志
          setAddElementModalVisible(false);
          elementForm.resetFields();
        }}
        okText="添加"
        cancelText="取消"
      >
        <Form form={elementForm} layout="vertical">
          <Form.Item
            label="元素类型"
            name="type"
            rules={[{ required: true, message: "请选择元素类型" }]}
          >
            <Select placeholder="选择元素类型">
              <Select.Option value="prop">道具</Select.Option>
              <Select.Option value="scenery">布景</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="元素名称"
            name="name"
            rules={[{ required: true, message: "请输入元素名称" }]}
          >
            <Input placeholder="请输入元素名称" />
          </Form.Item>
          <Form.Item label="图标" name="icon" initialValue="📦">
            <Select placeholder="选择图标">
              <Select.Option value="🪑">🪑 椅子</Select.Option>
              <Select.Option value="🪞">🪞 桌子</Select.Option>
              <Select.Option value="🎭">🎭 面具</Select.Option>
              <Select.Option value="🎪">🎪 帐篷</Select.Option>
              <Select.Option value="🎨">🎨 画板</Select.Option>
              <Select.Option value="📦">📦 箱子</Select.Option>
              <Select.Option value="🌳">🌳 树</Select.Option>
              <Select.Option value="🏛️">🏛️ 建筑</Select.Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="宽度 (px)" name="width" initialValue={40}>
                <Input type="number" min={20} max={200} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="高度 (px)" name="height" initialValue={40}>
                <Input type="number" min={20} max={200} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 灯光模态框 */}
      <Modal
        title={selectedLight ? "编辑灯光" : "添加灯光"}
        open={lightModalVisible}
        onOk={() => {
          if (selectedLight) {
            // 编辑现有灯光
            lightForm.validateFields().then((values) => {
              const updatedLights = lights.map((light) =>
                light.id === selectedLight.id ? { ...light, ...values } : light
              );
              setLights(updatedLights);
              message.success("灯光更新成功！");
              setLightModalVisible(false);
              setSelectedLight(null);
              lightForm.resetFields();
            });
          } else {
            // 添加新灯光
            addLight();
          }
        }}
        onCancel={() => {
          setLightModalVisible(false);
          setSelectedLight(null);
          lightForm.resetFields();
        }}
        okText={selectedLight ? "更新" : "添加"}
        cancelText="取消"
        width={600}
      >
        <Form form={lightForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="灯光名称"
                name="name"
                rules={[{ required: true, message: "请输入灯光名称" }]}
              >
                <Input placeholder="如：主光、追光1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="灯光类型"
                name="type"
                rules={[{ required: true, message: "请选择灯光类型" }]}
              >
                <Select placeholder="选择灯光类型">
                  <Select.Option value="spot">聚光灯</Select.Option>
                  <Select.Option value="flood">泛光灯</Select.Option>
                  <Select.Option value="wash">洗墙灯</Select.Option>
                  <Select.Option value="follow">追光灯</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="X位置 (px)" name="x" initialValue={400}>
                <Input
                  type="number"
                  min={-100}
                  max={900}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (selectedLight) {
                      updateLightPosition(
                        selectedLight.id,
                        value,
                        selectedLight.y
                      );
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Y位置 (px)" name="y" initialValue={100}>
                <Input
                  type="number"
                  min={-100}
                  max={600}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (selectedLight) {
                      updateLightPosition(
                        selectedLight.id,
                        selectedLight.x,
                        value
                      );
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="朝向角度" name="direction" initialValue={0}>
                <Input
                  type="number"
                  min={0}
                  max={360}
                  addonAfter="°"
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (selectedLight) {
                      setLights((prev) =>
                        prev.map((light) =>
                          light.id === selectedLight.id
                            ? { ...light, direction: value }
                            : light
                        )
                      );
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="光束角度" name="beamAngle" initialValue={30}>
                <Input type="number" min={5} max={120} addonAfter="°" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="亮度 %" name="intensity" initialValue={100}>
                <Input type="number" min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="颜色" name="color" initialValue="#FFFFFF">
                <Input type="color" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="开始时间 (秒)"
                name="startTime"
                initialValue={0}
              >
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="持续时间 (秒)"
                name="duration"
                initialValue={10}
              >
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 音乐模态框 */}
      <Modal
        title={selectedMusic ? "编辑音乐" : "添加音乐"}
        open={musicModalVisible}
        onOk={() => {
          if (selectedMusic) {
            // 编辑现有音乐
            musicForm.validateFields().then((values) => {
              const updatedMusic = musicTracks.map((music) =>
                music.id === selectedMusic.id ? { ...music, ...values } : music
              );
              setMusicTracks(updatedMusic);
              message.success("音乐更新成功！");
              setMusicModalVisible(false);
              setSelectedMusic(null);
              musicForm.resetFields();
            });
          } else {
            // 添加新音乐
            addMusic();
          }
        }}
        onCancel={() => {
          setMusicModalVisible(false);
          setSelectedMusic(null);
          musicForm.resetFields();
        }}
        okText={selectedMusic ? "更新" : "添加"}
        cancelText="取消"
      >
        <Form form={musicForm} layout="vertical">
          <Form.Item
            label="音乐名称"
            name="name"
            rules={[{ required: true, message: "请输入音乐名称" }]}
          >
            <Input placeholder="如：背景音乐、主题曲" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="开始时间 (秒)"
                name="startTime"
                initialValue={0}
              >
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="持续时间 (秒)"
                name="duration"
                initialValue={30}
              >
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="音量 %" name="volume" initialValue={80}>
                <Input type="number" min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="淡入 (秒)" name="fadeIn" initialValue={0}>
                <Input type="number" min={0} max={10} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="淡出 (秒)" name="fadeOut" initialValue={0}>
                <Input type="number" min={0} max={10} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="音频文件" name="file">
            <Input placeholder="音频文件路径或URL" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 台词模态框 */}
      <Modal
        title={selectedDialogue ? "编辑台词" : "添加台词"}
        open={dialogueModalVisible}
        onOk={selectedDialogue ? updateDialogue : addDialogue}
        onCancel={() => {
          setDialogueModalVisible(false);
          setSelectedDialogue(null);
          dialogueForm.resetFields();
        }}
        okText={selectedDialogue ? "更新" : "添加"}
        cancelText="取消"
        width={600}
      >
        <Form form={dialogueForm} layout="vertical">
          <Form.Item
            label="台词内容"
            name="content"
            rules={[{ required: true, message: "请输入台词内容" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入台词内容..."
              showCount
              maxLength={200}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="开始时间 (秒)"
                name="startTime"
                initialValue={0}
              >
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="持续时间 (秒)" name="duration" initialValue={5}>
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="情感色彩" name="emotion">
                <Select placeholder="选择情感" allowClear>
                  <Select.Option value="平静">平静</Select.Option>
                  <Select.Option value="激动">激动</Select.Option>
                  <Select.Option value="愤怒">愤怒</Select.Option>
                  <Select.Option value="悲伤">悲伤</Select.Option>
                  <Select.Option value="喜悦">喜悦</Select.Option>
                  <Select.Option value="紧张">紧张</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="音量 %" name="volume" initialValue={80}>
                <Input type="number" min={0} max={100} />
              </Form.Item>
            </Col>
          </Row>
          {selectedActor && (
            <div
              style={{
                padding: "12px",
                background: "#1f1f1f",
                borderRadius: "4px",
                marginBottom: "16px",
              }}
            >
              <span style={{ color: "#c0c0c0", fontSize: "12px" }}>
                演员：
                <span
                  style={{ color: selectedActor.color, fontWeight: "bold" }}
                >
                  {selectedActor.name}
                </span>
              </span>
            </div>
          )}
        </Form>
      </Modal>

      {/* 移动路径模态框 */}
      <Modal
        title={selectedMovement ? "编辑移动路径" : "添加移动路径"}
        open={movementModalVisible}
        onOk={
          selectedMovement
            ? () => {
                // 编辑现有移动
                movementForm.validateFields().then((values) => {
                  const updatedMovements = movements.map((movement) =>
                    movement.id === selectedMovement.id
                      ? { ...movement, ...values }
                      : movement
                  );
                  setMovements(updatedMovements);
                  message.success("移动路径更新成功！");
                  setMovementModalVisible(false);
                  setSelectedMovement(null);
                  movementForm.resetFields();
                });
              }
            : addMovement
        }
        onCancel={() => {
          setMovementModalVisible(false);
          setSelectedMovement(null);
          setCurrentPath([]);
          movementForm.resetFields();
        }}
        okText={selectedMovement ? "更新" : "添加"}
        cancelText="取消"
        width={600}
      >
        <Form form={movementForm} layout="vertical">
          <Form.Item
            label="移动名称"
            name="name"
            rules={[{ required: true, message: "请输入移动名称" }]}
          >
            <Input placeholder="如：入场、退场、走向中央" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="开始时间 (秒)"
                name="startTime"
                initialValue={0}
                rules={[{ required: true, message: "请输入开始时间" }]}
              >
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="持续时间 (秒)"
                name="duration"
                initialValue={5}
                rules={[{ required: true, message: "请输入持续时间" }]}
              >
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="移动速度" name="speed" initialValue={1}>
                <Select>
                  <Select.Option value={0.5}>慢速</Select.Option>
                  <Select.Option value={1}>正常</Select.Option>
                  <Select.Option value={1.5}>快速</Select.Option>
                  <Select.Option value={2}>急速</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="路径类型" name="pathType" initialValue="linear">
                <Select>
                  <Select.Option value="linear">直线</Select.Option>
                  <Select.Option value="curved">曲线</Select.Option>
                  <Select.Option value="bezier">贝塞尔曲线</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          {selectedActor && (
            <div
              style={{
                padding: "12px",
                background: "#1f1f1f",
                borderRadius: "4px",
                marginBottom: "16px",
              }}
            >
              <span style={{ color: "#c0c0c0", fontSize: "12px" }}>
                演员：
                <span
                  style={{ color: selectedActor.color, fontWeight: "bold" }}
                >
                  {selectedActor.name}
                </span>
              </span>
              <div
                style={{ color: "#888", fontSize: "10px", marginTop: "4px" }}
              >
                路径点数：{currentPath.length}
              </div>
            </div>
          )}
        </Form>
      </Modal>

      {/* 区域模态框 */}
      <Modal
        title="添加表演区域"
        open={areaModalVisible}
        onOk={addArea}
        onCancel={() => {
          setAreaModalVisible(false);
          setCurrentAreaPoints([]);
          areaForm.resetFields();
        }}
        okText="添加"
        cancelText="取消"
        width={600}
      >
        <Form form={areaForm} layout="vertical">
          <Form.Item
            label="区域名称"
            name="name"
            rules={[{ required: true, message: "请输入区域名称" }]}
          >
            <Input placeholder="如：表演区、观众席、后台" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="区域类型"
                name="type"
                rules={[{ required: true, message: "请选择区域类型" }]}
              >
                <Select placeholder="选择区域类型">
                  <Select.Option value="performance">表演区</Select.Option>
                  <Select.Option value="stage">舞台区</Select.Option>
                  <Select.Option value="backstage">后台区</Select.Option>
                  <Select.Option value="audience">观众区</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="区域颜色" name="color" initialValue="#a8c090">
                <Input type="color" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="透明度" name="opacity" initialValue={0.3}>
            <Input
              type="number"
              min={0.1}
              max={1}
              step={0.1}
              addonAfter="(0.1-1.0)"
            />
          </Form.Item>
          <div
            style={{
              padding: "12px",
              background: "#1f1f1f",
              borderRadius: "4px",
              marginBottom: "16px",
            }}
          >
            <span style={{ color: "#c0c0c0", fontSize: "12px" }}>
              顶点数：{currentAreaPoints.length}
            </span>
            <div style={{ color: "#888", fontSize: "10px", marginTop: "4px" }}>
              最少需要3个顶点才能形成区域
            </div>
          </div>
        </Form>
      </Modal>
    </Layout>
  );
};

export default StageEditor;
