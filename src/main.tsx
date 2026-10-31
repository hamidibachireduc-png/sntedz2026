import './snte_bundle.js';
import './index.css';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleDriveSheetsSyncModal } from './GoogleDriveSheetsSyncModal';
import { TopAuthBar } from './TopAuthBar';
import { UnionPortfoliosSection } from './UnionPortfoliosSection';
import { MembershipStatusTrackerSection } from './MembershipStatusTrackerSection';
import { AdministrativeAnalyticsSection } from './AdministrativeAnalyticsSection';
import { InteractiveWilayasMapSection } from './InteractiveWilayasMapSection';

function GoogleSyncApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [minutes, setMinutes] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [finances, setFinances] = useState<any[]>([]);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [circulars, setCirculars] = useState<any[]>([]);
  const [archives, setArchives] = useState<any[]>([]);

  const loadData = () => {
    try {
      const mem = JSON.parse(localStorage.getItem('snte_members_v3') || '[]');
      setMembers(mem);
    } catch {}
    try {
      const min = JSON.parse(localStorage.getItem('snte_minutes_v3') || '[]');
      setMinutes(min);
    } catch {}
    try {
      const acc = JSON.parse(localStorage.getItem('snte_accounts_v3') || '[]');
      setAccounts(acc);
    } catch {}
    try {
      const fin = JSON.parse(localStorage.getItem('snte_finances') || '[]');
      setFinances(fin);
    } catch {}
    try {
      const grv = JSON.parse(localStorage.getItem('snte_grievances') || '[]');
      setGrievances(grv);
    } catch {}
    try {
      const circ = JSON.parse(localStorage.getItem('snte_circulars') || '[]');
      setCirculars(circ);
    } catch {}
    try {
      const arch = JSON.parse(localStorage.getItem('snte_archives_v1') || '[]');
      setArchives(arch);
    } catch {}
  };

  useEffect(() => {
    const handleOpen = () => {
      try {
        const u = JSON.parse(localStorage.getItem('snte_user') || 'null');
        if (!u || u.role !== 'NATIONAL_SG') {
          return;
        }
      } catch {
        return;
      }
      loadData();
      setIsOpen(true);
    };

    window.addEventListener('snte-open-sheets-sync', handleOpen);
    (window as any).openGoogleSheetsSync = handleOpen;

    return () => {
      window.removeEventListener('snte-open-sheets-sync', handleOpen);
    };
  }, []);

  const handleImportMembers = (imported: any[]) => {
    try {
      const current = JSON.parse(localStorage.getItem('snte_members_v3') || '[]');
      const combined = [...imported, ...current.filter((c: any) => !imported.some((i: any) => i.id === c.id))];
      localStorage.setItem('snte_members_v3', JSON.stringify(combined));
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportAccounts = (imported: any[]) => {
    try {
      const current = JSON.parse(localStorage.getItem('snte_accounts_v3') || '[]');
      const combined = [...imported, ...current.filter((c: any) => !imported.some((i: any) => i.id === c.id))];
      localStorage.setItem('snte_accounts_v3', JSON.stringify(combined));
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportFinances = (imported: any[]) => {
    try {
      const current = JSON.parse(localStorage.getItem('snte_finances') || '[]');
      const combined = [...imported, ...current.filter((c: any) => !imported.some((i: any) => i.id === c.id))];
      localStorage.setItem('snte_finances', JSON.stringify(combined));
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <GoogleDriveSheetsSyncModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      members={members}
      minutes={minutes}
      accounts={accounts}
      finances={finances}
      grievances={grievances}
      circulars={circulars}
      archives={archives}
      onImportMembers={handleImportMembers}
      onImportAccounts={handleImportAccounts}
      onImportFinances={handleImportFinances}
    />
  );
}

// 1. Mount the Top Universal AuthBar into the very top of document.body
const authBarContainer = document.createElement('div');
authBarContainer.id = 'snte-auth-bar-root';
if (document.body.firstChild) {
  document.body.insertBefore(authBarContainer, document.body.firstChild);
} else {
  document.body.appendChild(authBarContainer);
}
createRoot(authBarContainer).render(<TopAuthBar />);

// 2. Mount the sync modal into a dedicated element
const modalContainer = document.createElement('div');
modalContainer.id = 'sheets-sync-root';
document.body.appendChild(modalContainer);
createRoot(modalContainer).render(<GoogleSyncApp />);

// 3. Mount the Interactive Wilayas Map Section right below auth bar (الخريطة التفاعلية أسفل عناوين التويبات)
const mapSectionContainer = document.createElement('div');
mapSectionContainer.id = 'interactive-map-root';
if (authBarContainer.nextSibling) {
  authBarContainer.parentNode?.insertBefore(mapSectionContainer, authBarContainer.nextSibling);
} else {
  document.body.appendChild(mapSectionContainer);
}
createRoot(mapSectionContainer).render(<InteractiveWilayasMapSection />);

// 4. Mount the Union Portfolios and Activities Section below map (الأنشطة ثم الحقائب والمنصات)
const portfoliosContainer = document.createElement('div');
portfoliosContainer.id = 'portfolios-section-root';
if (mapSectionContainer.nextSibling) {
  mapSectionContainer.parentNode?.insertBefore(portfoliosContainer, mapSectionContainer.nextSibling);
} else {
  document.body.appendChild(portfoliosContainer);
}
createRoot(portfoliosContainer).render(<UnionPortfoliosSection />);

// 5. Mount the Membership Application Status Tracker Section below portfolios
const statusTrackerContainer = document.createElement('div');
statusTrackerContainer.id = 'membership-status-tracker-root';
if (portfoliosContainer.nextSibling) {
  portfoliosContainer.parentNode?.insertBefore(statusTrackerContainer, portfoliosContainer.nextSibling);
} else {
  document.body.appendChild(statusTrackerContainer);
}
createRoot(statusTrackerContainer).render(<MembershipStatusTrackerSection />);

// 6. Mount the Administrative Analytics Dashboard Section below status tracker (الإحصائيات ودعم القرار)
const analyticsContainer = document.createElement('div');
analyticsContainer.id = 'admin-analytics-root';
if (statusTrackerContainer.nextSibling) {
  statusTrackerContainer.parentNode?.insertBefore(analyticsContainer, statusTrackerContainer.nextSibling);
} else {
  document.body.appendChild(analyticsContainer);
}
createRoot(analyticsContainer).render(<AdministrativeAnalyticsSection />);
