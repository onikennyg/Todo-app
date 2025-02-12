import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

@Controller('todo')
@ApiTags('Todo')
@ApiSecurity('JWT-auth')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post(':userId')
  create(
    @Body(ValidationPipe) createTodoDto: CreateTodoDto,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.todoService.create(createTodoDto, Number(userId));
  }

  @Get('/findAllNotCompleted/:userId')
  findAllTodosByUserIdNotCompleted(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('title') title?: string, // Add filter
    @Query('sortBy') sortBy?: string, // Add sort
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC', // Add sort
  ) {
    const options: IPaginationOptions = {
      page,
      limit,
    };

    const filter = { title }; // Create filter object
    let sort = sortBy ? { field: sortBy, order: sortOrder } : null

    return this.todoService.findAllTodoByUserNotCompleted(
      Number(userId),
      options,
      filter, // Pass filter object
      sort, // Pass sort object
    );
  }

  @Get('/findAllCompleted/:userId')
  findAllTodosByUserIdCompleted(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('title') title?: string, // Add filter
    @Query('sortBy') sortBy?: string, // Add sort
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC', // Add sort
  ) {
    const options: IPaginationOptions = {
      page,
      limit,
    };

    const filter = { title }; // Create filter object
    let sort = sortBy ? { field: sortBy, order: sortOrder } : null // Create sort object

    return this.todoService.findAllTodoByUserCompleted(
      Number(userId),
      options,
      filter, // Pass filter object
      sort, // Pass sort object
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.todoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todoService.updateTodo(id, updateTodoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.todoService.remove(Number(id));
  }
}
