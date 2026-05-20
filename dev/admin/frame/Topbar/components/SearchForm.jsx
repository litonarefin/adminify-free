import { useEffect, useState } from "react";
import { handleURLChange, replaceAmpInUrl } from "../../utils/uitls";

function SearchForm({ setShowSearch, setUrl }) {
    const [searchText, setSearchText] = useState("");
    const [searchData, setSearchData] = useState({});
    const [errorText, setErrorText] = useState("");

    const getSearchData = (text) => {
        if (!text) return;
        jQuery.ajax({
            url: WPAdminify.ajax_url,
            type: "POST",
            dataType: "json",
            data: {
                action: "adminify_all_search",
                security: WPAdminify.security_nonce,
                search: text,
            },
            success: function (response) {
                if (response) {
                    if (!!response?.data?.message) {
                        setErrorText(response?.data?.message);
                        setSearchData({});
                    } else {
                        const data = JSON.parse(response?.data?.data);

                        if (
                            !data?.all_plugins?.length &&
                            !data?.foundposts?.length &&
                            !data?.all_comments?.length &&
                            !data?.all_taxonomies?.length &&
                            !data?.all_users?.length
                        ) {
                            setErrorText("No Result Found!");
                            setSearchData({});
                        } else {
                            setSearchData(data);
                            setErrorText("");
                        }
                    }
                }
            },
        });
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            getSearchData(searchText.trim());
        }, 1000);

        return () => clearTimeout(delaySearch);
    }, [searchText]);

    return (
        <>
            <div className="frame-adminify-search-overlay" onClick={() => setShowSearch(false)} />
            <div className="frame-adminify-search-form">
                <div className="frame-adminify-search">
                    <input
                        type="search"
                        placeholder="Search here"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M7 0C4.24 0 2 2.24 2 5C2 6.2 2.44 7.29 3.15 8.15L0 11.29L0.71 12L3.85 8.86C4.71 9.56 5.8 10.01 7 10.01C9.76 10.01 12 7.77 12 5.01C12 2.25 9.76 0 7 0ZM7 9C4.79 9 3 7.21 3 5C3 2.79 4.79 1 7 1C9.21 1 11 2.79 11 5C11 7.21 9.21 9 7 9Z"
                            fill="black"
                        />
                    </svg>
                </div>

                <div className="frame-adminify-search-list">
                    {searchData?.foundposts?.length ? (
                        <ul>
                            <li className="adminify-search-title">Posts</li>
                            {searchData?.foundposts?.map((item, i) => (
                                <li key={i}>
                                    <a
                                        href={item?.link || "#"}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setUrl(replaceAmpInUrl(item?.link));
                                            handleURLChange(replaceAmpInUrl(item?.link));
                                            setShowSearch(false);
                                        }}>
                                        {item?.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    {searchData?.all_comments?.length ? (
                        <ul>
                            <li className="adminify-search-title">Comments</li>
                            {searchData?.all_comments?.map((item, i) => (
                                <li key={i}>
                                    <a
                                        href={item?.link || "#"}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setUrl(replaceAmpInUrl(item?.link));
                                            handleURLChange(replaceAmpInUrl(item?.link));
                                            setShowSearch(false);
                                        }}>
                                        <p dangerouslySetInnerHTML={{ __html: item?.content }} />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    {searchData?.all_taxonomies?.length ? (
                        <ul>
                            <li className="adminify-search-title">Category</li>
                            {searchData?.all_taxonomies?.map((item, i) => (
                                <li key={i}>
                                    <a
                                        href={item?.link || "#"}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setUrl(replaceAmpInUrl(item?.link));
                                            handleURLChange(replaceAmpInUrl(item?.link));
                                            setShowSearch(false);
                                        }}>
                                        {item?.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    {searchData?.all_users?.length ? (
                        <ul>
                            <li className="adminify-search-title">Users</li>
                            {searchData?.all_users?.map((item, i) => (
                                <li key={i}>
                                    <a
                                        href={item?.link || "#"}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setUrl(replaceAmpInUrl(item?.link));
                                            handleURLChange(replaceAmpInUrl(item?.link));
                                            setShowSearch(false);
                                        }}>
                                        {item?.display_name || item?.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    {searchData?.all_plugins?.length ? (
                        <ul>
                            <li className="adminify-search-title">Plugins</li>
                            {searchData?.all_plugins?.map((item, i) => (
                                <li key={i}>
                                    <a
                                        href={item?.link || "#"}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setUrl(replaceAmpInUrl(item?.link));
                                            handleURLChange(replaceAmpInUrl(item?.link));
                                            setShowSearch(false);
                                        }}>
                                        {item?.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    {errorText ? (
                        <span style={{ marginTop: "1rem", display: "block" }}>{errorText}</span>
                    ) : null}
                </div>
            </div>
        </>
    );
}

export default SearchForm;
