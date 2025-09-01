import type { AppProps } from 'next/app';
import GlobalFooter from '../components/GlobalFooter';
import '../styles/globals.css';
export default function MyApp({ Component, pageProps }: AppProps){
  return (<>
    <Component {...pageProps} />
    <GlobalFooter />
  </>);
}
