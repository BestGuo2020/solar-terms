<script setup>
import { ref } from 'vue';
import { ArrowUpRight, Sprout, Utensils, Feather, Landmark, BookOpen } from 'lucide-vue-next';
import { useI18n } from '../i18n/index.js';
import { MODEL_INFO } from '../astronomy.js';
const props=defineProps({currentId:Number,year:Number,illustration:Boolean});
const emit=defineEmits(['select']);
const {t,isEnglish,content,term,season,year:formatYear}=useI18n();
const showSummer=ref(false);
const icons=[Sprout,Utensils,Feather,Landmark];
function choose(id){emit('select',id);document.getElementById('observatory')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
</script>
<template>
  <section id="science" class="reading-section science-section">
    <div class="section-heading"><div><span class="eyebrow">{{t('reading.scienceKicker')}}</span><h2>{{t('reading.scienceTitle')}}</h2></div><p>{{t('reading.scienceCaption')}}</p></div>
    <div class="science-grid"><details v-for="(item,i) in content.science" :key="i" :open="i===0"><summary><span>{{String(i+1).padStart(2,'0')}}</span>{{item.title}}<span class="summary-plus">+</span></summary><p>{{item.text}}</p></details></div>
  </section>
  <section id="heritage" class="reading-section heritage-section">
    <div class="section-heading"><div><span class="eyebrow">{{t('reading.historyKicker')}}</span><h2>{{t('reading.historyTitle1')}}<br>{{t('reading.historyTitle2')}}</h2></div><p>{{t('reading.historyCaption1')}}<br>{{t('reading.historyCaption2')}}</p></div>
    <div class="history-timeline"><article v-for="item in content.history" :key="item.date"><span class="history-dot"></span><span class="history-date">{{item.date}}</span><h3>{{item.title}}</h3><p>{{item.text}}</p><a :href="item.source" target="_blank" rel="noopener noreferrer" :aria-label="t('reading.sourceAria',{title:item.title})">{{t('reading.readSource')}}<ArrowUpRight :size="12"/></a></article></div>
    <div class="culture-values"><article v-for="(item,i) in content.culturalValues" :key="item.title"><component :is="icons[i]" :size="21" :stroke-width="1.3"/><h3>{{item.title}}</h3><p>{{item.text}}</p></article></div>
  </section>
  <section id="song" class="reading-section song-section">
    <div class="song-intro"><span class="eyebrow">{{t('song.kicker')}}</span><h2>{{t('song.title')}}</h2><p>{{t('song.caption')}}<br>{{t(illustration?'song.illustration':'song.select',{year:formatYear(year)})}}</p><div class="song-stamp">{{t('song.stamp')}}</div><span class="song-note">{{t('song.note')}}</span></div>
    <div class="song-lines"><div v-for="(line,i) in content.songLines" :key="line.label" class="song-line"><span class="song-season">{{season(['春','夏','秋','冬'][i])}}</span><div><div class="song-verse" lang="zh-CN"><template v-for="(token,index) in line.tokens" :key="index"><button v-if="Number.isInteger(token.termId)" :lang="isEnglish?'en':'zh-CN'" :aria-label="t('song.tokenAria',{line:i+1,position:index+1,text:token.text,name:term(token.termId).name})" :class="{chosen:currentId===token.termId}" @click="choose(token.termId)">{{token.text}}</button><button v-else-if="token.termIds" :lang="isEnglish?'en':'zh-CN'" class="summer-pair" :aria-expanded="showSummer" :aria-label="t('song.summerPair')" @click="showSummer=!showSummer">{{token.text}}</button><span v-else>{{token.text}}</span></template></div><div v-if="i===1&&showSummer" class="summer-choices"><button @click="choose(10)">{{term(10).name}} · 105°</button><button @click="choose(11)">{{term(11).name}} · 120°</button></div><p>{{line.explanation}}</p></div></div></div>
  </section>
  <section id="sources" class="reading-section source-section">
    <div class="section-heading"><div><span class="eyebrow">{{t('reading.aboutKicker')}}</span><h2>{{t('reading.aboutTitle')}}</h2></div><BookOpen :size="25" :stroke-width="1"/></div>
    <div class="method-grid"><article><h3>{{t('reading.methodTitle')}}</h3><p>{{t('reading.method',{model:MODEL_INFO.id,version:MODEL_INFO.version,first:formatYear(MODEL_INFO.firstYear),last:formatYear(MODEL_INFO.lastYear)})}}</p><p>{{t('reading.accuracy')}}</p></article><article><h3>{{t('reading.modelTitle')}}</h3><p>{{t('reading.model')}}</p><p>{{t('reading.visuals')}}</p></article></div>
    <div class="asset-credit"><strong>{{t('reading.creditTitle')}}</strong><p>{{t('reading.credit')}} <a href="https://www.nasa.gov/nasa-brand-center/images-and-media/" target="_blank" rel="noopener noreferrer">{{t('reading.nasaRules')}}</a> <a href="https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/" target="_blank" rel="noopener noreferrer">{{t('reading.imageSource')}}</a></p></div>
    <details class="references"><summary>{{t('reading.references')}} <span>{{t('reading.referenceCount',{count:content.references.length+3})}}</span></summary><ol><li v-for="source in content.references" :key="source.id"><a :href="source.url" target="_blank" rel="noopener noreferrer">{{source.title}} ↗</a></li><li><a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noopener noreferrer">{{t('reading.engineLicense')}}</a></li><li><a href="https://www.hko.gov.hk/en/gts/astron2025/files/2025SolarTerms24.pdf" target="_blank" rel="noopener noreferrer">{{t('reading.hkoYear',{year:2025})}}</a></li><li><a href="https://www.hko.gov.hk/en/gts/astron2026/files/2026SolarTerms24.pdf" target="_blank" rel="noopener noreferrer">{{t('reading.hkoYear',{year:2026})}}</a></li></ol></details>
  </section>
</template>
