import { forwardRef, ForwardRefRenderFunction } from 'react';
import {
  FormFeedback,
  Input as ReactstrapInput,
  InputProps as ReactstrapInputProps,
} from 'reactstrap';

export type InputProps = ReactstrapInputProps & {
  error?: string;
};

const InputBase: ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  { invalid, error, ...props },
  ref,
) => {
  return (
    <>
      <ReactstrapInput invalid={invalid} innerRef={ref} {...props} />
      {error ? <FormFeedback type="invalid">{error}</FormFeedback> : null}
    </>
  );
};

export const Input = forwardRef<HTMLInputElement, InputProps>(InputBase);
