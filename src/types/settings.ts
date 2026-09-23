import { UserRole, Language } from './index';

export interface UserSettings {
  userId: string;
  language: Language;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
  timeFormat: '12h' | '24h';
  density: 'comfortable' | 'compact';
  reducedMotion: boolean;
  textSize: 'small' | 'default' | 'large';
  updatedAt: string;
}

export interface NotificationPreferences {
  userId: string;
  // Case events
  caseCreated: boolean;
  expertAssigned: boolean;
  reviewCompleted: boolean;
  diagnosisUpdated: boolean;
  advisoryAvailable: boolean;
  followUpDue: boolean;
  
  // Weather & Outbreak
  heavyRain: boolean;
  highHumidity: boolean;
  temperatureExtreme: boolean;
  diseaseFavourableWeather: boolean;
  regionalOutbreak: boolean;
  pestSurge: boolean;
  governmentAdvisory: boolean;
  
  // Messages & Lab
  expertMessages: boolean;
  officerMessages: boolean;
  farmerMessages: boolean;
  aiResponses: boolean;
  labSampleUpdates: boolean;
  
  // Channels
  inAppEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  updatedAt: string;
}

export interface PrivacyPreferences {
  userId: string;
  profileVisibility: 'private' | 'limited' | 'authorized_staff' | 'public';
  locationSharing: 'none' | 'approximate' | 'precise_staff_only';
  shareForSurveillance: boolean;
  shareForHotspots: boolean;
  analyticsConsent: boolean;
  activityVisibility: 'private' | 'organization' | 'public';
  updatedAt: string;
}

