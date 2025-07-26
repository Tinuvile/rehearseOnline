import React from "react";
import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  FolderOutlined,
  VideoCameraOutlined,
  EditOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import type { MenuProps } from "antd";

const { Header } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const StageHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // 导航菜单项
  const navigationItems: MenuItem[] = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "首页",
      onClick: () => navigate("/"),
    },
    {
      key: "/workspace",
      icon: <FolderOutlined />,
      label: "项目工作台",
      onClick: () => navigate("/workspace"),
    },
    {
      key: "/analysis",
      icon: <VideoCameraOutlined />,
      label: "视频分析",
      onClick: () => navigate("/analysis"),
    },
    {
      key: "/editor",
      icon: <EditOutlined />,
      label: "舞台编辑",
      onClick: () => navigate("/editor"),
    },
    {
      key: "/resources",
      icon: <DatabaseOutlined />,
      label: "资源库",
      onClick: () => navigate("/resources"),
    },

  ];

  // 获取当前页面的key，用于高亮当前菜单项
  const getCurrentKey = () => {
    const path = location.pathname;
    if (path.startsWith("/project/") && path.endsWith("/editor")) {
      return "/editor";
    }
    return path;
  };

  return (
    <Header
      style={{
        background: "#414559",
        borderBottom: "1px solid #626880",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        height: "72px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* 左侧Logo和导航 */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Logo */}
        <div
          style={{
            background: "linear-gradient(135deg, #8caaee, #ca9ee6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: 24,
            fontWeight: 800,
            marginRight: 64,
            cursor: "pointer",
            letterSpacing: "-0.5px",
          }}
          onClick={() => navigate("/")}
        >
          rehearseOnline
        </div>

        {/* 主导航菜单 */}
        <Menu
          mode="horizontal"
          selectedKeys={[getCurrentKey()]}
          items={navigationItems}
          style={{
            background: "transparent",
            border: "none",
            fontSize: 15,
            fontWeight: 500,
            lineHeight: "72px",
          }}
          theme="dark"
        />
      </div>
    </Header>
  );
};

export default StageHeader;
