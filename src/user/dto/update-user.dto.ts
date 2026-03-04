import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(30, 'Nome pode ter no máximo 30 caracteres')
    .optional(),
  email: z.string().email('Email inválido').optional(),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .optional(),
  bio: z.string().max(200, 'Bio pode ter no máximo 200 caracteres').optional(),
  avatar: z.string().optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
