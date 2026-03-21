import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreatePostSchema = z.object({
  title: z.string().max(100, 'Título pode ter no máximo 100 caracteres'),
  content: z
    .string()
    .min(1, 'Conteúdo é obrigatório')
    .max(500, 'Conteúdo pode ter no máximo 500 caracteres'),
  images: z.array(z.string()).max(3).optional(),
});

export class CreatePostDto extends createZodDto(CreatePostSchema) {}
