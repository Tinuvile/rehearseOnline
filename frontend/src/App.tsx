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

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          // Catppuccin Frappe colors
          colorPrimary: "#8caaee", // Blue
          colorSuccess: "#a6d189", // Green
          colorWarning: "#e5c890", // Yellow
          colorError: "#e78284", // Red
          colorInfo: "#81c8be", // Teal
          colorBgBase: "#303446", // Base
          colorBgContainer: "#414559", // Surface0
          colorBgElevated: "#51576d", // Surface1
          colorBorder: "#626880", // Surface2
          colorBorderSecondary: "#737994", // Overlay0
          colorText: "#c6d0f5", // Text
          colorTextSecondary: "#b5bfe2", // Subtext1
          colorTextTertiary: "#a5adce", // Subtext0
          colorTextQuaternary: "#949cbb", // Overlay2
          colorFill: "#414559", // Surface0
          colorFillSecondary: "#51576d", // Surface1
          colorFillTertiary: "#626880", // Surface2
          colorFillQuaternary: "#737994", // Overlay0
          borderRadius: 12,
          borderRadiusLG: 16,
          borderRadiusSM: 8,
          borderRadiusXS: 6,
        },
        components: {
          Button: {
            borderRadius: 8,
            controlHeight: 40,
            fontSize: 14,
            fontWeight: 500,
          },
          Card: {
            borderRadius: 12,
            paddingLG: 24,
          },
          Input: {
            borderRadius: 8,
            controlHeight: 40,
            fontSize: 14,
          },
          Select: {
            borderRadius: 8,
            controlHeight: 40,
            fontSize: 14,
          },
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

            {/* 404 重定向到首页 */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;
