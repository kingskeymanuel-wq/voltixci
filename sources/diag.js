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
 crm:{n:"Microsoft Engage (CRM)",k:["dynamics","engage","crm","0x8004","fichier journal","log file","doublon","duplicate","seclib","privilege","champ obligatoire"]},
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
function fixOCR(t){return String(t||"").replace(/\b[O0][xX][0-9A-Za-z]{6,8}\b/g,m=>"0x"+m.slice(2).replace(/[oO]/g,"0").replace(/[iIl|]/g,"1"))}
/* Construit la liste de mots (avec leur position sur la capture) */
function buildToks(text,words){const toks=[];if(words&&words.length){words.forEach((w,wi)=>tokens(fixOCR(w.text)).forEach(t=>toks.push({t,w:wi})))}else tokens(fixOCR(text)).forEach(t=>toks.push({t,w:-1}));return toks}
const URG={crit:"haute",maj:"moyenne",min:"faible"};
/* Diagnostic local : n'affirme une solution que si le message de la capture est reconnu */
function localDiag(text,desc,words){text=fixOCR(text);const all=(desc+"\n"+text).trim();const app=detectApp(all);
 const codes=errMatch(all,3);
 const toks=buildToks(text,words),dtoks=buildToks(desc,null);
 const sigs=[...sigMatch(toks,app),...sigMatch(dtoks,app).map(s=>({...s,fromDesc:true,i:-1}))];
 const byF={};sigs.forEach(s=>{if(!byF[s.id]||s.score>byF[s.id].score)byF[s.id]=s});
 const cands=[];
 codes.forEach(e=>{let m=errOnShot(e,toks,words,app);if(!m.ok){const md=errOnShot(e,dtoks,null,app);if(!md.ok)return;m={...md,idx:[],desc:true}}cands.push({type:"err",e,id:e.ref&&byId(e.ref)?e.ref:null,score:m.score,phrase:e.c,wordsIdx:m.idx,fromDesc:!!m.desc})});
 cands.sort((a,b)=>b.score-a.score);
 Object.values(byF).sort((a,b)=>b.score-a.score).forEach(s=>{const ex=cands.find(c=>c.id===s.id);if(ex){if(!ex.wordsIdx.length&&s.i>=0)ex.wordsIdx=toks.slice(s.i,s.i+s.n).map(t=>t.w).filter(w=>w>=0);return}cands.push({...s,wordsIdx:s.i>=0?toks.slice(s.i,s.i+s.n).map(t=>t.w).filter(w=>w>=0):[]})});
 cands.sort((a,b)=>b.score-a.score);
 const primary=cands[0]&&cands[0].score>=.8?cands[0]:null;
 const level=!primary?"none":primary.score>=1?"exact":primary.score>=.9?"exact":"forte";
 const others=cands.slice(1).filter(c=>c.score>=.6&&c.id!==(primary&&primary.id)).slice(0,3);
 const f=primary&&primary.id?byId(primary.id):null;const e=primary&&primary.type==="err"?primary.e:null;
 const resume=e?e.n:f?f.t:"";
 return {src:"ocr",app:app||(f&&f.d)||null,level,primary,others,codes,resume,urgence:URG[(e||f||{}).s]||"",support_immediat:primary&&primary.id==="S-02",boxes:[primary,...others].filter(Boolean).map((c,k)=>({idx:c.wordsIdx||[],main:k===0})),descOnly:!String(text||"").trim()&&!!desc,pistes:!primary?(!String(text||"").trim()&&desc?localMatch(desc,4,FICHES).map(p=>p.id):app?FICHES.filter(p=>p.d===app).slice(0,3).map(p=>p.id):[]):[]}}

/* ---------- Moteur OCR (navigateur) ---------- */
let tessP=null;
function loadTess(){if(window.Tesseract)return Promise.resolve();if(tessP)return tessP;tessP=new Promise((res,rej)=>{const s=document.createElement("script");s.src=localOCR?"/vendor/tesseract/tesseract.min.js":"https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";s.onload=()=>window.Tesseract?res():rej({code:"ocr_load"});s.onerror=()=>{tessP=null;rej({code:"ocr_load"})};document.head.appendChild(s)});return tessP}
async function ocr(file,onp){await withTimeout(loadTess(),20000);const opt=localOCR?{workerPath:"/vendor/tesseract/worker.min.js",corePath:"/vendor/core",langPath:"/vendor/lang"}:{};const r=await withTimeout(Tesseract.recognize(file,"fra+eng",{...opt,logger:m=>{if(m&&m.status==="recognizing text")onp(Math.round((m.progress||0)*100))}}),90000);const d=(r&&r.data)||{};return {text:d.text||"",words:(d.words||[]).map(w=>({text:w.text,bbox:w.bbox}))}}

