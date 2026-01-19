import dotenv from 'dotenv';

dotenv.config();

export const wechatPayConfig = {
  appId: process.env.WECHAT_APP_ID || '',
  mchId: process.env.WECHAT_MCH_ID || '',
  apiKey: process.env.WECHAT_API_KEY || '',
  notifyUrl: process.env.WECHAT_NOTIFY_URL || '',
  sandbox: process.env.WECHAT_SANDBOX === 'true',
};

// 验证配置
if (!wechatPayConfig.appId || !wechatPayConfig.mchId || !wechatPayConfig.apiKey) {
  console.warn('微信支付配置不完整，请在.env文件中配置');
}

export default wechatPayConfig;
