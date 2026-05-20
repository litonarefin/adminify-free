import { useEffect } from "@wordpress/element";
import { getPath, handleMenuItemClick } from "../../utils/uitls";

function SubMenu({ subMenu, isParent }) {
    const hoverSubmenu = (e) => {
        const hoverItem = e.target;
        if (hoverItem) {
            hoverItem.nextSibling.style.display = "block";
            console.warn("e", hoverItem.nextSibling);
        }
    };

    const leaveSubmenu = (e) => {
        const hoverItem = e.target;
        if (hoverItem) {
            hoverItem.nextSibling.style.display = "none";
            console.warn("e", hoverItem.nextSibling);
        }
    };

    return (
        <>
            {Object.values(subMenu).length > 0 ? (
                <div className={`adminify-sub-wrapper${isParent ? " adminify-sub-parent" : ""}`}>
                    <ul className="adminify-submenu">
                        {Object.values(subMenu)?.map((submenu) => (
                            <li
                                key={submenu?.id}
                                className="adminify-top-submenu-item"
                                onMouseEnter={hoverSubmenu}
                                onMouseLeave={leaveSubmenu}>
                                <a
                                    className="adminify-sub-item"
                                    href={submenu?.href ? getPath(submenu?.href) : "#"}
                                    dangerouslySetInnerHTML={{
                                        __html: submenu?.title,
                                    }}
                                    onClick={(e) =>
                                        handleMenuItemClick(e, getPath(submenu?.href), true)
                                    }
                                />
                                <SubMenu subMenu={submenu?.submenu} isParent={false} />
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </>
    );
}

export default SubMenu;
