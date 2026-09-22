import { User, Field, CaseRecord, Hotspot, FieldVisit, AlertItem, MessageItem, KnowledgeDocument, AuditLog } from '../types';

export const SEED_USERS: User[] = [
  // Farmer Demo Account
  {
    id: 'user-farmer-1',
    name: 'Rajesh Patel',
    email: 'farmer@cultivai.demo',
    phone: '+91 98450 12345',
    role: 'FARMER',
    status: 'active',
    location: {
      state: 'Karnataka',
      district: 'Kolar',
      taluk: 'Mulbagal',
      village: 'Avani',
      lat: 13.1367,
      lng: 78.1291,
    },
    createdAt: '2026-01-15T08:00:00Z',
    preferredLanguage: 'en',
  },
  // Additional Farmers
  {
    id: 'user-farmer-2',
    name: 'Basavaraj Gowda',
    email: 'basavaraj.kolar@cultivai.demo',
    phone: '+91 98450 67890',
    role: 'FARMER',
    status: 'active',
    location: { state: 'Karnataka', district: 'Kolar', taluk: 'Srinivaspur', lat: 13.3374, lng: 78.2137 },
    createdAt: '2026-02-01T09:30:00Z',
    preferredLanguage: 'kn',
  },
  {
    id: 'user-farmer-3',
    name: 'Suresh Patil',
    email: 'suresh.belagavi@cultivai.demo',
    phone: '+91 98450 11223',
    role: 'FARMER',
    status: 'active',
    location: { state: 'Karnataka', district: 'Belagavi', taluk: 'Chikkodi', lat: 16.4258, lng: 74.5977 },
    createdAt: '2026-02-10T10:00:00Z',
    preferredLanguage: 'kn',
  },
  {
    id: 'user-farmer-4',
    name: 'Ramesh Reddy',
    email: 'ramesh.chittoor@cultivai.demo',
    phone: '+91 98450 44556',
    role: 'FARMER',
    status: 'active',
    location: { state: 'Andhra Pradesh', district: 'Chittoor', taluk: 'Madanapalle', lat: 13.5560, lng: 78.5010 },
    createdAt: '2026-02-14T11:20:00Z',
    preferredLanguage: 'en',
  },
  {
    id: 'user-farmer-5',
    name: 'Venkatesh Murthy',
    email: 'venkatesh.shimoga@cultivai.demo',
    phone: '+91 98450 77889',
    role: 'FARMER',
    status: 'active',
    location: { state: 'Karnataka', district: 'Shivamogga', taluk: 'Bhadravati', lat: 13.8409, lng: 75.7032 },
    createdAt: '2026-02-18T14:10:00Z',
    preferredLanguage: 'kn',
  },
  {
    id: 'user-farmer-6',
    name: 'Anand Kumar Verma',
    email: 'anand.nashik@cultivai.demo',
    phone: '+91 98450 99001',
    role: 'FARMER',
    status: 'active',
    location: { state: 'Maharashtra', district: 'Nashik', taluk: 'Niphad', lat: 20.0818, lng: 74.1089 },
    createdAt: '2026-02-20T16:00:00Z',
    preferredLanguage: 'hi',
  },
  {
    id: 'user-farmer-7',
    name: 'Sunil Choudhary',
    email: 'sunil.indore@cultivai.demo',
    phone: '+91 98450 22334',
    role: 'FARMER',
    status: 'active',
    location: { state: 'Madhya Pradesh', district: 'Indore', taluk: 'Sanwer', lat: 22.9734, lng: 75.8277 },
    createdAt: '2026-02-25T11:45:00Z',
    preferredLanguage: 'hi',
  },
  {
    id: 'user-farmer-8',
    name: 'Prakash Hegde',
    email: 'prakash.uttarakannada@cultivai.demo',
    phone: '+91 98450 55667',
    role: 'FARMER',
    status: 'active',
    location: { state: 'Karnataka', district: 'Uttara Kannada', taluk: 'Sirsi', lat: 14.6195, lng: 74.8354 },
    createdAt: '2026-03-01T09:00:00Z',
    preferredLanguage: 'kn',
  },
  {
    id: 'user-farmer-9',
    name: 'Dinesh Yadav',
    email: 'dinesh.varanasi@cultivai.demo',
    phone: '+91 98450 88990',
    role: 'FARMER',
    status: 'active',
    location: { state: 'Uttar Pradesh', district: 'Varanasi', taluk: 'Pindra', lat: 25.4851, lng: 82.8524 },
    createdAt: '2026-03-05T13:30:00Z',
    preferredLanguage: 'hi',
  },
  {
    id: 'user-farmer-10',
    name: 'Manjunath Swamy',
    email: 'manjunath.dharwad@cultivai.demo',
    phone: '+91 98450 33445',
    role: 'FARMER',
    status: 'active',
    location: { state: 'Karnataka', district: 'Dharwad', taluk: 'Hubballi', lat: 15.3647, lng: 75.1240 },
    createdAt: '2026-03-08T15:15:00Z',
    preferredLanguage: 'kn',
  },

  // Expert Demo Account
  {
    id: 'user-expert-1',
    name: 'Dr. Sunita Rao, Ph.D.',
    email: 'expert@cultivai.demo',
    phone: '+91 94480 11223',
    role: 'EXPERT',
    status: 'active',
    organization: 'Indian Institute of Horticultural Research (IIHR / ICAR)',
    specialization: 'Vegetable Pathology & Fungal Epidemiology',
    licenseNumber: 'ICAR-PP-2018-8841',
    createdAt: '2025-11-10T10:00:00Z',
    preferredLanguage: 'en',
  },
  {
    id: 'user-expert-2',
    name: 'Dr. Anand Joshi',
    email: 'anand.entomology@cultivai.demo',
    phone: '+91 94480 44556',
    role: 'EXPERT',
    status: 'active',
    organization: 'University of Agricultural Sciences (UAS GKVK, Bengaluru)',
    specialization: 'Agricultural Entomology & Integrated Pest Management',
    licenseNumber: 'UAS-ENT-2019-4210',
    createdAt: '2025-12-01T11:00:00Z',
    preferredLanguage: 'en',
  },
  {
    id: 'user-expert-3',
    name: 'Dr. Meera Nambiar',
    email: 'meera.virology@cultivai.demo',
    phone: '+91 94480 77889',
    role: 'EXPERT',
    status: 'active',
    organization: 'Central Tuber Crops & Horticultural Research Station',
    specialization: 'Plant Virology & Diagnostic Serology',
    licenseNumber: 'CTCRI-VIR-2020-1922',
    createdAt: '2026-01-05T09:30:00Z',
    preferredLanguage: 'en',
  },

  // Officer Demo Account
  {
    id: 'user-officer-1',
    name: 'Ramesh Kumar (ADA)',
    email: 'officer@cultivai.demo',
    phone: '+91 98800 33445',
    role: 'OFFICER',
    status: 'active',
    organization: 'Department of Agriculture, Government of Karnataka',
    specialization: 'Assistant Director of Agriculture (ADA) - Kolar Sub-division',
    licenseNumber: 'GO-AGRI-KA-2021-0941',
    location: { state: 'Karnataka', district: 'Kolar', lat: 13.1367, lng: 78.1291 },
    createdAt: '2025-10-15T08:30:00Z',
    preferredLanguage: 'en',
  },
  {
    id: 'user-officer-2',
    name: 'Dr. Sneha Patil (AO)',
    email: 'sneha.officer@cultivai.demo',
    phone: '+91 98800 66778',
    role: 'OFFICER',
    status: 'active',
    organization: 'State Horticultural Extension Unit, Belagavi Division',
    specialization: 'Agricultural Extension & Epidemic Surveillance Officer',
    licenseNumber: 'GO-AGRI-KA-2022-1205',
    location: { state: 'Karnataka', district: 'Belagavi', lat: 15.8497, lng: 74.4977 },
    createdAt: '2025-11-01T10:00:00Z',
    preferredLanguage: 'en',
  },
  {
    id: 'user-officer-3',
    name: 'Vikram Singh (DAEO)',
    email: 'vikram.officer@cultivai.demo',
    phone: '+91 98800 99001',
    role: 'OFFICER',
    status: 'active',
    organization: 'District Agriculture & Pest Surveillance Office, Nashik Zone',
    specialization: 'District Plant Protection Officer',
    licenseNumber: 'MAHA-AGRI-2020-3341',
    location: { state: 'Maharashtra', district: 'Nashik', lat: 20.0818, lng: 74.1089 },
    createdAt: '2025-12-12T14:20:00Z',
    preferredLanguage: 'en',
  },

  // Admin Demo Account
  {
    id: 'user-admin-1',
    name: 'Ananya Deshmukh',
    email: 'admin@cultivai.demo',
    phone: '+91 99000 88888',
    role: 'ADMIN',
    status: 'active',
    organization: 'CultivAI Global Operations & Data Security',
    specialization: 'Principal Platform Architect & System Administrator',
    createdAt: '2025-09-01T00:00:00Z',
    preferredLanguage: 'en',
  }
];

