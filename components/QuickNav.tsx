
import React, { useState } from 'react';
import { CalendarCheck, Accessibility, Calendar, X, Star as StarIcon, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Trainer, UserProfile, Booking } from '../App';
import BookingModal from './BookingModal';

interface QuickNavProps {
  trainers: Trainer[];
  user?: UserProfile | null;
  bookings?: Booking[];
  onUpdateBookings?: (bookings: Booking[]) => void;
  onOpenAuth?: () => void;
}

const QuickNav: React.FC<QuickNavProps> = ({ trainers, user, bookings = [], onUpdateBookings, onOpenAuth }) => {
  const navigate = useNavigate();
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [selectedTrainerForBooking, setSelectedTrainerForBooking] = useState<Trainer | null>(null);

  const items = [
    { label: 'Check lịch tập', icon: CalendarCheck, color: 'text-white', bg: 'bg-[#00AEEF]', action: () => navigate('/schedule') },
    { label: 'Huấn Luyện Viên', icon: Accessibility, color: 'text-[#00AEEF]', bg: 'bg-white', action: () => setShowTrainerModal(true) },
    { label: 'Lớp học', icon: Calendar, color: 'text-white', bg: 'bg-[#00AEEF]', action: () => {} }
  ];

  const handleBook = (trainer: Trainer) => {
      if (!user) {
          if(onOpenAuth) onOpenAuth();
          return;
      }
      if (!user.ptSubscription || user.ptSubscription.status !== 'Active') {
          alert("Bạn cần đăng ký gói PT hoặc PT ngày để đặt lịch!");
          return;
      }
      setSelectedTrainerForBooking(trainer);
  };

  const confirmBooking = (date: string, timeSlot: string) => {
      if (!user || !selectedTrainerForBooking || !onUpdateBookings) return;

      // Check remaining sessions logic if needed, but per request just create booking
      const newBooking: Booking = {
          id: Date.now().toString(),
          userId: user.phone,
          userName: user.realName || user.name || "User",
          userAvatar: user.avatar || "",
          trainerId: selectedTrainerForBooking.id,
          trainerName: selectedTrainerForBooking.name,
          date: date,
          timeSlot: timeSlot,
          status: 'Pending',
          timestamp: Date.now()
      };

      // Check conflict to set initial color/status (though backend logic should be 'Pending' by default for safety)
      const isConflict = bookings.some(b => b.date === date && b.timeSlot === timeSlot && b.trainerId === selectedTrainerForBooking.id && b.status === 'Approved');
      
      onUpdateBookings([...bookings, newBooking]);
      setSelectedTrainerForBooking(null);
      alert(isConflict ? "Khung giờ này đã có người. Bạn đã vào danh sách chờ duyệt!" : "Đã gửi yêu cầu đặt lịch! Vui lòng chờ PT xác nhận.");
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-3 px-5 mt-8">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <div 
              onClick={item.action}
              className="relative w-full aspect-square bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center group active:scale-95 transition-transform cursor-pointer"
            >
              <div className={`w-12 h-12 ${idx % 2 === 0 ? 'bg-[#00AEEF]' : 'bg-white shadow-sm'} rounded-full flex items-center justify-center ${idx % 2 === 0 ? 'shadow-lg' : ''}`}>
                <item.icon className={`w-6 h-6 ${idx % 2 === 0 ? 'text-white' : 'text-[#00AEEF]'}`} />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight whitespace-nowrap">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Trainers List Modal */}
      {showTrainerModal && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTrainerModal(false)} />
          <div className="relative w-full max-w-[430px] bg-white rounded-t-[40px] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-black uppercase italic text-gray-800">Đội ngũ PT chuyên nghiệp</h3>
               <button onClick={() => setShowTrainerModal(false)} className="p-2 bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-10 px-1">
              {trainers.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                  <Accessibility className="w-16 h-16 mx-auto mb-4" />
                  <p className="font-black uppercase">Đang cập nhật đội ngũ PT...</p>
                </div>
              ) : (
                trainers.map(trainer => (
                  <div key={trainer.id} className="bg-gray-50 rounded-[32px] p-4 flex gap-4 items-center border border-gray-100">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md">
                      <img src={trainer.image} className="w-full h-full object-cover" alt={trainer.name} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-gray-800 text-lg leading-tight mb-1">{trainer.name}</h4>
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">{trainer.specialty}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className={`w-3 h-3 ${i < trainer.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                        <span className="text-[10px] font-black text-gray-400 ml-1">{trainer.rating}.0</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleBook(trainer)}
                      className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm border border-gray-100 text-[#00AEEF] active:scale-95 transition-transform flex flex-col items-center"
                    >
                       <Clock className="w-4 h-4 mb-1" />
                       Đặt Lịch
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTrainerForBooking && user && (
          <BookingModal 
             isOpen={!!selectedTrainerForBooking}
             onClose={() => setSelectedTrainerForBooking(null)}
             trainer={selectedTrainerForBooking}
             user={user}
             bookings={bookings}
             onConfirm={confirmBooking}
          />
      )}
    </>
  );
};

export default QuickNav;
