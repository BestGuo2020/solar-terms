import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import { installDocumentLocale } from './i18n/index.js';

const stopLocale=installDocumentLocale();
createApp(App).mount('#app');
if(import.meta.hot)import.meta.hot.dispose(()=>stopLocale());
