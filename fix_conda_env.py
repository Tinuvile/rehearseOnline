#!/usr/bin/env python3
"""
修复conda环境中的pip路径问题
"""

import os
import sys
import subprocess
from pathlib import Path

def fix_pip_path():
    """修复pip路径"""
    print("🔧 修复conda环境中的pip路径...")
    
    # 获取当前Python路径
    python_path = sys.executable
    python_dir = Path(python_path).parent
    
    print(f"Python路径: {python_path}")
    print(f"Python目录: {python_dir}")
    
    # 查找pip
    possible_pip_paths = [
        python_dir / "pip",
        python_dir / "pip3",
        python_dir / "Scripts" / "pip.exe",  # Windows
        python_dir / "Scripts" / "pip3.exe", # Windows
    ]
    
    pip_path = None
    for path in possible_pip_paths:
        if path.exists():
            pip_path = path
            break
    
    if pip_path:
        print(f"✅ 找到pip: {pip_path}")
        
        # 测试pip
        try:
            result = subprocess.run([str(pip_path), "--version"], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ pip工作正常: {result.stdout.strip()}")
                return str(pip_path)
            else:
                print(f"❌ pip测试失败: {result.stderr}")
        except Exception as e:
            print(f"❌ pip测试异常: {e}")
    else:
        print("❌ 未找到pip")
    
    return None

def install_funasr_deps(pip_path=None):
    """安装FunASR依赖"""
    print("\n📦 安装FunASR依赖...")
    
    if pip_path is None:
        pip_cmd = [sys.executable, "-m", "pip"]
    else:
        pip_cmd = [pip_path]
    
    deps = [
        "funasr>=1.1.0",
        "modelscope>=1.11.0",
        "torch>=2.1.0", 
        "torchaudio>=2.1.0",
        "transformers>=4.36.0",
        "onnxruntime>=1.15.0"
    ]
    
    for dep in deps:
        try:
            print(f"安装 {dep}...")
            result = subprocess.run(
                pip_cmd + ["install", dep],
                capture_output=True, text=True, timeout=300
            )
            
            if result.returncode == 0:
                print(f"✅ {dep} 安装成功")
            else:
                print(f"❌ {dep} 安装失败: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            print(f"⏰ {dep} 安装超时")
            return False
        except Exception as e:
            print(f"❌ {dep} 安装异常: {e}")
            return False
    
    return True

def test_funasr():
    """测试FunASR"""
    print("\n🧪 测试FunASR...")
    
    try:
        # 测试导入
        from funasr import AutoModel
        print("✅ FunASR导入成功")
        
        # 测试模型配置
        from backend.core.asr_config import ASRConfig
        config = ASRConfig()
        model_config = config.get_funasr_models_config("zh")
        print("✅ 模型配置获取成功")
        
        print("🎉 FunASR环境修复完成！")
        return True
        
    except ImportError as e:
        print(f"❌ FunASR导入失败: {e}")
        return False
    except Exception as e:
        print(f"❌ FunASR测试失败: {e}")
        return False

def set_environment_variables():
    """设置环境变量"""
    print("\n🌍 设置环境变量...")
    
    # 设置ModelScope缓存目录
    cache_dir = Path.home() / ".cache" / "modelscope"
    cache_dir.mkdir(parents=True, exist_ok=True)
    os.environ["MODELSCOPE_CACHE"] = str(cache_dir)
    print(f"✅ MODELSCOPE_CACHE: {cache_dir}")
    
    # 设置HuggingFace缓存目录
    hf_cache_dir = Path.home() / ".cache" / "huggingface"
    hf_cache_dir.mkdir(parents=True, exist_ok=True)
    os.environ["HF_HOME"] = str(hf_cache_dir)
    print(f"✅ HF_HOME: {hf_cache_dir}")
    
    # 禁用一些可能导致问题的环境变量
    os.environ["PYTHONPATH"] = ""
    print("✅ 环境变量设置完成")

def main():
    """主函数"""
    print("🔧 Conda环境修复工具")
    print("=" * 50)
    
    # 检查当前环境
    print(f"当前Python: {sys.executable}")
    print(f"当前环境: {os.environ.get('CONDA_DEFAULT_ENV', 'unknown')}")
    
    # 设置环境变量
    set_environment_variables()
    
    # 修复pip路径
    pip_path = fix_pip_path()
    
    # 安装依赖
    if install_funasr_deps(pip_path):
        # 测试FunASR
        if test_funasr():
            print("\n🎉 环境修复成功！现在可以正常使用台词提取功能了")
        else:
            print("\n❌ FunASR测试失败，可能需要手动处理")
    else:
        print("\n❌ 依赖安装失败")

if __name__ == "__main__":
    main()
