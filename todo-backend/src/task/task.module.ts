import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TodoModule } from 'src/todo/todo.module';
import { TodoService } from 'src/todo/todo.service';
import { TaskRepository } from './repo/task.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskRepository]), TodoModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
