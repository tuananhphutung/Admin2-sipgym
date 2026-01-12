
import React, { useState, useMemo, useEffect } from 'react';
import { X, CheckCircle2, Copy, Wallet, ArrowRight, CreditCard, Ticket, Check, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PackageItem, PTPackage, VoucherItem, UserProfile } from '../App';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'gym' | 'pt';
  packages?: PackageItem[]; 
  ptPackage?: PTPackage; 
  selectedPackageInit?: PackageItem | null; 
  
  vouchers: VoucherItem[];
  user: UserProfile | null;
  userReferralDiscount?: number; 
  userDiscountReason?: string;
  
  onConfirm: (data: any) => void; 
}

const QR_IMAGE_URL = "https://phukienlimousine.vn/wp-content/uploads/2025/12/z6337821633527_5238255979c5950d2432822a16d863e4.jpg"; 

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, onClose, type, packages = [], ptPackage, selectedPackageInit, vouchers, user, userReferralDiscount = 0, userDiscountReason, onConfirm 
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'voucher' | 'payment_method' | 'transfer_info' | 'success'>('voucher');
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(selectedPackageInit || null);
  
  // Voucher State
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherItem | null>(null);
  
  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Transfer'>('Transfer');

  useEffect(() => {
     if (selectedPackageInit) setSelectedPackage(selectedPackageInit);
     setStep('voucher');
     setAppliedVoucher(null);
     setVoucherCode('');
  }, [isOpen, selectedPackageInit]);

  const calculation = useMemo(() => {
      let basePrice = 0;
      let duration = 0;

      if (type === 'gym' && selectedPackage) {
          basePrice = selectedPackage.price;
          duration = selectedPackage.duration;
      } else if (type === 'pt' && ptPackage) {
          basePrice = ptPackage.price;
      }
      
      const referralDiscAmount = basePrice * userReferralDiscount;
      let priceAfterReferral = basePrice - referralDiscAmount;
      
      let voucherDiscAmount = 0;
      if (appliedVoucher) {
          voucherDiscAmount = priceAfterReferral * appliedVoucher.value;
      }

      const finalPrice = Math.round(priceAfterReferral - voucherDiscAmount);

      return { basePrice, duration, referralDiscAmount, voucherDiscAmount, finalPrice };
  }, [type, selectedPackage, ptPackage, userReferralDiscount, appliedVoucher]);

  const handleApplyVoucher = (code: string) => {
      if (!code) return;
      const found = vouchers.find(v => v.code === code && (v.type === 'Gift' || v.type.toLowerCase() === type || (v.type === 'Gym' && type === 'gym')));
      if (found) {
          setAppliedVoucher(found);
          setVoucherCode(code);
      } else {
          alert("Mã không hợp lệ hoặc không áp dụng cho gói này.");
          setAppliedVoucher(null);
      }
  };

  const proceedToPayment = () => {
      setStep('payment_method');
  };

  const confirmPaymentMethod = () => {
      // Trigger update immediately
      finish();
  };

  const finish = () => {
      onConfirm({
          packageName: type === 'gym' ? selectedPackage?.name : ptPackage?.name,
          months: type === 'gym' ? selectedPackage?.duration : 0, 
          price: calculation.finalPrice,
          method: paymentMethod,
          voucherCode: appliedVoucher?.code
      });
      
      if (paymentMethod === 'Cash') {
          setStep('success');
      } else {
          setStep('transfer_info'); // Show QR code first
      }
  };
  
  const handleCompleteTransfer = () => {
      // User says they transferred
      navigate('/'); // Go back home
      onClose();
  };

  const handleCloseSuccess = () => {
      navigate('/');
      onClose();
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Đã sao chép: " + text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-[430px] bg-white rounded-[24px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-5 flex justify-between items-center border-b border-gray-50 bg-white sticky top-0 z-10">
          <h2 className="text-lg font-black text-gray-800 uppercase italic tracking-tight">
            {step === 'voucher' && 'Xác Nhận & Ưu Đãi'}
            {step === 'payment_method' && 'Hình Thức Thanh Toán'}
            {step === 'transfer_info' && 'Chuyển Khoản'}
            {step === 'success' && 'Hoàn Tất'}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar p-6 bg-[#F9FAFB]">
            
            {/* STEP 1: VOUCHER & SUMMARY */}
            {step === 'voucher' && (
                <div className="space-y-6">
                    {/* Item Info */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                             <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                 <img src={type === 'gym' ? selectedPackage?.image : ptPackage?.image} className="w-full h-full object-cover" alt="pkg"/>
                             </div>
                             <div>
                                 <p className="font-black text-gray-800 text-sm">{type === 'gym' ? selectedPackage?.name : ptPackage?.name}</p>
                                 <p className="text-xs text-gray-500 font-bold">{type === 'gym' ? `${selectedPackage?.duration} tháng` : `${ptPackage?.sessions} buổi`}</p>
                             </div>
                        </div>
                        
                        <div className="space-y-2 text-xs font-medium text-gray-500">
                            <div className="flex justify-between">
                                <span>Giá gốc</span>
                                <span>{calculation.basePrice.toLocaleString()}đ</span>
                            </div>
                            {userReferralDiscount > 0 && (
                                <div className="flex justify-between text-pink-500 font-bold">
                                    <span>{userDiscountReason}</span>
                                    <span>-{Math.round(calculation.referralDiscAmount).toLocaleString()}đ</span>
                                </div>
                            )}
                            {appliedVoucher && (
                                <div className="flex justify-between text-blue-500 font-bold">
                                    <span>Voucher ({appliedVoucher.code})</span>
                                    <span>-{Math.round(calculation.voucherDiscAmount).toLocaleString()}đ</span>
                                </div>
                            )}
                            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between text-lg font-black text-[#FF6B00]">
                                <span>Thành tiền</span>
                                <span>{calculation.finalPrice.toLocaleString()}đ</span>
                            </div>
                        </div>
                    </div>

                    {/* Voucher Section */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-2 block flex items-center gap-1"><Ticket className="w-3 h-3"/> Mã Khuyến Mãi</label>
                        
                        {/* Input */}
                        <div className="flex gap-2 mb-3">
                            <input 
                                value={voucherCode}
                                onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                                placeholder="Nhập mã..."
                                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 text-sm font-bold uppercase outline-none focus:border-blue-500"
                            />
                            <button onClick={() => handleApplyVoucher(voucherCode)} className="bg-blue-500 text-white px-4 rounded-xl font-bold text-xs uppercase shadow-md active:scale-95 transition-transform">Áp Dụng</button>
                        </div>

                        {/* Saved Vouchers */}
                        <p className="text-[10px] font-bold text-gray-400 mb-2 ml-1">Kho Voucher của bạn:</p>
                        <div className="flex flex-col gap-2">
                            {vouchers.filter(v => (v.type === 'Gift' || v.type.toLowerCase() === type || (v.type === 'Gym' && type === 'gym'))).map(v => (
                                <div key={v.id} className="bg-white border border-gray-200 p-2 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 ${v.color || 'bg-blue-500'} rounded-lg flex items-center justify-center text-white font-bold text-[10px]`}>%</div>
                                        <div>
                                            <p className="text-xs font-black text-gray-800">{v.code}</p>
                                            <p className="text-[9px] text-gray-500">Giảm {v.value * 100}%</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleApplyVoucher(v.code)} className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-lg">Dùng ngay</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={proceedToPayment} className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black uppercase shadow-lg shadow-orange-200 flex items-center justify-center gap-2 active:scale-95 transition-transform sticky bottom-0">
                        Tiếp Tục <ArrowRight className="w-5 h-5"/>
                    </button>
                </div>
            )}

            {/* STEP 2: PAYMENT METHOD */}
            {step === 'payment_method' && (
                <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase text-center mb-2">Chọn phương thức thanh toán</p>
                    
                    <button 
                        onClick={() => setPaymentMethod('Cash')}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentMethod === 'Cash' ? 'border-[#FF6B00] bg-orange-50' : 'border-gray-200 bg-white'}`}
                    >
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"><Wallet className="w-6 h-6"/></div>
                        <div className="text-left flex-1">
                            <p className="font-black text-gray-800 text-sm">Tiền Mặt</p>
                            <p className="text-[10px] text-gray-500">Thanh toán trực tiếp tại quầy lễ tân</p>
                        </div>
                        {paymentMethod === 'Cash' && <CheckCircle2 className="w-6 h-6 text-[#FF6B00]"/>}
                    </button>

                    <button 
                        onClick={() => setPaymentMethod('Transfer')}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentMethod === 'Transfer' ? 'border-[#FF6B00] bg-orange-50' : 'border-gray-200 bg-white'}`}
                    >
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><CreditCard className="w-6 h-6"/></div>
                        <div className="text-left flex-1">
                            <p className="font-black text-gray-800 text-sm">Chuyển Khoản</p>
                            <p className="text-[10px] text-gray-500">Quét mã QR VietQR nhanh chóng</p>
                        </div>
                        {paymentMethod === 'Transfer' && <CheckCircle2 className="w-6 h-6 text-[#FF6B00]"/>}
                    </button>

                    <button onClick={confirmPaymentMethod} className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black uppercase shadow-lg mt-4 active:scale-95 transition-transform">
                        {paymentMethod === 'Cash' ? 'Xác Nhận Đã Thanh Toán' : 'Tiếp Tục'}
                    </button>
                </div>
            )}

            {/* STEP 3: TRANSFER INFO */}
            {step === 'transfer_info' && (
                <div className="space-y-6">
                    <div className="bg-white border-2 border-[#FF6B00] rounded-3xl p-4 text-center relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 left-0 bg-[#FF6B00] text-white px-3 py-1 rounded-br-xl text-[10px] font-bold">Quét mã QR</div>
                        <div className="w-full aspect-square bg-gray-100 rounded-xl mb-2 overflow-hidden">
                            <img src={QR_IMAGE_URL} alt="VietQR" className="w-full h-full object-contain" />
                        </div>
                        <p className="font-black text-2xl text-gray-800">{calculation.finalPrice.toLocaleString()}đ</p>
                        <div className="bg-gray-100 p-2 rounded-xl mt-2 flex justify-between items-center px-4">
                            <span className="text-xs text-gray-500 font-medium">Nội dung CK: <span className="text-gray-900 font-bold select-all">T{Date.now().toString().slice(-6)}</span></span>
                            <button onClick={() => copyToClipboard(`T${Date.now().toString().slice(-6)}`)}><Copy className="w-4 h-4 text-blue-500"/></button>
                        </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl flex items-start gap-3">
                        <Clock className="w-5 h-5 text-orange-500 shrink-0 animate-pulse mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-orange-700 uppercase mb-1">Trạng thái: Chờ Admin Duyệt</p>
                            <p className="text-[10px] text-gray-600 leading-tight">Sau khi chuyển khoản, vui lòng bấm nút bên dưới. Gói tập sẽ được kích hoạt sau khi Admin kiểm tra.</p>
                        </div>
                    </div>
                    
                    <button onClick={handleCompleteTransfer} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        <Check className="w-5 h-5"/> Hoàn Tất Thanh Toán
                    </button>
                </div>
            )}

            {/* STEP 4: SUCCESS (Cash only) */}
            {step === 'success' && (
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 uppercase italic mb-2">Đã Gửi Yêu Cầu!</h3>
                    <p className="text-sm text-gray-500 px-4 leading-relaxed mb-6">
                       Bạn vui lòng thanh toán tại quầy. Gói tập đang ở trạng thái 'Chờ duyệt'.
                    </p>
                    <div className="bg-gray-100 p-3 rounded-xl inline-flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-bold text-gray-600 uppercase">Trạng thái: Chờ Admin Duyệt</span>
                    </div>
                    <button onClick={handleCloseSuccess} className="w-full mt-8 bg-[#00AEEF] text-white px-8 py-4 rounded-2xl font-black uppercase text-sm shadow-lg shadow-blue-200 active:scale-95 transition-transform">Về Trang Chủ</button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
