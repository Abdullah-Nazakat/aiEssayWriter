import React from "react";

const HeroContent = () => {
  return (
    <div className="absolute top-25 left-0 right-0 p-4 md:p-6">
      <div className="flex flex-col items-center text-center space-y-4 md:space-y-6 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg px-4">
          AI-Powered Essay Writer
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl px-4">
          Generate high-quality, structured essays in seconds. AI-driven and tailored to your needs.
        </p>
      </div>
    </div>
  );
};

export default HeroContent;