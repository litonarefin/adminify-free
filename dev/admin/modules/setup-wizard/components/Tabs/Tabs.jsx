import { Fragment, createContext, useContext, useState } from "@wordpress/element";

const TabContext = createContext();

function Tabs({ tabActiveKey, children }) {
    const [activeTab, setActiveTab] = useState(tabActiveKey);
    return (
        <div className="wp-adminify-tabs-wrapper">
            <ul>
                {children.map((item) => {
                    return (
                        <Fragment key={item?.props?.tabKey}>
                            <li
                                className={`${activeTab === item?.props?.tabKey ? "active" : ""}`}
                                onClick={() => {
                                    setActiveTab(item?.props?.tabKey);
                                    item?.props?.onTabClick();
                                }}>
                                {item?.props?.title}
                            </li>
                        </Fragment>
                    );
                })}
            </ul>
            <TabContext.Provider value={{ activeTab }}>{children}</TabContext.Provider>
        </div>
    );
}

function Tab({ tabKey, title = "", children }) {
    const { activeTab } = useContext(TabContext);
    return <Fragment>{tabKey === activeTab ? children : null}</Fragment>;
}

export { Tabs, Tab };
