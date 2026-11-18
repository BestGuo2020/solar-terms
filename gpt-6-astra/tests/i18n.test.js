import test from 'node:test';
import assert from 'node:assert/strict';
import * as zh from '../src/data/terms.js';
import * as en from '../src/data/terms.en.js';
import { messages,translate } from '../src/i18n/messages.js';
import { beijingTimestamp,formatDate,formatYear } from '../src/calendar.js';

test('UI catalog has complete key and interpolation parity',()=>{
  assert.deepEqual(Object.keys(messages.en).sort(),Object.keys(messages.zh).sort());
  const variables=text=>[...text.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
  for(const key of Object.keys(messages.zh)){
    assert.deepEqual(variables(messages.en[key]),variables(messages.zh[key]),key);
    assert.equal(typeof messages.en[key],'string');
    if(!['controls.monthSuffix'].includes(key))assert.ok(messages.en[key].length,key);
    assert.ok(!/[\p{Script=Han}]/u.test(messages.en[key]),key);
  }
  assert.equal(translate('en','controls.degreesPerSecond',{speed:30}),'30° / sec');
  assert.throws(()=>translate('en','nonexistent.key'));
});

test('24 translated terms preserve IDs, orbital metadata, poems and sources',()=>{
  assert.equal(en.terms.length,24);
  for(const [id,term] of en.terms.entries()){
    const original=zh.terms[id];
    for(const field of ['id','longitude','season','sourceIds'])assert.deepEqual(term[field],original[field]);
    assert.equal(term.chineseName,original.name);assert.ok(/^[A-Za-z]+$/.test(term.pinyin));
    for(const field of ['name','meaning','climate','farming','culture']){
      assert.ok(term[field].length>3,`${id} ${field}`);assert.notEqual(term[field],original[field]);
    }
    if(original.poem){assert.ok(term.poem.author&&term.poem.title&&term.poem.note);assert.notEqual(term.poem.line,original.poem.line);}
  }
  assert.equal(new Set(en.terms.map(term=>term.name)).size,24);
});

test('reading content and repeated verse characters keep their exact mappings',()=>{
  for(const field of ['history','science','culturalValues','references','songLines'])assert.equal(en[field].length,zh[field].length,field);
  assert.notEqual(en.regionalNote,zh.regionalNote);
  en.history.forEach((item,i)=>{assert.equal(item.source,zh.history[i].source);assert.notEqual(item.text,zh.history[i].text);});
  en.references.forEach((item,i)=>{assert.equal(item.id,zh.references[i].id);assert.equal(item.url,zh.references[i].url);assert.ok(item.title);assert.notEqual(item.title,zh.references[i].title);});
  en.songLines.forEach((line,i)=>{assert.deepEqual(line.tokens,zh.songLines[i].tokens);assert.notEqual(line.explanation,zh.songLines[i].explanation);});
});

test('English dates retain Beijing time and express BCE years correctly',()=>{
  const ms=beijingTimestamp(2026,10,9,8,30,15);
  assert.equal(formatDate(ms,true,'en'),'09 Oct 2026, 08:30:15');
  assert.equal(formatDate(ms,true),'2026.10.09 08:30:15');
  assert.equal(formatYear(0,'en'),'1 BCE');assert.equal(formatYear(-1,'en'),'2 BCE');
  assert.equal(formatDate(null,false,'en'),'No reliable starting time');
});