/* ---------- Moteur IA (Claude ou serveur) ---------- */
function buildPrompt(q,hasImg){const catalog=P.map(p=>`${p.id} | ${p.t}${p.sym?" | "+p.sym.join(" ; "):""}`).join("\n");
 return `Tu es technicien de support informatique. Tu aides un débutant dans une entreprise : postes Windows, Microsoft Teams, Outlook, Office, le CRM Microsoft Engage (Dynamics 365) et un centre d'appels Cisco (Finesse, téléphones IP, Jabber).
Catalogue des fiches disponibles (id | titre | symptômes) :
${catalog}

Dictionnaire des codes d'erreur connus (code | signification) :
${ERR.map(e=>e.c+" | "+e.n).join("\n")}

${hasImg?"Une capture d'écran est jointe : lis attentivement tous les messages, codes et titres de fenêtre affichés, et identifie l'application concernée.\n":""}Description de l'utilisateur : « ${q||"(aucune, utilise la capture)"} »

Réponds UNIQUEMENT avec un objet JSON, sans texte autour :
{"resume":"une phrase simple qui dit ce qui se passe","app":"cisco|crm|teams|outlook|office|win|net|print|web|acc|sec|hw|autre","erreur_lue":"le message ou code exact lu sur la capture, ou chaîne vide","urgence":"faible|moyenne|haute","codes":["codes du dictionnaire qui correspondent, copiés exactement, ou liste vide"],"explication_code":"si un code ou message d'erreur n'est pas dans le dictionnaire : son sens en deux phrases simples, sinon chaîne vide","gestes":["3 à 5 actions concrètes à faire tout de suite, dans l'ordre, phrases courtes avec les menus exacts"],"fiche_exacte":"id du catalogue qui traite EXACTEMENT ce message, ou chaîne vide si aucune fiche ne correspond exactement","etapes":["si fiche_exacte est vide : 4 à 7 étapes précises pour résoudre CE message précis, avec les menus exacts ; sinon liste vide"],"support_immediat":false}
Règles : la solution doit correspondre exactement au message lu sur la capture. Ne propose pas une fiche qui traite un autre problème, même proche. Si la capture est illisible ou ne montre pas d'erreur, dis-le dans resume et laisse fiche_exacte vide. Mets support_immediat à true seulement si la situation est dangereuse (virus, rançon, panne générale, données en jeu). Français simple, sans jargon.`}
async function aiDiag(q,sig){const hasImg=!!shot;let r;
 if(sample){const opts={signal:sig};if(hasImg&&sampleImages)opts.images=[await shrink(shot.file)];r=await sample.json(buildPrompt(q,hasImg&&sampleImages),opts);r.__src="claude"}
 else{const body={prompt:buildPrompt(q,hasImg)};if(hasImg){const b=await shrink(shot.file);body.image=await blobB64(b);body.mediaType=b.type||"image/jpeg"}const code=store.get("accesscode","");if(code)body.code=code;
  const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:sig});const j=await res.json().catch(()=>({}));
  if(!res.ok)throw{code:j.error||"server"};r=parseJSON(j.text);r.__src="server"}
 const codes=(Array.isArray(r.codes)?r.codes:[]).map(c=>ERR.find(e=>e.c===String(c))).filter(Boolean);
 const extra=errMatch((r.erreur_lue||"")+" "+q,3).filter(e=>!codes.includes(e));
 const allc=[...codes,...extra].slice(0,3);const loc=localDiag(r.erreur_lue||"",q,null);
 const fx=byId(String(r.fiche_exacte||""))?String(r.fiche_exacte):null;
 let primary=null;if(allc[0])primary={type:"err",e:allc[0],id:allc[0].ref&&byId(allc[0].ref)?allc[0].ref:null,score:1.2,phrase:allc[0].c};
 else if(fx)primary={type:"fiche",id:fx,score:1,phrase:r.erreur_lue||""};else if(loc.primary)primary=loc.primary;
 const etapes=(Array.isArray(r.etapes)?r.etapes:[]).slice(0,8);
 return {src:r.__src,app:DOM[r.app]?r.app:(primary&&primary.id?byId(primary.id).d:null),level:primary?"exact":etapes.length?"ia":"none",primary,others:allc.slice(1).map(e=>({type:"err",e,id:e.ref,score:1})),codes:allc,resume:r.resume||"",urgence:r.urgence||"",etapes,erreur_lue:r.erreur_lue||"",explication_code:r.explication_code||"",support_immediat:!!r.support_immediat,boxes:[],pistes:[]}}

