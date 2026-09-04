'use client';

import React from 'react';

interface SmartVideoPlayerProps {
  url: string;
  className?: string;
  autoPlay?: boolean;
}

export const SmartVideoPlayer: React.FC<SmartVideoPlayerProps> = ({
  url,
  className = '',
  autoPlay = false,
}) => {
  if (!url) {
    return (
      <div className="w-full h-full min-h-[220px] bg-slate-950 flex flex-col items-center justify-center text-slate-500 p-4 rounded-2xl border border-slate-800">
        <span>No video URL provided</span>
      </div>
    );
  }

  const cleanUrl = url.trim();

  // 1. YouTube URL matching & conversion
  const youtubeMatch = cleanUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (youtubeMatch && youtubeMatch[1]) {
    const embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=${autoPlay ? 1 : 0}&rel=0`;
    return (
      <div className={`relative w-full h-full min-h-[240px] rounded-2xl overflow-hidden bg-black border border-slate-800 ${className}`}>
        <iframe
          src={embedUrl}
          title="Video Embed"
          className="w-full h-full absolute inset-0 border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // 2. Google Drive file matching
  const driveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (driveMatch && driveMatch[1]) {
    const embedUrl = `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    return (
      <div className={`relative w-full h-full min-h-[240px] rounded-2xl overflow-hidden bg-black border border-slate-800 ${className}`}>
        <iframe
          src={embedUrl}
          title="Google Drive Video"
          className="w-full h-full absolute inset-0 border-0"
          allow="autoplay"
          allowFullScreen
        />
      </div>
    );
  }

  // 3. Vimeo URL matching
  const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return (
      <div className={`relative w-full h-full min-h-[240px] rounded-2xl overflow-hidden bg-black border border-slate-800 ${className}`}>
        <iframe
          src={embedUrl}
          title="Vimeo Video"
          className="w-full h-full absolute inset-0 border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // 4. Default: Direct Video URL (MP4, WebM, MOV) or unknown link iframe fallback
  return (
    <div className={`relative w-full h-full min-h-[240px] rounded-2xl overflow-hidden bg-black border border-slate-800 ${className}`}>
      <video
        src={cleanUrl}
        controls
        playsInline
        autoPlay={autoPlay}
        className="w-full h-full object-contain"
        onError={(e) => {
          // If video fails to load directly, fallback to iframe frame view
          const target = e.target as HTMLVideoElement;
          target.style.display = 'none';
        }}
      />
    </div>
  );
};
