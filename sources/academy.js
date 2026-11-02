/* =========================================================
   ACADÉMIE — moteur : parcours, leçons, exercices, missions
   ========================================================= */
Object.assign(IC,{
 academie:'<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
 flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
 list:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/>',
 link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
 star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
 flame:'<path d="M12 22c4 0 7-2.8 7-6.8 0-3.6-2.4-5.6-3.6-8.2-.6 2-1.6 3-2.8 3.4C13 7 11.6 4.4 9 2c.4 3.6-1.6 5.6-3 7.4C4.8 11 5 13 5 15.2 5 19.2 8 22 12 22z"/>',
 heart:'<path d="M12 20s-7-4.4-9.2-8.6C1.2 8.2 3 4.5 6.6 4.5c2.1 0 3.5 1.2 5.4 3.2 1.9-2 3.3-3.2 5.4-3.2 3.6 0 5.4 3.7 3.8 6.9C19 15.6 12 20 12 20z"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
 trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'
});
const NODEINFO={lesson:["guides","Leçon"],form:["academie","Formation"],codes:["erreurs","Codes d'erreur"],steps:["list","Bons réflexes"],match:["link","Associer"],cmd:["scripts","Commandes"],mission:["flag","Mission"]};
const BADGE_IC={first:"check",mission1:"pannes",missions4:"sec",perfect:"star",streak3:"flame",streak7:"bolt",cisco:"cisco",q100:"guides",all:"academie"};

