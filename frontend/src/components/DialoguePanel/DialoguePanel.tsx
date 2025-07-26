/**
 * 台词显示面板组件
 * 显示当前时间对应的台词内容，支持预览模式
 */

import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Avatar,
  Progress,
  Tag,
  Empty,
  Space,
  Divider,
} from "antd";
import {
  UserOutlined,
  SoundOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Text, Paragraph } = Typography;

// 台词接口
interface Dialogue {
  id: string;
  actorId: number | string;
  content: string;
  startTime: number;
  duration: number;
  emotion?: string | null;
  volume?: number;
}

// 演员接口
interface Actor {
  id: number | string;
  name: string;
  color: string;
  role?: string;
}

// 组件Props
interface DialoguePanelProps {
  currentTime: number;
  dialogues: Dialogue[];
  actors: Actor[];
  isPreviewMode?: boolean;
  maxDuration?: number;
}

const DialoguePanel: React.FC<DialoguePanelProps> = ({
  currentTime,
  dialogues,
  actors,
  isPreviewMode = false,
  maxDuration = 100,
}) => {
  const [currentDialogues, setCurrentDialogues] = useState<Dialogue[]>([]);
  const [upcomingDialogues, setUpcomingDialogues] = useState<Dialogue[]>([]);

  // 根据当前时间筛选台词
  useEffect(() => {
    // 当前正在进行的台词
    const current = dialogues.filter((dialogue) => {
      const endTime = dialogue.startTime + dialogue.duration;
      return dialogue.startTime <= currentTime && currentTime < endTime;
    });

    // 即将到来的台词（未来5秒内）
    const upcoming = dialogues
      .filter((dialogue) => {
        return (
          dialogue.startTime > currentTime &&
          dialogue.startTime <= currentTime + 5
        );
      })
      .slice(0, 3); // 最多显示3条即将到来的台词

    setCurrentDialogues(current);
    setUpcomingDialogues(upcoming);
  }, [currentTime, dialogues]);

  // 获取演员信息
  const getActorInfo = (actorId: number | string): Actor | null => {
    return actors.find((actor) => actor.id === actorId) || null;
  };

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 获取情感颜色
  const getEmotionColor = (emotion?: string | null): string => {
    if (!emotion) return "default";

    switch (emotion.toLowerCase()) {
      case "positive":
      case "happy":
      case "joy":
        return "success";
      case "negative":
      case "sad":
      case "angry":
        return "error";
      case "neutral":
        return "default";
      case "surprise":
        return "warning";
      default:
        return "processing";
    }
  };

  // 获取情感文本
  const getEmotionText = (emotion?: string | null): string => {
    if (!emotion) return "中性";

    const emotionMap: Record<string, string> = {
      positive: "积极",
      negative: "消极",
      neutral: "中性",
      happy: "快乐",
      sad: "悲伤",
      angry: "愤怒",
      surprise: "惊讶",
      joy: "喜悦",
    };

    return emotionMap[emotion.toLowerCase()] || emotion;
  };

  // 渲染台词卡片
  const renderDialogueCard = (
    dialogue: Dialogue,
    isCurrent: boolean = false
  ) => {
    const actor = getActorInfo(dialogue.actorId);
    const progress = isCurrent
      ? ((currentTime - dialogue.startTime) / dialogue.duration) * 100
      : 0;

    return (
      <Card
        key={dialogue.id}
        size="small"
        style={{
          marginBottom: 12,
          backgroundColor: isCurrent ? "#f6ffed" : "#fafafa",
          border: isCurrent ? "2px solid #52c41a" : "1px solid #d9d9d9",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {/* 演员信息 */}
          <Space>
            <Avatar
              size="small"
              style={{
                backgroundColor: actor?.color || "#1890ff",
                color: "#fff",
              }}
              icon={!actor ? <UserOutlined /> : undefined}
            >
              {actor?.name?.charAt(0)}
            </Avatar>
            <div>
              <Text strong style={{ fontSize: "12px" }}>
                {actor?.name || "未知演员"}
              </Text>
              {actor?.role && (
                <Text
                  type="secondary"
                  style={{ fontSize: "10px", marginLeft: 8 }}
                >
                  {actor.role}
                </Text>
              )}
            </div>
          </Space>

          {/* 台词内容 */}
          <Paragraph
            style={{
              margin: 0,
              fontSize: "13px",
              lineHeight: "1.4",
            }}
            ellipsis={{ rows: 3, expandable: true, symbol: "展开" }}
          >
            {dialogue.content}
          </Paragraph>

          {/* 时间和情感标签 */}
          <Space
            split={<Divider type="vertical" />}
            style={{ fontSize: "11px" }}
          >
            <Text type="secondary">
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {formatTime(dialogue.startTime)}
            </Text>

            {dialogue.emotion && (
              <Tag
                color={getEmotionColor(dialogue.emotion)}
                style={{ margin: 0, fontSize: "10px" }}
              >
                {getEmotionText(dialogue.emotion)}
              </Tag>
            )}

            {dialogue.volume && (
              <Text type="secondary">
                <SoundOutlined style={{ marginRight: 4 }} />
                {dialogue.volume}%
              </Text>
            )}
          </Space>

          {/* 当前台词的进度条 */}
          {isCurrent && (
            <Progress
              percent={Math.min(100, Math.max(0, progress))}
              size="small"
              status="active"
              strokeColor="#52c41a"
              showInfo={false}
            />
          )}
        </Space>
      </Card>
    );
  };

  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      <Typography.Title level={5} style={{ margin: "0 0 16px 0" }}>
        台词面板
        {isPreviewMode && (
          <Tag color="blue" style={{ marginLeft: 8, fontSize: "10px" }}>
            预览模式
          </Tag>
        )}
      </Typography.Title>

      {/* 当前台词区域 */}
      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ fontSize: "12px", color: "#52c41a" }}>
          当前台词 ({formatTime(currentTime)})
        </Text>
        <div style={{ marginTop: 8 }}>
          {currentDialogues.length > 0 ? (
            currentDialogues.map((dialogue) =>
              renderDialogueCard(dialogue, true)
            )
          ) : (
            <Card
              size="small"
              style={{ textAlign: "center", padding: "12px 0" }}
            >
              <Text type="secondary" style={{ fontSize: "12px" }}>
                当前时间无台词
              </Text>
            </Card>
          )}
        </div>
      </div>

      {/* 即将到来的台词区域 */}
      <div>
        <Text strong style={{ fontSize: "12px", color: "#1890ff" }}>
          即将到来 (未来5秒)
        </Text>
        <div style={{ marginTop: 8 }}>
          {upcomingDialogues.length > 0 ? (
            upcomingDialogues.map((dialogue) =>
              renderDialogueCard(dialogue, false)
            )
          ) : (
            <Card
              size="small"
              style={{ textAlign: "center", padding: "12px 0" }}
            >
              <Text type="secondary" style={{ fontSize: "12px" }}>
                暂无即将到来的台词
              </Text>
            </Card>
          )}
        </div>
      </div>

      {/* 空状态 */}
      {dialogues.length === 0 && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          imageStyle={{ height: 60 }}
          description={
            <Text type="secondary" style={{ fontSize: "12px" }}>
              暂无台词数据
              <br />
              请先上传视频并提取台词
            </Text>
          }
        />
      )}
    </div>
  );
};

export default DialoguePanel;
