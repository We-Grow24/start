// ═══════════════════════════════════════════════════════════════
// SVARNEX — Infinite Library Seed (Section 4)
// 525+ pre-built DNA blocks across all 5 zones + universal
// Run: import { seedInfiniteLibrary } from '@/lib/seed-library'; seedInfiniteLibrary();
// ═══════════════════════════════════════════════════════════════

import { createServiceClient } from "@/lib/supabase/service";

import type { Json } from "@/types/supabase";

export interface SeedBlock {
  block_type: string;
  zone_type: "FORGE" | "FOUNDRY" | "ENGINE" | "BAZAAR" | "LOGIC" | "UNIVERSAL";
  species_name: string;
  dna_blueprint: Json;
  code_react: string;
  license: "MIT" | "APACHE_2" | "BSD";
  niche?: string;
  sub_niche?: string;
  is_niche_specific?: boolean;
  block_version?: string;
}

// ─── Helper: minimal React component template ───────────────

function rc(name: string, jsx: string, props: string = "props: Record<string, unknown>"): string {
  return `"use client";\nimport React from "react";\nexport default function ${name}({ ${props} }: { ${props} }) {\n  return (\n    ${jsx}\n  );\n}`;
}

// ─── ZONE 1: FORGE — Universal blocks (180) ─────────────────

