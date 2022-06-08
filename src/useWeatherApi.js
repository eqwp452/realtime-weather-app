import { useState, useEffect, useCallback } from "react";

const fetchCurrentWeather = (locationName) => {
  return fetch(
    "https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-60CFE742-A9A5-48EF-B63C-BD3E0E7FAD9C" +
      "&locationName=" +
      locationName
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("CurrentWeather", data);

      /*
      const fetchLocation = (name) => {
        let item = data.records.location;
        for (var i in [...Array(item.length).keys()]) {
          if (item[i].locationName === name) return item[i];
        }
        return item[0];
      };
*/
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["WDSD", "TEMP", "HUMD"].includes(item.elementName)) {
            neededElements[item.elementName] = item.elementValue;
          }
          return neededElements;
        },
        {}
      );

      return {
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        humid: weatherElements.HUMD
      };
    })
    .catch((err) => {
      console.log(err);
    });
};

const fetchWeatherForecast = (locationName) => {
  return fetch(
    "https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-60CFE742-A9A5-48EF-B63C-BD3E0E7FAD9C" +
      "&locationName=" +
      locationName
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("WeatherForecast", data);
      /*
      const fetchLocation = (name) => {
        let item = data.records.location;
        for (var i in [...Array(item.length).keys()]) {
          if (item[i].locationName === name) return item[i];
        }
        return item[0];
      };
*/
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["Wx", "PoP", "CI"].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[2].parameter;
          }
          return neededElements;
        },
        {}
      );
      /*  
      setWeatherElement((prevState) => ({
        ...prevState,
        description: weatherElements.Wx,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP,
        comfortability: weatherElements.CI
        //humid: weatherElements.PoP
      }));
      */

      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName
      };
    })
    .catch((err) => {
      console.log(err);
    });
};

const useWeataherApi = (currentLocation) => {
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: "高雄市",
    humid: 0,
    temperature: 0,
    windSpeed: 0,
    description: "",
    weatherCode: 0,
    rainPossibility: 0,
    comfrortability: "",
    isLoading: true
  });

  const { locationName, cityName } = currentLocation;

  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      setWeatherElement((prevState) => ({
        ...prevState,
        isLoading: true
      }));

      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(locationName),
        fetchWeatherForecast(cityName)
      ]);

      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        isLoading: false
      });
    };

    fetchingData();
  }, [currentLocation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return [weatherElement, fetchData];
};

export default useWeataherApi;
