// Type declarations for react-email components to work with React 19
declare module '@react-email/components' {
  import type { CSSProperties, ReactNode } from 'react';

  export interface HtmlProps {
    children?: ReactNode;
    lang?: string;
    dir?: 'ltr' | 'rtl';
  }
  export const Html: React.FC<HtmlProps>;

  export const Head: React.FC<{ children?: ReactNode }>;

  export interface PreviewProps {
    children?: ReactNode;
  }
  export const Preview: React.FC<PreviewProps>;

  export interface BodyProps {
    children?: ReactNode;
    style?: CSSProperties;
  }
  export const Body: React.FC<BodyProps>;

  export interface ContainerProps {
    children?: ReactNode;
    style?: CSSProperties;
  }
  export const Container: React.FC<ContainerProps>;

  export interface SectionProps {
    children?: ReactNode;
    style?: CSSProperties;
  }
  export const Section: React.FC<SectionProps>;

  export interface TextProps {
    children?: ReactNode;
    style?: CSSProperties;
  }
  export const Text: React.FC<TextProps>;

  export interface HeadingProps {
    children?: ReactNode;
    style?: CSSProperties;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  }
  export const Heading: React.FC<HeadingProps>;

  export interface RowProps {
    children?: ReactNode;
    style?: CSSProperties;
  }
  export const Row: React.FC<RowProps>;

  export interface ColumnProps {
    children?: ReactNode;
    style?: CSSProperties;
    align?: 'left' | 'right' | 'center';
  }
  export const Column: React.FC<ColumnProps>;

  export interface ImgProps {
    src?: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
    style?: CSSProperties;
  }
  export const Img: React.FC<ImgProps>;

  export interface HrProps {
    style?: CSSProperties;
  }
  export const Hr: React.FC<HrProps>;
}
