import React, { useEffect, useRef } from "react";

type VideoProps = {
  stream: MediaStream;
};

const Video: React.FC<VideoProps> = ({ stream }) => {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={ref} autoPlay playsInline />;
};

export default Video;
