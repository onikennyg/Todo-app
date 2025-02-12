import { User } from './user.entity';
import { Todo } from '../../todo/entities/todo.entity';

describe('User Entity', () => {
  it('should be defined', () => {
    expect(new User()).toBeDefined();
  });

  it('should have id, firstName, lastName, email, password, role, and todos properties', () => {
    const user = new User();
    user.id = 1;
    user.firstName = 'John';
    user.lastName = 'Doe';
    user.email = 'john.doe@example.com';
    user.password = 'securePassword';
    user.role = 'ADMIN';
    user.todos = [new Todo()];

    expect(user.id).toEqual(1);
    expect(user.firstName).toEqual('John');
    expect(user.lastName).toEqual('Doe');
    expect(user.email).toEqual('john.doe@example.com');
    expect(user.password).toEqual('securePassword');
    expect(user.role).toEqual('ADMIN');
    expect(user.todos).toBeInstanceOf(Array);
    expect(user.todos[0]).toBeInstanceOf(Todo);
  });
});