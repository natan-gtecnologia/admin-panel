import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import Dropzone from 'react-dropzone';
import {
    Col,
    Label,
    Row,
} from 'reactstrap';
import { IStrapiImage } from '../../..//@types/strapi';
import Link from 'next/link';

interface DesktopImageProps {
    uploadImages: Function;
    desktopImage: IStrapiImage;
    uploadImagesPreview: {
        preview: string;
        formattedSize: string;
        name: string;
    }[];
    uploadProgress: number;
    formatBytes: Function;
}

export function DesktopImage({ uploadImages, desktopImage, uploadImagesPreview, uploadProgress, formatBytes }: DesktopImageProps) {
    return (
        <div>
            <Label className="form-label mb-1 fs-5" htmlFor="desktop_image_id">
                Versão desktop
            </Label>
            <Dropzone
                onDropAccepted={(files: File[]) => {
                    uploadImages({ imagesToAdd: files, name: 'desktop_image_id' });
                }}
                maxSize={5000000}
                accept={['image/jpeg', 'image/png', 'image/webp']}
            >
                {({ getRootProps }) => (
                    <div className="dropzone dz-clickable  d-flex align-items-center justify-content-center">
                        <div className="dz-message needsclick" {...getRootProps()}>
                            <div className="mb-3">
                                <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                            </div>
                            <h4 className="mb-0">
                                Solte os arquivos aqui ou clique para fazer o upload.
                            </h4>
                        </div>
                    </div>
                )}
            </Dropzone>

            <Row
                className="list-unstyled mb-0"
                id="file-previews"
            >

                {desktopImage && uploadImagesPreview.length === 0 && (
                    <Col lg={12} key={`${desktopImage.attributes.name}-from-edit-image`}>
                        <Card className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete">
                            <div className="p-2">
                                <Row className="align-items-center">
                                    <Col className="col-auto">
                                        <CircularProgressbarWithChildren
                                            value={uploadProgress}
                                            background
                                            backgroundPadding={6}
                                            className="avatar-sm"
                                            minValue={0}
                                            maxValue={100}
                                            styles={{
                                                path: {
                                                    stroke: '#4b38b3',
                                                },
                                            }}
                                            strokeWidth={10}
                                        >
                                            <img
                                                data-dz-thumbnail=""
                                                height="80"
                                                className="avatar-sm rounded bg-light"
                                                alt={desktopImage.attributes?.name}
                                                src={desktopImage.attributes?.formats.thumbnail.url}
                                                style={{
                                                    zIndex: 0,
                                                    position: 'absolute',
                                                }}
                                            />
                                        </CircularProgressbarWithChildren>
                                    </Col>
                                    <Col>
                                        <Link href="#" className="text-muted font-weight-bold">
                                            {desktopImage.attributes.name}
                                        </Link>
                                        <p className="mb-0">
                                            <strong>
                                                {formatBytes(desktopImage.attributes.size * 1000)}
                                            </strong>
                                        </p>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                    </Col>
                )}


                {uploadImagesPreview.map((image) => (
                    <Col lg={12} key={`${image.name}-from-edit-image`}>
                        <Card className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete">
                            <div className="p-2">
                                <Row className="align-items-center">
                                    <Col className="col-auto">
                                        <CircularProgressbarWithChildren
                                            value={uploadProgress}
                                            background
                                            backgroundPadding={6}
                                            className="avatar-sm"
                                            minValue={0}
                                            maxValue={100}
                                            styles={{
                                                path: {
                                                    stroke: '#4b38b3',
                                                },
                                            }}
                                            strokeWidth={10}
                                        >
                                            <img
                                                data-dz-thumbnail=""
                                                height="80"
                                                className="avatar-sm rounded bg-light"
                                                alt={image.name}
                                                src={image.preview}
                                                style={{
                                                    zIndex: 0,
                                                    position: 'absolute',
                                                }}
                                            />
                                        </CircularProgressbarWithChildren>
                                    </Col>
                                    <Col>
                                        <Link href="#" className="text-muted font-weight-bold">
                                            {image.name}
                                        </Link>
                                        <p className="mb-0">
                                            <strong>{image.formattedSize}</strong>
                                        </p>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    )
}