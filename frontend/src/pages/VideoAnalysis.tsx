import React, { useState } from "react";
import {
  Layout,
  Card,
  Button,
  Progress,
  Row,
  Col,
  Upload,
  message,
  Form,
  Select,
  Input,
  Switch,
  Alert,
  Typography,
  Space,
  Divider,
} from "antd";
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
  PlayCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import StageHeader from "../components/Layout/StageHeader";
import StageAnnotation from "../components/StageAnnotation/StageAnnotation";
import { uploadVideoForDialogue, handleApiError } from "../services/api";

const { Content } = Layout;
const { Dragger } = Upload;
const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface AnalysisStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: "completed" | "processing" | "waiting";
}

interface UploadResult {
  success: boolean;
  video_id: string;
  filename: string;
  total_segments: number;
  total_duration: number;
  speaker_count: number;
  transcripts: any[];
  speaker_statistics: any;
  full_text: string;
  srt_content: string;
  stageAnnotation?: Array<{ x: number; y: number }>;
}

const VideoAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 上传相关状态
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 文件上传状态
  const [hasFile, setHasFile] = useState(false);

  // 舞台标注相关状态
  const [currentVideoFile, setCurrentVideoFile] = useState<File | null>(null);
  const [showStageAnnotation, setShowStageAnnotation] = useState(false);
  const [stageAnnotationPoints, setStageAnnotationPoints] = useState<Array<{
    x: number;
    y: number;
  }> | null>(null);

  const analysisSteps: AnalysisStep[] = [
    {
      id: "upload",
      name: "视频上传",
      icon: <CloudUploadOutlined />,
      status: uploadResult
        ? "completed"
        : isUploading
        ? "processing"
        : "waiting",
    },
    {
      id: "audio",
      name: "台词提取",
      icon: <SoundOutlined />,
      status: uploadResult
        ? "completed"
        : isUploading
        ? "processing"
        : "waiting",
    },
    {
      id: "actors",
      name: "演员检测",
      icon: <UserOutlined />,
      status: uploadResult ? "completed" : "waiting",
    },
    {
      id: "stage",
      name: "舞台布局",
      icon: <ApartmentOutlined />,
      status: uploadResult ? "completed" : "waiting",
    },
  ];

  const handleUpload = async (file: File) => {
    try {
      // 清除之前的视频分析数据
      localStorage.removeItem("extractedDialogues");
      localStorage.removeItem("videoAnalysisResult");

      // 重置状态
      setUploadProgress(0);
      setAnalysisProgress(0);
      setError(null);
      setUploadResult(null);
      setFileName(file.name);
      setHasFile(true);

      // 保存当前视频文件并显示舞台标注界面
      setCurrentVideoFile(file);
      setShowStageAnnotation(true);

      message.success("视频文件加载成功，请标注舞台范围");
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      message.error(errorMessage);
      setHasFile(false);
    }

    return false; // 阻止默认上传
  };

  // 处理舞台标注完成
  const handleStageAnnotationComplete = async (
    points: Array<{ x: number; y: number }>
  ) => {
    if (!currentVideoFile) return;

    try {
      // 保存标注结果
      setStageAnnotationPoints(points);
      setShowStageAnnotation(false);

      // 开始语音识别
      setIsUploading(true);
      setUploadProgress(0);
      setAnalysisProgress(0);

      // 获取表单数据
      const values = await form.validateFields();

      // 模拟上传进度
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      // 调用API服务
      const data: UploadResult = await uploadVideoForDialogue(
        currentVideoFile,
        values.language || "zh",
        values.enableSpeakerDiarization || true,
        values.hotwords || ""
      );

      clearInterval(uploadInterval);
      setUploadProgress(100);

      // 模拟分析进度
      const analysisInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 100) {
            clearInterval(analysisInterval);

            // 将舞台标注信息添加到结果中
            const resultWithAnnotation = {
              ...data,
              stageAnnotation: points,
            };

            setUploadResult(resultWithAnnotation);
            setIsUploading(false);
            message.success(
              `成功分析视频并提取 ${data.total_segments} 条台词！`
            );
            return 100;
          }
          return prev + 20;
        });
      }, 500);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      message.error(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
      setAnalysisProgress(0);
      setShowStageAnnotation(false);
    }
  };

  // 跳过舞台标注
  const handleSkipStageAnnotation = async () => {
    if (!currentVideoFile) return;

    message.info("已跳过舞台标注，直接进行语音识别");
    await handleStageAnnotationComplete([]);
  };

  // 进入舞台编辑器
  const enterStageEditor = () => {
    if (uploadResult) {
      // 将台词数据存储到localStorage，供舞台编辑器使用
      const dialogues = uploadResult.transcripts.map((transcript, index) => ({
        id: `uploaded_dialogue_${index + 1}`,
        actorId: getSpeakerActorId(transcript.speaker_id),
        content: transcript.text,
        startTime: transcript.start_time,
        duration: transcript.end_time - transcript.start_time,
        emotion: null,
        volume: 80,
      }));

      localStorage.setItem("extractedDialogues", JSON.stringify(dialogues));
      localStorage.setItem("videoAnalysisResult", JSON.stringify(uploadResult));

      navigate("/editor");
    } else {
      navigate("/editor");
    }
  };

  const getSpeakerActorId = (speakerId?: string): number => {
    if (!speakerId) return 1;

    if (speakerId === "spk_0") return 1;
    if (speakerId === "spk_1") return 2;
    if (speakerId === "spk_2") return 3;

    return 1; // 默认分配给演员1
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
      style={{ minHeight: "100vh", height: "auto", background: "#303446" }}
    >
      <StageHeader />

      <Content style={{ background: "#303446", padding: "48px 64px" }}>
        {/* 舞台标注界面 */}
        {showStageAnnotation && currentVideoFile && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            <StageAnnotation
              videoFile={currentVideoFile}
              onAnnotationComplete={handleStageAnnotationComplete}
              onSkip={handleSkipStageAnnotation}
            />
          </div>
        )}

        {/* 页面标题 */}
        {!showStageAnnotation && (
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Button
                type="text"
                onClick={() => navigate("/workspace")}
                style={{
                  color: "#a5adce", /* Frappe 次要文本色 */
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
                  color: "#c6d0f5", /* Frappe 主要文本色 */
                  margin: 0,
                }}
              >
                视频分析
              </h2>
            </div>
            <p
              style={{
                color: "#a5adce", /* Frappe 次要文本色 */
                fontSize: 14,
                margin: 0,
                marginLeft: 60,
              }}
            >
              上传舞台视频，AI将自动分析舞台布局和表演元素
            </p>
          </div>
        )}

        {/* 上传区域 */}
        {!showStageAnnotation && (
          <Card
            style={{
              background: "#414559",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              marginBottom: 48,
              padding: "48px",
            }}
          >
            {/* 上传参数配置 */}
            {!hasFile && (
              <div style={{ marginBottom: 32 }}>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#c6d0f5", /* Frappe 主要文本色 */
                    marginBottom: 16,
                  }}
                >
                  上传设置
                </h3>
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    language: "zh",
                    enableSpeakerDiarization: true,
                    hotwords: "",
                  }}
                >
                  <Row gutter={24}>
                    <Col span={8}>
                      <Form.Item
                        label={
                          <span style={{ color: "#c0c0c0" }}>识别语言</span>
                        }
                        name="language"
                      >
                        <Select>
                          <Select.Option value="zh">中文</Select.Option>
                          <Select.Option value="en">英文</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={
                          <span style={{ color: "#c0c0c0" }}>说话人分离</span>
                        }
                        name="enableSpeakerDiarization"
                        valuePropName="checked"
                      >
                        <Switch
                          checkedChildren="开启"
                          unCheckedChildren="关闭"
                          defaultChecked
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={
                          <span style={{ color: "#c0c0c0" }}>
                            热词提示（可选）
                          </span>
                        }
                        name="hotwords"
                        help="用逗号分隔，如：舞台,表演,演员"
                      >
                        <Input placeholder="输入有助于识别的关键词" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
                <Divider style={{ margin: "24px 0", borderColor: "#2a2a2a" }} />
              </div>
            )}

            {/* 错误信息 */}
            {error && (
              <Alert
                message="处理失败"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            {/* 文件上传区域 */}
            {!uploadResult && (
              <Dragger
                beforeUpload={handleUpload}
                showUploadList={false}
                disabled={isUploading}
                accept=".mp4,.avi,.mov,.mkv,.webm,.flv,.wav,.mp3,.flac,.aac,.ogg"
                style={{
                  background: "transparent",
                  border: isUploading
                    ? "1px dashed #a8c090"
                    : "1px dashed #2a2a2a",
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
                    {isUploading ? (
                      <LoadingOutlined
                        style={{ fontSize: 30, color: "#a8c090" }}
                      />
                    ) : (
                      <InboxOutlined
                        style={{ fontSize: 30, color: "#a8c090" }}
                      />
                    )}
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
                    {isUploading ? "正在处理中..." : "上传舞台视频"}
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
                    {isUploading ? (
                      "AI正在分析视频并提取台词，请稍候..."
                    ) : (
                      <>
                        支持MP4、MOV、AVI、MKV、WebM、FLV等视频格式
                        <br />
                        以及WAV、MP3、FLAC、AAC、OGG等音频格式
                        <br />
                        文件大小限制：200MB
                      </>
                    )}
                  </p>
                  {!isUploading && (
                    <Button
                      type="primary"
                      style={{
                        background: "linear-gradient(135deg, #a6d189, #81c8be)",
                        border: "none",
                        color: "#303446",
                        fontSize: 14,
                        height: "auto",
                        padding: "12px 24px",
                      }}
                    >
                      选择文件
                    </Button>
                  )}
                </div>
              </Dragger>
            )}

            {/* 上传和分析进度 */}
            {isUploading && (
              <div style={{ marginBottom: 32 }}>
                {/* 上传进度 */}
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
                      onClick={() => {
                        setIsUploading(false);
                        setUploadProgress(0);
                        setAnalysisProgress(0);
                        setHasFile(false);
                        setFileName("");
                      }}
                    >
                      取消
                    </Button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        width: 80,
                        height: 45,
                        background: "#51576d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 16,
                      }}
                    >
                      <CloudUploadOutlined
                        style={{ fontSize: 20, color: "#a8c090" }}
                      />
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
                          文件上传
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

                {/* 分析进度 */}
                {uploadProgress >= 90 && (
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
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#f5f5f5",
                          margin: 0,
                        }}
                      >
                        AI分析处理
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
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          width: 80,
                          height: 45,
                          background: "#51576d",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 16,
                        }}
                      >
                        <SoundOutlined
                          style={{ fontSize: 20, color: "#a8c090" }}
                        />
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
                            台词提取和分析
                          </span>
                          <span style={{ color: "#c0c0c0", fontSize: 10 }}>
                            {analysisProgress}%
                          </span>
                        </div>
                        <Progress
                          percent={analysisProgress}
                          showInfo={false}
                          strokeColor="#a8c090"
                          trailColor="#1f1f1f"
                          size="small"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 分析完成结果 */}
            {uploadResult && (
              <div style={{ marginBottom: 32 }}>
                <Alert
                  message="视频分析完成"
                  description={`成功从"${uploadResult.filename}"中提取了 ${uploadResult.total_segments} 条台词，检测到 ${uploadResult.speaker_count} 个说话人`}
                  type="success"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                {/* 分析结果统计 */}
                <div
                  style={{
                    background: "#51576d",
                    padding: 20,
                    borderRadius: 12,
                    marginBottom: 24,
                  }}
                >
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#f5f5f5",
                      marginBottom: 16,
                    }}
                  >
                    分析结果统计
                  </h4>
                  <Row gutter={24}>
                    <Col span={6}>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 24,
                            color: "#a8c090",
                            fontWeight: "bold",
                          }}
                        >
                          {Math.floor(uploadResult.total_duration / 60)}:
                          {Math.floor(uploadResult.total_duration % 60)
                            .toString()
                            .padStart(2, "0")}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#c0c0c0",
                            marginTop: 4,
                          }}
                        >
                          总时长
                        </div>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 24,
                            color: "#a8c090",
                            fontWeight: "bold",
                          }}
                        >
                          {uploadResult.total_segments}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#c0c0c0",
                            marginTop: 4,
                          }}
                        >
                          台词数量
                        </div>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 24,
                            color: "#a8c090",
                            fontWeight: "bold",
                          }}
                        >
                          {uploadResult.speaker_count}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#c0c0c0",
                            marginTop: 4,
                          }}
                        >
                          说话人数
                        </div>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 24,
                            color: "#a8c090",
                            fontWeight: "bold",
                          }}
                        >
                          {
                            (uploadResult.srt_content || uploadResult.full_text)
                              .length
                          }
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#c0c0c0",
                            marginTop: 4,
                          }}
                        >
                          SRT字符数
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* 台词预览 */}
                <div
                  style={{
                    background: "#51576d",
                    padding: 20,
                    borderRadius: 12,
                  }}
                >
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#f5f5f5",
                      marginBottom: 16,
                    }}
                  >
                    SRT字幕预览
                  </h4>
                  <TextArea
                    value={uploadResult.srt_content || uploadResult.full_text}
                    readOnly
                    rows={8}
                    style={{
                      background: "#414559",
                      color: "#c6d0f5",
                      border: "1px solid #626880",
                      fontSize: 12,
                      resize: "none",
                      fontFamily: "monospace",
                    }}
                  />
                  <div style={{ marginTop: 12, textAlign: "right" }}>
                    <Space>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            uploadResult.srt_content
                          );
                          message.success("SRT字幕已复制到剪贴板");
                        }}
                      >
                        复制SRT字幕
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(uploadResult.full_text);
                          message.success("台词纯文本已复制到剪贴板");
                        }}
                      >
                        复制纯文本
                      </Button>
                    </Space>
                  </div>
                </div>
              </div>
            )}

            {/* AI分析状态 */}
            {(isUploading || uploadResult) && (
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
                    {uploadResult ? (
                      <>
                        <CheckCircleOutlined
                          style={{
                            fontSize: 14,
                            color: "#a8c090",
                            marginRight: 8,
                          }}
                        />
                        <span style={{ color: "#a8c090", fontSize: 12 }}>
                          分析完成
                        </span>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>

                {/* 分析步骤 */}
                <Row gutter={16}>
                  {analysisSteps.map((step) => (
                    <Col span={6} key={step.id}>
                      <Card
                        style={{
                          background: "#51576d",
                          border: "none",
                          borderRadius: "12px",
                          padding: "16px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              background: "#626880",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 12,
                            }}
                          >
                            {step.status === "processing" ? (
                              <LoadingOutlined
                                style={{
                                  fontSize: 16,
                                  color: getStepStatusColor(step.status),
                                }}
                              />
                            ) : step.status === "completed" ? (
                              <CheckCircleOutlined
                                style={{
                                  fontSize: 16,
                                  color: getStepStatusColor(step.status),
                                }}
                              />
                            ) : (
                              <span
                                style={{
                                  fontSize: 16,
                                  color: getStepStatusColor(step.status),
                                }}
                              >
                                {step.icon}
                              </span>
                            )}
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
                                color: getStepStatusColor(step.status),
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
            )}
          </Card>
        )}

        {/* 分析结果概览 */}
        {uploadResult && (
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
                    background: "#414559",
                    border: "none",
                    borderRadius: "16px",
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
                    <span style={{ color: "#a6d189", fontSize: 10 }}>
                      65% 完成
                    </span>
                  </div>
                  <div
                    style={{
                      background: "#51576d",
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
                    background: "#414559",
                    border: "none",
                    borderRadius: "16px",
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
                    <span style={{ color: "#81c8be", fontSize: 10 }}>
                      100% 完成
                    </span>
                  </div>
                  <div
                    style={{
                      background: "#51576d",
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
                    background: "#414559",
                    border: "none",
                    borderRadius: "16px",
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
                      <BulbOutlined
                        style={{ fontSize: 16, color: "#a5adce" }}
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
                      <SoundOutlined
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
        )}

        {/* 底部操作按钮 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {uploadResult ? (
            <>
              <Button
                onClick={() => {
                  setUploadResult(null);
                  setHasFile(false);
                  setFileName("");
                  setError(null);
                }}
                style={{
                  color: "#c0c0c0",
                  borderColor: "#2a2a2a",
                  background: "transparent",
                  fontSize: 14,
                  height: "auto",
                  padding: "12px 24px",
                }}
              >
                重新上传
              </Button>
              <div style={{ display: "flex", gap: 16 }}>
                <Button
                  onClick={() => {
                    const data = {
                      filename: uploadResult.filename,
                      transcripts: uploadResult.transcripts,
                      statistics: uploadResult.speaker_statistics,
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${uploadResult.filename}_analysis.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    message.success("分析结果已下载");
                  }}
                  style={{
                    color: "#a8c090",
                    borderColor: "#a8c090",
                    background: "transparent",
                    fontSize: 14,
                    height: "auto",
                    padding: "12px 24px",
                  }}
                >
                  下载结果
                </Button>
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                  onClick={enterStageEditor}
                  style={{
                    background: "#a8c090",
                    borderColor: "#a8c090",
                    color: "#1a1a1a",
                    fontSize: 14,
                    height: "auto",
                    padding: "12px 24px",
                  }}
                >
                  进入舞台编辑器
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate("/workspace")}
                style={{
                  color: "#c0c0c0",
                  borderColor: "#2a2a2a",
                  background: "transparent",
                  fontSize: 14,
                  height: "auto",
                  padding: "12px 24px",
                }}
              >
                返回工作区
              </Button>
              <div style={{ display: "flex", gap: 16 }}>
                <Button
                  disabled={!hasFile}
                  style={{
                    color: hasFile ? "#a8c090" : "#666",
                    borderColor: hasFile ? "#a8c090" : "#2a2a2a",
                    background: "transparent",
                    fontSize: 14,
                    height: "auto",
                    padding: "12px 24px",
                  }}
                >
                  查看示例
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
                  直接进入编辑器
                </Button>
              </div>
            </>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default VideoAnalysis;
