import { GET_WEATHER_DATA, GET_WEATHER_ERROR } from "../types/weatherTypes";
import * as Constants from "../../constants";
import { sendGetRequests } from "../../helpers/HttpRequestHelper";

export const getWeatherData = (latitude, longitude) => (dispatch) => {
  const callback = (res) => {
    dispatch({
      type: GET_WEATHER_DATA,
      payload: res.data,
    });
  };

  const errorHandler = (error) => {
    dispatch({
      type: GET_WEATHER_ERROR,
      payload: error,
    });
  };

  sendGetRequests(
    [
      `${Constants.WEATHER_PREFIX}&lat=${latitude}&lon=${longitude}&appid=${Constants.WEATHER_SECRET}`,
    ],
    {},
    [callback],
    errorHandler
  );
};
