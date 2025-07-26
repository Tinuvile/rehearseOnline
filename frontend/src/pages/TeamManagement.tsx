import React from "react";
import { Layout, Card, Row, Col, Avatar, Button, Table, Tag } from "antd";
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import StageHeader from "../components/Layout/StageHeader";

const { Content } = Layout;

const TeamManagement: React.FC = () => {
  const teamMembers = [
    {
      key: "1",
      name: "林设计师",
      role: "主设计师",
      email: "lin@example.com",
      status: "在线",
      projects: 5,
    },
    {
      key: "2",
      name: "王导演",
      role: "艺术总监",
      email: "wang@example.com",
      status: "离线",
      projects: 3,
    },
    {
      key: "3",
      name: "李工程师",
      role: "技术支持",
      email: "li@example.com",
      status: "在线",
      projects: 8,
    },
    {
      key: "4",
      name: "张助理",
      role: "项目助理",
      email: "zhang@example.com",
      status: "在线",
      projects: 2,
    },
  ];

  const columns = [
    {
      title: "成员",
      dataIndex: "name",
      render: (text: string) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
          <span style={{ color: "var(--color-text)" }}>{text}</span>
        </div>
      ),
    },
    {
      title: "角色",
      dataIndex: "role",
      render: (text: string) => (
        <span style={{ color: "rgba(217, 214, 206, 0.8)" }}>{text}</span>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (status: string) => (
        <Tag color={status === "在线" ? "green" : "default"}>{status}</Tag>
      ),
    },
    {
      title: "参与项目",
      dataIndex: "projects",
      render: (count: number) => (
        <span style={{ color: "var(--color-accent)" }}>{count}</span>
      ),
    },
    {
      title: "操作",
      render: () => (
        <div>
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: "rgba(217, 214, 206, 0.8)", marginRight: 8 }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            style={{ color: "#d08770" }}
          />
        </div>
      ),
    },
  ];

  return (
    <Layout
      style={{ minHeight: "100vh", height: "auto", background: "var(--color-background)" }}
    >
      <StageHeader />
      <Content style={{ background: "var(--color-background)", padding: "48px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <h2
            style={{
              fontSize: 30,
              fontWeight: 500,
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            团队管理
          </h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              background: "var(--color-accent)",
              borderColor: "var(--color-accent)",
              color: "var(--color-text)",
            }}
          >
            邀请成员
          </Button>
        </div>

        <Row gutter={24} style={{ marginBottom: 32 }}>
          <Col span={6}>
            <Card
              style={{
                background: "var(--color-background-lighter)",
                border: "1px solid var(--color-border)",
                textAlign: "center",
              }}
            >
              <h3
                style={{ color: "var(--color-text)", fontSize: 24, margin: "0 0 8px 0" }}
              >
                4
              </h3>
              <p style={{ color: "rgba(217, 214, 206, 0.8)", margin: 0 }}>团队成员</p>
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{
                background: "var(--color-background-lighter)",
                border: "1px solid var(--color-border)",
                textAlign: "center",
              }}
            >
              <h3
                style={{ color: "var(--color-text)", fontSize: 24, margin: "0 0 8px 0" }}
              >
                18
              </h3>
              <p style={{ color: "rgba(217, 214, 206, 0.8)", margin: 0 }}>总项目数</p>
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{
                background: "var(--color-background-lighter)",
                border: "1px solid var(--color-border)",
                textAlign: "center",
              }}
            >
              <h3
                style={{ color: "var(--color-text)", fontSize: 24, margin: "0 0 8px 0" }}
              >
                3
              </h3>
              <p style={{ color: "rgba(217, 214, 206, 0.8)", margin: 0 }}>在线成员</p>
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{
                background: "var(--color-background-lighter)",
                border: "1px solid var(--color-border)",
                textAlign: "center",
              }}
            >
              <h3
                style={{ color: "var(--color-text)", fontSize: 24, margin: "0 0 8px 0" }}
              >
                92%
              </h3>
              <p style={{ color: "rgba(217, 214, 206, 0.8)", margin: 0 }}>协作效率</p>
            </Card>
          </Col>
        </Row>

        <Card style={{ background: "var(--color-background-lighter)", border: "1px solid var(--color-border)" }}>
          <Table
            columns={columns}
            dataSource={teamMembers}
            pagination={false}
            style={{ background: "transparent" }}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default TeamManagement;
