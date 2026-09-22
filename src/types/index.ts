export type UserRole = 'FARMER' | 'EXPERT' | 'OFFICER' | 'ADMIN';

export type Language = 'en' | 'kn' | 'hi';

export type CaseStatus = 
  | 'New'
  | 'AI Analysed'
  | 'Under Review'
  | 'Expert Confirmed'
  | 'Expert Rejected'
  | 'Action Recommended'
  | 'Follow-up Required'
  | 'Resolved'
  | 'Escalated';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Severe';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'pending';
  avatar?: string;
  location?: {
    state: string;
    district: string;
    taluk?: string;
    village?: string;
    lat?: number;
    lng?: number;
  };
  organization?: string;
  specialization?: string;
  licenseNumber?: string;
  createdAt: string;
  preferredLanguage: Language;
}

export interface Farm {
  id: string;
  farmerId: string;
  name: string;
  location: string;
  totalAreaAcres: number;
  soilType: string;
  irrigationSource: string;
  lat: number;
  lng: number;
}

export interface Field {
  id: string;
  farmId: string;
  farmerId: string;
  name: string;
  crop: string;
  variety: string;
  cropStage: string;
  areaAcres: number;
  sowingDate: string;
  soilCondition: string;
  irrigationType: string;
  healthStatus: 'Healthy' | 'Attention Required' | 'High Risk';
  lat: number;
  lng: number;
  lastScannedAt?: string;
  activeCasesCount: number;
}

export interface AIPrediction {
  condition: string;
  scientificName: string;
  confidence: number;
  severity: SeverityLevel;
  risk: RiskLevel;
  type: 'Fungal Disease' | 'Bacterial Disease' | 'Viral Disease' | 'Pest Infestation' | 'Nutritional Deficiency' | 'Healthy';
  observedIndicators: string[];
  riskFactors: string[];
  recommendedSteps: string[];
  boundingBoxes?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    confidence: number;
  }>;
  disclaimer: string;
}

export interface WeatherCondition {
  temperature: number; // in Celsius
  humidity: number; // percentage
  rainProbability: number; // percentage
  rainfallMm: number;
  windSpeedKmh: number;
  uvIndex: number;
  conditionDescription: string;
  forecast: Array<{
    day: string;
    tempMax: number;
    tempMin: number;
    humidity: number;
    rainProb: number;
    condition: string;
    riskCategory: 'Low' | 'Moderate' | 'High';
  }>;
  fungalRisk: RiskLevel;
  pestRisk: RiskLevel;
  riskExplanation: string;
}

export interface ExpertReview {
  id: string;
  expertId: string;
  expertName: string;
  expertSpecialization: string;
  reviewedAt: string;
  action: 'Confirm Diagnosis' | 'Modify Diagnosis' | 'Reject' | 'Request More Images' | 'Request More Information' | 'Request Laboratory Testing' | 'Escalate';
  confirmedCondition: string;
  severity: SeverityLevel;
  confidence: number;
  advisoryText: string;
  managementProtocols: {
    cultural: string[];
    biological: string[];
    chemical: string[];
    safetyPrecautions: string[];
  };
  sampleRequested: boolean;
  followUpDays: number;
}

export interface FollowUpEntry {
  id: string;
  date: string;
  imageUrl?: string;
  symptomProgression: 'Significantly Improved' | 'Slightly Improved' | 'No Change' | 'Worsened';
  farmerNotes: string;
  expertFeedback?: string;
}

export interface CaseTimelineItem {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole | 'AI Engine';
  action: string;
  description: string;
  statusBadge?: CaseStatus;
}

export interface CaseRecord {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  fieldId: string;
  fieldName: string;
  crop: string;
  variety: string;
  cropStage: string;
  location: {
    district: string;
    state: string;
    lat: number;
    lng: number;
  };
  symptomsReported: string;
  images: Array<{
    id: string;
    url: string;
    uploadedAt: string;
    qualityPassed: boolean;
    qualityDetails?: {
      blurScore: number;
      exposureScore: number;
      resolution: string;
      isPlantDetected: boolean;
    };
  }>;
  aiPrediction: AIPrediction;
  riskAssessment: {
    overallRisk: RiskLevel;
    score: number; // 0 - 100
    factors: {
      diseaseProbabilityScore: number;
      weatherSuitabilityScore: number;
      cropSusceptibilityScore: number;
      regionalPressureScore: number;
    };
    explanation: string;
  };
  weatherSnapshot: WeatherCondition;
  status: CaseStatus;
  priority: 'Routine' | 'Moderate' | 'High' | 'Emergency';
  expertReview?: ExpertReview;
  followUps: FollowUpEntry[];
  timeline: CaseTimelineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Hotspot {
  id: string;
  areaName: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  radiusKm: number;
  caseCount: number;
  affectedAcres: number;
  primaryCrop: string;
  majorCondition: string;
  riskLevel: RiskLevel;
  trend: 'Rising' | 'Stable' | 'Declining';
  firstDetected: string;
  lastReported: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
}

export interface FieldVisit {
  id: string;
  caseId?: string;
  hotspotId?: string;
  farmerName?: string;
  location: string;
  assignedOfficerId: string;
  assignedOfficerName: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  reason: string;
  scheduledDate: string;
  status: 'Planned' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  actionTaken?: string;
  completedAt?: string;
}

export interface AlertItem {
  id: string;
  targetRole: UserRole | 'ALL';
  targetUserId?: string;
  targetDistrict?: string;
  type: 'HIGH_RISK_WEATHER' | 'EXPERT_RESPONSE' | 'FOLLOW_UP_DUE' | 'REGIONAL_OUTBREAK' | 'PEST_SURGE' | 'SYSTEM';
  title: string;
  message: string;
  actionRequired: string;
  level: 'info' | 'warning' | 'critical' | 'success';
  createdAt: string;
  read: boolean;
  linkedCaseId?: string;
}

export interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  recipientRole: UserRole;
  caseId?: string;
  content: string;
  attachments?: string[];
  timestamp: string;
  read: boolean;
}

export interface KnowledgeDocument {
  id: string;
  category: 'Diseases' | 'Pests' | 'Symptoms' | 'Crops' | 'Integrated Pest Management' | 'Weather Risk' | 'Safe Input Guidance' | 'Extension Guidance';
  title: string;
  crop: string;
  condition: string;
  scientificName?: string;
  symptoms: string[];
  riskFactors: string[];
  culturalManagement: string[];
  biologicalControl: string[];
  chemicalGuidance: {
    activeIngredients: string[];
    safetyPrecautions: string[];
    preHarvestIntervalDays: number;
    disclaimer: string;
  };
  prevention: string[];
  sources: string[];
  lastUpdated: string;
  author: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  status: 'SUCCESS' | 'BLOCKED' | 'WARNING';
}