const FORGE_UNIVERSAL: SeedBlock[] = [
  // ── Hero Section variants (20) ─────────────
  ...[
    ["hero-centered", "HeroCentered", '<section className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8"><h1 className="text-5xl font-bold">{props.headline as string}</h1><p className="mt-4 text-lg opacity-70">{props.subheadline as string}</p></section>'],
    ["hero-split", "HeroSplit", '<section className="grid grid-cols-2 min-h-[60vh]"><div className="flex flex-col justify-center p-12"><h1 className="text-4xl font-bold">{props.headline as string}</h1><p className="mt-4">{props.subheadline as string}</p></div><div className="bg-gray-200" /></section>'],
    ["hero-video-bg", "HeroVideoBg", '<section className="relative min-h-[70vh] flex items-center justify-center"><video autoPlay muted loop className="absolute inset-0 w-full h-full object-cover" /><div className="relative z-10 text-center text-white"><h1 className="text-5xl font-bold">{props.headline as string}</h1></div></section>'],
    ["hero-gradient", "HeroGradient", '<section className="min-h-[60vh] bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-center p-8"><h1 className="text-5xl font-bold">{props.headline as string}</h1></section>'],
    ["hero-image-overlay", "HeroImageOverlay", '<section className="relative min-h-[60vh] bg-cover bg-center flex items-center justify-center"><div className="absolute inset-0 bg-black/50" /><div className="relative z-10 text-white text-center"><h1 className="text-5xl font-bold">{props.headline as string}</h1></div></section>'],
    ["hero-minimal", "HeroMinimal", '<section className="py-24 px-8"><h1 className="text-6xl font-light">{props.headline as string}</h1><p className="mt-6 text-xl opacity-60">{props.subheadline as string}</p></section>'],
    ["hero-fullscreen", "HeroFullscreen", '<section className="h-screen flex items-center justify-center bg-black text-white"><h1 className="text-7xl font-bold">{props.headline as string}</h1></section>'],
    ["hero-animated", "HeroAnimated", '<section className="min-h-[60vh] flex items-center justify-center"><h1 className="text-5xl font-bold animate-pulse">{props.headline as string}</h1></section>'],
    ["hero-carousel", "HeroCarousel", '<section className="min-h-[60vh] flex items-center justify-center bg-gray-100"><div className="text-center"><h1 className="text-4xl font-bold">{props.headline as string}</h1><p className="mt-2">Slide 1 of N</p></div></section>'],
    ["hero-parallax", "HeroParallax", '<section className="min-h-[80vh] bg-fixed bg-cover bg-center flex items-center justify-center text-white"><h1 className="text-5xl font-bold">{props.headline as string}</h1></section>'],
    ["hero-typed", "HeroTyped", '<section className="min-h-[60vh] flex items-center justify-center"><h1 className="text-4xl font-mono">{props.headline as string}<span className="animate-pulse">|</span></h1></section>'],
    ["hero-particle", "HeroParticle", '<section className="min-h-[70vh] bg-black flex items-center justify-center text-white"><h1 className="text-5xl font-bold">{props.headline as string}</h1></section>'],
    ["hero-3d-model", "Hero3DModel", '<section className="min-h-[70vh] flex items-center justify-center bg-gray-900 text-white"><div className="text-center"><h1 className="text-4xl font-bold">{props.headline as string}</h1><div className="mt-4 w-64 h-64 bg-gray-700 rounded-lg mx-auto" /></div></section>'],
    ["hero-countdown", "HeroCountdown", '<section className="min-h-[60vh] flex flex-col items-center justify-center bg-black text-white"><h1 className="text-3xl font-bold">{props.headline as string}</h1><div className="mt-6 text-6xl font-mono">00:00:00</div></section>'],
    ["hero-pricing-teaser", "HeroPricingTeaser", '<section className="min-h-[50vh] flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 text-white"><div className="text-center"><h1 className="text-4xl font-bold">{props.headline as string}</h1><p className="mt-4 text-2xl">Starting at {props.price as string}</p></div></section>'],
    ["hero-testimonial", "HeroTestimonial", '<section className="min-h-[50vh] flex items-center justify-center bg-gray-50 p-8"><blockquote className="text-2xl italic max-w-2xl text-center">&ldquo;{props.quote as string}&rdquo;<footer className="mt-4 text-sm font-bold">— {props.author as string}</footer></blockquote></section>'],
    ["hero-app-download", "HeroAppDownload", '<section className="min-h-[60vh] flex items-center justify-center gap-8 p-8"><div><h1 className="text-4xl font-bold">{props.headline as string}</h1><div className="mt-6 flex gap-4"><button className="px-6 py-3 bg-black text-white rounded-lg">App Store</button><button className="px-6 py-3 bg-black text-white rounded-lg">Play Store</button></div></div></section>'],
    ["hero-newsletter", "HeroNewsletter", '<section className="min-h-[50vh] flex flex-col items-center justify-center p-8 bg-yellow-50"><h1 className="text-4xl font-bold">{props.headline as string}</h1><div className="mt-6 flex gap-2"><input type="email" placeholder="you@email.com" className="px-4 py-2 border rounded" /><button className="px-6 py-2 bg-black text-white rounded">Subscribe</button></div></section>'],
    ["hero-search", "HeroSearch", '<section className="min-h-[50vh] flex flex-col items-center justify-center p-8"><h1 className="text-4xl font-bold">{props.headline as string}</h1><input type="search" placeholder="Search..." className="mt-6 px-6 py-3 border rounded-full w-full max-w-md" /></section>'],
    ["hero-cta-dual", "HeroCtaDual", '<section className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center"><h1 className="text-5xl font-bold">{props.headline as string}</h1><div className="mt-8 flex gap-4"><button className="px-8 py-3 bg-blue-600 text-white rounded-lg">Primary</button><button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg">Secondary</button></div></section>'],
  ].map(([type, name, jsx]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-${type}`,
    dna_blueprint: { tag: "section", role: "hero", variant: type },
    code_react: rc(name as string, jsx as string),
    license: "MIT" as const,
  })),

  // ── Navigation (10) ────────────────────────
  ...[
    ["navbar-sticky", "NavbarSticky", '<nav className="sticky top-0 z-50 bg-white shadow px-8 py-4 flex justify-between items-center"><span className="font-bold text-xl">{props.brand as string}</span><div className="flex gap-6">{(props.links as string[] ?? []).map((l, i) => <a key={i} href="#">{l}</a>)}</div></nav>'],
    ["navbar-transparent", "NavbarTransparent", '<nav className="absolute top-0 w-full z-50 px-8 py-4 flex justify-between items-center text-white"><span className="font-bold text-xl">{props.brand as string}</span></nav>'],
    ["navbar-hamburger", "NavbarHamburger", '<nav className="px-6 py-4 flex justify-between items-center"><span className="font-bold">{props.brand as string}</span><button className="text-2xl">☰</button></nav>'],
    ["navbar-centered-logo", "NavbarCenteredLogo", '<nav className="px-8 py-4 flex justify-center items-center"><span className="font-bold text-2xl">{props.brand as string}</span></nav>'],
    ["sidebar-nav", "SidebarNav", '<aside className="w-64 h-screen bg-gray-900 text-white p-6"><h2 className="text-xl font-bold mb-8">{props.brand as string}</h2><ul className="space-y-4">{(props.links as string[] ?? []).map((l, i) => <li key={i}><a href="#" className="hover:underline">{l}</a></li>)}</ul></aside>'],
    ["breadcrumb", "Breadcrumb", '<nav className="px-8 py-2 text-sm text-gray-500"><span>Home</span> / <span>{props.current as string}</span></nav>'],
    ["tab-nav", "TabNav", '<div className="border-b px-8"><div className="flex gap-6">{(props.tabs as string[] ?? []).map((t, i) => <button key={i} className="py-3 border-b-2 border-transparent hover:border-blue-500">{t}</button>)}</div></div>'],
    ["mega-menu", "MegaMenu", '<nav className="px-8 py-4 bg-white shadow"><div className="flex gap-8"><span className="font-bold">{props.brand as string}</span></div></nav>'],
    ["navbar-dark", "NavbarDark", '<nav className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center"><span className="font-bold">{props.brand as string}</span></nav>'],
    ["navbar-glass", "NavbarGlass", '<nav className="backdrop-blur-lg bg-white/30 px-8 py-4 flex justify-between items-center sticky top-0 z-50"><span className="font-bold">{props.brand as string}</span></nav>'],
  ].map(([type, name, jsx]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-${type}`,
    dna_blueprint: { tag: "nav", role: "navigation", variant: type },
    code_react: rc(name as string, jsx as string),
    license: "MIT" as const,
  })),

  // ── CTA blocks (10) ───────────────────────
  ...[
    ["cta-banner-full-width", "CtaBannerFull", '<section className="bg-blue-600 text-white py-12 px-8 text-center"><h2 className="text-3xl font-bold">{props.headline as string}</h2><button className="mt-6 px-8 py-3 bg-white text-blue-600 rounded-lg font-bold">Get Started</button></section>'],
    ["cta-inline", "CtaInline", '<div className="flex items-center justify-between bg-gray-100 p-6 rounded-lg"><p className="text-lg font-medium">{props.text as string}</p><button className="px-6 py-2 bg-black text-white rounded">Action</button></div>'],
    ["cta-floating", "CtaFloating", '<button className="fixed bottom-6 right-6 z-50 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg">{props.label as string}</button>'],
    ["cta-gradient-card", "CtaGradientCard", '<div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 rounded-2xl text-center"><h3 className="text-2xl font-bold">{props.headline as string}</h3><button className="mt-4 px-6 py-2 bg-white text-purple-600 rounded-lg">Learn More</button></div>'],
    ["cta-split", "CtaSplit", '<section className="grid grid-cols-2 gap-0"><div className="bg-gray-900 text-white p-12 flex flex-col justify-center"><h2 className="text-3xl font-bold">{props.headline as string}</h2></div><div className="bg-blue-600 flex items-center justify-center"><button className="px-8 py-4 bg-white text-blue-600 rounded-lg text-xl font-bold">Start Now</button></div></section>'],
    ["cta-sticky-bar", "CtaStickyBar", '<div className="fixed bottom-0 w-full bg-black text-white py-3 px-8 flex justify-between items-center z-50"><span>{props.text as string}</span><button className="px-4 py-1 bg-white text-black rounded">Go</button></div>'],
    ["cta-whatsapp", "CtaWhatsApp", '<a href={`https://wa.me/${props.phone as string}`} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">💬</a>'],
    ["cta-phone-call", "CtaPhoneCall", '<a href={`tel:${props.phone as string}`} className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">📞</a>'],
    ["cta-email-popup", "CtaEmailPopup", '<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-2xl max-w-md"><h3 className="text-xl font-bold">{props.headline as string}</h3><input type="email" placeholder="Email" className="mt-4 w-full px-4 py-2 border rounded" /><button className="mt-4 w-full py-2 bg-blue-600 text-white rounded">Submit</button></div></div>'],
    ["cta-countdown", "CtaCountdown", '<div className="bg-red-600 text-white py-6 px-8 text-center"><h3 className="text-2xl font-bold">Offer ends in <span className="font-mono">23:59:59</span></h3><button className="mt-4 px-6 py-2 bg-white text-red-600 rounded-lg">Claim Now</button></div>'],
  ].map(([type, name, jsx]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-${type}`,
    dna_blueprint: { tag: "div", role: "cta", variant: type },
    code_react: rc(name as string, jsx as string),
    license: "MIT" as const,
  })),

  // ── Features / Grid blocks (15) ───────────
  ...[
    ["features-grid-3col", "FeaturesGrid3", '<section className="py-16 px-8"><div className="grid grid-cols-3 gap-8">{[1,2,3].map(i => <div key={i} className="text-center p-6"><div className="text-4xl mb-4">✨</div><h3 className="font-bold text-lg">Feature {i}</h3><p className="mt-2 text-sm opacity-70">Description</p></div>)}</div></section>'],
    ["features-bento-grid", "FeaturesBento", '<section className="py-16 px-8"><div className="grid grid-cols-4 grid-rows-2 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className={`bg-gray-100 rounded-xl p-6 ${i === 1 ? "col-span-2 row-span-2" : ""}`}><h3 className="font-bold">Feature {i}</h3></div>)}</div></section>'],
    ["features-icon-list", "FeaturesIconList", '<section className="py-16 px-8 max-w-3xl mx-auto"><div className="space-y-6">{[1,2,3,4].map(i => <div key={i} className="flex gap-4"><span className="text-2xl">✅</span><div><h3 className="font-bold">Feature {i}</h3><p className="text-sm opacity-70">Description text here</p></div></div>)}</div></section>'],
    ["features-tabs", "FeaturesTabs", '<section className="py-16 px-8"><div className="flex gap-4 border-b mb-8">{["Tab 1","Tab 2","Tab 3"].map((t, i) => <button key={i} className="py-2 px-4 border-b-2 border-transparent hover:border-blue-500">{t}</button>)}</div><div className="p-8 bg-gray-50 rounded-lg">Tab content here</div></section>'],
    ["features-comparison", "FeaturesComparison", '<section className="py-16 px-8"><table className="w-full text-left"><thead><tr><th className="py-2">Feature</th><th>Basic</th><th>Pro</th></tr></thead><tbody>{[1,2,3].map(i => <tr key={i} className="border-t"><td className="py-3">Feature {i}</td><td>✅</td><td>✅</td></tr>)}</tbody></table></section>'],
    ["features-alternating", "FeaturesAlternating", '<section className="py-16 px-8 space-y-16">{[1,2,3].map(i => <div key={i} className={`flex gap-12 items-center ${i % 2 === 0 ? "flex-row-reverse" : ""}`}><div className="flex-1"><h3 className="text-2xl font-bold">Feature {i}</h3><p className="mt-2 opacity-70">Description</p></div><div className="flex-1 bg-gray-200 h-64 rounded-xl" /></div>)}</section>'],
    ["stats-counter", "StatsCounter", '<section className="py-16 px-8 bg-gray-900 text-white"><div className="grid grid-cols-4 gap-8 text-center">{[["10K+","Users"],["500+","Projects"],["99.9%","Uptime"],["24/7","Support"]].map(([v,l], i) => <div key={i}><div className="text-4xl font-bold">{v}</div><div className="mt-2 text-sm opacity-60">{l}</div></div>)}</div></section>'],
    ["icon-grid-4col", "IconGrid4", '<section className="py-16 px-8"><div className="grid grid-cols-4 gap-6 text-center">{[1,2,3,4,5,6,7,8].map(i => <div key={i} className="p-4"><div className="text-3xl mb-2">🔹</div><p className="text-sm font-medium">Item {i}</p></div>)}</div></section>'],
    ["logo-wall", "LogoWall", '<section className="py-12 px-8"><p className="text-center text-sm text-gray-500 mb-8">Trusted by</p><div className="flex flex-wrap justify-center gap-8 opacity-50">{[1,2,3,4,5,6].map(i => <div key={i} className="w-24 h-12 bg-gray-300 rounded" />)}</div></section>'],
    ["process-steps", "ProcessSteps", '<section className="py-16 px-8"><div className="flex justify-between">{[1,2,3,4].map(i => <div key={i} className="text-center flex-1"><div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto font-bold">{i}</div><h3 className="mt-4 font-bold">Step {i}</h3><p className="mt-2 text-sm opacity-70">Description</p></div>)}</div></section>'],
    ["timeline-vertical", "TimelineVertical", '<section className="py-16 px-8 max-w-2xl mx-auto"><div className="space-y-8 border-l-2 border-gray-300 pl-8">{[1,2,3].map(i => <div key={i}><div className="font-bold">2024</div><p className="mt-1 opacity-70">Milestone {i}</p></div>)}</div></section>'],
    ["accordion-faq", "AccordionFaq", '<section className="py-16 px-8 max-w-3xl mx-auto"><h2 className="text-3xl font-bold mb-8 text-center">FAQ</h2><div className="space-y-4">{[1,2,3].map(i => <details key={i} className="border rounded-lg p-4"><summary className="font-bold cursor-pointer">Question {i}</summary><p className="mt-2 opacity-70">Answer {i} goes here.</p></details>)}</div></section>'],
    ["checklist-block", "ChecklistBlock", '<section className="py-12 px-8 max-w-2xl mx-auto"><ul className="space-y-3">{[1,2,3,4,5].map(i => <li key={i} className="flex gap-3 items-center"><span className="text-green-500">✓</span><span>Checklist item {i}</span></li>)}</ul></section>'],
    ["badge-row", "BadgeRow", '<section className="py-8 px-8"><div className="flex flex-wrap gap-3">{["Fast","Secure","Reliable","Scalable","24/7"].map((b, i) => <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">{b}</span>)}</div></section>'],
    ["data-table", "DataTable", '<section className="py-12 px-8"><table className="w-full border-collapse"><thead className="bg-gray-100"><tr>{["Name","Value","Status"].map((h, i) => <th key={i} className="text-left py-3 px-4 font-medium">{h}</th>)}</tr></thead><tbody>{[1,2,3].map(i => <tr key={i} className="border-t"><td className="py-3 px-4">Row {i}</td><td className="py-3 px-4">Value</td><td className="py-3 px-4">Active</td></tr>)}</tbody></table></section>'],
  ].map(([type, name, jsx]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-${type}`,
    dna_blueprint: { tag: "section", role: "feature", variant: type },
    code_react: rc(name as string, jsx as string),
    license: "MIT" as const,
  })),

  // ── Testimonials (10) ─────────────────────
  ...[
    ["testimonial-carousel", "TestimonialCarousel", '<section className="py-16 px-8 bg-gray-50"><div className="max-w-2xl mx-auto text-center"><blockquote className="text-xl italic">&ldquo;{props.quote as string}&rdquo;</blockquote><p className="mt-4 font-bold">{props.author as string}</p></div></section>'],
    ["testimonial-grid", "TestimonialGrid", '<section className="py-16 px-8"><div className="grid grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="bg-white p-6 rounded-xl shadow"><p className="italic">&ldquo;Great product&rdquo;</p><p className="mt-4 font-bold text-sm">Customer {i}</p></div>)}</div></section>'],
    ["testimonial-single", "TestimonialSingle", '<section className="py-20 px-8 text-center"><blockquote className="text-3xl font-light italic max-w-3xl mx-auto">&ldquo;{props.quote as string}&rdquo;</blockquote></section>'],
    ["testimonial-video", "TestimonialVideo", '<section className="py-16 px-8"><div className="aspect-video bg-gray-200 rounded-xl max-w-3xl mx-auto" /></section>'],
    ["testimonial-avatar-row", "TestimonialAvatarRow", '<section className="py-16 px-8"><div className="flex gap-8 overflow-x-auto">{[1,2,3,4].map(i => <div key={i} className="flex-shrink-0 w-72 p-6 bg-white rounded-xl shadow"><p className="italic text-sm">&ldquo;Testimonial {i}&rdquo;</p><div className="mt-4 flex items-center gap-3"><div className="w-10 h-10 bg-gray-300 rounded-full" /><span className="font-bold text-sm">User {i}</span></div></div>)}</div></section>'],
    ["testimonial-star-rating", "TestimonialStarRating", '<div className="p-6 bg-white rounded-xl shadow"><div className="text-yellow-400">{"★".repeat(5)}</div><p className="mt-2 italic">&ldquo;{props.quote as string}&rdquo;</p><p className="mt-4 font-bold text-sm">{props.author as string}</p></div>'],
    ["testimonial-logo-quote", "TestimonialLogoQuote", '<div className="p-8 bg-gray-50 rounded-xl flex gap-6"><div className="w-16 h-16 bg-gray-300 rounded flex-shrink-0" /><div><p className="italic">&ldquo;{props.quote as string}&rdquo;</p><p className="mt-2 font-bold">{props.company as string}</p></div></div>'],
    ["testimonial-chat-bubble", "TestimonialChatBubble", '<div className="max-w-sm"><div className="bg-blue-100 p-4 rounded-2xl rounded-bl-none"><p className="text-sm">{props.message as string}</p></div><p className="mt-2 text-xs text-gray-500">{props.author as string}</p></div>'],
    ["testimonial-metric", "TestimonialMetric", '<div className="p-8 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl text-center"><div className="text-4xl font-bold">{props.metric as string}</div><p className="mt-2">{props.description as string}</p><p className="mt-4 text-sm opacity-80">— {props.author as string}</p></div>'],
    ["testimonial-card-flip", "TestimonialCardFlip", '<div className="perspective-1000"><div className="relative w-72 h-48"><div className="absolute inset-0 bg-white rounded-xl shadow p-6 flex items-center justify-center"><p className="italic">&ldquo;{props.quote as string}&rdquo;</p></div></div></div>'],
  ].map(([type, name, jsx]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-${type}`,
    dna_blueprint: { tag: "section", role: "testimonial", variant: type },
    code_react: rc(name as string, jsx as string),
    license: "MIT" as const,
  })),

  // ── Pricing (8) ───────────────────────────
  ...[
    ["pricing-3col", "Pricing3Col", '<section className="py-16 px-8"><div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">{["Basic","Pro","Enterprise"].map((p, i) => <div key={i} className={`p-8 rounded-2xl border ${i === 1 ? "border-blue-500 shadow-lg" : ""}`}><h3 className="text-xl font-bold">{p}</h3><div className="mt-4 text-3xl font-bold">₹{(i+1)*199}/mo</div><button className="mt-8 w-full py-2 bg-blue-600 text-white rounded-lg">Choose</button></div>)}</div></section>'],
    ["pricing-toggle", "PricingToggle", '<section className="py-16 px-8 text-center"><div className="flex justify-center gap-4 mb-8"><span>Monthly</span><div className="w-12 h-6 bg-gray-300 rounded-full" /><span>Annual</span></div><div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">{[1,2,3].map(i => <div key={i} className="p-8 border rounded-2xl"><h3 className="font-bold">Plan {i}</h3></div>)}</div></section>'],
    ["pricing-single", "PricingSingle", '<section className="py-16 px-8 text-center"><div className="max-w-md mx-auto p-8 border rounded-2xl"><h3 className="text-2xl font-bold">{props.plan as string}</h3><div className="mt-4 text-5xl font-bold">{props.price as string}</div><button className="mt-8 w-full py-3 bg-black text-white rounded-lg">Get Started</button></div></section>'],
    ["pricing-comparison-table", "PricingComparisonTable", '<section className="py-16 px-8 overflow-x-auto"><table className="w-full"><thead><tr><th></th><th>Basic</th><th>Pro</th><th>Scale</th></tr></thead><tbody>{["Feature A","Feature B","Feature C"].map((f, i) => <tr key={i} className="border-t"><td className="py-3">{f}</td><td>✅</td><td>✅</td><td>✅</td></tr>)}</tbody></table></section>'],
    ["pricing-card-highlighted", "PricingCardHighlighted", '<div className="p-8 bg-blue-600 text-white rounded-2xl text-center"><span className="text-xs bg-white text-blue-600 px-3 py-1 rounded-full">Most Popular</span><h3 className="mt-4 text-2xl font-bold">{props.plan as string}</h3><div className="mt-2 text-4xl font-bold">{props.price as string}</div></div>'],
    ["pricing-per-seat", "PricingPerSeat", '<section className="py-12 px-8 text-center"><h2 className="text-3xl font-bold">Per-seat pricing</h2><div className="mt-4 text-5xl font-bold">₹{props.perSeat as string}/seat/mo</div></section>'],
    ["pricing-slider", "PricingSlider", '<section className="py-16 px-8 text-center"><h2 className="text-2xl font-bold">Choose your plan</h2><input type="range" className="mt-8 w-64" /><div className="mt-4 text-3xl font-bold">₹999/mo</div></section>'],
    ["pricing-free-trial-cta", "PricingFreeTrial", '<section className="py-12 px-8 bg-green-50 text-center rounded-2xl"><h2 className="text-2xl font-bold">Start your 14-day free trial</h2><p className="mt-2 opacity-70">No credit card required</p><button className="mt-6 px-8 py-3 bg-green-600 text-white rounded-lg">Start Free Trial</button></section>'],
  ].map(([type, name, jsx]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-${type}`,
    dna_blueprint: { tag: "section", role: "pricing", variant: type },
    code_react: rc(name as string, jsx as string),
    license: "MIT" as const,
  })),

  // ── Contact / Forms (10) ──────────────────
  ...[
    ["contact-form-simple", "ContactFormSimple", '<section className="py-16 px-8 max-w-xl mx-auto"><h2 className="text-2xl font-bold mb-6">Contact Us</h2><form className="space-y-4"><input type="text" placeholder="Name" className="w-full px-4 py-2 border rounded" /><input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded" /><textarea placeholder="Message" rows={4} className="w-full px-4 py-2 border rounded" /><button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">Send</button></form></section>'],
    ["contact-form-with-file-upload", "ContactFormFile", '<section className="py-16 px-8 max-w-xl mx-auto"><form className="space-y-4"><input type="text" placeholder="Name" className="w-full px-4 py-2 border rounded" /><input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded" /><input type="file" className="w-full" /><button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">Upload & Send</button></form></section>'],
    ["contact-split-map", "ContactSplitMap", '<section className="grid grid-cols-2 min-h-[50vh]"><div className="p-12"><h2 className="text-2xl font-bold">Get in Touch</h2><form className="mt-6 space-y-4"><input type="text" placeholder="Name" className="w-full px-4 py-2 border rounded" /><input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded" /><button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded">Send</button></form></div><div className="bg-gray-200" /></section>'],
    ["newsletter-inline-signup", "NewsletterInline", '<section className="py-12 px-8 bg-gray-100"><div className="max-w-xl mx-auto flex gap-3"><input type="email" placeholder="yourmail@example.com" className="flex-1 px-4 py-2 border rounded" /><button className="px-6 py-2 bg-black text-white rounded">Subscribe</button></div></section>'],
    ["appointment-booking", "AppointmentBooking", '<section className="py-16 px-8 max-w-lg mx-auto"><h2 className="text-2xl font-bold mb-6">Book an Appointment</h2><input type="date" className="w-full px-4 py-2 border rounded mb-4" /><select className="w-full px-4 py-2 border rounded mb-4"><option>10:00 AM</option><option>2:00 PM</option></select><button className="w-full py-2 bg-blue-600 text-white rounded">Confirm</button></section>'],
    ["booking-calendar", "BookingCalendar", '<section className="py-16 px-8"><h2 className="text-2xl font-bold mb-6">Select a Date</h2><div className="grid grid-cols-7 gap-2 max-w-sm">{Array.from({length: 30}, (_, i) => <button key={i} className="py-2 border rounded hover:bg-blue-100 text-sm">{i+1}</button>)}</div></section>'],
    ["rsvp-form", "RsvpForm", '<section className="py-16 px-8 max-w-md mx-auto"><h2 className="text-2xl font-bold mb-6">RSVP</h2><form className="space-y-4"><input type="text" placeholder="Full Name" className="w-full px-4 py-2 border rounded" /><select className="w-full px-4 py-2 border rounded"><option>Attending</option><option>Not Attending</option></select><button type="submit" className="w-full py-2 bg-green-600 text-white rounded">Confirm</button></form></section>'],
    ["inquiry-form-b2b", "InquiryFormB2B", '<section className="py-16 px-8 max-w-xl mx-auto"><h2 className="text-2xl font-bold mb-6">Business Inquiry</h2><form className="space-y-4"><input type="text" placeholder="Company" className="w-full px-4 py-2 border rounded" /><input type="email" placeholder="Work Email" className="w-full px-4 py-2 border rounded" /><textarea placeholder="Requirements" rows={4} className="w-full px-4 py-2 border rounded" /><button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">Submit</button></form></section>'],
    ["grievance-form", "GrievanceForm", '<section className="py-16 px-8 max-w-xl mx-auto"><h2 className="text-2xl font-bold mb-6">Submit a Grievance</h2><form className="space-y-4"><input type="text" placeholder="Subject" className="w-full px-4 py-2 border rounded" /><textarea placeholder="Describe your issue" rows={6} className="w-full px-4 py-2 border rounded" /><button type="submit" className="w-full py-2 bg-red-600 text-white rounded">Submit</button></form></section>'],
    ["volunteer-signup-form", "VolunteerSignup", '<section className="py-16 px-8 max-w-xl mx-auto"><h2 className="text-2xl font-bold mb-6">Become a Volunteer</h2><form className="space-y-4"><input type="text" placeholder="Name" className="w-full px-4 py-2 border rounded" /><input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded" /><select className="w-full px-4 py-2 border rounded"><option>Weekdays</option><option>Weekends</option></select><button type="submit" className="w-full py-2 bg-green-600 text-white rounded">Sign Up</button></form></section>'],
  ].map(([type, name, jsx]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-${type}`,
    dna_blueprint: { tag: "section", role: "form", variant: type },
    code_react: rc(name as string, jsx as string),
    license: "MIT" as const,
  })),

  // ── Footer (8) ────────────────────────────
  ...[
    ["footer-minimal", "FooterMinimal", '<footer className="py-8 px-8 text-center text-sm text-gray-500"><p>© {new Date().getFullYear()} {props.brand as string}. All rights reserved.</p></footer>'],
    ["footer-4col", "Footer4Col", '<footer className="py-12 px-8 bg-gray-900 text-white"><div className="grid grid-cols-4 gap-8"><div><h4 className="font-bold mb-4">{props.brand as string}</h4><p className="text-sm opacity-60">Building the future</p></div>{[1,2,3].map(i => <div key={i}><h4 className="font-bold mb-4">Links</h4><ul className="space-y-2 text-sm opacity-60"><li>Link 1</li><li>Link 2</li></ul></div>)}</div></footer>'],
    ["footer-centered", "FooterCentered", '<footer className="py-12 px-8 text-center"><div className="flex justify-center gap-6 mb-6">{["Twitter","GitHub","LinkedIn"].map((s, i) => <a key={i} href="#" className="hover:underline">{s}</a>)}</div><p className="text-sm text-gray-500">© {new Date().getFullYear()} {props.brand as string}</p></footer>'],
    ["footer-newsletter", "FooterNewsletter", '<footer className="py-12 px-8 bg-gray-100"><div className="max-w-xl mx-auto text-center"><h4 className="text-lg font-bold">Stay updated</h4><div className="mt-4 flex gap-2"><input type="email" placeholder="Email" className="flex-1 px-4 py-2 border rounded" /><button className="px-6 py-2 bg-black text-white rounded">Subscribe</button></div></div></footer>'],
    ["footer-social-bar", "FooterSocialBar", '<footer className="py-6 px-8 flex justify-center gap-8 text-2xl">{["🐦","📸","💼","▶️"].map((e, i) => <a key={i} href="#" className="hover:scale-110 transition">{e}</a>)}</footer>'],
    ["footer-legal", "FooterLegal", '<footer className="py-6 px-8 text-xs text-gray-400 flex justify-between"><span>© {new Date().getFullYear()} {props.brand as string}</span><div className="flex gap-4"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookie Policy</a></div></footer>'],
    ["footer-app-badges", "FooterAppBadges", '<footer className="py-8 px-8 text-center"><p className="text-sm text-gray-500 mb-4">Download our app</p><div className="flex justify-center gap-4"><button className="px-4 py-2 bg-black text-white rounded-lg text-sm">App Store</button><button className="px-4 py-2 bg-black text-white rounded-lg text-sm">Play Store</button></div></footer>'],
    ["footer-wave", "FooterWave", '<footer className="relative pt-16 pb-8 px-8 bg-gray-900 text-white"><svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 100"><path fill="white" d="M0,64L1440,0L1440,0L0,0Z" /></svg><div className="relative text-center"><p className="text-sm opacity-60">© {new Date().getFullYear()} {props.brand as string}</p></div></footer>'],
  ].map(([type, name, jsx]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-${type}`,
    dna_blueprint: { tag: "footer", role: "footer", variant: type },
    code_react: rc(name as string, jsx as string),
    license: "MIT" as const,
  })),

  // ── Gallery / Media (12) ──────────────────
  ...[
    ["gallery-masonry", "GalleryMasonry", '<section className="py-16 px-8 columns-3 gap-4">{[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="mb-4 break-inside-avoid bg-gray-200 rounded-lg" style={{height: `${150 + (i % 3) * 80}px`}} />)}</section>'],
    ["gallery-grid-2col", "GalleryGrid2", '<section className="py-16 px-8"><div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="aspect-video bg-gray-200 rounded-lg" />)}</div></section>'],
    ["gallery-lightbox", "GalleryLightbox", '<section className="py-16 px-8"><div className="grid grid-cols-4 gap-4">{[1,2,3,4,5,6,7,8].map(i => <button key={i} className="aspect-square bg-gray-200 rounded-lg hover:opacity-80 transition" />)}</div></section>'],
    ["image-text-overlay", "ImageTextOverlay", '<div className="relative aspect-video bg-gray-200 rounded-xl overflow-hidden"><div className="absolute inset-0 bg-black/40 flex items-end p-6"><h3 className="text-white text-xl font-bold">{props.caption as string}</h3></div></div>'],
    ["before-after-slider", "BeforeAfterSlider", '<section className="py-16 px-8 max-w-2xl mx-auto"><div className="relative aspect-video bg-gray-200 rounded-xl"><div className="absolute left-1/2 top-0 h-full w-0.5 bg-white" /><span className="absolute left-2 top-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Before</span><span className="absolute right-2 top-2 bg-black/50 text-white text-xs px-2 py-1 rounded">After</span></div></section>'],
    ["video-embed", "VideoEmbed", '<section className="py-16 px-8 max-w-3xl mx-auto"><div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center"><span className="text-4xl">▶</span></div></section>'],
    ["instagram-feed-embed", "InstagramFeed", '<section className="py-16 px-8"><div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">{[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="aspect-square bg-gray-200 rounded" />)}</div></section>'],
    ["carousel-fullwidth", "CarouselFullwidth", '<section className="py-16"><div className="flex overflow-x-auto gap-4 px-8">{[1,2,3,4].map(i => <div key={i} className="flex-shrink-0 w-80 aspect-video bg-gray-200 rounded-xl" />)}</div></section>'],
    ["photo-gallery-fullscreen", "PhotoGalleryFS", '<section className="h-screen bg-gray-200 flex items-center justify-center"><span className="text-6xl">📸</span></section>'],
    ["media-grid-mixed", "MediaGridMixed", '<section className="py-16 px-8"><div className="grid grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className={`bg-gray-200 rounded-lg ${i === 1 ? "col-span-2 row-span-2 aspect-square" : "aspect-video"}`} />)}</div></section>'],
    ["podcast-episode-list", "PodcastEpisodeList", '<section className="py-16 px-8 max-w-2xl mx-auto space-y-4">{[1,2,3].map(i => <div key={i} className="flex gap-4 p-4 border rounded-lg"><div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0" /><div><h4 className="font-bold">Episode {i}</h4><p className="text-sm opacity-70">Duration: 45:00</p></div></div>)}</section>'],
    ["youtube-embed-block", "YoutubeEmbed", '<section className="py-16 px-8 max-w-3xl mx-auto"><div className="aspect-video bg-black rounded-xl flex items-center justify-center text-white"><span className="text-5xl">▶</span></div></section>'],
  ].map(([type, name, jsx]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-${type}`,
    dna_blueprint: { tag: "section", role: "media", variant: type },
    code_react: rc(name as string, jsx as string),
    license: "MIT" as const,
  })),

  // ── Cards / Content (15) ──────────────────
  ...[
    ["blog-card", "BlogCard", '<article className="rounded-xl overflow-hidden border"><div className="aspect-video bg-gray-200" /><div className="p-6"><span className="text-xs text-blue-600 font-bold">{props.category as string}</span><h3 className="mt-2 text-lg font-bold">{props.title as string}</h3><p className="mt-2 text-sm opacity-70 line-clamp-2">{props.excerpt as string}</p></div></article>'],
    ["blog-grid", "BlogGrid", '<section className="py-16 px-8"><div className="grid grid-cols-3 gap-8">{[1,2,3].map(i => <article key={i} className="border rounded-xl overflow-hidden"><div className="aspect-video bg-gray-200" /><div className="p-6"><h3 className="font-bold">Article {i}</h3></div></article>)}</div></section>'],
    ["profile-card", "ProfileCard", '<div className="text-center p-8"><div className="w-24 h-24 bg-gray-200 rounded-full mx-auto" /><h3 className="mt-4 text-lg font-bold">{props.name as string}</h3><p className="text-sm opacity-70">{props.role as string}</p></div>'],
    ["team-profile-grid", "TeamProfileGrid", '<section className="py-16 px-8"><div className="grid grid-cols-4 gap-8">{[1,2,3,4].map(i => <div key={i} className="text-center"><div className="w-24 h-24 bg-gray-200 rounded-full mx-auto" /><h3 className="mt-4 font-bold">Member {i}</h3><p className="text-sm opacity-70">Role</p></div>)}</div></section>'],
    ["product-card-with-variants", "ProductCardVariants", '<div className="border rounded-xl overflow-hidden"><div className="aspect-square bg-gray-200" /><div className="p-4"><h3 className="font-bold">{props.name as string}</h3><p className="text-lg font-bold mt-1">₹{props.price as string}</p><div className="mt-2 flex gap-2">{["S","M","L","XL"].map((s, i) => <button key={i} className="w-8 h-8 border rounded text-xs">{s}</button>)}</div></div></div>'],
    ["product-gallery-carousel", "ProductGalleryCarousel", '<div className="space-y-4"><div className="aspect-square bg-gray-200 rounded-xl" /><div className="flex gap-2">{[1,2,3,4].map(i => <button key={i} className="w-16 h-16 bg-gray-200 rounded" />)}</div></div>'],
    ["case-study-card", "CaseStudyCard", '<div className="border rounded-xl p-8"><span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">{props.category as string}</span><h3 className="mt-4 text-xl font-bold">{props.title as string}</h3><p className="mt-2 opacity-70">{props.summary as string}</p><a href="#" className="mt-4 inline-block text-blue-600 font-medium">Read Case Study →</a></div>'],
    ["service-pricing-card", "ServicePricingCard", '<div className="border rounded-xl p-8"><h3 className="text-xl font-bold">{props.service as string}</h3><div className="mt-4 text-3xl font-bold">₹{props.price as string}</div><ul className="mt-4 space-y-2">{(props.features as string[] ?? ["Feature"]).map((f, i) => <li key={i} className="flex gap-2"><span className="text-green-500">✓</span>{f}</li>)}</ul></div>'],
    ["event-listing-card", "EventCard", '<div className="border rounded-xl overflow-hidden"><div className="aspect-video bg-gray-200" /><div className="p-6"><div className="text-sm text-blue-600 font-bold">{props.date as string}</div><h3 className="mt-1 text-lg font-bold">{props.title as string}</h3><p className="mt-2 text-sm opacity-70">{props.location as string}</p></div></div>'],
    ["announcement-bar", "AnnouncementBar", '<div className="bg-blue-600 text-white py-2 px-8 text-center text-sm"><span>{props.message as string}</span></div>'],
    ["notification-banner", "NotificationBanner", '<div className="bg-yellow-50 border border-yellow-200 py-3 px-6 flex items-center gap-3 rounded-lg"><span className="text-yellow-600">⚠️</span><p className="text-sm">{props.message as string}</p></div>'],
    ["cookie-consent-bar", "CookieConsentBar", '<div className="fixed bottom-0 w-full bg-gray-900 text-white py-4 px-8 flex justify-between items-center z-50"><p className="text-sm">We use cookies for a better experience.</p><div className="flex gap-3"><button className="px-4 py-1 border border-white rounded text-sm">Reject</button><button className="px-4 py-1 bg-white text-black rounded text-sm">Accept</button></div></div>'],
    ["privacy-policy-block", "PrivacyPolicyBlock", '<section className="py-16 px-8 max-w-3xl mx-auto prose"><h1>Privacy Policy</h1><p>Last updated: {new Date().toLocaleDateString()}</p><h2>1. Information We Collect</h2><p>We collect information you provide directly to us.</p></section>'],
    ["social-links-row", "SocialLinksRow", '<div className="flex gap-4 justify-center py-6">{["Twitter","LinkedIn","Instagram","GitHub","YouTube"].map((s, i) => <a key={i} href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-sm">{s[0]}</a>)}</div>'],
    ["breadcrumb-rich", "BreadcrumbRich", '<nav className="px-8 py-3 text-sm"><ol className="flex gap-2">{["Home","Products","Category","Item"].map((b, i, a) => <li key={i} className="flex gap-2"><a href="#" className={i === a.length - 1 ? "font-bold" : "text-blue-600"}>{b}</a>{i < a.length - 1 && <span>/</span>}</li>)}</ol></nav>'],
  ].map(([type, name, jsx]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-${type}`,
    dna_blueprint: { tag: "div", role: "content", variant: type },
    code_react: rc(name as string, jsx as string),
    license: "MIT" as const,
  })),

  // ── Maps / Location (5) ───────────────────
  ...[
    ["location-map-pin", "LocationMapPin", '<section className="py-12 px-8"><div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center text-4xl">📍</div><div className="mt-4 text-center"><p className="font-bold">{props.address as string}</p></div></section>'],
    ["opening-hours-block", "OpeningHours", '<section className="py-12 px-8 max-w-md mx-auto"><h3 className="text-xl font-bold mb-4">Opening Hours</h3><dl className="space-y-2">{[["Mon-Fri","9:00–18:00"],["Saturday","10:00–16:00"],["Sunday","Closed"]].map(([d,h], i) => <div key={i} className="flex justify-between"><dt>{d}</dt><dd className="font-mono">{h}</dd></div>)}</dl></section>'],
    ["service-coverage-map", "CoverageMap", '<section className="py-12 px-8"><h3 className="text-xl font-bold mb-4">Service Coverage</h3><div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center text-4xl">🗺️</div></section>'],
    ["helpline-cta", "HelplineCta", '<section className="py-8 px-8 bg-red-50 text-center rounded-xl"><p className="text-sm text-red-600 font-bold">24/7 Helpline</p><a href={`tel:${props.phone as string}`} className="text-3xl font-bold text-red-600">{props.phone as string}</a></section>'],
    ["contact-directory-block", "ContactDirectory", '<section className="py-12 px-8"><h3 className="text-xl font-bold mb-6">Contact Directory</h3><div className="space-y-4">{[1,2,3].map(i => <div key={i} className="flex justify-between border-b pb-2"><span className="font-medium">Department {i}</span><span className="text-blue-600">+91 98765 4321{i}</span></div>)}</div></section>'],
  ].map(([type, name, jsx]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-${type}`,
    dna_blueprint: { tag: "section", role: "location", variant: type },
    code_react: rc(name as string, jsx as string),
    license: "MIT" as const,
  })),

  // ── Misc universal (12) ───────────────────
  ...[
    ["divider-line", "DividerLine", '<hr className="my-8 border-gray-200" />'],
    ["divider-wave", "DividerWave", '<svg viewBox="0 0 1440 100" className="w-full"><path fill="currentColor" className="text-gray-100" d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,100L0,100Z" /></svg>'],
    ["spacer", "Spacer", '<div style={{height: `${props.height as number ?? 64}px`}} />'],
    ["back-to-top", "BackToTop", '<button onClick={() => window.scrollTo({top:0,behavior:"smooth"})} className="fixed bottom-6 right-6 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center z-40">↑</button>'],
    ["loading-skeleton", "LoadingSkeleton", '<div className="animate-pulse space-y-4 p-8"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="h-4 bg-gray-200 rounded w-full" /><div className="h-4 bg-gray-200 rounded w-2/3" /></div>'],
    ["empty-state", "EmptyState", '<div className="py-20 text-center"><span className="text-5xl">📭</span><h3 className="mt-4 text-lg font-bold">No results found</h3><p className="mt-2 text-sm opacity-70">Try adjusting your search or filters.</p></div>'],
    ["error-404", "Error404", '<div className="py-20 text-center"><span className="text-8xl font-bold text-gray-200">404</span><h3 className="mt-4 text-lg font-bold">Page not found</h3></div>'],
    ["maintenance-page", "MaintenancePage", '<div className="h-screen flex flex-col items-center justify-center text-center"><span className="text-5xl">🔧</span><h1 className="mt-4 text-3xl font-bold">Under Maintenance</h1><p className="mt-2 opacity-70">We will be back shortly.</p></div>'],
    ["progress-bar", "ProgressBar", '<div className="px-8 py-4"><div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{width: "50%"}} /></div></div>'],
    ["donation-cta-block", "DonationCta", '<section className="py-12 px-8 bg-green-50 text-center rounded-xl"><h2 className="text-2xl font-bold">Support our cause</h2><p className="mt-2 opacity-70">Every contribution makes a difference</p><button className="mt-6 px-8 py-3 bg-green-600 text-white rounded-lg">Donate Now</button></section>'],
    ["impact-stats-counter", "ImpactStats", '<section className="py-16 px-8 bg-blue-900 text-white"><div className="grid grid-cols-3 gap-8 text-center">{[["10K+","Lives Impacted"],["200+","Projects"],["50+","Countries"]].map(([v,l], i) => <div key={i}><div className="text-4xl font-bold">{v}</div><div className="mt-2 text-sm opacity-60">{l}</div></div>)}</div></section>'],
    ["built-with-badge", "BuiltWithBadge", '<a href="https://svarnex.com" target="_blank" rel="noopener noreferrer" className="fixed bottom-4 right-4 z-50 px-3 py-1 bg-gray-900 text-white text-xs rounded-full shadow">Built with Svarnex</a>'],
  ].map(([type, name, jsx]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-${type}`,
    dna_blueprint: { tag: "div", role: "utility", variant: type },
    code_react: rc(name as string, jsx as string),
    license: "MIT" as const,
  })),
];

