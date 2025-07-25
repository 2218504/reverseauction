"use client";

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: Date;
  onExpire?: () => void;
}

const CountdownTimer = ({ endTime, onExpire }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endTime) - +new Date();
      let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
        setIsExpired(false);
      } else {
        if (!isExpired) {
          setIsExpired(true);
          onExpire?.();
        }
      }
      return timeLeft;
    };
    
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire, isExpired]);

  if (isExpired) {
    return <span className="text-destructive font-bold">Auction Ended</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {timeLeft.days > 0 && <span className="font-semibold">{timeLeft.days}d</span>}
      {timeLeft.hours > 0 && <span className="font-semibold">{timeLeft.hours}h</span>}
      <span className="font-semibold">{timeLeft.minutes}m</span>
      <span className="font-semibold">{timeLeft.seconds}s</span>
      <span>left</span>
    </div>
  );
};

export default CountdownTimer;
