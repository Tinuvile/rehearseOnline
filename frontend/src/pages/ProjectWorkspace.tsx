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
  FolderOpenOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import StageHeader from "../components/Layout/StageHeader";

const { Content } = Layout;

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

  return (
    <Layout
      style={{ minHeight: "100vh", height: "auto", background: "#303446" }}
    >
      <StageHeader />

      {/* 主内容区 */}
      <Content style={{ background: "#303446", padding: "48px 64px" }}>
          {/* 页面标题和新建按钮 */}
          <div style={{ marginBottom: 48 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 32,
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: "#c6d0f5",
                    margin: "0 0 8px 0",
                  }}
                >
                  项目工作台
                </h2>
                <p
                  style={{
                    fontSize: 16,
                    color: "#a5adce",
                    margin: 0,
                  }}
                >
                  管理和组织您的所有排练项目
                </p>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                style={{
                  background: "linear-gradient(135deg, #a6d189, #81c8be)",
                  border: "none",
                  color: "#303446",
                  fontSize: 15,
                  fontWeight: 600,
                  height: "48px",
                  padding: "0 24px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(166, 209, 137, 0.3)",
                }}
                onClick={() => setCreateModalVisible(true)}
              >
                创建新项目
              </Button>
            </div>

            {/* 搜索和筛选 */}
            <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <SearchOutlined
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#a5adce",
                    fontSize: 16,
                  }}
                />
                <Input
                  placeholder="搜索项目..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="large"
                  style={{
                    background: "#414559",
                    border: "1px solid #626880",
                    color: "#c6d0f5",
                    paddingLeft: 48,
                    fontSize: 15,
                    borderRadius: "12px",
                    height: "48px",
                  }}
                />
              </div>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                size="large"
                style={{ 
                  width: 160,
                }}
              >
                <Select.Option value="all">全部状态</Select.Option>
                <Select.Option value="active">进行中</Select.Option>
                <Select.Option value="completed">已完成</Select.Option>
                <Select.Option value="archived">已归档</Select.Option>
              </Select>
              <Select
                value={sortBy}
                onChange={setSortBy}
                size="large"
                style={{ width: 160 }}
              >
                <Select.Option value="createDate">创建日期 ▼</Select.Option>
                <Select.Option value="modifyDate">修改日期 ▼</Select.Option>
                <Select.Option value="name">项目名称 ▲</Select.Option>
              </Select>
            </div>
          </div>

          {/* 统计卡片 */}
          <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
            <Col span={6}>
              <Card 
                style={{ 
                  background: "#414559", 
                  border: "none",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                }}
                bodyStyle={{ padding: "24px" }}
                hoverable
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ color: "#a5adce", fontSize: 14, margin: 0, fontWeight: 500 }}>
                    项目总数
                  </h3>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: "linear-gradient(135deg, #8caaee, #ca9ee6)",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FolderOpenOutlined
                      style={{ fontSize: 20, color: "#303446" }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#c6d0f5",
                    margin: 0,
                  }}
                >
                  {stats.total}
                </p>
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                style={{ 
                  background: "#414559", 
                  border: "none",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                }}
                bodyStyle={{ padding: "24px" }}
                hoverable
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ color: "#a5adce", fontSize: 14, margin: 0, fontWeight: 500 }}>
                    进行中项目
                  </h3>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: "linear-gradient(135deg, #e5c890, #ef9f76)",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LoadingOutlined
                      style={{ fontSize: 20, color: "#303446" }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#c6d0f5",
                    margin: 0,
                  }}
                >
                  {stats.active}
                </p>
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                style={{ 
                  background: "#414559", 
                  border: "none",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                }}
                bodyStyle={{ padding: "24px" }}
                hoverable
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ color: "#a5adce", fontSize: 14, margin: 0, fontWeight: 500 }}>
                    已完成项目
                  </h3>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: "linear-gradient(135deg, #a6d189, #81c8be)",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: 20, color: "#303446" }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#c6d0f5",
                    margin: 0,
                  }}
                >
                  {stats.completed}
                </p>
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                style={{ 
                  background: "#414559", 
                  border: "none",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                }}
                bodyStyle={{ padding: "24px" }}
                hoverable
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ color: "#a5adce", fontSize: 14, margin: 0, fontWeight: 500 }}>
                    已归档项目
                  </h3>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: "linear-gradient(135deg, #f4b8e4, #ca9ee6)",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <InboxOutlined style={{ fontSize: 20, color: "#303446" }} />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#c6d0f5",
                    margin: 0,
                  }}
                >
                  {stats.archived}
                </p>
              </Card>
            </Col>
          </Row>

          {/* 项目列表 */}
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#c6d0f5",
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
                    background: viewMode === "grid" ? "#8caaee" : "#414559",
                    borderColor: viewMode === "grid" ? "#8caaee" : "#626880",
                    color: viewMode === "grid" ? "#303446" : "#a5adce",
                    borderRadius: "8px",
                  }}
                />
                <Button
                  type={viewMode === "list" ? "primary" : "default"}
                  icon={<UnorderedListOutlined />}
                  onClick={() => setViewMode("list")}
                  style={{
                    background: viewMode === "list" ? "#8caaee" : "#414559",
                    borderColor: viewMode === "list" ? "#8caaee" : "#626880",
                    color: viewMode === "list" ? "#303446" : "#a5adce",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>

            <Row gutter={[24, 24]}>
              {projects.map((project) => (
                <Col span={8} key={project.id}>
                  <Card
                    hoverable
                    style={{
                      background: "#414559",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "16px",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                      transition: "all 0.3s ease",
                      overflow: "hidden",
                    }}
                    bodyStyle={{ padding: 0 }}
                    onClick={() => navigate(`/project/${project.id}/editor`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 12px 48px rgba(0, 0, 0, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.12)";
                    }}
                    cover={
                      <div style={{ position: "relative", height: 200, background: "linear-gradient(135deg, #51576d, #626880)" }}>
                        <div
                          style={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            background:
                              project.status === "active"
                                ? "#a6d189"
                                : "#81c8be",
                            color: "#303446",
                            padding: "6px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: "16px",
                          }}
                        >
                          {project.status === "active" ? "进行中" : "已完成"}
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: "50%",
                            background: "linear-gradient(to top, rgba(48, 52, 70, 0.8), transparent)",
                          }}
                        />
                      </div>
                    }
                  >
                    <div style={{ padding: "24px" }}>
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 600,
                          color: "#c6d0f5",
                          marginBottom: 12,
                          margin: "0 0 12px 0",
                        }}
                      >
                        {project.title}
                      </h3>
                      <p
                        style={{
                          color: "#a5adce",
                          fontSize: 13,
                          marginBottom: 16,
                          margin: "0 0 16px 0",
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
                              fontSize: 14,
                              color: "#a5adce",
                              marginRight: 8,
                            }}
                          />
                          <span style={{ color: "#a5adce", fontSize: 12 }}>
                            {project.lastEdit}
                          </span>
                        </div>
                        <Button
                          type="link"
                          style={{ 
                            color: "#8caaee", 
                            fontSize: 13, 
                            padding: 0,
                            fontWeight: 500,
                          }}
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
