import { useState } from "@wordpress/element";
import { getLogoutURL } from "../../utils/uitls";

function UserInfo({ userInfo }) {
    const [colors, setColors] = useState({
        link: userInfo?.info_text_color,
        border: userInfo?.info_text_border,
        icon: userInfo?.info_icon_color,
        borderRadius: userInfo?.user_info_avatar === "square" ? "0" : "50%"
    });

    return (
        <li className="frame-adminify-menu-item">
            <div
                className={`frame-adminify-admin-menu-top${
                    userInfo?.user_info_avatar ? ` adminify-${userInfo?.user_info_avatar}` : ""
                }${userInfo?.user_info_content ? ` adminify-${userInfo?.user_info_content}` : ""}`}>
                <div
                    className="frame-adminify-user-avatar"
                    dangerouslySetInnerHTML={{
                        __html: `<a style="border: 2px solid ${colors?.border}; border-radius: ${colors?.borderRadius}; width: 80px; height: 80px; display: flex;align-items: center; justify-content: center;" href="${userInfo.profile_url}">${userInfo?.img}</a>`,
                    }}
                />
                {userInfo?.user_info_content === "text" ? (
                    <div className="frame-adminify-user-details">
                        <h2 className="frame-adminify-user-name">
                            <span />
                            <a
                                onMouseEnter={() =>
                                    setColors({ ...colors, link: userInfo?.info_text_hover_color })
                                }
                                onMouseLeave={() =>
                                    setColors({ ...colors, link: userInfo?.info_text_color })
                                }
                                href={userInfo.profile_url}
                                style={{ color: colors?.link }}>
                                {userInfo.display_name}
                            </a>
                            <span className="frame-adminify-user-logout">
                                <a
                                    onMouseEnter={() =>
                                        setColors({
                                            ...colors,
                                            icon: userInfo?.info_icon_hover_color,
                                        })
                                    }
                                    onMouseLeave={() =>
                                        setColors({ ...colors, icon: userInfo?.info_icon_color })
                                    }
                                    title="Logout"
                                    href={`${
                                        adminify_admin_bar_data?.logout_url ? getLogoutURL() : "#"
                                    }`}>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M5.7587 4.31292e-07L7 9.08129e-07C7.55229 9.08129e-07 8 0.447716 8 1C8 1.55229 7.55229 2 7 2H5.8C4.94342 2 4.36113 2.00078 3.91104 2.03755C3.47262 2.07337 3.24842 2.1383 3.09202 2.21799C2.7157 2.40973 2.40974 2.7157 2.21799 3.09202C2.1383 3.24842 2.07337 3.47262 2.03755 3.91104C2.00078 4.36113 2 4.94342 2 5.8V14.2C2 15.0566 2.00078 15.6389 2.03755 16.089C2.07337 16.5274 2.1383 16.7516 2.21799 16.908C2.40973 17.2843 2.7157 17.5903 3.09202 17.782C3.24842 17.8617 3.47262 17.9266 3.91104 17.9624C4.36113 17.9992 4.94342 18 5.8 18H7C7.55229 18 8 18.4477 8 19C8 19.5523 7.55229 20 7 20H5.75868C4.95372 20 4.28937 20 3.74818 19.9558C3.18608 19.9099 2.66937 19.8113 2.18404 19.564C1.43139 19.1805 0.819468 18.5686 0.435975 17.816C0.188684 17.3306 0.0901197 16.8139 0.0441946 16.2518C-2.28137e-05 15.7106 -1.23241e-05 15.0463 4.31291e-07 14.2413V5.7587C-1.23241e-05 4.95373 -2.28137e-05 4.28937 0.0441947 3.74817C0.09012 3.18608 0.188685 2.66937 0.435976 2.18404C0.81947 1.43139 1.43139 0.819468 2.18404 0.435975C2.66938 0.188684 3.18608 0.0901197 3.74818 0.0441945C4.28937 -2.28137e-05 4.95373 -1.23241e-05 5.7587 4.31292e-07ZM13.2929 4.29289C13.6834 3.90237 14.3166 3.90237 14.7071 4.29289L19.7071 9.29289C20.0976 9.68342 20.0976 10.3166 19.7071 10.7071L14.7071 15.7071C14.3166 16.0976 13.6834 16.0976 13.2929 15.7071C12.9024 15.3166 12.9024 14.6834 13.2929 14.2929L16.5858 11H7C6.44772 11 6 10.5523 6 10C6 9.44772 6.44772 9 7 9H16.5858L13.2929 5.70711C12.9024 5.31658 12.9024 4.68342 13.2929 4.29289Z"
                                            fill={"var(--adminify-primary)"}
                                            style={
                                                colors?.icon ? { fill: colors?.icon } : {}
                                            }></path>
                                    </svg>
                                </a>
                            </span>
                        </h2>
                        <span className="frame-adminify-user-email">{userInfo.email}</span>
                    </div>
                ) : (
                    <div className="frame-adminify-icon">
                        <a href={userInfo.profile_url}>
                            <svg
                                width="18"
                                height="20"
                                viewBox="0 0 18 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M17 19C17 17.6044 17 16.9067 16.8278 16.3389C16.44 15.0605 15.4395 14.06 14.1611 13.6722C13.5933 13.5 12.8956 13.5 11.5 13.5H6.5C5.10444 13.5 4.40665 13.5 3.83886 13.6722C2.56045 14.06 1.56004 15.0605 1.17224 16.3389C1 16.9067 1 17.6044 1 19M13.5 5.5C13.5 7.98528 11.4853 10 9 10C6.51472 10 4.5 7.98528 4.5 5.5C4.5 3.01472 6.51472 1 9 1C11.4853 1 13.5 3.01472 13.5 5.5Z"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </a>
                        <a href={`${adminify_admin_bar_data?.logout_url ? getLogoutURL() : "#"}`}>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M14 15L19 10M19 10L14 5M19 10H7M7 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V14.2C1 15.8802 1 16.7202 1.32698 17.362C1.6146 17.9265 2.07354 18.3854 2.63803 18.673C3.27976 19 4.11984 19 5.8 19H7"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </a>
                    </div>
                )}
            </div>
        </li>
    );
}

export default UserInfo;
