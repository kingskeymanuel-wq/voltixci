/* =========================================================
   INCIDENTS RCC — suivi, traçabilité et rapport par période
   claude.ai : base partagée (db) · web : enregistré sur l'appareil
   ========================================================= */
IC.rcc='<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>';
let RC={mode:"",tickets:[],people:[],tab:store.get("rcc-tab","rapport"),from:"",to:"",q:"",fo:"",fs:"",fe:"",ready:false,unsub:[]};
const RCSTAT={"Signalé":"neutral","Ticket envoyé":"info","En cours":"maj","Résolu":"min"};
const fmtD=s=>{if(!s)return"—";const[y,m,d]=s.split("-");return `${d}/${m}/${y}`};
const MOISF=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
function qRange(y,q){const s=new Date(y,(q-1)*3,1),e=new Date(y,q*3,0);return [iso(s),iso(e)]}
function setPeriod(from,to){RC.from=from;RC.to=to;store.set("rcc-period",[from,to]);renderRCC()}
(()=>{const p=store.get("rcc-period",null);if(p){RC.from=p[0];RC.to=p[1]}else{const n=new Date();const[a,b]=qRange(n.getFullYear(),Math.floor(n.getMonth()/3)+1);RC.from=a;RC.to=b}})();

/* ---------- Stockage ---------- */
function rccLocalSave(){store.set("rcc-v1",{tickets:RC.tickets,people:RC.people})}
async function rccInit(){if(RC.mode)return;
 if(IN_CLAUDE&&db){RC.mode="db";try{
  RC.unsub.push(db.collection("rcc").onSnapshot(s=>{RC.tickets=s.docs.map(d=>({...d.data(),_id:d.id}));RC.ready=true;renderRCC()},()=>{RC.ready=true;renderRCC()}));
  RC.unsub.push(db.doc("rccmeta/people").onSnapshot(s=>{RC.people=(s.exists&&s.data().list)||[];renderRCC()},()=>{}));
  setTimeout(()=>{if(!RC.ready){RC.ready=true;renderRCC()}},10000)}catch(e){RC.mode=""}}
 if(!RC.mode){RC.mode="local";const v=store.get("rcc-v1",{tickets:[],people:[]});RC.tickets=v.tickets||[];RC.people=v.people||[];RC.ready=true}
 renderRCC()}
async function rccSaveTicket(t){t.maj=new Date().toISOString();
 if(RC.mode==="db"){const id=t._id||("t"+Date.now().toString(36)+Math.random().toString(36).slice(2,6));const body=JSON.parse(JSON.stringify(t));delete body._id;await db.collection("rcc").doc(id).set(body);t._id=id;return}
 if(!t._id){t._id="t"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);RC.tickets.push(t)}else{const i=RC.tickets.findIndex(x=>x._id===t._id);if(i>=0)RC.tickets[i]=t}rccLocalSave();renderRCC()}
async function rccDelete(id){if(RC.mode==="db"){await db.collection("rcc").doc(id).delete();return}RC.tickets=RC.tickets.filter(t=>t._id!==id);rccLocalSave();renderRCC()}
async function rccSavePeople(){if(RC.mode==="db"){await db.doc("rccmeta/people").set({list:RC.people});return}rccLocalSave();renderRCC()}

/* ---------- Calculs ---------- */
function inPeriod(t){return t.date&&(!RC.from||t.date>=RC.from)&&(!RC.to||t.date<=RC.to)}
function periodTickets(){return RC.tickets.filter(t=>!t.doublon&&inPeriod(t))}
function countBy(list,fn){const m=new Map();list.forEach(t=>{const ks=[].concat(fn(t));(ks.length?ks:["Non renseigné"]).forEach(k=>m.set(k,(m.get(k)||0)+1))});return [...m.entries()].sort((a,b)=>(a[0]==="Non renseigné")-(b[0]==="Non renseigné")||b[1]-a[1])}
const pct=(n,d)=>d?Math.round(n/d*1000)/10:0;
const fmtP=v=>(Math.round(v*10)/10).toString().replace(".",",")+" %";
function personTeam(a){const p=RC.people.find(x=>x.alias===a);return p&&p.equipe}
function teamsOf(t){const s=new Set(t.equipes||[]);(t.personnes||[]).forEach(a=>{const e=personTeam(a);if(e)s.add(e)});return [...s]}
function delayDays(t){if(!t.resolu||!t.date)return null;const d=(new Date(t.resolu)-new Date(t.date))/864e5;return d>=0?d:null}
function bars(rows,total,opt={}){const max=Math.max(1,...rows.map(r=>r[1]));const lim=opt.limit||rows.length;
 return `<div class="hb">${rows.slice(0,lim).map(([k,v])=>{const na=k==="Non renseigné";return `<div class="hb-r ${na?"na":""}" title="${esc(k)} : ${v} incident${v>1?"s":""} (${fmtP(pct(v,total))})"><span class="hb-l">${esc(k)}</span><span class="hb-t"><i style="width:${v/max*100}%"></i></span><span class="hb-v"><b>${fmtP(pct(v,total))}</b><em>${v}</em></span></div>`}).join("")}${rows.length>lim?`<div class="note">+ ${rows.length-lim} autres</div>`:""}</div>`}
