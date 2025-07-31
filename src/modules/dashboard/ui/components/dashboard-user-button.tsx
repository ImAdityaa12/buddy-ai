import { GeneratedAvatar } from '@/components/generated-avatar';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';
import { ChevronDownIcon, CreditCardIcon, LogOutIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

const DashboardUserButton = () => {
    const router = useRouter();
    const { data, isPending } = authClient.useSession();

    const onLogOut = () => {
        authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push('/sign-in');
                },
                onError: ({ error }) => {
                    toast.error(error.message);
                },
            },
        });
    };

    if (isPending || !data?.user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="rounded-lg border-border/10 p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden">
                {data.user.image ? (
                    <Avatar>
                        <AvatarImage
                            src={data.user.image}
                            alt={data.user.name}
                            className="rounded-full"
                        />
                    </Avatar>
                ) : (
                    <GeneratedAvatar
                        seed={data.user.name}
                        variant="initials"
                        className="size-9 mr-3"
                    />
                )}
                <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
                    <p className="text-sm truncate w-full">{data.user.name}</p>
                    <p className="text-xs truncate w-full">{data.user.email}</p>
                </div>
                <ChevronDownIcon className="size-4 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-[72px]">
                <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                        <span className="font-medium truncate">
                            {data.user.name}
                        </span>
                        <span className="text-sm font-normal text-muted-foreground truncate">
                            {data.user.email}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
                    Billing
                    <CreditCardIcon className="size-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer flex items-center justify-between"
                    onClick={onLogOut}
                >
                    Log out
                    <LogOutIcon className="size-4" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default DashboardUserButton;
