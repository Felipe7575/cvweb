import { z } from "zod";


// {
//     id: string;
//     name: string | null;
//     email: string | null;
//     emailVerified: Date | null;
//     image: string | null;
//     credit: {
//         id: string;
//         balance: number;
//         lastUpdated: string | null;
//     }[];
// } | undefined
export const crediZodSchema = z.object({
    id: z.string().min(1),
    balance: z.number().min(0),
    lastUpdated: z.string().optional(),
});

export const userZodSchema = z.object({
    id: z.string().min(1),
    name: z.string().optional(),
    email: z.string().optional(),
    emailVerified: z.string().optional(),
    image: z.string().optional(),
});

export const userWithCreditZodSchema = userZodSchema.extend({
    credit: z.array(crediZodSchema)
});


export const filesZodSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    fileUrl: z.string().min(1, 'Please upload a file.'),
    originalName: z.string().optional(),
    uploadedAt: z.string().optional(),
});


export const AspectResultSchema = z.object({
    text: z.string(),
    score: z.number().min(1).max(10)
});

export const EvaluationResultSchema = z.object({
    key: z.string(),
    result: AspectResultSchema,
    error: z.any().optional()
});

export const TransactionStatusSchema = z.enum([
    "pending",
    "processing",
    "approved",
    "completed",
    "failed",
    "canceled",
]);

export const EvaluationResultsSchema = z.array(EvaluationResultSchema);