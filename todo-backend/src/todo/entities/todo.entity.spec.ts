import { Todo } from './todo.entity';
import { User } from '../../user/entities/user.entity';
import { Task } from '../../task/entities/task.entity';

describe('Todo Entity', () => {
  it('should be defined', () => {
    expect(new Todo()).toBeDefined();
  });

  it('should have id, title, date, completed, dueDate, user, and tasks properties', () => {
    const todo = new Todo();
    todo.id = 1;
    todo.title = 'Shopping List';
    todo.date = new Date().toLocaleString();
    todo.completed = false;
    todo.dueDate = new Date();
    todo.user = new User();
    todo.tasks = [new Task()];

    expect(todo.id).toEqual(1);
    expect(todo.title).toEqual('Shopping List');
    expect(todo.date).toBeDefined();
    expect(todo.completed).toEqual(false);
    expect(todo.dueDate).toBeInstanceOf(Date);
    expect(todo.user).toBeInstanceOf(User);
    expect(todo.tasks).toBeInstanceOf(Array);
    expect(todo.tasks[0]).toBeInstanceOf(Task);
  });
});