function monthCols(list){if(!RC.from||!RC.to)return"";const s=new Date(RC.from),e=new Date(RC.to);const ms=[];let d=new Date(s.getFullYear(),s.getMonth(),1);while(d<=e&&ms.length<24){ms.push([d.getFullYear(),d.getMonth()]);d=new Date(d.getFullYear(),d.getMonth()+1,1)}
 const c=ms.map(([y,m])=>list.filter(t=>{const x=new Date(t.date);return x.getFullYear()===y&&x.getMonth()===m}).length);const max=Math.max(1,...c);
 return `<div class="mc">${ms.map(([y,m],i)=>`<div class="mc-c" title="${MOISF[m]} ${y} : ${c[i]} incident${c[i]>1?"s":""}"><span class="mc-a"><span class="mc-v">${c[i]||""}</span><i style="height:${Math.max(c[i]?3:0,c[i]/max*100)}%"></i></span><span class="mc-l">${MOISF[m]}</span></div>`).join("")}</div>`}
function groups(list){const m=new Map();list.forEach(t=>{const k=t.app+"||"+t.cat;if(!m.has(k))m.set(k,[]);m.get(k).push(t)});return [...m.entries()].map(([k,v])=>({app:v[0].app,cat:v[0].cat,outil:v[0].outil,list:v.sort((a,b)=>a.date<b.date?-1:1)})).sort((a,b)=>b.list.length-a.list.length)}
function periodLabel(){if(!RC.from||!RC.to)return "toute la période";for(let q=1;q<=4;q++){const y=+RC.from.slice(0,4);const[a,b]=qRange(y,q);if(a===RC.from&&b===RC.to)return `T${q} ${y} (du ${fmtD(a)} au ${fmtD(b)})`}if(RC.from.endsWith("-01-01")&&RC.to.endsWith("-12-31")&&RC.from.slice(0,4)===RC.to.slice(0,4))return `l'année ${RC.from.slice(0,4)}`;return `du ${fmtD(RC.from)} au ${fmtD(RC.to)}`}
function synthText(L){if(!L.length)return `Aucun incident enregistré pour ${periodLabel()}.`;const o=countBy(L,t=>t.outil),a=countBy(L,t=>t.app),c=countBy(L,t=>t.cat),tm=countBy(L,teamsOf).filter(x=>x[0]!=="Non renseigné"),pp=countBy(L,t=>t.personnes||[]).filter(x=>x[0]!=="Non renseigné");
 const res=L.filter(t=>t.statut==="Résolu").length,tk=L.filter(t=>t.num).length,maj=L.filter(t=>t.majeur).length;const dl=L.map(delayDays).filter(x=>x!==null);
 let s=`Rapport des incidents du contact center — ${periodLabel()}\n\n• ${L.length} incident${L.length>1?"s":""} enregistré${L.length>1?"s":""}, dont ${maj} majeur${maj>1?"s":""} (perte de réseau, lignes injoignables, toutes applications).\n• ${tk} avec un ticket (${fmtP(pct(tk,L.length))}) ; ${res} résolu${res>1?"s":""} (${fmtP(pct(res,L.length))}).${dl.length?`\n• Délai moyen de résolution : ${(dl.reduce((x,y)=>x+y,0)/dl.length).toFixed(1).replace(".",",")} jour(s).`:""}\n• Outil le plus touché : ${o[0][0]} (${fmtP(pct(o[0][1],L.length))}), puis ${o[1]?o[1][0]+" ("+fmtP(pct(o[1][1],L.length))+")":"—"}.\n• Application la plus touchée : ${a[0][0]} (${a[0][1]} incident${a[0][1]>1?"s":""}).\n• Type d'incident le plus fréquent : ${c[0][0]} (${fmtP(pct(c[0][1],L.length))}).`;
 if(tm.length)s+=`\n• Équipe la plus concernée : ${tm[0][0]} (${fmtP(pct(tm[0][1],L.length))} des incidents).`;if(pp.length)s+=`\n• Personne la plus concernée : ${pp[0][0]} (${pp[0][1]} incident${pp[0][1]>1?"s":""}).`;
 const g=groups(L).filter(x=>x.list.length>=2).slice(0,3);if(g.length)s+=`\n\nIncidents récurrents :\n${g.map(x=>`– ${x.app} · ${x.cat} : ${x.list.length} fois (${x.list.map(t=>fmtD(t.date)).join(", ")})`).join("\n")}`;return s}

