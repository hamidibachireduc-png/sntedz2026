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

interface UnionPortfoliosSectionProps {
  initialCategory?: TopicCategory;
}

export const UnionPortfoliosSection: React.FC<UnionPortfoliosSectionProps> = ({
  initialCategory = 'platforms',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TopicCategory>(initialCategory);
  const [topics, setTopics] = useState<UnionTopic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const isPublicActivity = (cat: TopicCategory) => cat === 'wilaya_acts' || cat === 'region_acts';
  const isProtectedForVisitors = (cat: TopicCategory) => !isPublicActivity(cat);
  const isVisitor = !currentUser;

  const refreshUser = () => {
    try {
      const uRaw = localStorage.getItem('snte_user');
      const u = uRaw ? JSON.parse(uRaw) : null;
      setCurrentUser(u);
      if (!u && isProtectedForVisitors(selectedCategory)) {
        setSelectedCategory('wilaya_acts');
      }
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

  // Load custom topics from localStorage + initial seed topics
  const loadTopics = () => {
    try {
      const storedRaw = localStorage.getItem('snte_custom_topics_v1');
      const customTopics: UnionTopic[] = storedRaw ? JSON.parse(storedRaw) : [];
      // Combine custom topics first, then initial topics (avoid duplicates by id)
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

    // Listen to external category switches or add topic triggers
    const handleSwitchCategory = (e: any) => {
      if (e.detail?.category) {
        setSelectedCategory(e.detail.category);
      }
    };

    const handleOpenAddTopic = (e: any) => {
      if (e.detail?.category) {
        setSelectedCategory(e.detail.category);
      }
      // Check if user is National SG; if so open direct Add/Edit, else open Request modal
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
      window.removeEventListener('snte-switch-portfolio', handleSwitchCategory);
      window.removeEventListener('snte-open-add-topic', handleOpenAddTopic);
      window.removeEventListener('snte-topic-published', handleTopicPublishedEvent);
    };
  }, []);

  const handleTopicSaved = (newTopic: UnionTopic) => {
    loadTopics();
    setSelectedCategory(newTopic.category);
    setEditingTopic(null);
  };

  const handleEditTopic = (topic: UnionTopic) => {
    if (!isNationalSG) {
      alert('تعديل المواضيع على البوابة الرسمية مخصص حصرياً للأمين العام الوطني.');
      return;
    }
    setEditingTopic(topic);
    setIsAddModalOpen(true);
  };

  const handleDeleteCustomTopic = (topicId: string) => {
    if (!isNationalSG) {
      return;
    }
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

  // Filter topics
  const filteredTopics = topics.filter((t) => {
    const matchCategory = t.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
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

  const activeCategoryInfo = CATEGORY_INFO[selectedCategory];

  return (
    <section
      id="unionPortfoliosSection"
      className="py-12 px-4 sm:px-6 max-w-7xl mx-auto font-['Cairo',sans-serif]"
    >
      {/* Section Title & Header */}
      <div className="text-center max-w-3xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-[#006633] px-3.5 py-1 rounded-full text-xs font-black mb-2 shadow-xs">
          <span>🏛️</span>
          <span>منظومة الحقائب والنشاطات والمنصات النقابية</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          الحقائب الرقمية والأنشطة النقابية الميدانية
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          فضاء شامل يضم تطبيقات ومنصات الأسنتيو، الحقيبة النقابية، القانونية، والتربوية، مع تغطية حية لنشاطات الأمانات الولائية الـ 72 والتنسيقيات الجهوية.
        </p>
      </div>

      {/* Role-Specific Portal Notice Banner */}
      <div className="mb-6">
        {isNationalSG ? (
          // Notice for National SG
          <div className="bg-gradient-to-r from-amber-500/20 via-emerald-600/10 to-amber-500/20 border-2 border-amber-400 rounded-2xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <h4 className="font-black text-sm text-emerald-950 flex items-center gap-2">
                  <span>الأمانة العامة الوطنية (الأستاذ قويدر يحياوي)</span>
                  <span className="bg-amber-400 text-emerald-950 text-[10px] px-2 py-0.5 rounded-full font-black">
                    صلاحية النشر والتعديل الحصري
                  </span>
                </h4>
                <p className="text-xs text-gray-700 mt-0.5">
                  بصفتك الأمين العام الوطني، لديك الصلاحية الحصرية لإضافة وتعديل وحذف المواضيع مباشرة على البوابة، ودراسة طلبات التفويض والترخيص المرفوعة من الأمانات الولائية والمنسقين.
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
                <span>طلبات الترخيص والتفويض</span>
                {pendingRequestsCount > 0 && (
                  <span className="bg-amber-400 text-emerald-950 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black animate-pulse">
                    {pendingRequestsCount} معلقة
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingTopic(null);
                  setIsAddModalOpen(true);
                }}
                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-amber-300"
              >
                <span>➕</span>
                <span>إضافة موضوع جديد (نشر مباشر)</span>
              </button>
            </div>
          </div>
        ) : isWilayaOrRegionalSG ? (
          // Notice for Wilaya / Regional SGs and Coordinators
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏛️</span>
              <div>
                <h4 className="font-black text-sm text-blue-950 flex items-center gap-2">
                  <span>
                    مرحباً بالأخ: {currentUser.name} ({currentUser.structureName || currentUser.title})
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    نظام التفويض والترخيص
                  </span>
                </h4>
                <p className="text-xs text-blue-900/80 mt-0.5">
                  حسب النظام الداخلي، إضافة وتعديل المواضيع على البوابة المركزية محصورة في الأمانة العامة الوطنية. يمكنك إرسال طلب تفويض وترخيص بنشر بيانات ونشاطات هيكلكم للأمين العام الوطني.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="bg-white hover:bg-gray-100 text-blue-900 border border-blue-300 font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>📋</span>
                <span>تتبع طلباتي المرسلة</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="bg-[#006633] hover:bg-[#004d26] text-white font-black text-xs px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>📨</span>
                <span>طلب تفويض وترخيص بالنشر للأمين العام الوطني</span>
              </button>
            </div>
          </div>
        ) : (
          // Logged out / Members Notice
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-3 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚖️</span>
              <span>
                <strong>ضوابط النشر بالبوابة:</strong> إضافة المواضيع وتعديلها مخصصة حصرياً للأمين العام الوطني، وتتم عبر طلبات ترخيص وتفويض مسبقة من طرف الأمانات الولائية والتنسيقيات.
              </span>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('snte-open-login'))}
              className="bg-[#006633] text-white hover:bg-[#004d26] px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>🔐</span>
              <span>دخول الأمناء والمنسقين</span>
            </button>
          </div>
        )}
      </div>

      {/* Top Controls: Dropdown Menu, Category Selector & Main Action Button */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Dropdown Menu (القائمة المنسدلة للأقسام) */}
          <div className="w-full lg:w-auto flex items-center gap-3 flex-wrap">
            <label className="text-xs font-black text-gray-800 shrink-0 flex items-center gap-1.5">
              <span>📂</span>
              <span>اختر القسم أو الحقيبة (قائمة منسدلة):</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TopicCategory)}
              className="flex-1 sm:flex-none min-w-[280px] bg-emerald-50 border-2 border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-extrabold text-[#006633] outline-none shadow-xs cursor-pointer focus:ring-2 focus:ring-[#006633]"
            >
              {(Object.keys(CATEGORY_INFO) as TopicCategory[]).map((catKey) => {
                const info = CATEGORY_INFO[catKey];
                const count = topics.filter((t) => t.category === catKey).length;
                const isLocked = isVisitor && isProtectedForVisitors(catKey);
                return (
                  <option key={catKey} value={catKey}>
                    {isLocked ? '🔒 ' : info.icon + ' '}
                    {info.label} {isLocked ? '(خاص بالمنخرطين)' : `(${count} موضوع)`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Search Input & Action Button based on Role */}
          <div className="w-full lg:w-auto flex items-center gap-2.5 flex-wrap">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في مواضيع هذا القسم..."
                className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
              />
              <span className="absolute right-2.5 top-2.5 text-gray-400 text-xs">🔍</span>
            </div>

            {/* Action Button: Exclusive Direct Add for National SG vs Request Authorization for Wilaya SGs */}
            {isNationalSG ? (
              <button
                type="button"
                onClick={() => {
                  setEditingTopic(null);
                  setIsAddModalOpen(true);
                }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-emerald-950 font-black px-4 py-2 rounded-xl text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 border border-amber-400/50"
                title="إضافة موضوع وتعديله (خاص بالأمين العام الوطني)"
              >
                <span>➕</span>
                <span>إضافة موضوع جديد (نشر مباشر)</span>
              </button>
            ) : isWilayaOrRegionalSG ? (
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="bg-gradient-to-r from-[#006633] to-[#004d26] hover:from-[#004d26] hover:to-[#00371b] text-white font-black px-4 py-2 rounded-xl text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 border border-emerald-400/40"
                title="طلب ترخيص وتفويض بالنشر للأمين العام الوطني"
              >
                <span>📨</span>
                <span>طلب ترخيص وتفويض بالنشر</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('snte-open-login'))}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3.5 py-2 rounded-xl text-xs border border-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="النشر والتعديل للأمين العام الوطني بترخيص معتمد"
              >
                <span>🔒</span>
                <span>دخول الأمناء والمنخرطين</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-gray-100 scrollbar-none">
          {(Object.keys(CATEGORY_INFO) as TopicCategory[]).map((catKey) => {
            const info = CATEGORY_INFO[catKey];
            const isSelected = selectedCategory === catKey;
            const count = topics.filter((t) => t.category === catKey).length;
            const isLocked = isVisitor && isProtectedForVisitors(catKey);
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#006633] text-white shadow-sm font-black'
                    : isLocked
                    ? 'bg-amber-50 text-amber-900 border border-amber-300/80 hover:bg-amber-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{isLocked ? '🔒' : info.icon}</span>
                <span>{info.label}</span>
                {isLocked ? (
                  <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">
                    منخرطين
                  </span>
                ) : (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Category Banner */}
      <div
        className={`rounded-2xl p-4 sm:p-5 text-white mb-6 bg-gradient-to-r ${activeCategoryInfo.color} shadow-sm flex items-center justify-between flex-wrap gap-3`}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{activeCategoryInfo.icon}</span>
          <div>
            <h3 className="font-black text-base sm:text-lg">{activeCategoryInfo.label}</h3>
            <p className="text-xs text-white/90 font-medium">{activeCategoryInfo.desc}</p>
          </div>
        </div>

        {/* Action on Active Category Banner */}
        {isNationalSG ? (
          <button
            type="button"
            onClick={() => {
              setEditingTopic(null);
              setIsAddModalOpen(true);
            }}
            className="bg-white text-gray-900 hover:bg-gray-100 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>نشر مباشر في: {activeCategoryInfo.label}</span>
          </button>
        ) : isWilayaOrRegionalSG ? (
          <button
            type="button"
            onClick={() => setIsRequestModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-300 text-emerald-950 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>📨</span>
            <span>طلب ترخيص لنشر موضوع بهذا القسم</span>
          </button>
        ) : null}
      </div>

      {/* Topics Grid or Visitor Protection Gate */}
      {isVisitor && isProtectedForVisitors(selectedCategory) ? (
        <div className="bg-gradient-to-br from-white via-amber-50/40 to-emerald-50/40 rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-amber-400 shadow-lg max-w-3xl mx-auto my-6">
          <div className="w-20 h-20 bg-amber-100 text-amber-800 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-4 shadow-sm border border-amber-300">
            🔒
          </div>
          <span className="bg-amber-100 text-amber-900 text-xs font-black px-4 py-1.5 rounded-full inline-block mb-3 border border-amber-300">
            محتوى محمي خاص بالمنخرطين فقط
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">
            {activeCategoryInfo.label} متاحة حصرياً للمنخرطين
          </h3>
          <p className="text-xs sm:text-sm text-gray-700 max-w-xl mx-auto leading-relaxed mb-6 font-medium">
            وفق ضوابط البوابة الرسمية للنقابة الوطنية لعمال التربية S.N.T.E، تصفح واستخدام تطبيقات ومنصات الأسنتيو، والحقيبة النقابية، والقانونية، والتربوية مخصص حصرياً للمنخرطين المسجلين.
            <br />
            <span className="text-[#006633] font-bold block mt-2">
              🟢 يمكن للزوار الكرام الاطلاع بحرية تامة على كافة البيانات والنشاطات الميدانية من خلال قسمي «نشاطات الأمانات الولائية» و«نشاطات التنسيقيات الجهوية».
            </span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('snte-open-login'))}
              className="w-full sm:w-auto bg-[#006633] hover:bg-[#004d26] text-white font-black px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🔐</span>
              <span>تسجيل الدخول كمنخرط</span>
            </button>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('snte-open-register'))}
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
            >
              <span>📝</span>
              <span>تسجيل انخراط جديد واستصدار بطاقة</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('wilaya_acts')}
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-bold px-5 py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🏛️</span>
              <span>الانتقال لنشاطات الأمانات الولائية المتاحة للزوار</span>
            </button>
          </div>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 shadow-sm">
          <span className="text-4xl block mb-2">📂</span>
          <h4 className="text-sm font-bold text-gray-800">لا توجد مواضيع مطابقة في هذا القسم حالياً</h4>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            {isNationalSG
              ? 'يمكنك بصفتك الأمين العام الوطني إضافة أول موضوع أو بيان في هذا القسم.'
              : 'يمكن للأمانات الولائية والتنسيقيات إرسال طلب ترخيص وتفويض بالنشر للأمين العام الوطني.'}
          </p>
          {isNationalSG ? (
            <button
              type="button"
              onClick={() => {
                setEditingTopic(null);
                setIsAddModalOpen(true);
              }}
              className="bg-[#006633] hover:bg-[#004d26] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <span>➕</span>
              <span>إضافة أول موضوع في {activeCategoryInfo.label}</span>
            </button>
          ) : isWilayaOrRegionalSG ? (
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
              className="bg-[#006633] hover:bg-[#004d26] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <span>📨</span>
              <span>إرسال طلب ترخيص بالنشر للأمين العام الوطني</span>
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className={`bg-white rounded-2xl border transition-all hover:shadow-lg flex flex-col overflow-hidden ${
                topic.isPinned
                  ? 'border-amber-400 shadow-md ring-1 ring-amber-300/50'
                  : 'border-gray-200 shadow-xs'
              }`}
            >
              {/* Card Top Pill */}
              <div className="p-4 pb-2 flex items-center justify-between text-xs border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-gray-400">📅 {topic.date}</span>
                  {topic.isPinned && (
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                      📌 مثبت
                    </span>
                  )}
                </div>
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
                    {CATEGORY_INFO[topic.category].icon} {CATEGORY_INFO[topic.category].label.split(' ')[0]}
                  </span>
                )}
              </div>

              {/* Card Main Body */}
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
                  {/* Author / Source */}
                  <div className="text-[11px] text-gray-500 font-medium mb-3 flex items-center gap-1">
                    <span>🏛️</span>
                    <span>{topic.author}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    {topic.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTopicDetails(topic)}
                      className="text-[#006633] hover:text-[#004d26] text-xs font-black flex items-center gap-1 transition-colors cursor-pointer"
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
                          className="bg-emerald-50 hover:bg-emerald-100 text-[#006633] text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                          title="تحميل الملف أو المستند"
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
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
                        >
                          <span>🔗</span>
                          <span>{topic.actionText || 'فتح'}</span>
                        </a>
                      )}

                      {/* EDIT AND DELETE: STRICTLY RESERVED FOR THE NATIONAL SECRETARY GENERAL */}
                      {isNationalSG && (
                        <div className="flex items-center gap-1 border-r border-gray-200 pr-1.5 mr-1">
                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleEditTopic(topic)}
                            className="text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-2 py-1 text-[11px] font-black transition-colors cursor-pointer flex items-center gap-0.5"
                            title="تعديل هذا الموضوع (صلاحية الأمين العام الوطني)"
                          >
                            <span>✏️</span>
                            <span>تعديل</span>
                          </button>

                          {/* Delete button if custom added or licensed */}
                          {topic.id.startsWith('topic-') && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomTopic(topic.id)}
                              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-1 text-[11px] transition-colors cursor-pointer"
                              title="حذف هذا الموضوع (خاص بالأمين العام الوطني)"
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

      {/* Add / Edit Topic Modal (National SG Exclusive) */}
      <AddTopicModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTopic(null);
        }}
        defaultCategory={selectedCategory}
        initialTopic={editingTopic}
        onTopicAdded={handleTopicSaved}
      />

      {/* Request Publication & Licensing Modal (Wilaya SGs, Municipal SGs, Coordinators) */}
      <RequestPublicationModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        currentUser={currentUser}
        defaultCategory={selectedCategory}
        onRequestSubmitted={() => {
          loadRequestsCount();
          setIsReviewModalOpen(true);
        }}
      />

      {/* Publication Requests Review & Tracking Modal */}
      <PublicationRequestsReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        currentUser={currentUser}
        onApproveAndPublish={(approvedTopic: UnionTopic) => {
          loadTopics();
          loadRequestsCount();
          setSelectedCategory(approvedTopic.category);
        }}
      />

      {/* Topic Details Modal */}
      {selectedTopicDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-gray-200 overflow-hidden my-6 max-h-[90vh] flex flex-col text-right">
            <div className="bg-gradient-to-r from-[#00371b] via-[#006633] to-[#004d26] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span>{CATEGORY_INFO[selectedTopicDetails.category].icon}</span>
                <span className="font-black text-sm">
                  {CATEGORY_INFO[selectedTopicDetails.category].label}
                </span>
              </div>
              <button
                onClick={() => setSelectedTopicDetails(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-500 border-b pb-2">
                <span>
                  الجهة الناشرة: <strong>{selectedTopicDetails.author}</strong>
                </span>
                <span>التاريخ: {selectedTopicDetails.date}</span>
              </div>

              <h3 className="text-lg font-black text-gray-900 leading-snug">
                {selectedTopicDetails.title}
              </h3>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium leading-relaxed">
                {selectedTopicDetails.summary}
              </div>

              {selectedTopicDetails.content && (
                <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-200">
                  {selectedTopicDetails.content}
                </div>
              )}

              {/* Attachments / Links */}
              <div className="flex items-center gap-3 pt-3 flex-wrap">
                {selectedTopicDetails.fileUrl && (
                  <a
                    href={selectedTopicDetails.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#006633] hover:bg-[#004d26] text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>📄</span>
                    <span>تحميل المستند / الملف المرفق</span>
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
                    <span>{selectedTopicDetails.actionText || 'فتح الرابط الخارجي'}</span>
                  </a>
                )}
              </div>
            </div>

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
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
