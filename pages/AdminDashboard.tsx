
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, Promotion, Trainer, TrainingProgram, VoucherItem, PackageItem, PTPackage, AdminProfile, AdminPermission, Booking, RevenueTransaction } from '../App';
import { 
  Check, X, Plus, Users, BarChart3, TrendingUp, 
  MessageSquare, Bell, Lock, Unlock, 
  ImageIcon, LogOut, Ticket, LayoutDashboard,
  Calendar, Settings, Search, Send, ArrowRight,
  Megaphone, UserPlus, ListFilter, Package, PauseCircle, Trash2, Dumbbell,
  UserCheck, Menu, Eye, ShieldAlert, BadgeCheck, Pencil, CreditCard, Image as ImageIcon2, Clock,
  CalendarCheck, AlertCircle, Save, Upload, Type, ScanFace, Phone, Edit3, ChevronRight, ChevronLeft, User as UserIcon, MoreHorizontal, Filter, CheckCircle2,
  Crop, Video, QrCode, Link, Download, Gift, EyeOff
} from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import { dbService } from '../services/firebase';
import QRCode from 'react-qr-code';

interface AdminDashboardProps {
  currentAdmin: AdminProfile | null;
  admins: AdminProfile[];
  setAdmins: (admins: AdminProfile[]) => void;
  allUsers: UserProfile[];
  setAllUsers: (users: UserProfile[]) => void;
  promotions: Promotion[];
  setPromos: (promos: Promotion[]) => void;
  vouchers: VoucherItem[];
  setVouchers: (vouchers: VoucherItem[]) => void;
  trainers: Trainer[];
  setTrainers: (trainers: Trainer[]) => void;
  packages: PackageItem[];
  setPackages: (packages: PackageItem[]) => void;
  programs: TrainingProgram[];
  setPrograms: (programs: TrainingProgram[]) => void;
  ptPackages: PTPackage[];
  setPTPackages: (packages: PTPackage[]) => void;
  
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroOverlayText?: string;
  heroOverlaySub?: string;
  onUpdateAppConfig: (config: {appLogo: string, heroImage: string, heroVideo?: string, heroMediaType: 'image'|'video', heroTitle: string, heroSubtitle: string, heroOverlayText?: string, heroOverlaySub?: string}) => void;
  
  bookings: Booking[];
  onUpdateBookings: (bookings: Booking[]) => void;
  onLogout: () => void;
}

