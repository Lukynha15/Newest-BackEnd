import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comentário é obrigatório')
    .max(300, 'Comentário pode ter no máximo 300 caracteres'),
  postId: z.string().uuid('ID do post inválido'),
});

export class CreateCommentDto extends createZodDto(CreateCommentSchema) {}
