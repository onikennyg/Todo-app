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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0)
  const [titleFilter, setTitleFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const getAllNotCompletedTodos = async () => {
    const userId = getLoginInfo()?.userId;
    if (userId != null) {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          title: titleFilter,
          sortBy: sortBy,
          sortOrder: sortOrder,
        });

        const url = `${ApiConstants.TODO.FIND_NOT_COMPLETED(userId)}?${params.toString()}`;
        const response = await custom_axios.get(url, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });

        setTodos(response.data.items);
        setTotal(response.data.meta.totalItems)
      } catch (error) {
        console.error('Error fetching todos:', error);
        toast.error('Failed to fetch todos');
      }
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
    getAllNotCompletedTodos();
  }, [page, limit, titleFilter, sortBy, sortOrder]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

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

          {/* Filter Input */}
          <div>
            <label htmlFor="titleFilter">Filter by Title:</label>
            <input
              type="text"
              id="titleFilter"
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
            />
          </div>

          {/* Sort Options */}
          <div>
            <label htmlFor="sortBy">Sort by:</label>
            <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="">None</option>
              <option value="title">Title</option>
              <option value="date">Date</option>
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'ASC' | 'DESC')}>
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
          </div>

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

           {/* Pagination Controls */}
           <div className="pagination">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
              Previous
            </button>
            <span>{`Page ${page}`}</span>
            <button onClick={() => handlePageChange(page + 1)} disabled={todos.length < limit ||(page * limit) > total}>
              Next
            </button>
          </div>
        </ul>
      </div>
    </div>
  );
}

export default ActiveTodos;
