import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeTextProps {
  text: string;
  className?: string;
  speed?: number; // pixels per second
}

const MarqueeText: React.FC<MarqueeTextProps> = ({ text, className, speed = 30 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [animationDuration, setAnimationDuration] = useState('0s');
  const [totalContentWidth, setTotalContentWidth] = useState(0); // Width of one copy of the text

  const calculateAnimation = useCallback(() => {
    if (containerRef.current && contentRef.current) {
      const textWidth = contentRef.current.scrollWidth; // Actual width of the text
      setTotalContentWidth(textWidth);

      // Calculate duration based on textWidth to maintain consistent speed
      // Ensure a minimum duration to prevent extremely fast scrolling for very short texts
      const duration = Math.max(textWidth / speed, 5); // Minimum 5 seconds for short texts
      setAnimationDuration(`${duration}s`);
    }
  }, [text, speed]);

  useEffect(() => {
    calculateAnimation();
    // Recalculate on window resize
    window.addEventListener('resize', calculateAnimation);
    return () => window.removeEventListener('resize', calculateAnimation);
  }, [calculateAnimation]);

  // If text is empty, don't render anything
  if (!text) {
    return null;
  }

  // We always apply the animation. The width and duration are calculated to ensure it scrolls.
  return (
    <div ref={containerRef} className={cn("overflow-hidden", className)}>
      <div
        className="flex animate-marquee-loop" // Always apply animation
        style={{
          animationDuration: animationDuration,
          animationDelay: '1s', // Delay before starting
          animationIterationCount: 'infinite',
          animationTimingFunction: 'linear',
          width: `${totalContentWidth * 2}px`, // Double width for continuous loop
        }}
      >
        <span ref={contentRef} className="whitespace-nowrap inline-block pr-4"> {/* Add some padding */}
          {text}
        </span>
        <span className="whitespace-nowrap inline-block pr-4">
          {text}
        </span>
      </div>
    </div>
  );
};

export default MarqueeText;