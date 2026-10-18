/* app.js — DV-Piano core engine. Depends on melody.js loaded first. */

const baseFrequencies = {
  'C3':130.81,'C#3':138.59,'D3':146.83,'D#3':155.56,'E3':164.81,
  'F3':174.61,'F#3':185.00,'G3':196.00,'G#3':207.65,'A3':220.00,
  'A#3':233.08,'B3':246.94,
  'C4':261.63,'C#4':277.18,'D4':293.66,'D#4':311.13,'E4':329.63,
  'F4':349.23,'F#4':369.99,'G4':392.00,'G#4':415.30,'A4':440.00,
  'A#4':466.16,'B4':493.88,
  'C5':523.25,'C#5':554.37,'D5':587.33,'D#5':622.25,'E5':659.25,
  'F5':698.46,'F#5':739.99,'G5':783.99,'G#5':830.61,'A5':880.00,
  'A#5':932.33,'B5':987.77,
  'C6':1046.50,'C#6':1108.73,'D6':1174.66,'D#6':1244.51,'E6':1318.51,'F6':1396.91
};

const triadChordMap = {
  'C4':['C4','E4','G4'],'C#4':['C#4','F4','G#4'],'D4':['D4','F4','A4'],
  'D#4':['D#4','G4','A#4'],'E4':['E4','G4','B4'],'F4':['F4','A4','C5'],
  'F#4':['F#4','A#4','C#5'],'G4':['G4','B4','D5'],'G#4':['G#4','C5','D#5'],
  'A4':['A4','C5','E5'],'A#4':['A#4','D5','F5'],'B4':['B4','D5','F#5'],
  'C5':['C5','E5','G5'],'C#5':['C#5','F5','G#5'],'D5':['D5','F5','A5'],
  'D#5':['D#5','G5','A#5'],'E5':['E5','G5','B5'],'F5':['F5','A5','C6']
};

let currentOctaveShift=0, isSustainActive=false, currentInstrument='acoustic';
let isChordModeActive=false, isTutorModeActive=false, tutorSong=null, tutorCurrentIndex=0;
let isRecording=false, recordedEvents=[], recordStartTime=0, recordTimerInterval=null, recordSeconds=0;
let isReverbActive=false, labelsVisible=true, _toastTimer=null;

let audioCtx=null, masterCompressor=null, masterGain=null, reverbNode=null, reverbSend=null;
let activeTimeouts=[], currentPlaying=false;

function createReverb(ctx){
  const conv=ctx.createConvolver();
  const len=ctx.sampleRate*2.5;
  const buf=ctx.createBuffer(2,len,ctx.sampleRate);
  for(let ch=0;ch<2;ch++){
    const d=buf.getChannelData(ch);
    for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.5);
  }
  conv.buffer=buf;
  return conv;
}

function getAudioContext(){
  if(!audioCtx){
    const AC=window.AudioContext||window.webkitAudioContext;
    audioCtx=new AC({latencyHint:'interactive'});
    masterCompressor=audioCtx.createDynamicsCompressor();
    masterCompressor.threshold.setValueAtTime(-14,audioCtx.currentTime);
    masterCompressor.knee.setValueAtTime(20,audioCtx.currentTime);
    masterCompressor.ratio.setValueAtTime(8,audioCtx.currentTime);
    masterCompressor.attack.setValueAtTime(0.003,audioCtx.currentTime);
    masterCompressor.release.setValueAtTime(0.2,audioCtx.currentTime);
    masterCompressor.connect(audioCtx.destination);
    masterGain=audioCtx.createGain();
    masterGain.gain.setValueAtTime(parseFloat(document.getElementById('volSlider').value)||0.8,audioCtx.currentTime);
    masterGain.connect(masterCompressor);
    reverbNode=createReverb(audioCtx);
    reverbNode.connect(masterGain);
    reverbSend=audioCtx.createGain();
    reverbSend.gain.setValueAtTime(0,audioCtx.currentTime);
    reverbSend.connect(reverbNode);
  }
  if(audioCtx.state==='suspended') audioCtx.resume();
  return audioCtx;
}

