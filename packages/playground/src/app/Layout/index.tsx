import { Splitter, SplitterPanel } from '@aric0x02/components/';
import { ReactElement } from 'react';
type LayoutProps = {
    header: ReactElement;
    tree: ReactElement;
    editor: ReactElement;
    console: ReactElement;
};

export const Layout = ({ header, tree, editor, console }: LayoutProps) => {
    return (
        <div className="h-screen flex flex-col">
            {header}
            <div className="flex-grow">
                <Splitter className="h-full" layout="vertical" gutterSize={6}>
                    <SplitterPanel size={80} className="overflow-hidden min-h-0">
                        <Splitter>
                            <SplitterPanel className="flex align-items-center justify-content-center" size={20}>
                                {tree}
                            </SplitterPanel>
                            <SplitterPanel className="flex align-items-center justify-content-center" size={80}>
                                {editor}
                            </SplitterPanel>
                        </Splitter>
                    </SplitterPanel>
                    <SplitterPanel size={20} className="overflow-hidden">
                        {console}
                    </SplitterPanel>
                </Splitter>
            </div>
        </div>
    );
};
