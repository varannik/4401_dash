'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    const initializeVanta = () => {
      if (!vantaRef.current || !window.VANTA || !window.THREE) {
        return;
      }

      // Destroy existing effect if any
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }

      console.log('Initializing Vanta WAVES...');

      vantaEffect.current = window.VANTA.WAVES({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x16161b, // Blue waves
        backgroundColor: 0x0b1220, // Dark navy background
        shininess: 20.0,
        waveHeight: 18.0,
        waveSpeed: 0.7,
        zoom: 0.9,
      });

      console.log('Vanta WAVES effect created');
    };

    // Try to initialize immediately
    initializeVanta();

    // If scripts aren't ready, try again after a short delay
    const timer = setTimeout(initializeVanta, 100);

    return () => {
      clearTimeout(timer);
      if (vantaEffect.current) {
        console.log('Destroying Vanta effect');
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={vantaRef} 
      className="fixed inset-0 -z-10 w-full h-full"
      style={{ 
        minHeight: '100vh',
        backgroundColor: '#0b1220', // Fallback color
      }}
    />
  );
} 