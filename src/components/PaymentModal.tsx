import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { PaymentService } from '../services/paymentService';
import { FiX, FiCreditCard, FiCheck } from 'react-icons/fi';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const { isAuthenticated } = useAuth();
  const { dispatch } = useApp();
  const [qrCode, setQrCode] = useState('');
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'paid' | 'error'>('idle');
  const [error, setError] = useState('');

  // 创建订单
  useEffect(() => {
    if (isOpen && isAuthenticated && status === 'idle') {
      createOrder();
    }
  }, [isOpen, isAuthenticated]);

  // 轮询订单状态
  useEffect(() => {
    if (!orderId || status !== 'loading') return;

    const interval = setInterval(async () => {
      try {
        const order = await PaymentService.getOrderStatus(orderId);
        if (order.status === 'paid') {
          setStatus('paid');
          // 刷新用户状态
          const subscription = await PaymentService.getSubscriptionStatus();
          dispatch({ type: 'SET_PRO_STATUS', payload: subscription.isPro });
          // 3秒后关闭弹窗
          setTimeout(() => {
            onClose();
            setStatus('idle');
            setQrCode('');
            setOrderId('');
          }, 3000);
        }
      } catch (err) {
        console.error('查询订单状态失败:', err);
      }
    }, 2000); // 每2秒查询一次

    return () => clearInterval(interval);
  }, [orderId, status]);

  const createOrder = async () => {
    if (!isAuthenticated) {
      setError('请先登录');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const order = await PaymentService.createOrder();
      setQrCode(order.qrCode);
      setOrderId(order.orderId);
    } catch (err: any) {
      setError(err.message || '创建订单失败');
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            升级到Pro
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {status === 'error' && error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        {status === 'paid' ? (
          <div className="text-center py-8">
            <FiCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              支付成功！
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              您已成功升级到Pro，现在可以使用日间模式了
            </p>
          </div>
        ) : status === 'loading' && qrCode ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                请使用微信扫描下方二维码完成支付
              </p>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img
                  src={qrCode}
                  alt="支付二维码"
                  className="w-64 h-64"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                金额：¥10.00 / 月
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>等待支付中...</span>
            </div>
          </div>
        ) : status === 'loading' ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">正在创建订单...</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <FiCreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Pro功能
            </h3>
            <ul className="text-left text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li>✓ 日间模式（浅色主题）</li>
              <li>✓ 更多功能即将推出</li>
            </ul>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              ¥10.00 <span className="text-sm font-normal text-gray-500">/ 月</span>
            </p>
            <button
              onClick={createOrder}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              立即支付
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
