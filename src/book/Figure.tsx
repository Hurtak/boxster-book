import { Children, isValidElement, type ReactNode } from 'react';
import { BookImage } from './BookImage';
export { BookImage } from './BookImage';
import { ImageViewport, type ImageCrop } from './ImageViewport';

export interface FigureProps {
  src: string;
  alt: string;
  children?: ReactNode;
  width?: string | number;
  className?: string;
  hidden?: boolean;
  crop?: ImageCrop;
  mirrored?: boolean;
}
export function Figure({ src, alt, children, width, className, hidden, crop, mirrored }: FigureProps) {
  const numericWidth = width && !String(width).endsWith('%') ? parseFloat(String(width)) : undefined;
  const image =
    crop || mirrored ? (
      <ImageViewport src={src} alt={alt} crop={crop} mirrored={mirrored} />
    ) : (
      <BookImage
        src={src}
        alt={alt}
        width={numericWidth || undefined}
        style={String(width).endsWith('%') ? { width: String(width) } : undefined}
      />
    );
  return (
    <FigureFrame alt={alt} className={className} hidden={hidden} media={image}>
      {children}
    </FigureFrame>
  );
}

export function FigureFrame({
  alt,
  children,
  className,
  hidden,
  media,
}: {
  alt: string;
  children?: ReactNode;
  className?: string;
  hidden?: boolean;
  media: ReactNode;
}) {
  const caption = Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === 'p'
      ? Children.toArray(child.props.children)
      : [child],
  );
  return (
    <figure className={className} hidden={hidden} aria-label={alt}>
      {media}
      {caption.length > 0 && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
