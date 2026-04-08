'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MinimalistHeroProps {
  logoText: string;
  navLinks: { label: string; href: string }[];
  mainText: string;
  imageSrc: string;
  imageAlt: string;
  overlayText: {
    part1: string;
    part2: string;
  };
  ctaHref?: string;
  signInHref?: string;
  socialLinks?: { icon: LucideIcon; href: string }[];
  locationText?: string;
  className?: string;
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-sm font-medium tracking-widest text-foreground/60 transition-colors hover:text-foreground">
    {children}
  </a>
);

export const MinimalistHero = ({
  logoText,
  navLinks,
  mainText,
  imageSrc,
  imageAlt,
  overlayText,
  ctaHref,
  signInHref,
  className,
}: MinimalistHeroProps) => {
  return (
    <div
      className={cn(
        'relative flex min-h-screen w-full flex-col overflow-hidden bg-background',
        className
      )}
    >
      {/* Header */}
      <header className="z-30 flex w-full items-center justify-between px-6 py-5 md:px-12 md:py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-lg font-bold tracking-wider md:text-xl"
        >
          {logoText}
        </motion.div>

        {/* Desktop nav */}
        <div className="hidden items-center space-x-8 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.label} href={link.href}>{link.label}</NavLink>
          ))}
          {signInHref && (
            <a
              href={signInHref}
              className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold tracking-widest text-background transition-opacity hover:opacity-80"
            >
              SIGN IN
            </a>
          )}
        </div>

        {/* Mobile: sign in button */}
        {signInHref && (
          <a
            href={signInHref}
            className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold tracking-widest text-background transition-opacity hover:opacity-80 md:hidden"
          >
            SIGN IN
          </a>
        )}
      </header>

      {/* Mobile Layout */}
      <div className="flex flex-col flex-1 md:hidden">
        {/* Image */}
        <div className="relative flex justify-center items-end pt-4" style={{ height: '55vw', maxHeight: '280px' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400/90"
            style={{ width: '52vw', height: '52vw', maxWidth: '240px', maxHeight: '240px' }}
          />
          <motion.img
            src={imageSrc}
            alt={imageAlt}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className="relative z-10 object-contain"
            style={{ height: '62vw', maxHeight: '300px', width: 'auto' }}
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.onerror = null;
              t.src = 'https://placehold.co/400x600/eab308/ffffff?text=uMusic';
            }}
          />
        </div>

        {/* Big text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="px-6 pt-6"
        >
          <h1 className="text-[18vw] font-extrabold leading-none text-foreground" style={{ letterSpacing: '-0.03em' }}>
            {overlayText.part1}
            <br />
            {overlayText.part2}
          </h1>
        </motion.div>

        {/* Description + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="px-6 pt-4 pb-10"
        >
          <p className="text-sm leading-relaxed text-foreground/70 max-w-sm">{mainText}</p>
          {ctaHref && (
            <a
              href={ctaHref}
              className="mt-5 inline-block rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-80"
            >
              Get Started
            </a>
          )}
        </motion.div>
      </div>

      {/* Desktop Layout */}
      <div className="relative hidden md:grid w-full max-w-7xl mx-auto flex-grow grid-cols-3 items-center px-12 pb-12" style={{ minHeight: 'calc(100vh - 96px)' }}>
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="z-20"
        >
          <p className="max-w-xs text-sm leading-relaxed text-foreground/80">{mainText}</p>
          {ctaHref && (
            <div className="mt-4">
              <a
                href={ctaHref}
                className="inline-block rounded-lg bg-foreground px-5 py-2.5 text-xs font-semibold text-background transition-opacity hover:opacity-80"
              >
                Get Started
              </a>
            </div>
          )}
        </motion.div>

        {/* Center Image */}
        <div className="relative flex justify-center items-center h-full">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="absolute z-0 rounded-full bg-yellow-400/90"
            style={{ width: 'min(38vw, 480px)', height: 'min(38vw, 480px)' }}
          />
          <motion.img
            src={imageSrc}
            alt={imageAlt}
            className="relative z-10 h-auto object-cover"
            style={{ width: 'min(28vw, 340px)' }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.onerror = null;
              t.src = 'https://placehold.co/400x600/eab308/ffffff?text=uMusic';
            }}
          />
        </div>

        {/* Right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="z-20 flex items-center justify-center"
        >
          <h1 className="text-8xl font-extrabold text-foreground lg:text-9xl" style={{ letterSpacing: '-0.03em' }}>
            {overlayText.part1}
            <br />
            {overlayText.part2}
          </h1>
        </motion.div>
      </div>
    </div>
  );
};
