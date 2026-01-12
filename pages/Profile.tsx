
// ... (imports)
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Package, PlusCircle, RefreshCw, ClipboardList, LogOut, ShieldCheck, X, Camera, PauseCircle, Users, Lock, ScanFace, UserCheck, Bell, ChevronRight, Settings, QrCode } from 'lucide-react';
import { UserProfile, PackageItem, VoucherItem } from '../App';
import PaymentModal from '../components/PaymentModal';
import SubscriptionModal from '../components/SubscriptionModal'; 
import ImageUpload from '../components/ImageUpload';
import { dbService } from '../services/firebase';
import QRCode from 'react-qr-code';
import { faceService } from '../services/faceService';

interface ProfileProps {
  user: UserProfile | null;
  onUpdateSubscription: (packageName: string, months: number, price: number, voucherCode?: string) => void;
  onUpdateUser: (users: UserProfile[]) => void;
  allUsers: UserProfile[];
  packages: PackageItem[];
  vouchers: VoucherItem[];
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateSubscription, onUpdateUser, allUsers, packages, vouchers }) => {
  // ... (keep all hooks and logic the same until render)
  const navigate = useNavigate();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  
  // Settings Modals
  const [activeSetting, setActiveSetting] = useState<'password' | 'face' | 'referral' | null>(null);
  
  // Edit State
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editGender, setEditGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');

  // Security State
  const [newPass, setNewPass] = useState('');
  
  // Camera State
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanStatus, setScanStatus] = useState("Bắt đầu quét");

  // Referral State
  const [referralCodeInput, setReferralCodeInput] = useState('');

  // Handle Camera Effect
  useEffect(() => {
    let mounted = true;
    const startCamera = async () => {
       if (isFaceScanning) {
          try {
             // Preload AI Model when opening camera
             await faceService.loadModels();
             if (!mounted) return;

             if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
             const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
             if (!mounted) {
                stream.getTracks().forEach(t => t.stop());
                return;
             }
             streamRef.current = stream;
             if (videoRef.current) {
                videoRef.current.srcObject = stream;
             }
          } catch (e) {
             console.error(e);
             if (mounted) {
                alert("Không thể mở camera. Vui lòng cấp quyền.");
                setIsFaceScanning(false);
             }
          }
       } else {
          // Cleanup
          if (streamRef.current) {
             streamRef.current.getTracks().forEach(t => t.stop());
             streamRef.current = null;
          }
          if (videoRef.current) {
             videoRef.current.srcObject = null;
          }
       }
    };
    
    startCamera();

    return () => {
       mounted = false;
       if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
       }
    };
  }, [isFaceScanning]);

  if (!user) {
    navigate('/');
    return null;
  }

  // ... (keep handle functions same)
  const handleEditOpen = () => {
    setEditName(user.name || `Member ${user.phone.slice(-4)}`);
    setEditAvatar(user.avatar || '');
    setEditGender(user.gender || 'Nam');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    const newUsers = allUsers.map(u => {
      if (u.phone === user.phone) {
        return { ...u, name: editName, avatar: editAvatar || null, gender: editGender };
      }
      return u;
    });
    onUpdateUser(newUsers);
    setIsEditModalOpen(false);
  };

  const changePassword = () => {
    if (newPass.length < 6) return alert("Mật khẩu quá ngắn");
    const newUsers = allUsers.map(u => u.phone === user.phone ? { ...u, password: newPass } : u);
    onUpdateUser(newUsers);
    setNewPass('');
    setActiveSetting(null);
    alert("Đổi mật khẩu thành công");
  };

  const captureFace = async () => {
     if (videoRef.current) {
       setScanStatus("Đang kiểm tra khuôn mặt...");
       
       // AI Check: Ensure there is a face
       try {
           const faceDescriptor = await faceService.getFaceDescriptor(videoRef.current);
           
           if (!faceDescriptor) {
               alert("⚠️ Không tìm thấy khuôn mặt rõ ràng! Vui lòng điều chỉnh ánh sáng hoặc góc mặt.");
               setScanStatus("Không tìm thấy mặt. Thử lại!");
               return;
           }

           // Capture Image
           const canvas = document.createElement('canvas');
           canvas.width = videoRef.current.videoWidth;
           canvas.height = videoRef.current.videoHeight;
           const ctx = canvas.getContext('2d');
           if (ctx) {
               ctx.translate(canvas.width, 0);
               ctx.scale(-1, 1);
               ctx.drawImage(videoRef.current, 0, 0);
           }
           const base64Image = canvas.toDataURL('image/jpeg', 0.8);

           setIsFaceScanning(false);
           
           const newUsers = allUsers.map(u => u.phone === user.phone ? { ...u, faceData: base64Image, loginMethod: 'face' as const } : u);
           onUpdateUser(newUsers);
           alert("✅ Đã nhận diện và lưu dữ liệu Face ID thành công!");
           setActiveSetting(null);
       } catch (e) {
           console.error(e);
           alert("Lỗi khi xử lý AI.");
           setScanStatus("Lỗi AI. Thử lại.");
       }
     }
  };

  const applyReferralCode = () => {
    if (!referralCodeInput) return;
    if (referralCodeInput === user.phone) { alert("Bạn không thể tự giới thiệu chính mình!"); return; }
    const referrer = allUsers.find(u => u.phone === referralCodeInput);
    if (!referrer) { alert("Mã giới thiệu (SĐT) không tồn tại!"); return; }
    const newUsers = allUsers.map(u => {
      if (u.phone === user.phone) return { ...u, referredBy: referralCodeInput, hasUsedReferralDiscount: false };
      if (u.phone === referralCodeInput) return { ...u, referralBonusAvailable: true, notifications: [{ id: Math.random().toString(), text: `Chúc mừng! Bạn đã giới thiệu thành công ${user.name}.`, date: Date.now(), read: false }, ...u.notifications] };
      return u;
    });
    onUpdateUser(newUsers);
    alert("Áp dụng mã thành công!");
    setActiveSetting(null);
  };

  const handlePreserveRequest = () => {
     if (!user.subscription) return;
     if (user.subscription.months < 6) { alert("Chức năng bảo lưu chỉ dành cho gói tập từ 6 tháng trở lên."); return; }
     if (window.confirm("Bạn chỉ được bảo lưu 1 lần duy nhất trong 1 tháng. Bạn có đồng ý không?")) {
        const newUsers = allUsers.map(u => u.phone === user.phone && u.subscription ? { ...u, subscription: { ...u.subscription, status: 'Pending Preservation' as const } } : u);
        onUpdateUser(newUsers);
        alert("Yêu cầu bảo lưu đã được gửi.");
     }
  };

  const togglePopupNoti = () => {
      const currentSetting = user.settings?.popupNotification ?? true;
      const newUsers = allUsers.map(u => u.phone === user.phone ? { ...u, settings: { ...u.settings, popupNotification: !currentSetting } } : u);
      onUpdateUser(newUsers);
  };

  let referralDiscount = 0;
  let discountReason = "";
  if (user?.referralBonusAvailable) {
    referralDiscount = 0.10; 
    discountReason = "Thưởng giới thiệu bạn bè";
  } else if (user?.referredBy && !user.hasUsedReferralDiscount) {
    referralDiscount = 0.05; 
    discountReason = "Quà thành viên mới";
  }

  const qrIdentityData = {
      app: 'Sip Gym',
      type: 'user_identity',
      user: {
          name: user.realName || user.name || 'Hội viên',
          phone: user.phone,
          avatar: user.avatar || ''
      },
      membership: user.subscription ? {
          packageName: user.subscription.name,
          startDate: user.subscription.startDate ? new Date(user.subscription.startDate).toLocaleDateString('vi-VN') : 'N/A',
          expiryDate: user.subscription.expireDate ? new Date(user.subscription.expireDate).toLocaleDateString('vi-VN') : 'N/A',
          status: user.subscription.status,
          isPreserved: user.subscription.status === 'Preserved' || user.subscription.status === 'Pending Preservation'
      } : null,
      generatedAt: Date.now()
  };

  return (
    <div className="bg-[#F7FAFC] min-h-screen animate-in slide-in-from-right duration-300 pb-24 w-full">
      {/* ... (Top Banner and Info Cards remain unchanged) ... */}
      <div className="bg-[#FF6B00] pt-12 pb-12 relative overflow-hidden rounded-b-[0px] shadow-lg shadow-orange-200/50">
        <button onClick={() => navigate('/')} className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-all z-20"><ArrowLeft className="w-6 h-6" /></button>
        <button onClick={() => setIsQrModalOpen(true)} className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-all z-20"><QrCode className="w-6 h-6" /></button>
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20px] left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl"></div>
        <div className="flex flex-col items-center justify-center relative z-10">
            <div className="relative group cursor-pointer" onClick={handleEditOpen}>
                <div className="w-24 h-24 bg-white rounded-full border-4 border-white/30 shadow-2xl overflow-hidden active:scale-95 transition-transform">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" /> : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone}`} className="w-full h-full object-cover" alt="avatar" />}
                </div>
                <div className="absolute bottom-0 right-0 bg-white text-[#FF6B00] p-1.5 rounded-full shadow-lg border border-gray-100"><Edit2 className="w-3.5 h-3.5" /></div>
            </div>
            <h1 className="text-white text-xl font-black italic uppercase tracking-tighter leading-tight mt-3">{user.name || `Member ${user.phone.slice(-4)}`}</h1>
            <p className="text-white/80 font-bold tracking-widest text-xs mt-1">{user.phone} • {user.gender || 'N/A'}</p>
        </div>
      </div>

      <div className="w-full flex flex-col gap-0">
        <div className="bg-white p-6 shadow-sm border-b border-gray-100">
          <h2 className="text-gray-800 font-black text-sm uppercase mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-[#FF6B00]" />Thông Tin Gói Tập</h2>
          <div className="space-y-4">
             {user.subscription ? (
                 <div className="bg-gradient-to-r from-orange-50 to-white p-4 rounded-2xl border border-orange-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-gray-800 text-lg">{user.subscription.name}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${user.subscription.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>{user.subscription.status}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                        <span>Hết hạn: {user.subscription.expireDate ? new Date(user.subscription.expireDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                        <span>{user.subscription.months} tháng</span>
                    </div>
                    {user.subscription.status === 'Active' && user.subscription.months >= 6 && (
                        <button onClick={handlePreserveRequest} className="mt-3 w-full bg-white border border-purple-200 text-purple-600 py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 active:scale-95 transition-transform"><PauseCircle className="w-3 h-3" /> Bảo Lưu Gói</button>
                    )}
                 </div>
             ) : (
                 <div className="text-center py-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 mb-2">Bạn chưa đăng ký gói tập nào</p>
                    <button onClick={() => setIsSelectorOpen(true)} className="bg-[#FF6B00] text-white px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-orange-200 active:scale-95 transition-all">Đăng ký ngay</button>
                 </div>
             )}
             <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setIsSelectorOpen(true)} className="bg-blue-50 text-blue-600 py-3 rounded-2xl text-[10px] font-black uppercase flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform hover:bg-blue-100"><PlusCircle className="w-5 h-5"/> Mua thêm gói</button>
                 <button onClick={() => navigate('/schedule')} className="bg-green-50 text-green-600 py-3 rounded-2xl text-[10px] font-black uppercase flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform hover:bg-green-100"><ClipboardList className="w-5 h-5"/> Lịch sử tập</button>
             </div>
          </div>
        </div>
        
        {user.ptSubscription && (
          <div className="bg-white p-6 shadow-sm border-b border-gray-100">
            <h2 className="text-gray-800 font-black text-sm uppercase mb-4 flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-500" />Huấn Luyện Viên (PT)</h2>
            <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 border border-white shadow-sm shrink-0"><img src={user.ptSubscription.image} className="w-full h-full object-cover" alt="pt" /></div>
                <div className="flex-1">
                    <p className="font-black text-gray-800 text-sm">{user.ptSubscription.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-bold text-blue-500 bg-white px-2 py-0.5 rounded-md">Còn {user.ptSubscription.sessionsRemaining}/{user.ptSubscription.totalSessions} buổi</span>
                    </div>
                </div>
            </div>
          </div>
        )}

        <div className="bg-white overflow-hidden shadow-sm border-b border-gray-100">
           <div className="p-4 border-b border-gray-50 bg-gray-50/50"><h2 className="text-gray-800 font-black text-sm uppercase flex items-center gap-2"><Settings className="w-5 h-5 text-gray-400" /> Cài đặt & Tài khoản</h2></div>
           <div className="divide-y divide-gray-50">
               <button onClick={() => setIsQrModalOpen(true)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center"><QrCode className="w-4 h-4"/></div>
                     <span className="text-sm font-bold text-gray-700">Mã Định Danh (QR)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
               </button>
               <button onClick={() => setActiveSetting('referral')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center"><Users className="w-4 h-4"/></div>
                     <span className="text-sm font-bold text-gray-700">Người giới thiệu</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-gray-400">{user.referredBy || 'Chưa có'}</span>
                     <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
               </button>
               <button onClick={() => setActiveSetting('password')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 bg-red-100 text-red-600 rounded-xl flex items-center justify-center"><Lock className="w-4 h-4"/></div>
                     <span className="text-sm font-bold text-gray-700">Đổi mật khẩu</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
               </button>
               <button onClick={() => setActiveSetting('face')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><ScanFace className="w-4 h-4"/></div>
                     <span className="text-sm font-bold text-gray-700">Đăng nhập Face ID</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${user.faceData ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{user.faceData ? 'BẬT' : 'TẮT'}</span>
               </button>
               <div className="w-full flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center"><Bell className="w-4 h-4"/></div>
                     <span className="text-sm font-bold text-gray-700">Thông báo Popup</span>
                  </div>
                  <button onClick={togglePopupNoti} className={`w-10 h-6 rounded-full p-1 transition-colors ${user.settings?.popupNotification ? 'bg-green-500' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${user.settings?.popupNotification ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </button>
               </div>
           </div>
        </div>

        <div className="p-4 bg-white">
            <button onClick={() => navigate('/')} className="w-full bg-white border-2 border-gray-100 text-gray-400 py-4 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"><LogOut className="w-4 h-4 rotate-180" />Thoát</button>
        </div>
      </div>

      <SubscriptionModal 
         isOpen={isSelectorOpen}
         onClose={() => setIsSelectorOpen(false)}
         packages={packages}
         onSelectPackage={(pkg) => {
             setSelectedPackage(pkg);
             setIsSelectorOpen(false);
         }}
      />

      <PaymentModal 
         isOpen={!!selectedPackage} 
         onClose={() => setSelectedPackage(null)} 
         type="gym"
         selectedPackageInit={selectedPackage}
         packages={packages} 
         vouchers={vouchers}
         userReferralDiscount={referralDiscount}
         userDiscountReason={discountReason}
         user={user}
         onConfirm={(data) => {
             onUpdateSubscription(data.packageName, data.months, data.price, data.method, data.voucherCode);
             setSelectedPackage(null);
         }}
      />

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-gray-800 uppercase italic">Chỉnh sửa hồ sơ</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-gray-50 rounded-full"><X className="w-5 h-5 text-gray-400"/></button>
             </div>
             <div className="space-y-4">
                <div className="flex justify-center"><div className="w-32 h-32"><ImageUpload currentImage={editAvatar} onImageUploaded={setEditAvatar} label="Ảnh đại diện" aspect="aspect-square" className="rounded-full overflow-hidden shadow-lg border-4 border-orange-50"/></div></div>
                <div><label className="text-xs font-bold text-gray-400 uppercase ml-1">Nickname</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-gray-50 rounded-xl py-3 px-4 text-sm font-bold mt-1 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"/></div>
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase ml-1">Giới tính</label>
                   <div className="flex gap-2 mt-1">
                      {(['Nam', 'Nữ', 'Khác'] as const).map(g => (
                         <button key={g} onClick={() => setEditGender(g)} className={`flex-1 py-2 rounded-lg font-bold text-sm border ${editGender === g ? 'bg-orange-50 border-[#FF6B00] text-[#FF6B00]' : 'border-gray-200 text-gray-400'}`}>{g}</button>
                      ))}
                   </div>
                </div>
                <button onClick={handleSaveProfile} className="w-full bg-[#FF6B00] text-white py-3 rounded-xl font-black uppercase shadow-lg shadow-orange-200 active:scale-95 transition-all mt-2">Lưu Thay Đổi</button>
             </div>
          </div>
        </div>
      )}

      {isQrModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsQrModalOpen(false)} />
           <div className="relative w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 flex flex-col items-center text-center overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF6B00] to-yellow-400"></div>
               <button onClick={() => setIsQrModalOpen(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X className="w-5 h-5 text-gray-500"/></button>
               
               <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-orange-100 mb-4 shadow-lg">
                   {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone}`} className="w-full h-full object-cover" />}
               </div>
               <h3 className="text-xl font-black text-gray-800 uppercase italic mb-1">{user.realName || user.name}</h3>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{user.phone}</p>
               
               <div className="bg-white p-4 rounded-3xl shadow-inner border border-gray-100 mb-4">
                   <div className="bg-white p-2">
                       <QRCode value={JSON.stringify(qrIdentityData)} size={200} viewBox={`0 0 256 256`} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                   </div>
               </div>
               
               {qrIdentityData.membership && (
                   <div className="w-full bg-gray-50 rounded-2xl p-3 text-left space-y-1 mb-2">
                       <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                           <span>Gói tập:</span>
                           <span className="text-gray-800">{qrIdentityData.membership.packageName}</span>
                       </div>
                       <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                           <span>Hết hạn:</span>
                           <span className="text-gray-800">{qrIdentityData.membership.expiryDate}</span>
                       </div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                           <span>Trạng thái:</span>
                           {qrIdentityData.membership.isPreserved ? (
                               <span className="text-purple-600 bg-purple-100 px-2 rounded">BẢO LƯU</span>
                           ) : qrIdentityData.membership.status === 'Active' ? (
                               <span className="text-green-600 bg-green-100 px-2 rounded">HOẠT ĐỘNG</span>
                           ) : (
                               <span className="text-red-500 bg-red-100 px-2 rounded">{qrIdentityData.membership.status}</span>
                           )}
                       </div>
                   </div>
               )}
               <p className="text-[10px] text-gray-400 font-medium">Đưa mã này cho nhân viên để check-in hoặc xác thực.</p>
           </div>
        </div>
      )}

      {activeSetting && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center px-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setActiveSetting(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-20 sm:zoom-in-95">
             <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
             
             {activeSetting === 'password' && (
                <>
                   <h3 className="text-lg font-black text-gray-800 uppercase italic mb-4">Đổi Mật Khẩu</h3>
                   <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Nhập mật khẩu mới..." className="w-full bg-gray-50 rounded-2xl px-4 py-4 text-sm font-bold outline-none border border-transparent focus:border-red-500 mb-4"/>
                   <button onClick={changePassword} className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-lg shadow-red-200 active:scale-95 transition-transform">Xác Nhận Đổi</button>
                </>
             )}

             {activeSetting === 'referral' && (
                <>
                   <h3 className="text-lg font-black text-gray-800 uppercase italic mb-2">Mã Giới Thiệu</h3>
                   <p className="text-xs text-gray-500 font-medium mb-4">Nhập SĐT người giới thiệu để cả 2 cùng nhận ưu đãi.</p>
                   {user.referredBy ? (
                       <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-100">
                          <p className="text-green-600 font-bold text-sm">Đã được giới thiệu bởi: {user.referredBy}</p>
                       </div>
                   ) : (
                       <>
                          <input type="tel" value={referralCodeInput} onChange={e => setReferralCodeInput(e.target.value)} placeholder="Số điện thoại..." className="w-full bg-gray-50 rounded-2xl px-4 py-4 text-sm font-bold outline-none border border-transparent focus:border-purple-500 mb-4"/>
                          <button onClick={applyReferralCode} className="w-full bg-purple-500 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-lg shadow-purple-200 active:scale-95 transition-transform">Áp Dụng</button>
                       </>
                   )}
                </>
             )}

             {activeSetting === 'face' && (
                <>
                   <h3 className="text-lg font-black text-gray-800 uppercase italic mb-4 text-center">Thiết Lập Face ID</h3>
                   {isFaceScanning ? (
                      <div className="relative w-full aspect-square bg-black rounded-[40px] overflow-hidden border-4 border-[#FF6B00] mb-4 shadow-2xl">
                         {/* Live Video */}
                         <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                         
                         {/* Biometric Simulation Overlay */}
                         <div className="absolute inset-0 z-10 pointer-events-none">
                             {/* Scanning Grid */}
                             <div className="absolute inset-0 opacity-30" style={{
                                backgroundImage: 'linear-gradient(#FF6B00 1px, transparent 1px), linear-gradient(90deg, #FF6B00 1px, transparent 1px)',
                                backgroundSize: '40px 40px'
                             }}></div>
                             
                             {/* Face Frame */}
                             <div className="absolute inset-8 border-2 border-white/50 rounded-[30%] opacity-80"></div>
                             
                             {/* Scanning Line Animation */}
                             <div className="absolute top-0 left-0 w-full h-1 bg-[#FF6B00] shadow-[0_0_15px_#FF6B00] animate-[scan_2s_linear_infinite]"></div>
                             
                             {/* Corner Brackets */}
                             <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-[#FF6B00] rounded-tl-xl"></div>
                             <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-[#FF6B00] rounded-tr-xl"></div>
                             <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-[#FF6B00] rounded-bl-xl"></div>
                             <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-[#FF6B00] rounded-br-xl"></div>
                         </div>
                         <style>{`@keyframes scan { 0% { top: 0; opacity: 0.5; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0.5; } }`}</style>
                      </div>
                   ) : (
                      <div className="bg-orange-50 p-6 rounded-3xl flex flex-col items-center justify-center mb-6 border-2 border-dashed border-orange-200">
                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-3">
                            <ScanFace className="w-8 h-8 text-orange-500"/>
                         </div>
                         <p className="text-sm font-black text-gray-800 mb-1">Trạng thái: {user.faceData ? <span className="text-green-600">Đã kích hoạt</span> : <span className="text-gray-400">Chưa cài đặt</span>}</p>
                         <p className="text-[10px] text-gray-500 text-center px-4">Hệ thống sẽ thu thập dữ liệu khuôn mặt để hỗ trợ đăng nhập nhanh.</p>
                      </div>
                   )}
                   
                   {isFaceScanning ? (
                       <div className="space-y-2 w-full">
                           <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">{scanStatus}</p>
                           <button onClick={captureFace} className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black uppercase text-sm shadow-lg shadow-orange-200 active:scale-95 transition-transform flex items-center justify-center gap-2">
                               <Camera className="w-5 h-5" /> Chụp & Lưu Dữ Liệu
                           </button>
                       </div>
                   ) : (
                       <button onClick={() => setIsFaceScanning(true)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-lg active:scale-95 transition-transform">
                           Bắt Đầu Quét Khuôn Mặt
                       </button>
                   )}
                </>
             )}
             
             <button onClick={() => setActiveSetting(null)} className="w-full mt-4 text-gray-400 font-bold text-xs uppercase py-2">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
