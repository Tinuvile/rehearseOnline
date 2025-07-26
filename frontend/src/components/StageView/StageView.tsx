import React, { useRef, useEffect, useState } from "react";
import { Empty, Typography } from "antd";
import { useAppContext, useAppActions } from "../../contexts/AppContext";
import { stageApi } from "../../services/api";
import { ActorPosition } from "../../types";

const { Text } = Typography;

const StageView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useAppContext();
  const actions = useAppActions();
  const [isDragging, setIsDragging] = useState(false);
  const [dragActorId, setDragActorId] = useState<string | null>(null);

  // 舞台尺寸
  const STAGE_WIDTH = 400;
  const STAGE_HEIGHT = 300;
  const ACTOR_RADIUS = 6;

  // 获取当前时间点的演员位置
  const getCurrentPositions = (): ActorPosition[] => {
    return state.actorPositions.filter(
      (pos) => Math.abs(pos.timestamp - state.currentTime) < 0.5
    );
  };

  // 获取演员的移动轨迹
  const getActorPath = (actorId: string): ActorPosition[] => {
    return state.actorPositions
      .filter((pos) => pos.actor_id === actorId)
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  // 绘制舞台
  const drawStage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制舞台背景
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制舞台边框
    ctx.strokeStyle = "#d9d9d9";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // 绘制网格
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 1;
    const gridSize = 20;

    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 绘制演员轨迹
    state.actors.forEach((actor) => {
      const path = getActorPath(actor.id);
      if (path.length > 1) {
        ctx.strokeStyle = actor.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;

        ctx.beginPath();
        path.forEach((pos, index) => {
          const x = pos.position_2d.x;
          const y = pos.position_2d.y;

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // 绘制当前位置的演员
    const currentPositions = getCurrentPositions();
    currentPositions.forEach((pos) => {
      const actor = state.actors.find((a) => a.id === pos.actor_id);
      if (!actor) return;

      const x = pos.position_2d.x;
      const y = pos.position_2d.y;

      // 绘制演员圆点
      ctx.fillStyle = actor.color;
      ctx.beginPath();
      ctx.arc(x, y, ACTOR_RADIUS, 0, 2 * Math.PI);
      ctx.fill();

      // 绘制白色边框
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制演员名称
      ctx.fillStyle = "#333";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(actor.name, x, y - ACTOR_RADIUS - 5);
    });
  };

  // 获取鼠标在画布上的位置
  const getMousePos = (
    e: React.MouseEvent<HTMLCanvasElement>
  ): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // 检查点击是否在演员上
  const getActorAtPosition = (x: number, y: number): string | null => {
    const currentPositions = getCurrentPositions();

    for (const pos of currentPositions) {
      const dx = x - pos.position_2d.x;
      const dy = y - pos.position_2d.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= ACTOR_RADIUS + 2) {
        return pos.actor_id;
      }
    }

    return null;
  };

  // 鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const actorId = getActorAtPosition(pos.x, pos.y);

    if (actorId) {
      setIsDragging(true);
      setDragActorId(actorId);
    }
  };

  // 鼠标移动事件
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragActorId || !state.currentVideo) return;

    const pos = getMousePos(e);

    // 限制在画布范围内
    const x = Math.max(
      ACTOR_RADIUS,
      Math.min(pos.x, STAGE_WIDTH - ACTOR_RADIUS)
    );
    const y = Math.max(
      ACTOR_RADIUS,
      Math.min(pos.y, STAGE_HEIGHT - ACTOR_RADIUS)
    );

    // 更新本地状态
    actions.updateActorPosition(dragActorId, state.currentTime, { x, y });
  };

  // 鼠标释放事件
  const handleMouseUp = async () => {
    if (!isDragging || !dragActorId || !state.currentVideo) return;

    try {
      // 获取更新后的位置
      const currentPositions = getCurrentPositions();
      const updatedPos = currentPositions.find(
        (pos) => pos.actor_id === dragActorId
      );

      if (updatedPos) {
        // 发送到后端
        await stageApi.updateActorPosition(
          dragActorId,
          updatedPos.position_2d,
          state.currentTime
        );
      }
    } catch (error) {
      console.error("更新演员位置失败:", error);
    } finally {
      setIsDragging(false);
      setDragActorId(null);
    }
  };

  // 重绘画布
  useEffect(() => {
    drawStage();
  }, [state.actors, state.actorPositions, state.currentTime]);

  // 设置画布尺寸
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = STAGE_WIDTH;
      canvas.height = STAGE_HEIGHT;
    }
  }, []);

  if (state.actors.length === 0) {
    return (
      <Empty description="暂无演员数据" image={Empty.PRESENTED_IMAGE_SIMPLE}>
        <Text type="secondary">上传视频后，AI将自动识别演员位置</Text>
      </Empty>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <canvas
        ref={canvasRef}
        className="stage-canvas"
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: 4,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <div style={{ textAlign: "center" }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 拖拽演员圆点可调整位置 | 当前时间:{" "}
          {Math.round(state.currentTime * 10) / 10}s
        </Text>
      </div>
    </div>
  );
};

export default StageView;
