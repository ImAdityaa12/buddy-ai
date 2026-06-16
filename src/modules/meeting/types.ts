import { inferRouterOutputs } from '@trpc/server';

import type { AppRouter } from '@/trpc/router/_app';

export type MeetingGetOne = inferRouterOutputs<AppRouter>['meetings']['getOne'];
export type MeetingGetMany =
    inferRouterOutputs<AppRouter>['meetings']['getMany']['items'];
export type MeetingActionItem =
    inferRouterOutputs<AppRouter>['meetings']['getActionItems'][number];
export type MeetingDecision =
    inferRouterOutputs<AppRouter>['meetings']['getDecisions'][number];

export enum MeetingStatus {
    Upcoming = 'upcoming',
    Active = 'active',
    Completed = 'completed',
    Processing = 'processing',
    Cancelled = 'cancelled',
}

export type StreamTranscriptItem = {
    speaker_id: string;
    type: string;
    text: string;
    start_ts: number;
    stop_ts: number;
};
