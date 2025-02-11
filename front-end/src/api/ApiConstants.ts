export const ApiConstants = {
  TODO: {
    ADD: (userId: number) => `/todo/${userId}`,
    FIND_NOT_COMPLETED: (userId: number) => `/todo/findAllNotCompleted/${userId}`,
    FIND_COMPLETED: (userId: number) => `/todo/findAllCompleted/${userId}`,
    MARK_COMPLETE: (todoId: number) => `/todo/${todoId}`,
    DELETE: (todoId: number) => `/todo/${todoId}`,
  },
  USER: {
    SIGN_UP: "/user/signUp",
    FIND_ALL: "/user",
    DELETE: (userId: number) => `/user/${userId}`,
  },
  LOGIN: "/auth/login",
};