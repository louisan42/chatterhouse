import React, { useRef, useEffect } from 'react';

interface VideoProps {
  stream: MediaStream | null;
}

const VideoComponent: React.FC<VideoProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline muted />;
};

export default VideoComponent;