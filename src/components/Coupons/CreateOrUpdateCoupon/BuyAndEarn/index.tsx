import { CouponCombinations } from '../../CouponCombinations';
import { CouponBuyAndEarn } from '../CouponBuyAndEarn';
import { CouponPeriod } from '../CouponPeriod';
import { Header } from '../Header';
import { MaxUse } from '../MaxUse';
import { MinRequests } from '../MinRequests';

interface Props {
  code: string;
}

export function BuyAndEarn({ code }: Props) {
  return (
    <>
      <Header title="Compre X e ganhe Y" code={code} />
      <CouponBuyAndEarn />

      <MinRequests />
      <MaxUse />
      <CouponCombinations />
      <CouponPeriod />
    </>
  );
}