/* ---------- Vue ---------- */
function renderRCC(){const root=$("#v-rcc");if(!root||root.hidden&&RC._r)return;RC._r=true;
 const years=[...new Set(RC.tickets.map(t=>t.date&&+t.date.slice(0,4)).filter(Boolean))].sort();const Y=+(RC.from||String(new Date().getFullYear())).slice(0,4);if(!years.includes(Y))years.push(Y);years.sort();
 const qs=[1,2,3,4].map(q=>{const[a,b]=qRange(Y,q);return `<button class="chip" aria-pressed="${a===RC.from&&b===RC.to}" data-pf="${a}" data-pt="${b}">T${q} ${Y}</button>`}).join("")+`<button class="chip" aria-pressed="${RC.from===Y+"-01-01"&&RC.to===Y+"-12-31"}" data-pf="${Y}-01-01" data-pt="${Y}-12-31">Année ${Y}</button><button class="chip" data-pf="" data-pt="">Tout</button>`;
 $("#rcc-hero").innerHTML=`<div class="rcc-hero" style="${photoBg("plateau",1400,"linear-gradient(100deg,rgba(9,16,30,.95) 0%,rgba(9,16,30,.85) 55%,rgba(9,16,30,.4) 100%)","linear-gradient(135deg,#12213a,#0b7285)")}">
  <div><div class="eyebrow">Pilotage du contact center</div><h2>Incidents RCC</h2><p>Traçabilité de chaque incident, du signalement à la résolution, et rapport par période : outils, équipes et personnes les plus touchés.</p></div>
  <div class="rcc-period"><span class="mono">Période du rapport</span><div class="chips">${qs}</div>
   <div class="rcc-dates"><label>Du<input class="f dark" type="date" id="rc-from" value="${RC.from}"></label><label>Au (fin de période)<input class="f dark" type="date" id="rc-to" value="${RC.to}"></label>${years.length>1?`<label>Année<select class="f dark" id="rc-year">${years.map(y=>`<option ${y===Y?"selected":""}>${y}</option>`).join("")}</select></label>`:""}</div>
   <div class="rcc-store">${RC.mode==="db"?"Base partagée avec l'équipe":"Données enregistrées sur cet appareil"} · ${RC.tickets.filter(t=>!t.doublon).length} incidents au total</div></div></div>`;
 $("#rcc-hero").querySelectorAll("[data-pf]").forEach(b=>b.onclick=()=>setPeriod(b.dataset.pf,b.dataset.pt));
 $("#rc-from").onchange=e=>setPeriod(e.target.value,RC.to);$("#rc-to").onchange=e=>setPeriod(RC.from,e.target.value);
 $("#rc-year")&&($("#rc-year").onchange=e=>{const y=e.target.value;const q=RC.from?Math.floor((+RC.from.slice(5,7)-1)/3)+1:1;const[a,b]=qRange(+y,q);setPeriod(a,b)});
 $("#rcc-tabs").innerHTML=[["rapport","Rapport"],["tickets","Tickets & traçabilité"],["personnes","Personnes & équipes"],["import","Importer / exporter"]].map(([k,n])=>`<button class="ac-tab" aria-pressed="${k===RC.tab}" data-t="${k}">${n}</button>`).join("");
 $("#rcc-tabs").querySelectorAll(".ac-tab").forEach(b=>b.onclick=()=>{RC.tab=b.dataset.t;store.set("rcc-tab",RC.tab);renderRCC()});
 const B=$("#rcc-body");
 if(!RC.ready){B.innerHTML=`<div class="card empty">Chargement des incidents…</div>`;return}
 if(!RC.tickets.length&&RC.tab!=="import"&&RC.tab!=="personnes"){B.innerHTML=`<div class="card rcc-empty"><div class="g-end-ic">${svgI("rcc",2)}</div><h3>Aucun incident pour l'instant</h3><p>Importez votre fichier Excel d'incidents (date, n° de ticket, description, application) ou ajoutez un premier incident.</p><div class="ac-cta"><button class="btn primary big" data-rt="import">Importer le fichier Excel</button><button class="btn big" id="rc-new0">+ Nouvel incident</button></div></div>`;
  B.querySelector("[data-rt]").onclick=()=>{RC.tab="import";renderRCC()};$("#rc-new0").onclick=()=>openRcc(null);return}
 if(RC.tab==="rapport")return renderReport(B);
 if(RC.tab==="tickets")return renderTickets(B);
 if(RC.tab==="personnes")return renderPeople(B);
 renderImport(B)}

function renderReport(B){const L=periodTickets();const n=L.length;
 if(!n){B.innerHTML=`<div class="card rcc-empty"><h3>Aucun incident sur ${esc(periodLabel())}</h3><p>Choisissez une autre période ci-dessus.</p></div>`;return}
 const tk=L.filter(t=>t.num).length,res=L.filter(t=>t.statut==="Résolu").length,maj=L.filter(t=>t.majeur).length,dl=L.map(delayDays).filter(x=>x!==null);
 const tm=countBy(L,teamsOf),pp=countBy(L,t=>t.personnes||[]);const naT=(tm.find(x=>x[0]==="Non renseigné")||[0,0])[1],naP=(pp.find(x=>x[0]==="Non renseigné")||[0,0])[1];
 const G=groups(L);const big=G.filter(g=>g.list.length>=2).slice(0,6);
 B.innerHTML=`<div class="rcc-sum"><div><h3>Rapport · ${esc(periodLabel())}</h3><p class="note">Les doublons du fichier sont exclus. Un incident peut concerner plusieurs équipes ou personnes : leurs pourcentages peuvent dépasser 100 % au total.</p></div><div class="ac-cta"><button class="btn primary" id="rc-xls">${svgI("guides",2)}Exporter le rapport (Excel)</button><button class="btn" id="rc-copy">Copier la synthèse</button></div></div>
 <div class="kpis rcc-k"><div><b>${n}</b><span>incidents</span></div><div><b>${maj}</b><span>incidents majeurs</span></div><div><b>${fmtP(pct(tk,n))}</b><span>avec un ticket (${tk})</span></div><div><b>${fmtP(pct(res,n))}</b><span>résolus (${res})</span></div><div><b>${dl.length?(dl.reduce((a,b)=>a+b,0)/dl.length).toFixed(1).replace(".",",")+" j":"—"}</b><span>délai moyen de résolution</span></div></div>
 ${res===0?alertHTML("info","Aucun incident de la période n'a encore de date de résolution. Ouvrez les tickets dans l'onglet « Tickets & traçabilité » pour renseigner le statut et la date de résolution : le taux de résolution et le délai moyen se calculeront tout seuls."):""}
 <div class="rcc-grid">
  <div class="card"><h4 class="res-sub">Par outil</h4><p class="note">Part des incidents de la période</p>${bars(countBy(L,t=>t.outil),n)}</div>
  <div class="card"><h4 class="res-sub">Par type d'incident</h4><p class="note">Part des incidents de la période</p>${bars(countBy(L,t=>t.cat),n)}</div>
  <div class="card"><h4 class="res-sub">Par équipe concernée</h4><p class="note">${naT?`${naT} incident${naT>1?"s":""} sans équipe renseignée`:"Toutes les équipes sont renseignées"}</p>${bars(tm,n)}</div>
  <div class="card"><h4 class="res-sub">Par personne concernée</h4><p class="note">${naP?`${naP} incident${naP>1?"s":""} sans personne renseignée`:"Toutes les personnes sont renseignées"}</p>${bars(pp,n,{limit:10})}</div>
  <div class="card"><h4 class="res-sub">Applications les plus touchées</h4><p class="note">Nombre et part des incidents</p>${bars(countBy(L,t=>t.app),n,{limit:10})}</div>
  <div class="card"><h4 class="res-sub">Évolution par mois</h4><p class="note">Nombre d'incidents</p>${monthCols(L)}</div>
 </div>
 <div class="card" style="margin-top:16px"><h4 class="res-sub">Grands incidents de la période</h4><p class="note">Incidents qui reviennent sur la même application, et incidents majeurs.</p>
  <div class="tbl-wrap" style="margin-top:10px"><table class="j"><thead><tr><th>Application</th><th>Type</th><th>Fois</th><th>Part</th><th>Dates</th></tr></thead><tbody>
  ${big.map(g=>`<tr><td><b>${esc(g.app)}</b><div class="sub">${esc(g.outil)}</div></td><td>${esc(g.cat)}</td><td class="num">${g.list.length}</td><td class="num">${fmtP(pct(g.list.length,n))}</td><td>${g.list.map(t=>`<button class="link" data-rid="${t._id}">${fmtD(t.date)}</button>`).join(" · ")}</td></tr>`).join("")||`<tr><td colspan="5" class="empty">Aucun incident récurrent sur cette période.</td></tr>`}
  </tbody></table></div>
  ${maj?`<h5 class="rs-h" style="margin-top:14px">Incidents majeurs</h5><div class="rcc-maj">${L.filter(t=>t.majeur).sort((a,b)=>a.date<b.date?-1:1).map(t=>`<button class="rcc-chip" data-rid="${t._id}"><span class="mono">${fmtD(t.date)}</span>${esc(t.desc)}</button>`).join("")}</div>`:""}
 </div>`;
 B.querySelectorAll("[data-rid]").forEach(b=>b.onclick=()=>openRcc(b.dataset.rid));
 $("#rc-copy").onclick=e=>copyText(synthText(L),e.currentTarget);$("#rc-xls").onclick=()=>exportReport(L)}

