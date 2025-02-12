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
import { ApiTags, ApiSecurity, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

@Controller('task')
@ApiTags('Tasks')
@ApiSecurity('JWT-auth')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post(':todoId')
  @ApiOperation({ summary: 'Create a new task', description: 'Creates a new task associated with a specific todo.' })
  @ApiParam({ name: 'todoId', type: Number, description: 'The ID of the todo to associate the task with.' })
  create(
    @Param('todoId', ParseIntPipe) todoId: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.taskService.create(todoId, createTaskDto);
  }

  @Get(':todoId')
  @ApiOperation({ summary: 'Get all tasks for a todo', description: 'Retrieves a paginated list of tasks associated with a specific todo.' })
  @ApiParam({ name: 'todoId', type: Number, description: 'The ID of the todo to retrieve tasks for.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination.' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of tasks per page.' })
  @ApiQuery({ name: 'description', required: false, type: String, description: 'Filter tasks by description (partial match).' })
  @ApiQuery({ name: 'completed', required: false, type: Boolean, description: 'Filter tasks by completion status.' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort tasks by.' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sorting order (ASC or DESC).' })
  findAllByTodo(
    @Param('todoId', ParseIntPipe) todoId: number,
    @Query('page') page: string | number = 1, 
    @Query('limit') limit: string | number = 10,
    @Query('description') description?: string,
    @Query('completed') completed?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
  ) {
    const options: IPaginationOptions = {
      page: Number(page), 
      limit: Number(limit),
    };
  
    const filter = { description, completed };
    let sort = sortBy ? { field: sortBy, order: sortOrder } : null;
  
    return this.taskService.findAllByTodo(
      todoId,
      options,
      filter,
      sort,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID', description: 'Retrieves a specific task by its ID.' })
  @ApiParam({ name: 'id', type: Number, description: 'The ID of the task to retrieve.' })
  @ApiResponse({ status: 200, description: 'The requested task.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task', description: 'Updates an existing task.' })
  @ApiParam({ name: 'id', type: Number, description: 'The ID of the task to update.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task', description: 'Deletes a task.' })
  @ApiParam({ name: 'id', type: Number, description: 'The ID of the task to delete.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.remove(id);
  }
}