/* ---------- Progression ---------- */
const AC_KEY="academie-v1";
let AC=Object.assign({xp:0,days:{},done:{},badges:[],correct:0,missions:{},last:null},store.get(AC_KEY,{}));
let acDocRef=null,acPushT=null;
function dayKey(d=new Date()){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function acSave(){store.set(AC_KEY,AC);if(acDocRef){clearTimeout(acPushT);acPushT=setTimeout(()=>{acDocRef.set(JSON.parse(JSON.stringify(AC))).catch(()=>{})},1500)}}
async function acadSync(){try{if(!db||!user)return;const id=await user.id();if(!id)return;acDocRef=db.doc("data/users/"+id+"/academie");const s=await acDocRef.get();
 if(s.exists){const r=s.data();if((r.xp||0)>AC.xp){AC=Object.assign({xp:0,days:{},done:{},badges:[],correct:0,missions:{}},JSON.parse(JSON.stringify(r)));store.set(AC_KEY,AC);renderAcad()}else if(AC.xp>(r.xp||0))acSave()}else if(AC.xp)acSave()}catch(e){acDocRef=null}}
function streak(){let n=0;const d=new Date();if(!(AC.days[dayKey(d)]>0))d.setDate(d.getDate()-1);while(AC.days[dayKey(d)]>0){n++;d.setDate(d.getDate()-1)}return n}
function lvl(){const per=150,i=Math.min(Math.floor(AC.xp/per),LEVELS.length-1);return {i,name:LEVELS[i],into:i===LEVELS.length-1?per:AC.xp-i*per,per}}
const GOAL=50;
const nodeId=(u,i)=>u.id+"-"+i;
function unlocked(u,i){return i===0||!!AC.done[nodeId(u,i-1)]}
function unitDone(u){return u.nodes.filter((_,i)=>AC.done[nodeId(u,i)]).length}
function nextNode(){for(const u of UNITS)for(let i=0;i<u.nodes.length;i++)if(!AC.done[nodeId(u,i)]&&unlocked(u,i))return [u,i];return null}

/* ---------- Fabrique d'exercices ---------- */
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=(a,n)=>shuffle(a).slice(0,n);
function qcm(q,good,bad,x){const o=shuffle([good,...pick(bad.filter(b=>b&&b!==good),3)]);return {type:"qcm",q,o,a:o.indexOf(good),x}}
function codeQs(tools,n=6){const pool=ERR.filter(e=>tools.includes(e.t));return pick(pool,n).map((e,i)=>{const others=ERR.filter(x=>x!==e&&(x.t===e.t||tools.includes(x.t)));
 return i%2===0?qcm(`Que signifie « ${e.c} » ?`,e.n,others.map(x=>x.n),e.m):qcm(`Quel code correspond à : « ${e.n} » ?`,e.c,others.map(x=>x.c),e.m)})}
function firstStepQ(p){const bad=FICHES.filter(x=>x!==p&&x.st&&x.st[0]).map(x=>x.st[0].t);return qcm(`« ${p.t} » : que faites-vous en premier ?`,p.st[0].t,bad,p.st[0].d||"C'est la première étape de la fiche "+p.id+".")}
function causeQ(p){if(!p.cau||!p.cau.length)return null;const bad=FICHES.filter(x=>x.d!==p.d&&x.cau).flatMap(x=>x.cau);return qcm(`Quelle est une cause probable de : « ${p.t} » ?`,p.cau[0],bad,"Causes fréquentes : "+p.cau.slice(0,3).join(" ; ")+".")}
function orderQ(p){const it=p.st.slice(0,Math.min(5,p.st.length)).map(s=>s.t);return it.length>=3?{type:"order",q:`Remettez dans l'ordre les étapes : « ${p.t} »`,items:it,x:"C'est l'ordre de la fiche "+p.id+" : du plus simple au plus lourd."}:null}
function buildEx(u,node){const t=node.t;
 if(t==="lesson")return [...u.lesson.cards.map(c=>({type:"card",...c})),...u.lesson.qs.map(q=>({...q}))];
 if(t==="form"){const p=byId(node.f);const cards=[{type:"card",t:p.t,txt:(p.intro||(p.sym?"Ce que l'on voit : "+p.sym.join(" · ")+".":"")),banner:p.d==="guide"?"guide":p.d,tag:`Formation · ${p.id}`},
   ...p.st.map((s,i)=>({type:"card",t:`Étape ${i+1} : ${s.t}`,txt:s.d||"",ill:s.ill,cmd:s.cmd,tag:`${p.id} · étape ${i+1}/${p.st.length}`}))];
  return [...cards,orderQ(p),causeQ(p),p.st[0]?firstStepQ(p):null].filter(Boolean)}
 if(t==="codes")return codeQs(node.tools,6);
 if(t==="steps"){const fs=pick(FICHES.filter(p=>node.doms.includes(p.d)&&p.st&&p.st.length>=3),4);const out=[];fs.forEach((p,i)=>{const q=i===0?orderQ(p):i%2?firstStepQ(p):causeQ(p)||firstStepQ(p);if(q)out.push(q)});return out}
 if(t==="match"){let pairs;if(node.set==="keys")pairs=pick(byId("G-10").table,5).map(r=>[r[0],r[1]]);else pairs=pick(ERR.filter(e=>e.t===node.set),5).map(e=>[e.c,e.n]);
  return [{type:"match",q:node.set==="keys"?"Associez chaque raccourci à son action":"Associez chaque code à sa signification",pairs,x:"Bien joué !"},...(node.set==="keys"?[]:codeQs([node.set],3))]}
 if(t==="cmd")return pick(CMDX[node.set],5).map(c=>({type:"type",q:c.q,a:c.a,x:"Réponse : "+c.a[0]}));
 if(t==="mission"){const m=MISSIONS[node.m];return [{type:"brief",m:node.m},...m.steps.map(s=>({type:"mstep",m:node.m,...s}))]}
 return []}
function dailyEx(){const out=[...codeQs(Object.keys(ETOOLS),3)];pick(FICHES.filter(p=>p.st&&p.st.length>=3),3).forEach((p,i)=>{const q=i?firstStepQ(p):orderQ(p);if(q)out.push(q)});pick([...CMDX.win,...CMDX.net],2).forEach(c=>out.push({type:"type",q:c.q,a:c.a,x:"Réponse : "+c.a[0]}));return shuffle(out)}

/* ---------- Lecteur d'exercices ---------- */
let PL=null;
function startNode(ui,i){const u=UNITS[ui];const ex=buildEx(u,u.nodes[i]);PL={key:nodeId(u,i),title:u.t,kind:u.nodes[i].t,mission:u.nodes[i].m,col:u.col,q:ex,i:0,hearts:5,ok:0,ko:0,xp:0,start:Date.now()};openPL()}
function startDaily(){PL={key:"daily-"+dayKey(),title:"Défi du jour",kind:"daily",col:["#d9480f","#f59f00"],q:dailyEx(),i:0,hearts:5,ok:0,ko:0,xp:0,start:Date.now()};openPL()}
function startMission(id){const ui=UNITS.findIndex(u=>u.nodes.some(n=>n.m===id));const i=UNITS[ui].nodes.findIndex(n=>n.m===id);startNode(ui,i)}
function openPL(){const el=$("#player");el.hidden=false;el.style.setProperty("--u1",PL.col[0]);el.style.setProperty("--u2",PL.col[1]);document.documentElement.classList.add("noscroll");renderPL()}
function closePL(){$("#player").hidden=true;document.documentElement.classList.remove("noscroll");PL=null;renderAcad()}
function plHead(){const pct=Math.round(PL.i/PL.q.length*100);return `<div class="pl-top"><button class="pl-x" id="plx" aria-label="Quitter">${svgI("x",2.4)}</button><div class="pl-bar"><i style="width:${pct}%"></i></div><span class="pl-hearts">${svgI("heart",2)}<b>${PL.hearts}</b></span></div>`}
IC.x='<path d="M6 6l12 12M18 6 6 18"/>';
function renderPL(){const it=PL.q[PL.i];PL.sel=null;PL.done=false;PL.order=[];PL.mt={l:null,ok:new Set()};
 let body="";const t=it.type;
 if(t==="card"){const numM=/^(\d)\. /.exec(it.t);body=`<div class="pl-card ${it.banner?"":"plain"}">${it.banner?"":`<span class="pl-deco"></span>`}${it.banner?`<div class="pl-banner" style="${bannerStyle(it.banner)}"><span>${esc(it.tag||"")}</span><h2>${esc(it.t)}</h2></div>`:`${it.tag?`<div class="pl-tag">${esc(it.tag)}</div>`:""}${it.who?`<div class="pl-coach">${avatar(PEOPLE[it.who],64)}<div class="pl-say">${esc(it.txt)}</div></div>`:""}${numM?`<span class="pl-num">${numM[1]}</span>`:""}<h2 class="pl-h">${esc(numM?it.t.slice(3):it.t)}</h2>`}
  ${it.who?"":`<p class="pl-p">${esc(it.txt)}</p>`}${it.ill?`<div class="pl-ill">${ill(it.ill)}</div>`:""}${it.cmd?cmdHTML(it.cmd):""}</div>`}
 else if(t==="brief"){const m=MISSIONS[it.m],p=PEOPLE[m.who];body=`<div class="pl-brief"><div class="pl-brief-ph" style="${photoBg(p.ph,900,"linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(8,15,27,.9))",`linear-gradient(135deg,${p.col},#0e1a2b)`)}"><span class="pl-tag light">Mission</span><h2>${esc(m.t)}</h2></div>
  <div class="pl-brief-b">${avatar(p,72)}<div><b>${esc(p.name)}</b><span>${esc(p.role)}</span></div></div><p class="pl-p">${esc(m.brief)}</p><p class="note">Choisissez la bonne réaction à chaque étape. Une erreur coûte une vie, mais vous pouvez réessayer.</p></div>`}
 else if(t==="mstep"){const m=MISSIONS[it.m],p=PEOPLE[m.who];PL.opts=PL.opts&&PL.opts.key===PL.i?PL.opts:{key:PL.i,list:shuffle(it.c.map((c,k)=>({t:c[0],ok:!!c[1],fb:c[2],k}))),off:new Set()};
  body=`<div class="pl-chat">${avatar(p,60)}<div class="pl-bubble"><b>${esc(p.name)}</b>${esc(it.say)}</div></div><h2 class="pl-h">${esc(it.q)}</h2><div class="pl-opts">${PL.opts.list.map((o,k)=>`<button class="pl-opt" data-k="${k}" ${PL.opts.off.has(k)?"disabled":""}><kbd>${k+1}</kbd><span>${esc(o.t)}</span></button>`).join("")}</div>`}
 else if(t==="qcm"){body=`<h2 class="pl-h">${esc(it.q)}</h2><div class="pl-opts">${it.o.map((o,k)=>`<button class="pl-opt" data-k="${k}"><kbd>${k+1}</kbd><span>${esc(o)}</span></button>`).join("")}</div>`}
 else if(t==="order"){PL.bank=PL.bank&&PL.bank.key===PL.i?PL.bank:{key:PL.i,list:shuffle(it.items)};body=`<h2 class="pl-h">${esc(it.q)}</h2><p class="note">Touchez les étapes dans le bon ordre. Touchez une étape placée pour la retirer.</p><ol class="pl-line" id="plline"></ol><div class="pl-bank" id="plbank"></div>`}
 else if(t==="match"){PL.right=shuffle(it.pairs.map((p,k)=>k));body=`<h2 class="pl-h">${esc(it.q)}</h2><div class="pl-match"><div id="mL">${it.pairs.map((p,k)=>`<button class="pl-m" data-l="${k}">${esc(p[0])}</button>`).join("")}</div><div id="mR">${PL.right.map(k=>`<button class="pl-m" data-r="${k}">${esc(it.pairs[k][1])}</button>`).join("")}</div></div>`}
 else if(t==="type"){body=`<h2 class="pl-h">${esc(it.q)}</h2><div class="pl-type"><span class="mono">C:\\&gt;</span><input id="pltype" autocomplete="off" spellcheck="false" placeholder="Tapez la commande…"></div><p class="note">Majuscules et espaces en trop ne comptent pas.</p>`}
 const cta=t==="card"||t==="brief"?(t==="brief"?"Commencer la mission":"Continuer"):"Vérifier";
 $("#player").innerHTML=`<div class="pl-in">${plHead()}<div class="pl-body" data-t="${t}">${body}</div></div><div class="pl-foot" id="plfoot"><div class="pl-in pl-foot-in"><div class="pl-fb" id="plfb"></div><button class="btn primary big" id="plgo" ${t==="card"||t==="brief"?"":"disabled"}>${cta}</button></div></div>`;
 $("#plx").onclick=()=>{if(PL.i===0||confirmQuit())closePL()};
 const go=$("#plgo");
 if(t==="card"||t==="brief"){go.onclick=next;go.focus();return}
 if(t==="qcm"||t==="mstep"){$("#player").querySelectorAll(".pl-opt").forEach(b=>b.onclick=()=>{if(PL.done)return;$("#player").querySelectorAll(".pl-opt").forEach(x=>x.classList.remove("sel"));b.classList.add("sel");PL.sel=+b.dataset.k;go.disabled=false})}
 if(t==="order")renderOrder();
 if(t==="match")bindMatch(it);
 if(t==="type"){const inp=$("#pltype");inp.focus();inp.oninput=()=>{go.disabled=!inp.value.trim()}}
 go.onclick=check}
function confirmQuit(){const f=$("#plfb");if(f.dataset.q){return true}f.dataset.q="1";f.innerHTML=`<b>Quitter ?</b> Votre progression dans cette étape sera perdue. Recliquez sur la croix pour confirmer.`;f.className="pl-fb warn";return false}
function renderOrder(){const it=PL.q[PL.i];const go=$("#plgo");$("#plline").innerHTML=PL.order.map((s,k)=>`<li><button class="pl-chip on" data-o="${k}">${esc(s)}</button></li>`).join("")||`<li class="pl-ph">Les étapes choisies s'affichent ici</li>`;
 $("#plbank").innerHTML=PL.bank.list.map((s,k)=>`<button class="pl-chip" data-b="${k}" ${PL.order.includes(s)?"disabled":""}>${esc(s)}</button>`).join("");
 $("#plline").querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(PL.done)return;PL.order.splice(+b.dataset.o,1);renderOrder()});
 $("#plbank").querySelectorAll("[data-b]").forEach(b=>b.onclick=()=>{if(PL.done)return;PL.order.push(PL.bank.list[+b.dataset.b]);renderOrder()});
 go.disabled=PL.order.length!==it.items.length}
function bindMatch(it){const root=$("#player");root.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{if(PL.mt.ok.has(+b.dataset.l))return;root.querySelectorAll("[data-l]").forEach(x=>x.classList.remove("sel"));b.classList.add("sel");PL.mt.l=+b.dataset.l});
 root.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{const r=+b.dataset.r;if(PL.mt.l===null||PL.mt.ok.has(r))return;const L=root.querySelector(`[data-l="${PL.mt.l}"]`);
  if(r===PL.mt.l){PL.mt.ok.add(r);L.classList.remove("sel");L.classList.add("ok");b.classList.add("ok");L.disabled=b.disabled=true;PL.mt.l=null;
   if(PL.mt.ok.size===it.pairs.length){PL.ok++;PL.xp+=10;feedback(true,it.x||"Toutes les paires sont correctes.")}}
  else{b.classList.add("bad");L.classList.add("bad");setTimeout(()=>{b.classList.remove("bad");L.classList.remove("bad")},500);loseHeart()}})}
