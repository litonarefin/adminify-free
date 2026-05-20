import { useEffect, useState } from "@wordpress/element";
import { waitForElm } from "../../utils/uitls";

function Comments({ iframeFullReady }) {
    const [count, setCount] = useState(0);
    const handleClick = (e) => {
        setTimeout(() => {
            const notificationDiv = document.getElementById("adminify-container-slide-in");
            if (notificationDiv) {
                notificationDiv.classList.add("show");
            }
        }, 1);
    };

    useEffect(() => {
        function handleClickOutside(e) {
            if (jQuery(e.target).closest("#adminify-container-slide-in").length === 0) {
                jQuery("#adminify-container-slide-in").removeClass("show");
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        waitForElm("#frame-adminify-app--iframe").then((elm) => {
            setCount(window.notif_count);
            elm.contentWindow.addEventListener("mousedown", handleClickOutside);
            // elm.contentWindow.onload = (event) => {};
        });

        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
            waitForElm("#frame-adminify-app--iframe").then((elm) => {
                elm.contentWindow.addEventListener("mousedown", handleClickOutside);
                // elm.contentWindow.onload = (event) => {};
            });
        };
    }, [iframeFullReady]);

    return (
        <div className="wp-adminify--top--comment">
            <button className="adminify-comment-trigger" onClick={handleClick}>
                <div className="topbar-icon">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_2208_1278)">
                            <path
                                d="M9.41009 13C9.21009 13.58 8.65009 14 8.00009 14C7.35009 14 6.79009 13.58 6.59009 13H9.41009Z"
                                fill="#322F41"
                            />
                            <path d="M14 12H2V13H14V12Z" fill="#322F41" />
                            <path
                                d="M9.47003 3.22C9.00003 3.08 8.51003 3 8.00003 3C7.49003 3 7.00003 3.08 6.53003 3.22C6.66003 2.52 7.27003 2 8.00003 2C8.73003 2 9.34003 2.52 9.47003 3.22Z"
                                fill="#322F41"
                            />
                            <path
                                d="M13 8V12H12V8C12 6.25 10.87 4.76 9.3 4.22C8.89 4.08 8.45 4 8 4C7.55 4 7.11 4.08 6.7 4.22C5.13 4.76 4 6.25 4 8V12H3V8C3 5.75 4.49 3.85 6.53 3.22C7 3.08 7.49 3 8 3C8.51 3 9 3.08 9.47 3.22C11.51 3.85 13 5.75 13 8Z"
                                fill="#322F41"
                            />
                        </g>
                        <defs>
                            <clipPath id="clip0_2208_1278">
                                <rect
                                    width="12"
                                    height="12"
                                    fill="white"
                                    transform="translate(2 2)"
                                />
                            </clipPath>
                        </defs>
                    </svg>
                </div>
                <span className="comment-counter">{count || 0}</span>
            </button>
        </div>
    );
}

export default Comments;
