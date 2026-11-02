/* =========================================================
   ACADÉMIE — contenu des parcours, leçons et missions
   ========================================================= */
const PEOPLE={
 aicha:{name:"Aïcha Traoré",role:"Agente, service client",ph:"hero",face:[.8,.42,3.2],col:"#c2410c"},
 koffi:{name:"Koffi Yao",role:"Superviseur du plateau",ph:"agent",col:"#1c6dd0"},
 serge:{name:"Serge N'Guessan",role:"Agent, recouvrement",ph:"casque",col:"#0b7285"},
 fatou:{name:"Fatou Diallo",role:"Agente, service client",ph:"duo",col:"#9c36b5"},
 marc:{name:"Marc Kouassi",role:"Comptable",ph:"rdv",col:"#2b8a3e"},
 awa:{name:"Awa Koné",role:"Assistante de direction",ph:"portable",col:"#c92a2a"},
 paul:{name:"Paul Konan",role:"Agent, ventes",ph:"telip",col:"#5f3dc4"},
 coach:{name:"Coach Atelier",role:"Votre formateur",ph:"",col:"#d9480f"}
};

const UNITS=[
{id:"u1",t:"La méthode du dépanneur",d:"Écouter, isoler, chercher, réparer, vérifier : la démarche qui marche partout.",col:["#c2410c","#ff922b"],ph:"bureau",
 lesson:{cards:[
  {t:"Bienvenue dans l'Atelier",txt:"Un bon dépanneur ne connaît pas toutes les pannes par cœur : il applique toujours la même méthode. Vous allez l'apprendre en 5 étapes, puis la pratiquer sur de vraies situations.",who:"coach"},
  {t:"1. Écouter et faire préciser",txt:"Demandez : qu'est-ce qui ne marche pas exactement ? Depuis quand ? Qu'est-ce qui s'affiche à l'écran ? Notez l'heure et le message d'erreur mot pour mot."},
  {t:"2. Mesurer l'étendue",txt:"Une personne touchée : le problème vient souvent de son poste. Tout un plateau : le réseau. Tout le centre : un serveur ou un service. Cette seule question vous fait gagner un temps énorme."},
  {t:"3. Chercher le code et la fiche",txt:"Un code d'erreur (0x…, SIP 503, 32767…) vous donne la cause presque à coup sûr. Cherchez-le dans le Dictionnaire, ou collez une capture dans le Diagnostic.",ill:{k:"keys",v:["Win","Maj","S"],cap:"Capture d'écran d'une zone"}},
  {t:"4. Réparer du plus simple au plus lourd",txt:"Commencez par ce qui est rapide et sans risque (rebrancher, se reconnecter, vider un cache), puis allez vers le plus lourd (redémarrer, réinstaller). Une étape à la fois, en vérifiant après chacune."},
  {t:"5. Vérifier, noter, escalader",txt:"Faites tester par la personne. Notez l'incident dans le journal. Si rien ne marche ou si plusieurs personnes sont touchées, escaladez avec l'heure, le message et ce que vous avez déjà essayé."}],
  qs:[{type:"qcm",q:"Tout le plateau n'a plus internet en même temps. Que concluez-vous d'abord ?",o:["C'est probablement le réseau, pas les postes","Chaque PC a un virus","Il faut réinstaller Windows partout"],a:0,x:"Quand plusieurs personnes sont touchées en même temps, la cause est commune : réseau, serveur ou service."},
   {type:"qcm",q:"Quelle information est la plus utile à noter dès le début ?",o:["L'heure exacte et le message d'erreur mot pour mot","La couleur du fond d'écran","Le nombre de fenêtres ouvertes"],a:0,x:"L'heure et le message permettent de retrouver la cause dans les journaux et dans le Dictionnaire."},
   {type:"order",q:"Remettez la méthode dans l'ordre",items:["Écouter et faire préciser","Mesurer l'étendue","Chercher le code et la fiche","Réparer du plus simple au plus lourd","Vérifier, noter, escalader"],x:"Toujours dans cet ordre : on comprend avant d'agir."}]},
 nodes:[{t:"lesson"},{t:"form",f:"G-05"},{t:"match",set:"keys"},{t:"form",f:"G-09"},{t:"mission",m:"m1"}]},

{id:"u2",t:"Windows & poste de travail",d:"Programmes figés, lenteurs, écrans bleus, disque plein, mises à jour.",col:["#1864ab","#4dabf7"],ph:"rdv",
 lesson:{cards:[
  {t:"Votre boîte à outils Windows",txt:"Trois raccourcis suffisent pour dépanner 80 % des problèmes de poste : le Gestionnaire des tâches, la fenêtre Exécuter et les Paramètres.",ill:{k:"keys",v:["Ctrl","Maj","Échap"],cap:"Gestionnaire des tâches"}},
  {t:"Le Gestionnaire des tâches",txt:"Il montre ce qui tourne et ce qui consomme. Triez par Processeur ou Mémoire, sélectionnez un programme bloqué, puis « Fin de tâche ».",ill:{k:"taskmgr",mode:"hang"}},
  {t:"La fenêtre Exécuter",txt:"Windows + R ouvre une petite fenêtre où l'on tape le nom d'un outil : services.msc, devmgmt.msc, appwiz.cpl, %temp%…",ill:{k:"run",v:"services.msc"}},
  {t:"Redémarrer, vraiment",txt:"« Arrêter » garde une partie de la mémoire avec le démarrage rapide. Pour repartir de zéro, choisissez « Redémarrer »."}],
  qs:[{type:"qcm",q:"Quel raccourci ouvre directement le Gestionnaire des tâches ?",o:["Ctrl + Maj + Échap","Alt + F4","Windows + D"],a:0,x:"Ctrl + Maj + Échap ouvre directement le Gestionnaire des tâches."},
   {type:"qcm",q:"Pour repartir de zéro, il vaut mieux…",o:["Redémarrer","Arrêter puis rallumer","Fermer le capot"],a:0,x:"« Redémarrer » vide vraiment la mémoire ; « Arrêter » peut garder un état avec le démarrage rapide."}]},
 nodes:[{t:"lesson"},{t:"form",f:"W-02"},{t:"codes",tools:["bsod","wu","win"]},{t:"form",f:"W-01"},{t:"cmd",set:"win"},{t:"steps",doms:["win","hw"]},{t:"mission",m:"m2"}]},

{id:"u3",t:"Réseau & Internet",d:"Adresse IP, DNS, Wi-Fi, VPN, lecteurs réseau et imprimantes.",col:["#5f3dc4","#9775fa"],ph:"plateau",
 lesson:{cards:[
  {t:"Une adresse pour chaque PC",txt:"Chaque poste reçoit automatiquement une adresse IP du réseau. Une adresse qui commence par 169.254 veut dire : « je n'ai rien reçu ». Le PC est isolé.",ill:{k:"term",v:["ipconfig","   Adresse IPv4. . . . . . : 169.254.12.40   ← problème"]}},
  {t:"Le DNS, l'annuaire d'internet",txt:"Le DNS traduit un nom de site en adresse. Quand il garde une vieille réponse, un site ne s'ouvre plus : on vide le cache avec ipconfig /flushdns."},
  {t:"Câble, Wi-Fi, VPN",txt:"Au bureau, le câble est plus stable. En télétravail, le VPN relie le PC à l'entreprise : sans internet ou avec une heure fausse, il échoue."},
  {t:"L'imprimante bloquée",txt:"Un document en erreur bloque toute la file. On annule tout, puis on redémarre le spouleur d'impression."}],
  qs:[{type:"qcm",q:"Le PC affiche l'adresse 169.254.10.3. Cela signifie…",o:["Le PC n'a pas reçu d'adresse du réseau","Tout fonctionne normalement","Le PC a un virus"],a:0,x:"169.254 = adresse automatique de secours : rien n'a été reçu du réseau (câble, port, DHCP)."},
   {type:"type",q:"Tapez la commande qui vide le cache DNS",a:["ipconfig /flushdns"],x:"ipconfig /flushdns efface les vieilles réponses DNS."}]},
 nodes:[{t:"lesson"},{t:"form",f:"N-01"},{t:"codes",tools:["net","http"]},{t:"cmd",set:"net"},{t:"form",f:"I-01"},{t:"steps",doms:["net","print","web"]},{t:"mission",m:"m3"}]},

{id:"u4",t:"Outlook & Teams",d:"Mails bloqués, mots de passe, réunions sans son, caméras, statuts.",col:["#4b4fb5","#3fa0ff"],ph:"casque",
 lesson:{cards:[
  {t:"Outlook : lire la barre du bas",txt:"« Travail hors connexion », « Besoin d'un mot de passe », « Déconnecté » : la barre en bas d'Outlook dit presque toujours ce qui ne va pas.",ill:{k:"outlook",focus:"offline"}},
  {t:"Le mode sans échec d'Outlook",txt:"Si Outlook ne s'ouvre pas, lancez outlook.exe /safe : s'il s'ouvre ainsi, un complément est en cause.",ill:{k:"run",v:"outlook.exe /safe"}},
  {t:"Teams : le bon casque",txt:"La plupart des problèmes de son viennent d'un mauvais périphérique choisi. Paramètres de l'appareil : même casque pour le haut-parleur et le micro.",ill:{k:"teams",focus:"devices"}},
  {t:"Le webmail, votre témoin",txt:"Si le webmail fonctionne, le compte va bien : c'est Outlook sur le PC qui est en cause. S'il échoue aussi, c'est le compte ou le service."}],
  qs:[{type:"qcm",q:"Outlook ne démarre plus. Quel test fait en premier ?",o:["Lancer outlook.exe /safe","Réinstaller Windows","Supprimer la boîte aux lettres"],a:0,x:"Le mode sans échec montre si un complément bloque Outlook."},
   {type:"qcm",q:"En réunion Teams, personne ne vous entend. Premier réflexe ?",o:["Vérifier que le micro n'est pas coupé","Redémarrer le PC","Changer de navigateur"],a:0,x:"Le micro coupé (dans Teams ou sur le casque) est la cause numéro 1."}]},
 nodes:[{t:"lesson"},{t:"form",f:"O-01"},{t:"codes",tools:["office"]},{t:"form",f:"T-01"},{t:"steps",doms:["outlook","teams","office"]},{t:"mission",m:"m4"}]},

{id:"u5",t:"Microsoft Engage (CRM)",d:"Fiches clients, erreurs, droits, doublons et lien avec la téléphonie.",col:["#1c3d8f","#4c7dff"],ph:"duo",
 lesson:{cards:[
  {t:"Le CRM, la mémoire du client",txt:"Microsoft Engage garde l'historique de chaque client. Quand il bloque, l'agent perd le fil de l'appel : il faut aller vite et bien noter."},
  {t:"Lire une erreur Engage",txt:"Les erreurs ont souvent un code en 0x8004… et un bouton « Télécharger le fichier journal ». Ce fichier est précieux pour l'administrateur.",ill:{k:"engage",focus:"error"}},
  {t:"Les champs obligatoires",txt:"Un astérisque rouge * signale un champ obligatoire. Le bandeau en haut du formulaire liste ce qu'il manque.",ill:{k:"engage",focus:"required"}},
  {t:"Les doublons",txt:"Toujours rechercher le client (par téléphone puis par nom) avant de créer une fiche. Si un doublon existe, on utilise la fiche existante ou on fusionne.",ill:{k:"engage",focus:"dup"}}],
  qs:[{type:"qcm",q:"Le code 0x80040220 apparaît. Qu'est-ce que cela signifie ?",o:["Droits insuffisants dans le CRM","Pas d'internet","Imprimante hors ligne"],a:0,x:"0x80040220 : votre rôle ne permet pas l'action. L'administrateur CRM doit ajuster les droits."},
   {type:"qcm",q:"Avant de créer une fiche client, vous…",o:["Recherchez le client par téléphone puis par nom","Créez directement la fiche","Demandez au client de rappeler"],a:0,x:"La recherche préalable évite les doublons."}]},
 nodes:[{t:"lesson"},{t:"form",f:"E-02"},{t:"codes",tools:["crm"]},{t:"form",f:"E-04"},{t:"steps",doms:["crm"]},{t:"mission",m:"m5"}]},

{id:"u6",t:"Cisco — poste de l'agent",d:"Finesse, états Prêt / Non prêt, téléphone IP, casque, codes de raison.",col:["#0b7285","#15aabf"],ph:"telip",
 lesson:{cards:[
  {t:"Finesse, le bureau de l'agent",txt:"L'agent se met Prêt pour recevoir des appels, Non prêt pour une pause. Le téléphone doit être enregistré, sinon Finesse refuse l'état Prêt.",ill:{k:"finesse"}},
  {t:"Le téléphone IP",txt:"« Enregistrement… » à l'écran : le téléphone ne trouve pas le serveur. On compare avec le voisin, on change le câble et la prise.",ill:{k:"phone"}},
  {t:"Les codes de raison",txt:"Quand le système change l'état d'un agent, il laisse un code : 32767 = appel non répondu, 50010 = plusieurs appels manqués, 50003 = téléphone hors service."},
  {t:"Un agent ou plusieurs ?",txt:"Un seul agent bloqué : son poste. Plusieurs en même temps : prévenez l'administrateur, c'est le serveur ou le réseau."}],
  qs:[{type:"qcm",q:"Le téléphone affiche « Enregistrement… ». Première action ?",o:["Comparer avec le poste voisin","Redémarrer le serveur CUCM","Changer de casque"],a:0,x:"Si le voisin fonctionne, le problème est local : câble, prise, port."},
   {type:"qcm",q:"Le code de raison 32767 signifie…",o:["Appel non répondu, redirigé vers un autre agent","Pause déjeuner","Téléphone neuf"],a:0,x:"32767 (RONA) : l'appel a sonné sans réponse et l'agent est passé en Non prêt."}]},
 nodes:[{t:"lesson"},{t:"form",f:"AG-01"},{t:"match",set:"rc"},{t:"form",f:"AG-03"},{t:"steps",doms:["cisco"]},{t:"mission",m:"m6"}]},

{id:"u7",t:"Cisco — niveau expert",d:"Codes SIP, audio à sens unique, coupures, trunk opérateur, serveurs.",col:["#0b4f91","#15aabf"],ph:"poste",
 lesson:{cards:[
  {t:"Les codes SIP",txt:"Chaque appel échange des messages SIP. Les codes 4xx viennent souvent du numéro ou du destinataire, les 5xx d'un serveur ou de l'opérateur."},
  {t:"Le chronomètre, votre allié",txt:"Un appel coupé toujours vers 32 secondes signale un message perdu (ACK). À 15 ou 30 minutes : une temporisation ou un pare-feu."},
  {t:"Audio à sens unique",txt:"Si un seul des deux entend l'autre, la signalisation passe mais pas le son : pare-feu, NAT ou route manquante."},
  {t:"Les certificats",txt:"Des déconnexions générales du jour au lendemain viennent très souvent d'un certificat expiré.",ill:{k:"term",admin:true,v:["show cert list own"]}}],
  qs:[{type:"qcm",q:"Les clients entendent « occupé » et SIP 503 apparaît. Cause probable ?",o:["Trunk opérateur saturé ou hors service","Casque débranché","Mot de passe expiré"],a:0,x:"503 = service indisponible : canaux saturés ou trunk tombé."},
   {type:"type",q:"Tapez la commande qui liste les appels actifs sur la passerelle",a:["show call active voice brief"],x:"show call active voice brief montre les appels en cours et leur état."}]},
 nodes:[{t:"lesson"},{t:"form",f:"AU-04"},{t:"match",set:"sip"},{t:"codes",tools:["sip","cph"]},{t:"form",f:"OP-01"},{t:"cmd",set:"cisco"},{t:"mission",m:"m7"}]},

{id:"u8",t:"Sécurité",d:"E-mails piégés, virus, rançongiciels : les bons réflexes.",col:["#a61e4d","#ff6b6b"],ph:"materiel",
 lesson:{cards:[
  {t:"L'e-mail piégé",txt:"Urgence, demande de mot de passe ou de paiement, expéditeur bizarre, lien inattendu : ce sont les signes de l'hameçonnage. On ne clique pas, on signale."},
  {t:"Le rançongiciel",txt:"Message de rançon ou fichiers illisibles : on débranche le PC du réseau immédiatement, on ne l'éteint pas, et on appelle la sécurité."},
  {t:"Jamais de mot de passe",txt:"Le support ne vous demandera jamais votre mot de passe, ni par téléphone ni par e-mail."}],
  qs:[{type:"qcm",q:"Un message de rançon s'affiche. Première action ?",o:["Débrancher le PC du réseau","Payer la rançon","Éteindre et rallumer"],a:0,x:"Isoler le poste évite que d'autres machines soient touchées. On ne l'éteint pas : les traces aident les spécialistes."}]},
 nodes:[{t:"lesson"},{t:"form",f:"S-03"},{t:"form",f:"S-02"},{t:"steps",doms:["sec","acc"]},{t:"mission",m:"m8"}]}
];

