// See: https://github.com/webpack/webpack/issues/12900
import exampleCode from '../../../crates/contract/lib.txt!=!../../../crates/contract/lib.rs';
import todoListCode from '../../../crates/contract/sources/TodoList.txt!=!../../../crates/contract/sources/TodoList.move';
import eventProxyCode from '../../../crates/contract/sources/EventProxy.txt!=!../../../crates/contract/sources/EventProxy.move';
import moveToml from '../../../crates/contract/Move.txt!=!../../../crates/contract/Move.toml';
import { MoveEditor, MoveEditorProps } from './move-editor';
export { todoListCode,eventProxyCode,moveToml,exampleCode, MoveEditor };
export type { MoveEditorProps };
