import { forwardRef, type ForwardRefRenderFunction } from "react";
import {
  FormFeedback,
  Input as ReactstrapInput,
  InputProps as ReactstrapInputProps,
} from "reactstrap";

export type InputProps = ReactstrapInputProps & {
  error?: string;
  prefix?: string;
  suffix?: string;
};

const InputBase: ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  { invalid, error, prefix, suffix, ...props },
  ref
) => {
  return (
    <>
      {(prefix || suffix) && (
        <div className="input-group">
          {prefix && <span className="input-group-text">{prefix}</span>}
          <ReactstrapInput invalid={invalid} innerRef={ref} {...props} />
          {suffix && <span className="input-group-text">{suffix}</span>}
        </div>
      )}
      {!prefix && !suffix && (
        <ReactstrapInput invalid={invalid} innerRef={ref} {...props} />
      )}
      {error ? (
        <FormFeedback type="invalid" className="d-block">
          {error}
        </FormFeedback>
      ) : null}
    </>
  );
};

export const Input = forwardRef<HTMLInputElement, InputProps>(InputBase);
