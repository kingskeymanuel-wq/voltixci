/* =========================================================
   APPLICATION
   ========================================================= */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const byId=id=>P.find(p=>p.id===id);
const FICHES=P.filter(p=>p.d!=="guide"), GUIDES=P.filter(p=>p.d==="guide");
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove("on"),2200)}
function copyText(txt,el){try{navigator.clipboard.writeText(txt).then(()=>toast("Copié dans le presse-papiers"),()=>selectIn(el))}catch(e){selectIn(el)}}
function selectIn(el){const pre=el&&(el.closest(".cmd,.sc-out")||document).querySelector("pre");if(!pre)return;const r=document.createRange();r.selectNodeContents(pre);const s=getSelection();s.removeAllRanges();s.addRange(r);toast("Texte sélectionné : faites Ctrl + C")}
const cmdHTML=c=>`<div class="cmd"><pre>${esc(c)}</pre><button type="button" data-copy="${esc(c)}">Copier</button></div>`;
const lvlHTML=l=>`<span class="lvl" title="${LVL[l]}">${[1,2,3].map(i=>`<i class="${i<=l?"on":""}"></i>`).join("")}</span>`;

/* ---------- Icônes ---------- */
const IC={
 accueil:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><circle cx="11" cy="10" r="3"/><path d="m13.2 12.2 2.3 2.3"/>',
 pannes:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.5 17.3a1.8 1.8 0 0 0 2.5 2.5l5.8-5.8a4 4 0 0 0 5.2-5.4l-2.4 2.4-2.1-.4-.4-2.1z"/>',
 guides:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>',
 scripts:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M12 15h5"/>',
 commandes:'<path d="M9 7H7a2 2 0 0 0 0 4h10a2 2 0 0 1 0 4h-2M12 4v16"/>',
 journal:'<path d="M8 4h10a1 1 0 0 1 1 1v15H7a2 2 0 0 1-2-2V7"/><path d="M5 7a3 3 0 0 1 3-3M9 9h6M9 13h6M9 17h3"/>',
 check:'<path d="m4 12 5 5L20 6"/>',
 erreurs:'<path d="M4 4h12l4 4v12H4z"/><path d="M8 11h3M8 15h8M14 4v4h6"/><circle cx="16" cy="11" r="1"/>',
 crm:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
 win:'<rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/>',
 net:'<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1"/>',
 print:'<path d="M7 9V3h10v6M7 17H4v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6h-3"/><rect x="7" y="14" width="10" height="7"/>',
 office:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
 web:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
 acc:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 sec:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
 hw:'<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/>',
 cisco:'<path d="M4 5c0 8 7 15 15 15l2-4-5-2-2 2a11 11 0 0 1-6-6l2-2-2-5z"/>',
 guide:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/>'
};
const svgI=(k,w=2)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${IC[k]||""}</svg>`;
const ALERT={info:'<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>',warn:'<path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>'};
const alertHTML=(type,html)=>`<div class="alert ${type}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${type==="info"?ALERT.info:ALERT.warn}</svg><div>${html}</div></div>`;

/* =========================================================
   ILLUSTRATIONS — écrans Windows dessinés en SVG
   ========================================================= */
