export interface TemplateVariables {
  user_input: string;
  date?: string;
  time?: string;
  [key: string]: string | undefined;
}

export const parseTemplate = (template: string, variables: TemplateVariables): string => {
  let result = template;
  
  // Replace all {{variable}} placeholders
  result = result.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    const value = variables[varName];
    return value !== undefined ? value : match;
  });
  
  return result;
};

export const extractVariables = (template: string): string[] => {
  const matches = template.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  
  return matches.map(match => match.replace(/\{\{|\}\}/g, ''));
};
