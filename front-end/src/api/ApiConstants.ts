// src/api/ApiConstants.ts
export const ApiConstants = {
  TODO: {
    ADD: (userId: number) => `/todo/${userId}`,
    FIND_NOT_COMPLETED: (userId: number) =>
      `/todo/findAllNotCompleted/${userId}`,
    FIND_COMPLETED: (userId: number) =>
      `/todo/findAllCompleted/${userId}`,
    MARK_COMPLETE: (todoId: number) => `/todo/${todoId}`,
    DELETE: (todoId: number) => `/todo/${todoId}`,
  },
  TASK: {
    ADD: (todoId: number) => `/task/${todoId}`,
    FIND_ALL: (todoId: number) => `/task/${todoId}`,
    FIND_ONE: (taskId: number) => `/task/${taskId}`,
    UPDATE: (taskId: number) => `/task/${taskId}`,
    DELETE: (taskId: number) => `/task/${taskId}`,
  },
  USER: {
    SIGN_UP: '/user/signUp',
    FIND_ALL: '/user',
    DELETE: (userId: number) => `/user/${userId}`,
  },
  LOGIN: '/auth/login',
};