function loseHeart(){PL.hearts--;PL.ko++;const h=$("#player .pl-hearts b");if(h){h.textContent=PL.hearts;h.parentElement.classList.remove("hit");void h.offsetWidth;h.parentElement.classList.add("hit")}if(PL.hearts<=0)setTimeout(failPL,600)}
const normCmd=s=>norm(s).replace(/\s+/g," ").trim();
function check(){const it=PL.q[PL.i];let good=false,x=it.x||"",ans="";
 if(it.type==="qcm"){good=PL.sel===it.a;ans=it.o[it.a];$("#player").querySelectorAll(".pl-opt").forEach((b,k)=>{if(k===it.a)b.classList.add("ok");else if(k===PL.sel)b.classList.add("bad")})}
 if(it.type==="mstep"){const o=PL.opts.list[PL.sel];good=o.ok;x=o.fb;const b=$("#player").querySelectorAll(".pl-opt")[PL.sel];b.classList.add(good?"ok":"bad");if(!good)PL.opts.off.add(PL.sel)}
 if(it.type==="order"){good=PL.order.every((s,k)=>s===it.items[k]);ans=it.items.map((s,k)=>`${k+1}. ${s}`).join("  ·  ");$("#plline").classList.add(good?"ok":"bad")}
 if(it.type==="type"){const v=normCmd($("#pltype").value);good=it.a.some(a=>normCmd(a)===v);ans=it.a[0];$("#pltype").disabled=true;$("#player .pl-type").classList.add(good?"ok":"bad")}
 if(good){PL.ok++;PL.xp+=10}else{loseHeart();if(it.type!=="mstep")PL.q.push({...it,retry:true})}
 feedback(good,x,good?"":ans)}
