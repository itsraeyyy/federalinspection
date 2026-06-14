'use client';

import { useEffect, useState } from 'react';

export const Greeting = () => {
  const [greeting, setGreeting] = useState('Good morning');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  return <>{greeting}</>;
};
