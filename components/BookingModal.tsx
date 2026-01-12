
import React, { useState, useMemo } from 'react';
import { X, Calendar as CalIcon, ChevronLeft, ChevronRight, Clock, User, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Booking, Trainer, UserProfile } from '../App';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainer: Trainer;
  user: UserProfile;
  bookings: Booking[];
  onConfirm: (date: string, timeSlot: string) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, trainer, user, bookings, onConfirm }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const timeSlots = Array.from({ length: 15 }, (_, i) => {
      const hour = i + 6; // 6:00 to 20:00
      return `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
  });

  if (!isOpen) return null;

  // Calendar Logic
  const daysInMonth = (month: Date) => new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const getDaysArray = () => {
    const days = [];
    const count = daysInMonth(currentMonth);
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    // Fill empty slots
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Fill days
    for (let i = 1; i <= count; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }
    return days;
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const dateToString = (date: Date) => date.toISOString().split('T')[0];

  // Logic to determine slot status
  const getSlotStatus = (date: string, slot: string) => {
      const existing = bookings.filter(b => b.trainerId === trainer.id && b.date === date && b.timeSlot === slot && b.status !== 'Rejected' && b.status !== 'Completed');
      if (existing.length > 0) {
          const isMyBooking = existing.some(b => b.userId === user.phone);
          if (isMyBooking) return { status: 'my_booking', bookings: existing };
          
          // Conflict but allow "overbook" with warning (Pending)
          return { status: 'conflict', bookings: existing };
      }
      return { status: 'free', bookings: [] };
  };

  const handleBooking = () => {
      if (selectedDate && selectedSlot) {
          onConfirm(selectedDate, selectedSlot);
      }
  };

  // View existing bookings on a day
  const bookingsOnDay = selectedDate ? bookings.filter(b => b.trainerId === trainer.id && b.date === selectedDate && b.status !== 'Rejected') : [];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-[430px] bg-white rounded-[24px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-gray-50 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                <img src={trainer.image} className="w-full h-full object-cover" />
             </div>
             <div>
                <h2 className="text-sm font-black text-gray-800 uppercase italic">Đặt Lịch PT</h2>
                <p className="text-xs font-bold text-gray-500">{trainer.name}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar p-6 bg-[#F7FAFC]">
           {/* Calendar */}
           <div className="bg-white rounded-[28px] p-4 shadow-sm mb-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1 text-gray-400"><ChevronLeft className="w-5 h-5" /></button>
                <h3 className="font-black text-gray-800 uppercase text-sm">Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}</h3>
                <button onClick={() => changeMonth(1)} className="p-1 text-gray-400"><ChevronRight className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                 {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => <div key={d} className="text-[10px] font-bold text-gray-300 mb-2">{d}</div>)}
                 {getDaysArray().map((date, idx) => {
                    if (!date) return <div key={idx}></div>;
                    const dateStr = dateToString(date);
                    const isSelected = selectedDate === dateStr;
                    const isPast = new Date(dateStr) < new Date(new Date().toISOString().split('T')[0]);
                    
                    // Dots for density
                    const dayBookings = bookings.filter(b => b.trainerId === trainer.id && b.date === dateStr);
                    const approvedCount = dayBookings.filter(b => b.status === 'Approved').length;
                    const pendingCount = dayBookings.filter(b => b.status === 'Pending').length;

                    return (
                       <button 
                          key={idx} 
                          disabled={isPast}
                          onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                          className={`
                             aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all
                             ${isSelected ? 'bg-[#FF6B00] text-white shadow-lg' : isPast ? 'opacity-30' : 'bg-gray-50 text-gray-600 hover:bg-orange-50'}
                          `}
                       >
                          <span className="text-xs font-bold">{date.getDate()}</span>
                          <div className="flex gap-0.5 mt-0.5 h-1.5">
                             {approvedCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                             {pendingCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-orange-300"></div>}
                          </div>
                       </button>
                    );
                 })}
              </div>
           </div>

           {selectedDate && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                 {/* Existing Bookings List */}
                 {bookingsOnDay.length > 0 && (
                    <div className="mb-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                       <p className="text-[10px] font-bold text-blue-500 uppercase mb-2 flex items-center gap-1"><User className="w-3 h-3"/> Lịch đã có trong ngày {selectedDate}</p>
                       <div className="space-y-2">
                          {bookingsOnDay.map((b, i) => (
                             <div key={i} className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm">
                                <span className="text-xs font-bold text-gray-700">{b.userName}</span>
                                <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded text-gray-500">{b.timeSlot}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}

                 <p className="text-xs font-bold text-gray-400 uppercase ml-1 mb-2">Chọn khung giờ tập</p>
                 <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map(slot => {
                       const { status, bookings: slotBookings } = getSlotStatus(selectedDate, slot);
                       const isSelected = selectedSlot === slot;
                       
                       let btnClass = "bg-white border-gray-100 text-gray-600 hover:border-orange-200";
                       let statusIcon = null;

                       if (status === 'my_booking') {
                          btnClass = "bg-green-100 border-green-200 text-green-700";
                          statusIcon = <CheckCircle2 className="w-3 h-3" />;
                       } else if (status === 'conflict') {
                          btnClass = "bg-red-50 border-red-100 text-red-500";
                          statusIcon = <User className="w-3 h-3" />;
                       } else if (isSelected) {
                          btnClass = "bg-[#FF6B00] border-[#FF6B00] text-white shadow-md";
                       }

                       return (
                          <button
                             key={slot}
                             onClick={() => setSelectedSlot(slot)}
                             className={`py-3 px-2 rounded-xl border font-bold text-xs flex items-center justify-between transition-all ${btnClass}`}
                          >
                             {slot}
                             {statusIcon}
                          </button>
                       );
                    })}
                 </div>

                 {/* Warnings & Action */}
                 <div className="mt-6 sticky bottom-0">
                    {selectedSlot && getSlotStatus(selectedDate, selectedSlot).status === 'conflict' && (
                       <div className="flex items-start gap-2 bg-orange-50 p-3 rounded-xl mb-3 border border-orange-100">
                          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                          <p className="text-[10px] font-medium text-orange-600">Khung giờ này đã có người đặt. Bạn vẫn có thể đăng ký, nhưng sẽ cần PT duyệt (Chờ Duyệt).</p>
                       </div>
                    )}
                    
                    <button 
                       onClick={handleBooking}
                       disabled={!selectedSlot || getSlotStatus(selectedDate, selectedSlot).status === 'my_booking'}
                       className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase shadow-xl disabled:bg-gray-300 disabled:shadow-none"
                    >
                       {getSlotStatus(selectedDate || '', selectedSlot || '').status === 'my_booking' ? 'Bạn Đã Đặt Giờ Này' : 'Xác Nhận Đặt Lịch'}
                    </button>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
