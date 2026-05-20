import MenuItems from "./MenuItems";

const Dropdown = ({ submenus, dropdown, depthLevel, setUrl }) => {
    depthLevel = depthLevel + 1;
    const dropdownClass = depthLevel > 1 ? "adminify-dropdown-submenu" : "";

    return (
        <ul
            className={`adminify-dropdown ${dropdownClass} ${dropdown ? "show" : ""}`}
            data-dropdown-lavel={depthLevel}>
            {submenus.map((submenu, index) => {
                if(submenu.menu_status === false) return null;
                return (
                    <MenuItems items={submenu} key={index} depthLevel={depthLevel} setUrl={setUrl} />
                )
            })}
        </ul>
    );
};

export default Dropdown;