// ─── ZONE 1B: FORGE — Niche-specific blocks (100) ───────────

const FORGE_NICHE: SeedBlock[] = [
  // Food & Beverage (10)
  ...[
    ["menu-category-grid", "MenuCategoryGrid", "food-beverage"],
    ["food-item-card", "FoodItemCard", "food-beverage"],
    ["whatsapp-order-button", "WhatsAppOrderButton", "food-beverage"],
    ["chef-profile-card", "ChefProfileCard", "food-beverage"],
    ["online-ordering-cta", "OnlineOrderingCta", "food-beverage"],
    ["food-gallery-grid", "FoodGalleryGrid", "food-beverage"],
    ["special-menu-highlight", "SpecialMenuHighlight", "food-beverage"],
    ["dietary-filters", "DietaryFilters", "food-beverage"],
    ["restaurant-ambiance-gallery", "AmbianceGallery", "food-beverage"],
    ["meal-planner-grid", "MealPlannerGrid", "food-beverage"],
  ].map(([type, name, niche]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-niche-${type}`,
    dna_blueprint: { tag: "section", role: "niche", niche, variant: type },
    code_react: rc(name as string, `<section className="py-12 px-8"><h2 className="text-2xl font-bold mb-6">${name}</h2><div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="p-4 border rounded-lg">Item {i}</div>)}</div></section>`),
    license: "MIT" as const,
    niche: niche as string,
    is_niche_specific: true,
  })),

  // Healthcare (10)
  ...[
    ["doctor-profile-card", "DoctorProfileCard", "healthcare"],
    ["insurance-accepted-logos", "InsuranceLogos", "healthcare"],
    ["patient-testimonial", "PatientTestimonial", "healthcare"],
    ["emergency-contact-cta", "EmergencyContactCta", "healthcare"],
    ["health-blog-grid", "HealthBlogGrid", "healthcare"],
    ["symptom-checker", "SymptomChecker", "healthcare"],
    ["telemedicine-booking", "TelemedicineBooking", "healthcare"],
    ["lab-results-viewer", "LabResultsViewer", "healthcare"],
    ["clinic-tour-gallery", "ClinicTourGallery", "healthcare"],
    ["health-tips-carousel", "HealthTipsCarousel", "healthcare"],
  ].map(([type, name, niche]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-niche-${type}`,
    dna_blueprint: { tag: "section", role: "niche", niche, variant: type },
    code_react: rc(name as string, `<section className="py-12 px-8"><h2 className="text-2xl font-bold mb-6">${name}</h2><div className="grid grid-cols-2 gap-6">{[1,2].map(i => <div key={i} className="p-6 border rounded-xl">Item {i}</div>)}</div></section>`),
    license: "MIT" as const,
    niche: niche as string,
    is_niche_specific: true,
  })),

  // Real Estate (10)
  ...[
    ["property-listing-card", "PropertyListingCard", "real-estate"],
    ["emi-calculator", "EmiCalculator", "real-estate"],
    ["floor-plan-viewer", "FloorPlanViewer", "real-estate"],
    ["virtual-tour-embed", "VirtualTourEmbed", "real-estate"],
    ["agent-profile-card", "AgentProfileCard", "real-estate"],
    ["amenities-icon-grid", "AmenitiesIconGrid", "real-estate"],
    ["project-gallery-masonry", "ProjectGalleryMasonry", "real-estate"],
    ["property-comparison", "PropertyComparison", "real-estate"],
    ["mortgage-calculator", "MortgageCalculator", "real-estate"],
    ["property-map-view", "PropertyMapView", "real-estate"],
  ].map(([type, name, niche]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-niche-${type}`,
    dna_blueprint: { tag: "section", role: "niche", niche, variant: type },
    code_react: rc(name as string, `<section className="py-12 px-8"><h2 className="text-2xl font-bold mb-6">${name}</h2><div className="grid grid-cols-2 gap-6">{[1,2].map(i => <div key={i} className="p-6 border rounded-xl">Item {i}</div>)}</div></section>`),
    license: "MIT" as const,
    niche: niche as string,
    is_niche_specific: true,
  })),

  // Education (10)
  ...[
    ["course-curriculum", "CourseCurriculum", "education"],
    ["video-lesson-embed", "VideoLessonEmbed", "education"],
    ["quiz-block", "QuizBlock", "education"],
    ["student-progress", "StudentProgress", "education"],
    ["batch-schedule-table", "BatchScheduleTable", "education"],
    ["fee-structure-card", "FeeStructureCard", "education"],
    ["faculty-profile-grid", "FacultyProfileGrid", "education"],
    ["achievement-badges", "AchievementBadges", "education"],
    ["enrollment-cta", "EnrollmentCta", "education"],
    ["parent-testimonial-carousel", "ParentTestimonialCarousel", "education"],
  ].map(([type, name, niche]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-niche-${type}`,
    dna_blueprint: { tag: "section", role: "niche", niche, variant: type },
    code_react: rc(name as string, `<section className="py-12 px-8"><h2 className="text-2xl font-bold mb-6">${name}</h2><div className="space-y-4">{[1,2,3].map(i => <div key={i} className="p-4 border rounded-lg">Row {i}</div>)}</div></section>`),
    license: "MIT" as const,
    niche: niche as string,
    is_niche_specific: true,
  })),

  // Fitness (10)
  ...[
    ["class-schedule-grid", "ClassScheduleGrid", "fitness"],
    ["trainer-profile-card", "TrainerProfileCard", "fitness"],
    ["membership-pricing", "MembershipPricing", "fitness"],
    ["transformation-before-after", "TransformationBA", "fitness"],
    ["facility-gallery", "FacilityGallery", "fitness"],
    ["achievement-stats-counter", "AchievementStats", "fitness"],
    ["bmi-calculator", "BmiCalculator", "fitness"],
    ["free-trial-cta", "FreeTrialCta", "fitness"],
    ["workout-plan-card", "WorkoutPlanCard", "fitness"],
    ["nutrition-plan-grid", "NutritionPlanGrid", "fitness"],
  ].map(([type, name, niche]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-niche-${type}`,
    dna_blueprint: { tag: "section", role: "niche", niche, variant: type },
    code_react: rc(name as string, `<section className="py-12 px-8"><h2 className="text-2xl font-bold mb-6">${name}</h2><div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="p-6 bg-gray-50 rounded-xl">Card {i}</div>)}</div></section>`),
    license: "MIT" as const,
    niche: niche as string,
    is_niche_specific: true,
  })),

  // E-Commerce (10)
  ...[
    ["product-reviews-list", "ProductReviewsList", "ecommerce"],
    ["size-guide-modal", "SizeGuideModal", "ecommerce"],
    ["add-to-cart-cta", "AddToCartCta", "ecommerce"],
    ["price-tag-block", "PriceTagBlock", "ecommerce"],
    ["related-products-row", "RelatedProductsRow", "ecommerce"],
    ["shipping-info-block", "ShippingInfoBlock", "ecommerce"],
    ["return-policy-block", "ReturnPolicyBlock", "ecommerce"],
    ["discount-badge", "DiscountBadge", "ecommerce"],
    ["wishlist-button", "WishlistButton", "ecommerce"],
    ["product-filter-sidebar", "ProductFilterSidebar", "ecommerce"],
  ].map(([type, name, niche]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-niche-${type}`,
    dna_blueprint: { tag: "div", role: "niche", niche, variant: type },
    code_react: rc(name as string, `<div className="p-6 border rounded-xl"><h3 className="font-bold mb-4">${name}</h3><div className="space-y-2">{[1,2,3].map(i => <div key={i} className="text-sm">Item {i}</div>)}</div></div>`),
    license: "MIT" as const,
    niche: niche as string,
    is_niche_specific: true,
  })),

  // Tech/SaaS (10)
  ...[
    ["hero-saas-dashboard-preview", "SaasDashboardHero", "tech-saas"],
    ["integration-logos-wall", "IntegrationLogos", "tech-saas"],
    ["api-docs-link-cta", "ApiDocsLink", "tech-saas"],
    ["product-demo-video", "ProductDemoVideo", "tech-saas"],
    ["changelog-block", "ChangelogBlock", "tech-saas"],
    ["github-stars-badge", "GithubStarsBadge", "tech-saas"],
    ["developer-testimonial", "DeveloperTestimonial", "tech-saas"],
    ["security-trust-badges", "SecurityTrustBadges", "tech-saas"],
    ["code-snippet-showcase", "CodeSnippetShowcase", "tech-saas"],
    ["api-playground", "ApiPlayground", "tech-saas"],
  ].map(([type, name, niche]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-niche-${type}`,
    dna_blueprint: { tag: "section", role: "niche", niche, variant: type },
    code_react: rc(name as string, `<section className="py-12 px-8"><h2 className="text-2xl font-bold mb-6">${name}</h2><div className="p-6 bg-gray-900 text-green-400 rounded-xl font-mono text-sm">$ npm install @svarnex/sdk</div></section>`),
    license: "MIT" as const,
    niche: niche as string,
    is_niche_specific: true,
  })),

  // Beauty (10)
  ...[
    ["service-menu-with-prices", "ServiceMenuPrices", "beauty"],
    ["staff-profile-grid", "StaffProfileGrid", "beauty"],
    ["client-testimonial-reel", "ClientReelTestimonial", "beauty"],
    ["instagram-portfolio-embed", "InstaPortfolio", "beauty"],
    ["price-list-table", "PriceListTable", "beauty"],
    ["treatment-detail-card", "TreatmentDetailCard", "beauty"],
    ["loyalty-program-block", "LoyaltyProgramBlock", "beauty"],
    ["product-showcase-grid", "ProductShowcaseGrid", "beauty"],
    ["bridal-package-card", "BridalPackageCard", "beauty"],
    ["gift-card-cta", "GiftCardCta", "beauty"],
  ].map(([type, name, niche]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-niche-${type}`,
    dna_blueprint: { tag: "section", role: "niche", niche, variant: type },
    code_react: rc(name as string, `<section className="py-12 px-8"><h2 className="text-2xl font-bold mb-6">${name}</h2><div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="p-4 border rounded-lg text-center">Service {i}</div>)}</div></section>`),
    license: "MIT" as const,
    niche: niche as string,
    is_niche_specific: true,
  })),

  // Gaming (10)
  ...[
    ["game-hero-cinematic", "GameHeroCinematic", "gaming-esports"],
    ["team-roster-card", "TeamRosterCard", "gaming-esports"],
    ["tournament-bracket-block", "TournamentBracket", "gaming-esports"],
    ["game-trailer-embed", "GameTrailerEmbed", "gaming-esports"],
    ["achievements-showcase", "AchievementsShowcase", "gaming-esports"],
    ["sponsor-logos-wall", "SponsorLogosWall", "gaming-esports"],
    ["discord-join-cta", "DiscordJoinCta", "gaming-esports"],
    ["stream-schedule-block", "StreamScheduleBlock", "gaming-esports"],
    ["merch-store-cta", "MerchStoreCta", "gaming-esports"],
    ["leaderboard-top10", "LeaderboardTop10", "gaming-esports"],
  ].map(([type, name, niche]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-niche-${type}`,
    dna_blueprint: { tag: "section", role: "niche", niche, variant: type },
    code_react: rc(name as string, `<section className="py-12 px-8 bg-gray-900 text-white"><h2 className="text-2xl font-bold mb-6">${name}</h2><div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="p-4 bg-gray-800 rounded-lg">Player {i}</div>)}</div></section>`),
    license: "MIT" as const,
    niche: niche as string,
    is_niche_specific: true,
  })),

  // Events (10)
  ...[
    ["event-countdown-timer", "EventCountdownTimer", "events"],
    ["package-pricing-card", "PackagePricingCard", "events"],
    ["vendor-partner-logos", "VendorPartnerLogos", "events"],
    ["venue-map-embed", "VenueMapEmbed", "events"],
    ["portfolio-before-after", "PortfolioBeforeAfter", "events"],
    ["event-schedule-timeline", "EventScheduleTimeline", "events"],
    ["speaker-profile-grid", "SpeakerProfileGrid", "events"],
    ["ticket-purchase-cta", "TicketPurchaseCta", "events"],
    ["photo-booth-gallery", "PhotoBoothGallery", "events"],
    ["live-stream-embed", "LiveStreamEmbed", "events"],
  ].map(([type, name, niche]) => ({
    block_type: type as string,
    zone_type: "FORGE" as const,
    species_name: `forge-niche-${type}`,
    dna_blueprint: { tag: "section", role: "niche", niche, variant: type },
    code_react: rc(name as string, `<section className="py-12 px-8"><h2 className="text-2xl font-bold mb-6">${name}</h2><div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="p-6 border rounded-xl text-center">Event Detail {i}</div>)}</div></section>`),
    license: "MIT" as const,
    niche: niche as string,
    is_niche_specific: true,
  })),
];

// ─── ZONE 2: FOUNDRY — Design system blocks (60) ────────────

const FOUNDRY_BLOCKS: SeedBlock[] = [
  ...[
    "color-palette-viewer", "typography-specimen", "spacing-scale-chart",
    "border-radius-preview", "shadow-elevation-demo", "icon-library-grid",
    "button-variants-showcase", "input-field-variants", "checkbox-radio-demo",
    "toggle-switch-demo", "dropdown-select-demo", "toast-notification-demo",
    "modal-dialog-demo", "tooltip-demo", "badge-variants-demo",
    "avatar-sizes-demo", "card-variants-demo", "table-style-demo",
    "tab-component-demo", "accordion-component-demo", "breadcrumb-demo",
    "pagination-demo", "progress-bar-demo", "skeleton-loader-demo",
    "alert-variants-demo", "chip-tag-demo", "divider-variants-demo",
    "list-style-demo", "navbar-variant-demo", "footer-variant-demo",
    "form-layout-demo", "grid-layout-demo", "flex-layout-demo",
    "responsive-breakpoints-demo", "animation-timing-demo", "transition-demo",
    "hover-effect-demo", "focus-ring-demo", "scroll-behavior-demo",
    "dark-mode-toggle-demo", "theme-switcher-demo", "design-token-viewer",
    "gradient-palette-demo", "glassmorphism-demo", "neumorphism-demo",
    "noise-texture-demo", "pattern-bg-demo", "blur-backdrop-demo",
    "text-gradient-demo", "floating-label-input", "stepper-form-demo",
    "date-picker-demo", "time-picker-demo", "file-upload-demo",
    "rich-text-editor-demo", "code-block-demo", "slider-range-demo",
    "rating-stars-demo", "emoji-picker-demo", "color-picker-demo",
  ].map((type) => ({
    block_type: type,
    zone_type: "FOUNDRY" as const,
    species_name: `foundry-${type}`,
    dna_blueprint: { tag: "div", role: "design-system", variant: type },
    code_react: rc(
      type.split("-").map(w => w[0]!.toUpperCase() + w.slice(1)).join(""),
      `<div className="p-8 border rounded-xl"><h3 className="text-lg font-bold mb-4">${type.replace(/-/g, " ")}</h3><div className="p-4 bg-gray-50 rounded-lg">[${type} preview]</div></div>`
    ),
    license: "MIT" as const,
  })),
];

// ─── ZONE 3: ENGINE — Game/interactive blocks (80) ───────────

const ENGINE_BLOCKS: SeedBlock[] = [
  ...[
    "game-canvas-webgl", "game-canvas-webgpu", "game-hud-overlay",
    "health-bar", "mana-bar", "experience-bar", "mini-map",
    "inventory-grid", "character-sheet", "dialogue-box",
    "quest-log", "achievement-popup", "damage-numbers",
    "particle-emitter-2d", "particle-emitter-3d", "sprite-animator",
    "tile-map-renderer", "physics-sandbox-2d", "collision-debugger",
    "scene-graph-viewer", "camera-controller-orbit", "camera-controller-fps",
    "light-probe-grid", "shadow-map-visualizer", "post-process-bloom",
    "post-process-chromatic", "post-process-vignette", "skybox-hdri",
    "terrain-generator", "water-surface-shader", "fog-volume",
    "sdf-renderer", "raymarcher-simple", "holographic-card",
    "gltf-model-viewer", "animation-mixer", "skeleton-rig-viewer",
    "morph-target-demo", "gpu-instancer", "compute-shader-demo",
    "audio-listener-3d", "audio-emitter-3d", "sound-visualizer",
    "input-manager-keyboard", "input-manager-gamepad", "input-manager-touch",
    "score-counter-animated", "level-transition-screen", "game-over-screen",
    "pause-menu", "settings-panel-game", "save-load-panel",
    "multiplayer-lobby", "player-name-tag", "chat-bubble-game",
    "npc-behavior-tree-viz", "path-finder-viz", "state-machine-viz",
    "vfx-explosion", "vfx-trail", "vfx-impact",
    "vfx-portal", "vfx-shield", "vfx-heal",
    "weapon-stats-card", "loot-drop-popup", "crafting-grid",
    "shop-ui", "currency-display", "reward-chest-animation",
    "timer-countdown-game", "wave-counter", "combo-meter",
    "tutorial-tooltip-game", "objective-tracker", "notification-stack-game",
    "leaderboard-realtime", "replay-viewer", "spectator-controls",
    "physics-ragdoll-demo", "cloth-simulation-demo", "fluid-simulation-demo",
    "voxel-renderer", "marching-cubes-demo",
  ].map((type) => ({
    block_type: type,
    zone_type: "ENGINE" as const,
    species_name: `engine-${type}`,
    dna_blueprint: { tag: "canvas", role: "game", variant: type },
    code_react: rc(
      type.split("-").map(w => w[0]!.toUpperCase() + w.slice(1)).join(""),
      `<div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center text-white"><span className="text-sm opacity-60">[${type.replace(/-/g, " ")}]</span></div>`
    ),
    license: "MIT" as const,
  })),
];