/* ---------- Affichage ---------- */
const SRC={claude:["info","Analyse par Claude"],server:["info","Analyse par IA"],ocr:["neutral","Lecture automatique de la capture"],local:["neutral","Recherche instantanée"]};
function progressHTML(steps){return `<div class="prog">${steps.map(s=>`<div class="prog-s ${s[1]}"><span class="prog-i">${s[1]==="done"?"✓":s[1]==="run"?'<span class="spin"></span>':""}</span><span>${esc(s[0])}</span></div>`).join("")}</div>`}
function renderProgress(steps,extra){$("#dmain").innerHTML=`<div class="res-card"><div class="res-head"><span class="pill info">Analyse en cours</span></div><h3 class="res-title">Je regarde votre problème…</h3>${progressHTML(steps)}${extra?`<p class="note">${extra}</p>`:""}</div>`}
function stepsHTML(list){return `<ol class="rsteps">${list.map(s=>`<li><div><b>${esc(s.t)}</b>${s.d?`<span>${esc(s.d)}</span>`:""}${s.cmd?cmdHTML(s.cmd):""}</div></li>`).join("")}</ol>`}
function drawBoxes(d,words){const svg=$("#dbox"),img=$("#dimg");if(!svg||!img||!words||!words.length||!d.boxes.length)return;
 const go=()=>{const W=img.naturalWidth,H=img.naturalHeight;if(!W)return;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);let h="";const pad=Math.max(4,W/160);
  d.boxes.forEach(b=>{const ws=b.idx.map(i=>words[i]).filter(w=>w&&w.bbox);if(!ws.length)return;
   const x0=Math.min(...ws.map(w=>w.bbox.x0))-pad,y0=Math.min(...ws.map(w=>w.bbox.y0))-pad,x1=Math.max(...ws.map(w=>w.bbox.x1))+pad,y1=Math.max(...ws.map(w=>w.bbox.y1))+pad;
   h+=`<rect x="${x0}" y="${y0}" width="${x1-x0}" height="${y1-y0}" rx="${pad}" class="${b.main?"bx-main":"bx-alt"}" style="stroke-width:${Math.max(2,W/260)}"/>`});
  svg.innerHTML=h;if(h)$("#dcap").textContent="Le message reconnu est entouré sur votre capture"};
 img.complete?go():img.addEventListener("load",go,{once:true})}
