import React from 'react';
import { MeetingGetOne } from '../../types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    BookOpenTextIcon,
    FileTextIcon,
    FileVideoIcon,
    SparklesIcon,
} from 'lucide-react';

interface CompletedStateProps {
    data: MeetingGetOne;
}

const CompletedState = ({ data }: CompletedStateProps) => {
    return (
        <div className="flex flex-col gap-y-4">
            <Tabs defaultValue="summary">
                <div className="bg-white rounded-lg border px-3">
                    <ScrollArea>
                        <TabsList className="p-0 bg-background justify-start rounded-none h-13">
                            <TabsTrigger
                                value="summary"
                                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-forground"
                            >
                                <BookOpenTextIcon />
                                Summary
                            </TabsTrigger>
                            <TabsTrigger
                                value="transcript"
                                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-forground"
                            >
                                <FileTextIcon />
                                Transcript
                            </TabsTrigger>
                            <TabsTrigger
                                value="recording"
                                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-forground"
                            >
                                <FileVideoIcon />
                                Recording
                            </TabsTrigger>
                            <TabsTrigger
                                value="chat"
                                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-forground"
                            >
                                <SparklesIcon />
                                Ask AI
                            </TabsTrigger>
                        </TabsList>
                    </ScrollArea>
                </div>
            </Tabs>
        </div>
    );
};

export default CompletedState;