// ─── ZONE 4: BAZAAR — Marketplace blocks (35) ───────────────

const BAZAAR_BLOCKS: SeedBlock[] = [
  ...[
    "template-preview-card", "template-detail-hero", "template-category-filter",
    "template-search-bar", "template-sort-dropdown", "seller-profile-card",
    "seller-store-grid", "seller-analytics-summary", "buyer-review-card",
    "review-stars-inline", "purchase-button-chip", "purchase-button-inr",
    "template-price-tag", "template-comparison-table", "featured-templates-carousel",
    "trending-templates-row", "new-arrivals-grid", "category-nav-sidebar",
    "template-rating-breakdown", "seller-badge-verified", "seller-revenue-chart",
    "dispute-status-banner", "version-history-timeline", "template-license-badge",
    "related-templates-row", "template-demo-button", "template-download-counter",
    "bazaar-hero-banner", "bazaar-footer-links", "seller-onboarding-wizard",
    "buyer-purchase-history", "commission-breakdown-card", "payout-status-tracker",
    "template-tag-cloud", "bazaar-notification-bell",
  ].map((type) => ({
    block_type: type,
    zone_type: "BAZAAR" as const,
    species_name: `bazaar-${type}`,
    dna_blueprint: { tag: "div", role: "marketplace", variant: type },
    code_react: rc(
      type.split("-").map(w => w[0]!.toUpperCase() + w.slice(1)).join(""),
      `<div className="p-6 border rounded-xl"><h3 className="font-bold mb-3">${type.replace(/-/g, " ")}</h3><div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">[${type} content]</div></div>`
    ),
    license: "MIT" as const,
  })),
];

