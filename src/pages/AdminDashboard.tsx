import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, Promotion, Trainer, TrainingProgram, VoucherItem, PackageItem, PTPackage, AdminProfile, AdminPermission, Booking } from '../App';
import { 
  Check, X, Plus, Users, BarChart3, TrendingUp, 
  MessageSquare, Bell, Lock, Unlock, 
  ImageIcon, LogOut, Ticket, LayoutDashboard,
  Calendar, Settings, Search, Send, ArrowRight,
  Megaphone, UserPlus, ListFilter, Package, PauseCircle, Trash2, Dumbbell,
  UserCheck, Menu, Eye, ShieldAlert, BadgeCheck, Pencil, CreditCard, Image as ImageIcon2, Clock,
  CalendarCheck, AlertCircle, Save, Upload, Type, ScanFace, Phone, Edit3, ChevronRight, ChevronLeft, User as UserIcon, MoreHorizontal, Filter, CheckCircle2
} from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

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
  onUpdateAppConfig: (config: {heroImage: string, heroTitle: string, heroSubtitle: string, heroOverlayText?: string, heroOverlaySub?: string}) => void;
  
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
  
  // Form States
  const [giftDays, setGiftDays] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [newPromo, setNewPromo] = useState({ title: '', image: '' });
  const [newVoucher, setNewVoucher] = useState({ title: '', code: '', type: 'Gym' as const, value: 0.1, color: 'bg-orange-500', image: '' });
  const [newPT, setNewPT] = useState({ name: '', specialty: '', image: '', rating: 5 });
  
  // Package with Duration
  const [newPackage, setNewPackage] = useState({ name: '', price: '', image: '', description: '', duration: '' });
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  const [newPTPackage, setNewPTPackage] = useState({ name: '', price: '', sessions: '', image: '', description: '' });
  
  // Hero Config State
  const [configHero, setConfigHero] = useState({ image: '', title: '', subtitle: '', overlayText: '', overlaySub: '' });

  // Edit User State
  const [editingRealName, setEditingRealName] = useState('');
  const [editingUserAvatar, setEditingUserAvatar] = useState('');
  
  // Admin Management State
  const [newAdmin, setNewAdmin] = useState<Partial<AdminProfile>>({ username: '', password: '', name: '', role: 'sub_admin', permissions: [], settings: { showFloatingMenu: true, showPopupNoti: true } });

  // Admin Profile Edit State
  const [editAdminProfile, setEditAdminProfile] = useState<{name: string, phone: string, avatar: string, password: string}>({ name: '', phone: '', avatar: '', password: '' });
  const [isAdminFaceScanning, setIsAdminFaceScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Floating Menu State
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);

  // Admin Notification Toast State (Auto Hide)
  const [showAdminToast, setShowAdminToast] = useState(true);

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
          setConfigHero({ 
              image: heroImage, 
              title: heroTitle, 
              subtitle: heroSubtitle,
              overlayText: heroOverlayText || 'THAY ĐỔI BẢN THÂN', 
              overlaySub: heroOverlaySub || 'Tại Sip Gym Nhà Bè'
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
  const pendingAccounts = allUsers.filter(u => u.accountStatus === 'Pending'); // New: Pending Accounts
  
  const totalPendingApprovals = pendingUsers.length + pendingPTUsers.length + pendingPreserveUsers.length + pendingBookings.length + pendingAccounts.length;

  // Active Users only for "View Users"
  const activeUsers = allUsers.filter(u => u.accountStatus !== 'Pending');

  // Logic to auto-hide Admin Notification Toast
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

  // Filter Users Search (Only show active users in list search)
  const filteredUsers = activeUsers.filter(u => 
     u.phone.includes(searchTerm) || 
     (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (u.realName && u.realName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const pendingSupportCount = allUsers.filter(u => {
    const lastMsg = u.messages?.[u.messages.length - 1];
    return lastMsg && lastMsg.sender === 'user';
  }).length;

  // Camera Logic for Admin Face ID
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

  const handleDeleteUser = () => { if (!selectedUserPhone) return; if (window.confirm("BẠN CÓ CHẮC MUỐN XÓA USER NÀY? Hành động này không thể hoàn tác.")) { const newUsers = allUsers.filter(u => u.phone !== selectedUserPhone); setAllUsers(newUsers); setShowPopup(null); alert("Đã xóa user thành công."); } };
  
  const handleApprove = (phone: string) => { 
      const updatedUsers = allUsers.map(u => { 
          if (u.phone === phone && u.subscription) { 
              const startDate = Date.now(); 
              const expireDate = startDate + u.subscription.months * 30 * 24 * 60 * 60 * 1000; 
              return { 
                  ...u, 
                  subscription: { ...u.subscription, status: 'Active' as const, startDate, expireDate }, 
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
          heroImage: configHero.image, 
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
      let total = 0; 
      const checkDate = new Date(revenueDate).toDateString(); 
      allUsers.forEach(user => { 
          if (user.subscription && user.subscription.status === 'Active' && user.subscription.startDate) { 
              if (new Date(user.subscription.startDate).toDateString() === checkDate) { 
                  total += (user.subscription.paidAmount || user.subscription.price); 
              } 
          } 
          if (user.ptSubscription && user.ptSubscription.status === 'Active' && user.ptSubscription.startDate) { 
              if (new Date(user.ptSubscription.startDate).toDateString() === checkDate) { 
                  total += (user.ptSubscription.paidAmount || user.ptSubscription.price); 
              } 
          } 
      }); 
      return total; 
  };

  const calculateTotalRevenue = () => {
      let total = 0;
      allUsers.forEach(user => {
          if (user.subscription && user.subscription.status === 'Active') total += (user.subscription.paidAmount || user.subscription.price);
          if (user.ptSubscription && user.ptSubscription.status === 'Active') total += (user.ptSubscription.paidAmount || user.ptSubscription.price);
      });
      return total;
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
              // Send notification to user about new message
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
  
  // CRUD Functions...
  const handleCreateOrUpdatePackage = () => { 
      if (!newPackage.name || !newPackage.price || !newPackage.duration) return alert("Vui lòng nhập đủ thông tin: Tên, Giá, Số tháng"); 
      
      if (editingPackageId) {
          // Update
          const updatedPackages = packages.map(p => p.id === editingPackageId ? {
              ...p,
              name: newPackage.name,
              price: parseInt(newPackage.price.toString()),
              image: newPackage.image || p.image,
              description: newPackage.description,
              duration: parseInt(newPackage.duration)
          } : p);
          setPackages(updatedPackages);
          setEditingPackageId(null);
      } else {
          // Create
          const pkg: PackageItem = { 
              id: Date.now().toString(), 
              name: newPackage.name, 
              price: parseInt(newPackage.price.toString()), 
              image: newPackage.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300',
              description: newPackage.description,
              duration: parseInt(newPackage.duration)
          }; 
          setPackages([...packages, pkg]); 
      }
      setNewPackage({ name: '', price: '', image: '', description: '', duration: '' }); 
      alert(editingPackageId ? "Cập nhật gói thành công" : "Thêm gói tập thành công"); 
  };

  const handleEditPackageClick = (pkg: PackageItem) => {
      setNewPackage({
          name: pkg.name,
          price: pkg.price.toString(),
          image: pkg.image,
          description: pkg.description || '',
          duration: pkg.duration.toString()
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

  // Helper for floating menu item
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
  
  // Sort users for chat list (active/pending first)
  const sortedChatUsers = allUsers.filter(u => u.messages.length > 0 || u.subscription?.status === 'Pending' || u.ptSubscription?.status === 'Pending').sort((a, b) => {
      const lastMsgA = a.messages[a.messages.length - 1];
      const lastMsgB = b.messages[b.messages.length - 1];
      const timeA = lastMsgA ? lastMsgA.timestamp : 0;
      const timeB = lastMsgB ? lastMsgB.timestamp : 0;
      return timeB - timeA;
  });

  return (
    <div className="bg-[#FFF7ED] min-h-full text-gray-700 pb-20 font-sans selection:bg-orange-200 relative">
      {/* Header */}
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

      {/* Admin Notification Popup (Clickable Toast - Auto Hide) */}
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
            
            {/* Countdown bar visual */}
            <div className="absolute bottom-0 left-0 h-1 bg-orange-100 w-full">
                <div className="h-full bg-orange-400 animate-[shrink_6s_linear_forwards] origin-left"></div>
            </div>
            <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
         </div>
      )}

      <main className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Widget */}
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

          {/* Support Widget */}
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

          {/* Users Widget */}
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
          
           {/* Settings Toggle Card */}
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

        {/* --- MENU ADMIN GRID --- */}
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

      {/* --- POPUPS SECTION (FULL SCREEN MOBILE) --- */}
      {showPopup && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:px-4 animate-in fade-in duration-300">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowPopup(null)} />
           
           {/* Modal Content */}
           <div className="relative w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-20 sm:zoom-in-95">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                 <h3 className="font-black text-gray-800 uppercase italic text-lg">
                    {showPopup === 'pending_approvals' && 'Duyệt Yêu Cầu'}
                    {showPopup === 'user_list' && 'Danh Sách Hội Viên'}
                    {showPopup === 'broadcast' && 'Gửi Thông Báo'}
                    {showPopup === 'revenue_report' && 'Báo Cáo Doanh Thu'}
                    {showPopup === 'support_list' && 'Hỗ Trợ Khách Hàng'}
                    {showPopup === 'packages' && 'Quản Lý Gói Gym'}
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
                 </h3>
                 <button onClick={() => setShowPopup(null)} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 bg-[#F7FAFC]">
                  {/* IMPL FOR EACH POPUP TYPE */}
                  
                  {/* 1. Pending Approvals */}
                  {showPopup === 'pending_approvals' && (
                      <div className="space-y-6">
                          {/* Pending Accounts */}
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

                          {/* Bookings */}
                          {pendingBookings.length > 0 && (
                             <div>
                                <h4 className="font-black text-gray-400 text-xs uppercase mb-2">Lịch Đặt PT ({pendingBookings.length})</h4>
                                <div className="space-y-2">
                                   {pendingBookings.map(b => (
                                      <div key={b.id} className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
                                         <div className="flex justify-between items-start mb-2">
                                            <div>
                                               <p className="font-bold text-gray-800 text-sm">{b.userName} <span className="text-gray-400 font-normal">đặt</span> {b.trainerName}</p>
                                               <p className="text-xs text-gray-500 font-medium">{b.date} • {b.timeSlot}</p>
                                            </div>
                                         </div>
                                         <div className="flex gap-2 mt-2">
                                            <button onClick={() => handleBookingAction(b.id, 'approve')} className="flex-1 bg-green-500 text-white py-2 rounded-xl text-xs font-bold uppercase">Duyệt</button>
                                            <button onClick={() => handleBookingAction(b.id, 'reject')} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-bold uppercase">Từ chối</button>
                                         </div>
                                      </div>
                                   ))}
                                </div>
                             </div>
                          )}

                          {/* Subscriptions */}
                          {pendingUsers.length > 0 && (
                              <div>
                                  <h4 className="font-black text-gray-400 text-xs uppercase mb-2">Đăng Ký Gói Gym ({pendingUsers.length})</h4>
                                  <div className="space-y-2">
                                      {pendingUsers.map(u => (
                                          <div key={u.phone} className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
                                              <p className="font-bold text-gray-800 text-sm">{u.realName || u.name} - {u.phone}</p>
                                              <p className="text-xs text-blue-500 font-bold uppercase mt-1">Gói: {u.subscription?.name} ({u.subscription?.months} tháng)</p>
                                              <p className="text-xs text-gray-500">Giá: {u.subscription?.price.toLocaleString()}đ</p>
                                              <div className="flex gap-2 mt-3">
                                                  <button onClick={() => handleApprove(u.phone)} className="flex-1 bg-blue-500 text-white py-2 rounded-xl text-xs font-bold uppercase shadow-md shadow-blue-200">Xác Nhận Đã Thu Tiền</button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}
                          
                          {/* PT Subscriptions */}
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

                          {/* Preservations */}
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

                  {/* User List */}
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

                  {/* User Settings */}
                  {showPopup === 'user_settings' && selectedUser && (
                      <div className="space-y-4">
                          <div className="bg-white p-4 rounded-2xl flex flex-col items-center">
                              <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border-2 border-orange-100">
                                  <img src={editingUserAvatar || selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.phone}`} className="w-full h-full object-cover"/>
                              </div>
                              <input value={editingRealName} onChange={e => setEditingRealName(e.target.value)} className="text-center font-black text-lg bg-transparent border-b border-gray-200 focus:border-orange-500 outline-none pb-1" placeholder="Tên thật"/>
                              <p className="text-xs font-bold text-gray-400 mt-1">{selectedUser.phone}</p>
                              <div className="flex justify-center mt-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${selectedUser.accountStatus === 'Active' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                      {selectedUser.accountStatus === 'Active' ? 'Active' : 'Pending Approval'}
                                  </span>
                              </div>
                              
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

                  {/* Broadcast */}
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

                  {/* Revenue Report */}
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

                  {/* Support List (Chat List) */}
                  {showPopup === 'support_list' && (
                      <div className="space-y-2">
                          {sortedChatUsers.map(u => {
                              const lastMsg = u.messages[u.messages.length - 1];
                              const isUnread = lastMsg && lastMsg.sender === 'user'; // Basic unread logic
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

                  {/* Chat Detail */}
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

                  {/* Config Hero */}
                  {showPopup === 'config_hero' && (
                      <div className="space-y-4">
                          <div>
                              <label className="text-xs font-bold text-gray-400 uppercase">Tiêu đề lớn</label>
                              <textarea value={configHero.title} onChange={e => setConfigHero({...configHero, title: e.target.value})} className="w-full bg-white rounded-xl p-3 font-bold text-sm mt-1"/>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-400 uppercase">Phụ đề (Tagline)</label>
                              <input value={configHero.subtitle} onChange={e => setConfigHero({...configHero, subtitle: e.target.value})} className="w-full bg-white rounded-xl p-3 font-bold text-sm mt-1"/>
                          </div>
                          <div>
                             <label className="text-xs font-bold text-gray-400 uppercase">Overlay Text (Trên ảnh)</label>
                             <input value={configHero.overlayText} onChange={e => setConfigHero({...configHero, overlayText: e.target.value})} className="w-full bg-white rounded-xl p-3 font-bold text-sm mt-1"/>
                          </div>
                          <div>
                             <label className="text-xs font-bold text-gray-400 uppercase">Overlay Sub (Trên ảnh)</label>
                             <input value={configHero.overlaySub} onChange={e => setConfigHero({...configHero, overlaySub: e.target.value})} className="w-full bg-white rounded-xl p-3 font-bold text-sm mt-1"/>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Ảnh nền Banner</label>
                              <ImageUpload currentImage={configHero.image} onImageUploaded={(url) => setConfigHero({...configHero, image: url})} aspect="aspect-square" className="rounded-xl overflow-hidden"/>
                          </div>
                          <button onClick={handleSaveAppConfig} className="w-full bg-purple-500 text-white py-3 rounded-xl font-black uppercase text-sm shadow-lg">Lưu Cấu Hình</button>
                      </div>
                  )}

                  {/* Packages Manager */}
                  {showPopup === 'packages' && (
                      <div className="space-y-6">
                           <div className="bg-white p-4 rounded-2xl shadow-sm">
                               <h4 className="font-black text-gray-400 text-xs uppercase mb-3">{editingPackageId ? 'Sửa Gói' : 'Thêm Gói Mới'}</h4>
                               <div className="space-y-3">
                                   <input value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} placeholder="Tên gói (VD: 1 Tháng)" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   <input type="number" value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: e.target.value})} placeholder="Giá tiền" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   <input type="number" value={newPackage.duration} onChange={e => setNewPackage({...newPackage, duration: e.target.value})} placeholder="Số tháng (VD: 1, 3, 6)" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   <input value={newPackage.description} onChange={e => setNewPackage({...newPackage, description: e.target.value})} placeholder="Mô tả ngắn" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   <ImageUpload currentImage={newPackage.image} onImageUploaded={(url) => setNewPackage({...newPackage, image: url})} label="Ảnh Gói" aspect="h-48" className="rounded-xl overflow-hidden"/>
                                   
                                   <div className="flex gap-2">
                                       <button onClick={handleCreateOrUpdatePackage} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-black uppercase text-xs shadow-md">{editingPackageId ? 'Cập Nhật' : 'Thêm Gói'}</button>
                                       {editingPackageId && <button onClick={() => { setEditingPackageId(null); setNewPackage({name: '', price: '', image: '', description: '', duration: ''}); }} className="bg-gray-200 text-gray-600 px-4 rounded-xl font-bold uppercase text-xs">Hủy</button>}
                                   </div>
                               </div>
                           </div>
                           
                           <div className="space-y-2">
                               {packages.map(p => (
                                   <div key={p.id} className="bg-white p-3 rounded-xl flex gap-3 items-center shadow-sm">
                                       <img src={p.image} className="w-12 h-12 rounded-lg object-cover bg-gray-100"/>
                                       <div className="flex-1">
                                           <p className="font-bold text-sm text-gray-800">{p.name}</p>
                                           <p className="text-xs text-gray-500">{p.price.toLocaleString()}đ • {p.duration} tháng</p>
                                       </div>
                                       <button onClick={() => handleEditPackageClick(p)} className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Edit3 className="w-4 h-4"/></button>
                                       <button onClick={() => handleDeletePackage(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                   </div>
                               ))}
                           </div>
                      </div>
                  )}

                  {/* PT Packages Manager */}
                  {showPopup === 'pt_packages' && (
                       <div className="space-y-6">
                           <div className="bg-white p-4 rounded-2xl shadow-sm">
                               <h4 className="font-black text-gray-400 text-xs uppercase mb-3">Thêm Gói PT Mới</h4>
                               <div className="space-y-3">
                                   <input value={newPTPackage.name} onChange={e => setNewPTPackage({...newPTPackage, name: e.target.value})} placeholder="Tên gói PT" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   <input type="number" value={newPTPackage.price} onChange={e => setNewPTPackage({...newPTPackage, price: e.target.value})} placeholder="Giá tiền" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   <input type="number" value={newPTPackage.sessions} onChange={e => setNewPTPackage({...newPTPackage, sessions: e.target.value})} placeholder="Số buổi" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   <input value={newPTPackage.description} onChange={e => setNewPTPackage({...newPTPackage, description: e.target.value})} placeholder="Mô tả" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   <ImageUpload currentImage={newPTPackage.image} onImageUploaded={(url) => setNewPTPackage({...newPTPackage, image: url})} label="Ảnh Gói" aspect="h-48" className="rounded-xl overflow-hidden"/>
                                   <button onClick={handleCreatePTPackage} className="w-full bg-green-500 text-white py-3 rounded-xl font-black uppercase text-xs shadow-md">Thêm Gói PT</button>
                               </div>
                           </div>
                           <div className="space-y-2">
                               {ptPackages.map(p => (
                                   <div key={p.id} className="bg-white p-3 rounded-xl flex gap-3 items-center shadow-sm">
                                       <img src={p.image} className="w-12 h-12 rounded-lg object-cover bg-gray-100"/>
                                       <div className="flex-1">
                                           <p className="font-bold text-sm text-gray-800">{p.name}</p>
                                           <p className="text-xs text-gray-500">{p.price.toLocaleString()}đ • {p.sessions} buổi</p>
                                       </div>
                                       <button onClick={() => handleDeletePTPackage(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                   </div>
                               ))}
                           </div>
                       </div>
                  )}

                  {/* Trainers Manager */}
                  {showPopup === 'add_pt' && (
                       <div className="space-y-6">
                           <div className="bg-white p-4 rounded-2xl shadow-sm">
                               <h4 className="font-black text-gray-400 text-xs uppercase mb-3">Thêm PT Mới</h4>
                               <div className="space-y-3">
                                   <input value={newPT.name} onChange={e => setNewPT({...newPT, name: e.target.value})} placeholder="Tên Huấn Luyện Viên" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   <input value={newPT.specialty} onChange={e => setNewPT({...newPT, specialty: e.target.value})} placeholder="Chuyên môn (VD: Bodybuilding)" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   <ImageUpload currentImage={newPT.image} onImageUploaded={(url) => setNewPT({...newPT, image: url})} label="Ảnh Chân Dung" aspect="aspect-square" className="rounded-xl overflow-hidden"/>
                                   <button onClick={handleCreatePT} className="w-full bg-green-500 text-white py-3 rounded-xl font-black uppercase text-xs shadow-md">Thêm PT</button>
                               </div>
                           </div>
                           <div className="space-y-2">
                               {trainers.map(t => (
                                   <div key={t.id} className="bg-white p-3 rounded-xl flex gap-3 items-center shadow-sm">
                                       <img src={t.image} className="w-12 h-12 rounded-lg object-cover bg-gray-100"/>
                                       <div className="flex-1">
                                           <p className="font-bold text-sm text-gray-800">{t.name}</p>
                                           <p className="text-xs text-gray-500">{t.specialty}</p>
                                       </div>
                                       <button onClick={() => handleDeletePT(t.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                   </div>
                               ))}
                           </div>
                       </div>
                  )}
                  
                  {/* View Schedule */}
                  {showPopup === 'view_schedule' && (
                      <div className="space-y-4">
                          <p className="text-center text-gray-400 text-xs font-bold uppercase mb-2">Hôm nay: {new Date().toLocaleDateString('vi-VN')}</p>
                          <div className="space-y-2">
                              {bookings.filter(b => b.status === 'Approved').sort((a,b) => b.timestamp - a.timestamp).map(b => (
                                  <div key={b.id} className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-green-500 flex justify-between items-center">
                                      <div>
                                          <p className="font-bold text-gray-800 text-sm">{b.date}</p>
                                          <p className="text-xs font-bold text-gray-600">{b.timeSlot}</p>
                                          <p className="text-[10px] text-gray-400 mt-1">PT: {b.trainerName} - Member: {b.userName}</p>
                                      </div>
                                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-[10px] font-black uppercase">Đã Duyệt</span>
                                  </div>
                              ))}
                              {bookings.filter(b => b.status === 'Approved').length === 0 && (
                                  <p className="text-center text-gray-400 text-xs py-10">Chưa có lịch tập nào được duyệt.</p>
                              )}
                          </div>
                      </div>
                  )}

                  {/* Create Promo */}
                  {showPopup === 'create_promo' && (
                      <div className="space-y-6">
                           <div className="bg-white p-4 rounded-2xl shadow-sm">
                               <div className="space-y-3">
                                   <input value={newPromo.title} onChange={e => setNewPromo({...newPromo, title: e.target.value})} placeholder="Tiêu đề khuyến mãi" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   <ImageUpload currentImage={newPromo.image} onImageUploaded={(url) => setNewPromo({...newPromo, image: url})} label="Banner Khuyến Mãi" aspect="aspect-video" className="rounded-xl overflow-hidden"/>
                                   <button onClick={handleCreatePromo} className="w-full bg-green-500 text-white py-3 rounded-xl font-black uppercase text-xs shadow-md">Thêm Khuyến Mãi</button>
                               </div>
                           </div>
                           <div className="space-y-2">
                               {promotions.map(p => (
                                   <div key={p.id} className="bg-white p-3 rounded-xl flex gap-3 items-center shadow-sm">
                                       <img src={p.image} className="w-16 h-10 rounded-lg object-cover bg-gray-100"/>
                                       <div className="flex-1">
                                           <p className="font-bold text-sm text-gray-800">{p.title}</p>
                                       </div>
                                       <button onClick={() => handleDeletePromo(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                   </div>
                               ))}
                           </div>
                      </div>
                  )}

                  {/* Create Voucher */}
                  {showPopup === 'create_voucher' && (
                      <div className="space-y-6">
                           <div className="bg-white p-4 rounded-2xl shadow-sm">
                               <div className="space-y-3">
                                   <input value={newVoucher.title} onChange={e => setNewVoucher({...newVoucher, title: e.target.value})} placeholder="Tên Voucher" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   <input value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value.toUpperCase()})} placeholder="Mã Code (VD: SALE50)" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold uppercase"/>
                                   <div className="flex gap-2">
                                       <select value={newVoucher.type} onChange={e => setNewVoucher({...newVoucher, type: e.target.value as any})} className="flex-1 bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold">
                                           <option value="Gym">Gym</option>
                                           <option value="PT">PT</option>
                                           <option value="Gift">Gift (Tất cả)</option>
                                       </select>
                                       <input type="number" step="0.1" value={newVoucher.value} onChange={e => setNewVoucher({...newVoucher, value: parseFloat(e.target.value)})} placeholder="Giảm (0.1 = 10%)" className="flex-1 bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   </div>
                                   <button onClick={handleCreateVoucher} className="w-full bg-green-500 text-white py-3 rounded-xl font-black uppercase text-xs shadow-md">Thêm Voucher</button>
                               </div>
                           </div>
                           <div className="space-y-2">
                               {vouchers.map(v => (
                                   <div key={v.id} className="bg-white p-3 rounded-xl flex gap-3 items-center shadow-sm">
                                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs ${v.color || 'bg-blue-500'}`}>{v.value*100}%</div>
                                       <div className="flex-1">
                                           <p className="font-bold text-sm text-gray-800">{v.title}</p>
                                           <p className="text-xs text-gray-500">Code: {v.code}</p>
                                       </div>
                                       <button onClick={() => handleDeleteVoucher(v.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                   </div>
                               ))}
                           </div>
                      </div>
                  )}

                  {/* Manage Admins (Super Admin Only) */}
                  {showPopup === 'manage_admins' && (
                      <div className="space-y-6">
                           <div className="bg-white p-4 rounded-2xl shadow-sm">
                               <h4 className="font-black text-gray-400 text-xs uppercase mb-3">Tạo Admin Mới</h4>
                               <div className="space-y-3">
                                   <input value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} placeholder="Username" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
                                   <input value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} placeholder="Password" type="password" className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold"/>
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

                  {/* Admin Profile */}
                  {showPopup === 'admin_profile' && (
                      <div className="space-y-4">
                           <div className="flex justify-center mb-4">
                                <ImageUpload currentImage={editAdminProfile.avatar} onImageUploaded={(url) => setEditAdminProfile({...editAdminProfile, avatar: url})} aspect="aspect-square" className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-50 shadow-lg"/>
                           </div>
                           
                           <div>
                               <label className="text-xs font-bold text-gray-400 uppercase">Tên hiển thị</label>
                               <input value={editAdminProfile.name} onChange={e => setEditAdminProfile({...editAdminProfile, name: e.target.value})} className="w-full bg-white rounded-xl p-3 font-bold text-sm mt-1"/>
                           </div>
                           <div>
                               <label className="text-xs font-bold text-gray-400 uppercase">Số điện thoại (Khôi phục)</label>
                               <input value={editAdminProfile.phone} onChange={e => setEditAdminProfile({...editAdminProfile, phone: e.target.value})} className="w-full bg-white rounded-xl p-3 font-bold text-sm mt-1"/>
                           </div>
                           <div>
                               <label className="text-xs font-bold text-gray-400 uppercase">Mật khẩu</label>
                               <input type="password" value={editAdminProfile.password} onChange={e => setEditAdminProfile({...editAdminProfile, password: e.target.value})} className="w-full bg-white rounded-xl p-3 font-bold text-sm mt-1"/>
                           </div>
                           
                           <div className="bg-white p-4 rounded-xl mt-2">
                               <p className="text-xs font-bold text-gray-400 uppercase mb-3">Face ID Đăng Nhập</p>
                               {isAdminFaceScanning ? (
                                   <div className="space-y-2">
                                       <div className="bg-black aspect-square rounded-xl overflow-hidden border-2 border-orange-500 relative">
                                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                                       </div>
                                       <button onClick={captureAdminFace} className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold uppercase text-xs">Chụp & Lưu</button>
                                   </div>
                               ) : (
                                   <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ScanFace className="w-5 h-5 text-gray-500"/>
                                            <span className="text-xs font-bold text-gray-600">{currentAdmin?.faceData ? 'Đã cài đặt' : 'Chưa cài đặt'}</span>
                                        </div>
                                        <button onClick={() => { setIsAdminFaceScanning(true); startAdminCamera(); }} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-xs font-bold uppercase">Thiết lập lại</button>
                                   </div>
                               )}
                           </div>
                           
                           <div className="bg-white p-4 rounded-xl mt-2">
                               <p className="text-xs font-bold text-gray-400 uppercase mb-3">Cài đặt Admin</p>
                               <div className="flex items-center justify-between mb-2">
                                   <span className="text-sm font-bold text-gray-700">Floating Menu</span>
                                   <button onClick={toggleFloatingMenuSetting} className={`w-10 h-6 rounded-full p-1 transition-colors ${currentAdmin?.settings.showFloatingMenu ? 'bg-green-500' : 'bg-gray-200'}`}>
                                       <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${currentAdmin?.settings.showFloatingMenu ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                   </button>
                               </div>
                               <div className="flex items-center justify-between">
                                   <span className="text-sm font-bold text-gray-700">Thông báo Popup</span>
                                   <button onClick={togglePopupNotiSetting} className={`w-10 h-6 rounded-full p-1 transition-colors ${currentAdmin?.settings.showPopupNoti ? 'bg-green-500' : 'bg-gray-200'}`}>
                                       <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${currentAdmin?.settings.showPopupNoti ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                   </button>
                               </div>
                           </div>

                           <button onClick={handleSaveAdminProfile} className="w-full bg-[#FF6B00] text-white py-3 rounded-xl font-black uppercase text-sm shadow-lg">Lưu Hồ Sơ</button>
                      </div>
                  )}

              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;