function feedback(good,x,ans){PL.done=true;const f=$("#plfoot");f.className="pl-foot "+(good?"good":"bad");const praise=["Bravo !","Excellent !","Parfait !","Bien joué !","Exact !"];
 $("#plfb").className="pl-fb";$("#plfb").innerHTML=`<span class="pl-fi">${svgI(good?"check":"x",3)}</span><div><b>${good?praise[Math.floor(Math.random()*praise.length)]:"Pas tout à fait"}</b>${ans?`<span>Bonne réponse : ${esc(ans)}</span>`:""}${x?`<span>${esc(x)}</span>`:""}</div>`;
 const go=$("#plgo");go.disabled=false;const it=PL.q[PL.i];const again=!good&&it.type==="mstep";go.textContent=again?"Réessayer":"Continuer";go.onclick=again?()=>renderPL():next;go.focus()}
function next(){if(PL.hearts<=0)return failPL();PL.i++;if(PL.i>=PL.q.length)return finishPL();renderPL()}
function failPL(){$("#player").innerHTML=`<div class="pl-in pl-end"><div class="pl-end-ic bad">${svgI("heart",2)}</div><h2>Plus de vies</h2><p class="pl-p">Pas d'inquiétude : relisez la leçon ou la fiche, puis recommencez. C'est en se trompant qu'on apprend.</p><div class="pl-end-b"><button class="btn primary big" id="plre">Recommencer</button><button class="btn big" id="plq">Revenir au parcours</button></div></div>`;
 const k=PL.key;$("#plq").onclick=closePL;$("#plre").onclick=()=>{if(k.startsWith("daily"))startDaily();else{const[uid,i]=k.split("-");startNode(UNITS.findIndex(u=>u.id===uid),+i)}}}
