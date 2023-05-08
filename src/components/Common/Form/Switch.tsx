import clsx from 'clsx';
import { ReactNode } from 'react';
import { Input, Label } from 'reactstrap';

export type SwitchProps = {
  checked: boolean;
  id: string;
  onCheck?: (checked: boolean) => void;
  children: ReactNode;

  className?: string;
};

export function Switch({
  checked,
  children,
  id,
  onCheck,
  className = '',
}: SwitchProps) {
  return (
    <div
      className={clsx(
        'form-check form-switch form-switch-secondary',
        className
      )}
    >
      <Input
        className="form-check-input"
        type="checkbox"
        role="switch"
        id={id}
        onChange={(e) => onCheck && onCheck(e.target.checked)}
        checked={checked}
      />
      <Label className="form-check-label" for={id}>
        {children}
      </Label>
    </div>
  );
}
