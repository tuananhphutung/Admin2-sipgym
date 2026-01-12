
import React, { useState } from 'react';
import { PackageItem, UserProfile, VoucherItem } from '../App';
import { Dumbbell, Users, CheckCircle2, Flame, Gift } from 'lucide-react';
import PaymentModal from './PaymentModal';

interface PackageSectionProps {
  packages: PackageItem[];
  onUpdateSubscription: (packageName: string, months: number, price: number, method: 'Cash'|'Transfer', voucherCode?: string) => void;
  user: UserProfile | null;
  vouchers: VoucherItem[];
}

const PackageSection: React.FC<PackageSectionProps> = ({ packages, onUpdateSubscription, user, vouchers }) => {
  const [activeTab, setActiveTab] = useState<'gym' | 'groupx'>('gym');
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);

  const filteredPackages = packages.filter(p => p.categoryId === activeTab);

  // Check discount
  let referralDiscount = 0;
  let discountReason = "";
  if (user?.referralBonusAvailable) {
    referralDiscount = 0.10;
    discountReason = "Thưởng giới thiệu";
  } else if (user?.referredBy && !user.hasUsedReferralDiscount) {
    referralDiscount = 0.05;
    discountReason = "Quà thành viên mới";
  }

  return (
    <div className="mt-8 px-4">
       <h3 className="text-lg font-black text-gray-800 uppercase italic mb-4 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-[#FF6B00]" /> Gói Tập Luyện
       </h3>

       {/* Tabs */}
       <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
          <button 
            onClick={() => setActiveTab('gym')} 
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${activeTab === 'gym' ? 'bg-white text-[#FF6B00] shadow-sm' : 'text-gray-400'}`}
          >
             <Dumbbell className="w-4 h-4"/> Gym
          </button>
          <button 
            onClick={() => setActiveTab('groupx')} 
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${activeTab === 'groupx' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}
          >
             <Users className="w-4 h-4"/> Group X
          </button>
       </div>

       {/* Packages Grid */}
       <div className="grid grid-cols-2 gap-3">
          {filteredPackages.map(pkg => {
             const hasDiscount = pkg.originalPrice && pkg.originalPrice > pkg.price;
             const discountPercent = hasDiscount ? Math.round(((pkg.originalPrice! - pkg.price) / pkg.originalPrice!) * 100) : 0;

             return (
                 <div 
                   key={pkg.id} 
                   onClick={() => setSelectedPackage(pkg)}
                   className="bg-white rounded-[20px] p-3 shadow-sm border border-gray-100 active:scale-95 transition-transform cursor-pointer group"
                 >
                    <div className="aspect-video w-full rounded-xl overflow-hidden mb-3 relative">
                       <img src={pkg.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       {pkg.categoryId === 'groupx' && <div className="absolute top-2 right-2 bg-purple-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Class</div>}
                       {hasDiscount && (
                           <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-bl-xl shadow-md z-10 flex items-center gap-1">
                               <Flame className="w-3 h-3 fill-white" /> -{discountPercent}%
                           </div>
                       )}
                    </div>
                    <div className="flex flex-col gap-1">
                       <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-800 text-sm leading-tight line-clamp-1">{pkg.name}</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">{pkg.duration} tháng</p>
                       </div>
                       
                       <div className="flex flex-col items-end">
                          {hasDiscount && (
                              <span className="text-[10px] text-gray-400 line-through decoration-red-400 decoration-2 font-bold">{pkg.originalPrice?.toLocaleString()}đ</span>
                          )}
                          <p className="text-[#FF6B00] font-black text-sm">{pkg.price.toLocaleString()}đ</p>
                       </div>
                    </div>
                    
                    {pkg.description && <p className="text-[9px] text-gray-400 mt-1 line-clamp-1">{pkg.description}</p>}
                    
                    {/* Bonus Days Badge */}
                    {pkg.bonusDays && pkg.bonusDays > 0 && (
                        <div className="mt-2 bg-pink-50 text-pink-600 text-[9px] font-bold uppercase text-center py-1 rounded-lg flex items-center justify-center gap-1">
                            <Gift className="w-3 h-3" /> Tặng {pkg.bonusDays} ngày
                        </div>
                    )}
                    
                    {/* Visual Indicator if current sub */}
                    {user?.subscription?.name === pkg.name && user?.subscription?.status === 'Active' && (
                        <div className="mt-2 bg-green-50 text-green-600 text-[9px] font-bold uppercase text-center py-1 rounded-lg">Đang sử dụng</div>
                    )}
                 </div>
             );
          })}
       </div>

       <PaymentModal 
          isOpen={!!selectedPackage}
          onClose={() => setSelectedPackage(null)}
          type="gym"
          packages={filteredPackages} 
          selectedPackageInit={selectedPackage} 
          vouchers={vouchers}
          user={user}
          userReferralDiscount={referralDiscount}
          userDiscountReason={discountReason}
          onConfirm={(data) => {
             onUpdateSubscription(data.packageName, data.months, data.price, data.method, data.voucherCode);
             setSelectedPackage(null);
          }}
       />
    </div>
  );
};

export default PackageSection;
