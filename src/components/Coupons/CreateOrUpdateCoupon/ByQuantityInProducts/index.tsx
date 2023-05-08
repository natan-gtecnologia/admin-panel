import { CouponCombinations } from '../../CouponCombinations';
import { CouponPeriod } from '../CouponPeriod';
import { Header } from '../Header';
import { MaxUse } from '../MaxUse';
import { MinRequests } from '../MinRequests';
import { ValueCard } from '../ValueCard';

interface Props {
  code: string;
}

export function ByQuantityInProducts({ code }: Props) {
  return (
    <>
      <Header title="Quantidade de produtos" code={code} />

      <ValueCard />
      <MinRequests />
      <MaxUse />
      <CouponCombinations />
      <CouponPeriod />
    </>
  );
}
