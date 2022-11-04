import { Button } from "primereact/button";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { CTRL_AUDIO_PLAY } from "../../redux/types/audioTypes";
import useWindowSize from "./helpers/useWindowSize";
import "../../styles/ShareComponents/QuickAccessTabs.scss";

const QuickAccessTabs = ({ tabs, activeTab, urls, scrollable }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const innerWidth = useWindowSize("layout-content-inner").width;
  const onUrl = (url) => {
    history.push(url);
  };

  const [tabUlWidth, setTabUlWidth] = useState(null);
  const [tabWidth, setTabWidth] = useState(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [arrowsDisabled, setArrowsDisabled] = useState({ left: false, right: false });
  const [layoutReady, setLayoutReady] = useState(false);

  const tabUlRef = useRef();

  useEffect(() => {
    if (tabUlRef.current && scrollable) {
      setLayoutReady(false);
      const allTabs = [...tabUlRef.current.childNodes];
      const maxSpanWidth = Math.max(...allTabs.map((el) => el.childNodes[0].offsetWidth));
      let totalWidth = 0;
      let maxTabWidth;

      allTabs.forEach((tab, index) => {
        let compStyles = window.getComputedStyle(tab);
        let paddingLeft = parseInt(compStyles.getPropertyValue("padding-left"), 10);
        let paddingRight = parseInt(compStyles.getPropertyValue("padding-right"), 10);
        let marginLeft = parseInt(compStyles.getPropertyValue("margin-left"), 10);
        let marginRight = parseInt(compStyles.getPropertyValue("margin-right"), 10);

        totalWidth += marginLeft + paddingLeft + maxSpanWidth + paddingRight + marginRight;
        if (index === allTabs.length - 1) {
          maxTabWidth = paddingLeft + maxSpanWidth + paddingRight;
        }
      });

      setTabUlWidth(totalWidth);
      setTabWidth(maxTabWidth);
      setLayoutReady(true);
    } else {
      setTabUlWidth(null);
      setTabWidth(null);
    }
  }, [scrollable, innerWidth]);

  useEffect(() => {
    if (layoutReady) {
      const allTabs = [...tabUlRef.current.childNodes];
      let activeTab;
      let activeTabLeftDis = 0;
      const maxTabWidth = Math.max(...allTabs.map((el) => el.offsetWidth));

      for (let tab of allTabs) {
        let compStyles = window.getComputedStyle(tab);
        let marginLeft = parseInt(compStyles.getPropertyValue("margin-left"), 10);
        let marginRight = parseInt(compStyles.getPropertyValue("margin-right"), 10);
        if (tab.className.includes("active-tab")) {
          activeTab = tab;
          activeTabLeftDis += marginLeft;
          break;
        }
        activeTabLeftDis += marginRight + marginLeft + maxTabWidth;
      }
      const parentWidth = tabUlRef.current.parentNode.offsetWidth;
      const overflowWidth = tabUlRef.current.offsetWidth - parentWidth;

      const disOfActiveTabToMiddle = activeTabLeftDis + activeTab.offsetWidth / 2 - parentWidth / 2;

      if (disOfActiveTabToMiddle < 0) {
        tabUlRef.current.parentNode.scrollLeft = 0;
      } else if (disOfActiveTabToMiddle > 0 && disOfActiveTabToMiddle > overflowWidth) {
        tabUlRef.current.parentNode.scrollLeft = overflowWidth;
      } else {
        tabUlRef.current.parentNode.scrollLeft = disOfActiveTabToMiddle;
      }
    }
  }, [layoutReady, innerWidth]);

  useEffect(() => {
    const tabParentWidth = tabUlRef.current.parentNode.offsetWidth;
    const tabChildWidth = tabUlRef.current.offsetWidth;

    if (scrollLeft <= 0) {
      setArrowsDisabled({ left: true, right: false });
    } else if (scrollLeft > 0 && scrollLeft >= tabChildWidth - tabParentWidth) {
      setArrowsDisabled({ left: false, right: true });
    } else {
      setArrowsDisabled({ left: false, right: false });
    }
  }, [scrollLeft]);

  const scroll = (direction) => {
    if (tabUlRef.current) {
      const tabParentWidth = tabUlRef.current.parentNode.offsetWidth;
      const tabChildWidth = tabUlRef.current.offsetWidth;
      const step = Math.ceil((tabChildWidth - tabParentWidth) / 2);
      const currScrollLeft = tabUlRef.current.parentNode.scrollLeft;

      switch (direction) {
        case "LEFT":
          tabUlRef.current.parentNode.scrollTo({
            top: 0,
            left: currScrollLeft - step,
            behavior: "smooth",
          });
          break;
        case "RIGHT":
          tabUlRef.current.parentNode.scrollTo({
            top: 0,
            left: currScrollLeft + step,
            behavior: "smooth",
          });
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className={`quick-access-tabs ${scrollable ? "quick-access-tabs-overflow" : ""} p-d-flex`}>
      <div className="tab-content" onScroll={(e) => setScrollLeft(e.target.scrollLeft)}>
        <div className="access-tab-ul p-d-flex" ref={tabUlRef} style={{ width: tabUlWidth }}>
          {tabs.map((tab, index) => (
            <div
              id={tab}
              key={index}
              className={`
            access-tab 
            ${tab === activeTab ? "active-tab" : ""}
          `}
              onClick={(e) => {
                dispatch({ type: CTRL_AUDIO_PLAY, payload: "main_tab" });
                onUrl(urls[index]);
              }}
              style={{ background: "black", width: tabWidth }}
            >
              <span>{tab}</span>
            </div>
          ))}
        </div>
      </div>
      {scrollable ? (
        <React.Fragment>
          <Button
            icon="pi pi-chevron-left"
            className="p-button-rounded p-button-text p-button-left"
            aria-label="left"
            onClick={() => scroll("LEFT")}
            disabled={arrowsDisabled.left}
          />
          <Button
            icon="pi pi-chevron-right"
            className="p-button-rounded p-button-text p-button-right"
            aria-label="right"
            onClick={() => scroll("RIGHT")}
            disabled={arrowsDisabled.right}
          />
        </React.Fragment>
      ) : null}
    </div>
  );
};

export default QuickAccessTabs;
