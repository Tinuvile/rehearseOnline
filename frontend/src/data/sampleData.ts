// 样例数据 - 用于演示预览模式
export interface SampleDialogue {
  id: string;
  actorId: number;
  content: string;
  startTime: number;
  duration: number;
  emotion?: string;
  volume?: number;
}

export interface SampleActorPosition {
  actorId: number;
  time: number;
  x: number;
  y: number;
  rotation?: number;
}

export interface SamplePreviewData {
  dialogues: SampleDialogue[];
  actorPositions: SampleActorPosition[];
  totalDuration: number; // 总时长（秒）
}

// 样例台词数据
export const sampleDialogues: SampleDialogue[] = [
  {
    id: "dialogue_1",
    actorId: 1,
    content: "欢迎来到我们的舞台表演！今天将为大家带来一场精彩的演出。",
    startTime: 2,
    duration: 4,
    emotion: "喜悦",
    volume: 85,
  },
  {
    id: "dialogue_2",
    actorId: 2,
    content: "是的，我们准备了很久，希望能够带给观众最好的体验。",
    startTime: 7,
    duration: 3.5,
    emotion: "平静",
    volume: 80,
  },
  {
    id: "dialogue_3",
    actorId: 3,
    content: "让我们开始这次奇妙的旅程吧！",
    startTime: 11,
    duration: 2.5,
    emotion: "激动",
    volume: 90,
  },
  {
    id: "dialogue_4",
    actorId: 1,
    content: "在这个故事中，我们将探索友谊与勇气的真谛。",
    startTime: 15,
    duration: 4,
    emotion: "平静",
    volume: 85,
  },
  {
    id: "dialogue_5",
    actorId: 2,
    content: "每个人都有自己的角色，都有自己的使命。",
    startTime: 20,
    duration: 3,
    emotion: "平静",
    volume: 80,
  },
  {
    id: "dialogue_6",
    actorId: 3,
    content: "但最重要的是，我们要团结一心！",
    startTime: 24,
    duration: 2.5,
    emotion: "激动",
    volume: 95,
  },
  {
    id: "dialogue_7",
    actorId: 1,
    content: "没错，只有携手并进，我们才能克服所有困难。",
    startTime: 28,
    duration: 4,
    emotion: "平静",
    volume: 85,
  },
  {
    id: "dialogue_8",
    actorId: 2,
    content: "前方的路虽然充满挑战...",
    startTime: 33,
    duration: 2.5,
    emotion: "紧张",
    volume: 75,
  },
  {
    id: "dialogue_9",
    actorId: 3,
    content: "但我们有信心面对一切！",
    startTime: 36,
    duration: 2,
    emotion: "激动",
    volume: 90,
  },
  {
    id: "dialogue_10",
    actorId: 1,
    content: "让我们一起踏上这段冒险之旅！",
    startTime: 39,
    duration: 3,
    emotion: "喜悦",
    volume: 85,
  },
];

