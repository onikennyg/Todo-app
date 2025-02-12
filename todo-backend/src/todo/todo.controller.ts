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
import { ApiSecurity, ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

@Controller('todo')
@ApiTags('Todos')
@ApiSecurity('JWT-auth')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post(':userId')
  @ApiOperation({ summary: 'Create a new todo', description: 'Creates a new todo for a specific user.' })
  @ApiParam({ name: 'userId', type: Number, description: 'The ID of the user to create the todo for.' })
  @ApiBody({ type: CreateTodoDto, description: 'The data for the new todo.' })
  @ApiResponse({ status: 201, description: 'The newly created todo.' })
  create(
    @Body(ValidationPipe) createTodoDto: CreateTodoDto,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.todoService.create(createTodoDto, Number(userId));
  }

  @Get('/findAllNotCompleted/:userId')
  @ApiOperation({ summary: 'Get all not completed todos for a user', description: 'Retrieves a paginated list of not completed todos for a specific user.' })
  @ApiParam({ name: 'userId', type: Number, description: 'The ID of the user to retrieve todos for.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination.' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of todos per page.' })
  @ApiQuery({ name: 'title', required: false, type: String, description: 'Filter todos by title (partial match).' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort todos by.' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sorting order (ASC or DESC).' })
  @ApiResponse({ status: 200, description: 'The list of not completed todos.' })
  findAllTodosByUserIdNotCompleted(
  @Param('userId', ParseIntPipe) userId: number,
  @Query('page', ParseIntPipe) page: number = 1,  // Ensure it's a number
  @Query('limit', ParseIntPipe) limit: number = 10, // Ensure it's a number
  @Query('title') title?: string,
  @Query('sortBy') sortBy?: string,
  @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
) {
  const options: IPaginationOptions = {
    page,
    limit,
  };
  
  const filter = { title };
  let sort = sortBy ? { field: sortBy, order: sortOrder } : null;

  return this.todoService.findAllTodoByUserNotCompleted(
    Number(userId),
    options,
    filter,
    sort,
  );
}

  @Get('/findAllCompleted/:userId')
  @ApiOperation({ summary: 'Get all completed todos for a user', description: 'Retrieves a paginated list of completed todos for a specific user.' })
  @ApiParam({ name: 'userId', type: Number, description: 'The ID of the user to retrieve todos for.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination.' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of todos per page.' })
  @ApiQuery({ name: 'title', required: false, type: String, description: 'Filter todos by title (partial match).' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort todos by.' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sorting order (ASC or DESC).' })
  @ApiResponse({ status: 200, description: 'The list of completed todos.' })
  findAllTodosByUserIdCompleted(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('title') title?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
  ) {
    const options: IPaginationOptions = {
      page,
      limit,
    };

    const filter = { title };
    let sort = sortBy ? { field: sortBy, order: sortOrder } : null;

    return this.todoService.findAllTodoByUserCompleted(
      Number(userId),
      options,
      filter,
      sort,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a todo by ID', description: 'Retrieves a specific todo by its ID.' })
  @ApiParam({ name: 'id', type: Number, description: 'The ID of the todo to retrieve.' })
  @ApiResponse({ status: 200, description: 'The requested todo.' })
  @ApiResponse({ status: 404, description: 'Todo not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.todoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo', description: 'Updates an existing todo.' })
  @ApiParam({ name: 'id', type: Number, description: 'The ID of the todo to update.' })
  @ApiBody({ type: UpdateTodoDto, description: 'The data to update the todo with.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todoService.updateTodo(id, updateTodoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a todo', description: 'Deletes a todo.' })
  @ApiParam({ name: 'id', type: Number, description: 'The ID of the todo to delete.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.todoService.remove(Number(id));
  }
}
