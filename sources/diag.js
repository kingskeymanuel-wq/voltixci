/* =========================================================
   DIAGNOSTIC — capture d'écran → erreur → solutions
   Trois moteurs, du plus fort au plus simple :
   1. Claude (dans claude.ai)  2. IA du serveur (Render + clé)
   3. Lecture automatique OCR dans le navigateur + dictionnaire
   ========================================================= */
let sample=null,sampleImages=false,serverAI=false,serverCode=false,localOCR=false,shot=null,diagCtl=null,lastDiag=null;

/* ---------- Accueil : contenus fixes ---------- */
const EXAMPLES=["Outlook reste bloqué au chargement","Le client ne m'entend pas","Je reste en Non prêt","0x80040220","SIP 503","Teams : on ne m'entend pas","L'imprimante n'imprime plus","Écran bleu"];
$("#heroart").innerHTML=heroVisual();
$("#examples").innerHTML=EXAMPLES.map(e=>`<button type="button">${esc(e)}</button>`).join("");
$("#examples").querySelectorAll("button").forEach(b=>b.onclick=()=>{$("#ask").value=b.textContent;runDiag()});
$("#totals").textContent=`${FICHES.length} fiches · ${ERR.length} codes d'erreur · ${GUIDES.length} guides · ${SCRIPTS.length} réparations automatiques`;
$("#domains").innerHTML=Object.entries(DOM).map(([k,v])=>`<button class="dom2" data-dom="${k}">${domTile(k)}<span class="dom2-b"><b>${esc(v.n)}</b><span>${esc(v.d)}</span><em>${FICHES.filter(p=>p.d===k).length} fiches</em></span></button>`).join("");
$("#domains").querySelectorAll(".dom2").forEach(b=>b.onclick=()=>{fdom=b.dataset.dom;$("#q").value="";renderDom();renderList();location.hash="pannes"});
$("#quick").innerHTML=["W-02","N-01","OL-03","T-01","AG-01","E-03"].map(id=>byId(id)).filter(Boolean).map(p=>itemHTML(p,false)).join("");
$("#quick").querySelectorAll(".item").forEach(b=>b.onclick=()=>openFiche(b.dataset.id));
function ficheCards(ids){return `<div class="cards">${ids.map(id=>byId(id)).filter(Boolean).map(p=>itemHTML(p,false)).join("")}</div>`}
function bindCards(root){root.querySelectorAll(".item").forEach(b=>b.onclick=()=>openFiche(b.dataset.id))}

/* ---------- Capture : choisir, déposer, coller ---------- */
const dz=$("#dropzone");
function setShot(file){if(!file||!/^image\//.test(file.type||"")){toast("Choisissez une image (PNG, JPG…)");return false}
 if(shot)URL.revokeObjectURL(shot.url);shot={file,url:URL.createObjectURL(file),name:file.name||"capture.png"};renderShot();return true}
function renderShot(){const box=$("#shotbox");if(!shot){box.hidden=true;dz.hidden=false;return}
 dz.hidden=true;box.hidden=false;box.innerHTML=`<img src="${shot.url}" alt="Capture d'écran à analyser"><div class="shotbox-t"><b>Capture prête</b><span>${esc(shot.name)}</span><span class="shotbox-a"><button type="button" class="link" id="chshot">Changer</button><button type="button" class="link" id="rmshot">Retirer</button></span></div>`;
 $("#rmshot").onclick=()=>{URL.revokeObjectURL(shot.url);shot=null;$("#shotin").value="";renderShot()};$("#chshot").onclick=()=>$("#shotin").click()}
$("#shotin").onchange=()=>{const f=$("#shotin").files[0];if(f&&setShot(f))runDiag()};
dz.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();$("#shotin").click()}});
["dragenter","dragover"].forEach(ev=>document.addEventListener(ev,e=>{if([...(e.dataTransfer?.types||[])].includes("Files")){e.preventDefault();document.body.classList.add("dragging")}}));
["dragleave","drop"].forEach(ev=>document.addEventListener(ev,e=>{if(ev==="dragleave"&&e.relatedTarget)return;document.body.classList.remove("dragging")}));
document.addEventListener("drop",e=>{const f=[...(e.dataTransfer?.files||[])].find(x=>/^image\//.test(x.type));if(!f)return;e.preventDefault();closeModal();if(location.hash.slice(1)!=="accueil"&&location.hash)location.hash="accueil";if(setShot(f))runDiag()});
document.addEventListener("paste",e=>{const it=[...(e.clipboardData?.items||[])].find(i=>i.type&&i.type.startsWith("image/"));if(!it)return;const f=it.getAsFile();if(!f)return;e.preventDefault();closeModal();
 const named=new File([f],"capture-collee.png",{type:f.type});if(location.hash&&location.hash.slice(1)!=="accueil")location.hash="accueil";if(setShot(named)){toast("Capture collée : analyse en cours");runDiag()}});
$("#askform").addEventListener("submit",e=>{e.preventDefault();runDiag()});

/* ---------- Outils ---------- */
async function shrink(file,max=1600){try{const bmp=await createImageBitmap(file);const s=Math.min(1,max/Math.max(bmp.width,bmp.height));const c=document.createElement("canvas");c.width=Math.round(bmp.width*s);c.height=Math.round(bmp.height*s);const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(bmp,0,0,c.width,c.height);const b=await new Promise(r=>c.toBlob(r,"image/jpeg",.88));return b||file}catch(e){return file}}
function blobB64(b){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(",")[1]||"");r.onerror=rej;r.readAsDataURL(b)})}
function parseJSON(t){if(t&&typeof t==="object")return t;const s=String(t||"");const a=s.indexOf("{"),b=s.lastIndexOf("}");if(a<0||b<a)throw{code:"parse"};return JSON.parse(s.slice(a,b+1))}
function withTimeout(p,ms){return Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej({code:"timeout"}),ms))])}

