import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import {
    Channel,
    Chat,
    MessageInput,
    MessageList,
    Thread,
    useCreateChatClient,
    Window,
} from 'stream-chat-react';
import type { Channel as StreamChannel } from 'stream-chat';
import LoadingState from '@/components/loading-state';
import 'stream-chat-react/dist/css/v2/index.css';
interface ChatIUIProps {
    meetingId: string;
    meetingName: string;
    userId: string;
    userName: string;
    userImage: string;
}

const ChatUI = ({
    meetingId,
    meetingName,
    userId,
    userName,
    userImage,
}: ChatIUIProps) => {
    const trpc = useTRPC();
    const { mutateAsync: generateChatToken } = useMutation(
        trpc.meetings.generateChatToken.mutationOptions()
    );

    const [channel, setChannel] = useState<StreamChannel>();
    const client = useCreateChatClient({
        apiKey: process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!,
        tokenOrProvider: generateChatToken,
        userData: {
            id: userId,
            name: userName,
            image: userImage,
        },
    });

    useEffect(() => {
        if (!client || client === null) {
            return;
        }

        const channel = client.channel('messaging', meetingId, {
            members: [userId],
        });
        setChannel(channel as unknown as StreamChannel);
    }, [client, meetingId, meetingName, userId]);

    if (!client || client === null) {
        return (
            <LoadingState
                title="Loading...."
                description="Please wait while we load the chat"
            />
        );
    }

    return (
        <div className="bg-white rounded-lg border overflow-hidden">
            <Chat client={client}>
                <Channel channel={channel}>
                    <Window>
                        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-24rem)] border-b">
                            <MessageList />
                        </div>
                        <MessageInput />
                    </Window>
                    <Thread />
                </Channel>
            </Chat>
        </div>
    );
};

export default ChatUI;
