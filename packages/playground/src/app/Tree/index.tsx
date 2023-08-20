// import 'primeicons/primeicons.css';
// import 'primereact/resources/themes/lara-light-indigo/theme.css';
// import 'primereact/resources/primereact.css';
// import 'primeflex/primeflex.css';
// import '../../index.css';
// import ReactDOM from 'react-dom';

import React, { useState, useEffect, useRef } from 'react';
import { Tree } from 'primereact/tree';
import TreeNode from 'primereact/treenode';
import { ContextMenu } from 'primereact/contextmenu';
import { Toast } from 'primereact/toast';
import { Inplace, InplaceDisplay, InplaceContent } from 'primereact/inplace';
import { InputText } from 'primereact/inputtext';
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import { TreeNodeTemplateOptions } from './tree';
export const MoveFileTree = () => {
    const nodes = [
        {
            "key": "0",
            "label": "ToDoExample",
            "icon": "pi pi-fw pi-inbox",
            "children": [{
                "key": "0-0",
                "label": "sources",
                "icon": "pi pi-fw pi-cog",
                "children": [{
                    "key": "0-0-0", "label": "TodoList.move", "icon": "pi pi-fw pi-file", "data": "Expenses Document"
                },
                { "key": "0-0-1", "label": "EventProxy.move", "icon": "pi pi-fw pi-file", "data": "Resume Document" }]
            },
            {
                "key": "0-1",
                "label": "Move.toml",
                "icon": "pi pi-fw pi-home",
            }]
        }
    ];
    // const [nodes, setNodes] = useState(undefined);
    const [expandedKeys, setExpandedKeys] = useState(Object.create({}));
    const [selectedNodeKey, setSelectedNodeKey] = useState<string | undefined>("");
    const toast = useRef<Toast | null>(null);
    const cm = useRef<ContextMenu | null>(null);
    const [active, setActive] = useState(Object.create({}));
    const [vis, setVis] = useState(Object.create({}));
    const [obj, setObj] = useState(Object.create({}));
    const menu = [
        {
            label: 'View Key',
            icon: 'pi pi-search',
            command: () => {
                if (toast.current != null) toast.current.show({ severity: 'success', summary: 'Node Key', detail: selectedNodeKey });
                const o = { ...active }; o[selectedNodeKey as keyof typeof o] = true; setActive(o);
                const o1 = { ...vis }; o1[selectedNodeKey as keyof typeof o1] = true; setVis(o1);
            }
        },
        {
            label: 'Toggle',
            icon: 'pi pi-cog',
            command: () => {
                const _expandedKeys = { ...expandedKeys };
                if (selectedNodeKey != undefined) {
                    if (_expandedKeys[selectedNodeKey as keyof typeof _expandedKeys]) { delete _expandedKeys[selectedNodeKey as keyof typeof _expandedKeys]; }
                    else { _expandedKeys[selectedNodeKey as keyof typeof _expandedKeys] = true; }
                }


                setExpandedKeys(_expandedKeys);
            }
        }
    ];
    const nodeTemplate = (node: TreeNode, options: TreeNodeTemplateOptions) => {
        let label = <b>{node.label}</b>;

        if (node.data) {
            // label = <a href={node.url}>{node.label}</a>;
            if (obj[node.key as keyof typeof obj] === undefined || obj[node.key  as keyof typeof obj] == null) {
                obj[node.key  as keyof typeof obj] = node.label
            }
            label = (!vis[node.key  as keyof typeof vis] ? <a >{obj[node.key  as keyof typeof obj]}</a> :
                <Inplace active={active[node.key  as keyof typeof active]} onToggle={(e) => { const o = { ...active }; o[node.key  as keyof typeof o] = e.value; setActive(o); }} onClose={() => { const o = { ...vis }; o[node.key  as keyof typeof obj] = false; setVis(o); }} closable >
                    <InplaceDisplay>{obj[node.key  as keyof typeof obj]}</InplaceDisplay>
                    <InplaceContent>
                        <InputText
                            value={obj[node.key  as keyof typeof obj]}
                            onChange={(e) => { const o = { ...obj }; o[node.key  as keyof typeof o] = e.target.value; setObj(o); }}
                        />
                    </InplaceContent>
                </Inplace>
            );
        }

        return <span className={options.className}>{label}</span>;
    };
    return (
        <div>
            <Toast ref={toast} />

            <ContextMenu model={menu} ref={cm} onHide={() => setSelectedNodeKey(undefined)} />

            <div className="card">
                <Tree nodeTemplate={nodeTemplate} value={nodes} expandedKeys={expandedKeys} onToggle={e => setExpandedKeys(e.value)}
                    contextMenuSelectionKey={selectedNodeKey} onContextMenuSelectionChange={event => { if (event.value != null && "string" === typeof event.value) { setSelectedNodeKey(event.value) } }}
                    onContextMenu={event => { if (cm.current != null) { cm.current.show(event.originalEvent) } }} />
            </div>
        </div>
    )
}
