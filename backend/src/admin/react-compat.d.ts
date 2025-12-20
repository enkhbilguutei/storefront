/// <reference types="react" />

// Fix for React 18/19 type compatibility issues with Medusa UI components
declare module 'react' {
  namespace React {
    // Ensure ReactNode includes bigint for React 19 compatibility
    type ReactNode =
      | ReactElement
      | string
      | number
      | bigint
      | Iterable<ReactNode>
      | ReactPortal
      | boolean
      | null
      | undefined;
  }
}

export {};
