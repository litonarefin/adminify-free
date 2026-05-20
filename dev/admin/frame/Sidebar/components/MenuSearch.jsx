import { useState } from "@wordpress/element";

const MenuSearch = ({ onSearch }) => {
    const [searchText, setSearchText] = useState("");

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchText(value);
        onSearch(value);
    };

    return (
        <div className="frame-adminify-menu-search">
          <input
                type="text"
                className="frame-adminify-menu-search-input"
                placeholder="Search tools..."
                value={searchText}
                onChange={handleChange}
            />
            <svg
                className="frame-adminify-menu-search-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            
        </div>
    );
};

export default MenuSearch;
