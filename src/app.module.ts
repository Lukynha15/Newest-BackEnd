import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PostsModule } from './posts/posts.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [ConfigModule.forRoot(), UserModule, PostsModule, CommentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
