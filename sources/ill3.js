/* =========================================================
   ILLUSTRATIONS v3 — écrans Teams, Outlook, Engage + art
   ========================================================= */
IC.teams='<rect x="3" y="6" width="12" height="12" rx="2"/><path d="M6.5 9.5h5M9 9.5V15"/><circle cx="18" cy="7" r="2.2"/><path d="M15 12h5a1 1 0 0 1 1 1v3a3 3 0 0 1-3 3h-1"/>';
IC.outlook='<rect x="9" y="5" width="12" height="14" rx="2"/><path d="m9 8 6 4 6-4"/><rect x="3" y="7.5" width="9" height="9" rx="1.5"/><circle cx="7.5" cy="12" r="2"/>';
IC.analyse='<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><circle cx="11" cy="10" r="3"/><path d="m13.2 12.2 2.3 2.3"/>';

/* barre latérale d'application générique */
function appRail(x,y,h,col,n){let o=`<rect x="${x}" y="${y}" width="44" height="${h}" fill="${col}"/>`;for(let i=0;i<n;i++)o+=`<rect x="${x+12}" y="${y+16+i*36}" width="20" height="20" rx="5" fill="#fff" fill-opacity="${i===0?.95:.45}"/>`;return o}

ILL.teams=o=>{const f=o.focus;const P="#5b5fc7";
 if(f==="devices"||f==="camera"){
  const rows=f==="camera"?[["Caméra","Webcam intégrée","USB Camera HD ✓"]]:[["Haut-parleur","Haut-parleurs (Realtek)","Casque USB ✓"],["Micro","Réseau de micros","Casque USB ✓"]];
  let r="";rows.forEach((row,i)=>{const y=96+i*62;r+=T(250,y,row[0],"w-ink",12,700)+`<rect x="250" y="${y+8}" width="262" height="30" rx="6" class="w-fill" stroke="var(--w-line)"/>`+hl(246,y+4,270,38,8)+T(262,y+28,row[2],"hl-t",12.5,700)+T(498,y+28,"▾","w-ink",12,700,"end")});
  if(f==="camera")r+=`<rect x="250" y="166" width="262" height="60" rx="8" fill="#1d1f2e"/><circle cx="381" cy="190" r="12" fill="#fff" fill-opacity=".5"/><rect x="361" y="204" width="40" height="16" rx="8" fill="#fff" fill-opacity=".5"/>`;
  return frame("Teams — Paramètres de l'appareil",`${appRail(7,34,214,P,5)}<rect x="60" y="48" width="170" height="168" rx="8" fill="#1d1f2e"/><circle cx="145" cy="110" r="22" fill="${P}"/>${T(145,116,"VA","white",14,700,"middle")}${T(145,160,"Réunion d'équipe","white",11,600,"middle")}
  <rect x="80" y="182" width="130" height="24" rx="12" fill="#2d2f40"/><circle cx="104" cy="194" r="7" fill="#fff" fill-opacity=".6"/><circle cx="128" cy="194" r="7" fill="#fff" fill-opacity=".6"/><rect x="150" y="188" width="44" height="12" rx="6" class="red"/>
  ${T(250,66,"Paramètres de l'appareil","w-ink",15,700)}${r}${cursor(470,f==="camera"?120:120)}`,232)}
 if(f==="status"){const st=[["#2f9e44","Disponible"],["#d13438","Occupé"],["#d13438","Ne pas déranger"],["#e3a008","Bientôt de retour"],["#e3a008","Absent"]];let r="";
  st.forEach((s,i)=>{const y=114+i*23;if(i===0)r+=hl(296,y-16,206,22,4);r+=`<circle cx="312" cy="${y-5}" r="5" fill="${s[0]}"/>`+T(324,y,s[1],i===0?"hl-t":"w-ink",11.5,i===0?700:400)});
  return frame("Microsoft Teams",`${appRail(7,34,214,P,5)}<rect x="51" y="34" width="482" height="30" class="w-fill"/>${T(70,54,"Rechercher","w-mute",11)}<circle cx="508" cy="49" r="11" fill="${P}"/>${T(508,53,"VA","white",9,700,"middle")}<circle cx="516" cy="57" r="4" fill="#e3a008" stroke="#fff"/>
  <rect x="290" y="70" width="230" height="160" rx="8" class="w-bg"/>${T(304,88,"Vanessa A.","w-ink",12,700)}${r}${T(304,226,"Réinitialiser le statut","w-blue",11.5,600)}${cursor(480,96)}`,246)}
 return frame("Microsoft Teams — réunion",`<rect x="7" y="34" width="526" height="160" fill="#1d1f2e"/>
  ${[0,1,2].map(i=>`<rect x="${24+i*170}" y="48" width="158" height="96" rx="8" fill="#2d2f40"/><circle cx="${103+i*170}" cy="90" r="18" fill="${["#5b5fc7","#0f7b6c","#c4314b"][i]}"/>${T(103+i*170,95,["VA","KM","JL"][i],"white",12,700,"middle")}${T(36+i*170,136,["Vous","Koffi M.","Julie L."][i],"white",10.5,600)}`).join("")}
  <rect x="150" y="156" width="240" height="30" rx="15" fill="#2d2f40"/>
  ${hl(178,154,40,34,17)}<circle cx="198" cy="171" r="11" fill="#fff" fill-opacity=".9"/><path d="M194 165h8v8h-8z" fill="#1d1f2e"/><path d="M189 162 207 180" stroke="#d13438" stroke-width="2.6"/>
  <circle cx="238" cy="171" r="11" fill="#fff" fill-opacity=".6"/><circle cx="278" cy="171" r="11" fill="#fff" fill-opacity=".6"/><circle cx="318" cy="171" r="11" fill="#fff" fill-opacity=".6"/><rect x="340" y="162" width="40" height="18" rx="9" class="red"/>
  ${T(270,214,"Micro coupé : cliquez sur l'icône barrée pour réactiver","hl-t",12,700,"middle")}${cursor(204,176)}`,228)};

ILL.outlook=o=>{const f=o.focus;const B="#0f6cbd";
 const folders=["Boîte de réception","Brouillons","Éléments envoyés","Éléments supprimés","Courrier indésirable","Archive"];
 let fl=folders.map((n,i)=>T(66,100+i*22,n,"w-ink",11.5,i===0?700:400)).join("");
 if(f==="shared")fl+=hl(58,224,170,22,4)+T(66,240,"Ajouter une boîte partagée…","hl-t",11.5,700);
 let mid=[["Service client","Re: demande de rappel"],["Koffi M.","Planning de la semaine"],["Support IT","Maintenance ce soir"],["Julie L.","Compte rendu réunion"]].map((m,i)=>{const y=92+i*38;return `<rect x="240" y="${y-14}" width="286" height="34" rx="4" class="${i===0?"w-fill":"w-bg"}" stroke="none"/>${T(250,y,m[0],"w-ink",11.5,700)}${T(250,y+14,m[1],"w-mute",11)}`}).join("");
 let top=`<rect x="7" y="34" width="526" height="30" fill="${B}"/>`+`<rect x="150" y="40" width="240" height="18" rx="4" fill="#fff" fill-opacity=".9"/>`+T(160,53,f==="search"?"taille:énorme":"Rechercher","w-ink",10.5,f==="search"?700:400);
 if(f==="search")top+=hl(146,37,250,24,5)+`<rect x="292" y="64" width="160" height="22" rx="4" class="w-bg"/>`+T(300,79,"Toutes les boîtes aux lettres ▾","hl-t",10.5,700);
 let bottom="";
 if(f==="storage")bottom=`<rect x="7" y="236" width="526" height="20" class="w-fill"/>`+hl(330,236,200,20,4)+T(338,250,"Stockage : 98 % utilisé","hl-t",11,700)+`<rect x="478" y="243" width="46" height="6" rx="3" fill="var(--w-line)"/><rect x="478" y="243" width="45" height="6" rx="3" class="red"/>`;
 if(f==="offline")bottom=`<rect x="7" y="236" width="526" height="20" class="w-fill"/>`+hl(12,236,220,20,4)+T(20,250,"Travail hors connexion","hl-t",11,700);
 return frame("Outlook",`${top}${appRail(7,64,f==="storage"||f==="offline"?172:192,"#e8eef7",0)}${[0,1,2].map(i=>`<rect x="19" y="${80+i*34}" width="20" height="20" rx="5" fill="${B}" fill-opacity="${i?0.35:.9}"/>`).join("")}${fl}<line x1="232" y1="64" x2="232" y2="256" class="w-line"/>${mid}${bottom}${cursor(f==="search"?420:f==="storage"?500:f==="shared"?200:f==="offline"?150:200,f==="search"?80:f==="storage"?250:f==="shared"?236:f==="offline"?248:120)}`,262)};

ILL.engage=o=>{const f=o.focus;const N="#002050";
 let top=`<rect x="7" y="34" width="526" height="26" fill="${N}"/>${T(20,51,"Service clientèle","white",11.5,700)}<rect x="260" y="40" width="160" height="14" rx="3" fill="#fff" fill-opacity=".2"/>`;
 let cmd=`<rect x="7" y="60" width="526" height="28" class="w-fill"/>${["＋ Nouveau","Enregistrer","Actualiser","Fusionner"].map((b,i)=>T(20+i*88,79,b,"w-ink",11,600)).join("")}`;
 if(f==="view"){
  cmd+=hl(14,92,190,26,5)+T(22,110,"Mes dossiers actifs ▾","hl-t",14,700);
  const rows=[["DOS-1042","Problème de facturation","Élevée"],["DOS-1039","Demande de rappel","Normale"],["DOS-1031","Changement d'adresse","Faible"]];
  cmd+=`${T(22,140,"Numéro","w-mute",10.5,600)}${T(120,140,"Titre","w-mute",10.5,600)}${T(390,140,"Priorité","w-mute",10.5,600)}<line x1="18" y1="146" x2="522" y2="146" class="w-line"/>`+rows.map((r,i)=>{const y=168+i*24;return T(22,y,r[0],"w-blue",11.5,600)+T(120,y,r[1],"w-ink",11.5)+T(390,y,r[2],"w-ink",11.5)}).join("");
  return frame("Microsoft Engage — Dossiers",top+cmd+cursor(170,108),250)}
 if(f==="dup"){
  return frame("Microsoft Engage — Doublons détectés",top+cmd+`<rect x="90" y="96" width="360" height="146" rx="8" class="w-bg"/>${T(106,120,"Doublons détectés","w-ink",14,700)}${T(106,140,"Une fiche semblable existe déjà :","w-mute",11.5)}
  ${hl(102,148,336,30,5)}${T(112,168,"Konan Ange — 07 08 09 10 11 — créé le 12/09","hl-t",11.5,700)}
  ${btn(178,196,150,"Utiliser cette fiche",true,true)}${btn(336,196,104,"Ignorer")}${cursor(260,212)}`,256)}
 const fields=[["Nom du client",true,"Konan Ange"],["Téléphone",true,""],["Origine",false,"Téléphone"],["Objet",true,"Demande de rappel"]];
 let fm=fields.map((x,i)=>{const y=(f==="error"?136:112)+i*32;const empty=!x[2];const hi=f==="required"&&empty;return `${T(22,y+14,x[0],"w-ink",11.5,600)}${x[1]?T(22+x[0].length*6.4+4,y+14,"*","red",13,700):""}${hi?hl(196,y-1,292,26,5):""}<rect x="200" y="${y+2}" width="284" height="20" rx="3" class="w-bg" ${empty&&(f==="required"||f==="error")?'stroke="var(--accent)"':""}/>${T(208,y+16,x[2]||(f==="required"||f==="error"?"Champ obligatoire":""),x[2]?"w-ink":"hl-t",11,x[2]?400:600)}`}).join("");
 let banner="";
 if(f==="error")banner=hl(12,94,516,32,6)+`<rect x="16" y="98" width="508" height="24" rx="4" fill="#fde7e9"/><circle cx="32" cy="110" r="7" class="red"/>${T(32,114,"!","white",10,800,"middle")}${T(46,114,"1 champ obligatoire est vide : Téléphone","red",11.5,700)}`;
 if(f==="call")banner=hl(300,94,226,60,8)+`<rect x="304" y="98" width="218" height="52" rx="6" fill="#0f7b6c"/>${T(316,118,"Appel entrant","white",11.5,700)}${T(316,138,"07 08 09 10 11 · Konan Ange","white",11)}`;
 return frame("Microsoft Engage — Fiche client",top+cmd+banner+fm+(f==="required"?cursor(440,148):f==="error"?cursor(300,112):""),f==="error"?270:246)};

ILL.finesse=o=>{const consult=o.state==="consult";return frame("Cisco Finesse — Bureau de l'agent",`<rect x="7" y="34" width="526" height="40" class="w-fill"/>
 ${consult?`<rect x="22" y="44" width="182" height="20" rx="4" class="w-bg"/><circle cx="34" cy="54" r="5" class="acc"/>${T(46,58,"Parle — 02:14","w-ink",12,700)}`:`${hl(18,40,190,28,6)}<rect x="22" y="44" width="182" height="20" rx="4" class="w-bg"/><circle cx="34" cy="54" r="5" class="red"/>${T(46,58,"Non prêt  ▾","hl-t",12,700)}`}
 ${T(380,58,"Agent : 4012","w-ink",11.5)}${consult?"":btn(440,42,80,"Déconnexion",false,true)}
 ${consult?`<rect x="22" y="86" width="496" height="70" rx="8" class="w-bg"/>${T(36,108,"Appel : 07 08 09 10 11","w-ink",12.5,700)}${T(36,128,"File : Service client","w-mute",11)}
 ${btn(36,132-6+14,96,"Attente")}${hl(140,136,112,34,7)}${btn(144,140,104,"Consulter",true)}${btn(256,140,96,"Conférence")}${btn(360,140,96,"Raccrocher")}${cursor(220,156)}`
 :`<rect x="22" y="72" width="182" height="58" rx="5" class="w-bg"/><circle cx="34" cy="88" r="5" class="green"/>${T(46,92,"Prêt","w-ink",12,600)}<circle cx="34" cy="114" r="5" class="red"/>${T(46,118,"Non prêt — Pause","w-ink",12)}${T(230,110,"Aucun appel en cours","w-mute",13)}${cursor(500,58)}`}`,consult?188:160)};

/* ---------- Art : grande illustration d'accueil ---------- */
function heroArt(){return `<svg class="hero-art" viewBox="0 0 520 400" role="img" aria-label="Illustration : poste de support analysant une capture d'erreur">
<defs>
 <linearGradient id="ha-sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".35"/><stop offset="1" stop-color="#4c7dff" stop-opacity=".18"/></linearGradient>
 <linearGradient id="ha-scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e8eef6"/></linearGradient>
 <linearGradient id="ha-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity="0"/><stop offset=".85" stop-color="var(--accent)" stop-opacity=".28"/><stop offset="1" stop-color="var(--accent)" stop-opacity=".9"/></linearGradient>
 <clipPath id="ha-clip"><rect x="96" y="70" width="300" height="186" rx="6"/></clipPath>
</defs>
<circle cx="268" cy="196" r="178" fill="url(#ha-sky)"/>
<circle cx="268" cy="196" r="136" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="28"/>
<g class="ha-float1"><rect x="20" y="70" width="124" height="54" rx="12" fill="#fff"/><rect x="32" y="84" width="26" height="26" rx="7" fill="#e7f5ea"/><path d="m38 97 5 5 9-10" stroke="#2f9e44" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="66" y="86" width="64" height="8" rx="4" fill="#1d2733"/><rect x="66" y="100" width="44" height="7" rx="3.5" fill="#c3ccd8"/></g>
<rect x="80" y="56" width="332" height="216" rx="16" fill="#0e1a2b"/>
<rect x="96" y="70" width="300" height="186" rx="6" fill="url(#ha-scr)"/>
<g clip-path="url(#ha-clip)">
 <rect x="96" y="70" width="300" height="20" fill="#dfe6ef"/><circle cx="108" cy="80" r="3.5" fill="#ff6b5f"/><circle cx="120" cy="80" r="3.5" fill="#f5bf4f"/><circle cx="132" cy="80" r="3.5" fill="#5ec26a"/>
 <rect x="96" y="90" width="58" height="166" fill="#e9eef5"/>${[0,1,2,3,4].map(i=>`<rect x="106" y="${104+i*24}" width="38" height="8" rx="4" fill="#c3ccd8"/>`).join("")}
 ${[0,1,2,3].map(i=>`<rect x="168" y="${104+i*18}" width="${190-i*30}" height="8" rx="4" fill="#d3dbe6"/>`).join("")}
 <rect x="182" y="150" width="196" height="88" rx="10" fill="#fff" stroke="#e03131" stroke-width="2"/>
 <circle cx="204" cy="172" r="11" fill="#e03131"/><rect x="202.5" y="165" width="3" height="9" rx="1.5" fill="#fff"/><circle cx="204" cy="178" r="1.8" fill="#fff"/>
 <rect x="222" y="166" width="120" height="9" rx="4.5" fill="#1d2733"/><rect x="222" y="181" width="90" height="7" rx="3.5" fill="#9aa7b8"/>
 <rect x="196" y="200" width="168" height="18" rx="5" fill="#fdeee6"/><text x="204" y="213" font-family="Consolas,monospace" font-size="10" font-weight="700" fill="#c2410c">0x80040220</text>
 <rect x="300" y="222" width="64" height="10" rx="5" fill="#0067c0"/>
 <rect class="ha-beam" x="96" y="70" width="300" height="46" fill="url(#ha-beam)"/>
</g>
<rect x="226" y="272" width="40" height="34" fill="#0e1a2b"/><rect x="186" y="304" width="120" height="12" rx="6" fill="#0e1a2b"/>
<g class="ha-float2"><rect x="352" y="196" width="152" height="96" rx="14" fill="#fff"/>
 <circle cx="378" cy="222" r="13" fill="var(--accent)"/><path d="M372 222h12M378 216v12" stroke="#fff" stroke-width="2.6" stroke-linecap="round" transform="rotate(45 378 222)"/>
 <rect x="398" y="214" width="92" height="8" rx="4" fill="#1d2733"/><rect x="398" y="227" width="64" height="6" rx="3" fill="#9aa7b8"/>
 ${[0,1,2].map(i=>`<circle cx="374" cy="${252+i*14}" r="4.5" fill="${i<2?"#2f9e44":"#d5dce5"}"/><rect x="386" y="${249+i*14}" width="${[96,80,88][i]}" height="6" rx="3" fill="#c3ccd8"/>`).join("")}</g>
<g transform="translate(40 300)"><path d="M10 40a34 34 0 0 1 68 0" fill="none" stroke="#0e1a2b" stroke-width="7" stroke-linecap="round"/><rect x="0" y="34" width="20" height="32" rx="8" fill="var(--accent)"/><rect x="68" y="34" width="20" height="32" rx="8" fill="var(--accent)"/><path d="M10 64c0 14 12 20 30 20" fill="none" stroke="#0e1a2b" stroke-width="4" stroke-linecap="round"/><circle cx="44" cy="84" r="5" fill="#0e1a2b"/></g>
<g transform="translate(410 318)"><rect x="0" y="12" width="92" height="60" rx="10" fill="#2b2f36"/><rect x="10" y="20" width="50" height="26" rx="3" fill="#bfe3ff"/>${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${66+c*7}" y="${22+r*9}" width="5" height="5" rx="1" fill="#6c7380"/>`).join("")).join("")}<path d="M-6 18q-10 30 6 50h14q-8-24-2-50z" fill="#3a3f48"/></g>
<g class="ha-float1"><circle cx="452" cy="104" r="30" fill="#fff"/><circle cx="447" cy="99" r="12" fill="none" stroke="#0e1a2b" stroke-width="4"/><path d="m456 108 10 10" stroke="#0e1a2b" stroke-width="5" stroke-linecap="round"/></g>
</svg>`}

/* ---------- Art : vignettes de domaine ---------- */
const DART={guide:["#1c6dd0","#74c0fc"],cisco:["#0b7285","#15aabf"],crm:["#1c3d8f","#4c7dff"],teams:["#4b4fb5","#8b8ff0"],outlook:["#0f5fa8","#3fa0ff"],office:["#1e6e43","#40c057"],win:["#1864ab","#4dabf7"],net:["#5f3dc4","#9775fa"],print:["#495057","#adb5bd"],web:["#c2410c","#ff922b"],acc:["#9c36b5","#e599f7"],sec:["#c92a2a","#ff8787"],hw:["#5c3d1e","#d9a066"]};
function domArt(k){const c=DART[k]||["#334","#889"];return `<svg class="dom-art" viewBox="0 0 120 80" aria-hidden="true"><defs><linearGradient id="dg-${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs>
<rect width="120" height="80" fill="url(#dg-${k})"/><circle cx="104" cy="-4" r="40" fill="#fff" fill-opacity=".1"/><circle cx="10" cy="86" r="34" fill="#fff" fill-opacity=".08"/>
<g transform="translate(40 18) scale(1.85)" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${IC[k]||IC.guide}</g></svg>`}
