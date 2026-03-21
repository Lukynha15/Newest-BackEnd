import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, userId: string) {
    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        postId: createCommentDto.postId,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    const post = await this.prisma.post.findUnique({
      where: { id: createCommentDto.postId },
      select: { authorId: true },
    });

    if (post && post.authorId !== userId) {
      await this.prisma.notification.create({
        data: {
          userId: post.authorId,
          actorId: userId,
          type: 'comment',
          postId: createCommentDto.postId,
        },
      });
    }

    const mentions = createCommentDto.content.match(/@(\w+)/g);
    if (mentions) {
      const usernames = mentions.map((m) => m.slice(1));
      const mentionedUsers = await this.prisma.user.findMany({
        where: {
          name: { in: usernames },
          NOT: { id: userId },
        },
        select: { id: true },
      });

      await Promise.all(
        mentionedUsers.map((user) =>
          this.prisma.notification.create({
            data: {
              userId: user.id,
              actorId: userId,
              type: 'mention',
              postId: createCommentDto.postId,
            },
          }),
        ),
      );
    }

    return comment;
  }

  async findByPostId(postId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return comments;
  }

  async findOne(id: string) {
    return this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!comment) {
      throw new Error('Comentário não encontrado');
    }

    if (comment.authorId !== userId) {
      throw new Error('Você não tem permissão para deletar este comentário');
    }

    return await this.prisma.comment.delete({ where: { id } });
  }
}
