import React, { useState, useCallback } from "react";
import {
  Upload,
  Button,
  message,
  Progress,
  Card,
  Space,
  Typography,
} from "antd";
import { InboxOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useAppActions } from "../../contexts/AppContext";
import { videoApi, stageApi } from "../../services/api";

const { Dragger } = Upload;
const { Title, Text } = Typography;

const VideoUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processProgress, setProcessProgress] = useState(0);
  const actions = useAppActions();

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        setUploading(true);
        setUploadProgress(0);

        // 模拟上传进度
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // 上传视频
        const uploadResponse = await videoApi.uploadVideo(file);

        clearInterval(progressInterval);
        setUploadProgress(100);
        setUploading(false);

        message.success("视频上传成功！");

        // 从上传响应中提取数据
        const uploadData = uploadResponse.data || uploadResponse;
        const videoId = uploadData.video_id || uploadData.id;

        // 设置当前视频
        actions.setCurrentVideo(uploadData);

        // 开始处理视频
        setProcessing(true);
        setProcessProgress(0);

        // 模拟处理进度
        const processInterval = setInterval(() => {
          setProcessProgress((prev) => {
            if (prev >= 90) {
              clearInterval(processInterval);
              return 90;
            }
            return prev + 5;
          });
        }, 500);

        // 处理视频
        const processResponse = await videoApi.processVideo(videoId);

        clearInterval(processInterval);
        setProcessProgress(100);

        // 获取分析结果
        const analysisResult = await videoApi.getAnalysisResult(videoId);
        const analysisData = analysisResult.data || analysisResult;

        // 更新应用状态
        actions.setCurrentVideo(analysisData);
        actions.setTranscripts(analysisData.transcripts || []);
        actions.setActorPositions(analysisData.actor_positions || []);

        // 获取时间轴数据
        const timelineData = await stageApi.getTimelineData(videoId);
        actions.setLightingCues(timelineData.data?.lighting_cues || []);
        actions.setMusicCues(timelineData.data?.music_cues || []);

        // 获取更新的演员列表
        const actorsResponse = await stageApi.getAllActors();
        actions.setActors(actorsResponse.data || actorsResponse);

        setProcessing(false);
        message.success("视频处理完成！");
      } catch (error: any) {
        console.error("视频上传/处理失败:", error);
        message.error(error.response?.data?.detail || "视频上传失败");
        setUploading(false);
        setProcessing(false);
        setUploadProgress(0);
        setProcessProgress(0);
      }
    },
    [actions]
  );

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: "video/*",
    showUploadList: false,
    beforeUpload: (file: File) => {
      // 检查文件类型
      if (!file.type.startsWith("video/")) {
        message.error("只能上传视频文件！");
        return false;
      }

      // 检查文件大小 (限制为200MB)
      const maxSize = 200 * 1024 * 1024;
      if (file.size > maxSize) {
        message.error("视频文件不能超过200MB！");
        return false;
      }

      handleUpload(file);
      return false; // 阻止默认上传行为
    },
  };

  if (uploading || processing) {
    return (
      <Card style={{ width: 500, textAlign: "center" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <PlayCircleOutlined style={{ fontSize: 48, color: "#1890ff" }} />

          {uploading && (
            <>
              <Title level={4}>正在上传视频...</Title>
              <Progress percent={uploadProgress} status="active" />
              <Text type="secondary">请稍候，正在上传您的视频文件</Text>
            </>
          )}

          {processing && (
            <>
              <Title level={4}>正在分析视频...</Title>
              <Progress percent={processProgress} status="active" />
              <Text type="secondary">
                AI正在提取音频、识别演员位置和分析情感
              </Text>
            </>
          )}
        </Space>
      </Card>
    );
  }

  return (
    <Card style={{ width: 500 }}>
      <Space
        direction="vertical"
        size="large"
        style={{ width: "100%", textAlign: "center" }}
      >
        <Title level={3}>上传舞台视频</Title>
        <Text type="secondary">
          上传您的舞台表演视频，AI将自动提取音频、识别演员位置并生成智能建议
        </Text>

        <Dragger {...uploadProps} style={{ padding: "40px 20px" }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 48, color: "#1890ff" }} />
          </p>
          <p className="ant-upload-text">点击或拖拽视频文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持常见视频格式（MP4、AVI、MOV等），文件大小不超过200MB
          </p>
        </Dragger>

        <div style={{ marginTop: 20 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            💡 提示：为获得最佳效果，建议上传清晰度较高、演员动作明显的视频
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default VideoUpload;
