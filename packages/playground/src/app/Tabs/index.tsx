import "primeicons/primeicons.css";
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import "primereact/resources/primereact.css";
import "./index.css";
import { MessageContext, MessageProvider } from '~/context/messages/';
import { MessageDispatch, MessageState } from '~/context/messages/reducer';
import React, { useState, useContext, useEffect, useRef, ReactElement } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { MoveEditor } from '@aric0x02/move-editor';

import "./TabView.css";
import { Dispatch, State } from '~/context/app/reducer';
import { AppContext, AppProvider } from '~/context/app/';

// import Editor from "@monaco-editor/react";
import files from "./files";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { type editor } from 'monaco-editor';
/**
 * Custom close event.
 * @see {@link TabViewProps.onTabClose}
 * @event
 */
export interface TabViewTabCloseEvent {
    /**
     * Browser event
     */
    originalEvent: React.SyntheticEvent;
    /**
     * Index of the selected tab
     */
    index: number;
}

/**
 * Custom change event.
 * @see {@link TabViewProps.onTabChange}
 * @event
 */
export interface TabViewTabChangeEvent {
    /**
     * Browser event
     */
    originalEvent: React.SyntheticEvent;
    /**
     * Index of the selected tab
     */
    index: number;
}
// type TabsProps = {
//     editor: ReactElement;
// };
export const Tabs = () => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [fileName, setFileName] = useState<string | undefined>("script.js");

    const file = files[fileName as keyof typeof files];
    useEffect(() => {
        editorRef.current?.focus();
    }, [file.name]);
    const [state, dispatch]: [State, Dispatch] = useContext(AppContext);
    const [, messageDispatch]: [MessageState, MessageDispatch] = useContext(MessageContext);
    const { openFile, renameFile, deleteFile } = state;
    const [nextId, setNextId] = useState(3);
    const [tabPanels, setTabPanels] = useState([
        { id: "100", header: "script.js", body: "script.js" },
        { id: "101", header: "style.css", body: "style.css" },
        { id: "102", header: "index.html", body: "index.html" }
    ]);
    const [activeIndex, setActiveIndex] = useState(0);
    useEffect(() => {
        if (!openFile) return;

        const index = tabPanels == undefined ? -1 : tabPanels.findIndex((p) => p != undefined && p.id == openFile[0]);
        if (index == undefined || -1 == index) {
            addTab(openFile[0] == undefined ? (nextId + 100) + "" : openFile[0], openFile[1] == undefined ? "Tab " + (nextId + 100) : openFile[1])
            setActiveIndex(tabPanels.length + 1);
        } else {
            setActiveIndex(index + 1);
        }
    }, [openFile]);
    useEffect(() => {
        if (!deleteFile) return;

        const index = tabPanels == undefined ? -1 : tabPanels.findIndex((p) => p != undefined && p.header == deleteFile);
        if (-1 != index) {
            console.log("removing index " + index);
            delete tabPanels[index];
            setTabPanels(tabPanels);
            setActiveIndex(tabPanels.length > 0 ? tabPanels.length - 1 : 0);
        }
    }, [deleteFile]);
    useEffect(() => {
        if (!renameFile) return;

        const index = tabPanels == undefined ? -1 : tabPanels.findIndex((p) => p != undefined && p.id == renameFile[0]);
        if (-1 != index) {
            console.log("renaming index " + index);
            if (tabPanels !== undefined && index < tabPanels.length && typeof tabPanels[index] !== 'undefined') {
                const tab = tabPanels[index];
                if (tab != undefined) {
                    tab.header = renameFile[1] ?? "";
                }
            }
            setTabPanels([...tabPanels]);
        }
    }, [renameFile]);
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
        updateFileName(name);
        const fileObj = files[name as keyof typeof files] == undefined ? files["TodoList.move"] : files[name as keyof typeof files];
        dispatch({ type: 'SET_PATH_CODE', payload: [id, name, fileObj.value] });

    };
    const updateFileName = (name: string | undefined) => {
        const fn = files[name as keyof typeof files] == undefined ? "TodoList.move" : name;
        setFileName(fn);
    };

    const onRustAnalyzerStartLoad = () => {
        messageDispatch({
            type: 'LOG_SYSTEM',
            payload: { status: 'IN_PROGRESS', content: 'Loading Rust Analyzer...' },
        });
    };

    const onRustAnalyzerFinishLoad = () => {
        dispatch({
            type: 'SET_RUST_ANALYZER_STATE',
            payload: true,
        });
        messageDispatch({
            type: 'LOG_SYSTEM',
            payload: { status: 'DONE', content: 'Rust Analyzer Ready' },
        });
    };
    const handleEditorChange = (value: string | undefined, event: editor.IModelContentChangedEvent) => {
        console.log(value, event);
        const tab = tabPanels[activeIndex - 1];
        dispatch({ type: 'SET_PATH_CODE', payload: [tab?.id ?? "", tab?.header ?? "", value ?? ""] });
    };

    return (
        <div className="tabview-demo">
            <button onClick={() => addTab((nextId + 100) + "", "Tab " + (nextId + 100))}>add</button>
            <div className="card">
                <TabView
                    onTabClose={removeTab}
                    activeIndex={activeIndex}
                    onTabChange={(e) => {
                        setActiveIndex(e.index); updateFileName(tabPanels[e.index - 1]?.header);
                        console.log(e.index, "===========", tabPanels[e.index - 1]);
                        if (tabPanels[e.index - 1] != undefined) {
                            dispatch({ type: 'SET_FILE_ID', payload: tabPanels[e.index - 1]?.id });
                        }
                    }}
                    renderActiveOnly={false}
                >
                    <TabPanel header="Sticky" key="sticky">
                        sticky
                    </TabPanel>
                    {tabPanels.map((tab) => {
                        return tab && (
                            <TabPanel closable header={tab.header} key={tab.id}>
                                {tab.body}
                            </TabPanel>
                        );
                    })}
                </TabView>
            </div>
            <div style={{ backgroundColor: 'cyan', width: '100%', height: '80%', overflow: 'auto', position: 'fixed' }}>
                <MoveEditor
                    onRustAnalyzerStartLoad={onRustAnalyzerStartLoad}
                    onRustAnalyzerFinishLoad={onRustAnalyzerFinishLoad}
                    onCodeChange={handleEditorChange}
                    numbering={state.numbering}
                    darkmode={state.darkmode}
                    rustAnalyzer={state.rustAnalyzer}
                    minimap={state.minimap}
                    path={file.name}
                    defaultLanguage={file.language}
                    defaultValue={file.value}
                    onMount={(editor) => (editorRef.current = editor)}
                    setURI={uri => dispatch({ type: 'SET_URI', payload: uri })}
                />
            </div>
        </div>
    );
};