function getTransposedFrequency(note){
  if(currentOctaveShift===0) return baseFrequencies[note]||440;
  const m=note.match(/^([A-G]#?)([0-9])$/);
  if(!m) return baseFrequencies[note]||440;
  const target=m[1]+(parseInt(m[2])+currentOctaveShift);
  return baseFrequencies[target]||(baseFrequencies[note]*Math.pow(2,currentOctaveShift));
}

function playTone(freq,duration,isSustain){
  const ctx=getAudioContext();
  if(!ctx||!freq) return;
  const now=ctx.currentTime;
  const dur=isSustain?Math.max(duration,2.4):duration;
  const gain=ctx.createGain();

  if(currentInstrument==='rhodes'){
    const o1=ctx.createOscillator(),o2=ctx.createOscillator(),sg=ctx.createGain();
    o1.type='sine';o1.frequency.setValueAtTime(freq,now);
    o2.type='triangle';o2.frequency.setValueAtTime(freq*2.01,now);
    sg.gain.setValueAtTime(.3,now);
    o2.connect(sg);sg.connect(gain);o1.connect(gain);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.linearRampToValueAtTime(.32,now+.01);
    gain.gain.exponentialRampToValueAtTime(.0001,now+dur);
    o1.start(now);o2.start(now);o1.stop(now+dur+.05);o2.stop(now+dur+.05);
  } else if(currentInstrument==='organ'){
    const o1=ctx.createOscillator(),o2=ctx.createOscillator(),o3=ctx.createOscillator();
    o1.type='sine';o1.frequency.setValueAtTime(freq,now);
    o2.type='sine';o2.frequency.setValueAtTime(freq*2,now);
    o3.type='sine';o3.frequency.setValueAtTime(freq*3,now);
    o1.connect(gain);o2.connect(gain);o3.connect(gain);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.linearRampToValueAtTime(.18,now+.02);
    gain.gain.exponentialRampToValueAtTime(.0001,now+dur);
    o1.start(now);o2.start(now);o3.start(now);
    o1.stop(now+dur+.05);o2.stop(now+dur+.05);o3.stop(now+dur+.05);
  } else if(currentInstrument==='synth'){
    const o1=ctx.createOscillator(),flt=ctx.createBiquadFilter();
    o1.type='sawtooth';o1.frequency.setValueAtTime(freq,now);
    flt.type='lowpass';flt.frequency.setValueAtTime(2200,now);
    flt.frequency.exponentialRampToValueAtTime(600,now+dur);
    o1.connect(flt);flt.connect(gain);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.linearRampToValueAtTime(.24,now+.015);
    gain.gain.exponentialRampToValueAtTime(.0001,now+dur);
    o1.start(now);o1.stop(now+dur+.05);
  } else {
    const o1=ctx.createOscillator(),o2=ctx.createOscillator(),og=ctx.createGain();
    o1.type='triangle';o1.frequency.setValueAtTime(freq,now);
    o2.type='sine';o2.frequency.setValueAtTime(freq*2,now);
    og.gain.setValueAtTime(.22,now);
    o2.connect(og);og.connect(gain);o1.connect(gain);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.linearRampToValueAtTime(.35,now+.012);
    gain.gain.exponentialRampToValueAtTime(.15,now+dur*.3);
    gain.gain.exponentialRampToValueAtTime(.0001,now+dur);
    o1.start(now);o2.start(now);o1.stop(now+dur+.05);o2.stop(now+dur+.05);
  }
  gain.connect(masterGain);
  gain.connect(reverbSend);
}

const keyboardEl=document.getElementById('keyboard');

function highlightKey(note,durationMs){
  const el=keyboardEl.querySelector(`[data-note="${note}"]`)||keyboardEl.querySelector(`[data-base-note="${note}"]`);
  if(!el) return;
  el.classList.add('active');
  setTimeout(()=>el.classList.remove('active'),durationMs);
}

function triggerManualNote(note){
  getAudioContext();
  if(isRecording){
    const t=(performance.now()-recordStartTime)/1000;
    recordedEvents.push({note,duration:.5,time:Math.max(0,t)});
  }
  if(isTutorModeActive&&tutorSong){
    const exp=tutorSong.notes[tutorCurrentIndex]?.note;
    if(exp&&(note===exp||note.startsWith(exp[0]))) advanceTutorStep();
  }
  if(isChordModeActive&&triadChordMap[note]){
    triadChordMap[note].forEach(n=>{
      const f=getTransposedFrequency(n);
      if(f){playTone(f,.7,isSustainActive);highlightKey(n,280);}
    });
    return;
  }
  const f=getTransposedFrequency(note);
  if(f){playTone(f,.7,isSustainActive);highlightKey(note,250);}
}

const activeTouchNotes=new Map();

function getNoteFromPoint(x,y){
  const els=document.elementsFromPoint(x,y);
  for(const el of els) if(el.classList?.contains('key-black')&&el.dataset.note) return el;
  for(const el of els) if(el.classList?.contains('key-white')&&el.dataset.note) return el;
  return null;
}

keyboardEl.addEventListener('touchstart',e=>{
  e.preventDefault();getAudioContext();
  for(const t of e.changedTouches){
    const el=getNoteFromPoint(t.clientX,t.clientY);
    if(el?.dataset?.note){activeTouchNotes.set(t.identifier,el.dataset.note);triggerManualNote(el.dataset.note);}
  }
},{passive:false});

keyboardEl.addEventListener('touchmove',e=>{
  e.preventDefault();
  for(const t of e.changedTouches){
    const el=getNoteFromPoint(t.clientX,t.clientY);
    if(el?.dataset?.note&&el.dataset.note!==activeTouchNotes.get(t.identifier)){
      activeTouchNotes.set(t.identifier,el.dataset.note);triggerManualNote(el.dataset.note);
    }
  }
},{passive:false});

keyboardEl.addEventListener('touchend',e=>{
  for(const t of e.changedTouches) activeTouchNotes.delete(t.identifier);
});

keyboardEl.addEventListener('mousedown',e=>{
  getAudioContext();
  const el=e.target.closest('[data-note]');
  if(el) triggerManualNote(el.dataset.note);
});

const octaveDownBtn=document.getElementById('octaveDownBtn');
const octaveNormalBtn=document.getElementById('octaveNormalBtn');
const octaveUpBtn=document.getElementById('octaveUpBtn');

function updateOctaveUI(){
  octaveDownBtn.classList.toggle('active',currentOctaveShift===-1);
  octaveNormalBtn.classList.toggle('active',currentOctaveShift===0);
  octaveUpBtn.classList.toggle('active',currentOctaveShift===1);
  document.querySelectorAll('.key-white,.key-black').forEach(k=>{
    const m=k.dataset.baseNote.match(/^([A-G]#?)([0-9])$/);
    if(m){
      const n=m[1]+(parseInt(m[2])+currentOctaveShift);
      k.dataset.note=n;
      const lbl=k.querySelector('.key-label');
      if(lbl) lbl.textContent=n;
    }
  });
}

octaveDownBtn.addEventListener('click',()=>{currentOctaveShift=-1;updateOctaveUI();showToast('-1 Octave');});
octaveNormalBtn.addEventListener('click',()=>{currentOctaveShift=0;updateOctaveUI();showToast('Octave Normal');});
octaveUpBtn.addEventListener('click',()=>{currentOctaveShift=1;updateOctaveUI();showToast('+1 Octave');});

const sustainPedalBtn=document.getElementById('sustainPedalBtn');
sustainPedalBtn.addEventListener('click',()=>{
  isSustainActive=!isSustainActive;
  sustainPedalBtn.textContent=isSustainActive?'PEDAL: ON':'PEDAL: OFF';
  sustainPedalBtn.classList.toggle('btn-active-toggle',isSustainActive);
  showToast(isSustainActive?'Sustain On':'Sustain Off');
});

document.getElementById('instrumentSelect').addEventListener('change',e=>{
  currentInstrument=e.target.value;
  showToast(e.target.options[e.target.selectedIndex].text);
});

const recordBtn=document.getElementById('recordBtn');
const replayBtn=document.getElementById('replayBtn');

recordBtn.addEventListener('click',()=>{
  if(!isRecording){
    getAudioContext();
    isRecording=true;recordedEvents=[];recordStartTime=performance.now();recordSeconds=0;
    recordBtn.textContent='STOP 0s';
    recordBtn.classList.add('btn-rec-active');
    statusLabel.textContent='Recording live keys...';
    showToast('Recording started');
    recordTimerInterval=setInterval(()=>{
      recordSeconds++;
      recordBtn.textContent=`STOP ${recordSeconds}s`;
    },1000);
  } else {
    isRecording=false;clearInterval(recordTimerInterval);recordTimerInterval=null;
    recordBtn.textContent='REC';
    recordBtn.classList.remove('btn-rec-active');
    if(recordedEvents.length>0){
      replayBtn.style.display='inline-flex';
      statusLabel.textContent=`Recorded ${recordedEvents.length} notes (${recordSeconds}s)`;
      showToast(`Saved: ${recordedEvents.length} notes`);
    } else {
      statusLabel.textContent='No notes recorded';
      showToast('Nothing recorded');
    }
  }
});

replayBtn.addEventListener('click',()=>{
  if(recordedEvents.length) playSequence({title:'My Recording',notes:[...recordedEvents]});
});

const tutorBtn=document.getElementById('tutorBtn');

function clearTutorHighlights(){document.querySelectorAll('.tutor-target').forEach(el=>el.classList.remove('tutor-target'));}

function setTutorTarget(note){
  clearTutorHighlights();
  const el=keyboardEl.querySelector(`[data-note="${note}"]`)||keyboardEl.querySelector(`[data-base-note="${note}"]`);
  if(el) el.classList.add('tutor-target');
}

function advanceTutorStep(){
  tutorCurrentIndex++;
  if(tutorSong&&tutorCurrentIndex<tutorSong.notes.length){
    const n=tutorSong.notes[tutorCurrentIndex].note;
    statusLabel.textContent=`Tutor: Play ${n} (${tutorCurrentIndex+1}/${tutorSong.notes.length})`;
    setTutorTarget(n);
  } else {
    statusLabel.textContent='Tutor: Song complete!';
    clearTutorHighlights();tutorSong=null;
    showToast('Song complete!');
  }
}

tutorBtn.addEventListener('click',()=>{
  isTutorModeActive=!isTutorModeActive;
  tutorBtn.textContent=isTutorModeActive?'TUTOR: ON':'TUTOR: OFF';
  tutorBtn.classList.toggle('btn-active-toggle',isTutorModeActive);
  if(!isTutorModeActive){clearTutorHighlights();tutorSong=null;statusLabel.textContent='Ready';}
  else {statusLabel.textContent='Tutor: Select a song chip';showToast('Tutor On — pick a song');}
});

const chordModeBtn=document.getElementById('chordModeBtn');
chordModeBtn.addEventListener('click',()=>{
  isChordModeActive=!isChordModeActive;
  chordModeBtn.textContent=isChordModeActive?'CHORD: ON':'CHORD: OFF';
  chordModeBtn.classList.toggle('btn-active-toggle',isChordModeActive);
  showToast(isChordModeActive?'Chord Mode On':'Chord Mode Off');
});

const reverbBtn=document.getElementById('reverbBtn');
reverbBtn.addEventListener('click',()=>{
  isReverbActive=!isReverbActive;
  getAudioContext();
  if(reverbSend) reverbSend.gain.setValueAtTime(isReverbActive?0.35:0,audioCtx.currentTime);
  reverbBtn.textContent=isReverbActive?'REVERB: ON':'REVERB: OFF';
  reverbBtn.classList.toggle('active',isReverbActive);
  showToast(isReverbActive?'Reverb On':'Reverb Off');
});

document.getElementById('volSlider').addEventListener('input',e=>{
  if(masterGain) masterGain.gain.setValueAtTime(parseFloat(e.target.value),audioCtx.currentTime);
});

const scaleNotes={
  'C Major':['C','D','E','F','G','A','B'],
  'G Major':['G','A','B','C','D','E','F#'],
  'D Major':['D','E','F#','G','A','B','C#'],
  'A Minor':['A','B','C','D','E','F','G'],
  'D Minor':['D','E','F','G','A','A#','C'],
  'Pentatonic':['C','D','E','G','A']
};

function applyScale(key){
  document.querySelectorAll('.key-white,.key-black').forEach(k=>k.classList.remove('scale-dimmed'));
  if(key==='none'||!scaleNotes[key]) return;
  const valid=scaleNotes[key];
  document.querySelectorAll('.key-white,.key-black').forEach(k=>{
    const pitch=(k.dataset.baseNote||'').replace(/[0-9]/g,'');
    if(!valid.includes(pitch)) k.classList.add('scale-dimmed');
  });
}

document.getElementById('scaleSelect').addEventListener('change',e=>{
  applyScale(e.target.value);
  showToast(e.target.value!=='none'?e.target.value:'Scale Off');
});

const labelsBtn=document.getElementById('labelsBtn');
labelsBtn.addEventListener('click',()=>{
  labelsVisible=!labelsVisible;
  document.querySelectorAll('.key-label').forEach(l=>{l.style.visibility=labelsVisible?'visible':'hidden';});
  labelsBtn.textContent=labelsVisible?'LABELS: ON':'LABELS: OFF';
  labelsBtn.classList.toggle('active',labelsVisible);
  showToast(labelsVisible?'Labels On':'Labels Off');
});

const statusLabel=document.getElementById('statusLabel');
const stopBtn=document.getElementById('stopBtn');

function stopSong(){
  activeTimeouts.forEach(clearTimeout);activeTimeouts=[];currentPlaying=false;
  stopBtn.style.display='none';statusLabel.textContent='Stopped';
  document.querySelectorAll('.key-white.active,.key-black.active').forEach(k=>k.classList.remove('active'));
}

stopBtn.addEventListener('click',stopSong);

function playSequence(songData){
  stopSong();getAudioContext();
  if(isTutorModeActive){
    tutorSong=songData;tutorCurrentIndex=0;
    const first=songData.notes[0].note;
    statusLabel.textContent=`Tutor: Play ${first} (1/${songData.notes.length})`;
    setTutorTarget(first);
    return;
  }
  currentPlaying=true;stopBtn.style.display='inline-flex';statusLabel.textContent='Playing: '+songData.title;
  const bpmVal=parseInt(document.getElementById('bpmInput').value)||150;
  const speed=bpmVal/120;
  let maxEnd=0;
  songData.notes.forEach(item=>{
    const t=(item.time/speed)*1000;
    const dur=item.duration/speed;
    if(t+dur*1000>maxEnd) maxEnd=t+dur*1000;
    const tid=setTimeout(()=>{
      if(!currentPlaying) return;
      const f=getTransposedFrequency(item.note);
      if(f){playTone(f,dur,isSustainActive);highlightKey(item.note,Math.max(160,dur*800));}
    },t);
    activeTimeouts.push(tid);
  });
  activeTimeouts.push(setTimeout(()=>{
    if(currentPlaying){
      statusLabel.textContent='Done: '+songData.title;
      currentPlaying=false;stopBtn.style.display='none';
      showToast(songData.title+' — done');
    }
  },maxEnd+300));
}

function parseOfflineInput(raw){
  const text=raw.trim();
  if(!text) return null;
  const lower=text.toLowerCase();
  for(const [key,song] of Object.entries(songLibrary)) if(lower.includes(key.toLowerCase())) return song;
  const matched=text.toUpperCase().match(/\b([A-G][#]?[3-6])\b/g);
  if(matched?.length){
    let t=0;
    return {title:'Custom Sequence',notes:matched.map(n=>({note:n,duration:.5,time:t++ *.5}))};
  }
  return null;
}

document.getElementById('songForm').addEventListener('submit',e=>{
  e.preventDefault();
  const data=parseOfflineInput(document.getElementById('songInput').value);
  if(data) playSequence(data);
  else {statusLabel.textContent='Song not found';showToast('Song not found.\nTry a chip below.');}
});

const chipList=document.getElementById('chipList');
Object.entries(songLibrary).forEach(([key,song])=>{
  const btn=document.createElement('button');
  btn.type='button';btn.className='chip';btn.textContent=song.title;
  btn.addEventListener('click',()=>{
    document.getElementById('songInput').value=key;
    playSequence(song);
  });
  chipList.appendChild(btn);
});

const themeToggleBtn=document.getElementById('themeToggleBtn');
const themeIcon=document.getElementById('themeIcon');
let isDarkMode=false;

themeToggleBtn.addEventListener('click',()=>{
  isDarkMode=!isDarkMode;
  document.body.classList.toggle('dark',isDarkMode);
  document.getElementById('metaThemeColor').setAttribute('content',isDarkMode?'#090d16':'#f8f9fa');
  themeIcon.innerHTML=isDarkMode
    ?'<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>'
    :'<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>';
});

const sidebar=document.getElementById('sidebar');
const sidebarOverlay=document.getElementById('sidebarOverlay');
function openSidebar(){sidebar.classList.add('open');sidebarOverlay.classList.add('open');}
function closeSidebar(){sidebar.classList.remove('open');sidebarOverlay.classList.remove('open');}
document.getElementById('sidebarOpenBtn').addEventListener('click',openSidebar);
document.getElementById('sidebarCloseBtn').addEventListener('click',closeSidebar);
sidebarOverlay.addEventListener('click',closeSidebar);

document.querySelectorAll('.sidebar-item').forEach(item=>{
  item.addEventListener('click',()=>{
    const m=document.getElementById(item.getAttribute('data-modal'));
    if(m){closeSidebar();m.classList.add('active');}
  });
});

document.querySelectorAll('.modal-back-trigger').forEach(btn=>{
  btn.addEventListener('click',()=>btn.closest('.full-modal').classList.remove('active'));
});

const devBioText=document.getElementById('devBioText');
const bioToggleBtn=document.getElementById('bioToggleBtn');
let isBioExpanded=false;
bioToggleBtn.addEventListener('click',()=>{
  isBioExpanded=!isBioExpanded;
  devBioText.classList.toggle('expanded',isBioExpanded);
  bioToggleBtn.textContent=isBioExpanded?'Show less':'Show more';
});

const teamBioText=document.getElementById('teamBioText');
const teamBioToggleBtn=document.getElementById('teamBioToggleBtn');
let isTeamBioExpanded=false;
teamBioToggleBtn.addEventListener('click',()=>{
  isTeamBioExpanded=!isTeamBioExpanded;
  teamBioText.classList.toggle('expanded',isTeamBioExpanded);
  teamBioToggleBtn.textContent=isTeamBioExpanded?'Show less':'Show more';
});

function showToast(msg,dur){
  dur=dur||2400;
  const el=document.getElementById('centerToast');
  el.textContent=msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>el.classList.remove('show'),dur);
}

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  });
}