import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskList = ({ todoId }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await axios.get(`/task/${todoId}`);
      setTasks(response.data);
    };
    fetchTasks();
  }, [todoId]);

  const taskStatusClass = (status) => {
    switch (status) {
      case 'green': return 'task-green';
      case 'amber': return 'task-amber';
      case 'red': return 'task-red';
      default: return 'task-green';
    }
  };

  return (
    <div>
      <h3>Tasks:</h3>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className={taskStatusClass(task.status)}>
            {task.description} - Due: {task.dueDate}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
