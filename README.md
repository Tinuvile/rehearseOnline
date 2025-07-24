# 🎭 AI 舞台系统

一个面向导演和演员的智能舞台管理平台，通过 AI 分析视频提取演员位置、台词和情感，提供智能化的走位建议、灯光方案和音乐切换点推荐。

## ✨ 功能特性

- 🎥 **视频分析**: 自动提取音频转文本、识别演员位置
- 🎭 **智能推荐**: AI 生成走位建议、灯光方案、音乐切换点
- 🎨 **可视化编辑**: 2D 舞台视图、拖拽式位置调整
- ⏱️ **时间轴同步**: 台词、位置、灯光、音乐精确同步
- 🎪 **3D 预览**: 三维舞台环境预览（后续版本）

## 🏗️ 项目结构

```
ai-stage-system/
├── backend/                 # FastAPI后端
│   ├── main.py             # 主应用入口
│   ├── models/             # 数据模型
│   ├── core/               # 核心功能
│   ├── api/                # API路由
│   └── requirements.txt    # Python依赖
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── contexts/       # 状态管理
│   │   ├── services/       # API服务
│   │   └── types/          # TypeScript类型
│   └── package.json        # Node.js依赖
└── .kiro/specs/           # 项目规格文档
```

## 🚀 快速开始

### 环境要求

- Python 3.8+
- Node.js 16+
- npm 或 yarn

### 安装依赖

**后端依赖:**

```bash
cd backend
pip install -r requirements.txt
```

**前端依赖:**

```bash
cd frontend
npm install
```

### 启动服务

**方式 1: 一键启动开发环境 (推荐)**

Windows 系统:

```bash
# 使用Python脚本 (跨平台)
python start_dev.py

# 或使用批处理文件
start_dev.bat
```

Linux/macOS 系统:

```bash
# 使用Shell脚本
./start_dev.sh

# 或使用Python脚本
python3 start_dev.py
```

**方式 2: 分别启动**

```bash
# 启动后端 (终端1)
python start_backend.py

# 启动前端 (终端2)
python start_frontend.py
```

**方式 3: 手动启动**

```bash
# 启动后端
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 启动前端
cd frontend
npm start
```

### 访问应用

- 前端应用: http://localhost:3000
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs

### 测试系统

启动服务后，可以运行测试脚本验证系统是否正常：

```bash
python test_system.py
```

测试脚本会检查：

- 后端服务健康状态
- 前端服务可访问性
- API 接口功能
- 数据库连接和基础操作

## 📖 使用指南

1. **上传视频**: 在主界面上传舞台表演视频
2. **AI 分析**: 系统自动提取音频、识别演员位置
3. **查看结果**: 在四个面板中查看台词、舞台视图、灯光、音乐
4. **编辑调整**: 拖拽演员位置、调整灯光音乐设置
5. **AI 建议**: 查看并应用 AI 生成的智能建议
6. **时间轴控制**: 使用底部时间轴播放和跳转

## 🎯 核心功能

### 视频分析

- 音频提取和转文本（带时间戳）
- 2D 人体姿态检测和位置提取
- 情感分析和演员识别

### 智能推荐

- 基于空间布局的走位建议
- 基于情感分析的灯光推荐
- 基于剧情转折的音乐切换建议

### 交互界面

- 四面板布局：台词、舞台、灯光、音乐
- 实时时间轴同步
- 拖拽式演员位置调整

## 🛠️ 技术栈

**后端:**

- FastAPI - Web 框架
- OpenCV + MediaPipe - 视频处理和姿态估计
- FunASR - 高精度中文语音识别
- Transformers - 情感分析

**前端:**

- React 18 + TypeScript
- Ant Design - UI 组件库
- Three.js - 3D 渲染
- Canvas API - 2D 绘图

## 📝 开发状态

这是一个黑客松 MVP 版本，专注于核心功能的快速实现：

- ✅ 项目基础架构
- ✅ 数据模型和存储
- ✅ 视频上传和处理 API
- ✅ 前端四面板布局
- ✅ 时间轴组件
- 🔄 视频分析功能（进行中）
- 🔄 AI 推荐算法（进行中）
- ⏳ 3D 预览功能（计划中）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有开源项目的贡献者，特别是：

- FastAPI
- React
- MediaPipe
- Ant Design
- Three.js