export const SEED_FIELDS: Field[] = [
  {
    id: 'field-1',
    farmId: 'farm-1',
    farmerId: 'user-farmer-1',
    name: 'Tomato North Block (Plot A)',
    crop: 'Tomato',
    variety: 'Abhinav Hybrid (Seminis)',
    cropStage: 'Flowering & Early Fruiting (Day 48)',
    areaAcres: 2.5,
    sowingDate: '2026-01-20',
    soilCondition: 'Red Sandy Loam, pH 6.8, Organic Carbon 0.62%',
    irrigationType: 'Drip Irrigation with Venturi Fertigation',
    healthStatus: 'Attention Required',
    lat: 13.1412,
    lng: 78.1325,
    lastScannedAt: '2026-09-20T10:30:00Z',
    activeCasesCount: 1,
  },
  {
    id: 'field-2',
    farmId: 'farm-1',
    farmerId: 'user-farmer-1',
    name: 'Chilli South Parcel (Plot B)',
    crop: 'Chilli',
    variety: 'Guntur Sannam (G4)',
    cropStage: 'Vegetative Growth (Day 32)',
    areaAcres: 1.8,
    sowingDate: '2026-02-05',
    soilCondition: 'Medium Black Loam, Good Drainage, pH 7.1',
    irrigationType: 'Drip Irrigation',
    healthStatus: 'Healthy',
    lat: 13.1389,
    lng: 78.1280,
    lastScannedAt: '2026-09-18T16:00:00Z',
    activeCasesCount: 0,
  },
  {
    id: 'field-3',
    farmId: 'farm-1',
    farmerId: 'user-farmer-1',
    name: 'Capsicum Polyhouse Unit 1',
    crop: 'Capsicum / Bell Pepper',
    variety: 'Indra Green',
    cropStage: 'Fruit Setting (Day 55)',
    areaAcres: 0.75,
    sowingDate: '2026-01-10',
    soilCondition: 'Cocopeat & Soil blend, Micro-nutrients fortified',
    irrigationType: 'Automated Micro-Drip & Foggers',
    healthStatus: 'Healthy',
    lat: 13.1395,
    lng: 78.1310,
    lastScannedAt: '2026-09-19T09:15:00Z',
    activeCasesCount: 0,
  }
];

