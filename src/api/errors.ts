// status code 400
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// status code 401
export class UserNotAuthenticatedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// status code 403
export class UserForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// status code 404
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}
