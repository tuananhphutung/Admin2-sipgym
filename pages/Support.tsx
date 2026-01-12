
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, MessageCircle, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../App';

interface SupportProps {
  user: UserProfile | null;
  allUsers: UserProfile[];
  onUpdateUser: (users: UserProfile[]) => void;
}

const DEMO_QUESTIONS = [
    "Gói tập nào phù hợp cho người mới?",
    "Giá thuê PT 1 kèm 1?",
    "Phòng tập mở cửa mấy giờ?",
    "Tôi muốn bảo lưu gói tập"
];

const Support: React.FC<SupportProps> = ({ user, allUsers, onUpdateUser }) => {
  const navigate = useNavigate();
  const [msg, setMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = user?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text?: string) => {
    const messageText = text || msg.trim();
    if (!messageText || !user) return;
    
    const newMessage = {
      sender: 'user' as const,
      text: messageText,
      timestamp: Date.now()
    };

    const newUsers = allUsers.map(u => {
      if (u.phone === user.phone) {
        return { ...u, messages: [...(u.messages || []), newMessage] };
      }
      return u;
    });

    onUpdateUser(newUsers);
    setMsg('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center animate-in slide-in-from-right duration-500">
      <div className="w-full max-w-md bg-white flex flex-col h-screen shadow-2xl relative">
          <div className="px-6 pt-12 pb-4 border-b border-gray-100 flex items-center gap-4 bg-white/90 backdrop-blur-md sticky top-0 z-10">
            <button onClick={() => navigate('/')} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
            <div className="flex-1">
               <h2 className="font-black text-gray-800 uppercase italic text-sm">Hỗ Trợ Trực Tuyến</h2>
               <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Admin đang trực tuyến</span>
               </div>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar bg-gray-50/50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-10 h-10 text-blue-500" />
                </div>
                <p className="font-bold text-gray-400 text-sm uppercase tracking-wider">Bắt đầu cuộc trò chuyện</p>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                    m.sender === 'user' 
                    ? 'bg-[#00AEEF] text-white rounded-tr-none' 
                    : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white border-t border-gray-100 p-4 pb-8">
              {/* Quick Replies */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
                  {DEMO_QUESTIONS.map((q, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSend(q)}
                        className="whitespace-nowrap bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                      >
                          {q}
                      </button>
                  ))}
              </div>

              <div className="relative">
                 <input 
                   type="text"
                   value={msg}
                   onChange={(e) => setMsg(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                   className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-5 pr-12 text-sm font-bold focus:ring-2 focus:ring-[#00AEEF]/20 focus:outline-none"
                   placeholder="Nhập tin nhắn..."
                 />
                 <button 
                  onClick={() => handleSend()}
                  className="absolute top-1/2 -translate-y-1/2 right-2 p-2 bg-[#00AEEF] text-white rounded-xl shadow-md active:scale-90 transition-transform"
                 >
                    <Send className="w-4 h-4" />
                 </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Support;
