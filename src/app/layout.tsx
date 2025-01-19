import { roboto } from './fonts'

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>My App</title>
      </head>
      <body className={roboto.className}>
        {children}
      </body>
    </html>
  )
}



import './globals.css'