const T=(x,y,s,c="w-ink",sz=12,w=400,anchor="start",fam="")=>`<text x="${x}" y="${y}" class="${c}" font-size="${sz}" font-weight="${w}" text-anchor="${anchor}"${fam?` font-family="${fam}"`:""}>${esc(s)}</text>`;
const MONO="Consolas,'JetBrains Mono',monospace";
const cursor=(x,y)=>`<path class="cur" d="M${x} ${y}l0 17 4.2-4.1 3.1 7 3-1.3-3.1-6.9 5.8 0z"/>`;
const hl=(x,y,w,h,r=5)=>`<rect class="hl" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
function frame(title,inner,h,dark){return `<svg class="ill" viewBox="0 0 540 ${h}" role="img" aria-label="${esc(title)}">
<rect class="${dark?"term":"w-bg"}" x="6" y="6" width="528" height="${h-12}" rx="9" ${dark?'stroke="#333"':""}/>
<path class="${dark?"w-bar":"w-bar"}" d="M6 15a9 9 0 0 1 9-9h510a9 9 0 0 1 9 9v19H6z"/>
${T(20,25,title,"w-ink",12,600)}
${T(468,25,"—","w-mute",11)}${T(492,25,"☐","w-mute",11)}${T(514,25,"✕","w-mute",11)}
${inner}</svg>`}
function btn(x,y,w,label,primary,high){return `${high?hl(x-4,y-4,w+8,34,7):""}<rect x="${x}" y="${y}" width="${w}" height="26" rx="5" class="${primary?"w-blue":"w-fill"}" ${primary?"":'stroke="var(--w-line)"'}/>${T(x+w/2,y+17,label,primary?"w-blue-ink":"w-ink",12,600,"middle")}`}

const ILL={
keys(o){const v=o.v;let widths=v.map(k=>Math.max(54,k.length*10+30));const gap=30;const total=widths.reduce((a,b)=>a+b,0)+gap*(v.length-1);let x=(540-total)/2;let out="";
 v.forEach((k,i)=>{const w=widths[i];out+=`<rect class="kc-s" x="${x}" y="30" width="${w}" height="58" rx="10"/><rect class="kc" x="${x}" y="24" width="${w}" height="58" rx="10"/>${T(x+w/2,59,k,"k-t",k.length>8?13:17,700,"middle")}`;x+=w;if(i<v.length-1){out+=T(x+gap/2,60,"+","w-mute",20,700,"middle");x+=gap}});
 return `<svg class="ill" viewBox="0 0 540 ${o.cap?120:104}" role="img" aria-label="Touches ${esc(v.join(" + "))}">${out}${o.cap?T(270,112,o.cap,"w-mute",12,400,"middle"):""}</svg>`},
run(o){const v=o.v,sz=v.length>44?9.5:v.length>30?11:13;return frame("Exécuter",`
 <rect x="22" y="48" width="30" height="30" rx="5" class="w-blue"/><path d="M29 56h16v14H29z" fill="none" stroke="var(--w-blue-ink)" stroke-width="2"/>
 ${T(64,58,"Entrez le nom d'un programme, dossier, document ou ressource","w-ink",11.5)}${T(64,74,"Internet, et Windows l'ouvrira pour vous.","w-ink",11.5)}
 ${T(22,113,"Ouvrir :","w-ink",12.5,600)}
 ${hl(80,94,442,30,5)}<rect x="84" y="98" width="434" height="22" rx="3" class="w-bg"/>${T(92,113,v,"w-ink",sz,600,"start",MONO)}
 ${btn(250,146,82,"OK",true,true)}${btn(342,146,82,"Annuler")}${btn(434,146,88,"Parcourir…")}${cursor(300,162)}`,190)},
term(o){const cmdRe=/^(ipconfig|dism|sfc|hostname|net |netsh|ping|nslookup|w32tm|gpupdate|_)/i;const pr=o.admin?"C:\\Windows\\system32>":"C:\\Users\\agent>";let y=58,out="";
 o.v.forEach(l=>{const isC=cmdRe.test(l);if(l==="_"){out+=T(20,y,pr,"term-t",12,400,"start",MONO)+`<rect x="${20+pr.length*6.6}" y="${y-10}" width="8" height="13" class="term-t"/>`}
  else if(isC){out+=T(20,y,pr,"term-t",12,400,"start",MONO)+T(20+pr.length*6.6+4,y,l,"hl-t",12,700,"start",MONO)}
  else out+=T(20,y,l,l.includes("←")?"hl-t":"term-t",12,l.includes("←")?700:400,"start",MONO);y+=20});
 const h=Math.max(130,y+10);return frame((o.admin?"Administrateur : ":"")+"Invite de commandes",`<rect x="7" y="34" width="526" height="${h-41}" class="term"/>${out}`,h,true)},
search(o){return `<svg class="ill" viewBox="0 0 540 250" role="img" aria-label="Recherche Windows">
 <rect x="6" y="6" width="528" height="238" rx="12" class="w-bg"/>
 <rect x="22" y="20" width="496" height="34" rx="17" class="w-fill"/><circle cx="44" cy="37" r="6" fill="none" stroke="var(--w-mute)" stroke-width="2"/><path d="m48.5 41.5 4 4" stroke="var(--w-mute)" stroke-width="2"/>${T(62,42,o.v,"w-ink",14,600)}
 ${T(22,78,"Meilleur résultat","w-ink",12,700)}
 <rect x="22" y="88" width="210" height="140" rx="8" class="w-fill"/><rect x="104" y="104" width="46" height="46" rx="6" fill="#111"/>${T(127,133,">_","white",16,700,"middle",MONO)}${T(127,174,o.name,"w-ink",13,700,"middle")}${T(127,192,"Application","w-mute",11,400,"middle")}
 <rect x="250" y="88" width="268" height="140" rx="8" class="w-fill"/>
 ${T(268,114,"Ouvrir","w-ink",12.5)}${hl(258,124,252,28,5)}${T(268,143,"Exécuter en tant qu'administrateur","hl-t",12.5,700)}${T(268,172,"Ouvrir l'emplacement du fichier","w-ink",12.5)}${T(268,200,"Épingler à l'écran de démarrage","w-ink",12.5)}
 ${cursor(470,140)}</svg>`},
uac(){return `<svg class="ill" viewBox="0 0 540 230" role="img" aria-label="Contrôle de compte d'utilisateur"><rect x="70" y="6" width="400" height="218" rx="8" class="w-bg"/><path d="M70 14a8 8 0 0 1 8-8h384a8 8 0 0 1 8 8v26H70z" class="w-blue"/>${T(86,28,"Contrôle de compte d'utilisateur","w-blue-ink",12,600)}
 ${T(86,66,"Voulez-vous autoriser cette application à apporter","w-ink",13.5,700)}${T(86,84,"des modifications à votre appareil ?","w-ink",13.5,700)}
 ${T(86,116,"Processeur de commandes Windows","w-ink",12.5)}${T(86,136,"Éditeur vérifié : Microsoft Windows","w-mute",11.5)}
 ${btn(268,176,90,"Oui",true,true)}${btn(366,176,90,"Non")}${cursor(318,192)}</svg>`},
settings(o){const nav=["Système","Bluetooth et appareils","Réseau et Internet","Personnalisation","Applications","Comptes","Accessibilité","Windows Update"];const sel=nav.indexOf(o.v[0]);let n="";
 nav.forEach((it,i)=>{const y=62+i*22;if(i===sel)n+=`<rect x="16" y="${y-15}" width="150" height="21" rx="4" class="w-fill"/><rect x="16" y="${y-11}" width="3" height="13" rx="1.5" class="w-blue"/>`;n+=T(26,y,it,"w-ink",11.5,i===sel?700:400)});
 let crumb=o.v.join(" › ");if(crumb.length>46)crumb="… › "+o.v.slice(-2).join(" › ");const cs=crumb.length>40?12.5:crumb.length>30?14:16;
 return frame("Paramètres",`${n}<line x1="176" y1="40" x2="176" y2="240" class="w-line"/>${T(192,64,crumb,"w-ink",cs,700)}
 <rect x="192" y="82" width="326" height="36" rx="6" class="w-fill"/><rect x="204" y="96" width="140" height="8" rx="4" fill="var(--w-line)"/>
 <rect x="192" y="124" width="326" height="36" rx="6" class="w-fill"/><rect x="204" y="138" width="110" height="8" rx="4" fill="var(--w-line)"/>
 ${hl(188,166,334,44,7)}<rect x="192" y="170" width="326" height="36" rx="6" class="w-fill"/>${T(206,193,o.btn,"hl-t",12.5,700)}${T(504,193,"›","w-ink",16,700,"end")}${cursor(440,190)}`,252)},
taskmgr(o){const m=o.mode;let rows,cols,b="Fin de tâche",tab="Processus";
 if(m==="startup"){tab="Applications de démarrage";b="Désactiver";cols=["Nom","Éditeur","État","Impact"];rows=[["Spotify","Spotify AB","Activé","Élevé",1],["Microsoft OneDrive","Microsoft","Activé","Moyen"],["Microsoft Teams","Microsoft","Activé","Moyen"],["Sécurité Windows","Microsoft","Activé","Faible"]]}
 else{cols=["Nom","État","Processeur","Mémoire"];rows=m==="hang"?[["Microsoft Excel","Ne répond pas","0 %","412 Mo",1],["Google Chrome","","3 %","690 Mo"],["Microsoft Teams","","2 %","380 Mo"],["Explorateur Windows","","1 %","96 Mo"]]
  :m==="outlook"?[["Microsoft Outlook","Ne répond pas","0 %","350 Mo",1],["Microsoft Teams","","2 %","380 Mo"],["Google Chrome","","3 %","690 Mo"],["Explorateur Windows","","1 %","96 Mo"]]
  :[["Logiciel de mise à jour","","78 %","120 Mo",1],["Google Chrome","","9 %","690 Mo"],["Microsoft Teams","","4 %","380 Mo"],["Explorateur Windows","","1 %","96 Mo"]]}
 const cx=[56,236,346,436];let r="";
 rows.forEach((row,i)=>{const y=118+i*28;if(row[4])r+=hl(48,y-18,476,26,4);row.slice(0,4).forEach((c,j)=>{r+=T(cx[j],y,c,row[4]?(j===1&&c?"red":"hl-t"):"w-ink",11.5,row[4]?700:400)})});
 return frame("Gestionnaire des tâches",`<rect x="7" y="34" width="34" height="200" class="w-fill"/>${[60,88,116,144].map(y=>`<rect x="16" y="${y}" width="16" height="12" rx="2" fill="var(--w-line)"/>`).join("")}
 ${T(56,58,tab,"w-ink",15,700)}${btn(424,42,96,b,false,true)}
 ${cols.map((c,j)=>T(cx[j],86,c,"w-mute",11,600)).join("")}${m==="cpu"?hl(340,72,78,22,4):""}<line x1="48" y1="94" x2="524" y2="94" class="w-line"/>${r}${cursor(486,60)}`,240)},
devmgr(o){const items=["Mettre à jour le pilote","Désactiver l'appareil","Désinstaller l'appareil","Analyser les changements","Propriétés"];let menu=`<rect x="300" y="104" width="214" height="${items.length*24+12}" rx="6" class="w-bg"/>`;
 items.forEach((it,i)=>{const y=126+i*24;if(it===o.menu)menu+=hl(306,y-16,202,22,4);menu+=T(318,y,it,it===o.menu?"hl-t":"w-ink",11.5,it===o.menu?700:400)});
 return frame("Gestionnaire de périphériques",`${T(24,62,"PC-CALL-0142","w-ink",12,700)}
 ${T(36,86,"›  Cartes réseau","w-ink",12)}${T(36,108,"⌄  Entrées et sorties audio","w-ink",12)}
 ${hl(52,114,180,24,4)}<path class="warn" d="M66 118l8 14h-16z"/>${T(66,131,"!","w-ink",9,800,"middle")}${T(82,131,"Casque USB","hl-t",12,700)}
 ${T(36,156,"›  Claviers","w-ink",12)}${T(36,178,"›  Files d'attente à l'impression","w-ink",12)}${T(36,200,"›  Souris et autres périphériques","w-ink",12)}${menu}${cursor(470,126+items.indexOf(o.menu)*24-6)}`,246)},
recovery(o){const last=o.v[o.v.length-1];const lvl=o.v.length;let title,tiles;
 if(lvl<=1){title="Choisir une option";tiles=["Continuer","Dépannage","Éteindre votre PC"]}
 else if(lvl===2){title="Dépannage";tiles=["Réinitialiser ce PC","Options avancées"]}
 else{title="Options avancées";tiles=["Outil de redémarrage système","Paramètres","Restauration du système","Invite de commandes","Désinstaller des mises à jour","Récupération de l'image système"]}
 let t="";tiles.forEach((n,i)=>{const col=i%2,row=Math.floor(i/2);const x=40+col*240,y=70+row*50;const on=n===last;t+=`${on?`<rect x="${x-4}" y="${y-4}" width="228" height="48" rx="6" fill="none" stroke="var(--accent)" stroke-width="3"/>`:""}<rect x="${x}" y="${y}" width="220" height="40" rx="3" class="rec-tile"/><rect x="${x+10}" y="${y+10}" width="20" height="20" rx="3" fill="#fff" fill-opacity=".85"/>${T(x+40,y+25,n,"white",n.length>26?10.5:12,on?700:500)}`});
 const bottom=70+Math.ceil(tiles.length/2)*50;return `<svg class="ill" viewBox="0 0 540 ${bottom+40}" role="img" aria-label="${esc(title)}"><rect x="6" y="6" width="528" height="${bottom+28}" rx="9" class="rec"/>${T(40,48,title,"white",20,300)}${t}${T(40,bottom+20,"Chemin : "+o.v.join(" › "),"white",11,400)}</svg>`},
dialog(o){let y=62,l="";o.lines.forEach(s=>{const h=s.includes("←");l+=(h?hl(18,y-16,504,24,4):"")+T(26,y,s,h?"hl-t":"w-ink",12.5,h?700:400);y+=28});const H=y+56;
 return frame(o.title,`${l}${btn(540-24-Math.max(110,o.btn.length*8+30),y+6,Math.max(110,o.btn.length*8+30),o.btn,true,true)}${cursor(540-60,y+22)}`,H)},
services(o){const rows=[["Service Spouleur d'impression","En cours d'exécution","Automatique",1],["Service de temps Windows","En cours d'exécution","Manuel"],["Services de chiffrement","En cours d'exécution","Automatique"],["Windows Update","","Manuel"]];let r="";
 rows.forEach((row,i)=>{const y=86+i*26;if(row[3])r+=hl(16,y-17,300,24,4);r+=T(24,y,row[0].replace("Service ",""),row[3]?"hl-t":"w-ink",11.5,row[3]?700:400)+T(188,y,row[1]?"En cours":"","w-mute",11)+T(256,y,row[2],"w-mute",11)});
 const menu=["Démarrer","Arrêter","Suspendre","Reprendre","Redémarrer","Propriétés"];let m=`<rect x="330" y="56" width="180" height="${menu.length*24+12}" rx="6" class="w-bg"/>`;menu.forEach((it,i)=>{const y=78+i*24;if(it==="Redémarrer")m+=hl(336,y-16,168,22,4);m+=T(348,y,it,it==="Redémarrer"?"hl-t":"w-ink",11.5,it==="Redémarrer"?700:400)});
 return frame("Services",`${T(24,58,"Nom","w-mute",11,600)}${T(188,58,"État","w-mute",11,600)}${T(256,58,"Démarrage","w-mute",11,600)}${r}${m}${cursor(450,184)}`,232)},
explorer(){return frame("Ce PC",`<rect x="18" y="42" width="504" height="24" rx="5" class="w-fill"/>${T(30,58,"›  Ce PC","w-ink",12)}
 ${T(24,92,"Périphériques et lecteurs","w-ink",13,700)}
 ${hl(20,104,250,74,8)}<rect x="32" y="118" width="40" height="30" rx="4" fill="var(--w-line)"/>${T(84,128,"Disque local (C:)","w-ink",12.5,700)}<rect x="84" y="136" width="170" height="10" rx="2" fill="var(--w-line)"/><rect x="84" y="136" width="162" height="10" rx="2" class="red"/>${T(84,164,"2,1 Go libres sur 237 Go","hl-t",11.5,700)}
 <rect x="290" y="118" width="40" height="30" rx="4" fill="var(--w-line)"/>${T(342,128,"Données (D:)","w-ink",12.5,700)}<rect x="342" y="136" width="170" height="10" rx="2" fill="var(--w-line)"/><rect x="342" y="136" width="60" height="10" rx="2" class="w-blue"/>${T(342,164,"310 Go libres sur 465 Go","w-mute",11.5)}`,200)},
tray(o){const f=o.focus;const hlI=(x,y,w,h)=>hl(x,y,w,h,6);return `<svg class="ill" viewBox="0 0 540 250" role="img" aria-label="Zone de notification">
 <rect x="220" y="8" width="300" height="180" rx="10" class="w-bg"/>
 ${[0,1,2].map(i=>{const x=236+i*92,lab=["Wi-Fi","Bluetooth","Mode avion"][i],on=i<2;return `<rect x="${x}" y="24" width="82" height="52" rx="7" class="${on?"w-blue":"w-fill"}"/>${T(x+41,58,lab,on?"w-blue-ink":"w-ink",11,600,"middle")}`}).join("")}
 ${f==="wifi"?hlI(230,18,280,64):""}
 <path d="M240 112h6l7-6v20l-7-6h-6z" class="w-ink"/>${f==="sound"?hlI(232,100,30,32):""}
 <rect x="268" y="114" width="200" height="5" rx="2.5" fill="var(--w-line)"/><rect x="268" y="114" width="120" height="5" rx="2.5" class="w-blue"/><circle cx="388" cy="116.5" r="7" class="w-blue"/>
 ${T(490,121,"›","w-ink",18,700,"middle")}${f==="output"?hlI(476,100,30,32):""}
 ${T(240,166,f==="output"?"Sortie : Casque USB ✓":"Volume 60 %","w-mute",11.5)}
 <rect x="6" y="200" width="528" height="42" rx="0" class="w-fill"/>
 ${T(300,227,"^","w-ink",13,700,"middle")}
 <g transform="translate(332 212)">${f==="net"?`<circle cx="9" cy="9" r="8" fill="none" stroke="var(--w-ink)" stroke-width="1.6"/><path d="M1 9h16M9 1a12 12 0 0 1 0 16M9 1a12 12 0 0 0 0 16" fill="none" stroke="var(--w-ink)" stroke-width="1.2"/><path d="M2 17 17 2" stroke="var(--accent)" stroke-width="2.4"/>`:`<path d="M1 7a12 12 0 0 1 16 0M4 10.5a7 7 0 0 1 10 0M7 14a3 3 0 0 1 4 0" fill="none" stroke="var(--w-ink)" stroke-width="1.8"/>`}</g>
 ${f==="net"?hlI(324,206,34,30):""}
 <path d="M374 216h4l5-4v14l-5-4h-4z" class="w-ink"/>
 ${T(416,227,"FRA","w-ink",11,600,"middle")}${T(480,220,"09:41","w-ink",11,400,"middle")}${T(480,234,"02/11/2026","w-ink",10,400,"middle")}
 ${cursor(f==="net"?346:f==="sound"?252:f==="output"?494:300,f==="net"?226:f==="wifi"?60:120)}</svg>`},
bsod(){return `<svg class="ill" viewBox="0 0 540 230" role="img" aria-label="Écran bleu"><rect x="6" y="6" width="528" height="218" rx="9" fill="#0b6fc7"/>${T(40,74,":(","white",54,300)}
 ${T(40,112,"Votre PC a rencontré un problème et doit redémarrer.","white",15)}${T(40,134,"Nous collectons simplement des informations relatives aux erreurs…","white",11.5)}
 <rect x="40" y="152" width="46" height="46" fill="#fff"/><rect x="46" y="158" width="12" height="12" fill="#0b6fc7"/><rect x="68" y="158" width="12" height="12" fill="#0b6fc7"/><rect x="46" y="180" width="12" height="12" fill="#0b6fc7"/>
 <rect x="98" y="164" width="380" height="30" rx="5" fill="none" stroke="#ffd43b" stroke-width="2.5"/>${T(108,184,"Code d'arrêt : IRQL_NOT_LESS_OR_EQUAL","white",12.5,700)}${T(470,184,"← à noter","white",11,700,"end")}</svg>`},
finesse(){return frame("Cisco Finesse — Bureau de l'agent",`<rect x="7" y="34" width="526" height="40" class="w-fill"/>
 ${hl(18,40,190,28,6)}<rect x="22" y="44" width="182" height="20" rx="4" class="w-bg"/><circle cx="34" cy="54" r="5" class="red"/>${T(46,58,"Non prêt  ▾","hl-t",12,700)}
 <rect x="22" y="72" width="182" height="58" rx="5" class="w-bg"/><circle cx="34" cy="88" r="5" class="green"/>${T(46,92,"Prêt","w-ink",12,600)}<circle cx="34" cy="114" r="5" class="red"/>${T(46,118,"Non prêt — Pause","w-ink",12)}
 ${T(380,58,"Agent : 4012","w-ink",11.5)}${btn(440,42,80,"Déconnexion",false,true)}
 ${T(230,110,"Aucun appel en cours","w-mute",13)}${cursor(500,58)}`,160)},
phone(){return `<svg class="ill" viewBox="0 0 540 200" role="img" aria-label="Écran du téléphone IP"><rect x="110" y="8" width="320" height="184" rx="16" fill="#2b2f36"/><rect x="132" y="26" width="276" height="130" rx="6" fill="#e9f0f7"/>
 <text x="144" y="48" font-size="12" font-weight="700" fill="#1d2733">Infos sur le téléphone</text><text x="144" y="74" font-size="11.5" fill="#1d2733">Modèle : CP-8845</text>
 <rect x="138" y="84" width="262" height="22" rx="4" fill="rgba(217,72,15,.15)" stroke="#d9480f" stroke-width="1.6"/><text x="144" y="99" font-size="11.5" font-weight="700" fill="#b23a0b">Adresse IP : 169.254.10.3  ← problème</text>
 <text x="144" y="124" font-size="11.5" fill="#1d2733">État : Enregistrement…</text><text x="144" y="144" font-size="11" fill="#5a6878">MAC : 00:1B:54:A2:7C:19</text>
 ${[0,1,2,3].map(i=>`<rect x="${150+i*62}" y="166" width="50" height="14" rx="4" fill="#4a505a"/>`).join("")}</svg>`}
};
function ill(o){try{return ILL[o.k](o)}catch(e){return ""}}

/* =========================================================
   NAVIGATION
   ========================================================= */
const VIEWS=[["accueil","Diagnostic"],["pannes","Pannes"],["erreurs","Codes d'erreur"],["guides","Guides Windows"],["scripts","Boîte à scripts"],["commandes","Commandes"],["journal","Journal"],["check","Check du matin"]];
$("#nav").innerHTML=VIEWS.map(([k,n],i)=>`${i===1?'<div class="nav-label">Dépanner</div>':i===5?'<div class="nav-label">Outils</div>':""}<button data-v="${k}">${svgI(k)}<span>${n}</span>${k==="journal"?'<span class="count" id="jcount" hidden>0</span>':""}</button>`).join("");
$("#nav").querySelectorAll("button").forEach(b=>b.onclick=()=>{location.hash=b.dataset.v});
function show(v){if(!VIEWS.some(x=>x[0]===v))v="accueil";document.querySelectorAll("[data-view]").forEach(s=>s.hidden=s.id!=="v-"+v);
 document.querySelectorAll("#nav button").forEach(t=>{if(t.dataset.v===v)t.setAttribute("aria-current","page");else t.removeAttribute("aria-current")});window.scrollTo(0,0)}
addEventListener("hashchange",()=>show(location.hash.slice(1)));
/* ---------- Fenêtre modale ---------- */
let mcur=null,mstack=[],mlast=null;
function openModal(entry){const m=$("#modal");if(m.hidden){mstack=[];mlast=document.activeElement}else if(mcur)mstack.push(mcur);mcur=entry;renderModal();m.hidden=false;document.documentElement.classList.add("noscroll");$("#mbox").scrollTop=0;setTimeout(()=>$("#mclose").focus(),30)}
function renderModal(){$("#mback").hidden=!mstack.length;const p=mcur.type==="fiche"?byId(mcur.id):null;$("#mtitle").textContent=mcur.type==="err"?"Code d'erreur":p&&p.d==="guide"?"Guide":"Fiche de dépannage";
 if(mcur.type==="fiche")renderDetail("#mbody",mcur.id);else{$("#mbody").innerHTML=errBody(ERR[mcur.i])}$("#mbox").scrollTop=0}
function closeModal(){const m=$("#modal");if(m.hidden)return;m.hidden=true;document.documentElement.classList.remove("noscroll");mstack=[];mcur=null;try{mlast&&mlast.focus&&mlast.focus()}catch(_){}}
function openFiche(id){if(byId(id))openModal({type:"fiche",id})}
function openErr(i){if(ERR[i])openModal({type:"err",i:+i})}
$("#mclose").onclick=closeModal;$("#mshade").onclick=closeModal;$("#mback").onclick=()=>{if(mstack.length){mcur=mstack.pop();renderModal()}};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#modal").hidden)closeModal()});
document.addEventListener("click",e=>{const c=e.target.closest("[data-copy]");if(c){copyText(c.dataset.copy,c);return}
 const o=e.target.closest("[data-open]");if(o){openFiche(o.dataset.open);return}
 const er=e.target.closest("[data-err]");if(er){openErr(er.dataset.err);return}
 const lg=e.target.closest("[data-errlog]");if(lg){logErr(+lg.dataset.errlog);return}
 const g=e.target.closest("[data-goto]");if(g){closeModal();location.hash=g.dataset.goto}});

/* =========================================================
   RECHERCHE LOCALE (pondérée)
   ========================================================= */
const STOP=new Set("les des une un le la de du et ou en au aux mon ma mes ne pas plus que qui quoi est sont a ai il elle on je tu nous vous ils sur pour par avec dans ce cette ces se sa son tout tous tres bien depuis matin quand comme".split(" "));
function words(q){return norm(q).replace(/[^a-z0-9.\s-]/g," ").split(/\s+/).filter(w=>w.length>2&&!STOP.has(w))}
function score(p,ws){const f=[norm(p.t),norm((p.sym||[]).join(" ")),norm([p.id,DOM[p.d]?.n,...(p.cau||[]),...p.st.map(s=>s.t+" "+s.d+" "+(s.cmd||"")),p.intro||""].join(" "))];let sc=0;
 ws.forEach(w=>{const st=w.length>5?w.slice(0,5):w;if(f[0].includes(st))sc+=4;if(f[1].includes(st))sc+=2;if(f[2].includes(st))sc+=1});return sc}
function localMatch(q,n=3,pool=P){const ws=words(q);if(!ws.length)return[];return pool.map(p=>[p,score(p,ws)]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,n).map(x=>x[0])}

/* =========================================================
   FICHES (liste + détail)
   ========================================================= */
let cur=FICHES[0].id,gcur=GUIDES[0].id,fdom="",doneSteps=store.get("steps",{});
function itemHTML(p,sel){return `<button class="item sev-${p.d==="guide"?"guide":p.s}" role="option" aria-selected="${sel}" data-id="${p.id}"><span class="sev-bar"></span><span class="item-b"><span class="item-top"><span>${p.id}</span><span>·</span><span>${esc(p.d==="guide"?"Guide":DOM[p.d].n)}</span><span>·</span>${lvlHTML(p.lvl)}</span><h4>${esc(p.t)}</h4></span></button>`}
function renderDom(){$("#fdom").innerHTML=[["","Tous"],...Object.entries(DOM).map(([k,v])=>[k,v.n])].map(([k,n])=>`<button class="chip" aria-pressed="${k===fdom}" data-d="${k}">${esc(n)}</button>`).join("");
 $("#fdom").querySelectorAll(".chip").forEach(b=>b.onclick=()=>{fdom=b.dataset.d;renderDom();renderList()})}
function filtered(){const q=$("#q").value.trim(),lv=$("#flvl").value;let L=FICHES.filter(p=>(!fdom||p.d===fdom)&&(!lv||String(p.lvl)===lv));
 if(q){const ws=words(q);const nq=norm(q);L=L.map(p=>[p,score(p,ws)+(norm(p.t+" "+(p.sym||[]).join(" ")).includes(nq)?5:0)]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).map(x=>x[0])}return L}
function renderList(){const L=filtered();
 $("#list").innerHTML=L.length?L.map(p=>itemHTML(p,false)).join(""):`<div class="empty">Aucune fiche trouvée. Essayez d'autres mots, ou décrivez le problème à l'assistant sur l'Accueil.</div>`;
 $("#list").querySelectorAll(".item").forEach(b=>b.onclick=()=>openFiche(b.dataset.id));$("#lcount").textContent=`${L.length} fiche${L.length>1?"s":""}`}
