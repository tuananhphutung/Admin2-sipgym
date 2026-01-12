
import React, { useState } from 'react';
import { X, Dumbbell, Users } from 'lucide-react';
import { PackageItem, VoucherItem } from '../App';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: PackageItem[];
  onSelectPackage: (pkg: PackageItem) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  isOpen, onClose, packages, onSelectPackage 
}) => {
  const [activeTab, setActiveTab] = useState<'gym' | 'groupx'>('gym');

  if (!isOpen) return null;

  const filteredPackages = packages.filter(p => p.categoryId === activeTab);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-[430px] bg-white rounded-[24px] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-5 flex justify-between items-center border-b border-gray-50 bg-white sticky top-0 z-10">
          <h2 className="text-lg font-black text-gray-800 uppercase italic tracking-tight">Chọn Gói Tập</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 bg-[#F9FAFB] flex-1 overflow-y-auto no-scrollbar">
           {/* Tabs */}
           <div className="flex bg-gray-200 p-1 rounded-xl mb-4">
              <button 
                onClick={() => setActiveTab('gym')} 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase transition-all ${activeTab === 'gym' ? 'bg-white text-[#FF6B00] shadow-sm' : 'text-gray-500'}`}
              >
                 <Dumbbell className="w-4 h-4"/> Gym
              </button>
              <button 
                onClick={() => setActiveTab('groupx')} 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase transition-all ${activeTab === 'groupx' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
              >
                 <Users className="w-4 h-4"/> Group X
              </button>
           </div>

           {/* Grid */}
           <div className="grid grid-cols-1 gap-3">
              {filteredPackages.map(pkg => (
                 <div 
                   key={pkg.id} 
                   onClick={() => onSelectPackage(pkg)}
                   className="bg-white rounded-2xl p-3 flex gap-4 border border-gray-100 shadow-sm active:scale-95 transition-transform cursor-pointer"
                 >
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                       <img src={pkg.image} className="w-full h-full object-cover" alt={pkg.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                           <h4 className="font-bold text-gray-800 text-sm leading-tight">{pkg.name}</h4>
                           {pkg.categoryId === 'groupx' && <span className="text-[9px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded font-bold uppercase">Class</span>}
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{pkg.duration} tháng</p>
                        <div className="mt-2 text-[#FF6B00] font-black text-lg">{pkg.price.toLocaleString()}đ</div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
