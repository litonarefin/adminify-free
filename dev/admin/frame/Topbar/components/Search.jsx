function Search({ setShowSearch }) {
    return (
        <button className="frame-adminify-search-icon" onClick={() => setShowSearch(true)}>
            <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M7 0C4.24 0 2 2.24 2 5C2 6.2 2.44 7.29 3.15 8.15L0 11.29L0.71 12L3.85 8.86C4.71 9.56 5.8 10.01 7 10.01C9.76 10.01 12 7.77 12 5.01C12 2.25 9.76 0 7 0ZM7 9C4.79 9 3 7.21 3 5C3 2.79 4.79 1 7 1C9.21 1 11 2.79 11 5C11 7.21 9.21 9 7 9Z"
                    fill="var(--adminify-menu-text-color)"
                />
            </svg>
        </button>
    );
}

export default Search;
