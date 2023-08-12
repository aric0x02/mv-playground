import { CompileApiResponse } from '@aric0x02/move-editor/api/compile';
import { TestingApiResponse } from '@aric0x02/move-editor/api/testing';
import { Uri } from 'monaco-editor/esm/vs/editor/editor.api';
import { GistCreateApiResponse } from '@aric0x02/move-editor/api/gists';
import { FormattingApiResponse } from '@aric0x02/move-editor/api/format';

export const defaultState: State = {
  darkmode: true,
  minimap: true,
  numbering: true,
  compile: { type: 'NOT_ASKED' },
  testing: { type: 'NOT_ASKED' },
  formatting: { type: 'NOT_ASKED' },
  monacoUri: null,
  gist: { type: 'NOT_ASKED' },
  contractSize: null,
  rustAnalyzer: false,
};

export type State = {
  darkmode: boolean;
  minimap: boolean;
  numbering: boolean;
  compile: CompileState;
  testing: TestingState;
  formatting: FormattingState;
  monacoUri: Uri | null;
  gist: GistState;
  contractSize: number | null;
  rustAnalyzer: boolean;
};

export type GistState =
  | { type: 'NOT_ASKED' }
  | { type: 'IN_PROGRESS' }
  | { type: 'RESULT'; payload: GistCreateApiResponse };

export type CompileState =
  | { type: 'NOT_ASKED' }
  | { type: 'IN_PROGRESS' }
  | { type: 'RESULT'; payload: CompileApiResponse };

export type TestingState =
  | { type: 'NOT_ASKED' }
  | { type: 'IN_PROGRESS' }
  | { type: 'RESULT'; payload: TestingApiResponse };

export type FormattingState =
  | { type: 'NOT_ASKED' }
  | { type: 'IN_PROGRESS' }
  | { type: 'RESULT'; payload: FormattingApiResponse };

export type Action =
  | { type: 'SET_DARKMODE'; payload: boolean }
  | { type: 'SET_NUMBERING'; payload: boolean }
  | { type: 'SET_MINIMAP'; payload: boolean }
  | { type: 'SET_COMPILE_STATE'; payload: CompileState }
  | { type: 'SET_TESTING_STATE'; payload: TestingState }
  | { type: 'SET_FORMATTING_STATE'; payload: FormattingState }
  | { type: 'SET_GIST_STATE'; payload: GistState }
  | { type: 'SET_URI'; payload: Uri }
  | { type: 'SET_CONTRACT_SIZE'; payload: number | null }
  | { type: 'SET_RUST_ANALYZER_STATE'; payload: boolean };

export type Dispatch = (action: Action) => void;

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_DARKMODE':
      return {
        ...state,
        darkmode: action.payload,
      };
    case 'SET_NUMBERING':
      return {
        ...state,
        numbering: action.payload,
      };
    case 'SET_MINIMAP':
      return {
        ...state,
        minimap: action.payload,
      };
    case 'SET_COMPILE_STATE':
      return {
        ...state,
        compile: action.payload,
      };
    case 'SET_TESTING_STATE':
      return {
        ...state,
        testing: action.payload,
      };
    case 'SET_FORMATTING_STATE':
      return {
        ...state,
        formatting: action.payload,
      };
    case 'SET_RUST_ANALYZER_STATE':
      return {
        ...state,
        rustAnalyzer: action.payload,
      };
    case 'SET_GIST_STATE':
      return {
        ...state,
        gist: action.payload,
      };
    case 'SET_URI':
      return {
        ...state,
        monacoUri: action.payload,
      };
    case 'SET_CONTRACT_SIZE':
      return {
        ...state,
        contractSize: action.payload,
      };
    default:
      return state;
  }
};
