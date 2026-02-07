import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/posts',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `post-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new Error('Apenas imagens são permitidas!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async create(
    @Body() createPostDto: CreatePostDto,
    @Req() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.userId;

    if (file) {
      createPostDto.image = `/uploads/posts/${file.filename}`;
    }

    return this.postsService.create(createPostDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyPosts(@Req() req) {
    const userId = req.user.userId;
    return this.postsService.findByUserId(userId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllPosts(@Req() req) {
    const userId = req.user.userId;
    return this.postsService.getAllPosts(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getUserPosts(@Param('userId') userId: string, @Req() req) {
    const currentUserId = req.user.userId;
    return this.postsService.findByUserId(userId, currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPostById(@Param('id') id: string, @Req() req) {
    const currentUserId = req.user.userId;
    return this.postsService.findOne(id, currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':postId/like')
  async toggleLike(@Param('postId') postId: string, @Req() req) {
    const userId = req.user.userId;
    return this.postsService.toggleLike(postId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    return this.postsService.remove(id, userId);
  }
}
