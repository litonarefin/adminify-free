import { useState, useRef, useEffect } from "react";
import { getLogoutURL, handleLogout, handleMenuItemClick, waitForElm } from "../../utils/uitls";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { logout } from "../../utils/icons/logout";

function UserAccount() {
    const [isActive, setIsActive] = useState(false);
    const userInfo = frame_adminify_menu?.user_info;

    const ref = useRef();

    // Outside Click to hide dropdown
    useOutsideClick(ref, () => setIsActive(false));

    return (
        <div ref={ref} className="wp-adminify--user--account">
            <button
                className="wp-adminify-user-avatar"
                onClick={() => setIsActive((prev) => !prev)}
                dangerouslySetInnerHTML={{
                    __html: `${userInfo?.img}<span class="adminify-user-status"></span>`,
                }}></button>

            <div  className={`wp-adminify--user--wrapper ${isActive ? "active" : ""}`}>
                <div className="wp-adminify-user-info">
                    <h3 className="wp-adminify-user-name">
                        {userInfo?.display_name || userInfo?.username}
                    </h3>
                    <span>{userInfo?.email}</span>
                </div>

                <ul>
                    <hr />
                    <li>
                        <a
                            href={`${userInfo.profile_url}`}
                            onClick={(e) => handleMenuItemClick(e, userInfo.profile_url, true)}>
                            <svg
                                className="wp-adminify-profile-icon"
                                width="16"
                                height="18"
                                viewBox="0 0 16 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M14.6654 16.5C14.6654 15.337 14.6654 14.7555 14.5218 14.2824C14.1987 13.217 13.365 12.3834 12.2996 12.0602C11.8265 11.9167 11.245 11.9167 10.082 11.9167H5.91537C4.7524 11.9167 4.17091 11.9167 3.69775 12.0602C2.63241 12.3834 1.79873 13.217 1.47556 14.2824C1.33203 14.7555 1.33203 15.337 1.33203 16.5M11.7487 5.25C11.7487 7.32107 10.0698 9 7.9987 9C5.92763 9 4.2487 7.32107 4.2487 5.25C4.2487 3.17893 5.92763 1.5 7.9987 1.5C10.0698 1.5 11.7487 3.17893 11.7487 5.25Z"
                                    stroke="var(--adminify-primary)"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"></path>
                            </svg>
                            <span>View Profile</span>
                        </a>
                    </li>
                    <hr />
                    <li>
                        <a
                            href={`${adminify_admin_bar_data?.logout_url ? getLogoutURL() : "#"}`}
                            className="wp-adminify-logout">
                            {logout}
                            <span>Log Out</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default UserAccount;
