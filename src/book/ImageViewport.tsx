import { useContext } from 'react';
import { ImageSizes } from './context';
import { BookImage } from './BookImage';

/** Coordinates in the original asset's pixels; the original file is never rewritten. */
export interface ImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface ImageViewportProps {
  src: string;
  alt: string;
  crop?: ImageCrop;
  mirrored?: boolean;
}
export function ImageViewport({ src, alt, crop, mirrored }: ImageViewportProps) {
  const size = useContext(ImageSizes)[src];
  if (crop && !size) throw Error(`Cannot crop an image without intrinsic dimensions: ${src}`);
  const style = {
    aspectRatio: crop ? `${crop.width} / ${crop.height}` : size ? `${size.width} / ${size.height}` : undefined,
  };
  return (
    <div className={`image-viewport${crop ? ' is-cropped' : ''}`} style={style} data-mirrored={mirrored || undefined}>
      <div className="image-pixels">
        <BookImage
          src={src}
          alt={alt}
          style={
            crop
              ? {
                  width: `${(size!.width / crop.width) * 100}%`,
                  left: `${(-crop.x / crop.width) * 100}%`,
                  top: `${(-crop.y / crop.height) * 100}%`,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
