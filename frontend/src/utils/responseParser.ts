/**
 * 解析AI返回的内容，提取思考过程和回答
 * 格式：<思考过程>...</思考过程><回答>...</回答>
 */
export function parseAIResponse(content: string): { thinkingChain: string; answer: string } {
  const thinkingChainMatch = content.match(/<思考过程>([\s\S]*?)<\/思考过程>/);
  const answerMatch = content.match(/<回答>([\s\S]*?)<\/回答>/);

  let thinkingChain = thinkingChainMatch ? thinkingChainMatch[1].trim() : '';
  let answer = answerMatch ? answerMatch[1].trim() : '';

  // 去除模型误输出的字面量标签，避免在「回答」块中显示多余的 <回答>
  if (answer.startsWith('<回答>')) answer = answer.slice('<回答>'.length).trim();
  if (answer.startsWith('</回答>')) answer = answer.slice('</回答>'.length).trim();
  if (thinkingChain.startsWith('<思考过程>')) thinkingChain = thinkingChain.slice('<思考过程>'.length).trim();
  if (thinkingChain.startsWith('</思考过程>')) thinkingChain = thinkingChain.slice('</思考过程>'.length).trim();

  // 如果没有匹配到格式，使用原内容作为回答，思考过程为空
  if (!thinkingChain && !answer) {
    return {
      thinkingChain: '',
      answer: content.trim(),
    };
  }

  return { thinkingChain, answer };
}

/**
 * 流式下解析未闭合的 content：支持仅出现开标签时的部分内容
 * 用于流式过程中边收边显，保持「上思考、下回答」两段稳定展示。
 */
export function parseAIResponseStreaming(content: string): { thinkingChain: string; answer: string } {
  const hasThinkingClose = content.includes('</思考过程>');
  const hasAnswerClose = content.includes('</回答>');

  let thinkingChain = '';
  if (hasThinkingClose) {
    const m = content.match(/<思考过程>([\s\S]*?)<\/思考过程>/);
    thinkingChain = m ? m[1].trim() : '';
  } else if (content.includes('<思考过程>')) {
    const start = content.indexOf('<思考过程>') + '<思考过程>'.length;
    thinkingChain = content.slice(start).trim();
  }
  if (thinkingChain.startsWith('<思考过程>')) thinkingChain = thinkingChain.slice('<思考过程>'.length).trim();
  if (thinkingChain.startsWith('</思考过程>')) thinkingChain = thinkingChain.slice('</思考过程>'.length).trim();

  let answer = '';
  if (hasAnswerClose) {
    const m = content.match(/<回答>([\s\S]*?)<\/回答>/);
    answer = m ? m[1].trim() : '';
  } else {
    const lastOpen = content.lastIndexOf('<回答>');
    if (lastOpen !== -1) {
      const start = lastOpen + '<回答>'.length;
      answer = content.slice(start).trim();
    }
  }
  if (answer.startsWith('<回答>')) answer = answer.slice('<回答>'.length).trim();
  if (answer.startsWith('</回答>')) answer = answer.slice('</回答>'.length).trim();

  if (!thinkingChain && !answer && content.trim()) {
    return { thinkingChain: '', answer: content.trim() };
  }
  return { thinkingChain, answer };
}
