/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Like } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async toggleLike(postId: number, userId: number) {
    const existingLike: Like | null = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      const updatedPost = await this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
        select: {
          id: true,
          likesCount: true,
        },
      });

      return {
        liked: false,
        message: 'Like removido',
        postId: updatedPost.id,
        likesCount: updatedPost.likesCount,
        isLiked: false,
      };
    } else {
      await this.prisma.like.create({
        data: {
          userId,
          postId,
        },
      });

      const updatedPost = await this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
        select: {
          id: true,
          likesCount: true,
        },
      });

      return {
        liked: true,
        message: 'Like adicionado',
        postId: updatedPost.id,
        likesCount: updatedPost.likesCount,
        isLiked: true,
      };
    }
  }

  async getAllPosts(currentUserId?: number) {
    if (currentUserId) {
      const userLikes = await this.prisma.like.findMany({
        where: { userId: currentUserId },
      });
    }

    const posts = await this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        likesCount: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true, userId: true, postId: true },
            }
          : false,
      },
    });

    const result = posts.map((post: any) => {
      const isLiked = post.likes ? post.likes.length > 0 : false;
      return {
        id: post.id,
        title: post.title,
        content: post.content,
        likes: post.likesCount,
        createdAt: post.createdAt,
        author: post.author,
        isLiked: isLiked,
      };
    });
    return result;
  }

  async findByUserId(userId: number, currentUserId?: number) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        likesCount: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
    });

    return posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      likes: post.likesCount,
      createdAt: post.createdAt,
      author: post.author,
      isLiked: post.likes ? post.likes.length > 0 : false,
    }));
  }

  async findOne(postId: number, currentUserId?: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        content: true,
        likesCount: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
    });

    if (!post) {
      throw new Error('Post não encontrado');
    }

    return {
      ...post,
      likes: post.likesCount,
      isLiked: Array.isArray(post.likes) && post.likes.length > 0,
    };
  }

  async create(createPostDto: CreatePostDto, userId: number) {
    return this.prisma.post.create({
      data: {
        ...createPostDto,
        authorId: userId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        likesCount: true,
        createdAt: true,
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

  async remove(id: number) {
    return await this.prisma.post.delete({ where: { id } });
  }
}
