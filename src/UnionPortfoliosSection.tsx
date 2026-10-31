import React, { useState, useEffect } from 'react';
import {
  TopicCategory,
  UnionTopic,
  CATEGORY_INFO,
  INITIAL_TOPICS,
  PublicationRequest,
  INITIAL_PUBLICATION_REQUESTS,
} from './unionPortfoliosData';
import { AddTopicModal } from './AddTopicModal';
import { RequestPublicationModal } from './RequestPublicationModal';
import { PublicationRequestsReviewModal } from './PublicationRequestsReviewModal';
import { REGIONAL_COORDINATORS, WILAYAS_LIST } from './wilayasList';
import { UnionAnalyticsDashboard } from './UnionAnalyticsDashboard';

interface UnionPortfoliosSectionProps {
  initialMemberCategory?: TopicCategory;
  initialActivityCategory?: TopicCategory;
}

// Social media sharing bar for union topics (WhatsApp, Facebook, X, Telegram, Copy Link)
const TopicSocialShareButtons: React.FC<{ topic: UnionTopic; compact?: boolean }> = ({ topic, compact = false }) => {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    try {
      const base = window.location.origin + window.location.pathname;
      return `${base}#topic-${topic.id}`;
    } catch {
      return `https://snte-portal.dz/#topic-${topic.id}`;
    }
  };

  const getFullImageUrl = () => {
    if (!topic.imageUrl) return '';
    try {
      if (topic.imageUrl.startsWith('http://') || topic.imageUrl.startsWith('https://')) {
        return topic.imageUrl;
      }
      return `${window.location.origin}${topic.imageUrl.startsWith('/') ? '' : '/'}${topic.imageUrl}`;
    } catch {
      return topic.imageUrl;
    }
  };

  const shareUrl = getShareUrl();
  const fullImageUrl = getFullImageUrl();

  const shareText = `📌 ${topic.title}\n${topic.summary}\n${fullImageUrl ? `🖼️ صورة الموضوع المرفقة: ${fullImageUrl}\n` : ''}🏛️ النقابة الوطنية لعمال التربية S.N.T.E\n🔗 الرابط: ${shareUrl}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(topic.title + (fullImageUrl ? `\n${fullImageUrl}` : ''))}&url=${encodeURIComponent(shareUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(topic.title + (fullImageUrl ? `\n🖼️ ${fullImageUrl}` : ''))}`;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="مشاركة عبر واتساب"
          className="w-6 h-6 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs transition-colors border border-emerald-200"
        >
          💬
        </a>
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="مشاركة على فيسبوك"
          className="w-6 h-6 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center text-xs transition-colors border border-blue-200"
        >
          📘
        </a>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="مشاركة على منصة X"
          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center text-xs transition-colors border border-gray-300"
        >
          𝕏
        </a>
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="مشاركة عبر تيليجرام"
          className="w-6 h-6 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 flex items-center justify-center text-xs transition-colors border border-sky-200"
        >
          ✈️
        </a>
        <button
          type="button"
          onClick={handleCopy}
          title="نسخ الرابط المباشر للموضوع"
          className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-950 text-[10px] font-black flex items-center gap-1 border border-amber-300 cursor-pointer shadow-2xs"
        >
          <span>{copied ? '✓' : '🔗'}</span>
          <span>{copied ? 'تم النسخ' : 'مشاركة'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50/60 via-emerald-50/40 to-blue-50/40 border border-amber-200/80 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex items-center gap-1.5 text-xs font-black text-gray-800">
        <span className="text-sm">📢</span>
        <span>مشاركة هذا الموضوع في منصات التواصل الاجتماعي:</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075E54] text-xs font-black flex items-center gap-1 border border-[#25D366]/30 transition-all shadow-2xs"
        >
          <span>💬</span>
          <span>واتساب</span>
        </a>
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1.5 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#1877F2] text-xs font-black flex items-center gap-1 border border-[#1877F2]/30 transition-all shadow-2xs"
        >
          <span>📘</span>
          <span>فيسبوك</span>
        </a>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1.5 rounded-xl bg-black/10 hover:bg-black/20 text-gray-900 text-xs font-black flex items-center gap-1 border border-black/20 transition-all shadow-2xs"
        >
          <span>𝕏</span>
          <span>منصة X</span>
        </a>
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1.5 rounded-xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 text-[#0088cc] text-xs font-black flex items-center gap-1 border border-[#0088cc]/30 transition-all shadow-2xs"
        >
          <span>✈️</span>
          <span>تيليجرام</span>
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black flex items-center gap-1 border border-amber-500/40 transition-all cursor-pointer shadow-xs"
        >
          <span>{copied ? '✅' : '📋'}</span>
          <span>{copied ? 'تم نسخ الرابط!' : 'نسخ الرابط المباشر'}</span>
        </button>
      </div>
    </div>
  );
};

