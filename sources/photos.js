/* =========================================================
   PHOTOS — vraies photos (Unsplash, licence libre)
   Dans claude.ai les images externes sont bloquées :
   l'application affiche alors ses illustrations à la place.
   ========================================================= */
const IN_CLAUDE=!!(window.claude&&window.claude.use);
const PH={
 hero:"1766066014237-00645c74e9c6",   // agente souriante avec casque devant l'ordinateur
 duo:"1626863905121-3b0c0ed7b94c",    // deux agentes avec casques, bureau lumineux
 casque:"1714079761488-e0c9b9ac4138", // homme avec casque devant un portable
 agent:"1712159018726-4564d92f3ec2",  // homme avec casque devant l'ordinateur
 materiel:"1553775282-20af80779df7",  // casque posé près d'un portable
 plateau:"1560264280-88b68371db39",   // open space, personnes aux bureaux
 bureau:"1504384308090-c894fdcc538d", // équipe au travail
 telip:"1525182008055-f88b95ff7980",  // homme au téléphone IP
 poste:"1587560699334-bea93391dcef",  // téléphone IP de bureau
 portable:"1454165804606-c3d57bc86b40",// mains, crayon, portable
 rdv:"1560264418-c4445382edbc",       // homme à son bureau
 accord:"1521791136064-7986c2920216"  // poignée de main
};
const DOMPH={cisco:"telip",crm:"duo",teams:"casque",outlook:"portable",office:"bureau",win:"rdv",net:"plateau",print:"bureau",web:"portable",acc:"agent",sec:"materiel",hw:"materiel",guide:"rdv"};
function photo(k,w=900,face){if(IN_CLAUDE||!PH[k])return "";return `https://images.unsplash.com/photo-${PH[k]}?w=${w}&q=72&auto=format&fit=crop${face?`&h=${w}&crop=faces`:""}`}
function photoBg(k,w,overlay,fallback){const u=photo(k,w);return `background-image:${overlay?overlay+",":""}${u?`url('${u}'),`:""}${fallback}`}
function domGrad(k){const c=(typeof DART!=="undefined"&&DART[k])||["#1c2b44","#3d5a80"];return `linear-gradient(135deg,${c[0]},${c[1]})`}
function bannerStyle(k){return photoBg(DOMPH[k]||"rdv",1100,"linear-gradient(100deg,rgba(8,15,27,.94) 0%,rgba(8,15,27,.78) 50%,rgba(8,15,27,.35) 100%)",domGrad(k))}
/* portrait de personnage : photo recadrée sur le visage, ou initiales */
function avatar(p,size=56){const u=p.ph?photo(p.ph,size*3,true):"";const ini=p.name.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
 return `<span class="ava" style="width:${size}px;height:${size}px;background:${p.col||"var(--accent)"}"><span>${esc(ini)}</span>${u?`<img src="${u}" alt="" loading="lazy" onerror="this.remove()">`:""}</span>`}
