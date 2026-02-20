// ═══════════════════════════════════════════════════════════════
// SVARNEX — Niche Map (Section 3A)
// 20 niches, 300 sub-niches, with default Q1/vibe/blockTypes
// ═══════════════════════════════════════════════════════════════

export interface NicheCategory {
  id: string;
  label: string;
  icon: string;
  subNiches: string[];
  defaultQ1: "LEAD_GEN" | "SINGLE_PRODUCT" | "PORTFOLIO" | "INFORM_EDUCATE";
  defaultVibe: "MINIMALIST" | "BOLD_DARK" | "WARM_ORGANIC";
  blockTypes: string[];
}

export const NICHE_MAP: NicheCategory[] = [
  {
    id: "food-beverage",
    label: "Food & Beverage",
    icon: "🍽️",
    subNiches: [
      "Restaurant", "Café", "Cloud Kitchen", "Bakery", "Food Truck",
      "Catering", "Bar", "Juice Bar", "Meal Prep", "Farm-to-Table",
      "Food Blog", "Recipe App", "Grocery Delivery", "Wine Shop", "Brewery",
    ],
    defaultQ1: "SINGLE_PRODUCT",
    defaultVibe: "WARM_ORGANIC",
    blockTypes: [
      "menu-category-grid", "food-item-card", "whatsapp-order-button",
      "booking-calendar", "testimonial-carousel", "location-map-pin",
      "opening-hours-block", "food-gallery-grid", "chef-profile-card",
      "online-ordering-cta",
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare & Wellness",
    icon: "🏥",
    subNiches: [
      "Clinic", "Hospital", "Dentist", "Physiotherapy", "Ayurveda",
      "Mental Health", "Nutrition", "Yoga Studio", "Spa", "Pharmacy",
      "Diagnostic Lab", "Veterinary", "Homeopathy", "Dermatology", "Ophthalmology",
    ],
    defaultQ1: "LEAD_GEN",
    defaultVibe: "MINIMALIST",
    blockTypes: [
      "appointment-booking", "doctor-profile-card", "service-list",
      "insurance-accepted-logos", "patient-testimonial", "contact-form-simple",
      "faq-accordion", "emergency-contact-cta", "before-after-slider",
      "health-blog-grid",
    ],
  },
  {
    id: "education",
    label: "Education & Training",
    icon: "📚",
    subNiches: [
      "Tutor", "School", "College", "Online Course", "Coaching Centre",
      "EdTech App", "Language School", "Music School", "Art Class",
      "Certification Programme", "Corporate Training", "E-Learning Platform",
      "Test Prep", "Skill Development", "Kids Education",
    ],
    defaultQ1: "INFORM_EDUCATE",
    defaultVibe: "MINIMALIST",
    blockTypes: [
      "course-curriculum", "video-lesson-embed", "quiz-block",
      "student-progress", "batch-schedule-table", "fee-structure-card",
      "faculty-profile-grid", "achievement-badges", "enrollment-cta",
      "parent-testimonial-carousel",
    ],
  },
  {
    id: "real-estate",
    label: "Real Estate",
    icon: "🏠",
    subNiches: [
      "Residential Sales", "Commercial Leasing", "Property Management",
      "Interior Design", "Architecture", "Land Development", "Co-Working Space",
      "PG/Hostel", "Holiday Rental", "Real Estate Agency", "Builder",
      "Property Portal", "Home Decor", "Smart Home", "Vastu Consultant",
    ],
    defaultQ1: "LEAD_GEN",
    defaultVibe: "BOLD_DARK",
    blockTypes: [
      "property-listing-card", "emi-calculator", "floor-plan-viewer",
      "virtual-tour-embed", "agent-profile-card", "location-map-pin",
      "whatsapp-inquiry-button", "amenities-icon-grid", "project-gallery-masonry",
      "testimonial-grid",
    ],
  },
  {
    id: "fitness",
    label: "Fitness & Sports",
    icon: "💪",
    subNiches: [
      "Gym", "Personal Trainer", "CrossFit", "Martial Arts", "Swimming",
      "Cricket Academy", "Football Club", "Dance Studio", "Pilates",
      "Cycling Studio", "Nutrition Coach", "Sports Equipment", "Marathon Training",
      "Zumba", "Physiotherapy Rehab",
    ],
    defaultQ1: "LEAD_GEN",
    defaultVibe: "BOLD_DARK",
    blockTypes: [
      "class-schedule-grid", "trainer-profile-card", "membership-pricing",
      "transformation-before-after", "booking-calendar", "facility-gallery",
      "achievement-stats-counter", "bmi-calculator", "free-trial-cta",
      "instagram-feed-embed",
    ],
  },
  {
    id: "beauty",
    label: "Beauty & Personal Care",
    icon: "💅",
    subNiches: [
      "Salon", "Barbershop", "Nail Studio", "Makeup Artist", "Tattoo Studio",
      "Eyebrow Threading", "Lash Studio", "Mehndi Artist", "Bridal Makeup",
      "Skin Care Brand", "Hair Care Brand", "Organic Beauty", "Waxing Studio",
      "Facial Spa", "Beauty Academy",
    ],
    defaultQ1: "LEAD_GEN",
    defaultVibe: "WARM_ORGANIC",
    blockTypes: [
      "service-menu-with-prices", "booking-calendar", "before-after-slider",
      "staff-profile-grid", "gallery-masonry", "product-showcase-grid",
      "whatsapp-booking-cta", "price-list-table", "client-testimonial-reel",
      "instagram-portfolio-embed",
    ],
  },
  {
    id: "legal-finance",
    label: "Legal & Finance",
    icon: "⚖️",
    subNiches: [
      "Law Firm", "CA / Accountant", "Tax Consultant", "Financial Advisor",
      "Insurance Agent", "Loan Broker", "Investment Advisor", "Startup Legal",
      "IP Attorney", "Labour Law", "Property Lawyer", "Divorce Lawyer",
      "Debt Recovery", "Compliance Consultant", "Notary",
    ],
    defaultQ1: "LEAD_GEN",
    defaultVibe: "MINIMALIST",
    blockTypes: [
      "service-list-with-icons", "attorney-profile-card", "case-study-card",
      "trust-badges-row", "contact-form-with-file-upload", "faq-accordion",
      "appointment-booking", "credentials-logos", "testimonial-text-grid",
      "privacy-policy-block",
    ],
  },
  {
    id: "tech-saas",
    label: "Technology & SaaS",
    icon: "💻",
    subNiches: [
      "SaaS Product", "Mobile App", "AI Tool", "Developer Tool", "API Platform",
      "Cybersecurity", "IT Services", "Cloud Solution", "IoT Product",
      "Blockchain App", "Data Analytics", "No-Code Tool", "Browser Extension",
      "Plugin/Integration", "Open Source Project",
    ],
    defaultQ1: "SINGLE_PRODUCT",
    defaultVibe: "BOLD_DARK",
    blockTypes: [
      "hero-saas-dashboard-preview", "features-bento-grid", "pricing-toggle",
      "integration-logos-wall", "api-docs-link-cta", "product-demo-video",
      "changelog-block", "github-stars-badge", "developer-testimonial",
      "security-trust-badges",
    ],
  },
  {
    id: "ecommerce",
    label: "E-Commerce & Retail",
    icon: "🛍️",
    subNiches: [
      "Fashion", "Electronics", "Home Decor", "Jewellery", "Books",
      "Sports Gear", "Toys", "Stationery", "Gift Shop", "Grocery",
      "Organic Products", "Handmade Crafts", "Pet Supplies", "Art Prints",
      "Vintage/Thrift",
    ],
    defaultQ1: "SINGLE_PRODUCT",
    defaultVibe: "MINIMALIST",
    blockTypes: [
      "product-card-with-variants", "product-gallery-carousel", "price-tag-block",
      "add-to-cart-cta", "size-guide-modal", "product-reviews-list",
      "related-products-row", "shipping-info-block", "return-policy-block",
      "discount-badge",
    ],
  },
  {
    id: "hospitality",
    label: "Hospitality & Travel",
    icon: "✈️",
    subNiches: [
      "Hotel", "Homestay", "Resort", "Travel Agency", "Tour Operator",
      "Visa Consultant", "Car Rental", "Camping", "Trekking", "Cruise",
      "Adventure Sports", "City Tour Guide", "Airport Transfer",
      "Travel Blog", "Backpacker Hostel",
    ],
    defaultQ1: "LEAD_GEN",
    defaultVibe: "WARM_ORGANIC",
    blockTypes: [
      "booking-calendar", "room-listing-card", "amenities-icon-grid",
      "photo-gallery-fullscreen", "itinerary-timeline", "pricing-per-night-card",
      "tripadvisor-reviews-embed", "map-location-block", "contact-form-simple",
      "whatsapp-inquiry-cta",
    ],
  },
  {
    id: "events",
    label: "Events & Entertainment",
    icon: "🎉",
    subNiches: [
      "Wedding Planner", "Event Management", "DJ", "Photographer", "Videographer",
      "Catering for Events", "Florist", "Decorator", "Band/Orchestra",
      "Comedy Show", "Conference Organiser", "Corporate Events", "Birthday Planner",
      "Venue Rental", "Virtual Event Platform",
    ],
    defaultQ1: "LEAD_GEN",
    defaultVibe: "BOLD_DARK",
    blockTypes: [
      "event-countdown-timer", "gallery-masonry", "testimonial-video-embed",
      "package-pricing-card", "booking-calendar", "vendor-partner-logos",
      "instagram-feed-embed", "rsvp-form", "venue-map-embed",
      "portfolio-before-after",
    ],
  },
  {
    id: "media-content",
    label: "Media & Content",
    icon: "🎬",
    subNiches: [
      "YouTuber", "Podcaster", "Blogger", "Newsletter", "News Portal",
      "Magazine", "Photography Studio", "Graphic Designer", "Illustrator",
      "Animator", "Music Artist", "Author", "Comic Creator",
      "Streamer", "Content Agency",
    ],
    defaultQ1: "PORTFOLIO",
    defaultVibe: "BOLD_DARK",
    blockTypes: [
      "hero-video-bg", "portfolio-grid-masonry", "youtube-embed-block",
      "podcast-episode-list", "newsletter-inline-signup", "press-mentions-strip",
      "social-follow-buttons", "latest-articles-grid", "patron-cta-block",
      "media-kit-download",
    ],
  },
  {
    id: "ngo-social",
    label: "NGO & Social Impact",
    icon: "🤝",
    subNiches: [
      "Charity", "Animal Welfare", "Environmental NGO", "Education NGO",
      "Healthcare NGO", "Disaster Relief", "Women Empowerment",
      "Rural Development", "Skill Training", "Child Welfare", "Senior Care",
      "LGBTQ+ Support", "Mental Health Advocacy", "Refugee Aid", "Arts Funding",
    ],
    defaultQ1: "INFORM_EDUCATE",
    defaultVibe: "WARM_ORGANIC",
    blockTypes: [
      "donation-cta-block", "impact-stats-counter", "project-showcase-card",
      "volunteer-signup-form", "partner-logos", "team-photo-grid",
      "annual-report-download", "newsletter-signup", "mission-statement-hero",
      "event-listing-card",
    ],
  },
  {
    id: "logistics",
    label: "Logistics & Transport",
    icon: "🚚",
    subNiches: [
      "Courier Service", "Freight Company", "Last-Mile Delivery", "Warehousing",
      "Moving Company", "E-Commerce Logistics", "Cold Chain", "Trucking",
      "Import/Export", "Customs Broker", "Supply Chain", "Bike Delivery",
      "Drone Delivery", "EV Fleet", "Port Logistics",
    ],
    defaultQ1: "LEAD_GEN",
    defaultVibe: "BOLD_DARK",
    blockTypes: [
      "tracking-status-block", "service-coverage-map", "pricing-zone-table",
      "fleet-showcase-grid", "shipment-calculator", "partner-logos",
      "contact-form-simple", "stats-counter", "testimonial-carousel",
      "get-quote-cta",
    ],
  },
  {
    id: "manufacturing",
    label: "Manufacturing & Industrial",
    icon: "🏭",
    subNiches: [
      "Textile", "Auto Parts", "Electronics Manufacturing", "Food Processing",
      "Chemical", "Pharmaceutical", "Plastics", "Metal Fabrication",
      "Wood Products", "Packaging", "Construction Materials",
      "Machinery", "Agricultural Equipment", "Defence Supplier", "OEM Parts",
    ],
    defaultQ1: "LEAD_GEN",
    defaultVibe: "MINIMALIST",
    blockTypes: [
      "product-catalogue-grid", "certifications-logos", "factory-photo-gallery",
      "b2b-inquiry-form", "specs-table-block", "export-countries-map",
      "capacity-stats-block", "iso-badge-block", "partner-brands-logos",
      "request-sample-cta",
    ],
  },
  {
    id: "agriculture",
    label: "Agriculture & Farming",
    icon: "🌾",
    subNiches: [
      "Organic Farm", "Dairy", "Poultry", "Fishery", "Agri-Tech Startup",
      "Farm Equipment Rental", "Seed Company", "Fertiliser Dealer",
      "Agricultural Consulting", "Greenhouse", "Hydroponics",
      "Agri Export", "Food Processing Unit", "Farmer Producer Organisation",
      "Agri Insurance",
    ],
    defaultQ1: "SINGLE_PRODUCT",
    defaultVibe: "WARM_ORGANIC",
    blockTypes: [
      "product-listing-card", "farm-gallery-grid", "seasonal-availability-calendar",
      "bulk-order-inquiry-form", "certifications-logos", "farm-story-hero",
      "produce-categories-grid", "contact-form-simple", "testimonial-carousel",
      "whatsapp-order-cta",
    ],
  },
  {
    id: "government-civic",
    label: "Government & Civic",
    icon: "🏛️",
    subNiches: [
      "Municipal Services", "Public Scheme Portal", "Electoral Campaign",
      "Police/Security", "Fire Department", "Courts", "Land Records",
      "Public Health Dept", "Education Dept", "Transport Authority",
      "Tourism Board", "Cultural Dept", "RTO", "Electricity Board", "Water Board",
    ],
    defaultQ1: "INFORM_EDUCATE",
    defaultVibe: "MINIMALIST",
    blockTypes: [
      "announcement-bar", "scheme-listing-card", "contact-directory-block",
      "document-download-block", "faq-accordion", "office-location-map",
      "news-ticker-block", "grievance-form", "helpline-cta", "stats-counter",
    ],
  },
  {
    id: "gaming-esports",
    label: "Gaming & Esports",
    icon: "🎮",
    subNiches: [
      "Game Studio", "Esports Team", "Game Streamer", "Gaming Café", "LAN Tournament",
      "Game Review Blog", "Mobile Game", "Indie Game", "Game Asset Store",
      "Gaming Coach", "Game Mod Community", "VR Experience", "Arcade",
      "Board Game Café", "Retro Gaming",
    ],
    defaultQ1: "PORTFOLIO",
    defaultVibe: "BOLD_DARK",
    blockTypes: [
      "game-hero-cinematic", "team-roster-card", "tournament-bracket-block",
      "game-trailer-embed", "achievements-showcase", "sponsor-logos-wall",
      "discord-join-cta", "stream-schedule-block", "merch-store-cta",
      "leaderboard-top10",
    ],
  },
  {
    id: "professional-services",
    label: "Professional Services",
    icon: "💼",
    subNiches: [
      "Consultant", "HR/Recruitment", "PR Agency", "Marketing Agency",
      "Branding Agency", "Web Developer", "Video Editor", "Copywriter",
      "Translator", "Virtual Assistant", "Research Analyst", "Business Coach",
      "Life Coach", "Career Counsellor", "Executive Coach",
    ],
    defaultQ1: "PORTFOLIO",
    defaultVibe: "MINIMALIST",
    blockTypes: [
      "case-study-card", "client-logo-wall", "service-pricing-card",
      "testimonial-text-grid", "booking-calendar", "team-profile-grid",
      "process-steps-numbered", "results-stats-counter", "portfolio-grid",
      "contact-form-with-message",
    ],
  },
  {
    id: "other",
    label: "Other / Custom",
    icon: "✨",
    subNiches: [
      "Personal Brand", "Community Group", "Club/Society", "Political Campaign",
      "Religious Organisation", "Pet Business", "Astrology/Tarot",
      "Handicraft Seller", "Street Artist", "Independent Music Band",
      "Local News", "Neighbourhood App", "Lost & Found", "Carpooling", "Miscellaneous",
    ],
    defaultQ1: "LEAD_GEN",
    defaultVibe: "MINIMALIST",
    blockTypes: [
      "hero-centered", "features-grid-3col", "contact-form-simple",
      "testimonial-carousel", "cta-banner-full-width", "stats-counter",
      "team-profile-grid", "faq-accordion", "social-links-row", "footer-minimal",
    ],
  },
];

/** Total niches count */
export const NICHE_COUNT = NICHE_MAP.length;
/** Total sub-niches count */
export const SUB_NICHE_COUNT = NICHE_MAP.reduce(
  (sum, n) => sum + n.subNiches.length,
  0
);
