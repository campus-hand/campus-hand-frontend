import localFont from 'next/font/local';

/*
 * Fonts are self-hosted from @fontsource-variable packages, so builds never
 * depend on reaching Google Fonts (CI, Vercel and slow connections alike).
 * Archivo: body text. Big Shoulders: the uppercase display face on signs.
 */
export const archivo = localFont({
  src: '../../node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2',
  variable: '--font-archivo',
  weight: '100 900',
  display: 'swap',
});

export const bigShoulders = localFont({
  src: '../../node_modules/@fontsource-variable/big-shoulders/files/big-shoulders-latin-wght-normal.woff2',
  variable: '--font-big-shoulders',
  weight: '100 900',
  display: 'swap',
  fallback: ['Archivo Narrow', 'Arial Narrow', 'sans-serif'],
});
