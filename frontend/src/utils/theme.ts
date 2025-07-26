/**
 * Catppuccin Frappe 主题色彩变量
 * https://github.com/catppuccin/catppuccin
 */

export const FRAPPE = {
  // 基础色
  base: "#303446", // 基础背景色
  mantle: "#292c3c", // 稍深的背景色
  crust: "#232634", // 最深的背景色
  
  // 表面色
  surface0: "#414559", // 主要表面色
  surface1: "#51576d", // 边框色
  surface2: "#626880", // 深色表面

  // 文本色
  text: "#c6d0f5", // 主要文本色
  subtext1: "#b5bfe2", // 次要文本色
  subtext0: "#a5adce", // 更次要的文本色
  overlay2: "#949cbb", // 覆盖文本色
  overlay1: "#838ba7", // 更淡的覆盖文本色
  overlay0: "#737994", // 最淡的覆盖文本色

  // 强调色
  blue: "#8caaee", // 蓝色
  lavender: "#babbf1", // 薰衣草色
  sapphire: "#85c1dc", // 天蓝色
  sky: "#99d1db", // 天空蓝
  teal: "#81c8be", // 蓝绿色
  green: "#a6d189", // 绿色
  yellow: "#e5c890", // 黄色
  peach: "#ef9f76", // 橙色
  maroon: "#ea999c", // 栗色
  red: "#e78284", // 红色
  mauve: "#ca9ee6", // 紫红色
  pink: "#f4b8e4", // 粉色
  flamingo: "#eebebe", // 火烈鸟色
  rosewater: "#f2d5cf", // 玫瑰水色
};

// 为组件提供的便捷颜色映射
export const THEME = {
  // 背景色
  background: FRAPPE.base,
  backgroundSecondary: FRAPPE.mantle,
  backgroundTertiary: FRAPPE.crust,
  
  // 表面色
  surface: FRAPPE.surface0,
  surfaceBorder: FRAPPE.surface1,
  surfaceHover: FRAPPE.surface2,
  
  // 文本色
  textPrimary: FRAPPE.text,
  textSecondary: FRAPPE.subtext1,
  textTertiary: FRAPPE.subtext0,
  textDisabled: FRAPPE.overlay1,
  
  // 交互色
  primary: FRAPPE.blue,
  primaryHover: FRAPPE.sapphire,
  success: FRAPPE.green,
  warning: FRAPPE.yellow,
  error: FRAPPE.red,
  info: FRAPPE.lavender,
  
  // 特殊用途
  accent: FRAPPE.mauve,
  highlight: FRAPPE.peach,
};

export default THEME; 