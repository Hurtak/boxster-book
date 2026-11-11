import { Children, isValidElement, useContext, type ReactNode, type CSSProperties } from 'react';
import { useAsset, ImageSizes } from './context';

export interface FigureProps {
  src: string; alt: string; children?: ReactNode; width?: string | number;
  className?: string; hidden?: boolean;
}
export function BookImage({src,alt,width,style}: {src:string;alt:string;width?:number;style?:CSSProperties}) {
  const resolved = useAsset(src);
  const size=useContext(ImageSizes)[src];
  const imageWidth=width??size?.width;
  const height=size&&imageWidth?imageWidth*size.height/size.width:undefined;
  return <img src={resolved} data-book-asset={src.startsWith('book-asset:') ? src : undefined} alt={alt} width={imageWidth} height={height} style={style} />;
}
export function Figure({src,alt,children,width,className,hidden}: FigureProps) {
  const caption = Children.toArray(children).flatMap(child => isValidElement<{children?:ReactNode}>(child) && child.type === 'p' ? Children.toArray(child.props.children) : [child]);
  const numericWidth = width && !String(width).endsWith('%') ? parseFloat(String(width)) : undefined;
  return <figure className={className} hidden={hidden}>
    <BookImage src={src} alt={alt} width={numericWidth || undefined} style={String(width).endsWith('%') ? {width:String(width)} : undefined}/>
    {caption.length > 0 && <figcaption>{caption}</figcaption>}
  </figure>;
}
