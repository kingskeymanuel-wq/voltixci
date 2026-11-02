/* =========================================================
   INTERFACE v4 — mode guidé des fiches, photos, vignettes
   ========================================================= */
let ficheMode=store.get("fichemode","guided"),gIdx={};
function renderDetail(sel,id){const p=byId(id);if(!p)return;
 if(ficheMode==="guided"&&p.st&&p.st.length&&!p.table)return renderGuided(sel,p);
 renderDetailFull(sel,id);addModeSwitch(sel,p)}
function modeSwitch(p){return p.st&&p.st.length&&!p.table?`<div class="mswitch" role="group" aria-label="Affichage"><button data-mode="guided" aria-pressed="${ficheMode==="guided"}">Pas à pas</button><button data-mode="full" aria-pressed="${ficheMode==="full"}">Toutes les étapes</button></div>`:""}
function addModeSwitch(sel,p){const h=$(sel+" .d-head");if(!h)return;h.insertAdjacentHTML("beforeend",modeSwitch(p));bindModeSwitch(sel,p)}
function bindModeSwitch(sel,p){$(sel).querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>{ficheMode=b.dataset.mode;store.set("fichemode",ficheMode);renderDetail(sel,p.id);$("#mbox").scrollTop=0})}
function ficheHead(p){const guide=p.d==="guide";return `<div class="d-head banner" style="${bannerStyle(guide?"guide":p.d)}"><div class="meta">${guide?'<span class="pill info">Guide</span>':`<span class="pill ${p.s}">${SEV[p.s]}</span>`}<span class="pill glass">${p.id}</span>${guide?"":`<span class="pill glass">${esc(DOM[p.d].n)}</span>`}<span class="pill glass">${LVL[p.lvl]}</span><span class="pill glass">${esc(p.tm)}</span></div><h3>${esc(p.t)}</h3>${p.intro?`<p>${esc(p.intro)}</p>`:""}${modeSwitch(p)}</div>`}
function renderGuided(sel,p){const box=$(sel),n=p.st.length,d=doneSteps[p.id]||[];let i=gIdx[p.id]??Math.min(d.length?Math.max(...d)+1:0,n);gIdx[p.id]=i;
 let h=ficheHead(p)+`<div class="g-wrap">`;
 if(i===0&&p.sym)h+=`<div class="g-intro"><div><h5>Ce que vous voyez</h5><ul>${p.sym.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div><div><h5>Causes probables</h5><ul>${p.cau.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div></div>`;
 if(p.lvl===3&&i<n)h+=alertHTML("warn","<b>Fiche avancée.</b> Les commandes serveur ou réseau sont réservées à l'administrateur : faites les vérifications simples et transmettez le résultat.");
 h+=`<div class="g-dots">${p.st.map((s,k)=>`<button class="g-dot ${k===i?"cur":d.includes(k)?"done":""}" data-g="${k}" aria-label="Étape ${k+1}">${d.includes(k)?"✓":k+1}</button>`).join("")}<button class="g-dot end ${i===n?"cur":""}" data-g="${n}" aria-label="Résultat">${svgI("flag",2)}</button></div>`;
 if(i<n){const s=p.st[i],lk=s.link&&byId(s.link);h+=`<div class="g-step"><div class="g-k">Étape ${i+1} sur ${n}</div><h4>${esc(s.t)}</h4>${s.d?`<p>${esc(s.d)}</p>`:""}${s.ill?`<div class="ill-wrap g-ill">${ill(s.ill)}${s.ill.cap&&s.ill.k!=="keys"?`<div class="ill-cap">${esc(s.ill.cap)}</div>`:""}</div>`:""}${s.cmd?cmdHTML(s.cmd):""}${lk?`<div class="st-link"><button class="link" data-open="${lk.id}">${lk.d==="guide"?"Guide":"Fiche"} ${lk.id} : ${esc(lk.t)} →</button></div>`:""}</div>
  <div class="g-nav"><button class="btn" id="gprev" ${i===0?"disabled":""}>← Précédent</button><button class="btn primary big" id="gnext">${i===n-1?"C'est fait : voir le résultat":"C'est fait, étape suivante →"}</button></div>`}
 else{const guide=p.d==="guide";h+=`<div class="g-end"><div class="g-end-ic">${svgI("flag",2)}</div><h4>${guide?"Guide terminé":"Le problème est-il réglé ?"}</h4><p>${guide?"Vous connaissez maintenant ce geste. Il revient dans de nombreuses fiches.":`Vous avez suivi ${d.length} étape${d.length>1?"s":""} sur ${n}. Indiquez le résultat : l'incident est noté dans le journal.`}</p>
  ${guide?`<div class="g-nav"><button class="btn" id="gback">← Revoir les étapes</button><button class="btn primary big" data-goto="academie">Continuer à apprendre</button></div>`:`<div class="g-nav"><button class="btn ok big" data-res="ok">✓ C'est réglé</button><button class="btn big" data-res="ko">Toujours bloqué</button></div>
  <div class="esc-box" hidden>${alertHTML("info",`<b>Qui contacter :</b> ${esc(p.esc)}<br>Donnez l'heure du début, le message d'erreur exact et les étapes déjà faites (${d.length}/${n}).`)}</div><button class="link" id="gback">← Revoir les étapes</button>`}
  ${p.pre&&p.pre.length?`<div class="g-pre"><h5>Pour que ça ne revienne pas</h5><ul>${p.pre.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`:""}</div>`}
 box.innerHTML=h+"</div>";bindModeSwitch(sel,p);
 const go=k=>{gIdx[p.id]=Math.max(0,Math.min(n,k));renderGuided(sel,p);$("#mbox").scrollTo({top:0,behavior:"smooth"})};
 box.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>go(+b.dataset.g));
 $("#gprev")&&($("#gprev").onclick=()=>go(i-1));
 $("#gnext")&&($("#gnext").onclick=()=>{const a=new Set(doneSteps[p.id]||[]);a.add(i);doneSteps[p.id]=[...a].sort((x,y)=>x-y);store.set("steps",doneSteps);go(i+1)});
 $("#gback")&&($("#gback").onclick=()=>go(0));
 box.querySelectorAll("[data-res]").forEach(b=>b.onclick=()=>{if(b.dataset.res==="ko")box.querySelector(".esc-box").hidden=false;quickLog(p,b.dataset.res==="ok"?"Résolu":"Ouvert");if(b.dataset.res==="ok"){delete gIdx[p.id];b.textContent="✓ Noté comme réglé"}})}

/* ---------- Accueil : photo d'agent + cartes flottantes ---------- */
function heroVisual(){const u=photo("hero",1000);if(!u)return heroArt();
 return `<div class="hv"><div class="hv-ph"><img src="${u}" alt="Agente de centre d'appels avec casque, souriante, devant son ordinateur" onerror="this.closest('.hero-r').innerHTML=heroArt()"></div>
 <div class="hv-c hv-c1"><span class="hv-i red">!</span><div><b>Erreur détectée</b><span class="mono">0x80040220</span></div></div>
 <div class="hv-c hv-c2"><span class="hv-i green">${svgI("check",3)}</span><div><b>Solution trouvée</b><span>Droits CRM · 4 étapes</span></div></div>
 <div class="hv-c hv-c3">${["serge","koffi","fatou"].map(k=>avatar(PEOPLE[k],32).replace('class="ava"','class="ava hv-a"')).join("")}<div><b>Toute l'équipe</b><span>dépanne plus vite</span></div></div></div>`}
function domTile(k){const u=photo(DOMPH[k],600);return u?`<span class="dom-ph" style="background-image:linear-gradient(160deg,rgba(8,15,27,.15),rgba(8,15,27,.55)),url('${u}'),${domGrad(k)}"><span class="dom-badge" style="background:${domGrad(k)}">${svgI(k,2)}</span></span>`:domArt(k)}
