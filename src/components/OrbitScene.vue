<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue';
import { Orbit, Globe2, RotateCcw, SlidersHorizontal, MousePointer2, Focus, Minus, Plus } from 'lucide-vue-next';
import { SolarScene } from '../scene.js';
import { useI18n } from '../i18n/index.js';

const props=defineProps({state:{type:Object,required:true}});
const emit=defineEmits(['select']);
const {t,locale,isEnglish,content}=useI18n();
const host=ref(null),status=ref('scene.preparing'),statusKind=ref('loading'),mode=ref('default'),settings=ref(false),quality=ref('auto');
const helpers=reactive({axis:true,equator:false,tropics:false,direction:true});
let scene;
watch(locale,()=>scene?.setLanguage(locale.value,content.value.terms));
function view(value){mode.value=value;scene?.view(value);}
function zoom(factor){if(scene){scene.camera.position.sub(scene.controls.target).multiplyScalar(factor).add(scene.controls.target);scene.controls.update();}}
onMounted(()=>{
  try {scene=new SolarScene(host.value,()=>props.state,helpers,id=>emit('select',id),(key,kind)=>{status.value=key;statusKind.value=kind;});scene.setLanguage(locale.value,content.value.terms);}
  catch(error){status.value='scene.webglError';statusKind.value='error';console.error(error);}
});
onUnmounted(()=>scene?.dispose());
defineExpose({view});
</script>

<template>
  <div class="scene-shell" :class="{ 'close-view':mode==='earth' }">
    <div class="scene-heading"><span class="tiny-square"></span> {{t('scene.heading')}} <span v-if="!isEnglish" class="scene-heading-en">EARTH · SUN</span></div>
    <div class="scene-host" ref="host"></div>
    <div class="scene-angle"><span>{{t(state.mode==='illustration'?'scene.illustrationLongitude':'scene.longitude')}}</span><strong>{{ ((Math.round(state.longitude*100)/100)%360).toFixed(2) }}<small>°</small></strong></div>
    <div class="scene-notes"><span>{{t('scene.scale')}}</span><span>{{t('scene.tilt')}}</span><span v-if="isEnglish">{{t('scene.labelHint')}}</span></div>
    <div v-if="statusKind!=='ready'" class="scene-status" :class="statusKind" role="status">{{t(status)}}</div>
    <div class="scene-bottom">
      <span class="gesture-hint"><MousePointer2 :size="13" />{{t('scene.gestures')}}</span>
      <button class="icon-button settings-toggle" :aria-label="t('scene.settings')" :aria-expanded="settings" @click="settings=!settings"><SlidersHorizontal :size="16" /></button>
    </div>
  </div>
  <div class="view-toolbar" :aria-label="t('scene.views')">
    <div class="view-buttons">
      <button :class="{active:mode==='overview'}" :aria-pressed="mode==='overview'" @click="view('overview')"><Orbit :size="15" />{{t('scene.overview')}}</button>
      <button :class="{active:mode==='earth'}" :aria-pressed="mode==='earth'" @click="view('earth')"><Globe2 :size="15" />{{t('scene.close')}}</button>
      <button :class="{active:mode==='default'}" :aria-pressed="mode==='default'" @click="view('default')"><RotateCcw :size="14" />{{t('scene.reset')}}</button>
    </div>
    <div class="zoom-buttons"><button class="icon-button" :aria-label="t('scene.zoomIn')" @click="zoom(.85)"><Plus :size="16" /></button><button class="icon-button" :aria-label="t('scene.zoomOut')" @click="zoom(1.15)"><Minus :size="16" /></button></div>
  </div>
  <div v-if="settings" class="helper-settings">
    <label><input type="checkbox" v-model="helpers.axis">{{t('scene.axis')}}</label>
    <label><input type="checkbox" v-model="helpers.equator">{{t('scene.equator')}}</label>
    <label><input type="checkbox" v-model="helpers.tropics">{{t('scene.tropics')}}</label>
    <label><input type="checkbox" v-model="helpers.direction">{{t('scene.direction')}}</label>
    <label>{{t('scene.quality')}} <select v-model="quality" @change="scene?.quality(quality)"><option value="auto">{{t('scene.auto')}}</option><option value="high">{{t('scene.high')}}</option><option value="low">{{t('scene.low')}}</option></select></label>
    <span class="helper-tip"><Focus :size="13" />{{t('scene.helperTip')}}</span>
  </div>
</template>
