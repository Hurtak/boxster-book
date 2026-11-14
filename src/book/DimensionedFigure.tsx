import { useContext, type ReactNode } from 'react';
import { ImageSizes } from './context';
import { FigureFrame } from './Figure';
import { ImageViewport, type ImageViewportProps } from './ImageViewport';

type Point = [number, number];
export interface PhotoDimension {
  label: string;
  axis: 'horizontal' | 'vertical';
  /** Points in displayed source-image pixels, before responsive scaling. */
  from: Point;
  to: Point;
  at: number;
  labelAt: Point;
}
export function DimensionedFigure({
  title,
  dimensions,
  inset,
  children,
  ...image
}: ImageViewportProps & {
  title: string;
  dimensions: PhotoDimension[];
  inset: { top: number; right: number; bottom: number; left: number };
  children?: ReactNode;
}) {
  const original = useContext(ImageSizes)[image.src];
  const size = image.crop ?? original;
  if (!size) throw Error(`Dimensions overlay needs image dimensions: ${image.src}`);
  const width = size.width + inset.left + inset.right;
  const height = size.height + inset.top + inset.bottom;
  const position = ([x, y]: Point) => ({
    left: `${((x + inset.left) / width) * 100}%`,
    top: `${((y + inset.top) / height) * 100}%`,
  });
  const paths = dimensions.map(({ axis, from: [x1, y1], to: [x2, y2], at }) =>
    axis === 'horizontal'
      ? `M${x1} ${y1}V${at} M${x2} ${y2}V${at} M${x1} ${at}H${x2}`
      : `M${x1} ${y1}H${at} M${x2} ${y2}H${at} M${at} ${y1}V${y2}`,
  );
  const media = (
    <div className="image-plate dimension-plate">
      <p className="image-plate-title">{title}</p>
      <div
        className="dimension-canvas"
        style={{ aspectRatio: `${width} / ${height}`, maxWidth: width, marginInline: 'auto' }}
      >
        <div className="dimension-photograph" style={{ ...position([0, 0]), width: `${(size.width / width) * 100}%` }}>
          <ImageViewport {...image} />
        </div>
        <svg viewBox={`${-inset.left} ${-inset.top} ${width} ${height}`} aria-hidden="true">
          {dimensions.map((d, i) => (
            <g key={d.label}>
              <path className="dimension-halo" d={paths[i]} />
              <path d={paths[i]} />
            </g>
          ))}
        </svg>
        {dimensions.map((d) => (
          <span key={d.label} className="dimension-label" style={position(d.labelAt)}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
  return (
    <FigureFrame alt={image.alt} className="dimension-figure" media={media}>
      {children}
    </FigureFrame>
  );
}
