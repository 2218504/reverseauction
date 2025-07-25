
"use client";

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  startTime?: Date;
  endTime: Date;
  onExpire?: () => void;
}

const CountdownTimer = ({ startTime, endTime, onExpire }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);
  const [hasStarted, setHasStarted] = useState(startTime ? new Date(startTime) <= new Date() : true);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      if (startTime && now < new Date(startTime)) {
        // Countdown to start
        const difference = +new Date(startTime) - +now;
        setHasStarted(false);
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      
      setHasStarted(true);
      const difference = +new Date(endTime) - +now;

      if (difference > 0) {
        setIsExpired(false);
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      } else {
        if (!isExpired) {
          setIsExpired(true);
          onExpire?.();
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };
    
    setTimeLeft(calculateTime());

    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime, onExpire, isExpired]);
  
  const renderTimeLeft = () => (
     <div className="flex items-center gap-1">
      {timeLeft.days > 0 && <span className="font-semibold">{timeLeft.days}d</span>}
      {timeLeft.hours > 0 && <span className="font-semibold">{timeLeft.hours}h</span>}
      <span className="font-semibold">{timeLeft.minutes}m</span>
      <span className="font-semibold">{timeLeft.seconds}s</span>
    </div>
  )

  if (isExpired) {
    return <span className="text-destructive font-bold">Auction Ended</span>;
  }
  
  if(!hasStarted) {
    return (
        <div className="flex items-center gap-1 text-sm text-blue-600">
            <span>Starts in:</span>
            {renderTimeLeft()}
        </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {renderTimeLeft()}
      <span>left</span>
    </div>
  );
};

export default CountdownTimer;