$("#q").addEventListener("input",renderList);$("#flvl").addEventListener("change",renderList);
function renderGuides(){$("#glist").innerHTML=GUIDES.map(p=>itemHTML(p,false)).join("");
 $("#glist").querySelectorAll(".item").forEach(b=>b.onclick=()=>openFiche(b.dataset.id))}

function renderDetail(sel,id){const p=byId(id),box=$(sel);if(!p){box.innerHTML="";return}
 const guide=p.d==="guide",d=doneSteps[p.id]||[],n=p.st?p.st.length:0,pct=n?Math.round(d.length/n*100):0;
 let h=`<div class="d-head"><div class="d-art">${typeof domArt==="function"?domArt(guide?"guide":p.d):""}</div><div class="meta">${guide?'<span class="pill info">Guide</span>':`<span class="pill ${p.s}">${SEV[p.s]}</span>`}<span class="pill neutral">${p.id}</span>${guide?"":`<span class="pill neutral">${esc(DOM[p.d].n)}</span>`}<span class="pill neutral">${lvlHTML(p.lvl)}&nbsp;${LVL[p.lvl]}</span><span class="pill neutral">⏱ ${esc(p.tm)}</span></div>
 <h3>${esc(p.t)}</h3>${p.intro?`<p style="margin:0;color:var(--muted);max-width:66ch">${esc(p.intro)}</p>`:""}
 ${n?`<div style="display:flex;align-items:center;gap:10px"><div class="progress" style="flex:1"><i style="width:${pct}%"></i></div><span class="mono" style="color:var(--muted);font-size:12px">${d.length}/${n} étapes</span></div>`:""}</div><div class="d-body">`;
 if(p.lvl===3)h+=`<div class="admin-note">${alertHTML("warn","<b>Fiche avancée.</b> Les étapes avec commandes serveur ou réseau sont réservées à l'administrateur. Vous pouvez faire les vérifications simples et lui transmettre le résultat.")}</div>`;
 if(p.sym)h+=`<div class="two"><div class="sec"><h4>Ce que vous voyez</h4><ul>${p.sym.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div><div class="sec"><h4>Causes probables</h4><ul>${p.cau.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div></div>`;
 if(p.table)h+=`<div class="sec"><div style="overflow-x:auto"><table class="gtable">${p.table.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("")}</table></div></div>`;
 if(n)h+=`<div class="sec"><h4>${guide?"Pas à pas":"Résolution pas à pas"}</h4><ol class="steps">${p.st.map((s,i)=>{const lk=s.link&&byId(s.link);return `<li class="step ${d.includes(i)?"done":""}"><button type="button" class="num" data-i="${i}" aria-label="Étape ${i+1} : marquer comme faite">${d.includes(i)?"✓":i+1}</button><div style="min-width:0"><div class="st-t">${esc(s.t)}</div>${s.d?`<div class="st-d">${esc(s.d)}</div>`:""}${s.ill?`<div class="ill-wrap">${ill(s.ill)}${s.ill.cap&&s.ill.k!=="keys"?`<div class="ill-cap">${esc(s.ill.cap)}</div>`:""}</div>`:""}${s.cmd?cmdHTML(s.cmd):""}${lk?`<div class="st-link"><button class="link" data-open="${lk.id}">${lk.d==="guide"?"Guide":"Fiche"} ${lk.id} : ${esc(lk.t)} →</button></div>`:""}</div></li>`}).join("")}</ol></div>`;
 if(p.pre&&p.pre.length)h+=`<div class="sec"><h4>Pour que ça ne revienne pas</h4><ul>${p.pre.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div>`;
 if(!guide)h+=`<div class="outcome"><div><b>Résultat</b><div class="note">Un clic enregistre l'incident dans le journal de l'équipe, avec les étapes faites.</div></div>
  <div class="outcome-row"><button class="btn ok" data-res="ok">✓ C'est réglé</button><button class="btn" data-res="ko">Toujours bloqué</button>${n?`<button class="btn" data-res="reset">Recommencer les étapes</button>`:""}</div>
  <div class="esc-box" hidden>${alertHTML("info",`<b>Qui contacter :</b> ${esc(p.esc)}<br>Donnez-lui : l'heure du début, le message d'erreur exact, les étapes déjà faites (${d.length}/${n}). Le guide G-09 explique comment trouver les infos du PC.`)}</div></div>`;
 else if(n)h+=`<div class="outcome"><div class="outcome-row"><button class="btn" data-res="reset">Recommencer</button></div></div>`;
 box.innerHTML=h+"</div>";
 box.querySelectorAll(".num").forEach(b=>b.onclick=()=>{const i=+b.dataset.i,a=new Set(doneSteps[p.id]||[]);a.has(i)?a.delete(i):a.add(i);doneSteps[p.id]=[...a].sort((x,y)=>x-y);store.set("steps",doneSteps);renderDetail(sel,id)});
 box.querySelectorAll("[data-res]").forEach(b=>b.onclick=()=>{const r=b.dataset.res;if(r==="reset"){delete doneSteps[p.id];store.set("steps",doneSteps);renderDetail(sel,id);return}
  if(r==="ko")box.querySelector(".esc-box").hidden=false;quickLog(p,r==="ok"?"Résolu":"Ouvert")})}

