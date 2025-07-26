import React from "react";
import { Layout, Card, Row, Col, Button, List, Avatar, Progress } from "antd";
import {
  PlusOutlined,
  ProjectOutlined,
  VideoCameraOutlined,
  EditOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import StageHeader from "../components/Layout/StageHeader";

const { Content } = Layout;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const recentProjects = [
    {
      id: "1",
      title: "2023音乐节主舞台",
      status: "进行中",
      lastEdit: "2小时前",
      progress: 75,
    },
  ];

  const quickActions = [
    {
      title: "创建新项目",
      description: "开始一个全新的舞台设计项目",
      icon: <PlusOutlined />,
      color: "#a6d189", // Green
      action: () => navigate("/workspace"),
    },
    {
      title: "视频分析",
      description: "上传视频进行AI智能分析",
      icon: <VideoCameraOutlined />,
      color: "#8caaee", // Blue
      action: () => navigate("/analysis"),
    },
    {
      title: "舞台编辑",
      description: "编辑现有项目的舞台布局",
      icon: <EditOutlined />,
      color: "#e5c890", // Yellow
      action: () => navigate("/editor"),
    },
    {
      title: "项目管理",
      description: "查看和管理所有项目",
      icon: <ProjectOutlined />,
      color: "#f4b8e4", // Pink
      action: () => navigate("/workspace"),
    },
  ];

  const stats = [
    { label: "总项目数", value: "16", icon: <FileTextOutlined />, trend: "+2" },
    { label: "视频分析", value: "8", icon: <VideoCameraOutlined />, trend: "+1" },
    { label: "完成率", value: "85%", icon: <BarChartOutlined />, trend: "+5%" },
    {
      label: "本月新增",
      value: "4",
      icon: <ClockCircleOutlined />,
      trend: "+1",
    },
  ];

  return (
    <Layout
      style={{ minHeight: "100vh", height: "auto", background: "#303446" }}
    >
      <StageHeader />

      <Content style={{ background: "#303446", padding: "48px 64px" }}>
        {/* 欢迎区域 */}
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <h1
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#c6d0f5",
              marginBottom: 16,
              margin: "0 0 16px 0",
              background: "linear-gradient(135deg, #8caaee, #ca9ee6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            欢迎使用 rehearseOnline
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "#b5bfe2",
              margin: 0,
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            智能在线排练系统，让每一次排练都更加高效精准
          </p>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
          {stats.map((stat, index) => (
            <Col span={6} key={index}>
              <Card
                style={{ 
                  background: "#414559",
                  border: "none",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                  transition: "all 0.3s ease",
                }}
                bodyStyle={{ padding: "24px" }}
                hoverable
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        color: "#a5adce",
                        fontSize: 14,
                        margin: "0 0 8px 0",
                        fontWeight: 500,
                      }}
                    >
                      {stat.label}
                    </p>
                    <h3
                      style={{
                        color: "#c6d0f5",
                        fontSize: 28,
                        fontWeight: 700,
                        margin: "0 0 4px 0",
                      }}
                    >
                      {stat.value}
                    </h3>
                    <p
                      style={{
                        color: "#a6d189",
                        fontSize: 12,
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      {stat.trend}
                    </p>
                  </div>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      background: "linear-gradient(135deg, #8caaee, #ca9ee6)",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: 16,
                    }}
                  >
                    <span style={{ fontSize: 24, color: "#303446" }}>
                      {stat.icon}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[24, 24]} style={{ alignItems: "stretch" }}>
          {/* 快速操作 */}
          <Col span={18} style={{ display: "flex" }}>
            <Card
              title={
                <span
                  style={{ 
                    color: "#c6d0f5", 
                    fontSize: 20, 
                    fontWeight: 600,
                  }}
                >
                  快速操作
                </span>
              }
              style={{
                background: "#414559",
                border: "none",
                borderRadius: "16px",
                width: "100%",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <Row gutter={[16, 16]}>
                {quickActions.map((action, index) => (
                  <Col span={12} key={index}>
                    <Card
                      hoverable
                      style={{
                        background: "#51576d",
                        border: "none",
                        cursor: "pointer",
                        height: "120px",
                        borderRadius: "12px",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                      }}
                      bodyStyle={{ 
                        padding: "20px",
                        height: "100%",
                        display: "flex",
                        alignItems: "center"
                      }}
                      onClick={action.action}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.16)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.08)";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            background: action.color,
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 16,
                            flexShrink: 0,
                            boxShadow: `0 4px 12px ${action.color}40`,
                          }}
                        >
                          <span style={{ fontSize: 20, color: "#303446", fontWeight: "bold" }}>
                            {action.icon}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            style={{
                              color: "#c6d0f5",
                              margin: "0 0 6px 0",
                              fontSize: 16,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {action.title}
                          </h4>
                          <p
                            style={{
                              color: "#a5adce",
                              margin: 0,
                              fontSize: 13,
                              lineHeight: "1.4",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          {/* 最近项目 */}
          <Col span={6} style={{ display: "flex" }}>
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ 
                      color: "#c6d0f5", 
                      fontSize: 20, 
                      fontWeight: 600 
                    }}
                  >
                    最近项目
                  </span>
                  <Button
                    type="link"
                    style={{ 
                      color: "#8caaee", 
                      padding: 0,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                    onClick={() => navigate("/workspace")}
                  >
                    查看全部
                  </Button>
                </div>
              }
              style={{ 
                background: "#414559",
                border: "none",
                borderRadius: "16px",
                width: "100%",
                height: "100%",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              }}
              bodyStyle={{
                padding: "24px",
                height: "calc(100% - 73px)",
                overflow: "auto"
              }}
            >
              <List
                itemLayout="vertical"
                dataSource={recentProjects}
                renderItem={(project) => (
                  <List.Item
                    style={{
                      borderBottom: "1px solid #626880",
                      padding: "20px 0",
                      cursor: "pointer",
                      borderRadius: "8px",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => navigate(`/project/${project.id}/editor`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#51576d";
                      e.currentTarget.style.padding = "20px 12px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.padding = "20px 0";
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          color: "#c6d0f5",
                          margin: "0 0 12px 0",
                          fontSize: 16,
                          fontWeight: 600,
                        }}
                      >
                        {project.title}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <span
                          style={{
                            background:
                              project.status === "进行中"
                                ? "#a6d189"
                                : "#81c8be",
                            color: "#303446",
                            padding: "4px 12px",
                            borderRadius: "16px",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {project.status}
                        </span>
                        <span
                          style={{
                            color: "#a5adce",
                            fontSize: 12,
                            marginLeft: 12,
                          }}
                        >
                          {project.lastEdit}
                        </span>
                      </div>
                      <Progress
                        percent={project.progress}
                        size="small"
                        strokeColor="#8caaee"
                        trailColor="#626880"
                        showInfo={false}
                        strokeWidth={6}
                      />
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default HomePage;
