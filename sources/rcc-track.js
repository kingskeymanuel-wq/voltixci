/* ---------- Agents : photos et avatars ---------- */
const AVC=["#d9480f","#0b7285","#5f3dc4","#2b8a3e","#c2255c","#1864ab","#e67700","#495057"];
function pBy(a){return RC.people.find(x=>x.alias===a)||{alias:a,nom:a,equipe:""}}
function avHTML(p,cls=""){if(!p)return"";const ini=String(p.nom||p.alias).split(/[\s-]+/).filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase();let h=0;for(const ch of String(p.alias))h=(h*31+ch.charCodeAt(0))%997;
 return p.photo?`<img class="av ${cls}" src="${p.photo}" alt="${esc(p.nom)}" title="${esc(p.nom)}">`:`<span class="av ${cls}" style="background:${AVC[h%AVC.length]}" title="${esc(p.nom)}" aria-label="${esc(p.nom)}">${esc(ini)}</span>`}
function avStack(aliases,max=4){const a=aliases||[];return `<span class="avs">${a.slice(0,max).map(x=>avHTML(pBy(x))).join("")}${a.length>max?`<span class="av more">+${a.length-max}</span>`:""}</span>`}
function photoData(file){return new Promise((res,rej)=>{if(!file||!/^image\//.test(file.type)){rej(new Error("type"));return}const r=new FileReader();r.onerror=rej;r.onload=()=>{const i=new Image();i.onerror=rej;i.onload=()=>{const s=Math.min(i.width,i.height),c=document.createElement("canvas");c.width=c.height=160;c.getContext("2d").drawImage(i,(i.width-s)/2,(i.height-s)/2,s,s,0,0,160,160);res(c.toDataURL("image/jpeg",.8))};i.src=r.result};r.readAsDataURL(file)})}
function pickPhoto(cb){const inp=document.createElement("input");inp.type="file";inp.accept="image/*";inp.onchange=async()=>{try{cb(await photoData(inp.files[0]))}catch(e){toast("Choisissez une image (JPG ou PNG)")}};inp.click()}
async function setPersonPhoto(alias,data){const p=RC.people.find(x=>x.alias===alias);if(!p)return;const old=p.photo;p.photo=data;try{await rccSavePeople();toast(data?"Photo enregistrée":"Photo retirée")}catch(e){p.photo=old;toast("Enregistrement refusé : accès en lecture seule")}if(RC.mode!=="db")renderRCC();if(mcur&&mcur.type==="rccperson")renderModal()}

function teamIni(k){const w=String(k).replace(/[^A-Za-zÀ-ÿ ]/g," ").trim().split(/\s+/).filter(Boolean);return (w.length>1?w.map(x=>x[0]).join(""):(w[0]||"?").slice(0,3)).slice(0,3).toUpperCase()}
/* ---------- Mise à jour rapide d'un incident (traçabilité) ---------- */
async function quickUpdate(t,patch,label){const n={...t,...patch};n.hist=[...(t.hist||[]),{d:new Date().toISOString(),q:"Mise à jour rapide",t:label}];try{await rccSaveTicket(n);toast("Enregistré : "+label)}catch(e){toast("Enregistrement refusé : accès en lecture seule")}}

/* ---------- Onglet Tickets & traçabilité : blocs par thème, pliables ---------- */
const GRP={outil:["Outil",t=>[t.outil]],statut:["Statut",t=>[t.statut]],equipe:["Équipe",t=>{const e=teamsOf(t);return e.length?e:["Équipe à renseigner"]}],mois:["Mois",t=>[t.date?t.date.slice(0,7):"Sans date"]]};
const TODO={"":"Tous les incidents",notk:"Sans n° de ticket",noag:"Sans agent",open:"Non résolus",res:"Résolus"};
function grpLabel(g,k){if(g==="mois"&&/^\d{4}-\d{2}$/.test(k))return MOISF[+k.slice(5)-1]+" "+k.slice(0,4);return k}
function grpIcon(g,k){if(g==="outil"){const d=OUT2DOM[k]||"hw";return `<span class="tg-ic" style="background:${domGrad(d)}">${svgI(d,2)}</span>`}
 if(g==="statut")return `<span class="tg-ic st-${(RCSTAT[k]||"neutral")}">${k==="Résolu"?"✓":k==="En cours"?"…":k==="Ticket envoyé"?"#":"!"}</span>`;
 if(g==="equipe"){const ini=teamIni(k);return `<span class="tg-ic" style="background:${k.includes("renseigner")?"#adb5bd":domGrad("teams")}">${esc(ini||"?")}</span>`}
 return `<span class="tg-ic" style="background:${domGrad("net")}">${svgI("rcc",2)}</span>`}
function rowHTML(t){const d=t.date?t.date.split("-"):null;const dbl=!!t.doublon;
 return `<div class="tr2 ${dbl?"dbl":""} ${t.statut==="Résolu"?"done":""}" data-rid="${t._id}" tabindex="0" role="button" aria-label="Ouvrir l'incident ${esc(t.desc)}">
  <span class="dr-d">${d?`<b>${d[2]}</b><span>${MOISF[+d[1]-1]}</span>`:"<b>—</b>"}</span>
  <span class="tr-m"><b>${esc(t.desc)}</b>${t.majeur?` <span class="pill crit">Majeur</span>`:""}${dbl?` <span class="pill neutral">Doublon</span>`:""}
   <span class="tr-s">${esc(t.app)}${t.appDeduite?" (déduite)":""} · ${esc(t.cat)}${t.resolu?` · résolu le ${fmtD(t.resolu)}`:""}</span>
   ${t.notes&&t.notes.length&&!dbl?`<span class="tr-w">⚠ ${esc(t.notes[0])}</span>`:""}</span>
  ${dbl?`<span class="tr-c"><span class="mono">${esc(t.num||"—")}</span></span><span></span><span></span>`:`
  <label class="tr-c tr-num"><span class="sr">N° de ticket</span><input class="f sm mono" data-qn="${t._id}" value="${esc(t.num||"")}" placeholder="+ n° ticket" inputmode="numeric"></label>
  <button type="button" class="tr-ag" data-qa="${t._id}" title="Agents concernés">${(t.personnes||[]).length?avStack(t.personnes):`<span class="av add">+</span>`}<span class="tr-agl">${(t.personnes||[]).length?`${t.personnes.length} agent${t.personnes.length>1?"s":""}`:teamsOf(t).length?esc(teamsOf(t).join(", ")):"Agents"}</span></button>
  <label class="tr-st"><span class="sr">Statut</span><select class="f sm st-${RCSTAT[t.statut]||"neutral"}" data-qs="${t._id}">${RCC_STATUS.map(s=>`<option ${s===t.statut?"selected":""}>${s}</option>`).join("")}</select></label>`}
  <svg class="i2-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></div>`}
function renderTickets(B){RC.grp=RC.grp||store.get("rcc-grp","outil");RC.fold=RC.fold||store.get("rcc-fold",{});RC.fc=RC.fc||"";
 const all=RC.tickets.filter(t=>RC.fe==="__all"||inPeriod(t)||!t.date);const q=norm(RC.q);
 let L=all.filter(t=>(!RC.fs||t.statut===RC.fs)&&(!RC.fe||RC.fe==="__all"||teamsOf(t).includes(RC.fe))&&(!q||norm([t.num,t.desc,t.app,t.outil,...(t.personnes||[]),...(t.personnes||[]).map(a=>pBy(a).nom)].join(" ")).includes(q)))
  .filter(t=>!RC.fc||(RC.fc==="notk"&&!t.num&&!t.doublon)||(RC.fc==="noag"&&!(t.personnes||[]).length&&!t.doublon)||(RC.fc==="open"&&t.statut!=="Résolu"&&!t.doublon)||(RC.fc==="res"&&t.statut==="Résolu"))
  .sort((a,b)=>(b.date||"").localeCompare(a.date||""));
 const real=all.filter(t=>!t.doublon);const c={notk:real.filter(t=>!t.num).length,noag:real.filter(t=>!(t.personnes||[]).length).length,open:real.filter(t=>t.statut!=="Résolu").length,res:real.filter(t=>t.statut==="Résolu").length};
 const G=new Map();L.forEach(t=>GRP[RC.grp][1](t).forEach(k=>{if(!G.has(k))G.set(k,[]);G.get(k).push(t)}));
 let gs=[...G.entries()];if(RC.grp==="statut")gs.sort((a,b)=>RCC_STATUS.indexOf(a[0])-RCC_STATUS.indexOf(b[0]));else if(RC.grp==="mois")gs.sort((a,b)=>b[0].localeCompare(a[0]));else gs.sort((a,b)=>(/renseigner/.test(a[0]))-(/renseigner/.test(b[0]))||b[1].length-a[1].length);
 const teams=[...new Set([...RCC_TEAMS,...RC.people.map(p=>p.equipe).filter(Boolean)])];const fk=k=>RC.grp+":"+k;const isOpen=(k,i)=>fk(k) in RC.fold?RC.fold[fk(k)]:i===0;
 B.innerHTML=`<div class="tk-top">
  <div class="tk-todo">${Object.entries(TODO).map(([k,n])=>`<button class="chip" aria-pressed="${RC.fc===k}" data-fc="${k}">${n}${k?` <b>${c[k]}</b>`:""}</button>`).join("")}</div>
  <div class="filters"><div class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="rc-q" type="search" value="${esc(RC.q)}" placeholder="N° de ticket, application, agent…" aria-label="Rechercher un incident"></div>
  <label class="tk-g">Regrouper par<select class="f" id="rc-grp">${Object.entries(GRP).map(([k,v])=>`<option value="${k}" ${k===RC.grp?"selected":""}>${v[0]}</option>`).join("")}</select></label>
  <select class="f" id="rc-fs" style="width:auto" aria-label="Statut"><option value="">Tous les statuts</option>${RCC_STATUS.map(o=>`<option ${o===RC.fs?"selected":""}>${o}</option>`).join("")}</select>
  <select class="f" id="rc-fe" style="width:auto" aria-label="Équipe"><option value="">Toutes les équipes</option>${teams.map(o=>`<option ${o===RC.fe?"selected":""}>${esc(o)}</option>`).join("")}</select>
  <button class="btn primary" id="rc-new">+ Nouvel incident</button></div>
  <div class="tk-bar"><p class="note">${L.length} incident${L.length>1?"s":""} · ${esc(periodLabel())} · saisissez le n° de ticket, le statut et les agents directement sur la ligne, ou cliquez sur la ligne pour la fiche complète</p><span><button class="link" id="rc-xall">Tout déplier</button> · <button class="link" id="rc-call">Tout replier</button></span></div></div>
  <div class="tgs">${gs.map(([k,list],i)=>{const r=list.filter(t=>!t.doublon);const res=r.filter(t=>t.statut==="Résolu").length,ag=[...new Set(r.flatMap(t=>t.personnes||[]))],nt=r.filter(t=>!t.num).length,na=r.filter(t=>!(t.personnes||[]).length).length;
   return `<details class="tg" data-fk="${esc(fk(k))}" ${isOpen(k,i)?"open":""}><summary>${grpIcon(RC.grp,k)}<span class="tg-t"><b>${esc(grpLabel(RC.grp,k))}</b><em>${r.length} incident${r.length>1?"s":""}${list.length>r.length?` + ${list.length-r.length} doublon${list.length-r.length>1?"s":""}`:""}${nt?` · ${nt} sans ticket`:""}${na?` · ${na} sans agent`:""}</em></span>
    ${ag.length?avStack(ag,5):""}<span class="tg-p" title="${res} résolu(s) sur ${r.length}"><i style="width:${pct(res,r.length)}%"></i></span><span class="tg-r">${res}/${r.length} résolus</span><svg class="tg-ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
    <div class="tg-b">${list.map(rowHTML).join("")}</div></details>`}).join("")||`<div class="card empty">Aucun incident ne correspond aux filtres.</div>`}</div>`;
 const rq=$("#rc-q");rq.oninput=()=>{RC.q=rq.value;clearTimeout(rq._t);rq._t=setTimeout(()=>{renderTickets(B);const n=$("#rc-q");n.focus();n.setSelectionRange(n.value.length,n.value.length)},250)};
 $("#rc-grp").onchange=e=>{RC.grp=e.target.value;store.set("rcc-grp",RC.grp);renderTickets(B)};$("#rc-fs").onchange=e=>{RC.fs=e.target.value;renderTickets(B)};$("#rc-fe").onchange=e=>{RC.fe=e.target.value;renderTickets(B)};
 B.querySelectorAll("[data-fc]").forEach(b=>b.onclick=()=>{RC.fc=b.dataset.fc;renderTickets(B)});
 const setAll=v=>{B.querySelectorAll("details.tg").forEach(d=>{d.open=v;RC.fold[d.dataset.fk]=v});store.set("rcc-fold",RC.fold)};$("#rc-xall").onclick=()=>setAll(true);$("#rc-call").onclick=()=>setAll(false);
 B.querySelectorAll("details.tg").forEach(d=>d.addEventListener("toggle",()=>{RC.fold[d.dataset.fk]=d.open;store.set("rcc-fold",RC.fold)}));
 $("#rc-new").onclick=()=>openRcc(null);
 const T=id=>RC.tickets.find(x=>x._id===id);
 B.querySelectorAll(".tr2").forEach(r=>{r.onclick=e=>{if(e.target.closest("input,select,label,.tr-ag"))return;openRcc(r.dataset.rid)};r.onkeydown=e=>{if(e.key==="Enter"&&e.target===r)openRcc(r.dataset.rid)}});
 B.querySelectorAll("[data-qn]").forEach(i=>{i.onkeydown=e=>{if(e.key==="Enter")i.blur()};i.onchange=()=>{const t=T(i.dataset.qn);const v=i.value.trim();if(!t||v===(t.num||""))return;const p={num:v};if(v&&t.statut==="Signalé"){p.statut="Ticket envoyé";p.envoi=t.envoi||iso(new Date());p.plateforme=t.plateforme||"Outil de ticketing IT"}quickUpdate(t,p,`N° de ticket : ${t.num||"—"} → ${v||"—"}`)}});
 B.querySelectorAll("[data-qs]").forEach(s=>s.onchange=()=>{const t=T(s.dataset.qs);if(!t)return;const v=s.value,p={statut:v};if(v==="Résolu"&&!t.resolu)p.resolu=iso(new Date());if(v!=="Résolu")p.resolu="";if(v!=="Signalé"&&!t.envoi&&t.num)p.envoi=t.date||iso(new Date());quickUpdate(t,p,`Statut : ${t.statut} → ${v}${p.resolu?` (résolu le ${fmtD(p.resolu)})`:""}`)});
 B.querySelectorAll("[data-qa]").forEach(b=>b.onclick=e=>{e.stopPropagation();openModal({type:"rccpick",id:b.dataset.qa})})}

/* ---------- Fenêtre : choisir les agents et équipes d'un incident ---------- */
function pickHTML(t,sel){const teams=[...new Set([...RCC_TEAMS,...RC.people.map(p=>p.equipe).filter(Boolean),...(t.equipes||[])])];const q=norm(sel.q||"");
 const ppl=RC.people.filter(p=>!q||norm(p.nom+" "+p.alias+" "+(p.equipe||"")).includes(q)).sort((a,b)=>(sel.pp.has(b.alias))-(sel.pp.has(a.alias))||String(a.equipe).localeCompare(String(b.equipe))||a.nom.localeCompare(b.nom));
 return `<div class="d-head banner" style="${bannerStyle(OUT2DOM[t.outil]||"net")}"><div class="meta"><span class="pill glass">${fmtD(t.date)}</span>${t.num?`<span class="pill glass">Ticket ${esc(t.num)}</span>`:""}<span class="pill ${RCSTAT[t.statut]}">${esc(t.statut)}</span></div><h3>Qui est concerné ?</h3><p class="sub" style="color:#fff;opacity:.85;margin:4px 0 0">${esc(t.desc)}</p></div>
 <div class="g-wrap"><h5 class="pk-h">Équipes concernées</h5><div class="tchips" id="pk-eq">${teams.map(e=>`<button type="button" class="tchip ${sel.eq.has(e)?"on":""}" data-eq="${esc(e)}">${esc(e)}</button>`).join("")}</div>
  <div class="pk-hr"><h5 class="pk-h">Agents concernés <span class="note">· ${sel.pp.size} sélectionné${sel.pp.size>1?"s":""}</span></h5><div class="search sm"><input id="pk-q" type="search" value="${esc(sel.q||"")}" placeholder="Rechercher un agent" aria-label="Rechercher un agent"></div></div>
  <div class="pk-grid">${ppl.map(p=>`<button type="button" class="pk ${sel.pp.has(p.alias)?"on":""}" data-pp="${esc(p.alias)}" aria-pressed="${sel.pp.has(p.alias)}">${avHTML(p,"lg")}<b>${esc(p.nom)}</b><em>${esc(p.alias)}${p.equipe?" · "+esc(p.equipe):""}</em><span class="pk-ok">✓</span></button>`).join("")||`<p class="note">${RC.people.length?"Aucun agent ne correspond.":"Aucun agent enregistré : ajoutez-en ci-dessous."}</p>`}</div>
  <div class="rf-box"><h5>Nouvel agent</h5><div class="rf-add"><button type="button" class="pk-ph" id="pk-ph" title="Ajouter une photo">${sel.photo?`<img class="av lg" src="${sel.photo}" alt="">`:`<span class="av lg add">📷</span>`}</button><input class="f" id="pk-nn" placeholder="Nom complet de l'agent" autocomplete="off"><select class="f" id="pk-ne" style="width:auto">${RCC_TEAMS.map(e=>`<option>${e}</option>`).join("")}</select><button type="button" class="btn" id="pk-nb">Ajouter et sélectionner</button></div></div>
  <div class="g-nav"><button type="button" class="btn" id="pk-full">Fiche complète de l'incident</button><button type="button" class="btn primary big" id="pk-save">Enregistrer</button></div></div>`}
function bindPick(t,sel){const re=()=>{const y=$("#mbox").scrollTop;$("#mbody").innerHTML=pickHTML(t,sel);bindPick(t,sel);$("#mbox").scrollTop=y};
 $("#mbody").querySelectorAll("[data-eq]").forEach(b=>b.onclick=()=>{const v=b.dataset.eq;sel.eq.has(v)?sel.eq.delete(v):sel.eq.add(v);b.classList.toggle("on")});
 $("#mbody").querySelectorAll("[data-pp]").forEach(b=>b.onclick=()=>{const v=b.dataset.pp;if(sel.pp.has(v))sel.pp.delete(v);else{sel.pp.add(v);const e=pBy(v).equipe;if(e)sel.eq.add(e)}re()});
 const q=$("#pk-q");q.oninput=()=>{sel.q=q.value;clearTimeout(q._t);q._t=setTimeout(()=>{re();const n=$("#pk-q");n.focus();n.setSelectionRange(n.value.length,n.value.length)},200)};
 $("#pk-ph").onclick=()=>pickPhoto(d=>{sel.photo=d;sel.nn=$("#pk-nn").value;re();$("#pk-nn").value=sel.nn||""});
 $("#pk-nb").onclick=async()=>{const nom=$("#pk-nn").value.trim();if(!nom){$("#pk-nn").focus();return}const alias=aliasFor(nom),equipe=$("#pk-ne").value;RC.people.push({alias,nom,equipe,...(sel.photo?{photo:sel.photo}:{})});sel.pp.add(alias);sel.eq.add(equipe);sel.photo="";try{await rccSavePeople()}catch(e){}toast(`${nom} ajouté(e) — alias ${alias}`);re()};
 $("#pk-full").onclick=()=>openRcc(t._id);
 $("#pk-save").onclick=async()=>{const n={equipes:[...sel.eq],personnes:[...sel.pp]};const ch=[];if(String(t.equipes||[])!==String(n.equipes))ch.push("Équipes : "+(n.equipes.join(", ")||"—"));if(String(t.personnes||[])!==String(n.personnes))ch.push("Agents : "+(n.personnes.map(a=>pBy(a).nom).join(", ")||"—"));
  if(ch.length)await quickUpdate(t,n,ch.join(" · "));if(mstack.length){mcur=mstack.pop();setTimeout(renderModal,RC.mode==="db"?400:0)}else closeModal()}}

/* ---------- Onglet Personnes & équipes : cartes avec photo ---------- */
function renderPeople(B){const mine=a=>RC.tickets.filter(t=>!t.doublon&&(t.personnes||[]).includes(a));
 const byTeam=new Map();RC.people.forEach(p=>{const e=p.equipe||"Sans équipe";if(!byTeam.has(e))byTeam.set(e,[]);byTeam.get(e).push(p)});
 RC.pfold=RC.pfold||store.get("rcc-pfold",{});
 B.innerHTML=`<div class="pp-top"><div><h3 class="rp-t">Agents et équipes</h3><p class="note">${RC.people.length} agent${RC.people.length>1?"s":""} · cliquez sur une carte pour voir ses incidents, sur la photo pour la changer</p></div></div>
 <div class="pp-lay"><div class="tgs">${[...byTeam.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([e,list])=>{const inc=RC.tickets.filter(t=>!t.doublon&&teamsOf(t).includes(e)).length;
  return `<details class="tg" data-pk="${esc(e)}" ${RC.pfold[e]===false?"":"open"}><summary><span class="tg-ic" style="background:${domGrad("teams")}">${esc(teamIni(e))}</span><span class="tg-t"><b>${esc(e)}</b><em>${list.length} agent${list.length>1?"s":""} · ${inc} incident${inc>1?"s":""}</em></span>${avStack(list.map(p=>p.alias),6)}<svg class="tg-ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
  <div class="pc-grid">${list.map(p=>{const m=mine(p.alias),r=m.filter(t=>t.statut==="Résolu").length;return `<div class="pc" data-pa="${esc(p.alias)}" tabindex="0" role="button"><button type="button" class="pc-ph" data-ph="${esc(p.alias)}" title="Changer la photo">${avHTML(p,"xl")}<span class="pc-cam">📷</span></button><b>${esc(p.nom)}</b><em>${esc(p.alias)}</em><span class="pc-s"><span><b>${m.length}</b> incident${m.length>1?"s":""}</span><span><b>${r}</b> résolu${r>1?"s":""}</span></span></div>`}).join("")}</div></details>`}).join("")||`<div class="card empty">Aucun agent pour l'instant. Ajoutez le premier avec le formulaire.</div>`}</div>
  <form class="card form" id="rc-pf" novalidate><h4 class="res-sub">Ajouter un agent</h4>
   <button type="button" class="pk-ph big" id="rc-pph">${RC._np?`<img class="av xl" src="${RC._np}" alt="">`:`<span class="av xl add">📷</span>`}<span class="note">Ajouter une photo</span></button>
   <label>Nom complet<input class="f" id="rc-pn" placeholder="Ex. Aïcha Traoré" autocomplete="off"></label>
   <label>Alias<input class="f" id="rc-pa" placeholder="Créé automatiquement" autocomplete="off"></label>
   <label>Équipe<select class="f" id="rc-pe">${RCC_TEAMS.map(e=>`<option>${e}</option>`).join("")}</select></label>
   <button class="btn primary" type="submit">Ajouter</button><p class="note" id="rc-pm"></p></form></div>`;
 B.querySelectorAll("details.tg").forEach(d=>d.addEventListener("toggle",()=>{RC.pfold[d.dataset.pk]=d.open;store.set("rcc-pfold",RC.pfold)}));
 B.querySelectorAll(".pc").forEach(c=>{c.onclick=e=>{if(e.target.closest(".pc-ph"))return;openModal({type:"rccperson",a:c.dataset.pa})};c.onkeydown=e=>{if(e.key==="Enter"&&e.target===c)openModal({type:"rccperson",a:c.dataset.pa})}});
 B.querySelectorAll("[data-ph]").forEach(b=>b.onclick=e=>{e.stopPropagation();pickPhoto(d=>setPersonPhoto(b.dataset.ph,d))});
 const keep=()=>({n:$("#rc-pn").value,a:$("#rc-pa").value,e:$("#rc-pe").value});
 $("#rc-pph").onclick=()=>pickPhoto(d=>{const k=keep();RC._np=d;renderPeople(B);$("#rc-pn").value=k.n;$("#rc-pa").value=k.a;$("#rc-pe").value=k.e});
 $("#rc-pn").oninput=()=>{if(!$("#rc-pa").dataset.edit)$("#rc-pa").value=aliasFor($("#rc-pn").value)};$("#rc-pa").oninput=()=>{$("#rc-pa").dataset.edit="1"};
 $("#rc-pf").onsubmit=async e=>{e.preventDefault();const nom=$("#rc-pn").value.trim(),alias=($("#rc-pa").value.trim()||aliasFor(nom)).replace(/\s+/g,"");if(!nom){$("#rc-pm").textContent="Saisissez le nom de l'agent.";return}
  if(RC.people.some(p=>p.alias===alias)){$("#rc-pm").textContent=`L'alias « ${alias} » existe déjà : choisissez-en un autre.`;return}
  RC.people.push({alias,nom,equipe:$("#rc-pe").value,...(RC._np?{photo:RC._np}:{})});try{await rccSavePeople();RC._np="";toast(`${nom} ajouté(e) : alias ${alias}`)}catch(err){RC.people.pop();toast("Enregistrement refusé : accès en lecture seule")}renderPeople(B)}}

/* ---------- Fenêtre : fiche d'un agent ---------- */
function personHTML(p){const m=RC.tickets.filter(t=>!t.doublon&&(t.personnes||[]).includes(p.alias)).sort((a,b)=>(b.date||"").localeCompare(a.date||""));const r=m.filter(t=>t.statut==="Résolu").length,mj=m.filter(t=>t.majeur).length;const o=countBy(m,t=>t.outil);
 return `<div class="d-head banner pp-ban" style="${bannerStyle("teams")}"><button type="button" class="pc-ph" id="pp-ph" title="Changer la photo">${avHTML(p,"xxl")}<span class="pc-cam">📷</span></button><div><div class="meta"><span class="pill glass">${esc(p.alias)}</span>${p.equipe?`<span class="pill glass">${esc(p.equipe)}</span>`:""}</div><h3>${esc(p.nom)}</h3></div></div>
 <div class="g-wrap"><div class="dr-k"><div><b>${m.length}</b><span>incidents</span></div><div><b>${r}</b><span>résolus</span></div><div><b>${m.length-r}</b><span>en attente</span></div><div><b>${mj}</b><span>majeurs</span></div></div>
  ${o.length?`<div class="dr-apps">${o.map(([k,v])=>`<span class="pill neutral">${esc(k)} · ${v}</span>`).join("")}</div>`:""}
  <div class="dr-list">${m.map(t=>{const d=t.date?t.date.split("-"):null;return `<button type="button" class="dr-i" data-rid="${t._id}"><span class="dr-d">${d?`<b>${d[2]}</b><span>${MOISF[+d[1]-1]}</span>`:"<b>—</b>"}</span><span class="dr-b"><b>${esc(t.desc)}</b><span>${esc(t.app)} · ${esc(t.cat)}${t.num?` · ticket ${esc(t.num)}`:""}</span></span><span class="dr-s">${t.majeur?`<span class="pill crit">Majeur</span>`:""}<span class="pill ${RCSTAT[t.statut]}">${esc(t.statut)}</span></span></button>`}).join("")||`<p class="note">Aucun incident attribué à cet agent pour l'instant. Attribuez-le depuis l'onglet « Tickets & traçabilité ».</p>`}</div>
  <div class="rf-box"><h5>Modifier</h5><div class="rf-add"><input class="f" id="pp-nom" value="${esc(p.nom)}" aria-label="Nom"><select class="f" id="pp-eq" style="width:auto" aria-label="Équipe">${[...new Set([...RCC_TEAMS,p.equipe].filter(Boolean))].map(e=>`<option ${e===p.equipe?"selected":""}>${esc(e)}</option>`).join("")}</select><button type="button" class="btn" id="pp-sv">Enregistrer</button></div>
   <div class="g-nav">${p.photo?`<button type="button" class="link" id="pp-rm">Retirer la photo</button>`:"<span></span>"}<button type="button" class="btn" id="pp-del">Retirer cet agent</button></div></div></div>`}
function bindPerson(p){$("#pp-ph").onclick=()=>pickPhoto(d=>setPersonPhoto(p.alias,d));$("#pp-rm")&&($("#pp-rm").onclick=()=>setPersonPhoto(p.alias,""));
 $("#mbody").querySelectorAll("[data-rid]").forEach(b=>b.onclick=()=>openRcc(b.dataset.rid));
 $("#pp-sv").onclick=async()=>{p.nom=$("#pp-nom").value.trim()||p.nom;p.equipe=$("#pp-eq").value;try{await rccSavePeople();toast("Agent mis à jour")}catch(e){toast("Enregistrement refusé")}if(RC.mode!=="db")renderRCC();renderModal()};
 $("#pp-del").onclick=async e=>{const b=e.currentTarget;if(!b.dataset.c){b.dataset.c=1;b.textContent="Confirmer : retirer "+p.nom;return}RC.people=RC.people.filter(x=>x.alias!==p.alias);await rccSavePeople().catch(()=>{});if(RC.mode!=="db")renderRCC();closeModal();toast("Agent retiré")}}
