/* =========================================================
   INCIDENTS RCC — lecture et nettoyage du fichier Excel
   (même code dans le navigateur et pour l'import initial)
   ========================================================= */
const RCC_TEAMS=["INBOUND","OUTBOUND","Résolution","QA","OPS","CIB","CMB","Supervision","Back-office","IT / Support"];
const RCC_STATUS=["Signalé","Ticket envoyé","En cours","Résolu"];
const RCC_PLATFORMS=["Outil de ticketing IT","E-mail au support","Prestataire / partenaire","Appel au support","Autre"];
const RCC_OUTILS=[ /* [outil, regex sur application + description] */
 ["Réseau",/r[ée]seau|toutes les applications|zone 3|lan|wan/i],
 ["Téléphonie Cisco",/lignes t[ée]l[ée]phoniques|filiale|cisco|finess|finesse|softphone|communicator|ligne|injoignab|joignabilit|entendre les clients|wallbo|cuic|cuicui/i],
 ["Ecobank Engage",/engage/i],
 ["Omnicanal",/omnilite|omniplus|omnicanal|tchat|hootsuite|expertflow/i],
 ["Partenaires & paiements",/cellulant|b2w|bank to wallet|wave|orange|\bom\b|mmh/i],
 ["Ecobank Mobile",/ecobank mobile|application mobile|pi-spi|etoken|cartes virtuelles|mobile app/i],
 ["Notifications OTP / SMS",/otp|sms/i],
 ["Back-office & comptes",/\bbo\b|checking|account statement|solde/i],
 ["Poste de travail",/windows|laptop|microsoft|word|excel/i]
];
const RCC_APPNORM=[[/wallbo?a?rd|wallbord/i,"Wallboard"],[/cuic|cuicui/i,"CUIC"],[/finess/i,"Finesse"],[/^cisco$/i,"Cisco"],[/omnilite/i,"Omnilite"],[/omniplus/i,"Omniplus"],[/omnicanal/i,"Omnicanal"],[/^engage$|ecobank engage/i,"Ecobank Engage"],[/cellulant/i,"Cellulant"],[/^mmh$/i,"MMH"],[/^bo$/i,"Back-office (BO)"],[/checking/i,"Checking"],[/expertflow/i,"ExpertFlow"],[/softphone/i,"Softphone"],[/ecobank mobile|application mobile/i,"Ecobank Mobile"],[/toutes les applications/i,"Toutes les applications"],[/microsoft/i,"Microsoft (postes)"]];
const RCC_CATS=[["Perte de réseau",/perte (g[ée]n[ée]rale )?(du |de )?r[ée]seau|perte r[ée]seau/i],["Lenteur",/lenteur|ralentissement|lent\b/i],["Injoignabilité / audio",/injoignab|joignabilit|impossible d'entendre|impossible de communiquer/i],["Instabilité / déconnexions",/instabilit|d[ée]connexion/i],["Connexion impossible",/impossible de se connecter|probl[èe]me de connexion|impossible d.acc[ée]der/i],["Indisponibilité",/indisponib|unavailable|non r[ée]ception|impossible/i],["Indisponibilité",/impossibilit[ée] de recevoir/i],["Anomalie fonctionnelle",/non visible|solde|statement|issue|ajout|cr[ée]ation|transactions?/i]];
const clean=s=>String(s??"").replace(/[​ ]/g," ").replace(/\s+/g," ").trim();
function rccOutil(app,desc){const t=(app||"")+" | "+desc;for(const[o,re]of RCC_OUTILS)if(re.test(t))return o;return "Autre"}
function rccCat(desc){for(const[c,re]of RCC_CATS)if(re.test(desc))return c;return "Autre"}
function rccApp(app,desc){const a=clean(app);if(a){for(const[re,n]of RCC_APPNORM)if(re.test(a))return {app:a.includes(",")?a:n,inf:false};return {app:a,inf:false}}
 const d=desc;const guess=[[/ligne|injoignab|joignabilit|entendre|communiquer avec la filiale/i,"Lignes téléphoniques RCC"],[/r[ée]seau/i,"Réseau"],[/b2w|bank to wallet|wave|orange|\bom\b/i,"Bank to Wallet (B2W)"],[/ecobank mobile|mobile app/i,"Ecobank Mobile"],[/otp/i,"OTP"],[/sms/i,"SMS de notification"],[/omnicanal/i,"Omnicanal"],[/statement/i,"Relevés de compte"],[/applications/i,"Toutes les applications"]];
 for(const[re,n]of guess)if(re.test(d))return {app:n,inf:true};return {app:"Non précisé",inf:true}}
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
function rccDate(v){const notes=[];if(v===null||v===undefined||v==="")return {d:"",notes};
 if(v instanceof Date&&!isNaN(v))return {d:iso(v),notes};
 if(typeof v==="number"){const d=new Date(Math.round((v-25569)*864e5));return {d:iso(new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())),notes}}
 const s=clean(v);const m=[...s.matchAll(/(\d{1,2})\/(\d{1,2})\/(\d{4})/g)];
 if(m.length){const fix=y=>{const n=+y;if(n>2026){notes.push(`année ${n} corrigée en 2026`);return 2026}return n};const a=m[0],b=m[1];
  const d1=iso(new Date(fix(a[3]),+a[2]-1,+a[1]));const d2=b?iso(new Date(fix(b[3]),+b[2]-1,+b[1])):"";if(b)notes.push("incident sur plusieurs jours");return {d:d1,fin:d2,notes}}
 const mois={janv:0,fev:1,févr:1,mars:2,avr:3,mai:4,juin:5,juil:6,aout:7,août:7,sept:8,oct:9,nov:10,dec:11,déc:11};
 const k=Object.keys(mois).find(x=>s.toLowerCase().includes(x));if(k){notes.push(`date approximative (« ${s} »)`);return {d:iso(new Date(2026,mois[k],1)),notes}}
 notes.push(`date illisible (« ${s} »)`);return {d:"",notes}}
function rccNum(v){const s=clean(v);if(!s)return {num:"",nums:[],notes:[]};const nums=[...s.matchAll(/\d{5,}/g)].map(x=>x[0]);const notes=[];nums.forEach(n=>{if(n.length!==7)notes.push(`numéro ${n} à vérifier (${n.length} chiffres)`)});return {num:nums.join(" & "),nums,notes}}
/* rows : tableaux [date, ticket, description, application] (sans l'en-tête) */
function rccFromRows(rows){const out=[];
 rows.forEach((r,i)=>{const desc=clean(r[2]);if(!desc&&!clean(r[1]))return;
  const dt=rccDate(r[0]),n=rccNum(r[1]),ap=rccApp(r[3],desc);
  out.push({ligne:i+2,num:n.num,nums:n.nums,date:dt.d,fin:dt.fin||"",desc,app:ap.app,appDeduite:ap.inf,outil:rccOutil(clean(r[3]),desc),cat:rccCat(desc),notes:[...dt.notes,...n.notes]})});
 /* dates manquantes : estimées à partir des numéros de ticket voisins (les numéros augmentent avec le temps) */
 const known=out.filter(t=>t.date&&t.nums.length&&t.nums[0].length===7).map(t=>[+t.nums[0],+new Date(t.date)]).sort((a,b)=>a[0]-b[0]);
 out.forEach((t,i)=>{if(t.date)return;let est="";
  if(t.nums.length&&t.nums[0].length===7&&known.length){const n=+t.nums[0];let lo=known.filter(k=>k[0]<=n).pop(),hi=known.find(k=>k[0]>=n);
   const ms=lo&&hi&&hi[0]!==lo[0]?lo[1]+(hi[1]-lo[1])*(n-lo[0])/(hi[0]-lo[0]):(lo||hi)[1];est=iso(new Date(ms))}
  else{for(let j=i-1;j>=0;j--)if(out[j].date){est=out[j].date;break}}
  if(est){t.date=est;t.notes.push("date absente du fichier : estimée")}});
 /* doublons : même ticket, même description, même date */
 const seen={};out.forEach(t=>{const k=(t.num||"")+"|"+t.desc.toLowerCase()+"|"+t.date;if(seen[k]){t.doublon=seen[k];t.notes.push(`doublon de la ligne ${seen[k]}`)}else seen[k]=t.ligne});
 const majors=/perte (g[ée]n[ée]rale )?(du |de )?r[ée]seau|toutes les applications|perte r[ée]seau|injoignab/i;
 return out.map(t=>({num:t.num,date:t.date,fin:t.fin,desc:t.desc,app:t.app,appDeduite:t.appDeduite,outil:t.outil,cat:t.cat,
  majeur:majors.test(t.desc+" "+t.app),equipes:rccTeamsFromDesc(t.desc),personnes:[],statut:t.num?"Ticket envoyé":"Signalé",plateforme:t.num?"Outil de ticketing IT":"",
  envoi:t.num?t.date:"",resolution:"",resolu:"",notes:t.notes,ligne:t.ligne,doublon:t.doublon||0,hist:[{d:new Date().toISOString(),q:"Import Excel",t:`Importé depuis la ligne ${t.ligne} du fichier`}]}))}
function rccTeamsFromDesc(d){const s=d.toUpperCase();const out=[];[["INBOUND","INBOUND"],["OUTBOUND","OUTBOUND"],["RÉSOLUTION","Résolution"],["RESOLUTION","Résolution"],[" QA","QA"],[" OPS","OPS"],["CIB","CIB"],["CMB","CMB"]].forEach(([k,v])=>{if(s.includes(k)&&!out.includes(v))out.push(v)});return out}
if(typeof module!=="undefined")module.exports={rccFromRows};
