"use client";
import React from "react";

interface WeatherEffectProps {
  weatherMain: string;
}

export default function WeatherEffect({ weatherMain }: WeatherEffectProps) {
  const weather = weatherMain.toLowerCase();

  if (weather === "rain" || weather === "drizzle") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 bg-blue-300 opacity-60 rounded-full animate-rain"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              height: `${Math.random() * 15 + 10}px`,
              animationDuration: `${Math.random() * 0.5 + 0.6}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (weather === "thunderstorm") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 bg-blue-200 opacity-70 rounded-full animate-rain"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              height: `${Math.random() * 20 + 15}px`,
              animationDuration: `${Math.random() * 0.3 + 0.4}s`,
              animationDelay: `${Math.random() * 1.5}s`,
            }}
          />
        ))}
        <div className="absolute inset-0 animate-lightning" />
      </div>
    );
  }

  if (weather === "snow") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-80 animate-snow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              width: `${Math.random() * 6 + 4}px`,
              height: `${Math.random() * 6 + 4}px`,
              animationDuration: `${Math.random() * 2 + 2}s`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (weather === "clouds" || weather === "mist" || weather === "fog" || weather === "haze") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolut bg-white rounded-full opacity-30 animate-cloud"
            style={{
              width: `${Math.random() * 300 + 200}px`,
              height: `${Math.random() * 80 + 60}px`,
              top: `${Math.random() * 60}%`,
              left: `-200px`,
              animationDuration: `${Math.random() * 20 + 20}s`,
              animationDelay: `${Math.random() * 10}s`,
              filter: "blur(10px)",
            }}
          />
        ))}
      </div>
    );
  }

  if (weather === "clear") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-yellow-200 rounded-full opacity-10 animate-pulse"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 80}%`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              filter: "blur(40px)",
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}