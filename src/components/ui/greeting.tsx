'use client';

import { useEffect, useState } from 'react';

export const Greeting = () => {
  const [greeting, setGreeting] = useState('እንደምን አደሩ');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('እንደምን አደሩ');
    } else if (hour < 18) {
      setGreeting('እንደምን ዋሉ');
    } else {
      setGreeting('እንደምን አመሹ');
    }
  }, []);

  return <>{greeting}</>;
};
