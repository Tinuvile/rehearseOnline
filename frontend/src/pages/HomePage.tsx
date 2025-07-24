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
      color: "#a8c090",
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
      style={{ minHeight: "100vh", height: "auto", background: "#0a0a0a" }}
    >
      <StageHeader />

      <Content style={{ background: "#0a0a0a", padding: "48px" }}>
        {/* 欢迎区域 */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: "#f5f5f5",
              marginBottom: 8,
              margin: "0 0 8px 0",
            }}
          >
            欢迎回来，林设计师
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#c0c0c0",
              margin: 0,
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
                style={{ background: "#151515", border: "1px solid #2a2a2a" }}
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
                        color: "#c0c0c0",
                        fontSize: 14,
                        margin: "0 0 8px 0",
                      }}
                    >
                      {stat.label}
                    </p>
                    <h3
                      style={{
                        color: "#f5f5f5",
                        fontSize: 24,
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {stat.value}
                    </h3>
                    <p
                      style={{
                        color: "#a8c090",
                        fontSize: 12,
                        margin: "4px 0 0 0",
                      }}
                    >
                      {stat.trend}
                    </p>
                  </div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: "#1f1f1f",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 20, color: "#a8c090" }}>
                      {stat.icon}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={24}>
          {/* 快速操作 */}
          <Col span={16}>
            <Card
              title={
                <span
                  style={{ color: "#f5f5f5", fontSize: 18, fontWeight: 500 }}
                >
                  快速操作
                </span>
              }
              style={{
                background: "#151515",
                border: "1px solid #2a2a2a",
                marginBottom: 24,
              }}
            >
              <Row gutter={16}>
                {quickActions.map((action, index) => (
                  <Col span={12} key={index} style={{ marginBottom: 16 }}>
                    <Card
                      hoverable
                      style={{
                        background: "#1f1f1f",
                        border: "1px solid #2a2a2a",
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
                          <span style={{ fontSize: 18, color: "#1a1a1a" }}>
                            {action.icon}
                          </span>
                        </div>
                        <div>
                          <h4
                            style={{
                              color: "#f5f5f5",
                              margin: "0 0 4px 0",
                              fontSize: 14,
                            }}
                          >
                            {action.title}
                          </h4>
                          <p
                            style={{
                              color: "#c0c0c0",
                              margin: 0,
                              fontSize: 12,
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

            {/* 系统公告 */}
            <Card
              title={
                <span
                  style={{ color: "#f5f5f5", fontSize: 18, fontWeight: 500 }}
                >
                  系统公告
                </span>
              }
              style={{ background: "#151515", border: "1px solid #2a2a2a" }}
            >
              <List
                itemLayout="horizontal"
                dataSource={[
                  {
                    title: "AI分析功能升级",
                    time: "2024-01-15",
                    type: "upgrade",
                  },
                  { title: "新增3D预览功能", time: "2024-01-10", type: "new" },
                  {
                    title: "系统维护通知",
                    time: "2024-01-05",
                    type: "maintenance",
                  },
                ]}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      borderBottom: "1px solid #2a2a2a",
                      padding: "12px 0",
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background:
                              item.type === "new"
                                ? "#a8c090"
                                : item.type === "upgrade"
                                ? "#81a1c1"
                                : "#e6b17a",
                          }}
                        />
                      }
                      title={
                        <span style={{ color: "#f5f5f5", fontSize: 14 }}>
                          {item.title}
                        </span>
                      }
                      description={
                        <span style={{ color: "#909090", fontSize: 12 }}>
                          {item.time}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
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
                    style={{ color: "#f5f5f5", fontSize: 18, fontWeight: 500 }}
                  >
                    最近项目
                  </span>
                  <Button
                    type="link"
                    style={{ color: "#a8c090", padding: 0 }}
                    onClick={() => navigate("/workspace")}
                  >
                    查看全部
                  </Button>
                </div>
              }
              style={{ background: "#151515", border: "1px solid #2a2a2a" }}
            >
              <List
                itemLayout="vertical"
                dataSource={recentProjects}
                renderItem={(project) => (
                  <List.Item
                    style={{
                      borderBottom: "1px solid #2a2a2a",
                      padding: "16px 0",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/project/${project.id}/editor`)}
                  >
                    <div>
                      <h4
                        style={{
                          color: "#f5f5f5",
                          margin: "0 0 8px 0",
                          fontSize: 14,
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
                                ? "#a8c090"
                                : "#7fb069",
                            color: "#1a1a1a",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: 10,
                          }}
                        >
                          {project.status}
                        </span>
                        <span
                          style={{
                            color: "#909090",
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
                        strokeColor="#a8c090"
                        trailColor="#2a2a2a"
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
