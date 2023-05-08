import { formatDistance, Locale } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';

type TimeUpdatedProps = {
  time: Date;
  locale?: Locale;

  updateIntervalSeconds?: number;
};

function getDistance(time: Date, locale: Locale) {
  return formatDistance(time, new Date(), {
    locale: locale,
    addSuffix: true,
    includeSeconds: true,
  });
}

let timer: NodeJS.Timeout;

export function TimeUpdated({
  time,
  locale = ptBR,
  updateIntervalSeconds = 1,
}: TimeUpdatedProps) {
  const [timeFormatted] = useState(getDistance(time, locale));

  //useEffect(() => {
  //  timer = setInterval(() => {
  //    setTimeFormatted(getDistance(time, locale));
  //  }, updateIntervalSeconds * 1000);

  //  return () => {
  //    clearInterval(timer);
  //  };
  //}, [locale, time, updateIntervalSeconds]);

  return <>{timeFormatted}</>;
}
