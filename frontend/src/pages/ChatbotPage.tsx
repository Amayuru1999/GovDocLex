import React, { useState } from "react";
import Sidebar from "../components/chatbot/ChatSideBar";
import MainChat from "@/components/chatbot/MainChat";

const ChatbotPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleNewChat = () => {
    const newSessionId = crypto.randomUUID();
    setCurrentSessionId(newSessionId);
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 
          ${sidebarOpen ? "w-64" : "w-16"} 
          bg-gray-900 border-r border-gray-700 overflow-y-auto scrollbar-hide`}
      >
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Main Chat */}
      <div className="flex-1 overflow-y-auto ">
        <div className="max-w-[1920px] mx-auto w-full p-4 sm:p-6 md:p-12 xl:p-[100px]">
          <MainChat sessionId={currentSessionId} onSessionChange={setCurrentSessionId} />
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
