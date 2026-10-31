import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  Layers, 
  School, 
  MapPin, 
  ShieldCheck, 
  Compass, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { WILAYAS_LIST, WilayaData } from './wilayasList';
import { WilayaLoginModal } from './WilayaLoginModal';
import { AlgeriaWilayasLeafletMap } from './AlgeriaWilayasLeafletMap';
import geo from 'geoalgeria';

const GITHUB_IMAGES_BASE = 'https://raw.githubusercontent.com/hamidibachireduc-png/snte-map-69/main/images/';

const getWhatsAppLink = (phone: string) => {
  if (!phone) return '#';
  const cleanPhone = phone.split('-')[0].replace(/\D/g, ''); 
  const formatted = cleanPhone.startsWith('0') ? `213${cleanPhone.substring(1)}` : cleanPhone;
  return `https://wa.me/${formatted}`;
};

const getImageUrl = (img?: string) => {
  if (!img || img.trim() === '') return 'https://l.top4top.io/p_37988hwfa0.png';
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  const cleanId = img.replace(/\.(jpg|jpeg|png)$/i, '');
  return `${GITHUB_IMAGES_BASE}${cleanId}.jpg`;
};

const getGoogleMapsLink = (hq: string) => {
  if (!hq) return '#';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hq + ' الجزائر')}`;
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

  // Map integration state
  const [mapSourceMode, setMapSourceMode] = useState<'geoalgeria' | 'snte_vector' | 'geo_explorer'>('geoalgeria');
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [geoSearchQuery, setGeoSearchQuery] = useState<string>('');

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/hamidibachireduc-png/snte-map-69/main/communes.json')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.communes)) {
          setCommunesList(data.communes);
        } else if (Array.isArray(data)) {
          setCommunesList(data);
        }
      })
      .catch((err) => console.warn('Communes fetch warning:', err));

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

  // خريطة مطابقة رسمية بين ترقيم هياكل SNTE وترقيم قاعدة بيانات GeoAlgeria للولايات الـ 11 المعدلة
  const SNTE_TO_GEO_CODE: Record<string, number> = {
    "59": 59, // آفلو (Aflou)
    "60": 69, // الأبيض سيدي الشيخ (El Abiodh Sidi Cheikh)
    "61": 63, // العريشة (El Aricha)
    "62": 61, // القنطرة (El Kantara)
    "63": 60, // بريكة (Barika)
    "64": 68, // بوسعادة (Bou Saâda)
    "65": 62, // بئر العاتر (Bir El Ater)
    "66": 67, // قصر البخاري (Ksar El Boukhari)
    "67": 64, // قصر الشلالة (Ksar Chellala)
    "68": 65, // عين وسارة (Aïn Ouessara)
    "69": 66, // مسعد (Messaad)
  };

  const GEO_TO_SNTE_CODE: Record<number, string> = {
    59: "59",
    60: "63",
    61: "62",
    62: "65",
    63: "61",
    64: "67",
    65: "68",
    66: "69",
    67: "66",
    68: "64",
    69: "60",
  };

  const formatPhonesList = (phonesInput: any): string[] => {
    if (!phonesInput) return [];
    if (Array.isArray(phonesInput)) {
      return phonesInput.flatMap((p: string) => String(p).split(/[\/\-,;]+/).map((s) => s.trim())).filter(Boolean);
    }
    return String(phonesInput).split(/[\/\-,;]+/).map((s) => s.trim()).filter(Boolean);
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
  const currentWilayaRaw = WILAYA_SG_DETAILS[currentWilaya.code] || WILAYA_SG_DETAILS[String(parseInt(currentWilaya.code, 10))] || {
    name: currentWilaya.sgName,
    phones: formatPhonesList(currentWilaya.phone),
    email: currentWilaya.email,
    hq: currentWilaya.headquarters,
  };
  const currentWilayaDetails = {
    ...currentWilayaRaw,
    phones: formatPhonesList(currentWilayaRaw.phones || currentWilaya.phone),
  };
  const parentWilayaRelation = newWilayasRelations.find((r) => String(r.id) === String(selectedWilayaCode));

  const [wilayasGridFilter, setWilayasGridFilter] = useState<'all' | '1-48' | '49-58' | '59-69'>('all');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setWilayaSearchInput(val);
    if (!val) return;
    if (!isNaN(Number(val))) {
      const found = WILAYAS_LIST.find((w) => String(w.code) === val || String(w.code).padStart(2, '0') === val.padStart(2, '0'));
      if (found) {
        setSelectedWilayaCode(found.code);
        setActiveTab('wilaya');
      }
    } else {
      const found = WILAYAS_LIST.find((w) => w.name.includes(val) || val.includes(w.name));
      if (found) {
        setSelectedWilayaCode(found.code);
        setActiveTab('wilaya');
      }
    }
  };

  const handleWilayaSGIngress = () => {
    setIsWilayaLoginOpen(true);
  };

  const lookupGeoCode = SNTE_TO_GEO_CODE[String(selectedWilayaCode)] || parseInt(String(selectedWilayaCode), 10);
  const geoWilaya = geo.getWilaya(lookupGeoCode);
  const geoDairas = geo.getDairasByWilaya(lookupGeoCode) || [];
  const geoCommunes = geo.getCommunesByWilaya(lookupGeoCode) || [];

  const geoSearchResults = React.useMemo(() => {
    if (!geoSearchQuery.trim()) return [];
    const q = geoSearchQuery.trim();
    let results: any[] = [];
    if (/^\d{2,5}$/.test(q)) {
      const byPostal = geo.findByPostalCode(q);
      if (byPostal && byPostal.length > 0) results = byPostal.slice(0, 30);
    }
    if (results.length === 0) {
      try {
        const byName = geo.findCommune(q);
        results = byName.slice(0, 30);
      } catch {
        results = [];
      }
    }
    return results;
  }, [geoSearchQuery]);

  const activeWilayaCommunes = geoCommunes.length > 0 
    ? geoCommunes 
    : communesList.filter((c: any) => String(c.wilaya_id) === String(selectedWilayaCode) || String(c.wilaya_id) === String(lookupGeoCode));
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/40 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>مواقع وحدود الـ 69 ولاية مباشرة</span>
            </span>
            <span className="text-xs text-amber-300 font-bold bg-black/40 px-3.5 py-1.5 rounded-xl border border-amber-400/30">
              منظومة القيادة والتنظيم الميداني
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Side: Interactive Map */}
          <div className={`${isMapExpanded ? 'lg:col-span-12' : 'lg:col-span-6'} bg-white rounded-2xl p-4 shadow-2xl border border-gray-300 flex flex-col text-gray-900 transition-all duration-300`}>
            
            {/* Top Toolbar: Source Mode Switcher & Map Tools */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-b pb-3 mb-3">
              <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMapSourceMode('geoalgeria')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mapSourceMode === 'geoalgeria'
                      ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-600'
                      : 'text-gray-700 hover:text-emerald-800 hover:bg-gray-200'
                  }`}
                  title="الخريطة التفاعلية المباشرة لمواقع وحدود الـ 69 ولاية"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>خريطة ومواقع الـ 69 ولاية (تفاعلية)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapSourceMode('snte_vector')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mapSourceMode === 'snte_vector'
                      ? 'bg-green-700 text-white shadow-sm ring-1 ring-green-600'
                      : 'text-gray-700 hover:text-green-800 hover:bg-gray-200'
                  }`}
                  title="خريطة التوزيع النقابي لولايات الجزائر"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>خريطة S.N.T.E المتجهة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapSourceMode('geo_explorer')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mapSourceMode === 'geo_explorer'
                      ? 'bg-blue-700 text-white shadow-sm ring-1 ring-blue-600'
                      : 'text-gray-700 hover:text-blue-800 hover:bg-gray-200'
                  }`}
                  title="مستكشف بيانات الجزائر الجغرافية المفتوحة (البلديات، الدوائر، الرموز البريدية)"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>دليل البلديات والدوائر</span>
                </button>
              </div>

              {/* Utility buttons: Expand / Contract */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsMapExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 border border-gray-300 transition-colors cursor-pointer"
                  title={isMapExpanded ? 'تصغير العرض' : 'توسيع عرض الخريطة على كامل الصفحة'}
                >
                  {isMapExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isMapExpanded ? 'تصغير' : 'ملء الشاشة'}</span>
                </button>
              </div>
            </div>

            {/* Status bar & Current Wilaya */}
            <div className="flex items-center justify-between mb-2 px-1 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-gray-700 truncate">
                  {mapSourceMode === 'geoalgeria'
                    ? 'خريطة الجزائر التفاعلية الرسمية: حدود ومواقع الـ 69 ولاية'
                    : mapSourceMode === 'geo_explorer'
                    ? 'مستكشف البيانات الجغرافية المفتوحة (1541 بلدية و 551 دائرة)'
                    : 'خريطة الجزائر النقابية التخطيطية (69 ولاية)'}
                </span>
              </div>
              <span className="text-[11px] font-bold bg-green-100 text-green-900 px-2 py-0.5 rounded-full font-mono shrink-0">
                ولاية مختارة: {currentWilaya.code} - {currentWilaya.name}
              </span>
            </div>

            {/* Map Display Viewport */}
            <div className={`flex-grow flex items-center justify-center ${isMapExpanded ? 'min-h-[580px] h-[580px]' : 'min-h-[460px] h-[460px]'} bg-slate-900 rounded-xl border border-gray-200 relative overflow-hidden mb-3`}>
              
              {mapSourceMode === 'geoalgeria' ? (
                <div className="w-full h-full relative flex flex-col bg-slate-950">
                  <AlgeriaWilayasLeafletMap
                    selectedWilayaCode={selectedWilayaCode}
                    onSelectWilaya={(code) => {
                      setSelectedWilayaCode(code);
                      setActiveTab('wilaya');
                    }}
                    className="w-full h-full min-h-[460px]"
                  />
                </div>
              ) : mapSourceMode === 'geo_explorer' ? (
                /* Mode 3: Local Open Data Explorer from hamidibachireduc-png/mapalgeria */
                <div className="w-full h-full bg-slate-900 text-slate-100 flex flex-col p-3 overflow-hidden text-right">
                  {/* Search bar inside explorer */}
                  <div className="mb-3 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🔍</span>
                      <input
                        type="text"
                        value={geoSearchQuery}
                        onChange={(e) => setGeoSearchQuery(e.target.value)}
                        placeholder="ابحث في 1541 بلدية و 551 دائرة بالاسم (عربي / فرنسي) أو الرمز البريدي (مثال: عين وسارة، 17000، Alger)..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      {geoSearchQuery && (
                        <button
                          onClick={() => setGeoSearchQuery('')}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-700 cursor-pointer"
                        >
                          مسح
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Content: Search results OR Wilaya Deep Details */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                    {geoSearchQuery.trim() ? (
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-300 mb-2 border-b border-slate-800 pb-1">
                          <span>نتائج البحث المباشرة ({geoSearchResults.length} نتيجة):</span>
                          <span className="text-[10px] text-emerald-400 font-mono">مستودع: mapalgeria</span>
                        </div>
                        {geoSearchResults.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-xs">
                            لم يتم العثور على بلديات مطابقة لبحثك. جرب كتابة اسم البلدية باللغة العربية أو الفرنسية أو الرمز البريدي.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {geoSearchResults.map((commune: any, idx: number) => {
                              const targetCode = GEO_TO_SNTE_CODE[Number(commune.wilaya_code)] || String(commune.wilaya_code).padStart(2, '0');
                              const parentW = WILAYAS_LIST.find((w) => w.code === targetCode || String(parseInt(w.code, 10)) === String(commune.wilaya_code));
                              return (
                                <div
                                  key={idx}
                                  className="bg-slate-800/90 border border-slate-700 hover:border-blue-400 p-2.5 rounded-xl transition-colors flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-white text-xs">{commune.name_ar}</span>
                                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                                        {commune.postal_code || '—'}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                                      <span>{commune.name_fr}</span>
                                      <span>الدائرة: {commune.daira || '—'}</span>
                                    </div>
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                                    <span className="text-[10px] text-yellow-300 font-bold">
                                      ولاية {parentW ? `${parentW.name} (${parentW.code})` : commune.wilaya_code}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (parentW) {
                                          setSelectedWilayaCode(parentW.code);
                                          setActiveTab('wilaya');
                                        }
                                      }}
                                      className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded font-bold transition-colors cursor-pointer"
                                    >
                                      معاينة الهيكل النقابي ↗
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Selected Wilaya Breakdown from GeoAlgeria */
                      <div className="space-y-3">
                        {/* Wilaya Meta Badge Card */}
                        <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/30 p-3 rounded-xl">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-400/20 pb-2 mb-2">
                            <div>
                              <h4 className="text-sm font-black text-white flex items-center gap-2">
                                <span>ولاية {currentWilaya.name} ({currentWilaya.code})</span>
                                {geoWilaya?.name_fr && (
                                  <span className="text-xs font-mono font-normal text-blue-300">/ {geoWilaya.name_fr}</span>
                                )}
                              </h4>
                            </div>
                            <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                              سنة الاعتماد: {parseInt(currentWilaya.code, 10) >= 59 ? '2026 (التقسيم الإداري الجديد)' : parseInt(currentWilaya.code, 10) >= 49 ? '2019' : '1984'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div className="bg-slate-900/80 p-2 rounded border border-slate-700">
                              <span className="text-slate-400 block text-[10px]">الرمز البريدي الرئيسي:</span>
                              <span className="font-mono font-bold text-emerald-400">{geoWilaya?.postal_code || `${currentWilaya.code}000`}</span>
                            </div>
                            <div className="bg-slate-900/80 p-2 rounded border border-slate-700">
                              <span className="text-slate-400 block text-[10px]">الرمز الهاتفي:</span>
                              <span className="font-mono font-bold text-amber-300">{geoWilaya?.phone_code || '—'}</span>
                            </div>
                            <div className="bg-slate-900/80 p-2 rounded border border-slate-700">
                              <span className="text-slate-400 block text-[10px]">عدد الدوائر:</span>
                              <span className="font-bold text-blue-300">{geoDairas.length} دائرة</span>
                            </div>
                            <div className="bg-slate-900/80 p-2 rounded border border-slate-700">
                              <span className="text-slate-400 block text-[10px]">عدد البلديات:</span>
                              <span className="font-bold text-emerald-300">{geoCommunes.length} بلدية</span>
                            </div>
                          </div>
                        </div>

                        {/* Dairas List */}
                        {geoDairas.length > 0 && (
                          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                            <span className="text-[11px] font-bold text-slate-300 block mb-1.5">
                              🏛️ دوائر ولاية {currentWilaya.name} ({geoDairas.length} دائرة):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {geoDairas.map((d: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-slate-900 text-slate-200 border border-slate-700 px-2 py-0.5 rounded font-bold"
                                >
                                  {d.name_ar} {d.name_fr ? <span className="text-slate-400 font-mono font-normal">({d.name_fr})</span> : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Communes List */}
                        {geoCommunes.length > 0 && (
                          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                            <span className="text-[11px] font-bold text-slate-300 block mb-1.5">
                              🏘️ بلديات ولاية {currentWilaya.name} والرموز البريدية ({geoCommunes.length} بلدية):
                            </span>
                            <div className="max-h-48 overflow-y-auto custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {geoCommunes.map((c: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="bg-slate-900/90 p-1.5 rounded border border-slate-800 flex items-center justify-between text-[11px]"
                                >
                                  <div>
                                    <span className="font-bold text-white block">{c.name_ar}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{c.name_fr}</span>
                                  </div>
                                  <div className="text-left font-mono">
                                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800 block font-bold">
                                      {c.postal_code || '—'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer credit to GitHub */}
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-emerald-400 font-bold">مصدر الخريطة والبيانات: مستودع mapalgeria المعتمد</span>
                    <a
                      href="https://github.com/hamidibachireduc-png/mapalgeria"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-mono font-bold"
                    >
                      github.com/hamidibachireduc-png/mapalgeria ↗
                    </a>
                  </div>
                </div>
              ) : isMapLoading ? (
                <div className="flex flex-col items-center justify-center text-center p-6 text-white">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-green-400 font-bold text-sm">جاري تحميل خريطة الهياكل النقابية...</p>
                </div>
              ) : svgMapHtml ? (
                <div className="w-full h-full flex flex-col items-center justify-between p-2 relative overflow-hidden bg-slate-900">
                  <div
                    className="w-full flex-1 flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[350px] [&>svg_path]:fill-slate-700 [&>svg_path]:stroke-slate-500 [&>svg_path]:cursor-pointer [&>svg_path:hover]:fill-emerald-500 p-2"
                    dangerouslySetInnerHTML={{ __html: svgMapHtml }}
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
                            }
                          }
                        }
                      }
                    }}
                  />

                  {/* Interactive Bar for Modified Wilayas 59-69 in SVG mode */}
                  <div className="w-full bg-slate-800/95 border-t border-amber-500/30 p-2 rounded-xl flex flex-col gap-1.5 z-10 shadow-lg">
                    <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold px-1">
                      <span className="flex items-center gap-1">
                        <span>✨</span>
                        <span>الولايات المعدلة والمستحدثة (59 إلى 69) - انقر للتحديد التفاعلي:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setMapSourceMode('geoalgeria')}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                      >
                        عرض الخريطة التفاعلية الكاملة (Leaflet) ←
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                      {newWilayasRelations.map((nw) => {
                        const isSelected = selectedWilayaCode === nw.id;
                        return (
                          <button
                            key={nw.id}
                            type="button"
                            onClick={() => {
                              setSelectedWilayaCode(nw.id);
                              setActiveTab('wilaya');
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-white scale-105'
                                : 'bg-slate-700/80 text-amber-200 hover:bg-amber-500/20 hover:text-white border border-amber-500/30'
                            }`}
                          >
                            <span className="font-mono font-black">{nw.id}</span>
                            <span>{nw.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative flex flex-col bg-slate-950">
                  <AlgeriaWilayasLeafletMap
                    selectedWilayaCode={selectedWilayaCode}
                    onSelectWilaya={(code) => {
                      setSelectedWilayaCode(code);
                      setActiveTab('wilaya');
                    }}
                    className="w-full h-full min-h-[460px]"
                  />
                </div>
              )}
            </div>

            {/* Quick Geo Information Bar */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentWilaya.code}
                </span>
                <div>
                  <span className="font-black text-gray-900 block">
                    ولاية {currentWilaya.name}
                  </span>
                  <span className="text-[10px] text-gray-600 block">
                    {currentWilaya.regionalCoordinator ? `المنطقة الجهوية: ${currentWilaya.regionalCoordinator}` : 'التقسيم الإداري الرسمي (69 ولاية)'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMapSourceMode('geoalgeria');
                  }}
                  className="bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-1 rounded-lg text-[11px] transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  title="عرض موقع وحدود الولاية على الخريطة التفاعلية"
                >
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>معاينة على الخريطة التفاعلية</span>
                </button>
              </div>
            </div>

            {/* 69 Wilayas Grid selector */}
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <span>⚡ اختيار دقيق لولايات الجزائر (من 01 إلى 69):</span>
                </label>
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setWilayasGridFilter('all')}
                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      wilayasGridFilter === 'all' ? 'bg-green-700 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    الكل (69)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWilayasGridFilter('1-48')}
                    className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      wilayasGridFilter === '1-48' ? 'bg-green-700 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    1 - 48
                  </button>
                  <button
                    type="button"
                    onClick={() => setWilayasGridFilter('49-58')}
                    className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      wilayasGridFilter === '49-58' ? 'bg-green-700 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    49 - 58
                  </button>
                  <button
                    type="button"
                    onClick={() => setWilayasGridFilter('59-69')}
                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      wilayasGridFilter === '59-69'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs ring-1 ring-amber-600'
                        : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                    }`}
                  >
                    <span>✨</span>
                    <span>الولايات المعدلة (59-69)</span>
                  </button>
                </div>
              </div>

              <div className="max-h-36 overflow-y-auto custom-scrollbar bg-gray-50 p-2 rounded-xl border grid grid-cols-3 sm:grid-cols-4 gap-1.5 text-right">
                {WILAYAS_LIST.filter((w) => {
                  const codeNum = parseInt(w.code, 10);
                  if (isNaN(codeNum)) return wilayasGridFilter === 'all';
                  if (wilayasGridFilter === '1-48') return codeNum >= 1 && codeNum <= 48;
                  if (wilayasGridFilter === '49-58') return codeNum >= 49 && codeNum <= 58;
                  if (wilayasGridFilter === '59-69') return codeNum >= 59 && codeNum <= 69;
                  return true;
                }).map((w) => {
                  const isSelected = w.code === selectedWilayaCode;
                  const isModified = parseInt(w.code, 10) >= 59 && parseInt(w.code, 10) <= 69;
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
                          ? 'bg-green-700 text-white shadow-md scale-102 ring-2 ring-amber-400'
                          : isModified
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300'
                          : 'bg-white hover:bg-green-50 text-gray-800 border border-gray-200'
                      }`}
                      title={`${w.code} - ${w.name}${isModified ? ' (ولاية معدلة/مستحدثة)' : ''}`}
                    >
                      <span className="truncate flex items-center gap-1">
                        {isModified && <span className="text-amber-600 text-[10px]">✨</span>}
                        <span>{w.name}</span>
                      </span>
                      <span className={`text-[10px] font-mono px-1 rounded ${
                        isSelected 
                          ? 'bg-amber-400 text-slate-950 font-black' 
                          : isModified 
                          ? 'bg-amber-200 text-amber-950 font-bold' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
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
                <label className="block text-xs font-bold text-gray-700 mb-1">بحث برقم أو اسم الولاية:</label>
                <input
                  type="text"
                  value={wilayaSearchInput}
                  onChange={handleSearchChange}
                  placeholder="مثال: 17 أو 64 أو بوسعادة أو مسعد"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold focus:ring-green-500 bg-gray-50"
                />
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
                  <div className="bg-emerald-700 text-white p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🌐</span>
                      <span className="font-bold text-sm">التنسيق الجهوي: <span className="text-yellow-300 font-black text-base">{selectedRegionName}</span></span>
                    </div>
                    <span className="text-[11px] bg-emerald-800/80 px-2.5 py-1 rounded-full text-emerald-100 border border-emerald-600/50">
                      7 أمانات جهوية عبر القطر الوطني
                    </span>
                  </div>

                  {/* أزرار التنقل السريع بين الأمانات الجهوية السبع */}
                  <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl">
                    <span className="text-[11px] font-bold text-gray-500 block mb-1.5">اختر الأمانة الجهوية للمعاينة:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.keys(regionalData).map((regionKey) => (
                        <button
                          key={regionKey}
                          onClick={() => setSelectedRegionName(regionKey)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            selectedRegionName === regionKey
                              ? 'bg-emerald-700 text-white shadow-md scale-102 ring-2 ring-emerald-400'
                              : 'bg-white hover:bg-emerald-50 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {regionKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  {regionalData[selectedRegionName] && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-xl shadow-sm space-y-3">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-right">
                        <div className="w-20 h-20 rounded-full border-3 border-emerald-400 bg-white overflow-hidden shrink-0 shadow-md">
                          <img
                            src={getImageUrl(regionalData[selectedRegionName].coordinator.image)}
                            onError={(e: any) => { e.target.src = 'https://l.top4top.io/p_37988hwfa0.png'; }}
                            alt="المنسق الجهوي"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded inline-block">
                            المنسق الجهوي المعتمد
                          </span>
                          <h4 className="text-base sm:text-lg font-black text-gray-900 mt-1">
                            {regionalData[selectedRegionName].coordinator.name}
                          </h4>
                          <p className="text-xs text-gray-600 mt-0.5">
                            ولاية الإقامة: <strong className="text-emerald-800">{regionalData[selectedRegionName].coordinator.wilaya}</strong>
                          </p>
                          {regionalData[selectedRegionName].coordinator.email && (
                            <a
                              href={`mailto:${regionalData[selectedRegionName].coordinator.email}`}
                              className="text-xs text-blue-600 hover:underline mt-1 inline-block font-mono"
                            >
                              📧 {regionalData[selectedRegionName].coordinator.email}
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-emerald-100" dir="ltr">
                          {regionalData[selectedRegionName].coordinator.phones.map((phone: string, i: number) => (
                             <div key={i} className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200 shadow-xs">
                                <span className="font-bold text-gray-800 font-mono text-xs">{phone}</span>
                                <a href={`tel:${phone}`} className="text-blue-600 hover:underline text-xs font-bold">📞 اتصال</a>
                                <span className="text-gray-300">|</span>
                                <a href={getWhatsAppLink(phone)} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-xs font-bold">💬 واتساب</a>
                             </div>
                          ))}
                      </div>

                      <div className="mt-3 pt-3 border-t border-emerald-200">
                        <span className="text-xs font-bold text-gray-700 block mb-2">أعضاء الأمانة الجهوية:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {regionalData[selectedRegionName].members.map((m: any, i: number) => (
                            <div key={i} className="bg-white p-3 rounded-lg border border-emerald-200 flex items-center justify-between shadow-xs">
                              <div className="flex items-center gap-2.5">
                                <img 
                                  src={getImageUrl(m.image)}
                                  onError={(e: any) => { e.target.src = 'https://l.top4top.io/p_37988hwfa0.png'; }}
                                  alt={m.name}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-300 shrink-0"
                                />
                                <div>
                                  <span className="font-bold text-gray-900 text-xs block">{m.name}</span>
                                  <span className="text-[10px] text-emerald-700 font-semibold block">ولاية {m.wilaya}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1 items-end">
                                 {m.phones.map((p: string, idx: number) => (
                                     <div key={idx} className="flex items-center gap-1.5 text-[10px] font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                                        <span className="font-bold text-gray-800">{p}</span>
                                        <a href={`tel:${p}`} className="text-blue-500" title="اتصال">📞</a>
                                        <a href={getWhatsAppLink(p)} target="_blank" rel="noopener noreferrer" className="text-green-500" title="واتساب">💬</a>
                                     </div>
                                 ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* الولايات التابعة لهذه الأمانة الجهوية */}
                      <div className="mt-3 pt-3 border-t border-emerald-200">
                        <span className="text-xs font-bold text-gray-700 block mb-1.5">
                          🏛️ الولايات التابعة لهذا النطاق الجهوي (انقر للانتقال للولاية):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {WILAYAS_LIST.filter(w => w.regionalCoordinator && w.regionalCoordinator.includes(selectedRegionName)).map((w) => (
                            <button
                              key={w.code}
                              onClick={() => {
                                setSelectedWilayaCode(w.code);
                                setActiveTab('wilaya');
                              }}
                              className="bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs px-2 py-1 rounded-md font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <span>{w.name}</span>
                              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1 rounded">({w.code})</span>
                            </button>
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
                  
                  {/* أزرار العودة الذكية والتنقل */}
                  <div className="flex flex-wrap items-center gap-2 pb-2">
                    <button 
                      onClick={() => setActiveTab('national')} 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-gray-200"
                    >
                      <span>🔙</span> العودة للمكتب الوطني
                    </button>

                    {currentWilaya.regionalCoordinator && (
                      <button 
                        onClick={() => {
                          const regKeys = Object.keys(regionalData);
                          const foundReg = regKeys.find(k => currentWilaya.regionalCoordinator.includes(k));
                          if (foundReg) {
                            setSelectedRegionName(foundReg);
                          }
                          setActiveTab('regional');
                        }}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-emerald-300"
                        title="عرض الأمانة الجهوية التابعة لها هذه الولاية"
                      >
                        <span>🌐</span> الأمانة الجهوية: {currentWilaya.regionalCoordinator}
                      </button>
                    )}
                    
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
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-gray-700">
                            🏛️ البلديات التابعة ({activeWilayaCommunes.length} بلدية):
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono font-bold">
                            بيانات معتمدة: mapalgeria
                          </span>
                        </div>
                        <div className="max-h-36 overflow-y-auto custom-scrollbar bg-white p-2 rounded-lg border grid grid-cols-2 gap-1.5 text-right text-xs">
                          {activeWilayaCommunes.map((c: any, i: number) => (
                            <div key={i} className="p-1.5 bg-gray-50 rounded border border-gray-100 flex flex-col justify-between">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-green-800">{c.name_ar || c.name}</span>
                                {c.postal_code && (
                                  <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">
                                    {c.postal_code}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-500 truncate">
                                {c.daira ? `دائرة: ${c.daira}` : c.daira_ar ? `دائرة: ${c.daira_ar}` : c.name_fr || ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMapSourceMode('geo_explorer');
                        const el = document.getElementById('interactive-map-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs border border-blue-500"
                    >
                      <Compass className="w-3.5 h-3.5 text-blue-200" />
                      <span>مستكشف بيانات {currentWilaya.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMapSourceMode('geoalgeria');
                        const el = document.getElementById('interactive-map-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs border border-emerald-500"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-200" />
                      <span>أطلس GeoAlgeria</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleWilayaSGIngress}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-2 px-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 border-2 border-amber-300 text-xs"
                    >
                      <span>🔑</span>
                      <span>دخول الأمين الولائي</span>
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
