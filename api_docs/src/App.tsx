import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { allClasses, categoryGroups, getClassDoc } from './data';
import { Navbar, type NavTab } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ClassDocView } from './components/ClassDocView';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { SearchModal } from './components/SearchModal';
import { LandingPage } from './pages/LandingPage';
import { InstallPage } from './pages/InstallPage';
import { FrameworksPage } from './pages/FrameworksPage';
import { QuickstartPage } from './pages/QuickstartPage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedClassName, setSelectedClassName] = useState<string>('Node');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#', '').trim();
      if (!rawHash || rawHash === 'home') {
        setCurrentTab('home');
      } else if (rawHash === 'install') {
        setCurrentTab('install');
      } else if (rawHash === 'frameworks') {
        setCurrentTab('frameworks');
      } else if (rawHash === 'quickstart') {
        setCurrentTab('quickstart');
      } else if (rawHash === 'architecture') {
        setCurrentTab('architecture');
      } else if (rawHash === 'api') {
        setCurrentTab('api');
      } else {
        const found = getClassDoc(rawHash);
        if (found) {
          setSelectedClassName(found.name);
          setCurrentTab('api');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Keyboard shortcut listener for search modal (/ or Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    window.location.hash = tab === 'api' ? selectedClassName : tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectClass = (name: string) => {
    const found = getClassDoc(name);
    if (found) {
      setSelectedClassName(found.name);
      setCurrentTab('api');
      window.location.hash = found.name;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentDoc = getClassDoc(selectedClassName) ?? allClasses[0];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        {currentTab === 'home' && <LandingPage onNavigate={handleSelectTab} />}
        {currentTab === 'install' && <InstallPage />}
        {currentTab === 'frameworks' && <FrameworksPage />}
        {currentTab === 'quickstart' && <QuickstartPage />}
        {currentTab === 'architecture' && (
          <Box sx={{ width: '100%', px: { xs: 2, sm: 4, md: 6 }, py: 6 }}>
            <ArchitectureGuide onNavigateClass={handleSelectClass} />
          </Box>
        )}
        {currentTab === 'api' && (
          <div className="docs-body-layout" style={{ flex: 1, height: 'calc(100vh - 60px)' }}>
            <Sidebar
              groups={categoryGroups}
              allClasses={allClasses}
              selectedClass={selectedClassName}
              onSelectClass={handleSelectClass}
              onOpenGuide={() => handleSelectTab('architecture')}
              currentView="class"
            />
            <main className="docs-content-container">
              <ClassDocView doc={currentDoc} onNavigateClass={handleSelectClass} />
            </main>
          </div>
        )}
      </Box>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        allClasses={allClasses}
        onSelectClass={(name) => {
          handleSelectClass(name);
          setIsSearchOpen(false);
        }}
      />
    </Box>
  );
};

export default App;