export const UnionPortfoliosSection: React.FC<UnionPortfoliosSectionProps> = () => {
  // Member Services Category (Platforms & Bags)
  const [selectedMemberCategory, setSelectedMemberCategory] = useState<TopicCategory>('platforms');
  
  // Public Activities Category (Wilayas & Regions)
  const [selectedActivityCategory, setSelectedActivityCategory] = useState<TopicCategory>('wilaya_acts');

  // Interactive 07 Regional Coordinations filter state
  const [selectedRegionalCoord, setSelectedRegionalCoord] = useState<string>('all');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Collapsible Accordion Cards State (أركان بقوائم منسدلة مطوية احترافية)
  const [openSections, setOpenSections] = useState({
    activities: true,
    memberServices: true,
    analytics: false,
    platforms: false,
  });

  const [topics, setTopics] = useState<UnionTopic[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeCategoryForAdd, setActiveCategoryForAdd] = useState<TopicCategory>('union_bag');
  const [editingTopic, setEditingTopic] = useState<UnionTopic | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedTopicDetails, setSelectedTopicDetails] = useState<UnionTopic | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Determine user authorization
  const isNationalSG =
    currentUser?.role === 'NATIONAL_SG' ||
    currentUser?.level === 'national' ||
    currentUser?.username === 'kouideryahiaoui';

  const isWilayaOrRegionalSG =
    currentUser &&
    !isNationalSG &&
    (currentUser.role === 'WILAYA_SG' ||
      currentUser.role === 'GENERAL_COORDINATOR' ||
      currentUser.role === 'MUNICIPAL_SG' ||
      currentUser.role === 'BRANCH_SG' ||
      currentUser.level === 'wilaya' ||
      currentUser.level === 'coordinator');

  const isVisitor = !currentUser;

  const refreshUser = () => {
    try {
      const uRaw = localStorage.getItem('snte_user');
      setCurrentUser(uRaw ? JSON.parse(uRaw) : null);
    } catch {
      setCurrentUser(null);
    }
  };

  const loadRequestsCount = () => {
    try {
      const raw = localStorage.getItem('snte_publication_requests_v1');
      const reqs: PublicationRequest[] = raw ? JSON.parse(raw) : INITIAL_PUBLICATION_REQUESTS;
      const count = reqs.filter((r) => r.status === 'pending').length;
      setPendingRequestsCount(count);
    } catch {
      setPendingRequestsCount(0);
    }
  };

  const loadTopics = () => {
    try {
      const storedRaw = localStorage.getItem('snte_custom_topics_v1');
      const customTopics: UnionTopic[] = storedRaw ? JSON.parse(storedRaw) : [];
      const combined = [
        ...customTopics,
        ...INITIAL_TOPICS.filter((init) => !customTopics.some((c) => c.id === init.id)),
      ];
      setTopics(combined);
    } catch {
      setTopics(INITIAL_TOPICS);
    }
  };

  useEffect(() => {
    refreshUser();
    loadTopics();
    loadRequestsCount();

    const checkTopicHash = () => {
      try {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#topic-')) {
          const tId = hash.replace('#topic-', '');
          const storedRaw = localStorage.getItem('snte_custom_topics_v1');
          const customTopics: UnionTopic[] = storedRaw ? JSON.parse(storedRaw) : [];
          const all = [...customTopics, ...INITIAL_TOPICS];
          const found = all.find((t) => t.id === tId);
          if (found) {
            setSelectedTopicDetails(found);
            if (found.category === 'national_acts' || found.category === 'wilaya_acts' || found.category === 'region_acts') {
              setSelectedActivityCategory(found.category);
              setOpenSections((prev) => ({ ...prev, activities: true }));
            } else {
              setSelectedMemberCategory(found.category);
              setOpenSections((prev) => ({ ...prev, memberServices: true }));
            }
          }
        }
      } catch (err) {
        console.warn(err);
      }
    };

    checkTopicHash();
    window.addEventListener('hashchange', checkTopicHash);

    const handleSwitchCategory = (e: any) => {
      const cat = e.detail?.category as TopicCategory;
      if (!cat) return;
      if (cat === 'national_acts' || cat === 'wilaya_acts' || cat === 'region_acts') {
        setSelectedActivityCategory(cat);
        setOpenSections((prev) => ({ ...prev, activities: true }));
        const elem = document.getElementById('unionActivitiesSection');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      } else {
        setSelectedMemberCategory(cat);
        setOpenSections((prev) => ({ ...prev, memberServices: true }));
        const elem = document.getElementById('memberServicesSection');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const handleOpenAddTopic = (e: any) => {
      const cat = (e.detail?.category as TopicCategory) || 'union_bag';
      setActiveCategoryForAdd(cat);
      if (cat === 'national_acts' || cat === 'wilaya_acts' || cat === 'region_acts') {
        setSelectedActivityCategory(cat);
        setOpenSections((prev) => ({ ...prev, activities: true }));
      } else {
        setSelectedMemberCategory(cat);
        setOpenSections((prev) => ({ ...prev, memberServices: true }));
      }

      const uRaw = localStorage.getItem('snte_user');
      const u = uRaw ? JSON.parse(uRaw) : null;
      if (u?.role === 'NATIONAL_SG' || u?.level === 'national' || u?.username === 'kouideryahiaoui') {
        setEditingTopic(null);
        setIsAddModalOpen(true);
      } else if (u) {
        setIsRequestModalOpen(true);
      } else {
        window.dispatchEvent(new CustomEvent('snte-open-login'));
      }
    };

    const handleTopicPublishedEvent = () => {
      loadTopics();
      loadRequestsCount();
    };

    window.addEventListener('snte-switch-portfolio', handleSwitchCategory);
    window.addEventListener('snte-open-add-topic', handleOpenAddTopic);
    window.addEventListener('snte-topic-published', handleTopicPublishedEvent);
    window.addEventListener('storage', () => {
      refreshUser();
      loadTopics();
      loadRequestsCount();
    });

    return () => {
      window.removeEventListener('hashchange', checkTopicHash);
      window.removeEventListener('snte-switch-portfolio', handleSwitchCategory);
      window.removeEventListener('snte-open-add-topic', handleOpenAddTopic);
      window.removeEventListener('snte-topic-published', handleTopicPublishedEvent);
    };
  }, []);

  const handleTopicSaved = (newTopic: UnionTopic) => {
    loadTopics();
    if (newTopic.category === 'national_acts' || newTopic.category === 'wilaya_acts' || newTopic.category === 'region_acts') {
      setSelectedActivityCategory(newTopic.category);
    } else {
      setSelectedMemberCategory(newTopic.category);
    }
    setEditingTopic(null);
  };

  const handleEditTopic = (topic: UnionTopic) => {
    if (!isNationalSG) {
      alert('تعديل المواضيع على البوابة الرسمية مخصص حصرياً للأمين العام الوطني.');
      return;
    }
    setActiveCategoryForAdd(topic.category);
    setEditingTopic(topic);
    setIsAddModalOpen(true);
  };

  const handleDeleteCustomTopic = (topicId: string) => {
    if (!isNationalSG) return;
    try {
      const storedRaw = localStorage.getItem('snte_custom_topics_v1');
      const customTopics: UnionTopic[] = storedRaw ? JSON.parse(storedRaw) : [];
      const filtered = customTopics.filter((t) => t.id !== topicId);
      localStorage.setItem('snte_custom_topics_v1', JSON.stringify(filtered));
      loadTopics();
    } catch (e) {
      console.error(e);
    }
  };

  const MEMBER_CATEGORIES: TopicCategory[] = ['platforms', 'union_bag', 'legal_bag', 'edu_bag'];
  const ACTIVITY_CATEGORIES: TopicCategory[] = ['national_acts', 'wilaya_acts', 'region_acts'];

  const filteredMemberTopics = topics.filter((t) => {
    const matchCategory = t.category === selectedMemberCategory;
    const q = memberSearchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.author.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q));
    return matchCategory && matchSearch;
  });

  const filteredActivityTopics = topics.filter((t) => {
    const matchCategory = t.category === selectedActivityCategory;
    const q = activitySearchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.author.toLowerCase().includes(q) ||
      (t.wilayaName && t.wilayaName.toLowerCase().includes(q)) ||
      (t.region && t.region.toLowerCase().includes(q)) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q));
    return matchCategory && matchSearch;
  });

  const activeMemberInfo = CATEGORY_INFO[selectedMemberCategory];
  const activeActivityInfo = CATEGORY_INFO[selectedActivityCategory];

  return (
    <div id="unionPortfoliosSection" className="font-['Cairo',sans-serif] max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* ========================================================================= */}
      {/* الركن الأول: النشاطات النقابية (أركان بقوائم منسدلة مطوية احترافية)        */}
      {/* ========================================================================= */}
      <div id="unionActivitiesSection" className="bg-white rounded-3xl shadow-md border border-emerald-600/30 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setOpenSections((prev) => ({ ...prev, activities: !prev.activities }))}
          className="w-full bg-gradient-to-r from-[#00371b] via-[#00552b] to-[#00371b] text-white p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:opacity-95 transition-all text-right"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center text-xl font-black shadow-inner">
              🏛️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                الركن الأول: النشاطات النقابية (النشاط الوطني، الأمانات الولائية والـ 72، والتنسيقيات)
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                متابعة حية وتقارير رسمية لنشاطات الأمانة العامة، الأمانات الولائية والـ 72، والتنسيقيات الجهوية
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-emerald-950 text-xs font-black px-3 py-1 rounded-full font-mono">
              {filteredActivityTopics.length} نشاط
            </span>
            <span className="text-xl font-black transition-transform duration-300">
              {openSections.activities ? '⌄' : '‹'}
            </span>
          </div>
        </button>

        {openSections.activities && (
          <div className="p-4 sm:p-6 bg-gradient-to-br from-white via-gray-50/50 to-emerald-50/20 space-y-6">
            {/* Role Banner / Request License Controls */}
            <div>
              {isNationalSG ? (
                <div className="bg-gradient-to-r from-amber-500/15 via-emerald-600/10 to-amber-500/15 border-2 border-amber-400 rounded-2xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👑</span>
                    <div>
                      <h4 className="font-black text-sm text-emerald-950 flex items-center gap-2">
                        <span>الأمانة العامة الوطنية (الأستاذ قويدر يحياوي)</span>
                        <span className="bg-amber-400 text-emerald-950 text-[10px] px-2 py-0.5 rounded-full font-black">
                          نشر وتعديل معتمد
                        </span>
                      </h4>
                      <p className="text-xs text-gray-700 mt-0.5">
                        إدارة نشر وتقارير النشاطات النقابية ودراسة طلبات التفويض والترخيص المرفوعة من الأمانات الولائية.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(true)}
                      className="bg-[#006633] hover:bg-[#004d26] text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>📩</span>
                      <span>مراجعة طلبات الترخيص</span>
                      {pendingRequestsCount > 0 && (
                        <span className="bg-amber-400 text-emerald-950 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black animate-pulse">
                          {pendingRequestsCount} معلقة
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategoryForAdd(selectedActivityCategory);
                        setEditingTopic(null);
                        setIsAddModalOpen(true);
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-amber-300"
                    >
                      <span>➕</span>
                      <span>نشر نشاط أو بيان ميداني</span>
                    </button>
                  </div>
                </div>
              ) : isWilayaOrRegionalSG ? (
                <div className="bg-blue-50/90 border border-blue-200 rounded-2xl p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏛️</span>
                    <div>
                      <h4 className="font-black text-sm text-blue-950">
                        مرحباً بالأخ: {currentUser.name} ({currentUser.structureName || currentUser.title})
                      </h4>
                      <p className="text-xs text-blue-900/80 mt-0.5">
                        يمكنك إرسال طلب ترخيص وتفويض للأمين العام الوطني لنشر نشاطات هيكلكم الولائي أو الجهوي على البوابة.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(true)}
                      className="bg-white hover:bg-gray-100 text-blue-900 border border-blue-300 font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      📋 تتبع طلباتي
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategoryForAdd(selectedActivityCategory);
                        setIsRequestModalOpen(true);
                      }}
                      className="bg-[#006633] hover:bg-[#004d26] text-white font-black text-xs px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>📨</span>
                      <span>طلب ترخيص بنشر نشاط</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Activities Controls: Category Navigation & Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
                  {ACTIVITY_CATEGORIES.map((catKey) => {
                    const info = CATEGORY_INFO[catKey];
                    const isSelected = selectedActivityCategory === catKey;
                    const count = topics.filter((t) => t.category === catKey).length;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setSelectedActivityCategory(catKey)}
                        className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#006633] text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{info.icon}</span>
                        <span>{info.label}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={activitySearchQuery}
                    onChange={(e) => setActivitySearchQuery(e.target.value)}
                    placeholder="بحث في النشاطات الوطنية، الولايات والتنسيقيات..."
                    className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  />
                  <span className="absolute right-2.5 top-2.5 text-gray-400 text-xs">🔍</span>
                </div>
              </div>
            </div>

            {/* Interactive 07 Regional Coordinations Bar */}
            {selectedActivityCategory === 'wilaya_acts' && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-sm">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h4 className="font-black text-sm text-emerald-950 flex items-center gap-2">
                    <span>🌐</span>
                    <span>07 أمانات تنسيق جهوي تفاعلية (فلترة سريعة لهياكل الولايات الـ 72)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedRegionalCoord('all')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                      selectedRegionalCoord === 'all' ? 'bg-[#006633] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    عرض كل الولايات (72)
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {REGIONAL_COORDINATORS.map((rc) => {
                    const isSelected = selectedRegionalCoord === rc.id;
                    return (
                      <button
                        key={rc.id}
                        type="button"
                        onClick={() => setSelectedRegionalCoord(rc.id)}
                        className={`p-2.5 rounded-xl text-right transition-all border cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-gradient-to-br from-emerald-900 to-[#004d26] text-white border-amber-400 shadow-md ring-1 ring-amber-300'
                            : 'bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-950 border-emerald-200'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-black opacity-80 block mb-0.5">{rc.region}</span>
                          <span className="text-xs font-black line-clamp-1">{rc.name}</span>
                        </div>
                        <div className="mt-2 text-[10px] font-mono opacity-90 flex items-center justify-between">
                          <span>{rc.wilayasCovered.length} ولاية</span>
                          <span>←</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                    {WILAYAS_LIST.filter((w) => {
                      if (selectedRegionalCoord === 'all') return true;
                      const rc = REGIONAL_COORDINATORS.find((c) => c.id === selectedRegionalCoord);
                      return rc ? rc.wilayasCovered.includes(w.code) : true;
                    }).map((wilaya) => (
                      <div key={wilaya.code} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-3 border border-gray-200 shadow-2xs hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="bg-[#006633] text-white text-[10px] font-black px-2 py-0.5 rounded-md font-mono">
                            {wilaya.code}
                          </span>
                          <span className="text-xs font-black text-gray-900">{wilaya.name}</span>
                        </div>
                        <div className="text-[11px] text-gray-600 space-y-1">
                          <div>الأمين الولائي: <strong className="text-emerald-900">{wilaya.sgName}</strong></div>
                          <div>الهاتف: <span className="font-mono">{wilaya.phone}</span></div>
                          <div className="text-[10px] text-gray-500 truncate">المقر: {wilaya.headquarters}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activities Banner */}
            <div
              className={`rounded-2xl p-4 sm:p-5 text-white bg-gradient-to-r ${activeActivityInfo.color} shadow-sm flex items-center justify-between flex-wrap gap-3`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeActivityInfo.icon}</span>
                <div>
                  <h3 className="font-black text-base sm:text-lg">{activeActivityInfo.label}</h3>
                  <p className="text-xs text-white/90 font-medium">{activeActivityInfo.desc}</p>
                </div>
              </div>
            </div>

            {/* Topics Grid */}
            {filteredActivityTopics.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 shadow-sm">
                <span className="text-4xl block mb-2">📰</span>
                <h4 className="text-sm font-bold text-gray-800">لا توجد نشاطات مسجلة في هذا القسم حالياً</h4>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredActivityTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`bg-white rounded-2xl border transition-all hover:shadow-lg flex flex-col overflow-hidden ${
                      topic.isPinned
                        ? 'border-amber-400 shadow-md ring-1 ring-amber-300/50'
                        : 'border-gray-200 shadow-xs'
                    }`}
                  >
                    <div className="p-4 pb-2 flex items-center justify-between text-xs border-b border-gray-100">
                      <span className="font-mono text-[10px] text-gray-400">📅 {topic.date}</span>
                      {topic.wilayaName ? (
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          ولاية {topic.wilayaName}
                        </span>
                      ) : topic.region ? (
                        <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                          تنسيقية {topic.region}
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          نشاط نقابي
                        </span>
                      )}
                    </div>
                    {topic.imageUrl && (
                      <div className="h-36 overflow-hidden bg-gray-100 border-b border-gray-100">
                        <img src={topic.imageUrl} alt={topic.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-sm text-gray-900 leading-snug hover:text-[#006633] transition-colors mb-2">
                          {topic.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-3">
                          {topic.summary}
                        </p>
                      </div>

                      <div>
                        <div className="text-[11px] text-gray-500 font-medium mb-3 flex items-center gap-1">
                          <span>🏛️</span>
                          <span>{topic.author}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {topic.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-md"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <TopicSocialShareButtons topic={topic} compact />
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedTopicDetails(topic)}
                            className="text-[#006633] hover:text-[#004d26] text-xs font-black flex items-center gap-1 cursor-pointer"
                          >
                            <span>عرض التفاصيل</span>
                            <span>←</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            {topic.fileUrl && (
                              <a
                                href={topic.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-50 hover:bg-emerald-100 text-[#006633] text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1"
                              >
                                <span>📄</span>
                                <span>بيان / محضر</span>
                              </a>
                            )}

                            {topic.externalUrl && (
                              <a
                                href={topic.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1"
                              >
                                <span>🔗</span>
                                <span>{topic.actionText || 'فتح'}</span>
                              </a>
                            )}

                            {isNationalSG && (
                              <div className="flex items-center gap-1 border-r border-gray-200 pr-1.5 mr-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditTopic(topic)}
                                  className="text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-2 py-1 text-[11px] font-black cursor-pointer"
                                >
                                  ✏️ تعديل
                                </button>
                                {topic.id.startsWith('topic-') && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCustomTopic(topic.id)}
                                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-1 text-[11px] cursor-pointer"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* الركن الثاني: خدمات الحقائب والمنصات (متاحة حصرياً لمنخرطي الأسنتيو)      */}
      {/* ========================================================================= */}
      <div id="memberServicesSection" className="bg-white rounded-3xl shadow-md border border-emerald-600/30 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setOpenSections((prev) => ({ ...prev, memberServices: !prev.memberServices }))}
          className="w-full bg-gradient-to-r from-[#00371b] via-[#00552b] to-[#00371b] text-white p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:opacity-95 transition-all text-right"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center text-xl font-black shadow-inner">
              💼
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                الركن الثاني: خدمات الحقائب والمنصات (متاحة حصرياً لمنخرطي الأسنتيو)
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                تطبيقات النقابة، الحقيبة النقابية، القانونية، والتربوية (محمية ومخصصة للمنخرطين)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-emerald-950 text-xs font-black px-3 py-1 rounded-full font-mono">
              {filteredMemberTopics.length} خدمة
            </span>
            <span className="text-xl font-black transition-transform duration-300">
              {openSections.memberServices ? '⌄' : '‹'}
            </span>
          </div>
        </button>

        {openSections.memberServices && (
          <div className="p-4 sm:p-6 bg-gradient-to-br from-white via-gray-50/50 to-amber-50/20 space-y-6">
            {/* Official Platform Banner */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-emerald-600/30 bg-gradient-to-r from-[#00371b] via-[#00552b] to-[#00371b] text-white p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:w-1/3 rounded-xl overflow-hidden shadow-md border border-amber-400/50 bg-black/30 shrink-0">
                <img
                  src="/assets/aistudio/WhatsApp_Image_2026-10-11_at_16.38.53_a3613cf2.jpeg"
                  alt="تطبيقات النقابة ومنصات الأسنتيو"
                  className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://l.top4top.io/p_37988hwfa0.png';
                  }}
                />
              </div>
              <div className="flex-1 text-right space-y-1.5">
                <span className="bg-amber-400 text-emerald-950 px-3 py-0.5 rounded-full text-[11px] font-black shadow-xs inline-block">
                  📱 بوابات رقمية وتطبيقات هاتفية
                </span>
                <h4 className="text-lg font-black text-white">تطبيقات النقابة ومنصات الأسنتيو الرسمية</h4>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  منظومة رقمية شاملة لإدارة الهياكل، بطاقات الانخراط الإلكترونية والورقية، تتبع المحاضر، وإصدار التنبيهات الفورية وفق السلم النقابي.
                </p>
              </div>
            </div>

            {/* Member Services Controls: Category Navigation & Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto scrollbar-none pb-1 lg:pb-0">
                  {MEMBER_CATEGORIES.map((catKey) => {
                    const info = CATEGORY_INFO[catKey];
                    const isSelected = selectedMemberCategory === catKey;
                    const count = topics.filter((t) => t.category === catKey).length;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setSelectedMemberCategory(catKey)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#006633] text-white shadow-md'
                            : isVisitor
                            ? 'bg-amber-50 text-amber-950 border border-amber-300 hover:bg-amber-100'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{isVisitor ? '🔒' : info.icon}</span>
                        <span>{info.label}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="w-full lg:w-auto flex items-center gap-2.5 flex-wrap">
                  <div className="relative flex-1 sm:w-60">
                    <input
                      type="text"
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      placeholder="بحث في الحقائب والمنصات..."
                      className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                    />
                    <span className="absolute right-2.5 top-2.5 text-gray-400 text-xs">🔍</span>
                  </div>

                  {isNationalSG && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategoryForAdd(selectedMemberCategory);
                        setEditingTopic(null);
                        setIsAddModalOpen(true);
                      }}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-emerald-950 font-black px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 border border-amber-400"
                    >
                      <span>➕</span>
                      <span>إضافة للحقيبة</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Member Services Banner */}
            <div
              className={`rounded-2xl p-4 text-white bg-gradient-to-r ${activeMemberInfo.color} shadow-sm flex items-center justify-between flex-wrap gap-3`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeMemberInfo.icon}</span>
                <div>
                  <h4 className="font-black text-base">{activeMemberInfo.label}</h4>
                  <p className="text-xs text-white/90 font-medium">{activeMemberInfo.desc}</p>
                </div>
              </div>
            </div>

            {/* Content: Protected Gate for Visitors OR Visible Topics for Members */}
            {isVisitor ? (
              <div className="bg-gradient-to-br from-white via-amber-50/50 to-emerald-50/50 rounded-3xl p-8 text-center border-2 border-dashed border-amber-400 shadow-md max-w-2xl mx-auto my-4">
                <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-3 shadow-inner border border-amber-300">
                  🔒
                </div>
                <span className="bg-amber-100 text-amber-900 text-xs font-black px-3.5 py-1 rounded-full inline-block mb-2 border border-amber-300">
                  محتوى محمي خاص بالمنخرطين
                </span>
                <h4 className="text-lg font-black text-gray-900 mb-1">
                  خدمات الحقائب والمنصات متاحة حصرياً لمنخرطي الأسنتيو
                </h4>
                <p className="text-xs text-gray-700 max-w-md mx-auto leading-relaxed mb-5 font-medium">
                  تصفح تطبيقات النقابة، الحقيبة النقابية، القانونية، والتربوية مخصص حصرياً للمنخرطين المسجلين.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('snte-open-login'))}
                    className="w-full sm:w-auto bg-[#006633] hover:bg-[#004d26] text-white font-black px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🔐</span>
                    <span>تسجيل الدخول كمنخرط</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('snte-open-register'))}
                    className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
                  >
                    <span>📝</span>
                    <span>تسجيل انخراط جديد واستصدار بطاقة</span>
                  </button>
                </div>
              </div>
            ) : filteredMemberTopics.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 shadow-sm">
                <span className="text-4xl block mb-2">📂</span>
                <h4 className="text-sm font-bold text-gray-800">لا توجد مواضيع في هذا القسم حالياً</h4>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMemberTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`bg-white rounded-2xl border transition-all hover:shadow-lg flex flex-col overflow-hidden ${
                      topic.isPinned
                        ? 'border-amber-400 shadow-md ring-1 ring-amber-300/50'
                        : 'border-gray-200 shadow-xs'
                    }`}
                  >
                    <div className="p-4 pb-2 flex items-center justify-between text-xs border-b border-gray-100">
                      <span className="font-mono text-[10px] text-gray-400">📅 {topic.date}</span>
                      {topic.isPinned && (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                          📌 مثبت
                        </span>
                      )}
                    </div>
                    {topic.imageUrl && (
                      <div className="h-36 overflow-hidden bg-gray-100 border-b border-gray-100">
                        <img src={topic.imageUrl} alt={topic.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-sm text-gray-900 leading-snug hover:text-[#006633] transition-colors mb-2">
                          {topic.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-3">
                          {topic.summary}
                        </p>
                      </div>

                      <div>
                        <div className="text-[11px] text-gray-500 font-medium mb-3 flex items-center gap-1">
                          <span>🏛️</span>
                          <span>{topic.author}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {topic.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-md"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <TopicSocialShareButtons topic={topic} compact />
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedTopicDetails(topic)}
                            className="text-[#006633] hover:text-[#004d26] text-xs font-black flex items-center gap-1 cursor-pointer"
                          >
                            <span>عرض التفاصيل</span>
                            <span>←</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            {topic.fileUrl && (
                              <a
                                href={topic.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-50 hover:bg-emerald-100 text-[#006633] text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1"
                              >
                                <span>📄</span>
                                <span>مستند</span>
                              </a>
                            )}

                            {topic.externalUrl && (
                              <a
                                href={topic.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1"
                              >
                                <span>🔗</span>
                                <span>{topic.actionText || 'فتح'}</span>
                              </a>
                            )}

                            {isNationalSG && (
                              <div className="flex items-center gap-1 border-r border-gray-200 pr-1.5 mr-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditTopic(topic)}
                                  className="text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-2 py-1 text-[11px] font-black cursor-pointer"
                                >
                                  ✏️ تعديل
                                </button>
                                {topic.id.startsWith('topic-') && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCustomTopic(topic.id)}
                                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-1 text-[11px] cursor-pointer"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* الركن الثالث: لوحة القيادة الإحصائية (Dashboard)                           */}
      {/* ========================================================================= */}
      <div id="analyticsDashboardSection" className="bg-white rounded-3xl shadow-md border border-emerald-600/30 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setOpenSections((prev) => ({ ...prev, analytics: !prev.analytics }))}
          className="w-full bg-gradient-to-r from-[#00371b] via-[#00552b] to-[#00371b] text-white p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:opacity-95 transition-all text-right"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center text-xl font-black shadow-inner">
              📊
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                الركن الثالث: لوحة القيادة الإحصائية والتحليلات المتقدمة
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                إحصائيات تفاعلية ورسوم بيانية لتوزيع المنخرطين حسب الرتب، الولايات، والمستويات التنظيمية
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-emerald-950 text-xs font-black px-3 py-1 rounded-full font-mono">
              تحليلات حية
            </span>
            <span className="text-xl font-black transition-transform duration-300">
              {openSections.analytics ? '⌄' : '‹'}
            </span>
          </div>
        </button>

        {openSections.analytics && (
          <div className="p-6 bg-gradient-to-br from-white via-emerald-50/20 to-gray-50 text-center space-y-4">
            <div className="max-w-xl mx-auto space-y-2">
              <span className="bg-emerald-100 text-[#006633] px-3 py-1 rounded-full text-xs font-black">
                📈 رسوم بيانية تفاعلية دقيقة
              </span>
              <h4 className="text-xl font-black text-gray-900">استعراض لوحة القيادة الإحصائية الشاملة</h4>
              <p className="text-xs text-gray-600">
                اضغط أدناه لفتح لوحة المؤشرات الإحصائية التفصيلية وتوزيع الانخراطات بحسب كافة معايير السلم النقابي.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAnalyticsOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer inline-flex items-center gap-2 border border-amber-400"
            >
              <span>📊</span>
              <span>فتح لوحة القيادة الإحصائية بالتفصيل</span>
              <span>←</span>
            </button>
          </div>
        )}
      </div>
      <UnionAnalyticsDashboard isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />

      {/* ========================================================================= */}
      {/* الركن الرابع: المنصات والخدمات الرقمية المعتمدة                            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl shadow-md border border-emerald-600/30 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setOpenSections((prev) => ({ ...prev, platforms: !prev.platforms }))}
          className="w-full bg-gradient-to-r from-[#00371b] via-[#00552b] to-[#00371b] text-white p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:opacity-95 transition-all text-right"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center text-xl font-black shadow-inner">
              ☁️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                الركن الرابع: المنصات والخدمات الرقمية المعتمدة (Google Sheets Sync)
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                إدارة قواعد البيانات السحابية ومزامنة الانخراطات والمحاضر والتقارير المالية
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-emerald-950 text-xs font-black px-3 py-1 rounded-full font-mono">
              ربط سحابي
            </span>
            <span className="text-xl font-black transition-transform duration-300">
              {openSections.platforms ? '⌄' : '‹'}
            </span>
          </div>
        </button>

        {openSections.platforms && (
          <div className="p-6 bg-gradient-to-br from-white via-emerald-50/20 to-gray-50 text-center space-y-4">
            <div className="max-w-xl mx-auto space-y-2">
              <span className="bg-amber-100 text-amber-950 px-3 py-1 rounded-full text-xs font-black border border-amber-300">
                🔒 خاص بالأمين العام الوطني
              </span>
              <h4 className="text-xl font-black text-gray-900">نظام المزامنة والربط السحابي المعتمد لـ S.N.T.E</h4>
              <p className="text-xs text-gray-600">
                إدارة قواعد بيانات المنخرطين، المحاضر، التقارير المالية والشكاوى مع ربط مباشر مع Google Drive & Google Sheets.
              </p>
            </div>
            {isNationalSG ? (
              <button
                type="button"
                onClick={() => {
                  if ((window as any).openGoogleSheetsSync) {
                    (window as any).openGoogleSheetsSync();
                  } else {
                    window.dispatchEvent(new CustomEvent('snte-open-sheets-sync'));
                  }
                }}
                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer inline-flex items-center gap-2 border border-amber-400"
              >
                <span>☁️</span>
                <span>فتح لوحة مزامنة Google Sheets</span>
                <span>←</span>
              </button>
            ) : (
              <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 inline-block">
                🔐 يتطلب تسجيل الدخول بصلاحيات الأمين العام الوطني (`kouideryahiaoui`) لإدارة المزامنة.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Topic Modal (National SG Exclusive) */}
      <AddTopicModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTopic(null);
        }}
        defaultCategory={activeCategoryForAdd}
        initialTopic={editingTopic}
        onTopicAdded={handleTopicSaved}
      />

      {/* Request Publication & Licensing Modal */}
      <RequestPublicationModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        currentUser={currentUser}
        defaultCategory={activeCategoryForAdd}
        onRequestSubmitted={() => {
          loadRequestsCount();
        }}
      />

      {/* Publication Requests Review Modal (National SG Exclusive) */}
      <PublicationRequestsReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        currentUser={currentUser}
        onApproveAndPublish={() => {
          loadTopics();
          loadRequestsCount();
        }}
      />

      {/* Topic Details Modal */}
      {selectedTopicDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-emerald-500/30 overflow-hidden my-4 max-h-[90vh] flex flex-col text-right">
            <div className="bg-gradient-to-r from-[#00371b] to-[#004d26] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">
                  {CATEGORY_INFO[selectedTopicDetails.category]?.icon || '📄'}
                </span>
                <div>
                  <h3 className="font-black text-sm sm:text-base leading-snug">
                    {selectedTopicDetails.title}
                  </h3>
                  <span className="text-[11px] text-amber-300">
                    {CATEGORY_INFO[selectedTopicDetails.category]?.label}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTopicDetails(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {isVisitor && MEMBER_CATEGORIES.includes(selectedTopicDetails.category) ? (
              <div className="p-8 sm:p-10 text-center bg-gradient-to-br from-white via-amber-50/60 to-emerald-50/40 space-y-4">
                <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-inner border border-amber-300">
                  🔒
                </div>
                <span className="bg-amber-100 text-amber-900 text-xs font-black px-4 py-1.5 rounded-full inline-block border border-amber-300 shadow-2xs">
                  خدمة محمية خاصة بمنخرطي الأسنتيو
                </span>
                <h4 className="text-lg sm:text-xl font-black text-gray-900">
                  مواضيع الحقائب والمنصات متاحة حصرياً للمنخرطين المعتمدين
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 max-w-md mx-auto leading-relaxed font-medium">
                  للاطلاع على تفاصيل هذه الخدمة وتحميل وثائقها والوصول إلى المنصات الرقمية المعتمدة، يرجى تسجيل الدخول أو تقديم طلب انخراط جديد واستصدار بطاقتك النقابية.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTopicDetails(null);
                      window.dispatchEvent(new CustomEvent('snte-open-login'));
                    }}
                    className="w-full sm:w-auto bg-[#006633] hover:bg-[#004d26] text-white font-black px-6 py-3 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🔐</span>
                    <span>تسجيل الدخول كمنخرط</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTopicDetails(null);
                      window.dispatchEvent(new CustomEvent('snte-open-register'));
                    }}
                    className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-6 py-3 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
                  >
                    <span>📝</span>
                    <span>تسجيل انخراط جديد واستصدار بطاقة</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
                {selectedTopicDetails.imageUrl && (
                  <div className="rounded-2xl overflow-hidden shadow-md max-h-72 border border-emerald-200 bg-gray-100 group relative">
                    <img src={selectedTopicDetails.imageUrl} alt={selectedTopicDetails.title} className="w-full h-full object-cover" />
                    <a
                      href={selectedTopicDetails.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 left-2 bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-1.5 transition-all"
                    >
                      <span>🔍</span>
                      <span>معاينة الصورة المرفقة بالحجم الكامل</span>
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 pb-3 border-b border-gray-100 flex-wrap gap-2">
                  <span>المصدر: <strong>{selectedTopicDetails.author}</strong></span>
                  <span className="font-mono">تاريخ النشر: {selectedTopicDetails.date}</span>
                </div>

                <div>
                  <h4 className="text-xs font-black text-gray-700 mb-1">ملخص البيان / الموضوع:</h4>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">
                    {selectedTopicDetails.summary}
                  </p>
                </div>

                {selectedTopicDetails.content && (
                  <div>
                    <h4 className="text-xs font-black text-gray-700 mb-1">النص الكامل والتفاصيل:</h4>
                    <div className="text-xs text-gray-800 leading-relaxed whitespace-pre-line bg-emerald-50/40 p-4 rounded-xl border border-emerald-200">
                      {selectedTopicDetails.content}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  {selectedTopicDetails.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-emerald-50 text-[#006633] text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Social Media Sharing Bar inside Modal */}
                <TopicSocialShareButtons topic={selectedTopicDetails} />

                <div className="pt-3 border-t border-gray-100 flex items-center gap-3 flex-wrap">
                  {selectedTopicDetails.fileUrl && (
                    <a
                      href={selectedTopicDetails.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#006633] hover:bg-[#004d26] text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>📄</span>
                      <span>تحميل الوثيقة المرفقة</span>
                    </a>
                  )}
                  {selectedTopicDetails.externalUrl && (
                    <a
                      href={selectedTopicDetails.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>🔗</span>
                      <span>{selectedTopicDetails.actionText || 'فتح الرابط'}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
              {isNationalSG && (
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = selectedTopicDetails;
                    setSelectedTopicDetails(null);
                    handleEditTopic(toEdit);
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <span>✏️</span>
                  <span>تعديل هذا الموضوع</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedTopicDetails(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