function renderTickets(B){const all=RC.tickets.filter(t=>RC.fe==="__all"||inPeriod(t)||!t.date);
 const q=norm(RC.q);let L=all.filter(t=>(!RC.fo||t.outil===RC.fo)&&(!RC.fs||t.statut===RC.fs)&&(!RC.fe||RC.fe==="__all"||teamsOf(t).includes(RC.fe))&&(!q||norm([t.num,t.desc,t.app,t.outil,...(t.personnes||[])].join(" ")).includes(q))).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
 const outils=[...new Set(RC.tickets.map(t=>t.outil))].sort();const teams=[...new Set([...RCC_TEAMS,...RC.people.map(p=>p.equipe).filter(Boolean)])];
 B.innerHTML=`<div class="filters"><div class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="rc-q" type="search" value="${esc(RC.q)}" placeholder="N° de ticket, application, description, alias…" aria-label="Rechercher un incident"></div>
  <select class="f" id="rc-fo" style="width:auto" aria-label="Outil"><option value="">Tous les outils</option>${outils.map(o=>`<option ${o===RC.fo?"selected":""}>${esc(o)}</option>`).join("")}</select>
  <select class="f" id="rc-fs" style="width:auto" aria-label="Statut"><option value="">Tous les statuts</option>${RCC_STATUS.map(o=>`<option ${o===RC.fs?"selected":""}>${o}</option>`).join("")}</select>
  <select class="f" id="rc-fe" style="width:auto" aria-label="Équipe"><option value="">Toutes les équipes</option>${teams.map(o=>`<option ${o===RC.fe?"selected":""}>${esc(o)}</option>`).join("")}</select>
  <button class="btn primary" id="rc-new">+ Nouvel incident</button></div>
  <p class="note" style="margin:0 0 10px">${L.length} ligne${L.length>1?"s":""}${L.filter(t=>t.doublon).length?` (dont ${L.filter(t=>t.doublon).length} doublon${L.filter(t=>t.doublon).length>1?"s":""}, grisés)`:""} · ${esc(periodLabel())} · cliquez sur une ligne pour suivre ou compléter l'incident</p>
  <div class="tbl-wrap"><table class="j rcc-t"><thead><tr><th>Date</th><th>Ticket</th><th>Incident</th><th>Outil · application</th><th>Équipes · personnes</th><th>Statut</th></tr></thead><tbody>
  ${L.map(t=>`<tr data-rid="${t._id}" class="${t.doublon?"dbl":""}"><td class="num">${fmtD(t.date)}${t.fin&&t.fin!==t.date?`<div class="sub">→ ${fmtD(t.fin)}</div>`:""}</td><td class="num">${t.num?esc(t.num):`<span class="sub">sans ticket</span>`}</td>
   <td style="min-width:240px"><b>${esc(t.desc)}</b>${t.majeur?` <span class="pill crit">Majeur</span>`:""}${t.doublon?` <span class="pill neutral">Doublon</span>`:""}${t.notes&&t.notes.length&&!t.doublon?`<div class="sub warn">⚠ ${esc(t.notes[0])}${t.notes.length>1?` (+${t.notes.length-1})`:""}</div>`:""}</td>
   <td><b>${esc(t.outil)}</b><div class="sub">${esc(t.app)}${t.appDeduite?" (déduite)":""}</div></td>
   <td>${teamsOf(t).map(e=>`<span class="pill neutral">${esc(e)}</span>`).join(" ")||`<span class="sub">à renseigner</span>`}${(t.personnes||[]).length?`<div class="sub">${t.personnes.map(esc).join(", ")}</div>`:""}</td>
   <td><span class="pill ${RCSTAT[t.statut]||"neutral"}">${esc(t.statut)}</span>${t.resolu?`<div class="sub">le ${fmtD(t.resolu)}</div>`:""}</td></tr>`).join("")||`<tr><td colspan="6" class="empty">Aucun incident ne correspond aux filtres.</td></tr>`}
  </tbody></table></div>`;
 const rq=$("#rc-q");rq.oninput=()=>{RC.q=rq.value;clearTimeout(rq._t);rq._t=setTimeout(()=>{renderTickets(B);const n=$("#rc-q");n.focus();n.setSelectionRange(n.value.length,n.value.length)},250)};
 $("#rc-fo").onchange=e=>{RC.fo=e.target.value;renderTickets(B)};$("#rc-fs").onchange=e=>{RC.fs=e.target.value;renderTickets(B)};$("#rc-fe").onchange=e=>{RC.fe=e.target.value;renderTickets(B)};
 $("#rc-new").onclick=()=>openRcc(null);B.querySelectorAll("tr[data-rid]").forEach(r=>r.onclick=()=>openRcc(r.dataset.rid))}

