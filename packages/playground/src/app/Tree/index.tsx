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
import { TreeNodeTemplateOptions, TreeEventNodeEvent } from './tree';
export const MoveFileTree = () => {
    const nodesInit = [
        {
            "key": "0",
            "label": "MoveProject",
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
    // useEffect(() => {

    // }, [])
    const [nodes, setNodes] = useState(nodesInit);
    const [expandedKeys, setExpandedKeys] = useState(Object.create({}));
    const [selectedNodeKey, setSelectedNodeKey] = useState<string | undefined>("");
    const [selectedNodeOriginMoveFileName, setSelectedOriginMoveFileName] = useState<string | undefined>("");
    const toast = useRef<Toast | null>(null);
    const cmFolder = useRef<ContextMenu | null>(null);
    const cmMoveFile = useRef<ContextMenu | null>(null);
    const [active, setActive] = useState(Object.create({}));
    const [inPlaceVisables, setInPlaceVisables] = useState(Object.create({}));
    const [moveFileNames, setMoveFileNames] = useState(Object.create({}));
    const menuFolder = [
        {
            label: 'NewFile',
            icon: 'pi pi-file',
            command: () => {
                let key = "0";
                if (nodes[0] != undefined && nodes[0]?.children[0] != undefined && nodes[0]?.children[0].children != undefined && nodes[0]?.children[0].children.length > 0) {
                    const children = nodes[0]?.children[0].children;
                    const lastKey = children[children?.length - 1]?.key;
                    const lastIndex = lastKey?.lastIndexOf("-");
                    if (lastIndex != undefined && lastIndex != -1) {
                        const pre = lastKey?.substring(0, lastIndex + 1);
                        const max = lastKey?.substring(lastIndex + 1);
                        const nextIndex = max == undefined ? 0 : parseInt(max) + 1;
                        key = pre == undefined ? "0" : pre + nextIndex;
                    }
                    nodes[0]?.children[0].children.push({ key, "label": "", "icon": "pi pi-fw pi-file", "data": "Expenses Document" });
                    setNodes(nodes);
                    if (toast.current != null) toast.current.show({ severity: 'success', summary: 'Node Key', detail: selectedNodeKey });
                    updateActive(key, true);
                    updateInPlaceVisables(key, true);
                }
            }
        }
    ];
    const menuMoveFile = [
        {
            label: 'Rename',
            icon: 'pi pi-pencil',
            command: () => {
                if (toast.current != null) toast.current.show({ severity: 'success', summary: 'Node Key', detail: selectedNodeKey });
                updateActive(selectedNodeKey, true);
                updateInPlaceVisables(selectedNodeKey, true);
            }
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => {
                if (nodes[0] != undefined && nodes[0]?.children[0] != undefined && nodes[0]?.children[0].children != undefined && nodes[0]?.children[0].children.length > 0) {
                    nodes[0].children[0].children = nodes[0]?.children[0].children.filter((p) => p.key != selectedNodeKey);
                    setNodes(nodes);
                    if (toast.current != null) toast.current.show({ severity: 'success', summary: 'Node Key', detail: selectedNodeKey });
                }
            }
        }
    ];
    const updateMoveFileNames = (key: string | number | undefined, value: string | undefined) => {
        const _moveFileNames = { ...moveFileNames }; _moveFileNames[key as keyof typeof _moveFileNames] = value; setMoveFileNames(_moveFileNames);
    };
    const updateInPlaceVisables = (key: string | number | undefined, value: boolean) => {
        const _inPlaceVisables = { ...inPlaceVisables }; _inPlaceVisables[key as keyof typeof _inPlaceVisables] = value; setInPlaceVisables(_inPlaceVisables);
    };
    const updateActive = (key: string | number | undefined, value: boolean) => {
        const _active = { ...active }; _active[key as keyof typeof _active] = value; setActive(_active);
    };
    const isFileExist = (fileName: string, key: string | number | undefined) => {
        if (nodes[0] != undefined && nodes[0]?.children[0] != undefined && nodes[0]?.children[0].children != undefined && nodes[0]?.children[0].children.length > 0) {
            const fileNames = nodes[0]?.children[0].children.filter((p) => p.key != key).map((p) => moveFileNames[p.key] == undefined ? p.label : moveFileNames[p.key]);

            return fileNames.indexOf(fileName) != -1
        }
        return false
    };
    const addMoveFileExtension = (fileName: string) => {
        if (fileName == "") {
            return ".move"
        }
        if (fileName.length < 5 || fileName.substring(fileName.length - 5) != ".move") {
            return fileName + ".move"
        }
        return fileName
    };

    const onInplaceClose = (key: string | number | undefined) => {
        console.log("========", moveFileNames[key as keyof typeof moveFileNames], key);
        let fileName = addMoveFileExtension(moveFileNames[key as keyof typeof moveFileNames]);
        if (isFileExist(fileName, key)) {
            if (toast.current != null) {
                toast.current.show({ severity: 'fail', summary: 'file name already', detail: selectedNodeKey });
            }
            if (selectedNodeOriginMoveFileName != undefined && selectedNodeOriginMoveFileName?.length > 5) {
                updateMoveFileNames(key, selectedNodeOriginMoveFileName);
            } else {
                const fn = fileName.substring(0, fileName.length - 5);
                for (let i = 1; i < 100; i++) {
                    fileName = fn + i + ".move";
                    if (!isFileExist(fileName, key)) {
                        fileName = addMoveFileExtension(fileName);
                        fileName = fileName.trim();
                        console.log("===fileName=====", fileName);
                        updateMoveFileNames(key, fileName);
                        break
                    }
                }
            }
        } else {
            fileName = fileName.trim();
            updateMoveFileNames(key, fileName);
        }

        updateInPlaceVisables(key, false);
    };
    const onTreeContextMenu = (event: TreeEventNodeEvent) => {
        if (event.node.label == "sources") {
            if (cmFolder.current != null) {
                cmFolder.current.show(event.originalEvent)
            }
        }
        else if (moveFileNames[event.node.key as keyof typeof moveFileNames].substring(moveFileNames[event.node.key as keyof typeof moveFileNames].length - 5) == ".move") {
            if (cmMoveFile.current != null) {
                cmMoveFile.current.show(event.originalEvent)
            }
        }
    };
    const nodeTemplate = (node: TreeNode, options: TreeNodeTemplateOptions) => {
        let label = <b>{node.label}</b>;

        if (node.data) {
            // label = <a href={node.url}>{node.label}</a>;
            if (moveFileNames[node.key as keyof typeof moveFileNames] === undefined
                || moveFileNames[node.key as keyof typeof moveFileNames] == null) {
                updateMoveFileNames(node.key, node.label);
            }
            label = (!inPlaceVisables[node.key as keyof typeof inPlaceVisables] ?
                <b >{moveFileNames[node.key as keyof typeof moveFileNames]}</b> :
                <Inplace active={active[node.key as keyof typeof active]}
                    onToggle={(e) => { updateActive(node.key, e.value); }}
                    onOpen={() => { setSelectedOriginMoveFileName(moveFileNames[node.key as keyof typeof moveFileNames]) }}
                    onClose={() => { onInplaceClose(node.key) }} closable >
                    <InplaceDisplay>{moveFileNames[node.key as keyof typeof moveFileNames]}</InplaceDisplay>
                    <InplaceContent>
                        <InputText
                            value={moveFileNames[node.key as keyof typeof moveFileNames]}
                            onChange={(e) => { updateMoveFileNames(node.key, e.target.value); }}
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

            <ContextMenu model={menuMoveFile} ref={cmMoveFile} onHide={() => setSelectedNodeKey(undefined)} />
            <ContextMenu model={menuFolder} ref={cmFolder} onHide={() => setSelectedNodeKey(undefined)} />
            <div className="card">
                <Tree nodeTemplate={nodeTemplate} value={nodes} expandedKeys={expandedKeys} onToggle={e => setExpandedKeys(e.value)}
                    contextMenuSelectionKey={selectedNodeKey} onContextMenuSelectionChange={event => { if (event.value != null && "string" === typeof event.value) { setSelectedNodeKey(event.value) } }}
                    onContextMenu={onTreeContextMenu} />
            </div>
        </div>
    )
}