function renderResult(d,ocrText,words){lastDiag=d;$("#answer .scanline")?.remove();
 const urg={faible:["min","Urgence faible"],moyenne:["maj","Urgence moyenne"],haute:["crit","Urgence haute"]}[d.urgence];
 const src=SRC[d.src]||SRC.local;const P0=d.primary;const f=P0&&P0.id?byId(P0.id):null;const e=P0&&P0.type==="err"?P0.e:null;
 const LV={exact:["min","✓ Correspondance exacte avec votre capture"],forte:["maj","Correspondance forte avec votre capture"],ia:["info","Solution rédigée pour votre capture"],none:["neutral",d.descOnly?"Recherche par description":"Message non reconnu"]}[d.level];
 const seen=P0&&P0.wordsIdx&&P0.wordsIdx.length&&words?P0.wordsIdx.map(i=>words[i]&&words[i].text).filter(Boolean).join(" "):(d.erreur_lue||(P0&&!P0.fromDesc?P0.phrase:""));
 let h=`<div class="res-card"><div class="res-head"><span class="pill ${src[0]}">${src[1]}</span>${d.app&&DOM[d.app]?`<span class="pill neutral app-pill">${svgI(d.app)}${esc(DOM[d.app].n)}</span>`:""}${urg&&d.level!=="none"?`<span class="pill ${urg[0]}">${urg[1]}</span>`:""}</div>
 <div class="match ${d.level}">${esc(LV[1])}</div>
 <h3 class="res-title">${esc(d.level==="none"?(d.descOnly&&d.pistes.length?"Voici les fiches les plus proches de votre description":d.unread?"Je n'ai pas pu lire de texte sur la capture":"Je ne reconnais pas exactement ce message"):(d.resume||"Voici la solution"))}</h3>
 ${seen?`<div class="readout"><span class="mono">${P0&&P0.fromDesc?"Dans votre description":"Votre capture affiche"}</span><b>« ${esc(seen)} »</b></div>`:""}
 ${d.support_immediat?alertHTML("crit","<b>Prévenez le support tout de suite.</b> N'essayez pas de réparer seul, et ne redémarrez pas le poste."):""}
 ${e?`<div class="mean"><h5>Ce que veut dire ce message</h5><p>${esc(e.m)}</p></div>`:f&&d.level!=="none"?`<div class="mean"><h5>Ce qui se passe</h5><p>${esc(f.t)}.${f.cau&&f.cau.length?" Causes les plus fréquentes : "+esc(f.cau.slice(0,3).join(", ").toLowerCase())+".":""}</p></div>`:""}
 ${d.explication_code&&!e?`<div class="mean"><h5>Ce que veut dire ce message</h5><p>${esc(d.explication_code)}</p></div>`:""}</div>`;
 if(d.level!=="none"){
  let body="";
  if(e&&e.fx&&e.fx.length)body+=`<h5 class="rs-h">À faire tout de suite</h5><ol class="todo">${e.fx.map(x=>`<li><span>${esc(x)}</span></li>`).join("")}</ol>`;
  if(f&&f.st)body+=`<h5 class="rs-h">${e?"Résolution complète":"Étapes de résolution"} · fiche ${f.id}</h5>${stepsHTML(f.st)}<div class="rs-go"><button class="btn primary big" data-open="${f.id}">${svgI("pannes",2.2)}Résoudre pas à pas, avec les écrans</button><span class="note">${f.st.length} étapes · ${esc(f.tm)} · ${LVL[f.lvl]}</span></div>`;
  else if(d.etapes&&d.etapes.length)body+=`<h5 class="rs-h">Étapes de résolution</h5>${stepsHTML(d.etapes.map(t=>({t})))}`;
  if(e&&e.who)body+=alertHTML("info",`<b>Qui prévenir si ça ne suffit pas :</b> ${esc(e.who)}.`);
  else if(f&&f.esc)body+=alertHTML("info",`<b>Si ça ne suffit pas :</b> ${esc(f.esc)}`);
  h+=`<div class="res-card sol"><h4 class="res-sub">Résolution pour ${seen?"ce message":"votre problème"}</h4>${body}</div>`;
  if(d.others&&d.others.length)h+=`<div class="res-card"><h4 class="res-sub">Autres messages reconnus sur la capture</h4><div class="errs">${d.others.map(o=>o.type==="err"?errHTML(o.e):itemHTML(byId(o.id),false)).join("")}</div></div>`;
 }else if(d.descOnly&&d.pistes.length){
  h+=`<div class="res-card"><h4 class="res-sub">Fiches qui correspondent à votre description</h4><p class="note" style="margin:-4px 0 10px">Pour une solution exacte, collez une capture de l'erreur ou recopiez le message affiché.</p>${ficheCards(d.pistes)}</div>`;
 }else{
  h+=`<div class="res-card"><h4 class="res-sub">Pour ne pas vous donner une mauvaise solution</h4><p style="margin:0">Je ne propose une résolution que lorsque le message affiché est reconnu. Pour y arriver :</p><ol class="todo"><li><span>Faites une capture où le message d'erreur est bien lisible (Win + Maj + S, puis sélectionnez juste la fenêtre d'erreur).</span></li><li><span>Ou recopiez le message ou le code exact dans la case de description, puis relancez l'analyse.</span></li><li><span>Ou cherchez le code dans le Dictionnaire des erreurs.</span></li></ol>${d.ocrFail?alertHTML("warn","La lecture automatique n'a pas pu démarrer : vérifiez la connexion internet."):""}</div>`;
  if(d.pistes&&d.pistes.length)h+=`<div class="res-card"><h4 class="res-sub">Pistes à vérifier (non certaines)</h4><p class="note" style="margin:-4px 0 10px">La capture semble concerner : ${esc(DOM[d.app].n)}. Ces fiches ne correspondent pas forcément à votre message.</p>${ficheCards(d.pistes)}</div>`;
 }
 if(ocrText&&ocrText.trim())h+=`<details class="res-card ocr" ${d.level==="none"?"open":""}><summary>Texte lu sur la capture</summary><pre>${esc(ocrText.trim().slice(0,3000))}</pre></details>`;
 h+=`<div class="res-actions"><button class="btn" id="dlog">Noter dans le journal</button><button class="btn" id="dnew">Nouvelle analyse</button></div>`;
 $("#dmain").innerHTML=h;bindCards($("#dmain"));drawBoxes(d,words);
 $("#dlog").onclick=()=>{prefill({t:d.resume||$("#ask").value.trim()||"Incident analysé depuis une capture",d:d.app||f?.d||"win",s:urg?urg[0]:"maj",id:f?.id||"",err:seen||(e?e.c:"")});location.hash="journal"};
 $("#dnew").onclick=()=>{if(shot){URL.revokeObjectURL(shot.url);shot=null;$("#shotin").value="";renderShot()}$("#ask").value="";$("#answer").innerHTML="";window.scrollTo({top:0,behavior:"smooth"});$("#ask").focus()}}

