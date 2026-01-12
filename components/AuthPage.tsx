
import React, { useState } from 'react';
import { Eye, EyeOff, User, Smartphone, MapPin, Lock, Mail, ShieldQuestion, ArrowRight } from 'lucide-react';
import { UserProfile } from '../App';

interface AuthPageProps {
  allUsers: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
  onUpdateUsers: (users: UserProfile[]) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ allUsers, onLoginSuccess, onUpdateUsers }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Phone or Email
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  
  // Register State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regSecurityQ, setRegSecurityQ] = useState('Tên trường tiểu học của bạn?');
  const [regSecurityA, setRegSecurityA] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  // Forgot Pass
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSecurityA, setForgotSecurityA] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [targetUserForReset, setTargetUserForReset] = useState<UserProfile | null>(null);

  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Find user by Phone OR Email
    const user = allUsers.find(u => u.phone === loginIdentifier || u.email === loginIdentifier);
    
    if (!user) {
        setError("Tài khoản không tồn tại.");
        return;
    }
    
    if (user.password !== loginPass) {
        setError("Mật khẩu không đúng.");
        return;
    }
    
    onLoginSuccess(user);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regName || !regPhone || !regPass) {
        setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
        return;
    }

    if (allUsers.find(u => u.phone === regPhone)) {
        setError("Số điện thoại đã được đăng ký.");
        return;
    }
    
    if (regEmail && allUsers.find(u => u.email === regEmail)) {
        setError("Email đã được sử dụng.");
        return;
    }

    // Direct registration without blocking window.confirm for better UX on mobile PWA context
    const newUser: UserProfile = {
        phone: regPhone,
        password: regPass,
        realName: regName,
        name: regName,
        email: regEmail,
        address: regAddress,
        securityQuestion: regSecurityQ,
        securityAnswer: regSecurityA,
        avatar: null,
        subscription: null,
        isLocked: false,
        notifications: [],
        messages: [],
        trainingDays: [],
        savedVouchers: [],
        accountStatus: 'Active',
        settings: { popupNotification: true }
    };
    
    const updatedUsers = [...allUsers, newUser];
    onUpdateUsers(updatedUsers);
    // Important: Immediately login
    setTimeout(() => {
        alert("Đăng ký thành công!");
        onLoginSuccess(newUser);
    }, 100);
  };

  const handleForgotCheck = () => {
      const user = allUsers.find(u => u.phone === forgotIdentifier || u.email === forgotIdentifier);
      if (user) {
          setTargetUserForReset(user);
          setError('');
      } else {
          setError("Không tìm thấy tài khoản.");
          setTargetUserForReset(null);
      }
  };

  const handleResetPass = () => {
      if (!targetUserForReset) return;
      if (targetUserForReset.securityAnswer !== forgotSecurityA) {
          setError("Câu trả lời bảo mật không đúng.");
          return;
      }
      
      const updatedUsers = allUsers.map(u => u.phone === targetUserForReset.phone ? { ...u, password: newPass } : u);
      onUpdateUsers(updatedUsers);
      alert("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
      setMode('login');
      setTargetUserForReset(null);
      setForgotIdentifier('');
      setForgotSecurityA('');
      setNewPass('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
       {/* Background Decor */}
       <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-60"></div>
       <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-60"></div>

       <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
             <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-white">
                <img src="https://phukienlimousine.vn/wp-content/uploads/2025/12/LOGO_SIP_GYM_pages-to-jpg-0001-removebg-preview.png" className="w-full h-full object-contain p-2" />
             </div>
             <h1 className="text-3xl font-black text-gray-800 uppercase italic">Sip Gym Nhà Bè</h1>
             <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Câu lạc bộ thể hình chuyên nghiệp</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white">
             {/* Header Tabs */}
             {mode !== 'forgot' && (
                 <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
                    <button onClick={() => setMode('login')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${mode === 'login' ? 'bg-white shadow-md text-[#FF6B00]' : 'text-gray-400'}`}>Đăng Nhập</button>
                    <button onClick={() => setMode('register')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${mode === 'register' ? 'bg-white shadow-md text-[#FF6B00]' : 'text-gray-400'}`}>Đăng Ký</button>
                 </div>
             )}

             {/* LOGIN FORM */}
             {mode === 'login' && (
                 <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)} placeholder="Số điện thoại hoặc Email" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-200" />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type={showLoginPass ? "text" : "password"} value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Mật khẩu" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-12 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-200" />
                        <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {showLoginPass ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                        </button>
                    </div>
                    <div className="flex justify-end">
                       <button type="button" onClick={() => setMode('forgot')} className="text-xs font-bold text-gray-400 hover:text-orange-500">Quên mật khẩu?</button>
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{error}</p>}
                    <button type="submit" className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black uppercase shadow-lg shadow-orange-200 active:scale-95 transition-transform">Đăng Nhập Ngay</button>
                 </form>
             )}

             {/* REGISTER FORM */}
             {mode === 'register' && (
                 <form onSubmit={handleRegister} className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                    <div className="grid grid-cols-1 gap-3">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Họ và tên" className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-orange-200" required />
                        </div>
                        <div className="relative">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="Số điện thoại (ID)" className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-orange-200" required />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Email" className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-orange-200" />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input value={regAddress} onChange={e => setRegAddress(e.target.value)} placeholder="Địa chỉ" className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-orange-200" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type={showRegPass ? "text" : "password"} value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Mật khẩu" className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-10 text-xs font-bold outline-none focus:ring-1 focus:ring-orange-200" required />
                            <button type="button" onClick={() => setShowRegPass(!showRegPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showRegPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                            </button>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Câu hỏi bảo mật (dùng khi quên MK)</p>
                            <select value={regSecurityQ} onChange={e => setRegSecurityQ(e.target.value)} className="w-full bg-white border-none rounded-lg p-2 text-xs font-bold mb-2">
                                <option>Tên trường tiểu học của bạn?</option>
                                <option>Tên thú cưng đầu tiên?</option>
                                <option>Món ăn yêu thích nhất?</option>
                            </select>
                            <div className="relative">
                                <ShieldQuestion className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input value={regSecurityA} onChange={e => setRegSecurityA(e.target.value)} placeholder="Câu trả lời" className="w-full bg-white border-none rounded-lg py-2 pl-9 pr-2 text-xs font-bold" required />
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{error}</p>}
                    <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase shadow-lg active:scale-95 transition-transform mt-4">Đăng Ký Thành Viên</button>
                 </form>
             )}

             {/* FORGOT PASSWORD */}
             {mode === 'forgot' && (
                 <div className="space-y-4">
                     <h3 className="text-center font-black text-xl uppercase italic text-gray-800">Khôi Phục Mật Khẩu</h3>
                     {!targetUserForReset ? (
                         <>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input value={forgotIdentifier} onChange={e => setForgotIdentifier(e.target.value)} placeholder="Nhập SĐT hoặc Email" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-200" />
                            </div>
                            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                            <button onClick={handleForgotCheck} className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black uppercase shadow-lg active:scale-95 transition-transform">Tiếp Tục</button>
                         </>
                     ) : (
                         <>
                            <p className="text-center text-xs font-bold text-gray-500">Câu hỏi: {targetUserForReset.securityQuestion}</p>
                            <div className="relative">
                                <ShieldQuestion className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input value={forgotSecurityA} onChange={e => setForgotSecurityA(e.target.value)} placeholder="Nhập câu trả lời" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-200" />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type={showNewPass ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Mật khẩu mới" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-12 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-200" />
                                <button onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showNewPass ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button>
                            </div>
                            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                            <button onClick={handleResetPass} className="w-full bg-green-500 text-white py-4 rounded-2xl font-black uppercase shadow-lg active:scale-95 transition-transform">Đặt Lại Mật Khẩu</button>
                         </>
                     )}
                     <button onClick={() => { setMode('login'); setTargetUserForReset(null); setError(''); }} className="w-full text-center text-gray-400 font-bold text-xs uppercase">Quay lại đăng nhập</button>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default AuthPage;
