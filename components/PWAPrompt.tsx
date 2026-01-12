
import React, { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';

const PWAPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const logoUrl = "https://phukienlimousine.vn/wp-content/uploads/2025/12/LOGO_SIP_GYM_pages-to-jpg-0001-removebg-preview.png";

  useEffect(() => {
    // Check platform
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Check URL param for explicit install request via QR
    const searchParams = new URLSearchParams(window.location.search);
    const isInstallIntent = searchParams.get('install') === 'true';

    // Check if already installed or dismissed
    const isDismissed = localStorage.getItem('pwa_prompt_dismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    // Logic: Show if (Not installed) AND (Intent from QR OR Not dismissed)
    if (!isStandalone) {
      if (isInstallIntent) {
         setIsVisible(true); // Show immediately if scanned from QR
      } else if (!isDismissed) {
         const timer = setTimeout(() => setIsVisible(true), 3000); // Normal delay
         return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleInstall = () => {
    // Android/Chrome usually handles the event default, but for custom UI we instruct user
    // In a real PWA with beforeinstallprompt, we would call prompt() here.
    // For simplicity and broad compatibility, we show instructions.
    if (isIOS) {
       alert("Trên iPhone/iPad:\n1. Nhấn nút 'Chia sẻ' (biểu tượng vuông có mũi tên)\n2. Chọn 'Thêm vào MH chính' (Add to Home Screen)");
    } else {
       alert("Trên Android (Chrome):\n1. Nhấn vào menu 3 chấm ở góc trên\n2. Chọn 'Cài đặt ứng dụng' hoặc 'Thêm vào màn hình chính'");
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[200] flex items-center justify-center px-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleDismiss}></div>
      
      <div className="bg-white rounded-[32px] p-6 shadow-2xl relative z-10 w-full max-w-sm border border-white/20">
        <button onClick={handleDismiss} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200">
             <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg border border-gray-50 p-2 mb-4">
              <img 
                src={logoUrl} 
                className="w-full h-full object-contain" 
                alt="logo"
                onError={(e) => { (e.target as any).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=sipgym' }}
              />
            </div>
            
            <h3 className="text-xl font-black text-gray-800 uppercase italic mb-2">Cài Đặt Sip Gym</h3>
            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
               Thêm ứng dụng vào màn hình chính để đặt lịch nhanh hơn và nhận thông báo ưu đãi!
            </p>

            {isIOS ? (
               <div className="bg-gray-50 rounded-2xl p-4 w-full text-left mb-4 border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2"><Share className="w-4 h-4"/> Hướng dẫn iPhone:</p>
                  <ol className="text-xs text-gray-700 space-y-1 ml-4 list-decimal font-medium">
                     <li>Nhấn nút <b>Chia sẻ</b> ở thanh dưới cùng.</li>
                     <li>Cuộn xuống chọn <b>Thêm vào MH chính</b>.</li>
                     <li>Nhấn <b>Thêm</b> ở góc trên cùng.</li>
                  </ol>
               </div>
            ) : (
                <button 
                  onClick={handleInstall}
                  className="w-full bg-[#00AEEF] text-white py-4 rounded-2xl font-black uppercase shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Cài Đặt Ngay
                </button>
            )}
            
            {!isIOS && (
                <p className="text-[10px] text-gray-400 mt-4 font-medium">
                   Hoặc nhấn vào menu trình duyệt {'>'} "Thêm vào màn hình chính"
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default PWAPrompt;
