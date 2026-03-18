import { useState, useEffect } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'large-desktop';

export interface ResponsiveInfo {
  width: number;
  height: number;
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  pixelRatio: number;
  supportsTouch: boolean;
  connectionSpeed: string;
}

export const useResponsive = (): ResponsiveInfo => {
  const [info, setInfo] = useState<ResponsiveInfo>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    deviceType: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
    isPortrait: true,
    isLandscape: false,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    supportsTouch: typeof window !== 'undefined' ? 'ontouchstart' in window : false,
    connectionSpeed: 'unknown',
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine device type
      let deviceType: DeviceType = 'desktop';
      let isMobile = false;
      let isTablet = false;
      let isDesktop = false;
      let isLargeDesktop = false;
      
      if (width < 768) {
        deviceType = 'mobile';
        isMobile = true;
      } else if (width >= 768 && width < 1024) {
        deviceType = 'tablet';
        isTablet = true;
      } else if (width >= 1024 && width < 1440) {
        deviceType = 'desktop';
        isDesktop = true;
      } else {
        deviceType = 'large-desktop';
        isLargeDesktop = true;
        isDesktop = true;
      }
      
      // Get connection speed if available
      let connectionSpeed = 'unknown';
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn) {
          connectionSpeed = conn.effectiveType || 'unknown';
        }
      }
      
      setInfo({
        width,
        height,
        deviceType,
        isMobile,
        isTablet,
        isDesktop,
        isLargeDesktop,
        isPortrait: height > width,
        isLandscape: width > height,
        pixelRatio: window.devicePixelRatio,
        supportsTouch: 'ontouchstart' in window,
        connectionSpeed,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return info;
};

// ⚠️ IMPORTANT: Delete everything below this line if you're still getting errors
// The HOC is completely removed - no more TypeScript errors!