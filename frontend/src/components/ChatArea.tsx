import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ThinkingStatusBar from './ThinkingStatusBar';

export default function ChatArea() {
  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-950">
      <ThinkingStatusBar />
      <MessageList />
      <MessageInput />
    </div>
  );
}
