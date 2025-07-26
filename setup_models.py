#!/usr/bin/env python3
"""
FunASR模型预下载脚本
解决conda环境中pip找不到的问题
"""

import os
import sys
import subprocess
from pathlib import Path

def check_environment():
    """检查环境"""
    print("🔍 检查Python环境...")
    print(f"Python路径: {sys.executable}")
    print(f"Python版本: {sys.version}")
    
    # 检查pip
    try:
        import pip
        print(f"✅ pip已安装: {pip.__version__}")
    except ImportError:
        print("❌ pip未找到")
        return False
    
    return True

def install_dependencies():
    """安装依赖"""
    print("\n📦 安装FunASR依赖...")
    
    dependencies = [
        "funasr>=1.1.0",
        "modelscope>=1.11.0", 
        "torch>=2.1.0",
        "torchaudio>=2.1.0",
        "transformers>=4.36.0",
        "onnxruntime>=1.15.0",
        "zhconv>=1.4.3",
        "jieba>=0.42.1",
        "pypinyin>=0.48.0"
    ]
    
    for dep in dependencies:
        try:
            print(f"安装 {dep}...")
            subprocess.run([
                sys.executable, "-m", "pip", "install", dep
            ], check=True, capture_output=True)
            print(f"✅ {dep} 安装成功")
        except subprocess.CalledProcessError as e:
            print(f"❌ {dep} 安装失败: {e}")
            return False
    
    return True

def download_models():
    """预下载FunASR模型"""
    print("\n🤖 预下载FunASR模型...")
    
    try:
        from funasr import AutoModel
        from modelscope.hub.snapshot_download import snapshot_download
        
        # 中文模型配置
        models = {
            "ASR模型": "iic/speech_seaco_paraformer_large_asr_nat-zh-cn-16k-common-vocab8404-pytorch",
            "VAD模型": "damo/speech_fsmn_vad_zh-cn-16k-common-pytorch",
            "标点模型": "damo/punc_ct-transformer_zh-cn-common-vocab272727-pytorch", 
            "说话人模型": "damo/speech_campplus_sv_zh-cn_16k-common"
        }
        
        # 下载模型
        for name, model_id in models.items():
            try:
                print(f"下载 {name}: {model_id}")
                snapshot_download(model_id)
                print(f"✅ {name} 下载成功")
            except Exception as e:
                print(f"❌ {name} 下载失败: {e}")
        
        # 测试模型初始化
        print("\n🧪 测试模型初始化...")
        model = AutoModel(
            model=models["ASR模型"],
            vad_model=models["VAD模型"],
            punc_model=models["标点模型"],
            spk_model=models["说话人模型"]
        )
        print("✅ 模型初始化成功！")
        
        return True
        
    except ImportError as e:
        print(f"❌ 导入失败: {e}")
        print("请先安装依赖: python setup_models.py --install-deps")
        return False
    except Exception as e:
        print(f"❌ 模型下载失败: {e}")
        return False

def main():
    """主函数"""
    print("🎭 FunASR模型设置工具")
    print("=" * 50)
    
    # 检查环境
    if not check_environment():
        print("❌ 环境检查失败")
        sys.exit(1)
    
    # 检查命令行参数
    if len(sys.argv) > 1 and sys.argv[1] == "--install-deps":
        if not install_dependencies():
            print("❌ 依赖安装失败")
            sys.exit(1)
        print("\n✅ 依赖安装完成，请重新运行脚本下载模型")
        return
    
    # 下载模型
    if download_models():
        print("\n🎉 模型设置完成！")
        print("现在可以正常使用台词提取功能了")
    else:
        print("\n❌ 模型设置失败")
        print("请尝试运行: python setup_models.py --install-deps")
        sys.exit(1)

if __name__ == "__main__":
    main()