/* =========================================================
   DICTIONNAIRE DES ERREURS
   ========================================================= */
const ck2=s=>norm(s).replace(/^0x/,"").replace(/[^a-z0-9]/g,"");
ERR.forEach((e,i)=>{e.i=i;const al=[e.c,...(e.a||[])];if(e.t==="sip")al.push(e.c.replace("SIP ",""));e.keys=[...new Set(al.map(ck2).filter(k=>k.length>=3))]});
function errMatch(q,max=4){if(!q)return[];const full=ck2(q);const toks=norm(q).split(/[\s,;:()«»"'\/\[\]]+/).map(ck2).filter(t=>t.length>=3);const hasD=x=>/\d/.test(x);
 const res=[];ERR.forEach(e=>{let best=0;e.keys.forEach(k=>{if(toks.includes(k)||(k.length>=8&&full.includes(k))||toks.some(t=>t.length>=6&&hasD(t)&&k.includes(t)))best=Math.max(best,k.length+(/^[0-9a-f]{8}$/.test(k)?6:0))});if(best)res.push([e,best])});
 return res.sort((a,b)=>b[1]-a[1]).slice(0,max).map(x=>x[0])}
let etool="",eopen=null;
function errHTML(e){return `<button type="button" class="erow sev-${e.s}" data-err="${e.i}"><span class="sb"></span><span class="ecode">${esc(e.c)}</span><span class="ename">${esc(e.n)}<small>${esc(ETOOLS[e.t])}</small></span><span style="display:flex;gap:8px;align-items:center"><span class="pill ${e.s} err-tool">${SEV[e.s]}</span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg></span></button>`}
function errBody(e){const f=e.ref&&byId(e.ref);return `<div class="d-head"><div class="meta"><span class="pill ${e.s}">${SEV[e.s]}</span><span class="pill neutral">${esc(ETOOLS[e.t])}</span></div><div class="mono" style="font-size:clamp(17px,2.4vw,22px);font-weight:600;overflow-wrap:anywhere">${esc(e.c)}</div><h3>${esc(e.n)}</h3></div>
 <div class="d-body"><div class="err-b"><div><h5>Ce que ça veut dire</h5><p>${esc(e.m)}</p></div>
 <div class="two"><div><h5>Causes fréquentes</h5><ul>${e.cau.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div><div><h5>Que faire</h5><ol>${e.fx.map(x=>`<li>${esc(x)}</li>`).join("")}</ol></div></div>
 ${e.who?alertHTML("info",`<b>Qui prévenir :</b> ${esc(e.who)}. Donnez-lui le code exact, l'heure et ce que vous faisiez.`):""}
 <div class="err-foot">${f?`<button class="btn primary" data-open="${f.id}">Suivre la fiche ${f.id} : ${esc(f.t)} →</button>`:""}<button class="btn" data-errlog="${e.i}">Noter dans le journal</button></div></div></div>`}
function logErr(i){const e=ERR[i];const f=e.ref&&byId(e.ref);closeModal();prefill({t:e.n,d:f?f.d:(e.t==="crm"?"crm":["sip","rc","cph"].includes(e.t)?"cisco":e.t==="office"?"office":e.t==="print"?"print":["net","http"].includes(e.t)?"net":"win"),s:e.s,id:f?f.id:"",err:e.c});location.hash="journal"}
function bindErr(){}
function renderErrTools(){$("#etools").innerHTML=[["","Tous"],...Object.entries(ETOOLS)].map(([k,n])=>`<button class="chip" aria-pressed="${k===etool}" data-t="${k}">${esc(n)}</button>`).join("");
 $("#etools").querySelectorAll(".chip").forEach(b=>b.onclick=()=>{etool=b.dataset.t;renderErrTools();renderErrs()})}
function renderErrs(){const q=$("#eq").value.trim();let L=ERR.filter(e=>!etool||e.t===etool);
 if(q){const direct=new Set(errMatch(q,50).map(e=>e.i));const ws=words(q);L=L.map(e=>{let s=direct.has(e.i)?100:0;const txt=norm(e.c+" "+(e.a||[]).join(" ")+" "+e.n+" "+e.m+" "+e.cau.join(" "));ws.forEach(w=>{if(txt.includes(w.length>5?w.slice(0,5):w))s+=1});return [e,s]}).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).map(x=>x[0])}
 $("#ecount").textContent=`${L.length} code${L.length>1?"s":""}${q||etool?" trouvés":" dans le dictionnaire"}`;
 $("#elist").innerHTML=L.length?L.map(e=>errHTML(e)).join(""):`<div class="empty">Ce code n'est pas encore dans le dictionnaire. Décrivez-le à l'assistant de l'Accueil (avec une capture), ou notez-le dans le journal pour l'ajouter plus tard.</div>`;bindErr($("#elist"))}
$("#eq").addEventListener("input",renderErrs);

/* =========================================================
   ACCUEIL + ASSISTANT
   ========================================================= */


/* =========================================================
   BOÎTE À SCRIPTS
   ========================================================= */
let scSel=new Set(store.get("scsel",["dns","ip"]));
function scBuild(){const L=SCRIPTS.filter(s=>scSel.has(s.id));if(!L.length)return"REM Cochez au moins une réparation à gauche.";
 const reboot=L.some(s=>s.reboot);let o=["@echo off","chcp 65001 >nul","title Atelier Depannage - reparation","REM Genere par Atelier Depannage IT - a lancer en administrateur","net session >nul 2>&1","if %errorlevel% neq 0 (","  echo Ce script doit etre lance en administrateur.","  echo Clic droit sur le fichier ^> Executer en tant qu'administrateur.","  pause","  exit /b",")","echo."];
 L.forEach((s,i)=>{o.push("",`REM --- ${s.t} ---`,`echo [${i+1}/${L.length}] ${norm(s.t).replace(/^./,c=>c.toUpperCase())}...`,...s.c)});
 o.push("","echo.","echo Termine.");if(reboot)o.push("echo Redemarrez le PC pour terminer la reparation.");o.push("pause");return o.join("\r\n")}
function renderScripts(){$("#presets").innerHTML=PRESETS.map((p,i)=>`<button class="chip" data-p="${i}">${esc(p.n)}</button>`).join("");
 $("#presets").querySelectorAll(".chip").forEach(b=>b.onclick=()=>{scSel=new Set(PRESETS[+b.dataset.p].ids);store.set("scsel",[...scSel]);renderScripts();toast("Sélection : "+PRESETS[+b.dataset.p].n)});
 $("#sclist").innerHTML=SCRIPTS.map(s=>`<label class="sc-item ${scSel.has(s.id)?"on":""}"><input type="checkbox" id="sc-${s.id}" data-id="${s.id}" ${scSel.has(s.id)?"checked":""}><span><b>${esc(s.t)}</b><span>${esc(s.d)}</span></span><span class="pill ${s.r>1?"maj":"min"}">${s.r>1?"Long":"Rapide"}</span></label>`).join("");
 $("#sclist").querySelectorAll("input").forEach(c=>c.onchange=()=>{c.checked?scSel.add(c.dataset.id):scSel.delete(c.dataset.id);store.set("scsel",[...scSel]);renderScripts()});
 $("#scpre").textContent=scBuild();$("#sccount").textContent=`${scSel.size} réparation${scSel.size>1?"s":""}`}
$("#sccopy").onclick=e=>copyText(scBuild().replace(/\r\n/g,"\n"),e.currentTarget);

/* =========================================================
   COMMANDES
   ========================================================= */
$("#cmdgrid").innerHTML=CMDS.map(g=>`<div class="card cmdgroup"><h3>${esc(g.g)}</h3><p>${esc(g.d)}</p>${g.c.map(([w,c])=>`<div class="cmdrow"><div class="what">${esc(w)}</div>${cmdHTML(c)}</div>`).join("")}</div>`).join("");

/* =========================================================
   CHECK DU MATIN
   ========================================================= */
const today=new Date().toISOString().slice(0,10);
const CK_ALL=CHECK.flatMap((g,gi)=>g.i.map((it,ii)=>gi+"-"+ii));
let ck=store.get("check",{d:today,v:[]});if(ck.d!==today||!Array.isArray(ck.v))ck={d:today,v:[]};
function renderCL(){$("#cl").innerHTML=CHECK.map((g,gi)=>`<div class="cl-group"><h3>${esc(g.g)}</h3><div class="cl">${g.i.map(([h,w],ii)=>{const k=gi+"-"+ii,on=ck.v.includes(k);return `<label class="cl-item ${on?"ok":""}"><input type="checkbox" id="ck${k}" data-k="${k}" ${on?"checked":""}><div style="min-width:0"><div class="h">${esc(h)}</div><div class="w">${esc(w)}</div></div></label>`}).join("")}</div></div>`).join("");
 $("#cl").querySelectorAll("input").forEach(c=>c.onchange=()=>{const s=new Set(ck.v);c.checked?s.add(c.dataset.k):s.delete(c.dataset.k);ck.v=[...s];store.set("check",ck);renderCL()});
 $("#clcount").textContent=`${ck.v.length}/${CK_ALL.length} faits`;$("#clbar").style.width=(ck.v.length/CK_ALL.length*100)+"%"}
$("#clreset").onclick=()=>{ck.v=[];store.set("check",ck);renderCL()};

/* =========================================================
   JOURNAL (base partagée)
   ========================================================= */
$("#j-dom").innerHTML=Object.entries(DOM).map(([k,v])=>`<option value="${k}">${esc(v.n)}</option>`).join("");
$("#j-ref").innerHTML+=FICHES.map(p=>`<option value="${p.id}">${p.id} — ${esc(p.t)}</option>`).join("");
const pad=n=>String(n).padStart(2,"0");
function nowLocal(){const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`}
$("#j-date").value=nowLocal();
function prefill(p){$("#j-titre").value=p.t||"";if(p.d&&DOM[p.d])$("#j-dom").value=p.d;if(p.s)$("#j-sev").value=p.s;$("#j-ref").value=p.id||"";$("#j-err").value=p.err||"";$("#j-date").value=nowLocal();renderSuggest();renderErrHint()}
function renderSuggest(){const q=$("#j-titre").value.trim();const box=$("#jsuggest");if(q.length<4||$("#j-ref").value){box.innerHTML="";return}
 const m=localMatch(q,3,FICHES);box.innerHTML=m.length?`<span class="note">Fiches possibles — cliquez pour lier :</span>${m.map(p=>`<button type="button" data-ref="${p.id}">${p.id} · ${esc(p.t)}</button>`).join("")}`:"";
 box.querySelectorAll("[data-ref]").forEach(b=>b.onclick=()=>{const p=byId(b.dataset.ref);$("#j-ref").value=p.id;$("#j-dom").value=p.d;$("#j-sev").value=p.s;box.innerHTML="";toast("Fiche "+p.id+" liée")})}
function renderErrHint(){const v=$("#j-err").value.trim(),box=$("#jerrhint");const m=v.length>=3?errMatch(v,1):[];if(!m.length){box.hidden=true;return}const e=m[0],f=e.ref&&byId(e.ref);
 box.hidden=false;box.innerHTML=`<b>${esc(e.c)}</b> : ${esc(e.n)}. ${f?`Fiche liée : ${f.id}. `:""}<button type="button" class="link" data-oe="${e.i}">Voir l'explication</button>`;
 box.querySelector("[data-oe]").onclick=()=>openErr(e.i);if(f&&!$("#j-ref").value){$("#j-ref").value=f.id;$("#j-dom").value=f.d;renderSuggest()}}
$("#j-err").addEventListener("input",()=>{clearTimeout(renderErrHint.h);renderErrHint.h=setTimeout(renderErrHint,250)});
$("#j-titre").addEventListener("input",()=>{clearTimeout(renderSuggest.h);renderSuggest.h=setTimeout(renderSuggest,250)});
$("#j-ref").addEventListener("change",()=>{const p=byId($("#j-ref").value);if(p){$("#j-dom").value=p.d;$("#j-sev").value=p.s}renderSuggest()});

let db=null,user=null,downloads=null,rows=[],canWrite=true,dbLoading=true;
function fmtDate(s){const d=new Date(s);if(isNaN(d))return esc(s||"");return `${pad(d.getDate())}/${pad(d.getMonth()+1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`}
async function addIncident(doc){if(jlocal){doc._id="l"+Date.now()+Math.random().toString(36).slice(2,6);doc.cree=new Date().toISOString();rows.unshift(doc);rows.sort((a,b)=>new Date(b.date)-new Date(a.date));store.set("journal-local",rows);renderJournal();return}if(!db)throw{code:"nodb"};if(user){try{doc.auteur=await user.id()}catch(_){}}doc.cree=new Date().toISOString();await db.collection("incidents").add(doc)}
async function quickLog(p,statut){const steps=(doneSteps[p.id]||[]).map(i=>p.st[i]?.t).filter(Boolean);
 const doc={titre:p.t,date:new Date().toISOString(),agents:null,dom:p.d,sev:p.s,ref:p.id,err:"",actions:steps.length?"Étapes faites : "+steps.join(" ; "):"Fiche consultée",statut};
if(!db&&!jlocal){toast(dbLoading?"Journal en cours de chargement, réessayez dans un instant":"Journal indisponible ici : notez l'incident manuellement");return}
 if(!canWrite){toast("Accès en lecture seule : impossible d'écrire dans le journal");return}
 try{await addIncident(doc);toast(statut==="Résolu"?"Noté dans le journal : résolu ✓":"Noté dans le journal : à traiter")}catch(e){toast(e?.code==="quota_exceeded"?"Journal plein : supprimez d'anciens incidents":"Enregistrement refusé : accès en lecture seule");if(e?.code!=="quota_exceeded")canWrite=false}}
function renderJournal(){const f=$("#jfilter").value;const R=rows.filter(r=>!f||r.statut===f);const open=rows.filter(r=>r.statut!=="Résolu");
 $("#jcount").textContent=open.length;$("#jcount").hidden=!open.length;
 const today0=new Date();today0.setHours(0,0,0,0);const td=rows.filter(r=>new Date(r.date)>=today0).length;
 $("#jkpis").innerHTML=`<div><b>${rows.length}</b><span>incidents notés</span></div><div><b style="color:var(--maj)">${open.length}</b><span>à traiter</span></div><div><b style="color:var(--min)">${rows.length-open.length}</b><span>résolus</span></div><div><b>${td}</b><span>aujourd'hui</span></div>`;
 const tb=$("#jbody");
 if(dbLoading)tb.innerHTML=`<tr><td colspan="6" class="empty">Chargement du journal de l'équipe…</td></tr>`;
 else if(!db&&!jlocal)tb.innerHTML=`<tr><td colspan="6" class="empty">Le journal partagé n'est pas disponible sur cette vue. Ouvrez l'application dans claude.ai, connecté, pour noter et voir les incidents de l'équipe.</td></tr>`;
 else if(!R.length)tb.innerHTML=`<tr><td colspan="6" class="empty">${rows.length?"Aucun incident avec ce statut.":"Aucun incident noté pour l'instant. Utilisez le formulaire, ou les boutons « C'est réglé » / « Toujours bloqué » d'une fiche : l'incident apparaîtra ici pour toute l'équipe."}</td></tr>`;
 else tb.innerHTML=R.map(r=>`<tr><td class="num">${fmtDate(r.date)}</td><td style="min-width:240px"><b>${esc(r.titre)}</b>${r.err?`<div class="sub mono">« ${esc(r.err)} »</div>`:""}${r.actions?`<div class="sub">${esc(r.actions)}</div>`:""}${r.ref&&byId(r.ref)?`<button class="link" data-open="${esc(r.ref)}">Fiche ${esc(r.ref)} →</button>`:""}</td><td>${esc(DOM[r.dom]?.n||r.dom||"—")}</td><td><span class="pill ${esc(r.sev)}">${SEV[r.sev]||"—"}</span></td><td class="num">${r.agents??"—"}</td>
 <td><select class="status-sel" data-id="${esc(r._id)}" aria-label="Statut" ${canWrite?"":"disabled"}>${["Ouvert","En cours","Contourné","Résolu"].map(s=>`<option ${s===r.statut?"selected":""}>${s}</option>`).join("")}</select></td></tr>`).join("");
 tb.querySelectorAll(".status-sel").forEach(s=>s.onchange=async()=>{if(jlocal){const r=rows.find(x=>x._id===s.dataset.id);if(r){r.statut=s.value;store.set("journal-local",rows);renderJournal();toast("Statut mis à jour")}return}try{await db.collection("incidents").doc(s.dataset.id).update({statut:s.value});toast("Statut mis à jour")}catch(e){toast("Modification refusée : accès en lecture seule")}});
 const counts={};rows.forEach(r=>{const k=DOM[r.dom]?.n||"Autre";counts[k]=(counts[k]||0)+1});const mx=Math.max(1,...Object.values(counts));const keys=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]);
 $("#jbars").innerHTML=keys.length?keys.map(k=>`<div class="bar"><span>${esc(k)}</span><span class="t"><i style="width:${counts[k]/mx*100}%"></i></span><span class="v">${counts[k]}</span></div>`).join(""):`<p class="note" style="margin-top:10px">La répartition apparaîtra dès les premiers incidents.</p>`;
 const hj=$("#homejournal");if(dbLoading)hj.innerHTML=`<p class="note">Chargement…</p>`;else if(!db&&!jlocal)hj.innerHTML=`<p class="note">Journal disponible dans claude.ai, connecté.</p>`;
 else hj.innerHTML=rows.length?rows.slice(0,4).map(r=>`<div style="display:flex;gap:10px;align-items:baseline;justify-content:space-between;border-bottom:1px solid var(--line);padding:6px 0"><span style="min-width:0"><b style="font-size:14px">${esc(r.titre)}</b><span class="note" style="display:block">${fmtDate(r.date)} · ${esc(DOM[r.dom]?.n||"")}</span></span><span class="pill ${r.statut==="Résolu"?"min":"maj"}">${esc(r.statut)}</span></div>`).join(""):`<p class="note">Aucun incident noté pour l'instant.</p>`}
