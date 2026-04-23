import {
  TErrorSources,
  TGenericErrorResponse,
} from '../interfaces/errors/errors.interface';

const duplicateKeyErrorHandler = (err: any): TGenericErrorResponse => {
  const match = err.message.match(/"([^"]+)"/);

  // Check if a match is found and extract the value
  const extractedValue = match && match[1];

  const statusCode = 400;
  const errorSources: TErrorSources = [
    {
      path: '',
      message: `${extractedValue} is already exists`,
    },
  ];

  return {
    statusCode,
    message: 'already exists in database',
    errorSources,
  };
};

export default duplicateKeyErrorHandler;
