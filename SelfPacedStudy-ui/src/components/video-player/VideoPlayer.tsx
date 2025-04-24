'use client';

import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
    url: string;
    isChatBoxOpen: boolean;
    setIsVideoManuallyPaused: (value: boolean) => void;
    isVideoManuallyPaused: boolean;
    setVideoPosition: (value: number) => void;
    setVideoDuration: (value: number) => void;
    onVideoBehavior: (action: string) => void;
    askQuestion: (currentTime: number) => void; 
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    url,
    isChatBoxOpen,
    setIsVideoManuallyPaused,
    isVideoManuallyPaused,
    setVideoPosition,
    setVideoDuration,
    onVideoBehavior,
    askQuestion
}) => {
    const [hasWindow, setHasWindow] = useState(false);
    const previousTime = useRef<number>(0); // Track previous time for detecting rewind
    const isSeekingRef = useRef(false); // Track if seeking is happening
    const seekTimerRef = useRef<NodeJS.Timeout | null>(null); // Manage seek timer

    useEffect(() => {
        if (typeof window !== "undefined") {
            setHasWindow(true);
        }
    }, []);

    const videoPlayerRef = useRef<ReactPlayer>(null as any);

    /**
     * Update the video position every 500ms.
     */
    useEffect(() => {
        const interval = setInterval(() => {
            if (videoPlayerRef.current) {
                setVideoPosition(videoPlayerRef.current.getCurrentTime());
            }
        }, 500);
        return () => clearInterval(interval);
    }, [setVideoPosition]);

    const handleOnPlay = () => {
        // Don't start video if it's manually paused or ChatBox is open
        setIsVideoManuallyPaused(false);
    };

    const handleOnPause = () => {
        const currentTime = videoPlayerRef.current?.getCurrentTime() || 0;
        const timeDiff = currentTime - previousTime.current;

      
        // Detect rewind behavior (only consider time difference for rewinding, not fast-forward)
        if (timeDiff < 5) {
          if (timeDiff < 0) { // Detect rewind
            console.log('Rewind detected');
            onVideoBehavior(`Rewound to ${currentTime.toFixed(1)} seconds`); // Rewind behavior in English
            askQuestion(currentTime); // Ask question about the rewind
          } else {
            setIsVideoManuallyPaused(true);
            onVideoBehavior(`Paused at ${currentTime.toFixed(1)} seconds`); // Pause behavior in English
            console.log('Video paused');
          }
        }
      
        previousTime.current = currentTime;  // Update the previous time after pause
      };
      
    

    const handleOnReady = () => {
        if (videoPlayerRef.current) {
            setVideoDuration(videoPlayerRef.current.getDuration());
        }
    };

    return (
        <>
            {hasWindow &&
                <ReactPlayer
                    ref={videoPlayerRef}
                    url={url}
                    className='react-player'
                    width='100%'
                    height='100%'
                    controls={true}
                    playing={!isChatBoxOpen && !isVideoManuallyPaused}
                    onPlay={handleOnPlay}
                    onPause={handleOnPause}
                    onReady={handleOnReady}   // Set video duration when the player is ready
                    pauseOnseek={false}  // Disable pausing when seeking (so we can manually handle it)
                />
            }
        </>
    );
};

export default VideoPlayer;
