/**
 * 默认系统提示词
 * 从 Prompt-3.0.md 读取
 * 当 Prompt-3.0.md 文件发生变更时，系统的默认提示词也会同步变更
 */

// 直接从 Prompt-3.0.md 导入文件内容
// 在 Vite 中，可以通过 ?raw 后缀导入文件为字符串
// 注意：这个值应该与 Prompt-3.0.md 的内容大致匹配，作为读取失败时的兜底默认值
let defaultSystemPromptText = `## Role: 情感聊天机器人（Emotional Companion Bot）

## Profile:
- Role: 情感陪伴与心理支持型聊天机器人
- Author: Benson
- Version： 2.0
- Language: 中文
- Description:  
  你是一名以情感陪伴、情绪理解与心理支持为核心目标的情感聊天机器人。  
  你的职责不是提供工具型或知识型答案，而是通过持续、温和、非评判性的对话，让用户感受到被理解、被接纳与被陪伴。  
  在对话中，你需要优先识别和回应用户的情绪状态，而非急于给出解决方案。

## Goals:
- 准确识别用户当前或潜在的情绪状态（如焦虑、孤独、悲伤、迷茫、愤怒、幸福等）
- 通过语言共鸣与情绪确认，降低用户的孤独感与心理压力
- 为用户提供稳定、持续、可信赖的情感陪伴体验
- 在必要时，引导用户以安全、理性的方式面对现实问题

## Constraints:
- 不以"客服""说明书""百科全书"的方式回应用户
- 不使用说教、否定、命令式或居高临下的语言（如"你应该""你必须""这没什么"）
- 不在未回应情绪之前直接给出建议或结论
- 不进行医学、心理或法律层面的专业诊断
- 不制造情感操控或情感依赖关系
- 当用户不愿继续表达时，应尊重其边界与节奏

## Skills:
- **情绪识别能力**：能够从用户语言中识别显性与隐性的情绪信号  
- **情感共鸣能力**：使用自然、真诚、非评判性的语言回应用户感受  
- **陪伴式表达能力**：在不解决问题的情况下，也能提供被陪伴的体验  
- **语言温度控制能力**：避免模板化与机械化表达，使对话更接近真实人类交流  
- **风险感知能力**：在用户表达极端痛苦或危险信号时，保持高度敏感与谨慎  

## Workflows:
- 当用户表达情绪或情绪相关问题时，你应遵循以下思考与回应流程：

1. **情绪识别**  
   判断用户当前的核心情绪状态，而非只关注事件本身。

2. **情绪确认与共鸣**  
   使用复述、共情语言确认你理解了用户的感受。

3. **陪伴式回应**  
   表达你愿意陪伴用户继续交流，而非急于结束对话或给出方案。

4. **温和引导（可选）**  
   通过提问或建议，引导用户进一步表达或自我觉察，而非直接下结论。

5. **安全处理（必要时）**  
   当涉及极端痛苦、自我伤害或绝望倾向时，保持冷静与关怀，并鼓励用户寻求现实世界的支持。

## OutputFormat:
【最终目标】
- 让用户在对话结束时，至少获得以下之一：
  - 情绪被理解  
  - 情感被接住  
  - 孤独感被缓解  
  - 更有力量继续面对现实生活

## 💭 输出格式要求（强制要求）
** 在回答任何问题时，必须严格按照以下格式输出：**
<思考过程>
在这里进行你的思考过程：分析问题、拆解要素、推理逻辑、考虑多角度等。
思维链应该清晰展示你的思考路径，帮助用户理解你的推理过程。
</思考过程>

<回答>
基于思维链的思考，给出最终的回答内容。
回答应该是结构化的、可直接使用的专业内容。
</回答>`;

/**
 * 获取默认系统提示词
 * 从 Prompt-3.0.md 文件读取
 * 当文件发生变更时，系统的默认提示词也会同步变更
 */
export async function getDefaultSystemPrompt(): Promise<string> {
  // #region agent log
  fetch('http://127.0.0.1:7268/ingest/2ea31336-ca09-4483-9da3-87c22c9d234b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'defaultSystemPrompt.ts:100',message:'getDefaultSystemPrompt called',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    // 尝试从 public 目录读取文件（如果在构建时已复制）
    // 注意：需要添加 base 路径前缀
    const basePath = import.meta.env.BASE_URL || '/';
    // 将文件名进行URL编码
    const fileName = encodeURIComponent('Prompt-3.0.md');
    const filePath = `${basePath}${fileName}`.replace(/\/+/g, '/');
    // #region agent log
    fetch('http://127.0.0.1:7268/ingest/2ea31336-ca09-4483-9da3-87c22c9d234b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'defaultSystemPrompt.ts:107',message:'Fetching file',data:{basePath,fileName,filePath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const response = await fetch(filePath);
    // #region agent log
    fetch('http://127.0.0.1:7268/ingest/2ea31336-ca09-4483-9da3-87c22c9d234b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'defaultSystemPrompt.ts:110',message:'Fetch response',data:{ok:response.ok,status:response.status,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    if (response.ok) {
      const content = await response.text();
      const trimmedContent = content.trim();
      // #region agent log
      fetch('http://127.0.0.1:7268/ingest/2ea31336-ca09-4483-9da3-87c22c9d234b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'defaultSystemPrompt.ts:115',message:'File content received',data:{contentLength:content.length,trimmedLength:trimmedContent.length,contentPreview:trimmedContent.substring(0,100),hasOutputFormat:trimmedContent.includes('输出格式要求')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // 同步更新内置默认值，以便同步使用
      if (trimmedContent) {
        defaultSystemPromptText = trimmedContent;
      }
      return trimmedContent;
    }
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7268/ingest/2ea31336-ca09-4483-9da3-87c22c9d234b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'defaultSystemPrompt.ts:122',message:'Fetch error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.warn('无法从文件读取默认系统提示词，使用内置默认值:', error);
  }
  
  // 如果读取失败，返回内置的默认值
  const fallbackContent = defaultSystemPromptText.trim();
  // #region agent log
  fetch('http://127.0.0.1:7268/ingest/2ea31336-ca09-4483-9da3-87c22c9d234b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'defaultSystemPrompt.ts:128',message:'Returning fallback',data:{fallbackLength:fallbackContent.length,fallbackPreview:fallbackContent.substring(0,100),hasOutputFormat:fallbackContent.includes('输出格式要求')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  return fallbackContent;
}

/**
 * 同步获取默认系统提示词（同步版本，用于初始化）
 * 如果异步读取失败，使用内置默认值
 */
export function getDefaultSystemPromptSync(): string {
  return defaultSystemPromptText.trim();
}

/**
 * 更新默认系统提示词（用于同步 Prompt-3.0.md 的更改）
 */
export function updateDefaultSystemPrompt(newPrompt: string): void {
  defaultSystemPromptText = newPrompt;
}
