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
      style={{ minHeight: "100vh", height: "auto", background: "var(--color-background)" }}
    >
      <StageHeader />
      <Content style={{ background: "var(--color-background)", padding: "48px" }}>
        <h2
          style={{
            fontSize: 30,
            fontWeight: 500,
            color: "var(--color-text)",
            marginBottom: 32,
            margin: "0 0 32px 0",
          }}
        >
          数据分析
        </h2>

        <Row gutter={24} style={{ marginBottom: 32 }}>
          <Col span={6}>
            <Card
              style={{ background: "var(--color-background-lighter)", border: "1px solid var(--color-border)" }}
            >
              <Statistic
                title={<span style={{ color: "rgba(217, 214, 206, 0.8)" }}>项目完成率</span>}
                value={87.5}
                suffix="%"
                valueStyle={{ color: "var(--color-accent)" }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{ background: "var(--color-background-lighter)", border: "1px solid var(--color-border)" }}
            >
              <Statistic
                title={<span style={{ color: "rgba(217, 214, 206, 0.8)" }}>平均制作时间</span>}
                value={15.6}
                suffix="天"
                valueStyle={{ color: "#81a1c1" }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{ background: "var(--color-background-lighter)", border: "1px solid var(--color-border)" }}
            >
              <Statistic
                title={<span style={{ color: "rgba(217, 214, 206, 0.8)" }}>活跃用户数</span>}
                value={23}
                valueStyle={{ color: "#e6b17a" }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{ background: "var(--color-background-lighter)", border: "1px solid var(--color-border)" }}
            >
              <Statistic
                title={<span style={{ color: "rgba(217, 214, 206, 0.8)" }}>AI使用率</span>}
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
              title={<span style={{ color: "var(--color-text)" }}>项目类型分布</span>}
              style={{
                background: "var(--color-background-lighter)",
                border: "1px solid var(--color-border)",
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
                    style={{ fontSize: 48, color: "var(--color-accent)", marginBottom: 16 }}
                  />
                  <p style={{ color: "rgba(217, 214, 206, 0.8)" }}>图表组件将在此处显示</p>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card
              title={<span style={{ color: "var(--color-text)" }}>月度趋势</span>}
              style={{
                background: "var(--color-background-lighter)",
                border: "1px solid var(--color-border)",
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
                  <p style={{ color: "rgba(217, 214, 206, 0.8)" }}>图表组件将在此处显示</p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          title={<span style={{ color: "var(--color-text)" }}>功能使用情况</span>}
          style={{ background: "var(--color-background-lighter)", border: "1px solid var(--color-border)" }}
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
                  <span style={{ color: "rgba(217, 214, 206, 0.8)" }}>视频分析</span>
                  <span style={{ color: "var(--color-accent)" }}>85%</span>
                </div>
                <Progress
                  percent={85}
                  strokeColor="var(--color-accent)"
                  trailColor="var(--color-border)"
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
                  <span style={{ color: "rgba(217, 214, 206, 0.8)" }}>舞台编辑</span>
                  <span style={{ color: "#81a1c1" }}>92%</span>
                </div>
                <Progress
                  percent={92}
                  strokeColor="#81a1c1"
                  trailColor="var(--color-border)"
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
                  <span style={{ color: "rgba(217, 214, 206, 0.8)" }}>AI建议</span>
                  <span style={{ color: "#e6b17a" }}>76%</span>
                </div>
                <Progress
                  percent={76}
                  strokeColor="#e6b17a"
                  trailColor="var(--color-border)"
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
