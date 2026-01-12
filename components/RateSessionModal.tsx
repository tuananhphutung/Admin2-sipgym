
import React, { useState } from 'react';
import { X, Star, Camera } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { Booking } from '../App';

interface RateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onSubmit: (rating: number, comment: string, media: string[]) => void;
}

const RateSessionModal: React.FC<RateSessionModalProps> = ({ isOpen, onClose, booking, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
      onSubmit(rating, comment, image ? [image] : []);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-[380px] bg-white rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95">
         <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500"><X className="w-5 h-5"/></button>
         
         <div className="text-center mb-6">
            <h3 className="text-xl font-black text-gray-800 uppercase italic">Đánh Giá Buổi Tập</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">PT: {booking.trainerName} • {booking.date}</p>
         </div>

         <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
               <button key={star} onClick={() => setRating(star)} className="transition-transform active:scale-125">
                  <Star className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
               </button>
            ))}
         </div>

         <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-yellow-200 min-h-[100px] mb-4"
            placeholder="Bạn cảm thấy buổi tập thế nào?"
         />

         <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Hình ảnh/Video buổi tập</p>
            <ImageUpload 
               currentImage={image} 
               onImageUploaded={setImage} 
               label="" 
               aspect="h-48"
               className="rounded-2xl overflow-hidden"
            />
         </div>

         <button onClick={handleSubmit} className="w-full bg-[#FF6B00] text-white py-3 rounded-xl font-black uppercase text-sm shadow-lg shadow-orange-200">Gửi Đánh Giá</button>
      </div>
    </div>
  );
};

export default RateSessionModal;
