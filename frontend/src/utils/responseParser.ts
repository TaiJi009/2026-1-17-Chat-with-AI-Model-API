/**
 * 解析AI返回的内容，提取思考过程和回答
 * 格式：<思考过程>...</思考过程><回答>...</回答>
 */
export function parseAIResponse(content: string): { thinkingChain: string; answer: string } {
  const thinkingChainMatch = content.match(/<思考过程>([\s\S]*?)<\/思考过程>/);
  const answerMatch = content.match(/<回答>([\s\S]*?)<\/回答>/);

  const thinkingChain = thinkingChainMatch ? thinkingChainMatch[1].trim() : '';
  const answer = answerMatch ? answerMatch[1].trim() : '';

  // 如果没有匹配到格式，使用原内容作为回答，思考过程为空
  if (!thinkingChain && !answer) {
    return {
      thinkingChain: '',
      answer: content.trim(),
    };
  }

  return { thinkingChain, answer };
}
