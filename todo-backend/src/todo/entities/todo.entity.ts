import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Task } from 'src/task/entities/task.entity';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  date: string;

  @Column()
  completed: boolean;

  @Column({ nullable: true })  // Make dueDate optional
  dueDate?: Date;

  //   many todos can belong to single user
  @ManyToOne(() => User, (user) => user.todos)
  user: User;

  @OneToMany(() => Task, (task) => task.todo)
  tasks: Task[];
}
