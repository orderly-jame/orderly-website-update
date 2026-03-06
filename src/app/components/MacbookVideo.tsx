import { useState } from "react";

interface MacbookVideoProps {
  className?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

const coverStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  pointerEvents: "none",
};

export default function MacbookVideo({
  className,
  canvasWidth = 1125,
}: MacbookVideoProps) {
  const isMobile = canvasWidth < 500;
  const [playing, setPlaying] = useState(false);

  return (
    <div className={className}>
      <img
        src={isMobile ? "/images/macbook-mobile-poster.webp" : "/images/macbook-poster.webp"}
        alt=""
        style={{ ...coverStyle, opacity: playing ? 0 : 1, transition: "opacity 0.3s" }}
      />
      <video
        autoPlay
        muted
        playsInline
        loop={false}
        onPlaying={() => setPlaying(true)}
        style={{ ...coverStyle, opacity: playing ? 1 : 0 }}
      >
        {isMobile ? (
          <>
            <source src="/images/macbook-mobile.mov" type="video/quicktime" />
            <source src="/images/macbook-mobile.webm" type="video/webm" />
          </>
        ) : (
          <>
            <source src="/images/macbook.mov" type="video/quicktime" />
            <source src="/images/macbook.webm" type="video/webm" />
          </>
        )}
      </video>
    </div>
  );
}
