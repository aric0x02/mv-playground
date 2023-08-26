import "primeicons/primeicons.css";
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import "primereact/resources/primereact.css";
import "./index.css";


import React, { useState, useContext, useEffect } from "react";
import { TabView, TabPanel } from "primereact/tabview";

import "./TabView.css";
import { Dispatch, State } from '~/context/app/reducer';
import { AppContext, AppProvider } from '~/context/app/';


/**
 * Custom close event.
 * @see {@link TabViewProps.onTabClose}
 * @event
 */
interface TabViewTabCloseEvent {
    /**
     * Browser event
     */
    originalEvent: React.SyntheticEvent;
    /**
     * Index of the selected tab
     */
    index: number;
}
export const Tabs = () => {
    const [state]: [State, Dispatch] = useContext(AppContext);
    const { fileId } = state;
    const [nextId, setNextId] = useState(3);
    const [tabPanels, setTabPanels] = useState([
        { id: "100", header: "Tab 1", body: "Text 1" },
        { id: "101", header: "Tab 2", body: "Text 2" },
        { id: "102", header: "Tab 3", body: "Text 3" }
    ]);
    const [activeIndex, setActiveIndex] = useState(0);
    useEffect(() => {
        if (!fileId) return;

        const index = tabPanels == undefined ? -1 : tabPanels.findIndex((p) => p != undefined && p.id == fileId[0]);
        if (index == undefined || -1 == index) {
            addTab(fileId[0]==undefined?(nextId+100)+"":fileId[0], fileId[1]==undefined?"Tab "+(nextId+100):fileId[1])
            setActiveIndex(tabPanels.length + 1);
        } else {
            setActiveIndex(index + 1);
        }
    }, [fileId]);

    const removeTab = (e: TabViewTabCloseEvent) => {
        console.log(tabPanels, "removing index " + e.index);
        delete tabPanels[e.index - 1];
        setTabPanels(tabPanels);
        // setTabPanels(tabPanels.filter((p, i) => i !== e.index-1));
    };

    const addTab = (id: string, name: string) => {
        const tabs = [...tabPanels];

        tabs.push({
            id,
            header: name,
            body: "Text " + (nextId + 1)
        });
        setNextId(nextId + 1);
        setTabPanels(tabs);
    };
    return (
        <div className="tabview-demo">
            <button onClick={() => addTab((nextId + 100) + "", "Tab " + (nextId + 100))}>add</button>
            <div className="card">
                <TabView
                    onTabClose={removeTab}
                    activeIndex={activeIndex}
                    onTabChange={(e) => setActiveIndex(e.index)}
                    renderActiveOnly={false}
                >
                    <TabPanel header="Sticky" key="sticky">
                        sticky
                    </TabPanel>
                    {tabPanels.map((tab) => {
                        return tab ? (
                            <TabPanel closable header={tab.header} key={tab.id}>
                                {tab.body}
                            </TabPanel>
                        ) : <b></b>;
                    })}
                </TabView>
            </div>
        </div>
    );
};
