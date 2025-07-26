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

const { Content } = Layout;
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
      style={{ minHeight: "100vh", height: "auto", background: "#303446" }}
    >
      <StageHeader />

      {/* 主内容区 */}
      <Content style={{ background: "#303446", padding: "48px 64px" }}>
          {/* 页面标题 */}
          <div style={{ marginBottom: 48 }}>
            <div
              style={{
                marginBottom: 32,
              }}
            >
              <h2
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#c6d0f5",
                  margin: "0 0 8px 0",
                }}
              >
                资源库
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: "#a5adce",
                  margin: 0,
                }}
              >
                管理您的舞台设计资源和素材
              </p>
            </div>

            {/* 分类筛选 */}
            <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", alignItems: "center" }}>
              {categories.map((category) => (
                <Button
                  key={category.key}
                  size="large"
                  style={{
                    background:
                      selectedCategory === category.key
                        ? "#8caaee"
                        : "#414559",
                    color:
                      selectedCategory === category.key ? "#303446" : "#c6d0f5",
                    border: "none",
                    fontSize: 14,
                    fontWeight: 500,
                    height: "auto",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    boxShadow: selectedCategory === category.key 
                      ? "0 4px 12px rgba(140, 170, 238, 0.3)" 
                      : "none",
                  }}
                  onClick={() => setSelectedCategory(category.key)}
                >
                  <span style={{ marginRight: 8, fontSize: 16 }}>{category.icon}</span>
                  {category.label} ({category.count})
                </Button>
              ))}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                style={{
                  background: "linear-gradient(135deg, #a6d189, #81c8be)",
                  border: "none",
                  color: "#303446",
                  fontSize: 14,
                  fontWeight: 600,
                  height: "auto",
                  padding: "12px 20px",
                  marginLeft: "auto",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(166, 209, 137, 0.3)",
                }}
                onClick={() => setUploadModalVisible(true)}
              >
                上传资源
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
                  placeholder="搜索资源..."
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
                value={selectedType}
                onChange={setSelectedType}
                size="large"
                style={{ width: 160 }}
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
                  style={{ 
                    background: "#414559", 
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                  }}
                  cover={
                    <div
                      style={{
                        position: "relative",
                        height: 160,
                        background: "#51576d",
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
                                background: "#626880",
                                color: "#c6d0f5",
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
                border: "1px dashed #626880",
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
  );
};

export default ResourceLibrary;
