import React, { useState, useEffect } from 'react';
import { WILAYAS_LIST, WilayaData } from './wilayasList';
import { WilayaLoginModal } from './WilayaLoginModal';

const GITHUB_IMAGES_BASE = 'https://raw.githubusercontent.com/hamidibachireduc-png/snte-map-69/main/images/';

const getWhatsAppLink = (phone: string) => {
  if (!phone) return '#';
  const cleanPhone = phone.split('-')[0].replace(/\D/g, ''); 
  const formatted = cleanPhone.startsWith('0') ? `213${cleanPhone.substring(1)}` : cleanPhone;
  return `https://wa.me/${formatted}`;
};

const getGoogleMapsLink = (hq: string) => {
  if (!hq) return '#';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hq + ' الجزائر')}`;
};

export const REGIONAL_OFFICES: Record<string, { id: string, name: string, color: string, count: number }> = {
  WEST: { id: 'WEST', name: 'الغرب', color: '#ea580c', count: 14 },
  EAST: { id: 'EAST', name: 'الشرق', color: '#2563eb', count: 14 },
  CENTER_1: { id: 'CENTER_1', name: 'الوسط 01', color: '#16a34a', count: 4 },
  CENTER_2: { id: 'CENTER_2', name: 'الوسط 02', color: '#9333ea', count: 6 },
  SOUTH_EAST: { id: 'SOUTH_EAST', name: 'الجنوب الشرقي', color: '#4f46e5', count: 8 },
  SOUTH_WEST: { id: 'SOUTH_WEST', name: 'الجنوب الغربي', color: '#b45309', count: 10 },
  SOUTH_CENTER: { id: 'SOUTH_CENTER', name: 'جنوب الوسط', color: '#db2777', count: 13 },
};

// خريطة ربط كل ولاية (برقمها) بالجهة التابعة لها (تم تحديثها لتشمل كل الـ 69 ولاية)
export const WILAYA_TO_REGION: Record<string, string> = {
  // الوسط 01
  "16": "CENTER_1", "9": "CENTER_1", "42": "CENTER_1", "44": "CENTER_1",
  // الوسط 02
  "15": "CENTER_2", "10": "CENTER_2", "35": "CENTER_2", "34": "CENTER_2", "6": "CENTER_2", "26": "CENTER_2",
  // الغرب
  "31": "WEST", "13": "WEST", "22": "WEST", "29": "WEST", "46": "WEST", "27": "WEST", "20": "WEST", "48": "WEST", "14": "WEST", "38": "WEST", "2": "WEST", "45": "WEST", "61": "WEST", "67": "WEST",
  // الشرق
  "25": "EAST", "23": "EAST", "24": "EAST", "21": "EAST", "12": "EAST", "41": "EAST", "40": "EAST", "5": "EAST", "43": "EAST", "19": "EAST", "36": "EAST", "18": "EAST", "39": "EAST", "63": "EAST",
  // جنوب الوسط
  "17": "SOUTH_CENTER", "3": "SOUTH_CENTER", "47": "SOUTH_CENTER", "28": "SOUTH_CENTER", "64": "SOUTH_CENTER", "68": "SOUTH_CENTER", "69": "SOUTH_CENTER", "59": "SOUTH_CENTER",
  // الجنوب الشرقي
  "30": "SOUTH_EAST", "33": "SOUTH_EAST", "7": "SOUTH_EAST", "57": "SOUTH_EAST", "56": "SOUTH_EAST", "62": "SOUTH_EAST", "65": "SOUTH_EAST",
  // الجنوب الغربي
  "8": "SOUTH_WEST", "1": "SOUTH_WEST", "37": "SOUTH_WEST", "11": "SOUTH_WEST", "52": "SOUTH_WEST", "60": "SOUTH_WEST", "58": "SOUTH_WEST",
  // تمت إضافة الولايات الناقصة إلى الجهات المناسبة 
  "4": "EAST", // أم البواقي
  "32": "SOUTH_WEST", // البيض
  "49": "SOUTH_EAST", // المغير
  "50": "SOUTH_WEST", // المنيعة
  "51": "SOUTH_EAST", // أولاد جلال
  "53": "SOUTH_WEST", // بني عباس
  "54": "SOUTH_WEST", // تيميمون
  "55": "SOUTH_EAST", // تقرت
};

export const InteractiveWilayasMapSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'national' | 'advisors' | 'elders' | 'regional' | 'wilaya'>('national');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState<string>('17');
  const [selectedRegionName, setSelectedRegionName] = useState<string>('الوسط 01');
  const [wilayaSearchInput, setWilayaSearchInput] = useState<string>('');
  const [communesList, setCommunesList] = useState<any[]>([]);
  const [svgMapHtml, setSvgMapHtml] = useState<string>('');
  const [isMapLoading, setIsMapLoading] = useState<boolean>(true);
  const [isWilayaLoginOpen, setIsWilayaLoginOpen] = useState<boolean>(false);
  const [activeRegionFilter, setActiveRegionFilter] = useState<string | null>(null);

  const regions = Object.values(REGIONAL_OFFICES);

  // جلب البيانات من المخازن
  useEffect(() => {
    // 1. جلب البلديات
    fetch('https://geoalgeria.com/api/v1/communes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCommunesList(data);
        } else if (data && Array.isArray(data.communes)) {
          setCommunesList(data.communes);
        }
      })
      .catch((err) => {
        console.warn('GeoAlgeria Communes fetch warning:', err);
        fetch('https://raw.githubusercontent.com/hamidibachireduc-png/snte-map-69/main/communes.json')
          .then(r => r.json())
          .then(d => setCommunesList(Array.isArray(d) ? d : (d.communes || [])));
      });

    // 2. جلب الخريطة من مستودعك
    fetch('https://raw.githubusercontent.com/hamidibachireduc-png/snte-map-69/main/map.svg')
      .then((res) => res.text())
      .then((svgText) => {
        setSvgMapHtml(svgText);
        setIsMapLoading(false);
      })
      .catch((err) => {
        console.warn('Map SVG fetch warning:', err);
        setIsMapLoading(false);
      });
  }, []);

  // تلوين الخريطة وإضافة الأرقام
  useEffect(() => {
    if (!isMapLoading && svgMapHtml) {
      const svgContainer = document.getElementById('snte-svg-map-container');
      if (svgContainer) {
        const svgElement = svgContainer.querySelector('svg');
        if (svgElement) {
            const paths = svgElement.querySelectorAll('path');
            
            // إضافة حاوية للنصوص (الأرقام) إذا لم تكن موجودة
            let textGroup = svgElement.querySelector('#wilaya-numbers');
            if (!textGroup) {
                textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                textGroup.setAttribute('id', 'wilaya-numbers');
                svgElement.appendChild(textGroup);
            } else {
                textGroup.innerHTML = ''; // تفريغ الحاوية في حالة إعادة التلوين
            }

            paths.forEach((path: any) => {
                let id = path.getAttribute('id') || path.getAttribute('data-wilaya') || path.getAttribute('name');
                if (id) {
                    const wilayaNum = parseInt(id.replace(/\D/g, ''), 10).toString();
                    const regionId = WILAYA_TO_REGION[wilayaNum];
                    
                    // تحديد اللون
                    let fillColor = '#cbd5e1'; // لون رمادي غامق للولايات غير الملونة (لتوضيح النقص)
                    let opacity = '1';

                    if (activeRegionFilter) {
                        if (activeRegionFilter === regionId) {
                            fillColor = REGIONAL_OFFICES[regionId].color;
                        } else {
                            fillColor = '#f1f5f9';
                            opacity = '0.5';
                        }
                    } else if (regionId && REGIONAL_OFFICES[regionId]) {
                        fillColor = REGIONAL_OFFICES[regionId].color;
                    }

                    // تطبيق اللون
                    path.style.fill = fillColor;
                    path.style.opacity = opacity;
                    path.style.stroke = '#ffffff';
                    path.style.strokeWidth = '1.2';
                    path.style.transition = 'all 0.3s ease';
                    path.style.cursor = 'pointer';

                    // حساب المركز البصري لرسم الرقم
                    const bbox = path.getBBox();
                    const centerX = bbox.x + bbox.width / 2;
                    const centerY = bbox.y + bbox.height / 2;

                    // رسم رقم الولاية
                    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    text.setAttribute('x', centerX.toString());
                    text.setAttribute('y', centerY.toString());
                    text.setAttribute('text-anchor', 'middle'); // توسيط النص
                    text.setAttribute('dominant-baseline', 'middle'); // توسيط رأسي
                    text.textContent = wilayaNum;
                    
                    // تنسيق الرقم
                    text.style.fill = '#ffffff'; // لون الرقم أبيض
                    text.style.fontSize = '12px';
                    text.style.fontWeight = 'bold';
                    text.style.pointerEvents = 'none'; // لعدم التداخل مع النقر على الولاية
                    // إضافة ظل للرقم ليكون مقروءًا على الألوان الفاتحة والغامقة
                    text.style.filter = 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))';

                    textGroup.appendChild(text);

                    // تأثير التمرير
                    path.onmouseenter = () => {
                        path.style.filter = 'brightness(1.1)';
                        path.style.opacity = '1';
                    };
                    path.onmouseleave = () => {
                        path.style.filter = 'none';
                        path.style.opacity = opacity;
                    };
                }
            });
        }
      }
    }
  }, [isMapLoading, svgMapHtml, activeRegionFilter]);


  // (البيانات الثابتة للمكاتب وأرقام الهواتف)
  const nationalMembers = [
    { id: "sg_kwaider", name: "قويدر يحياوي", role: "الامين العام الوطني", phones: ["0781450423", "0557072815"], email: "Kouidery@ymail.com", image: "https://github.com/hamidibachireduc-png/snte-map-69/blob/main/images/sg_kwaider.jpg?raw=true" },
    { id: "nat_1", name: "احمد رحيمي", role: "الأمين الوطني المكلف بالتنظيم والتنسيق", phones: ["0671276322", "0550549927"], email: "ahmedabdeljabar04@gmail.com", image: "https://github.com/hamidibachireduc-png/snte-map-69/blob/main/images/nat_1.jpg?raw=true" },
    { id: "nat_2", name: "مولاي لخضرعبد الهادي", role: "الأمين الوطني المكلف بالكتابة والعلاقات العامة", phones: ["0540731562"], email: "elhadimoulay7@gmail.com", image: "https://github.com/hamidibachireduc-png/snte-map-69/blob/main/images/nat_2.jpg?raw=true" },
    { id: "nat_3", name: "حسان بن شعيب", role: "الأمين الوطني المكلف بالمالية والوسائل", phones: ["0554906580", "0662582595"], email: "hacene.Benchaib@gmail.com", image: "https://github.com/hamidibachireduc-png/snte-map-69/blob/main/images/nat_3.jpg?raw=true" },
    { id: "nat_4", name: "نبيل فرقنيس", role: "الأمين الوطني المكلف بالتربية والتكوين النقابي", phones: ["0556 00 51 17"], email: "ferguenisnabil125@yahoo.ca", image: "https://github.com/hamidibachireduc-png/snte-map-69/blob/main/images/nat_4.jpg?raw=true" },
    { id: "nat_5", name: "صفاح لحبيب", role: "الأمين الوطني المكلف بالشؤون الاجتماعية", phones: ["0697011078", "0553145305"], email: "seffahhabib22@gmai.com", image: "https://github.com/hamidibachireduc-png/snte-map-69/blob/main/images/nat_5.jpg?raw=true" },
    { id: "nat_6", name: "حيرش جهيد", role: "الأمين الوطني المكلف بالإعلام و الاتصال و الإشهار", phones: ["0557 83 57 91"], email: "djhireche1971@gmail.com", image: "https://github.com/hamidibachireduc-png/snte-map-69/blob/main/images/nat_6.jpg?raw=true" },
    { id: "nat_7", name: "بن علو توفيق", role: "الأمين الوطني المكلف بالمنازعات والشؤون القانونية", phones: ["0663241117", "0550362130"], email: "benalloudem@gmail.com", image: "https://github.com/hamidibachireduc-png/snte-map-69/blob/main/images/nat_7.jpg?raw=true" },
    { id: "nat_8", name: "بن قسمية سعاد", role: "الأمينة الوطنية المكلفة بالتضامن و شؤون المرأة", phones: ["0672 36 21 92"], email: "Cem.hathat@gmail.com", image: "https://github.com/hamidibachireduc-png/snte-map-69/blob/main/images/nat_8.jpg?raw=true" },
    { id: "nat_9", name: "كرميش بايزيد", role: "الأمين الوطني المكلف بالنشاط الثقافي و الرياضي و الفكري", phones: ["0656 19 21 13"], email: "keribrahim25@gmail.com", image: "https://github.com/hamidibachireduc-png/snte-map-69/blob/main/images/nat_9.jpg?raw=true" },
    { id: "nat_10", name: "تامي نورين لخضر", role: "الأمين الوطني المكلف بعلاقات العمل و الاتفاقيات الجماعية و التشريع", phones: ["0675998222", "0541990943"], email: "taminourinelakhdar@gmail.com", image: "https://github.com/hamidibachireduc-png/snte-map-69/blob/main/images/nat_10.jpg?raw=true" }
  ];

  const advisors = [
    { id: "adv_1", role: "مستشار الشؤون القانونية", name: "صيد نبيل", wilaya: "الجزائر غرب", phones: ["0560907301", "0780039231"], email: "avocasidnabil@gmail.com" },
    { id: "adv_2", role: "مستشار شؤون التربية والبيداغوحيا", name: "بوسالم احمد", wilaya: "الجزائر شرق", phones: ["0556 14 50 73"], email: "demed86@gmail.com" },
    { id: "adv_3", role: "مسؤولة عامة للخلية الوطنية للاعلام والتنظيم.", name: "سعيدان بوثينة", wilaya: "اولاد جلال", phones: ["0661 15 55 79"], email: "saidaneboutheina@gmail.com" },
    { id: "adv_4", role: "مستشار المكلف بتقنيات التواصل", name: "حميدي البشير", wilaya: "الجلفة", phones: ["0696 38 09 65"], email: "bachirofsat@gmail.com" }
  ];

  const elders = [
    { id: "eld_1", name: "فريد لمناحلية", wilaya: "البليدة", phones: ["0556 47 78 79"], email: "blidasnte@hotmail.fr" },
    { id: "eld_2", name: "فرحات عبد النور", wilaya: "جيجل", phones: ["0778 85 98 50"], email: "abdenourferhat58@gmail.com" },
    { id: "eld_3", name: "عيشوش بغداد", wilaya: "مستغانم", phones: ["0660 37 06 07"], email: "bmosta376@gmail.com" },
    { id: "eld_4", name: "مجاطي على", wilaya: "تلمسان", phones: ["0771242455", "0556454007"], email: "alimedjatio@gmail.com" },
    { id: "eld_5", name: "قوادري محمد", wilaya: "الجلفة", phones: ["0664 43 57 95"], email: "kouadrimo55@gmail.com" },
    { id: "eld_6", name: "بوعينونة خيرة", wilaya: "الجلفة", phones: ["0773 10 84 32"], email: "" },
    { id: "eld_7", name: "محجوبي عبد الله", wilaya: "عين الدفلى", phones: [], email: "" }
  ];

  const regionalData: Record<string, any> = {
    "الشرق": {
      coordinator: { name: "جعفري عبد الرحمان", wilaya: "سوق أهراس", phones: ["0775 58 65 59"], email: "abderrahmanedjafri@yahoo.fr", image: "rm_1" },
      members: [
        { name: "بوقطوف توفيق", wilaya: "تبسة", phones: ["0697 79 75 28"], email: "sntetoufik12@gmail.com", image: "rm_2" },
        { name: "خالد حجازي", wilaya: "باتنة", phones: ["0663 91 55 34"], email: "sntebatna@gmail.com", image: "rm_3" }
      ]
    },
    "الغرب": {
      coordinator: { name: "راشدي الهواري", wilaya: "مستغانم", phones: ["0776484477"], email: "sntemosta@gmail.com", image: "rm_4" },
      members: [
        { name: "نجيب عيموش", wilaya: "غليزان", phones: ["0550341143"], email: "sntenadjib48@gmail.com", image: "rm_5" },
        { name: "خليفي شريف عبد الهادي", wilaya: "تلمسان", phones: ["0697119072", "0770292740"], email: "khelifiabdelhadi13@gmail.com", image: "rm_6" }
      ]
    },
    "الوسط 01": {
      coordinator: { name: "حجلاوي أحمد", wilaya: "عين الدفلى", phones: ["0771 29 13 71"], email: "hadjlaouiahmed@gmail.com", image: "rm_7" },
      members: [
        { name: "بوسالم احمد", wilaya: "الجزائر شرق", phones: ["0556 14 50 73"], email: "demed86@gmail.com", image: "rm_8" },
        { name: "نعمان رابح", wilaya: "تيبازة", phones: ["0659502817", "0665253410"], email: "ens.namane@gmail.com", image: "https://github.com/hamidibachireduc-png/snte-map-69/blob/main/images/rm_9.jpg?raw=true" }
      ]
    },
    "الوسط 02": {
      coordinator: { name: "حسان بن شعيب", wilaya: "البليدة", phones: ["0554 90 65 80", "0662 58 25 95"], email: "hacene.Benchaib@gmail.com", image: "rm_10" },
      members: [
        { name: "عبد الرحيم سعيد", wilaya: "الجزائر شرق", phones: ["0556 85 09 30"], email: "saidsnte@gmail.com", image: "rm_11" },
        { name: "عزيب عادل", wilaya: "برج بوعريريج", phones: ["0778 27 92 90"], email: "azibadel9@gmail.com", image: "rm_12" }
      ]
    },
    "جنوب الوسط": {
      coordinator: { name: "قزيم أحمد", wilaya: "الجلفة", phones: ["0673 16 43 17"], email: "ahmed17goz@gmail.com", image: "rm_13" },
      members: [
        { name: "بن عبد الرحمان عبد الرزاق", wilaya: "غرداية", phones: ["0556 85 09 30"], email: "abderrazakgeneral@gmail.com", image: "rm_14" },
        { name: "اسامة مزاري", wilaya: "بوسعادة", phones: ["0671 39 13 76"], email: "oussama77.m@gmail.com", image: "rm_15" }
      ]
    },
    "الجنوب الشرقي": {
      coordinator: { name: "باي فؤاد", wilaya: "الوادي", phones: ["0772757559", "0662582595"], email: "ademtoursdz@gmail.com", image: "rm_16" },
      members: [
        { name: "شيخي عامر", wilaya: "إليزي", phones: ["0660 39 61 67"], email: "chikhiamer@gmail.com", image: "rm_17" },
        { name: "زيدي ليندة", wilaya: "بسكرة", phones: ["0658 24 09 95"], email: "", image: "rm_18" }
      ]
    },
    "الجنوب الغربي": {
      coordinator: { name: "بن يحي مصطفى", wilaya: "تيميمون", phones: ["0663 66 46 86"], email: "benyahiamustapha49@gmail.com", image: "" },
      members: [
        { name: "باعيسى محمد", wilaya: "تمنراست", phones: ["0671 64 41 49"], email: "", image: "" },
        { name: "حمة عبد القادر", wilaya: "أدرار", phones: ["0660 12 35 86"], email: "", image: "" },
        { name: "بكيرات موسى", wilaya: "بشار", phones: ["0798 58 85 22"], email: "sayfoallahial@gmail.com", image: "" }
      ]
    }
  };

  const WILAYA_SG_DETAILS: Record<string, any> = {
    "1": { name: "صوفي عبد الكريم", phones: ["0671 72 96 31"], email: "krimolv37@gmail.com", hq: "" },
    "2": { name: "كوري محمد", phones: ["0771 54 84 77"], email: "mohakouri2023@gmail.com", hq: "قرب مركز توزيع و النشر البيداغوجي الشلف cwddp chlef" },
    "3": { name: "قتال مداني", phones: ["0659 35 31 61"], email: "sntelaghout03@gmail.com", hq: "قرب ثانوية الشهيد محمد الصادق طالبي الاغواط" },
    "4": { name: "مزياني عماد", phones: ["0772 51 80 87"], email: "Mezainiimad@gmail.com", hq: "" },
    "5": { name: "خالد حجازي", phones: ["0663 91 55 34"], email: "sntebatna@gmail.com", hq: "قرب متوسطة الاخوة شطوح (الطيران سابقا) بجانب مفتشية التغذية باتنة" },
    "6": { name: "نبيل فرقنيس", phones: ["0556 00 51 17"], email: "ferguenisnabil125@yahoo.ca", hq: "( مؤقتا) قرب متوسطة ڨوماز احدادن بجاية" },
    "7": { name: "لهلالي سمير", phones: ["0772967667", "0778552850"], email: "zrougmoussa63@gmail.com", hq: "قرب ابتدائية بهاز لخضر بسكرة" },
    "8": { name: "حجاج محمد", phones: ["0664 10 62 87"], email: "", hq: "قرب مديرية التربية لولاية بشار" },
    "9": { name: "مسعودي نور الدين", phones: ["0560304112"], email: "messaoudinoureddine02@gmail.com", hq: "قرب ابتدائية العربي التبسي البليدة" },
    "10": { name: "قاسيمي سفيان", phones: ["0770 25 77 00"], email: "", hq: "قرب مديرية التربية لولاية البويرة" },
    "11": { name: "بودن ضرار", phones: ["0667 07 47 85"], email: "omelawadm@gmail.com", hq: "" },
    "12": { name: "عوايشية طارق", phones: ["0671 56 49 62"], email: "tarekaouaichiasnte12@gmail.com", hq: "مجمع المفتشين بجانب التكوين عن بعد ( المراسلة)." },
    "13": { name: "بن خدة عبد القادر", phones: ["0668 58 08 65"], email: "iyed0205fethi@gmail.com", hq: "قرب مدرسة باستور لبنين بتلمسان" },
    "14": { name: "ميلود صمار", phones: ["0666 95 50 19"], email: "miloud semmar090@gmail .com", hq: "قرب مقر الخدمات الاجتماعية بتيارت" },
    "15": { name: "صامت مصطفى ", phones: ["0540 98 20 18"], email: "sametmostapha@gmail.com", hq: "قرب ثانوية فاطمة نسومر بتيزي وزو" },
    "16": { name: "موقاري محمد أنيس", phones: ["0559 57 86 29", "0550 40 29 65", "0549 74 93 55"], email: "mohamedanismougari@gmail.com", hq: "قرب مدرسة محمد مادة بسيدي امحند بالجزائر العاصمة" },
    "17": { name: "بن ميلود محمد", phones: ["0541 66 64 99"], email: "lounadjib@gmail.com", hq: "قرب مقر الخدمات الاجتماعية بقناني الجلفة" },
    "19": { name: "عثماني هشام", phones: ["0794 94 80 01"], email: "kaadeer90@gmail.com", hq: "" },
    "20": { name: "بوسماحة فطيمة", phones: ["0775 28 13 42"], email: "fbousmaha50@gmail.com", hq: "مقابل ثانوية سحنون الراشدي ولاية سعيدة" }
  };

  const newWilayasRelations = [
    { id: "59", name: "آفلو", parent_id: "3" },
    { id: "60", name: "الأبيض سيدي الشيخ", parent_id: "32" },
    { id: "61", name: "العريشة", parent_id: "13" },
    { id: "62", name: "القنطرة", parent_id: "7" },
    { id: "63", name: "بريكة", parent_id: "5" },
    { id: "64", name: "بوسعادة", parent_id: "28" },
    { id: "65", name: "بئر العاتر", parent_id: "12" },
    { id: "66", name: "قصر البخاري", parent_id: "26" },
    { id: "67", name: "قصر الشلالة", parent_id: "14" },
    { id: "68", name: "عين وسارة", parent_id: "17" },
    { id: "69", name: "مسعد", parent_id: "17" }
  ];

  const currentWilaya = WILAYAS_LIST.find((w) => String(w.code) === String(selectedWilayaCode)) || WILAYAS_LIST[16];
  const currentWilayaDetails = WILAYA_SG_DETAILS[currentWilaya.code] || { name: currentWilaya.sgName, phones: [currentWilaya.phone], email: currentWilaya.email, hq: currentWilaya.headquarters };
  const parentWilayaRelation = newWilayasRelations.find((r) => String(r.id) === String(selectedWilayaCode));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setWilayaSearchInput(val);
    if (val && !isNaN(Number(val))) {
      const found = WILAYAS_LIST.find((w) => String(w.code) === val || String(w.code).padStart(2, '0') === val.padStart(2, '0'));
      if (found) {
        setSelectedWilayaCode(found.code);
        setActiveTab('wilaya');
      }
    }
  };

  const handleWilayaSGIngress = () => {
    setIsWilayaLoginOpen(true);
  };

  // تعديل التصفية لتتوافق مع البيانات القادمة من GeoAlgeria
  const activeWilayaCommunes = communesList.filter((c: any) => String(c.wilaya_id) === String(selectedWilayaCode) || String(c.wilaya_code) === String(selectedWilayaCode));
  const activeNewWilayas = newWilayasRelations.filter((r) => String(r.parent_id) === String(selectedWilayaCode));

  return (
    <section
      id="interactive-map-section"
      aria-label="الخريطة التفاعلية للجزائر وتوزيع الأمانات الولائية"
      className="bg-gradient-to-br from-[#002b14] via-[#00381b] to-[#002b14] text-white py-12 px-3 sm:px-6 lg:px-8 border-b-4 border-amber-400 font-['Cairo',sans-serif] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="bg-[#00371b] p-6 rounded-3xl border-2 border-amber-400/50 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl font-black shadow-inner">
              🗺️
            </div>
            <div>
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full">
                الخريطة الإدارية الرسمية (69 ولاية)
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                البوابة التفاعلية للقيادات وهياكل النقابة الوطنية لعمال التربية
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-300 font-bold bg-black/40 px-3.5 py-1.5 rounded-xl border border-amber-400/30">
              منظومة القيادة والتنظيم الميداني
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Side: Interactive Map */}
          <div className="lg:col-span-6 flex flex-col gap-4 text-gray-900 direction-rtl">
            
            {/* شريط مفتاح الخريطة */}
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex flex-row justify-between items-center p-4 sm:p-5 border-b border-gray-100">
                <div className="text-right">
                  <h3 className="text-lg sm:text-xl font-black text-[#00371b]">
                    الخريطة التفاعلية للجزائر (69 ولاية)
                  </h3>
                  <span className="block text-xs sm:text-sm font-medium text-gray-500 mt-0.5">
                    ملونة حسب المكاتب السبعة للتنسيق الجهوي
                  </span>
                </div>
                <button 
                  onClick={() => setActiveRegionFilter(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded-2xl text-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  عرض كل الجهات (07)
                </button>
              </div>

              <div className="p-4 bg-[#f8fafc] flex flex-wrap justify-center gap-3 sm:gap-4">
                {regions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => setActiveRegionFilter(region.id)}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-full transition-all duration-200 text-sm font-bold cursor-pointer ${
                      activeRegionFilter === region.id 
                        ? 'bg-white shadow-md border border-gray-200 scale-105' 
                        : 'bg-white hover:bg-gray-50 border border-transparent shadow-sm text-gray-700'
                    }`}
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full" 
                      style={{ backgroundColor: region.color }}
                    ></span>
                    <span className="text-gray-800">{region.name}</span>
                    <span className="text-gray-400 text-xs font-mono">({region.count})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-2xl border border-gray-300 flex flex-col flex-grow">
              <div className="flex items-center justify-between border-b pb-2 mb-3">
                <h3 className="text-base font-bold text-green-700">
                  خريطة الجزائر الإدارية
                </h3>
                <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-mono">
                  ولاية مختارة: {currentWilaya.code} - {currentWilaya.name}
                </span>
              </div>

              <div id="snte-svg-map-container" className="flex-grow flex items-center justify-center min-h-[340px] bg-[#f8fafc] rounded-xl p-2 border border-gray-100 relative overflow-hidden mb-4">
                {isMapLoading ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-green-700 font-bold text-sm">جاري تحميل خريطة الجزائر...</p>
                  </div>
                ) : svgMapHtml ? (
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[380px]"
                    dangerouslySetInnerHTML={{ __html: svgMapHtml.replace(/<path([^>]*)fill="[^"]*"([^>]*)>/g, '<path$1$2>') }}
                    onClick={(e: any) => {
                      const target = e.target;
                      if (target && target.tagName === 'path') {
                        let id = target.getAttribute('id') || target.getAttribute('data-wilaya') || target.getAttribute('name');
                        if (id) {
                          const num = id.replace(/\D/g, '');
                          if (num) {
                            const wCode = parseInt(num, 10).toString().padStart(2, '0');
                            const found = WILAYAS_LIST.find((w) => w.code === wCode || String(parseInt(w.code, 10)) === num);
                            if (found) {
                              setSelectedWilayaCode(found.code);
                              setActiveTab('wilaya');
                              
                              // تحديد بصري للولاية التي تم النقر عليها
                              Array.from(target.parentNode.children).forEach((child: any) => {
                                if (child.tagName === 'path') {
                                    child.style.stroke = '#ffffff';
                                    child.style.strokeWidth = '1.2';
                                }
                              });
                              target.style.stroke = '#000000'; // حدود سوداء للولاية النشطة
                              target.style.strokeWidth = '2';
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : null}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>⚡ اختيار دقيق لولايات الجزائر (من 01 إلى 69):</span>
                  <span className="text-[10px] text-gray-500">انقر للتبديل الفوري</span>
                </label>
                <div className="max-h-36 overflow-y-auto custom-scrollbar bg-gray-50 p-2 rounded-xl border grid grid-cols-3 sm:grid-cols-4 gap-1.5 text-right">
                  {WILAYAS_LIST.map((w) => {
                    const isSelected = w.code === selectedWilayaCode;
                    return (
                      <button
                        key={w.code}
                        type="button"
                        onClick={() => {
                          setSelectedWilayaCode(w.code);
                          setActiveTab('wilaya');
                        }}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer truncate flex items-center justify-between px-2 ${
                          isSelected
                            ? 'bg-green-700 text-white shadow-md scale-102'
                            : 'bg-white hover:bg-green-50 text-gray-800 border border-gray-200'
                        }`}
                        title={`${w.code} - ${w.name}`}
                      >
                        <span className="truncate">{w.name}</span>
                        <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-amber-400 text-slate-950' : 'bg-gray-100 text-gray-600'}`}>
                          {w.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الجهة:</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value !== 'all') {
                        setSelectedRegionName(e.target.value);
                        setActiveTab('regional');
                      } else {
                        setActiveTab('national');
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold focus:ring-green-500 bg-gray-50 cursor-pointer"
                  >
                    <option value="all">التنظيم الوطني (المكتب / المستشارون / الحكماء)</option>
                    <option value="الشرق">الشرق</option>
                    <option value="الغرب">الغرب</option>
                    <option value="الوسط 01">الوسط 01</option>
                    <option value="الوسط 02">الوسط 02</option>
                    <option value="جنوب الوسط">جنوب الوسط</option>
                    <option value="الجنوب الشرقي">الجنوب الشرقي</option>
                    <option value="الجنوب الغربي">الجنوب الغربي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">بحث برقم الولاية:</label>
                  <input
                    type="number"
                    value={wilayaSearchInput}
                    onChange={handleSearchChange}
                    placeholder="مثال: 17 أو 69"
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:ring-green-500 bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Tabbed Content Container */}
          <div className="lg:col-span-6 bg-white rounded-2xl shadow-2xl border border-gray-300 overflow-hidden flex flex-col text-gray-900">
            
            <div className="flex border-b bg-gray-100 shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('national')}
                className={`flex-1 text-center font-bold text-xs py-3 px-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'national' ? 'bg-green-50 text-green-800 border-b-4 border-green-600' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                المكتب الوطني
              </button>
              <button
                onClick={() => setActiveTab('advisors')}
                className={`flex-1 text-center font-bold text-xs py-3 px-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'advisors' ? 'bg-indigo-50 text-indigo-800 border-b-4 border-indigo-600' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                المستشارون
              </button>
              <button
                onClick={() => setActiveTab('elders')}
                className={`flex-1 text-center font-bold text-xs py-3 px-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'elders' ? 'bg-amber-50 text-amber-900 border-b-4 border-amber-600' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                لجنة الحكماء
              </button>
              <button
                onClick={() => setActiveTab('regional')}
                className={`flex-1 text-center font-bold text-xs py-3 px-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'regional' ? 'bg-emerald-50 text-emerald-800 border-b-4 border-emerald-600' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                الأمانة الجهوية
              </button>
              <button
                onClick={() => setActiveTab('wilaya')}
                className={`flex-1 text-center font-bold text-xs py-3 px-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'wilaya' ? 'bg-blue-50 text-blue-800 border-b-4 border-blue-600' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                الأمانة الولائية
              </button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto max-h-[620px] space-y-4">
              
              {/* Tab 1: National Office */}
              {activeTab === 'national' && (
                <div className="space-y-4">
                  <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
                      <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white overflow-hidden shrink-0">
                        <img
                          src={nationalMembers[0].image}
                          onError={(e: any) => { e.target.src = 'https://l.top4top.io/p_37988hwfa0.png'; }}
                          alt={nationalMembers[0].name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
                          {nationalMembers[0].role}
                        </span>
                        <h3 className="text-lg font-black text-gray-900">{nationalMembers[0].name}</h3>
                        <div className="mt-2 text-xs space-y-1.5" dir="ltr">
                          {nationalMembers[0].phones.map((phone, i) => (
                             <div key={i} className="flex items-center justify-center md:justify-start gap-2 bg-white px-2 py-1 rounded border">
                                <span className="font-bold text-gray-800 font-mono">{phone}</span>
                                <a href={`tel:${phone}`} className="text-blue-600 hover:underline">📞 اتصال</a>
                                <span className="text-gray-300">|</span>
                                <a href={getWhatsAppLink(phone)} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">💬 واتساب</a>
                             </div>
                          ))}
                        </div>
                        <a href={`mailto:${nationalMembers[0].email}`} className="text-xs text-blue-600 hover:underline mt-2 inline-block font-mono">📧 {nationalMembers[0].email}</a>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-black text-sm text-gray-700 border-b pb-2">أعضاء المكتب الوطني</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {nationalMembers.slice(1).map((m) => (
                      <div key={m.id} className="bg-gray-50 border border-gray-200 p-3 rounded-xl shadow-xs flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full border-2 border-gray-300 bg-white overflow-hidden shrink-0 shadow-inner">
                          <img
                            src={m.image}
                            onError={(e: any) => { e.target.src = 'https://l.top4top.io/p_37988hwfa0.png'; }}
                            alt={m.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded block mb-0.5 truncate">
                            {m.role}
                          </span>
                          <h5 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{m.name}</h5>
                          <div className="mt-1 flex flex-col gap-1">
                             {m.phones.map((phone, i) => (
                                <div key={i} className="flex items-center justify-between text-[11px] font-mono">
                                   <span className="font-bold text-gray-700">{phone}</span>
                                   <div className="flex gap-2">
                                      <a href={`tel:${phone}`} className="text-blue-500">📞</a>
                                      <a href={getWhatsAppLink(phone)} target="_blank" rel="noopener noreferrer" className="text-green-500">💬</a>
                                   </div>
                                </div>
                             ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Advisors */}
              {activeTab === 'advisors' && (
                <div className="space-y-4">
                  <div className="bg-indigo-700 text-white p-3 rounded-xl text-center font-bold text-sm">
                    مستشارو الأمانة العامة الوطنية
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {advisors.map((a) => (
                      <div key={a.id} className="bg-indigo-50/50 border-l-4 border-indigo-600 p-3 rounded-xl shadow-xs flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full border-2 border-indigo-300 bg-white overflow-hidden shrink-0 shadow-inner">
                          <img
                            src={`${GITHUB_IMAGES_BASE}${a.id}.jpg`}
                            onError={(e: any) => { e.target.src = 'https://l.top4top.io/p_37988hwfa0.png'; }}
                            alt={a.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded block mb-0.5 truncate">
                            {a.role}
                          </span>
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{a.name}</h5>
                            <span className="text-[9px] bg-white px-1.5 py-0.5 rounded text-gray-600 border shrink-0">{a.wilaya}</span>
                          </div>
                          <div className="mt-1 flex flex-col gap-1">
                             {a.phones.map((phone, i) => (
                                <div key={i} className="flex items-center justify-between text-[11px] font-mono">
                                   <span className="font-bold text-gray-700">{phone}</span>
                                   <div className="flex gap-2">
                                      <a href={`tel:${phone}`} className="text-blue-500">📞</a>
                                      <a href={getWhatsAppLink(phone)} target="_blank" rel="noopener noreferrer" className="text-green-500">💬</a>
                                   </div>
                                </div>
                             ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Elders */}
              {activeTab === 'elders' && (
                <div className="space-y-4">
                  <div className="bg-amber-600 text-white p-3 rounded-xl text-center font-bold text-sm">
                    لجـنة الحكماء النقابية
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {elders.map((e) => (
                      <div key={e.id} className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl shadow-xs flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full border-2 border-amber-300 bg-white overflow-hidden shrink-0 shadow-inner">
                          <img
                            src={`${GITHUB_IMAGES_BASE}${e.id}.jpg`}
                            onError={(err: any) => { err.target.src = 'https://l.top4top.io/p_37988hwfa0.png'; }}
                            alt={e.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-amber-900 text-xs sm:text-sm truncate">{e.name}</h5>
                            <span className="text-[9px] bg-white px-1.5 py-0.5 rounded text-amber-800 border border-amber-300 shrink-0">{e.wilaya}</span>
                          </div>
                          <div className="mt-1 flex flex-col gap-1">
                             {e.phones.map((phone, i) => (
                                <div key={i} className="flex items-center justify-between text-[11px] font-mono">
                                   <span className="font-bold text-gray-700">{phone}</span>
                                   <div className="flex gap-2">
                                      <a href={`tel:${phone}`} className="text-blue-500">📞</a>
                                      <a href={getWhatsAppLink(phone)} target="_blank" rel="noopener noreferrer" className="text-green-500">💬</a>
                                   </div>
                                </div>
                             ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Regional Secretariat */}
              {activeTab === 'regional' && (
                <div className="space-y-4">
                  <div className="bg-emerald-700 text-white p-3 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-sm">التنسيق الجهوي: <span className="text-yellow-300 font-black">{selectedRegionName}</span></span>
                  </div>

                  {regionalData[selectedRegionName] && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-xl shadow-sm space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-emerald-400 bg-white overflow-hidden shrink-0 shadow-inner">
                          <img
                            src={`${GITHUB_IMAGES_BASE}${regionalData[selectedRegionName].coordinator.image || 'rm_1'}.jpg`}
                            onError={(e: any) => { e.target.src = 'https://l.top4top.io/p_37988hwfa0.png'; }}
                            alt="المنسق الجهوي"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            المنسق الجهوي المعتمد
                          </span>
                          <h4 className="text-base font-black text-gray-900 mt-1">
                            {regionalData[selectedRegionName].coordinator.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            ولاية الإقامة: <strong className="text-emerald-800">{regionalData[selectedRegionName].coordinator.wilaya}</strong>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-2" dir="ltr">
                          {regionalData[selectedRegionName].coordinator.phones.map((phone: string, i: number) => (
                             <div key={i} className="flex items-center justify-end md:justify-start gap-2 bg-white px-2 py-1.5 rounded border w-max">
                                <span className="font-bold text-gray-800 font-mono text-xs">{phone}</span>
                                <a href={`tel:${phone}`} className="text-blue-600 hover:underline text-xs">📞 اتصال</a>
                                <span className="text-gray-300">|</span>
                                <a href={getWhatsAppLink(phone)} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-xs">💬 واتساب</a>
                             </div>
                          ))}
                      </div>

                      <div className="mt-3 pt-3 border-t border-emerald-200">
                        <span className="text-xs font-bold text-gray-700 block mb-2">أعضاء الأمانة الجهوية:</span>
                        <div className="grid grid-cols-1 gap-2">
                          {regionalData[selectedRegionName].members.map((m: any, i: number) => (
                            <div key={i} className="bg-white p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img 
                                  src={`${GITHUB_IMAGES_BASE}${m.image || 'rm_1'}.jpg`}
                                  onError={(e: any) => { e.target.src = 'https://l.top4top.io/p_37988hwfa0.png'; }}
                                  alt={m.name}
                                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                />
                                <div>
                                  <span className="font-bold text-gray-900 text-xs block">{m.name}</span>
                                  <span className="text-[10px] text-gray-500 block">ولاية {m.wilaya}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1 items-end">
                                 {m.phones.map((p: string, idx: number) => (
                                     <div key={idx} className="flex items-center gap-2 text-[10px] font-mono">
                                        <span className="font-bold text-gray-800">{p}</span>
                                        <div className="flex gap-1">
                                          <a href={`tel:${p}`} className="text-blue-500">📞</a>
                                          <a href={getWhatsAppLink(p)} target="_blank" rel="noopener noreferrer" className="text-green-500">💬</a>
                                        </div>
                                     </div>
                                 ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Wilaya Secretariat */}
              {activeTab === 'wilaya' && (
                <div className="space-y-4">
                  
                  {/* أزرار العودة الذكية */}
                  <div className="flex items-center gap-2 pb-2">
                    <button 
                      onClick={() => setActiveTab('national')} 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-gray-200"
                    >
                      <span>🔙</span> العودة للمكتب الوطني
                    </button>
                    
                    {parentWilayaRelation && (
                      <button 
                        onClick={() => setSelectedWilayaCode(parentWilayaRelation.parent_id)} 
                        className="bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-blue-200"
                      >
                        <span>🔙</span> العودة لولاية {WILAYAS_LIST.find(w => w.code === parentWilayaRelation.parent_id)?.name} الأم
                      </button>
                    )}
                  </div>

                  <div className="bg-blue-700 text-white p-3 rounded-xl text-center">
                    <h4 className="text-base font-bold">
                      ولاية <span className="text-yellow-300 font-black text-lg">{currentWilaya.name} ({currentWilaya.code})</span>
                    </h4>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-xl shadow-sm space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full border-3 border-white shadow-md bg-white overflow-hidden shrink-0">
                        <img
                          src={`${GITHUB_IMAGES_BASE}${currentWilaya.code}.jpg`}
                          onError={(e: any) => { e.target.src = 'https://l.top4top.io/p_37988hwfa0.png'; }}
                          alt="الأمين الولائي"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          الأمين العام الولائي
                        </span>
                        <h3 className="text-lg font-black text-gray-900 mt-1">
                          {currentWilayaDetails.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-3" dir="ltr">
                        {currentWilayaDetails.phones.map((phone: string, i: number) => (
                            <div key={i} className="flex items-center justify-end md:justify-start gap-2 bg-white px-2 py-1.5 rounded-lg border border-blue-200 w-max">
                              <span className="font-bold text-gray-800 font-mono text-xs">{phone}</span>
                              <a href={`tel:${phone}`} className="text-blue-600 hover:underline text-xs font-bold">📞 اتصال</a>
                              <span className="text-gray-300">|</span>
                              <a href={getWhatsAppLink(phone)} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-xs font-bold">💬 واتساب</a>
                            </div>
                        ))}
                    </div>

                    {currentWilayaDetails.email && (
                      <p className="text-xs text-blue-600 hover:underline mt-2">
                         <a href={`mailto:${currentWilayaDetails.email}`}>📧 {currentWilayaDetails.email}</a>
                      </p>
                    )}
                    
                    {currentWilayaDetails.hq && (
                      <a href={getGoogleMapsLink(currentWilayaDetails.hq)} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-700 font-medium flex items-start gap-1 hover:text-red-600 transition-colors mt-2">
                        <span className="text-red-500">📍</span> 
                        <span><strong>المقر الولائي:</strong> {currentWilayaDetails.hq} (انقر لفتح الخريطة)</span>
                      </a>
                    )}

                    {activeNewWilayas.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <span className="text-xs font-bold text-yellow-800 block mb-1">✨ ولايات مستحدثة انفصلت عن هذه الولاية (انقر لعرضها):</span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeNewWilayas.map((nw) => (
                            <button
                              key={nw.id}
                              onClick={() => {
                                setSelectedWilayaCode(nw.id);
                                setActiveTab('wilaya');
                              }}
                              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border border-yellow-300 text-xs px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors"
                            >
                              ولاية {nw.name} ({nw.id})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeWilayaCommunes.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <span className="text-xs font-bold text-gray-700 block mb-1.5">
                          🏛️ البلديات التابعة ({activeWilayaCommunes.length} بلدية):
                        </span>
                        <div className="max-h-36 overflow-y-auto custom-scrollbar bg-white p-2 rounded-lg border grid grid-cols-2 gap-1.5 text-right text-xs">
                          {activeWilayaCommunes.map((c: any, i: number) => (
                            <div key={i} className="p-1.5 bg-gray-50 rounded border border-gray-100">
                              <span className="font-bold text-green-800 block">{c.name_ar || c.name}</span>
                              {(c.daira_ar || c.daira_name_ar) && (
                                <span className="text-[10px] text-gray-500">دائرة: {c.daira_ar || c.daira_name_ar}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleWilayaSGIngress}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-amber-300 text-xs sm:text-sm"
                    >
                      <span>🔑</span>
                      <span>دخول بصلاحية الأمين العام الولائي - ولاية {currentWilaya.name}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      
      <WilayaLoginModal
        isOpen={isWilayaLoginOpen}
        onClose={() => setIsWilayaLoginOpen(false)}
        wilaya={currentWilaya}
        onLoginSuccess={() => window.location.reload()}
      />
    </section>
  );
};