'use strict';
/* ==========================================================================
   गाँव बाज़ार (Village Bazaar) — version Inde, simplifiée
   Un seul fichier, aucune dépendance, pensé pour téléphones d'entrée de gamme.
   Hindi par défaut, anglais en option. Les réglages d'équilibrage sont dans
   la section « DONNÉES ». Les pubs sont SIMULÉES (voir `Ads`).
   ========================================================================== */
(() => {

/* ---------- utilitaires ---------- */
const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ==========================================================================
   TEXTES (hindi / anglais)
   ========================================================================== */
const I18N = {
  hi: {
    title: 'गाँव बाज़ार',
    wood: 'लकड़ी', stone: 'पत्थर', grain: 'अनाज', coins: 'सिक्के', people: 'निवासी',
    b_house: 'घर', b_farm: 'खेत', b_chai: 'चाय की दुकान', b_bazaar: 'बाज़ार', b_temple: 'मंदिर',
    d_house: '2 लोग यहाँ रहते हैं।',
    d_farm: 'अनाज उगाता है। काम करने वाला हो तो दोगुना।',
    d_chai: 'चाय बेचकर सिक्के कमाती है। काम करने वाला हो तो दोगुना।',
    d_bazaar: 'अनाज बेचकर सिक्के देता है (1 अनाज = 3 सिक्के)। काम करने वाला हो तो दोगुना।',
    d_temple: 'पूरे गाँव की कमाई +20%। (अधिकतम 3 मंदिर)',
    tab_build: 'बनाएँ', tab_gift: 'इनाम', tab_fest: 'त्योहार', tab_set: 'सेटिंग',
    build_title: '🔨 क्या बनाएँ?', built_n: 'बने: {0}', max_reached: 'पूरे हो गए', secs: '{0} सेकंड', mins: '{0} मिनट',
    close: 'बंद करें', cancel: 'रद्द करें',
    need_more: 'सामान कम है।', land_only: 'ज़मीन पर ही बनाएँ।', occupied: 'यह जगह भरी है।', tree_block: 'यहाँ पेड़ या पत्थर है।',
    place_hint: '{0} {1} रखने के लिए <b>हरी</b> जगह छुओ',
    site_started: '🚧 {0} का काम शुरू! ({1} सेकंड)', site_done: '{0} {1} तैयार!',
    site_title: '🚧 {0} बन रहा है', site_left: '{0} सेकंड बाकी', site_ad: '📺 विज्ञापन देखकर अभी पूरा करें', site_ad_reason: 'काम तुरंत पूरा करें।',
    house_people: 'यहाँ रहने वाले:', house_empty: 'अभी खाली है। जल्द कोई आएगा!',
    work_yes: '👷 {0} यहाँ काम करता है: कमाई ×2', work_no: 'अभी कोई काम करने वाला नहीं। नया निवासी आएगा तो कमाई ×2।',
    temple_info: 'मंदिरों से कुल कमाई +{0}%।',
    arrive: '🧑 {0} गाँव में आया!',
    lvl: 'स्तर {0}', up_btn: '⬆️ सुधारें → स्तर {0}', up_done: '⬆️ {0} अब स्तर {1} पर! कमाई बढ़ी।', lvl_max: '⭐ अधिकतम स्तर', lvl_info: 'हर स्तर पर कमाई +50%।',
    thief_toast: '🦹 चोर! जल्दी छुओ!', escaped0: '🦹 चोर भाग गया…', caught: '👮 चोर पकड़ा गया! +{0}🪙', caught_combo: '👮 शाबाश! ×{1} कॉम्बो · +{0}🪙', escaped: '🦹 चोर भाग गया… −{0}🪙',
    fest_title: '🎆 त्योहार', fest_desc: '30 सेकंड तक पूरे गाँव की कमाई दोगुनी!',
    fest_ready: 'तैयार!', fest_live: 'चालू', fest_start_free: '🎆 त्योहार शुरू करें', fest_start: '🎆 त्योहार शुरू! {0} सेकंड कमाई ×2',
    fest_ad: '📺 विज्ञापन देखकर अभी शुरू करें', fest_wait: 'अगला त्योहार {0} में।', fest_ad_reason: 'त्योहार अभी शुरू करें।',
    fest_running: 'त्योहार चालू है! {0} सेकंड बाकी।',
    daily_title: '🎁 रोज़ का इनाम', daily_day: 'दिन {0}', daily_claim: 'इनाम लें', daily_double: '📺 विज्ञापन देखकर ×2',
    daily_done: 'आज का इनाम ले लिया। कल फिर आना!', daily_got: '🎁 इनाम मिला: {0}', daily_reason: 'आज का इनाम दोगुना करें।',
    daily_streak: 'लगातार {0} दिन 🔥', daily_hint: 'रोज़ आओ, इनाम बढ़ता जाएगा। 7वें दिन बड़ा इनाम!',
    offline_title: '🌙 आपके पीछे गाँव चलता रहा', offline_body: '{0} में गाँव ने ये कमाया:', offline_take: 'ले लें', offline_double: '📺 विज्ञापन देखकर ×2',
    offline_reason: 'कमाई दोगुनी करें।',
    harvest_double: '📺 दोगुना: +{0}{1}', harvest_double_reason: 'अभी की कमाई दोगुनी करें।',
    ad_title: '📺 विज्ञापन (नकली)', ad_wait: 'इनाम {0} सेकंड में…', ad_ready: 'धन्यवाद! इनाम तैयार है।', ad_take: 'इनाम लें', ad_skip: 'बिना इनाम छोड़ें',
    ad_note: 'वैकल्पिक: विज्ञापन के बिना भी पूरा खेल खेल सकते हो।',
    set_title: '⚙️ सेटिंग', set_lang: 'भाषा', set_skin: '🐘 कोतवाल की सवारी', skin_on: 'चुनी हुई', skin_pick: 'छूकर चुनें',
    skin_note: 'और सवारियाँ और सजावट जल्द आ रही हैं। इनसे कमाई पर कोई असर नहीं पड़ता।',
    reset: 'नया खेल शुरू करें', reset_q: 'शुरू से खेलें?', reset_body: 'आपका गाँव मिट जाएगा।', reset_yes: 'हाँ, नया खेल',
    skin_horse: 'घोड़ा', skin_elephant: 'हाथी', skin_camel: 'ऊँट',
    intro_title: '🛖 गाँव बाज़ार में स्वागत है!',
    intro_1: '🌳 पेड़ और 🪨 पत्थर छुओ — लकड़ी और पत्थर मिलेंगे।',
    intro_2: '🔨 खेत, चाय की दुकान, बाज़ार और मंदिर बनाओ। सिक्के अपने आप आएँगे।',
    intro_3: '🦹 चोर दिखे तो जल्दी से छुओ — कोतवाल पकड़ लेगा!',
    intro_4: '🎁 रोज़ आओ, इनाम पाओ। गाँव आपके पीछे भी कमाता रहता है।',
    intro_go: 'शुरू करें!',
    h_start: 'पेड़ 🌳 और पत्थर 🪨 छुओ, फिर खेत 🌾 बनाओ।',
    h_chai: 'चाय की दुकान ☕ बनाओ — सिक्के कमाओ।',
    h_house: 'घर 🏠 बनाओ ताकि नए लोग आएँ।',
    h_bazaar: 'बाज़ार 🏪 बनाओ: अनाज बेचो, सिक्के कमाओ।',
    h_temple: 'मंदिर 🛕 बनाओ: पूरे गाँव की कमाई बढ़ती है।',
    h_idle: 'चोर 🦹 दिखे तो जल्दी छुओ! त्योहार 🎆 से कमाई दोगुनी।',
    h_thief: '🦹 चोर! जल्दी छुओ!',
    h_wood: 'लकड़ी कम है — पेड़ 🌳 छुओ।',
    h_buy: 'ऊपर 🪵 या 🪨 छुओ और सिक्कों से खरीदो।', ex_title: '🪙 सिक्के बदलें', ex_desc: 'सिक्कों से लकड़ी या पत्थर खरीदो।',
    snd: 'ध्वनि और कंपन', snd_on: 'चालू', snd_off: 'बंद',
    names: ['राम', 'सीता', 'मोहन', 'गीता', 'रवि', 'लक्ष्मी', 'अमित', 'पूजा', 'सुरेश', 'आरती', 'किशन', 'राधा', 'अजय', 'सुनीता', 'दीपक', 'मीना'],
  },
  fr: {
    title: 'Bazar du Village',
    wood: 'Bois', stone: 'Pierre', grain: 'Grain', coins: 'Pièces', people: 'Habitants',
    b_house: 'Maison', b_farm: 'Champ', b_chai: 'Échoppe à chaï', b_bazaar: 'Bazar', b_temple: 'Temple',
    d_house: 'Loge 2 habitants.',
    d_farm: 'Fait pousser du grain. Production doublée avec un ouvrier.',
    d_chai: 'Vend du chaï contre des pièces. Production doublée avec un ouvrier.',
    d_bazaar: 'Vend le grain contre des pièces (1 grain = 3 pièces). Production doublée avec un ouvrier.',
    d_temple: 'Revenus de tout le village +20 %. (3 temples maximum)',
    tab_build: 'Construire', tab_gift: 'Cadeau', tab_fest: 'Fête', tab_set: 'Réglages',
    build_title: '🔨 Que construire ?', built_n: 'Construits : {0}', max_reached: 'Maximum atteint', secs: '{0} s', mins: '{0} min',
    close: 'Fermer', cancel: 'Annuler',
    need_more: 'Pas assez de ressources.', land_only: 'Construis sur la terre ferme.', occupied: 'Cette case est occupée.', tree_block: 'Un arbre ou un rocher gêne.',
    place_hint: 'Touche une case <b>verte</b> pour poser : {0} {1}',
    site_started: '🚧 Chantier lancé : {0} ({1} s)', site_done: '{0} {1} terminé !',
    site_title: '🚧 {0} en construction', site_left: 'Encore {0} s', site_ad: '📺 Regarder une pub pour finir maintenant', site_ad_reason: 'Terminer le chantier tout de suite.',
    house_people: 'Habitants :', house_empty: 'Vide pour l\'instant. Quelqu\'un va bientôt arriver !',
    work_yes: '👷 {0} travaille ici : revenu ×2', work_no: 'Personne n\'y travaille. Un nouvel habitant doublera le revenu.',
    temple_info: 'Les temples donnent +{0} % de revenus.',
    arrive: '🧑 {0} arrive au village !',
    lvl: 'Niveau {0}', up_btn: '⬆️ Améliorer → niveau {0}', up_done: '⬆️ {0} passe au niveau {1} ! Revenu en hausse.', lvl_max: '⭐ Niveau maximum', lvl_info: 'Chaque niveau ajoute +50 % de revenu.',
    thief_toast: '🦹 Un voleur ! Touche-le vite !', escaped0: '🦹 Le voleur s\'est enfui…', caught: '👮 Voleur attrapé ! +{0}🪙', caught_combo: '👮 Bravo ! Combo ×{1} · +{0}🪙', escaped: '🦹 Le voleur s\'est enfui… −{0}🪙',
    fest_title: '🎆 Fête', fest_desc: 'Les revenus de tout le village sont doublés pendant 30 secondes !',
    fest_ready: 'Prête !', fest_live: 'En cours', fest_start_free: '🎆 Lancer la fête', fest_start: '🎆 C\'est la fête ! Revenus ×2 pendant {0} s',
    fest_ad: '📺 Regarder une pub pour lancer maintenant', fest_wait: 'Prochaine fête dans {0}.', fest_ad_reason: 'Lancer la fête tout de suite.',
    fest_running: 'La fête bat son plein ! Encore {0} s.',
    daily_title: '🎁 Cadeau du jour', daily_day: 'Jour {0}', daily_claim: 'Récupérer', daily_double: '📺 Regarder une pub pour ×2',
    daily_done: 'Cadeau du jour récupéré. Reviens demain !', daily_got: '🎁 Tu as reçu : {0}', daily_reason: 'Doubler le cadeau du jour.',
    daily_streak: '{0} jours de suite 🔥', daily_hint: 'Reviens chaque jour : les cadeaux grossissent. Gros lot le jour 7 !',
    offline_title: '🌙 Le village a travaillé sans toi', offline_body: 'En {0}, le village a gagné :', offline_take: 'Récupérer', offline_double: '📺 Regarder une pub pour ×2',
    offline_reason: 'Doubler les gains.',
    harvest_double: '📺 Doubler : +{0}{1}', harvest_double_reason: 'Doubler ce que tu viens de récolter.',
    ad_title: '📺 Pub (simulation)', ad_wait: 'Récompense dans {0} s…', ad_ready: 'Merci ! Ta récompense est prête.', ad_take: 'Prendre la récompense', ad_skip: 'Passer, sans récompense',
    ad_note: 'Facultatif : tout le jeu reste jouable sans pub.',
    set_title: '⚙️ Réglages', set_lang: 'Langue', set_skin: '🐘 Monture du Kotwal', skin_on: 'Équipée', skin_pick: 'Toucher pour choisir',
    skin_note: 'D\'autres montures et décors arrivent bientôt. Ils n\'ont aucun effet sur les revenus.',
    reset: 'Recommencer une partie', reset_q: 'Tout recommencer ?', reset_body: 'Ton village sera effacé.', reset_yes: 'Oui, nouvelle partie',
    skin_horse: 'Cheval', skin_elephant: 'Éléphant', skin_camel: 'Chameau',
    intro_title: '🛖 Bienvenue au Bazar du Village !',
    intro_1: '🌳 Touche les arbres et les 🪨 rochers pour récolter bois et pierre.',
    intro_2: '🔨 Construis champs, échoppes à chaï, bazars et temples. Les pièces rentrent toutes seules.',
    intro_3: '🦹 Un voleur ? Touche-le vite : le Kotwal l\'attrapera !',
    intro_4: '🎁 Reviens chaque jour pour un cadeau. Le village gagne aussi quand tu es parti.',
    intro_go: 'C\'est parti !',
    h_start: 'Touche les arbres 🌳 et les rochers 🪨, puis construis un champ 🌾.',
    h_chai: 'Construis une échoppe à chaï ☕ pour gagner des pièces.',
    h_house: 'Construis une maison 🏠 pour accueillir de nouveaux habitants.',
    h_bazaar: 'Construis un bazar 🏪 : vends ton grain contre des pièces.',
    h_temple: 'Construis un temple 🛕 : tout le village gagne plus.',
    h_idle: 'Touche vite les voleurs 🦹 ! Une fête 🎆 double tes revenus.',
    h_thief: '🦹 Un voleur ! Touche-le vite !',
    h_wood: 'Il manque du bois : touche les arbres 🌳.',
    h_buy: 'Touche 🪵 ou 🪨 en haut pour en acheter avec tes pièces.', ex_title: '🪙 Échanger des pièces', ex_desc: 'Achète du bois ou de la pierre avec tes pièces.',
    snd: 'Son et vibrations', snd_on: 'Activés', snd_off: 'Coupés',
    names: ['Ram', 'Sita', 'Mohan', 'Geeta', 'Ravi', 'Lakshmi', 'Amit', 'Pooja', 'Suresh', 'Aarti', 'Kishan', 'Radha', 'Ajay', 'Sunita', 'Deepak', 'Meena'],
  },
  ta: {
    title: 'கிராம சந்தை',
    wood: 'மரம்', stone: 'கல்', grain: 'தானியம்', coins: 'நாணயங்கள்', people: 'மக்கள்',
    b_house: 'வீடு', b_farm: 'வயல்', b_chai: 'டீக்கடை', b_bazaar: 'சந்தை', b_temple: 'கோயில்',
    d_house: '2 பேர் இங்கே வசிக்கலாம்.',
    d_farm: 'தானியம் விளைவிக்கும். வேலையாள் இருந்தால் இரட்டிப்பு.',
    d_chai: 'டீ விற்று நாணயங்கள் தரும். வேலையாள் இருந்தால் இரட்டிப்பு.',
    d_bazaar: 'தானியத்தை விற்று நாணயங்கள் தரும் (1 தானியம் = 3 நாணயம்). வேலையாள் இருந்தால் இரட்டிப்பு.',
    d_temple: 'முழு கிராமத்தின் வருமானம் +20%. (அதிகபட்சம் 3 கோயில்கள்)',
    tab_build: 'கட்டு', tab_gift: 'பரிசு', tab_fest: 'திருவிழா', tab_set: 'அமைப்பு',
    build_title: '🔨 என்ன கட்டலாம்?', built_n: 'கட்டியவை: {0}', max_reached: 'அதிகபட்சம் எட்டியது', secs: '{0} வி', mins: '{0} நிமி',
    close: 'மூடு', cancel: 'ரத்து',
    need_more: 'போதிய பொருட்கள் இல்லை.', land_only: 'நிலத்தில் மட்டுமே கட்டலாம்.', occupied: 'இந்த இடம் நிரம்பியுள்ளது.', tree_block: 'இங்கே மரம் அல்லது பாறை உள்ளது.',
    place_hint: 'வைக்க <b>பச்சை</b> கட்டத்தைத் தொடு: {0} {1}',
    site_started: '🚧 கட்டுமானம் தொடங்கியது: {0} ({1} வி)', site_done: '{0} {1} தயார்!',
    site_title: '🚧 {0} கட்டப்படுகிறது', site_left: '{0} வி மீதம்', site_ad: '📺 விளம்பரம் பார்த்து இப்போதே முடி', site_ad_reason: 'கட்டுமானத்தை உடனே முடிக்கவும்.',
    house_people: 'இங்கே வசிப்பவர்கள்:', house_empty: 'இப்போது காலி. விரைவில் யாராவது வருவார்கள்!',
    work_yes: '👷 {0} இங்கே வேலை செய்கிறார்: வருமானம் ×2', work_no: 'இங்கே யாரும் வேலை செய்யவில்லை. புதியவர் வந்தால் வருமானம் ×2.',
    temple_info: 'கோயில்களால் மொத்த வருமானம் +{0}%.',
    arrive: '🧑 {0} கிராமத்துக்கு வந்தார்!',
    lvl: 'நிலை {0}', up_btn: '⬆️ மேம்படுத்து → நிலை {0}', up_done: '⬆️ {0} இப்போது நிலை {1}! வருமானம் உயர்ந்தது.', lvl_max: '⭐ அதிகபட்ச நிலை', lvl_info: 'ஒவ்வொரு நிலையிலும் வருமானம் +50%.',
    thief_toast: '🦹 திருடன்! சீக்கிரம் தொடு!', escaped0: '🦹 திருடன் தப்பிவிட்டான்…', caught: '👮 திருடன் பிடிபட்டான்! +{0}🪙', caught_combo: '👮 சபாஷ்! ×{1} காம்போ · +{0}🪙', escaped: '🦹 திருடன் தப்பிவிட்டான்… −{0}🪙',
    fest_title: '🎆 திருவிழா', fest_desc: '30 விநாடிகள் முழு கிராமத்தின் வருமானம் இரட்டிப்பு!',
    fest_ready: 'தயார்!', fest_live: 'நடக்கிறது', fest_start_free: '🎆 திருவிழாவைத் தொடங்கு', fest_start: '🎆 திருவிழா! {0} வி வருமானம் ×2',
    fest_ad: '📺 விளம்பரம் பார்த்து இப்போதே தொடங்கு', fest_wait: 'அடுத்த திருவிழா {0} கழித்து.', fest_ad_reason: 'திருவிழாவை இப்போதே தொடங்கவும்.',
    fest_running: 'திருவிழா நடக்கிறது! {0} வி மீதம்.',
    daily_title: '🎁 தினசரி பரிசு', daily_day: 'நாள் {0}', daily_claim: 'பெறு', daily_double: '📺 விளம்பரம் பார்த்து ×2',
    daily_done: 'இன்றைய பரிசைப் பெற்றாய். நாளை மீண்டும் வா!', daily_got: '🎁 கிடைத்தது: {0}', daily_reason: 'இன்றைய பரிசை இரட்டிப்பாக்கு.',
    daily_streak: 'தொடர்ந்து {0} நாட்கள் 🔥', daily_hint: 'தினமும் வா — பரிசு பெரிதாகும். 7வது நாள் பெரிய பரிசு!',
    offline_title: '🌙 நீ இல்லாதபோதும் கிராமம் உழைத்தது', offline_body: '{0} நேரத்தில் கிராமம் சம்பாதித்தது:', offline_take: 'எடுத்துக்கொள்', offline_double: '📺 விளம்பரம் பார்த்து ×2',
    offline_reason: 'சம்பாத்தியத்தை இரட்டிப்பாக்கு.',
    harvest_double: '📺 இரட்டிப்பு: +{0}{1}', harvest_double_reason: 'இப்போது எடுத்ததை இரட்டிப்பாக்கு.',
    ad_title: '📺 விளம்பரம் (போலி)', ad_wait: 'பரிசு {0} வி-இல்…', ad_ready: 'நன்றி! பரிசு தயார்.', ad_take: 'பரிசைப் பெறு', ad_skip: 'பரிசு இன்றி தவிர்',
    ad_note: 'விருப்பம் மட்டுமே: விளம்பரம் இல்லாமலும் முழு விளையாட்டை விளையாடலாம்.',
    set_title: '⚙️ அமைப்புகள்', set_lang: 'மொழி', set_skin: '🐘 கோட்வாலின் வாகனம்', skin_on: 'தேர்ந்தெடுத்தது', skin_pick: 'தொட்டு தேர்ந்தெடு',
    skin_note: 'மேலும் வாகனங்களும் அலங்காரங்களும் விரைவில் வரும். அவை வருமானத்தை பாதிக்காது.',
    reset: 'புதிய ஆட்டம் தொடங்கு', reset_q: 'மீண்டும் முதலில் இருந்து?', reset_body: 'உன் கிராமம் அழிந்துவிடும்.', reset_yes: 'ஆம், புதிய ஆட்டம்',
    skin_horse: 'குதிரை', skin_elephant: 'யானை', skin_camel: 'ஒட்டகம்',
    intro_title: '🛖 கிராம சந்தைக்கு வரவேற்கிறோம்!',
    intro_1: '🌳 மரங்களையும் 🪨 பாறைகளையும் தொட்டு மரமும் கல்லும் சேகரி.',
    intro_2: '🔨 வயல், டீக்கடை, சந்தை, கோயில் கட்டு. நாணயங்கள் தானாக வரும்.',
    intro_3: '🦹 திருடன் தெரிந்தால் சீக்கிரம் தொடு — கோட்வால் பிடிப்பார்!',
    intro_4: '🎁 தினமும் வந்து பரிசு பெறு. நீ இல்லாதபோதும் கிராமம் சம்பாதிக்கும்.',
    intro_go: 'தொடங்கலாம்!',
    h_start: 'மரங்களை 🌳 பாறைகளை 🪨 தொடு, பிறகு வயல் 🌾 கட்டு.',
    h_chai: 'டீக்கடை ☕ கட்டி நாணயம் சம்பாதி.',
    h_house: 'புதியவர்கள் வர வீடு 🏠 கட்டு.',
    h_bazaar: 'சந்தை 🏪 கட்டு: தானியத்தை விற்று நாணயம் பெறு.',
    h_temple: 'கோயில் 🛕 கட்டு: முழு கிராமமும் அதிகம் சம்பாதிக்கும்.',
    h_idle: 'திருடனை 🦹 சீக்கிரம் தொடு! திருவிழா 🎆 வருமானத்தை இரட்டிப்பாக்கும்.',
    h_thief: '🦹 திருடன்! சீக்கிரம் தொடு!',
    h_wood: 'மரம் குறைவு — மரங்களை 🌳 தொடு.',
    h_buy: 'மேலே 🪵 அல்லது 🪨 தொட்டு நாணயங்களால் வாங்கு.', ex_title: '🪙 நாணயம் மாற்று', ex_desc: 'நாணயங்களால் மரம் அல்லது கல் வாங்கு.',
    snd: 'ஒலி மற்றும் அதிர்வு', snd_on: 'இயக்கம்', snd_off: 'நிறுத்தம்',
    names: ['ராமன்', 'சீதா', 'மோகன்', 'கீதா', 'ரவி', 'லட்சுமி', 'அமுதா', 'பூஜா', 'சுரேஷ்', 'ஆர்த்தி', 'கிஷன்', 'ராதா', 'அஜய்', 'சுனிதா', 'தீபக்', 'மீனா'],
  },
  bn: {
    title: 'গ্রামের বাজার',
    wood: 'কাঠ', stone: 'পাথর', grain: 'শস্য', coins: 'মুদ্রা', people: 'গ্রামবাসী',
    b_house: 'ঘর', b_farm: 'খেত', b_chai: 'চায়ের দোকান', b_bazaar: 'বাজার', b_temple: 'মন্দির',
    d_house: 'এখানে 2 জন থাকে।',
    d_farm: 'শস্য ফলায়। কর্মী থাকলে দ্বিগুণ।',
    d_chai: 'চা বিক্রি করে মুদ্রা আয় করে। কর্মী থাকলে দ্বিগুণ।',
    d_bazaar: 'শস্য বিক্রি করে মুদ্রা দেয় (1 শস্য = 3 মুদ্রা)। কর্মী থাকলে দ্বিগুণ।',
    d_temple: 'পুরো গ্রামের আয় +20%। (সর্বোচ্চ 3টি মন্দির)',
    tab_build: 'বানাও', tab_gift: 'উপহার', tab_fest: 'উৎসব', tab_set: 'সেটিংস',
    build_title: '🔨 কী বানাবে?', built_n: 'বানানো: {0}', max_reached: 'সর্বোচ্চে পৌঁছেছে', secs: '{0} সে.', mins: '{0} মি.',
    close: 'বন্ধ করো', cancel: 'বাতিল',
    need_more: 'জিনিস যথেষ্ট নেই।', land_only: 'শুধু মাটিতে বানাও।', occupied: 'এই জায়গা ভরা।', tree_block: 'এখানে গাছ বা পাথর আছে।',
    place_hint: 'বসাতে <b>সবুজ</b> ঘর ছোঁও: {0} {1}',
    site_started: '🚧 কাজ শুরু: {0} ({1} সে.)', site_done: '{0} {1} তৈরি!',
    site_title: '🚧 {0} তৈরি হচ্ছে', site_left: 'আর {0} সে.', site_ad: '📺 বিজ্ঞাপন দেখে এখনই শেষ করো', site_ad_reason: 'কাজ এখনই শেষ করো।',
    house_people: 'এখানে যারা থাকে:', house_empty: 'এখন খালি। শিগগিরই কেউ আসবে!',
    work_yes: '👷 {0} এখানে কাজ করে: আয় ×2', work_no: 'এখানে কেউ কাজ করছে না। নতুন কেউ এলে আয় ×2।',
    temple_info: 'মন্দিরের জন্য মোট আয় +{0}%।',
    arrive: '🧑 {0} গ্রামে এল!',
    lvl: 'স্তর {0}', up_btn: '⬆️ উন্নত করো → স্তর {0}', up_done: '⬆️ {0} এখন স্তর {1}! আয় বাড়ল।', lvl_max: '⭐ সর্বোচ্চ স্তর', lvl_info: 'প্রতি স্তরে আয় +50%।',
    thief_toast: '🦹 চোর! তাড়াতাড়ি ছোঁও!', escaped0: '🦹 চোর পালিয়ে গেল…', caught: '👮 চোর ধরা পড়ল! +{0}🪙', caught_combo: '👮 সাবাশ! ×{1} কম্বো · +{0}🪙', escaped: '🦹 চোর পালিয়ে গেল… −{0}🪙',
    fest_title: '🎆 উৎসব', fest_desc: '30 সেকেন্ড পুরো গ্রামের আয় দ্বিগুণ!',
    fest_ready: 'তৈরি!', fest_live: 'চলছে', fest_start_free: '🎆 উৎসব শুরু করো', fest_start: '🎆 উৎসব! {0} সে. আয় ×2',
    fest_ad: '📺 বিজ্ঞাপন দেখে এখনই শুরু করো', fest_wait: 'পরের উৎসব {0} পরে।', fest_ad_reason: 'উৎসব এখনই শুরু করো।',
    fest_running: 'উৎসব চলছে! আর {0} সে.।',
    daily_title: '🎁 আজকের উপহার', daily_day: 'দিন {0}', daily_claim: 'নাও', daily_double: '📺 বিজ্ঞাপন দেখে ×2',
    daily_done: 'আজকের উপহার নেওয়া হয়েছে। কাল আবার এসো!', daily_got: '🎁 পেয়েছ: {0}', daily_reason: 'আজকের উপহার দ্বিগুণ করো।',
    daily_streak: 'টানা {0} দিন 🔥', daily_hint: 'রোজ এসো — উপহার বড় হবে। 7ম দিনে বড় পুরস্কার!',
    offline_title: '🌙 তুমি না থাকলেও গ্রাম কাজ করেছে', offline_body: '{0} সময়ে গ্রাম আয় করেছে:', offline_take: 'নাও', offline_double: '📺 বিজ্ঞাপন দেখে ×2',
    offline_reason: 'আয় দ্বিগুণ করো।',
    harvest_double: '📺 দ্বিগুণ: +{0}{1}', harvest_double_reason: 'এইমাত্র যা পেলে তা দ্বিগুণ করো।',
    ad_title: '📺 বিজ্ঞাপন (নকল)', ad_wait: 'পুরস্কার {0} সে.-এ…', ad_ready: 'ধন্যবাদ! পুরস্কার তৈরি।', ad_take: 'পুরস্কার নাও', ad_skip: 'পুরস্কার ছাড়া বাদ দাও',
    ad_note: 'ঐচ্ছিক: বিজ্ঞাপন ছাড়াও পুরো খেলা খেলা যায়।',
    set_title: '⚙️ সেটিংস', set_lang: 'ভাষা', set_skin: '🐘 কোতোয়ালের বাহন', skin_on: 'বাছাই করা', skin_pick: 'ছুঁয়ে বাছো',
    skin_note: 'আরও বাহন ও সাজসজ্জা শিগগির আসছে। এগুলো আয়ে কোনো প্রভাব ফেলে না।',
    reset: 'নতুন খেলা শুরু করো', reset_q: 'আবার প্রথম থেকে?', reset_body: 'তোমার গ্রাম মুছে যাবে।', reset_yes: 'হ্যাঁ, নতুন খেলা',
    skin_horse: 'ঘোড়া', skin_elephant: 'হাতি', skin_camel: 'উট',
    intro_title: '🛖 গ্রামের বাজারে স্বাগত!',
    intro_1: '🌳 গাছ আর 🪨 পাথর ছুঁয়ে কাঠ ও পাথর জোগাড় করো।',
    intro_2: '🔨 খেত, চায়ের দোকান, বাজার আর মন্দির বানাও। মুদ্রা আপনিই আসবে।',
    intro_3: '🦹 চোর দেখলে তাড়াতাড়ি ছোঁও — কোতোয়াল ধরে ফেলবে!',
    intro_4: '🎁 রোজ এসে উপহার নাও। তুমি না থাকলেও গ্রাম আয় করে।',
    intro_go: 'শুরু করি!',
    h_start: 'গাছ 🌳 আর পাথর 🪨 ছোঁও, তারপর খেত 🌾 বানাও।',
    h_chai: 'চায়ের দোকান ☕ বানাও — মুদ্রা আয় করো।',
    h_house: 'নতুন মানুষ আসতে ঘর 🏠 বানাও।',
    h_bazaar: 'বাজার 🏪 বানাও: শস্য বেচে মুদ্রা পাও।',
    h_temple: 'মন্দির 🛕 বানাও: পুরো গ্রামের আয় বাড়ে।',
    h_idle: 'চোর 🦹 দেখলেই ছোঁও! উৎসব 🎆 আয় দ্বিগুণ করে।',
    h_thief: '🦹 চোর! তাড়াতাড়ি ছোঁও!',
    h_wood: 'কাঠ কম — গাছ 🌳 ছোঁও।',
    h_buy: 'উপরে 🪵 বা 🪨 ছুঁয়ে মুদ্রা দিয়ে কেনো।', ex_title: '🪙 মুদ্রা বদলাও', ex_desc: 'মুদ্রা দিয়ে কাঠ বা পাথর কেনো।',
    snd: 'শব্দ ও কম্পন', snd_on: 'চালু', snd_off: 'বন্ধ',
    names: ['রাম', 'সীতা', 'মোহন', 'গীতা', 'রবি', 'লক্ষ্মী', 'অমিত', 'পূজা', 'সুরেশ', 'আরতি', 'কিষাণ', 'রাধা', 'অজয়', 'সুনীতা', 'দীপক', 'মীনা'],
  },
  mr: {
    title: 'गावचा बाजार',
    wood: 'लाकूड', stone: 'दगड', grain: 'धान्य', coins: 'नाणी', people: 'गावकरी',
    b_house: 'घर', b_farm: 'शेत', b_chai: 'चहाची टपरी', b_bazaar: 'बाजार', b_temple: 'मंदिर',
    d_house: 'इथे 2 जण राहतात.',
    d_farm: 'धान्य पिकवते. कामगार असेल तर दुप्पट.',
    d_chai: 'चहा विकून नाणी कमावते. कामगार असेल तर दुप्पट.',
    d_bazaar: 'धान्य विकून नाणी देतो (1 धान्य = 3 नाणी). कामगार असेल तर दुप्पट.',
    d_temple: 'संपूर्ण गावाची कमाई +20%. (जास्तीत जास्त 3 मंदिरे)',
    tab_build: 'बांधा', tab_gift: 'बक्षीस', tab_fest: 'उत्सव', tab_set: 'सेटिंग',
    build_title: '🔨 काय बांधायचे?', built_n: 'बांधलेले: {0}', max_reached: 'कमाल गाठली', secs: '{0} सेकंद', mins: '{0} मिनिटे',
    close: 'बंद करा', cancel: 'रद्द करा',
    need_more: 'सामान कमी आहे.', land_only: 'फक्त जमिनीवर बांधा.', occupied: 'ही जागा भरलेली आहे.', tree_block: 'इथे झाड किंवा दगड आहे.',
    place_hint: '{0} {1} ठेवण्यासाठी <b>हिरवी</b> जागा दाबा',
    site_started: '🚧 काम सुरू: {0} ({1} सेकंद)', site_done: '{0} {1} तयार!',
    site_title: '🚧 {0} बांधले जात आहे', site_left: '{0} सेकंद बाकी', site_ad: '📺 जाहिरात बघून आत्ताच पूर्ण करा', site_ad_reason: 'काम लगेच पूर्ण करा.',
    house_people: 'इथे राहणारे:', house_empty: 'सध्या रिकामे. लवकरच कोणीतरी येईल!',
    work_yes: '👷 {0} इथे काम करतो: कमाई ×2', work_no: 'इथे कोणी काम करत नाही. नवीन गावकरी आला की कमाई ×2.',
    temple_info: 'मंदिरांमुळे एकूण कमाई +{0}%.',
    arrive: '🧑 {0} गावात आला!',
    lvl: 'स्तर {0}', up_btn: '⬆️ सुधारा → स्तर {0}', up_done: '⬆️ {0} आता स्तर {1}! कमाई वाढली.', lvl_max: '⭐ कमाल स्तर', lvl_info: 'प्रत्येक स्तरावर कमाई +50%.',
    thief_toast: '🦹 चोर! पटकन दाबा!', escaped0: '🦹 चोर पळून गेला…', caught: '👮 चोर पकडला! +{0}🪙', caught_combo: '👮 शाबास! ×{1} कॉम्बो · +{0}🪙', escaped: '🦹 चोर पळून गेला… −{0}🪙',
    fest_title: '🎆 उत्सव', fest_desc: '30 सेकंद संपूर्ण गावाची कमाई दुप्पट!',
    fest_ready: 'तयार!', fest_live: 'सुरू', fest_start_free: '🎆 उत्सव सुरू करा', fest_start: '🎆 उत्सव! {0} सेकंद कमाई ×2',
    fest_ad: '📺 जाहिरात बघून आत्ताच सुरू करा', fest_wait: 'पुढचा उत्सव {0} नंतर.', fest_ad_reason: 'उत्सव आत्ताच सुरू करा.',
    fest_running: 'उत्सव सुरू आहे! {0} सेकंद बाकी.',
    daily_title: '🎁 रोजचे बक्षीस', daily_day: 'दिवस {0}', daily_claim: 'घ्या', daily_double: '📺 जाहिरात बघून ×2',
    daily_done: 'आजचे बक्षीस घेतले. उद्या पुन्हा या!', daily_got: '🎁 बक्षीस मिळाले: {0}', daily_reason: 'आजचे बक्षीस दुप्पट करा.',
    daily_streak: 'सलग {0} दिवस 🔥', daily_hint: 'रोज या — बक्षीस वाढत जाईल. 7व्या दिवशी मोठे बक्षीस!',
    offline_title: '🌙 तुम्ही नसतानाही गाव कमावत राहिले', offline_body: '{0} मध्ये गावाने कमावले:', offline_take: 'घ्या', offline_double: '📺 जाहिरात बघून ×2',
    offline_reason: 'कमाई दुप्पट करा.',
    harvest_double: '📺 दुप्पट: +{0}{1}', harvest_double_reason: 'आत्ता मिळालेले दुप्पट करा.',
    ad_title: '📺 जाहिरात (नकली)', ad_wait: 'बक्षीस {0} सेकंदात…', ad_ready: 'धन्यवाद! बक्षीस तयार आहे.', ad_take: 'बक्षीस घ्या', ad_skip: 'बक्षिसाशिवाय सोडा',
    ad_note: 'ऐच्छिक: जाहिरातीशिवायही पूर्ण खेळ खेळता येतो.',
    set_title: '⚙️ सेटिंग', set_lang: 'भाषा', set_skin: '🐘 कोतवालाचे वाहन', skin_on: 'निवडलेले', skin_pick: 'दाबून निवडा',
    skin_note: 'आणखी वाहने आणि सजावट लवकरच येत आहेत. त्यांचा कमाईवर काहीही परिणाम होत नाही.',
    reset: 'नवा खेळ सुरू करा', reset_q: 'पुन्हा सुरुवातीपासून?', reset_body: 'तुमचे गाव पुसले जाईल.', reset_yes: 'हो, नवा खेळ',
    skin_horse: 'घोडा', skin_elephant: 'हत्ती', skin_camel: 'उंट',
    intro_title: '🛖 गावच्या बाजारात स्वागत!',
    intro_1: '🌳 झाडे आणि 🪨 दगड दाबून लाकूड व दगड मिळवा.',
    intro_2: '🔨 शेत, चहाची टपरी, बाजार आणि मंदिर बांधा. नाणी आपोआप येतील.',
    intro_3: '🦹 चोर दिसला तर पटकन दाबा — कोतवाल पकडेल!',
    intro_4: '🎁 रोज या आणि बक्षीस घ्या. तुम्ही नसतानाही गाव कमावते.',
    intro_go: 'सुरू करूया!',
    h_start: 'झाडे 🌳 आणि दगड 🪨 दाबा, मग शेत 🌾 बांधा.',
    h_chai: 'चहाची टपरी ☕ बांधा — नाणी कमवा.',
    h_house: 'नवे लोक येण्यासाठी घर 🏠 बांधा.',
    h_bazaar: 'बाजार 🏪 बांधा: धान्य विकून नाणी मिळवा.',
    h_temple: 'मंदिर 🛕 बांधा: संपूर्ण गावाची कमाई वाढते.',
    h_idle: 'चोर 🦹 दिसला की पटकन दाबा! उत्सव 🎆 कमाई दुप्पट करतो.',
    h_thief: '🦹 चोर! पटकन दाबा!',
    h_wood: 'लाकूड कमी आहे — झाडे 🌳 दाबा.',
    h_buy: 'वर 🪵 किंवा 🪨 दाबून नाण्यांनी विकत घ्या.', ex_title: '🪙 नाणी बदला', ex_desc: 'नाण्यांनी लाकूड किंवा दगड विकत घ्या.',
    snd: 'आवाज आणि कंपन', snd_on: 'चालू', snd_off: 'बंद',
    names: ['राम', 'सीता', 'मोहन', 'गीता', 'रवी', 'लक्ष्मी', 'अमित', 'पूजा', 'सुरेश', 'आरती', 'किशन', 'राधा', 'अजय', 'सुनीता', 'दीपक', 'मीना'],
  },
  en: {
    title: 'Village Bazaar',
    wood: 'Wood', stone: 'Stone', grain: 'Grain', coins: 'Coins', people: 'Villagers',
    b_house: 'House', b_farm: 'Farm', b_chai: 'Chai stall', b_bazaar: 'Bazaar', b_temple: 'Temple',
    d_house: 'Houses 2 villagers.',
    d_farm: 'Grows grain. Doubled with a worker.',
    d_chai: 'Sells chai for coins. Doubled with a worker.',
    d_bazaar: 'Sells grain for coins (1 grain = 3 coins). Doubled with a worker.',
    d_temple: 'Whole-village income +20%. (Max 3 temples)',
    tab_build: 'Build', tab_gift: 'Reward', tab_fest: 'Festival', tab_set: 'Settings',
    build_title: '🔨 What to build?', built_n: 'Built: {0}', max_reached: 'Maxed out', secs: '{0} s', mins: '{0} min',
    close: 'Close', cancel: 'Cancel',
    need_more: 'Not enough materials.', land_only: 'Build on land only.', occupied: 'This spot is taken.', tree_block: 'A tree or rock is in the way.',
    place_hint: 'Tap a <b>green</b> tile to place {0} {1}',
    site_started: '🚧 Work started: {0} ({1} s)', site_done: '{0} {1} is ready!',
    site_title: '🚧 {0} under construction', site_left: '{0} s left', site_ad: '📺 Watch an ad to finish now', site_ad_reason: 'Finish the work right away.',
    house_people: 'Living here:', house_empty: 'Empty for now. Someone will arrive soon!',
    work_yes: '👷 {0} works here: income ×2', work_no: 'No worker yet. A new villager will double the income.',
    temple_info: 'Temples give +{0}% total income.',
    arrive: '🧑 {0} arrived in the village!',
    lvl: 'Level {0}', up_btn: '⬆️ Upgrade → Level {0}', up_done: '⬆️ {0} is now level {1}! Income up.', lvl_max: '⭐ Max level', lvl_info: 'Each level adds +50% income.',
    thief_toast: '🦹 Thief! Tap fast!', escaped0: '🦹 The thief got away…', caught: '👮 Thief caught! +{0}🪙', caught_combo: '👮 Nice! ×{1} combo · +{0}🪙', escaped: '🦹 The thief got away… −{0}🪙',
    fest_title: '🎆 Festival', fest_desc: 'Whole-village income doubled for 30 seconds!',
    fest_ready: 'Ready!', fest_live: 'On', fest_start_free: '🎆 Start the festival', fest_start: '🎆 Festival! Income ×2 for {0} s',
    fest_ad: '📺 Watch an ad to start now', fest_wait: 'Next festival in {0}.', fest_ad_reason: 'Start the festival now.',
    fest_running: 'Festival is on! {0} s left.',
    daily_title: '🎁 Daily reward', daily_day: 'Day {0}', daily_claim: 'Claim', daily_double: '📺 Watch an ad for ×2',
    daily_done: "Today's reward is claimed. Come back tomorrow!", daily_got: '🎁 You got: {0}', daily_reason: "Double today's reward.",
    daily_streak: '{0}-day streak 🔥', daily_hint: 'Visit daily — rewards grow. Big prize on day 7!',
    offline_title: '🌙 The village kept working', offline_body: 'In {0} the village earned:', offline_take: 'Collect', offline_double: '📺 Watch an ad for ×2',
    offline_reason: 'Double the earnings.',
    harvest_double: '📺 Double: +{0}{1}', harvest_double_reason: 'Double what you just collected.',
    ad_title: '📺 Ad (simulated)', ad_wait: 'Reward in {0} s…', ad_ready: 'Thanks! Your reward is ready.', ad_take: 'Claim reward', ad_skip: 'Skip, no reward',
    ad_note: 'Optional: the whole game is playable without ads.',
    set_title: '⚙️ Settings', set_lang: 'Language', set_skin: "🐘 Kotwal's ride", skin_on: 'Selected', skin_pick: 'Tap to select',
    skin_note: 'More rides and decorations are coming soon. They never affect your income.',
    reset: 'Start a new game', reset_q: 'Start over?', reset_body: 'Your village will be erased.', reset_yes: 'Yes, new game',
    skin_horse: 'Horse', skin_elephant: 'Elephant', skin_camel: 'Camel',
    intro_title: '🛖 Welcome to Village Bazaar!',
    intro_1: '🌳 Tap trees and 🪨 rocks to collect wood and stone.',
    intro_2: '🔨 Build farms, chai stalls, bazaars and temples. Coins flow in by themselves.',
    intro_3: '🦹 See a thief? Tap it fast — the Kotwal will catch it!',
    intro_4: '🎁 Come back daily for rewards. Your village earns while you are away.',
    intro_go: "Let's go!",
    h_start: 'Tap trees 🌳 and rocks 🪨, then build a farm 🌾.',
    h_chai: 'Build a chai stall ☕ to earn coins.',
    h_house: 'Build a house 🏠 so new villagers can arrive.',
    h_bazaar: 'Build a bazaar 🏪: sell grain for coins.',
    h_temple: 'Build a temple 🛕: the whole village earns more.',
    h_idle: 'Tap thieves 🦹 fast! A festival 🎆 doubles your income.',
    h_thief: '🦹 Thief! Tap it fast!',
    h_wood: 'Low on wood: tap the trees 🌳.',
    h_buy: 'Tap 🪵 or 🪨 above to buy more with coins.', ex_title: '🪙 Trade coins', ex_desc: 'Buy wood or stone with your coins.',
    snd: 'Sound & vibration', snd_on: 'On', snd_off: 'Off',
    names: ['Ram', 'Sita', 'Mohan', 'Geeta', 'Ravi', 'Lakshmi', 'Amit', 'Pooja', 'Suresh', 'Aarti', 'Kishan', 'Radha', 'Ajay', 'Sunita', 'Deepak', 'Meena'],
  },
};
let LANG = 'fr';
function t(key, ...args) {
  let s = (I18N[LANG] && I18N[LANG][key]);
  if (s == null) s = I18N.en[key];
  if (s == null) return key;
  return String(s).replace(/\{(\d)\}/g, (_, i) => (args[+i] != null ? args[+i] : ''));
}
const fmtNum = v => { v = Math.floor(v); return v >= 100000 ? '99k+' : v >= 10000 ? Math.floor(v / 1000) + 'k' : String(v); };
const fmtDur = sec => {
  sec = Math.max(0, Math.round(sec));
  return sec >= 60 ? t('mins', Math.floor(sec / 60)) + (sec % 60 ? ' ' + t('secs', sec % 60) : '') : t('secs', sec);
};

/* ==========================================================================
   DONNÉES (équilibrage)
   ========================================================================== */
const COLS = 11, ROWS = 13, SEED = 7071;
const SAVE_KEY = 'gaon-bazaar-v1';
const OFFLINE_CAP = 2 * 3600;   // on ne compte que 2 h d'absence
const OFFLINE_RATE = .5;        // rendement hors-ligne (50 %)
const FEST_LEN = 30, FEST_CD = 150;
const COST_GROWTH = 1.22;       // +22 % par exemplaire déjà posé
const MAX_LVL = 10;             // niveaux d'amélioration (champ, chaï, bazar)

const RES = {
  wood:  { e: '🪵' }, stone: { e: '🪨' }, grain: { e: '🌾' }, coins: { e: '🪙' },
};

const BUILDINGS = {
  house:  { e: '🏠', plate: '#f0c7a0', cost: { wood: 10, stone: 2 }, time: 10 },
  farm:   { e: '🌾', plate: '#e3cf7e', cost: { wood: 12, stone: 3 }, time: 15, interval: 8, work: true },
  chai:   { e: '☕', plate: '#e8b98a', cost: { wood: 15, stone: 5, coins: 15 }, time: 20, interval: 9, work: true },
  bazaar: { e: '🏪', plate: '#eba5a5', cost: { wood: 20, stone: 8, coins: 25 }, time: 30, interval: 6, work: true },
  temple: { e: '🛕', plate: '#e0d0f0', cost: { wood: 30, stone: 20, coins: 60 }, time: 45, max: 3 },
};
const ORDER = ['house', 'farm', 'chai', 'bazaar', 'temple'];

const NODE = {
  tree: { max: 3, res: 'wood',  emojis: ['🌳', '🌴'], regrow: 20 },
  rock: { max: 3, res: 'stone', emojis: ['🪨'],       regrow: 24 },
};

const SKINS = [
  { id: 'horse',    e: '🐎', n: 'skin_horse' },
  { id: 'elephant', e: '🐘', n: 'skin_elephant' },
  { id: 'camel',    e: '🐪', n: 'skin_camel' },
];

// 7 jours de récompenses quotidiennes
const DAILY = [
  { coins: 30 }, { wood: 40 }, { coins: 60 }, { stone: 30 },
  { coins: 100 }, { wood: 80, stone: 40 }, { coins: 250, festival: true },
];

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';

/* ==========================================================================
   CARTE (île carrée aux coins arrondis, ressources placées avec SEED)
   ========================================================================== */
let MAP;
const isLand = (x, y) => x >= 1 && y >= 1 && x <= COLS - 2 && y <= ROWS - 2
  && !((x === 1 || x === COLS - 2) && (y === 1 || y === ROWS - 2));
const CENTER = { x: 5, y: 6 };

function genMap() {
  const rng = mulberry32(SEED);
  const tiles = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (!isLand(x, y)) continue;
    if (Math.hypot(x - CENTER.x, y - CENTER.y) < 1.8) continue;
    tiles.push({ x, y });
  }
  for (let i = tiles.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [tiles[i], tiles[j]] = [tiles[j], tiles[i]]; }
  const nodeDefs = [];
  tiles.slice(0, 14).forEach(t_ => nodeDefs.push({ kind: 'tree', x: t_.x, y: t_.y, v: Math.floor(rng() * 2) }));
  tiles.slice(14, 21).forEach(t_ => nodeDefs.push({ kind: 'rock', x: t_.x, y: t_.y, v: 0 }));
  return { nodeDefs };
}
function hash2(x, y) {
  let h = Math.imul(x + 17, 374761393) ^ Math.imul(y + 31, 668265263) ^ SEED;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/* ==========================================================================
   ÉTAT DU JEU
   ========================================================================== */
let state;
const nodeGrid = new Map(), bGrid = new Map();
let placing = null, hover = null, lastHarvest = null;
const fx = [];
const cows = [];

function newState() {
  const nodes = MAP.nodeDefs.map((d, i) => ({ id: i, kind: d.kind, x: d.x, y: d.y, v: d.v, stock: NODE[d.kind].max, regrow: 0, cool: 0 }));
  return {
    v: 1, t: 0, lang: LANG, seenIntro: false, saved: Date.now(),
    res: { wood: 20, stone: 5, grain: 0, coins: 10 },
    buildings: [{ id: 1, type: 'house', x: CENTER.x, y: CENTER.y, built: true, left: 0, acc: 0, worked: false }],
    people: [{ id: 2, name: 0 }],
    nodes, nextId: 10,
    arrT: 20, gatherAcc: 0,
    festCd: 60, festUntil: -1,
    thief: null, thiefT: 40, combo: 0, caught: 0,
    daily: { last: '', streak: 0 },
    skin: 'elephant',
    kotwal: { x: CENTER.x + .5, y: CENTER.y + 2.5, tx: CENTER.x + .5, ty: CENTER.y + 2.5, wait: 2, dash: false },
  };
}
function rebuildGrids() {
  nodeGrid.clear(); bGrid.clear();
  state.nodes.forEach(n => nodeGrid.set(n.y * COLS + n.x, n));
  state.buildings.forEach(b => bGrid.set(b.y * COLS + b.x, b));
}
const buildingAt = (x, y) => bGrid.get(y * COLS + x);
const nodeAt = (x, y) => nodeGrid.get(y * COLS + x);

/* ---------- dérivés ---------- */
const builtOf = type => state.buildings.filter(b => b.built && b.type === type);
const capacity = () => builtOf('house').length * 2;
const bName = type => t('b_' + type);
const festLive = () => state.festUntil > state.t;
const templeBonus = () => 1 + .2 * Math.min(3, builtOf('temple').length);
const prodMult = () => templeBonus() * (festLive() ? 2 : 1);
const personName = p => I18N[LANG].names[p.name % I18N[LANG].names.length];

function costOf(type) {
  const def = BUILDINGS[type];
  const n = Math.max(0, state.buildings.filter(b => b.type === type).length - (type === 'house' ? 1 : 0));
  const k = Math.pow(COST_GROWTH, n);
  return Object.fromEntries(Object.entries(def.cost).map(([r, v]) => [r, Math.ceil(v * k)]));
}
const canAfford = cost => Object.entries(cost).every(([k, v]) => state.res[k] >= v);
const costHtml = cost => Object.entries(cost)
  .map(([k, v]) => `<span class="${state.res[k] >= v ? '' : 'lack'}">${v}${RES[k].e}</span>`).join('');
const countOf = type => state.buildings.filter(b => b.type === type).length;
const maxed = type => BUILDINGS[type].max && countOf(type) >= BUILDINGS[type].max;

const lvlOf = b => b.lvl || 1;
const lvlMult = b => 1 + .5 * (lvlOf(b) - 1);
function upCost(b) {
  const L = lvlOf(b);
  return { wood: Math.ceil(10 * Math.pow(1.7, L - 1)), stone: Math.ceil(5 * Math.pow(1.6, L - 1)), coins: Math.ceil(25 * Math.pow(2.2, L - 1)) };
}
function upgrade(b) {
  if (!b.built || !BUILDINGS[b.type].work || lvlOf(b) >= MAX_LVL) return false;
  const c = upCost(b);
  if (!canAfford(c)) { toast(t('need_more')); return false; }
  for (const [k, v] of Object.entries(c)) state.res[k] -= v;
  b.lvl = lvlOf(b) + 1; Sfx.play('build');
  floatText(b.x + .5, b.y, '⬆️', '#ffd56a');
  toast(t('up_done', bName(b.type), b.lvl));
  save();
  return true;
}

// les pièces servent aussi à acheter bois et pierre (puits à pièces en fin de partie)
const EXCHANGE = { wood: { n: 10, c: 25 }, stone: { n: 8, c: 25 } };
function exchange(res, times = 1) {
  const e = EXCHANGE[res];
  if (!e || state.res.coins < e.c * times) { toast(t('need_more')); return false; }
  state.res.coins -= e.c * times; state.res[res] += e.n * times;
  Sfx.play('coin');
  return true;
}
function openExchange() {
  const rows = Object.keys(EXCHANGE).map(r => [1, 5].map(m => {
    const e = EXCHANGE[r], c = e.c * m, ok = state.res.coins >= c;
    return `<button type="button" class="row" data-ex="${r}" data-m="${m}" ${ok ? '' : 'disabled'}><span class="ico">${RES[r].e}</span><span class="grow"><span class="name">+${e.n * m} ${t(r)}</span><span class="desc ${ok ? '' : 'lack'}">${c}🪙</span></span></button>`;
  }).join('')).join('');
  openModal({
    title: t('ex_title'), html: `<p class="muted">${t('ex_desc')}</p>${rows}`, buttons: [{ label: t('close'), cls: 'ghost' }],
    onrender: body => body.querySelectorAll('[data-ex]').forEach(el => el.addEventListener('click', () => { exchange(el.dataset.ex, +el.dataset.m); openExchange(); })),
  });
}

// chaque habitant occupe un poste dans un bâtiment de travail (par ordre de construction)
function assignWorkers() {
  let i = 0;
  for (const b of state.buildings) {
    b.worked = false; b.workerId = null;
    if (b.built && BUILDINGS[b.type].work && i < state.people.length) { b.worked = true; b.workerId = state.people[i].id; i++; }
  }
}

/* revenus par seconde (hors fête) — sert aussi au calcul hors-ligne */
function rates() {
  const m = templeBonus();
  let grain = 0, sell = 0, coins = 0;
  for (const b of state.buildings) {
    if (!b.built || !BUILDINGS[b.type].interval) continue;
    const per = m * (b.worked ? 2 : 1) * lvlMult(b) / BUILDINGS[b.type].interval;
    if (b.type === 'farm') grain += per;
    else if (b.type === 'bazaar') sell += per;
    else if (b.type === 'chai') coins += per * 2;
  }
  const sold = Math.min(sell, grain);
  coins += sold * 3;
  const gather = state.people.length / 25 * m;
  return { coins, wood: gather * .6, stone: gather * .4 };
}

/* ==========================================================================
   ACTIONS DU JOUEUR
   ========================================================================== */
function give(k, n, tx, ty, color, auto = false) {
  state.res[k] += n;
  if (tx != null) floatText(tx + .5, ty + .15, `+${n}${RES[k].e}`, color, auto);
}
function harvest(n) {
  if (n.stock <= 0 || n.cool > state.t) return;
  const def = NODE[n.kind], amt = n.kind === 'tree' ? rint(1, 3) : rint(1, 2);
  n.stock--; n.cool = state.t + .25;
  Sfx.play('tap'); buzz(8);
  if (n.stock <= 0) n.regrow = state.t + def.regrow;
  give(def.res, amt, n.x, n.y);
  lastHarvest = { res: def.res, amt, t: state.t, x: n.x, y: n.y };
}
function canPlace(type, x, y) {
  if (!isLand(x, y)) return t('land_only');
  if (buildingAt(x, y)) return t('occupied');
  if (nodeAt(x, y)) return t('tree_block');
  return null;
}
function startPlacing(type) {
  if (maxed(type)) { toast(t('max_reached')); return; }
  if (!canAfford(costOf(type))) { toast(t('need_more')); return; }
  placing = type; renderHint();
}
function placeBuilding(type, x, y) {
  const why = canPlace(type, x, y);
  if (why) { toast(why); return; }
  const cost = costOf(type);
  if (!canAfford(cost) || maxed(type)) { toast(t('need_more')); placing = null; return; }
  for (const [k, v] of Object.entries(cost)) state.res[k] -= v;
  const def = BUILDINGS[type];
  state.buildings.push({ id: state.nextId++, type, x, y, built: false, left: def.time, acc: 0, worked: false });
  rebuildGrids();
  placing = null;
  floatText(x + .5, y, '🔨');
  toast(t('site_started', bName(type), def.time));
  renderHint();
}
function finishBuilding(b) {
  b.built = true; b.left = 0;
  assignWorkers(); Sfx.play('build'); buzz(30);
  floatText(b.x + .5, b.y, '✨');
  toast(t('site_done', BUILDINGS[b.type].e, bName(b.type)));
  save();
}
function addVillager() {
  const s = state;
  const used = new Set(s.people.map(p => p.name));
  const free = I18N.hi.names.map((_, i) => i).filter(i => !used.has(i));
  const idx = free.length ? pick(free) : rint(0, I18N.hi.names.length - 1);
  s.people.push({ id: s.nextId++, name: idx }); Sfx.play('coin');
  assignWorkers();
  toast(t('arrive', I18N[LANG].names[idx]));
}

/* ---------- festival ---------- */
function startFestival(len = FEST_LEN) {
  state.festUntil = state.t + len; Sfx.play('fest');
  state.festCd = FEST_CD;
  floatText(CENTER.x + .5, CENTER.y - .2, '🎆🎶');
  toast(t('fest_start', len));
}
function openFestival() {
  const s = state;
  if (festLive()) {
    openModal({ title: t('fest_title'), html: `<p class="big">${t('fest_running', Math.ceil(s.festUntil - s.t))}</p>`, buttons: [{ label: t('close'), cls: 'ghost' }] });
  } else if (s.festCd <= 0) {
    openModal({
      title: t('fest_title'), html: `<p class="big">${t('fest_desc')}</p>`,
      buttons: [{ label: t('fest_start_free'), cls: 'primary', onclick: () => startFestival() }, { label: t('close'), cls: 'ghost' }],
    });
  } else {
    openModal({
      title: t('fest_title'),
      html: `<p class="big">${t('fest_desc')}</p><p class="muted">${t('fest_wait', fmtDur(s.festCd))}</p>`,
      buttons: [
        { label: t('fest_ad'), cls: 'ad', onclick: () => Ads.show(t('fest_ad_reason'), () => startFestival(45)) },
        { label: t('close'), cls: 'ghost' },
      ],
    });
  }
}

/* ---------- récompense quotidienne ---------- */
const pad2 = n => String(n).padStart(2, '0');
function todayStr() { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function dayNum(str) { const [y, m, d] = str.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 864e5); }
function dailyInfo() {
  const d = state.daily, today = todayStr();
  if (d.last === today) return { can: false, idx: (d.streak - 1) % 7, streak: d.streak };
  const cont = d.last && dayNum(today) - dayNum(d.last) === 1;
  const next = cont ? d.streak + 1 : 1;
  return { can: true, idx: (next - 1) % 7, streak: next };
}
const rewardText = r => Object.entries(r).filter(([k]) => RES[k]).map(([k, v]) => `${v}${RES[k].e}`).join(' ') + (r.festival ? ' 🎆' : '');
function applyReward(r, mult = 1) {
  for (const [k, v] of Object.entries(r)) if (RES[k]) state.res[k] += v * mult;
  if (r.festival) { state.festCd = 0; }
}
function claimDaily(mult = 1) {
  const info = dailyInfo();
  if (!info.can) return false;
  state.daily = { last: todayStr(), streak: info.streak };
  Sfx.play('gift'); buzz(40);
  const r = DAILY[info.idx];
  applyReward(r, mult);
  toast(t('daily_got', rewardText(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, RES[k] ? v * mult : v])))));
  save();
  return true;
}
function openDaily() {
  const info = dailyInfo();
  const cells = DAILY.map((r, i) => {
    const done = info.can ? i < info.idx : i <= info.idx;
    const now = info.can && i === info.idx;
    return `<div class="day ${done ? 'done' : ''} ${now ? 'now' : ''} ${i === 6 ? 'big' : ''}"><b>${t('daily_day', i + 1)}</b><span class="em">${done ? '✅' : (i === 6 ? '🎁' : '🪙')}</span>${rewardText(r)}</div>`;
  }).join('');
  openModal({
    title: t('daily_title'),
    html: `<p class="muted">${t('daily_hint')}</p>${(info.can ? info.streak - 1 : info.streak) > 0 ? `<p class="big">${t('daily_streak', info.can ? info.streak - 1 : info.streak)}</p>` : ''}<div class="days">${cells}</div>${info.can ? '' : `<p class="muted">${t('daily_done')}</p>`}`,
    buttons: info.can ? [
      { label: t('daily_claim'), cls: 'primary', onclick: () => claimDaily(1) },
      { label: t('daily_double'), cls: 'ad', onclick: () => Ads.show(t('daily_reason'), () => claimDaily(2)) },
      { label: t('close'), cls: 'ghost' },
    ] : [{ label: t('close'), cls: 'ghost' }],
  });
}

