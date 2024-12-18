'use client'
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    window.location.href = '/login';
  }, []);

  return null; // No need to render anything as it's redirecting
}
