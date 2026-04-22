"use client";
import Image from "next/image";
import Header from "./components/header";
import React from "react";
import Footer from "./components/Footer";
import dynamic from 'next/dynamic';
import WeatherEffect from "./components/WeatherEffect";

const Map = dynamic(() => import('./components/map'), { ssr: false });

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  coord: {
    lat: number;
    lon: number;
  };
  sys: {
    country: string;
  };
  wind: {
    speed: number;
  };
}

interface CityOption {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

const getWeatherBackground = (weatherMain: string): string => {
  const weather = weatherMain.toLowerCase();
  if (weather === "clear") return "bg-gradient-to-br from-sky-400 to-blue-600";
  if (weather === "clouds") return "bg-gradient-to-br from-gray-400 to-gray-600";
  if (weather === "rain" || weather === "drizzle") return "bg-gradient-to-br from-blue-700 to-slate-800";
  if (weather === "thunderstorm") return "bg-gradient-to-br from-gray-800 to-gray-950";
  if (weather === "snow") return "bg-gradient-to-br from-blue-100 to-slate-300";
  if (weather === "mist" || weather === "fog" || weather === "haze") return "bg-gradient-to-br from-gray-300 to-gray-500";
  return "bg-gray-50";
};

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
        setError(result.message || "Gagal mengambil data cuaca");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }

  const getUserLocation = () => {
    setError("");
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung di browser ini");
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
          setError("Akses lokasi ditolak. Aktifkan izin lokasi di browser.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("Informasi lokasi tidak tersedia.");
        } else if (err.code === err.TIMEOUT) {
          setError("Request lokasi timeout.");
        } else {
          setError("Gagal mengambil lokasi.");
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
      setError("API key tidak ditemukan. Periksa file .env.local");
      return;
    }

    try {
      setLoading(true);
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${apiKey}`);
      const geoData = await geoRes.json();
      
      if(geoData.length === 0) {
        setError("Kota tidak ditemukan");
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
      setError("Terjadi kesalahan. Coba lagi nanti.");
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

  const bgClass = data ? getWeatherBackground(data.weather[0].main) : "bg-gray-50";

  return (
    <div className={`min-h-screen transition-all duration-1000 ${bgClass}`}>
      {data && <WeatherEffect weatherMain={data.weather[0].main} />}
      <Header />
      <main className="relative z-10 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6 py-6">
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white drop-shadow">Current Weather</h2>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 space-y-4">
            <button 
              onClick={getUserLocation}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {loading ? "Mengambil Lokasi..." : "Gunakan Lokasi Saya"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/80 text-gray-500">atau cari kota</span>
              </div>
            </div>

            <input 
              placeholder="Enter city name" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && getWeather(city)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
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
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Pilih Kota</h3>
              <div className="space-y-2">
                {cityOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleCityOptionClick(option)}
                    className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors bg-white"
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

          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Kota di Indonesia</h3>
            <div className="grid grid-cols-2 gap-2">
              {indonesianCities.map((cityName) => (
                <button
                  key={cityName}
                  onClick={() => handleCityClick(cityName)}
                  className="px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left bg-white"
                  disabled={loading}
                >
                  {cityName}
                </button>
              ))}
            </div>
          </div>

          {data && (
            <>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">{data.name}</h3>
                    <p className="text-sm text-gray-500">{data.sys.country}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <img 
                      src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                      alt={data.weather[0].description}
                      className="w-28 h-28"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center py-4 border-b border-gray-100">
                    <div className="text-5xl font-bold text-gray-900">
                      {Math.round(data.main.temp - 273.15)}°C
                    </div>
                    <div className="text-lg text-gray-600 capitalize mt-2">
                      {data.weather[0].description}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                        <span className="text-sm text-gray-600">Feels Like</span>
                      </div>
                      <div className="text-xl font-semibold text-gray-900">
                        {Math.round(data.main.feels_like - 273.15)}°C
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span className="text-sm text-gray-600">Humidity</span>
                      </div>
                      <div className="text-xl font-semibold text-gray-900">
                        {data.main.humidity}%
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="text-sm text-gray-600">Pressure</span>
                      </div>
                      <div className="text-xl font-semibold text-gray-900">
                        {data.main.pressure} hPa
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span className="text-sm text-gray-600">Wind Speed</span>
                      </div>
                      <div className="text-xl font-semibold text-gray-900">
                        {data.wind.speed} m/s
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div ref={mapRef} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6">
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
    </div>
  );
}