/* ---------- gains hors-ligne ---------- */
function offlineGains() {
  const s = state;
  const away = Math.min(OFFLINE_CAP, Math.max(0, (Date.now() - (s.saved || Date.now())) / 1000));
  if (away < 90) return null;
  const r = rates(), k = away * OFFLINE_RATE;
  const g = { coins: Math.floor(r.coins * k), wood: Math.floor(r.wood * k), stone: Math.floor(r.stone * k) };
  if (g.coins + g.wood + g.stone < 1) return null;
  return { away, g };
}
function openOffline(o) {
  const show = (m = 1) => Object.entries(o.g).filter(([, v]) => v > 0).map(([k, v]) => `${v * m}${RES[k].e}`).join('  ');
  offlinePending = true;
  const take = m => { for (const [k, v] of Object.entries(o.g)) state.res[k] += v * m; offlinePending = false; save(); };
  openModal({
    title: t('offline_title'), dismissable: false,
    html: `<p>${t('offline_body', fmtDur(o.away))}</p><p class="big"><b>${show()}</b></p>`,
    buttons: [
      { label: t('offline_take'), cls: 'primary', onclick: () => take(1) },
      { label: t('offline_double'), cls: 'ad', onclick: () => Ads.show(t('offline_reason'), () => take(2)) },
    ],
  });
}