function finishPL(){const perfect=PL.ko===0;const bonus=(PL.kind==="mission"?20:10)+(perfect?10:0);PL.xp+=bonus;const stars=perfect?3:PL.ko<=2?2:1;
 const before=lvl().i;const dk=dayKey();AC.days[dk]=(AC.days[dk]||0)+PL.xp;AC.xp+=PL.xp;AC.correct+=PL.ok;AC.last=dk;
 AC.done[PL.key]=Math.max(AC.done[PL.key]||0,stars);if(PL.kind==="mission")AC.missions[PL.mission]=Math.max(AC.missions[PL.mission]||0,stars);
 const nb=checkBadges(perfect);acSave();const up=lvl().i>before;const secs=Math.round((Date.now()-PL.start)/1000);const acc=Math.round(PL.ok/Math.max(1,PL.ok+PL.ko)*100);
 const m=PL.kind==="mission"?MISSIONS[PL.mission]:null;
 $("#player").innerHTML=`<canvas id="confetti" aria-hidden="true"></canvas><div class="pl-in pl-end"><div class="pl-end-ic">${svgI("trophy",2)}</div><h2>${m?"Mission réussie !":PL.kind==="daily"?"Défi du jour réussi !":"Étape terminée !"}</h2>
  ${m?`<p class="pl-p">${esc(m.end)}</p>`:""}<div class="pl-stars">${[1,2,3].map(s=>`<span class="${s<=stars?"on":""}">${svgI("star",1.6)}</span>`).join("")}</div>
  <div class="pl-kpis"><div><b>+${PL.xp}</b><span>XP</span></div><div><b>${acc} %</b><span>précision</span></div><div><b>${Math.floor(secs/60)}:${pad(secs%60)}</b><span>temps</span></div><div><b>${streak()}</b><span>jour${streak()>1?"s":""} de suite</span></div></div>
  ${up?`<div class="pl-up">${svgI("bolt",2)} Niveau supérieur : <b>${esc(lvl().name)}</b></div>`:""}
  ${nb.length?`<div class="pl-newb">${nb.map(b=>`<div class="badge on">${badgeSVG(b)}<b>${esc(b.t)}</b><span>Nouveau badge</span></div>`).join("")}</div>`:""}
  <div class="pl-end-b"><button class="btn primary big" id="plnext">Continuer</button></div></div>`;
 $("#plnext").onclick=closePL;$("#plnext").focus();confetti()}
