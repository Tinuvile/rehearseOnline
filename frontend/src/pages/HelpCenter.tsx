import React from "react";
import { Layout, Card, Row, Col, Collapse, Input, Button } from "antd";
import {
  SearchOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  VideoCameraOutlined,
  MessageOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import StageHeader from "../components/Layout/StageHeader";

const { Content } = Layout;
const { Panel } = Collapse;

const HelpCenter: React.FC = () => {
  const faqData = [
    {
      key: "1",
      question: "如何上传和分析舞台视频？",
      answer:
        "进入视频分析页面，点击上传区域选择MP4、MOV或AVI格式的视频文件。AI将自动分析演员位置、舞台布局和音频内容。",
    },
    {
      key: "2",
      question: "舞台编辑器如何使用？",
      answer:
        "在舞台编辑器中，您可以拖拽演员位置、添加道具、设置灯光和音乐。使用左侧工具栏选择不同的编辑工具。",
    },
    {
      key: "3",
      question: "AI建议功能如何工作？",
      answer:
        "AI会根据您的舞台设计自动分析走位冲突、灯光配置和音乐节奏，提供优化建议。您可以选择应用或忽略这些建议。",
    },
    {
      key: "4",
      question: "如何与团队成员协作？",
      answer:
        "在团队管理页面邀请成员加入项目。所有成员都可以实时查看和编辑舞台设计，系统会自动同步所有更改。",
    },
  ];

  const helpCategories = [
    { title: "快速入门", icon: <BookOutlined />, count: 12, color: "#a8c090" },
    {
      title: "视频教程",
      icon: <VideoCameraOutlined />,
      count: 8,
      color: "#81a1c1",
    },
    {
      title: "常见问题",
      icon: <QuestionCircleOutlined />,
      count: 25,
      color: "#e6b17a",
    },
    {
      title: "联系支持",
      icon: <MessageOutlined />,
      count: null,
      color: "#d08770",
    },
  ];

  return (
    <Layout
      style={{ minHeight: "100vh", height: "auto", background: "#0a0a0a" }}
    >
      <StageHeader />
      <Content style={{ background: "#0a0a0a", padding: "48px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: "#f5f5f5",
              marginBottom: 16,
              margin: "0 0 16px 0",
            }}
          >
            帮助中心
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#c0c0c0",
              marginBottom: 32,
              margin: "0 0 32px 0",
            }}
          >
            我们随时为您提供帮助，让您更好地使用AI舞台系统
          </p>

          <div
            style={{ maxWidth: 600, margin: "0 auto", position: "relative" }}
          >
            <SearchOutlined
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#909090",
                fontSize: 16,
              }}
            />
            <Input
              placeholder="搜索帮助内容..."
              style={{
                background: "#151515",
                border: "1px solid #2a2a2a",
                color: "#f5f5f5",
                paddingLeft: 48,
                fontSize: 16,
                height: 48,
              }}
            />
          </div>
        </div>

        <Row gutter={24} style={{ marginBottom: 48 }}>
          {helpCategories.map((category, index) => (
            <Col span={6} key={index}>
              <Card
                hoverable
                style={{
                  background: "#151515",
                  border: "1px solid #2a2a2a",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    background: category.color,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px auto",
                  }}
                >
                  <span style={{ fontSize: 24, color: "#1a1a1a" }}>
                    {category.icon}
                  </span>
                </div>
                <h3
                  style={{
                    color: "#f5f5f5",
                    fontSize: 16,
                    marginBottom: 8,
                    margin: "0 0 8px 0",
                  }}
                >
                  {category.title}
                </h3>
                {category.count && (
                  <p style={{ color: "#c0c0c0", fontSize: 14, margin: 0 }}>
                    {category.count} 个内容
                  </p>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={24}>
          <Col span={16}>
            <Card
              title={
                <span style={{ color: "#f5f5f5", fontSize: 18 }}>常见问题</span>
              }
              style={{ background: "#151515", border: "1px solid #2a2a2a" }}
            >
              <Collapse ghost style={{ background: "transparent" }}>
                {faqData.map((item) => (
                  <Panel
                    header={
                      <span style={{ color: "#f5f5f5" }}>{item.question}</span>
                    }
                    key={item.key}
                    style={{
                      background: "transparent",
                      border: "1px solid #2a2a2a",
                      marginBottom: 8,
                    }}
                  >
                    <p style={{ color: "#c0c0c0", margin: 0 }}>{item.answer}</p>
                  </Panel>
                ))}
              </Collapse>
            </Card>
          </Col>

          <Col span={8}>
            <Card
              title={
                <span style={{ color: "#f5f5f5", fontSize: 18 }}>联系我们</span>
              }
              style={{
                background: "#151515",
                border: "1px solid #2a2a2a",
                marginBottom: 24,
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <Button
                  type="primary"
                  icon={<MessageOutlined />}
                  style={{
                    background: "#a8c090",
                    borderColor: "#a8c090",
                    color: "#1a1a1a",
                    justifyContent: "flex-start",
                  }}
                  block
                >
                  在线客服
                </Button>
                <Button
                  icon={<PhoneOutlined />}
                  style={{
                    background: "transparent",
                    borderColor: "#2a2a2a",
                    color: "#f5f5f5",
                    justifyContent: "flex-start",
                  }}
                  block
                >
                  电话支持
                </Button>
                <Button
                  icon={<MessageOutlined />}
                  style={{
                    background: "transparent",
                    borderColor: "#2a2a2a",
                    color: "#f5f5f5",
                    justifyContent: "flex-start",
                  }}
                  block
                >
                  邮件支持
                </Button>
              </div>
            </Card>

            <Card
              title={
                <span style={{ color: "#f5f5f5", fontSize: 18 }}>使用统计</span>
              }
              style={{ background: "#151515", border: "1px solid #2a2a2a" }}
            >
              <div style={{ textAlign: "center" }}>
                <h3
                  style={{
                    color: "#a8c090",
                    fontSize: 32,
                    margin: "0 0 8px 0",
                  }}
                >
                  98%
                </h3>
                <p
                  style={{
                    color: "#c0c0c0",
                    fontSize: 14,
                    margin: "0 0 16px 0",
                  }}
                >
                  问题解决率
                </p>
                <h3
                  style={{
                    color: "#81a1c1",
                    fontSize: 32,
                    margin: "0 0 8px 0",
                  }}
                >
                  2h
                </h3>
                <p style={{ color: "#c0c0c0", fontSize: 14, margin: 0 }}>
                  平均响应时间
                </p>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default HelpCenter;
