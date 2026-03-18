// Types for Government Resolutions
export interface GovernmentResolution {
  id: string;
  title: string;
  titleEn?: string;
  department: string;
  departmentEn?: string;
  date: string;
  pdfUrl: string;
  summary: string;
  summaryEn?: string;
  language: 'mr' | 'en';
  category: string;
  tags: string[];
}

// Mock data for Maharashtra Government Resolutions
const mockResolutions: GovernmentResolution[] = [
  // Environment
  {
    id: 'GR-2024-001',
    title: 'पर्यावरण संवर्धन आणि वृक्षारोपण मोहीम - २०२४',
    department: 'पर्यावरण विभाग',
    date: '2024-12-15',
    pdfUrl: 'https://www.maharashtra.gov.in/Site/Upload/GR/Environment_Tree_Plantation_2024.pdf',
    summary: 'राज्यातील सर्व शाळा आणि महाविद्यालयांमध्ये वृक्षारोपण मोहीम राबविण्याबाबत शासन निर्णय. प्रत्येक शैक्षणिक संस्थेने किमान १०० झाडे लावणे अनिवार्य.',
    language: 'mr',
    category: 'Environment',
    tags: ['tree plantation', 'schools', 'environment']
  },
  {
    id: 'GR-2024-112',
    title: 'प्लास्टिक प्रतिबंध आणि पर्यायी व्यवस्था',
    department: 'पर्यावरण विभाग',
    date: '2024-09-18',
    pdfUrl: 'https://www.maharashtra.gov.in/Site/Upload/GR/Plastic_Ban_2024.pdf',
    summary: 'राज्यात सिंगल यूज प्लास्टिकवर पूर्ण बंदी. पर्यायी उत्पादनांसाठी प्रोत्साहन.',
    language: 'mr',
    category: 'Environment',
    tags: ['plastic ban', 'environment', 'sustainability']
  },

  // Water
  {
    id: 'GR-2024-045',
    title: 'जलसंधारण आणि पाणी व्यवस्थापन धोरण',
    department: 'जलसंपदा विभाग',
    date: '2024-11-20',
    pdfUrl: 'https://www.maharashtra.gov.in/Site/Upload/GR/Water_Conservation_2024.pdf',
    summary: 'राज्यातील जलसंधारण प्रकल्पांसाठी नवीन धोरण जाहीर. शेतकरी आणि स्थानिक संस्थांना अनुदान.',
    language: 'mr',
    category: 'Water',
    tags: ['water conservation', 'irrigation', 'farmers']
  },

  // Education
  {
    id: 'GR-2024-089',
    title: 'शालेय पर्यावरण शिक्षण अभ्यासक्रम',
    department: 'शिक्षण विभाग',
    date: '2024-10-05',
    pdfUrl: 'https://www.maharashtra.gov.in/Site/Upload/GR/Environmental_Education_2024.pdf',
    summary: 'इयत्ता १ ली ते १२ वी पर्यंत पर्यावरण शिक्षण अनिवार्य करण्यात आले. नवीन अभ्यासक्रम लागू.',
    language: 'mr',
    category: 'Education',
    tags: ['environmental education', 'school curriculum', 'mandatory']
  },

  // Wildlife
  {
    id: 'GR-2024-156',
    title: 'वन्यजीव संरक्षण आणि अभयारण्य विकास',
    department: 'वन विभाग',
    date: '2024-08-22',
    pdfUrl: 'https://www.maharashtra.gov.in/Site/Upload/GR/Wildlife_Protection_2024.pdf',
    summary: 'राज्यातील अभयारण्यांमध्ये पर्यटन वाढविण्यासाठी नवीन योजना. स्थानिक समुदायांना रोजगार.',
    language: 'mr',
    category: 'Wildlife',
    tags: ['wildlife', 'sanctuary', 'eco-tourism']
  },

  // Agriculture
  {
    id: 'GR-2024-078',
    title: 'शेतकरी अपघात विमा योजना - २०२४',
    department: 'कृषी विभाग',
    date: '2024-07-12',
    pdfUrl: 'https://www.maharashtra.gov.in/Site/Upload/GR/Farmer_Insurance_2024.pdf',
    summary: 'राज्यातील शेतकऱ्यांसाठी अपघात विमा योजना लागू. वार्षिक १०० रुपये प्रीमियमवर २ लाख रुपये विमा संरक्षण.',
    language: 'mr',
    category: 'Agriculture',
    tags: ['farmers', 'insurance', 'scheme']
  },
  {
    id: 'GR-2024-079',
    title: 'सेंद्रिय शेती प्रोत्साहन योजना',
    department: 'कृषी विभाग',
    date: '2024-06-30',
    pdfUrl: 'https://www.maharashtra.gov.in/Site/Upload/GR/Organic_Farming_2024.pdf',
    summary: 'सेंद्रिय शेती करणाऱ्या शेतकऱ्यांना प्रति हेक्टर १५,००० रुपये अनुदान. प्रमाणपत्रासाठी मोफत मदत.',
    language: 'mr',
    category: 'Agriculture',
    tags: ['organic farming', 'subsidy', 'farmers']
  },
  {
    id: 'GR-2024-080',
    title: 'कृषी पंपांसाठी सौरऊर्जा अनुदान',
    department: 'कृषी विभाग',
    date: '2024-05-15',
    pdfUrl: 'https://www.maharashtra.gov.in/Site/Upload/GR/Solar_Pumps_2024.pdf',
    summary: 'शेतकऱ्यांना सौरऊर्जेवर चालणाऱ्या पंपांसाठी ५०% अनुदान. विजेच्या खर्चात बचत.',
    language: 'mr',
    category: 'Agriculture',
    tags: ['solar pumps', 'subsidy', 'renewable energy']
  },

  // Health
  {
    id: 'GR-2024-201',
    title: 'आरोग्य विभागामार्फत मोफत तपासणी शिबिरे',
    department: 'आरोग्य विभाग',
    date: '2024-11-05',
    pdfUrl: 'https://www.maharashtra.gov.in/Site/Upload/GR/Health_Camps_2024.pdf',
    summary: 'राज्यातील सर्व ग्रामपंचायत स्तरावर मोफत आरोग्य तपासणी शिबिरे. मधुमेह, रक्तदाब तपासणी मोफत.',
    language: 'mr',
    category: 'Health',
    tags: ['health camp', 'free checkup', 'rural health']
  },
  {
    id: 'GR-2024-202',
    title: 'आयुष्मान भारत योजनेचा विस्तार',
    department: 'आरोग्य विभाग',
    date: '2024-10-10',
    pdfUrl: 'https://www.maharashtra.gov.in/Site/Upload/GR/Ayushman_Bharat_2024.pdf',
    summary: 'आयुष्मान भारत योजनेंतर्गत आता ५ लाखांपर्यंत उपचाराचा लाभ. सर्व जिल्ह्यांमध्ये लागू.',
    language: 'mr',
    category: 'Health',
    tags: ['health insurance', 'ayushman bharat', 'medical']
  },
  {
    id: 'GR-2024-203',
    title: 'जिल्हा रुग्णालयांमध्ये नवीन वैद्यकीय उपकरणे',
    department: 'आरोग्य विभाग',
    date: '2024-09-22',
    pdfUrl: 'https://www.maharashtra.gov.in/Site/Upload/GR/Medical_Equipment_2024.pdf',
    summary: 'सर्व जिल्हा रुग्णालयांमध्ये अत्याधुनिक वैद्यकीय उपकरणे बसविण्यास मान्यता. सीटी स्कॅन, अल्ट्रासाऊंड मशीन.',
    language: 'mr',
    category: 'Health',
    tags: ['medical equipment', 'hospitals', 'healthcare']
  },

  // Infrastructure
  {
    id: 'GR-2024-301',
    title: 'ग्रामीण रस्ते विकास योजना',
    department: 'सार्वजनिक बांधकाम विभाग',
    date: '2024-12-01',
    pdfUrl: 'https://www.maharashtra.gov.in/Site/Upload/GR/Rural_Roads_2024.pdf',
    summary: 'ग्रामीण भागातील कच्च्या रस्त्यांचे डांबरीकरण. ५०० कोटी रुपये निधी मंजूर.',
    language: 'mr',
    category: 'Infrastructure',
    tags: ['rural roads', 'development', 'construction']
  },
  {
    id: 'GR-2024-302',
    title: 'शहरी भागात स्मार्ट वाहतूक व्यवस्था',
    department: 'शहर विकास विभाग',
    date: '2024-11-15',
    pdfUrl: 'https://www.maharashtra.gov.in/Site/Upload/GR/Smart_Traffic_2024.pdf',
    summary: 'प्रमुख शहरांमध्ये स्मार्ट ट्रॅफिक सिस्टम बसविण्यास मान्यता. सिग्नल, सीसीटीव्ही कॅमेरे.',
    language: 'mr',
    category: 'Infrastructure',
    tags: ['smart traffic', 'city development', 'surveillance']
  },
  {
    id: 'GR-2024-303',
    title: 'पूल बांधणी आणि दुरुस्ती प्रकल्प',
    department: 'सार्वजनिक बांधकाम विभाग',
    date: '2024-10-28',
    pdfUrl: 'https://www.maharashtra.gov.in/Site/Upload/GR/Bridge_Construction_2024.pdf',
    summary: 'राज्यातील ५० जीर्ण पुलांची दुरुस्ती आणि २० नवीन पूल बांधणी. ३०० कोटी रुपये निधी.',
    language: 'mr',
    category: 'Infrastructure',
    tags: ['bridges', 'construction', 'maintenance']
  }
];

