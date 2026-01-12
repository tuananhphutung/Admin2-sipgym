
import React, { useState, useMemo } from 'react';
import { User, Bell, LogOut, X, CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../App';

interface HeaderProps {
  user: UserProfile | null;
  onLogout?: () => void;
  onUpdateUser?: (users: UserProfile[]) => void;
  allUsers?: UserProfile[];
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onUpdateUser, allUsers }) => {
  const navigate = useNavigate();
  const [showNotiModal, setShowNotiModal] = useState(false);

  const unreadNotifications = user?.notifications?.filter(n => !n.read) || [];
  const unreadCount = unreadNotifications.length;

  const subscriptionInfo = useMemo(() => {
    if (user?.subscription?.status === 'Active' && user.subscription.startDate && user.subscription.expireDate) {
      const start = new Date(user.subscription.startDate).toLocaleDateString('vi-VN');
      const end = new Date(user.subscription.expireDate).toLocaleDateString('vi-VN');
      const diff = user.subscription.expireDate - Date.now();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return { start, end, days: days > 0 ? days : 0 };
    }
    return null;
  }, [user]);

  const markAsRead = (id: string) => {
    if (!user || !allUsers || !onUpdateUser) return;
    const newUsers = allUsers.map(u => {
      if (u.phone === user.phone) {
        return {
          ...u,
          notifications: (u.notifications || []).map(n => n.id === id ? { ...n, read: true } : n)
        };
      }
      return u;
    });
    onUpdateUser(newUsers);
  };

  return (
    <>
      <div className="flex justify-between items-start px-6 pt-6 pb-2 relative z-10 bg-transparent">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => user && navigate('/profile')} 
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white overflow-hidden cursor-pointer active:scale-95 transition-transform"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : user?.phone ? (
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone}`} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-gray-200" />
            )}
          </div>

          <div className="flex flex-col">
              {subscriptionInfo ? (
                 <div className="flex flex-col">
                    <span className="text-[#FF6B00] text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                       Còn {subscriptionInfo.days} ngày
                    </span>
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold bg-white/50 px-2 py-0.5 rounded-md border border-gray-100">
                       <CalendarCheck className="w-3 h-3" />
                       <span>{subscriptionInfo.start} - {subscriptionInfo.end}</span>
                    </div>
                 </div>
              ) : (
                 <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                   Chào mừng,
                 </span>
              )}
              
              <span className="text-base font-black text-gray-800 leading-tight mt-0.5">
                {user ? (user.name || `Member ${user.phone.slice(-4)}`) : 'Khách hàng'}
              </span>
          </div>
        </div>
        
        <div className="flex gap-3 items-center">
          {user && (
            <button onClick={onLogout} className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
              <LogOut className="w-5 h-5" />
            </button>
          )}
          <div 
            onClick={() => user && setShowNotiModal(true)}
            className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 active:scale-90 transition-all cursor-pointer"
          >
             <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-[#FF6B00]' : 'text-gray-300'}`} />
             {unreadCount > 0 && (
               <div className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                 {unreadCount}
               </div>
             )}
          </div>
        </div>
      </div>

      {showNotiModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-end px-4 pt-20 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowNotiModal(false)} />
           <div className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl max-h-[70vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-black text-gray-800 uppercase italic">Thông Báo</h3>
                 <button onClick={() => setShowNotiModal(false)} className="p-2 bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5"/></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                 {user?.notifications.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-10 font-bold uppercase">Không có thông báo mới</p>
                 ) : (
                    user?.notifications.map(n => (
                       <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-4 rounded-2xl border ${n.read ? 'bg-white border-gray-100 opacity-60' : 'bg-orange-50 border-orange-100'} transition-all cursor-pointer active:scale-95`}>
                          <p className="text-sm text-gray-800 font-bold mb-1">{n.text}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{new Date(n.date).toLocaleString('vi-VN')}</p>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default Header;