function aliasFor(nom){const p=norm(nom).replace(/[^a-z\s-]/g,"").trim().split(/\s+/);if(!p[0])return"";let a=(p.length>1?p[0][0]+p[p.length-1]:p[0]).slice(0,12);let k=a,i=2;while(RC.people.some(x=>x.alias===k))k=a+i++;return k}
function renderPeople(B){const cnt=a=>RC.tickets.filter(t=>!t.doublon&&(t.personnes||[]).includes(a)).length;
 B.innerHTML=`<div class="rcc-grid two"><div class="card"><h4 class="res-sub">Personnes concernées</h4><p class="note">Chaque personne a un alias court, utilisé dans les tickets et dans le rapport.</p>
  <div class="tbl-wrap" style="margin-top:10px"><table class="j"><thead><tr><th>Alias</th><th>Nom</th><th>Équipe</th><th>Incidents</th><th></th></tr></thead><tbody>
  ${RC.people.map((p,i)=>`<tr><td class="num"><b>${esc(p.alias)}</b></td><td>${esc(p.nom)}</td><td>${esc(p.equipe||"—")}</td><td class="num">${cnt(p.alias)}</td><td><button class="link" data-pdel="${i}">Retirer</button></td></tr>`).join("")||`<tr><td colspan="5" class="empty">Aucune personne pour l'instant. Ajoutez-en avec le formulaire.</td></tr>`}
  </tbody></table></div></div>
  <form class="card form" id="rc-pf" novalidate><h4 class="res-sub">Ajouter une personne</h4>
   <label>Nom complet<input class="f" id="rc-pn" placeholder="Ex. Aïcha Traoré" autocomplete="off"></label>
   <label>Alias<input class="f" id="rc-pa" placeholder="Créé automatiquement" autocomplete="off"></label>
   <label>Équipe<select class="f" id="rc-pe">${RCC_TEAMS.map(e=>`<option>${e}</option>`).join("")}</select></label>
   <button class="btn primary" type="submit">Ajouter</button><p class="note" id="rc-pm"></p></form></div>`;
 $("#rc-pn").oninput=()=>{if(!$("#rc-pa").dataset.edit)$("#rc-pa").value=aliasFor($("#rc-pn").value)};$("#rc-pa").oninput=()=>{$("#rc-pa").dataset.edit="1"};
 $("#rc-pf").onsubmit=async e=>{e.preventDefault();const nom=$("#rc-pn").value.trim(),alias=($("#rc-pa").value.trim()||aliasFor(nom)).replace(/\s+/g,"");if(!nom){$("#rc-pm").textContent="Saisissez le nom de la personne.";return}
  if(RC.people.some(p=>p.alias===alias)){$("#rc-pm").textContent=`L'alias « ${alias} » existe déjà : choisissez-en un autre.`;return}
  RC.people.push({alias,nom,equipe:$("#rc-pe").value});try{await rccSavePeople();toast(`${nom} ajouté(e) : alias ${alias}`)}catch(err){RC.people.pop();toast("Enregistrement refusé : accès en lecture seule")}renderPeople(B)};
 B.querySelectorAll("[data-pdel]").forEach(b=>b.onclick=async()=>{const i=+b.dataset.pdel;if(!b.dataset.c){b.dataset.c=1;b.textContent="Confirmer";return}RC.people.splice(i,1);await rccSavePeople().catch(()=>{});renderPeople(B)})}

