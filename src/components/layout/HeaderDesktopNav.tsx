import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { LucideIcon, ChevronDown } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface HeaderDesktopNavProps {
  navItems: NavItem[];
  pathname: string;
}

export function HeaderDesktopNav({ navItems, pathname }: HeaderDesktopNavProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const primaryItems = navItems.slice(0, 4);
  const secondaryItems = navItems.slice(4);

  const isSecondaryActive = secondaryItems.some((item) =>
    pathname.startsWith(item.href)
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
      {/* Primary Items (Always visible on md+) */}
      {primaryItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
              isActive
                ? 'bg-teal-50 text-teal-900 border border-teal-200/70 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
            <span className="font-khmer">{item.label}</span>
          </Link>
        );
      })}

      {/* Secondary Items directly on wide screens (2xl: 1536px+) */}
      <div className="hidden 2xl:flex items-center gap-1">
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-teal-50 text-teal-900 border border-teal-200/70 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
              <span className="font-khmer">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* "More" Dropdown on medium & laptop screens (< 2xl) */}
      <div className="relative 2xl:hidden" ref={moreRef}>
        <button
          type="button"
          onClick={() => setIsMoreOpen((prev) => !prev)}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1 ${
            isSecondaryActive
              ? 'bg-teal-50 text-teal-900 border border-teal-200/70 font-bold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
          aria-expanded={isMoreOpen}
          aria-haspopup="true"
        >
          <span className="font-khmer">More</span>
          <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
          {isSecondaryActive ? (
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 ml-0.5" />
          ) : null}
        </button>

        {isMoreOpen ? (
          <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-fade-in">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMoreOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span className="font-khmer">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
