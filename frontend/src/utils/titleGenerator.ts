/**
 * 根据第一轮对话内容生成简短的会话标题
 * @param userMessage 用户的第一条消息
 * @param assistantMessage AI的第一条回复
 * @returns 生成的标题（最多20个字符）
 */
export function generateTitle(userMessage: string, assistantMessage?: string): string {
  // 优先使用用户消息生成标题
  let text = userMessage.trim();
  
  // 如果用户消息太短或为空，尝试使用AI回复
  if (text.length < 3 && assistantMessage) {
    text = assistantMessage.trim();
  }
  
  // 移除Markdown格式标记
  text = text
    .replace(/^#+\s+/gm, '') // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体
    .replace(/`(.*?)`/g, '$1') // 移除行内代码
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 移除链接，保留文本
    .replace(/\n+/g, ' ') // 将换行替换为空格
    .trim();
  
  // 提取前20个字符
  let title = text.substring(0, 20);
  
  // 如果截断在中间，尝试在最后一个空格处截断
  if (text.length > 20) {
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > 10) {
      title = title.substring(0, lastSpace);
    }
  }
  
  // 如果标题为空，使用默认标题
  if (!title || title.length === 0) {
    title = '新对话';
  }
  
  // 移除末尾的标点符号
  title = title.replace(/[。，、；：！？,;:!?.]+$/, '');
  
  return title.trim() || '新对话';
}
