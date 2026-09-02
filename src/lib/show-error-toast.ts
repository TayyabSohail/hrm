import { toast } from 'sonner';

import { enumToLabel } from '@/utils/string-functions';

type NextSafeActionError = {
  serverError?: string;
  validationErrors?:
    | {
        formErrors: string[];
        fieldErrors: {
          [key: string]: string[] | undefined;
        };
      }
    | undefined;
  [key: string]: unknown;
};

export function getErrorMessage(
  args: OnErrorArgs,
): { type: string; message: string }[] {
  const { error } = args;
  const messages: { type: string; message: string }[] = [];
  if (error.serverError) {
    messages.push({ type: 'Server Error', message: error.serverError });
  }

  if (error.validationErrors) {
    if (error.validationErrors.formErrors.length > 0) {
      error.validationErrors.formErrors.forEach((formError) => {
        messages.push({ type: 'Form Error', message: formError });
      });
    }

    Object.entries(error.validationErrors.fieldErrors).forEach(
      ([field, errors]) => {
        if (errors && errors.length > 0) {
          messages.push({
            type: 'Invalid Input',
            message: `${enumToLabel(field)}: ${errors.join(', ')}`,
          });
        }
      },
    );
  }

  if (!error.serverError && !error.validationErrors) {
    messages.push({
      type: 'Unexpected Error',
      message:
        'An unknown error occurred. If the problem persists, please contact support.',
    });
  }
  return messages;
}

export function showErrorToast(error: NextSafeActionError) {
  console.log(error);

  if (error.serverError) {
    toast.error('Server Error', {
      description: error.serverError,
    });
  }

  if (error.validationErrors) {
    if (error.validationErrors.formErrors.length > 0) {
      error.validationErrors.formErrors.forEach((formError) => {
        toast.error('Form Error', {
          description: formError,
        });
      });
    }

    Object.entries(error.validationErrors.fieldErrors).forEach(
      ([field, errors]) => {
        if (errors && errors.length > 0) {
          toast.error(`Validation Error: ${field}`, {
            description: errors.join(', '),
          });
        }
      },
    );
  }

  if (!error.serverError && !error.validationErrors) {
    toast.error('An unexpected error occurred');
  }
}

type OnErrorArgs = {
  error: NextSafeActionError;
  input: unknown;
};

export function onError(args: OnErrorArgs) {
  showErrorToast(args.error);
}
