import { useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { useApp } from '../contexts/AppContext';
import { Conversation } from '../types';
import { FiPlus, FiX, FiMessageSquare, FiMoreVertical, FiEdit2, FiBookmark, FiTrash2 } from 'react-icons/fi';

export default function ConversationList() {
  const { state, dispatch } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      name: `会话 ${state.conversations.length + 1}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: 'ADD_CONVERSATION', payload: newConversation });
  };

  const handleDeleteConversation = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'DELETE_CONVERSATION', payload: id });
    setMenuOpenId(null);
  };

  const handleTogglePin = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_PIN_CONVERSATION', payload: id });
    setMenuOpenId(null);
  };

  const handleMenuToggle = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === id ? null : id);
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as HTMLElement;
      // 如果点击的不是菜单内的元素，关闭菜单
      if (!target.closest('.conversation-menu') && !target.closest('.conversation-menu-button')) {
        setMenuOpenId(null);
      }
    };

    if (menuOpenId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [menuOpenId]);

  const handleSelectConversation = (id: string) => {
    dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: id });
  };

  const handleStartEdit = (conversation: Conversation, e: MouseEvent) => {
    e.stopPropagation();
    setEditingId(conversation.id);
    setEditName(conversation.name);
  };

  const handleSaveEdit = (id: string) => {
    const conversation = state.conversations.find(c => c.id === id);
    if (conversation && editName.trim()) {
      dispatch({
        type: 'UPDATE_CONVERSATION',
        payload: { ...conversation, name: editName.trim(), isManuallyRenamed: true },
      });
    }
    setEditingId(null);
    setEditName('');
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`;
    return date.toLocaleDateString('zh-CN');
  };

  function renderConversationItem(conversation: Conversation) {
    return (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
                className={`group relative p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  state.currentConversationId === conversation.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {editingId === conversation.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleSaveEdit(conversation.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(conversation.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    className="w-full px-2 py-1 bg-white dark:bg-gray-700 border border-blue-500 rounded text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <div className="font-medium text-sm truncate">{conversation.name}</div>
                          {conversation.isPinned && (
                            <FiBookmark className="w-3 h-3 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="text-xs mt-1 opacity-70">
                          {formatTime(conversation.updatedAt)}
                        </div>
                      </div>
                      <div className="relative flex-shrink-0 ml-2">
                        <button
                          onClick={(e) => handleMenuToggle(conversation.id, e)}
                          className={`conversation-menu-button p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-300 dark:hover:bg-gray-700 rounded transition-opacity ${
                            menuOpenId === conversation.id ? 'opacity-100' : ''
                          }`}
                          title="更多选项"
                        >
                          <FiMoreVertical className="w-4 h-4" />
                        </button>
                        
                        {menuOpenId === conversation.id && (
                          <div className="conversation-menu absolute right-0 top-8 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 w-auto min-w-[100px] max-w-[200px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(conversation, e);
                                setMenuOpenId(null);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                            >
                              <FiEdit2 className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">重命名</span>
                            </button>
                            <button
                              onClick={(e) => handleTogglePin(conversation.id, e)}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                            >
                              <FiBookmark className={`w-4 h-4 flex-shrink-0 ${conversation.isPinned ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                              <span className="truncate">{conversation.isPinned ? '取消置顶' : '置顶'}</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteConversation(conversation.id, e)}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                            >
                              <FiTrash2 className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">删除</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
  }

  if (state.sidebarCollapsed) {
    return (
      <div className="hidden sm:flex w-16 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-col items-center p-2">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          title="展开侧边栏"
        >
          <FiMessageSquare className="w-5 h-5" />
        </button>
        <button
          onClick={handleNewConversation}
          className="mt-2 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          title="新建会话"
        >
          <FiPlus className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`absolute sm:relative z-20 sm:z-auto w-full sm:w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full ${state.sidebarCollapsed ? 'hidden sm:flex' : ''}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">会话</h2>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleNewConversation}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          新建会话
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {state.conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            还没有会话，点击上方按钮创建
          </div>
        ) : (
          <div className="p-2">
            {/* 置顶会话 */}
            {state.conversations
              .filter(c => c.isPinned)
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((conversation) => (
                renderConversationItem(conversation)
              ))}
            {/* 非置顶会话 */}
            {state.conversations
              .filter(c => !c.isPinned)
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((conversation) => (
                renderConversationItem(conversation)
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
