import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/authService';
import { FiX, FiSmartphone, FiLock } from 'react-icons/fi';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入有效的手机号');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await AuthService.sendSms(phone);
      setStep('code');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || '发送验证码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!code || code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(phone, code);
      onClose();
      setPhone('');
      setCode('');
      setStep('phone');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {step === 'phone' ? '登录/注册' : '输入验证码'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                手机号
              </label>
              <div className="relative">
                <FiSmartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  maxLength={11}
                />
              </div>
            </div>
            <button
              onClick={handleSendCode}
              disabled={loading || !phone}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '发送中...' : '发送验证码'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                验证码
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="请输入6位验证码"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  maxLength={6}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStep('phone');
                  setCode('');
                  setError('');
                }}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                返回
              </button>
              <button
                onClick={handleLogin}
                disabled={loading || code.length !== 6}
                className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </div>
            {countdown > 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {countdown}秒后可重新发送
              </p>
            ) : (
              <button
                onClick={handleSendCode}
                className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                重新发送验证码
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