/* ==========================================================================
   VOLEUR & KOTWAL (mini-jeu)
   ========================================================================== */
function randomLandTile(near, maxD) {
  for (let k = 0; k < 40; k++) {
    const x = near ? near.x + rint(-maxD, maxD) : rint(1, COLS - 2), y = near ? near.y + rint(-maxD, maxD) : rint(1, ROWS - 2);
    if (isLand(x, y)) return { x, y };
  }
  return { x: CENTER.x, y: CENTER.y + 1 };
}
function spawnThief() {
  const list = state.buildings.filter(b => b.built);
  const b = pick(list);
  state.thief = { x: b.x, y: b.y, ttl: 9, move: 2.4 };
  Sfx.play('alert');
  toast(t('thief_toast'));
}
function catchThief() {
  const s = state, th = s.thief;
  if (!th) return;
  s.combo = Math.min(s.combo + 1, 9);
  const built = s.buildings.filter(b => b.built).length;
  const reward = Math.min(80, Math.round((8 + 3 * built) * (1 + .25 * Math.min(s.combo - 1, 4))));
  s.res.coins += reward; s.caught++; Sfx.play('catch'); buzz([15, 30, 15]);
  floatText(th.x + .5, th.y, `+${reward}🪙`, '#ffd56a');
  s.kotwal.tx = th.x + .5; s.kotwal.ty = th.y + .9; s.kotwal.dash = true; s.kotwal.wait = 1.2;
  toast(s.combo > 1 ? t('caught_combo', reward, s.combo) : t('caught', reward));
  s.thief = null; s.thiefT = rnd(35, 60);
}
function thiefEscaped() {
  const s = state, th = s.thief;
  const loss = Math.min(Math.floor(s.res.coins), clamp(Math.floor(s.res.coins * .1), 3, 30));
  s.res.coins -= loss; s.combo = 0; Sfx.play('fail');
  if (loss > 0) floatText(th.x + .5, th.y, `−${loss}🪙`, '#ff8a80');
  toast(loss > 0 ? t('escaped', loss) : t('escaped0'));
  s.thief = null; s.thiefT = rnd(35, 60);
}
function initCows() {
  cows.length = 0;
  for (let i = 0; i < 2; i++) { const p = randomLandTile(null, 0); cows.push({ x: p.x + .5, y: p.y + .5, tx: p.x + .5, ty: p.y + .5, wait: rnd(1, 4) }); }
}
function updateCows(dt) {
  for (const c of cows) {
    const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy);
    if (d > .05) { const st = Math.min(d, .45 * dt); c.x += dx / d * st; c.y += dy / d * st; continue; }
    c.wait -= dt;
    if (c.wait <= 0) {
      const p = randomLandTile({ x: Math.floor(c.x), y: Math.floor(c.y) }, 2);
      if (!buildingAt(p.x, p.y) && !nodeAt(p.x, p.y)) { c.tx = p.x + .5; c.ty = p.y + .5; }
      c.wait = rnd(2, 5);
    }
  }
}
function updateKotwal(dt) {
  const k = state.kotwal;
  const speed = k.dash ? 10 : 1.6;
  const dx = k.tx - k.x, dy = k.ty - k.y, d = Math.hypot(dx, dy);
  if (d > .05) { const st = Math.min(d, speed * dt); k.x += dx / d * st; k.y += dy / d * st; return; }
  if (k.dash) { k.dash = false; k.wait = 1; }
  k.wait -= dt;
  if (k.wait <= 0) {
    const list = state.buildings.filter(b => b.built);
    const b = list.length ? pick(list) : { x: CENTER.x, y: CENTER.y };
    k.tx = clamp(b.x + .5 + rnd(-.6, .6), 1.5, COLS - 1.5); k.ty = clamp(b.y + 1.3, 1.5, ROWS - 1.5);
    k.wait = rnd(2, 4);
  }
}

