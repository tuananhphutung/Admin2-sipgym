
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import QuickNav from '../components/QuickNav';
import PackageSection from '../components/PackageSection'; 
import PTPackageSection from '../components/PTPackageSection';
import WeatherWidget from '../components/WeatherWidget';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { UserProfile, Promotion, Trainer, TrainingProgram, PackageItem, PTPackage, VoucherItem, Booking } from '../App';

interface HomeProps {
  user: UserProfile | null;
  promotions: Promotion[];
  trainers: Trainer[];
  programs: TrainingProgram[];
  packages: PackageItem[];
  ptPackages: PTPackage[]; 
  vouchers: VoucherItem[]; 
  appLogo?: string;
  heroImage?: string; 
  heroVideo?: string; 
  heroMediaType?: 'image' | 'video';
  heroTitle?: string;
  heroSubtitle?: string;
  heroOverlayText?: string;
  heroOverlaySub?: string;
  onLogout: () => void;
  onUpdateSubscription: (packageName: string, months: number, price: number, method: 'Cash'|'Transfer', voucherCode?: string) => void;
  onUpdateUser: (users: UserProfile[]) => void;
  onRegisterPT: (pkg: PTPackage, paidAmount: number, method: 'Cash'|'Transfer', voucherCode?: string) => void;
  allUsers: UserProfile[];
  bookings?: Booking[];
  onUpdateBookings?: (bookings: Booking[]) => void;
}

const Home: React.FC<HomeProps> = ({ 
  user, promotions, trainers, programs, packages, ptPackages, vouchers, 
  appLogo, heroImage, heroVideo, heroMediaType, heroTitle, heroSubtitle, heroOverlayText, heroOverlaySub,
  onLogout, onUpdateSubscription, onUpdateUser, onRegisterPT, allUsers,
  bookings, onUpdateBookings
}) => {
  const navigate = useNavigate();

  // Handle Share / Referral
  const handleShare = () => {
     if (navigator.share) {
        navigator.share({
           title: 'Sip Gym Nhà Bè',
           text: 'Tham gia Sip Gym Nhà Bè ngay để nhận ưu đãi!',
           url: 'https://sipgymnhabe.phkglobal.com'
        }).catch(console.error);
     } else {
        alert("Copy link giới thiệu: https://sipgymnhabe.phkglobal.com");
     }
  };

  return (
    <div className="animate-in fade-in duration-500 relative pb-10">
      
      {/* Top Logo & Slogan Area */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4">
         <div className="w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-orange-50 mb-3 relative z-10 transform hover:scale-105 transition-transform duration-300">
            <img src={appLogo} className="w-14 h-14 object-contain" alt="Logo" />
         </div>
         
         <div className="text-center space-y-1 animate-in slide-in-from-top-2 duration-700">
            {heroTitle && (
                <h1 className="text-2xl font-[900] text-gray-800 uppercase italic tracking-tighter leading-none whitespace-pre-line drop-shadow-sm">
                    {heroTitle}
                </h1>
            )}
            {heroSubtitle && (
                <p className="text-[10px] font-bold text-[#FF6B00] tracking-[0.3em] uppercase opacity-90 mt-1.5">
                    {heroSubtitle}
                </p>
            )}
         </div>
      </div>

      <Header user={user} onLogout={onLogout} onUpdateUser={onUpdateUser} allUsers={allUsers} />
      
      <div className="px-6 mt-1 mb-2">
         <WeatherWidget />
      </div>

      <Hero 
        image={heroImage} 
        video={heroVideo}
        mediaType={heroMediaType}
        title={heroTitle} 
        subtitle={heroSubtitle}
        overlayText={heroOverlayText}
        overlaySub={heroOverlaySub}
      />
      
      {/* Referral Button Block */}
      <div className="px-4 mt-4">
         <button 
           onClick={handleShare}
           className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-between group active:scale-95 transition-all duration-200 hover:shadow-xl hover:brightness-110"
         >
            <div className="flex items-center gap-3">
               <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <UserPlus className="w-5 h-5 text-white" />
               </div>
               <div className="text-left">
                  <p className="font-black text-sm uppercase italic">Giới thiệu bạn bè</p>
                  <p className="text-[10px] font-medium opacity-90">Nhận ngay ưu đãi giảm giá</p>
               </div>
            </div>
            <span className="text-xs font-black bg-white text-blue-500 px-3 py-1 rounded-lg shadow-sm group-hover:bg-blue-50 transition-colors">Mời Ngay</span>
         </button>
      </div>

      {promotions.length > 0 && (
        <div className="px-5 mt-6 overflow-x-auto no-scrollbar flex gap-4 pb-2">
           {promotions.map(promo => (
             <div key={promo.id} className="min-w-[280px] h-32 bg-orange-600 rounded-[20px] relative overflow-hidden shadow-lg shadow-orange-100 shrink-0 transform transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer">
                <img src={promo.image} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="promo" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                   <p className="text-white font-black uppercase text-sm italic drop-shadow-md">{promo.title}</p>
                   <span className="text-white/80 text-[8px] font-bold">SIP GYM • ƯU ĐÃI</span>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Main Packages Display */}
      <PackageSection 
         packages={packages} 
         onUpdateSubscription={onUpdateSubscription}
         user={user}
         vouchers={vouchers}
      />

      <QuickNav 
         trainers={trainers} 
         user={user}
         bookings={bookings}
         onUpdateBookings={onUpdateBookings}
      />
      
      <PTPackageSection 
        ptPackages={ptPackages} 
        user={user}
        onRegisterPT={onRegisterPT}
        onOpenAuth={() => {}} 
      />
      
      <div className="px-6 mt-8 flex justify-center">
         <button 
           onClick={() => navigate('/admin')}
           className="bg-gray-100 text-gray-400 p-2 rounded-full flex items-center gap-2 hover:bg-gray-200 hover:text-gray-600 transition-all active:scale-90"
           title="Admin Login"
         >
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase">Admin</span>
         </button>
      </div>

      <div className="h-10"></div>
    </div>
  );
};

export default Home;
