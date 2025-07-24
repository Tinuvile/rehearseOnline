import React from "react";
import { Layout, Card, Row, Col, Progress, Statistic } from "antd";
import {
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import StageHeader from "../components/Layout/StageHeader";

const { Content } = Layout;

const DataAnalytics: React.FC = () => {
  return (
    <Layout
      style={{ minHeight: "100vh", height: "auto", background: "#0a0a0a" }}
    >
      <StageHeader />
      <Content style={{ background: "#0a0a0a", padding: "48px" }}>
        <h2
          style={{
            fontSize: 30,
            fontWeight: 500,
            color: "#f5f5f5",
            marginBottom: 32,
            margin: "0 0 32px 0",
          }}
        >
          数据分析
        </h2>

        <Row gutter={24} style={{ marginBottom: 32 }}>
          <Col span={6}>
            <Card
              style={{ background: "#151515", border: "1px solid #2a2a2a" }}
            >
              <Statistic
                title={<span style={{ color: "#c0c0c0" }}>项目完成率</span>}
                value={87.5}
                suffix="%"
                valueStyle={{ color: "#a8c090" }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{ background: "#151515", border: "1px solid #2a2a2a" }}
            >
              <Statistic
                title={<span style={{ color: "#c0c0c0" }}>平均制作时间</span>}
                value={15.6}
                suffix="天"
                valueStyle={{ color: "#81a1c1" }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{ background: "#151515", border: "1px solid #2a2a2a" }}
            >
              <Statistic
                title={<span style={{ color: "#c0c0c0" }}>活跃用户数</span>}
                value={23}
                valueStyle={{ color: "#e6b17a" }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{ background: "#151515", border: "1px solid #2a2a2a" }}
            >
              <Statistic
                title={<span style={{ color: "#c0c0c0" }}>AI使用率</span>}
                value={92.3}
                suffix="%"
                valueStyle={{ color: "#d08770" }}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Card
              title={<span style={{ color: "#f5f5f5" }}>项目类型分布</span>}
              style={{
                background: "#151515",
                border: "1px solid #2a2a2a",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <PieChartOutlined
                    style={{ fontSize: 48, color: "#a8c090", marginBottom: 16 }}
                  />
                  <p style={{ color: "#c0c0c0" }}>图表组件将在此处显示</p>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card
              title={<span style={{ color: "#f5f5f5" }}>月度趋势</span>}
              style={{
                background: "#151515",
                border: "1px solid #2a2a2a",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <LineChartOutlined
                    style={{ fontSize: 48, color: "#81a1c1", marginBottom: 16 }}
                  />
                  <p style={{ color: "#c0c0c0" }}>图表组件将在此处显示</p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          title={<span style={{ color: "#f5f5f5" }}>功能使用情况</span>}
          style={{ background: "#151515", border: "1px solid #2a2a2a" }}
        >
          <Row gutter={24}>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: "#c0c0c0" }}>视频分析</span>
                  <span style={{ color: "#a8c090" }}>85%</span>
                </div>
                <Progress
                  percent={85}
                  strokeColor="#a8c090"
                  trailColor="#2a2a2a"
                />
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: "#c0c0c0" }}>舞台编辑</span>
                  <span style={{ color: "#81a1c1" }}>92%</span>
                </div>
                <Progress
                  percent={92}
                  strokeColor="#81a1c1"
                  trailColor="#2a2a2a"
                />
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: "#c0c0c0" }}>AI建议</span>
                  <span style={{ color: "#e6b17a" }}>76%</span>
                </div>
                <Progress
                  percent={76}
                  strokeColor="#e6b17a"
                  trailColor="#2a2a2a"
                />
              </div>
            </Col>
          </Row>
        </Card>
      </Content>
    </Layout>
  );
};

export default DataAnalytics;
