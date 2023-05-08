import clsx from 'clsx';
import { FormFeedback, Input } from 'reactstrap';

export type InputStepProps = {
  error?: string;
  inputStepClass?: string;
  name?: string;
  id?: string;
  value: number;
  min: number;
  max: number;
  onChange?: (newValue: number) => void;
};

export const InputStep = ({
  error,
  onChange,
  value,
  min,
  max,
  name,
  id,
  inputStepClass,
  ...props
}: InputStepProps) => {
  return (
    <div>
      <div className={clsx('input-step', inputStepClass)}>
        <button type="button" className="minus" onClick={console.log}>
          -
        </button>
        <Input
          name={name}
          id={id}
          type="number"
          readOnly
          defaultValue={value}
          min={min}
          max={max}
          {...props}
        />
        <button type="button" className="plus" onClick={console.log}>
          +
        </button>
      </div>
      {error ? <FormFeedback type="invalid">{error}</FormFeedback> : null}
    </div>
  );
};