/* ---------- Lancement de l'analyse ---------- */
async function runDiag(){const q=$("#ask").value.trim();const ans=$("#answer");
 if(!q&&!shot){ans.innerHTML=alertHTML("info","Collez ou déposez une capture d'écran de l'erreur, ou décrivez le problème en une phrase.");return}
 diagCtl?.abort();diagCtl=new AbortController();const sig=diagCtl.signal;const btn=$("#askbtn");btn.disabled=true;
 ans.innerHTML=`<div class="diag">${shot?`<figure class="diag-shot"><div class="shot-wrap"><img id="dimg" src="${shot.url}" alt="Capture analysée"><svg id="dbox" class="shot-boxes" aria-hidden="true"></svg><span class="scanline"></span></div><figcaption id="dcap">Votre capture</figcaption></figure>`:""}<div class="diag-main" id="dmain"></div></div>`;
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
  let o={text:"",words:[]},ocrFail=false;
  if(shot){try{o=await ocr(shot.file,p=>{if(!sig.aborted)renderProgress(st(0),`Lecture du texte de la capture : ${p} %`)})}catch(e){ocrFail=true}}
  if(sig.aborted)return;renderProgress(st(1));
  const d=localDiag(o.text,q,o.words);d.src=shot&&o.text.trim()?"ocr":"local";d.ocrFail=ocrFail&&!!shot;d.unread=!!shot&&!o.text.trim()&&!q;
  renderResult(d,o.text,o.words);
 }finally{btn.disabled=false}}

/* ---------- Journal hors claude.ai (enregistré sur l'appareil) ---------- */
let jlocal=false;
function dlFile(name,text,type){try{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);toast("Fichier téléchargé")}catch(e){toast("Téléchargement impossible")}}

/* ---------- Démarrage ---------- */
async function initWeb(){
 if(IN_CLAUDE){$("#aimode").textContent="Analyse par Claude";return}
 jlocal=true;rows=store.get("journal-local",[]);dbLoading=false;$("#jcsv").hidden=false;$("#scdl").hidden=false;$("#scdl").textContent="Télécharger reparation.bat";
 $("#jmode").hidden=false;renderJournal();rccInit();
 $("#aimode").textContent="Lecture automatique des captures";
 if(!/^https?:/.test(location.protocol))return;
 try{const r=await withTimeout(fetch("/api/status",{cache:"no-store"}),5000);if(r.ok){const j=await r.json();serverAI=!!j.ai;serverCode=!!j.code;localOCR=!!j.ocr;if(serverAI)$("#aimode").textContent="Analyse IA activée";if(serverAI&&serverCode&&!store.get("accesscode",""))$("#accesswrap").hidden=false}}catch(e){}}
$("#accesscode").addEventListener("change",()=>{store.set("accesscode",$("#accesscode").value.trim());toast("Code enregistré sur cet appareil")});
renderDom();renderList();renderErrTools();renderErrs();renderGuides();renderScripts();renderCL();renderJournal();
show(location.hash.slice(1));initCaps();initWeb();
