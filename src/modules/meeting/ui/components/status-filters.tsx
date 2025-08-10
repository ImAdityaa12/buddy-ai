import React from 'react';
import { MeetingStatus } from '../../types';
import {
    CheckCircleIcon,
    CircleXIcon,
    ClockArrowUpIcon,
    LoaderIcon,
    VideoIcon,
} from 'lucide-react';
import { useMeetingFilters } from '../../hooks/use-meetings-filters';
import CommandSelect from '@/components/command-select';

const options = [
    {
        id: MeetingStatus.Upcoming,
        value: MeetingStatus.Upcoming,

        children: (
            <div className="flex items-center gap-x-2 capitalize">
                <ClockArrowUpIcon />
                {MeetingStatus.Upcoming}
            </div>
        ),
    },
    {
        id: MeetingStatus.Active,
        value: MeetingStatus.Active,
        children: (
            <div className="flex items-center gap-x-2 capitalize">
                <VideoIcon />
                {MeetingStatus.Active}
            </div>
        ),
    },
    {
        id: MeetingStatus.Completed,
        value: MeetingStatus.Completed,
        children: (
            <div className="flex items-center gap-x-2 capitalize">
                <CheckCircleIcon />
                {MeetingStatus.Completed}
            </div>
        ),
    },
    {
        id: MeetingStatus.Cancelled,
        value: MeetingStatus.Cancelled,
        children: (
            <div className="flex items-center gap-x-2 capitalize">
                <CircleXIcon />
                {MeetingStatus.Cancelled}
            </div>
        ),
    },
    {
        id: MeetingStatus.Processing,
        value: MeetingStatus.Processing,
        children: (
            <div className="flex items-center gap-x-2 capitalize">
                <LoaderIcon />
                {MeetingStatus.Processing}
            </div>
        ),
    },
];

const StatusFilters = () => {
    const [filters, setFilters] = useMeetingFilters();

    return (
        <CommandSelect
            placeholder="status"
            className="h-9"
            options={options}
            onSelect={(value) => setFilters({ status: value as MeetingStatus })}
            value={filters.status ?? ''}
            isSearchable={true}
        />
    );
};

export default StatusFilters;
