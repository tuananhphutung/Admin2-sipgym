
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Calendar as CalIcon, ChevronLeft, ChevronRight, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, Booking } from '../App';
import RateSessionModal from '../components/RateSessionModal';

interface TrainingScheduleProps {
  user: UserProfile | null;
  allUsers: UserProfile[];
  onUpdateUser: (users: UserProfile[]) => void;
  bookings?: Booking[];
  onUpdateBookings?: (bookings: Booking[]) => void;
}

const TrainingSchedule: React.FC<TrainingScheduleProps> = ({ user, allUsers, onUpdateUser, bookings = [], onUpdateBookings }) => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);

  const daysInMonth = (month: Date) => {
    return new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  };

  const getDaysArray = () => {
    const days = [];
    const count = daysInMonth(currentMonth);
    for (let i = 1; i <= count; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }
    return days;
  };

  const toggleTrainingDay = (date: Date) => {
    if (!user) return alert("Vui lòng đăng nhập để lưu lịch tập!");
    
    const dateStr = date.toISOString().split('T')[0];
    const newTrainingDays = user.trainingDays.includes(dateStr)
      ? user.trainingDays.filter(d => d !== dateStr)
      : [...user.trainingDays, dateStr];

    const newUsers = allUsers.map(u => u.phone === user.phone ? { ...u, trainingDays: newTrainingDays } : u);
    onUpdateUser(newUsers);
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  // Filter user's PT bookings
  const myBookings = bookings.filter(b => b.userId === user?.phone).sort((a,b) => b.timestamp - a.timestamp);

  const handleRateSubmit = (rating: number, comment: string, media: string[]) => {
      if (!ratingBooking || !onUpdateBookings) return;
      const updatedBookings = bookings.map(b => b.id === ratingBooking.id ? { ...b, status: 'Completed' as const, rating, comment, media } : b);
      onUpdateBookings(updatedBookings);
      setRatingBooking(null);
      alert("Cảm ơn đánh giá của bạn!");
  };

  // Check if booking is passable for rating (time passed)
  const canRate = (booking: Booking) => {
      if (booking.status === 'Completed') return false;
      if (booking.status !== 'Approved') return false;
      const bookingDate = new Date(booking.date);
      const bookingEndHour = parseInt(booking.timeSlot.split('-')[1].split(':')[0]);
      bookingDate.setHours(bookingEndHour, 0, 0, 0);
      return new Date() > bookingDate;
  };

  return (
    <div className="min-h-screen bg-white pb-20 animate-in slide-in-from-right duration-500 w-full">
      <div className="bg-[#00AEEF] px-6 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10"><CalIcon className="w-32 h-32 text-white" /></div>
        <button onClick={() => navigate('/')} className="mb-6 p-2 bg-white/20 rounded-full text-white"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-3xl font-[900] text-white italic uppercase leading-none">Lịch Tập Luyện</h1>
        <p className="text-white/70 text-sm font-bold mt-2 uppercase tracking-widest">Theo dõi lịch tập Gym & PT</p>
      </div>

      <div className="w-full">
        {/* Basic Calendar - Full Width */}
        <div className="bg-white p-4 shadow-lg shadow-blue-50 border-b border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => changeMonth(-1)} className="p-2 bg-gray-50 rounded-xl text-gray-400"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="font-black text-gray-800 uppercase italic">Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}</h2>
            <button onClick={() => changeMonth(1)} className="p-2 bg-gray-50 rounded-xl text-gray-400"><ChevronRight className="w-5 h-5" /></button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-black text-gray-300 uppercase mb-2">{d}</div>
            ))}
            {getDaysArray().map((date, idx) => {
              const dateStr = date.toISOString().split('T')[0];
              const isTrained = user?.trainingDays.includes(dateStr);
              // Check if has PT booking on this day
              const hasPT = myBookings.some(b => b.date === dateStr && b.status === 'Approved');

              return (
                <div 
                  key={idx} 
                  onClick={() => toggleTrainingDay(date)}
                  className={`
                    aspect-square rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative
                    ${isTrained ? 'bg-[#8DBF44] text-white shadow-lg shadow-green-100' : 'bg-gray-50 text-gray-400'}
                    ${isToday(date) && !isTrained ? 'border-2 border-blue-400' : ''}
                  `}
                >
                  <span className="text-xs font-black">{date.getDate()}</span>
                  {/* PT Marker */}
                  {hasPT && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FF6B00] rounded-full"></div>}
                  {isTrained && <CheckCircle2 className="w-3 h-3 mt-0.5" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* PT Bookings List */}
        {bookings && bookings.length > 0 && (
           <div className="bg-white p-6 shadow-sm border-b border-gray-100">
              <h3 className="font-black text-gray-800 uppercase italic mb-4 text-sm flex items-center gap-2"><Clock className="w-4 h-4"/> Lịch Tập PT</h3>
              <div className="space-y-3">
                 {myBookings.length === 0 ? <p className="text-xs text-gray-400">Chưa có lịch đặt PT nào.</p> : myBookings.map(b => (
                    <div key={b.id} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                       <div>
                          <p className="text-xs font-black text-gray-800">{b.date} • {b.timeSlot}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase">PT: {b.trainerName}</p>
                          <div className="mt-1">
                             {b.status === 'Approved' && <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">Đã Duyệt</span>}
                             {b.status === 'Pending' && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">Chờ Duyệt</span>}
                             {b.status === 'Completed' && <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">Hoàn Thành ({b.rating} sao)</span>}
                             {b.status === 'Rejected' && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">Từ Chối</span>}
                          </div>
                       </div>
                       
                       {/* Rating Button */}
                       {canRate(b) && (
                          <button onClick={() => setRatingBooking(b)} className="bg-yellow-400 text-white px-3 py-2 rounded-xl shadow-md text-[10px] font-black uppercase animate-pulse">
                             Đánh Giá
                          </button>
                       )}
                    </div>
                 ))}
              </div>
           </div>
        )}
      </div>

      {ratingBooking && (
         <RateSessionModal 
            isOpen={!!ratingBooking}
            onClose={() => setRatingBooking(null)}
            booking={ratingBooking}
            onSubmit={handleRateSubmit}
         />
      )}
    </div>
  );
};

export default TrainingSchedule;
