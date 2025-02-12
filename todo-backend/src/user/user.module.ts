import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity'; // Ensure this import is correct
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repo/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRepository])], // Ensure User entity is included here
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
