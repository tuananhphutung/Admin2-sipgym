
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Ticket, User, MessageCircle } from 'lucide-react';

const BottomNav: React.FC = () => {
  const tabs = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/schedule', label: 'Lịch tập', icon: Calendar },
    { path: '/voucher', label: 'Voucher', icon: Ticket },
    { path: '/profile', label: 'Inbody', icon: User },
    { path: '/support', label: 'Hỗ trợ', icon: MessageCircle }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-end pb-8 pt-0 z-[60] rounded-t-[40px] shadow-[0_-15px_40px_rgba(0,0,0,0.06)]">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) => `
            flex flex-col items-center gap-1.5 flex-1 transition-all duration-300 relative py-3
            ${isActive ? 'text-[#FF6B00]' : 'text-[#A0AEC0]'}
          `}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute top-0 w-12 h-1 bg-[#FF6B00] rounded-full animate-in fade-in zoom-in duration-300"></div>
              )}
              
              <tab.icon 
                className={`w-7 h-7 transition-transform ${isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[1.5px]'}`} 
              />
              <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-[#FF6B00]' : 'text-[#A0AEC0]'}`}>
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;
