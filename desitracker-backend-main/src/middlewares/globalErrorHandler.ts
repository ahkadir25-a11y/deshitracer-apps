import { ErrorRequestHandler } from 'express';
// import { ZodError } from 'zod';
// import zodErrorhandler from '../errors/zodErrorHandler';
import httpStatus from 'http-status';
import config from '../config';
import AppError from '../errors/AppError';
import castErrorHandler from '../errors/castErrorHandler';
import duplicateKeyErrorHandler from '../errors/duplicateKeyErrorhandler';
import validationErrorHandler from '../errors/validationErrorHandler';
import { TErrorSources } from '../interfaces/errors/errors.interface';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // setting default values
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Something Went Wrong';

  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something Went Wrong',
    },
  ];

  // if (err instanceof ZodError) {
  //   const formattedError = zodErrorhandler(err);
  //   statusCode = formattedError?.statusCode;
  //   message = formattedError?.message;
  //   errorSources = formattedError?.errorSources;
  // } else
  if (err?.name === 'ValidationError') {
    const formattedError = validationErrorHandler(err);
    statusCode = formattedError?.statusCode;
    message = formattedError?.message;
    errorSources = formattedError?.errorSources;
  } else if (err?.name === 'CastError') {
    const formattedError = castErrorHandler(err);
    statusCode = formattedError?.statusCode;
    message = formattedError?.message;
    errorSources = formattedError?.errorSources;
  } else if (err?.code === 11000) {
    const formattedError = duplicateKeyErrorHandler(err);
    statusCode = formattedError?.statusCode;
    message = formattedError?.message;
    errorSources = formattedError?.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err?.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  } else if (err instanceof Error) {
    // Unclassified errors: never leak internal messages/stack to clients in
    // production — log server-side, return a generic message.
    const isDev = config.NODE_ENV === 'development';
    if (isDev) {
      message = err?.name;
      errorSources = [{ path: '', message: err?.message }];
    } else {
      console.error('[unhandled]', err?.name, err?.message);
      message = 'Something went wrong';
      errorSources = [{ path: '', message: 'Something went wrong' }];
    }
  }

  // final return
  res.status(statusCode).json({
    success: false,
    message: message,
    errorSources,
    stack: config.NODE_ENV === 'development' ? err?.stack : null,
    // err,
  });

  return;
};

export default globalErrorHandler;