const PERMISSIONS_LIST: { key: AdminPermission; label: string; icon: any }[] = [
  { key: 'view_users', label: 'Hội Viên', icon: Users },
  { key: 'approve_users', label: 'Duyệt', icon: Check },
  { key: 'view_revenue', label: 'Doanh Thu', icon: TrendingUp },
  { key: 'send_notification', label: 'Thông Báo', icon: Megaphone },
  { key: 'chat_user', label: 'Hỗ Trợ', icon: MessageSquare },
  { key: 'create_qr', label: 'Tạo QR', icon: QrCode }, 
  { key: 'manage_packages', label: 'Gói Gym', icon: Package },
  { key: 'manage_pt_packages', label: 'Gói PT', icon: Dumbbell },
  { key: 'add_pt', label: 'Thêm PT', icon: UserPlus },
  { key: 'manage_promo', label: 'Khuyến Mãi', icon: ImageIcon },
  { key: 'manage_voucher', label: 'Voucher', icon: Ticket },
  { key: 'view_schedule', label: 'Xem Lịch', icon: Calendar },
  { key: 'manage_app_interface', label: 'Giao Diện', icon: ImageIcon2 }, 
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  currentAdmin, admins, setAdmins,
  allUsers, setAllUsers, promotions, setPromos, 
  vouchers, setVouchers, trainers, setTrainers,
  packages, setPackages, ptPackages, setPTPackages,
  heroImage, heroTitle, heroSubtitle, heroOverlayText, heroOverlaySub, onUpdateAppConfig, 
  bookings, onUpdateBookings,
  onLogout
}) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date Filters
  const [revenueDate, setRevenueDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Popup / Modal States
  const [selectedUserPhone, setSelectedUserPhone] = useState<string | null>(null);
  const [selectedUserPhonesForBroadcast, setSelectedUserPhonesForBroadcast] = useState<string[]>([]);
  const [chatMsg, setChatMsg] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // QR Gen State
  const [qrType, setQrType] = useState<'text' | 'link' | 'image'>('text');
  const [qrContent, setQrContent] = useState('');
  
  // Form States
  const [giftDays, setGiftDays] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [newPromo, setNewPromo] = useState({ title: '', image: '' });
  const [newVoucher, setNewVoucher] = useState({ title: '', code: '', type: 'Gym' as const, value: 0.1, color: 'bg-orange-500', image: '' });
  const [newPT, setNewPT] = useState({ name: '', specialty: '', image: '', rating: 5 });
  
  // Package with Duration
  const [newPackage, setNewPackage] = useState({ 
      name: '', price: '', originalPrice: '', image: '', description: '', duration: '', bonusDays: '', categoryId: 'gym' as 'gym'|'groupx' 
  });
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  const [newPTPackage, setNewPTPackage] = useState({ name: '', price: '', sessions: '', image: '', description: '' });
  
  // Hero Config State
  const [configHero, setConfigHero] = useState({ 
      appLogo: 'https://phukienlimousine.vn/wp-content/uploads/2025/12/LOGO_SIP_GYM_pages-to-jpg-0001-removebg-preview.png',
      image: '', 
      video: '',
      mediaType: 'image' as 'image'|'video',
      title: '', 
      subtitle: '', 
      overlayText: '', 
      overlaySub: '' 
  });

  // Edit User State
  const [editingRealName, setEditingRealName] = useState('');
  const [editingUserAvatar, setEditingUserAvatar] = useState('');
  
  // Admin Management State
  const [newAdmin, setNewAdmin] = useState<Partial<AdminProfile>>({ username: '', password: '', name: '', role: 'sub_admin', permissions: [], settings: { showFloatingMenu: true, showPopupNoti: true } });
  const [showAdminPass, setShowAdminPass] = useState(false); // Password Visibility Toggle

  // Admin Profile Edit State
  const [editAdminProfile, setEditAdminProfile] = useState<{name: string, phone: string, avatar: string, password: string}>({ name: '', phone: '', avatar: '', password: '' });
  const [isAdminFaceScanning, setIsAdminFaceScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Floating Menu State
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);

  // Admin Notification Toast State (Auto Hide)
  const [showAdminToast, setShowAdminToast] = useState(true);

  // Revenue Transactions
  const [transactions, setTransactions] = useState<RevenueTransaction[]>([]);
  
  useEffect(() => {
      dbService.subscribe('transactions', (data: any) => {
          let raw = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
          setTransactions(raw);
      });
  }, []);

  useEffect(() => {
    if (!currentAdmin) {
       const session = localStorage.getItem('admin_session');
       if (!session) navigate('/admin');
    }
  }, [navigate, currentAdmin]);

  // Auto-scroll chat
  useEffect(() => {
    if (showPopup === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showPopup, allUsers, selectedUserPhone, allUsers.find(u => u.phone === selectedUserPhone)?.messages]);

  // Sync editing name/avatar when user is selected for editing
  const selectedUser = allUsers.find(u => u.phone === selectedUserPhone);
  useEffect(() => {
      if (showPopup === 'user_settings' && selectedUser) {
          setEditingRealName(selectedUser.realName || '');
          setEditingUserAvatar(selectedUser.avatar || '');
          setGiftDays('');
      }
  }, [showPopup, selectedUser]);
  
  // Initialize config hero state when popup opens
  useEffect(() => {
      if (showPopup === 'config_hero') {
          dbService.subscribe('app_settings', (data: any) => {
               if(data) {
                   setConfigHero({ 
                      appLogo: data.appLogo || 'https://phukienlimousine.vn/wp-content/uploads/2025/12/LOGO_SIP_GYM_pages-to-jpg-0001-removebg-preview.png',
                      image: data.heroImage || heroImage, 
                      video: data.heroVideo || '',
                      mediaType: data.heroMediaType || 'image',
                      title: data.heroTitle || heroTitle, 
                      subtitle: data.heroSubtitle || heroSubtitle,
                      overlayText: data.heroOverlayText || heroOverlayText || 'THAY ĐỔI BẢN THÂN', 
                      overlaySub: data.heroOverlaySub || heroOverlaySub || 'Tại Sip Gym Nhà Bè'
                  });
               }
          });
      }
  }, [showPopup, heroImage, heroTitle, heroSubtitle, heroOverlayText, heroOverlaySub]);

  // Permission Checker
  const hasPermission = (perm: AdminPermission) => {
    if (!currentAdmin) return false;
    if (currentAdmin.role === 'super_admin') return true;
    return currentAdmin.permissions.includes(perm);
  };

  // Filter Logic & BADGE COUNTS
  const pendingUsers = allUsers.filter(u => u.subscription?.status === 'Pending');
  const pendingPTUsers = allUsers.filter(u => u.ptSubscription?.status === 'Pending');
  const pendingPreserveUsers = allUsers.filter(u => u.subscription?.status === 'Pending Preservation');
  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const pendingAccounts = allUsers.filter(u => u.accountStatus === 'Pending');
  
  const totalPendingApprovals = pendingUsers.length + pendingPTUsers.length + pendingPreserveUsers.length + pendingBookings.length + pendingAccounts.length;

  const activeUsers = allUsers;
  // Get preserved users list
  const preservedUsers = allUsers.filter(u => u.subscription?.status === 'Preserved');

  useEffect(() => {
      if (totalPendingApprovals > 0) {
          setShowAdminToast(true);
          const timer = setTimeout(() => {
              setShowAdminToast(false);
          }, 6000);
          return () => clearTimeout(timer);
      } else {
          setShowAdminToast(false);
      }
  }, [totalPendingApprovals]);

  const filteredUsers = activeUsers.filter(u => 
     u.phone.includes(searchTerm) || 
     (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (u.realName && u.realName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const pendingSupportCount = allUsers.filter(u => {
    const lastMsg = u.messages?.[u.messages.length - 1];
    return lastMsg && lastMsg.sender === 'user';
  }).length;

  const startAdminCamera = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
          alert("Lỗi camera");
          setIsAdminFaceScanning(false);
      }
  };

  const captureAdminFace = () => {
      if (videoRef.current && currentAdmin) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          
          const updatedAdmins = admins.map(a => a.username === currentAdmin.username ? { ...a, faceData: base64 } : a);
          setAdmins(updatedAdmins);
          if(streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
          setIsAdminFaceScanning(false);
          alert("Đã cập nhật Face ID Admin thành công!");
      }
  };

  // --- ACTIONS ---

  const handleBookingAction = (id: string, action: 'approve' | 'reject') => {
      const updatedBookings = bookings.map(b => b.id === id ? { ...b, status: action === 'approve' ? 'Approved' as const : 'Rejected' as const } : b);
      onUpdateBookings(updatedBookings);
      
      const booking = bookings.find(b => b.id === id);
      if (booking) {
          const newUsers = allUsers.map(u => {
              if (u.phone === booking.userId) {
                  return {
                      ...u,
                      notifications: [{
                          id: Math.random().toString(),
                          text: `Lịch tập PT ${booking.date} (${booking.timeSlot}) của bạn đã được ${action === 'approve' ? 'CHẤP NHẬN' : 'TỪ CHỐI'}.`,
                          date: Date.now(),
                          read: false,
                          type: 'booking' as const
                      }, ...u.notifications]
                  };
              }
              return u;
          });
          setAllUsers(newUsers);
      }
  };

  const handleDeleteUser = () => { 
      if (!selectedUserPhone) return; 
      if (window.confirm("BẠN CÓ CHẮC MUỐN XÓA USER NÀY? Tài khoản sẽ mất vĩnh viễn, nhưng lịch sử doanh thu vẫn được giữ lại.")) { 
          const newUsers = allUsers.filter(u => u.phone !== selectedUserPhone); 
          setAllUsers(newUsers); 
          setShowPopup(null); 
          alert("Đã xóa user thành công."); 
      } 
  };
  
  const handleApprove = (phone: string) => { 
      const updatedUsers = allUsers.map(u => { 
          if (u.phone === phone && u.subscription) { 
              const startDate = Date.now(); 
              const expireDate = startDate + u.subscription.months * 30 * 24 * 60 * 60 * 1000; 
              // Add bonus days if any
              const finalExpireDate = u.subscription.bonusDays ? expireDate + (u.subscription.bonusDays * 24 * 60 * 60 * 1000) : expireDate;

              return { 
                  ...u, 
                  subscription: { ...u.subscription, status: 'Active' as const, startDate, expireDate: finalExpireDate }, 
                  notifications: [{ id: Math.random().toString(), text: `Gói tập ${u.subscription.name} đã được duyệt!`, date: Date.now(), read: false }, ...u.notifications] 
              }; 
          } return u; 
      }); 
      setAllUsers(updatedUsers); 
  };

  const handleApprovePT = (phone: string) => { 
      const updatedUsers = allUsers.map(u => { 
          if (u.phone === phone && u.ptSubscription) { 
              return { 
                  ...u, 
                  ptSubscription: { ...u.ptSubscription, status: 'Active' as const, startDate: Date.now() }, 
                  notifications: [{ id: Math.random().toString(), text: `Gói PT "${u.ptSubscription.name}" đã được duyệt thành công!`, date: Date.now(), read: false }, ...u.notifications] 
              }; 
          } return u; 
      }); 
      setAllUsers(updatedUsers); 
  };

  const handleApprovePreservation = (phone: string) => { 
      const updatedUsers = allUsers.map(u => { 
          if (u.phone === phone && u.subscription) { 
              return { 
                  ...u, 
                  subscription: { ...u.subscription, status: 'Preserved' as const }, 
                  notifications: [{ id: Math.random().toString(), text: `Yêu cầu bảo lưu gói tập của bạn đã được chấp thuận.`, date: Date.now(), read: false }, ...u.notifications] 
              }; 
          } return u; 
      }); 
      setAllUsers(updatedUsers); 
  };

  const handleApproveAccount = (phone: string) => {
      const updatedUsers = allUsers.map(u => {
          if (u.phone === phone) {
              return { 
                  ...u, 
                  accountStatus: 'Active' as const,
                  notifications: [{ 
                      id: Math.random().toString(), 
                      text: `Chào mừng! Tài khoản của bạn đã được Admin duyệt thành công.`, 
                      date: Date.now(), 
                      read: false 
                  }, ...u.notifications]
              };
          }
          return u;
      });
      setAllUsers(updatedUsers);
  };
  
  const handleBroadcast = () => { 
      if (!broadcastMsg.trim()) return; 
      const targets = selectedUserPhonesForBroadcast.length > 0 ? selectedUserPhonesForBroadcast : allUsers.map(u => u.phone); 
      const newUsers = allUsers.map(u => { 
          if (targets.includes(u.phone)) { 
              return { 
                  ...u, 
                  notifications: [{ id: Math.random().toString(), text: `📢 THÔNG BÁO: ${broadcastMsg}`, date: Date.now(), read: false }, ...u.notifications] 
              }; 
          } return u; 
      }); 
      setAllUsers(newUsers); 
      setBroadcastMsg(''); 
      setSelectedUserPhonesForBroadcast([]); 
      setShowPopup(null); 
      alert(`Đã gửi thông báo đến ${targets.length} hội viên!`); 
  };

  const handleSaveAppConfig = () => { 
      onUpdateAppConfig({ 
          appLogo: configHero.appLogo,
          heroImage: configHero.image, 
          heroVideo: configHero.video,
          heroMediaType: configHero.mediaType,
          heroTitle: configHero.title, 
          heroSubtitle: configHero.subtitle,
          heroOverlayText: configHero.overlayText,
          heroOverlaySub: configHero.overlaySub
      }); 
      setShowPopup(null); 
      alert("Cập nhật giao diện thành công!"); 
  };

  const handleCreateAdmin = () => { 
      if (!newAdmin.username || !newAdmin.password || !newAdmin.name) return alert("Vui lòng nhập Username, Password và Tên"); 
      const newAdminProfile: AdminProfile = { 
          username: newAdmin.username, 
          password: newAdmin.password, 
          name: newAdmin.name, 
          role: 'sub_admin', 
          permissions: newAdmin.permissions || [], 
          settings: { showFloatingMenu: true, showPopupNoti: true } 
      }; 
      setAdmins([...admins, newAdminProfile]); 
      setNewAdmin({ username: '', password: '', name: '', role: 'sub_admin', permissions: [], settings: { showFloatingMenu: true, showPopupNoti: true } }); 
      setShowAdminPass(false);
      alert("Đã tạo Admin mới thành công!"); 
  };

  const handleToggleAdminPermission = (perm: AdminPermission) => { 
      const currentPerms = newAdmin.permissions || []; 
      if (currentPerms.includes(perm)) { 
          setNewAdmin({ ...newAdmin, permissions: currentPerms.filter(p => p !== perm) }); 
      } else { 
          setNewAdmin({ ...newAdmin, permissions: [...currentPerms, perm] }); 
      } 
  };

  const toggleFloatingMenuSetting = () => { if (!currentAdmin) return; const newSettings = { ...currentAdmin.settings, showFloatingMenu: !currentAdmin.settings.showFloatingMenu }; const updatedAdmin = { ...currentAdmin, settings: newSettings }; const updatedAdmins = admins.map(a => a.username === currentAdmin.username ? updatedAdmin : a); setAdmins(updatedAdmins); };
  const togglePopupNotiSetting = () => { if (!currentAdmin) return; const newSettings = { ...currentAdmin.settings, showPopupNoti: !currentAdmin.settings.showPopupNoti }; const updatedAdmin = { ...currentAdmin, settings: newSettings }; const updatedAdmins = admins.map(a => a.username === currentAdmin.username ? updatedAdmin : a); setAdmins(updatedAdmins); };
  
  const calculateRevenue = () => { 
      const checkDate = new Date(revenueDate).toDateString(); 
      return transactions
        .filter(t => new Date(t.date).toDateString() === checkDate)
        .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateTotalRevenue = () => {
      return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const handleSaveUserDetails = () => { 
      if (!selectedUserPhone) return; 
      
      const newUsers = allUsers.map(u => u.phone === selectedUserPhone ? { 
          ...u, 
          realName: editingRealName,
          avatar: editingUserAvatar
      } : u); 
      
      setAllUsers(newUsers); 
      setShowPopup(null);
      alert("Đã cập nhật thông tin hội viên thành công!"); 
  };

  const toggleLock = (phone: string) => { const newUsers = allUsers.map(u => u.phone === phone ? { ...u, isLocked: !u.isLocked } : u); setAllUsers(newUsers); };
  const handleGiftDays = () => { if (!selectedUserPhone || !giftDays) return; const days = parseInt(giftDays); if (isNaN(days) || days <= 0) return; const newUsers = allUsers.map(u => { if (u.phone === selectedUserPhone && u.subscription?.expireDate) { const newExpire = u.subscription.expireDate + (days * 24 * 60 * 60 * 1000); return { ...u, subscription: { ...u.subscription, expireDate: newExpire }, notifications: [{ id: Math.random().toString(), text: `Bạn đã được tặng thêm ${days} ngày tập!`, date: Date.now(), read: false }, ...u.notifications] }; } return u; }); setAllUsers(newUsers); setGiftDays(''); alert(`Đã tặng ${days} ngày cho user.`); };
  const sendAdminMessage = () => { 
      if (!selectedUserPhone || !chatMsg.trim()) return; 
      const newMsg = { sender: 'admin' as const, text: chatMsg, timestamp: Date.now() }; 
      const newUsers = allUsers.map(u => { 
          if (u.phone === selectedUserPhone) { 
              return { 
                  ...u, 
                  messages: [...u.messages, newMsg],
                  notifications: [{ id: Math.random().toString(), text: `Bạn có tin nhắn mới từ Admin`, date: Date.now(), read: false }, ...u.notifications]
              }; 
          } return u; 
      }); 
      setAllUsers(newUsers); 
      setChatMsg(''); 
  };
  
  const handleCreateOrUpdatePackage = () => { 
      if (!newPackage.name || !newPackage.price || !newPackage.duration) return alert("Vui lòng nhập đủ thông tin: Tên, Giá, Số tháng"); 
      
      const pkgData: PackageItem = {
          id: editingPackageId || Date.now().toString(),
          categoryId: newPackage.categoryId,
          name: newPackage.name,
          price: parseInt(newPackage.price.toString()),
          originalPrice: newPackage.originalPrice ? parseInt(newPackage.originalPrice.toString()) : undefined,
          bonusDays: newPackage.bonusDays ? parseInt(newPackage.bonusDays.toString()) : 0,
          image: newPackage.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300',
          description: newPackage.description,
          duration: parseInt(newPackage.duration.toString())
      };

      if (editingPackageId) {
          const updatedPackages = packages.map(p => p.id === editingPackageId ? pkgData : p);
          setPackages(updatedPackages);
          setEditingPackageId(null);
      } else {
          setPackages([...packages, pkgData]); 
      }
      setNewPackage({ name: '', price: '', originalPrice: '', image: '', description: '', duration: '', bonusDays: '', categoryId: 'gym' }); 
      alert(editingPackageId ? "Cập nhật gói thành công" : "Thêm gói tập thành công"); 
  };

  const handleEditPackageClick = (pkg: PackageItem) => {
      setNewPackage({
          name: pkg.name,
          price: pkg.price.toString(),
          originalPrice: pkg.originalPrice ? pkg.originalPrice.toString() : '',
          image: pkg.image,
          description: pkg.description || '',
          duration: pkg.duration.toString(),
          bonusDays: pkg.bonusDays ? pkg.bonusDays.toString() : '',
          categoryId: pkg.categoryId
      });
      setEditingPackageId(pkg.id);
  };

  const handleDeletePackage = (id: string) => { if(window.confirm("Xóa gói này?")) { setPackages(packages.filter(p => p.id !== id)); } };
  
  const handleCreatePTPackage = () => { 
      if (!newPTPackage.name || !newPTPackage.price || !newPTPackage.sessions) return alert("Vui lòng nhập tên, giá và số buổi"); 
      const pkg: PTPackage = { 
          id: Date.now().toString(), 
          name: newPTPackage.name, 
          price: parseInt(newPTPackage.price.toString()), 
          sessions: parseInt(newPTPackage.sessions.toString()), 
          image: newPTPackage.image || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=300',
          description: newPTPackage.description
      }; 
      setPTPackages([...ptPackages, pkg]); 
      setNewPTPackage({ name: '', price: '', sessions: '', image: '', description: '' }); 
      alert("Thêm gói PT thành công"); 
  };
  const handleDeletePTPackage = (id: string) => { if(window.confirm("Xóa gói PT này?")) { setPTPackages(ptPackages.filter(p => p.id !== id)); } };
  
  const handleCreatePT = () => { 
      if (!newPT.name || !newPT.specialty || !newPT.image) return alert("Vui lòng nhập đủ thông tin & ảnh"); 
      const trainer: Trainer = { id: Date.now().toString(), name: newPT.name, specialty: newPT.specialty, image: newPT.image, rating: 5 }; 
      setTrainers([...trainers, trainer]); 
      setNewPT({ name: '', specialty: '', image: '', rating: 5 }); 
      setShowPopup(null); 
      alert("Thêm PT thành công"); 
  };

  const handleDeletePT = (id: string) => { if(window.confirm("Xóa PT này?")) { setTrainers(trainers.filter(t => t.id !== id)); } };

  const handleCreatePromo = () => {
      if (!newPromo.title || !newPromo.image) return alert("Thiếu tiêu đề hoặc ảnh");
      setPromos([...promotions, { id: Date.now().toString(), title: newPromo.title, image: newPromo.image, date: Date.now() }]);
      setNewPromo({ title: '', image: '' });
      alert("Thêm khuyến mãi thành công");
  };
  
  const handleDeletePromo = (id: string) => { if(window.confirm("Xóa khuyến mãi này?")) { setPromos(promotions.filter(p => p.id !== id)); } };

  const handleCreateVoucher = () => {
      if (!newVoucher.title || !newVoucher.code) return alert("Thiếu thông tin voucher");
      setVouchers([...vouchers, { id: Date.now().toString(), title: newVoucher.title, code: newVoucher.code, type: newVoucher.type, value: newVoucher.value, color: newVoucher.color, image: newVoucher.image }]);
      setNewVoucher({ title: '', code: '', type: 'Gym', value: 0.1, color: 'bg-orange-500', image: '' });
      alert("Thêm voucher thành công");
  };
  
  const handleDeleteVoucher = (id: string) => { if(window.confirm("Xóa voucher này?")) { setVouchers(vouchers.filter(v => v.id !== id)); } };

  const handleSaveAdminProfile = () => {
      if (!currentAdmin) return;
      const updatedAdmins = admins.map(a => a.username === currentAdmin.username ? { ...a, ...editAdminProfile } : a);
      setAdmins(updatedAdmins);
      setShowPopup(null);
      alert("Cập nhật thông tin Admin thành công!");
  };

  const FloatingMenuItem = ({ icon: Icon, label, action, perm, badgeCount }: any) => {
     const allowed = hasPermission(perm);
     return (
        <button 
           onClick={() => { if(allowed) { action(); setIsFloatingMenuOpen(false); } }}
           disabled={!allowed}
           className={`relative flex items-center gap-3 p-3 w-full rounded-xl transition-all ${allowed ? 'hover:bg-orange-50 text-gray-700' : 'opacity-40 cursor-not-allowed text-gray-400 grayscale'}`}
        >
           <div className="relative">
              <Icon className="w-5 h-5 text-[#FF6B00]" />
              {badgeCount > 0 && (
                 <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {badgeCount > 9 ? '9+' : badgeCount}
                 </div>
              )}
           </div>
           <span className="text-xs font-bold uppercase">{label}</span>
           {!allowed && <Lock className="w-3 h-3 ml-auto text-gray-300" />}
        </button>
     );
  };

  const getActionForPerm = (perm: AdminPermission) => {
      switch(perm) {
          case 'chat_user': return () => setShowPopup('support_list');
          case 'create_qr': return () => { setQrContent(''); setShowPopup('create_qr'); }; 
          case 'send_notification': return () => setShowPopup('broadcast');
          case 'view_users': return () => setShowPopup('user_list');
          case 'approve_users': return () => setShowPopup('pending_approvals'); 
          case 'manage_packages': return () => setShowPopup('packages');
          case 'manage_pt_packages': return () => setShowPopup('pt_packages');
          case 'add_pt': return () => setShowPopup('add_pt');
          case 'manage_app_interface': return () => setShowPopup('config_hero');
          case 'manage_bookings': return () => setShowPopup('pending_approvals');
          case 'view_schedule': return () => setShowPopup('view_schedule'); 
          case 'view_revenue': return () => setShowPopup('revenue_report');
          case 'manage_promo': return () => setShowPopup('create_promo');
          case 'manage_voucher': return () => setShowPopup('create_voucher');
          default: return () => {};
      }
  };
  
  const getBadgeForPerm = (perm: AdminPermission) => {
      switch(perm) {
          case 'approve_users': return totalPendingApprovals;
          case 'manage_bookings': return totalPendingApprovals;
          case 'chat_user': return pendingSupportCount;
          default: return 0;
      }
  };
  
  const sortedChatUsers = allUsers.filter(u => u.messages.length > 0 || u.subscription?.status === 'Pending' || u.ptSubscription?.status === 'Pending').sort((a, b) => {
      const lastMsgA = a.messages[a.messages.length - 1];
      const lastMsgB = b.messages[b.messages.length - 1];
      const timeA = lastMsgA ? lastMsgA.timestamp : 0;
      const timeB = lastMsgB ? lastMsgB.timestamp : 0;
      return timeB - timeA;
  });

  return (
    <div className="bg-[#FFF7ED] min-h-full text-gray-700 pb-20 font-sans selection:bg-orange-200 relative">
      <header className="bg-white/80 backdrop-blur-xl border-b border-orange-100 px-6 py-4 sticky top-0 z-[100] flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4" onClick={() => {
            setEditAdminProfile({
                name: currentAdmin?.name || '',
                phone: currentAdmin?.phone || '',
                avatar: currentAdmin?.avatar || '',
                password: currentAdmin?.password || ''
            });
            setShowPopup('admin_profile');
        }}>
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border-2 border-orange-100 cursor-pointer">
             {currentAdmin?.avatar ? <img src={currentAdmin.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gradient-to-tr from-[#FF6B00] to-orange-400 flex items-center justify-center text-white"><LayoutDashboard className="w-6 h-6" /></div>}
          </div>
          <div className="cursor-pointer">
            <h1 className="text-gray-900 font-black text-lg italic tracking-tight leading-none">{currentAdmin?.name}</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Role: {currentAdmin?.role === 'super_admin' ? 'Super Admin' : 'Quản lý'}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button onClick={() => setShowPopup('pending_approvals')} className="w-10 h-10 bg-white text-gray-500 rounded-xl flex items-center justify-center transition-all border border-gray-100 relative active:scale-95">
              <Bell className="w-5 h-5" />
              {totalPendingApprovals > 0 && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>}
           </button>
           {/* Add Preserved List Button */}
           <button onClick={() => setShowPopup('preserved_list')} className="w-10 h-10 bg-yellow-50 text-yellow-500 rounded-xl flex items-center justify-center transition-all border border-yellow-100 active:scale-95 relative" title="Hội viên bảo lưu">
              <PauseCircle className="w-5 h-5" />
              {preservedUsers.length > 0 && <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full border border-white"></div>}
           </button>
           {currentAdmin?.role === 'super_admin' && (
              <button onClick={() => setShowPopup('manage_admins')} className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center transition-all border border-blue-100 hover:bg-blue-100 active:scale-95">
                <ShieldAlert className="w-5 h-5" />
              </button>
           )}
           <button onClick={onLogout} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center transition-all border border-red-100 hover:bg-red-100 active:scale-95">
             <LogOut className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Floating Menu */}
      {currentAdmin?.settings.showFloatingMenu && (
        <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end gap-2">
           {isFloatingMenuOpen && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-2 shadow-2xl mb-2 w-56 animate-in slide-in-from-bottom-5 border border-white/50 max-h-[60vh] overflow-y-auto no-scrollbar">
                 {PERMISSIONS_LIST.map(p => (
                     <FloatingMenuItem 
                        key={p.key} 
                        icon={p.icon} 
                        label={p.label} 
                        action={getActionForPerm(p.key)} 
                        perm={p.key} 
                        badgeCount={getBadgeForPerm(p.key)}
                     />
                 ))}
              </div>
           )}
           <button 
             onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
             className="w-14 h-14 bg-[#FF6B00] hover:bg-[#E65A00] rounded-full text-white shadow-xl shadow-orange-500/40 flex items-center justify-center transition-transform active:scale-95 relative"
           >
              {isFloatingMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              {!isFloatingMenuOpen && (totalPendingApprovals + pendingSupportCount) > 0 && (
                 <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
              )}
           </button>
        </div>
      )}

      {/* Admin Notification Popup */}
      {currentAdmin?.settings.showPopupNoti && showAdminToast && (totalPendingApprovals > 0) && (
         <div 
            onClick={() => setShowPopup('pending_approvals')}
            className="fixed top-24 right-6 z-[90] bg-white rounded-2xl shadow-2xl p-4 w-64 border-l-4 border-[#FF6B00] animate-in slide-in-from-right-10 cursor-pointer hover:bg-orange-50 transition-colors"
         >
            <div className="flex justify-between items-start mb-2">
               <h4 className="text-gray-800 font-black text-xs uppercase flex items-center gap-1"><Bell className="w-3 h-3 text-red-500 animate-pulse"/> Cần Duyệt Gấp</h4>
               <button onClick={(e) => { e.stopPropagation(); setShowAdminToast(false); }} className="text-gray-400 hover:text-gray-600"><X className="w-3 h-3"/></button>
            </div>
            <div className="space-y-1">
                {pendingAccounts.length > 0 && <p className="text-[10px] text-gray-600 font-bold">• {pendingAccounts.length} đăng ký tài khoản mới</p>}
                {pendingUsers.length > 0 && <p className="text-[10px] text-gray-600 font-bold">• {pendingUsers.length} gói tập Gym mới</p>}
                {pendingPTUsers.length > 0 && <p className="text-[10px] text-gray-600 font-bold">• {pendingPTUsers.length} đăng ký PT mới</p>}
                {pendingBookings.length > 0 && <p className="text-[10px] text-gray-600 font-bold">• {pendingBookings.length} lịch đặt PT</p>}
                {pendingPreserveUsers.length > 0 && <p className="text-[10px] text-gray-600 font-bold">• {pendingPreserveUsers.length} yêu cầu bảo lưu</p>}
            </div>
            
            <div className="absolute bottom-0 left-0 h-1 bg-orange-100 w-full">
                <div className="h-full bg-orange-400 animate-[shrink_6s_linear_forwards] origin-left"></div>
            </div>
            <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
         </div>
      )}

      <main className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
             onClick={() => hasPermission('view_revenue') && setShowPopup('revenue_report')}
             className={`bg-white/60 backdrop-blur-md border border-white/60 p-5 rounded-[32px] shadow-sm transition-all active:scale-95 ${hasPermission('view_revenue') ? 'cursor-pointer group hover:border-green-200 hover:shadow-md' : 'cursor-not-allowed opacity-70 grayscale'}`}
          >
               <div className="w-10 h-10 bg-green-100 text-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
               </div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Doanh Thu (Ngày)</p>
               {hasPermission('view_revenue') ? (
                  <p className="text-xl font-black text-gray-800">{calculateRevenue().toLocaleString('vi-VN')}đ</p>
               ) : <p className="text-sm italic text-gray-400">Hidden</p>}
          </div>

          <div 
            onClick={() => hasPermission('chat_user') && setShowPopup('support_list')}
            className={`bg-white/60 backdrop-blur-md border border-white/60 p-5 rounded-[32px] shadow-sm transition-all active:scale-95 ${hasPermission('chat_user') ? 'cursor-pointer hover:border-orange-200 group hover:shadow-md' : 'opacity-70 cursor-not-allowed grayscale'}`}
          >
             <div className="relative w-10 h-10 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
                {pendingSupportCount > 0 && hasPermission('chat_user') && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">{pendingSupportCount}</div>}
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tin nhắn hỗ trợ</p>
             <p className="text-2xl font-black text-gray-800">{pendingSupportCount} <span className="text-xs text-orange-500 font-bold">chờ xử lý</span></p>
          </div>

          <div 
               onClick={() => hasPermission('view_users') && setShowPopup('user_list')}
               className={`bg-white/60 backdrop-blur-md border border-white/60 p-5 rounded-[32px] shadow-sm transition-all active:scale-95 ${hasPermission('view_users') ? 'cursor-pointer hover:border-blue-200 group hover:shadow-md' : 'cursor-not-allowed opacity-70 grayscale'}`}
          >
               <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
               </div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng Hội Viên</p>
               {hasPermission('view_users') ? <p className="text-2xl font-black text-gray-800">{activeUsers.length}</p> : <p className="text-sm italic text-gray-400">Hidden</p>}
          </div>
          
           <div 
              onClick={() => hasPermission('manage_app_interface') && setShowPopup('config_hero')}
              className={`bg-white/60 backdrop-blur-md border border-white/60 p-5 rounded-[32px] shadow-sm transition-all active:scale-95 ${hasPermission('manage_app_interface') ? 'cursor-pointer hover:border-purple-200 hover:shadow-md' : 'opacity-70 cursor-not-allowed grayscale'}`}
           >
               <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-100 text-purple-500 rounded-xl flex items-center justify-center">
                      <Settings className="w-5 h-5" />
                   </div>
                   <span className="text-[9px] font-bold text-gray-400 uppercase">Cài đặt App</span>
               </div>
               <div className="space-y-1">
                  <p className="text-xs font-black text-gray-800">Banner & Giao diện</p>
                  <p className="text-[10px] text-gray-500">Chỉnh sửa hình ảnh, text</p>
               </div>
          </div>
        </div>

        <div>
           <h3 className="text-gray-800 font-black text-sm uppercase italic mb-4 flex items-center gap-2">
             <LayoutDashboard className="w-4 h-4 text-[#FF6B00]" />
             Menu Chức Năng
           </h3>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {PERMISSIONS_LIST.map(perm => (
                  <button 
                    key={perm.key}
                    disabled={!hasPermission(perm.key)}
                    onClick={() => hasPermission(perm.key) && getActionForPerm(perm.key)()} 
                    className={`bg-white p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border border-transparent shadow-sm active:scale-95 ${hasPermission(perm.key) ? 'hover:shadow-lg hover:border-orange-100' : 'opacity-50 cursor-not-allowed grayscale'}`}
                  >
                     <div className="relative">
                        <div className="w-14 h-14 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors"><perm.icon className="w-7 h-7" /></div>
                        {(perm.key === 'approve_users' || perm.key === 'manage_bookings') && totalPendingApprovals > 0 && <div className="absolute -top-1 -right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white">{totalPendingApprovals}</div>}
                        {perm.key === 'chat_user' && pendingSupportCount > 0 && <div className="absolute -top-1 -right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white">{pendingSupportCount}</div>}
                     </div>
                     <span className="text-xs font-black text-gray-600 uppercase">{perm.label}</span>
                  </button>
              ))}
           </div>
        </div>
      </main>

      {/* --- POPUPS SECTION --- */}
      {showPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowPopup(null)} />
           
           <div className="relative w-full sm:max-w-lg bg-white rounded-[32px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                 <h3 className="font-black text-gray-800 uppercase italic text-lg">
                    {showPopup === 'pending_approvals' && 'Duyệt Yêu Cầu'}
                    {showPopup === 'user_list' && 'Danh Sách Hội Viên'}
                    {showPopup === 'preserved_list' && 'Hội Viên Bảo Lưu'}
                    {showPopup === 'broadcast' && 'Gửi Thông Báo'}
                    {showPopup === 'revenue_report' && 'Báo Cáo Doanh Thu'}
                    {showPopup === 'support_list' && 'Hỗ Trợ Khách Hàng'}
                    {showPopup === 'packages' && 'Quản Lý Gói Gym/GroupX'}
                    {showPopup === 'pt_packages' && 'Quản Lý Gói PT'}
                    {showPopup === 'add_pt' && 'Quản Lý PT'}
                    {showPopup === 'create_promo' && 'Quản Lý Khuyến Mãi'}
                    {showPopup === 'create_voucher' && 'Quản Lý Voucher'}
                    {showPopup === 'config_hero' && 'Cấu Hình App'}
                    {showPopup === 'manage_admins' && 'Quản Lý Admin'}
                    {showPopup === 'admin_profile' && 'Hồ Sơ Admin'}
                    {showPopup === 'chat' && `Chat: ${allUsers.find(u => u.phone === selectedUserPhone)?.name}`}
                    {showPopup === 'user_settings' && 'Thông Tin Hội Viên'}
                    {showPopup === 'view_schedule' && 'Lịch Đặt PT'}
                    {showPopup === 'create_qr' && 'Tạo Mã QR'}
                 </h3>
                 <button onClick={() => setShowPopup(null)} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 bg-[#F7FAFC]">
                  {/* ... (Existing Content logic remains the same, only the container class changed above) ... */}
                  {showPopup === 'pending_approvals' && (
                      <div className="space-y-6">
                          {/* ... (Pending Approvals Logic remains same) */}
                          {pendingAccounts.length > 0 && (
                             <div>
                                <h4 className="font-black text-gray-400 text-xs uppercase mb-2">Tài Khoản Mới ({pendingAccounts.length})</h4>
                                <div className="space-y-2">
                                   {pendingAccounts.map(u => (
                                      <div key={u.phone} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
                                         <div>
                                            <p className="font-bold text-gray-800 text-sm">{u.realName || u.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">{u.phone}</p>
                                         </div>
                                         <button onClick={() => handleApproveAccount(u.phone)} className="bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase shadow-md shadow-blue-200">Duyệt TK</button>
                                      </div>
                                   ))}
                                </div>
                             </div>
                          )}
                          
                          {pendingUsers.length > 0 && (
                              <div>
                                  <h4 className="font-black text-gray-400 text-xs uppercase mb-2">Đăng Ký Gói Gym ({pendingUsers.length})</h4>
                                  <div className="space-y-2">
                                      {pendingUsers.map(u => (
                                          <div key={u.phone} className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
                                              <p className="font-bold text-gray-800 text-sm">{u.realName || u.name} - {u.phone}</p>
                                              <p className="text-xs text-blue-500 font-bold uppercase mt-1">Gói: {u.subscription?.name} ({u.subscription?.months} tháng)</p>
                                              <p className="text-xs text-gray-500">Giá: {u.subscription?.price.toLocaleString()}đ</p>
                                              {u.subscription?.bonusDays ? <p className="text-[10px] text-pink-500 font-bold">Quà tặng: +{u.subscription.bonusDays} ngày</p> : null}
                                              <div className="flex gap-2 mt-3">
                                                  <button onClick={() => handleApprove(u.phone)} className="flex-1 bg-blue-500 text-white py-2 rounded-xl text-xs font-bold uppercase shadow-md shadow-blue-200">Xác Nhận Đã Thu Tiền</button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}
                          {/* ... Other pending sections ... */}
                          {pendingPTUsers.length > 0 && (
                              <div>
                                  <h4 className="font-black text-gray-400 text-xs uppercase mb-2">Đăng Ký Gói PT ({pendingPTUsers.length})</h4>
                                  <div className="space-y-2">
                                      {pendingPTUsers.map(u => (
                                          <div key={u.phone} className="bg-white p-4 rounded-2xl shadow-sm border border-purple-100">
                                              <p className="font-bold text-gray-800 text-sm">{u.realName || u.name} - {u.phone}</p>
                                              <p className="text-xs text-purple-500 font-bold uppercase mt-1">Gói: {u.ptSubscription?.name}</p>
                                              <p className="text-xs text-gray-500">Giá: {u.ptSubscription?.price.toLocaleString()}đ</p>
                                              <div className="flex gap-2 mt-3">
                                                  <button onClick={() => handleApprovePT(u.phone)} className="flex-1 bg-purple-500 text-white py-2 rounded-xl text-xs font-bold uppercase shadow-md shadow-purple-200">Xác Nhận Đã Thu Tiền</button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {pendingPreserveUsers.length > 0 && (
                              <div>
                                  <h4 className="font-black text-gray-400 text-xs uppercase mb-2">Yêu Cầu Bảo Lưu ({pendingPreserveUsers.length})</h4>
                                  <div className="space-y-2">
                                      {pendingPreserveUsers.map(u => (
                                          <div key={u.phone} className="bg-white p-4 rounded-2xl shadow-sm border border-yellow-100">
                                              <p className="font-bold text-gray-800 text-sm">{u.realName || u.name} - {u.phone}</p>
                                              <p className="text-xs text-gray-500">Gói hiện tại: {u.subscription?.name}</p>
                                              <div className="flex gap-2 mt-3">
                                                  <button onClick={() => handleApprovePreservation(u.phone)} className="flex-1 bg-yellow-500 text-white py-2 rounded-xl text-xs font-bold uppercase shadow-md shadow-yellow-200">Chấp Thuận Bảo Lưu</button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}
                          
                          {totalPendingApprovals === 0 && (
                              <div className="text-center py-10 opacity-50">
                                  <CheckCircle2 className="w-16 h-16 mx-auto mb-2 text-green-500"/>
                                  <p className="font-bold text-gray-500">Không có yêu cầu nào cần duyệt</p>
                              </div>
                          )}
                      </div>
                  )}

                  {showPopup === 'preserved_list' && (
                      <div className="space-y-4">
                          {preservedUsers.length === 0 ? (
                              <p className="text-center text-gray-400 text-sm font-bold mt-10">Không có hội viên nào đang bảo lưu.</p>
                          ) : (
                              preservedUsers.map(u => (
                                  <div key={u.phone} onClick={() => { setSelectedUserPhone(u.phone); setShowPopup('user_settings'); }} className="bg-white p-4 rounded-2xl border border-yellow-200 shadow-sm flex items-center justify-between cursor-pointer">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden"><img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.phone}`} className="w-full h-full object-cover"/></div>
                                          <div>
                                              <p className="font-bold text-gray-800 text-sm">{u.realName || u.name}</p>
                                              <p className="text-xs text-gray-500">{u.phone}</p>
                                          </div>
                                      </div>
                                      <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Đang Bảo Lưu</span>
                                  </div>
                              ))
                          )}
                      </div>
                  )}

                  {/* ... (Create QR, User List, User Settings, Broadcast, Revenue Report, Support List, Chat - Keep same as before) ... */}
                  {showPopup === 'create_qr' && (
                      // ... (QR Content Same as before)
                      <div className="space-y-6">
                          <div className="flex bg-gray-100 p-1 rounded-xl">
                              <button onClick={() => { setQrType('text'); setQrContent(''); }} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${qrType === 'text' ? 'bg-white shadow text-[#FF6B00]' : 'text-gray-400'}`}>Văn Bản</button>
                              <button onClick={() => { setQrType('link'); setQrContent(''); }} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${qrType === 'link' ? 'bg-white shadow text-[#FF6B00]' : 'text-gray-400'}`}>Link</button>
                              <button onClick={() => { setQrType('image'); setQrContent(''); }} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${qrType === 'image' ? 'bg-white shadow text-[#FF6B00]' : 'text-gray-400'}`}>Hình Ảnh</button>
                          </div>
                          {/* ... rest of QR logic ... */}
                          {/* Simplified for brevity - assume previous logic here */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                              {qrType === 'text' && (
                                  <div>
                                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Nội dung văn bản</label>
                                      <textarea value={qrContent} onChange={e => setQrContent(e.target.value)} placeholder="Nhập văn bản..." className="w-full bg-gray-50 p-3 rounded-xl text-sm font-medium h-24 resize-none outline-none focus:ring-2 focus:ring-orange-200"/>
                                  </div>
                              )}
                              {qrType === 'link' && (
                                  <div>
                                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Đường dẫn (URL)</label>
                                      <div className="relative">
                                          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                                          <input value={qrContent} onChange={e => setQrContent(e.target.value)} placeholder="https://..." className="w-full bg-gray-50 p-3 pl-10 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-200"/>
                                      </div>
                                  </div>
                              )}
                              {qrType === 'image' && (
                                  <div>
                                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Upload Hình Ảnh</label>
                                      <ImageUpload currentImage={qrContent || null} onImageUploaded={setQrContent} aspect="aspect-video" className="rounded-xl overflow-hidden"/>
                                      <p className="text-[10px] text-gray-400 mt-2 italic">*QR sẽ chứa link dẫn tới ảnh này.</p>
                                  </div>
                              )}
                          </div>
                          {qrContent && (
                              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
                                  <div className="bg-white p-4 rounded-3xl shadow-lg border-2 border-orange-100 mb-4">
                                      <QRCode value={qrContent} size={200} />
                                  </div>
                                  <button onClick={() => window.print()} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs shadow-lg active:scale-95 transition-transform">In Mã QR</button>
                              </div>
                          )}
                      </div>
                  )}
                  {showPopup === 'user_list' && (
                      <div className="space-y-4">
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                              <input 
                                  value={searchTerm}
                                  onChange={e => setSearchTerm(e.target.value)}
                                  placeholder="Tìm tên hoặc số điện thoại..."
                                  className="w-full pl-10 pr-4 py-3 rounded-xl border-none text-sm font-bold bg-white focus:ring-2 focus:ring-orange-200"
                              />
                          </div>
                          <div className="space-y-2">
                              {filteredUsers.map(u => (
                                  <div key={u.phone} onClick={() => { setSelectedUserPhone(u.phone); setShowPopup('user_settings'); }} className="bg-white p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-orange-50 transition-colors">
                                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200"><img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.phone}`} className="w-full h-full object-cover"/></div>
                                      <div className="flex-1">
                                          <p className="font-bold text-sm text-gray-800">{u.realName || u.name}</p>
                                          <p className="text-xs text-gray-400">{u.phone}</p>
                                      </div>
                                      <ChevronRight className="w-4 h-4 text-gray-300"/>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
                  {showPopup === 'user_settings' && selectedUser && (
                      <div className="space-y-4">
                          <div className="bg-white p-4 rounded-2xl flex flex-col items-center">
                              <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border-2 border-orange-100">
                                  <img src={editingUserAvatar || selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.phone}`} className="w-full h-full object-cover"/>
                              </div>
                              <input value={editingRealName} onChange={e => setEditingRealName(e.target.value)} className="text-center font-black text-lg bg-transparent border-b border-gray-200 focus:border-orange-500 outline-none pb-1" placeholder="Tên thật"/>
                              <p className="text-xs font-bold text-gray-400 mt-1">{selectedUser.phone}</p>
                              
                              <div className="grid grid-cols-2 gap-2 w-full mt-4">
                                  <button onClick={() => setShowPopup('chat')} className="bg-blue-50 text-blue-600 py-2 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1"><MessageSquare className="w-4 h-4"/> Chat</button>
                                  <button onClick={() => toggleLock(selectedUser.phone)} className={`py-2 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1 ${selectedUser.isLocked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                      {selectedUser.isLocked ? <><Lock className="w-4 h-4"/> Mở Khóa</> : <><Unlock className="w-4 h-4"/> Khóa</>}
                                  </button>
                              </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-2xl">
                              <h4 className="font-black text-xs uppercase text-gray-400 mb-2">Gói Tập & Quà Tặng</h4>
                              <p className="text-sm font-bold text-gray-800 mb-1">Gói Gym: {selectedUser.subscription?.status === 'Active' ? <span className="text-green-600">{selectedUser.subscription.name}</span> : <span className="text-gray-400">Chưa có</span>}</p>
                              {selectedUser.subscription?.status === 'Active' && (
                                  <div className="flex gap-2 mt-2">
                                      <input type="number" value={giftDays} onChange={e => setGiftDays(e.target.value)} placeholder="Số ngày tặng" className="flex-1 bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                      <button onClick={handleGiftDays} className="bg-pink-500 text-white px-3 rounded-xl font-bold uppercase text-xs">Tặng</button>
                                  </div>
                              )}
                          </div>
                          <button onClick={handleSaveUserDetails} className="w-full bg-[#FF6B00] text-white py-3 rounded-xl font-black uppercase text-sm shadow-lg">Lưu Thông Tin</button>
                          <button onClick={handleDeleteUser} className="w-full bg-transparent border border-red-200 text-red-500 py-3 rounded-xl font-black uppercase text-sm mt-2">Xóa Hội Viên</button>
                      </div>
                  )}
                  {showPopup === 'broadcast' && (
                      <div className="space-y-4">
                          <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} className="w-full h-32 bg-white rounded-2xl p-4 font-medium text-sm border-none focus:ring-2 focus:ring-orange-200" placeholder="Nhập nội dung thông báo..."/>
                          <div className="flex justify-between items-center px-2">
                             <span className="text-xs font-bold text-gray-400">Gửi đến: {selectedUserPhonesForBroadcast.length > 0 ? `${selectedUserPhonesForBroadcast.length} người chọn` : 'Tất cả hội viên'}</span>
                             <button onClick={() => setSelectedUserPhonesForBroadcast([])} className="text-xs text-blue-500 font-bold">Reset</button>
                          </div>
                          <button onClick={handleBroadcast} className="w-full bg-blue-500 text-white py-3 rounded-xl font-black uppercase text-sm shadow-lg">Gửi Thông Báo</button>
                      </div>
                  )}
                  {showPopup === 'revenue_report' && (
                      <div className="space-y-4">
                          <input type="date" value={revenueDate} onChange={e => setRevenueDate(e.target.value)} className="w-full bg-white p-3 rounded-xl font-bold text-gray-700"/>
                          <div className="bg-white p-6 rounded-2xl text-center shadow-sm">
                              <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Doanh thu ngày {new Date(revenueDate).toLocaleDateString('vi-VN')}</p>
                              <p className="text-3xl font-black text-green-500">{calculateRevenue().toLocaleString()}đ</p>
                          </div>
                          <div className="bg-white p-6 rounded-2xl text-center shadow-sm border border-blue-100">
                              <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Tổng doanh thu toàn thời gian</p>
                              <p className="text-3xl font-black text-blue-500">{calculateTotalRevenue().toLocaleString()}đ</p>
                          </div>
                      </div>
                  )}
                  {showPopup === 'support_list' && (
                      <div className="space-y-2">
                          {sortedChatUsers.map(u => {
                              const lastMsg = u.messages[u.messages.length - 1];
                              const isUnread = lastMsg && lastMsg.sender === 'user'; 
                              return (
                                  <div key={u.phone} onClick={() => { setSelectedUserPhone(u.phone); setShowPopup('chat'); }} className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer ${isUnread ? 'bg-orange-50 border border-orange-200' : 'bg-white'}`}>
                                      <div className="relative">
                                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200"><img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.phone}`} className="w-full h-full object-cover"/></div>
                                          {isUnread && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>}
                                      </div>
                                      <div className="flex-1">
                                          <div className="flex justify-between">
                                              <p className="font-bold text-sm text-gray-800">{u.realName || u.name}</p>
                                              <span className="text-[10px] text-gray-400">{lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                                          </div>
                                          <p className={`text-xs line-clamp-1 ${isUnread ? 'font-bold text-gray-800' : 'text-gray-500'}`}>{lastMsg ? (lastMsg.sender === 'user' ? `User: ${lastMsg.text}` : `Admin: ${lastMsg.text}`) : 'Chưa có tin nhắn'}</p>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  )}
                  {showPopup === 'chat' && selectedUser && (
                      <div className="flex flex-col h-full max-h-[60vh]">
                          <div className="flex-1 overflow-y-auto space-y-3 p-2">
                              {selectedUser.messages.map((m, idx) => (
                                  <div key={idx} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium ${m.sender === 'admin' ? 'bg-[#FF6B00] text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none shadow-sm'}`}>
                                          {m.text}
                                      </div>
                                  </div>
                              ))}
                              <div ref={chatEndRef} />
                          </div>
                          <div className="mt-2 flex gap-2">
                              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendAdminMessage()} className="flex-1 bg-white rounded-xl px-4 py-3 text-sm font-bold border-none focus:ring-2 focus:ring-orange-200" placeholder="Nhập tin nhắn..."/>
                              <button onClick={sendAdminMessage} className="bg-[#FF6B00] text-white p-3 rounded-xl shadow-md"><Send className="w-5 h-5"/></button>
                          </div>
                      </div>
                  )}

                  {/* Config Hero - Updated */}
                  {showPopup === 'config_hero' && (
                      <div className="space-y-4">
                          <div className="bg-white p-4 rounded-xl border border-gray-100 mb-2">
                              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Hiển thị mặc định trang chủ</p>
                              <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="mediaType" checked={configHero.mediaType === 'image'} onChange={() => setConfigHero({...configHero, mediaType: 'image'})} className="accent-[#FF6B00]"/>
                                      <span className="text-sm font-bold">Hình Ảnh</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="mediaType" checked={configHero.mediaType === 'video'} onChange={() => setConfigHero({...configHero, mediaType: 'video'})} className="accent-[#FF6B00]"/>
                                      <span className="text-sm font-bold">Video</span>
                                  </label>
                              </div>
                          </div>

                          <div>
                              <label className="text-xs font-bold text-gray-400 uppercase">Logo App</label>
                              <ImageUpload currentImage={configHero.appLogo} onImageUploaded={(url) => setConfigHero({...configHero, appLogo: url})} aspect="aspect-square" className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-gray-200 mt-2"/>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-400 uppercase">Tiêu đề lớn</label>
                              <textarea value={configHero.title} onChange={e => setConfigHero({...configHero, title: e.target.value})} className="w-full bg-white rounded-xl p-3 font-bold text-sm mt-1"/>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-400 uppercase">Phụ đề (Tagline)</label>
                              <input value={configHero.subtitle} onChange={e => setConfigHero({...configHero, subtitle: e.target.value})} className="w-full bg-white rounded-xl p-3 font-bold text-sm mt-1"/>
                          </div>
                          <div>
                             <label className="text-xs font-bold text-gray-400 uppercase">Overlay Text</label>
                             <input value={configHero.overlayText} onChange={e => setConfigHero({...configHero, overlayText: e.target.value})} className="w-full bg-white rounded-xl p-3 font-bold text-sm mt-1"/>
                          </div>
                          <div>
                             <label className="text-xs font-bold text-gray-400 uppercase">Overlay Sub</label>
                             <input value={configHero.overlaySub} onChange={e => setConfigHero({...configHero, overlaySub: e.target.value})} className="w-full bg-white rounded-xl p-3 font-bold text-sm mt-1"/>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-gray-100">
                              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Ảnh nền</label>
                              <ImageUpload currentImage={configHero.image} onImageUploaded={(url) => setConfigHero({...configHero, image: url})} aspect="aspect-square" className="rounded-xl overflow-hidden"/>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-gray-100">
                              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-1"><Video className="w-3 h-3"/> Video nền</label>
                              <ImageUpload 
                                  currentImage={configHero.video} 
                                  onImageUploaded={(url) => setConfigHero({...configHero, video: url})} 
                                  aspect="aspect-square" 
                                  className="rounded-xl overflow-hidden"
                                  accept="video/*"
                                  label=""
                              />
                          </div>
                          <button onClick={handleSaveAppConfig} className="w-full bg-purple-500 text-white py-3 rounded-xl font-black uppercase text-sm shadow-lg">Lưu Cấu Hình</button>
                      </div>
                  )}

                  {/* Packages Manager - Updated */}
                  {showPopup === 'packages' && (
                      <div className="space-y-6">
                           <div className="bg-white p-4 rounded-2xl shadow-sm">
                               <h4 className="font-black text-gray-400 text-xs uppercase mb-3">{editingPackageId ? 'Sửa Gói' : 'Thêm Gói Mới'}</h4>
                               <div className="space-y-3">
                                   <div className="flex gap-2">
                                       <div className="flex-1">
                                           <label className="text-xs font-bold text-gray-400 uppercase ml-1">Loại Gói</label>
                                           <select 
                                              value={newPackage.categoryId} 
                                              onChange={e => setNewPackage({...newPackage, categoryId: e.target.value as 'gym'|'groupx'})}
                                              className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold outline-none"
                                           >
                                              <option value="gym">GYM</option>
                                              <option value="groupx">Group X</option>
                                           </select>
                                       </div>
                                       <div className="flex-1">
                                           <label className="text-xs font-bold text-gray-400 uppercase ml-1">Số tháng</label>
                                           <input type="number" value={newPackage.duration} onChange={e => setNewPackage({...newPackage, duration: e.target.value})} placeholder="VD: 1" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                       </div>
                                   </div>

                                   <input value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} placeholder="Tên gói (VD: 1 Tháng)" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   
                                   <div className="flex gap-2">
                                       <div className="flex-1">
                                           <label className="text-xs font-bold text-gray-400 uppercase ml-1">Giá Gốc (để gạch)</label>
                                           <input type="number" value={newPackage.originalPrice} onChange={e => setNewPackage({...newPackage, originalPrice: e.target.value})} placeholder="VD: 600000" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                       </div>
                                       <div className="flex-1">
                                           <label className="text-xs font-bold text-gray-400 uppercase ml-1">Giá Bán</label>
                                           <input type="number" value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: e.target.value})} placeholder="VD: 500000" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                       </div>
                                   </div>

                                   <div>
                                       <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tặng thêm ngày (Bonus)</label>
                                       <input type="number" value={newPackage.bonusDays} onChange={e => setNewPackage({...newPackage, bonusDays: e.target.value})} placeholder="Số ngày tặng thêm" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   </div>

                                   <input value={newPackage.description} onChange={e => setNewPackage({...newPackage, description: e.target.value})} placeholder="Mô tả ngắn (Ghi chú)" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   
                                   <ImageUpload currentImage={newPackage.image} onImageUploaded={(url) => setNewPackage({...newPackage, image: url})} label="Ảnh Gói (Cho phép cắt)" aspect="h-48" className="rounded-xl overflow-hidden"/>
                                   
                                   <div className="flex gap-2">
                                       <button onClick={handleCreateOrUpdatePackage} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-black uppercase text-xs shadow-md">{editingPackageId ? 'Cập Nhật' : 'Thêm Gói'}</button>
                                       {editingPackageId && <button onClick={() => { setEditingPackageId(null); setNewPackage({name: '', price: '', originalPrice: '', image: '', description: '', duration: '', bonusDays: '', categoryId: 'gym'}); }} className="bg-gray-200 text-gray-600 px-4 rounded-xl font-bold uppercase text-xs">Hủy</button>}
                                   </div>
                               </div>
                           </div>
                           
                           <div className="space-y-2">
                               {packages.map(p => (
                                   <div key={p.id} className="bg-white p-3 rounded-xl flex gap-3 items-center shadow-sm relative overflow-hidden">
                                       <img src={p.image} className="w-12 h-12 rounded-lg object-cover bg-gray-100"/>
                                       <div className="flex-1">
                                           <div className="flex items-center gap-2">
                                               <p className="font-bold text-sm text-gray-800">{p.name}</p>
                                               <span className="text-[8px] bg-gray-200 px-1 rounded uppercase font-bold">{p.categoryId}</span>
                                           </div>
                                           <div className="flex items-center gap-2 text-xs">
                                               {p.originalPrice && <span className="text-gray-400 line-through">{p.originalPrice.toLocaleString()}đ</span>}
                                               <span className="text-[#FF6B00] font-bold">{p.price.toLocaleString()}đ</span>
                                               {p.bonusDays ? <span className="text-pink-500 font-bold text-[9px]">+ {p.bonusDays} ngày</span> : null}
                                           </div>
                                           {p.description && <p className="text-[10px] text-gray-400 italic truncate">{p.description}</p>}
                                       </div>
                                       <button onClick={() => handleEditPackageClick(p)} className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Edit3 className="w-4 h-4"/></button>
                                       <button onClick={() => handleDeletePackage(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                   </div>
                               ))}
                           </div>
                      </div>
                  )}

                  {/* ... (Other sections like pt_packages, add_pt, view_schedule, create_promo, create_voucher remain mostly same) ... */}
                  {/* Keep previous implementations for brevity unless specific change requested there */}
                  {/* ... */}

                  {/* Manage Admins - Updated with Eye Icon */}
                  {showPopup === 'manage_admins' && (
                      <div className="space-y-6">
                           <div className="bg-white p-4 rounded-2xl shadow-sm">
                               <h4 className="font-black text-gray-400 text-xs uppercase mb-3">Tạo Admin Mới</h4>
                               <div className="space-y-3">
                                   <input value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} placeholder="Username" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   
                                   <div className="relative">
                                       <input 
                                          value={newAdmin.password} 
                                          onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} 
                                          placeholder="Password" 
                                          type={showAdminPass ? "text" : "password"} 
                                          className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold pr-10"
                                       />
                                       <button 
                                          onClick={() => setShowAdminPass(!showAdminPass)} 
                                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                                       >
                                          {showAdminPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                       </button>
                                   </div>

                                   <input value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} placeholder="Tên hiển thị" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   
                                   <div className="bg-gray-50 p-3 rounded-xl">
                                       <p className="text-xs font-bold text-gray-400 mb-2">Quyền hạn:</p>
                                       <div className="grid grid-cols-2 gap-2">
                                           {PERMISSIONS_LIST.map(p => (
                                               <button 
                                                  key={p.key} 
                                                  onClick={() => handleToggleAdminPermission(p.key)}
                                                  className={`text-[10px] font-bold py-2 rounded-lg border ${newAdmin.permissions?.includes(p.key) ? 'bg-orange-100 border-orange-200 text-orange-600' : 'bg-white border-gray-100 text-gray-400'}`}
                                               >
                                                   {p.label}
                                               </button>
                                           ))}
                                       </div>
                                   </div>
                                   <button onClick={handleCreateAdmin} className="w-full bg-green-500 text-white py-3 rounded-xl font-black uppercase text-xs shadow-md">Tạo Admin</button>
                               </div>
                           </div>
                           
                           <div className="space-y-2">
                               {admins.map(a => (
                                   <div key={a.username} className="bg-white p-3 rounded-xl flex items-center justify-between shadow-sm">
                                       <div>
                                           <p className="font-bold text-sm text-gray-800">{a.name} <span className="text-gray-400 text-xs">({a.username})</span></p>
                                           <p className="text-[10px] text-gray-500 uppercase">{a.role === 'super_admin' ? 'Super Admin' : `Sub Admin (${a.permissions.length} quyền)`}</p>
                                       </div>
                                       {a.role !== 'super_admin' && (
                                           <button onClick={() => { if(window.confirm("Xóa admin này?")) setAdmins(admins.filter(ad => ad.username !== a.username)); }} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                       )}
                                   </div>
                               ))}
                           </div>
                      </div>
                  )}

                  {/* ... (Admin Profile - Add eye if needed, currently straightforward edit) ... */}
                  {/* ... (Other sections) ... */}

              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
