import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}
  async create(createCommentDto: CreateCommentDto) {
    const commentPost = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        postId: createCommentDto.postId,
      },
    });
    return commentPost;
  }

  findOne(id: number) {
    return this.prisma.comment.findUnique({ where: { id } });
  }

  remove(id: number) {
    return this.prisma.comment.delete({ where: { id } });
  }
}
