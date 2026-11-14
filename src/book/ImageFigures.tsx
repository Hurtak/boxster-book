import { Children, isValidElement, type ReactNode } from 'react';
import { FigureFrame } from './Figure';
import { ImageViewport, type ImageViewportProps } from './ImageViewport';

export interface ImageAnnotation {
  id: string;
  label: string;
  /** Percentages of the displayed image (after cropping), not screen pixels. */
  x?: number;
  y?: number;
}
function ImageMarkers({ annotations }: { annotations: ImageAnnotation[] }) {
  return annotations
    .filter((a) => a.x !== undefined && a.y !== undefined)
    .map((a) => (
      <span
        className="image-marker"
        key={a.id}
        title={a.label}
        aria-hidden="true"
        style={{ left: `${a.x}%`, top: `${a.y}%` }}
      >
        {a.id}
      </span>
    ));
}
export function AnnotatedFigure({
  title,
  annotations,
  className,
  children,
  ...image
}: ImageViewportProps & { title: string; annotations: ImageAnnotation[]; className?: string; children?: ReactNode }) {
  const media = (
    <div className="image-plate">
      <p className="image-plate-title">{title}</p>
      <div className="annotated-image">
        <ImageViewport {...image} />
        <ImageMarkers annotations={annotations} />
      </div>
      <ul className="image-key" aria-label="Image annotations">
        {annotations.map((a) => (
          <li key={a.id}>
            <span className="image-key-number">{a.id}</span>
            {a.label}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <FigureFrame alt={image.alt} className={`annotated-figure${className ? ` ${className}` : ''}`} media={media}>
      {children}
    </FigureFrame>
  );
}
export function ComparisonImage({
  label,
  note,
  annotations,
  ...image
}: ImageViewportProps & { label: string; note: string; annotations?: ImageAnnotation[] }) {
  return (
    <div className="comparison-image">
      <p className="comparison-image-label">{label}</p>
      {annotations ? (
        <div className="annotated-image">
          <ImageViewport {...image} />
          <ImageMarkers annotations={annotations} />
        </div>
      ) : (
        <ImageViewport {...image} />
      )}
      <p className="comparison-image-note">{note}</p>
    </div>
  );
}
export function ImageComparison({
  title,
  alt,
  children,
  stackOnPhone = false,
}: {
  title: string;
  alt: string;
  children?: ReactNode;
  stackOnPhone?: boolean;
}) {
  const content = Children.toArray(children);
  const isImage = (child: ReactNode) => isValidElement(child) && child.type === ComparisonImage;
  const images = content.filter(isImage);
  const caption = content.filter((child) => !isImage(child));
  const media = (
    <div className="image-plate">
      <p className="image-plate-title">{title}</p>
      <div className="image-comparison-grid">{images}</div>
    </div>
  );
  return (
    <FigureFrame alt={alt} className={`image-comparison${stackOnPhone ? ' is-stacked-on-phone' : ''}`} media={media}>
      {caption}
    </FigureFrame>
  );
}