// Mock translation service
const translateToEnglish = async (text: string, sourceLang: 'mr' = 'mr'): Promise<string> => {
  const mockTranslations: Record<string, string> = {
    // Environment
    'पर्यावरण संवर्धन आणि वृक्षारोपण मोहीम - २०२४': 'Environmental Conservation and Tree Plantation Campaign - 2024',
    'पर्यावरण विभाग': 'Environment Department',
    'राज्यातील सर्व शाळा आणि महाविद्यालयांमध्ये वृक्षारोपण मोहीम राबविण्याबाबत शासन निर्णय. प्रत्येक शैक्षणिक संस्थेने किमान १०० झाडे लावणे अनिवार्य.': 'Government decision regarding tree plantation campaign in all schools and colleges across the state. Every educational institution must plant at least 100 trees.',
    
    // Water
    'जलसंधारण आणि पाणी व्यवस्थापन धोरण': 'Water Conservation and Management Policy',
    'जलसंपदा विभाग': 'Water Resources Department',
    'राज्यातील जलसंधारण प्रकल्पांसाठी नवीन धोरण जाहीर. शेतकरी आणि स्थानिक संस्थांना अनुदान.': 'New policy announced for water conservation projects in the state. Subsidies for farmers and local organizations.',
    
    // Education
    'शालेय पर्यावरण शिक्षण अभ्यासक्रम': 'School Environmental Education Curriculum',
    'शिक्षण विभाग': 'Education Department',
    'इयत्ता १ ली ते १२ वी पर्यंत पर्यावरण शिक्षण अनिवार्य करण्यात आले. नवीन अभ्यासक्रम लागू.': 'Environmental education made mandatory from Grade 1 to 12. New curriculum implemented.',
    
    // Plastic Ban
    'प्लास्टिक प्रतिबंध आणि पर्यायी व्यवस्था': 'Plastic Ban and Alternative Arrangements',
    'राज्यात सिंगल यूज प्लास्टिकवर पूर्ण बंदी. पर्यायी उत्पादनांसाठी प्रोत्साहन.': 'Complete ban on single-use plastic in the state. Incentives for alternative products.',
    
    // Wildlife
    'वन्यजीव संरक्षण आणि अभयारण्य विकास': 'Wildlife Protection and Sanctuary Development',
    'वन विभाग': 'Forest Department',
    'राज्यातील अभयारण्यांमध्ये पर्यटन वाढविण्यासाठी नवीन योजना. स्थानिक समुदायांना रोजगार.': 'New scheme to increase tourism in state sanctuaries. Employment for local communities.',
    
    // Agriculture
    'शेतकरी अपघात विमा योजना - २०२४': 'Farmer Accident Insurance Scheme - 2024',
    'कृषी विभाग': 'Agriculture Department',
    'राज्यातील शेतकऱ्यांसाठी अपघात विमा योजना लागू. वार्षिक १०० रुपये प्रीमियमवर २ लाख रुपये विमा संरक्षण.': 'Accident insurance scheme implemented for farmers in the state. Rs. 2 lakh insurance coverage for Rs. 100 annual premium.',
    'सेंद्रिय शेती प्रोत्साहन योजना': 'Organic Farming Promotion Scheme',
    'सेंद्रिय शेती करणाऱ्या शेतकऱ्यांना प्रति हेक्टर १५,००० रुपये अनुदान. प्रमाणपत्रासाठी मोफत मदत.': 'Rs. 15,000 per hectare subsidy for farmers practicing organic farming. Free assistance for certification.',
    'कृषी पंपांसाठी सौरऊर्जा अनुदान': 'Solar Energy Subsidy for Agricultural Pumps',
    'शेतकऱ्यांना सौरऊर्जेवर चालणाऱ्या पंपांसाठी ५०% अनुदान. विजेच्या खर्चात बचत.': '50% subsidy for solar-powered pumps to farmers. Save on electricity costs.',
    
    // Health
    'आरोग्य विभागामार्फत मोफत तपासणी शिबिरे': 'Free Health Checkup Camps by Health Department',
    'आरोग्य विभाग': 'Health Department',
    'राज्यातील सर्व ग्रामपंचायत स्तरावर मोफत आरोग्य तपासणी शिबिरे. मधुमेह, रक्तदाब तपासणी मोफत.': 'Free health checkup camps at all gram panchayat levels in the state. Free diabetes and blood pressure checkups.',
    'आयुष्मान भारत योजनेचा विस्तार': 'Expansion of Ayushman Bharat Scheme',
    'आयुष्मान भारत योजनेंतर्गत आता ५ लाखांपर्यंत उपचाराचा लाभ. सर्व जिल्ह्यांमध्ये लागू.': 'Now up to Rs. 5 lakh treatment benefit under Ayushman Bharat scheme. Applicable in all districts.',
    'जिल्हा रुग्णालयांमध्ये नवीन वैद्यकीय उपकरणे': 'New Medical Equipment in District Hospitals',
    'सर्व जिल्हा रुग्णालयांमध्ये अत्याधुनिक वैद्यकीय उपकरणे बसविण्यास मान्यता. सीटी स्कॅन, अल्ट्रासाऊंड मशीन.': 'Approval for installing modern medical equipment in all district hospitals. CT scans, ultrasound machines.',
    
    // Infrastructure
    'ग्रामीण रस्ते विकास योजना': 'Rural Road Development Scheme',
    'सार्वजनिक बांधकाम विभाग': 'Public Works Department',
    'ग्रामीण भागातील कच्च्या रस्त्यांचे डांबरीकरण. ५०० कोटी रुपये निधी मंजूर.': 'Asphalting of unpaved roads in rural areas. Rs. 500 crore fund approved.',
    'शहरी भागात स्मार्ट वाहतूक व्यवस्था': 'Smart Traffic System in Urban Areas',
    'शहर विकास विभाग': 'Urban Development Department',
    'प्रमुख शहरांमध्ये स्मार्ट ट्रॅफिक सिस्टम बसविण्यास मान्यता. सिग्नल, सीसीटीव्ही कॅमेरे.': 'Approval for installing smart traffic system in major cities. Signals, CCTV cameras.',
    'पूल बांधणी आणि दुरुस्ती प्रकल्प': 'Bridge Construction and Repair Project',
    'राज्यातील ५० जीर्ण पुलांची दुरुस्ती आणि २० नवीन पूल बांधणी. ३०० कोटी रुपये निधी.': 'Repair of 50 dilapidated bridges and construction of 20 new bridges in the state. Rs. 300 crore fund.'
  };

  await new Promise(resolve => setTimeout(resolve, 500));
  return mockTranslations[text] || `[Translated] ${text}`;
};