/* ---------- Reconnaissance de l'application ---------- */
const APPS={
 cisco:{n:"Cisco (Finesse, téléphone IP)",k:["finesse","jabber","cucm","uccx","ucce","cisco","non pret","not ready","sip ","registering","tftp","agent desktop","bureau de l'agent","enregistrement..."]},
 crm:{n:"Microsoft Engage (CRM)",k:["dynamics","engage","crm","0x8004","fichier journal","log file","doublon","duplicate","dossier","seclib","privilege"]},
 teams:{n:"Microsoft Teams",k:["teams","reunion","meeting","caa2","caa8","caa9","camera","participants"]},
 outlook:{n:"Outlook",k:["outlook","boite de reception","inbox","exchange",".pst",".ost","boite aux lettres","mailbox","0x800ccc"]},
 office:{n:"Word, Excel & Office",k:["word","excel","powerpoint","sans licence","unlicensed","office"]},
 print:{n:"Imprimante",k:["imprimante","printer","spouleur","spooler","impression","toner","bourrage"]},
 net:{n:"Réseau & Internet",k:["internet","dns_","err_","wi-fi","wifi","vpn","169.254","proxy","ethernet","hors connexion"]},
 sec:{n:"Sécurité",k:["rancon","ransom","virus","menace","threat","hameconnage","phishing","chiffre"]},
 acc:{n:"Compte & mot de passe",k:["mot de passe","password","verrouille","locked","identifiant"]},
 win:{n:"Windows",k:["windows","votre pc","code d'arret","stop code","bsod","mise a jour","update","0x8007","0xc0","explorateur","bureau"]}
};
function detectApp(text){const t=norm(text);let best=null,bs=0;for(const[k,a]of Object.entries(APPS)){let s=0;a.k.forEach(w=>{if(t.includes(w))s+=w.length>5?2:1});if(s>bs){bs=s;best=k}}return bs?best:null}
function fixOCR(t){return String(t||"").replace(/\b[O0][xX][0-9A-Za-z]{6,8}\b/g,m=>"0x"+m.slice(2).replace(/[oO]/g,"0").replace(/[iIl|]/g,"1").replace(/[sS](?=[0-9a-fA-F]*$)/g,s=>s))}
function localDiag(text,desc){text=fixOCR(text);const all=(desc+"\n"+text).trim();const codes=errMatch(all,4);const app=detectApp(all);
 const ids=[];codes.forEach(e=>{if(e.ref&&byId(e.ref)&&!ids.includes(e.ref))ids.push(e.ref)});
 const loc=localMatch(all,8,FICHES);loc.filter(p=>!app||p.d===app).forEach(p=>{if(ids.length<4&&!ids.includes(p.id))ids.push(p.id)});
 if(ids.length<2&&!app)loc.forEach(p=>{if(ids.length<3&&!ids.includes(p.id))ids.push(p.id)});
 if(!ids.length&&app)FICHES.filter(p=>p.d===app).slice(0,3).forEach(p=>ids.push(p.id));
 const f0=ids[0]&&byId(ids[0]);
 const gestes=codes[0]?codes[0].fx.slice(0,4):f0?f0.st.slice(0,3).map(s=>s.t+(s.d?" : "+s.d:"")):[];
 const urg=codes[0]?{crit:"haute",maj:"moyenne",min:"faible"}[codes[0].s]:f0?{crit:"haute",maj:"moyenne",min:"faible"}[f0.s]:"";
 return {resume:codes[0]?codes[0].n:app?`Problème lié à : ${APPS[app].n}`:ids.length?"Voici les pistes les plus probables":"",app,urgence:urg,codes,fiches:ids,gestes,erreur_lue:"",explication_code:"",support_immediat:["S-02"].includes(ids[0])}}

