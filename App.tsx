
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import PWAPrompt from './components/PWAPrompt';
import GlobalNotification from './components/GlobalNotification'; 
import { dbService } from './services/firebase';

// Interfaces (Keep them for Admin Dashboard usage)
export interface Category {
  id: 'gym' | 'groupx';
  name: string;
}

export interface PackageItem {
  id: string;
  categoryId: 'gym' | 'groupx';
  name: string;
  price: number;
  originalPrice?: number;
  bonusDays?: number;
  image: string;
  description?: string;
  duration: number;
}

export interface PTPackage {
  id: string;
  name: string;
  price: number;
  sessions: number; 
  image: string;
  description?: string;
}

export interface RevenueTransaction {
  id: string;
  userId: string;
  userName: string;
  packageName: string;
  amount: number;
  date: number;
  type: 'Gym' | 'PT';
  method: 'Cash' | 'Transfer';
}

export interface Subscription {
  name: string;
  months: number;
  expireDate: number | null;
  startDate: number;
  price: number;
  paidAmount: number; 
  paymentMethod?: 'Cash' | 'Transfer';
  voucherCode?: string | null;
  status: 'Pending' | 'Active' | 'Expired' | 'Rejected' | 'Pending Preservation' | 'Preserved';
  packageImage?: string;
  bonusDays?: number;
}

export interface PTSubscription {
  packageId: string;
  name: string;
  price: number;
  paidAmount: number; 
  totalSessions: number;
  sessionsRemaining: number;
  image: string;
  status: 'Pending' | 'Active' | 'Finished';
  startDate?: number;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  trainerId: string;
  trainerName: string;
  date: string; 
  timeSlot: string; 
  status: 'Pending' | 'Approved' | 'Completed' | 'Rejected';
  rating?: number;
  comment?: string;
  media?: string[]; 
  timestamp: number;
}

export interface Notification {
  id: string;
  text: string;
  date: number;
  read: boolean;
  type?: 'system' | 'admin_msg' | 'approval' | 'booking';
}

export interface ChatMessage {
  sender: 'user' | 'admin';
  text: string;
  timestamp: number;
}

export interface UserProfile {
  phone: string;
  password?: string;
  faceData?: string | null;
  loginMethod?: 'password' | 'face';
  gender?: 'Nam' | 'Nữ' | 'Khác'; 
  
  realName?: string; 
  name?: string; 
  email?: string; 
  address?: string; 
  securityQuestion?: string; 
  securityAnswer?: string; 
  
  avatar: string | null;
  subscription: Subscription | null;
  ptSubscription?: PTSubscription | null;
  isLocked: boolean;
  notifications: Notification[];
  messages: ChatMessage[]; 
  trainingDays: string[];
  savedVouchers: string[]; 
  
  accountStatus?: 'Active'; 

  referredBy?: string;
  referralBonusAvailable?: boolean;
  hasUsedReferralDiscount?: boolean;
  
  settings?: {
    popupNotification: boolean;
  };
}

export type AdminPermission = 
  | 'view_users' | 'approve_users' | 'view_revenue' | 'view_revenue_details'
  | 'send_notification' | 'edit_user_settings' | 'manage_user' | 'chat_user'
  | 'manage_packages' | 'manage_pt_packages' | 'add_pt' | 'view_user_list'
  | 'manage_promo' | 'manage_voucher' | 'view_schedule' | 'manage_app_interface' | 'manage_bookings'
  | 'create_qr'; 

export interface AdminProfile {
  username: string;
  password?: string; 
  phone?: string; 
  avatar?: string; 
  faceData?: string; 
  role: 'super_admin' | 'sub_admin';
  name: string;
  permissions: AdminPermission[];
  settings: {
    showFloatingMenu: boolean;
    showPopupNoti: boolean;
  };
}

export interface Promotion {
  id: string;
  title: string;
  image: string;
  date: number;
}

export interface VoucherItem {
  id: string;
  title: string;
  code: string;
  type: 'Gym' | 'PT' | 'Gift';
  value: number; 
  color: string;
  image?: string; 
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
}

export interface TrainingProgram {
  id: string;
  title: string;
  duration: string;
  image: string;
}

