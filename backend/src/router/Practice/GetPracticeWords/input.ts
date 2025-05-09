import {z} from 'zod'

export const zGetPracticeWords = z.object({
    type: z.enum(['STRESS', 'PARONYM'])
})