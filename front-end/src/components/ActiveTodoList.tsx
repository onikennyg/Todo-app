// src/pages/ActiveTodos.tsx
import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import ActiveTodoList from '../components/ActiveTodoList';
import TaskList from '../components/TaskList';
import custom_axios from '../axios/AxiosSetup';
import { getLoginInfo } from '../utils/LoginInfo';
import { toast } from 'react-toastify';
import { ApiConstants } from '../api/ApiConstants';

interface TodoModel {
  title: string;
  date: string;
  id: number;
  tasks: { id: number; description: string; completed: boolean; dueDate: string }[];
}

function ActiveTodos() {
  const [todos, setTodos] = useState<TodoModel[]>([]);
  const title: any = React.useRef();

  const getAllNotCompletedTodos = async () => {
    const userId = getLoginInfo()?.userId;
    if (userId != null) {
      const response = await custom_axios.get(ApiConstants.TODO.FIND_NOT_COMPLETED(userId), { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
      setTodos(response.data);
    } else {
      toast.info('Sorry you are not authenticated');
    }
  };

  const saveTodo = async () => {
    try {
      if (!title.current.value.trim()) {
        toast.info('Please Provide Title');
        return;
      }

      const userId = getLoginInfo()?.userId;
      if (!userId) {
        toast.error('Authentication required');
        return;
      }

      await custom_axios.post(ApiConstants.TODO.ADD(userId), { title: title.current.value.trim() });

      await getAllNotCompletedTodos();
      title.current.value = '';
      toast.success('Todo Added Successfully!');
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  };

  const markTaskComplete = async (taskId: number) => {
    await custom_axios.patch(ApiConstants.TASK.UPDATE(taskId), { completed: true });
    getAllNotCompletedTodos();
    toast.success('Task Marked Completed');
  };

  const deleteTask = async (taskId: number) => {
    await custom_axios.delete(ApiConstants.TASK.DELETE(taskId));
    getAllNotCompletedTodos();
    toast.success('Task Deleted Successfully');
  };

  useEffect(() => {
    if (todos.length == 0) getAllNotCompletedTodos();
  }, []);

  return (
    <div>
      <NavBar></NavBar>
      <div className="container mb-2 flex mx-auto w-full items-center justify-center">
        <ul className="flex flex-col p-4">
          <span className="text-black text-2xl ">Enter Todo : </span>
          <input ref={title} className="mt-2 p-2  rounded-xl "></input>
          <button onClick={saveTodo} className="w-36 px-2 py-4 text-white mx-auto mb-12 mt-2 bg-green-400 rounded-xl hover:bg-green-500 text-2xl">
            Save
          </button>

          {todos.map((todo) => (
            <div key={todo.id}>
              <ActiveTodoList
                dateTime={todo.date}
                deleteTodo={async () => {
                  const response = await custom_axios.delete(ApiConstants.TODO.DELETE(todo.id), { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
                  getAllNotCompletedTodos();
                  toast.success('Todo Deleted Sucessfully!!');
                }}
                markCompelte={async () => {
                  const response = await custom_axios.patch(ApiConstants.TODO.MARK_COMPLETE(todo.id), {}, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
                  getAllNotCompletedTodos();
                  toast.success('Todo Marked Completed');
                }}
                id={todo.id}
                todo={todo.title}
              />
              <TaskList tasks={todo.tasks} markComplete={markTaskComplete} deleteTask={deleteTask} />
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ActiveTodos;