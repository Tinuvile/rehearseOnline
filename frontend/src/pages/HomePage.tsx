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
  TeamOutlined,
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
      color: "var(--color-accent)",
      action: () => navigate("/workspace"),
    },
    {
      title: "视频分析",
      description: "上传视频进行AI智能分析",
      icon: <VideoCameraOutlined />,
      color: "#81a1c1",
      action: () => navigate("/analysis"),
    },
    {
      title: "舞台编辑",
      description: "编辑现有项目的舞台布局",
      icon: <EditOutlined />,
      color: "#e6b17a",
      action: () => navigate("/editor"),
    },
    {
      title: "项目管理",
      description: "查看和管理所有项目",
      icon: <ProjectOutlined />,
      color: "#d08770",
      action: () => navigate("/workspace"),
    },
  ];

  const stats = [
    { label: "总项目数", value: "16", icon: <FileTextOutlined />, trend: "+2" },
    { label: "活跃用户", value: "8", icon: <TeamOutlined />, trend: "+1" },
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
      style={{ minHeight: "100vh", height: "auto", background: "var(--color-background)" }}
    >
      <StageHeader />

      <Content style={{ background: "var(--color-background)", padding: "48px" }}>
        {/* 欢迎区域 */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: 12,
              margin: "0 0 12px 0",
              letterSpacing: "-0.02em",
            }}
          >
            欢迎回来，林设计师
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "rgba(217, 214, 206, 0.8)",
              margin: 0,
              fontWeight: 400,
            }}
          >
            今天是个创作的好日子，让我们开始新的舞台设计之旅吧！
          </p>
        </div>

        {/* 统计卡片 */}
        <Row gutter={24} style={{ marginBottom: 32 }}>
          {stats.map((stat, index) => (
            <Col span={6} key={index}>
              <Card
                style={{ background: "var(--color-background-lighter)", border: "1px solid var(--color-border)" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p
                      style={{
                        color: "rgba(217, 214, 206, 0.8)",
                        fontSize: "0.875rem",
                        margin: "0 0 8px 0",
                        fontWeight: 400,
                      }}
                    >
                      {stat.label}
                    </p>
                    <h3
                      style={{
                        color: "var(--color-text)",
                        fontSize: "1.75rem",
                        fontWeight: 600,
                        margin: 0,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {stat.value}
                    </h3>
                    <p
                      style={{
                        color: "var(--color-accent)",
                        fontSize: "0.75rem",
                        margin: "4px 0 0 0",
                        fontWeight: 500,
                      }}
                    >
                      {stat.trend}
                    </p>
                  </div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: "var(--color-background)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 20, color: "var(--color-accent)" }}>
                      {stat.icon}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 其他卡片标题样式 */}
        <Row gutter={24}>
          {/* 快速操作 */}
          <Col span={16}>
            <Card
              title={
                <span
                  style={{ 
                    color: "var(--color-text)", 
                    fontSize: "1.125rem", 
                    fontWeight: 600,
                    letterSpacing: "-0.01em"
                  }}
                >
                  快速操作
                </span>
              }
              style={{
                background: "var(--color-background-lighter)",
                border: "1px solid var(--color-border)",
                height: "100%",
              }}
            >
              <Row gutter={16}>
                {quickActions.map((action, index) => (
                  <Col span={12} key={index} style={{ marginBottom: 16 }}>
                    <Card
                      hoverable
                      style={{
                        background: "var(--color-background)",
                        border: "1px solid var(--color-border)",
                        cursor: "pointer",
                      }}
                      onClick={action.action}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            background: action.color,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                          }}
                        >
                          <span style={{ fontSize: 18, color: "var(--color-text)" }}>
                            {action.icon}
                          </span>
                        </div>
                        <div>
                          <h4
                            style={{
                              color: "var(--color-text)",
                              margin: "0 0 4px 0",
                              fontSize: "0.9375rem",
                              fontWeight: 500,
                            }}
                          >
                            {action.title}
                          </h4>
                          <p
                            style={{
                              color: "rgba(217, 214, 206, 0.8)",
                              margin: 0,
                              fontSize: "0.8125rem",
                              fontWeight: 400,
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
          <Col span={8}>
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
                      color: "var(--color-text)", 
                      fontSize: "1.125rem", 
                      fontWeight: 600,
                      letterSpacing: "-0.01em"
                    }}
                  >
                    最近项目
                  </span>
                  <Button
                    type="link"
                    style={{ color: "var(--color-accent)", padding: 0 }}
                    onClick={() => navigate("/workspace")}
                  >
                    查看全部
                  </Button>
                </div>
              }
              style={{ 
                background: "var(--color-background-lighter)", 
                border: "1px solid var(--color-border)",
                height: "100%"
              }}
            >
              <List
                itemLayout="vertical"
                dataSource={recentProjects}
                renderItem={(project) => (
                  <List.Item
                    style={{
                      borderBottom: "1px solid var(--color-border)",
                      padding: "16px 0",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/project/${project.id}/editor`)}
                  >
                    <div>
                      <h4
                        style={{
                          color: "var(--color-text)",
                          margin: "0 0 8px 0",
                          fontSize: "0.9375rem",
                          fontWeight: 500,
                        }}
                      >
                        {project.title}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            background:
                              project.status === "进行中"
                                ? "var(--color-accent)"
                                : "#d13e00",
                            color: "var(--color-text)",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: 10,
                          }}
                        >
                          {project.status}
                        </span>
                        <span
                          style={{
                            color: "rgba(217, 214, 206, 0.6)",
                            fontSize: 10,
                            marginLeft: 8,
                          }}
                        >
                          {project.lastEdit}
                        </span>
                      </div>
                      <Progress
                        percent={project.progress}
                        size="small"
                        strokeColor="var(--color-accent)"
                        trailColor="var(--color-border)"
                        showInfo={false}
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
