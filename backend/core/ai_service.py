"""
AI舞台分析服务 - 集成Kimi API
"""

import json
import logging
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class StageAIService:
    """舞台AI分析服务"""
    
    def __init__(self):
        self.api_key = "sk-XNjRSWpbcw2p0UTEH6mPrpwiGVcisTD3i0lT6bk5I8YN5fOK"
        self.base_url = "https://api.moonshot.cn/v1/chat/completions"
        self.model = "moonshot-v1-8k"
        
    def analyze_stage_performance(self, stage_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        分析舞台表演数据，提供AI建议
        
        Args:
            stage_data: 包含演员、台词、移动、灯光等信息的舞台数据
            
        Returns:
            AI分析结果和建议
        """
        try:
            # 构建分析提示词
            prompt = self._build_analysis_prompt(stage_data)
            
            # 调用Kimi API
            response = self._call_kimi_api(prompt)
            
            # 解析AI响应
            analysis_result = self._parse_ai_response(response)
            
            return {
                "success": True,
                "analysis": analysis_result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"AI分析失败: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def _build_analysis_prompt(self, stage_data: Dict[str, Any]) -> str:
        """构建舞台分析提示词"""
        
        # 提取关键数据
        actors = stage_data.get('actors', [])
        dialogues = stage_data.get('dialogues', [])
        movements = stage_data.get('movements', [])
        lights = stage_data.get('lights', [])
        stage_elements = stage_data.get('stage_elements', [])
        areas = stage_data.get('areas', [])
        
        prompt = f"""
你是一位专业的舞台导演和表演分析专家。请基于以下舞台表演数据进行深度分析，并提供具体的优化建议。

# 舞台数据分析

## 演员信息 ({len(actors)}位)
{json.dumps(actors, ensure_ascii=False, indent=2)}

## 台词内容 ({len(dialogues)}条)
{json.dumps(dialogues, ensure_ascii=False, indent=2)}

## 移动路径 ({len(movements)}条)
{json.dumps(movements, ensure_ascii=False, indent=2)}

## 灯光设计 ({len(lights)}盏)
{json.dumps(lights, ensure_ascii=False, indent=2)}

## 舞台元素 ({len(stage_elements)}个)
{json.dumps(stage_elements, ensure_ascii=False, indent=2)}

## 表演区域 ({len(areas)}个)
{json.dumps(areas, ensure_ascii=False, indent=2)}

# 分析要求

请从以下几个维度进行专业分析：

1. **空间布局分析**
   - 演员位置分布是否合理
   - 舞台元素摆放是否影响表演
   - 区域划分是否清晰有效

2. **时间节奏分析** 
   - 台词时长分布是否均衡
   - 演员移动时机是否恰当
   - 整体节奏感是否流畅

3. **视觉效果分析**
   - 灯光设计是否突出主题
   - 演员移动路径是否美观
   - 舞台构图是否协调

4. **表演逻辑分析**
   - 演员互动是否自然
   - 台词情感是否连贯
   - 移动路径是否符合剧情

5. **优化建议**
   - 具体的改进方案
   - 潜在的冲突提醒
   - 创意增强建议

# 输出格式

请以JSON格式返回分析结果，结构如下：

```json
{{
  "overall_score": 85,
  "analysis_summary": "整体表演设计较为成熟，具有良好的空间层次感...",
  "detailed_analysis": {{
    "space_layout": {{
      "score": 80,
      "strengths": ["演员分布均匀", "舞台元素布局合理"],
      "weaknesses": ["右舞台区域利用不足"],
      "suggestions": ["建议在右舞台增加一个表演焦点"]
    }},
    "time_rhythm": {{
      "score": 90,
      "strengths": ["台词节奏把握精准", "移动时机恰当"],
      "weaknesses": ["第二幕节奏稍显拖沓"],
      "suggestions": ["可适当缩短配角台词时长"]
    }},
    "visual_effects": {{
      "score": 85,
      "strengths": ["灯光层次丰富", "构图美观"],
      "weaknesses": ["追光灯角度需调整"],
      "suggestions": ["将追光灯角度调整至45度，突出主角"]
    }},
    "performance_logic": {{
      "score": 88,
      "strengths": ["角色互动自然", "情感表达到位"],
      "weaknesses": ["第3分钟处演员A和B的走位可能冲突"],
      "suggestions": ["延迟演员B的移动时间0.5秒"]
    }}
  }},
  "priority_suggestions": [
    {{
      "type": "路径优化",
      "priority": "高",
      "description": "主角当前移动路径可能与配角A产生交叉冲突，建议调整路径或时间点",
      "specific_action": "将主角在第120秒的移动延迟2秒，或调整移动路径向舞台中央偏移",
      "affected_actors": ["主角", "配角A"],
      "time_range": "1:58-2:05"
    }},
    {{
      "type": "灯光优化", 
      "priority": "中",
      "description": "根据当前场景情绪，建议在01:30处添加蓝色追光灯效果",
      "specific_action": "在(400, 100)位置添加蓝色聚光灯，强度70%，照射主角",
      "affected_elements": ["主光", "追光1"],
      "time_range": "1:30-1:45"
    }},
    {{
      "type": "表演节奏",
      "priority": "中", 
      "description": "当前场景节奏较慢，建议优化台词时长分配",
      "specific_action": "将配角B的第2条台词时长从8秒缩短至6秒",
      "affected_actors": ["配角B"],
      "time_range": "0:45-0:53"
    }}
  ],
  "creative_enhancements": [
    {{
      "category": "空间创意",
      "suggestion": "可考虑在舞台左侧添加高低台阶，增加空间层次感",
      "implementation": "添加2-3级台阶道具，高度15-20cm"
    }},
    {{
      "category": "互动创意", 
      "suggestion": "演员A和C可在第3分钟增加一个对视互动",
      "implementation": "在120秒时让两位演员同时转头对视2秒"
    }}
  ]
}}
```

请确保分析客观专业，建议具体可行。
"""
        
        return prompt
    
    def _call_kimi_api(self, prompt: str) -> str:
        """调用Kimi API"""
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        data = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 4000
        }
        
        logger.info("正在调用Kimi API进行舞台分析...")
        
        response = requests.post(
            self.base_url,
            headers=headers,
            json=data,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result['choices'][0]['message']['content']
            logger.info("Kimi API调用成功")
            return ai_response
        else:
            logger.error(f"Kimi API调用失败: {response.status_code} - {response.text}")
            raise Exception(f"API调用失败: {response.status_code}")
    
    def _parse_ai_response(self, ai_response: str) -> Dict[str, Any]:
        """解析AI响应"""
        try:
            # 尝试提取JSON部分
            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = ai_response[start_idx:end_idx]
                parsed_result = json.loads(json_str)
                return parsed_result
            else:
                # 如果无法解析JSON，返回文本格式
                return {
                    "overall_score": 75,
                    "analysis_summary": ai_response,
                    "priority_suggestions": [
                        {
                            "type": "AI分析",
                            "priority": "中",
                            "description": "AI返回了文本格式的分析结果",
                            "specific_action": "请查看详细分析内容",
                            "raw_response": ai_response
                        }
                    ]
                }
                
        except json.JSONDecodeError as e:
            logger.error(f"AI响应JSON解析失败: {str(e)}")
            return {
                "overall_score": 70,
                "analysis_summary": "AI分析完成，但响应格式需要优化",
                "parse_error": str(e),
                "raw_response": ai_response
            }
    
    def generate_quick_suggestions(self, current_state: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        生成快速建议（基于简单规则，不调用API）
        用于实时响应和降低API调用频率
        """
        suggestions = []
        
        actors = current_state.get('actors', [])
        dialogues = current_state.get('dialogues', [])
        movements = current_state.get('movements', [])
        lights = current_state.get('lights', [])
        
        # 规则1: 检查演员距离是否过近
        for i, actor1 in enumerate(actors):
            for j, actor2 in enumerate(actors):
                if i < j:
                    distance = ((actor1['x'] - actor2['x'])**2 + (actor1['y'] - actor2['y'])**2)**0.5
                    if distance < 50:  # 距离小于50像素
                        suggestions.append({
                            "type": "位置调整",
                            "priority": "中",
                            "description": f"{actor1['name']}和{actor2['name']}距离过近，可能影响表演效果",
                            "specific_action": f"建议将两位演员的距离拉开至少50像素",
                            "affected_actors": [actor1['name'], actor2['name']]
                        })
        
        # 规则2: 检查台词时长分布
        if dialogues:
            total_duration = sum(d.get('duration', 0) for d in dialogues)
            avg_duration = total_duration / len(dialogues) if dialogues else 0
            
            for dialogue in dialogues:
                if dialogue.get('duration', 0) > avg_duration * 2:
                    actor_name = next((a['name'] for a in actors if a['id'] == dialogue.get('actorId')), '未知演员')
                    suggestions.append({
                        "type": "台词节奏",
                        "priority": "低",
                        "description": f"{actor_name}的台词时长较长，可能影响节奏",
                        "specific_action": "考虑将长台词分段或缩短表达",
                        "affected_actors": [actor_name]
                    })
        
        # 规则3: 检查灯光覆盖
        if len(lights) < len(actors):
            suggestions.append({
                "type": "灯光设计",
                "priority": "中", 
                "description": "灯光数量少于演员数量，可能存在照明盲区",
                "specific_action": "建议增加灯光设备或调整现有灯光角度",
                "affected_elements": ["灯光系统"]
            })
        
        return suggestions[:3]  # 返回最多3条快速建议
    
    def _get_timestamp(self) -> str:
        """获取当前时间戳"""
        return datetime.now().isoformat()

# 全局AI服务实例
ai_service = StageAIService() 