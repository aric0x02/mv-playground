import { Console } from './Console';
import { Layout } from './Layout';
import { Header } from './Header';
import { MoveFileTree } from './Tree';
import { Tabs } from './Tabs';
import { AppContext, AppProvider } from '~/context/app/';
import { MessageContext, MessageProvider } from '~/context/messages/';
import { ReactElement,useState, useContext, useEffect, useRef } from 'react';
import { Dispatch, State } from '~/context/app/reducer';
import { MessageDispatch, MessageState } from '~/context/messages/reducer';
import { loadCode } from '~/context/side-effects/load-code';
import { monaco } from 'react-monaco-editor';
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
const App = (): ReactElement => {
    const [state, dispatch]: [State, Dispatch] = useContext(AppContext);
    const [, messageDispatch]: [MessageState, MessageDispatch] = useContext(MessageContext);
    const { monacoUri: uri, formatting } = state;
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    useEffect(() => {
        editorRef.current?.focus();
    }, [state.fileId]);
    useEffect(() => {
        if (!uri) return;
        loadCode(state, { app: dispatch, message: messageDispatch }).then(code => {
            const model = monaco.editor.getModel(uri as monaco.Uri);
            if (!model) return;
            model.setValue(code);
        });
    }, [uri]);

    useEffect(() => {
        if (!(formatting.type === 'RESULT')) return;
        if (!(formatting.payload.type === 'OK')) return;
        if (!(formatting.payload.payload.type === 'SUCCESS')) return;
        if (!uri) return;
        const model = monaco.editor.getModel(uri as monaco.Uri);
        if (!model) return;
        const code = formatting.payload.payload.payload.source;
        model.setValue(code);
    }, [formatting]);

    // const onRustAnalyzerStartLoad = () => {
    //     messageDispatch({
    //         type: 'LOG_SYSTEM',
    //         payload: { status: 'IN_PROGRESS', content: 'Loading Rust Analyzer...' },
    //     });
    // };

    // const onRustAnalyzerFinishLoad = () => {
    //     dispatch({
    //         type: 'SET_RUST_ANALYZER_STATE',
    //         payload: true,
    //     });
    //     messageDispatch({
    //         type: 'LOG_SYSTEM',
    //         payload: { status: 'DONE', content: 'Rust Analyzer Ready' },
    //     });
    // };

    return (
        <Layout
            header={<Header />}
            tree={ <MoveFileTree />}
            editor={<Tabs />
                // <MoveEditor
                //     onRustAnalyzerStartLoad={onRustAnalyzerStartLoad}
                //     onRustAnalyzerFinishLoad={onRustAnalyzerFinishLoad}
                //     numbering={state.numbering}
                //     darkmode={state.darkmode}
                //     rustAnalyzer={state.rustAnalyzer}
                //     minimap={state.minimap}
                //     path={state.path}
                //     defaultLanguage={state.language}
                //     defaultValue={state.code}
                //     onMount={(editor: any) => (editorRef.current = editor)}
                //     setURI={uri => dispatch({ type: 'SET_URI', payload: uri })}
                // />
            }
            console={<Console />}
        />
    );
};

const AppWithProvider = (): ReactElement => {
    return (
        <AppProvider>
            <MessageProvider>
                <App />
            </MessageProvider>
        </AppProvider>
    );
};

export default AppWithProvider;
