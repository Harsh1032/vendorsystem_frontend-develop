import axios from "axios";
import ConsoleHelper from "../helpers/ConsoleHelper";

export function sendGetRequests(urls, header = {}, callbacks, errorHandler, final) {
  const requests = [];
  urls.forEach((url) => {
    const tempRequest = axios.get(url, header).catch((err) => {
      throw new Error(err.customErrorMsg);
    });

    requests.push(tempRequest);
  });

  Promise.allSettled(requests)
    .then((results) => {
      if (Array.isArray(callbacks)) {
        callbacks.forEach((callback, index) => {
          if (results[index].status === "fulfilled") {
            callback(results[index].value, results[index].status);
          } else if (results[index].status === "rejected") {
            callback(results[index].reason, results[index].status);
          }
        });
      } else {
        callbacks(results[0].value);
      }
    })
    .catch((error) => {
      errorHandler && errorHandler(error);
      ConsoleHelper(error);
    })
    .finally(() => final && final());
}

export function sendPostRequest(urls, data = {}, header = {}, callbacks, errorHandler) {
  if (typeof urls === "string") {
    axios
      .post(urls, data, header)
      .then((res) => {
        callbacks(res);
      })
      .catch((error) => {
        errorHandler && errorHandler(error);
        ConsoleHelper(error);
      });
  } else if (Array.isArray(urls)) {
    const requests = [];
    urls.forEach((url, index) => {
      const tempRequest = axios.post(url, data[index], header);

      requests.push(tempRequest);
    });
    Promise.allSettled(requests)
      .then((results) => {
        const rejectedResults = results.filter((res) => res.status === "rejected");
        if (rejectedResults.length) {
          rejectedResults.forEach((result) => {
            errorHandler && errorHandler(result.reason);
            ConsoleHelper(result.reason);
          });
        } else {
          if (Array.isArray(callbacks)) {
            callbacks.forEach((callback, index) => {
              callback(results[index].value);
            });
          } else callbacks();
        }
      })
      .catch((error) => {
        errorHandler && errorHandler(error);
        ConsoleHelper(error);
      });
  }
}
