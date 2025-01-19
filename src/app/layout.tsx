import { ReactNode } from 'react';
import { roboto } from './fonts';

interface AppProps {
  children: ReactNode;
}

export default function App({ children }: AppProps) {
  return (
    <html lang="en">
      <head />
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
