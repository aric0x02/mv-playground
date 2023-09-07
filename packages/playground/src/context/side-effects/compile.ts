import { CompileApiResponse, compileRequest } from '@aric0x02/move-editor/api/compile';
import { State, Dispatch } from '~/context/app/reducer';
import { MessageAction, MessageDispatch } from '~/context/messages/reducer';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { COMPILE_URL } from '~/env';

const getMessageAction = (result: CompileApiResponse): MessageAction | undefined => {
    switch (result.type) {
        case 'NETWORK_ERROR':
            return {
                type: 'LOG_COMPILE',
                payload: {
                    content: 'Network Error',
                    status: 'ERROR',
                },
            };
        case 'SERVER_ERROR':
            return {
                type: 'LOG_COMPILE',
                payload: {
                    content: `Server Error: ${result.payload.status}`,
                    status: 'ERROR',
                },
            };
        case 'OK':
            if (result.payload.type === 'ERROR') {
                return {
                    type: 'LOG_COMPILE',
                    payload: {
                        content: `Compilation Error: ${result.payload.payload.stdout}, ${result.payload.payload.stderr}`,
                        status: 'ERROR',
                    },
                };
            } else if (result.payload.type === 'SUCCESS') {
                return {
                    type: 'LOG_COMPILE',
                    payload: {
                        content: 'Compilation finished',
                        status: 'DONE',
                        result: result.payload,
                    },
                };
            }
    }
};

export const extractContractSize = (stdout: string): number => {
    const regex = /([0-9]+\.[0-9]+)K/g;
    const result = stdout.match(regex);
    if (!result || !result[1]) return NaN;
    return parseFloat(result[1]);
};

export async function compile(state: State, dispatch: Dispatch, dispatchMessage: MessageDispatch) {
    if (state.compile.type === 'IN_PROGRESS') return;

    dispatch({ type: 'SET_COMPILE_STATE', payload: { type: 'IN_PROGRESS' } });

    dispatchMessage({
        type: 'LOG_COMPILE',
        payload: {
            content: 'Compiling Smart Contract...',
            status: 'IN_PROGRESS',
        },
    });

    const { fileId, codes } = state;
    console.log("fileId============", fileId);
    if (!fileId||!codes) {
        // ToDo: implement proper error handling
        dispatch({ type: 'SET_COMPILE_STATE', payload: { type: 'NOT_ASKED' } });
        return;
    }
    // const model1 = monaco.editor.getModel(monaco.Uri.parse("EventProxy.move"));
    // console.log("model1============", model1);
    // const model = monaco.editor.getModel(uri);
    // console.log("model============", model);
    const code = codes[fileId as keyof typeof codes]??{code:""};
    console.log(codes,"code=======b=====", code);
    if (!code||!code["code"]) {
        // ToDo: implement proper error handling
        dispatch({ type: 'SET_COMPILE_STATE', payload: { type: 'NOT_ASKED' } });
        return;
    }

    // const code = model.getValue();
    console.log("code============", code["code"]);
    const toml =`[package]
name = "my"
version = "0.0.0"


[addresses]
usertests = "gkNW9pAcCHxZrnoVkhLkEQtsLsW5NWTC75cdAdxAMs9LNYCYg"
Alice = "gkQ5K6EnLRgZkwozG8GiBAEnJyM6FxzbSaSmVhKJ2w8FcK7ih"
Bob = "gkNW9pAcCHxZrnoVkhLkEQtsLsW5NWTC75cdAdxAMs9LNYCYg"
PontemFramework="0x1"
Std="0x1"

[dependencies.PontStdlib]
local = "./stdlib/pont-stdlib"


[dependencies.MoveStdlib]
local = "./stdlib/move-stdlib"`;//TODO
    const result = await compileRequest({ compileUrl: COMPILE_URL || '' }, { source: code["code"], toml });

    dispatch({
        type: 'SET_COMPILE_STATE',
        payload: { type: 'RESULT', payload: result },
    });

    if (result.type === 'OK' && result.payload.type === 'SUCCESS') {
        const contractSize = extractContractSize(result.payload.payload.stdout);
        dispatch({
            type: 'SET_CONTRACT_SIZE',
            payload: contractSize,
        });
    } else {
        dispatch({
            type: 'SET_CONTRACT_SIZE',
            payload: null,
        });
    }

    const action: MessageAction | undefined = getMessageAction(result);
    if (action) dispatchMessage(action);
}
