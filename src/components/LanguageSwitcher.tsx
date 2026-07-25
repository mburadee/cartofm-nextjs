'use client';

import { useState, useRef, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1.5 text-xs font-medium text-mist hover:text-white"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Languages size={14} />
        <span className="uppercase">{locale}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-xl border border-line bg-panel shadow-xl"
        >
          {locales.map((l) => (
            <li key={l}>
              <button
                role="option"
                aria-selected={l === locale}
                onClick={() => {
                  setOpen(false);
                  router.replace(pathname, { locale: l });
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-panel-2 ${
                  l === locale ? 'text-signal' : 'text-mist'
                }`}
              >
                {localeNames[l]}
                <span className="text-xs uppercase text-fog">{l}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
