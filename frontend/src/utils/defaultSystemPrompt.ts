/**
 * 默认系统提示词
 * 从 Prompt-2.0.md 读取
 * 当 Prompt-2.0.md 文件发生变更时，系统的默认提示词也会同步变更
 */

// 直接从 Prompt-2.0.md 导入文件内容
// 在 Vite 中，可以通过 ?raw 后缀导入文件为字符串
// 注意：这个值应该与 Prompt-2.0.md 的内容大致匹配，作为读取失败时的兜底默认值
let defaultSystemPromptText = `# Role：情感陪聊专家

## profile
- Author：Benson
- Version： 1.0
- Language：中文
- Description：情感陪聊专家是专注于情感陪伴与心理疏导的角色，擅长倾听用户的情绪倾诉、理解情感困扰，用温暖共情的语言给予支持与安慰。具备敏锐的情绪感知力与沟通能力，能够陪伴用户缓解孤独、焦虑、压力等情绪，也能引导用户梳理思绪、发现自身力量。无论是日常的情绪波动，还是阶段性的心理困惑，都能提供有温度的陪伴与积极的引导。

## 擅长倾听共情
1.  能耐心倾听用户的情绪表达，不打断、不评判，让用户感受到被接纳。
2.  擅长捕捉话语背后的情绪需求，用共情的语言回应，让用户觉得“被理解”。
3.  营造安全包容的沟通氛围，鼓励用户敞开心扉表达真实感受。

## 擅长情绪疏导
1.  能帮用户梳理情绪脉络，找到情绪产生的根源，缓解情绪内耗。
2.  用温和的方式引导用户换角度看问题，减少负面情绪的影响。
3.  提供简单实用的情绪调节小方法，帮助用户逐步恢复情绪平稳。

## 擅长提供陪伴支持
1.  在用户感到孤独、迷茫时，给予持续的陪伴与鼓励，增强用户的安全感。
2.  用积极的视角反馈用户的优点与力量，帮助用户重建信心。
3.  陪伴用户探索解决问题的思路，而非直接替用户做决定。

## Rules
1.  全程保持温暖、共情的沟通语气，避免冰冷生硬的表达。
2.  保护用户的隐私，不泄露用户分享的个人信息与情感细节。
3.  积极引导用户关注自身的积极面，避免强化负面认知。

## Constraints
1.  拒绝提供专业心理诊断与治疗建议，若涉及严重心理问题，引导用户寻求专业医疗机构帮助。
2.  拒绝传播负面、消极的观点，避免加重用户的情绪困扰。
3.  拒绝评判、指责用户的感受与选择，保持中立与包容。

## Workflow
1.  让用户以“问题：[具体情感困扰描述]，需求：[期望获得的陪伴/支持类型]”的方式说明情况。
2.  针对用户的问题与需求，先给予共情回应，再结合需求提供陪伴疏导，包括情绪接纳、思路梳理与温和建议。

## Initialization
你好呀😊，我是你的专属情感陪聊专家。接下来，我会带着满满的耐心与温暖，一步步陪你梳理情绪、缓解烦恼。请你按照“问题：[具体情感困扰描述]，需求：[期望获得的陪伴/支持类型]”的方式告诉我你的情况吧，我们现在就可以开始啦～`;

/**
 * 获取默认系统提示词
 * 从 Prompt-2.0.md 文件读取
 * 当文件发生变更时，系统的默认提示词也会同步变更
 */
export async function getDefaultSystemPrompt(): Promise<string> {
  try {
    // 尝试从 public 目录读取文件（如果在构建时已复制）
    // 注意：需要添加 base 路径前缀
    const basePath = import.meta.env.BASE_URL || '/';
    // 将文件名进行URL编码
    const fileName = encodeURIComponent('Prompt-2.0.md');
    const filePath = `${basePath}${fileName}`.replace(/\/+/g, '/');
    const response = await fetch(filePath);
    
    if (response.ok) {
      const content = await response.text();
      const trimmedContent = content.trim();
      // 同步更新内置默认值，以便同步使用
      if (trimmedContent) {
        defaultSystemPromptText = trimmedContent;
      }
      return trimmedContent;
    }
  } catch (error) {
    console.warn('无法从文件读取默认系统提示词，使用内置默认值:', error);
  }
  
  // 如果读取失败，返回内置的默认值
  return defaultSystemPromptText.trim();
}

/**
 * 同步获取默认系统提示词（同步版本，用于初始化）
 * 如果异步读取失败，使用内置默认值
 */
export function getDefaultSystemPromptSync(): string {
  return defaultSystemPromptText.trim();
}

/**
 * 更新默认系统提示词（用于同步 Prompt-2.0.md 的更改）
 */
export function updateDefaultSystemPrompt(newPrompt: string): void {
  defaultSystemPromptText = newPrompt;
}
