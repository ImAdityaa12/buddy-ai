import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ChevronRight,
    MoreVertical,
    PencilIcon,
    TrashIcon,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface AgentIdViewHeaderProps {
    agentId: string;
    agentName: string;
    onEdit: () => void;
    onRemove: () => void;
}

const AgentIdViewHeader = ({
    agentId,
    agentName,
    onEdit,
    onRemove,
}: AgentIdViewHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild className="font-medium text-xl">
                            <Link href={'/agents'}>My agents</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-foreground text-xl font-medium [&svg]:size-4">
                        <ChevronRight />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            asChild
                            className="font-medium text-xl text-foreground"
                        >
                            <Link href={`agents/${agentId}`}>{agentName}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant={'ghost'}>
                        <MoreVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                        <PencilIcon className="size-4 text-black" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onRemove}>
                        <TrashIcon className="size-4 text-black" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default AgentIdViewHeader;