// ─── ZONE 5: LOGIC — Automation/backend blocks (50) ─────────

const LOGIC_BLOCKS: SeedBlock[] = [
  ...[
    "api-endpoint-node", "webhook-receiver-node", "cron-schedule-node",
    "database-query-node", "database-insert-node", "database-update-node",
    "http-request-node", "email-send-node", "sms-send-node",
    "whatsapp-send-node", "push-notification-node", "slack-message-node",
    "discord-message-node", "telegram-message-node", "if-condition-node",
    "switch-case-node", "loop-node", "delay-timer-node",
    "variable-set-node", "variable-get-node", "json-transform-node",
    "csv-parser-node", "xml-parser-node", "regex-matcher-node",
    "math-expression-node", "string-template-node", "array-filter-node",
    "array-map-node", "array-reduce-node", "object-merge-node",
    "auth-check-node", "rate-limit-node", "cache-read-node",
    "cache-write-node", "file-upload-node", "file-download-node",
    "image-resize-node", "pdf-generate-node", "qr-code-generate-node",
    "payment-create-node", "payment-verify-node", "subscription-check-node",
    "analytics-event-node", "log-entry-node", "error-handler-node",
    "ai-text-generate-node", "ai-image-generate-node", "ai-classify-node",
    "geo-ip-lookup-node", "currency-convert-node",
  ].map((type) => ({
    block_type: type,
    zone_type: "LOGIC" as const,
    species_name: `logic-${type}`,
    dna_blueprint: { tag: "node", role: "automation", variant: type, inputs: [], outputs: [] },
    code_react: rc(
      type.split("-").map(w => w[0]!.toUpperCase() + w.slice(1)).join(""),
      `<div className="w-48 bg-white border-2 border-blue-500 rounded-xl shadow-lg"><div className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-t-lg">${type.replace(/-/g, " ")}</div><div className="p-3 text-xs space-y-1"><div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full" />Input</div><div className="flex items-center gap-2 justify-end">Output<span className="w-2 h-2 bg-orange-400 rounded-full" /></div></div></div>`
    ),
    license: "MIT" as const,
  })),
];