// 样例演员位置数据（逐帧移动轨迹）
export const sampleActorPositions: SampleActorPosition[] = [
  // 演员1的移动轨迹
  { actorId: 1, time: 0, x: 200, y: 120 },
  { actorId: 1, time: 2, x: 250, y: 150 },
  { actorId: 1, time: 4, x: 300, y: 180 },
  { actorId: 1, time: 6, x: 350, y: 200 },
  { actorId: 1, time: 8, x: 400, y: 220 },
  { actorId: 1, time: 10, x: 420, y: 200 },
  { actorId: 1, time: 12, x: 450, y: 180 },
  { actorId: 1, time: 14, x: 480, y: 160 },
  { actorId: 1, time: 16, x: 500, y: 140 },
  { actorId: 1, time: 18, x: 520, y: 160 },
  { actorId: 1, time: 20, x: 540, y: 180 },
  { actorId: 1, time: 22, x: 520, y: 200 },
  { actorId: 1, time: 24, x: 500, y: 220 },
  { actorId: 1, time: 26, x: 480, y: 240 },
  { actorId: 1, time: 28, x: 460, y: 220 },
  { actorId: 1, time: 30, x: 440, y: 200 },
  { actorId: 1, time: 32, x: 420, y: 180 },
  { actorId: 1, time: 34, x: 400, y: 160 },
  { actorId: 1, time: 36, x: 380, y: 140 },
  { actorId: 1, time: 38, x: 360, y: 120 },
  { actorId: 1, time: 40, x: 340, y: 100 },
  { actorId: 1, time: 42, x: 320, y: 120 },

  // 演员2的移动轨迹
  { actorId: 2, time: 0, x: 350, y: 200 },
  { actorId: 2, time: 2, x: 330, y: 220 },
  { actorId: 2, time: 4, x: 310, y: 240 },
  { actorId: 2, time: 6, x: 290, y: 260 },
  { actorId: 2, time: 8, x: 270, y: 280 },
  { actorId: 2, time: 10, x: 250, y: 300 },
  { actorId: 2, time: 12, x: 270, y: 320 },
  { actorId: 2, time: 14, x: 290, y: 300 },
  { actorId: 2, time: 16, x: 310, y: 280 },
  { actorId: 2, time: 18, x: 330, y: 260 },
  { actorId: 2, time: 20, x: 350, y: 240 },
  { actorId: 2, time: 22, x: 370, y: 220 },
  { actorId: 2, time: 24, x: 390, y: 200 },
  { actorId: 2, time: 26, x: 410, y: 180 },
  { actorId: 2, time: 28, x: 430, y: 160 },
  { actorId: 2, time: 30, x: 450, y: 140 },
  { actorId: 2, time: 32, x: 470, y: 160 },
  { actorId: 2, time: 34, x: 450, y: 180 },
  { actorId: 2, time: 36, x: 430, y: 200 },
  { actorId: 2, time: 38, x: 410, y: 220 },
  { actorId: 2, time: 40, x: 390, y: 240 },
  { actorId: 2, time: 42, x: 370, y: 260 },

  // 演员3的移动轨迹
  { actorId: 3, time: 0, x: 150, y: 250 },
  { actorId: 3, time: 2, x: 170, y: 270 },
  { actorId: 3, time: 4, x: 190, y: 290 },
  { actorId: 3, time: 6, x: 210, y: 310 },
  { actorId: 3, time: 8, x: 230, y: 330 },
  { actorId: 3, time: 10, x: 250, y: 350 },
  { actorId: 3, time: 12, x: 270, y: 330 },
  { actorId: 3, time: 14, x: 290, y: 310 },
  { actorId: 3, time: 16, x: 310, y: 290 },
  { actorId: 3, time: 18, x: 330, y: 270 },
  { actorId: 3, time: 20, x: 350, y: 250 },
  { actorId: 3, time: 22, x: 330, y: 230 },
  { actorId: 3, time: 24, x: 310, y: 210 },
  { actorId: 3, time: 26, x: 290, y: 190 },
  { actorId: 3, time: 28, x: 270, y: 170 },
  { actorId: 3, time: 30, x: 250, y: 150 },
  { actorId: 3, time: 32, x: 230, y: 130 },
  { actorId: 3, time: 34, x: 210, y: 110 },
  { actorId: 3, time: 36, x: 190, y: 130 },
  { actorId: 3, time: 38, x: 170, y: 150 },
  { actorId: 3, time: 40, x: 150, y: 170 },
  { actorId: 3, time: 42, x: 130, y: 190 },
];

// 完整的样例预览数据
export const samplePreviewData: SamplePreviewData = {
  dialogues: sampleDialogues,
  actorPositions: sampleActorPositions,
  totalDuration: 45, // 45秒的演出
};

// 辅助函数：根据时间获取演员位置
export const getActorPositionAtTime = (
  actorId: number,
  time: number
): { x: number; y: number } => {
  const positions = sampleActorPositions.filter(
    (pos) => pos.actorId === actorId
  );

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

// 辅助函数：获取当前时间的台词
export const getDialoguesAtTime = (time: number): SampleDialogue[] => {
  return sampleDialogues.filter(
    (dialogue) =>
      time >= dialogue.startTime &&
      time <= dialogue.startTime + dialogue.duration
  );
};