/* ==========================================================================
   BOUCLE DE MISE À JOUR
   ========================================================================== */
let saveTimer = 0, offlinePending = false;
function update(dt) {
  const s = state;
  s.t += dt;

  for (const n of s.nodes) if (n.stock <= 0 && s.t >= n.regrow) n.stock = NODE[n.kind].max;
  for (const b of s.buildings) if (!b.built) { b.left -= dt; if (b.left <= 0) finishBuilding(b); }

  // production
  const m = prodMult();
  for (const b of s.buildings) {
    const def = BUILDINGS[b.type];
    if (!b.built || !def.interval) continue;
    b.acc += dt * m * (b.worked ? 2 : 1) * lvlMult(b) / def.interval;
    while (b.acc >= 1) {
      b.acc -= 1;
      if (b.type === 'farm') give('grain', 1, b.x, b.y, undefined, true);
      else if (b.type === 'chai') give('coins', 2, b.x, b.y, undefined, true);
      else if (b.type === 'bazaar' && s.res.grain >= 1) { s.res.grain -= 1; give('coins', 3, b.x, b.y, undefined, true); }
    }
  }
  // les habitants ramassent du bois et de la pierre
  s.gatherAcc += dt * s.people.length / 25 * m;
  while (s.gatherAcc >= 1) {
    s.gatherAcc -= 1;
    const h = s.buildings.find(b => b.built && b.type === 'house');
    if (h) give(Math.random() < .6 ? 'wood' : 'stone', 1, h.x, h.y, undefined, true);
  }

  // nouveaux habitants (automatique)
  if (s.people.length < capacity()) {
    s.arrT -= dt;
    if (s.arrT <= 0) { addVillager(); s.arrT = rnd(18, 30); }
  }

  // festival
  if (s.festCd > 0 && !festLive()) s.festCd = Math.max(0, s.festCd - dt);

  // voleur
  if (s.thief) {
    const th = s.thief;
    th.ttl -= dt; th.move -= dt;
    if (th.move <= 0) { const p = randomLandTile(th, 2); th.x = p.x; th.y = p.y; th.move = 2.4; }
    if (th.ttl <= 0) thiefEscaped();
  } else if (s.buildings.filter(b => b.built).length >= 2) {
    s.thiefT -= dt;
    if (s.thiefT <= 0) spawnThief();
  }
  updateKotwal(dt);
  updateCows(dt);

  saveTimer += dt;
  if (saveTimer > 5) { saveTimer = 0; save(); }
}

