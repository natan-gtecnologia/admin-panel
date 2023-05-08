import type {
  CardBodyProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
} from 'reactstrap';
import {
  Card as CardDefault,
  CardBody as CardBodyDefault,
  CardFooter as CardFooterDefault,
  CardHeader as CardHeaderDefault,
} from 'reactstrap';

export function Card(props: CardProps) {
  return <CardDefault {...props} />;
}

const Body = (props: CardBodyProps) => {
  return <CardBodyDefault {...props} />;
};

const Header = (props: CardHeaderProps) => {
  return <CardHeaderDefault {...props} />;
};

const Footer = (props: CardFooterProps) => {
  return <CardFooterDefault {...props} />;
};

Card.displayName = 'Card';
Body.displayName = 'Card.Body';
Header.displayName = 'Card.Header';
Footer.displayName = 'Card.Footer';

Card.Body = Body;
Card.Header = Header;
Card.Footer = Footer;
