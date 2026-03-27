'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Check local storage for saved language, default to 'en'
    const savedLang = localStorage.getItem('site_language');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    localStorage.setItem('site_language', newLang);
  };

  useEffect(() => {
    // Apply RTL and Lang attribute on language change
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    if (language === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [language]);

  const value = {
    language,
    toggleLanguage,
    t: (key) => translations[language][key] || key,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// --- Translations ---
export const translations = {
  en: {
    // Navbar
    home: 'Home',
    council: 'Council',
    history: 'History',
    startCouncil: 'Start Council',
    aiCouncil: 'AI Council',

    // Dashboard
    dashboardTitle: 'The Council Awaits',
    dashboardSubtitle: 'Submit your idea and watch five AI experts refine it into actionable brilliance.',
    inputLabel: "💡 What's your idea?",
    inputPlaceholder: 'e.g., A mobile app that helps people learn cooking through AR...',
    buttonConvene: 'Convene Council',
    buttonInSession: 'Council in Session...',
    sessionComplete: '✅ Council session complete',
    copySummary: 'Copy Summary',
    exportTxt: 'Export .txt',
    exportPdf: 'Export PDF',
    newSession: 'New Session',
    chamberReady: 'The council chamber is ready',
    chamberDesc: 'Enter an idea above and convene the council. Five AI agents will analyze, enhance, critique, and synthesize your concept.',
    copied: 'Copied!',

    // Hero
    badgeText: 'Powered by Multi-Agent AI',
    heroTitle1: 'Five Minds.',
    heroTitle2: 'One Vision.',
    heroSubtitle: 'Submit any idea and watch five AI agents debate, enhance, and refine it into actionable brilliance — like having a board of advisors on demand.',
    startYourCouncil: 'Start Your Council',
    learnMore: 'Learn More ↓',

    // Features
    whyAiCouncil: 'Why AI Council?',
    whySubtitle: 'Stop getting one-dimensional AI responses. Get a full spectrum of expert perspectives.',
    feat1Title: 'Multi-Agent Intelligence',
    feat1Desc: 'Five specialized AI agents analyze your idea from every angle simultaneously.',
    feat2Title: 'Real-Time Discussion',
    feat2Desc: 'Watch agents debate, enhance, and refine your concept in a live council format.',
    feat3Title: 'Actionable Output',
    feat3Desc: 'Get a synthesized verdict with clear next steps, not just raw suggestions.',
    feat4Title: 'Business-Ready',
    feat4Desc: 'Includes market analysis, risk assessment, and go-to-market strategy.',
    feat5Title: 'Save & Export',
    feat5Desc: 'Keep your sessions, revisit them anytime, and export as PDF or text.',
    feat6Title: 'Instant Results',
    feat6Desc: 'No setup required. Submit your idea and get a full council review in seconds.',

    // How It Works
    howItWorks: 'How It Works',
    step1Title: 'Submit Your Idea',
    step1Desc: 'Type in any concept, business idea, or creative challenge.',
    step2Title: 'Agents Discuss',
    step2Desc: 'Five AI agents analyze your idea from different expert perspectives.',
    step3Title: 'Chairman Synthesizes',
    step3Desc: 'The Chairman merges all inputs into one actionable final verdict.',
    step4Title: 'Export & Execute',
    step4Desc: 'Copy, export as PDF, or save your council session for later.',

    // Pricing
    simplePricing: 'Simple Pricing',
    pricingSubtitle: 'Start for free. Upgrade when you need more.',
    freePlan: 'Free',
    proPlan: 'Pro',
    entPlan: 'Enterprise',
    forever: 'forever',
    perMonth: '/month',
    getStarted: 'Get Started',
    startProTrial: 'Start Pro Trial',
    contactSales: 'Contact Sales',
    mostPopular: 'MOST POPULAR',
    freeFeat1: '3 councils per day',
    freeFeat2: '5 core agents',
    freeFeat3: 'Copy results',
    freeFeat4: 'Session history',
    proFeat1: 'Unlimited councils',
    proFeat2: 'Custom agent roles',
    proFeat3: 'PDF & text export',
    proFeat4: 'Priority processing',
    proFeat5: 'Advanced templates',
    proFeat6: 'API access',
    entFeat1: 'Everything in Pro',
    entFeat2: 'Team workspaces',
    entFeat3: 'Shared council history',
    entFeat4: 'SSO & admin controls',
    entFeat5: 'Dedicated support',
    entFeat6: 'Custom integrations',

    // Agents
    nova: 'Nova',
    pixel: 'Pixel',
    cipher: 'Cipher',
    vector: 'Vector',
    apex: 'Apex',
    novaRole: 'Idea Generator',
    pixelRole: 'Creative Enhancer',
    cipherRole: 'Critical Analyst',
    vectorRole: 'Business Strategist',
    apexRole: 'Chairman',

    // Footer
    footerCopy: '© 2026 AI Council. Five Minds. One Vision.',
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact',
  },
  ar: {
    // Navbar
    home: 'الرئيسية',
    council: 'المجلس',
    history: 'السجل',
    startCouncil: 'ابدأ المجلس',
    aiCouncil: 'مجلس الذكاء الاصطناعي',

    // Dashboard
    dashboardTitle: 'المجلس في انتظارك',
    dashboardSubtitle: 'أرسل فكرتك وشاهد خمسة خبراء من الذكاء الاصطناعي يصيغونها في شكل خطة عمل عبقرية.',
    inputLabel: '💡 ما هي فكرتك؟',
    inputPlaceholder: 'مثلاً: تطبيق هاتف يساعد الناس على تعلم الطبخ...',
    buttonConvene: 'عقد المجلس',
    buttonInSession: 'المجلس في انعقاد...',
    sessionComplete: '✅ اكتملت جلسة المجلس',
    copySummary: 'نسخ الملخص',
    exportTxt: 'تصدير .txt',
    exportPdf: 'تصدير PDF',
    newSession: 'جلسة جديدة',
    chamberReady: 'قاعة المجلس جاهزة',
    chamberDesc: 'أدخل فكرة أعلاه لعقد المجلس. سيقوم خمسة وكلاء ذكاء اصطناعي بتحليل فكرتك وتحسينها ونقدها وتجميعها.',
    copied: 'تم النسخ!',

    // Hero
    badgeText: 'مدعوم بالذكاء الاصطناعي متعدد الوكلاء',
    heroTitle1: 'خمس عقول.',
    heroTitle2: 'رؤية واحدة.',
    heroSubtitle: 'اطرح أي فكرة وشاهد خمسة وكلاء ذكاء اصطناعي يناقشونها، يعززونها، ويصقلونها حتى تصبح تألقاً قابلاً للتنفيذ — كأن لديك مجلس مستشارين تحت الطلب.',
    startYourCouncil: 'ابدأ مجلسك',
    learnMore: 'اكتشف المزيد ↓',

    // Features
    whyAiCouncil: 'لماذا مجلس الذكاء الاصطناعي؟',
    whySubtitle: 'توقف عن الحصول على إجابات سطحية. احصل على طيف كامل من وجهات نظر الخبراء.',
    feat1Title: 'ذكاء الذكاء الاصطناعي متعدد الوكلاء',
    feat1Desc: 'خمسة وكلاء ذكاء اصطناعي متخصصين يحللون فكرتك من جميع الزوايا في نفس الوقت.',
    feat2Title: 'نقاش في الوقت الفعلي',
    feat2Desc: 'شاهد الوكلاء وهم يناقشون، يعززون، ويصقلون مفهومك في تنسيق مجلس مباشر.',
    feat3Title: 'مخرجات قابلة للتنفيذ',
    feat3Desc: 'احصل على حكم تركيبي مع خطوات تالية واضحة، ولا تقتصر على اقتراحات خام.',
    feat4Title: 'جاهز للأعمال',
    feat4Desc: 'يتضمن تحليل السوق، تقييم المخاطر، واستراتيجية الذهاب إلى السوق.',
    feat5Title: 'حفظ وتصدير',
    feat5Desc: 'احتفظ بجلساتك، استعرضها في أي وقت، وصدرها كملف بي دي اف أو نص.',
    feat6Title: 'نتائج فورية',
    feat6Desc: 'لا يتطلب إعداد. قدم فكرتك واحصل على مراجعة مجلس كاملة في ثوان.',

    // How It Works
    howItWorks: 'كيف يعمل',
    step1Title: 'قدم فكرتك',
    step1Desc: 'اكتب أي مفهوم، فكرة عمل، أو تحدي إبداعي.',
    step2Title: 'مناقشة الوكلاء',
    step2Desc: 'خمسة وكلاء ذكاء اصطناعي يحللون فكرتك من منظور الخبراء المختلفين.',
    step3Title: 'تركيب رئيس المجلس',
    step3Desc: 'يقوم رئيس المجلس بدمج جميع المدخلات في حكم نهائي واحد قابل للتنفيذ.',
    step4Title: 'تصدير وتنفيذ',
    step4Desc: 'انسخ، صدر كملف بي دي اف، أو احفظ جلستك في وقت لاحق.',

    // Pricing
    simplePricing: 'تسعير مبسط',
    pricingSubtitle: 'ابدأ مجانا. ترقية عندما تحتاج المزيد.',
    freePlan: 'مجاني',
    proPlan: 'محترف',
    entPlan: 'للمؤسسات',
    forever: 'مدى الحياة',
    perMonth: '/شهر',
    getStarted: 'ابدأ الآن',
    startProTrial: 'ابدأ التجربة الاحترافية',
    contactSales: 'اتصل بالمبيعات',
    mostPopular: 'الأكثر شيوعا',
    freeFeat1: '3 مجالس في اليوم',
    freeFeat2: '5 وكلاء أساسيين',
    freeFeat3: 'نسخ النتائج',
    freeFeat4: 'تاريخ الجلسة',
    proFeat1: 'مجالس غير محدودة',
    proFeat2: 'أدوار وكلاء مخصصة',
    proFeat3: 'تصدير بي دي اف ونص',
    proFeat4: 'أولوية المعالجة',
    proFeat5: 'قوالب متقدمة',
    proFeat6: 'الوصول إلى واجهة برمجة التطبيقات',
    entFeat1: 'كل شيء في المحترف',
    entFeat2: 'مساحات عمل للفريق',
    entFeat3: 'تاريخ مجلس مشترك',
    entFeat4: 'دخول موحد وتحكم الإدارة',
    entFeat5: 'دعم مخصص',
    entFeat6: 'تكامل مخصص',

    // Agents
    nova: 'نوفا',
    pixel: 'بيكسل',
    cipher: 'سايفر',
    vector: 'فيكتور',
    apex: 'أبيكس',
    novaRole: 'مولد الأفكار',
    pixelRole: 'محسن إبداعي',
    cipherRole: 'محلل نقدي',
    vectorRole: 'خبير استراتيجي',
    apexRole: 'رئيس المجلس',

    // Footer
    footerCopy: '© 2026 مجلس الذكاء الاصطناعي. خمس عقول. رؤية واحدة.',
    privacy: 'الخصوصية',
    terms: 'الشروط',
    contact: 'اتصل بنا',
  }
};
