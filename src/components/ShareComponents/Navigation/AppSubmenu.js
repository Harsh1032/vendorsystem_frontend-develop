import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import classNames from "classnames";
import { Ripple } from "primereact/ripple";
import { useTranslation } from "react-i18next";
import dashboard from "../../../images/menu/icon_menu_dashboard.png";
import orders from "../../../images/menu/icon_menu_orders.png";
import requests from "../../../images/menu/icon_menu_requests.png";
import pricing from "../../../images/menu/icon_menu_price.png";
import { CTRL_AUDIO_PLAY } from "../../../redux/types/audioTypes";

const AppSubmenu = (props) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(null);
  const dispatch = useDispatch();
  const iconNames = new Map();

  iconNames.set(t("navigationItems.dashboard"), dashboard);
  iconNames.set(t("navigationItems.orders"), orders);
  iconNames.set(t("navigationItems.requests"), requests);
  iconNames.set(t("navigationItems.pricing"), pricing);

  const onMenuItemClick = (event, item, index) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    //execute command
    if (item.command) {
      item.command({ originalEvent: event, item: item });
      event.preventDefault();
    }
    if (item.items) {
      event.preventDefault();
    }
    if (props.root) {
      props.onRootMenuitemClick({
        originalEvent: event,
      });
    }
    if (item.items) {
      setActiveIndex(index === activeIndex ? null : index);
    }

    props.onMenuitemClick({
      originalEvent: event,
      item: item,
    });

    event.target.closest("li.layout-root-menuitem").classList.remove("active-dropdown-mobile");
    event.stopPropagation();
    dispatch({ type: CTRL_AUDIO_PLAY, payload: "menu_click" });
  };

  const onMenuItemMouseEnter = (index) => {
    if (props.root && props.menuActive && props.menuMode === "slim" && !isMobile()) {
      setActiveIndex(index);
    }
  };

  const visible = (item) => {
    return typeof item.visible === "function" ? item.visible() : item.visible !== false;
  };

  const isMobile = () => {
    return window.innerWidth <= 991;
  };

  const isSlim = useCallback(() => {
    return props.menuMode === "slim";
  }, [props.menuMode]);

  const isCompact = useCallback(() => {
    return props.isCompact;
  }, [props.isCompact]);

  const getLink = (item, index) => {
    const menuitemIconClassName = classNames(
      "layout-menuitem-icon",
      !!item.icon ? item.icon : "pi pi-fw"
    );
    let imageOrIcon = (
      <>
        {item.image && <img src={item.image} className={menuitemIconClassName} alt={item.label} />}
        {item.icon && <i className={menuitemIconClassName} />}
        {item.items && <i className="pi pi-fw pi-angle-down layout-submenu-toggler" />}
      </>
    );
    let label = (
      <span className={`layout-menuitem-text ${isCompact() && props.root && "p-d-none"}`}>
        {t(item.label)}
      </span>
    );
    let badge = item.badgeKey && props.badges[item.badgeKey] > 0 && (
      <span
        className={`p-badge p-badge-danger p-ml-2 ${isCompact() && props.root && "p-badge-dot"}`}
      >
        {!(isCompact() && props.root) && props.badges[item.badgeKey]}
      </span>
    );

    // Display differently based on menu is in slim mode or not
    const content = isSlim() ? (
      // Slim mode
      props.root ? (
        <>
          <div className="p-overlay-badge">
            {imageOrIcon}
            {badge}
          </div>
          {label}
          <Ripple />
        </>
      ) : (
        <>
          {label}
          {badge}
          <Ripple />
        </>
      )
    ) : (
      <>
        {imageOrIcon}
        {label}
        {badge}
        <Ripple />
      </>
    );
    const commonLinkProps = {
      style: item.style,
      className: classNames(
        item.class,
        "p-ripple",
        {
          "p-disabled": item.disabled,
          "p-link": !item.to,
        },
        isSlim() ? "p-pt-3" : "",
        isCompact() && props.root ? "p-pb-3" : ""
      ),
      target: item.target,
      onClick: (e) => onMenuItemClick(e, item, index),
      onMouseEnter: () => onMenuItemMouseEnter(index),
    };

    if (item.url) {
      return (
        <a href={item.url} rel="noopener noreferrer" {...commonLinkProps}>
          {content}
        </a>
      );
    } else if (!item.to) {
      return (
        <button type="button" {...commonLinkProps}>
          {content}
        </button>
      );
    }

    return (
      <NavLink to={item.to} activeClassName="active-route" {...commonLinkProps}>
        {content}
      </NavLink>
    );
  };

  const isMenuActive = (item, index) => {
    return (
      item.items &&
      (props.root && (!isSlim() || (isSlim() && (props.mobileMenuActive || activeIndex !== null)))
        ? true
        : activeIndex === index)
    );
  };

  const getItems = () => {
    const mobileDropdown = (e) => {
      e.target
        .closest("ul.layout-menu")
        .querySelectorAll("li.layout-root-menuitem")
        .forEach((ele) => {
          if (e.target !== ele) {
            ele.classList.remove("active-dropdown-mobile");
          }
        });
      if (e.target.classList.contains("active-dropdown-mobile")) {
        e.target.classList.remove("active-dropdown-mobile");
      } else {
        e.target.classList.add("active-dropdown-mobile");
      }
    };

    const transitionTimeout = props.mobileMenuActive
      ? 0
      : isSlim() && props.root
      ? { enter: 400, exit: 400 }
      : props.root
      ? 0
      : { enter: 1000, exit: 450 };

    return props.items.map((item, i) => {
      if (visible(item)) {
        if (!item.separator) {
          const menuitemClassName = classNames({
            "layout-root-menuitem": props.root,
            "layout-root-menuitem-compact": isCompact() && props.root,
            "active-menuitem": activeIndex === i && !item.disabled,
          });
          const link = getLink(item, i);
          const rootMenuItem = props.root && (
            <div className="layout-root-menuitem">
              <img
                className="sidebar-mobile-icon"
                src={iconNames.get(t(item.label))}
                alt={t(item.label)}
              />
              <div className="layout-menuitem-root-text" style={{ textTransform: "uppercase" }}>
                {t(item.label)}
              </div>
              <i className="pi pi-chevron-down" />
            </div>
          );

          return (
            <li
              key={item.label || i}
              className={menuitemClassName}
              role="menuitem"
              onClick={mobileDropdown}
            >
              {link}
              {rootMenuItem}
              <CSSTransition
                classNames="layout-menu"
                timeout={transitionTimeout}
                in={isMenuActive(item, i)}
                unmountOnExit
              >
                <AppSubmenu
                  items={visible(item) && item.items}
                  badges={props.badges}
                  menuActive={props.menuActive}
                  menuMode={props.menuMode}
                  isCompact={props.isCompact}
                  parentMenuItemActive={activeIndex === i}
                  onMenuitemClick={props.onMenuitemClick}
                />
              </CSSTransition>
            </li>
          );
        } else {
          return <React.Fragment key={i} />;
        }
      }

      return null;
    });
  };

  useEffect(() => {
    if (!props.menuActive && isSlim()) {
      setActiveIndex(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.menuActive]);

  if (!props.items) {
    return null;
  }

  const items = getItems();
  return (
    <ul
      className={`layout-menu ${isCompact() && isSlim() && "layout-menu-compact"} ${
        !props.root && "layout-menu-enter-done"
      }`}
      role="menu"
    >
      {items}
    </ul>
  );
};

export default AppSubmenu;
