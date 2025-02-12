import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    Query,
  } from '@nestjs/common';
  import { TaskService } from './task.service';
  import { CreateTaskDto } from './dto/create-task.dto';
  import { UpdateTaskDto } from './dto/update-task.dto';
  import { ApiTags } from '@nestjs/swagger';
  import { IPaginationOptions } from 'nestjs-typeorm-paginate';
  
  @Controller('task')
  @ApiTags('Task')
  export class TaskController {
    constructor(private readonly taskService: TaskService) {}
  
    @Post(':todoId')
    create(
      @Param('todoId', ParseIntPipe) todoId: number,
      @Body() createTaskDto: CreateTaskDto,
    ) {
      return this.taskService.create(todoId, createTaskDto);
    }
  
    @Get(':todoId')
    findAllByTodo(
      @Param('todoId', ParseIntPipe) todoId: number,
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
      @Query('description') description?: string, // Add filter
      @Query('completed') completed?: boolean, // Add filter
      @Query('sortBy') sortBy?: string, // Add sort
      @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC', // Add sort
    ) {
      const options: IPaginationOptions = {
        page,
        limit,
      };
  
      const filter = { description, completed }; // Create filter object
      let sort = sortBy ? { field: sortBy, order: sortOrder } : null
  
      return this.taskService.findAllByTodo(
        todoId,
        options,
        filter, // Pass filter object
        sort, // Pass sort object
      );
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.taskService.findOne(id);
    }
  
    @Patch(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateTaskDto: UpdateTaskDto,
    ) {
      return this.taskService.update(id, updateTaskDto);
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.taskService.remove(id);
    }
  }
  