export const SEED_CASES: CaseRecord[] = [
  {
    id: 'CASE-2026-0982',
    farmerId: 'user-farmer-1',
    farmerName: 'Rajesh Patel',
    farmerPhone: '+91 98450 12345',
    fieldId: 'field-1',
    fieldName: 'Tomato North Block (Plot A)',
    crop: 'Tomato',
    variety: 'Abhinav Hybrid',
    cropStage: 'Flowering & Early Fruiting (Day 48)',
    location: {
      district: 'Kolar',
      state: 'Karnataka',
      lat: 13.1412,
      lng: 78.1325,
    },
    symptomsReported: 'Brown target-like concentric rings on lower leaves, slight chlorosis spreading upwards with leaf tips curling.',
    images: [
      {
        id: 'img-case-1',
        url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=1200&q=80',
        uploadedAt: '2026-09-20T10:30:00Z',
        qualityPassed: true,
        qualityDetails: {
          blurScore: 92,
          exposureScore: 89,
          resolution: '3024x4032',
          isPlantDetected: true,
        }
      }
    ],
    aiPrediction: {
      condition: 'Tomato Early Blight',
      scientificName: 'Alternaria solani',
      confidence: 0.88,
      severity: 'Moderate',
      risk: 'HIGH',
      type: 'Fungal Disease',
      observedIndicators: [
        'Concentric brown rings with yellow halo (target-board pattern)',
        'Premature senescence of lower canopy leaves',
        'Early necrotic lesions on leaf margins'
      ],
      riskFactors: [
        'Persistent high relative humidity (>82%) for 4 consecutive mornings',
        'Recent intermittent rain showers followed by warm 27°C afternoon canopy temperatures',
        'Dense lower canopy with restricted airflow'
      ],
      recommendedSteps: [
        'Prune and safely destroy heavily infected lower senescent foliage.',
        'Avoid overhead sprinkler irrigation; maintain drip emitters cleanly beneath root zone.',
        'Apply bio-fungicide Pseudomonas fluorescens (0.5% w/v) or Copper Oxychloride 50 WP (2.5 g/L) if disease spreads.',
        'Monitor neighbor parcels for early spore migration.',
        'Submit case for expert validation and regional advisory tracking.'
      ],
      boundingBoxes: [
        { x: 22, y: 35, width: 34, height: 28, label: 'Alternaria concentric lesion', confidence: 0.91 },
        { x: 60, y: 48, width: 25, height: 32, label: 'Marginal chlorosis', confidence: 0.84 }
      ],
      disclaimer: 'AI-generated preliminary assessment — not a laboratory-confirmed diagnosis. Follow integrated pest management practices.'
    },
    riskAssessment: {
      overallRisk: 'HIGH',
      score: 79,
      factors: {
        diseaseProbabilityScore: 88,
        weatherSuitabilityScore: 82,
        cropSusceptibilityScore: 75,
        regionalPressureScore: 68,
      },
      explanation: 'High humidity (84%) combined with optimal Alternaria spore germination temperatures (26-29°C) and flowering stage susceptibility creates elevated risk of rapid canopy spread across the 2.5 acre block.'
    },
    weatherSnapshot: {
      temperature: 27.5,
      humidity: 84,
      rainProbability: 65,
      rainfallMm: 12.4,
      windSpeedKmh: 9,
      uvIndex: 5,
      conditionDescription: 'Intermittent Light Rain & Humid Overcast',
      forecast: [
        { day: 'Today', tempMax: 28, tempMin: 19, humidity: 84, rainProb: 65, condition: 'Rain', riskCategory: 'High' },
        { day: 'Tomorrow', tempMax: 29, tempMin: 20, humidity: 80, rainProb: 50, condition: 'Scattered Showers', riskCategory: 'High' },
        { day: '+2 Days', tempMax: 30, tempMin: 19, humidity: 76, rainProb: 35, condition: 'Partly Cloudy', riskCategory: 'Moderate' },
        { day: '+3 Days', tempMax: 31, tempMin: 18, humidity: 68, rainProb: 20, condition: 'Sunny Intervals', riskCategory: 'Moderate' },
        { day: '+4 Days', tempMax: 30, tempMin: 18, humidity: 65, rainProb: 15, condition: 'Clear', riskCategory: 'Low' },
        { day: '+5 Days', tempMax: 31, tempMin: 19, humidity: 62, rainProb: 10, condition: 'Clear', riskCategory: 'Low' },
        { day: '+6 Days', tempMax: 32, tempMin: 20, humidity: 60, rainProb: 10, condition: 'Clear', riskCategory: 'Low' }
      ],
      fungalRisk: 'HIGH',
      pestRisk: 'MODERATE',
      riskExplanation: 'Dew duration exceeding 6.5 hours combined with daytime 27°C provides ideal incubation for fungal spore germination.'
    },
    status: 'Under Review',
    priority: 'High',
    followUps: [
      {
        id: 'fu-1',
        date: '2026-09-21T07:30:00Z',
        symptomProgression: 'Slightly Improved',
        farmerNotes: 'Pruned the bottom 3 leaves on rows 1 to 10 as recommended. Applied neem oil spray (3 ml/L) as first barrier.',
        expertFeedback: 'Good initial measure. Awaiting 48-hour follow-up image to verify whether upper leaves show new lesions.'
      }
    ],
    timeline: [
      {
        id: 'tl-1',
        timestamp: '2026-09-20T10:30:00Z',
        actor: 'Rajesh Patel',
        actorRole: 'FARMER',
        action: 'Case Created & Leaf Scanned',
        description: 'Uploaded high-res leaf specimen from Tomato North Block.',
        statusBadge: 'New'
      },
      {
        id: 'tl-2',
        timestamp: '2026-09-20T10:31:00Z',
        actor: 'CultivAI Vision Engine',
        actorRole: 'AI Engine',
        action: 'AI Analysis Completed',
        description: 'Detected Tomato Early Blight (Alternaria solani) with 88% confidence. Risk calculated as HIGH (79/100).',
        statusBadge: 'AI Analysed'
      },
      {
        id: 'tl-3',
        timestamp: '2026-09-20T11:00:00Z',
        actor: 'Rajesh Patel',
        actorRole: 'FARMER',
        action: 'Expert Review Requested',
        description: 'Submitted specimen and field microclimate log to Plant Pathology Verification Queue.',
        statusBadge: 'Under Review'
      }
    ],
    createdAt: '2026-09-20T10:30:00Z',
    updatedAt: '2026-09-21T07:30:00Z',
  },
  {
    id: 'CASE-2026-0975',
    farmerId: 'user-farmer-2',
    farmerName: 'Basavaraj Gowda',
    farmerPhone: '+91 98450 67890',
    fieldId: 'field-b1',
    fieldName: 'Paddy Field Wetland 2',
    crop: 'Rice / Paddy',
    variety: 'BPT 5204 (Sona Masuri)',
    cropStage: 'Tillering Stage (Day 42)',
    location: {
      district: 'Kolar',
      state: 'Karnataka',
      lat: 13.3374,
      lng: 78.2137,
    },
    symptomsReported: 'Spindle shaped lesions on leaf blades with grey centers and brown borders. Leaf drying.',
    images: [
      {
        id: 'img-case-2',
        url: 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&w=1200&q=80',
        uploadedAt: '2026-09-18T09:00:00Z',
        qualityPassed: true,
      }
    ],
    aiPrediction: {
      condition: 'Rice Blast',
      scientificName: 'Magnaporthe oryzae',
      confidence: 0.92,
      severity: 'High',
      risk: 'CRITICAL',
      type: 'Fungal Disease',
      observedIndicators: ['Diamond/spindle lesions with necrotic grey center', 'Leaf tip blighting'],
      riskFactors: ['High nitrogen fertilizer application', 'Frequent night fog and relative humidity >90%'],
      recommendedSteps: ['Avoid excess top-dressing of urea.', 'Maintain balanced water level.', 'Apply Tricyclazole 75 WP under agricultural officer supervision.'],
      disclaimer: 'AI-generated preliminary assessment — follow authorized agronomy protocols.'
    },
    riskAssessment: {
      overallRisk: 'CRITICAL',
      score: 91,
      factors: {
        diseaseProbabilityScore: 92,
        weatherSuitabilityScore: 94,
        cropSusceptibilityScore: 88,
        regionalPressureScore: 89,
      },
      explanation: 'Critical blast outbreak risk across Srinivaspur paddy corridor due to sustained humidity.'
    },
    weatherSnapshot: {
      temperature: 25.0,
      humidity: 92,
      rainProbability: 80,
      rainfallMm: 28.5,
      windSpeedKmh: 12,
      uvIndex: 4,
      conditionDescription: 'Heavy Overcast with Morning Fog',
      forecast: [],
      fungalRisk: 'CRITICAL',
      pestRisk: 'HIGH',
      riskExplanation: 'Sustained leaf wetness >9 hours facilitates rapid spore penetration.'
    },
    status: 'Expert Confirmed',
    priority: 'Emergency',
    expertReview: {
      id: 'rev-0975',
      expertId: 'user-expert-1',
      expertName: 'Dr. Sunita Rao, Ph.D.',
      expertSpecialization: 'Vegetable Pathology & Fungal Epidemiology',
      reviewedAt: '2026-09-18T14:30:00Z',
      action: 'Confirm Diagnosis',
      confirmedCondition: 'Rice Blast (Magnaporthe oryzae) — Leaf Blast Stage',
      severity: 'High',
      confidence: 0.94,
      advisoryText: 'Confirmed Magnaporthe oryzae blast lesions. Stop split urea dose immediately. Spray Tricyclazole 75 WP @ 0.6 g/L water or Isoprothiolane 40 EC @ 1.5 ml/L. Ensure spray reaches lower tillers.',
      managementProtocols: {
        cultural: ['Drain standing stagnant water and replace with fresh 2cm film.', 'Cease further nitrogenous fertilizer application until recovery.'],
        biological: ['Foliar application of Pseudomonas fluorescens @ 10g/L in morning.'],
        chemical: ['Tricyclazole 75 WP @ 0.6 g/L with non-ionic sticker.'],
        safetyPrecautions: ['Use PPE kit with eye protection and mask during spray.', 'Observe mandatory 21-day Pre-Harvest Interval (PHI).']
      },
      sampleRequested: false,
      followUpDays: 4,
    },
    followUps: [],
    timeline: [
      {
        id: 'tl-p1',
        timestamp: '2026-09-18T09:00:00Z',
        actor: 'Basavaraj Gowda',
        actorRole: 'FARMER',
        action: 'Case Created',
        description: 'Reported spindle lesions in Paddy Plot 2.',
        statusBadge: 'New'
      },
      {
        id: 'tl-p2',
        timestamp: '2026-09-18T14:30:00Z',
        actor: 'Dr. Sunita Rao',
        actorRole: 'EXPERT',
        action: 'Diagnosis Confirmed & Advisory Dispatched',
        description: 'Prescribed Tricyclazole intervention and IPM cultural controls.',
        statusBadge: 'Expert Confirmed'
      }
    ],
    createdAt: '2026-09-18T09:00:00Z',
    updatedAt: '2026-09-18T14:30:00Z',
  }
];

