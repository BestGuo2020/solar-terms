<script setup>
import { ref } from 'vue';
import { Orbit, ArrowUpRight, Radio, Clock3, Languages } from 'lucide-vue-next';
import { useSimulation } from './useSimulation.js';
import { useI18n } from './i18n/index.js';
import OrbitScene from './components/OrbitScene.vue';
import TermDetail from './components/TermDetail.vue';
import TimeControls from './components/TimeControls.vue';
import CultureSection from './components/CultureSection.vue';
const {snapshot:s,actions}=useSimulation();
const {t,isEnglish,content,setLocale,season,date,year,qualityLabel,qualityMessage}=useI18n();
const orbitScene=ref(null);
function selectTerm(id){actions.term(id);}
</script>
<template>
  <a href="#observatory" class="skip-link">{{t('nav.skip')}}</a>
  <div class="site-wrap">
    <header class="site-header"><a href="#" class="brand" :aria-label="t('nav.home')"><span class="brand-emblem"><Orbit :size="28" :stroke-width="1"/></span><span class="brand-title">{{t('nav.brand')}}<span>{{t('nav.subtitle')}}</span></span></a><nav :aria-label="t('nav.label')"><a href="#observatory" class="nav-current">{{t('nav.orbit')}}</a><a href="#terms">{{t('nav.terms')}}</a><a href="#heritage">{{t('nav.heritage')}}</a><a href="#song">{{t('nav.song')}}</a></nav><div class="header-tools"><a class="header-about" href="#sources">{{t('nav.about')}}<ArrowUpRight :size="14"/></a><button class="language-switch" :aria-label="isEnglish?'Switch to Chinese':'Switch to English'" @click="setLocale(isEnglish?'zh':'en')"><Languages :size="14"/><span :lang="isEnglish?'zh-CN':'en'">{{isEnglish?'中文':'EN'}}</span></button></div></header>
    <main>
      <section id="observatory" class="observatory">
        <div class="observatory-intro"><div><div class="eyebrow"><span class="short-rule"></span> FOLLOW THE SUN, FIND THE SEASON</div><h1>{{t('hero.first')}} <em>{{t('hero.second')}}</em></h1><p>{{t('hero.description')}}</p></div><div class="date-status"><span :class="s.live?'live-status':'sim-status'"><Radio v-if="s.live" :size="13"/><Clock3 v-else :size="13"/>{{t(s.live?'time.live':'time.simulated')}}</span><time :datetime="new Date(s.time).toISOString()">{{date(s.time,true)}}</time><small>{{t('hero.step')}}</small></div></div>
        <div class="calculation-notice" :class="s.quality" role="status"><strong>{{qualityLabel(s)}}</strong><span>{{qualityMessage(s)}}</span></div>
        <div class="observatory-layout"><div class="space-column"><OrbitScene ref="orbitScene" :state="s" @select="selectTerm"/></div><TermDetail :state="s" @next="actions.seek" @select="selectTerm"/></div>
        <TimeControls :state="s" :actions="actions"/>
      </section>
      <section id="terms" class="term-index">
        <div class="index-heading"><h2>{{t('index.title')}}</h2><span>{{t(s.mode==='illustration'?'index.illustration':'index.hint',{year:year(s.year)})}}<ArrowUpRight :size="13"/></span></div>
        <div class="term-seasons"><div v-for="(seasonCode,i) in ['春','夏','秋','冬']" :key="seasonCode" class="season-row" :class="`season-${i}`"><div class="season-letter">{{season(seasonCode)}}<span v-if="!isEnglish">{{['SPRING','SUMMER','AUTUMN','WINTER'][i]}}</span></div><div class="season-terms"><button v-for="term in content.terms.filter(item=>item.season===seasonCode)" :key="term.id" :class="{selected:term.id===s.current.id,cardinal:term.longitude%90===0}" :aria-pressed="term.id===s.current.id" :aria-label="t(s.mode==='illustration'?'term.illustrate':'term.select',{name:term.name,longitude:term.longitude})" @click="selectTerm(term.id)"><span>{{term.name}}</span><small><template v-if="isEnglish">{{String(term.id+1).padStart(2,'0')}} · </template>{{term.longitude}}°</small></button></div></div></div>
        <p class="regional-note">{{content.regionalNote}}</p>
      </section>
      <CultureSection :current-id="s.current.id" :year="s.year" :illustration="s.mode==='illustration'" @select="selectTerm"/>
    </main>
    <footer class="site-footer"><a href="#" class="footer-brand">{{t('nav.brand')}}<span>{{t('footer.motto')}}</span></a><span>{{t('footer.caption')}}</span><a href="#observatory">{{t('footer.back')}}</a></footer>
  </div>
</template>
