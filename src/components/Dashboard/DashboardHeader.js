import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  faChartArea,
  faSun,
  faCloud,
  faSnowflake,
  faCloudShowersHeavy,
  faCloudRain,
  faBolt,
  faTemperatureHigh,
  faSmog,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InfoCard from "../ShareComponents/InfoCard";
import PanelHeader from "../ShareComponents/helpers/PanelHeader";
import { getWeatherData } from "../../redux/actions/weatherAction";
import "../../styles/Dashboard/dashboardHeader.scss";

const DashboardHeader = ({ userInfo, isOperator }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { timeRecorded, currentWeather } = useSelector((state) => state.weatherData);
  const [time, setTime] = useState(new Date());
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  // Template reference: https://openweathermap.org/weather-conditions
  const weatherTemplate = {
    Clear: { des: "Sunny", icon: faSun },
    Clouds: { des: "Cloudy", icon: faCloud },
    Snow: { des: "Snowy", icon: faSnowflake },
    Rain: { des: "Rainy", icon: faCloudShowersHeavy },
    Drizzle: { des: "Drizzly", icon: faCloudRain },
    Thunderstorm: { des: "Thunderstorm", icon: faBolt },
    Mist: { des: "Misty", icon: faSmog },
    Smoke: { des: "Smoky", icon: faSmog },
    Haze: { des: "Hazy", icon: faSmog },
    Dust: { des: "Dusty", icon: faSmog },
    Fog: { des: "Foggy", icon: faSmog },
    Sand: { des: "Sandy", icon: faSmog },
    Ash: { des: "Ash", icon: faSmog },
    Squall: { des: "Squall", icon: faSmog },
    Tornado: { des: "Tornado", icon: faSmog },
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    navigator.geolocation.getCurrentPosition(function (position) {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
    });

    return function cleanup() {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      if (!timeRecorded) {
        dispatch(getWeatherData(latitude, longitude));
      } else {
        // Limit api call to 15 mins.
        const diff = Math.abs(Date.now() - timeRecorded);
        const minutes = Math.floor(diff / 1000 / 60);
        if (minutes > 15) dispatch(getWeatherData(latitude, longitude));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  return (
    <div className="fleet-main-header">
      <div className="header-left">
        <PanelHeader
          icon={faChartArea}
          text={t("general.welcome_back_userInfo_name", { userInfo_name: userInfo.first_name })}
        />
        {!isOperator && <p className="text-white">{t("fleetPanel.greeting_message_1")}</p>}
      </div>
      <div className="header-right">
        <InfoCard>
          <div className="weather-widget">
            <div className="weather-left">
              <div className="loc-name">{currentWeather ? currentWeather.name : "------"}</div>
              <div className="temp">
                {currentWeather ? currentWeather.main.temp.toFixed() : "--"}
                <span>&deg;</span>
              </div>
            </div>
            <div className="weather-right">
              <div className="time">{time.toLocaleTimeString()}</div>
              <div className="description">
                {currentWeather ? (
                  <div className="p-d-flex p-jc-end p-ai-center">
                    <FontAwesomeIcon
                      icon={weatherTemplate[currentWeather.weather[0].main]["icon"]}
                      color="white"
                    />
                    <div className="p-ml-3">
                      {weatherTemplate[currentWeather.weather[0].main]["des"]}
                    </div>
                  </div>
                ) : (
                  <div className="p-d-flex p-jc-end p-ai-center">
                    <FontAwesomeIcon icon={faTemperatureHigh} color="white" />
                    <div className="p-ml-3">{"-----"}</div>
                  </div>
                )}
              </div>
              <div className="temp-range">
                H:{currentWeather ? currentWeather.main.temp_max.toFixed() : "--"}
                <span>&deg;</span>
                {"  "}
                L:{currentWeather ? currentWeather.main.temp_min.toFixed() : "--"}
                <span>&deg;</span>
              </div>
            </div>
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

export default DashboardHeader;
