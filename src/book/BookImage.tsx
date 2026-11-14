import { useContext, type CSSProperties } from 'react';
import { ImageSizes, useAsset } from './context';

export function BookImage({
  src,
  alt,
  width,
  style,
}: {
  src: string;
  alt: string;
  width?: number;
  style?: CSSProperties;
}) {
  const resolved = useAsset(src);
  const size = useContext(ImageSizes)[src];
  const imageWidth = width ?? size?.width;
  const height = size && imageWidth ? (imageWidth * size.height) / size.width : undefined;
  return (
    <img
      src={resolved}
      data-book-asset={src.startsWith('book-asset:') ? src : undefined}
      alt={alt}
      width={imageWidth}
      height={height}
      style={style}
    />
  );
}
