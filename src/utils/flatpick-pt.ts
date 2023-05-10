import type flatpickr from "flatpickr";
import type { DateTimePickerProps } from "react-flatpickr";

export const flatpickrPt: flatpickr.CustomLocale = {
  weekdays: {
    shorthand: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    longhand: [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ],
  },

  months: {
    shorthand: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    longhand: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
  },

  rangeSeparator: " até ",
  time_24hr: true,
};

export const flatPickrOptions: DateTimePickerProps["options"] = {
  enableTime: true,
  dateFormat: "d/m/Y H:i",
  time_24hr: true,
  locale: flatpickrPt,
  defaultHour: new Date().getHours(),
  defaultMinute: new Date().getMinutes(),
  maxTime: "23:59",
  mode: "single",
  hourIncrement: 1,
  onKeyDown: (_a, _b, self) => {
    if ((self.hourElement as any).valueAsNumber > 23) {
      (self.hourElement as any).value = "23";
    }

    if ((self.hourElement as any).valueAsNumber < 0) {
      (self.hourElement as any).value = "00";
    }

    if ((self.minuteElement as any).valueAsNumber > 59) {
      (self.minuteElement as any).value = "00";
    }

    if ((self.minuteElement as any).valueAsNumber < 0) {
      (self.minuteElement as any).value = "00";
    }

    if ((self.minuteElement as any).valueAsNumber % 5 !== 0) {
      (self.minuteElement as any).value = "00";
    }
  },
};