/* ==========================================================================
   SAUVEGARDE
   ========================================================================== */
function save() {
  try { if (!offlinePending) state.saved = Date.now(); state.lang = LANG; localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* stockage indisponible */ }
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || d.v !== 1 || !Array.isArray(d.buildings) || !Array.isArray(d.nodes)) return null;
    const base = newState();
    const st = Object.assign(base, d);
    st.res = Object.assign(base.res, d.res);
    st.daily = Object.assign(base.daily, d.daily);
    st.kotwal = Object.assign(base.kotwal, d.kotwal || {});
    return st;
  } catch (e) { return null; }
}
function resetGame() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
  state = newState(); state.lang = LANG;
  rebuildGrids(); assignWorkers();
  placing = null; lastHarvest = null; fx.length = 0;
  closeModal(); renderHud(); renderHint(); renderBar();
  openIntro();
}

/* ==========================================================================
   INTERFACE
   ========================================================================== */
let modalOpen = false, modalOnClose = null, modalDismiss = true;
function openModal({ title, html, buttons = [], onclose = null, dismissable = true, onrender = null }) {
  $('#mTitle').textContent = title;
  $('#mBody').innerHTML = html || '';
  const foot = $('#mFoot'); foot.innerHTML = '';
  for (const b of buttons) {
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'btn ' + (b.cls || ''); el.innerHTML = b.label;
    if (b.id) el.id = b.id;
    if (b.disabled) el.disabled = true;
    el.addEventListener('click', () => {
      if (b.keepOpen) { b.onclick && b.onclick(); return; }
      closeModal(); b.onclick && b.onclick();
    });
    foot.appendChild(el);
  }
  $('#modal').hidden = false;
  modalOpen = true; modalOnClose = onclose; modalDismiss = dismissable;
  $('.sheet').scrollTop = 0;
  onrender && onrender($('#mBody'));
}
function closeModal() {
  if (!modalOpen) return;
  $('#modal').hidden = true; modalOpen = false;
  const f = modalOnClose; modalOnClose = null; f && f();
}
function toast(msg, ms = 3000) {
  const box = $('#toasts'), el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg; box.appendChild(el);
  while (box.children.length > 2) box.firstChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 450); }, ms);
}

