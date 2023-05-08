import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { Fragment, ReactNode } from 'react';

type LinkProps = Omit<NextLinkProps, 'children'> & {
  children: ReactNode;
  className?: string;
  id?: string;
};

export default function Link({ children, ...props }: LinkProps) {
  return (
    <NextLink {...props}>
      <Fragment>{children}</Fragment>
    </NextLink>
  );
}
