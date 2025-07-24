import React, { useState } from "react";
import { Layout, Space, Avatar, Menu, Button, Modal } from "antd";
import {
  HomeOutlined,
  FolderOutlined,
  VideoCameraOutlined,
  EditOutlined,
  DatabaseOutlined,
  TeamOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import type { MenuProps } from "antd";

const { Header } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const StageHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [userMenuVisible, setUserMenuVisible] = useState(false);

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
    {
      key: "/team",
      icon: <TeamOutlined />,
      label: "团队管理",
      onClick: () => navigate("/team"),
    },
    {
      key: "/analytics",
      icon: <BarChartOutlined />,
      label: "数据分析",
      onClick: () => navigate("/analytics"),
    },
    {
      key: "/help",
      icon: <QuestionCircleOutlined />,
      label: "帮助中心",
      onClick: () => navigate("/help"),
    },
  ];

  // 用户菜单项
  const userMenuItems: MenuItem[] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人信息",
      onClick: () => console.log("打开个人信息"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "系统设置",
      onClick: () => console.log("打开系统设置"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: () => {
        Modal.confirm({
          title: "确认退出",
          content: "您确定要退出系统吗？",
          okText: "确认",
          cancelText: "取消",
          onOk: () => {
            console.log("用户退出登录");
            // 这里可以添加退出登录的逻辑
          },
        });
      },
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

  // 通知列表
  const notifications = [
    {
      id: 1,
      title: "AI分析完成",
      content: "您的舞台视频分析已完成",
      time: "5分钟前",
      read: false,
    },
    {
      id: 2,
      title: "团队邀请",
      content: "王导演邀请您加入新项目",
      time: "1小时前",
      read: false,
    },
    {
      id: 3,
      title: "系统更新",
      content: "系统将于今晚进行维护更新",
      time: "3小时前",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Header
      style={{
        background: "#151515",
        borderBottom: "1px solid #2a2a2a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* 左侧Logo和导航 */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Logo */}
        <div
          style={{
            color: "#a8c090",
            fontSize: 20,
            fontWeight: "bold",
            marginRight: 48,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          AI舞台系统
        </div>

        {/* 主导航菜单 */}
        <Menu
          mode="horizontal"
          selectedKeys={[getCurrentKey()]}
          items={navigationItems}
          style={{
            background: "transparent",
            border: "none",
            fontSize: 14,
          }}
        />
      </div>

      {/* 右侧用户区域 */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* 通知按钮 */}
        <div style={{ position: "relative" }}>
          <Button
            type="text"
            icon={<BellOutlined />}
            style={{ color: "#f5f5f5" }}
            onClick={() => setNotificationVisible(true)}
          />
          {unreadCount > 0 && (
            <div
              style={{
                position: "absolute",
                top: 4,
                right: -6,
                background: "#ff4d4f",
                color: "#fff",
                borderRadius: "50%",
                fontSize: 10,
                width: 16,
                height: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #151515",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            >
              {unreadCount}
            </div>
          )}
        </div>

        {/* 用户信息和菜单 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "6px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1f1f1f")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          onClick={() => setUserMenuVisible(true)}
        >
          <Avatar size={32} src="/avatar.svg" style={{ marginRight: 8 }} />
          <span style={{ color: "#f5f5f5", fontSize: 14 }}>林设计师</span>
        </div>
      </div>

      {/* 通知弹窗 */}
      <Modal
        title="通知中心"
        open={notificationVisible}
        onCancel={() => setNotificationVisible(false)}
        footer={null}
        width={400}
      >
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #2a2a2a",
                opacity: notification.read ? 0.6 : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 4,
                }}
              >
                <h4
                  style={{
                    color: "#f5f5f5",
                    margin: 0,
                    fontSize: 14,
                    fontWeight: notification.read ? "normal" : "bold",
                  }}
                >
                  {notification.title}
                </h4>
                <span style={{ color: "#909090", fontSize: 12 }}>
                  {notification.time}
                </span>
              </div>
              <p style={{ color: "#c0c0c0", margin: 0, fontSize: 12 }}>
                {notification.content}
              </p>
            </div>
          ))}
        </div>
      </Modal>

      {/* 用户菜单弹窗 */}
      <Modal
        title="用户菜单"
        open={userMenuVisible}
        onCancel={() => setUserMenuVisible(false)}
        footer={null}
        width={280}
      >
        <Menu
          mode="vertical"
          items={userMenuItems}
          style={{
            background: "transparent",
            border: "none",
          }}
        />
      </Modal>
    </Header>
  );
};

export default StageHeader;
