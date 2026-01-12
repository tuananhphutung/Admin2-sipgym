
import React from 'react';

interface HeroProps {
  image?: string;
  video?: string;
  mediaType?: 'image' | 'video'; // New prop
  title?: string;
  subtitle?: string;
  overlayText?: string;
  overlaySub?: string;
}

const Hero: React.FC<HeroProps> = ({ image, video, mediaType = 'image', title, subtitle, overlayText, overlaySub }) => {
  const bgImage = image || "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600";
  const ovText = overlayText || "Thay đổi bản thân";
  const ovSub = overlaySub || "Tại Sip Gym Nhà Bè";

  return (
    <div className="relative px-4 mt-2">
      {/* Full Square Hero Image Optimized for App with Smaller Radius */}
      <div className="w-full aspect-[4/3] relative rounded-[20px] overflow-hidden shadow-lg bg-black">
         {mediaType === 'video' && video ? (
            <video 
                src={video}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
            />
         ) : (
            <img 
                src={bgImage} 
                alt="Hero Banner" 
                className="w-full h-full object-cover"
            />
         )}
         
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
         
         <div className="absolute bottom-6 left-6 text-white">
            <p className="font-black text-2xl uppercase italic drop-shadow-lg">{ovText}</p>
            <p className="text-sm font-medium opacity-90">{ovSub}</p>
         </div>
      </div>
    </div>
  );
};

export default Hero;