export const SEED_HOTSPOTS: Hotspot[] = [
  {
    id: 'hotspot-1',
    areaName: 'Mulbagal - Avani Tomato Belt',
    district: 'Kolar',
    state: 'Karnataka',
    lat: 13.1367,
    lng: 78.1291,
    radiusKm: 14.5,
    caseCount: 38,
    affectedAcres: 145,
    primaryCrop: 'Tomato',
    majorCondition: 'Tomato Early Blight (Alternaria solani)',
    riskLevel: 'HIGH',
    trend: 'Rising',
    firstDetected: '2026-09-12',
    lastReported: '2026-09-22',
    assignedOfficerId: 'user-officer-1',
    assignedOfficerName: 'Ramesh Kumar (ADA)',
  },
  {
    id: 'hotspot-2',
    areaName: 'Srinivaspur Rice Blast Corridor',
    district: 'Kolar',
    state: 'Karnataka',
    lat: 13.3374,
    lng: 78.2137,
    radiusKm: 22.0,
    caseCount: 54,
    affectedAcres: 280,
    primaryCrop: 'Rice / Paddy',
    majorCondition: 'Rice Blast (Magnaporthe oryzae)',
    riskLevel: 'CRITICAL',
    trend: 'Rising',
    firstDetected: '2026-09-10',
    lastReported: '2026-09-21',
    assignedOfficerId: 'user-officer-1',
    assignedOfficerName: 'Ramesh Kumar (ADA)',
  },
  {
    id: 'hotspot-3',
    areaName: 'Niphad Grape Downy Mildew Cluster',
    district: 'Nashik',
    state: 'Maharashtra',
    lat: 20.0818,
    lng: 74.1089,
    radiusKm: 18.2,
    caseCount: 26,
    affectedAcres: 190,
    primaryCrop: 'Table Grapes',
    majorCondition: 'Downy Mildew (Plasmopara viticola)',
    riskLevel: 'MODERATE',
    trend: 'Stable',
    firstDetected: '2026-09-08',
    lastReported: '2026-09-20',
    assignedOfficerId: 'user-officer-3',
    assignedOfficerName: 'Vikram Singh (DAEO)',
  },
  {
    id: 'hotspot-4',
    areaName: 'Chikkodi Cotton Spodoptera Infestation',
    district: 'Belagavi',
    state: 'Karnataka',
    lat: 16.4258,
    lng: 74.5977,
    radiusKm: 12.0,
    caseCount: 19,
    affectedAcres: 95,
    primaryCrop: 'Bt Cotton',
    majorCondition: 'Fall Armyworm / Spodoptera frugiperda',
    riskLevel: 'MODERATE',
    trend: 'Declining',
    firstDetected: '2026-09-02',
    lastReported: '2026-09-19',
    assignedOfficerId: 'user-officer-2',
    assignedOfficerName: 'Dr. Sneha Patil (AO)',
  }
];

