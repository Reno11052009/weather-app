"use client";
import Image from "next/image";
import Header from "./components/header";
import React from "react";
import Footer from "./components/Footer";
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./components/map'), { ssr: false });

interface WeatherData {
  name: string;
  main: {
    temp: number;
  };
  weather: Array<{
    main: string;
  }>;
  coord: {
    lat: number;
    lon: number;
  };
  sys: {
    country: string;
  };
}

interface CityOption {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export default function Home() {
  const[city, setCity] = React.useState<string>("");
  const[data, setData] = React.useState<WeatherData | null>(null);
  const[error, setError] = React.useState<string>("");
  const[cityOptions, setCityOptions] = React.useState<CityOption[]>([]);
  const[loading, setLoading] = React.useState<boolean>(false);
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

  const getWeatherByCoords = async (lat: number, lon: number) => {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    
    try {
      setLoading(true);
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
      const result = await res.json();
      
      if(result.cod === 200) {
        setData(result);
        setCityOptions([]);
        setTimeout(() => {
          mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else {
        setError(result.message || "Failed to retrieve weather data.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const getUserLocation = () => {
    setError("");
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location access denied. Enable location permission in your browser.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("Location information is not available.");
        } else if (err.code === err.TIMEOUT) {
          setError("Request lokasi timeout.");
        } else {
          setError("Failed to retrieve location.");
        }
      }
    );
  }

  const getWeather = async (cityName: string) => {
    if(!cityName) return;

    setError("");
    setData(null);
    setCityOptions([]);

    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    
    if(!apiKey) {
      setError("API key not found. Please check the .env.local file.");
      return;
    }

    try {
      setLoading(true);
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${apiKey}`);
      const geoData = await geoRes.json();
      
      if(geoData.length === 0) {
        setError("City not found. Please check the name and try again.");
        setLoading(false);
        return;
      }

      if(geoData.length === 1) {
        getWeatherByCoords(geoData[0].lat, geoData[0].lon);
      } else {
        const options = geoData.map((city: any) => ({
          name: city.name,
          country: city.country,
          state: city.state,
          lat: city.lat,
          lon: city.lon
        }));
        setCityOptions(options);
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again later..");
      setLoading(false);
    }
  }

  const handleCityClick = (cityName: string) => {
    setCity(cityName);
    getWeather(cityName);
  }

  const handleCityOptionClick = (option: CityOption) => {
    getWeatherByCoords(option.lat, option.lon);
  }

  React.useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Current Weather</h2>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <button 
              onClick={getUserLocation}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {loading ? "Retrieve Location..." : "Use My Location"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or search for a city</span>
              </div>
            </div>

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
              disabled={loading}
            >
              {loading ? "Loading..." : "Get Weather"}
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {cityOptions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Pilih Kota</h3>
              <div className="space-y-2">
                {cityOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleCityOptionClick(option)}
                    className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{option.name}</div>
                    <div className="text-sm text-gray-600">
                      {option.state && `${option.state}, `}{option.country}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Cities in Indonesia</h3>
            <div className="grid grid-cols-2 gap-2">
              {indonesianCities.map((cityName) => (
                <button
                  key={cityName}
                  onClick={() => handleCityClick(cityName)}
                  className="px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                  disabled={loading}
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