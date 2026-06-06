import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../lib/utils';

interface VideoBackgroundProps {
  className?: string;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({ className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Attempt autoplay aggressively (handling browser autoplay policies)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.readyState >= 3) {
      setIsLoaded(true);
    }

    const handlePlay = () => setIsLoaded(true);
    video.addEventListener('playing', handlePlay);

    // Re-verify play status
    video.play().catch((err) => {
      console.warn("Autoplay was prevented by the browser. Awaiting user interaction.", err);
    });

    return () => {
      video.removeEventListener('playing', handlePlay);
    };
  }, []);

  return (
    <div className={cn("absolute inset-0 w-full h-full overflow-hidden bg-ts-canvas transition-opacity duration-1000", className)}>
      <video
        ref={videoRef}
        src="https://temporalsync-background-1301525488.cos.ap-chengdu.myqcloud.com/background.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
          // Significantly higher opacity to make the background video brighter and clearer
          "opacity-80 dark:opacity-95",
          isLoaded ? "opacity-80 dark:opacity-95" : "opacity-0"
        )}
      />
    </div>
  );
};

export default VideoBackground;
