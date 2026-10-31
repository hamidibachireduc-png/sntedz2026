import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WilayaData,
  Member,
  AssemblyPV,
  PublicationRequest,
  SyndicateActivity,
  LegalDocument,
  UserProfile,
} from '../types';
import {
  initialWilayas,
  initialMembers,
  initialAssemblyPVs,
  initialPublicationRequests,
  initialActivities,
  initialLegalDocs,
  currentUser as defaultUser,
} from '../data/initialData';

export type ModalType =
  | null
  | 'memberships' // انخراطات الولاية
  | 'publishing' // طلب ترخيص بالنشر
  | 'assembly' // منصة المحاضر والجمعيات العامة
  | 'activities' // النشاطات النقابية
  | 'bags' // الحقائب والمنصات
  | 'map' // خريطة الهياكل النقابية
  | 'profile' // تعديل بياناتي
  | 'legislation' // البيانات القانونية والتشريعات
  | 'live' // الاجتماع المباشر
  | 'stats' // الإحصائيات الإدارية
  | 'contact' // اتصل بنا
  | 'guide' // الدليل النقابي
  | 'about' // التعريف بالنقابة
  | 'db-restore'; // مركز استعادة قاعدة البيانات

interface DatabaseContextType {
  wilayas: WilayaData[];
  members: Member[];
  assemblyPVs: AssemblyPV[];
  publicationRequests: PublicationRequest[];
  activities: SyndicateActivity[];
  legalDocs: LegalDocument[];
  currentUser: UserProfile;
  selectedWilayaId: number;
  setSelectedWilayaId: (id: number) => void;
  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;
  activeTab: 'المكتب الوطني' | 'المستشارون' | 'لجنة الحكماء' | 'الأمانة الجهوية' | 'الأمانة الولائية';
  setActiveTab: (tab: 'المكتب الوطني' | 'المستشارون' | 'لجنة الحكماء' | 'الأمانة الجهوية' | 'الأمانة الولائية') => void;
  
