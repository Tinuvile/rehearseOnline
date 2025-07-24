import React from 'react';
import { Card, Slider, Button, Space, Typography, Empty, List, Tag } from 'antd';
import { 
  SoundOutlined, 
  PlayCircleOutlined, 
  PauseCircleOutlined,
  StepForwardOutlined,
  StepBackwardOutlined
} from '@ant-design/icons';
import { useAppContext } from '../../contexts/AppContext';
import { MusicCue } from '../../types';

const { Text, Title } = Typography;

const MusicPanel: React.FC = () => {
  const { state } = useAppContext();

  // 获取当前时间点的音乐设置
  const getCurrentMusic = (): MusicCue | null => {
    const currentCues = state.musicCues.filter(cue => 
      Math.abs(cue.timestamp - state.currentTime) < 1.0
    );
    
    return currentCues.length > 0 ? currentCues[0] : null;
  };

  const currentMusic = getCurrentMusic();

  const handleVolumeChange = (value: number) => {
    // TODO: 实现音量变更逻辑
    console.log('音量变更:', value);
  };

  const handlePlayPause = () => {
    // TODO: 实现播放/暂停逻辑
    console.log('播放/暂停');
  };

  const handlePrevTrack = () => {
    // TODO: 实现上一曲逻辑
    console.log('上一曲');
  };

  const handleNextTrack = () => {
    // TODO: 实现下一曲逻辑
    console.log('下一曲');
  };

  const getActionText = (action: string): string => {
    switch (action) {
      case 'start': return '开始';
      case 'stop': return '停止';
      case 'fade_in': return '淡入';
      case 'fade_out': return '淡出';
      default: return action;
    }
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'start': return 'green';
      case 'stop': return 'red';
      case 'fade_in': return 'blue';
      case 'fade_out': return 'orange';
      default: return 'default';
    }
  };

  if (!state.currentVideo) {
    return (
      <Empty
        description="暂无音乐数据"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Text type="secondary">上传视频后可进行音乐控制</Text>
      </Empty>
    );
  }

  return (
    <div className="music-controls">
      {/* 音乐播放控制 */}
      <Card size="small" title={
        <Space>
          <SoundOutlined />
          <span>音乐控制</span>
        </Space>
      }>
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* 播放控制按钮 */}
          <Space size="middle" style={{ justifyContent: 'center', width: '100%' }}>
            <Button 
              icon={<StepBackwardOutlined />} 
              onClick={handlePrevTrack}
              size="small"
            />
            <Button 
              type="primary"
              icon={state.isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={handlePlayPause}
              size="large"
            />
            <Button 
              icon={<StepForwardOutlined />} 
              onClick={handleNextTrack}
              size="small"
            />
          </Space>
          
          {/* 音量控制 */}
          <div>
            <Text>音量:</Text>
            <Slider
              min={0}
              max={100}
              value={currentMusic?.volume ? 
                Math.round(currentMusic.volume * 100) : 
                70
              }
              onChange={handleVolumeChange}
              tooltip={{ formatter: (value) => `${value}%` }}
            />
          </div>
        </Space>
      </Card>

      {/* 当前音乐状态 */}
      {currentMusic && (
        <Card size="small" title="当前音乐状态">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <Text type="secondary">动作: </Text>
              <Tag color={getActionColor(currentMusic.action)}>
                {getActionText(currentMusic.action)}
              </Tag>
            </div>
            <Text type="secondary">
              时间点: {Math.round(currentMusic.timestamp * 10) / 10}s
            </Text>
            {currentMusic.track_id && (
              <Text type="secondary">
                音轨: {currentMusic.track_id}
              </Text>
            )}
            <Text type="secondary">
              音量: {Math.round(currentMusic.volume * 100)}%
            </Text>
            {currentMusic.fade_duration > 0 && (
              <Text type="secondary">
                淡入/淡出时长: {currentMusic.fade_duration}s
              </Text>
            )}
          </Space>
        </Card>
      )}

      {/* 音乐提示列表 */}
      <Card size="small" title="音乐提示">
        <div style={{ maxHeight: 150, overflow: 'auto' }}>
          {state.musicCues.length === 0 ? (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description="暂无音乐提示"
              style={{ margin: '20px 0' }}
            />
          ) : (
            <List
              size="small"
              dataSource={state.musicCues.sort((a, b) => a.timestamp - b.timestamp)}
              renderItem={(cue) => (
                <List.Item
                  style={{
                    padding: '8px 0',
                    backgroundColor: Math.abs(cue.timestamp - state.currentTime) < 1.0 ? 
                      '#e6f7ff' : 'transparent',
                    borderRadius: 4,
                    margin: '2px 0'
                  }}
                >
                  <Space size="small" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space size="small">
                      <Text style={{ fontSize: 12 }}>
                        {Math.round(cue.timestamp * 10) / 10}s
                      </Text>
                      <Tag color={getActionColor(cue.action)}>
                        {getActionText(cue.action)}
                      </Tag>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {Math.round(cue.volume * 100)}%
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
          )}
        </div>
      </Card>

      {/* 音乐时间轴 */}
      <Card size="small" title="音乐时间轴">
        <div style={{ height: 60, background: '#fafafa', borderRadius: 4, padding: 8, position: 'relative' }}>
          {state.musicCues.map((cue, index) => (
            <div
              key={cue.id}
              style={{
                position: 'absolute',
                left: `${(cue.timestamp / (state.currentVideo?.duration || 1)) * 100}%`,
                width: 3,
                height: 44,
                background: getActionColor(cue.action) === 'green' ? '#52c41a' :
                           getActionColor(cue.action) === 'red' ? '#ff4d4f' :
                           getActionColor(cue.action) === 'blue' ? '#1890ff' : '#fa8c16',
                borderRadius: 1,
                cursor: 'pointer'
              }}
              title={`${Math.round(cue.timestamp * 10) / 10}s - ${getActionText(cue.action)}`}
            />
          ))}
          
          {/* 当前时间指示器 */}
          <div
            style={{
              position: 'absolute',
              left: `${(state.currentTime / (state.currentVideo?.duration || 1)) * 100}%`,
              width: 2,
              height: 44,
              background: '#ff4d4f',
              borderRadius: 1
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default MusicPanel;