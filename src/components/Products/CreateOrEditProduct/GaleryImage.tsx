/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import type { Identifier, XYCoord } from 'dnd-core';
import truncate from 'lodash/truncate';
import Link from 'next/link';
import { useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useFormContext } from 'react-hook-form';
import { Button, Col, Row } from 'reactstrap';
import { ConfirmationModal } from '../../ConfirmationModal';
import { CreateOrEditProductSchemaProps } from './schema';

type GaleryImageProps = {
  name: string;
  url: string;
  size: string;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  index: number;
  id: number;
};

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export function GaleryImage({
  name,
  size,
  url,
  moveCard,
  index,
  id,
}: GaleryImageProps) {
  const { watch, setValue } = useFormContext<CreateOrEditProductSchemaProps>();
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: 'card',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });
  const product_images = watch('images');

  const [{ isDragging }, drag] = useDrag({
    type: 'card',
    item: () => {
      return { id, index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  const removeImage = useCallback(() => {
    const newImages = product_images.filter((image) => image !== id);
    setValue('images', newImages);
  }, [id, product_images, setValue]);

  return (
    <div
      className="col-lg-6"
      style={{
        opacity,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      data-handler-id={handlerId}
      ref={ref}
    >
      <Card className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete">
        <div className="p-2">
          <Row className="align-items-center">
            <Col className="col-auto">
              <img
                data-dz-thumbnail=""
                height="80"
                className="avatar-sm rounded bg-light"
                alt={name}
                src={url}
              />
            </Col>
            <Col>
              <Row className="align-items-center">
                <Col>
                  <Link
                    href="#"
                    title={name}
                    className="text-muted font-weight-bold"
                  >
                    {truncate(name, {
                      length: 30,
                    })}
                  </Link>
                  <p className="mb-0">
                    <strong>{size}</strong>
                  </p>
                </Col>
                <Col className="col-auto">
                  <ConfirmationModal
                    changeStatus={removeImage}
                    title="Remover Imagem"
                    message="Tem certeza que deseja remover esta imagem?"
                  >
                    <Button close />
                  </ConfirmationModal>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
}