export const SEED_FIELD_VISITS: FieldVisit[] = [
  {
    id: 'visit-101',
    caseId: 'CASE-2026-0982',
    hotspotId: 'hotspot-1',
    farmerName: 'Rajesh Patel',
    location: 'Plot A, Avani Village, Mulbagal Taluk',
    assignedOfficerId: 'user-officer-1',
    assignedOfficerName: 'Ramesh Kumar (ADA)',
    priority: 'High',
    reason: 'Rapid progression of Early Blight symptoms following 3-day continuous rain spells in Kolar block.',
    scheduledDate: '2026-09-23T10:00:00Z',
    status: 'Planned',
    notes: 'Bring mobile spore-trap diagnostics and verify copper formulation quality at local agro-retailers.'
  },
  {
    id: 'visit-102',
    caseId: 'CASE-2026-0975',
    hotspotId: 'hotspot-2',
    farmerName: 'Basavaraj Gowda',
    location: 'Srinivaspur Wetland Block 4',
    assignedOfficerId: 'user-officer-1',
    assignedOfficerName: 'Ramesh Kumar (ADA)',
    priority: 'Urgent',
    reason: 'Critical blast cluster verification; inspect water management across 5 contiguous paddy holdings.',
    scheduledDate: '2026-09-22T14:00:00Z',
    status: 'In Progress',
    notes: 'Advising cluster demonstration on bio-control application.'
  }
];

