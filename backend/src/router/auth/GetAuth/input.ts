import { z } from "zod";

export const zOAuthCredentials = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  providerId: z.string(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  tokenExpires: z.string().optional().transform(val => val ? new Date(val) : undefined),
});

export const zOAuthLogin = z.object({
  provider: z.enum(['GOOGLE', 'YANDEX']),
  credentials: zOAuthCredentials,
});