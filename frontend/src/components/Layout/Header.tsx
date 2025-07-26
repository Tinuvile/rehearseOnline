import React from 'react';
import { Layout, Typography, Space, Button, Badge, Spin, Avatar, Dropdown } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  UploadOutlined,
  ProjectOutlined,
  UserOutlined,
  BellOutlined,
  MenuOutlined,
  SettingOutlined
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

  const userMenuItems = [
    {
      key: 'profile',
      label: '个人资料',
    },
    {
      key: 'settings',
      label: '设置',
    },
    {
      key: 'logout',
      label: '退出登录',
    },
  ];

  return (
    <AntHeader style={{ 
      background: 'var(--color-background)', 
      borderBottom: '1px solid var(--color-border)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      height: 64,
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* 左侧：标题和项目信息 */}
      <Space size="large" align="center">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0, color: 'var(--color-accent)', fontWeight: 600 }}>
            🎭 AI舞台系统
          </Title>
        </div>
        
        {state.currentProject && (
          <Space style={{ background: 'var(--color-background-lighter)', padding: '4px 12px', borderRadius: '16px' }}>
            <ProjectOutlined style={{ color: 'var(--color-accent)' }} />
            <Text strong style={{ color: 'var(--color-text)' }}>{state.currentProject.name}</Text>
          </Space>
        )}
        
        {state.currentVideo && (
          <Space style={{ background: 'var(--color-background-lighter)', padding: '4px 12px', borderRadius: '16px' }}>
            <Badge status="processing" color="var(--color-accent)" />
            <Text style={{ color: 'var(--color-text)' }}>{state.currentVideo.filename}</Text>
            <Text style={{ color: 'rgba(217, 214, 206, 0.7)' }}>
              {formatTime(state.currentTime)} / {formatTime(state.currentVideo.duration)}
            </Text>
          </Space>
        )}
      </Space>

      {/* 右侧：控制按钮和状态 */}
      <Space size="middle" align="center" style={{ display: 'flex', alignItems: 'center' }}>
        {/* 演员数量 */}
        <Space style={{ background: 'var(--color-background-lighter)', padding: '4px 12px', borderRadius: '16px' }}>
          <UserOutlined style={{ color: 'var(--color-accent)' }} />
          <Text style={{ color: 'var(--color-text)' }}>{state.actors.length} 个演员</Text>
        </Space>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* 播放控制 */}
          {state.currentVideo && (
            <Button
              type="primary"
              icon={state.isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={handlePlayPause}
              size="large"
              style={{ 
                background: state.isPlaying ? '#d13e00' : 'var(--color-accent)', 
                borderColor: 'transparent',
                borderRadius: '8px',
                height: '40px',
                boxShadow: '0 2px 8px rgba(232, 69, 0, 0.2)'
              }}
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
            style={{ 
              borderRadius: '8px',
              height: '40px',
              background: 'var(--color-background-lighter)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)'
            }}
          >
            {state.currentVideo ? '重新上传' : '上传视频'}
          </Button>

          {/* 新建项目 */}
          <Button
            icon={<ProjectOutlined />}
            onClick={handleNewProject}
            style={{ 
              borderRadius: '8px',
              height: '40px',
              background: 'var(--color-background-lighter)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)'
            }}
          >
            新建项目
          </Button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
          {/* 通知按钮 */}
          <Button
            icon={<BellOutlined />}
            type="text"
            shape="circle"
            style={{
              fontSize: '18px',
              color: 'var(--color-accent)',
              background: 'var(--color-background-lighter)',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />

          {/* 设置按钮 */}
          <Button
            icon={<SettingOutlined />}
            type="text"
            shape="circle"
            style={{
              fontSize: '18px',
              color: 'var(--color-accent)',
              background: 'var(--color-background-lighter)',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </div>

        {/* 加载状态 */}
        {state.loading && (
          <Spin size="small" style={{ color: 'var(--color-accent)' }} />
        )}

        {/* 用户头像 */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Avatar 
            style={{ 
              background: 'var(--color-accent)', 
              cursor: 'pointer',
              border: '2px solid var(--color-border)'
            }}
            icon={<UserOutlined />} 
            size={40}
          />
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;