function checkBadges(perfect){const has=new Set(AC.badges),add=id=>{if(!has.has(id)){AC.badges.push(id);has.add(id);got.push(BADGES.find(b=>b.id===id))}},got=[];
 if(Object.keys(AC.done).length)add("first");const ms=Object.keys(AC.missions).length;if(ms>=1)add("mission1");if(ms>=4)add("missions4");if(perfect)add("perfect");
 const s=streak();if(s>=3)add("streak3");if(s>=7)add("streak7");const cis=UNITS.filter(u=>u.id==="u6"||u.id==="u7");if(cis.every(u=>unitDone(u)===u.nodes.length))add("cisco");
 if(AC.correct>=100)add("q100");if(UNITS.every(u=>unitDone(u)===u.nodes.length))add("all");return got}
function badgeSVG(b){return `<span class="medal">${svgI(BADGE_IC[b.id]||"star",2)}</span>`}
function confetti(){if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;const c=$("#confetti");if(!c)return;const x=c.getContext("2d");c.width=innerWidth;c.height=innerHeight;
 const cols=["#d9480f","#ff922b","#4c7dff","#2f9e44","#f59f00","#9775fa"];const P2=Array.from({length:140},()=>({x:c.width/2,y:c.height*.35,vx:(Math.random()-.5)*14,vy:Math.random()*-12-4,s:4+Math.random()*6,c:cols[Math.floor(Math.random()*cols.length)],r:Math.random()*6}));let f=0;
 (function step(){if(!document.body.contains(c))return;x.clearRect(0,0,c.width,c.height);P2.forEach(p=>{p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.r+=.1;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);x.restore()});if(++f<160)requestAnimationFrame(step);else x.clearRect(0,0,c.width,c.height)})()}
document.addEventListener("keydown",e=>{if(!PL||$("#player").hidden)return;if(e.target&&e.target.id==="pltype"&&e.key!=="Enter")return;
 if(/^[1-4]$/.test(e.key)){const b=$("#player").querySelectorAll(".pl-opt")[+e.key-1];if(b&&!b.disabled)b.click()}
 if(e.key==="Enter"){const g=$("#plgo");if(g&&!g.disabled){e.preventDefault();g.click()}}
 if(e.key==="Escape"){$("#plx")?.click()}});

