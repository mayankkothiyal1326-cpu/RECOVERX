import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface VisualHeaderCardProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  eyebrow?: string;
  accent?: 'blue' | 'red' | 'emerald';
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function VisualHeaderCard({
  title,
  description,
  imageSrc,
  imageAlt,
  eyebrow,
  accent = 'blue',
  actions,
  children,
}: VisualHeaderCardProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const eyebrowClass =
    accent === 'red'
      ? 'text-red-500 dark:text-red-400'
      : accent === 'emerald'
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-blue-600 dark:text-sky-400';

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <div className="grid grid-cols-1 items-stretch lg:grid-cols-12">
        {/* Text & Actions Column */}
        <div className="flex flex-col justify-center p-6 sm:p-7 lg:col-span-7">
          {eyebrow && (
            <p className={`text-xs font-semibold ${eyebrowClass}`}>{eyebrow}</p>
          )}
          <h2 className="mt-1 text-2xl sm:text-[28px] font-bold leading-tight tracking-tight text-[var(--text-main)] [text-wrap:balance]">
            {title}
          </h2>
          <p className="mt-2.5 max-w-xl text-sm sm:text-[15px] leading-relaxed text-[var(--text-muted)]">
            {description}
          </p>
          {actions && <div className="mt-5 flex flex-wrap items-center gap-3">{actions}</div>}
          {children && <div className="mt-5">{children}</div>}
        </div>

        {/* Visual Media Column */}
        <div className="relative min-h-[190px] sm:min-h-[220px] lg:col-span-5 lg:min-h-full bg-[#0B0F14]">
          {!imgFailed ? (
            <>
              <img
                src={imageSrc}
                alt={imageAlt}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="h-full w-full object-cover"
              />
              {/* Subtle left fade on desktop so image integrates smoothly into card */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[var(--bg-card)]/25 lg:via-transparent lg:to-transparent"
              />
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#1E293B] p-6 text-slate-300">
              <Shield className="h-10 w-10 text-blue-400" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-400">{title}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