export const SEED_ALERTS: AlertItem[] = [
  {
    id: 'alert-1',
    targetRole: 'FARMER',
    targetUserId: 'user-farmer-1',
    type: 'HIGH_RISK_WEATHER',
    title: 'High Humidity Fungal Risk Warning',
    message: 'High humidity (>84%) and morning fog forecast for next 48 hours in Kolar district may trigger rapid Alternaria fungal spore spread.',
    actionRequired: 'Inspect lower tomato canopy for yellow halo spots; ensure proper furrow drainage.',
    level: 'critical',
    createdAt: '2026-09-22T06:00:00Z',
    read: false,
    linkedCaseId: 'CASE-2026-0982'
  },
  {
    id: 'alert-2',
    targetRole: 'EXPERT',
    type: 'HIGH_RISK_WEATHER',
    title: 'Priority Verification Queue Alert',
    message: '3 new critical cases uploaded in the last 6 hours from Srinivaspur & Mulbagal blocks.',
    actionRequired: 'Review case submissions and confirm IPM advisories.',
    level: 'warning',
    createdAt: '2026-09-22T08:30:00Z',
    read: false,
  },
  {
    id: 'alert-3',
    targetRole: 'OFFICER',
    type: 'REGIONAL_OUTBREAK',
    title: 'Epidemic Cluster Escalation: Rice Blast in Srinivaspur',
    message: 'Active cluster reached 54 reported holdings affecting ~280 acres. Trend is rising.',
    actionRequired: 'Schedule field verification visits and broadcast community audio advisory.',
    level: 'critical',
    createdAt: '2026-09-21T18:00:00Z',
    read: false,
  }
];

