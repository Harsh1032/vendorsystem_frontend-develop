import React, { useEffect } from "react";
import ReactGA from "react-ga";
import "./custom.scss";
import { getAuthHeader } from "./helpers/Authorization";
import Spinner from "./components/ShareComponents/Spinner";
import { Suspense } from "react";
import PrimeInterface from "./routes/PrimeInterface";
import NoAuthRoute from "./routes/NoAuthRoute";
import smoothscroll from "smoothscroll-polyfill";

// kick off the smooth scroll polyfill!
smoothscroll.polyfill();

// Google Analytics setup
const GOOGLE_ANALYTICS_TRACKING_ID = "UA-192617522-1";
ReactGA.initialize(GOOGLE_ANALYTICS_TRACKING_ID);

const App = (props) => {
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);

    //to clear query params on page refresh
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  let authHeader = getAuthHeader();
  let screen = <NoAuthRoute />;
  if (authHeader !== null) {
    screen = <PrimeInterface />;
  }
  return <Suspense fallback={<Spinner />}>{screen}</Suspense>;
};

export default App;
