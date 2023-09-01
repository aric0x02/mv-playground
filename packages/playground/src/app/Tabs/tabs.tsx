import React, { useState, useEffect, useRef } from "react";

import Editor from "@monaco-editor/react";
import files from "./files";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

function TestTabs() {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [fileName, setFileName] = useState("script.js");

    const file = files[fileName as keyof typeof files];

    useEffect(() => {
        editorRef.current?.focus();
    }, [file.name]);

    return (
        <>
            <button
                disabled={fileName === "script.js"}
                onClick={() => setFileName("script.js")}
            >
                script.js
            </button>
            <button
                disabled={fileName === "style.css"}
                onClick={() => setFileName("style.css")}
            >
                style.css
            </button>
            <button
                disabled={fileName === "index.html"}
                onClick={() => setFileName("index.html")}
            >
                index.html
            </button>
            <Editor
                height="80vh"
                theme="vs-dark"
                path={file.name}
                defaultLanguage={file.language}
                defaultValue={file.value}
                onMount={(editor) => (editorRef.current = editor)}
            />

        </>
    );
}

export default TestTabs;
