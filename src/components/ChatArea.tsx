import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatArea() {
  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-950">
      <MessageList />
      <MessageInput />
    </div>
  );
}
