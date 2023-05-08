import IMask from 'imask';
import { ChangeEvent } from 'react';

const masker = <TTransform, TMaskDefault>({
  masked,
  transform,
  maskDefault,
  onChange,
}: {
  masked: any;
  transform?: TTransform;
  maskDefault?: TMaskDefault;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}) =>
  (function () {
    const mask = IMask.createPipe(
      masked,
      IMask.PIPE_TYPE.UNMASKED,
      IMask.PIPE_TYPE.MASKED,
    );

    const unmask = IMask.createPipe(
      masked,
      IMask.PIPE_TYPE.MASKED,
      IMask.PIPE_TYPE.UNMASKED,
    );

    const internalOnChange = (e: ChangeEvent<HTMLInputElement>) => {
      const unmasked = unmask(e.target.value);
      const newValue = mask(unmasked);
      e.target.value = newValue;
    };

    return {
      mask,
      onChange: onChange || internalOnChange,
      transform: transform || unmask,
      unmask,
      maskDefault: maskDefault || mask,
    };
  })();

export const cpfMask = masker({
  masked: {
    mask: [
      {
        mask: '000.000.000-00',
        type: 'CPF',
      },
    ],
    dispatch: (appended: any, dynamicMasked: any) => {
      const cpfMask = dynamicMasked.compiledMasks.find(
        ({ type }: any) => type === 'CPF',
      );

      return cpfMask;
    },
  },
});

export const cnpjMask = masker({
  masked: {
    mask: [
      {
        mask: '00.000.000/0000-00',
        type: 'CNPJ',
      },
    ],
    dispatch: (appended: any, dynamicMasked: any) => {
      const cnpjMask = dynamicMasked.compiledMasks.find(
        ({ type }: any) => type === 'CNPJ',
      );

      return cnpjMask;
    },
  },
});

export const phoneMask = masker({
  masked: {
    mask: [
      {
        mask: '(00) 0 0000-0000',
        phone: 'mobile',
      },
    ],
    dispatch: (appended: any, dynamicMasked: any) => {
      const mobileMask = dynamicMasked.compiledMasks.find(
        ({ phone }: any) => phone === 'mobile',
      );

      return mobileMask;
    },
  },
});

export const currencyMask = masker({
  masked: {
    mask: 'num{,}cents',
    blocks: {
      num: {
        mask: Number,
        signed: true,
        thousandsSeparator: '.',
        mapToRadix: [''],
        scale: 0,
      },
      cents: {
        mask: '00',
        normalizeZeros: true,
        padFractionalZeros: true,
      },
    },
  },
  transform: (value: string): number => {
    return Number(currencyMask.unmask(value).replace(',', '.'));
  },
  maskDefault: (value: number): string => {
    return currencyMask.mask(value.toFixed(2).replace('.', ','));
  },
});

export const notNumberMask = masker({
  masked: {
    mask: [
      {
        mask: '########################################################################',
        // regex: '^([^0-9]*)$',
        type: 'CPF',
        definitions: {
          // <any single char>: <same type as mask (RegExp, Function, etc.)>
          // defaults are '0', 'a', '*'
          '#': /^([^0-9]*)$/g,
        },
      },
    ],
    dispatch: (appended: any, dynamicMasked: any) => {
      const cpfMask = dynamicMasked.compiledMasks.find(
        ({ type }: any) => type === 'CPF',
      );

      return cpfMask;
    },
  },
});

export const creditCardMask = masker({
  masked: {
    mask: [
      {
        mask: '0000 000000 00000',
        regex: '^3[47]\\d{0,13}',
        cardtype: 'american express',
      },
      {
        mask: '0000 0000 0000 0000',
        regex: '^(?:6011|65\\d{0,2}|64[4-9]\\d?)\\d{0,12}',
        cardtype: 'discover',
      },
      {
        mask: '0000 000000 0000',
        regex: '^3(?:0([0-5]|9)|[689]\\d?)\\d{0,11}',
        cardtype: 'diners',
      },
      {
        mask: '0000 0000 0000 0000',
        regex: '^(5[1-5]\\d{0,2}|22[2-9]\\d{0,1}|2[3-7]\\d{0,2})\\d{0,12}',
        cardtype: 'mastercard',
      },
      {
        mask: '0000 000000 00000',
        regex: '^(?:2131|1800)\\d{0,11}',
        cardtype: 'jcb15',
      },
      {
        mask: '0000 0000 0000 0000',
        regex: '^(?:35\\d{0,2})\\d{0,12}',
        cardtype: 'jcb',
      },
      {
        mask: '0000 0000 0000 0000',
        regex: '^(?:5[0678]\\d{0,2}|6304|67\\d{0,2})\\d{0,12}',
        cardtype: 'maestro',
      },
      {
        mask: '0000 0000 0000 0000',
        regex: '^4\\d{0,15}',
        cardtype: 'visa',
      },
      {
        mask: '0000 0000 0000 0000',
        regex: '^62\\d{0,14}',
        cardtype: 'unionpay',
      },
      {
        mask: '0000 0000 0000 0000',
        cardtype: 'Unknown',
      },
    ],
    dispatch: function (appended: any, dynamicMasked: any) {
      const number = (dynamicMasked.value + appended).replace(/\D/g, '');

      for (let i = 0; i < dynamicMasked.compiledMasks.length; i++) {
        const re = new RegExp(dynamicMasked.compiledMasks[i].regex);
        if (number.match(re) != null) {
          return dynamicMasked.compiledMasks[i];
        }
      }
    },
  },
});

export const expirationDateMask = masker({
  masked: {
    mask: 'MM/YY',
    blocks: {
      MM: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 12,
      },
      YY: {
        mask: '00',
      },
    },
  },
});

export const cvvMask = masker({
  masked: {
    mask: [
      {
        mask: '000',
        phone: 'three',
      },
    ],
    dispatch: (appended: any, dynamicMasked: any) => {
      const threeMask = dynamicMasked.compiledMasks.find(
        ({ phone }: any) => phone === 'three',
      );

      return threeMask;
    },
  },
});

export const cepMask = masker({
  masked: {
    mask: [
      {
        mask: '00000-000',
      },
    ],
  },
});

export const dateMask = masker({
  masked: {
    mask: 'DD/MM/YYYY',
    blocks: {
      DD: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 31,
      },
      MM: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 12,
      },
      YYYY: {
        mask: '0000',
      },
    },
  },
});
