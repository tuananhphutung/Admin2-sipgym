
import React from 'react';
import { TrainingProgram } from '../App';

interface TutorialSectionProps {
  programs: TrainingProgram[];
}

const TutorialSection: React.FC<TutorialSectionProps> = ({ programs }) => {
  return (
    <div className="mt-8 px-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[#4A5568] text-xl font-extrabold">Hướng Dẫn Tập Luyện</h3>
        <button className="text-[#00AEEF] text-sm font-semibold">Xem tất cả</button>
      </div>
      
      <div className="space-y-4">
        {programs.length === 0 ? (
          <div className="relative rounded-3xl overflow-hidden shadow-lg h-48 bg-gray-100 flex flex-col items-center justify-center text-gray-400 opacity-50">
             <span className="text-[10px] font-black uppercase">Đang cập nhật bài tập mới nhất</span>
          </div>
        ) : (
          programs.map(prog => (
            <div key={prog.id} className="relative rounded-3xl overflow-hidden shadow-lg h-48 group">
              <img 
                src={prog.image} 
                alt={prog.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                <p className="text-white font-black text-lg leading-tight uppercase italic">{prog.title}</p>
                <p className="text-white/80 text-[10px] font-bold uppercase mt-1 tracking-widest">Sip Gym Nhà Bè • {prog.duration}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TutorialSection;
