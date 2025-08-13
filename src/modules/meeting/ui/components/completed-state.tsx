import Markdown from 'react-markdown';
import React from 'react';
import { MeetingGetOne } from '../../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    BookOpenTextIcon,
    ClockFadingIcon,
    FileTextIcon,
    FileVideoIcon,
    SparklesIcon,
} from 'lucide-react';
import Link from 'next/link';
import { GeneratedAvatar } from '@/components/generated-avatar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from '@/lib/utils';
import Transcript from './transcript';
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
                <TabsContent value="recording">
                    <div className="bg-white rounded-lg border px-4 py-5">
                        <video
                            src={data.recordingUrl!}
                            className="w-full rounded-lg"
                            controls
                        />
                    </div>
                </TabsContent>
                <TabsContent value="summary">
                    <div className="bg-white rounded-lg border">
                        <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
                            <h2 className="text-2xl font-medium capitalize">
                                {data.name}
                            </h2>
                            <div className="flex gap-x-3 items-center">
                                <Link
                                    href={`/agents/${data.agentId}`}
                                    className="flex items-center gap-x-2 underline underline-offset-4 capitalize"
                                >
                                    <GeneratedAvatar
                                        variant="bottsNeutral"
                                        seed={data.agent.name}
                                        className="size-5"
                                    />
                                    {data.agent.name}
                                </Link>{' '}
                                <p>
                                    {data.startedAt
                                        ? format(data.startedAt, 'PPPP')
                                        : ''}
                                </p>
                            </div>
                            <div className="flex gap-x-2 items-center">
                                <SparklesIcon className="size-4" />
                                <p>General Summary</p>
                            </div>
                            <Badge
                                variant={'outline'}
                                className="flex items-center gap-x-2 [&>svg]:size-4"
                            >
                                <ClockFadingIcon className="text-blue-700" />
                                <p>
                                    {data.duration
                                        ? formatDuration(data.duration)
                                        : ''}
                                </p>
                            </Badge>
                            <div>
                                <Markdown
                                    components={{
                                        h1: (props) => (
                                            <h1
                                                className="text-2xl font-medium mb-6"
                                                {...props}
                                            />
                                        ),
                                        h2: (props) => (
                                            <h2
                                                className="text-xl font-medium mb-4"
                                                {...props}
                                            />
                                        ),
                                        h3: (props) => (
                                            <h3
                                                className="text-lg font-medium mb-3"
                                                {...props}
                                            />
                                        ),
                                        h4: (props) => (
                                            <h4
                                                className="text-md font-medium mb-2"
                                                {...props}
                                            />
                                        ),

                                        p: (props) => (
                                            <p
                                                className="mb-6 leading-relaxed"
                                                {...props}
                                            />
                                        ),
                                        ul: (props) => (
                                            <ul
                                                className="mb-6 list-disc list-inside"
                                                {...props}
                                            />
                                        ),
                                        ol: (props) => (
                                            <ol
                                                className="mb-6 list-decimal list-inside"
                                                {...props}
                                            />
                                        ),
                                        li: (props) => (
                                            <li className="mb-2" {...props} />
                                        ),
                                        blockquote: (props) => (
                                            <blockquote
                                                className="mb-6 border-l-4 border-primary pl-4 italic"
                                                {...props}
                                            />
                                        ),
                                        code: (props) => (
                                            <code
                                                className="bg-muted px-1 py-0.5 rounded"
                                                {...props}
                                            />
                                        ),
                                        pre: (props) => (
                                            <pre
                                                className="bg-muted px-4 py-2 rounded-md overflow-x-auto"
                                                {...props}
                                            />
                                        ),
                                        strong: (props) => (
                                            <strong
                                                className="font-bold"
                                                {...props}
                                            />
                                        ),
                                    }}
                                >
                                    {data.summary}
                                </Markdown>
                            </div>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="transcript">
                    <Transcript meetingId={data.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CompletedState;
