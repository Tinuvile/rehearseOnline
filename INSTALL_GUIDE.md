# 🎭 AI 舞台系统 - 安装指南

## 📋 系统要求

- Python 3.8+
- Node.js 16+
- FFmpeg（用于音频处理）
- 至少 4GB 内存（用于 AI 模型）

## 🚀 快速安装

### 1. 安装 FFmpeg

**Windows:**

```bash
# 使用Chocolatey
choco install ffmpeg

# 或下载预编译版本
# 访问: https://ffmpeg.org/download.html#build-windows
# 下载后解压，将bin目录添加到PATH环境变量
```

**macOS:**

```bash
# 使用Homebrew
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install ffmpeg
```

### 2. 安装 Python 依赖

```bash
# 进入项目目录
cd backend

# 安装依赖
pip install -r requirements.txt

# 注意：首次使用FunASR时会自动下载模型文件（约几百MB）
# FunASR模型会自动从ModelScope下载，支持离线使用
```

### 3. 安装前端依赖

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
```

## 🧪 测试语音识别效果

### 方法 1: 使用 API 测试

1. **启动后端服务**

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

2. **启动前端服务**

```bash
cd frontend
npm start
```

3. **通过前端界面测试**
   - 访问 http://localhost:3000
   - 上传视频文件
   - 系统会自动处理并显示转录结果

### 方法 2: 使用 API 直接测试

1. **上传视频**

```bash
curl -X POST "http://localhost:8000/api/video/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your_video.mp4"
```

2. **获取视频 ID**（从上传响应中获取）

3. **启动转录**

```bash
curl -X POST "http://localhost:8000/api/video/{video_id}/transcribe" \
  -H "Content-Type: application/json" \
  -d '{"use_whisper": true, "language": "zh"}'
```

4. **查看转录结果**

```bash
curl "http://localhost:8000/api/video/{video_id}/analysis"
```

### 方法 3: 使用测试脚本

创建测试脚本 `test_whisper.py`:

```python
#!/usr/bin/env python3
import sys
import os
sys.path.append('backend')

from core.audio_processor import audio_processor

# 测试音频转录
def test_whisper_transcription(video_path):
    try:
        print(f"🎬 处理视频: {video_path}")

        # 提取音频
        audio_path = audio_processor.extract_audio_from_video(video_path)
        print(f"🎵 音频提取成功: {audio_path}")

        # FunASR转录
        transcripts = audio_processor.transcribe_audio_with_funasr(audio_path, "zh")

        print(f"📝 转录结果 ({len(transcripts)} 个片段):")
        for i, transcript in enumerate(transcripts):
            print(f"  {i+1}. [{transcript.start_time:.1f}s - {transcript.end_time:.1f}s] {transcript.text}")
            print(f"     置信度: {transcript.confidence:.2f}")

    except Exception as e:
        print(f"❌ 转录失败: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("用法: python test_funasr.py <video_path>")
        sys.exit(1)

    video_path = sys.argv[1]
    test_funasr_transcription(video_path)
```

运行测试:

```bash
python test_funasr.py your_video.mp4
```

## 📊 支持的语言

FunASR 支持多种语言，主要针对中文优化：

- `zh` - 中文（主要优化方向）
- `en` - 英文
- 混合语言识别（中英混合）

## 🎯 测试建议

### 最佳测试视频特征：

- **时长**: 10 秒-2 分钟（便于快速测试）
- **音质**: 清晰，无背景噪音
- **语速**: 正常语速，不要过快
- **内容**: 包含完整句子，避免单词或短语
- **格式**: MP4, AVI, MOV 等常见格式

### 测试场景：

1. **单人独白**: 测试基础转录准确性
2. **多人对话**: 测试说话人区分（需要额外处理）
3. **带背景音乐**: 测试噪音环境下的识别
4. **不同口音**: 测试方言和口音适应性

## 🔧 故障排除

### 常见问题：

1. **FFmpeg 未找到**

   ```
   解决: 确保FFmpeg已安装并添加到PATH环境变量
   验证: 运行 ffmpeg -version
   ```

2. **Whisper 模型下载失败**

   ```
   解决: 检查网络连接，或手动下载模型文件
   位置: ~/.cache/whisper/
   ```

3. **内存不足**

   ```bash
   解决: 使用较轻量级的FunASR模型
   修改: audio_processor.py 中的模型名称
   ```

4. **转录结果为空**
   ```bash
   检查: 视频是否包含音频轨道
   验证: 使用 ffprobe -i video.mp4 查看音频信息
   ```

## 📈 性能优化

### FunASR 模型选择

- `paraformer-zh` - 标准中文模型（推荐）
- `paraformer-en` - 英文模型
- `conformer_zh` - 高精度中文模型（需要更多内存）

### 推荐配置

- **开发测试**: paraformer-zh
- **演示展示**: paraformer-zh
- **生产环境**: paraformer-zh 或 conformer_zh（高精度需求）

### FunASR 优势

- 专为中文语音识别优化
- 支持实时流式识别
- 自动标点符号添加
- 更好的噪声处理能力

## 🎉 验证安装

运行完整测试：

```bash
# 测试数据模型
python test_data_models.py

# 测试视频处理
python test_video_processing.py

# 测试音频处理
python test_audio_processing.py

# 启动系统
python start_dev.py
```

如果所有测试通过，说明安装成功！🎊
