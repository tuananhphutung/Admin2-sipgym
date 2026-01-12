
import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, CloudLightning, MapPin, Navigation, X, Search, Loader2 } from 'lucide-react';

interface WeatherData {
  currentTemp: number;
  maxTemp: number;
  minTemp: number;
  code: number;
}

interface LocationData {
  name: string;
  lat: number;
  lon: number;
  isAuto: boolean;
}

const PREDEFINED_LOCATIONS = [
  { name: "Nhà Bè", lat: 10.6953, lon: 106.7017 },
  { name: "TP. Hồ Chí Minh", lat: 10.8231, lon: 106.6297 },
  { name: "Hà Nội", lat: 21.0285, lon: 105.8542 },
  { name: "Đà Nẵng", lat: 16.0544, lon: 108.2022 },
  { name: "Cần Thơ", lat: 10.0452, lon: 105.7469 },
  { name: "Hải Phòng", lat: 20.8449, lon: 106.6881 },
  { name: "Nha Trang", lat: 12.2388, lon: 109.1967 },
  { name: "Đà Lạt", lat: 11.9404, lon: 108.4583 },
  { name: "Vũng Tàu", lat: 10.3460, lon: 107.0843 },
];

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<LocationData>(() => {
      const saved = localStorage.getItem('sip_gym_weather_location');
      return saved ? JSON.parse(saved) : PREDEFINED_LOCATIONS[0]; // Default Nhà Bè
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    fetchWeather(location.lat, location.lon);
  }, [location]);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
        const data = await res.json();
        
        setWeather({
            currentTemp: Math.round(data.current.temperature_2m),
            maxTemp: Math.round(data.daily.temperature_2m_max[0]),
            minTemp: Math.round(data.daily.temperature_2m_min[0]),
            code: data.current.weather_code
        });
    } catch (err) {
        console.error("Weather fetch error", err);
    } finally {
        setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
      setIsLocating(true);
      if (!navigator.geolocation) {
          alert("Trình duyệt không hỗ trợ định vị.");
          setIsLocating(false);
          return;
      }

      navigator.geolocation.getCurrentPosition(
          (position) => {
              const newLoc = {
                  name: "Vị trí của bạn",
                  lat: position.coords.latitude,
                  lon: position.coords.longitude,
                  isAuto: true
              };
              setLocation(newLoc);
              localStorage.setItem('sip_gym_weather_location', JSON.stringify(newLoc));
              setIsLocating(false);
              setIsModalOpen(false);
          },
          (error) => {
              console.error(error);
              alert("Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập.");
              setIsLocating(false);
          }
      );
  };

  const handleSelectLocation = (loc: any) => {
      const newLoc = { ...loc, isAuto: false };
      setLocation(newLoc);
      localStorage.setItem('sip_gym_weather_location', JSON.stringify(newLoc));
      setIsModalOpen(false);
  };

  const getWeatherIcon = (code: number) => {
    if (code <= 3) return <Sun className="w-5 h-5 text-yellow-500" />;
    if (code <= 48) return <Cloud className="w-5 h-5 text-gray-400" />;
    if (code <= 82) return <CloudRain className="w-5 h-5 text-blue-400" />;
    return <CloudLightning className="w-5 h-5 text-purple-400" />;
  };

  const getWeatherText = (code: number) => {
     if (code <= 3) return "Nắng đẹp";
     if (code <= 48) return "Nhiều mây";
     if (code <= 82) return "Mưa rào";
     return "Giông";
  };

  if (loading && !weather) return <div className="h-10 bg-gray-100 rounded-full w-full animate-pulse"></div>;

  return (
    <>
        <div 
            onClick={() => setIsModalOpen(true)}
            className="bg-white rounded-full px-4 py-2 flex items-center justify-between shadow-sm border border-gray-100 cursor-pointer active:bg-gray-50 transition-colors"
        >
        <div className="flex items-center gap-2">
            {weather ? getWeatherIcon(weather.code) : <Sun className="w-5 h-5 text-gray-300"/>}
            <span className="font-black text-gray-800 text-sm">{weather?.currentTemp}°C</span>
            <span className="text-xs font-medium text-gray-500 hidden sm:inline">{weather ? getWeatherText(weather.code) : ''}</span>
        </div>
        
        <div className="flex items-center gap-1 text-gray-500">
            {location.isAuto ? <Navigation className="w-3 h-3 text-[#FF6B00]" /> : <MapPin className="w-3 h-3" />}
            <span className="text-[10px] font-bold uppercase truncate max-w-[100px]">{location.name}</span>
        </div>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                <div className="relative w-full max-w-sm bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                        <h3 className="font-black text-gray-800 uppercase italic">Chọn khu vực</h3>
                        <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    
                    <div className="p-4 bg-[#F9FAFB] overflow-y-auto no-scrollbar space-y-3">
                        <button 
                            onClick={handleGetCurrentLocation}
                            className="w-full bg-white p-4 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-3 active:scale-95 transition-transform"
                        >
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                                {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-800 text-sm">Vị trí hiện tại</p>
                                <p className="text-[10px] text-gray-500">Sử dụng GPS thiết bị</p>
                            </div>
                        </button>

                        <p className="text-xs font-bold text-gray-400 uppercase ml-2 mt-2">Địa điểm phổ biến</p>
                        <div className="grid grid-cols-2 gap-2">
                            {PREDEFINED_LOCATIONS.map((loc) => (
                                <button 
                                    key={loc.name}
                                    onClick={() => handleSelectLocation(loc)}
                                    className={`p-3 rounded-xl border text-left active:scale-95 transition-all ${location.name === loc.name && !location.isAuto ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-100 text-gray-600'}`}
                                >
                                    <span className="text-xs font-bold block">{loc.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default WeatherWidget;
