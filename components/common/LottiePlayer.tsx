"use client";

import Player from "lottie-react";

interface LottiePlayerProps {
  animationData: object;
  loop?: boolean;
  autoPlay?: boolean;
  style?: React.CSSProperties;
}

const LottiePlayer: React.FC<LottiePlayerProps> = ({
  animationData,
  loop = true,
  autoPlay = true,
  style = {height: 100, width: 100},
}) => {
  return (
    <Player
      animationData={animationData}
      loop={loop}
      autoPlay={autoPlay}
      style={style}
    />
  );
};

export default LottiePlayer;