/* ---------- Moteur OCR (navigateur) ---------- */
let tessP=null;
function loadTess(){if(window.Tesseract)return Promise.resolve();if(tessP)return tessP;tessP=new Promise((res,rej)=>{const s=document.createElement("script");s.src=localOCR?"/vendor/tesseract/tesseract.min.js":"https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";s.onload=()=>window.Tesseract?res():rej({code:"ocr_load"});s.onerror=()=>{tessP=null;rej({code:"ocr_load"})};document.head.appendChild(s)});return tessP}
async function ocr(file,onp){await withTimeout(loadTess(),20000);const opt=localOCR?{workerPath:"/vendor/tesseract/worker.min.js",corePath:"/vendor/core",langPath:"/vendor/lang"}:{};const r=await withTimeout(Tesseract.recognize(file,"fra+eng",{...opt,logger:m=>{if(m&&m.status==="recognizing text")onp(Math.round((m.progress||0)*100))}}),90000);return (r&&r.data&&r.data.text)||""}

/* ---------- Moteur IA (Claude ou serveur) ---------- */
function buildPrompt(q,hasImg){const catalog=P.map(p=>`${p.id} | ${p.t}${p.sym?" | "+p.sym.join(" ; "):""}`).join("\n");
 return `Tu es technicien de support informatique. Tu aides un débutant dans une entreprise : postes Windows, Microsoft Teams, Outlook, Office, le CRM Microsoft Engage (Dynamics 365) et un centre d'appels Cisco (Finesse, téléphones IP, Jabber).
Catalogue des fiches disponibles (id | titre | symptômes) :
${catalog}

Dictionnaire des codes d'erreur connus (code | signification) :
${ERR.map(e=>e.c+" | "+e.n).join("\n")}

${hasImg?"Une capture d'écran est jointe : lis attentivement tous les messages, codes et titres de fenêtre affichés, et identifie l'application concernée.\n":""}Description de l'utilisateur : « ${q||"(aucune, utilise la capture)"} »

Réponds UNIQUEMENT avec un objet JSON, sans texte autour :
{"resume":"une phrase simple qui dit ce qui se passe","app":"cisco|crm|teams|outlook|office|win|net|print|web|acc|sec|hw|autre","erreur_lue":"le message ou code exact lu sur la capture, ou chaîne vide","urgence":"faible|moyenne|haute","codes":["codes du dictionnaire qui correspondent, copiés exactement, ou liste vide"],"explication_code":"si un code ou message d'erreur n'est pas dans le dictionnaire : son sens en deux phrases simples, sinon chaîne vide","gestes":["3 à 5 actions concrètes à faire tout de suite, dans l'ordre, phrases courtes avec les menus exacts"],"fiches":["1 à 3 id du catalogue, du plus probable au moins probable"],"support_immediat":false}
Mets support_immediat à true seulement si la situation est dangereuse (virus, rançon, panne générale, données en jeu). Français simple, sans jargon.`}
async function aiDiag(q,sig){const hasImg=!!shot;let r;
 if(sample){const opts={signal:sig};if(hasImg&&sampleImages)opts.images=[await shrink(shot.file)];r=await sample.json(buildPrompt(q,hasImg&&sampleImages),opts);r.__src="claude"}
 else{const body={prompt:buildPrompt(q,hasImg)};if(hasImg){const b=await shrink(shot.file);body.image=await blobB64(b);body.mediaType=b.type||"image/jpeg"}const code=store.get("accesscode","");if(code)body.code=code;
  const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:sig});const j=await res.json().catch(()=>({}));
  if(!res.ok)throw{code:j.error||"server"};r=parseJSON(j.text);r.__src="server"}
 const codes=(Array.isArray(r.codes)?r.codes:[]).map(c=>ERR.find(e=>e.c===String(c))).filter(Boolean);
 const extra=errMatch((r.erreur_lue||"")+" "+q,3).filter(e=>!codes.includes(e));
 return {resume:r.resume||"",app:DOM[r.app]?r.app:null,urgence:r.urgence||"",codes:[...codes,...extra].slice(0,4),fiches:(Array.isArray(r.fiches)?r.fiches:[]).map(String).filter(id=>byId(id)).slice(0,4),gestes:(Array.isArray(r.gestes)?r.gestes:[]).slice(0,5),erreur_lue:r.erreur_lue||"",explication_code:r.explication_code||"",support_immediat:!!r.support_immediat,src:r.__src}}

