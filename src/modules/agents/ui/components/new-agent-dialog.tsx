import ResponsiveDialog from '@/components/responsive-dialog';
import React from 'react';

interface NewAgentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const NewAgentDialog = ({ open, onOpenChange }: NewAgentDialogProps) => {
    return (
        <ResponsiveDialog
            title="New Agent"
            description="Create a new agent"
            open={open}
            onOpenChange={onOpenChange}
        >
            New agent form
        </ResponsiveDialog>
    );
};

export default NewAgentDialog;
