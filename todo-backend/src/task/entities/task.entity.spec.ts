import { Task } from './task.entity';
import { Todo } from '../../todo/entities/todo.entity';

describe('Task Entity', () => {
  it('should be defined', () => {
    expect(new Task()).toBeDefined();
  });

  it('should have id, description, completed, dueDate, status, todo, and deletedAt properties', () => {
    const task = new Task();
    task.id = 1;
    task.description = 'Buy groceries';
    task.completed = false;
    task.dueDate = new Date();
    task.status = 'green';
    task.todo = new Todo();
    task.deletedAt = undefined;

    expect(task.id).toEqual(1);
    expect(task.description).toEqual('Buy groceries');
    expect(task.completed).toEqual(false);
    expect(task.dueDate).toBeInstanceOf(Date);
    expect(task.status).toEqual('green');
    expect(task.todo).toBeInstanceOf(Todo);
    expect(task.deletedAt).toBeNull();
  });
});