/* ---------- Fiche d'un incident (fenêtre) ---------- */
function openRcc(id){openModal({type:"rcc",id:id||""})}
function rccEditHTML(t,isNew){const chip=(arr,v,attr)=>`<button type="button" class="tchip ${arr.includes(v)?"on":""}" data-${attr}="${esc(v)}">${esc(v)}</button>`;
 const st=RCC_STATUS.indexOf(t.statut);const steps=[["Signalé",t.date],["Ticket envoyé",t.envoi],["En cours",""],["Résolu",t.resolu]];
 return `<div class="d-head banner" style="${bannerStyle(OUT2DOM[t.outil]||"net")}"><div class="meta"><span class="pill glass">${isNew?"Nouvel incident":"Incident"}</span>${t.num?`<span class="pill glass">Ticket ${esc(t.num)}</span>`:""}<span class="pill ${RCSTAT[t.statut]}">${esc(t.statut)}</span></div><h3>${esc(t.desc||"Nouvel incident")}</h3></div>
 <form class="g-wrap rcc-form" id="rc-form" novalidate>
  <div class="tl">${steps.map((s,i)=>`<div class="tl-s ${i<=st?"on":""}"><span>${i<st||t.statut==="Résolu"&&i===3?"✓":i+1}</span><b>${s[0]}</b><em>${s[1]?fmtD(s[1]):""}</em></div>`).join("")}</div>
  ${t.notes&&t.notes.length?alertHTML("warn","<b>À vérifier (import) :</b> "+t.notes.map(esc).join(" · ")):""}
  <div class="rf-grid">
   <label class="wide">Description de l'incident<input class="f" id="rf-desc" value="${esc(t.desc)}"></label>
   <label>Date de l'incident<input class="f" type="date" id="rf-date" value="${t.date||""}"></label>
   <label>Fin (si plusieurs jours)<input class="f" type="date" id="rf-fin" value="${t.fin||""}"></label>
   <label>N° du ticket<input class="f" id="rf-num" value="${esc(t.num||"")}" placeholder="Ex. 2943714"></label>
   <label>Application impactée<input class="f" id="rf-app" value="${esc(t.app||"")}"></label>
   <label>Outil<select class="f" id="rf-outil">${[...RCC_OUTILS.map(o=>o[0]),"Autre"].map(o=>`<option ${o===t.outil?"selected":""}>${o}</option>`).join("")}</select></label>
   <label>Type d'incident<select class="f" id="rf-cat">${[...new Set(RCC_CATS.map(c=>c[0]))].concat("Autre").map(o=>`<option ${o===t.cat?"selected":""}>${o}</option>`).join("")}</select></label>
   <label class="chk"><input type="checkbox" id="rf-maj" ${t.majeur?"checked":""}> Incident majeur (impact large)</label>
  </div>
  <div class="rf-box"><h5>Traçabilité du ticket</h5><div class="rf-grid">
   <label>Statut<select class="f" id="rf-st">${RCC_STATUS.map(o=>`<option ${o===t.statut?"selected":""}>${o}</option>`).join("")}</select></label>
   <label>Ticket envoyé sur<select class="f" id="rf-pl"><option value="">—</option>${RCC_PLATFORMS.map(o=>`<option ${o===t.plateforme?"selected":""}>${o}</option>`).join("")}</select></label>
   <label>Date d'envoi du ticket<input class="f" type="date" id="rf-env" value="${t.envoi||""}"></label>
   <label>Date de résolution<input class="f" type="date" id="rf-res" value="${t.resolu||""}"></label>
   <label class="wide">Solution apportée / commentaire<textarea class="f" id="rf-sol" rows="2" placeholder="Ce qui a été fait, par qui, résultat">${esc(t.resolution||"")}</textarea></label>
  </div></div>
  <div class="rf-box"><h5>Équipes concernées</h5><div class="tchips" id="rf-eq">${[...new Set([...RCC_TEAMS,...(t.equipes||[])])].map(e=>chip(t.equipes||[],e,"eq")).join("")}</div>
   <h5 style="margin-top:14px">Personnes concernées</h5><div class="tchips" id="rf-pp">${RC.people.map(p=>chip(t.personnes||[],p.alias,"pp")).join("")||`<span class="note">Aucune personne enregistrée.</span>`}</div>
   <div class="rf-add"><input class="f" id="rf-nn" placeholder="Ajouter une personne : nom complet" autocomplete="off"><select class="f" id="rf-ne" style="width:auto">${RCC_TEAMS.map(e=>`<option>${e}</option>`).join("")}</select><button type="button" class="btn" id="rf-nb">Ajouter</button></div></div>
  ${(t.hist||[]).length?`<div class="rf-box"><h5>Historique</h5><ol class="hist">${t.hist.slice().reverse().map(h=>`<li><span class="mono">${new Date(h.d).toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"})}</span><b>${esc(h.q)}</b>${h.t?` — ${esc(h.t)}`:""}</li>`).join("")}</ol></div>`:""}
  <div class="g-nav"><span>${isNew?"":`<button type="button" class="btn" id="rf-del">Supprimer</button>`}</span><button class="btn primary big" type="submit">Enregistrer</button></div><p class="note" id="rf-msg"></p>
 </form>`}