const CMDX={
 win:[{q:"Ouvrir la liste des services Windows (Win + R)",a:["services.msc"]},{q:"Ouvrir le Gestionnaire de périphériques (Win + R)",a:["devmgmt.msc"]},{q:"Ouvrir la liste des programmes installés (Win + R)",a:["appwiz.cpl"]},{q:"Ouvrir le dossier des fichiers temporaires (Win + R)",a:["%temp%"]},{q:"Vérifier et réparer les fichiers système",a:["sfc /scannow"]},{q:"Lancer le test de la mémoire (Win + R)",a:["mdsched.exe","mdsched"]}],
 net:[{q:"Afficher l'adresse IP du PC",a:["ipconfig"]},{q:"Redemander une adresse IP au réseau",a:["ipconfig /renew"]},{q:"Vider le cache DNS",a:["ipconfig /flushdns"]},{q:"Tester si l'adresse 8.8.8.8 répond",a:["ping 8.8.8.8"]},{q:"Appliquer les règles de l'entreprise",a:["gpupdate /force"]},{q:"Resynchroniser l'heure du PC",a:["w32tm /resync"]}],
 cisco:[{q:"Passerelle : lister les appels actifs",a:["show call active voice brief"]},{q:"Passerelle : lister les appels SIP",a:["show sip-ua calls"]},{q:"CUCM : voir l'état de la réplication",a:["utils dbreplication runtimestate"]},{q:"CUCM : lister les services",a:["utils service list"]},{q:"Switch : voir l'alimentation PoE des ports",a:["show power inline"]}]
};

