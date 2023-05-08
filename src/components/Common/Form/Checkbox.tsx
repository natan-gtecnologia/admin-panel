import clsx from 'clsx';
import { ReactNode, useState } from 'react';
import { Input, Label } from 'reactstrap';

type CheckboxProps = {
  children: ReactNode;
  checked?: boolean;
  onCheckChange?: (value: boolean) => void;
  className?: string;
  disabled?: boolean;
  id: string;
};

export function Checkbox({
  checked,
  children,
  onCheckChange,
  className,
  disabled,
  id,
}: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div
      className={clsx('form-check', {
        className,
      })}
    >
      <Input
        className="form-check-input"
        type="checkbox"
        id={id}
        checked={
          checked !== undefined && checked !== null ? checked : isChecked
        }
        disabled={disabled}
        onChange={(e) => {
          onCheckChange && onCheckChange(e.target.checked);
          setIsChecked(e.target.checked);
        }}
      />
      <Label className="form-check-label" htmlFor={id}>
        {children}
      </Label>
    </div>
  );
}