/* ---------- Vue Académie ---------- */
let acTab=store.get("actab","parcours");
function ring(v,max,size=64){const r=size/2-6,c=2*Math.PI*r,p=Math.min(1,v/max);return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="6"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#ffd43b" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-p)}" transform="rotate(-90 ${size/2} ${size/2})"/></svg>`}
function renderAcad(){if(!$("#v-academie"))return;const L=lvl(),s=streak(),today=AC.days[dayKey()]||0,nx=nextNode(),dailyDone=!!AC.done["daily-"+dayKey()];
 $("#ac-hero").innerHTML=`<div class="ac-hero" style="${photoBg("duo",1400,"linear-gradient(100deg,rgba(9,16,30,.95) 0%,rgba(9,16,30,.82) 48%,rgba(9,16,30,.25) 100%)","linear-gradient(135deg,#12213a,#1c3d8f)")}">
  <div class="ac-hero-l"><div class="eyebrow">Académie du dépannage</div><h2>Devenez la personne qui débloque tout le monde.</h2><p>Des leçons courtes, des formations sur les vraies réparations et des missions où vous dépannez des collègues. Cinq minutes par jour suffisent.</p>
   <div class="ac-cta">${nx?`<button class="btn primary big" id="ac-go">${svgI("bolt",2.2)}${AC.xp?"Continuer":"Commencer"} : ${esc(NODEINFO[nx[0].nodes[nx[1]].t][1])}</button>`:""}<button class="btn big ghost" id="ac-daily" ${dailyDone?"disabled":""}>${svgI("flame",2)}${dailyDone?"Défi du jour réussi":"Défi du jour"}</button></div></div>
  <div class="ac-stats"><div class="ac-stat">${ring(today,GOAL)}<div><b>${today}/${GOAL} XP</b><span>objectif du jour</span></div></div>
   <div class="ac-stat"><span class="ac-ic fl">${svgI("flame",2)}</span><div><b>${s} jour${s>1?"s":""}</b><span>série en cours</span></div></div>
   <div class="ac-stat"><span class="ac-ic">${svgI("star",2)}</span><div><b>${AC.xp} XP</b><span>${esc(L.name)}</span></div></div>
   <div class="ac-lvl"><span>Niveau ${L.i+1}</span><div class="ac-lvl-bar"><i style="width:${Math.round(L.into/L.per*100)}%"></i></div><span>${L.i<LEVELS.length-1?esc(LEVELS[L.i+1]):"Niveau max"}</span></div></div></div>`;
 $("#ac-go")&&($("#ac-go").onclick=()=>startNode(UNITS.indexOf(nx[0]),nx[1]));$("#ac-daily").onclick=startDaily;
 $("#ac-tabs").innerHTML=[["parcours","Parcours"],["missions","Missions"],["tableau","Mon tableau"]].map(([k,n])=>`<button class="ac-tab" aria-pressed="${k===acTab}" data-t="${k}">${n}</button>`).join("");
 $("#ac-tabs").querySelectorAll(".ac-tab").forEach(b=>b.onclick=()=>{acTab=b.dataset.t;store.set("actab",acTab);renderAcad()});
 const B=$("#ac-body");
 if(acTab==="parcours"){const OFF=[0,70,105,70,0,-70,-105,-70];
  B.innerHTML=`<div class="units">${UNITS.map((u,ui)=>{const dn=unitDone(u);return `<section class="unit"><div class="unit-h" style="${photoBg(u.ph,1200,`linear-gradient(100deg,${u.col[0]}f2 0%,${u.col[0]}cc 45%,${u.col[1]}66 100%)`,`linear-gradient(135deg,${u.col[0]},${u.col[1]})`)}">
   <div><span class="unit-n">Parcours ${ui+1}</span><h3>${esc(u.t)}</h3><p>${esc(u.d)}</p></div><div class="unit-p"><b>${dn}/${u.nodes.length}</b><div class="unit-bar"><i style="width:${dn/u.nodes.length*100}%"></i></div></div></div>
   <div class="path">${u.nodes.map((n,i)=>{const k=nodeId(u,i),st=AC.done[k]||0,open=unlocked(u,i),cur=open&&!st&&(i===0||AC.done[nodeId(u,i-1)]);const inf=NODEINFO[n.t];const lab=n.t==="form"?byId(n.f).t:n.t==="mission"?MISSIONS[n.m].t:inf[1];
    return `<div class="pnode" style="--off:${OFF[i%OFF.length]}px"><button class="pbtn ${st?"done":open?"open":"locked"} ${cur?"cur":""}" data-u="${ui}" data-i="${i}" ${open?"":"disabled"} style="--c1:${u.col[0]};--c2:${u.col[1]}" aria-label="${esc(inf[1]+" : "+lab)}">${svgI(open?inf[0]:"lock",2)}${cur?`<span class="pstart">${st?"Refaire":"Commencer"}</span>`:""}</button>
    ${st?`<span class="pstars">${[1,2,3].map(s=>`<i class="${s<=st?"on":""}"></i>`).join("")}</span>`:""}<span class="plab"><em>${esc(inf[1])}</em>${lab===inf[1]?"":esc(lab)}</span></div>`}).join("")}</div></section>`}).join("")}</div>`;
  B.querySelectorAll(".pbtn").forEach(b=>b.onclick=()=>startNode(+b.dataset.u,+b.dataset.i))}
 else if(acTab==="missions"){B.innerHTML=`<div class="missions">${Object.entries(MISSIONS).map(([id,m])=>{const p=PEOPLE[m.who],st=AC.missions[id]||0,u=UNITS.find(u=>u.nodes.some(n=>n.m===id));return `<article class="mcard"><div class="mcard-ph" style="${photoBg(p.ph,700,"linear-gradient(180deg,rgba(0,0,0,0) 35%,rgba(8,15,27,.85))",`linear-gradient(135deg,${u.col[0]},${u.col[1]})`)}"><span class="pl-tag light">${esc(u.t)}</span>${st?`<span class="mdone">${svgI("check",3)} Réussie</span>`:""}</div>
   <div class="mcard-b"><div class="mcard-who">${avatar(p,44)}<div><b>${esc(p.name)}</b><span>${esc(p.role)}</span></div></div><h3>${esc(m.t)}</h3><p>${esc(m.brief)}</p><div class="mcard-f"><span class="pstars">${[1,2,3].map(s=>`<i class="${s<=st?"on":""}"></i>`).join("")}</span><button class="btn primary" data-m="${id}">${st?"Rejouer":"Lancer la mission"}</button></div></div></article>`}).join("")}</div>`;
  B.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>startMission(b.dataset.m))}
 else{const days=[...Array(14)].map((_,k)=>{const d=new Date();d.setDate(d.getDate()-13+k);return [d,AC.days[dayKey(d)]||0]});const mx=Math.max(GOAL,...days.map(d=>d[1]));
  const totalNodes=UNITS.reduce((a,u)=>a+u.nodes.length,0),doneNodes=UNITS.reduce((a,u)=>a+unitDone(u),0);
  B.innerHTML=`<div class="kpis ac-k"><div><b>${AC.xp}</b><span>XP au total</span></div><div><b>${doneNodes}/${totalNodes}</b><span>étapes terminées</span></div><div><b>${Object.keys(AC.missions).length}/${Object.keys(MISSIONS).length}</b><span>missions réussies</span></div><div><b>${AC.correct}</b><span>bonnes réponses</span></div></div>
  <div class="ac-grid"><div class="card"><h3 class="res-sub">Mes compétences par parcours</h3><div class="tbl-wrap" style="margin-top:10px;border:0"><table class="j skill"><thead><tr><th>Parcours</th><th>Étapes</th><th>Étoiles</th><th>Maîtrise</th></tr></thead><tbody>
   ${UNITS.map(u=>{const dn=unitDone(u),stars=u.nodes.reduce((a,_,i)=>a+(AC.done[nodeId(u,i)]||0),0),pct=Math.round(stars/(u.nodes.length*3)*100);return `<tr><td><span class="sk-dot" style="background:${u.col[0]}"></span><b>${esc(u.t)}</b></td><td class="num">${dn}/${u.nodes.length}</td><td class="num">${stars}/${u.nodes.length*3}</td><td style="min-width:140px"><div class="unit-bar dark"><i style="width:${pct}%;background:${u.col[0]}"></i></div><span class="note">${pct} %</span></td></tr>`}).join("")}
   </tbody></table></div></div>
   <div class="card"><h3 class="res-sub">Activité des 14 derniers jours</h3><div class="actv">${days.map(([d,v])=>`<div class="actv-c" title="${dayKey(d)} : ${v} XP"><i style="height:${Math.max(3,v/mx*100)}%" class="${v>=GOAL?"hit":""}"></i><span>${["D","L","M","M","J","V","S"][d.getDay()]}</span></div>`).join("")}</div><p class="note" style="margin-top:8px">Les barres orange atteignent l'objectif de ${GOAL} XP.</p></div></div>
  <div class="card" style="margin-top:16px"><h3 class="res-sub">Badges</h3><div class="badges">${BADGES.map(b=>`<div class="badge ${AC.badges.includes(b.id)?"on":""}">${badgeSVG(b)}<b>${esc(b.t)}</b><span>${esc(b.d)}</span></div>`).join("")}</div></div>
  <div style="margin-top:16px"><button class="btn" id="ac-reset">Remettre ma progression à zéro</button> <span class="note" id="ac-reset-n"></span></div>`;
  $("#ac-reset").onclick=e=>{const b=e.currentTarget;if(!b.dataset.c){b.dataset.c="1";b.textContent="Confirmer la remise à zéro";$("#ac-reset-n").textContent="Toute la progression sera effacée.";return}AC={xp:0,days:{},done:{},badges:[],correct:0,missions:{},last:null};acSave();renderAcad();toast("Progression remise à zéro")}}}
(()=>{const nb=document.querySelector('#nav [data-v="academie"] svg');if(nb)nb.innerHTML=IC.academie})();
