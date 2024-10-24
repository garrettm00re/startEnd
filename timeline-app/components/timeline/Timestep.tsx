// components/Timestep.tsx
import React from 'react';

interface TimestepProps {
  time: string;
}

export const Timestep: React.FC<TimestepProps> = React.memo(({ time }) => (
  <div className="w-full flex items-center justify-center bg-black text-white text-xs px-1">
    {new Date(time).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })}
  </div>
));

Timestep.displayName = 'Timestep';