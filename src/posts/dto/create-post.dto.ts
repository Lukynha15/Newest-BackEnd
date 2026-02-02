import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreatePostSchema = z.object({
  title: z.string().max(100, 'Título pode ter no máximo 100 caracteres'),
  content: z
    .string()
    .min(1, 'Conteúdo é obrigatório')
    .max(500, 'Conteúdo pode ter no máximo 500 caracteres'),
});

export class CreatePostDto extends createZodDto(CreatePostSchema) {}
