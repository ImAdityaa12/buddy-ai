import { z } from 'zod';
export const agentsInsertSchema = z.object({
    name: z
        .string()
        .min(1, {
            message: 'Name is required',
        })
        .max(255),
    instructions: z
        .string()
        .min(1, {
            message: 'Description is required',
        })
        .max(255),
});

export const agentsUpdateSchema = agentsInsertSchema.extend({
    id: z.string().min(1, { message: 'Id is required' }),
});
