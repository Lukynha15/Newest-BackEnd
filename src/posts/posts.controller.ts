import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createPostDto: CreatePostDto, @Req() req) {
    const userId = req.user.id;
    return this.postsService.create(createPostDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyPosts(@Req() req) {
    const userId = req.user.id;
    return this.postsService.findByUserId(userId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllPosts(@Req() req) {
    const userId = req.user.id;
    return this.postsService.getAllPosts(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getUserPosts(@Param('userId') userId: string, @Req() req) {
    const currentUserId = req.user.id;
    return this.postsService.findByUserId(userId, currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPostById(@Param('id') id: string, @Req() req) {
    const currentUserId = req.user.id;
    return this.postsService.findOne(id, currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':postId/like')
  async toggleLike(@Param('postId') postId: string, @Req() req) {
    const userId = req.user.id;
    return this.postsService.toggleLike(postId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.postsService.remove(id, userId);
  }
}
