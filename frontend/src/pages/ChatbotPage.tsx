import React, { useState } from "react";
import Sidebar from "../components/chatbot/ChatSideBar";
import MainChat from "@/components/chatbot/MainChat";

const ChatbotPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleNewChat = () => {
    // Generate a new session ID for a fresh chat
    const newSessionId = crypto.randomUUID();
    setCurrentSessionId(newSessionId);
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex justify-end">
      <div className="max-w-[1920px] mx-auto w-full p-4 sm:p-6 md:p-12 xl:p-[100px]">
        <MainChat 
          sessionId={currentSessionId}
          onSessionChange={setCurrentSessionId}
        />
      </div>
      <div className="absolute xsm:relative">
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar}
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
          onNewChat={handleNewChat}
        />
      </div>
    </div>
  );
};

export default ChatbotPage;
