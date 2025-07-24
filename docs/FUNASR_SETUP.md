# FunASR 最高级配置指南

## 概述

AdventureX2025 使用最新的 FunASR 技术栈，支持多种语音识别服务：

### 1. 本地 FunASR (推荐) 🚀

**优势：**

- 🔒 隐私安全，数据不出本地
- ⚡ 速度快，无网络延迟
- 💰 无 API 调用费用
- 🎯 准确率高，支持多语言

**当前使用的最高级模型：**

- **SenseVoiceSmall**: 阿里巴巴最新的多模态语音模型
  - 支持中英日韩泰等多语言
  - 内置情感识别
  - 自动语言检测
  - 说话人分离
  - 实时转录

### 2. 云端 API 服务 ☁️

支持多个云服务商的最高级 ASR 服务：

- 阿里云语音服务 (企业级)
- 腾讯云语音识别
- 百度云语音技术
- OpenAI Whisper API

## 安装配置

### 第一步：安装依赖

```bash
# 安装基础依赖
pip install -r requirements.txt

# 如果有GPU，安装GPU版本的PyTorch
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu118

# 安装ONNX Runtime GPU版本（可选，提升推理速度）
pip install onnxruntime-gpu
```

### 第二步：配置环境

```bash
# 复制环境配置文件
cp .env.example .env

# 编辑配置文件
# 设置 ASR_PROVIDER=funasr_local （本地）
# 或者配置云端API密钥
```

### 第三步：首次运行

```python
# 测试FunASR安装
python -c "
from backend.core.audio_processor import audio_processor
print('FunASR 配置成功！')
print(f'使用提供商: {audio_processor.asr_config.provider}')
"
```

## 模型下载策略

### 本地模型 (推荐)

FunASR 会自动下载并缓存模型：

1. **首次使用时自动下载**：

   - SenseVoiceSmall: ~600MB
   - VAD 模型: ~50MB
   - 标点符号模型: ~100MB
   - 说话人分离模型: ~200MB

2. **模型存储位置**：

   ```
   ~/.cache/modelscope/hub/
   或
   ./models/funasr/ (如果设置了MODEL_CACHE_DIR)
   ```

3. **预下载模型** (可选):

   ```python
   from funasr import AutoModel

   # 预下载所有模型
   model = AutoModel(
       model="iic/SenseVoiceSmall",
       vad_model="fsmn-vad",
       punc_model="ct-punc-c",
       spk_model="cam++"
   )
   ```

### 云端 API

如果选择云端服务，无需下载模型，但需要：

1. 注册对应云服务
2. 获取 API 密钥
3. 配置环境变量

## 性能对比

| 方案            | 准确率     | 速度       | 成本       | 隐私       | 功能       |
| --------------- | ---------- | ---------- | ---------- | ---------- | ---------- |
| SenseVoice 本地 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 阿里云 ASR      | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ |
| OpenAI Whisper  | ⭐⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐       | ⭐⭐       | ⭐⭐⭐⭐   |

## 最佳实践

### 1. 硬件要求

**最低配置：**

- CPU: 4 核心以上
- 内存: 8GB RAM
- 存储: 5GB 可用空间

**推荐配置：**

- CPU: 8 核心以上
- 内存: 16GB RAM
- GPU: NVIDIA GPU (2GB+ VRAM)
- 存储: 10GB 可用空间

### 2. 性能优化

```python
# 在 .env 文件中配置
USE_GPU=true                    # 启用GPU加速
ENABLE_AUDIO_PREPROCESSING=true # 音频预处理
ASR_PROVIDER=funasr_local      # 使用本地FunASR
```

### 3. 生产环境部署

```yaml
# docker-compose.yml 示例
version: "3.8"
services:
  adventurex-backend:
    build: .
    environment:
      - ASR_PROVIDER=funasr_local
      - USE_GPU=true
      - MODEL_CACHE_DIR=/app/models
    volumes:
      - ./models:/app/models
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

## 故障排除

### 常见问题

1. **模型下载慢**

   ```bash
   # 设置镜像源
   export HF_ENDPOINT=https://hf-mirror.com
   export MODELSCOPE_CACHE=/path/to/models
   ```

2. **GPU 不可用**

   ```bash
   # 检查CUDA
   nvidia-smi

   # 检查PyTorch GPU支持
   python -c "import torch; print(torch.cuda.is_available())"
   ```

3. **内存不足**
   ```python
   # 在配置中减小批处理大小
   config["batch_size_s"] = 60  # 从300减少到60
   ```

## 高级功能

### 1. 自定义模型

```python
# 使用自定义模型路径
model = AutoModel(
    model="/path/to/your/custom/model",
    # ... 其他配置
)
```

### 2. 实时转录

```python
# 实时音频流转录
from backend.core.audio_processor import audio_processor

def real_time_transcribe(audio_stream):
    return audio_processor.transcribe_audio_smart(
        audio_stream,
        language="auto"
    )
```

### 3. 多语言支持

```python
# 支持的语言代码
languages = ["zh", "en", "ja", "ko", "th", "auto"]

# 自动语言检测
result = audio_processor.transcribe_audio_smart(
    "path/to/audio.wav",
    language="auto"  # 自动检测
)
```

---

🎉 现在您的 AdventureX2025 已配置了业界最先进的语音识别技术！
