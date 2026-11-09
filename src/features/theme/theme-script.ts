import { NIGHT_MEDIA_QUERY, THEME_STORAGE_KEY } from './theme-store';

/**
 * Runs in <head> before the first paint so night-mode visitors never see a
 * flash of the day theme. Mirrors ThemeStore.getResolved().
 */
export const themeBootScript = `(function(){try{var p=localStorage.getItem('${THEME_STORAGE_KEY}');}catch(e){}if(p!=='day'&&p!=='night')p='auto';var n=p==='night'||(p==='auto'&&window.matchMedia('${NIGHT_MEDIA_QUERY}').matches);var d=document.documentElement;d.setAttribute('data-theme',n?'night':'day');d.setAttribute('data-theme-pref',p);})();`;
