declare module 'react-to-print' {
  import { ReactNode } from 'react';
  
  export interface UseReactToPrintOptions {
    content: () => HTMLElement | null;
    documentTitle?: string;
    onBeforeGetContent?: () => Promise<void> | void;
    onBeforePrint?: () => Promise<void> | void;
    onAfterPrint?: () => void;
    removeAfterPrint?: boolean;
    suppressErrors?: boolean;
    pageStyle?: string;
  }

  export type UseReactToPrintHookContent = () => HTMLElement | null;
  export type UseReactToPrintFn = () => void;

  export function useReactToPrint(options: UseReactToPrintOptions): UseReactToPrintFn;

  export interface ReactToPrintProps {
    trigger?: () => ReactNode;
    content: () => HTMLElement | null;
    documentTitle?: string;
    onBeforeGetContent?: () => Promise<void> | void;
    onBeforePrint?: () => Promise<void> | void;
    onAfterPrint?: () => void;
    removeAfterPrint?: boolean;
    suppressErrors?: boolean;
    pageStyle?: string;
    copyStyles?: boolean;
  }

  export default function ReactToPrint(props: ReactToPrintProps): JSX.Element;
}