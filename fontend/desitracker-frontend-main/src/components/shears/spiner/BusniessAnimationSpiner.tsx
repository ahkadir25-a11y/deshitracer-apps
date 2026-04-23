import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import busniessAnimationSpinerData from "../../../../public/busniessAnimationSpiner.json";
const BusniessAnimationSpiner = () => {
  return (
    <div className="h-96 w-full flex flex-col items-center justify-center  p-4">
      <div className="w-full max-w-screen-lg flex items-center justify-center">
        <Player loop src={busniessAnimationSpinerData} autoplay />
      </div>
    </div>
  );
};

export default BusniessAnimationSpiner;
