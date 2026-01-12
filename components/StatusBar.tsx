
import React from 'react';
import { Signal, Wifi, Battery } from 'lucide-react';

const StatusBar: React.FC = () => {
  const [time, setTime] = React.useState(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-between items-center px-6 py-2 bg-transparent z-50 text-black font-semibold text-sm">
      <div>{time}</div>
      <div className="flex items-center gap-1.5">
        <Signal className="w-3.5 h-3.5 fill-black" strokeWidth={3} />
        <Wifi className="w-3.5 h-3.5" strokeWidth={3} />
        <div className="flex items-center gap-1">
          <span className="text-[11px]">85%</span>
          <Battery className="w-4 h-4 rotate-0" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