export const SEED_MESSAGES: MessageItem[] = [
  {
    id: 'msg-1',
    senderId: 'user-farmer-1',
    senderName: 'Rajesh Patel',
    senderRole: 'FARMER',
    recipientId: 'user-expert-1',
    recipientName: 'Dr. Sunita Rao',
    recipientRole: 'EXPERT',
    caseId: 'CASE-2026-0982',
    content: 'Namaste Doctor, I have pruned the lower leaves as instructed. Should I apply the copper spray today or wait for the rain to stop?',
    timestamp: '2026-09-21T09:15:00Z',
    read: true,
  },
  {
    id: 'msg-2',
    senderId: 'user-expert-1',
    senderName: 'Dr. Sunita Rao, Ph.D.',
    senderRole: 'EXPERT',
    recipientId: 'user-farmer-1',
    recipientName: 'Rajesh Patel',
    recipientRole: 'FARMER',
    caseId: 'CASE-2026-0982',
    content: 'Hello Rajesh. Please wait for a clear 3-4 hour dry window with sunlight before spraying so the formulation does not get washed off. Use sticker/spreader agent.',
    timestamp: '2026-09-21T10:05:00Z',
    read: true,
  }
];

export const SEED_KNOWLEDGE: KnowledgeDocument[] = [
  {
    id: 'kb-1',
    category: 'Diseases',
    title: 'Tomato Early Blight (Alternaria solani) IPM Protocol',
    crop: 'Tomato (Solanum lycopersicum)',
    condition: 'Early Blight',
    scientificName: 'Alternaria solani',
    symptoms: [
      'Brown to dark brown circular spots with distinctive concentric rings (target pattern) on older leaves',
      'Yellow chlorotic halos surrounding necrotic spots',
      'Stem collar rot in young seedlings',
      'Dark sunken leathery lesions at stem end of tomato fruits'
    ],
    riskFactors: [
      'Warm temperatures (24°C to 30°C) with prolonged relative humidity (>80%)',
      'Frequent leaf wetness from rain or overhead irrigation',
      'Plant stress, heavy fruit load, and poor soil nutrition'
    ],
    culturalManagement: [
      'Adopt minimum 3-year crop rotation with non-solanaceous crops (e.g. maize, pulses, marigold).',
      'Ensure wide spacing (60 cm x 45 cm) and staking to enhance canopy aeration.',
      'Remove and destroy infected lower leaves (sanitary pruning) from field borders.',
      'Use plastic mulching to prevent soil splash onto foliage.'
    ],
    biologicalControl: [
      'Seed treatment with Trichoderma viride @ 4g/kg seed.',
      'Foliar spray with Pseudomonas fluorescens @ 5g/L or Bacillus subtilis @ 5g/L during early vegetative stage.'
    ],
    chemicalGuidance: {
      activeIngredients: [
        'Mancozeb 75 WP @ 2.0-2.5 g/L (Preventive)',
        'Copper Oxychloride 50 WP @ 2.5 g/L (Contact)',
        'Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1.0 ml/L (Curative systemic)'
      ],
      safetyPrecautions: [
        'Never spray during high wind speeds or peak pollinator activity hours (10 AM - 2 PM).',
        'Wear chemical-resistant gloves, full apron, and N95 face mask.',
        'Dispose empty containers as per pesticide safe disposal norms.'
      ],
      preHarvestIntervalDays: 7,
      disclaimer: 'Adhere strictly to state agricultural university package of practices and Central Insecticides Board & Registration Committee (CIBRC) approved labels.'
    },
    prevention: [
      'Select certified disease-tolerant hybrids.',
      'Avoid excess nitrogen fertilizer which causes succulent vulnerable growth; balance with Potassium.'
    ],
    sources: ['ICAR-IIHR Bengaluru', 'FAO IPM Guidelines', 'TNAU Agritech Portal'],
    lastUpdated: '2026-08-15',
    author: 'Dr. Sunita Rao (Pathology Working Group)'
  },
  {
    id: 'kb-2',
    category: 'Diseases',
    title: 'Rice Blast (Magnaporthe oryzae) Surveillance & Management',
    crop: 'Rice / Paddy (Oryza sativa)',
    condition: 'Rice Blast',
    scientificName: 'Magnaporthe oryzae (Pyricularia oryzae)',
    symptoms: [
      'Eye-shaped or spindle lesions with greyish-white necrotic center and brown margin on leaves',
      'Blackish rot at panicle base (Neck Blast) causing chaffy grains',
      'Brown lesions at leaf collar leading to complete leaf blade death'
    ],
    riskFactors: [
      'Night temperature between 18-24°C with high relative humidity (>90%) and morning dew duration >8 hours',
      'Excessive single-dose application of nitrogen fertilizers'
    ],
    culturalManagement: [
      'Apply nitrogen in 3 to 4 split doses synchronized with physiological need.',
      'Maintain continuous shallow standing water (2-3 cm) during critical tillering phase.',
      'Burn or compost stubbles deeply post-harvest.'
    ],
    biologicalControl: [
      'Seed priming with Pseudomonas fluorescens (Pf1) @ 10g/kg seed.',
      'Foliar spray of Pf1 formulation @ 2.5 kg/ha at tillering.'
    ],
    chemicalGuidance: {
      activeIngredients: [
        'Tricyclazole 75 WP @ 0.6 g/L (Systemic protectant)',
        'Isoprothiolane 40 EC @ 1.5 ml/L',
        'Kasugamycin 3% SL @ 2.0 ml/L'
      ],
      safetyPrecautions: [
        'Ensure full coverage of lower plant canopy using fine hollow-cone nozzle.',
        'Mandatory 21-day Pre-Harvest Interval (PHI).'
      ],
      preHarvestIntervalDays: 21,
      disclaimer: 'Observe CIBRC registration dosage; alternate chemical classes to avoid fungicide resistance.'
    },
    prevention: [
      'Use resistant/tolerant varieties such as BPT-5204 (moderate), MTU-1010, or locally recommended cultivars.'
    ],
    sources: ['ICAR-National Rice Research Institute (NRRI Cuttack)', 'IRRI Rice Knowledge Bank'],
    lastUpdated: '2026-07-20',
    author: 'State Directorate of Agriculture'
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    userId: 'user-farmer-1',
    userName: 'Rajesh Patel',
    userRole: 'FARMER',
    action: 'CROP_SCAN_SUBMITTED',
    resource: 'Field: Tomato North Block',
    details: 'Uploaded 1 specimen image (1080p). AI detected Tomato Early Blight with 88% confidence.',
    timestamp: '2026-09-20T10:30:12Z',
    ipAddress: '157.48.21.90',
    status: 'SUCCESS'
  },
  {
    id: 'aud-2',
    userId: 'user-expert-1',
    userName: 'Dr. Sunita Rao',
    userRole: 'EXPERT',
    action: 'CASE_DIAGNOSIS_CONFIRMED',
    resource: 'Case: CASE-2026-0975',
    details: 'Confirmed Magnaporthe oryzae diagnosis and dispatched Tricyclazole IPM protocol to farmer Basavaraj Gowda.',
    timestamp: '2026-09-18T14:30:45Z',
    ipAddress: '14.139.155.10',
    status: 'SUCCESS'
  },
  {
    id: 'aud-3',
    userId: 'user-officer-1',
    userName: 'Ramesh Kumar (ADA)',
    userRole: 'OFFICER',
    action: 'FIELD_VISIT_SCHEDULED',
    resource: 'Hotspot: Mulbagal - Avani Tomato Belt',
    details: 'Created high-priority field visit for Case CASE-2026-0982 with spore-trap diagnostics.',
    timestamp: '2026-09-21T11:15:00Z',
    ipAddress: '117.218.42.105',
    status: 'SUCCESS'
  },
  {
    id: 'aud-4',
    userId: 'user-farmer-1',
    userName: 'Rajesh Patel',
    userRole: 'FARMER',
    action: 'PORTAL_ACCESS_REJECTED',
    resource: 'Endpoint: /admin/login',
    details: 'Attempted to access Administration Portal with Farmer credentials. Blocked by RBAC gateway.',
    timestamp: '2026-09-22T04:12:00Z',
    ipAddress: '157.48.21.90',
    status: 'BLOCKED'
  }
];