/* ---------- Affichage ---------- */
const SRC={claude:["info","Analyse par Claude"],server:["info","Analyse par IA"],ocr:["neutral","Lecture automatique de la capture"],local:["neutral","Recherche instantanée"]};
function progressHTML(steps){return `<div class="prog">${steps.map(s=>`<div class="prog-s ${s[1]}"><span class="prog-i">${s[1]==="done"?"✓":s[1]==="run"?'<span class="spin"></span>':""}</span><span>${esc(s[0])}</span></div>`).join("")}</div>`}
function renderProgress(steps,extra){$("#dmain").innerHTML=`<div class="res-card"><div class="res-head"><span class="pill info">Analyse en cours</span></div><h3 class="res-title">Je regarde votre problème…</h3>${progressHTML(steps)}${extra?`<p class="note">${extra}</p>`:""}</div>`}
function renderResult(d,ocrText){lastDiag=d;const urg={faible:["min","Urgence faible"],moyenne:["maj","Urgence moyenne"],haute:["crit","Urgence haute"]}[d.urgence];
 const src=SRC[d.src]||SRC.local;const nothing=!d.codes.length&&!d.fiches.length&&!d.gestes.length;
 let h=`<div class="res-card"><div class="res-head"><span class="pill ${src[0]}">${src[1]}</span>${d.app&&DOM[d.app]?`<span class="pill neutral app-pill">${svgI(d.app)}${esc(DOM[d.app].n)}</span>`:""}${urg?`<span class="pill ${urg[0]}">${urg[1]}</span>`:""}</div>
 <h3 class="res-title">${esc(d.resume||(nothing?"Je n'ai pas reconnu l'erreur":"Voici ce que je propose"))}</h3>
 ${d.erreur_lue?`<div class="readout"><span class="mono">Lu sur la capture</span><b>${esc(d.erreur_lue)}</b></div>`:""}
 ${d.support_immediat?alertHTML("crit","<b>Prévenez le support tout de suite.</b> N'essayez pas de réparer seul, et ne redémarrez pas le poste."):""}
 ${d.explication_code?alertHTML("info",`<b>Ce que veut dire l'erreur :</b> ${esc(d.explication_code)}`):""}
 ${nothing?`<p class="note" style="margin:0">Ajoutez une phrase pour décrire ce que vous faisiez (ex. « en ouvrant Outlook »), ou une capture plus nette où le message est bien lisible, puis relancez l'analyse.</p>`:""}</div>`;
 if(d.gestes.length)h+=`<div class="res-card"><h4 class="res-sub">À faire tout de suite</h4><ol class="todo">${d.gestes.map(g=>`<li><span>${esc(g)}</span></li>`).join("")}</ol></div>`;
 if(d.codes.length)h+=`<div class="res-card"><h4 class="res-sub">${d.codes.length>1?"Codes d'erreur reconnus":"Code d'erreur reconnu"}</h4><p class="note" style="margin:-4px 0 10px">Cliquez pour l'explication complète.</p><div class="errs">${d.codes.map(e=>errHTML(e)).join("")}</div></div>`;
 if(d.fiches.length)h+=`<div class="res-card"><h4 class="res-sub">Résolution pas à pas</h4><p class="note" style="margin:-4px 0 10px">Ouvrez la fiche et suivez les étapes illustrées.</p>${ficheCards(d.fiches)}</div>`;
 if(ocrText&&ocrText.trim())h+=`<details class="res-card ocr"><summary>Texte lu sur la capture</summary><pre>${esc(ocrText.trim().slice(0,3000))}</pre></details>`;
 h+=`<div class="res-actions"><button class="btn" id="dlog">Noter dans le journal</button><button class="btn" id="dnew">Nouvelle analyse</button></div>`;
 $("#dmain").innerHTML=h;bindCards($("#dmain"));
 $("#dlog").onclick=()=>{const f=d.fiches[0]&&byId(d.fiches[0]);prefill({t:d.resume||$("#ask").value.trim()||"Incident analysé depuis une capture",d:d.app||f?.d||"win",s:urg?urg[0]:"maj",id:f?.id||"",err:d.erreur_lue||(d.codes[0]?.c||"")});location.hash="journal"};
 $("#dnew").onclick=()=>{if(shot){URL.revokeObjectURL(shot.url);shot=null;$("#shotin").value="";renderShot()}$("#ask").value="";$("#answer").innerHTML="";window.scrollTo({top:0,behavior:"smooth"});$("#ask").focus()}}

