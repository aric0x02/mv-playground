import { Splitter, SplitterPanel } from '@aric0x02/components/';
import { ReactElement } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { MoveFileTree } from '../Tree';
import { Tabs } from '../Tabs';
type LayoutProps = {
    header: ReactElement;
    editor: ReactElement;
    console: ReactElement;
};

export const Layout = ({ header, editor, console }: LayoutProps) => {
    return (
        <div className="h-screen flex flex-col">
            {header}
            <div className="flex-grow">
                <Splitter className="h-full" layout="vertical" gutterSize={6}>
                    <SplitterPanel size={80} className="overflow-hidden min-h-0">
                        <Splitter>
                            <SplitterPanel className="flex align-items-center justify-content-center" size={20}>
                                <MoveFileTree />
                            </SplitterPanel>
                            <SplitterPanel className="flex align-items-center justify-content-center" size={80}>
                                {/* <TabView >
                                    <TabPanel header="Sticky1" key="sticky1" closable>
                                        <div style={{ backgroundColor: 'cyan', width: '100%', height: '100%', overflow: 'auto', position: 'fixed' }}>{editor}</div>
                                    </TabPanel>
                                    <TabPanel header="Sticky" key="sticky" closable>
                                        sticky
                                    </TabPanel>
                                    <TabPanel header="Sticky2" key="sticky2" closable>
                                        sticky2
                                    </TabPanel>
                                </TabView> */}
                                <Tabs />
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
