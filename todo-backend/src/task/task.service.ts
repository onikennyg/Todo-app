import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskRepository } from './repo/task.repository';
import { Todo } from 'src/todo/entities/todo.entity';
import { TodoService } from 'src/todo/todo.service';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: TaskRepository,
    private todoService: TodoService,
  ) {}

  async create(todoId: number, createTaskDto: CreateTaskDto): Promise<Task> {
    const todo = await this.todoService.findOne(todoId);

    if (!todo) {
      throw new NotFoundException(`Todo with ID "${todoId}" not found`);
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      todo: todo,
    });

    return await this.taskRepository.save(task);
  }

  async findAllByTodo(
    todoId: number,
    options: IPaginationOptions,
    filter?: { description?: string; completed?: boolean }, // Add filter
    sort?: { field: string; order: 'ASC' | 'DESC' } | null, // Add sort
  ): Promise<Pagination<Task>> {
    const todo = await this.todoService.findOne(todoId);

    if (!todo) {
      throw new NotFoundException(`Todo with ID "${todoId}" not found`);
    }

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.todo', 'todo')
      .where('todo.id = :todoId', { todoId });

    // Apply filter
    if (filter?.description) {
      queryBuilder.andWhere('task.description LIKE :description', {
        description: `%${filter.description}%`,
      });
    }
    if (filter?.completed !== undefined) {
      queryBuilder.andWhere('task.completed = :completed', {
        completed: filter.completed,
      });
    }

    // Apply sort
    if (sort?.field && sort?.order) {
      queryBuilder.orderBy(`task.${sort.field}`, sort.order);
    }

    return paginate<Task>(queryBuilder, options);
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id); // Ensure task exists
    await this.taskRepository.update(id, updateTaskDto);
    return this.findOne(id); // Return updated task
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id); // Ensure task exists
    await this.taskRepository.softDelete(id);
  }

  // Method to calculate task status based on due date
  getTaskStatus(task: Task): string {
    if (!task.dueDate) {
      return 'green'; // No due date, default to green
    }

    const now = new Date();
    const timeLeft = task.dueDate.getTime() - now.getTime();
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