/* ---------- Lancement de l'analyse ---------- */
async function runDiag(){const q=$("#ask").value.trim();const ans=$("#answer");
 if(!q&&!shot){ans.innerHTML=alertHTML("info","Collez ou déposez une capture d'écran de l'erreur, ou décrivez le problème en une phrase.");return}
 diagCtl?.abort();diagCtl=new AbortController();const sig=diagCtl.signal;const btn=$("#askbtn");btn.disabled=true;
 ans.innerHTML=`<div class="diag">${shot?`<figure class="diag-shot"><img src="${shot.url}" alt="Capture analysée"><figcaption>Votre capture</figcaption></figure>`:""}<div class="diag-main" id="dmain"></div></div>`;
 setTimeout(()=>ans.scrollIntoView({behavior:"smooth",block:"start"}),50);
 const S=shot?["Lecture de la capture","Identification de l'erreur","Recherche des solutions"]:["Compréhension du problème","Recherche des solutions"];
 const st=(i)=>S.map((s,j)=>[s,j<i?"done":j===i?"run":"wait"]);
 renderProgress(st(0));
 try{
  if(sample||serverAI){
   try{renderProgress(st(0),sample?"Claude lit la capture et cherche la solution (10 à 40 secondes).":"L'IA lit la capture et cherche la solution (10 à 40 secondes).");
    const d=await aiDiag(q,sig);if(sig.aborted)return;renderResult(d);return}
   catch(e){if(sig.aborted||e?.name==="AbortError")return;if(e?.code==="bad_code"){$("#accesswrap").hidden=false;toast("Code d'accès de l'équipe requis pour l'analyse IA")}
    else if(e?.code==="rate_limited")toast("Trop d'analyses rapprochées : lecture automatique utilisée")}
  }
  let text="";
  if(shot){try{text=await ocr(shot.file,p=>{if(!sig.aborted)renderProgress(st(0),`Lecture du texte de la capture : ${p} %`)})}catch(e){text=""}}
  if(sig.aborted)return;renderProgress(st(1));
  const d=localDiag(text,q);d.src=shot&&text?"ocr":"local";
  if(shot&&!text&&!q){d.resume="Je n'ai pas pu lire le texte de la capture";d.explication_code="";}
  if(text){const first=errMatch(fixOCR(text),1)[0];if(first)d.erreur_lue=first.c}
  renderResult(d,text);
 }finally{btn.disabled=false}}

/* ---------- Journal hors claude.ai (enregistré sur l'appareil) ---------- */
let jlocal=false;
function dlFile(name,text,type){try{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);toast("Fichier téléchargé")}catch(e){toast("Téléchargement impossible")}}

/* ---------- Démarrage ---------- */
async function initWeb(){
 if(IN_CLAUDE){$("#aimode").textContent="Analyse par Claude";return}
 jlocal=true;rows=store.get("journal-local",[]);dbLoading=false;$("#jcsv").hidden=false;$("#scdl").hidden=false;$("#scdl").textContent="Télécharger reparation.bat";
 $("#jmode").hidden=false;renderJournal();
 $("#aimode").textContent="Lecture automatique des captures";
 if(!/^https?:/.test(location.protocol))return;
 try{const r=await withTimeout(fetch("/api/status",{cache:"no-store"}),5000);if(r.ok){const j=await r.json();serverAI=!!j.ai;serverCode=!!j.code;localOCR=!!j.ocr;if(serverAI)$("#aimode").textContent="Analyse IA activée";if(serverAI&&serverCode&&!store.get("accesscode",""))$("#accesswrap").hidden=false}}catch(e){}}
$("#accesscode").addEventListener("change",()=>{store.set("accesscode",$("#accesscode").value.trim());toast("Code enregistré sur cet appareil")});
renderDom();renderList();renderErrTools();renderErrs();renderGuides();renderScripts();renderCL();renderJournal();
show(location.hash.slice(1));initCaps();initWeb();
