
import React from 'react';
import { ArrowLeft, Ticket, Gift, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VoucherItem, UserProfile } from '../App';

interface VoucherProps {
  vouchers: VoucherItem[];
  user: UserProfile;
  onUpdateUser: (users: UserProfile[]) => void;
  allUsers: UserProfile[];
}

const Voucher: React.FC<VoucherProps> = ({ vouchers, user, onUpdateUser, allUsers }) => {
  const navigate = useNavigate();

  const handleSaveVoucher = (code: string) => {
      if (user.savedVouchers.includes(code)) return;
      const updatedUser = { ...user, savedVouchers: [...user.savedVouchers, code] };
      const newAllUsers = allUsers.map(u => u.phone === user.phone ? updatedUser : u);
      onUpdateUser(newAllUsers);
      alert("Đã lưu voucher vào kho!");
  };

  return (
    <div className="min-h-screen bg-white pb-20 animate-in slide-in-from-right duration-500">
       <div className="bg-[#00AEEF] px-6 pt-12 pb-10 rounded-b-[40px] relative overflow-hidden shadow-lg shadow-blue-100">
        <button onClick={() => navigate('/')} className="mb-6 p-2 bg-white/20 rounded-full text-white"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-3xl font-[900] text-white italic uppercase leading-none">Kho Voucher</h1>
        <p className="text-white/70 text-sm font-bold mt-2 uppercase tracking-widest">Săn deal hot tại Sip Gym</p>
      </div>

      <div className="p-6 space-y-4">
        {vouchers.length === 0 ? (
          <div className="text-center py-10 opacity-40">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="font-bold text-gray-400">Chưa có voucher nào</p>
          </div>
        ) : (
          vouchers.map((v) => {
            const isSaved = user.savedVouchers.includes(v.code);
            return (
              <div key={v.id} className="relative bg-white rounded-3xl p-5 border border-gray-100 flex items-center gap-4 shadow-sm group hover:border-blue-100 transition-colors overflow-hidden">
                {/* Decoration Circles */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full"></div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full"></div>

                <div className={`w-16 h-16 ${v.color || 'bg-blue-500'} rounded-xl flex flex-col items-center justify-center text-white shadow-md shrink-0`}>
                   <span className="text-xl font-black">{v.value * 100}%</span>
                   <span className="text-[8px] font-bold uppercase">OFF</span>
                </div>
                <div className="flex-1">
                   <h3 className="font-black text-gray-800 text-sm uppercase leading-tight mb-1">{v.title}</h3>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Code: {v.code}</span>
                      <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded uppercase">{v.type}</span>
                   </div>
                </div>
                <button 
                  onClick={() => handleSaveVoucher(v.code)}
                  disabled={isSaved}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isSaved ? 'bg-gray-100 text-gray-400' : 'bg-[#FF6B00] text-white shadow-md active:scale-95'}`}
                >
                   {isSaved ? 'Đã Lưu' : 'Lưu'}
                </button>
              </div>
            );
          })
        )}
        
        <div className="pt-10 text-center opacity-30">
           <Gift className="w-16 h-16 mx-auto mb-4" />
           <p className="font-black uppercase text-xs tracking-widest">Sẽ còn nhiều ưu đãi sắp tới!</p>
        </div>
      </div>
    </div>
  );
};

export default Voucher;
