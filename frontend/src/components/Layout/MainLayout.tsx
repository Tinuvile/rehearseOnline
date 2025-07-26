import React, { useEffect } from "react";
import { Layout, Row, Col, message } from "antd";
import { useAppContext, useAppActions } from "../../contexts/AppContext";
import { stageApi, apiUtils, healthCheck } from "../../services/api";
import Header from "./Header";
import VideoUpload from "../VideoUpload/VideoUpload";
import ScriptPanel from "../ScriptPanel/ScriptPanel";
import StageView from "../StageView/StageView";
import LightingPanel from "../LightingPanel/LightingPanel";
import MusicPanel from "../MusicPanel/MusicPanel";
import Timeline from "../Timeline/Timeline";

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const { state } = useAppContext();
  const actions = useAppActions();

  // 初始化应用
  useEffect(() => {
    const initializeApp = async () => {
      try {
        actions.setLoading(true);

        // 健康检查
        await healthCheck();

        // 获取当前项目
        const projectResponse = await stageApi.getCurrentProject();
        actions.setCurrentProject(projectResponse.data || projectResponse);

        // 获取演员列表
        const actorsResponse = await stageApi.getAllActors();
        actions.setActors(actorsResponse.data || actorsResponse);

        console.log("✅ 应用初始化成功");
      } catch (error) {
        console.error("❌ 应用初始化失败:", error);
        message.error("应用初始化失败，请检查后端服务");
        actions.setError("应用初始化失败");
      } finally {
        actions.setLoading(false);
      }
    };

    initializeApp();
  }, [actions]);

  return (
    <Layout className="main-layout">
      <Header />

      <Content className="content-area">
        {!state.currentVideo ? (
          // 没有视频时显示上传界面
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              padding: "40px",
            }}
          >
            <VideoUpload />
          </div>
        ) : (
          // 有视频时显示四面板布局
          <div className="panels-container" style={{ height: "100%", padding: "16px" }}>
            <Row gutter={[16, 16]} style={{ height: "100%", margin: 0 }}>
              {/* 左上：台词面板 */}
              <Col span={12} style={{ height: "50%" }}>
                <div className="panel" style={{ height: "100%" }}>
                  <div className="panel-header">台词编辑器</div>
                  <div className="panel-content" style={{ height: "calc(100% - 40px)" }}>
                    <ScriptPanel />
                  </div>
                </div>
              </Col>

              {/* 右上：2D舞台视图 */}
              <Col span={12} style={{ height: "50%" }}>
                <div className="panel" style={{ height: "100%" }}>
                  <div className="panel-header">2D舞台视图</div>
                  <div className="panel-content" style={{ height: "calc(100% - 40px)" }}>
                    <StageView />
                  </div>
                </div>
              </Col>

              {/* 左下：灯光面板 */}
              <Col span={12} style={{ height: "50%" }}>
                <div className="panel" style={{ height: "100%" }}>
                  <div className="panel-header">灯光控制</div>
                  <div className="panel-content" style={{ height: "calc(100% - 40px)" }}>
                    <LightingPanel />
                  </div>
                </div>
              </Col>

              {/* 右下：音乐面板 */}
              <Col span={12} style={{ height: "50%" }}>
                <div className="panel" style={{ height: "100%" }}>
                  <div className="panel-header">音乐控制</div>
                  <div className="panel-content" style={{ height: "calc(100% - 40px)" }}>
                    <MusicPanel />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Content>

      {/* 底部时间轴 */}
      {state.currentVideo && (
        <div className="timeline-container">
          <Timeline />
        </div>
      )}
    </Layout>
  );
};

export default MainLayout;
