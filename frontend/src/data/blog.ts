export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "Study in China" | "Product Sourcing" | "Guide";
  date: string;
  readTime: string;
  author: string;
  tags: string[];
  imageUrl?: string | null;
  content: BlogSection[];
}

export interface BlogSection {
  type: "paragraph" | "heading" | "list" | "tip";
  text?: string;
  level?: 2 | 3;
  items?: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "complete-guide-studying-in-china-2026",
    title: "The Complete Guide to Studying in China in 2026",
    excerpt:
      "Everything international students need to know about admissions, scholarships, visas, and student life in China.",
    category: "Study in China",
    date: "June 20, 2026",
    readTime: "12 min read",
    author: "86 Connect Education Team",
    tags: ["study abroad", "scholarships", "student visa", "universities"],
    content: [
      {
        type: "paragraph",
        text: "China has become one of the most popular study destinations in Asia, attracting over 500,000 international students annually. With world-class universities, affordable tuition, generous scholarships, and a rich cultural experience, it's no surprise that more students are choosing China for their higher education.",
      },
      {
        type: "heading",
        level: 2,
        text: "Why Study in China?",
      },
      {
        type: "list",
        items: [
          "World-ranked universities (Tsinghua, Peking, Fudan consistently rank in global top 100)",
          "Affordable tuition compared to Western countries ($2,000-$10,000/year)",
          "Generous scholarship programs covering full tuition and living stipends",
          "Post-study work opportunities in China's booming economy",
          "Learn Mandarin — the most spoken language in the world",
          "Safe, modern cities with excellent public transportation",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Types of Programs Available",
      },
      {
        type: "paragraph",
        text: "Chinese universities offer programs at Bachelor's (4 years), Master's (2-3 years), and PhD (3-4 years) levels. Many universities now offer English-taught programs in Medicine, Engineering, Business, Computer Science, and International Relations, so you don't need to know Chinese to apply.",
      },
      {
        type: "heading",
        level: 3,
        text: "Popular Fields of Study",
      },
      {
        type: "list",
        items: [
          "MBBS (Medicine) — recognized by WHO and medical councils worldwide",
          "Engineering (Civil, Mechanical, Electrical, Computer Science)",
          "Business and MBA programs (especially at CEIBS, CKGSB, Tsinghua SEM)",
          "Chinese Language and Culture programs",
          "International Trade and Economics",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Scholarship Opportunities",
      },
      {
        type: "paragraph",
        text: "There are multiple scholarship tiers available to international students. The Chinese Government Scholarship (CSC) is the most prestigious, covering full tuition, accommodation, a monthly living stipend (¥3,000-3,500), and comprehensive medical insurance.",
      },
      {
        type: "tip",
        text: "Apply for scholarships 6-8 months before the intake. Deadlines for CSC scholarships are typically January-April for September intake. Working with an experienced agency like 86 Connect significantly increases your chances of scholarship success.",
      },
      {
        type: "heading",
        level: 2,
        text: "Application Timeline",
      },
      {
        type: "list",
        items: [
          "6-12 months before: Research universities and programs, prepare documents",
          "6-8 months before: Submit applications and scholarship applications",
          "3-4 months before: Receive admission decisions and JW202 form",
          "2-3 months before: Apply for student visa (X1)",
          "1 month before: Book flights, arrange airport pickup",
          "Arrival: Register at university, apply for residence permit",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Ready to Start Your Journey?",
      },
      {
        type: "paragraph",
        text: "The application process can feel overwhelming, but you don't have to navigate it alone. Our education consultants have helped thousands of students successfully apply to Chinese universities. Fill out our free assessment form to get personalized recommendations.",
      },
    ],
  },
  {
    slug: "how-to-source-products-from-china",
    title: "How to Source Products from China: A Step-by-Step Guide",
    excerpt:
      "The complete playbook for finding reliable suppliers, negotiating prices, ensuring quality, and shipping products worldwide.",
    category: "Product Sourcing",
    date: "June 15, 2026",
    readTime: "10 min read",
    author: "86 Connect Sourcing Team",
    tags: ["sourcing", "suppliers", "quality control", "shipping", "import"],
    content: [
      {
        type: "paragraph",
        text: "China remains the world's manufacturing powerhouse, producing everything from consumer electronics to industrial machinery. However, sourcing from China successfully requires knowledge, relationships, and rigorous quality control. This guide walks you through the entire process.",
      },
      {
        type: "heading",
        level: 2,
        text: "Step 1: Define Your Product Requirements",
      },
      {
        type: "paragraph",
        text: "Before contacting any supplier, be crystal clear about your specifications: materials, dimensions, certifications, packaging requirements, target price, and order quantity. Vague requirements lead to miscommunication and quality issues.",
      },
      {
        type: "tip",
        text: "Create a detailed product specification sheet with photos, technical drawings, and reference samples. Suppliers who ask clarifying questions are usually more reliable than those who immediately say 'yes, we can do that.'",
      },
      {
        type: "heading",
        level: 2,
        text: "Step 2: Find Verified Suppliers",
      },
      {
        type: "list",
        items: [
          "Alibaba.com and Made-in-China.com for initial supplier discovery",
          "Trade shows like Canton Fair and Yiwu International Commodities Fair",
          "Factory audits and on-the-ground verification (critical for large orders)",
          "Use a local sourcing agent who understands Chinese business culture",
          "Always verify business licenses, ISO certifications, and export experience",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Step 3: Request Samples Before Bulk Orders",
      },
      {
        type: "paragraph",
        text: "Never place a bulk order without first approving a production sample. Expect to pay for samples and shipping — this is normal and shows you are a serious buyer. Test the sample thoroughly for quality, functionality, and durability.",
      },
      {
        type: "heading",
        level: 2,
        text: "Step 4: Negotiate Terms and Pricing",
      },
      {
        type: "paragraph",
        text: "Chinese suppliers expect negotiation, but don't squeeze prices unrealistically — quality always suffers if the margin is too thin. Negotiate payment terms (standard is 30% deposit, 70% before shipment), production lead times, and quality standards in writing.",
      },
      {
        type: "heading",
        level: 2,
        text: "Step 5: Quality Control is Non-Negotiable",
      },
      {
        type: "list",
        items: [
          "Pre-production inspection: Verify raw materials and first articles",
          "During-production inspection (DUPRO): Check at 20-30% completion",
          "Pre-shipment inspection (PSI): Check random samples when 80%+ is packed",
          "Container loading check: Ensure correct quantities and proper loading",
          "Third-party inspection (SGS, BV, Intertek) for high-value orders",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Step 6: Shipping and Logistics",
      },
      {
        type: "paragraph",
        text: "Choose your shipping method based on urgency and volume: Express courier (3-7 days, expensive), air freight (5-10 days), or sea freight (20-45 days, most economical). Consider customs duties, import taxes, and Incoterms (FOB, CIF, DDP) when calculating total landed cost.",
      },
    ],
  },
  {
    slug: "chinese-government-scholarship-csc",
    title: "How to Win the Chinese Government Scholarship (CSC) in 2026",
    excerpt:
      "Insider tips and strategies to maximize your chances of getting a fully-funded CSC scholarship.",
    category: "Study in China",
    date: "June 10, 2026",
    readTime: "8 min read",
    author: "86 Connect Education Team",
    tags: ["CSC scholarship", "full scholarship", "study in China", "application tips"],
    content: [
      {
        type: "paragraph",
        text: "The Chinese Government Scholarship (CSC) is one of the most generous fully-funded scholarships available to international students, covering tuition, accommodation, living stipend, and medical insurance. Competition is fierce — here's how to stand out.",
      },
      {
        type: "heading",
        level: 2,
        text: "Understand the CSC Scholarship Types",
      },
      {
        type: "list",
        items: [
          "Type A: Bilateral programs through Chinese embassies in your home country",
          "Type B: University programs — apply directly to Chinese universities",
          "Type C: Regional programs for specific regions (EU, ASEAN, Africa, etc.)",
          "Great Wall Program: For developing countries via UNESCO",
        ],
      },
      {
        type: "tip",
        text: "Type B (university program) generally has higher acceptance rates than Type A (embassy channel), but embassy channels sometimes have more slots. We recommend applying through multiple channels simultaneously.",
      },
      {
        type: "heading",
        level: 2,
        text: "Build a Strong Application",
      },
      {
        type: "paragraph",
        text: "CSC review panels look for academic excellence, clear study plans, and alignment between your background and the chosen program. Your personal statement (study plan) is the most important document — make it compelling, specific, and tied to China's development priorities.",
      },
      {
        type: "heading",
        level: 2,
        text: "Key Documents You Need",
      },
      {
        type: "list",
        items: [
          "Notarized highest diploma and academic transcripts",
          "Study plan or research proposal (minimum 800 words)",
          "Two recommendation letters from professors",
          "HSK certificate (for Chinese-taught programs) or IELTS/TOEFL (English-taught)",
          "Foreigner Physical Examination Form (filled by official doctor)",
          "Passport copy and passport-sized photos",
          "Acceptance letter from a professor (pre-admission notice dramatically increases chances)",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Common Mistakes to Avoid",
      },
      {
        type: "list",
        items: [
          "Applying to too many universities (2-3 is optimal)",
          "Generic study plan not tailored to each university",
          "Missing application deadlines (varies by university, typically Jan-Apr)",
          "Not contacting potential supervisors before applying",
          "Submitting documents in languages other than Chinese/English without translation",
        ],
      },
    ],
  },
  {
    slug: "alibaba-vs-1688-supplier-sourcing",
    title: "Alibaba vs 1688: Which Platform is Better for Sourcing?",
    excerpt:
      "Understanding the differences between Alibaba (international) and 1688 (domestic Chinese) for product sourcing.",
    category: "Product Sourcing",
    date: "June 5, 2026",
    readTime: "6 min read",
    author: "86 Connect Sourcing Team",
    tags: ["Alibaba", "1688", "supplier platforms", "B2B", "pricing"],
    content: [
      {
        type: "paragraph",
        text: "When sourcing from China, two platforms dominate: Alibaba.com for international buyers and 1688.com for China's domestic B2B market. Understanding the differences can save you 20-40% on product costs.",
      },
      {
        type: "heading",
        level: 2,
        text: "Alibaba.com (International)",
      },
      {
        type: "list",
        items: [
          "English-language interface, designed for export",
          "Suppliers are experienced in international trade",
          "Trade Assurance protection for orders",
          "Higher prices (suppliers build in margins for foreign buyers)",
          "Higher MOQs (usually 500+ units)",
          "Accepts T/T, L/C, credit cards, Western Union",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "1688.com (Domestic Chinese)",
      },
      {
        type: "list",
        items: [
          "Chinese-language only, designed for domestic Chinese trade",
          "Factory-direct prices, often 20-40% cheaper than Alibaba",
          "Lower MOQs (many items available at 1-10 units)",
          "Suppliers may have no export experience or English support",
          "Payment in RMB via Alipay/bank transfer only",
          "Direct access to factories and trading companies alike",
        ],
      },
      {
        type: "tip",
        text: "If you have a Chinese-speaking agent or partner, 1688.com offers significantly better pricing for most products. We routinely save clients 30%+ by sourcing through 1688 with verified suppliers.",
      },
      {
        type: "heading",
        level: 2,
        text: "Our Recommendation",
      },
      {
        type: "paragraph",
        text: "For first-time importers with small orders, start with Alibaba.com for ease of use and buyer protection. As your volume grows, work with a local sourcing agent to access 1688.com, factory direct prices, and negotiate better terms. The best strategy combines both platforms: use Alibaba for initial product research and price benchmarks, then find the same factories on 1688 for better pricing.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
