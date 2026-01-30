import { sounds, initAudio } from '../services/sounds';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  const handleTabClick = (tabId: string) => {
    initAudio();
    if (tabId !== activeTab) {
      sounds.tabSwitch();
    }
    onTabChange(tabId);
  };

  return (
    <div className="flex glass border-b border-purple-500/20 relative">
      {/* Animated background indicator */}
      <div
        className="absolute bottom-0 h-0.5 bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500 transition-all duration-300 ease-out glow-purple"
        style={{
          left: `${tabs.findIndex(t => t.id === activeTab) * (100 / tabs.length)}%`,
          width: `${100 / tabs.length}%`,
        }}
      />

      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          onMouseEnter={() => {
            initAudio();
            sounds.hover();
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300 relative group ${
            activeTab === tab.id
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Hover glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            activeTab === tab.id ? 'opacity-100' : ''
          }`} />

          {/* Icon with animation */}
          <span className={`relative transition-transform duration-300 ${
            activeTab === tab.id ? 'scale-110 text-purple-400' : 'group-hover:scale-110'
          }`}>
            {tab.icon}
          </span>

          {/* Label */}
          <span className={`relative font-semibold ${
            activeTab === tab.id ? 'gradient-text' : ''
          }`}>
            {tab.label}
          </span>

          {/* Active indicator dot */}
          {activeTab === tab.id && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full status-pulse" />
          )}
        </button>
      ))}
    </div>
  );
}
