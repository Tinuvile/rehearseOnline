import React from 'react';
import { List, Typography, Tag, Empty, Space } from 'antd';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAppContext } from '../../contexts/AppContext';
import { TranscriptSegment } from '../../types';

const { Text } = Typography;

const ScriptPanel: React.FC = () => {
  const { state } = useAppContext();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmotionColor = (emotion?: string): string => {
    switch (emotion) {
      case 'positive': return 'green';
      case 'negative': return 'red';
      case 'neutral': return 'blue';
      default: return 'default';
    }
  };

  const getEmotionText = (emotion?: string): string => {
    switch (emotion) {
      case 'positive': return '积极';
      case 'negative': return '消极';
      case 'neutral': return '中性';
      default: return '未知';
    }
  };

  const isCurrentSegment = (segment: TranscriptSegment): boolean => {
    return state.currentTime >= segment.start_time && state.currentTime <= segment.end_time;
  };

  const getActorName = (actorId?: string): string => {
    if (!actorId) return '未知演员';
    const actor = state.actors.find(a => a.id === actorId);
    return actor?.name || '未知演员';
  };

  const getActorColor = (actorId?: string): string => {
    if (!actorId) return '#ccc';
    const actor = state.actors.find(a => a.id === actorId);
    return actor?.color || '#ccc';
  };

  if (state.transcripts.length === 0) {
    return (
      <Empty
        description="暂无台词数据"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Text type="secondary">上传视频后，AI将自动提取台词内容</Text>
      </Empty>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <List
        dataSource={state.transcripts}
        renderItem={(segment) => (
          <List.Item
            style={{
              backgroundColor: isCurrentSegment(segment) ? '#e6f7ff' : 'transparent',
              border: isCurrentSegment(segment) ? '1px solid #1890ff' : '1px solid transparent',
              borderRadius: 4,
              margin: '4px 0',
              padding: '12px'
            }}
          >
            <div style={{ width: '100%' }}>
              {/* 时间和演员信息 */}
              <div style={{ marginBottom: 8 }}>
                <Space size="middle">
                  <Space size="small">
                    <ClockCircleOutlined style={{ color: '#666' }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatTime(segment.start_time)} - {formatTime(segment.end_time)}
                    </Text>
                  </Space>
                  
                  <Space size="small">
                    <UserOutlined style={{ color: getActorColor(segment.speaker_id) }} />
                    <Text style={{ fontSize: 12, color: getActorColor(segment.speaker_id) }}>
                      {getActorName(segment.speaker_id)}
                    </Text>
                  </Space>
                  
                  {segment.emotion && (
                    <Tag color={getEmotionColor(segment.emotion)}>
                      {getEmotionText(segment.emotion)}
                    </Tag>
                  )}
                  
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    置信度: {Math.round(segment.confidence * 100)}%
                  </Text>
                </Space>
              </div>
              
              {/* 台词内容 */}
              <div>
                <Text 
                  style={{ 
                    fontSize: 14,
                    fontWeight: isCurrentSegment(segment) ? 500 : 400,
                    color: isCurrentSegment(segment) ? '#1890ff' : '#333'
                  }}
                >
                  {segment.text}
                </Text>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ScriptPanel;