const OUT2DOM={"Réseau":"net","Téléphonie Cisco":"cisco","Ecobank Engage":"crm","Omnicanal":"teams","Partenaires & paiements":"office","Ecobank Mobile":"web","Notifications OTP / SMS":"acc","Back-office & comptes":"office","Poste de travail":"win","Autre":"hw"};
function bindRccForm(t,isNew){const f=$("#rc-form");const sel={eq:new Set(t.equipes||[]),pp:new Set(t.personnes||[])};
 f.querySelectorAll(".tchip").forEach(b=>b.onclick=()=>{const k=b.dataset.eq?"eq":"pp",v=b.dataset.eq||b.dataset.pp;sel[k].has(v)?sel[k].delete(v):sel[k].add(v);b.classList.toggle("on")});
 $("#rf-st").onchange=()=>{const v=$("#rf-st").value,d=iso(new Date());if(v==="Résolu"&&!$("#rf-res").value)$("#rf-res").value=d;if(v!=="Signalé"&&!$("#rf-env").value&&$("#rf-num").value)$("#rf-env").value=$("#rf-date").value||d};
 $("#rf-res").onchange=()=>{if($("#rf-res").value)$("#rf-st").value="Résolu"};
 $("#rf-nb").onclick=async()=>{const nom=$("#rf-nn").value.trim();if(!nom)return;const alias=aliasFor(nom);RC.people.push({alias,nom,equipe:$("#rf-ne").value});sel.pp.add(alias);try{await rccSavePeople()}catch(e){}const b=document.createElement("button");b.type="button";b.className="tchip on";b.dataset.pp=alias;b.textContent=alias;b.onclick=()=>{sel.pp.has(alias)?sel.pp.delete(alias):sel.pp.add(alias);b.classList.toggle("on")};const box=$("#rf-pp");if(box.querySelector(".note"))box.innerHTML="";box.appendChild(b);$("#rf-nn").value="";toast(`Alias créé : ${alias}`)};
 $("#rf-del")&&($("#rf-del").onclick=async e=>{const b=e.currentTarget;if(!b.dataset.c){b.dataset.c=1;b.textContent="Confirmer la suppression";return}try{await rccDelete(t._id);closeModal();toast("Incident supprimé")}catch(err){toast("Suppression refusée")}});
 f.onsubmit=async e=>{e.preventDefault();const v=id=>$(id).value.trim();const desc=v("#rf-desc");if(!desc){$("#rf-msg").textContent="Décrivez l'incident.";return}
  const n={...t,desc,date:v("#rf-date"),fin:v("#rf-fin"),num:v("#rf-num"),app:v("#rf-app")||"Non précisé",appDeduite:t.appDeduite&&v("#rf-app")===t.app,outil:v("#rf-outil"),cat:v("#rf-cat"),majeur:$("#rf-maj").checked,statut:v("#rf-st"),plateforme:v("#rf-pl"),envoi:v("#rf-env"),resolu:v("#rf-res"),resolution:v("#rf-sol"),equipes:[...sel.eq],personnes:[...sel.pp]};
  const ch=[];[["statut","Statut"],["num","N° de ticket"],["plateforme","Envoyé sur"],["envoi","Date d'envoi"],["resolu","Date de résolution"],["resolution","Solution"],["date","Date"],["app","Application"]].forEach(([k,l])=>{if((t[k]||"")!==(n[k]||""))ch.push(`${l} : ${t[k]||"—"} → ${n[k]||"—"}`)});
  if(String(t.equipes||[])!==String(n.equipes))ch.push("Équipes : "+(n.equipes.join(", ")||"—"));if(String(t.personnes||[])!==String(n.personnes))ch.push("Personnes : "+(n.personnes.join(", ")||"—"));
  n.hist=[...(t.hist||[]),{d:new Date().toISOString(),q:isNew?"Création":"Mise à jour",t:isNew?"Incident créé dans l'application":ch.join(" · ")}];if(!isNew&&!ch.length&&String(t.desc)===desc&&t.majeur===n.majeur&&t.outil===n.outil&&t.cat===n.cat){closeModal();return}
  try{await rccSaveTicket(n);closeModal();toast(isNew?"Incident ajouté":"Incident mis à jour")}catch(err){$("#rf-msg").textContent="Enregistrement refusé : votre accès est en lecture seule."}}}
function renderModal(){$("#mback").hidden=!mstack.length;
 if(mcur.type==="rcc"){const isNew=!mcur.id;const t=isNew?{desc:"",date:iso(new Date()),statut:"Signalé",outil:"Réseau",cat:"Indisponibilité",app:"",equipes:[],personnes:[],hist:[]}:RC.tickets.find(x=>x._id===mcur.id);if(!t){closeModal();return}
  $("#mtitle").textContent="Incident";$("#mbody").innerHTML=rccEditHTML(t,isNew);bindRccForm(t,isNew);$("#mbox").scrollTop=0;return}
 const p=mcur.type==="fiche"?byId(mcur.id):null;$("#mtitle").textContent=mcur.type==="err"?"Code d'erreur":p&&p.d==="guide"?"Guide":"Fiche de dépannage";
 if(mcur.type==="fiche")renderDetail("#mbody",mcur.id);else $("#mbody").innerHTML=errBody(ERR[mcur.i]);$("#mbox").scrollTop=0}

