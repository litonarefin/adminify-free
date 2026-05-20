import { useState, useEffect, useRef } from "react";
import Dropdown from "./Dropdown";
import {
  checkJsVoid,
  generateTopBarMenuDOM,
  getPath,
  handleURLChange,
  triggerJsVoidClick,
  isExternalUrl,
} from "../../utils/uitls";

const MenuItems = ({ items, depthLevel, setUrl }) => {
  const [dropdown, setDropdown] = useState(false);

  let ref = useRef();

  useEffect(() => {
    const handler = (event) => {
      if (dropdown && ref.current && !ref.current.contains(event.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [dropdown]);

  const onMouseEnter = () => {
    window.innerWidth > 960 && setDropdown(true);
  };

  const onMouseLeave = () => {
    window.innerWidth > 960 && setDropdown(false);
  };

  return (
    <li
      // className="menu-items"
      className={`adminify-top-menu-item adminify-top-menu-${items?.id}${
        items?.meta?.class ? ` ${items?.meta?.class}` : ""
      }`}
      id={`adminify-top-menu-${items?.id}`}
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {typeof items?.submenu === "object" && Object.values(items?.submenu).length > 0 ? (
        <>
          {!items?.title && depthLevel > 0 ? (
            <>
              {Object.values(items?.submenu)?.map((submenu, index) => {
                if (submenu?.menu_status === false) return null;
                return (
                  <ul key={index}>
                    <MenuItems items={submenu} depthLevel={depthLevel + 1} setUrl={setUrl} />
                  </ul>
                );
              })}
            </>
          ) : (
            <>
              {items.menu_status === false
                ? null
                : (() => {
                    const isExternal = isExternalUrl(items?.href);

                    return (
                      <>
                        <a
                          href={
                            items?.href ? (isExternal ? items?.href : getPath(items?.href)) : "#"
                          }
                          aria-haspopup="menu"
                          aria-expanded={dropdown ? "true" : "false"}
                          {...(isExternal ? { target: "_blank" } : {})}
                          onClick={(e) => {
                            // Allow Ctrl+Click or Cmd+Click to open in new tab
                            if (e.ctrlKey || e.metaKey) {
                              return;
                            }

                            // External URLs - let browser handle with target="_blank"
                            if (isExternal) {
                              return;
                            }

                            e.preventDefault();
                            if (items?.href) {
                              setUrl(getPath(items?.href));
                              handleURLChange(getPath(items?.href));
                            }
                            setDropdown((prev) => !prev);
                          }}
                          dangerouslySetInnerHTML={{
                            __html: generateTopBarMenuDOM({
                              icon: items?.icon,
                              title: items?.title,
                            }),
                          }}
                        />
                        <Dropdown
                          depthLevel={depthLevel}
                          submenus={Object.values(items?.submenu)}
                          dropdown={dropdown}
                          setUrl={setUrl}
                        />
                      </>
                    );
                  })()}
            </>
          )}
        </>
      ) : (
        (() => {
          const isJsVoid = checkJsVoid(items?.href);
          const isExternal = isExternalUrl(items?.href);

          return (
            <a
              href={
                items?.href && !isJsVoid ? (isExternal ? items?.href : getPath(items?.href)) : "#"
              }
              dangerouslySetInnerHTML={{
                __html: generateTopBarMenuDOM({ icon: items?.icon, title: items?.title }),
              }}
              {...(isExternal ? { target: "_blank" } : {})}
              onClick={(e) => {
                // Allow Ctrl+Click or Cmd+Click to open in new tab
                if (e.ctrlKey || e.metaKey) {
                  return;
                }

                // External URLs - let browser handle with target="_blank"
                if (isExternal && !isJsVoid) {
                  return;
                }

                e.preventDefault();

                // Javascript void - trigger original element click
                if (isJsVoid) {
                  return triggerJsVoidClick(items?.id);
                }

                // Internal URL - update iframe
                if (items?.href) {
                  setUrl(getPath(items?.href));
                  handleURLChange(getPath(items?.href));
                }
              }}
            />
          );
        })()
      )}
    </li>
  );
};

export default MenuItems;