// ─── ZONE 6: Booking blocks (20 universal) ──────────────────

const BOOKING_BLOCKS: SeedBlock[] = [
  ...[
    "booking-time-slot-picker", "booking-service-selector", "booking-staff-selector",
    "booking-summary-card", "booking-confirmation-screen", "booking-cancel-form",
    "booking-reschedule-modal", "booking-reminder-settings", "booking-payment-step",
    "booking-queue-display", "booking-waitlist-cta", "booking-recurring-toggle",
    "booking-group-size-selector", "booking-location-selector", "booking-notes-textarea",
    "booking-availability-heatmap", "booking-multi-service-cart", "booking-referral-code-input",
    "booking-terms-checkbox", "booking-success-animation",
  ].map((type) => ({
    block_type: type,
    zone_type: "FORGE" as const,
    species_name: `booking-${type}`,
    dna_blueprint: { tag: "div", role: "booking", variant: type },
    code_react: rc(
      type.split("-").map(w => w[0]!.toUpperCase() + w.slice(1)).join(""),
      `<div className="p-6 border rounded-xl"><h3 className="font-bold mb-3">${type.replace(/-/g, " ")}</h3><div className="p-4 bg-blue-50 rounded-lg text-sm">[${type} UI]</div></div>`
    ),
    license: "MIT" as const,
  })),
];

