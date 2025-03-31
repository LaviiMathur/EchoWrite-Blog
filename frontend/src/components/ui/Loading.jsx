
import React from 'react';
import { OrbitProgress } from 'react-loading-indicators';

function Loading() {
  return (
    <div className="w-screen h-screen bg-white/90 absolute top-0 left-0 flex items-center justify-center z-50">
      <OrbitProgress dense
        color="#6855E0"
        variant="track-disc"
        speedPlus="0"
        easing="linear"
      />
    </div>
  );
}

export default Loading;
