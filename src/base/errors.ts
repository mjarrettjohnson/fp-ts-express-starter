
export const enum HttpStatusCode {
  OK = 200,
  NOT_FOUND = 404,
  CLIENT_ERROR = 400,
  NOT_AUTHENTICATED = 403,
  SERVER_ERROR = 500,
}

export class HttpError extends Error {
  public readonly status: HttpStatusCode

  constructor(opts: {status: HttpStatusCode, message: string}) {
    super(opts.message)
    this.status = opts.status;
  }
}

export class NotFoundHttpError extends HttpError {
  constructor(message: string) {
    super({ message, status: HttpStatusCode.NOT_FOUND})
  }
}

export class ClientErrorHttpError extends HttpError {
  constructor(message: string) {
    super({ message, status: HttpStatusCode.CLIENT_ERROR})
  }
}

export class UnauthenticatedHttpError extends HttpError {
  constructor(message: string) {
    super({ message, status: HttpStatusCode.NOT_AUTHENTICATED})
  }
}

export class ServerErrorHttpError extends HttpError {
  constructor(message: string) {
    super({ message, status: HttpStatusCode.SERVER_ERROR})
  }
}

export const invalidCredentials = () => new UnauthenticatedHttpError('Invalid Credentials');
export const serverError = () => new ServerErrorHttpError('Internal Error');
export const invalidRequest = () => new ClientErrorHttpError('Invalid request');
