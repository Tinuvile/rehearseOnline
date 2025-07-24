import React, { useState } from "react";
import {
  Layout,
  Card,
  Input,
  Select,
  Button,
  Row,
  Col,
  Upload,
  Modal,
  Tag,
  Image,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  CloudUploadOutlined,
  FolderOutlined,
  FileImageOutlined,
  SoundOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import StageHeader from "../components/Layout/StageHeader";

const { Content, Sider } = Layout;
const { Meta } = Card;
const { Dragger } = Upload;

interface Resource {
  id: string;
  name: string;
  type: "image" | "audio" | "video" | "model" | "document";
  category: string;
  size: string;
  uploadDate: string;
  tags: string[];
  thumbnail: string;
}

const ResourceLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const categories = [
    { key: "all", label: "全部资源", icon: <FolderOutlined />, count: 128 },
    { key: "stage", label: "舞台布景", icon: <FileImageOutlined />, count: 45 },
    { key: "props", label: "道具模型", icon: <FileImageOutlined />, count: 32 },
    {
      key: "lighting",
      label: "灯光效果",
      icon: <FileImageOutlined />,
      count: 28,
    },
    { key: "audio", label: "音频素材", icon: <SoundOutlined />, count: 15 },
    {
      key: "video",
      label: "视频素材",
      icon: <VideoCameraOutlined />,
      count: 8,
    },
  ];

  const resources: Resource[] = [
    {
      id: "1",
      name: "现代舞台背景",
      type: "image",
      category: "stage",
      size: "2.5MB",
      uploadDate: "2024-01-15",
      tags: ["现代", "简约", "背景"],
      thumbnail: "/placeholder.svg",
    },
    {
      id: "2",
      name: "古典钢琴音效",
      type: "audio",
      category: "audio",
      size: "5.2MB",
      uploadDate: "2024-01-14",
      tags: ["钢琴", "古典", "音乐"],
      thumbnail: "/placeholder.svg",
    },
    {
      id: "3",
      name: "舞台灯光预设",
      type: "document",
      category: "lighting",
      size: "156KB",
      uploadDate: "2024-01-13",
      tags: ["灯光", "预设", "配置"],
      thumbnail: "/placeholder.svg",
    },
    {
      id: "4",
      name: "演出椅子模型",
      type: "model",
      category: "props",
      size: "1.8MB",
      uploadDate: "2024-01-12",
      tags: ["椅子", "道具", "模型"],
      thumbnail: "/placeholder.svg",
    },
    {
      id: "5",
      name: "彩排录像片段",
      type: "video",
      category: "video",
      size: "125MB",
      uploadDate: "2024-01-11",
      tags: ["彩排", "录像", "演出"],
      thumbnail: "/placeholder.svg",
    },
    {
      id: "6",
      name: "舞台幕布纹理",
      type: "image",
      category: "stage",
      size: "3.1MB",
      uploadDate: "2024-01-10",
      tags: ["幕布", "纹理", "材质"],
      thumbnail: "/placeholder.svg",
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <FileImageOutlined />;
      case "audio":
        return <SoundOutlined />;
      case "video":
        return <VideoCameraOutlined />;
      case "document":
        return <FileTextOutlined />;
      default:
        return <FileImageOutlined />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "#a8c090";
      case "audio":
        return "#81a1c1";
      case "video":
        return "#e6b17a";
      case "document":
        return "#d08770";
      default:
        return "#c0c0c0";
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" || resource.category === selectedCategory;
    const matchesType =
      selectedType === "all" || resource.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <Layout
      style={{ minHeight: "100vh", height: "auto", background: "#0a0a0a" }}
    >
      <StageHeader />

      <Layout>
        {/* 左侧分类栏 */}
        <Sider width={240} style={{ background: "#151515" }}>
          <div style={{ padding: 24 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#f5f5f5",
                marginBottom: 16,
                margin: "0 0 16px 0",
              }}
            >
              资源分类
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {categories.map((category) => (
                <Button
                  key={category.key}
                  style={{
                    background:
                      selectedCategory === category.key
                        ? "#1f1f1f"
                        : "transparent",
                    color:
                      selectedCategory === category.key ? "#a8c090" : "#c0c0c0",
                    border:
                      selectedCategory === category.key
                        ? "1px solid #a8c090"
                        : "1px solid #2a2a2a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    fontSize: 12,
                    height: "auto",
                  }}
                  onClick={() => setSelectedCategory(category.key)}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: 8 }}>{category.icon}</span>
                    {category.label}
                  </div>
                  <span
                    style={{
                      background: "#2a2a2a",
                      color: "#c0c0c0",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      fontSize: 10,
                    }}
                  >
                    {category.count}
                  </span>
                </Button>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{
                  background: "#a8c090",
                  borderColor: "#a8c090",
                  color: "#1a1a1a",
                  width: "100%",
                  fontSize: 12,
                  height: "auto",
                  padding: "12px",
                }}
                onClick={() => setUploadModalVisible(true)}
              >
                上传资源
              </Button>
            </div>
          </div>
        </Sider>

        {/* 主内容区 */}
        <Content style={{ background: "#0a0a0a", padding: "48px" }}>
          {/* 页面标题和搜索 */}
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
                资源库
              </h2>
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
                  placeholder="搜索资源..."
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
                value={selectedType}
                onChange={setSelectedType}
                style={{ width: 150 }}
              >
                <Select.Option value="all">全部类型</Select.Option>
                <Select.Option value="image">图片</Select.Option>
                <Select.Option value="audio">音频</Select.Option>
                <Select.Option value="video">视频</Select.Option>
                <Select.Option value="model">模型</Select.Option>
                <Select.Option value="document">文档</Select.Option>
              </Select>
            </div>
          </div>

          {/* 资源网格 */}
          <Row gutter={24}>
            {filteredResources.map((resource) => (
              <Col span={6} key={resource.id} style={{ marginBottom: 24 }}>
                <Card
                  hoverable
                  style={{ background: "#151515", border: "1px solid #2a2a2a" }}
                  cover={
                    <div
                      style={{
                        position: "relative",
                        height: 160,
                        background: "#1f1f1f",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {resource.type === "image" ? (
                        <Image
                          src={resource.thumbnail}
                          alt={resource.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          preview={false}
                        />
                      ) : (
                        <div
                          style={{
                            fontSize: 48,
                            color: getTypeColor(resource.type),
                          }}
                        >
                          {getTypeIcon(resource.type)}
                        </div>
                      )}
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: getTypeColor(resource.type),
                          color: "#1a1a1a",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: 10,
                          fontWeight: 500,
                        }}
                      >
                        {resource.type.toUpperCase()}
                      </div>
                    </div>
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<DownloadOutlined />}
                      style={{ color: "#c0c0c0" }}
                    />,
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      style={{ color: "#c0c0c0" }}
                    />,
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      style={{ color: "#d08770" }}
                    />,
                  ]}
                >
                  <Meta
                    title={
                      <span style={{ color: "#f5f5f5", fontSize: 14 }}>
                        {resource.name}
                      </span>
                    }
                    description={
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <span style={{ color: "#909090", fontSize: 12 }}>
                            {resource.size}
                          </span>
                          <span style={{ color: "#909090", fontSize: 12 }}>
                            {resource.uploadDate}
                          </span>
                        </div>
                        <div>
                          {resource.tags.map((tag) => (
                            <Tag
                              key={tag}
                              style={{
                                background: "#2a2a2a",
                                color: "#c0c0c0",
                                border: "none",
                                fontSize: 10,
                                margin: "2px 4px 2px 0",
                              }}
                            >
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {/* 上传对话框 */}
          <Modal
            title="上传资源"
            open={uploadModalVisible}
            onCancel={() => setUploadModalVisible(false)}
            footer={null}
            width={600}
          >
            <Dragger
              name="file"
              multiple
              style={{
                background: "transparent",
                border: "1px dashed #2a2a2a",
              }}
            >
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined
                  style={{ fontSize: 48, color: "#a8c090" }}
                />
              </p>
              <p className="ant-upload-text" style={{ color: "#f5f5f5" }}>
                点击或拖拽文件到这里上传
              </p>
              <p className="ant-upload-hint" style={{ color: "#c0c0c0" }}>
                支持单个或批量上传。支持图片、音频、视频、文档等格式
              </p>
            </Dragger>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ResourceLibrary;
