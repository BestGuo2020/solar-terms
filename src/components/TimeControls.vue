<script setup>
import { ref, computed, watch } from 'vue';
import { Play, Pause, RotateCcw, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { MIN_CALENDAR_YEAR, MAX_CALENDAR_YEAR, beijingTimestamp, datetimeInput, parseBeijingInput } from '../astronomy.js';
import { useI18n } from '../i18n/index.js';
const props=defineProps({state:{type:Object,required:true},actions:{type:Object,required:true}});
const {t,date,year,month}=useI18n();
const error=ref(''),editingDate=ref(false),dateDraft=ref(''),editingYear=ref(false),yearDraft=ref(String(props.state.year));
const illustration=computed(()=>props.state.mode==='illustration');
const nativeDate=computed(()=>props.state.year>0&&props.state.year<=9999);
const yearDate=computed(()=>datetimeInput(props.state.time));
const monthTicks=computed(()=>Array.from({length:12},(_,i)=>({month:i+1,position:(beijingTimestamp(props.state.year,i+1)-props.state.start)/(props.state.end-props.state.start)*100})));
watch(()=>props.state.year,year=>{if(!editingYear.value)yearDraft.value=String(year);});
function selectTime(event){
  const value=parseBeijingInput(event.target.value);
  if(!Number.isFinite(value)||!props.actions.seek(value)){error.value='controls.dateError';return;}
  error.value='';
}
function selectYear(value=yearDraft.value){
  if(!props.actions.year(value)){error.value='controls.yearError';return;}
  editingYear.value=false;yearDraft.value=String(props.state.year);error.value='';
}
function today(){editingDate.value=false;editingYear.value=false;error.value='';props.actions.today();yearDraft.value=String(props.state.year);}
</script>
<template>
  <section class="time-controls" :aria-label="t('controls.label')">
    <div class="time-control-top">
      <div class="play-controls">
        <button class="play-button" :aria-label="t(state.playing?(illustration?'controls.pauseIllustrationAria':'controls.pauseAria'):(illustration?'controls.playIllustrationAria':'controls.playAria'))" @click="actions.play"><Pause v-if="state.playing" :size="18" fill="currentColor"/><Play v-else :size="18" fill="currentColor"/><span>{{t(state.playing?'controls.pause':illustration?'controls.playIllustration':'controls.play')}}</span></button>
        <label class="speed-label">{{t('controls.speed')}}<select :aria-label="t(illustration?'controls.illustrationSpeed':'controls.orbitSpeed')" :value="state.daysPerSecond" @change="actions.speed($event.target.value)"><option v-for="speed in [1,3,10,30]" :key="speed" :value="speed">{{t(illustration?'controls.degreesPerSecond':'controls.daysPerSecond',{speed})}}</option></select></label>
      </div>
      <div class="date-controls"><label class="date-picker-label"><CalendarDays :size="15"/><input :type="nativeDate?'datetime-local':'text'" :aria-label="t('controls.date')" :value="editingDate?dateDraft:yearDate" step="1" :spellcheck="false" @focus="dateDraft=yearDate;editingDate=true" @input="dateDraft=$event.target.value" @blur="editingDate=false" @change="selectTime"/></label><button class="today-button" @click="today"><RotateCcw :size="14"/>{{t('controls.today')}}</button></div>
    </div>
    <div class="timeline-label"><label for="annual-timeline">{{t('controls.timeline')}} <span>{{year(state.year)}}</span></label><span v-if="illustration">{{t(state.playing?'controls.independentPlaying':'controls.independent')}}</span><span v-else>{{t(state.live?'controls.live':state.playing?'controls.playing':'controls.paused')}}</span></div>
    <div class="timeline-track"><div class="timeline-events" aria-hidden="true"><i v-for="event in state.events" :key="event.id" :style="{left:`${(event.time-state.start)/(state.end-state.start)*100}%`}" :class="{major:event.longitude%90===0}"></i></div><input id="annual-timeline" :aria-label="t('controls.dragTimeline')" type="range" min="0" max="1" step="0.000001" :value="state.progress" :aria-valuetext="date(state.time,true)" @input="actions.progress($event.target.value)" :style="{'--progress':`${state.progress*100}%`}"/></div>
    <div class="month-labels"><span v-for="tick in monthTicks" :key="tick.month" :style="{left:`${tick.position}%`}">{{month(tick.month)}}<small>{{t('controls.monthSuffix')}}</small></span></div>
    <div class="time-meta">
      <form class="year-control" @submit.prevent="selectYear()"><label for="simulation-year">{{t('controls.year')}}</label><button type="button" :aria-label="t('controls.previousYear')" :disabled="state.year<=MIN_CALENDAR_YEAR" @click="selectYear(state.year-1)"><ChevronLeft :size="13"/></button><input id="simulation-year" type="text" inputmode="numeric" :aria-label="t('controls.inputYear')" v-model="yearDraft" @focus="editingYear=true" @blur="editingYear=false" :spellcheck="false" autocomplete="off"/><button type="submit">{{t('controls.go')}}</button><button type="button" :aria-label="t('controls.nextYear')" :disabled="state.year>=MAX_CALENDAR_YEAR" @click="selectYear(state.year+1)"><ChevronRight :size="13"/></button></form>
      <label class="spin-switch"><input type="checkbox" :checked="state.spin" @change="actions.spin($event.target.checked)"/>{{t('controls.spin')}} <small>{{t('controls.spinRate')}}</small></label><span>{{t('controls.timezone')}}</span>
    </div>
    <p v-if="state.year<=0" class="calendar-note">{{t('controls.calendarNote')}}</p>
    <p v-if="error||state.boundary" class="control-error" role="alert">{{t(error||'controls.boundary',{min:MIN_CALENDAR_YEAR,max:MAX_CALENDAR_YEAR})}}</p>
  </section>
</template>
