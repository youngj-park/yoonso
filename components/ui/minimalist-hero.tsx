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
      <div className="flex flex-col md:hidden" style={{ minHeight: 'calc(100dvh - 64px)' }}>
        {/* Image 영역: 화면 상단 40% */}
        <div className="relative flex justify-center items-end overflow-hidden" style={{ height: '30vh' }}>
          {/* 원형 배경 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400/90"
            style={{ width: '30vh', height: '30vh' }}
          />
          {/* 인물 이미지 */}
          <motion.img
            src={imageSrc}
            alt={imageAlt}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className="relative z-10 object-contain object-bottom"
            style={{ height: '30vh', width: 'auto' }}
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.onerror = null;
              t.src = 'https://placehold.co/400x600/eab308/ffffff?text=uMusic';
            }}
          />
        </div>

        {/* 텍스트 + CTA */}
        <div className="flex flex-col justify-between px-6 pt-5 pb-10 gap-4">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="font-extrabold leading-none text-foreground"
            style={{ fontSize: 'clamp(3rem, 19vw, 5.5rem)', letterSpacing: '-0.03em' }}
          >
            {overlayText.part1}
            <br />
            {overlayText.part2}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col gap-4"
          >
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(237,237,237,0.6)', maxWidth: '30ch' }}>
              {mainText}
            </p>
            {ctaHref && (
              <a
                href={ctaHref}
                className="self-start rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-80"
              >
                Get Started
              </a>
            )}
          </motion.div>
        </div>
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
            style={{ width: 'min(19vw, 240px)', height: 'min(19vw, 240px)' }}
          />
          <motion.img
            src={imageSrc}
            alt={imageAlt}
            className="relative z-10 h-auto object-cover"
            style={{ width: 'min(14vw, 170px)' }}
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
