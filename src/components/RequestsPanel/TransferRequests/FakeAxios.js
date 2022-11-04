import transferList from "./RequestData/transferList.json";
import quotesList from "./RequestData/quoteList.json";
import * as Constants from "../../../constants";

export default class FakeAxios {
  constructor(isSucceed) {
    this.isSucceed = isSucceed;
    this.transfers = transferList;
    this.quotes = quotesList;
  }

  //Mocking BE GET API route
  get(url, params = {}, header = {}) {
    //Always welcome to add you own testing route below

    //Get All Transfer List API
    if (url === `${Constants.ENDPOINT_PREFIX}/api/v1/Transfer/List/Quotes`) {
      let data = this.quotes;
      return new Promise((resolve, reject) => {
        if (this.isSucceed) {
          const res = {
            data,
            status: "fulfilled",
          };
          resolve(res);
        } else {
          const err = {
            code: "400",
            message: "Error is handled",
            status: "rejected",
          };
          reject(err);
        }
      });
    }
    //Get Transfer List By Client
    else if (url !== `${Constants.ENDPOINT_PREFIX}/api/v1/Transfer/List`) {
      const regex = new RegExp(
        `(?<=${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/Transfer/Get/).+`
      );
      if (regex.test(url)) {
        const client = url.match(regex)[0];
        let data = this.transfers.filter((el) => el.client_name === client);
        return new Promise((resolve, reject) => {
          if (this.isSucceed) {
            const res = {
              data,
              status: "fulfilled",
            };
            resolve(res);
          }

          //Other API
          else {
            const err = {
              code: "400",
              message: "Error is handled",
              status: "rejected",
            };
            reject(err);
          }
        });
      } else
        return new Promise((resolve, reject) => {
          const err = {
            code: "400",
            message: "Wrong API, please check it!",
            status: "rejected",
          };
          reject(err);
        });
    }
  }
}
