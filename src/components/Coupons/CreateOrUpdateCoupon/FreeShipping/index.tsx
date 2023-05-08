import { CouponCombinations } from '../../CouponCombinations';
import { CouponPeriod } from '../CouponPeriod';
import { CouponRegions } from '../CouponRegions';
import { Header } from '../Header';
import { MaxUse } from '../MaxUse';
import { MinRequests } from '../MinRequests';

interface Props {
  code: string;
}

export function FreeShipping({ code }: Props) {
  return (
    <>
      <Header
        title="Frete grátis"
        description="Desconto de frete"
        code={code}
      />
      <CouponRegions />
      <MinRequests />
      <MaxUse />
      <CouponCombinations />
      <CouponPeriod />
    </>
  );
}
