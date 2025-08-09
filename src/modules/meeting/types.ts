import { inferRouterOutputs } from '@trpc/server';

import type { AppRouter } from '@/trpc/router/_app';

export type MeetingGetOne = inferRouterOutputs<AppRouter>['meetings']['getOne'];
export type MeetingGetMany =
    inferRouterOutputs<AppRouter>['meetings']['getMany']['items'];
