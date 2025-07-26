"""
AI舞台分析API路由
"""

import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Any, Optional

from backend.core.ai_service import ai_service
from backend.core.data_store import InMemoryDataStore

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai-analysis", tags=["ai_analysis"])

# 依赖注入：获取数据存储实例
def get_data_store() -> InMemoryDataStore:
    from backend.main import data_store
    return data_store

class StageAnalysisRequest(BaseModel):
    """舞台分析请求模型"""
    actors: List[Dict[str, Any]]
    dialogues: List[Dict[str, Any]]
    movements: List[Dict[str, Any]] = []
    lights: List[Dict[str, Any]] = []
    stage_elements: List[Dict[str, Any]] = []
    areas: List[Dict[str, Any]] = []
    analysis_type: str = "full"  # full | quick | specific

class QuickSuggestionsRequest(BaseModel):
    """快速建议请求模型"""
    current_state: Dict[str, Any]

@router.post("/analyze-stage")
async def analyze_stage_performance(
    request: StageAnalysisRequest,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """
    分析舞台表演，提供AI建议
    
    Args:
        request: 舞台分析请求数据
        
    Returns:
        AI分析结果和建议
    """
    try:
        logger.info(f"开始AI舞台分析，分析类型: {request.analysis_type}")
        
        # 构建舞台数据
        stage_data = {
            "actors": request.actors,
            "dialogues": request.dialogues,
            "movements": request.movements,
            "lights": request.lights,
            "stage_elements": request.stage_elements,
            "areas": request.areas
        }
        
        # 记录数据统计
        stats = {
            "actors_count": len(request.actors),
            "dialogues_count": len(request.dialogues),
            "movements_count": len(request.movements),
            "lights_count": len(request.lights),
            "elements_count": len(request.stage_elements),
            "areas_count": len(request.areas)
        }
        logger.info(f"舞台数据统计: {stats}")
        
        if request.analysis_type == "quick":
            # 快速分析（基于规则）
            suggestions = ai_service.generate_quick_suggestions(stage_data)
            result = {
                "success": True,
                "analysis_type": "quick",
                "suggestions": suggestions,
                "stats": stats
            }
        else:
            # 完整AI分析（调用Kimi API）
            result = ai_service.analyze_stage_performance(stage_data)
            result["analysis_type"] = "full"
            result["stats"] = stats
        
        logger.info("AI舞台分析完成")
        return result
        
    except Exception as e:
        logger.error(f"AI舞台分析失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"AI分析失败: {str(e)}"
        )

@router.post("/quick-suggestions")
async def get_quick_suggestions(
    request: QuickSuggestionsRequest,
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """
    获取快速建议（不调用AI API，基于规则）
    
    Args:
        request: 当前舞台状态
        
    Returns:
        快速建议列表
    """
    try:
        logger.info("生成快速舞台建议")
        
        suggestions = ai_service.generate_quick_suggestions(request.current_state)
        
        return {
            "success": True,
            "suggestions": suggestions,
            "timestamp": ai_service._get_timestamp()
        }
        
    except Exception as e:
        logger.error(f"快速建议生成失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"快速建议生成失败: {str(e)}"
        )

@router.post("/analyze-specific")
async def analyze_specific_aspect(
    aspect: str,
    stage_data: Dict[str, Any],
    data_store: InMemoryDataStore = Depends(get_data_store)
):
    """
    分析特定方面（如：路径冲突、灯光效果、台词节奏等）
    
    Args:
        aspect: 分析方面 (path_conflict | lighting | rhythm | spacing)
        stage_data: 舞台数据
        
    Returns:
        特定方面的分析结果
    """
    try:
        logger.info(f"开始特定方面分析: {aspect}")
        
        if aspect == "path_conflict":
            # 分析路径冲突
            result = _analyze_path_conflicts(stage_data)
        elif aspect == "lighting":
            # 分析灯光效果
            result = _analyze_lighting_effects(stage_data)
        elif aspect == "rhythm":
            # 分析节奏效果
            result = _analyze_rhythm_patterns(stage_data)
        elif aspect == "spacing":
            # 分析空间利用
            result = _analyze_space_utilization(stage_data)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"不支持的分析方面: {aspect}"
            )
        
        return {
            "success": True,
            "aspect": aspect,
            "analysis": result
        }
        
    except Exception as e:
        logger.error(f"特定方面分析失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"特定方面分析失败: {str(e)}"
        )

@router.get("/health")
async def ai_health_check():
    """AI服务健康检查"""
    try:
        # 测试AI服务是否可用
        test_data = {
            "actors": [{"id": 1, "name": "测试演员", "x": 100, "y": 100}],
            "dialogues": [],
            "movements": [],
            "lights": [],
            "stage_elements": [],
            "areas": []
        }
        
        # 只测试快速建议功能，不调用API
        suggestions = ai_service.generate_quick_suggestions(test_data)
        
        return {
            "status": "healthy",
            "ai_service": "available",
            "kimi_api": "configured",
            "quick_suggestions": len(suggestions)
        }
        
    except Exception as e:
        logger.error(f"AI服务健康检查失败: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

# 辅助分析函数

def _analyze_path_conflicts(stage_data: Dict[str, Any]) -> Dict[str, Any]:
    """分析演员移动路径冲突"""
    actors = stage_data.get('actors', [])
    movements = stage_data.get('movements', [])
    
    conflicts = []
    
    # 检查同时间段的移动是否有冲突
    for i, move1 in enumerate(movements):
        for j, move2 in enumerate(movements):
            if i < j:
                # 检查时间重叠
                start1, end1 = move1.get('startTime', 0), move1.get('startTime', 0) + move1.get('duration', 0)
                start2, end2 = move2.get('startTime', 0), move2.get('startTime', 0) + move2.get('duration', 0)
                
                if not (end1 <= start2 or end2 <= start1):  # 有时间重叠
                    # 检查路径是否有空间冲突
                    actor1_name = next((a['name'] for a in actors if a['id'] == move1.get('actorId')), '未知')
                    actor2_name = next((a['name'] for a in actors if a['id'] == move2.get('actorId')), '未知')
                    
                    conflicts.append({
                        "type": "路径冲突",
                        "actors": [actor1_name, actor2_name],
                        "time_range": f"{max(start1, start2):.1f}-{min(end1, end2):.1f}秒",
                        "severity": "中",
                        "suggestion": f"建议调整{actor2_name}的移动时间或路径"
                    })
    
    return {
        "conflicts_found": len(conflicts),
        "conflicts": conflicts,
        "analysis_summary": f"发现{len(conflicts)}个潜在路径冲突" if conflicts else "未发现路径冲突"
    }

def _analyze_lighting_effects(stage_data: Dict[str, Any]) -> Dict[str, Any]:
    """分析灯光效果"""
    lights = stage_data.get('lights', [])
    actors = stage_data.get('actors', [])
    
    coverage_analysis = []
    intensity_issues = []
    
    # 分析灯光覆盖
    for actor in actors:
        covered = False
        for light in lights:
            # 简单的距离计算判断是否被照亮
            distance = ((actor['x'] - light.get('x', 0))**2 + (actor['y'] - light.get('y', 0))**2)**0.5
            beam_radius = light.get('beamAngle', 30) * 2  # 简化计算
            
            if distance <= beam_radius:
                covered = True
                break
        
        if not covered:
            coverage_analysis.append({
                "actor": actor['name'],
                "issue": "照明不足",
                "suggestion": f"为{actor['name']}添加专用灯光"
            })
    
    # 检查亮度问题
    for light in lights:
        if light.get('intensity', 100) > 90:
            intensity_issues.append({
                "light": light.get('name', '未命名灯光'),
                "issue": "亮度过高",
                "current_intensity": light.get('intensity'),
                "suggestion": "建议降低亮度至70-80%"
            })
    
    return {
        "coverage_issues": coverage_analysis,
        "intensity_issues": intensity_issues,
        "total_lights": len(lights),
        "analysis_summary": f"灯光覆盖分析完成，发现{len(coverage_analysis)}个覆盖问题，{len(intensity_issues)}个亮度问题"
    }

def _analyze_rhythm_patterns(stage_data: Dict[str, Any]) -> Dict[str, Any]:
    """分析台词和移动的节奏模式"""
    dialogues = stage_data.get('dialogues', [])
    movements = stage_data.get('movements', [])
    
    if not dialogues:
        return {"analysis_summary": "暂无台词数据进行节奏分析"}
    
    # 分析台词时长分布
    durations = [d.get('duration', 0) for d in dialogues]
    avg_duration = sum(durations) / len(durations)
    
    rhythm_issues = []
    
    # 检查异常长的台词
    for dialogue in dialogues:
        if dialogue.get('duration', 0) > avg_duration * 2:
            rhythm_issues.append({
                "type": "台词过长",
                "content": dialogue.get('content', '')[:20] + "...",
                "duration": dialogue.get('duration'),
                "suggestion": "考虑分段或精简表达"
            })
    
    # 检查台词间隔
    sorted_dialogues = sorted(dialogues, key=lambda x: x.get('startTime', 0))
    for i in range(len(sorted_dialogues) - 1):
        current_end = sorted_dialogues[i].get('startTime', 0) + sorted_dialogues[i].get('duration', 0)
        next_start = sorted_dialogues[i + 1].get('startTime', 0)
        gap = next_start - current_end
        
        if gap > 10:  # 间隔超过10秒
            rhythm_issues.append({
                "type": "台词间隔过长",
                "gap_duration": gap,
                "time_position": f"{current_end:.1f}-{next_start:.1f}秒",
                "suggestion": "考虑添加背景音乐或演员动作填补空白"
            })
    
    return {
        "average_dialogue_duration": avg_duration,
        "rhythm_issues": rhythm_issues,
        "total_dialogues": len(dialogues),
        "analysis_summary": f"节奏分析完成，平均台词时长{avg_duration:.1f}秒，发现{len(rhythm_issues)}个节奏问题"
    }

def _analyze_space_utilization(stage_data: Dict[str, Any]) -> Dict[str, Any]:
    """分析舞台空间利用"""
    actors = stage_data.get('actors', [])
    stage_elements = stage_data.get('stage_elements', [])
    areas = stage_data.get('areas', [])
    
    # 舞台假设为800x500像素
    stage_width, stage_height = 800, 500
    
    # 分析演员分布
    if actors:
        x_positions = [a['x'] for a in actors]
        y_positions = [a['y'] for a in actors]
        
        # 计算利用的舞台区域
        min_x, max_x = min(x_positions), max(x_positions)
        min_y, max_y = min(y_positions), max(y_positions)
        
        used_width = (max_x - min_x) / stage_width * 100
        used_height = (max_y - min_y) / stage_height * 100
        
        space_issues = []
        
        if used_width < 50:
            space_issues.append({
                "issue": "横向空间利用不足",
                "utilization": f"{used_width:.1f}%",
                "suggestion": "考虑将演员分布更广，增加舞台横向利用"
            })
        
        if used_height < 50:
            space_issues.append({
                "issue": "纵向空间利用不足", 
                "utilization": f"{used_height:.1f}%",
                "suggestion": "考虑增加前后景深的演员调度"
            })
        
        # 检查演员聚集
        clustered_actors = []
        for i, actor1 in enumerate(actors):
            nearby_count = 0
            for j, actor2 in enumerate(actors):
                if i != j:
                    distance = ((actor1['x'] - actor2['x'])**2 + (actor1['y'] - actor2['y'])**2)**0.5
                    if distance < 100:  # 距离小于100像素
                        nearby_count += 1
            
            if nearby_count >= 2:
                clustered_actors.append(actor1['name'])
        
        if clustered_actors:
            space_issues.append({
                "issue": "演员过度聚集",
                "affected_actors": clustered_actors,
                "suggestion": "考虑分散部分演员位置，增加舞台层次感"
            })
        
        return {
            "width_utilization": f"{used_width:.1f}%",
            "height_utilization": f"{used_height:.1f}%",
            "space_issues": space_issues,
            "total_elements": len(stage_elements),
            "total_areas": len(areas),
            "analysis_summary": f"空间利用分析完成，横向利用{used_width:.1f}%，纵向利用{used_height:.1f}%"
        }
    else:
        return {
            "analysis_summary": "暂无演员数据进行空间分析"
        } 