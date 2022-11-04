import { AUDIO_DATA_UPDATE } from "../types/audioTypes";
import { getAuthHeader } from "../../helpers/Authorization";
import { sendGetRequests } from "../../helpers/HttpRequestHelper";
import * as Constants from "../../constants";
import ConsoleHelper from "../../helpers/ConsoleHelper";
import { sendPostRequest } from "../../helpers/HttpRequestHelper";

export const updateAudioData = (isSoundOn, volume) => async (dispatch) => {
  try {
    const volumePercentage = volume * 20;
    dispatch({
      type: AUDIO_DATA_UPDATE,
      sound: isSoundOn,
      systemVolume: volumePercentage / 100,
    });

    const callback = (result) => {
      const { sound, sound_percentage } = result.data.user_config;

      if (sound !== isSoundOn || volumePercentage !== sound_percentage) {
        const headers = getAuthHeader();
        headers.headers["Content-Type"] = "application/json";
        const data = { sound: isSoundOn, sound_percentage: volumePercentage };

        sendPostRequest(
          `${Constants.ENDPOINT_PREFIX}/api-auth/v1/User/Update/Configuration`,
          data,
          headers
        );
      }
    };

    sendGetRequests(
      [`${Constants.ENDPOINT_PREFIX}/api-auth/v1/User/Info`],
      {
        ...getAuthHeader(),
      },
      [callback]
    );
  } catch (error) {
    ConsoleHelper(error);
  }
};