$("#jfilter").onchange=renderJournal;
$("#jform").addEventListener("submit",async e=>{e.preventDefault();const msg=$("#j-msg");msg.hidden=false;const titre=$("#j-titre").value.trim();
 if(!titre){msg.textContent="Décrivez l'incident en une phrase avant d'enregistrer.";$("#j-titre").focus();return}
 if(!db&&!jlocal){msg.textContent="Le journal n'est pas encore prêt : réessayez dans un instant.";return}
 const b=$("#j-submit");b.disabled=true;
 const doc={titre,date:new Date($("#j-date").value||Date.now()).toISOString(),agents:$("#j-agents").value===""?null:+$("#j-agents").value,dom:$("#j-dom").value,sev:$("#j-sev").value,ref:$("#j-ref").value,err:$("#j-err").value.trim(),actions:$("#j-actions").value.trim(),statut:"Ouvert"};
 try{await addIncident(doc);msg.textContent=jlocal?"Incident enregistré sur cet appareil.":"Incident enregistré et visible par l'équipe.";["#j-titre","#j-agents","#j-err","#j-actions"].forEach(s=>$(s).value="");$("#j-ref").value="";$("#j-date").value=nowLocal();$("#jsuggest").innerHTML="";$("#jerrhint").hidden=true}
 catch(err){msg.textContent=err?.code==="quota_exceeded"?"Le journal est plein : supprimez d'anciens incidents résolus.":"Enregistrement refusé : votre accès est en lecture seule. Demandez un accès Contributeur.";if(err?.code!=="quota_exceeded")canWrite=false}
 finally{b.disabled=!canWrite}});
