/* =========================================================
   SIGNATURES — messages exacts affichés à l'écran → fiche
   Chaque phrase est le texte que l'on voit sur la capture
   (français et anglais). La fiche n'est proposée comme
   « correspondance exacte » que si l'une de ses phrases
   est lue sur la capture.
   ========================================================= */
const SIGS={
 "W-02":["ne repond pas","not responding","le programme ne repond pas","fermer le programme","attendre la reponse du programme"],
 "W-03":["votre pc a rencontre un probleme","votre pc a rencontre un probleme et doit redemarrer","your pc ran into a problem","code d'arret","stop code","nous collectons simplement des informations"],
 "W-04":["preparation de la reparation automatique","reparation automatique","automatic repair","choisir une option","choose an option","diagnostic de votre pc","votre pc n'a pas demarre correctement"],
 "W-05":["windows update","echec de l'installation","il y a eu des problemes lors de l'installation de certaines mises a jour","annulation des modifications","undoing changes","we couldn't complete the updates"],
 "W-06":["espace disque insuffisant","low disk space","vous manquez d'espace disque","running out of disk space","pas assez d'espace"],
 "W-07":["ecran noir"],
 "W-08":["est introuvable","was not found","le programme ne peut pas demarrer car","is missing from your computer","manque sur votre ordinateur"],
 "W-09":["bloque par votre administrateur","windows a protege votre ordinateur","windows protected your pc","cette application a ete bloquee","this app has been blocked","voulez-vous autoriser cette application"],
 "W-10":["aucun peripherique de sortie audio","no audio output device","aucun peripherique d'entree","haut-parleurs desactives"],
 "W-11":["touches remanentes","touches filtres","sticky keys","filter keys"],
 "W-12":["aucun signal","no signal","pas de signal","cable non connecte"],
 "W-13":["impossible de trouver cet element","could not find this item","fichier introuvable"],
 "H-01":["aucun peripherique de demarrage","no bootable device"],
 "H-02":["temperature","surchauffe"],
 "H-03":["peripherique usb non reconnu","usb device not recognized","le dernier peripherique usb"],
 "N-01":["aucun acces a internet","no internet access","pas d'internet","non connecte","aucun acces internet","no internet","vous n'etes pas connecte"],
 "N-02":["impossible de se connecter a ce reseau","can't connect to this network","cle de securite reseau","aucun reseau disponible"],
 "N-03":["ce site est inaccessible","this site can't be reached","impossible de trouver l'adresse ip du serveur","dns_probe_finished_nxdomain","err_name_not_resolved","err_connection_timed_out","hmm... impossible d'atteindre cette page"],
 "N-04":["chemin d'acces reseau introuvable","the network path was not found","impossible d'acceder a","n'est pas accessible","lecteur reseau deconnecte"],
 "N-05":["la connexion vpn a echoue","vpn connection failed","impossible de se connecter au vpn","echec de la connexion a","the remote connection was not made"],
 "N-06":["lent","lenteur"],
 "I-01":["erreur - impression","error - printing","erreur impression","document en attente","impression en cours"],
 "I-02":["imprimante hors connexion","printer offline","utiliser l'imprimante hors connexion","hors connexion"],
 "I-03":["ajouter une imprimante","add a printer","l'imprimante que je veux n'est pas repertoriee"],
 "O-01":["impossible de demarrer microsoft outlook","cannot start microsoft outlook","chargement du profil","loading profile","impossible d'ouvrir la fenetre outlook","the set of folders cannot be opened","impossible d'ouvrir l'ensemble des dossiers"],
 "O-02":["travail hors connexion","working offline","deconnecte","disconnected","boite d'envoi","tentative de connexion","envoi et reception"],
 "O-03":["nous n'avons pas pu vous connecter","we couldn't sign you in","teams a rencontre un probleme","quelque chose s'est mal passe","something went wrong","vider le cache"],
 "O-04":["le fichier est endommage","the file is corrupt","impossible d'ouvrir le fichier","recuperation de documents","ouvrir et reparer"],
 "OL-01":["aucun resultat","no results","les resultats de recherche peuvent etre incomplets","search results may be incomplete","l'indexation est en cours"],
 "OL-02":["votre boite aux lettres est pleine","your mailbox is full","boite aux lettres est presque pleine","mailbox is almost full","quota de la boite aux lettres"],
 "OL-03":["besoin d'un mot de passe","need password","entrez votre mot de passe","enter your password","votre mot de passe a expire","informations d'identification"],
 "OL-04":["boite aux lettres partagee","shared mailbox","vous n'avez pas l'autorisation","you don't have permission"],
 "T-01":["vous etes en sourdine","you're muted","votre micro est desactive","your mic is muted","impossible d'acceder au micro","we can't access your mic","aucun micro","on ne vous entend pas"],
 "T-02":["aucune camera","no camera","la camera n'est pas disponible","camera isn't available","impossible de demarrer la video","we can't start your video","camera utilisee par une autre application"],
 "T-03":["absent","ne pas deranger","do not disturb","notifications desactivees","reinitialiser le statut"],
 "B-01":["mise en page","page ne s'affiche pas correctement"],
 "B-02":["votre ordinateur est infecte","your computer is infected","appelez immediatement","call microsoft support","virus detecte","alerte de securite microsoft"],
 "C-01":["le mot de passe est incorrect","the password is incorrect","le compte reference est verrouille","the referenced account is currently locked","nom d'utilisateur ou mot de passe incorrect","mot de passe incorrect"],
 "C-02":["profil temporaire","temporary profile","vous etes connecte avec un profil temporaire","we can't sign into your account"],
 "S-01":["menaces trouvees","threats found","menace detectee","threat detected","protection contre les virus et menaces"],
 "S-02":["vos fichiers ont ete chiffres","your files have been encrypted","rancon","ransom","bitcoin","decrypt","dechiffrer vos fichiers"],
 "S-03":["verifiez votre compte","verify your account","votre compte sera suspendu","your account will be suspended","cliquez ici pour confirmer"],
 "E-01":["une erreur s'est produite","an error has occurred","chargement en cours","impossible de charger","la page ne repond pas"],
 "E-02":["telecharger le fichier journal","download log file","vous n'avez pas les privileges","you do not have","privilege","prvread","prvwrite","seclib","l'enregistrement n'existe pas","does not exist"],
 "E-03":["appel entrant","incoming call","volet de communication","fiche client introuvable","aucune fiche trouvee"],
 "E-04":["champ obligatoire","required field","des champs obligatoires sont vides","required fields must be filled in","veuillez renseigner","impossible d'enregistrer"],
 "E-05":["doublons detectes","duplicate records found","doublon detecte","un enregistrement en double","duplicate detected"],
 "E-06":["aucun enregistrement","no data available","aucune donnee disponible","mes dossiers actifs","my active cases"],
 "AG-01":["non pret","not ready","reserve","reserved","impossible de passer a l'etat pret","unable to change state"],
 "AG-02":["perte de connexion au serveur","connection to server lost","lost connection","la connexion au serveur a ete perdue","tentative de reconnexion","attempting to reconnect","finesse est hors service"],
 "AG-03":["enregistrement","registering","configuration ip","configuring ip","recherche de service","telephone non enregistre","unprovisioned"],
 "AG-04":["telephone non connecte","phone services are not connected","impossible de communiquer avec le serveur","cannot communicate with the server","les services telephoniques sont desactives"],
 "AG-05":["aucun appel","no calls"],
 "AG-06":["transfert impossible","transfer failed","echec du transfert","conference failed"],
 "AU-01":["qualite d'appel","call quality","audio hache"],
 "AU-04":["appel termine","call ended","appel coupe"],
 "OP-01":["occupe","busy","service indisponible","service unavailable","toutes les lignes sont occupees"],
 "SV-01":["certificat","certificate","votre connexion n'est pas privee","your connection is not private","net::err_cert"]
};
/* phrases que l'on tape en décrivant le problème */
Object.entries({"O-01":["outlook ne s'ouvre pas","outlook ne demarre pas","outlook bloque au chargement"],"AU-02":["le client ne m'entend pas","je n'entends pas le client","audio a sens unique","le client ne m'entend plus"],"W-10":["pas de son","casque ne marche pas","je n'entends rien dans le casque"],"W-01":["pc lent","ordinateur lent","pc tres lent","tout rame"],"I-01":["imprimante n'imprime pas","l'imprimante n'imprime plus","impression bloquee"],"W-03":["ecran bleu"],"C-01":["mot de passe refuse","compte bloque"],"AG-01":["je reste en non pret","bloque en non pret","bloquee en non pret"],"AU-01":["son hache","voix robotique"],"AU-04":["appel coupe","les appels se coupent"],"T-01":["teams on ne m'entend pas","on ne m'entend pas en reunion"],"E-01":["engage est lent","crm lent","crm ne charge pas"],"E-03":["la fiche client ne s'ouvre pas"],"AG-03":["telephone bloque sur enregistrement"],"N-02":["wifi ne marche pas","pas de wifi"]}).forEach(([k,v])=>{SIGS[k]=[...(SIGS[k]||[]),...v]});
/* signatures « faibles » : un seul mot courant, utilisées seulement avec le contexte de l'application */
const WEAK=new Set(["deconnecte","disconnected","hors connexion","enregistrement","reserve","reserved","absent","occupe","busy","lent","lenteur","temperature","surchauffe","ecran noir","aucun appel","no calls","certificat","certificate","privilege","decrypt","ransom","bitcoin","rancon","no results","aucun resultat","mise en page"]);

