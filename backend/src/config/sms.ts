import dotenv from 'dotenv';

dotenv.config();

export const smsConfig = {
  secretId: process.env.TENCENT_SMS_SECRET_ID || '',
  secretKey: process.env.TENCENT_SMS_SECRET_KEY || '',
  region: process.env.TENCENT_SMS_REGION || 'ap-beijing',
  appId: process.env.TENCENT_SMS_APP_ID || '',
  signName: process.env.TENCENT_SMS_SIGN_NAME || '',
  templateId: process.env.TENCENT_SMS_TEMPLATE_ID || '',
};

// 验证配置
if (!smsConfig.secretId || !smsConfig.secretKey || !smsConfig.appId) {
  console.warn('腾讯云短信配置不完整，请在.env文件中配置');
}

export default smsConfig;
