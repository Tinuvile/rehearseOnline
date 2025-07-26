# AI 舞台系统 - 启动指南

## 🎭 系统概述

AI 舞台系统是一个智能的舞台调试和演示平台，支持：

- 🎬 **视频上传与台词提取** - 使用 FunASR 技术自动提取台词和说话人信息
- 🎭 **舞台编辑器** - 可视化的演员位置编辑和预览
- 🎨 **智能布局** - 3D 转 2D 平面图显示（目前使用预设数据）
- 📋 **台词面板** - 实时显示当前时间对应的台词内容

## 🛠️ 环境要求

### 后端要求

- **Python 3.7+**
- **FastAPI** - Web 框架
- **FunASR** - 语音识别（可选，用于实际音频处理）
- **librosa** - 音频处理
- **moviepy** - 视频处理

### 前端要求

- **Node.js 16+**
- **npm** 或 **yarn**
- **React 18+**
- **Ant Design** - UI 组件库

## 🚀 快速启动

### 方法 1：使用启动脚本（推荐）

```bash
# 进入项目目录
cd AdventureX2025

# 运行启动脚本（会自动启动前端和后端）
python start_dev.py
```

### 方法 2：手动启动

#### 启动后端

```bash
# 进入项目目录
cd AdventureX2025

# 安装Python依赖
pip install -r requirements.txt

# 启动后端服务
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 启动前端

```bash
# 打开新终端，进入前端目录
cd AdventureX2025/frontend

# 安装前端依赖（首次运行）
npm install

# 启动前端服务
npm start
```

## 🔗 访问地址

启动成功后，可以通过以下地址访问：

- **前端应用**: http://localhost:3000
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

## 🧪 系统测试

### 1. 运行连接测试

```bash
cd AdventureX2025
python test_connection.py
```

### 2. 手动测试步骤

#### 步骤 1：检查服务状态

- 访问 http://localhost:3000 （前端）
- 访问 http://localhost:8000/docs （后端 API 文档）

#### 步骤 2：测试视频上传功能

1. 在前端导航到 **视频分析** 页面
2. 准备一个视频或音频文件（支持 mp4, wav, mp3 等格式）
3. 配置语言设置（中文/英文）
4. 上传文件并等待处理完成
5. 查看提取的台词结果

#### 步骤 3：测试舞台编辑器

1. 上传完成后点击 **进入舞台编辑器**
2. 或者在导航栏选择 **舞台编辑器**
3. 查看右侧的 **台词面板**
4. 使用底部的 **预览模式** 查看演员移动和台词同步

## 📁 项目结构

```
AdventureX2025/
├── backend/                 # 后端代码
│   ├── api/                # API路由
│   │   ├── dialogue_extraction.py   # 台词提取API
│   │   ├── stage_management.py      # 舞台管理API
│   │   └── ai_suggestions.py        # AI建议API
│   ├── core/               # 核心模块
│   │   ├── audio_processor.py       # 音频处理
│   │   ├── video_processor.py       # 视频处理
│   │   └── data_store.py            # 数据存储
│   └── main.py            # 后端入口文件
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── components/     # React组件
│   │   │   ├── DialoguePanel/       # 台词面板组件
│   │   │   ├── StageView/           # 舞台视图组件
│   │   │   └── Timeline/            # 时间轴组件
│   │   ├── pages/          # 页面组件
│   │   │   ├── VideoAnalysis.tsx    # 视频分析页面
│   │   │   ├── StageEditor.tsx      # 舞台编辑器页面
│   │   │   └── HomePage.tsx         # 首页
│   │   ├── services/       # API服务
│   │   │   └── api.ts      # 后端API调用
│   │   └── data/           # 样例数据
│   │       └── sampleData.ts        # 预设演员位置数据
├── start_dev.py           # 开发环境启动脚本
├── test_connection.py     # 连接测试脚本
└── requirements.txt       # Python依赖列表
```

## 🔧 功能说明

### 视频上传与台词提取

- **支持格式**: mp4, avi, mov, wav, mp3 等
- **语音识别**: 使用 FunASR 技术（支持中英文）
- **说话人分离**: 自动识别不同的说话人
- **结果导出**: 支持 JSON、SRT 字幕等格式

### 舞台编辑器

- **演员管理**: 添加、编辑演员信息和颜色
- **位置编辑**: 拖拽移动演员位置
- **预览模式**: 实时播放演员移动和台词
- **台词面板**: 显示当前和即将到来的台词

### 3D 转 2D 转换

- **当前状态**: 使用预设的样例数据
- **未来计划**: 集成 AlphaPose 和 MiDaS 实现真实的 3D 姿态检测

## 🐛 故障排除

### 常见问题

#### 1. 后端启动失败

**问题**: `ModuleNotFoundError: No module named 'fastapi'`
**解决**: 安装缺失依赖

```bash
pip install -r requirements.txt
```

#### 2. 前端无法连接后端

**问题**: API 请求失败或 CORS 错误
**解决**:

- 确保后端服务在 8000 端口运行
- 检查`package.json`中的`proxy`配置是否为`http://localhost:8000`

#### 3. 视频上传失败

**问题**: 文件格式不支持或文件过大
**解决**:

- 支持的格式: mp4, avi, mov, wav, mp3
- 最大文件大小: 500MB
- 检查文件是否损坏

#### 4. 端口被占用

**问题**: `Error: listen EADDRINUSE: address already in use :::8000`
**解决**:

```bash
# 查找占用端口的进程
netstat -ano | findstr :8000

# 结束占用进程（Windows）
taskkill /PID <进程ID> /F
```

### 获取帮助

如果遇到其他问题：

1. 运行 `python test_connection.py` 检查系统状态
2. 查看浏览器开发者工具的控制台错误
3. 检查后端服务的日志输出

## 🔮 后续开发计划

- [ ] 集成 AlphaPose 进行真实的 3D 姿态检测
- [ ] 集成 MiDaS 进行深度估计和 2D 转换
- [ ] 增加更多台词分析功能（情感分析、语调识别）
- [ ] 支持更多视频格式和更大文件
- [ ] 添加项目保存和加载功能
- [ ] 实现协作编辑功能

---

🎭 **AI 舞台系统** - 让舞台设计更智能，让创作更高效！
