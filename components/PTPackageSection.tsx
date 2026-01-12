
import React, { useState } from 'react';
import { PTPackage, UserProfile, VoucherItem } from '../App';
import { UserCheck, Clock, CheckCircle2 } from 'lucide-react';
import PaymentModal from './PaymentModal';
import { dbService } from '../services/firebase';

interface PTPackageSectionProps {
  ptPackages: PTPackage[];
  user: UserProfile | null;
  onRegisterPT: (pkg: PTPackage, paidAmount: number, voucherCode?: string) => void;
  onOpenAuth: () => void;
}

const PTPackageSection: React.FC<PTPackageSectionProps> = ({ ptPackages, user, onRegisterPT, onOpenAuth }) => {
  const [selectedPT, setSelectedPT] = useState<PTPackage | null>(null);
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);

  // Load vouchers
  React.useEffect(() => {
      dbService.subscribe('vouchers', (data: any) => {
        const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
        if (list.length > 0) setVouchers(list as VoucherItem[]);
      });
  }, []);

  const handleRegisterClick = (pkg: PTPackage) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    
    if (user.ptSubscription) {
      if (user.ptSubscription.status === 'Pending') {
        alert("Bạn đang có yêu cầu đăng ký PT chờ duyệt.");
        return;
      }
       if (user.ptSubscription.status === 'Active') {
        alert("Bạn đang có gói PT đang hoạt động.");
        return;
      }
    }
    setSelectedPT(pkg);
  };

  const getButtonState = (pkg: PTPackage) => {
    if (!user) return { text: "Đăng Ký", disabled: false, icon: null, class: "bg-gray-900 text-white hover:bg-[#FF6B00]" };
    
    if (user.ptSubscription?.packageId === pkg.id || (user.ptSubscription && user.ptSubscription.status !== 'Finished')) {
       if (user.ptSubscription.status === 'Pending') {
         return { text: "Đang Chờ Duyệt", disabled: true, icon: <Clock className="w-3 h-3 animate-spin"/>, class: "bg-blue-100 text-blue-600" };
       }
       if (user.ptSubscription.status === 'Active') {
         return { text: "Đang Hoạt Động", disabled: true, icon: <CheckCircle2 className="w-3 h-3"/>, class: "bg-green-100 text-green-600" };
       }
    }
    
    return { text: "Đăng Ký", disabled: false, icon: null, class: "bg-gray-900 text-white hover:bg-[#FF6B00]" };
  };

  return (
    <div className="mt-6 px-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-800 text-lg font-black uppercase italic flex items-center gap-2">
           <UserCheck className="w-5 h-5 text-[#FF6B00]" />
           Gói PT Huấn Luyện
        </h3>
      </div>
      
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
        {ptPackages.length === 0 ? (
          <div className="w-full bg-gray-50 rounded-2xl p-6 text-center">
             <p className="text-gray-400 text-xs font-bold uppercase">Chưa có gói PT nào</p>
          </div>
        ) : (
          ptPackages.map(pkg => {
            const btnState = getButtonState(pkg);
            return (
              <div key={pkg.id} className="min-w-[220px] bg-white rounded-[24px] overflow-hidden shadow-lg shadow-orange-50 border border-gray-100 flex-shrink-0 group">
                <div className="h-32 relative overflow-hidden">
                  <img 
                    src={pkg.image} 
                    alt={pkg.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-2 left-3 right-3">
                     <p className="text-white font-black text-xs uppercase leading-tight">{pkg.name}</p>
                  </div>
                </div>
                <div className="p-3">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[#FF6B00] font-black text-sm">{pkg.price.toLocaleString()}đ</span>
                      <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase">{pkg.sessions} buổi</span>
                   </div>
                   <button 
                    onClick={() => handleRegisterClick(pkg)}
                    disabled={btnState.disabled}
                    className={`w-full py-2 rounded-xl text-[10px] font-black uppercase transition-colors flex items-center justify-center gap-1 ${btnState.class}`}
                   >
                      {btnState.icon} {btnState.text}
                   </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <PaymentModal 
         isOpen={!!selectedPT}
         onClose={() => setSelectedPT(null)}
         type="pt"
         ptPackage={selectedPT || undefined}
         vouchers={vouchers}
         user={user}
         onConfirm={(data) => {
             if (selectedPT) onRegisterPT(selectedPT, data.price, data.voucherCode);
             setSelectedPT(null);
         }}
      />
    </div>
  );
};

export default PTPackageSection;
