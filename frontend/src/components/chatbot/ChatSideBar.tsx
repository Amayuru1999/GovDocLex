import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaTrash } from "react-icons/fa";
// import sidebaricon from "../assets/images/sidebaricon.png";
import { toast } from "react-toastify";
import { chatService, type ChatSession } from "../../services/chatService";

type SidebarProps = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentSessionId?: string | null;
  onSessionSelect?: (sessionId: string) => void;
  onNewChat?: () => void;
};

export default function Sidebar({ 
  sidebarOpen, 
  toggleSidebar, 
  currentSessionId, 
  onSessionSelect, 
  onNewChat 
}: SidebarProps) {
  const [showToday, setShowToday] = useState(true);
  const [showPrevious, setShowPrevious] = useState(true);
  const [todaySessions, setTodaySessions] = useState<ChatSession[]>([]);
  const [previousSessions, setPreviousSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load chat sessions when component mounts or sidebar opens
  useEffect(() => {
    if (sidebarOpen && chatService.isAuthenticated()) {
      loadChatSessions();
    }
  }, [sidebarOpen]);

  const loadChatSessions = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await chatService.getChatSessions(50, 0); // Get more sessions
      
      if (response.success) {
        const sessions = response.data.sessions;
        
        // Separate sessions into today and previous
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const todayItems: ChatSession[] = [];
        const previousItems: ChatSession[] = [];
        
        sessions.forEach(session => {
          const sessionDate = new Date(session.lastActivity);
          if (sessionDate >= todayStart) {
            todayItems.push(session);
          } else {
            previousItems.push(session);
          }
        });
        
        setTodaySessions(todayItems);
        setPreviousSessions(previousItems);
      }
    } catch (err) {
      console.error("Failed to load chat sessions:", err);
      setError("Failed to load chat sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    if (onSessionSelect) {
      onSessionSelect(sessionId);
    }
  };

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    }
  };

  const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering session selection
    
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        await chatService.clearChatHistory(sessionId);
        await loadChatSessions(); // Reload sessions after deletion
        toast.success("Chat deleted successfully!");
        
        // If we're deleting the current session, trigger new chat
        if (currentSessionId === sessionId && onNewChat) {
          onNewChat();
        }
      } catch (err) {
        console.error("Failed to delete chat:", err);
        toast.error("Failed to delete chat");
      }
    }
  };

  const formatSessionTitle = (session: ChatSession): string => {
    if (session.lastUserMessage) {
      return session.lastUserMessage.length > 30 
        ? session.lastUserMessage.substring(0, 30) + "..."
        : session.lastUserMessage;
    }
    return `Chat ${new Date(session.createdAt).toLocaleDateString()}`;
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    toast.success("Signed out successfully!");
    navigate("/signin");
  };

  return (
    <div
      className={`bg-[#11191f] text-white h-screen flex flex-col transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-16"
      }`}
    >
      <div
        className={`px-4 py-4 text-lg font-bold tracking-wide border-b border-[#23303a] transition-all duration-300 flex justify-between items-center ${
          sidebarOpen ? "opacity-100" : "opacity-0 w-0 p-0 overflow-hidden"
        }`}
      >
        GOVDocLex
        <button className="" onClick={handleSignOut}>
          <p>
            <FaSignOutAlt />
          </p>
        </button>
      </div>
      
      {/* New Chat Button */}
      {sidebarOpen && (
        <div className="px-4 py-2">
          <button
            onClick={handleNewChat}
            className="w-full bg-[#2EF2B8] text-black py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#2EF2B8]/80 transition-colors"
          >
            + New Chat
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Loading State */}
          {loading && sidebarOpen && (
            <div className="px-4 py-2">
              <div className="text-gray-400 text-sm">Loading chats...</div>
            </div>
          )}

          {/* Error State */}
          {error && sidebarOpen && (
            <div className="px-4 py-2">
              <div className="text-red-400 text-sm">{error}</div>
            </div>
          )}

          {/* Today's Sessions */}
          <div>
            <button
              className={`w-full text-left px-4 py-2 flex items-center justify-between focus:outline-none transition-all duration-300 ${
                sidebarOpen ? "" : "justify-center px-0"
              }`}
              onClick={() => setShowToday(!showToday)}
              disabled={!sidebarOpen}
            >
              <span
                className={`text-sm font-semibold transition-all duration-300 ${
                  sidebarOpen
                    ? "opacity-100"
                    : "opacity-0 w-0 p-0 overflow-hidden"
                }`}
              >
                Today {todaySessions.length > 0 && `(${todaySessions.length})`}
              </span>
              {sidebarOpen && <span>{showToday ? "▾" : "▸"}</span>}
            </button>
            {showToday && sidebarOpen && (
              <div className="pl-4">
                {todaySessions.length === 0 ? (
                  <div className="text-gray-400 text-sm px-3 py-2">No chats today</div>
                ) : (
                  todaySessions.map((session) => (
                    <div
                      key={session.sessionId}
                      onClick={() => handleSessionClick(session.sessionId)}
                      className={`group flex items-center justify-between mt-1 mb-1 rounded cursor-pointer hover:bg-[#232f3a] transition-colors ${
                        currentSessionId === session.sessionId
                          ? "bg-[#232f3a] text-white"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="px-3 py-2 text-sm truncate">
                          {formatSessionTitle(session)}
                        </div>
                        <div className="px-3 text-xs text-gray-500 mb-1">
                          {formatTimeAgo(session.lastActivity)} • {session.messageCount} messages
                        </div>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={(e) => handleDeleteSession(session.sessionId, e)}
                          className="mr-2 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
                          title="Delete chat"
                        >
                          <FaTrash size={12} />
                        </button>
                        {currentSessionId === session.sessionId && (
                          <span className="mr-2 text-gray-400">•••</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Previous Sessions */}
          <div className="mt-4">
            <button
              className={`w-full text-left px-4 py-2 flex items-center justify-between focus:outline-none transition-all duration-300 ${
                sidebarOpen ? "" : "justify-center px-0"
              }`}
              onClick={() => setShowPrevious(!showPrevious)}
              disabled={!sidebarOpen}
            >
              <span
                className={`text-sm font-semibold transition-all duration-300 ${
                  sidebarOpen
                    ? "opacity-100"
                    : "opacity-0 w-0 p-0 overflow-hidden"
                }`}
              >
                Previous 7 Days {previousSessions.length > 0 && `(${previousSessions.length})`}
              </span>
              {sidebarOpen && <span>{showPrevious ? "▾" : "▸"}</span>}
            </button>
            {showPrevious && sidebarOpen && (
              <div className="pl-4">
                {previousSessions.length === 0 ? (
                  <div className="text-gray-400 text-sm px-3 py-2">No previous chats</div>
                ) : (
                  previousSessions.map((session) => (
                    <div
                      key={session.sessionId}
                      onClick={() => handleSessionClick(session.sessionId)}
                      className={`group cursor-pointer mt-1 mb-1 px-3 py-2 text-sm rounded truncate transition-colors flex items-center justify-between ${
                        currentSessionId === session.sessionId
                          ? "bg-[#232f3a] text-white"
                          : "text-gray-300 hover:text-white hover:bg-[#232f3a]"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="truncate">
                          {formatSessionTitle(session)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(session.lastActivity)} • {session.messageCount} messages
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(session.sessionId, e)}
                        className="ml-2 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
                        title="Delete chat"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-4 flex flex-col md:flex-row md:justify-between items-center border-t border-[#23303a]">
          <button
            className="w-8 h-8 flex items-center justify-center rounded  transition"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <span className="text-xl">{sidebarOpen ? "⮞" : "⮜"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}