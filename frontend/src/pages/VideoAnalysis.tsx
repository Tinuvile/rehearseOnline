import React, { useState } from "react";
import { Layout, Card, Button, Progress, Row, Col, Upload } from "antd";
import { useNavigate } from "react-router-dom";
import {
  CloudUploadOutlined,
  ArrowRightOutlined,
  UserOutlined,
  ApartmentOutlined,
  BulbOutlined,
  SoundOutlined,
  CommentOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import StageHeader from "../components/Layout/StageHeader";

const { Content } = Layout;
const { Dragger } = Upload;

interface AnalysisStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: "completed" | "processing" | "waiting";
}

const VideoAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [uploadProgress] = useState(80);
  const [analysisProgress] = useState(65);
  const [isUploading] = useState(true);
  const [fileName] = useState("舞台彩排.mp4");

  const analysisSteps: AnalysisStep[] = [
    {
      id: "actors",
      name: "演员检测",
      icon: <UserOutlined />,
      status: "completed",
    },
    {
      id: "stage",
      name: "舞台区域划分",
      icon: <ApartmentOutlined />,
      status: "processing",
    },
    {
      id: "lighting",
      name: "灯光分析",
      icon: <BulbOutlined />,
      status: "waiting",
    },
    {
      id: "audio",
      name: "音频分析",
      icon: <SoundOutlined />,
      status: "waiting",
    },
  ];

  const handleUpload = (file: File) => {
    console.log("Uploading file:", file);
    return false; // 阻止默认上传
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#a8c090";
      case "processing":
        return "#a8c090";
      default:
        return "#909090";
    }
  };

  return (
    <Layout
      style={{ minHeight: "100vh", height: "auto", background: "#0a0a0a" }}
    >
      <StageHeader />

      <Content style={{ background: "#0a0a0a", padding: "48px" }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
          >
            <Button
              type="text"
              onClick={() => navigate("/workspace")}
              style={{
                color: "#c0c0c0",
                fontSize: 12,
                padding: "4px 8px",
                marginRight: 16,
              }}
            >
              ← 返回
            </Button>
            <h2
              style={{
                fontSize: 30,
                fontWeight: 500,
                color: "#f5f5f5",
                margin: 0,
              }}
            >
              视频分析
            </h2>
          </div>
          <p
            style={{
              color: "#c0c0c0",
              fontSize: 14,
              margin: 0,
              marginLeft: 60,
            }}
          >
            上传舞台视频，AI将自动分析舞台布局和表演元素
          </p>
        </div>

        {/* 上传区域 */}
        <Card
          style={{
            background: "#151515",
            border: "none",
            marginBottom: 48,
            padding: "48px",
          }}
        >
          {/* 文件上传区域 */}
          <Dragger
            beforeUpload={handleUpload}
            showUploadList={false}
            style={{
              background: "transparent",
              border: "1px dashed #2a2a2a",
              borderRadius: 0,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "48px",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <CloudUploadOutlined
                  style={{ fontSize: 30, color: "#a8c090" }}
                />
              </div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: "#f5f5f5",
                  marginBottom: 16,
                  margin: 0,
                }}
              >
                上传舞台视频
              </h3>
              <p
                style={{
                  color: "#c0c0c0",
                  textAlign: "center",
                  marginBottom: 24,
                  fontSize: 12,
                  margin: "0 0 24px 0",
                }}
              >
                支持MP4、MOV、AVI格式，最大文件大小500MB
                <br />
                拖拽文件至此处或点击选择文件
              </p>
              <Button
                type="primary"
                style={{
                  background: "#a8c090",
                  borderColor: "#a8c090",
                  color: "#1a1a1a",
                  fontSize: 14,
                  height: "auto",
                  padding: "12px 24px",
                }}
              >
                选择文件
              </Button>
            </div>
          </Dragger>

          {/* 上传进度 */}
          {isUploading && (
            <div style={{ marginBottom: 32 }}>
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
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#f5f5f5",
                    margin: 0,
                  }}
                >
                  正在上传: {fileName}
                </h3>
                <Button
                  type="link"
                  style={{ color: "#d08770", fontSize: 12, padding: 0 }}
                >
                  取消
                </Button>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 80,
                    height: 45,
                    background: "#1f1f1f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <SoundOutlined style={{ fontSize: 20, color: "#a8c090" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ color: "#c0c0c0", fontSize: 10 }}>
                      258MB / 320MB
                    </span>
                    <span style={{ color: "#c0c0c0", fontSize: 10 }}>
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress
                    percent={uploadProgress}
                    showInfo={false}
                    strokeColor="#a8c090"
                    trailColor="#1f1f1f"
                    size="small"
                  />
                </div>
              </div>
            </div>
          )}

          {/* AI分析状态 */}
          <div>
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
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#f5f5f5",
                  margin: 0,
                }}
              >
                AI分析状态
              </h3>
              <div style={{ display: "flex", alignItems: "center" }}>
                <LoadingOutlined
                  style={{
                    fontSize: 14,
                    color: "#a8c090",
                    marginRight: 8,
                  }}
                />
                <span style={{ color: "#a8c090", fontSize: 12 }}>
                  正在分析中
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ color: "#c0c0c0", fontSize: 10 }}>分析进度</span>
              <span style={{ color: "#c0c0c0", fontSize: 10 }}>
                {analysisProgress}%
              </span>
            </div>

            <Progress
              percent={analysisProgress}
              showInfo={false}
              strokeColor="#a8c090"
              trailColor="#1f1f1f"
              style={{ marginBottom: 24 }}
            />

            {/* 分析步骤 */}
            <Row gutter={16}>
              {analysisSteps.map((step) => (
                <Col span={6} key={step.id}>
                  <Card
                    style={{
                      background: "#1f1f1f",
                      border: "none",
                      padding: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          background: "#2a2a2a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 16,
                            color: getStepStatusColor(step.status),
                          }}
                        >
                          {step.icon}
                        </span>
                      </div>
                      <div>
                        <p
                          style={{
                            color: "#c0c0c0",
                            fontSize: 10,
                            margin: 0,
                            marginBottom: 4,
                          }}
                        >
                          {step.name}
                        </p>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#f5f5f5",
                            margin: 0,
                          }}
                        >
                          {step.status === "completed"
                            ? "完成"
                            : step.status === "processing"
                            ? "进行中"
                            : "等待中"}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Card>

        {/* 分析结果概览 */}
        <div style={{ marginBottom: 32 }}>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: "#f5f5f5",
              marginBottom: 16,
              margin: "0 0 16px 0",
            }}
          >
            分析结果概览
          </h3>

          <Row gutter={24} style={{ marginBottom: 32 }}>
            {/* 舞台区域划分 */}
            <Col span={12}>
              <Card
                style={{
                  background: "#151515",
                  border: "none",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#f5f5f5",
                      margin: 0,
                    }}
                  >
                    舞台区域划分
                  </h4>
                  <span style={{ color: "#a8c090", fontSize: 10 }}>
                    65% 完成
                  </span>
                </div>
                <div
                  style={{
                    background: "#1f1f1f",
                    width: "100%",
                    height: 240,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <img
                    src="/placeholder.svg"
                    alt="舞台区域划分俯视图"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <p
                  style={{
                    color: "#c0c0c0",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  已初步识别主舞台区域、表演区和技术区，区域划分将随分析进度更新
                </p>
              </Card>
            </Col>

            {/* 演员定位 */}
            <Col span={12}>
              <Card
                style={{
                  background: "#151515",
                  border: "none",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#f5f5f5",
                      margin: 0,
                    }}
                  >
                    演员定位
                  </h4>
                  <span style={{ color: "#7fb069", fontSize: 10 }}>
                    100% 完成
                  </span>
                </div>
                <div
                  style={{
                    background: "#1f1f1f",
                    width: "100%",
                    height: 240,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                    position: "relative",
                  }}
                >
                  {/* 模拟散点图 */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    {[
                      { x: 100, y: 80, label: "演员1" },
                      { x: 200, y: 120, label: "演员2" },
                      { x: 150, y: 180, label: "演员3" },
                      { x: 300, y: 100, label: "演员4" },
                      { x: 250, y: 160, label: "演员5" },
                    ].map((point, index) => (
                      <div
                        key={index}
                        style={{
                          position: "absolute",
                          left: point.x,
                          top: point.y,
                          width: 15,
                          height: 15,
                          borderRadius: "50%",
                          background: "#a8c090",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 8,
                          color: "#1a1a1a",
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </div>
                    ))}
                  </div>
                </div>
                <p
                  style={{
                    color: "#c0c0c0",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  检测到5名演员，分布在舞台不同位置。可在编辑界面中调整定位和分配角色
                </p>
              </Card>
            </Col>
          </Row>

          {/* 其他分析项目 */}
          <Row gutter={24}>
            <Col span={8}>
              <Card
                style={{
                  background: "#151515",
                  border: "none",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: "#1f1f1f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <BulbOutlined style={{ fontSize: 16, color: "#909090" }} />
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#f5f5f5",
                        margin: 0,
                      }}
                    >
                      灯光分析
                    </h4>
                    <p
                      style={{
                        color: "#909090",
                        fontSize: 10,
                        margin: 0,
                      }}
                    >
                      等待分析完成
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    color: "#c0c0c0",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  AI将识别灯光布局、类型和变化模式
                </p>
              </Card>
            </Col>

            <Col span={8}>
              <Card
                style={{
                  background: "#151515",
                  border: "none",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: "#1f1f1f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <SoundOutlined style={{ fontSize: 16, color: "#909090" }} />
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#f5f5f5",
                        margin: 0,
                      }}
                    >
                      音频分析
                    </h4>
                    <p
                      style={{
                        color: "#909090",
                        fontSize: 10,
                        margin: 0,
                      }}
                    >
                      等待分析完成
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    color: "#c0c0c0",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  AI将分析音乐节奏、台词内容和声音效果
                </p>
              </Card>
            </Col>

            <Col span={8}>
              <Card
                style={{
                  background: "#151515",
                  border: "none",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: "#1f1f1f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <CommentOutlined
                      style={{ fontSize: 16, color: "#909090" }}
                    />
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#f5f5f5",
                        margin: 0,
                      }}
                    >
                      台词识别
                    </h4>
                    <p
                      style={{
                        color: "#909090",
                        fontSize: 10,
                        margin: 0,
                      }}
                    >
                      等待分析完成
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    color: "#c0c0c0",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  AI将提取并转录演员台词内容
                </p>
              </Card>
            </Col>
          </Row>
        </div>

        {/* 底部操作按钮 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            style={{
              color: "#c0c0c0",
              borderColor: "#2a2a2a",
              background: "transparent",
              fontSize: 14,
              height: "auto",
              padding: "12px 24px",
            }}
          >
            取消分析
          </Button>
          <div style={{ display: "flex", gap: 16 }}>
            <Button
              style={{
                color: "#a8c090",
                borderColor: "#a8c090",
                background: "transparent",
                fontSize: 14,
                height: "auto",
                padding: "12px 24px",
              }}
            >
              保存分析结果
            </Button>
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              onClick={() => navigate("/editor")}
              style={{
                background: "#a8c090",
                borderColor: "#a8c090",
                color: "#1a1a1a",
                fontSize: 14,
                height: "auto",
                padding: "12px 24px",
              }}
            >
              进入编辑界面
            </Button>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default VideoAnalysis;
