<script setup>
import { computed, ref } from 'vue';
import { ArrowRight, CloudSun, Sprout, BookOpen, CalendarDays } from 'lucide-vue-next';
import { useI18n } from '../i18n/index.js';
const props=defineProps({state:{type:Object,required:true}});
const emit=defineEmits(['next','select']);
const {t,content,isEnglish,term,season,date,qualityLabel}=useI18n();
const current=computed(()=>term(props.state.current.id));
const next=computed(()=>term(props.state.next.id));
const tab=ref('climate');
const tabs=[{key:'climate',icon:CloudSun},{key:'farming',icon:Sprout},{key:'culture',icon:BookOpen}];
const illustration=computed(()=>props.state.mode==='illustration');
const percent=computed(()=>illustration.value?0:Math.min(100,Math.max(0,(props.state.time-props.state.current.time)/(props.state.next.time-props.state.current.time)*100)));
const sources=computed(()=>content.value.references.filter(r=>props.state.current.sourceIds?.includes(r.id)).slice(0,3));
const accent=computed(()=>({'春':'#97c5b0','夏':'#dcc084','秋':'#cea07e','冬':'#9dbed1'}[props.state.current.season]));
</script>
<template>
  <aside class="term-detail" :style="{'--season-accent':accent}" :aria-label="t('detail.label')">
    <div class="detail-topline"><span>{{t(illustration?'detail.illustration':'detail.current')}}</span><span class="season-badge">{{t('detail.ordinal',{season:season(current.season),order:String(current.id+1).padStart(2,'0')})}}</span></div>
    <div class="term-title-row"><h2>{{current.name}}</h2><span class="term-seal" lang="zh-CN" aria-hidden="true">岁<br>时</span></div>
    <p v-if="isEnglish" class="term-subtitle">{{current.pinyin}} · <span lang="zh-CN">{{current.chineseName}}</span></p>
    <p class="term-meaning">{{current.meaning}}</p>
    <div class="term-coordinates"><div><span>{{t('detail.longitude')}}</span><strong>{{current.longitude}}<small>°</small></strong></div><div><span>{{t('detail.latitude')}}</span><strong>{{Math.abs(state.declination).toFixed(1)}}<small>° {{state.declination>=0?'N':'S'}}</small></strong></div></div>
    <div class="term-instant"><CalendarDays :size="15"/><div v-if="!illustration"><span>{{t('detail.start')}}</span><time :datetime="new Date(state.current.time).toISOString()">{{date(state.current.time,true)}}</time><small>{{t('detail.accuracy',{quality:qualityLabel(state)})}}</small></div><div v-else><span>{{t('detail.selectedYear')}}</span><strong class="unavailable-instant">{{t('detail.unavailable')}}</strong><small>{{t('detail.notDate')}}</small></div></div>
    <div class="detail-tabs" role="tablist" :aria-label="t('detail.tabs')">
      <button v-for="item in tabs" :key="item.key" role="tab" :id="`tab-${item.key}`" aria-controls="term-content" :aria-selected="tab===item.key" @click="tab=item.key"><component :is="item.icon" :size="14"/>{{t(`detail.${item.key}`)}}</button>
    </div>
    <div id="term-content" class="term-content" role="tabpanel" :aria-labelledby="`tab-${tab}`">
      <p>{{current[tab]}}</p>
      <blockquote v-if="tab==='culture'&&current.poem"><p>{{current.poem.line}}</p><cite>{{current.poem.author}}{{isEnglish?' — ':'《'}}{{current.poem.title}}{{isEnglish?'':'》'}}<template v-if="isEnglish"> · {{current.poem.note||'English rendering'}}</template></cite></blockquote>
      <small>{{t(tab==='culture'?'detail.cultureNote':'detail.climateNote')}}</small>
    </div>
    <div class="detail-source"><a v-for="source in sources" :key="source.id" :href="source.url" target="_blank" rel="noopener noreferrer">{{source.title.split(/｜| \| | — /)[0]}} ↗</a></div>
    <button class="next-term" @click="illustration?emit('select',next.id):emit('next',state.next.time)"><div><span>{{t(illustration?'detail.nextIllustration':'detail.next')}}</span><strong>{{next.name}}</strong><small>{{illustration?t('detail.independent'):date(state.next.time)}}</small></div><ArrowRight :size="18"/></button>
    <div v-if="!illustration" class="term-progress" :aria-label="t('detail.progress',{percent:percent.toFixed(0)})" role="progressbar" :aria-valuenow="Math.round(percent)" :aria-valuemin="0" :aria-valuemax="100"><i :style="{width:`${percent}%`}"></i></div>
  </aside>
</template>