const hudEls = {};
function initHud() {
  const hud = $('#hud'); hud.innerHTML = '';
  for (const k of Object.keys(RES)) {
    const c = document.createElement('div');
    c.className = 'chip'; c.title = t(k);
    c.innerHTML = `${RES[k].e}<b>0</b>`;
    if (EXCHANGE[k]) { c.classList.add('buy'); c.insertAdjacentHTML('beforeend', '<i>＋</i>'); c.addEventListener('click', () => { if (!modalOpen) openExchange(); }); }
    hud.appendChild(c); hudEls[k] = c.querySelector('b');
  }
  const pop = document.createElement('div'); pop.className = 'chip'; pop.title = t('people'); pop.innerHTML = '👥<b>0/0</b>';
  hud.appendChild(pop); hudEls.pop = pop.querySelector('b');
}
function renderHud() {
  const s = state;
  for (const k of Object.keys(RES)) {
    const el = hudEls[k], v = fmtNum(s.res[k]);
    if (el.textContent !== v) {
      if (parseInt(el.textContent, 10) < parseInt(v, 10) || (el.textContent !== v && v.endsWith('k'))) { const c = el.parentNode; c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
      el.textContent = v;
    }
    el.parentNode.title = t(k);
  }
  hudEls.pop.textContent = `${s.people.length}/${capacity()}`;
  const btn = $('#adBtn');
  if (lastHarvest && s.t - lastHarvest.t < 8) { btn.hidden = false; btn.textContent = t('harvest_double', lastHarvest.amt, RES[lastHarvest.res].e); }
  else { btn.hidden = true; lastHarvest = null; }
}
let barKey = '';
function renderBar() {
  const s = state, info = dailyInfo();
  const fest = festLive() ? `live|${Math.ceil(s.festUntil - s.t)}` : s.festCd <= 0 ? 'ready' : `wait|${Math.ceil(s.festCd / 5) * 5}`;
  const nudge = !s.buildings.some(b => b.type === 'farm');
  const key = `${LANG}|${info.can}|${fest}|${nudge}`;
  if (key === barKey) return;
  barKey = key;
  $('#bBuild').innerHTML = `<span>🔨</span>${t('tab_build')}`; $('#bBuild').classList.toggle('nudge', nudge);
  const g = $('#bGift'); g.innerHTML = `<span>🎁</span>${t('tab_gift')}`; g.classList.toggle('gift', info.can);
  const f = $('#bFest');
  f.classList.toggle('ready', !festLive() && s.festCd <= 0); f.classList.toggle('live', festLive());
  const sub = festLive() ? `🔥 ${Math.ceil(s.festUntil - s.t)} s` : s.festCd <= 0 ? t('fest_ready') : fmtDur(s.festCd);
  f.innerHTML = `<span>🎆</span>${t('tab_fest')}<small>${sub}</small>`;
  $('#bSet').innerHTML = `<span>⚙️</span>${t('tab_set')}`;
}
function currentHint() {
  const s = state, has = ty => s.buildings.some(b => b.type === ty);
  if (s.thief) return t('h_thief');
  if (!has('farm')) return t('h_start');
  if (!has('bazaar') && s.res.grain >= 15) return t('h_bazaar');
  if (!has('chai')) return t('h_chai');
  if (s.people.length >= capacity() && s.people.length >= 2 && countOf('house') < 3) return t('h_house');
  if (!has('bazaar')) return t('h_bazaar');
  if (!has('temple')) return t('h_temple');
  if (s.res.wood < 20) return s.res.coins >= 50 ? t('h_buy') : t('h_wood');
  return t('h_idle');
}
let lastHintKey = '';
function renderHint() {
  const el = $('#hint'), key = (placing ? 'P' + placing : currentHint()) + LANG;
  if (key === lastHintKey) return;
  lastHintKey = key;
  if (placing) {
    el.innerHTML = `<span class="grow">${t('place_hint', BUILDINGS[placing].e, bName(placing))}</span><button type="button" id="cancelPlace">${t('cancel')}</button>`;
    $('#cancelPlace').addEventListener('click', () => { placing = null; renderHint(); });
  } else el.innerHTML = `<span class="grow">${currentHint()}</span>`;
}
function applyLang() {
  document.documentElement.lang = LANG;
  document.title = t('title');
  initHud(); barKey = ''; lastHintKey = '';
  renderHud(); renderBar(); renderHint();
}

/* ---------- fenêtres ---------- */
function openIntro() {
  openModal({
    title: t('intro_title'), dismissable: false,
    html: `<p class="big">${t('intro_1')}</p><p>${t('intro_2')}</p><p>${t('intro_3')}</p><p class="muted">${t('intro_4')}</p>`,
    buttons: [{ label: t('intro_go'), cls: 'primary', onclick: () => { state.seenIntro = true; save(); afterIntro(); } }],
  });
}
function afterIntro() {
  const info = dailyInfo();
  if (info.can) openDaily();
}
function openBuildMenu() {
  const rows = ORDER.map(id => {
    const d = BUILDINGS[id], mx = maxed(id), ok = !mx && canAfford(costOf(id));
    return `<button type="button" class="row" data-b="${id}" ${ok ? '' : 'disabled'}>
      <span class="ico">${d.e}</span>
      <span class="grow"><span class="name">${bName(id)} ${d.max ? `<span class="pill ${mx ? 'on' : ''}">${countOf(id)}/${d.max}</span>` : ''}</span>
      <span class="desc">${t('d_' + id)}</span>
      <span class="cost">${mx ? t('max_reached') : costHtml(costOf(id)) + `<span>⏱️ ${t('secs', d.time)}</span>`}</span></span></button>`;
  }).join('');
  openModal({
    title: t('build_title'), html: rows, buttons: [{ label: t('close'), cls: 'ghost' }],
    onrender: body => body.querySelectorAll('[data-b]').forEach(el =>
      el.addEventListener('click', () => { closeModal(); startPlacing(el.dataset.b); })),
  });
}
function openBuildingModal(b) {
  const def = BUILDINGS[b.type];
  if (!b.built) {
    openModal({
      title: t('site_title', bName(b.type)),
      html: `<p class="big">${t('site_left', Math.ceil(b.left))}</p>`,
      buttons: [
        { label: t('site_ad'), cls: 'ad', onclick: () => Ads.show(t('site_ad_reason'), () => { if (!b.built) finishBuilding(b); }) },
        { label: t('close'), cls: 'ghost' },
      ],
    });
    return;
  }
  let body = `<p>${t('d_' + b.type)}</p>`;
  if (b.type === 'house') {
    const idx = builtOf('house').indexOf(b), occ = state.people.slice(idx * 2, idx * 2 + 2);
    body += occ.length
      ? `<p><b>${t('house_people')}</b></p>` + occ.map(p => `<div class="row"><span class="ico">🧑</span><span class="grow"><span class="name">${personName(p)}</span></span></div>`).join('')
      : `<p class="muted">${t('house_empty')}</p>`;
  } else if (def.work) {
    const w = state.people.find(p => p.id === b.workerId);
    body += b.worked && w ? `<p>${t('work_yes', personName(w))}</p>` : `<p class="muted">${t('work_no')}</p>`;
  } else if (b.type === 'temple') body += `<p>${t('temple_info', Math.round((templeBonus() - 1) * 100))}</p>`;
  const buttons = [];
  if (def.work) {
    const L = lvlOf(b);
    body += `<p><b>${t('lvl', L)}</b> <span class="muted">· ${t('lvl_info')}</span></p>`;
    if (L >= MAX_LVL) body += `<p>${t('lvl_max')}</p>`;
    else {
      const c = upCost(b);
      buttons.push({ label: `${t('up_btn', L + 1)}<br><small>${costHtml(c)}</small>`, cls: canAfford(c) ? 'primary' : '', onclick: () => { if (upgrade(b)) openBuildingModal(b); else openBuildingModal(b); } });
    }
  }
  buttons.push({ label: t('close'), cls: 'ghost' });
  openModal({ title: `${def.e} ${bName(b.type)}`, html: body, buttons });
}
function openSettings() {
  const langs = `<div class="langs">${[['fr', 'Français'], ['hi', 'हिन्दी'], ['en', 'English'], ['ta', 'தமிழ்'], ['bn', 'বাংলা'], ['mr', 'मराठी']].map(([c, n]) => `<button type="button" class="btn ${LANG === c ? 'sel' : ''}" data-lang="${c}">${n}</button>`).join('')}</div>`;
  const skins = SKINS.map(k => `<button type="button" class="row ${state.skin === k.id ? 'sel' : ''}" data-skin="${k.id}">
      <span class="ico">${k.e}</span><span class="grow"><span class="name">${t(k.n)}</span>
      <span class="desc">${state.skin === k.id ? t('skin_on') : t('skin_pick')}</span></span></button>`).join('');
  const snd = `<button type="button" class="row" data-snd="1"><span class="ico">${state.sound === false ? '🔇' : '🔊'}</span><span class="grow"><span class="name">${t('snd')}</span><span class="desc">${state.sound === false ? t('snd_off') : t('snd_on')}</span></span></button>`;
  openModal({
    title: t('set_title'),
    html: `<p><b>${t('set_lang')}</b></p>${langs}${snd}<p><b>${t('set_skin')}</b></p>${skins}<p class="muted">${t('skin_note')}</p>`,
    buttons: [{ label: t('reset'), cls: 'ghost', onclick: openResetConfirm }, { label: t('close'), cls: 'primary' }],
    onrender: body => {
      body.querySelectorAll('[data-lang]').forEach(el => el.addEventListener('click', () => { LANG = el.dataset.lang; state.lang = LANG; state.langChosen = true; save(); applyLang(); openSettings(); }));
      body.querySelectorAll('[data-snd]').forEach(el => el.addEventListener('click', () => { state.sound = state.sound === false; save(); if (state.sound) Sfx.play('coin'); openSettings(); }));
      body.querySelectorAll('[data-skin]').forEach(el => el.addEventListener('click', () => { state.skin = el.dataset.skin; save(); openSettings(); }));
    },
  });
}
function openResetConfirm() {
  openModal({
    title: t('reset_q'), html: `<p>${t('reset_body')}</p>`,
    buttons: [{ label: t('reset_yes'), cls: 'primary', onclick: resetGame }, { label: t('cancel'), cls: 'ghost' }],
  });
}

/* ==========================================================================
   PUBLICITÉS RÉCOMPENSÉES (SIMULATION)
   Remplace `Ads.show` par le SDK de ton choix (AdMob, etc.) : appelle
   `onReward()` seulement si la pub a été regardée en entier.
   ========================================================================== */
const Sfx = {
  ctx: null,
  init() {
    if (!this.ctx) { try { const C = window.AudioContext || window.webkitAudioContext; if (C) this.ctx = new C(); } catch (e) { /* pas d'audio */ } }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  },
  tone(f, d, type = 'sine', vol = .1, delay = 0, to = 0) {
    const c = this.ctx;
    if (!c || !state || state.sound === false) return;
    const t0 = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + d);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + d + .02);
  },
  seq(notes, d, type, vol, gap) { notes.forEach((f, i) => this.tone(f, d, type, vol, i * gap)); },
  play(n) {
    if (n === 'tap') this.tone(560, .06, 'triangle', .09, 0, 820);
    else if (n === 'coin') this.seq([880, 1320], .09, 'square', .05, .07);
    else if (n === 'build') this.seq([523, 659, 784], .12, 'triangle', .1, .09);
    else if (n === 'catch') this.seq([660, 880, 1100, 1320], .09, 'square', .06, .07);
    else if (n === 'fail') this.tone(300, .25, 'sawtooth', .06, 0, 150);
    else if (n === 'alert') this.seq([740, 740], .1, 'square', .06, .14);
    else if (n === 'gift') this.seq([523, 659, 784, 1047], .13, 'triangle', .1, .1);
    else if (n === 'fest') this.seq([392, 523, 659, 784, 1047], .14, 'triangle', .1, .09);
  },
};
function buzz(p) { try { if (state && state.sound !== false && navigator.vibrate) navigator.vibrate(p); } catch (e) { /* ignoré */ } }

