import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const WeatherApp = () => {
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [favoriteLocations, setFavoriteLocations] = useState([]);
  const [favoriteWeatherData, setFavoriteWeatherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geolocationError, setGeolocationError] = useState(null);
  const [temperatureUnit, setTemperatureUnit] = useState("celsius");

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleSearch = () => {
    if (location.trim() === "") {
      setError("Please enter a location.");
      return;
    }

    fetchWeatherData();
    fetchForecastData();
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = "1fcdc5c66050bffb160bbbd7a9f044a5"; // Replace with your OpenWeatherMap API key
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

      const response = await axios.get(apiUrl);
      setWeatherData(response.data);
    } catch (error) {
      setError(
        "An error occurred while fetching weather data. Please try again."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecastData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = "1fcdc5c66050bffb160bbbd7a9f044a5"; // Replace with your OpenWeatherMap API key
      const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

      const response = await axios.get(apiUrl);
      setForecastData(response.data);
    } catch (error) {
      setError(
        "An error occurred while fetching forecast data. Please try again."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteWeatherData = async (favoriteLocation) => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = "1fcdc5c66050bffb160bbbd7a9f044a5"; // Replace with your OpenWeatherMap API key
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${favoriteLocation}&appid=${apiKey}&units=metric`;

      const response = await axios.get(apiUrl);
      const newFavoriteWeatherData = [...favoriteWeatherData, response.data];
      setFavoriteWeatherData(newFavoriteWeatherData);
    } catch (error) {
      setError(
        "An error occurred while fetching favorite weather data. Please try again."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedLocations = localStorage.getItem("favoriteLocations");
    if (savedLocations) {
      setFavoriteLocations(JSON.parse(savedLocations));
    }
  }, []);

  useEffect(() => {
    if (favoriteLocations.length > 0) {
      localStorage.setItem(
        "favoriteLocations",
        JSON.stringify(favoriteLocations)
      );
    } else {
      localStorage.removeItem("favoriteLocations");
    }
  }, [favoriteLocations]);

  useEffect(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherDataByCoords(latitude, longitude);
        },
        (error) => {
          setLoading(false);
          setGeolocationError(
            "Unable to retrieve your location. Please enter a location manually."
          );
          console.error(error);
        }
      );
    } else {
      setGeolocationError(
        "Geolocation is not supported by your browser. Please enter a location manually."
      );
    }
  }, []);

  const fetchWeatherDataByCoords = async (latitude, longitude) => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = "1fcdc5c66050bffb160bbbd7a9f044a5"; // Replace with your OpenWeatherMap API key
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

      const response = await axios.get(apiUrl);
      setWeatherData(response.data);
    } catch (error) {
      setError(
        "An error occurred while fetching weather data. Please try again."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = () => {
    if (!favoriteLocations.includes(location)) {
      setFavoriteLocations([...favoriteLocations, location]);
    }
  };

  const handleUnitToggle = () => {
    setTemperatureUnit((prevUnit) =>
      prevUnit === "celsius" ? "fahrenheit" : "celsius"
    );
  };

  const convertTemperature = (temp) => {
    if (temperatureUnit === "fahrenheit") {
      return Math.round((temp * 9) / 5 + 32);
    }
    return Math.round(temp);
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/w/${iconCode}.png`;
  };

  return (
    <div className="weather-app">
      <h1>Avash</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={handleLocationChange}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && <p>Loading...</p>}

      {error && <p className="error">{error}</p>}

      {geolocationError && <p className="error">{geolocationError}</p>}

      {weatherData && (
        <div className="current-weather">
          <h2>Current Weather</h2>
          <p>
            Temperature: {convertTemperature(weatherData.main.temp)}°
            {temperatureUnit.toUpperCase()}
          </p>
          <p>Humidity: {weatherData.main.humidity}%</p>
          <p>Wind Speed: {weatherData.wind.speed} km/h</p>
          <p>Weather Description: {weatherData.weather[0].description}</p>
          <img
            src={getWeatherIcon(weatherData.weather[0].icon)}
            alt="Weather Icon"
          />
          <button onClick={handleAddFavorite}>Add to Favorites</button>
        </div>
      )}

      {favoriteLocations.length > 0 && (
        <div className="favorite-locations">
          <h2>Favorite Locations</h2>
          {favoriteWeatherData.map((favoriteData, index) => (
            <div className="favorite-location" key={index}>
              <h3>{favoriteLocations[index]}</h3>
              <p>
                Temperature: {convertTemperature(favoriteData.main.temp)}°
                {temperatureUnit.toUpperCase()}
              </p>
              <p>Humidity: {favoriteData.main.humidity}%</p>
              <p>Wind Speed: {favoriteData.wind.speed} km/h</p>
              <p>Weather Description: {favoriteData.weather[0].description}</p>
              <img
                src={getWeatherIcon(favoriteData.weather[0].icon)}
                alt="Weather Icon"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
