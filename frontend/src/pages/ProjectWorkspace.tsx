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
      style={{ minHeight: "100vh", height: "auto", background: "#0a0a0a" }}
    >
      <StageHeader />

      <Layout>
        {/* 左侧导航栏 */}
        <Sider width={240} style={{ background: "#151515" }}>
          <div style={{ padding: 24 }}>
            <nav>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {sidebarItems.map((item) => (
                  <li key={item.key} style={{ marginBottom: 16 }}>
                    <button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: item.active ? "#a8c090" : "#c0c0c0",
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
        <Content style={{ background: "#0a0a0a", padding: "48px" }}>
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
                  color: "#f5f5f5",
                  margin: 0,
                }}
              >
                项目工作台
              </h2>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{
                  background: "#a8c090",
                  borderColor: "#a8c090",
                  color: "#1a1a1a",
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
                    color: "#909090",
                    fontSize: 12,
                  }}
                />
                <Input
                  placeholder="搜索项目..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: "#151515",
                    border: "1px solid #2a2a2a",
                    color: "#f5f5f5",
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
              <Card style={{ background: "#151515", border: "none" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ color: "#c0c0c0", fontSize: 14, margin: 0 }}>
                    项目总数
                  </h3>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "#1f1f1f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FolderOpenOutlined
                      style={{ fontSize: 18, color: "#a8c090" }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 30,
                    fontWeight: 500,
                    color: "#f5f5f5",
                    margin: 0,
                  }}
                >
                  {stats.total}
                </p>
              </Card>
            </Col>
            <Col span={6}>
              <Card style={{ background: "#151515", border: "none" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ color: "#c0c0c0", fontSize: 14, margin: 0 }}>
                    进行中项目
                  </h3>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "#1f1f1f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LoadingOutlined
                      style={{ fontSize: 18, color: "#a8c090" }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 30,
                    fontWeight: 500,
                    color: "#f5f5f5",
                    margin: 0,
                  }}
                >
                  {stats.active}
                </p>
              </Card>
            </Col>
            <Col span={6}>
              <Card style={{ background: "#151515", border: "none" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ color: "#c0c0c0", fontSize: 14, margin: 0 }}>
                    已完成项目
                  </h3>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "#1f1f1f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: 18, color: "#a8c090" }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 30,
                    fontWeight: 500,
                    color: "#f5f5f5",
                    margin: 0,
                  }}
                >
                  {stats.completed}
                </p>
              </Card>
            </Col>
            <Col span={6}>
              <Card style={{ background: "#151515", border: "none" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ color: "#c0c0c0", fontSize: 14, margin: 0 }}>
                    已归档项目
                  </h3>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "#1f1f1f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <InboxOutlined style={{ fontSize: 18, color: "#a8c090" }} />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 30,
                    fontWeight: 500,
                    color: "#f5f5f5",
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
                  color: "#f5f5f5",
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
                    background: viewMode === "grid" ? "#151515" : "#151515",
                    borderColor: "#2a2a2a",
                    color: viewMode === "grid" ? "#a8c090" : "#909090",
                  }}
                />
                <Button
                  type={viewMode === "list" ? "primary" : "default"}
                  icon={<UnorderedListOutlined />}
                  onClick={() => setViewMode("list")}
                  style={{
                    background: viewMode === "list" ? "#151515" : "#151515",
                    borderColor: "#2a2a2a",
                    color: viewMode === "list" ? "#a8c090" : "#909090",
                  }}
                />
              </div>
            </div>

            <Row gutter={24}>
              {projects.map((project) => (
                <Col span={8} key={project.id} style={{ marginBottom: 24 }}>
                  <Card
                    hoverable
                    style={{
                      background: "#151515",
                      border: "none",
                      cursor: "pointer",
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
                                ? "#a8c090"
                                : "#7fb069",
                            color: "#1a1a1a",
                            padding: "4px 8px",
                            fontSize: 10,
                            borderRadius: 2,
                          }}
                        >
                          {project.status === "active" ? "进行中" : "已完成"}
                        </div>
                      </div>
                    }
                  >
                    <div style={{ padding: 24 }}>
                      <h3
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#f5f5f5",
                          marginBottom: 8,
                          margin: 0,
                        }}
                      >
                        {project.title}
                      </h3>
                      <p
                        style={{
                          color: "#909090",
                          fontSize: 10,
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
                              color: "#909090",
                              marginRight: 8,
                            }}
                          />
                          <span style={{ color: "#909090", fontSize: 10 }}>
                            上次编辑：{project.lastEdit}
                          </span>
                        </div>
                        <Button
                          type="link"
                          style={{ color: "#a8c090", fontSize: 12, padding: 0 }}
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
