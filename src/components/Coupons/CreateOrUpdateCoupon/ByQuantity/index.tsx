import { CouponPeriod } from '../CouponPeriod';
import { CouponRules } from '../CouponRules';
import { Header } from '../Header';
import { MaxUse } from '../MaxUse';
import { MinRequests } from '../MinRequests';
import { ValueCard } from '../ValueCard';

interface Props {
  code: string;
}

export function ByQuantity({ code }: Props) {
  return (
    <>
      <Header title="Quantidade de produtos" code={code} />

      <ValueCard />
      <MinRequests />
      <MaxUse />
      <CouponRules />
      <CouponPeriod />
    </>
  );
}