const MISSIONS={
 m1:{t:"« Mon ordinateur ne marche pas »",who:"marc",brief:"Marc, à la comptabilité, vous appelle paniqué : « Mon ordinateur ne marche pas ! » C'est tout ce qu'il dit.",
  steps:[{say:"Mon ordinateur ne marche pas, il faut venir tout de suite !",q:"Que lui répondez-vous ?",c:[["Qu'est-ce qui s'affiche à l'écran, exactement ?",1,"Parfait : on fait préciser avant d'agir."],["Redémarrez-le, ça va passer.",0,"Trop tôt : sans savoir ce qui se passe, on risque de perdre son travail et l'indice."],["Je préviens le support de niveau 2.",0,"On n'escalade pas un problème qu'on n'a pas encore compris."]]},
   {say:"Excel est tout blanc et le titre dit « Ne répond pas ».",q:"Que demandez-vous ensuite ?",c:[["Depuis quand ? Avez-vous un fichier non enregistré ?",1,"Bien vu : on protège son travail avant de forcer quoi que ce soit."],["Avez-vous un antivirus ?",0,"Pas le sujet ici : c'est un programme figé."],["Quelle est la marque du PC ?",0,"Cela n'aide pas à débloquer Excel."]]},
   {say:"Ça fait 1 minute. J'ai enregistré il y a 10 minutes.",q:"Votre action ?",c:[["Patienter 30 s, puis Fin de tâche sur Excel dans le Gestionnaire des tâches",1,"Exactement la méthode de la fiche W-02."],["Débrancher le PC",0,"Beaucoup trop brutal : tout le reste serait perdu."],["Désinstaller Excel",0,"Inutile : il suffit de fermer le programme figé."]]},
   {say:"Excel s'est rouvert et a récupéré mon fichier, merci !",q:"Pour finir ?",c:[["Noter l'incident dans le journal",1,"Le journal permet de repérer si le problème revient."],["Ne rien faire, c'est réglé",0,"Sans trace, impossible de voir si Excel se fige souvent."],["Lui dire de ne plus utiliser Excel",0,"Ce n'est pas une solution."]]}],
  end:"Mission réussie : vous avez fait préciser, protégé le travail de Marc et appliqué la bonne fiche."},
 m2:{t:"PC trop lent avant une réunion",who:"awa",brief:"Awa doit présenter en réunion dans 15 minutes. Son PC est devenu très lent ce matin.",
  steps:[{say:"Tout rame, la souris saccade, je dois présenter dans 15 minutes !",q:"Premier geste ?",c:[["Ouvrir le Gestionnaire des tâches et trier par Processeur",1,"On voit tout de suite ce qui consomme."],["Lancer une défragmentation du disque",0,"Bien trop long, et rarement la cause."],["Réinstaller Windows",0,"Disproportionné et impossible en 15 minutes."]]},
   {say:"Il y a « Logiciel de mise à jour » à 78 % de processeur.",q:"Que faites-vous ?",c:[["Le laisser finir s'il s'agit d'une mise à jour Windows, sinon Fin de tâche si ce n'est pas un outil de l'entreprise",1,"Prudent : on ne coupe pas une mise à jour Windows en cours, mais un logiciel inutile, oui."],["Supprimer le dossier Windows",0,"Surtout pas !"],["Débrancher le chargeur",0,"Cela n'a aucun effet sur le processeur."]]},
   {say:"C'est mieux. Mais il y a plein de programmes au démarrage.",q:"Pour éviter que ça revienne ?",c:[["Désactiver les applications inutiles au démarrage",1,"Moins de programmes au démarrage = PC plus rapide."],["Désactiver l'antivirus au démarrage",0,"Jamais : l'antivirus protège le PC."],["Rien, c'est normal",0,"On peut améliorer facilement la situation."]]},
   {say:"Et le disque C: est rouge dans l'Explorateur.",q:"Que proposez-vous après la réunion ?",c:[["Nettoyage de disque et vider %temp%",1,"La fiche W-06 libère de l'espace sans risque."],["Supprimer ses documents",0,"On ne supprime jamais les documents de quelqu'un."],["Acheter un nouveau PC",0,"Un nettoyage suffit souvent."]]}],
  end:"Mission réussie : Awa présente à l'heure et son PC repart sur de bonnes bases."},
 m3:{t:"Plus d'internet sur le plateau",who:"koffi",brief:"Koffi, superviseur, signale qu'un agent n'a plus internet ni accès au CRM.",
  steps:[{say:"Serge n'a plus rien : pas d'internet, pas de CRM.",q:"Votre première question ?",c:[["Les autres agents sont-ils touchés ?",1,"La question qui oriente tout : un poste ou tout le réseau ?"],["Serge a-t-il changé son mot de passe ?",0,"Cela n'explique pas la perte d'internet."],["Quelle version de Windows ?",0,"Pas prioritaire."]]},
   {say:"Non, seulement Serge. Ses voisins vont bien.",q:"Que vérifiez-vous ?",c:[["Le câble réseau et les voyants du port",1,"Un poste isolé : on commence par le physique."],["Le serveur DNS de l'entreprise",0,"Les voisins vont bien : le serveur fonctionne."],["Le trunk opérateur",0,"Rien à voir avec internet sur un seul poste."]]},
   {say:"Le câble semble branché. ipconfig affiche 169.254.12.40.",q:"Qu'en déduisez-vous ?",c:[["Le PC ne reçoit pas d'adresse : câble, prise ou port du switch",1,"169.254 = aucune adresse reçue."],["Tout est normal",0,"169.254 n'est jamais normal sur un réseau d'entreprise."],["Le PC a un virus",0,"Rien ne l'indique."]]},
   {say:"J'ai changé de câble et de prise. Que faire maintenant ?",q:"Commande suivante ?",c:[["ipconfig /renew",1,"On redemande une adresse au réseau."],["sfc /scannow",0,"Utile pour les fichiers système, pas pour le réseau."],["shutdown /s",0,"Éteindre ne règle rien."]]}],
  end:"Mission réussie : Serge a une adresse et retrouve internet et le CRM."},
 m4:{t:"Réunion Teams sans son",who:"fatou",brief:"Fatou anime une réunion d'équipe sur Teams : personne ne l'entend.",
  steps:[{say:"Ils me disent tous qu'ils ne m'entendent pas !",q:"Premier réflexe ?",c:[["Vérifier que le micro n'est pas barré dans la barre de réunion",1,"Cause numéro 1, et ça se règle en une seconde."],["Quitter Teams et le désinstaller",0,"Beaucoup trop lourd."],["Redémarrer la box",0,"Le son des autres arrive : la connexion fonctionne."]]},
   {say:"Le micro n'est pas barré. Mais j'ai branché mon casque après le début.",q:"Que faites-vous ?",c:[["Paramètres de l'appareil : choisir le casque pour le micro et le haut-parleur",1,"Teams a gardé l'ancien périphérique."],["Parler plus fort",0,"Le micro sélectionné n'est pas le bon."],["Changer de navigateur",0,"Ce n'est pas lié au navigateur."]]},
   {say:"Le casque est choisi, la barre du micro ne bouge pas quand je parle.",q:"Ensuite ?",c:[["Vérifier le bouton muet sur le fil du casque",1,"Beaucoup de casques ont un muet physique."],["Changer son mot de passe",0,"Aucun rapport."],["Vider le cache DNS",0,"Aucun rapport avec le micro."]]},
   {say:"Il était sur muet ! Tout le monde m'entend.",q:"Pour la prochaine fois ?",c:[["Brancher le casque avant d'ouvrir Teams et faire un appel de test",1,"Le bon réflexe avant une réunion importante."],["Ne plus utiliser de casque",0,"Le casque est indispensable au centre d'appels."],["Rien",0,"Un petit test évite le stress la prochaine fois."]]}],
  end:"Mission réussie : la réunion de Fatou reprend avec le son."},
 m5:{t:"Impossible d'enregistrer la fiche",who:"aicha",brief:"Aïcha est en ligne avec un client et Microsoft Engage refuse d'enregistrer la fiche.",
  steps:[{say:"J'appuie sur Enregistrer et il y a un bandeau rouge en haut !",q:"Que lui demandez-vous ?",c:[["Que dit le bandeau rouge ?",1,"Le bandeau liste précisément ce qui bloque."],["Fermez Engage et rouvrez-le",0,"Elle perdrait sa saisie."],["Rappelez le client plus tard",0,"On peut sûrement régler ça tout de suite."]]},
   {say:"« 1 champ obligatoire est vide : Téléphone ».",q:"Solution ?",c:[["Cliquer sur le lien du bandeau et remplir le téléphone",1,"Le lien amène directement au champ concerné."],["Appeler l'administrateur CRM",0,"Inutile : c'est une simple saisie manquante."],["Supprimer la fiche",0,"Surtout pas."]]},
   {say:"Enregistré ! Mais un autre message : « Doublons détectés ».",q:"Que conseillez-vous ?",c:[["Utiliser la fiche existante du client",1,"On évite de créer un doublon."],["Ignorer et enregistrer quand même",0,"Cela crée un doublon et éparpille l'historique."],["Créer une troisième fiche",0,"Encore pire."]]},
   {say:"Plus tard, une erreur 0x80040220 en voulant affecter le dossier.",q:"Que faites-vous ?",c:[["Télécharger le fichier journal et prévenir l'administrateur CRM : c'est un problème de droits",1,"0x80040220 = droits insuffisants : seul l'administrateur peut corriger."],["Réessayer 20 fois",0,"Les droits ne changeront pas tout seuls."],["Vider le cache DNS",0,"Ce n'est pas un problème réseau."]]}],
  end:"Mission réussie : la fiche est enregistrée sans doublon et le problème de droits est remonté."},
 m6:{t:"Agente bloquée en Non prêt",who:"aicha",brief:"Aïcha est bloquée en « Non prêt » depuis 10 minutes. Des clients attendent dans la file.",
  steps:[{say:"Je clique sur Prêt mais ça revient tout seul en Non prêt !",q:"Votre première vérification ?",c:[["Que voit-elle sur l'écran de son téléphone ?",1,"Un téléphone non enregistré empêche de passer Prêt."],["Redémarrer son PC tout de suite",0,"Trop tôt : on cherche d'abord la cause simple."],["Appeler le support Cisco",0,"On escalade après les vérifications de base."]]},
   {say:"Le téléphone affiche normalement mon numéro.",q:"Et ensuite ?",c:[["Vérifier qu'aucun appel n'est resté en attente sur la ligne",1,"Un appel fantôme bloque souvent l'état."],["Changer le câble du téléphone",0,"Le téléphone est enregistré : le câble va bien."],["Vider le cache du navigateur",0,"Pas encore : il y a plus simple."]]},
   {say:"Rien en attente… toujours bloquée.",q:"Que faites-vous ?",c:[["Se déconnecter de Finesse puis se reconnecter avec la bonne extension",1,"Cela resynchronise l'agent avec le serveur."],["Changer son mot de passe",0,"Aucun rapport avec l'état de l'agent."],["Attendre la fin de journée",0,"Des clients attendent !"]]},
   {say:"Ça marche ! Mais Paul, à côté, a le même souci.",q:"Votre réaction ?",c:[["Noter l'incident et prévenir l'administrateur : plusieurs agents = problème serveur",1,"Le bon réflexe : un problème collectif doit être signalé."],["Faire la même manipulation à tous sans rien dire",0,"Le problème reviendra sans que personne ne cherche la cause."],["Dire à Paul d'attendre",0,"Les clients attendent aussi."]]}],
  end:"Mission réussie : Aïcha est de nouveau Prête et le problème collectif est signalé."},
 m7:{t:"Les clients entendent « occupé »",who:"koffi",brief:"Koffi : « Les files sont vides, mais des clients nous disent qu'ils entendent occupé ! »",
  steps:[{say:"Plus aucun appel n'arrive depuis 10 h 05.",q:"Premier test ?",c:[["Appeler le centre depuis un portable externe",1,"On vit ce que vit le client."],["Redémarrer tous les PC",0,"Les PC ne reçoivent pas les appels de l'extérieur."],["Vider les caches des navigateurs",0,"Aucun rapport."]]},
   {say:"Depuis mon portable : tonalité d'occupation immédiate.",q:"Où regardez-vous ?",c:[["L'état du trunk SIP et de la passerelle",1,"L'entrée des appels passe par le trunk opérateur."],["Les certificats Finesse",0,"Finesse n'empêche pas les appels d'arriver."],["Les imprimantes",0,"Aucun rapport."]]},
   {say:"Les traces montrent « SIP 503 Service Unavailable ».",q:"Votre conclusion ?",c:[["Le trunk est saturé ou hors service : prévenir l'administrateur voix et l'opérateur en urgence",1,"503 = service indisponible côté voix."],["Un agent a mal tapé un numéro",0,"Cela ne bloquerait pas tous les appels entrants."],["Un client a raccroché",0,"Ce serait un 487, pas un 503."]]},
   {say:"L'opérateur confirme un incident. Que faites-vous pendant ce temps ?",q:"Action ?",c:[["Noter l'heure de début et prévenir les superviseurs",1,"Tout le monde est informé et l'incident est tracé."],["Couper la passerelle",0,"Cela empêcherait le retour du service."],["Ne rien dire",0,"Les équipes doivent savoir."]]}],
  end:"Mission réussie : l'incident opérateur est identifié et suivi."},
 m8:{t:"Un e-mail suspect",who:"paul",brief:"Paul reçoit un e-mail « urgent » lui demandant de confirmer son mot de passe.",
  steps:[{say:"Un mail du « support » me demande de cliquer pour garder mon compte actif.",q:"Votre conseil ?",c:[["Ne pas cliquer et vérifier l'adresse de l'expéditeur",1,"L'urgence et la demande d'identifiants sont des signaux d'alarme."],["Cliquer pour voir",0,"C'est exactement ce que veut l'escroc."],["Répondre pour demander si c'est vrai",0,"On ne répond jamais à un message suspect."]]},
   {say:"L'adresse est support@micr0soft-securite.co.",q:"Que faites-vous ?",c:[["Signaler le message avec le bouton Signaler",1,"Le signalement protège aussi les collègues."],["Le transférer à toute l'équipe",0,"On risque que quelqu'un clique."],["Le garder au cas où",0,"On le signale puis on le supprime."]]},
   {say:"Oups… j'avais déjà cliqué et tapé mon mot de passe.",q:"Action immédiate ?",c:[["Changer le mot de passe tout de suite et prévenir le support",1,"Plus c'est rapide, moins c'est grave. Ce n'est pas une faute."],["Ne rien dire par honte",0,"Le silence aide l'attaquant."],["Éteindre le PC",0,"Le problème, c'est le mot de passe volé."]]}],
  end:"Mission réussie : le compte de Paul est protégé et l'attaque signalée."}
};

const LEVELS=["Stagiaire","Dépanneur débutant","Dépanneur","Dépanneur confirmé","Technicien support","Expert support","Maître du dépannage"];
const BADGES=[
 {id:"first",t:"Premier pas",d:"Terminer une première étape",},
 {id:"mission1",t:"En mission",d:"Réussir une mission",},
 {id:"missions4",t:"Pompier du plateau",d:"Réussir 4 missions",},
 {id:"perfect",t:"Sans faute",d:"Terminer une étape sans erreur",},
 {id:"streak3",t:"Régulier",d:"3 jours d'affilée",},
 {id:"streak7",t:"Assidu",d:"7 jours d'affilée",},
 {id:"cisco",t:"Expert Cisco",d:"Terminer les deux parcours Cisco",},
 {id:"q100",t:"Encyclopédie",d:"100 bonnes réponses",},
 {id:"all",t:"Diplômé de l'Atelier",d:"Terminer tous les parcours",}
];
