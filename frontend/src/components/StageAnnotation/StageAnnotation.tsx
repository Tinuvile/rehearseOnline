import React, { useRef, useEffect, useState, useCallback } from "react";
import { Card, Button, message, Space, Typography, Alert } from "antd";
import { ReloadOutlined, CheckOutlined, UndoOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Point {
  x: number;
  y: number;
}

interface StageAnnotationProps {
  videoFile: File;
  onAnnotationComplete: (points: Point[]) => void;
  onSkip?: () => void;
}

const StageAnnotation: React.FC<StageAnnotationProps> = ({
  videoFile,
  onAnnotationComplete,
  onSkip,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // 从视频提取第一帧
  const extractFirstFrame = useCallback(async () => {
    if (!videoFile || !videoRef.current || !canvasRef.current) return;

    setIsExtracting(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // 创建视频URL
      const videoUrl = URL.createObjectURL(videoFile);
      video.src = videoUrl;

      // 等待视频加载
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          // 计算画布尺寸，保持视频宽高比
          const maxWidth = 800;
          const maxHeight = 600;
          const videoRatio = video.videoWidth / video.videoHeight;

          let displayWidth = maxWidth;
          let displayHeight = maxWidth / videoRatio;

          if (displayHeight > maxHeight) {
            displayHeight = maxHeight;
            displayWidth = maxHeight * videoRatio;
          }

          setCanvasSize({ width: displayWidth, height: displayHeight });
          canvas.width = displayWidth;
          canvas.height = displayHeight;

          resolve(void 0);
        };
        video.onerror = reject;
      });

      // 寻找到第一帧
      video.currentTime = 0;

      await new Promise((resolve) => {
        video.onseeked = () => {
          // 绘制第一帧到画布
          ctx.drawImage(video, 0, 0, canvasSize.width, canvasSize.height);
          setImageLoaded(true);
          URL.revokeObjectURL(videoUrl);
          resolve(void 0);
        };
      });
    } catch (error) {
      console.error("提取第一帧失败:", error);
      message.error("提取视频第一帧失败");
    } finally {
      setIsExtracting(false);
    }
  }, [videoFile, canvasSize.width, canvasSize.height]);

  // 画布点击处理
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || points.length >= 4) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newPoint = { x, y };
      const newPoints = [...points, newPoint];
      setPoints(newPoints);

      // 重新绘制
      drawCanvas(newPoints);
    },
    [points]
  );

  // 绘制画布内容
  const drawCanvas = useCallback(
    (currentPoints: Point[]) => {
      if (!canvasRef.current || !videoRef.current || !imageLoaded) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const video = videoRef.current;

      if (!ctx) return;

      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 重新绘制视频帧
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 绘制已标注的点
      currentPoints.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "#ff4d4f";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 绘制点的编号
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText((index + 1).toString(), point.x, point.y + 4);
      });

      // 绘制连线
      if (currentPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);

        for (let i = 1; i < currentPoints.length; i++) {
          ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
        }

        // 如果有四个点，闭合图形
        if (currentPoints.length === 4) {
          ctx.closePath();
          ctx.fillStyle = "rgba(255, 77, 79, 0.1)";
          ctx.fill();
        }

        ctx.strokeStyle = "#ff4d4f";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    },
    [imageLoaded]
  );

  // 重置标注
  const resetAnnotation = () => {
    setPoints([]);
    drawCanvas([]);
  };

  // 撤销最后一个点
  const undoLastPoint = () => {
    if (points.length === 0) return;
    const newPoints = points.slice(0, -1);
    setPoints(newPoints);
    drawCanvas(newPoints);
  };

  // 确认标注
  const confirmAnnotation = () => {
    if (points.length !== 4) {
      message.warning("请标注4个角点来定义舞台范围");
      return;
    }

    // 将相对坐标转换为比例坐标（0-1之间）
    const relativePoints = points.map((point) => ({
      x: point.x / canvasSize.width,
      y: point.y / canvasSize.height,
    }));

    onAnnotationComplete(relativePoints);
    message.success("舞台范围标注完成！");
  };

  // 初始化
  useEffect(() => {
    if (videoFile) {
      extractFirstFrame();
    }
  }, [videoFile, extractFirstFrame]);

  // 重新绘制当点数组变化时
  useEffect(() => {
    if (imageLoaded) {
      drawCanvas(points);
    }
  }, [points, imageLoaded, drawCanvas]);

  return (
    <Card
      title="舞台范围标注"
      style={{ width: "100%", maxWidth: 900 }}
      extra={
        <Space>
          <Button
            icon={<UndoOutlined />}
            onClick={undoLastPoint}
            disabled={points.length === 0}
            size="small"
          >
            撤销
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={resetAnnotation}
            disabled={points.length === 0}
            size="small"
          >
            重置
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={confirmAnnotation}
            disabled={points.length !== 4}
          >
            确认标注
          </Button>
          {onSkip && (
            <Button onClick={onSkip} size="small">
              跳过标注
            </Button>
          )}
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Alert
          message="标注说明"
          description="请在视频第一帧上依次点击4个角点来标记舞台范围。建议按顺序标注：左上 → 右上 → 右下 → 左下"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <div style={{ textAlign: "center" }}>
          {isExtracting && (
            <div style={{ padding: 40 }}>
              <Text>正在提取视频第一帧...</Text>
            </div>
          )}

          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              border: "2px solid #d9d9d9",
              borderRadius: 8,
              cursor: points.length < 4 ? "crosshair" : "default",
              display: imageLoaded ? "block" : "none",
              margin: "0 auto",
            }}
          />

          <video
            ref={videoRef}
            style={{ display: "none" }}
            muted
            preload="metadata"
          />
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Space>
            <Text type="secondary">已标注: {points.length}/4 个角点</Text>
            {points.length === 4 && (
              <Text type="success">✓ 舞台范围标注完成</Text>
            )}
          </Space>
        </div>
      </Space>
    </Card>
  );
};

export default StageAnnotation;
