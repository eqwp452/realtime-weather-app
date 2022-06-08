import React, { useMemo, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { ThemeProvider } from "@emotion/react";
import { findLocation } from "./utils";
import sunriseSunset from "./sunrise-sunset.json";
import WeatherSetting from "./WeatherSetting";
import WeatherCard from "./WeatherCard";
import useWeatherApi from "./useWeatherApi";

const theme = {
  light: {
    backgroundColor: "#ededed",
    foregroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px 0 #999999",
    titleColor: "#212121",
    temperatureColor: "#757575",
    textColor: "#828282"
  },
  dark: {
    backgroundColor: "#1F2022",
    foregroundColor: "#121416",
    boxShadow:
      "0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)",
    titleColor: "#f9f9fa",
    temperatureColor: "#dddddd",
    textColor: "#cccccc"
  }
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherApp = () => {
  console.log("--- invoke function component ---");

  const StorageCity = localStorage.getItem("cityName");

  //使用 useState 定義當前要拉取天氣資訊的地區，預設值先訂為 台北市
  const [currentCity, setCurrentCity] = useState(StorageCity || "臺北市");
  const currentLocation = findLocation(currentCity) || {};
  const [weatherElement, fetchData] = useWeatherApi(currentLocation);
  const [currentTheme, setCurrentTheme] = useState("light");
  const [currentPage, setCurrentPage] = useState("WeatherCard");

  //const { locationName } = weatherElement;

  const getMoment = () => {
    const location = sunriseSunset.records.locations.location.reduce(
      (needElement, currentElement) => {
        if ([currentLocation.CityName].includes(currentLocation.CityName)) {
          needElement = [currentElement.time];
        }
        return needElement;
      },
      {}
    );
    console.log(location);
    const locationDate = location[0].reduce(
      (needElement, currentElement, index) => {
        needElement[index] = {
          dataTime: currentElement.dataTime || [],
          //日出時刻
          sunrise: currentElement.parameter[1].parameterValue || [],
          //日沒時刻
          sunset: currentElement.parameter[5].parameterValue || []
        };

        return needElement;
      },
      {}
    );

    const now = new Date();

    const nowDate = Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
      .format(now)
      .replace(/\//g, "-");

    //(object.values)the ouput is not an Object,so it need to convert to object
    const sunriseSunsetTime =
      Object.values(locationDate).find((el) => {
        return el.dataTime === nowDate;
      }) || [];

    console.log(sunriseSunsetTime);
    const sunriseTimestamp = new Date(
      `${sunriseSunsetTime.dataTime} ${sunriseSunsetTime.sunrise}`
    ).getTime();

    const sunsetTimestamp = new Date(
      `${sunriseSunsetTime.dataTime} ${sunriseSunsetTime.sunset}`
    ).getTime();

    const nowTimestamp = now.getTime();

    return sunriseTimestamp <= nowTimestamp && nowTimestamp <= sunsetTimestamp
      ? "day"
      : "night";
  };

  //根據日出日落資料的地區名稱，找出對應的日出日落時間
  const moment = useMemo(() => getMoment(currentLocation.sunriseCityName), [
    currentLocation.sunriseCityName
  ]);
  console.log(moment);

  useEffect(() => {
    setCurrentTheme(moment === "day" ? "light" : "dark");
  }, [moment]);

  useEffect(() => {
    localStorage.setItem("cityName", currentCity);
  }, [currentCity]);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {currentPage === "WeatherCard" && (
          <WeatherCard
            //把縣市名稱傳入 WeatherCard 中用以顯示
            cityName={currentLocation.cityName}
            weatherElement={weatherElement}
            moment={moment}
            fetchData={fetchData}
            setCurrentPage={setCurrentPage}
          />
        )}
        {console.log(currentLocation)}
        {currentPage === "WeatherSetting" && (
          <WeatherSetting
            citName={currentLocation.cityName}
            setCurrentCity={setCurrentCity}
            setCurrentPage={setCurrentPage}
          />
        )}
      </Container>
    </ThemeProvider>
  );
};

export default WeatherApp;
