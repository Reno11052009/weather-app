"use client";
import Image from "next/image";
import Header from "./components/header";
import React from "react";
import Footer from "./components/Footer";
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./components/map'), { ssr: false });

export default function Home() {
  const[city, setCity] = React.useState<string>("");
  const[data, setData] = React.useState<any>(null);
  const[error, setError] = React.useState<string>("");
  const mapRef = React.useRef<HTMLDivElement>(null);

  const indonesianCities = [
    "Jakarta",
    "Surabaya",
    "Bandung",
    "Medan",
    "Semarang",
    "Makassar",
    "Palembang",
    "Denpasar",
    "Yogyakarta",
    "Malang"
  ];

  const getWeather = async (cityName: string) => {
    if(!cityName) return;

    setError("");
    setData(null);

    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    
    if(!apiKey) {
      setError("API key tidak ditemukan. Periksa file .env.local");
      return;
    }

    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`);
      const result = await res.json();
      
      if(result.cod === 200) {
        setData(result);
        setTimeout(() => {
          mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else {
        setError(result.message || "Kota tidak ditemukan");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi nanti.");
    }
  }

  const handleCityClick = (cityName: string) => {
    setCity(cityName);
    getWeather(cityName);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Current Weather</h2>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <input 
              placeholder="Enter city name" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && getWeather(city)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />

            <button 
              onClick={() => getWeather(city)} 
              className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Get Weather
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Kota di Indonesia</h3>
            <div className="grid grid-cols-2 gap-2">
              {indonesianCities.map((cityName) => (
                <button
                  key={cityName}
                  onClick={() => handleCityClick(cityName)}
                  className="px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                >
                  {cityName}
                </button>
              ))}
            </div>
          </div>

          {data && (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-3">
                <h3 className="text-xl font-medium text-gray-900">{data.name}</h3>
                <div className="space-y-2 text-gray-600">
                  <p>Temperature: {Math.round(data.main.temp - 273.15)}°C</p>
                  <p>Weather: {data.weather[0].main}</p>
                </div>
              </div>

              <div ref={mapRef} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Location</h3>
                <Map 
                  lat={data.coord.lat} 
                  lon={data.coord.lon} 
                  cityName={data.name}
                />
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}