/* ---------- Comparaison tolérante aux erreurs de lecture ---------- */
function lev(a,b){if(a===b)return 0;const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=Array.from({length:n+1},(_,j)=>j);for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]}
function tokSim(a,b){if(a===b)return 1;if(a.length<4||b.length<4)return 0;return Math.max(0,1-lev(a,b)/Math.max(a.length,b.length))}
const normS=s=>norm(s).replace(/[’`]/g,"'").replace(/[^a-z0-9'._:@ -]+/g," ").replace(/\s+/g," ").trim();
function tokens(s){return normS(s).split(" ").map(t=>t.replace(/^[.:_'-]+|[.:_'-]+$/g,"")).filter(Boolean)}
/* toks : [{t, w}] — t = mot normalisé, w = index du mot OCR (pour surligner) */
function findPhrase(toks,phrase){const pt=tokens(phrase);if(!pt.length||toks.length<pt.length)return null;let best=null;
 for(let i=0;i<=toks.length-pt.length;i++){let s=0;for(let j=0;j<pt.length;j++){const v=tokSim(pt[j],toks[i+j].t);if(v<.6){s=-1;break}s+=v}if(s<0)continue;s/=pt.length;if(!best||s>best.s)best={s,i,n:pt.length}}
 if(!best)return null;const need=pt.length===1?1:pt.length===2?.9:.84;return best.s>=need?best:null}
function sigMatch(toks,app){const out=[];
 for(const[id,phr]of Object.entries(SIGS)){const f=byId(id);if(!f)continue;let top=null;
  for(const p of phr){const m=findPhrase(toks,p);if(!m)continue;const weak=WEAK.has(p);if(weak&&app!==f.d)continue;
   const len=tokens(p).length;const score=m.s*(weak?.62:len>=3?1:.9);if(!top||score>top.score)top={score,phrase:p,i:m.i,n:m.n}}
  if(top)out.push({type:"fiche",id,...top})}
 return out.sort((a,b)=>b.score-a.score)}
/* repère les mots OCR qui contiennent un code d'erreur */
function codeWords(words,e){const keys=(e.keys||[]).filter(x=>/\d/.test(x)||x.length>=8);const hits=[];words.forEach((w,i)=>{const k=ck2(w.text||"");if(k.length>=3&&keys.some(x=>x===k||(x.length>=5&&k.includes(x))))hits.push(i)});return hits}
/* rapproche un code ou un message du dictionnaire avec ce qui est lu */
const ERRAPP={bsod:"win",wu:"win",win:"win",net:"net",http:"web",office:"outlook",print:"print",crm:"crm",sip:"cisco",rc:"cisco",cph:"cisco"};
function errOnShot(e,toks,words,app){const isCode=/\d/.test(e.c)||/^[A-Z_:.]{8,}$/.test(e.c);
 if(isCode)return {ok:true,idx:words?codeWords(words,e):[],score:1.2};
 let best=null;[e.c,...(e.a||[])].forEach(ph=>{const m=findPhrase(toks,ph);if(m&&(!best||m.s>best.s))best={...m,len:tokens(ph).length}});
 if(!best)return {ok:false};const dom=ERRAPP[e.t];if(best.len<2&&app!==dom&&!(dom==="outlook"&&["outlook","teams","office"].includes(app)))return {ok:false};
 return {ok:true,idx:toks.slice(best.i,best.i+best.n).map(t=>t.w).filter(w=>w>=0),score:best.len>=3?1.1:.95}}
