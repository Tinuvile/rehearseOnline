import React, { useState } from "react";
import {
  Layout,
  Card,
  Input,
  Select,
  Button,
  Row,
  Col,
  Pagination,
  Modal,
  Form,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  PlusOutlined,
  SearchOutlined,
  HomeOutlined,
  ProjectOutlined,
  FolderOutlined,
  TeamOutlined,
  LineChartOutlined,
  QuestionCircleOutlined,
  FolderOpenOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import StageHeader from "../components/Layout/StageHeader";

const { Sider, Content } = Layout;

interface Project {
  id: string;
  title: string;
  status: "active" | "completed" | "archived";
  createDate: string;
  lastEdit: string;
  image: string;
}

const ProjectWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createDate");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 模拟项目数据
  const projects: Project[] = [
    {
      id: "1",
      title: "2023音乐节主舞台",
      status: "active",
      createDate: "2023-10-15",
      lastEdit: "2小时前",
      image: "/placeholder.svg",
    },
  ];

  const stats = {
    total: 16,
    active: 7,
    completed: 8,
    archived: 1,
  };

  const sidebarItems = [
    { key: "home", icon: <HomeOutlined />, label: "首页", active: false },
    {
      key: "workspace",
      icon: <ProjectOutlined />,
      label: "项目工作台",
      active: true,
    },
    {
      key: "resources",
      icon: <FolderOutlined />,
      label: "资源库",
      active: false,
    },
    { key: "team", icon: <TeamOutlined />, label: "团队管理", active: false },
    {
      key: "analytics",
      icon: <LineChartOutlined />,
      label: "数据分析",
      active: false,
    },
    {
      key: "help",
      icon: <QuestionCircleOutlined />,
      label: "帮助中心",
      active: false,
    },
  ];

  return (
    <Layout
      style={{ minHeight: "100vh", height: "auto", background: "var(--color-background)" }}
    >
      <StageHeader />

      <Layout>
        {/* 左侧导航栏 */}
        <Sider width={240} style={{ background: "var(--color-background-lighter)" }}>
          <div style={{ padding: 24 }}>
            <nav>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {sidebarItems.map((item) => (
                  <li key={item.key} style={{ marginBottom: 16 }}>
                    <button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: item.active ? "var(--color-accent)" : "rgba(217, 214, 206, 0.8)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        padding: 0,
                        width: "100%",
                        textAlign: "left",
                      }}
                      onClick={() => console.log(`Navigate to ${item.key}`)}
                    >
                      <span
                        style={{
                          marginRight: 12,
                          width: 20,
                          textAlign: "center",
                        }}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </Sider>

        {/* 主内容区 */}
        <Content style={{ background: "var(--color-background)", padding: "48px" }}>
          {/* 页面标题和新建按钮 */}
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
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
                项目工作台
              </h2>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{
                  background: "var(--color-accent)",
                  borderColor: "var(--color-accent)",
                  color: "var(--color-text)",
                  fontSize: 14,
                  height: "auto",
                  padding: "12px 24px",
                }}
                onClick={() => setCreateModalVisible(true)}
              >
                创建新项目
              </Button>
            </div>

            {/* 搜索和筛选 */}
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <SearchOutlined
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "rgba(217, 214, 206, 0.6)",
                    fontSize: 12,
                  }}
                />
                <Input
                  placeholder="搜索项目..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: "var(--color-background-lighter)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                    paddingLeft: 40,
                    fontSize: 14,
                  }}
                />
              </div>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
              >
                <Select.Option value="all">全部状态</Select.Option>
                <Select.Option value="active">进行中</Select.Option>
                <Select.Option value="completed">已完成</Select.Option>
                <Select.Option value="archived">已归档</Select.Option>
              </Select>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 150 }}
              >
                <Select.Option value="createDate">创建日期 ▼</Select.Option>
                <Select.Option value="modifyDate">修改日期 ▼</Select.Option>
                <Select.Option value="name">项目名称 ▲</Select.Option>
              </Select>
            </div>
          </div>

          {/* 统计卡片 */}
          <Row gutter={24} style={{ marginBottom: 32 }}>
            <Col span={6}>
              <Card style={{ background: "var(--color-background-lighter)", border: "none" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ color: "rgba(217, 214, 206, 0.8)", fontSize: 14, margin: 0 }}>
                    项目总数
                  </h3>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "var(--color-background)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FolderOpenOutlined
                      style={{ fontSize: 18, color: "var(--color-accent)" }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 30,
                    fontWeight: 500,
                    color: "var(--color-text)",
                    margin: 0,
                  }}
                >
                  {stats.total}
                </p>
              </Card>
            </Col>
            <Col span={6}>
              <Card style={{ background: "var(--color-background-lighter)", border: "none" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ color: "rgba(217, 214, 206, 0.8)", fontSize: 14, margin: 0 }}>
                    进行中项目
                  </h3>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "var(--color-background)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LoadingOutlined
                      style={{ fontSize: 18, color: "var(--color-accent)" }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 30,
                    fontWeight: 500,
                    color: "var(--color-text)",
                    margin: 0,
                  }}
                >
                  {stats.active}
                </p>
              </Card>
            </Col>
            <Col span={6}>
              <Card style={{ background: "var(--color-background-lighter)", border: "none" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ color: "rgba(217, 214, 206, 0.8)", fontSize: 14, margin: 0 }}>
                    已完成项目
                  </h3>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "var(--color-background)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: 18, color: "var(--color-accent)" }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 30,
                    fontWeight: 500,
                    color: "var(--color-text)",
                    margin: 0,
                  }}
                >
                  {stats.completed}
                </p>
              </Card>
            </Col>
            <Col span={6}>
              <Card style={{ background: "var(--color-background-lighter)", border: "none" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ color: "rgba(217, 214, 206, 0.8)", fontSize: 14, margin: 0 }}>
                    已归档项目
                  </h3>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "var(--color-background)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <InboxOutlined style={{ fontSize: 18, color: "var(--color-accent)" }} />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 30,
                    fontWeight: 500,
                    color: "var(--color-text)",
                    margin: 0,
                  }}
                >
                  {stats.archived}
                </p>
              </Card>
            </Col>
          </Row>

          {/* 项目列表 */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: "var(--color-text)",
                  margin: 0,
                }}
              >
                我的项目
              </h3>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  type={viewMode === "grid" ? "primary" : "default"}
                  icon={<AppstoreOutlined />}
                  onClick={() => setViewMode("grid")}
                  style={{
                    background: "var(--color-background-lighter)",
                    borderColor: "var(--color-border)",
                    color: viewMode === "grid" ? "var(--color-accent)" : "rgba(217, 214, 206, 0.6)",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
                <Button
                  type={viewMode === "list" ? "primary" : "default"}
                  icon={<UnorderedListOutlined />}
                  onClick={() => setViewMode("list")}
                  style={{
                    background: "var(--color-background-lighter)",
                    borderColor: "var(--color-border)",
                    color: viewMode === "list" ? "var(--color-accent)" : "rgba(217, 214, 206, 0.6)",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              </div>
            </div>

            <Row gutter={[24, 24]}>
              {projects.map((project) => (
                <Col 
                  key={project.id}
                  xs={24}
                  sm={12}
                  md={8}
                  lg={8}
                  xl={6}
                  style={{ marginBottom: 0 }}
                >
                  <Card
                    hoverable
                    style={{
                      background: "var(--color-background-lighter)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      height: "100%",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    bodyStyle={{ padding: 0 }}
                    onClick={() => navigate(`/project/${project.id}/editor`)}
                    cover={
                      <div style={{ position: "relative", height: 180 }}>
                        <img
                          src={project.image}
                          alt={project.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            background:
                              project.status === "active"
                                ? "var(--color-accent)"
                                : "#d13e00",
                            color: "var(--color-text)",
                            padding: "4px 8px",
                            fontSize: 10,
                            borderRadius: 4,
                          }}
                        >
                          {project.status === "active" ? "进行中" : "已完成"}
                        </div>
                      </div>
                    }
                  >
                    <div style={{ padding: 20 }}>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 500,
                          color: "var(--color-text)",
                          marginBottom: 8,
                          margin: 0,
                        }}
                      >
                        {project.title}
                      </h3>
                      <p
                        style={{
                          color: "rgba(217, 214, 206, 0.6)",
                          fontSize: 12,
                          marginBottom: 16,
                          margin: "8px 0 16px 0",
                        }}
                      >
                        创建日期：{project.createDate}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <ClockCircleOutlined
                            style={{
                              fontSize: 12,
                              color: "rgba(217, 214, 206, 0.6)",
                              marginRight: 8,
                            }}
                          />
                          <span style={{ color: "rgba(217, 214, 206, 0.6)", fontSize: 12 }}>
                            上次编辑：{project.lastEdit}
                          </span>
                        </div>
                        <Button
                          type="link"
                          style={{ color: "var(--color-accent)", fontSize: 12, padding: 0 }}
                        >
                          查看详情
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* 分页 */}
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 32 }}
          >
            <Pagination
              current={1}
              total={projects.length}
              pageSize={6}
              showSizeChanger={false}
            />
          </div>
        </Content>
      </Layout>

      {/* 创建项目模态框 */}
      <Modal
        title="创建新项目"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              console.log("创建项目:", values);
              message.success("项目创建成功！");
              setCreateModalVisible(false);
              form.resetFields();
              // 可以跳转到新项目的编辑页面
              navigate("/editor");
            })
            .catch((error) => {
              console.log("表单验证失败:", error);
            });
        }}
        okText="创建"
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="项目名称"
            name="projectName"
            rules={[{ required: true, message: "请输入项目名称" }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item
            label="项目描述"
            name="description"
            rules={[{ required: false }]}
          >
            <Input.TextArea rows={3} placeholder="简要描述项目内容和目标" />
          </Form.Item>

          <Form.Item
            label="项目类型"
            name="projectType"
            rules={[{ required: true, message: "请选择项目类型" }]}
          >
            <Select placeholder="选择项目类型">
              <Select.Option value="concert">音乐会</Select.Option>
              <Select.Option value="theater">戏剧表演</Select.Option>
              <Select.Option value="dance">舞蹈演出</Select.Option>
              <Select.Option value="conference">会议活动</Select.Option>
              <Select.Option value="wedding">婚礼庆典</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="舞台规格"
            name="stageSize"
            rules={[{ required: true, message: "请选择舞台规格" }]}
          >
            <Select placeholder="选择舞台规格">
              <Select.Option value="small">小型舞台 (10m × 8m)</Select.Option>
              <Select.Option value="medium">中型舞台 (15m × 12m)</Select.Option>
              <Select.Option value="large">大型舞台 (20m × 16m)</Select.Option>
              <Select.Option value="custom">自定义尺寸</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default ProjectWorkspace;