export interface SecuritySessionItem {
  id: string;
  userId: string;
  device: string;
  browser: string;
  locationApprox: string;
  ipAddress: string;
  isCurrent: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export interface FarmerPreferences {
  userId: string;
  defaultFieldId?: string;
  preferredCrop: string;
  preferredUnitSystem: 'metric' | 'imperial';
  preferredAdvisoryLanguage: Language;
  preferredWeatherLocation: string;
  aiExplanationLevel: 'simple' | 'standard' | 'detailed';
  aiIncludeContext: {
    currentField: boolean;
    currentCrop: boolean;
    recentScans: boolean;
    weather: boolean;
    previousCases: boolean;
  };
  updatedAt: string;
}

export interface ExpertPreferences {
  userId: string;
  qualification?: string;
  organization?: string;
  specialization?: string;
  bio?: string;
  defaultCaseView: 'queue' | 'investigations' | 'cases';
  defaultSort: 'risk' | 'date' | 'confidence' | 'priority';
  reviewPreferences: {
    showAiAlternatives: boolean;
    showWeatherAutomatically: boolean;
    showRegionalCases: boolean;
    showPreviousCases: boolean;
    showKnowledgeSuggestions: boolean;
  };
  availabilityStatus: 'Available' | 'Away' | 'Offline';
  workingDays: string[];
  maxActiveAssignments: number;
  copilotExplanationLevel: 'concise' | 'standard' | 'detailed';
  copilotContext: {
    weather: boolean;
    historicalCases: boolean;
    knowledgeBase: boolean;
    labResults: boolean;
    regionalTrends: boolean;
  };
  copilotSuggestedActions: {
    suggestedQuestions: boolean;
    advisoryDraft: boolean;
    evidenceChecklist: boolean;
    relatedKnowledge: boolean;
  };
  updatedAt: string;
}

export interface OfficerPreferences {
  userId: string;
  defaultMapView: 'region' | 'district' | 'assignment';
  defaultMapLayers: {
    cases: boolean;
    hotspots: boolean;
    risk: boolean;
    fieldVisits: boolean;
    alerts: boolean;
    weather: boolean;
  };
  defaultFilters: {
    risk: string;
    crop: string;
    disease: string;
    dateRange: string;
  };
  mapSettings: {
    clusterRadius: number;
    hotspotSensitivity: 'low' | 'medium' | 'high';
    privacyRadiusMeters: number;
    defaultZoom: number;
    mapStyle: 'streets' | 'satellite' | 'terrain';
    showWeatherLayer: boolean;
  };
  reportPreferences: {
    defaultPeriod: '7d' | '30d' | '90d' | 'season';
    defaultRegion: string;
    defaultCrop: string;
    preferredExportFormat: 'PDF' | 'CSV' | 'XLSX';
    includeCharts: boolean;
    includeMaps: boolean;
  };
  copilotContext: {
    hotspotData: boolean;
    weather: boolean;
    historicalTrends: boolean;
    fieldVisits: boolean;
    regionalAlerts: boolean;
  };
  updatedAt: string;
}

export interface SystemSettings {
  general: {
    platformName: string;
    tagline: string;
    organizationName: string;
    supportEmail: string;
    supportPhone: string;
    defaultLanguage: Language;
    defaultTimezone: string;
    defaultCountry: string;
    defaultState: string;
    dateFormat: string;
    timeFormat: string;
  };
  security: {
    minPasswordLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSpecialChar: boolean;
    passwordExpiryDays: number;
    maxFailedAttempts: number;
    lockDurationMinutes: number;
    sessionTimeoutMinutes: number;
    idleTimeoutMinutes: number;
    mfaEnabled: boolean;
    requireMfaAdmin: boolean;
    requireMfaExpert: boolean;
    requireMfaOfficer: boolean;
    auditLogRetentionDays: number;
  };
  usersAndRoles: {
    farmerRegistrationEnabled: boolean;
    expertRegistrationApprovalRequired: boolean;
    officerRegistrationApprovalRequired: boolean;
    rolePermissions: {
      viewOwnCases: UserRole[];
      reviewCases: UserRole[];
      regionalMap: UserRole[];
      globalCases: UserRole[];
      manageUsers: UserRole[];
      manageKnowledge: UserRole[];
      publishGlobalAlerts: UserRole[];
    };
  };
  authentication: {
    allowedLoginMethods: ('password' | 'otp' | 'oauth')[];
    passwordResetAvailable: boolean;
    sessionDurationHours: number;
    refreshTokenDurationDays: number;
    emailVerificationRequired: boolean;
    phoneVerificationRequired: boolean;
    loginNotificationEnabled: boolean;
  };
  notifications: {
    inAppChannelEnabled: boolean;
    emailChannelEnabled: boolean;
    browserChannelEnabled: boolean;
    enabledEvents: {
      caseCreated: boolean;
      expertAssigned: boolean;
      diagnosisConfirmed: boolean;
      followUpDue: boolean;
      criticalRisk: boolean;
      regionalOutbreak: boolean;
      fieldVisit: boolean;
      labResult: boolean;
      securityEvent: boolean;
    };
  };
  ai: {
    provider: 'local' | 'gemini' | 'mock';
    model: string;
    enableAi: boolean;
    confidenceThreshold: number; // 0.0 - 1.0
    expertReviewThreshold: number; // 0.0 - 1.0
    maxImageSizeMb: number;
    maxImagesPerScan: number;
    aiExplanationEnabled: boolean;
    assistantEnabledForFarmer: boolean;
    assistantEnabledForExpert: boolean;
    assistantEnabledForOfficer: boolean;
  };
  weather: {
    provider: 'OpenMeteo' | 'IMD' | 'Mock';
    providerStatus: 'Connected' | 'Mock' | 'Error' | 'Unavailable';
    updateFrequencyMinutes: number;
    forecastDurationDays: number;
    cacheDurationMinutes: number;
    tempHighThresholdC: number;
    humidityHighThresholdPct: number;
    rainHeavyThresholdMm: number;
  };
  maps: {
    provider: 'OpenStreetMap + Leaflet' | 'Mapbox' | 'GoogleMaps';
    defaultLat: number;
    defaultLng: number;
    defaultZoom: number;
    maxZoom: number;
    hotspotRadiusKm: number;
    clusterThreshold: number;
    privacyRadiusMeters: number;
    satelliteAvailable: boolean;
    weatherLayerAvailable: boolean;
  };
  languages: {
    enabledLanguages: Language[];
    defaultLanguage: Language;
    fallbackLanguage: Language;
  };
  caseManagement: {
    autoExpertReview: boolean;
    highRiskEscalation: boolean;
    criticalRiskThreshold: number;
    defaultFollowUpDays: number;
    autoArchiveDays: number;
    expertAssignmentMethod: 'manual' | 'region_based' | 'specialty_based' | 'load_based';
  };
  fileUploads: {
    allowedTypes: string[];
    maxImageSizeMb: number;
    maxImagesPerCase: number;
    maxAttachmentSizeMb: number;
    storageProvider: 'local' | 'cloud';
    autoCompression: boolean;
    retentionDays: number;
  };
  privacy: {
    farmerLocationMode: 'exact' | 'approximate' | 'aggregated';
    mapPrivacyRadiusMeters: number;
    analyticsCollection: boolean;
    dataExportAllowed: boolean;
  };
  email: {
    smtpHost: string;
    senderName: string;
    senderAddress: string;
    sendCaseEmails: boolean;
    sendAlertEmails: boolean;
    sendSecurityEmails: boolean;
    testEmailStatus?: string;
  };
  maintenance: {
    maintenanceMode: boolean;
    message: string;
    startTime?: string;
    expectedEndTime?: string;
  };
  system: {
    appVersion: string;
    apiVersion: string;
    databaseVersion: string;
    environment: string;
    uptimeSeconds: number;
    lastBackupTimestamp?: string;
    lastBackupSizeMb?: number;
  };
}
