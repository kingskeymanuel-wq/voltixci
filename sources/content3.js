/* =========================================================
   CONTENU v3 — domaines Teams / Outlook, nouvelles fiches
   ========================================================= */
(function(){
 const order=["cisco","crm","teams","outlook","office","win","net","print","web","acc","sec","hw"];
 const old=Object.assign({},DOM);
 old.teams={n:"Microsoft Teams",d:"Réunions, son, caméra, connexion, statut"};
 old.outlook={n:"Outlook",d:"Mails bloqués, recherche, boîte pleine, mot de passe"};
 old.office={n:"Word, Excel & Office",d:"Documents perdus, licence, réparation"};
 old.cisco={n:"Cisco centre d'appels",d:"Finesse, téléphones IP, files, audio, SIP"};
 old.crm={n:"Microsoft Engage (CRM)",d:"Fiches clients, erreurs, lien avec la téléphonie"};
 Object.keys(DOM).forEach(k=>delete DOM[k]);
 order.forEach(k=>{if(old[k])DOM[k]=old[k]});
 Object.keys(old).forEach(k=>{if(!DOM[k])DOM[k]=old[k]});
 const mv={"O-01":"outlook","O-02":"outlook","O-03":"teams"};
 P.forEach(p=>{if(mv[p.id])p.d=mv[p.id]});
 const o2=P.find(p=>p.id==="O-02");if(o2&&o2.st[0])o2.st[0].ill={k:"outlook",focus:"offline"};
})();

