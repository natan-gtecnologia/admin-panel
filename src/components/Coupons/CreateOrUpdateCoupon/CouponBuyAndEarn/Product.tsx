import clsx from 'clsx';
import Image from 'next/image';
import { Button } from 'reactstrap';
import { IProduct } from '../../../../@types/product';

type Props = {
  borderSize?: number;
  product: IProduct;
  onRemove: () => void;
};

export function Product({ borderSize = 0, onRemove, product }: Props) {
  return (
    <div
      className={clsx(
        `p-3 d-flex align-items-center justify-content-between gap-1`,
        {
          [`border-top border-${borderSize}`]: borderSize,
        }
      )}
    >
      <div className="d-flex align-items-center gap-3">
        {product?.images && product.images.data.length > 0 && (
          <Image
            src={product.images.data[0].attributes.formats.thumbnail.url}
            alt=""
            className="rounded overflow-hidden"
            width={40}
            height={40}
          />
        )}

        {!product?.images && (
          <div
            className="rounded overflow-hidden bg-light"
            style={{
              width: 40,
              height: 40,
            }}
          />
        )}

        <h6 className="m-0 fw-normal">
          {product?.title ?? 'Produto não encontrado'}
        </h6>
      </div>

      <Button
        className="shadow-none"
        color="transparent"
        style={{
          lineHeight: 1,
          fontSize: 16,
        }}
        close
        onClick={onRemove}
      />
    </div>
  );
}