const AppContent: React.FC = () => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<RevenueTransaction[]>([]);
  
  // Admin State
  const [currentAdmin, setCurrentAdmin] = useState<AdminProfile | null>(null);
  const [admins, setAdmins] = useState<AdminProfile[]>([]);

  // App Settings State (Admin config)
  const [appLogo, setAppLogo] = useState<string>('https://phukienlimousine.vn/wp-content/uploads/2025/12/LOGO_SIP_GYM_pages-to-jpg-0001-removebg-preview.png');
  const [heroImage, setHeroImage] = useState<string>('https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600');
  const [heroVideo, setHeroVideo] = useState<string>(''); 
  const [heroMediaType, setHeroMediaType] = useState<'image' | 'video'>('image');
  const [heroTitle, setHeroTitle] = useState<string>('CÂU LẠC\nBỘ\nGYM');
  const [heroSubtitle, setHeroSubtitle] = useState<string>('GYM CHO MỌI NGƯỜI');
  const [heroOverlayText, setHeroOverlayText] = useState<string>('THAY ĐỔI BẢN THÂN');
  const [heroOverlaySub, setHeroOverlaySub] = useState<string>('Tại Sip Gym Nhà Bè');

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  
  const [packages, setPackages] = useState<PackageItem[]>([
    { id: '1m', categoryId: 'gym', name: '1 Tháng', price: 500000, originalPrice: 600000, duration: 1, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300', description: 'Tập gym không giới hạn 1 tháng.', bonusDays: 0 },
    { id: '3m', categoryId: 'gym', name: '3 Tháng', price: 1350000, originalPrice: 1500000, duration: 3, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=300', description: 'Tiết kiệm 10%.', bonusDays: 5 },
    { id: '6m', categoryId: 'gym', name: '6 Tháng', price: 2500000, originalPrice: 3000000, duration: 6, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=300', description: 'Tặng thêm 15 ngày.', bonusDays: 15 },
    { id: 'yoga', categoryId: 'groupx', name: 'Yoga', price: 600000, duration: 1, image: 'https://images.unsplash.com/photo-1544367563-12123d8959bd?auto=format&fit=crop&q=80&w=300', description: 'Lớp Yoga thư giãn.', bonusDays: 0 },
  ]);

  const [ptPackages, setPTPackages] = useState<PTPackage[]>([
     { id: 'pt1', name: 'PT 1 Kèm 1 (12 Buổi)', price: 3600000, sessions: 12, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=300', description: 'HLV kèm 1-1, lên thực đơn dinh dưỡng.' },
     { id: 'pt2', name: 'PT 1 Kèm 1 (24 Buổi)', price: 6500000, sessions: 24, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=300', description: 'Cam kết thay đổi hình thể.' }
  ]);

  const [isLoading, setIsLoading] = useState(true); 
  const [popupNotification, setPopupNotification] = useState<{title: string, msg: string} | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    dbService.subscribe('admins', (data: any) => {
        let adminList: AdminProfile[] = [];
        if (data) {
            adminList = Array.isArray(data) ? data : Object.values(data);
        }
        if (adminList.length === 0) {
            const defaultAdmin: AdminProfile = {
                username: 'admin',
                password: '123456',
                phone: '0909000000',
                role: 'super_admin',
                name: 'Super Admin',
                permissions: [], 
                settings: { showFloatingMenu: true, showPopupNoti: true }
            };
            adminList = [defaultAdmin];
            dbService.saveAll('admins', adminList);
        }
        
        setAdmins(adminList);

        const sessionStr = localStorage.getItem('admin_session');
        if (sessionStr) {
            const session = JSON.parse(sessionStr);
            const updatedMe = adminList.find(a => a.username === session.username);
            if (updatedMe) {
                setCurrentAdmin(updatedMe);
                localStorage.setItem('admin_session', JSON.stringify(updatedMe));
            }
        }
    });
  }, []);

  const syncAdmins = (newAdmins: AdminProfile[]) => {
    setAdmins(newAdmins);
    dbService.saveAll('admins', newAdmins); 
    if (currentAdmin) {
      const updatedMe = newAdmins.find(a => a.username === currentAdmin.username);
      if (updatedMe) {
          setCurrentAdmin(updatedMe);
          localStorage.setItem('admin_session', JSON.stringify(updatedMe));
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { setIsLoading(false); }, 1500);

    dbService.subscribe('users', (data: any) => {
      const rawList = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      const sanitizedUsers: UserProfile[] = rawList.map((u: any) => ({
        ...u,
        notifications: Array.isArray(u.notifications) ? u.notifications : (u.notifications ? Object.values(u.notifications) : []),
        messages: Array.isArray(u.messages) ? u.messages : (u.messages ? Object.values(u.messages) : []),
        trainingDays: Array.isArray(u.trainingDays) ? u.trainingDays : (u.trainingDays ? Object.values(u.trainingDays) : []),
        savedVouchers: Array.isArray(u.savedVouchers) ? u.savedVouchers : [],
        settings: u.settings || { popupNotification: true },
        accountStatus: 'Active' 
      }));
      setAllUsers(sanitizedUsers);
      setIsLoading(false);
    });

    dbService.subscribe('transactions', (data: any) => {
        let raw = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
        setTransactions(raw as RevenueTransaction[]);
    });

    dbService.subscribe('bookings', (data: any) => {
       let rawBookings = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
       setBookings(rawBookings as Booking[]);
    });

    dbService.subscribe('app_settings', (data: any) => {
        if (data) {
            if (data.appLogo) setAppLogo(data.appLogo);
            if (data.heroImage) setHeroImage(data.heroImage);
            if (data.heroVideo) setHeroVideo(data.heroVideo);
            if (data.heroMediaType) setHeroMediaType(data.heroMediaType); 
            if (data.heroTitle) setHeroTitle(data.heroTitle);
            if (data.heroSubtitle) setHeroSubtitle(data.heroSubtitle);
            if (data.heroOverlayText) setHeroOverlayText(data.heroOverlayText);
            if (data.heroOverlaySub) setHeroOverlaySub(data.heroOverlaySub);
        }
    });

    dbService.subscribe('promos', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (data) setPromotions(list as Promotion[]);
    });

    dbService.subscribe('vouchers', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (data) setVouchers(list as VoucherItem[]);
    });

    dbService.subscribe('trainers', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (data) setTrainers(list as Trainer[]);
    });

    dbService.subscribe('packages', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (data) setPackages(list as PackageItem[]);
    });

    dbService.subscribe('pt_packages', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (data) setPTPackages(list as PTPackage[]);
    });

    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
       const savedAdmin = JSON.parse(adminSession);
       setCurrentAdmin(savedAdmin);
    }
    return () => clearTimeout(timer);
  }, [allUsers.length]); 

  const syncDB = (newUsers: UserProfile[]) => {
    setAllUsers(newUsers); 
    dbService.saveAll('users', newUsers);
  };

  const syncTransactions = (newTrans: RevenueTransaction[]) => {
      setTransactions(newTrans);
      dbService.saveAll('transactions', newTrans);
  };

  const syncBookings = (newBookings: Booking[]) => {
      setBookings(newBookings);
      dbService.saveAll('bookings', newBookings);
  };
  
  const syncAppConfig = (config: { appLogo: string, heroImage: string, heroVideo?: string, heroMediaType: 'image'|'video', heroTitle: string, heroSubtitle: string, heroOverlayText?: string, heroOverlaySub?: string }) => {
      setAppLogo(config.appLogo);
      setHeroImage(config.heroImage);
      if(config.heroVideo) setHeroVideo(config.heroVideo);
      setHeroMediaType(config.heroMediaType);
      setHeroTitle(config.heroTitle);
      setHeroSubtitle(config.heroSubtitle);
      if(config.heroOverlayText) setHeroOverlayText(config.heroOverlayText);
      if(config.heroOverlaySub) setHeroOverlaySub(config.heroOverlaySub);
      dbService.saveAll('app_settings', config);
  };
  
  const syncVouchers = (newVouchers: VoucherItem[]) => { setVouchers(newVouchers); dbService.saveAll('vouchers', newVouchers); };
  const syncPromos = (newPromos: Promotion[]) => { setPromotions(newPromos); dbService.saveAll('promos', newPromos); };
  const syncTrainers = (newTrainers: Trainer[]) => { setTrainers(newTrainers); dbService.saveAll('trainers', newTrainers); };
  const syncPackages = (newPackages: PackageItem[]) => { setPackages(newPackages); dbService.saveAll('packages', newPackages); };
  const syncPTPackages = (newPTPackages: PTPackage[]) => { setPTPackages(newPTPackages); dbService.saveAll('pt_packages', newPTPackages); };

  const handleAdminLoginSuccess = (admin: AdminProfile) => {
    setCurrentAdmin(admin);
    localStorage.setItem('admin_session', JSON.stringify(admin));
  };

  if (isLoading && dbService.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden w-full">
      <PWAPrompt />
      {popupNotification && (
          <GlobalNotification 
             title={popupNotification.title} 
             message={popupNotification.msg} 
             onClose={() => setPopupNotification(null)} 
          />
      )}
      
      <div className="flex-1 overflow-y-auto no-scrollbar w-full bg-[#FFF7ED]">
        <Routes>
          {/* Default Route goes to Admin Login */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminDashboard 
                currentAdmin={currentAdmin}
                admins={admins}
                setAdmins={syncAdmins}
                allUsers={allUsers} 
                setAllUsers={syncDB} 
                promotions={promotions} 
                setPromos={syncPromos}
                vouchers={vouchers}
                setVouchers={syncVouchers}
                trainers={trainers} 
                setTrainers={syncTrainers}
                packages={packages}
                setPackages={syncPackages}
                programs={programs} 
                setPrograms={(p) => {}}
                ptPackages={ptPackages}
                setPTPackages={syncPTPackages}
                heroImage={heroImage}
                heroTitle={heroTitle}
                heroSubtitle={heroSubtitle}
                heroOverlayText={heroOverlayText}
                heroOverlaySub={heroOverlaySub}
                onUpdateAppConfig={syncAppConfig}
                bookings={bookings}
                onUpdateBookings={syncBookings}
                onLogout={() => {
                  setCurrentAdmin(null);
                  localStorage.removeItem('admin_session');
                  navigate('/admin');
                }}
              />
            } 
          />
          <Route 
             path="/admin" 
             element={<AdminLogin admins={admins} onLoginSuccess={handleAdminLoginSuccess} />} 
          />
          {/* Catch all other routes and redirect to Admin */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