const Ads = {
  show(reason, onReward) {
    const total = 3; let left = total;
    const iv = setInterval(() => {
      left = Math.max(0, left - .1);
      const bar = $('.adbar i'), txt = $('.adtxt'), ok = $('#adOk');
      if (!bar) return;
      bar.style.width = `${(1 - left / total) * 100}%`;
      txt.textContent = t('ad_wait', Math.ceil(left));
      if (left <= 0 && ok) { ok.disabled = false; txt.textContent = t('ad_ready'); clearInterval(iv); }
    }, 100);
    openModal({
      title: t('ad_title'), dismissable: false,
      html: `<div class="adbox"><div class="tv">📺</div><p>${reason}</p><div class="adbar"><i></i></div><p class="adtxt muted">${t('ad_wait', 3)}</p></div><p class="muted">${t('ad_note')}</p>`,
      onclose: () => clearInterval(iv),
      buttons: [
        { label: t('ad_take'), cls: 'ad', id: 'adOk', disabled: true, onclick: () => { if (left <= 0) onReward(); } },
        { label: t('ad_skip'), cls: 'ghost' },
      ],
    });
  },
};

/* ==========================================================================
   RENDU
   ========================================================================== */
const canvas = $('#c'), ctx = canvas.getContext('2d');
const terrain = document.createElement('canvas'), tctx = terrain.getContext('2d');
let W = 0, H = 0, ts = 24, ox = 0, oy = 0, dpr = 1, clock = 0;
let sparkles = [];

