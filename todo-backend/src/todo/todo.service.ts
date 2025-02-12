import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { UserService } from 'src/user/user.service';
import { UpdateTodoDto } from './dto/update-todo.dto';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    private userService: UserService,
  ) {}

  async create(createTodoDto: CreateTodoDto, userId: number): Promise<Todo> {
    let todo: Todo = new Todo();
    todo.title = createTodoDto.title;
    todo.date = new Date().toLocaleString();
    todo.completed = false;
    const user = await this.userService.findUserById(userId); // Get the user
    todo.user = user; // Assign the user
    return this.todoRepository.save(todo);
  }

  async findAllTodoByUserNotCompleted(
    userId: number,
    options: IPaginationOptions,
    filter?: { title?: string }, // Add filter
    sort?: { field: string; order: 'ASC' | 'DESC' } | null, // Add sort
  ): Promise<Pagination<Todo>> {
    const queryBuilder = this.todoRepository
      .createQueryBuilder('todo')
      .leftJoinAndSelect('todo.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('todo.completed = :completed', { completed: false });

    // Apply filter
    if (filter?.title) {
      queryBuilder.andWhere('todo.title LIKE :title', { title: `%${filter.title}%` });
    }

    // Apply sort
    if (sort?.field && sort?.order) {
      queryBuilder.orderBy(`todo.${sort.field}`, sort.order);
    }

    return paginate<Todo>(queryBuilder, options);
  }

  async findAllTodoByUserCompleted(
    userId: number,
    options: IPaginationOptions,
    filter?: { title?: string }, // Add filter
    sort?: { field: string; order: 'ASC' | 'DESC' } | null, // Add sort
  ): Promise<Pagination<Todo>> {
    const queryBuilder = this.todoRepository
      .createQueryBuilder('todo')
      .leftJoinAndSelect('todo.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('todo.completed = :completed', { completed: true });

    // Apply filter
    if (filter?.title) {
      queryBuilder.andWhere('todo.title LIKE :title', { title: `%${filter.title}%` });
    }

    // Apply sort
    if (sort?.field && sort?.order) {
      queryBuilder.orderBy(`todo.${sort.field}`, sort.order);
    }

    return paginate<Todo>(queryBuilder, options);
  }

  async update(todoId: number): Promise<any> {
    return this.todoRepository.update(todoId, { completed: true });
  }

  async remove(todoId: number): Promise<any> {
    return this.todoRepository.delete(todoId);
  }

  async findOne(id: number): Promise<Todo> {
    const todo = await this.todoRepository.findOne({
      where: { id },
      relations: ['tasks', 'user'], // Load tasks for the todo
    });
    if (!todo) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }
    return todo;
  }

  async updateTodo(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(id); // Ensure todo exists
    await this.todoRepository.update(id, updateTodoDto);
    return this.findOne(id); // Return updated todo
  }

  // Method to calculate todo status based on due date and tasks
  getTodoStatus(todo: Todo): string {
    if (!todo.dueDate) {
      return 'green'; // No due date, default to green
    }

    const now = new Date();
    const timeLeft = todo.dueDate.getTime() - now.getTime();
    const daysLeft = timeLeft / (1000 * 60 * 60 * 24);
    const hoursLeft = timeLeft / (1000 * 60 * 60);

    if (daysLeft >= 3) {
      return 'green';
    } else if (hoursLeft >= 1) {
      return 'amber';
    } else if (timeLeft > 0) {
      return 'red';
    } else {
      return 'red'; // Overdue
    }
  }
}