// Service functions
export const GRService = {
  async getAllResolutions(): Promise<GovernmentResolution[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [...mockResolutions];
  },

  async getResolutionById(id: string): Promise<GovernmentResolution | undefined> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockResolutions.find(r => r.id === id);
  },

  async getResolutionsByDepartment(department: string): Promise<GovernmentResolution[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockResolutions.filter(r => r.department.includes(department));
  },

  async translateResolution(resolution: GovernmentResolution): Promise<GovernmentResolution> {
    if (resolution.language === 'en') return resolution;

    const translatedResolution = { ...resolution };
    translatedResolution.titleEn = await translateToEnglish(resolution.title);
    translatedResolution.departmentEn = await translateToEnglish(resolution.department);
    translatedResolution.summaryEn = await translateToEnglish(resolution.summary);
    
    return translatedResolution;
  },

  async batchTranslateResolutions(resolutions: GovernmentResolution[]): Promise<GovernmentResolution[]> {
    const translated = await Promise.all(
      resolutions.map(r => this.translateResolution(r))
    );
    return translated;
  },

  searchResolutions(query: string): GovernmentResolution[] {
    const lowercaseQuery = query.toLowerCase();
    return mockResolutions.filter(r => 
      r.title.toLowerCase().includes(lowercaseQuery) ||
      r.department.toLowerCase().includes(lowercaseQuery) ||
      r.summary.toLowerCase().includes(lowercaseQuery) ||
      r.tags.some(tag => tag.includes(lowercaseQuery))
    );
  },

  filterByCategory(category: string): GovernmentResolution[] {
    if (category === 'all') return mockResolutions;
    return mockResolutions.filter(r => 
      r.category.toLowerCase() === category.toLowerCase()
    );
  }
};

export const GR_CATEGORIES = [
  'Environment',
  'Water',
  'Education',
  'Wildlife',
  'Agriculture',
  'Health',
  'Infrastructure'
];