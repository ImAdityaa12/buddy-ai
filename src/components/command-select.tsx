'use client';

import React, { ReactNode, useState } from 'react';
import { Button } from './ui/button';
import { ChevronsUpDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
    CommandResponsiveDialog,
} from './ui/command';

interface CommandSelectProps {
    options: Array<{
        id: string;
        value: string;
        children: ReactNode;
    }>;
    onSelect: (value: string) => void;
    onSearch?: (value: string) => void;
    value: string;
    placeholder?: string;
    isSearchable?: boolean;
    className?: string;
}

const CommandSelect = ({
    options,
    onSelect,
    onSearch,
    value,
    placeholder = 'Select an option',
    className,
}: CommandSelectProps) => {
    const [open, setOpen] = useState(false);
    const selectedOption = options.find((option) => option.value === value);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onSearch?.('');
        }
        setOpen(open);
    };

    return (
        <>
            <Button
                type="button"
                variant={'outline'}
                className={cn(
                    'h-9 justify-between font-normal px-2',
                    !selectedOption && 'text-muted-foreground',
                    className
                )}
                onClick={() => setOpen(!open)}
            >
                <div>{selectedOption?.children ?? placeholder}</div>
                <ChevronsUpDownIcon />
                <CommandResponsiveDialog
                    open={open}
                    onOpenChange={handleOpenChange}
                    shouldFilter={!onSearch}
                >
                    <CommandInput
                        placeholder="search"
                        onValueChange={onSearch}
                    />
                    <CommandList>
                        <CommandEmpty>
                            <span className="text-muted-foreground text-sm">
                                No options found
                            </span>
                        </CommandEmpty>
                        {options.map((option) => (
                            <CommandItem
                                key={option.id}
                                onSelect={() => {
                                    onSelect(option.value);
                                    setOpen(false);
                                }}
                            >
                                {option.children}
                            </CommandItem>
                        ))}
                    </CommandList>
                </CommandResponsiveDialog>
            </Button>
        </>
    );
};

export default CommandSelect;
