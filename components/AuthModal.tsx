
import React, { useState, useRef, useEffect } from 'react';
import { X, Smartphone, Lock, ScanFace, CheckCircle2, AlertCircle, Camera, User, Mail, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { UserProfile } from '../App';
import { faceService } from '../services/faceService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
  onRegister: (phone: string, gender: 'Nam' | 'Nữ' | 'Khác') => void;
  onResetPassword?: (phone: string, newPass: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, allUsers, onLoginSuccess, onRegister, onResetPassword }) => {
  const [step, setStep] = useState<'phone' | 'register_details' | 'password' | 'face' | 'forgot_password' | 'reset_new_pass'>('phone');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [error, setError] = useState('');
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [isScanning, setIsScanning] = useState(false); 
  const [scanStatus, setScanStatus] = useState('Đang khởi tạo AI...');
  
  // Forgot Password States
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const stopCamera = () => {
     if (streamRef.current) {
       streamRef.current.getTracks().forEach(t => t.stop());
       streamRef.current = null;
     }
     if (videoRef.current) {
       videoRef.current.srcObject = null;
     }
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  // Preload AI models when modal opens
  useEffect(() => {
      if (isOpen) {
          faceService.loadModels().then(() => {
              console.log("AI Ready for Login");
          });
      }
  }, [isOpen]);

  useEffect(() => {
    let mounted = true;
    const initCamera = async () => {
      if (isCameraActive && step === 'face') {
        try {
          if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
          if (!mounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
          setScanStatus("Sẵn sàng quét...");
        } catch (err: any) {
          console.error("Camera Error:", err);
          if (mounted) {
             setError("Không thể truy cập camera. Vui lòng cấp quyền hoặc dùng mật khẩu.");
             setIsCameraActive(false);
          }
        }
      } else {
        stopCamera();
      }
    };
    initCamera();
    return () => { mounted = false; stopCamera(); };
  }, [isCameraActive, step]);

  if (!isOpen) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Số điện thoại không hợp lệ');
      return;
    }
    const user = allUsers.find(u => u.phone === phone);
    if (!user) {
       setStep('register_details'); // Move to registration details
    } else {
       setTargetUser(user);
       if (!user.password) {
         onLoginSuccess(user);
       } else {
         if (user.loginMethod === 'face' && user.faceData) {
            setStep('face');
            setIsCameraActive(true);
         } else {
            setStep('password');
         }
       }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(phone, gender);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetUser && targetUser.password === password) {
       onLoginSuccess(targetUser);
    } else {
       setError('Mật khẩu không đúng!');
    }
  };
  
  // ... (Forgot password handlers remain same)
  const handleForgotRequest = (e: React.FormEvent) => {
     e.preventDefault();
     if (!resetEmail.includes('@')) { setError("Email không hợp lệ"); return; }
     alert(`Mã xác nhận đã được gửi đến ${resetEmail} (Mã giả lập: 123456)`);
     setStep('reset_new_pass');
  };
  
  const handleResetConfirm = (e: React.FormEvent) => {
     e.preventDefault();
     if (resetCode !== '123456') { setError("Mã xác nhận không đúng (Dùng 123456)"); return; }
     if (newPassword.length < 6) { setError("Mật khẩu phải từ 6 ký tự"); return; }
     if (targetUser && onResetPassword) {
         onResetPassword(targetUser.phone, newPassword);
         alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
         setStep('password'); setPassword('');
     }
  };

  const verifyFace = async () => {
    if (!videoRef.current || !targetUser?.faceData) return;
    
    setIsScanning(true);
    setScanStatus("Đang phân tích khuôn mặt...");
    setError("");

    try {
        // Thực hiện so sánh AI thật sự
        const result = await faceService.compareFaces(videoRef.current, targetUser.faceData);
        
        console.log("Kết quả so sánh AI:", result);

        if (result.match) {
            setScanStatus(`Chính xác! (Độ khớp: ${Math.round((1 - result.distance) * 100)}%)`);
            // Delay slighty to show success message
            setTimeout(() => {
                stopCamera();
                setIsCameraActive(false);
                setIsScanning(false);
                onLoginSuccess(targetUser);
            }, 1000);
        } else {
            setScanStatus("Không khớp!");
            setError("Khuôn mặt không khớp với dữ liệu đã đăng ký.");
            setIsScanning(false);
        }
    } catch (err: any) {
        console.error(err);
        setScanStatus("Lỗi");
        setError(err.message || "Không thể nhận diện. Hãy thử lại nơi đủ sáng.");
        setIsScanning(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setIsCameraActive(false);
    setIsScanning(false);
    setStep('phone');
    setPhone('');
    setPassword('');
    setGender('Nam');
    setError('');
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setShowPassword(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full max-w-[400px] bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={handleClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-6 h-6 text-gray-400" />
        </button>

        {step === 'phone' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-[#FF6B00]" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-center text-gray-800 mb-2">Đăng Nhập</h2>
            <p className="text-gray-500 text-center text-sm mb-6 px-4">Nhập số điện thoại để tiếp tục</p>
            
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
               <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(''); }}
                  placeholder="Số điện thoại..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 text-lg font-bold tracking-widest focus:ring-2 focus:ring-[#FF6B00] outline-none"
                />
                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                <button type="submit" className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-orange-200 uppercase">Tiếp Tục</button>
            </form>
          </>
        )}

        {/* ... (Register details step remains same) ... */}
        {step === 'register_details' && (
           <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-center text-gray-800 mb-2">Thông Tin Bổ Sung</h2>
            <p className="text-gray-500 text-center text-sm mb-6">Vui lòng chọn giới tính của bạn</p>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
               <div className="grid grid-cols-3 gap-3">
                  {(['Nam', 'Nữ', 'Khác'] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-3 rounded-xl font-bold border-2 transition-all ${gender === g ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00]' : 'border-gray-100 text-gray-400'}`}
                    >
                      {g}
                    </button>
                  ))}
               </div>
               <button type="submit" className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-orange-200 uppercase">Hoàn Tất Đăng Ký</button>
            </form>
           </>
        )}

        {/* ... (Password step remains same) ... */}
        {step === 'password' && (
           <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-2xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-[#FF6B00]" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-center text-gray-800 mb-2">Nhập Mật Khẩu</h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-6">
               <div className="relative">
                 <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="******"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 text-lg font-bold text-center tracking-widest focus:ring-2 focus:ring-[#FF6B00] outline-none"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF6B00]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                  </button>
               </div>
                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                <button type="submit" className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-orange-200 uppercase">Đăng Nhập</button>
                
                <div className="flex justify-between items-center mt-4 px-1">
                    {targetUser?.faceData && (
                       <button type="button" onClick={() => { setStep('face'); setIsCameraActive(true); }} className="text-gray-400 font-bold text-xs uppercase hover:text-[#FF6B00]">Dùng Face ID</button>
                    )}
                    <button type="button" onClick={() => { setStep('forgot_password'); setError(''); }} className="text-gray-400 font-bold text-xs uppercase hover:text-[#FF6B00] ml-auto">Quên mật khẩu?</button>
                </div>
            </form>
           </>
        )}
        
        {/* ... (Forgot Password steps) ... */}
        {step === 'forgot_password' && (
            <>
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                        <Mail className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
                <h2 className="text-xl font-black text-center text-gray-800 mb-2">Quên Mật Khẩu</h2>
                <p className="text-gray-500 text-center text-xs mb-6 px-4">Nhập Email để nhận mã xác thực lấy lại mật khẩu.</p>
                <form onSubmit={handleForgotRequest} className="space-y-4">
                    <input 
                       type="email"
                       value={resetEmail}
                       onChange={e => setResetEmail(e.target.value)}
                       placeholder="Email của bạn..."
                       className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                    <button type="submit" className="w-full bg-purple-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-purple-200 uppercase">Gửi Mã Xác Nhận</button>
                </form>
                <button onClick={() => setStep('password')} className="w-full mt-4 text-gray-400 font-bold text-xs uppercase">Quay lại</button>
            </>
        )}
        
        {step === 'reset_new_pass' && (
            <>
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <h2 className="text-xl font-black text-center text-gray-800 mb-2">Đặt Lại Mật Khẩu</h2>
                
                <form onSubmit={handleResetConfirm} className="space-y-4">
                    <input 
                       type="text"
                       value={resetCode}
                       onChange={e => setResetCode(e.target.value)}
                       placeholder="Mã xác nhận (VD: 123456)"
                       className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 text-center text-lg font-black tracking-widest focus:ring-2 focus:ring-green-200 outline-none"
                    />
                    <div className="relative">
                        <input 
                           type={showPassword ? "text" : "password"}
                           value={newPassword}
                           onChange={e => setNewPassword(e.target.value)}
                           placeholder="Mật khẩu mới"
                           className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-green-200 outline-none"
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                    <button type="submit" className="w-full bg-green-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-200 uppercase">Đổi Mật Khẩu</button>
                </form>
            </>
        )}

        {/* --- FACE ID STEP UPDATED --- */}
        {step === 'face' && (
           <>
             <h2 className="text-xl font-black text-center text-gray-800 mb-4">Quét Khuôn Mặt</h2>
             <div className="relative w-full aspect-square bg-black rounded-[40px] overflow-hidden mb-4 border-4 border-[#FF6B00] shadow-2xl">
                <video 
                   ref={videoRef} 
                   autoPlay 
                   playsInline 
                   muted
                   className={`w-full h-full object-cover transform scale-x-[-1] ${isCameraActive ? 'opacity-100' : 'opacity-0'}`} 
                />
                
                {/* Biometric Scanning Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                   {/* Grid */}
                   <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: 'linear-gradient(#FF6B00 1px, transparent 1px), linear-gradient(90deg, #FF6B00 1px, transparent 1px)',
                      backgroundSize: '40px 40px'
                   }}></div>
                   
                   {/* Scanning Bar */}
                   {isScanning && (
                       <div className="absolute top-0 left-0 w-full h-2 bg-[#FF6B00] shadow-[0_0_20px_#FF6B00] animate-[scan_1.5s_linear_infinite]"></div>
                   )}
                   
                   {/* Center Focus Area */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-white/40 rounded-[35%]"></div>
                   
                   {/* Tech Decor Corners */}
                   <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-[#FF6B00]"></div>
                   <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-[#FF6B00]"></div>
                   <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-[#FF6B00]"></div>
                   <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-[#FF6B00]"></div>
                </div>
             </div>
             
             {error ? (
                <div className="text-center">
                   <p className="text-red-500 text-xs font-bold mb-3">{error}</p>
                   <div className="flex gap-2 justify-center">
                     <button onClick={() => { setError(''); setIsCameraActive(true); }} className="bg-[#FF6B00] text-white px-4 py-2 rounded-xl font-bold text-xs uppercase">Thử Lại</button>
                     <button onClick={() => { stopCamera(); setIsCameraActive(false); setStep('password'); }} className="bg-gray-200 text-gray-600 px-4 py-2 rounded-xl font-bold text-xs uppercase">Dùng Mật Khẩu</button>
                   </div>
                </div>
             ) : (
                <div className="w-full space-y-2">
                    <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{scanStatus}</p>
                    <button 
                      onClick={verifyFace} 
                      disabled={isScanning}
                      className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       {isScanning ? <span className="animate-pulse">Đang AI Phân Tích...</span> : <><ScanFace className="w-6 h-6" /> Quét Ngay</>}
                    </button>
                </div>
             )}
           </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
