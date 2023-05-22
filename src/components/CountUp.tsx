import differenceInSeconds from "date-fns/differenceInSeconds";
import { useEffect, useState } from "react";

interface Props {
  startDate: Date;
}

let interval: NodeJS.Timeout;
export function CountUp({ startDate }: Props) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    interval = setInterval(() => {
      const secondsPassed = differenceInSeconds(
        new Date(),
        startDate
      )
      
      setTime(secondsPassed);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [startDate]);  
  
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor((time % 3600) % 60);

  return <>
    {hours.toString().padStart(2, "0")}:
    {minutes.toString().padStart(2, "0")}:
    {seconds.toString().padStart(2, "0")}
  </>;
}