/* ---------- Import / export Excel ---------- */
let xlsxP=null;
function loadXLSX(){if(window.XLSX)return Promise.resolve();if(xlsxP)return xlsxP;xlsxP=new Promise((res,rej)=>{const s=document.createElement("script");s.src=(!IN_CLAUDE&&/^https?:/.test(location.protocol))?"/vendor/xlsx/xlsx.full.min.js":"https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";s.onload=()=>window.XLSX?res():rej();s.onerror=()=>{xlsxP=null;rej()};document.head.appendChild(s)});return xlsxP}
let rcPending=null;
function renderImport(B){B.innerHTML=`<div class="rcc-grid two"><div class="card"><h4 class="res-sub">Importer un fichier Excel</h4><p class="note">Colonnes attendues, dans l'ordre : date de l'incident, n° du ticket, description, application impactée. Les incidents déjà présents ne sont pas importés deux fois.</p>
  <label class="dropzone light" for="rc-file" tabindex="0"><span class="dz-ic">${svgI("guides",2)}</span><span class="dz-t"><b>Choisir le fichier Excel</b><span>.xlsx, .xls ou .csv</span></span></label><input type="file" id="rc-file" accept=".xlsx,.xls,.csv" hidden>
  <div id="rc-prev"></div></div>
  <div class="card"><h4 class="res-sub">Exporter</h4><p class="note">Tous les incidents avec leur traçabilité, ou le rapport de la période choisie.</p><div class="ac-cta" style="margin-top:10px"><button class="btn" id="rc-xall">Exporter tous les incidents (Excel)</button><button class="btn" id="rc-xrep">Exporter le rapport de la période</button></div>
  ${RC.mode==="local"?alertHTML("info","Sur cette version web, les incidents sont enregistrés <b>dans ce navigateur</b>. Exportez régulièrement le fichier Excel pour le partager ou le sauvegarder."):alertHTML("info","Les incidents sont dans une <b>base partagée</b> : toute l'équipe ayant accès à l'application voit les mêmes données.")}</div></div>`;
 $("#rc-file").onchange=async()=>{const f=$("#rc-file").files[0];if(!f)return;const P=$("#rc-prev");P.innerHTML=`<p class="note">Lecture du fichier…</p>`;
  try{await loadXLSX();const wb=XLSX.read(await f.arrayBuffer(),{cellDates:true});const ws=wb.Sheets[wb.SheetNames[0]];const rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:null}).slice(1);const T=rccFromRows(rows);
   const key=t=>(t.num||"")+"|"+norm(t.desc)+"|"+t.date;const have=new Set(RC.tickets.map(key));const nw=T.filter(t=>!have.has(key(t)));rcPending=nw;
   P.innerHTML=`<div class="imp"><div class="kpis rcc-k"><div><b>${T.length}</b><span>lignes lues</span></div><div><b>${nw.length}</b><span>nouvelles</span></div><div><b>${T.filter(t=>t.doublon).length}</b><span>doublons repérés</span></div><div><b>${T.filter(t=>t.notes.some(n=>/estim|approx|corrig/.test(n))).length}</b><span>dates corrigées ou estimées</span></div></div>
    <p class="note">Les doublons sont gardés pour la traçabilité mais exclus du rapport. Les dates absentes sont estimées à partir des numéros de ticket voisins, et signalées « à vérifier » sur chaque incident.</p>
    <button class="btn primary big" id="rc-doimp" ${nw.length?"":"disabled"}>${nw.length?`Importer ${nw.length} incident${nw.length>1?"s":""}`:"Rien de nouveau à importer"}</button></div>`;
   $("#rc-doimp")&&($("#rc-doimp").onclick=async e=>{e.currentTarget.disabled=true;let k=0;for(const t of rcPending){try{await rccSaveTicket(t);k++}catch(err){break}}rcPending=null;const dbl=rcPending?0:0;toast(`${k} ligne${k>1?"s":""} importée${k>1?"s":""} — les doublons sont exclus du rapport`);RC.tab="rapport";store.set("rcc-tab","rapport");if(RC.mode==="local")renderRCC()})}
  catch(err){P.innerHTML=alertHTML("warn","Le fichier n'a pas pu être lu. Vérifiez qu'il s'agit d'un fichier Excel (.xlsx) avec les colonnes date, ticket, description, application.")}};
 $("#rc-xall").onclick=()=>exportAll();$("#rc-xrep").onclick=()=>exportReport(periodTickets())}
function ticketRow(t){return {"Date":t.date?fmtD(t.date):"","Fin":t.fin?fmtD(t.fin):"","N° ticket":t.num||"","Description":t.desc,"Application":t.app,"Outil":t.outil,"Type":t.cat,"Majeur":t.majeur?"Oui":"","Équipes":teamsOf(t).join(", "),"Personnes":(t.personnes||[]).join(", "),"Statut":t.statut,"Envoyé sur":t.plateforme||"","Date d'envoi":t.envoi?fmtD(t.envoi):"","Date de résolution":t.resolu?fmtD(t.resolu):"","Délai (jours)":delayDays(t)??"","Solution":t.resolution||"","Doublon":t.doublon?"Oui":"","À vérifier":(t.notes||[]).join(" ; ")}}
async function saveXlsx(wb,name){try{await loadXLSX()}catch(e){toast("Export impossible : module Excel non chargé");return}const out=XLSX.write(wb,{type:"array",bookType:"xlsx"});const type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
 if(IN_CLAUDE){if(!downloads){toast("Téléchargement indisponible ici");return}try{await downloads.save({filename:name,data:new Blob([out],{type})});toast("Fichier enregistré")}catch(e){if(e?.code!=="declined")toast("Téléchargement impossible")}}else{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([out],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);toast("Fichier téléchargé")}}
async function exportAll(){try{await loadXLSX()}catch(e){toast("Module Excel non chargé");return}const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(RC.tickets.slice().sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map(ticketRow)),"Incidents");
 XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(RC.people.map(p=>({Alias:p.alias,Nom:p.nom,"Équipe":p.equipe}))),"Personnes");saveXlsx(wb,"incidents-rcc.xlsx")}
async function exportReport(L){try{await loadXLSX()}catch(e){toast("Module Excel non chargé");return}const n=L.length;const wb=XLSX.utils.book_new();const sh=(rows,col)=>rows.map(([k,v])=>({[col]:k,"Incidents":v,"Part":pct(v,n)/100}));
 const syn=synthText(L).split("\n").map(l=>({Synthèse:l}));XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(syn),"Synthèse");
 [["Par outil","Outil",t=>t.outil],["Par type","Type d'incident",t=>t.cat],["Par équipe","Équipe",teamsOf],["Par personne","Personne",t=>t.personnes||[]],["Par application","Application",t=>t.app]].forEach(([nm,col,fn])=>{const ws=XLSX.utils.json_to_sheet(sh(countBy(L,fn),col));Object.keys(ws).forEach(c=>{if(/^C\d+$/.test(c)&&c!=="C1")ws[c].z="0.0%"});XLSX.utils.book_append_sheet(wb,ws,nm)});
 XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(L.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(ticketRow)),"Incidents de la période");
 saveXlsx(wb,`rapport-incidents-${RC.from||"debut"}_${RC.to||"fin"}.xlsx`)}