function resize() {
  const r = canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = Math.max(1, r.width); H = Math.max(1, r.height);
  canvas.width = terrain.width = Math.round(W * dpr);
  canvas.height = terrain.height = Math.round(H * dpr);
  ts = Math.max(8, Math.floor(Math.min(W / COLS, H / ROWS)));
  ox = Math.floor((W - ts * COLS) / 2); oy = Math.floor((H - ts * ROWS) / 2);
  paintTerrain();
}
function rr(c, x, y, w, h, r) {
  const [tl, tr, br, bl] = typeof r === 'number' ? [r, r, r, r] : r;
  c.beginPath();
  c.moveTo(x + tl, y);
  c.lineTo(x + w - tr, y); c.arcTo(x + w, y, x + w, y + tr, tr);
  c.lineTo(x + w, y + h - br); c.arcTo(x + w, y + h, x + w - br, y + h, br);
  c.lineTo(x + bl, y + h); c.arcTo(x, y + h, x, y + h - bl, bl);
  c.lineTo(x, y + tl); c.arcTo(x, y, x + tl, y, tl);
  c.closePath();
}
function landPath(c, x, y, off) {
  const X = ox + x * ts, Y = oy + y * ts + off, r = ts * .5;
  const w = (dx, dy) => !isLand(x + dx, y + dy);
  rr(c, X, Y, ts + .6, ts + .6, [w(-1, 0) && w(0, -1) ? r : 0, w(1, 0) && w(0, -1) ? r : 0, w(1, 0) && w(0, 1) ? r : 0, w(-1, 0) && w(0, 1) ? r : 0]);
}
function paintTerrain() {
  const c = tctx;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.fillStyle = '#2a9bb0'; c.fillRect(0, 0, W, H);
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (isLand(x, y)) continue;
    let d = 9;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (isLand(x + dx, y + dy)) d = Math.min(d, Math.max(Math.abs(dx), Math.abs(dy)));
    c.fillStyle = d <= 1 ? '#5cc6d4' : d === 2 ? '#43b2c4' : (hash2(x, y) < .5 ? '#2a9bb0' : '#2fa3b8');
    c.fillRect(ox + x * ts, oy + y * ts, ts + .6, ts + .6);
  }
  c.fillStyle = '#2a9bb0';
  c.fillRect(0, 0, W, oy); c.fillRect(0, oy + ts * ROWS, W, H); c.fillRect(0, 0, ox, H); c.fillRect(ox + ts * COLS, 0, W, H);
  c.fillStyle = '#c9a86a';
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (isLand(x, y)) { landPath(c, x, y, ts * .16); c.fill(); }
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (!isLand(x, y)) continue;
    const edge = !isLand(x + 1, y) || !isLand(x - 1, y) || !isLand(x, y + 1) || !isLand(x, y - 1), h = hash2(x, y);
    c.fillStyle = edge ? '#efd18f' : h < .33 ? '#a5c966' : h < .66 ? '#9cc25e' : '#aed06f';
    landPath(c, x, y, 0); c.fill();
    if (!edge && hash2(y, x) < .14) {
      c.fillStyle = hash2(x + 3, y) < .6 ? '#ffb01c' : '#ff6b9a';   // soucis (marigold) et fleurs roses
      c.beginPath(); c.arc(ox + (x + .3) * ts, oy + (y + .65) * ts, ts * .06, 0, 7); c.fill();
    }
  }
  // guirlande de fanions (toran) au-dessus de l'île
  const gx0 = ox + ts * .2, gx1 = ox + ts * COLS - ts * .2, gy = oy + ts * .1, FL = ['#f08a1c', '#e8668f', '#f6c22e', '#2fa89f', '#d6336c'];
  c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = Math.max(1, ts * .03); c.beginPath();
  for (let i = 0; i <= 40; i++) { const tt = i / 40, x = gx0 + (gx1 - gx0) * tt, y = gy + Math.sin(Math.PI * tt) * ts * .22; i ? c.lineTo(x, y) : c.moveTo(x, y); }
  c.stroke();
  const nFl = Math.max(8, Math.round((gx1 - gx0) / (ts * .5)));
  for (let i = 0; i < nFl; i++) {
    const tt = (i + .5) / nFl, x = gx0 + (gx1 - gx0) * tt, y = gy + Math.sin(Math.PI * tt) * ts * .22;
    c.fillStyle = FL[i % FL.length]; c.beginPath(); c.moveTo(x - ts * .12, y); c.lineTo(x + ts * .12, y); c.lineTo(x, y + ts * .28); c.closePath(); c.fill();
  }
  sparkles = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++)
    if (!isLand(x, y) && hash2(x + 9, y + 4) < .12) sparkles.push({ x: x + hash2(y, x), y: y + hash2(x, y + 7), ph: hash2(x, y) * 6.28 });
}
function emoji(ch, cx, cy, size, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#000';   // les emoji couleur héritent de l'alpha du fillStyle précédent
  ctx.font = `${size}px ${EMOJI_FONT}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(ch, cx, cy + size * .06);
  ctx.globalAlpha = 1;
}
const px = x => ox + x * ts, py = y => oy + y * ts;
function floatText(x, y, text, color = '#fff', auto = false) {
  // la production automatique reste discrète : 3 textes à la fois, petits et brefs
  if (auto && fx.filter(f => f.auto).length >= 3) return;
  fx.push({ x, y, text, color, age: 0, life: auto ? .8 : 1.2, auto });
  if (fx.length > 16) fx.shift();
}

function render(dt) {
  clock += dt;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.drawImage(terrain, 0, 0, W, H);
  ctx.lineWidth = 1.5;
  for (const sp of sparkles) {
    const a = .5 + .5 * Math.sin(clock * 2 + sp.ph);
    if (a < .6) continue;
    ctx.strokeStyle = `rgba(255,255,255,${a * .5})`;
    ctx.beginPath(); ctx.moveTo(px(sp.x), py(sp.y)); ctx.lineTo(px(sp.x) + ts * .22, py(sp.y)); ctx.stroke();
  }
  if (!state) return;
  const s = state;

  if (placing) {
    const pulse = .28 + .12 * Math.sin(clock * 5);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if (!isLand(x, y)) continue;
      const ok = !canPlace(placing, x, y);
      ctx.fillStyle = ok ? `rgba(60,200,100,${pulse + .1})` : 'rgba(0,0,0,.16)';
      rr(ctx, px(x) + 1.5, py(y) + 1.5, ts - 3, ts - 3, ts * .2); ctx.fill();
    }
    if (hover && !canPlace(placing, hover.x, hover.y)) emoji(BUILDINGS[placing].e, px(hover.x) + ts / 2, py(hover.y) + ts * .45, ts * .85, .7);
  }

  const items = [];
  for (const n of s.nodes) items.push({ y: n.y + .5, f: () => drawNode(n) });
  for (const b of s.buildings) items.push({ y: b.y + .6, f: () => drawBuilding(b) });
  items.push({ y: s.kotwal.y, f: drawKotwal });
  for (const c of cows) items.push({ y: c.y, f: () => emoji('🐄', px(c.x), py(c.y) - ts * .08, ts * .5) });
  for (const b of s.buildings) if (b.built && b.type === 'temple') items.push({ y: b.y + 1.05, f: () => emoji('🦚', px(b.x) + ts * .1, py(b.y) + ts * .98, ts * .34) });
  if (s.thief) items.push({ y: s.thief.y + 2, f: drawThief });
  items.sort((a, b) => a.y - b.y);
  for (const it of items) it.f();

  if (festLive()) drawDiwali(dt);
  for (let i = fx.length - 1; i >= 0; i--) {
    const f = fx[i]; f.age += dt;
    if (f.age > f.life) { fx.splice(i, 1); continue; }
    const k = f.age / f.life;
    ctx.globalAlpha = (1 - k * k) * (f.auto ? .85 : 1);
    ctx.font = `800 ${Math.max(11, ts * (f.auto ? .34 : .46))}px system-ui, "Noto Sans Devanagari", ${EMOJI_FONT}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.55)';
    const X = px(f.x), Y = py(f.y) - k * ts * .9;
    ctx.strokeText(f.text, X, Y); ctx.fillStyle = f.color; ctx.fillText(f.text, X, Y);
    ctx.globalAlpha = 1;
  }
}
const fireworks = []; let fwT = 0;
function drawDiwali(dt) {
  const g = ctx.createRadialGradient(W / 2, H / 2, ts, W / 2, H / 2, Math.max(W, H) * .7);
  g.addColorStop(0, 'rgba(255,170,60,.16)'); g.addColorStop(1, 'rgba(120,20,60,.22)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const [x, y] of [[2, 0], [5, 0], [8, 0], [2, ROWS - 1], [5, ROWS - 1], [8, ROWS - 1], [0, 3], [0, 6], [0, 9], [COLS - 1, 3], [COLS - 1, 6], [COLS - 1, 9]])
    emoji('🪔', px(x) + ts / 2, py(y) + ts / 2, ts * .5, .75 + .25 * Math.sin(clock * 6 + x * 3 + y));
  fwT -= dt;
  if (fwT <= 0 && fireworks.length < 5) {
    fwT = rnd(.35, .7);
    const parts = []; for (let k = 0; k < 16; k++) parts.push({ a: k / 16 * 6.283, v: rnd(.7, 1.2) });
    fireworks.push({ cx: ox + rnd(.1, .9) * ts * COLS, cy: oy + rnd(.08, .55) * ts * ROWS, col: pick(['#ffd24a', '#ff6b9a', '#7fe0ff', '#ff9a3c', '#b58cff']), parts, age: 0 });
  }
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const f = fireworks[i]; f.age += dt;
    if (f.age > 1) { fireworks.splice(i, 1); continue; }
    ctx.fillStyle = f.col; ctx.globalAlpha = 1 - f.age;
    for (const q of f.parts) { ctx.beginPath(); ctx.arc(f.cx + Math.cos(q.a) * q.v * f.age * ts * 2.2, f.cy + Math.sin(q.a) * q.v * f.age * ts * 2.2 + f.age * f.age * ts * .8, ts * .055, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
}
function drawNode(n) {
  const def = NODE[n.kind], X = px(n.x) + ts / 2, Y = py(n.y) + ts / 2;
  if (n.stock > 0) {
    ctx.fillStyle = 'rgba(30,60,20,.22)';
    ctx.beginPath(); ctx.ellipse(X, Y + ts * .3, ts * .34, ts * .1, 0, 0, 7); ctx.fill();
    emoji(def.emojis[n.v] || def.emojis[0], X, Y - ts * .1, n.kind === 'tree' ? ts : ts * .8);
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    for (let k = 0; k < n.stock; k++) { ctx.beginPath(); ctx.arc(X - (n.stock - 1) * ts * .07 + k * ts * .14, Y + ts * .42, ts * .04, 0, 7); ctx.fill(); }
  } else emoji(n.kind === 'tree' ? '🌱' : '🪨', X, Y, ts * .45, .5);
}
const HOUSE_COLORS = ['#e8668f', '#35b3ad', '#f3c443', '#ee8a3a', '#7a6ad8'];
const SKIN_TONES = ['#c68642', '#a86b3c', '#e0ac69', '#8d5524'];
const CLOTHES = ['#e8668f', '#f3c443', '#35b3ad', '#ee8a3a', '#7a6ad8', '#d94f4f'];

function drawPerson(cx, cy, size, seed) {
  const sk = SKIN_TONES[seed % 4], cl = CLOTHES[(seed * 3 + 1) % 6];
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(cx, cy + size * .12, size * .26, size * .08, 0, 0, 7); ctx.fill();
  ctx.fillStyle = cl; rr(ctx, cx - size * .22, cy - size * .38, size * .44, size * .52, size * .16); ctx.fill();
  ctx.fillStyle = sk; ctx.beginPath(); ctx.arc(cx, cy - size * .52, size * .2, 0, 7); ctx.fill();
  ctx.fillStyle = seed % 2 ? '#f08a1c' : '#2b2118';          // turban ou cheveux
  ctx.beginPath(); ctx.arc(cx, cy - size * .57, size * .21, Math.PI, 0); ctx.fill();
}

function scallops(x, y, w, h, n, colors) {
  const sw = w / n;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath(); ctx.moveTo(x + i * sw, y); ctx.lineTo(x + (i + 1) * sw, y); ctx.lineTo(x + (i + 1) * sw, y + h);
    ctx.arc(x + (i + .5) * sw, y + h, sw / 2, 0, Math.PI); ctx.closePath(); ctx.fill();
  }
}

function drawArt(type, X, Y, b) {
  const u = ts, c = ctx;
  if (type === 'house') {
    c.fillStyle = HOUSE_COLORS[(b.x * 7 + b.y * 3) % 5]; rr(c, X + u * .16, Y + u * .42, u * .68, u * .46, u * .05); c.fill();
    c.fillStyle = '#b4503a'; c.beginPath(); c.moveTo(X + u * .08, Y + u * .46); c.lineTo(X + u * .5, Y + u * .14); c.lineTo(X + u * .92, Y + u * .46); c.closePath(); c.fill();
    c.fillStyle = '#8c3a28'; c.fillRect(X + u * .1, Y + u * .44, u * .8, u * .04);
    c.fillStyle = '#5a3420'; rr(c, X + u * .43, Y + u * .62, u * .14, u * .26, [u * .07, u * .07, 0, 0]); c.fill();
    c.fillStyle = '#fff3c4'; c.fillRect(X + u * .24, Y + u * .54, u * .12, u * .12); c.fillRect(X + u * .64, Y + u * .54, u * .12, u * .12);
  } else if (type === 'farm') {
    c.fillStyle = '#8a5a34'; rr(c, X + u * .1, Y + u * .28, u * .8, u * .6, u * .08); c.fill();
    for (let i = 0; i < 4; i++) {
      const y = Y + u * (.36 + i * .13);
      c.fillStyle = i % 2 ? '#7cc04a' : '#6ab13e'; rr(c, X + u * .16, y, u * .5, u * .08, u * .04); c.fill();
      c.fillStyle = '#f0c23a'; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(X + u * (.22 + k * .12), y + u * .02, u * .028, 0, 7); c.fill(); }
    }
    c.fillStyle = '#e6b94a'; c.beginPath(); c.moveTo(X + u * .66, Y + u * .8); c.lineTo(X + u * .78, Y + u * .38); c.lineTo(X + u * .9, Y + u * .8); c.closePath(); c.fill();
    c.strokeStyle = '#b98a1e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(X + u * .72, Y + u * .62); c.lineTo(X + u * .84, Y + u * .62); c.stroke();
  } else if (type === 'chai') {
    c.fillStyle = '#8a5a34'; rr(c, X + u * .14, Y + u * .55, u * .72, u * .33, u * .05); c.fill();
    scallops(X + u * .12, Y + u * .22, u * .76, u * .22, 6, ['#f2a21c', '#9c2a3a']);
    c.fillStyle = '#4a3a30'; c.beginPath(); c.arc(X + u * .3, Y + u * .52, u * .1, 0, 7); c.fill();
    c.fillRect(X + u * .36, Y + u * .46, u * .1, u * .03);
    c.fillStyle = '#fff'; rr(c, X + u * .58, Y + u * .43, u * .14, u * .17, u * .03); c.fill();
    c.fillStyle = '#b86a2e'; c.fillRect(X + u * .6, Y + u * .5, u * .1, u * .08);
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = Math.max(1.2, u * .03);
    for (let k = 0; k < 2; k++) {
      const sx = X + u * (.62 + k * .06), ph = clock * 3 + k * 2;
      c.beginPath(); c.moveTo(sx, Y + u * .42); c.quadraticCurveTo(sx + Math.sin(ph) * u * .05, Y + u * .35, sx, Y + u * .28); c.stroke();
    }
  } else if (type === 'bazaar') {
    c.fillStyle = '#7a4a2a'; rr(c, X + u * .1, Y + u * .6, u * .8, u * .28, u * .05); c.fill();
    const sp = ['#d63a2f', '#f2b01c', '#e8681a', '#6aa84f', '#c9356b'];
    for (let i = 0; i < 5; i++) {
      const x = X + u * (.2 + i * .15), y = Y + u * .64;
      c.fillStyle = sp[i]; c.beginPath(); c.moveTo(x - u * .07, y); c.lineTo(x, y - u * .13); c.lineTo(x + u * .07, y); c.closePath(); c.fill();
    }
    c.fillStyle = '#5a3420'; c.fillRect(X + u * .12, Y + u * .3, u * .03, u * .32); c.fillRect(X + u * .85, Y + u * .3, u * .03, u * .32);
    scallops(X + u * .08, Y + u * .14, u * .84, u * .2, 7, ['#d6336c', '#f6c22e', '#1fa6a0']);
  } else if (type === 'temple') {
    c.fillStyle = '#efe2c8'; rr(c, X + u * .1, Y + u * .8, u * .8, u * .1, u * .03); c.fill(); rr(c, X + u * .17, Y + u * .71, u * .66, u * .1, u * .03); c.fill();
    c.fillStyle = '#f6ead0'; c.fillRect(X + u * .26, Y + u * .5, u * .48, u * .22);
    c.fillStyle = '#8a2a1f'; rr(c, X + u * .43, Y + u * .57, u * .14, u * .15, [u * .07, u * .07, 0, 0]); c.fill();
    for (let i = 0; i < 4; i++) {
      const w = u * (.5 - i * .1);
      c.fillStyle = i % 2 ? '#f08a1c' : '#e0641a'; rr(c, X + u * .5 - w / 2, Y + u * (.4 - i * .09), w, u * .11, u * .03); c.fill();
    }
    c.fillStyle = '#f6c22e'; c.beginPath(); c.arc(X + u * .5, Y + u * .07, u * .045, 0, 7); c.fill();
    c.strokeStyle = '#6b4a2a'; c.lineWidth = Math.max(1, u * .025); c.beginPath(); c.moveTo(X + u * .5, Y + u * .03); c.lineTo(X + u * .5, Y + u * .14); c.stroke();
    const wv = Math.sin(clock * 4) * u * .025;
    c.fillStyle = '#f08a1c'; c.beginPath(); c.moveTo(X + u * .5, Y + u * .03); c.lineTo(X + u * .68 + wv, Y + u * .07); c.lineTo(X + u * .5, Y + u * .11); c.closePath(); c.fill();
  }
}

function drawBuilding(b) {
  const def = BUILDINGS[b.type], X = px(b.x), Y = py(b.y), u = ts;
  ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.ellipse(X + u * .5, Y + u * .9, u * .42, u * .1, 0, 0, 7); ctx.fill();
  if (!b.built) {
    ctx.fillStyle = '#cdbb9d'; rr(ctx, X + u * .1, Y + u * .3, u * .8, u * .58, u * .12); ctx.fill();
    emoji('🚧', X + u / 2, Y + u * .45, u * .7);
    const k = 1 - b.left / def.time;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(ctx, X + u * .12, Y + u * .8, u * .76, u * .13, u * .06); ctx.fill();
    ctx.fillStyle = '#f4b73e'; rr(ctx, X + u * .12, Y + u * .8, Math.max(u * .1, u * .76 * k), u * .13, u * .06); ctx.fill();
    return;
  }
  drawArt(b.type, X, Y, b);
  if (b.type === 'house') {
    const idx = builtOf('house').indexOf(b), occ = state.people.slice(idx * 2, idx * 2 + 2);
    occ.forEach((p, i) => drawPerson(X + u * (.3 + i * .4), Y + u * .94, u * .34, p.id));
  } else if (def.work && b.worked) {
    const w = state.people.find(p => p.id === b.workerId);
    if (w) drawPerson(X + u * .86, Y + u * .94, u * .36, w.id);
  }
  if (def.work && lvlOf(b) > 1) {
    ctx.fillStyle = '#f08a1c'; ctx.beginPath(); ctx.arc(X + u * .15, Y + u * .17, u * .16, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `800 ${Math.round(u * .22)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(lvlOf(b), X + u * .15, Y + u * .18);
  }
}
function drawKotwal() {
  const k = state.kotwal, X = px(k.x), Y = py(k.y), skin = SKINS.find(q => q.id === state.skin) || SKINS[0];
  const moving = Math.hypot(k.tx - k.x, k.ty - k.y) > .05, bob = moving ? Math.abs(Math.sin(clock * 12)) * ts * .08 : 0;
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath(); ctx.ellipse(X, Y + ts * .3, ts * .32, ts * .1, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,250,235,.92)'; ctx.strokeStyle = '#e0a526'; ctx.lineWidth = Math.max(2, ts * .07);
  ctx.beginPath(); ctx.arc(X, Y - bob - ts * .02, ts * .44, 0, 7); ctx.fill(); ctx.stroke();
  emoji(skin.e, X, Y - bob + ts * .03, ts * .66);
  emoji('👮', X, Y - bob - ts * .44, ts * .44);
}
function drawThief() {
  const th = state.thief, X = px(th.x) + ts / 2, Y = py(th.y) - ts * .05 - Math.abs(Math.sin(clock * 6)) * ts * .12, k = th.ttl / 9;
  ctx.fillStyle = 'rgba(255,255,255,.92)';
  ctx.beginPath(); ctx.arc(X, Y, ts * .5, 0, 7); ctx.fill();
  ctx.strokeStyle = k < .35 ? '#e53935' : '#ff7a59'; ctx.lineWidth = Math.max(2.5, ts * .09);
  ctx.beginPath(); ctx.arc(X, Y, ts * .5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
  emoji('🦹', X, Y, ts * .62);
}

/* ==========================================================================
   ENTRÉES
   ========================================================================== */
function onTap(clientX, clientY) {
  if (modalOpen || !state) return;
  const r = canvas.getBoundingClientRect();
  const fx_ = (clientX - r.left - ox) / ts, fy_ = (clientY - r.top - oy) / ts;
  const tx = Math.floor(fx_), ty = Math.floor(fy_), s = state;
  if (placing) { if (tx >= 0 && ty >= 0 && tx < COLS && ty < ROWS) placeBuilding(placing, tx, ty); return; }
  if (s.thief && Math.hypot(fx_ - (s.thief.x + .5), fy_ - (s.thief.y + .4)) < 1.25) { catchThief(); return; }
  const b = buildingAt(tx, ty);
  if (b) { openBuildingModal(b); return; }
  let nn = null, nd = .75;
  for (const n of s.nodes) { const d = Math.hypot(fx_ - (n.x + .5), fy_ - (n.y + .5)); if (d < nd) { nd = d; nn = n; } }
  if (nn) harvest(nn);
}
document.addEventListener('pointerdown', () => Sfx.init(), true);   // l'audio ne démarre qu'après un geste du joueur
canvas.addEventListener('pointerdown', e => { e.preventDefault(); onTap(e.clientX, e.clientY); });
canvas.addEventListener('pointermove', e => {
  if (!placing) return;
  const r = canvas.getBoundingClientRect();
  hover = { x: Math.floor((e.clientX - r.left - ox) / ts), y: Math.floor((e.clientY - r.top - oy) / ts) };
});
canvas.addEventListener('contextmenu', e => e.preventDefault());
$('#modal').addEventListener('pointerdown', e => { if (e.target.id === 'modal' && modalDismiss) closeModal(); });
$('#bBuild').addEventListener('click', () => { if (!modalOpen) { placing = null; openBuildMenu(); } });
$('#bGift').addEventListener('click', () => { if (!modalOpen) openDaily(); });
$('#bFest').addEventListener('click', () => { if (!modalOpen) openFestival(); });
$('#bSet').addEventListener('click', () => { if (!modalOpen) openSettings(); });
$('#adBtn').addEventListener('click', () => {
  if (modalOpen || !lastHarvest) return;
  const h = lastHarvest;
  Ads.show(t('harvest_double_reason'), () => { state.res[h.res] += h.amt; floatText(h.x + .5, h.y, `+${h.amt}${RES[h.res].e} ×2`, '#ffd56a'); lastHarvest = null; });
});
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (modalOpen && modalDismiss) closeModal(); else if (placing) { placing = null; renderHint(); }
});
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 150));
document.addEventListener('visibilitychange', () => {
  if (!state) return;
  if (document.hidden) { save(); return; }
  if (!modalOpen && !offlinePending) { const o = offlineGains(); if (o) openOffline(o); }
});
window.addEventListener('pagehide', () => { if (state) save(); });

/* ==========================================================================
   DÉMARRAGE
   ========================================================================== */
let lastT = performance.now(), hudT = 0, frameAcc = 0;
function frame(now) {
  const dt = Math.min(.1, (now - lastT) / 1000);
  lastT = now;
  frameAcc += dt;
  // ~30 images/s suffisent : économise batterie et téléphones d'entrée de gamme
  if (frameAcc >= 1 / 32) {
    const step = frameAcc; frameAcc = 0;
    if (!modalOpen) update(step);
    render(step);
    hudT += step;
    if (hudT > .25) { hudT = 0; renderHud(); renderBar(); renderHint(); }
  }
  requestAnimationFrame(frame);
}
function init() {
  MAP = genMap();
  const saved = load();
  LANG = saved && saved.langChosen && I18N[saved.lang] ? saved.lang : 'fr';   // français par défaut, sauf choix explicite du joueur
  state = saved || newState();
  rebuildGrids(); assignWorkers();
  applyLang(); resize(); initCows();
  if (!state.seenIntro) openIntro();
  else {
    const o = saved ? offlineGains() : null;
    if (o) openOffline(o);
    else afterIntro();
  }
  requestAnimationFrame(frame);
}
init();

// Accès pour les tests / le débogage : window.__gb
window.__gb = {
  get state() { return state; }, get lang() { return LANG; },
  update, harvest, upgrade, Sfx, initCows, exchange, openExchange, upCost, placeBuilding, startPlacing, finishBuilding, costOf, rates, spawnThief, catchThief,
  claimDaily, dailyInfo, openDaily, openFestival, startFestival, openSettings, openBuildMenu, closeModal, save,
  offlineGains, openOffline, resetGame, t, Ads,
  get modalOpen() { return modalOpen; },
  get view() { return { ts, ox, oy, W, H }; },
};

})();
