# rehearseOnline

基于AI的智能舞台排练与表演优化系统

## 项目概述

rehearseOnline是一个智能舞台管理平台，结合AI技术与现代Web开发，为戏剧表演提供自动化排练工具。系统能够从视频内容中提取台词，提供AI驱动的表演建议，并提供可视化舞台编辑功能。

## 核心功能

- **自动台词提取**：使用FunASR从视频文件进行语音转文字
- **AI表演分析**：基于Kimi API的智能建议系统
- **可视化舞台编辑器**：支持拖拽的交互式2D舞台布局
- **实时预览**：基于时间轴的同步元素播放
- **多语言支持**：支持中文和英文语音识别

## 技术栈

**后端**
- FastAPI (Python Web框架)
- FunASR (语音识别)
- Kimi API (AI分析)
- MoviePy (视频处理)

**前端**
- React + TypeScript
- Ant Design (UI组件库)
- Canvas API (舞台渲染)

## 项目结构

```
rehearseOnline/
├── backend/                 # FastAPI后端
│   ├── main.py             # 应用入口
│   ├── core/               # 核心功能
│   ├── api/                # API路由
│   └── requirements.txt    # Python依赖
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── services/       # API服务
│   │   └── types/          # TypeScript类型
│   └── package.json        # Node.js依赖
```

## 快速开始

### 环境要求

- Python 3.8+
- Node.js 16+
- Conda (推荐)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd rehearseOnline
```

2. **设置Python环境**
```bash
conda create -n ai-stage python=3.9
conda activate ai-stage
pip install -r requirements.txt
```

3. **安装前端依赖**
```bash
cd frontend
npm install
```

4. **启动服务**
```bash
# 后端服务 (端口8000)
python start_backend.py

# 前端服务 (端口3000) - 新开终端
cd frontend && npm start
```

### 访问应用

- 前端界面: http://localhost:3000
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 使用说明

1. **上传视频**：通过Web界面上传舞台表演视频
2. **AI分析**：系统自动提取台词并提供表演建议
3. **舞台编辑**：使用可视化编辑器调整演员位置、灯光和舞台元素
4. **预览播放**：使用时间轴预览带有同步元素的表演效果

## API接口

- `POST /api/dialogue-extraction/upload` - 上传视频进行台词提取
- `GET /api/ai-analysis/health` - 检查AI服务健康状态
- `POST /api/ai-analysis/quick-suggestions` - 获取快速表演建议
- `POST /api/ai-analysis/analyze-stage` - 完整AI舞台分析

## 开发状态

这是一个专注于核心功能的黑客松MVP版本：

- ✅ 项目架构搭建
- ✅ 视频上传和处理API
- ✅ 四面板布局的前端界面
- ✅ AI驱动的台词提取功能
- ✅ 可视化舞台编辑器
- ✅ 时间轴播放组件
- ✅ AI表演建议系统

## 贡献

本项目为黑客松开发项目。如有问题或建议，请提交issue。

## 许可证

MIT License
