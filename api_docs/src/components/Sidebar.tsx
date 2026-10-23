import React, { useState } from 'react';
import type { CategoryGroup, ClassDoc } from '../types';

interface SidebarProps {
  groups: CategoryGroup[];
  allClasses: ClassDoc[];
  selectedClass: string;
  onSelectClass: (className: string) => void;
  onOpenGuide: () => void;
  currentView: 'class' | 'guide';
}

export const Sidebar: React.FC<SidebarProps> = ({
  groups,
  allClasses,
  selectedClass,
  onSelectClass,
  onOpenGuide,
  currentView,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (id: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredClasses = filterQuery.trim()
    ? allClasses.filter(
        (c) =>
          c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(filterQuery.toLowerCase())
      )
    : null;

  return (
    <aside className="docs-sidebar">
      <div className="sidebar-search-box">
        <input
          type="text"
          className="sidebar-filter-input"
          placeholder="Filter classes..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
        />
        {filterQuery && (
          <button
            type="button"
            className="filter-clear-btn"
            onClick={() => setFilterQuery('')}
          >
            x
          </button>
        )}
      </div>

      <nav className="sidebar-nav-scroll">
        <div className="sidebar-quick-links">
          <button
            type="button"
            className={`quick-link-btn ${currentView === 'guide' ? 'active' : ''}`}
            onClick={onOpenGuide}
          >
            <span>The Godot Architecture Guide</span>
          </button>
        </div>

        <div className="sidebar-section-divider">
          <span>CLASS REFERENCE</span>
        </div>

        {filteredClasses ? (
          <div className="sidebar-filter-results">
            {filteredClasses.length === 0 ? (
              <div className="sidebar-no-results">No classes matching "{filterQuery}"</div>
            ) : (
              filteredClasses.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={`class-nav-item ${selectedClass === c.name && currentView === 'class' ? 'active' : ''}`}
                  onClick={() => onSelectClass(c.name)}
                >
                  <span className="class-name">{c.name}</span>
                  <span className="class-cat-mini">{c.category}</span>
                </button>
              ))
            )}
          </div>
        ) : (
          groups.map((group) => {
            const isCollapsed = !!collapsedGroups[group.id];
            return (
              <div key={group.id} className="sidebar-group">
                <button
                  type="button"
                  className="group-header-btn"
                  onClick={() => toggleGroup(group.id)}
                >
                  <svg
                    className={`group-arrow ${isCollapsed ? 'collapsed' : ''}`}
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="group-title">{group.title}</span>
                  <span className="group-count">{group.classes.length}</span>
                </button>

                {!isCollapsed && (
                  <div className="group-classes-list">
                    {group.classes.map((clsName) => (
                      <button
                        key={clsName}
                        type="button"
                        className={`class-nav-item ${selectedClass === clsName && currentView === 'class' ? 'active' : ''}`}
                        onClick={() => onSelectClass(clsName)}
                      >
                        <span className="class-name">{clsName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
};
