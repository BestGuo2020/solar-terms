import { ref, computed, watchEffect, readonly } from 'vue';
import * as zh from '../data/terms.js';
import * as en from '../data/terms.en.js';
import { translate } from './messages.js';
import { formatDate, formatYear } from '../calendar.js';

export const LOCALE_KEY='suishi.locale';
export function chooseLocale(saved,languages=[]) {
  if(saved==='zh'||saved==='en')return saved;
  for(const language of languages){const base=language.toLowerCase().split('-')[0];if(base==='zh'||base==='en')return base;}
  return 'zh';
}
let saved;
try {saved=globalThis.localStorage?.getItem(LOCALE_KEY);} catch { /* Storage can be unavailable in private/file contexts. */ }
const locale=ref(chooseLocale(saved,globalThis.navigator?.languages??[]));
const content=computed(()=>locale.value==='en'?en:zh);
const seasons={'春':'spring','夏':'summer','秋':'autumn','冬':'winter'};
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function setLocale(value) {
  if(value!=='zh'&&value!=='en')return;
  locale.value=value;
  try {globalThis.localStorage?.setItem(LOCALE_KEY,value);} catch { /* Language switching still works without storage. */ }
}
export function useI18n() {
  const t=(key,params)=>translate(locale.value,key,params);
  return {locale:readonly(locale),isEnglish:computed(()=>locale.value==='en'),content,setLocale,t,
    term:id=>content.value.terms[id],
    season:code=>t(`season.${seasons[code]}`),
    month:index=>locale.value==='en'?months[index-1]:String(index),
    date:(ms,seconds=false)=>formatDate(ms,seconds,locale.value),
    year:value=>formatYear(value,locale.value),
    qualityLabel:state=>t(`quality.${state.quality}.label`),
    qualityMessage:state=>t(`quality.${state.quality==='unavailable'?state.reason:state.quality}.message`),
  };
}
export function installDocumentLocale() {
  return watchEffect(()=>{
    document.documentElement.lang=locale.value==='en'?'en':'zh-CN';
    document.title=translate(locale.value,'meta.title');
    document.querySelector('meta[name="description"]')?.setAttribute('content',translate(locale.value,'meta.description'));
  });
}