  // Database operations
  restoreDefaultDatabase: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonString: string) => boolean;
  
  // Member actions
  addMember: (member: Omit<Member, 'id' | 'membershipNumber'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  
  // Assembly actions
  addAssemblyPV: (pv: Omit<AssemblyPV, 'id'>) => void;
  
  // Publication actions
  addPublicationRequest: (req: Omit<PublicationRequest, 'id' | 'submissionDate' | 'status'>) => void;
  updatePublicationStatus: (id: string, status: PublicationRequest['status'], notes?: string) => void;
  
  // Activity actions
  addActivity: (act: Omit<SyndicateActivity, 'id'>) => void;
  
  // Wilaya update
  updateWilaya: (id: number, data: Partial<WilayaData>) => void;
  
  // User profile
  updateCurrentUser: (user: Partial<UserProfile>) => void;
  
  // Notification toast
  notification: string | null;
  setNotification: (msg: string | null) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

const STORAGE_KEY = 'snte_portal_db_v2';

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wilayas, setWilayas] = useState<WilayaData[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_wilayas`);
    return saved ? JSON.parse(saved) : initialWilayas;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_members`);
    return saved ? JSON.parse(saved) : initialMembers;
  });

  const [assemblyPVs, setAssemblyPVs] = useState<AssemblyPV[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pvs`);
    return saved ? JSON.parse(saved) : initialAssemblyPVs;
  });

  const [publicationRequests, setPublicationRequests] = useState<PublicationRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pub_reqs`);
    return saved ? JSON.parse(saved) : initialPublicationRequests;
  });

  const [activities, setActivities] = useState<SyndicateActivity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_legal`);
    return saved ? JSON.parse(saved) : initialLegalDocs;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
    return saved ? JSON.parse(saved) : defaultUser;
  });

  // Selected Wilaya (17 = الجلفة as in screenshot)
  const [selectedWilayaId, setSelectedWilayaId] = useState<number>(17);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeTab, setActiveTab] = useState<'المكتب الوطني' | 'المستشارون' | 'لجنة الحكماء' | 'الأمانة الجهوية' | 'الأمانة الولائية'>('المكتب الوطني');
  const [notification, setNotification] = useState<string | null>(
    'تمت استعادة قاعدة بيانات النقابة الوطنية بنجاح: 69 ولاية، المكاتب التنفيذية، وسجلات المنخرطين والمحاضر متاحة بالكامل.'
  );

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_wilayas`, JSON.stringify(wilayas));
  }, [wilayas]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_members`, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_pvs`, JSON.stringify(assemblyPVs));
  }, [assemblyPVs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_pub_reqs`, JSON.stringify(publicationRequests));
  }, [publicationRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_legal`, JSON.stringify(legalDocs));
  }, [legalDocs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  // Dismiss notification after 8 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Restore Default Database
  const restoreDefaultDatabase = () => {
    setWilayas(initialWilayas);
    setMembers(initialMembers);
    setAssemblyPVs(initialAssemblyPVs);
    setPublicationRequests(initialPublicationRequests);
    setActivities(initialActivities);
    setLegalDocs(initialLegalDocs);
    setCurrentUser(defaultUser);
    setSelectedWilayaId(17);
    setNotification('تمت استعادة وتجديد قاعدة البيانات الأصلية بالكامل (69 ولاية، كافة المحاضر والمنخرطين)!');
  };

  // Export full JSON database
  const exportDatabaseJSON = () => {
    const fullBackup = {
      version: '2.4.0',
      system: 'النقابة الوطنية لعمال التربية S.N.T.E - الجزائر',
      exportedAt: new Date().toISOString(),
      data: {
        wilayas,
        members,
        assemblyPVs,
        publicationRequests,
        activities,
        legalDocs,
        currentUser,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SNTE_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setNotification('تم تنزيل النسخة الاحتياطية الكاملة لقاعدة البيانات بنجاح (ملف JSON).');
  };

  // Import JSON database
  const importDatabaseJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      const data = parsed.data || parsed;
      if (data.wilayas && Array.isArray(data.wilayas)) {
        setWilayas(data.wilayas);
      }
      if (data.members && Array.isArray(data.members)) {
        setMembers(data.members);
      }
      if (data.assemblyPVs && Array.isArray(data.assemblyPVs)) {
        setAssemblyPVs(data.assemblyPVs);
      }
      if (data.publicationRequests && Array.isArray(data.publicationRequests)) {
        setPublicationRequests(data.publicationRequests);
      }
      if (data.activities && Array.isArray(data.activities)) {
        setActivities(data.activities);
      }
      if (data.currentUser) {
        setCurrentUser(data.currentUser);
      }
      setNotification('تم استيراد واستعادة قاعدة البيانات من الملف المرفوع بنجاح!');
      return true;
    } catch (err) {
      console.error('Failed to import database JSON', err);
      setNotification('خطأ في استيراد ملف قاعدة البيانات. يرجى التأكد من صحة تنسيق JSON.');
      return false;
    }
  };

  // Member CRUD
  const addMember = (newMemberData: Omit<Member, 'id' | 'membershipNumber'>) => {
    const wilayaCode = String(newMemberData.wilayaId).padStart(2, '0');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const newMember: Member = {
      ...newMemberData,
      id: `mem-${Date.now()}`,
      membershipNumber: `SNTE-${wilayaCode}-2024-${randomSeq}`,
    };
    setMembers((prev) => [newMember, ...prev]);
    // Increase count on wilaya
    setWilayas((prev) =>
      prev.map((w) => (w.id === newMemberData.wilayaId ? { ...w, membersCount: w.membersCount + 1 } : w))
    );
    setNotification(`تم تسجيل المنخرط الجديد (${newMember.fullName}) بنجاح ورقم انخراطه: ${newMember.membershipNumber}`);
  };

  const updateMember = (id: string, updatedFields: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updatedFields } : m)));
    setNotification('تم تعديل بيانات المنخرط بنجاح.');
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setNotification('تم حذف سجل المنخرط من قاعدة البيانات.');
  };

  // Assembly CRUD
  const addAssemblyPV = (pvData: Omit<AssemblyPV, 'id'>) => {
    const newPV: AssemblyPV = {
      ...pvData,
      id: `pv-${Date.now()}`,
    };
    setAssemblyPVs((prev) => [newPV, ...prev]);
    // increment assembly count on wilaya
    setWilayas((prev) =>
      prev.map((w) => (w.id === pvData.wilayaId ? { ...w, assemblyCount: w.assemblyCount + 1, lastAssemblyDate: pvData.date } : w))
    );
    setNotification(`تم اعتماد وإضافة محضر الجمعية العامة (${newPV.documentRef}) بنجاح.`);
  };

  // Publication CRUD
  const addPublicationRequest = (reqData: Omit<PublicationRequest, 'id' | 'submissionDate' | 'status'>) => {
    const newReq: PublicationRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      submissionDate: new Date().toISOString().slice(0, 10),
      status: 'قيد الدراسة',
    };
    setPublicationRequests((prev) => [newReq, ...prev]);
    setNotification('تم إرسال طلب الترخيص بالنشر إلى الأمانة الوطنية المركزية للإعلام بنجاح.');
  };

  const updatePublicationStatus = (id: string, status: PublicationRequest['status'], notes?: string) => {
    setPublicationRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              notes: notes || r.notes,
              approvedBy: status === 'مقبول ومعتمد' ? currentUser.name : undefined,
              approvalDate: status === 'مقبول ومعتمد' ? new Date().toISOString().slice(0, 10) : undefined,
            }
          : r
      )
    );
    setNotification(`تم تحديث حالة طلب النشر إلى (${status}).`);
  };

  // Activity CRUD
  const addActivity = (actData: Omit<SyndicateActivity, 'id'>) => {
    const newAct: SyndicateActivity = {
      ...actData,
      id: `act-${Date.now()}`,
    };
    setActivities((prev) => [newAct, ...prev]);
    setNotification('تمت إضافة النشاط النقابي بنجاح إلى جدول الأعمال الوطني.');
  };

  // Wilaya update
  const updateWilaya = (id: number, data: Partial<WilayaData>) => {
    setWilayas((prev) => prev.map((w) => (w.id === id ? { ...w, ...data } : w)));
    setNotification('تم تحديث بيانات المكتب الولائي بنجاح.');
  };

  // User update
  const updateCurrentUser = (data: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
    setNotification('تم تحديث بيانات الحساب الشخصي بنجاح.');
  };

  return (
    <DatabaseContext.Provider
      value={{
        wilayas,
        members,
        assemblyPVs,
        publicationRequests,
        activities,
        legalDocs,
        currentUser,
        selectedWilayaId,
        setSelectedWilayaId,
        activeModal,
        setActiveModal,
        activeTab,
        setActiveTab,
        restoreDefaultDatabase,
        exportDatabaseJSON,
        importDatabaseJSON,
        addMember,
        updateMember,
        deleteMember,
        addAssemblyPV,
        addPublicationRequest,
        updatePublicationStatus,
        addActivity,
        updateWilaya,
        updateCurrentUser,
        notification,
        setNotification,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
