import React from 'react';
import { Layout, Typography, Space, Button, Badge, Spin } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  UploadOutlined,
  ProjectOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useAppContext, useAppActions } from '../../contexts/AppContext';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

const Header: React.FC = () => {
  const { state } = useAppContext();
  const actions = useAppActions();

  const handlePlayPause = () => {
    actions.setPlaying(!state.isPlaying);
  };

  const handleNewProject = () => {
    // TODO: 实现新建项目功能
    console.log('新建项目');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AntHeader style={{ 
      background: '#fff', 
      borderBottom: '1px solid #f0f0f0',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* 左侧：标题和项目信息 */}
      <Space size="large">
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          🎭 rehearseOnline
        </Title>
        
        {state.currentProject && (
          <Space>
            <ProjectOutlined />
            <Text strong>{state.currentProject.name}</Text>
          </Space>
        )}
        
        {state.currentVideo && (
          <Space>
            <Badge status="processing" />
            <Text type="secondary">{state.currentVideo.filename}</Text>
            <Text type="secondary">
              {formatTime(state.currentTime)} / {formatTime(state.currentVideo.duration)}
            </Text>
          </Space>
        )}
      </Space>

      {/* 右侧：控制按钮和状态 */}
      <Space size="middle">
        {/* 演员数量 */}
        <Space>
          <UserOutlined />
          <Text>{state.actors.length} 个演员</Text>
        </Space>

        {/* 播放控制 */}
        {state.currentVideo && (
          <Button
            type="primary"
            icon={state.isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={handlePlayPause}
            size="large"
          >
            {state.isPlaying ? '暂停' : '播放'}
          </Button>
        )}

        {/* 上传按钮 */}
        <Button
          icon={<UploadOutlined />}
          onClick={() => {
            // TODO: 实现重新上传功能
            actions.setCurrentVideo(undefined);
            actions.clearAllData();
          }}
        >
          {state.currentVideo ? '重新上传' : '上传视频'}
        </Button>

        {/* 新建项目 */}
        <Button
          icon={<ProjectOutlined />}
          onClick={handleNewProject}
        >
          新建项目
        </Button>

        {/* 加载状态 */}
        {state.loading && (
          <Spin size="small" />
        )}
      </Space>
    </AntHeader>
  );
};

export default Header;