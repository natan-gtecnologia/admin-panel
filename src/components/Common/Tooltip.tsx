import { cloneElement, useId, type ReactElement } from "react";
import { UncontrolledTooltip, type UncontrolledTooltipProps } from "reactstrap";

interface Props
  extends Omit<UncontrolledTooltipProps, "children" | "target" | "toggle"> {
  children: ReactElement;
  message: string;
}

export function Tooltip({ children, message, ...args }: Props) {
  const id = useId().replaceAll(":", "");

  return (
    <>
      {cloneElement(children, {
        id,
      })}
      <UncontrolledTooltip target={id} {...args}>
        {message}
      </UncontrolledTooltip>
    </>
  );
}
