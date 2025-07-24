import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import "./App.css";

// 导入页面组件
import HomePage from "./pages/HomePage";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import VideoAnalysis from "./pages/VideoAnalysis";
import StageEditor from "./pages/StageEditor";
import ResourceLibrary from "./pages/ResourceLibrary";
import TeamManagement from "./pages/TeamManagement";
import DataAnalytics from "./pages/DataAnalytics";
import HelpCenter from "./pages/HelpCenter";

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#a8c090",
          colorBgBase: "#0a0a0a",
          colorTextBase: "#f5f5f5",
          colorBorder: "#2a2a2a",
          colorBgContainer: "#151515",
        },
      }}
    >
      <Router>
        <div className="App">
          <Routes>
            {/* 首页 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />

            {/* 项目管理 */}
            <Route path="/workspace" element={<ProjectWorkspace />} />

            {/* 视频分析 */}
            <Route path="/analysis" element={<VideoAnalysis />} />

            {/* 舞台编辑器 */}
            <Route path="/editor" element={<StageEditor />} />
            <Route path="/project/:id/editor" element={<StageEditor />} />

            {/* 资源库 */}
            <Route path="/resources" element={<ResourceLibrary />} />

            {/* 团队管理 */}
            <Route path="/team" element={<TeamManagement />} />

            {/* 数据分析 */}
            <Route path="/analytics" element={<DataAnalytics />} />

            {/* 帮助中心 */}
            <Route path="/help" element={<HelpCenter />} />

            {/* 404 重定向到首页 */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;
