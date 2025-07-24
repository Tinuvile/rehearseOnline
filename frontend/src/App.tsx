import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './App.css';

// 临时简化版本，用于测试基础功能
const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <div className="App">
        <header style={{ 
          background: '#fff', 
          padding: '20px', 
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h1 style={{ color: '#1890ff', margin: 0 }}>
            🎭 AI舞台系统
          </h1>
          <p style={{ margin: '10px 0 0 0', color: '#666' }}>
            系统正在初始化...
          </p>
        </header>
        
        <main style={{ 
          padding: '40px', 
          textAlign: 'center',
          minHeight: 'calc(100vh - 120px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div>
            <h2>欢迎使用AI舞台系统</h2>
            <p>前端服务已成功启动！</p>
            <p style={{ color: '#666', fontSize: '14px' }}>
              后续功能正在开发中...
            </p>
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
};

export default App;