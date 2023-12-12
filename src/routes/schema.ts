import { z } from 'zod';

export const joinSchema = z.object({
	username: z.string().min(4).max(24),
	code: z.string().min(6).max(6)
});

export type JoinSchema = typeof joinSchema;
