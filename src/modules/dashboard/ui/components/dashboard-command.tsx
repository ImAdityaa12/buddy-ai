import {
    CommandDialog,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import React, { Dispatch, SetStateAction } from 'react';

interface DashboardCommandProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const DashboardCommand = ({ open, setOpen }: DashboardCommandProps) => {
    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Find a meeting or agent" />
            <CommandList>
                <CommandItem>testing</CommandItem>
            </CommandList>
        </CommandDialog>
    );
};

export default DashboardCommand;
