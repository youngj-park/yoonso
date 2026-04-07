'use client';

import { MinimalistHero } from '@/components/ui/minimalist-hero';

export default function Home() {
  const navLinks = [
    { label: 'FEATURES', href: '#' },
    { label: 'PRICING', href: '#' },
    { label: 'CONTACT', href: '#' },
  ];

  return (
    <main>
      <MinimalistHero
        logoText="UMUSIC"
        navLinks={navLinks}
        mainText="Generate royalty-free music for your YouTube videos with AI. Create the perfect soundtrack in seconds."
        ctaHref="/auth"
        signInHref="/auth"

        imageSrc="https://ik.imagekit.io/fpxbgsota/image%2013.png?updatedAt=1753531863793"
        imageAlt="Portrait"
        overlayText={{
          part1: 'AI',
          part2: 'MUSIC',
        }}
      />
    </main>
  );
}