// ─── Aggregate all blocks ────────────────────────────────────

export const ALL_SEED_BLOCKS: SeedBlock[] = [
  ...FORGE_UNIVERSAL,
  ...FORGE_NICHE,
  ...FOUNDRY_BLOCKS,
  ...ENGINE_BLOCKS,
  ...BAZAAR_BLOCKS,
  ...LOGIC_BLOCKS,
  ...BOOKING_BLOCKS,
];

// ─── Seed function ───────────────────────────────────────────

export async function seedInfiniteLibrary(): Promise<{
  inserted: number;
  skipped: number;
  errors: string[];
}> {
  const supabase = createServiceClient();
  let inserted = 0;
  const skipped = 0;
  const errors: string[] = [];

  // Process in batches of 50
  const BATCH_SIZE = 50;
  for (let i = 0; i < ALL_SEED_BLOCKS.length; i += BATCH_SIZE) {
    const batch = ALL_SEED_BLOCKS.slice(i, i + BATCH_SIZE).map((block) => ({
      block_type: block.block_type,
      zone_type: block.zone_type,
      species_name: block.species_name,
      dna_blueprint: block.dna_blueprint,
      code_react: block.code_react,
      license: block.license,
      niche: block.niche ?? null,
      sub_niche: block.sub_niche ?? null,
      is_niche_specific: block.is_niche_specific ?? false,
      block_version: block.block_version ?? "v1.0",
      status: "ACTIVE" as const,
    }));

    const { data, error } = await supabase
      .from("infinite_library_blocks")
      .upsert(batch, { onConflict: "species_name" })
      .select("block_id");

    if (error) {
      errors.push(`Batch ${Math.floor(i / BATCH_SIZE)}: ${error.message}`);
    } else {
      inserted += data?.length ?? 0;
    }
  }

  return { inserted, skipped, errors };
}

/** Total seed block count. Expected: 525+ */
export const SEED_BLOCK_COUNT = ALL_SEED_BLOCKS.length;