P.push(
/* ---------------- TEAMS ---------------- */
{id:"T-01",d:"teams",s:"maj",lvl:1,tm:"5 min",t:"Teams : on ne m'entend pas ou je n'entends personne en réunion",
 sym:["Les participants disent qu'ils ne vous entendent pas","Vous n'entendez rien alors que la réunion a commencé","Le son sort des haut-parleurs du PC au lieu du casque"],
 cau:["Micro coupé dans Teams ou sur le casque","Mauvais périphérique choisi dans Teams","Casque branché après le début de la réunion","Autorisation du micro bloquée dans Windows"],
 st:[{t:"Vérifier le bouton micro de la réunion",d:"Dans la barre de réunion, l'icône micro ne doit pas être barrée. Raccourci pour couper / réactiver : Ctrl + Maj + M.",ill:{k:"teams",focus:"mic"}},
 {t:"Vérifier le bouton muet du casque",d:"Beaucoup de casques ont un bouton muet sur le fil ou sur l'écouteur : un voyant rouge signale souvent le micro coupé."},
 {t:"Choisir le bon casque dans Teams",d:"Pendant la réunion : « Plus » (…) → Paramètres → Paramètres de l'appareil. Choisissez votre casque pour le haut-parleur ET le micro.",ill:{k:"teams",focus:"devices"}},
 {t:"Autoriser le micro dans Windows",d:"Paramètres → Confidentialité et sécurité → Microphone : « Accès au microphone » activé, et Teams autorisé.",ill:{k:"settings",v:["Confidentialité et sécurité","Microphone"],btn:"Accès au microphone : Activé"}},
 {t:"Faire un appel de test",d:"Teams → Paramètres → Appareils → « Passer un appel de test ». Vous entendez votre propre voix enregistrée si tout fonctionne."},
 {t:"Rejoindre à nouveau la réunion",d:"Quittez puis rejoignez la réunion après avoir branché le casque. Si rien ne change, voir la fiche du casque.",link:"W-10"}],
 pre:["Brancher le casque avant d'ouvrir Teams","Faire un appel de test avant une réunion importante"],esc:"Support informatique si l'appel de test échoue avec deux casques différents."},
{id:"T-02",d:"teams",s:"min",lvl:1,tm:"5 min",t:"Teams : la caméra est noire ou introuvable",
 sym:["Écran noir à la place de votre image","Message « Aucune caméra détectée »","La caméra s'allume puis s'éteint"],
 cau:["Cache physique devant la caméra ou touche caméra désactivée","Caméra utilisée par une autre application","Autorisation bloquée dans Windows","Pilote de caméra"],
 st:[{t:"Ouvrir le cache de la caméra",d:"Beaucoup de portables ont un volet coulissant ou une touche avec une caméra barrée (souvent F8 ou F10)."},
 {t:"Fermer les autres applications vidéo",d:"Une seule application peut utiliser la caméra à la fois : fermez Zoom, l'application Caméra ou un autre navigateur en visio."},
 {t:"Choisir la caméra dans Teams",d:"Réunion → « Plus » (…) → Paramètres de l'appareil → Caméra.",ill:{k:"teams",focus:"camera"}},
 {t:"Autoriser la caméra dans Windows",d:"Paramètres → Confidentialité et sécurité → Caméra : accès activé et Teams autorisé.",ill:{k:"settings",v:["Confidentialité et sécurité","Caméra"],btn:"Accès à la caméra : Activé"}},
 {t:"Réinstaller le pilote de la caméra",d:"Gestionnaire de périphériques → Caméras → clic droit → Désinstaller l'appareil → redémarrer.",link:"G-07"}],
 pre:[],esc:"Support si la caméra n'apparaît pas dans le Gestionnaire de périphériques."},
{id:"T-03",d:"teams",s:"min",lvl:1,tm:"5 min",t:"Teams : statut bloqué, messages ou notifications absents",
 sym:["Statut resté « Absent » ou « En réunion » alors que vous êtes là","Messages qui arrivent en retard","Aucune notification de nouveau message"],
 cau:["Teams en veille ou session expirée","Notifications coupées dans Teams ou Windows","Mode Concentration (Ne pas déranger) de Windows","Cache de Teams"],
 st:[{t:"Réinitialiser le statut",d:"Cliquez sur votre photo en haut à droite → statut → choisissez « Disponible ». Puis « Réinitialiser le statut ».",ill:{k:"teams",focus:"status"}},
 {t:"Vérifier les notifications de Teams",d:"Teams → Paramètres → Notifications et activité : choisissez « Bannière et flux » pour les conversations."},
 {t:"Désactiver Ne pas déranger dans Windows",d:"Cliquez sur la date en bas à droite : la cloche barrée doit être désactivée."},
 {t:"Quitter et relancer Teams",d:"Clic droit sur l'icône Teams en bas à droite → Quitter, puis relancez. Si le problème persiste, videz le cache (fiche O-03).",link:"O-03"}],
 pre:[],esc:"Support si plusieurs collègues ont le même problème en même temps."},

/* ---------------- OUTLOOK ---------------- */
{id:"OL-01",d:"outlook",s:"min",lvl:2,tm:"20 min",t:"Outlook : la recherche ne trouve plus les mails",
 sym:["« Aucun résultat » alors que le mail existe","Message « Les résultats de recherche peuvent être incomplets »","La recherche ne trouve que les mails récents"],
 cau:["Index de recherche de Windows incomplet ou abîmé","Seuls les mails récents sont gardés sur le PC (mode mis en cache)"],
 st:[{t:"Chercher dans tous les dossiers",d:"Dans la barre de recherche, choisissez la portée « Toutes les boîtes aux lettres » au lieu de « Dossier actif ».",ill:{k:"outlook",focus:"search"}},
 {t:"Vérifier l'état de l'indexation",d:"Cliquez dans la barre de recherche → Outils de recherche → État de l'indexation. « Outlook a fini d'indexer » est attendu."},
 {t:"Reconstruire l'index",d:"Touche Windows + R → control srchadmin.dll → Avancé → Reconstruire. Comptez de 30 minutes à quelques heures, PC allumé.",ill:{k:"run",v:"control srchadmin.dll"}},
 {t:"Utiliser le webmail en attendant",d:"La recherche du webmail fonctionne sur toute la boîte, même pendant la reconstruction."}],
 pre:["Laisser le PC allumé une nuit après une reconstruction"],esc:"Support si la recherche reste vide le lendemain."},
{id:"OL-02",d:"outlook",s:"maj",lvl:1,tm:"15 min",t:"Outlook : boîte aux lettres pleine",
 sym:["Message « Votre boîte aux lettres est pleine »","Impossible d'envoyer des mails","Barre de stockage rouge en bas d'Outlook"],
 cau:["Grosses pièces jointes accumulées","Dossier « Éléments supprimés » jamais vidé","Éléments envoyés volumineux"],
 st:[{t:"Voir l'espace utilisé",d:"Fichier → Informations → Paramètres de la boîte aux lettres : la jauge indique l'espace restant.",ill:{k:"outlook",focus:"storage"}},
 {t:"Trouver les gros mails",d:"Dans la recherche, tapez taille:énorme (ou size:huge) pour lister les mails de plus de 5 Mo."},
 {t:"Supprimer et vider la corbeille",d:"Supprimez les gros mails inutiles, puis clic droit sur « Éléments supprimés » → Vider le dossier. Faites de même pour « Courrier indésirable »."},
 {t:"Enregistrer les pièces jointes utiles",d:"Enregistrez-les sur OneDrive ou le réseau, puis supprimez le mail."},
 {t:"Demander une archive",d:"Si l'entreprise a l'archivage en ligne, le support peut l'activer : les anciens mails y sont déplacés automatiquement."}],
 pre:["Partager les fichiers par lien OneDrive plutôt qu'en pièce jointe"],esc:"Support pour l'archivage ou l'augmentation de taille."},
{id:"OL-03",d:"outlook",s:"maj",lvl:1,tm:"10 min",t:"Outlook demande le mot de passe en boucle",
 sym:["Fenêtre de connexion qui revient sans arrêt","« Besoin d'un mot de passe » en bas d'Outlook"],
 cau:["Mot de passe changé récemment","Ancien mot de passe enregistré dans Windows","Validation en deux étapes non faite"],
 st:[{t:"Cliquer sur « Besoin d'un mot de passe »",d:"En bas d'Outlook, cliquez sur le message et reconnectez-vous avec votre mot de passe actuel. Validez la notification sur votre téléphone si elle arrive."},
 {t:"Supprimer les anciens identifiants",d:"Touche Windows + R → control keymgr.dll → Informations d'identification Windows : supprimez les entrées « MicrosoftOffice » et « Outlook ». Redémarrez Outlook.",ill:{k:"run",v:"control keymgr.dll"}},
 {t:"Vérifier le compte Office",d:"Dans Outlook : Fichier → Compte Office → vous devez être connecté avec votre compte de l'entreprise."},
 {t:"Tester le webmail",d:"Si le webmail refuse aussi le mot de passe, c'est le compte qui est en cause.",link:"C-01"}],
 pre:["Après un changement de mot de passe, fermer et relancer Outlook et Teams"],esc:"Support informatique."},
{id:"OL-04",d:"outlook",s:"min",lvl:2,tm:"10 min",t:"Outlook : boîte ou calendrier partagé absent",
 sym:["La boîte de l'équipe n'apparaît plus à gauche","Impossible d'ouvrir le calendrier d'un collègue"],
 cau:["Droits pas encore appliqués (jusqu'à quelques heures)","Boîte ajoutée manuellement puis supprimée","Profil Outlook à rafraîchir"],
 st:[{t:"Attendre et redémarrer Outlook",d:"Après l'ajout de droits par le support, la boîte apparaît souvent seule après un redémarrage d'Outlook, parfois après quelques heures."},
 {t:"Ajouter la boîte à la main",d:"Clic droit sur votre nom de boîte à gauche → « Ajouter un dossier partagé ou une boîte aux lettres » → tapez le nom de la boîte.",ill:{k:"outlook",focus:"shared"}},
 {t:"Ouvrir un calendrier partagé",d:"Calendrier → Ajouter un calendrier → À partir du carnet d'adresses → choisissez le collègue."},
 {t:"Tester dans le webmail",d:"Si la boîte n'est pas non plus accessible dans le webmail, vos droits sont à demander."}],
 pre:[],esc:"Support pour les droits sur la boîte partagée."},

/* ---------------- MICROSOFT ENGAGE ---------------- */
{id:"E-04",d:"crm",s:"maj",lvl:1,tm:"5 min",t:"Engage : impossible d'enregistrer la fiche ou le dossier",
 sym:["Bandeau rouge en haut du formulaire","Le bouton Enregistrer ne fait rien","Message « Champ obligatoire » ou erreur 0x80040265"],
 cau:["Champ obligatoire vide (signalé par un astérisque rouge)","Format incorrect (téléphone, e-mail, date)","Règle de gestion de l'entreprise","Fiche modifiée en même temps par un collègue"],
 st:[{t:"Lire le bandeau en haut du formulaire",d:"Il liste les champs à corriger. Cliquez sur chaque lien du bandeau : il vous amène au champ concerné.",ill:{k:"engage",focus:"error"}},
 {t:"Remplir les champs obligatoires",d:"Les champs marqués d'un astérisque rouge * doivent être remplis.",ill:{k:"engage",focus:"required"}},
 {t:"Vérifier les formats",d:"Téléphone sans espace ni lettre, e-mail avec @, date au bon format."},
 {t:"Actualiser si un collègue a modifié la fiche",d:"Message de conflit : copiez votre texte (Ctrl + C), actualisez la fiche (F5), puis recollez et enregistrez."},
 {t:"Code d'erreur affiché",d:"Cherchez le code dans le Dictionnaire des erreurs et suivez la fiche E-02.",link:"E-02"}],
 pre:[],esc:"Administrateur CRM si une règle vous bloque à tort."},
{id:"E-05",d:"crm",s:"min",lvl:2,tm:"10 min",t:"Engage : fiche client en double",
 sym:["Deux fiches pour le même client","Fenêtre « Doublons détectés » à l'enregistrement","L'historique est réparti sur deux fiches"],
 cau:["Client créé sans recherche préalable","Variante d'orthographe du nom ou numéro différent"],
 st:[{t:"Toujours rechercher avant de créer",d:"Cherchez par numéro de téléphone, puis par nom, avant de créer une fiche."},
 {t:"Fenêtre « Doublons détectés »",d:"Si elle s'affiche, choisissez la fiche existante plutôt que « Ignorer et enregistrer ».",ill:{k:"engage",focus:"dup"}},
 {t:"Fusionner les deux fiches",d:"Dans la liste, cochez les deux fiches → bouton « Fusionner ». Choisissez la fiche principale (la plus complète) et les champs à garder. Selon vos droits, cette action peut être réservée au superviseur."},
 {t:"Si vous ne pouvez pas fusionner",d:"Notez les deux noms et numéros dans le journal et prévenez votre superviseur."}],
 pre:["Rechercher par téléphone en début d'appel"],esc:"Superviseur ou administrateur CRM."},
{id:"E-06",d:"crm",s:"maj",lvl:1,tm:"10 min",t:"Engage : je ne vois plus mes dossiers ou ma file de travail",
 sym:["Vue vide alors que des dossiers vous sont affectés","Les nouveaux dossiers n'arrivent plus","Un tableau de bord affiche des chiffres faux"],
 cau:["Mauvaise vue sélectionnée","Filtre appliqué sur la liste","Droits ou équipe modifiés","Données pas encore actualisées"],
 st:[{t:"Choisir la bonne vue",d:"Cliquez sur le nom de la vue en haut de la liste (flèche ▾) et choisissez « Mes dossiers actifs » ou la vue de votre équipe.",ill:{k:"engage",focus:"view"}},
 {t:"Retirer les filtres",d:"Bouton « Modifier les filtres » ou l'entonnoir sur une colonne : effacez les filtres."},
 {t:"Actualiser",d:"Bouton « Actualiser » de la liste, ou F5."},
 {t:"Comparer avec un collègue",d:"Si un collègue de la même équipe voit les dossiers, ce sont vos droits ou votre équipe à vérifier."}],
 pre:[],esc:"Administrateur CRM avec le nom de la vue et ce que vous attendiez."},

/* ---------------- CISCO ---------------- */
{id:"AG-06",d:"cisco",s:"maj",lvl:1,tm:"5 min",t:"Le transfert ou la conférence échoue",
 sym:["L'appel est perdu pendant le transfert","Le client revient sur vous après le transfert","Message « Transfert impossible » ou occupé"],
 cau:["Transfert fait avant que le collègue décroche (transfert aveugle mal utilisé)","Numéro de transfert incorrect","Destinataire non disponible","Règles de numérotation"],
 st:[{t:"Utiliser le transfert accompagné",d:"Dans Finesse : « Consulter », composez le numéro, attendez que le collègue décroche, présentez l'appel, puis « Transférer ».",ill:{k:"finesse",state:"consult"}},
 {t:"Vérifier le numéro",d:"Utilisez l'annuaire ou les numéros de transfert validés par l'équipe."},
 {t:"Si le destinataire ne répond pas",d:"Revenez sur le client avec « Reprendre », proposez de patienter ou un rappel."},
 {t:"Plusieurs agents touchés",d:"Notez l'heure et le numéro de destination dans le journal : l'administrateur vérifiera les règles."}],
 pre:["Toujours annoncer l'appel au collègue avant de transférer"],esc:"Administrateur centre de contacts."},

/* ---------------- POSTE DE TRAVAIL ---------------- */
{id:"W-13",d:"win",s:"maj",lvl:1,tm:"10 min",t:"Fichier supprimé par erreur ou introuvable",
 sym:["Un fichier a disparu","Fichier supprimé par erreur","Fichier écrasé par une autre version"],
 cau:["Suppression vers la Corbeille","Fichier déplacé dans un autre dossier","Synchronisation OneDrive"],
 st:[{t:"Regarder dans la Corbeille",d:"Double-cliquez sur la Corbeille du bureau → clic droit sur le fichier → Restaurer."},
 {t:"Rechercher le fichier",d:"Explorateur (Windows + E) → Ce PC → tapez le nom dans la recherche en haut à droite.",ill:{k:"keys",v:["Win","E"]}},
 {t:"Corbeille de OneDrive ou SharePoint",d:"Fichiers supprimés depuis OneDrive : site OneDrive → Corbeille (gardée 93 jours)."},
 {t:"Versions précédentes",d:"Clic droit sur le dossier qui contenait le fichier → Propriétés → onglet Versions précédentes."},
 {t:"Lecteur réseau",d:"Le support peut souvent restaurer depuis la sauvegarde : donnez le chemin exact et la date."}],
 pre:["Enregistrer les documents de travail sur OneDrive ou le réseau"],esc:"Support informatique pour une restauration de sauvegarde."},
{id:"N-06",d:"net",s:"min",lvl:1,tm:"10 min",t:"Internet est lent",
 sym:["Pages qui chargent lentement","Visio qui saccade","Téléchargements lents"],
 cau:["Wi-Fi faible","Beaucoup d'onglets ou de téléchargements","Réseau saturé","VPN"],
 st:[{t:"Passer en câble si possible",d:"Le câble est plus stable que le Wi-Fi."},
 {t:"Fermer les onglets et téléchargements inutiles",d:"Mises à jour, synchronisation OneDrive, vidéos en arrière-plan."},
 {t:"Mesurer le signal Wi-Fi",d:"Le signal doit être au-dessus de 60 %.",cmd:"netsh wlan show interfaces"},
 {t:"Tester la latence",d:"Des temps au-dessus de 100 ms ou des pertes indiquent un réseau instable.",cmd:"ping 8.8.8.8 -n 20"},
 {t:"Comparer avec un collègue",d:"Si tout le plateau est lent, prévenez le support."}],
 pre:[],esc:"Support si tout le site est lent."}
);
