import React from 'react';
import { Card, Slider, ColorPicker, Space, Typography, Empty, Button } from 'antd';
import { BulbOutlined, BgColorsOutlined } from '@ant-design/icons';
import { useAppContext } from '../../contexts/AppContext';

const { Text, Title } = Typography;

const LightingPanel: React.FC = () => {
  const { state } = useAppContext();

  // 获取当前时间点的灯光设置
  const getCurrentLighting = () => {
    const currentCues = state.lightingCues.filter(cue => 
      Math.abs(cue.timestamp - state.currentTime) < 1.0
    );
    
    return currentCues.length > 0 ? currentCues[0] : null;
  };

  const currentLighting = getCurrentLighting();

  const handleColorChange = (color: any) => {
    // TODO: 实现颜色变更逻辑
    console.log('颜色变更:', color);
  };

  const handleIntensityChange = (value: number) => {
    // TODO: 实现亮度变更逻辑
    console.log('亮度变更:', value);
  };

  const handlePresetClick = (preset: string) => {
    // TODO: 实现预设应用逻辑
    console.log('应用预设:', preset);
  };

  if (!state.currentVideo) {
    return (
      <Empty
        description="暂无灯光数据"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Text type="secondary">上传视频后可进行灯光控制</Text>
      </Empty>
    );
  }

  return (
    <div className="lighting-controls">
      {/* 主灯光控制 */}
      <Card size="small" title={
        <Space>
          <BulbOutlined />
          <span>主灯光</span>
        </Space>
      }>
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* 颜色选择 */}
          <div className="color-picker-row">
            <Text>颜色:</Text>
            <ColorPicker
              value={currentLighting?.lights[0]?.color ? 
                `rgb(${currentLighting.lights[0].color.r}, ${currentLighting.lights[0].color.g}, ${currentLighting.lights[0].color.b})` : 
                '#ffffff'
              }
              onChange={handleColorChange}
              showText
            />
          </div>
          
          {/* 亮度控制 */}
          <div>
            <Text>亮度:</Text>
            <Slider
              min={0}
              max={100}
              value={currentLighting?.lights[0]?.intensity ? 
                Math.round(currentLighting.lights[0].intensity * 100) : 
                80
              }
              onChange={handleIntensityChange}
              tooltip={{ formatter: (value) => `${value}%` }}
            />
          </div>
        </Space>
      </Card>

      {/* 灯光预设 */}
      <Card size="small" title={
        <Space>
          <BgColorsOutlined />
          <span>灯光预设</span>
        </Space>
      }>
        <Space wrap>
          <Button 
            size="small" 
            onClick={() => handlePresetClick('warm')}
            style={{ background: '#ffa940', borderColor: '#ffa940', color: '#fff' }}
          >
            暖光
          </Button>
          <Button 
            size="small" 
            onClick={() => handlePresetClick('cool')}
            style={{ background: '#40a9ff', borderColor: '#40a9ff', color: '#fff' }}
          >
            冷光
          </Button>
          <Button 
            size="small" 
            onClick={() => handlePresetClick('dramatic')}
            style={{ background: '#f5222d', borderColor: '#f5222d', color: '#fff' }}
          >
            戏剧性
          </Button>
          <Button 
            size="small" 
            onClick={() => handlePresetClick('soft')}
            style={{ background: '#73d13d', borderColor: '#73d13d', color: '#fff' }}
          >
            柔和
          </Button>
        </Space>
      </Card>

      {/* 当前灯光状态 */}
      {currentLighting && (
        <Card size="small" title="当前灯光状态">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text type="secondary">
              时间点: {Math.round(currentLighting.timestamp * 10) / 10}s
            </Text>
            <Text type="secondary">
              过渡时长: {currentLighting.transition_duration}s
            </Text>
            <Text type="secondary">
              灯光数量: {currentLighting.lights.length}
            </Text>
          </Space>
        </Card>
      )}

      {/* 灯光时间轴 */}
      <Card size="small" title="灯光时间轴">
        <div style={{ height: 60, background: '#fafafa', borderRadius: 4, padding: 8 }}>
          {state.lightingCues.map((cue, index) => (
            <div
              key={cue.id}
              style={{
                position: 'absolute',
                left: `${(cue.timestamp / (state.currentVideo?.duration || 1)) * 100}%`,
                width: 3,
                height: 44,
                background: cue.lights[0]?.color ? 
                  `rgb(${cue.lights[0].color.r}, ${cue.lights[0].color.g}, ${cue.lights[0].color.b})` : 
                  '#1890ff',
                borderRadius: 1,
                cursor: 'pointer'
              }}
              title={`${Math.round(cue.timestamp * 10) / 10}s`}
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

export default LightingPanel;