import React, { useEffect, useRef } from 'react';
import { Button, Slider, Space, Typography } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StepBackwardOutlined,
  StepForwardOutlined
} from '@ant-design/icons';
import { useAppContext, useAppActions } from '../../contexts/AppContext';

const { Text } = Typography;

const Timeline: React.FC = () => {
  const { state } = useAppContext();
  const actions = useAppActions();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    actions.setPlaying(!state.isPlaying);
  };

  const handleTimeChange = (value: number) => {
    actions.setCurrentTime(value);
  };

  const handleStepBackward = () => {
    const newTime = Math.max(0, state.currentTime - 1);
    actions.setCurrentTime(newTime);
  };

  const handleStepForward = () => {
    const maxTime = state.currentVideo?.duration || 0;
    const newTime = Math.min(maxTime, state.currentTime + 1);
    actions.setCurrentTime(newTime);
  };

  const handleReset = () => {
    actions.setCurrentTime(0);
    actions.setPlaying(false);
  };

  // 播放时自动更新时间
  useEffect(() => {
    if (state.isPlaying && state.currentVideo) {
      intervalRef.current = setInterval(() => {
        const newTime = state.currentTime + 0.1;
        if (newTime >= state.currentVideo!.duration) {
          actions.setPlaying(false);
          actions.setCurrentTime(state.currentVideo!.duration);
        } else {
          actions.setCurrentTime(newTime);
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isPlaying, state.currentVideo, state.currentTime, actions]);

  if (!state.currentVideo) {
    return null;
  }

  const duration = state.currentVideo.duration;
  const currentTime = state.currentTime;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{ 
      padding: '16px 24px', 
      borderTop: '1px solid #f0f0f0',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }}>
      {/* 播放控制按钮 */}
      <Space size="small">
        <Button 
          icon={<StepBackwardOutlined />} 
          onClick={handleStepBackward}
          size="small"
          title="后退1秒"
        />
        <Button 
          type="primary"
          icon={state.isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          onClick={handlePlayPause}
          size="large"
        />
        <Button 
          icon={<StepForwardOutlined />} 
          onClick={handleStepForward}
          size="small"
          title="前进1秒"
        />
        <Button 
          onClick={handleReset}
          size="small"
        >
          重置
        </Button>
      </Space>

      {/* 时间显示 */}
      <Space size="small">
        <Text style={{ minWidth: 50, textAlign: 'right' }}>
          {formatTime(currentTime)}
        </Text>
        <Text type="secondary">/</Text>
        <Text type="secondary" style={{ minWidth: 50 }}>
          {formatTime(duration)}
        </Text>
      </Space>

      {/* 时间轴滑块 */}
      <div style={{ flex: 1, margin: '0 16px' }}>
        <Slider
          min={0}
          max={duration}
          step={0.1}
          value={currentTime}
          onChange={handleTimeChange}
          tooltip={{ 
            formatter: (value) => formatTime(value || 0),
            placement: 'top'
          }}
          trackStyle={{ background: '#1890ff' }}
          handleStyle={{ borderColor: '#1890ff' }}
        />
      </div>

      {/* 进度百分比 */}
      <Text type="secondary" style={{ minWidth: 50, textAlign: 'right' }}>
        {Math.round(progress)}%
      </Text>

      {/* 播放状态指示 */}
      <div style={{ 
        width: 8, 
        height: 8, 
        borderRadius: '50%', 
        background: state.isPlaying ? '#52c41a' : '#d9d9d9',
        marginLeft: 8
      }} />
    </div>
  );
};

export default Timeline;