function csv(){const H=["Date","Incident","Domaine","Gravité","Personnes","Fiche","Erreur","Actions","Statut"];const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;
 return "\uFEFF"+[H,...rows.map(r=>[fmtDate(r.date),r.titre,DOM[r.dom]?.n||r.dom,SEV[r.sev]||"",r.agents??"",r.ref,r.err,r.actions,r.statut])].map(l=>l.map(q).join(";")).join("\r\n")}
async function save(name,text,type){if(!downloads){if(!IN_CLAUDE)dlFile(name,text,type);return}try{await downloads.save({filename:name,data:new Blob([text],{type})});toast("Fichier enregistré")}catch(e){if(e?.code!=="declined")toast("Téléchargement impossible ici")}}
$("#jcsv").onclick=()=>save("journal-incidents.csv",csv(),"text/csv");
$("#scdl").onclick=()=>IN_CLAUDE?save("reparation.txt",scBuild(),"text/plain"):dlFile("reparation.bat",scBuild(),"application/octet-stream");

/* =========================================================
   CAPACITÉS (assistant, base, téléchargements)
   ========================================================= */
async function initCaps(){
 if(!IN_CLAUDE)return;
 claude.use("sample").then(async s=>{sample=s;if(!s){$("#aimode").textContent="Recherche instantanée";return}try{const lim=await s.limits();sampleImages=!!(lim&&lim.images)}catch(_){}}).catch(()=>{});
 claude.use("downloads").then(d=>{downloads=d;if(d){$("#jcsv").hidden=false;$("#scdl").hidden=false}}).catch(()=>{});
 try{[db,user]=await Promise.all([claude.use("db"),claude.use("user")])}catch(e){db=null}
 dbLoading=false;
 if(user&&user.can){try{const c=await user.can("data.write");if(c===false){canWrite=false;$("#j-submit").disabled=true;const m=$("#j-msg");m.hidden=false;m.textContent="Accès en lecture seule : vous pouvez consulter le journal mais pas y écrire."}}catch(_){}}
 renderJournal();if(!db)return;
 const timer=setTimeout(()=>{if(!rows.length)$("#jbody").innerHTML=`<tr><td colspan="6" class="empty">Le journal ne répond pas encore. Les données s'afficheront dès que la connexion sera rétablie.</td></tr>`},10000);
 db.collection("incidents").orderBy("date","desc").limit(500).onSnapshot(s=>{if(!s.metadata.fromCache)clearTimeout(timer);rows=s.docs.map(d=>({...d.data(),_id:d.id}));renderJournal()},
  ()=>{clearTimeout(timer);$("#jbody").innerHTML=`<tr><td colspan="6" class="empty">Le journal n'est plus accessible sur cette page.</td></tr>`})}

