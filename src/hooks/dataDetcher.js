import React from "react";
import axios from "axios";
import { getAuthHeader } from "../helpers/Authorization";
import { sendGetRequests } from "../helpers/HttpRequestHelper";
import { ENDPOINT_PREFIX } from "../constants/index";
import ConsoleHelper from "../helpers/ConsoleHelper";

function useRequestedData(urlArray) {
  const [dataArray, setDataArray] = React.useState([]);
  const [dataReady, setDataReady] = React.useState(false);
  const [errors, setErrors] = React.useState(null);

  const cancelTokenSource = axios.CancelToken.source();
  React.useEffect(() => {
    if (typeof urlArray === "string") {
      const callback = (response) => {
        setDataArray(response);
        setDataReady(true);
      };

      const errorHandler = (err) => {
        ConsoleHelper("error", err);
        setErrors(err.customErrorMsg);
        setDataReady(true);
      };

      sendGetRequests(
        [`${ENDPOINT_PREFIX}/${urlArray}`],
        {
          ...getAuthHeader(),
          cancelToken: cancelTokenSource.token,
        },
        [callback],
        errorHandler
      );
    } else {
      const callback = (results) => {
        results.forEach((result, i) => {
          if (result.status === "fulfilled") {
            setDataArray((prev) => [...prev, result.value]);
          } else {
            setDataArray((prev) => [...prev, undefined]);
            setErrors((prev) => ({ ...prev, [i]: result.reason }));
          }
        });
      };

      const errorHandler = (error) => {};
      const final = () => {
        setDataReady(true);
      };
      const requestUrls = urlArray.map((url) => `${ENDPOINT_PREFIX}/${url}`);
      sendGetRequests(
        requestUrls,
        {
          ...getAuthHeader(),
          cancelToken: cancelTokenSource.token,
        },
        callback,
        errorHandler,
        final
      );
    }

    return () => {
      //Doing clean up work, cancel the asynchronous api call
      cancelTokenSource.cancel("cancel the asynchronous api call from custom hook");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(urlArray)]);

  if (typeof urlArray === "string") return [dataReady, dataArray, errors];
  else return [dataReady, ...dataArray, errors];
}

export { useRequestedData };
