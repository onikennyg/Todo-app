// src/pages/CompletedTodos.tsx
import React from 'react';
import NavBar from '../components/NavBar';
import CompletedTodoList from '../components/CompletedTodoList';
import TaskList from '../components/TaskList';
import { getLoginInfo } from '../utils/LoginInfo';
import custom_axios from '../axios/AxiosSetup';
import { ApiConstants } from '../api/ApiConstants';
import { toast } from 'react-toastify';

interface TodoModel {
  title: string;
  date: string;
  id: number;
  tasks: { id: number; description: string; completed: boolean; dueDate: string }[];
}

const CompeletedTodos = () => {
  const [todos, setTodos] = React.useState<TodoModel[]>([]);

  const getAllCompletedTodos = async () => {
    const userId = getLoginInfo()?.userId;
    if (userId != null) {
      const response = await custom_axios.get(ApiConstants.TODO.FIND_COMPLETED(userId), { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
      setTodos(response.data);
    } else {
      toast.info('Sorry you are not authenticated');
    }
  };

  React.useEffect(() => {
    if (todos.length == 0) getAllCompletedTodos();
  }, []);

  return (
    <div>
      <NavBar></NavBar>
      <h1 className=" text-center text-5xl p-4">Completed Todos</h1>
      <div className="container mb-2 flex mx-auto w-full items-center justify-center">
        <ul className="flex flex-col p-4">
          {todos.map((todo) => (
            <div key={todo.id}>
              <CompletedTodoList
                dateTime={todo.date}
                deleteTodo={async () => {
                  const response = await custom_axios.delete(ApiConstants.TODO.DELETE(todo.id), { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
                  getAllCompletedTodos();
                  toast.success('Todo Deleted Sucessfully!!');
                }}
                id={todo.id}
                todo={todo.title}
              />
              <TaskList tasks={todo.tasks} markComplete={() => {}} deleteTask={() => {}} />
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CompeletedTodos;