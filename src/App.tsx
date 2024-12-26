import React, { useState } from 'react';
import TabNavigation from './components/TabNavigation';
import OutscrapperCleaner from './components/OutscrapperCleaner';
import UrlCleaner from './components/UrlCleaner';
import OtherCleaner from './components/OtherCleaner';

export default function App() {
  const [activeTab, setActiveTab] = useState('outscrapper');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">CSV Data Cleaner</h1>
        </div>
      </header>

      <main>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="max-w-7xl mx-auto">
          {activeTab === 'outscrapper' ? (
            <OutscrapperCleaner />
          ) : activeTab === 'url' ? (
            <UrlCleaner />
          ) : (
            <OtherCleaner />
          )}
        </div>
      </main>
    </div>
  );
}