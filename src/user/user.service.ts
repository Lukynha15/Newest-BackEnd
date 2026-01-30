import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, bio, password, avatar } = createUserDto;

    const userExists = await this.prisma.user.findUnique({ where: { email } });

    if (userExists) {
      throw new UnauthorizedException('Usuário já existe');
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        bio,
        avatar,
        password: hashPassword,
      },
    });

    return user;
  }

  async findById(userId: number) {
    const totalPosts = await this.prisma.post.count({
      where: { authorId: userId },
    });
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar: true,
        createdAt: true,
        bio: true,
        email: true,
      },
    });
    return { ...user, totalPosts };
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  // ⚠️ NOVO MÉTODO - Atualizar Avatar
  async updateAvatar(userId: number, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  async searchUsers(query: string) {
    const results = await this.prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    const formattedUsers = results.map((result) => {
      return {
        id: result.id,
        name: result.name,
        email: result.email,
        avatar: result.avatar,
        bio: result.bio,
        totalPosts: result._count.posts,
      };
    });

    return formattedUsers;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      ...user,
      totalPosts: user._count.posts,
    };
  }

  async getUserPosts(userId: number) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts.map((post) => ({
      ...post,
      likes: post._count.likes,
      comments: post._count.comments,
    }));
  }

  async remove(id: number) {
    return await this.prisma.user.delete({ where: { id } });
  }
}
