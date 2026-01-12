
import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';

interface GlobalNotificationProps {
  title: string;
  message: string;
  onClose: () => void;
}

const GlobalNotification: React.FC<GlobalNotificationProps> = ({ title, message, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    // Tự động đóng sau 4 giây (theo yêu cầu)
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Đợi hiệu ứng fade out
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 left-4 right-4 z-[300] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-10 opacity-0 scale-95'}`}>
       <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-l-4 border-[#FF6B00] p-4 flex gap-3 relative overflow-hidden animate-in slide-in-from-top-10">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
             <Bell className="w-5 h-5 text-[#FF6B00] animate-bounce" />
          </div>
          <div className="flex-1 pr-4">
             <h4 className="text-gray-900 font-black text-xs uppercase mb-1">{title}</h4>
             <p className="text-gray-600 text-xs font-medium leading-relaxed line-clamp-2">{message}</p>
          </div>
          <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="absolute top-2 right-2 text-gray-300 hover:text-gray-500">
             <X className="w-4 h-4" />
          </button>
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-orange-100 w-full">
             <div className="h-full bg-[#FF6B00] animate-[shrink_4s_linear_forwards] origin-left"></div>
          </div>
       </div>
       <style>{`
         @keyframes shrink {
           from { width: 100%; }
           to { width: 0%; }
         }
       `}</style>
    </div>
  );
};

export default GlobalNotification;
