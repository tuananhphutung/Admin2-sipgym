
import React, { useState } from 'react';
import { DoorOpen, Clock, Dumbbell, AlertCircle } from 'lucide-react';
import PaymentModal from './PaymentModal';
import { Subscription, PackageItem, UserProfile, VoucherItem } from '../App';
import { dbService } from '../services/firebase';

interface ActionCardProps {
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  subscription: Subscription | null;
  onUpdateSubscription: (packageName: string, months: number, price: number, voucherCode?: string) => void;
  packages: PackageItem[];
  user: UserProfile | null;
}

const ActionCard: React.FC<ActionCardProps> = ({ 
  isLoggedIn, onOpenAuth, subscription, onUpdateSubscription, packages, user 
}) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);

  // Load vouchers for modal
  React.useEffect(() => {
     dbService.subscribe('vouchers', (data: any) => {
        const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
        if (list.length > 0) setVouchers(list as VoucherItem[]);
     });
  }, []);

  // Determine Referral Discount
  let referralDiscount = 0;
  let discountReason = "";
  
  if (user?.referralBonusAvailable) {
    referralDiscount = 0.10; // 10%
    discountReason = "Thưởng giới thiệu bạn bè";
  } else if (user?.referredBy && !user.hasUsedReferralDiscount) {
    referralDiscount = 0.05; // 5%
    discountReason = "Quà thành viên mới";
  }

  return (
    <>
      <div className="px-6 mt-4 relative z-20">
        <div className="bg-white rounded-[45px] p-10 shadow-[0_20px_50px_rgba(255,107,0,0.08)] text-center border border-gray-50">
          {isLoggedIn ? (
            <>
              {!subscription && (
                <div className="mb-4 flex items-center justify-center gap-2 text-orange-500 bg-orange-50 py-2 px-4 rounded-full border border-orange-100">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase">Vui lòng chọn gói tập</span>
                </div>
              )}

              {subscription?.status.includes('Pending') && (
                <div className="mb-4 flex items-center justify-center gap-2 text-blue-500 bg-blue-50 py-2 px-4 rounded-full">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span className="text-[11px] font-bold uppercase">
                     {subscription.status === 'Pending Preservation' ? 'Chờ duyệt bảo lưu...' : 'Đang chờ duyệt thanh toán...'}
                  </span>
                </div>
              )}
              
              {subscription?.status === 'Preserved' && (
                 <div className="mb-4 flex items-center justify-center gap-2 text-purple-600 bg-purple-50 py-2 px-4 rounded-full">
                    <span className="text-[11px] font-black uppercase">Gói đang bảo lưu</span>
                 </div>
              )}

              <h2 className="text-[#333] text-2xl font-black leading-tight mb-2">
                {subscription?.status === 'Active' || subscription?.status === 'Preserved'
                  ? `Hội viên ${subscription.name}` 
                  : 'Bắt đầu hành trình'}
              </h2>
              <p className="text-sm text-gray-400 font-medium">Bạn đã sẵn sàng để bứt phá hôm nay chưa?</p>
              
              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                disabled={subscription?.status === 'Pending' || subscription?.status === 'Pending Preservation'}
                className={`mt-8 w-full transition-all text-white py-5 rounded-[25px] flex items-center justify-center gap-3 font-black text-xl shadow-xl uppercase tracking-tighter relative overflow-hidden
                  ${subscription?.status === 'Active' 
                    ? 'bg-green-500 hover:bg-green-600 shadow-green-200' 
                    : (subscription?.status === 'Pending' || subscription?.status === 'Pending Preservation')
                      ? 'bg-gray-300 cursor-not-allowed shadow-none'
                      : 'bg-[#FF6B00] hover:bg-[#E65A00] active:scale-95 shadow-orange-200'
                  }`}
              >
                {/* Background Image for Active Package */}
                {subscription?.status === 'Active' && subscription.packageImage && (
                   <img src={subscription.packageImage} className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" />
                )}

                {subscription?.status === 'Active' ? (
                  <>
                    <Dumbbell className="w-6 h-6 z-10" />
                    <span className="z-10">{subscription.name} (Đã Duyệt)</span>
                  </>
                ) : subscription?.status === 'Pending' ? (
                  'Đang Chờ Duyệt...'
                ) : subscription?.status === 'Preserved' ? (
                  'Đã Bảo Lưu'
                ) : (
                  'Đăng Ký Ngay'
                )}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-[#444] text-2xl font-black leading-tight tracking-tight">
                Tham gia Sip Gym Nhà Bè<br />Ngay hôm nay!
              </h2>
              <p className="mt-3 text-[13px] text-gray-400 font-bold opacity-80 uppercase tracking-tighter">
                Chỉ cần số điện thoại, không cần đăng ký!
              </p>
              
              <button 
                onClick={onOpenAuth}
                className="mt-8 w-full bg-[#FF6B00] hover:bg-[#E65A00] active:scale-95 transition-all text-white py-5 rounded-[25px] flex items-center justify-center gap-3 font-black text-xl shadow-xl shadow-orange-100 uppercase tracking-tighter"
              >
                <DoorOpen className="w-6 h-6" />
                Đăng nhập / Tham gia
              </button>
            </>
          )}
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        type="gym"
        packages={packages}
        vouchers={vouchers}
        userReferralDiscount={referralDiscount}
        userDiscountReason={discountReason}
        user={user}
        onConfirm={(data) => {
            onUpdateSubscription(data.packageName, data.months, data.price, data.voucherCode);
        }}
      />
    </>
  );
};

export default ActionCard;
