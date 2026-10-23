import React, { useState, useEffect, useRef } from 'react';
import type { ClassDoc } from '../types';

interface SearchResultItem {
  className: string;
  type: 'class' | 'method' | 'property' | 'signal';
  title: string;
  snippet: string;
  anchor?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  allClasses: ClassDoc[];
  onSelectClass: (className: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  allClasses,
  onSelectClass,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Compute search results
  const results: SearchResultItem[] = [];
  if (query.trim().length >= 1) {
    const q = query.toLowerCase();

    for (const cls of allClasses) {
      // 1. Match class name
      if (cls.name.toLowerCase().includes(q)) {
        results.push({
          className: cls.name,
          type: 'class',
          title: cls.name,
          snippet: cls.brief,
        });
      }

      // 2. Match methods
      for (const m of cls.methods) {
        if (m.name.toLowerCase().includes(q)) {
          results.push({
            className: cls.name,
            type: 'method',
            title: `${cls.name}.${m.name}()`,
            snippet: m.description,
            anchor: `method-${m.name}`,
          });
        }
      }

      // 3. Match properties
      for (const p of cls.properties) {
        if (p.name.toLowerCase().includes(q)) {
          results.push({
            className: cls.name,
            type: 'property',
            title: `${cls.name}.${p.name}`,
            snippet: p.description,
            anchor: `prop-${p.name}`,
          });
        }
      }

      // 4. Match signals
      for (const s of cls.signals) {
        if (s.name.toLowerCase().includes(q)) {
          results.push({
            className: cls.name,
            type: 'signal',
            title: `${cls.name}.${s.name}`,
            snippet: s.description,
          });
        }
      }

      if (results.length >= 25) break;
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    onSelectClass(item.className);
    onClose();
    if (item.anchor) {
      setTimeout(() => {
        const el = document.getElementById(item.anchor!);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div className="search-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-input-bar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="search-modal-icon">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Type to search classes, methods, properties..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <kbd className="search-modal-esc" onClick={onClose}>ESC</kbd>
        </div>

        <div className="search-results-list">
          {query.trim().length === 0 ? (
            <div className="search-empty-state">
              <span>Type at least 1 character to search the ThreeDot class reference.</span>
            </div>
          ) : results.length === 0 ? (
            <div className="search-empty-state">
              <span>No results found matching "{query}".</span>
            </div>
          ) : (
            results.map((res, index) => (
              <div
                key={`${res.type}-${res.title}-${index}`}
                className={`search-result-row ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(res)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="result-row-header">
                  <span className={`result-tag tag-${res.type}`}>{res.type}</span>
                  <span className="result-title">{res.title}</span>
                  <span className="result-class-badge">{res.className}</span>
                </div>
                <div className="result-snippet">{res.snippet}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
