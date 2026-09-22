import {
  User,
  UserRole,
  Field,
  CaseRecord,
  Hotspot,
  FieldVisit,
  AlertItem,
  MessageItem,
  KnowledgeDocument,
  AuditLog,
  Language,
  CaseStatus,
  ExpertReview,
  FollowUpEntry
} from '../types';
import {
  SEED_USERS,
  SEED_FIELDS,
  SEED_CASES,
  SEED_HOTSPOTS,
  SEED_FIELD_VISITS,
  SEED_ALERTS,
  SEED_MESSAGES,
  SEED_KNOWLEDGE,
  SEED_AUDIT_LOGS
} from '../data/seedData';

const STORAGE_KEYS = {
  USERS: 'cultivai_users_v2',
  SESSION: 'cultivai_session_v2',
  FIELDS: 'cultivai_fields_v2',
  CASES: 'cultivai_cases_v2',
  HOTSPOTS: 'cultivai_hotspots_v2',
  VISITS: 'cultivai_visits_v2',
  ALERTS: 'cultivai_alerts_v2',
  MESSAGES: 'cultivai_messages_v2',
  KNOWLEDGE: 'cultivai_knowledge_v2',
  AUDIT_LOGS: 'cultivai_audit_logs_v2',
  LANGUAGE: 'cultivai_language_v2',
};

// Generic safe storage helper
function getStored<T>(key: string, defaultData: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error loading storage key ${key}:`, err);
    return defaultData;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving storage key ${key}:`, err);
  }
}

export const StorageService = {
  // --- Auth & Session ---
  getCurrentUser(): User | null {
    return getStored<User | null>(STORAGE_KEYS.SESSION, null);
  },

  setCurrentUser(user: User | null): void {
    setStored<User | null>(STORAGE_KEYS.SESSION, user);
  },

  getLanguage(): Language {
    return getStored<Language>(STORAGE_KEYS.LANGUAGE, 'en');
  },

  setLanguage(lang: Language): void {
    setStored<Language>(STORAGE_KEYS.LANGUAGE, lang);
    const user = this.getCurrentUser();
    if (user) {
      user.preferredLanguage = lang;
      this.updateUser(user);
    }
  },

  login(
    emailOrPhone: string,
    password: string,
    requiredRole: UserRole
  ): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const cleanInput = emailOrPhone.trim().toLowerCase();

    const matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === cleanInput ||
        u.phone.replace(/\s+/g, '') === cleanInput.replace(/\s+/g, '')
    );

    if (!matchedUser) {
      this.addAuditLog({
        userId: 'anonymous',
        userName: cleanInput,
        userRole: requiredRole,
        action: 'LOGIN_FAILED',
        resource: `/api/${requiredRole.toLowerCase()}/login`,
        details: `Failed login attempt: Account not found for "${emailOrPhone}".`,
        status: 'BLOCKED',
      });
      return {
        success: false,
        error: 'Invalid email/phone or password. Please verify credentials.',
      };
    }

    // Check password (accept "cultivai2026" or user created accounts)
    if (password !== 'cultivai2026' && password.length < 4) {
      return {
        success: false,
        error: 'Invalid password. Please enter valid password.',
      };
    }

    // Enforce role boundary
    if (matchedUser.role !== requiredRole) {
      this.addAuditLog({
        userId: matchedUser.id,
        userName: matchedUser.name,
        userRole: matchedUser.role,
        action: 'PORTAL_ACCESS_REJECTED',
        resource: `/${requiredRole.toLowerCase()}/login`,
        details: `User with role ${matchedUser.role} attempted to access ${requiredRole} portal. Rejected.`,
        status: 'BLOCKED',
      });

      const roleDisplayNames: Record<UserRole, string> = {
        FARMER: 'Farmer',
        EXPERT: 'Plant Pathologist / Expert',
        OFFICER: 'Agriculture Officer',
        ADMIN: 'Administrator',
      };

      return {
        success: false,
        error: `This account is registered as a ${roleDisplayNames[matchedUser.role]} and does not have access to the ${roleDisplayNames[requiredRole]} Portal.`,
      };
    }

    if (matchedUser.status === 'suspended') {
      return {
        success: false,
        error: 'This account has been temporarily suspended by an administrator. Please contact support.',
      };
    }

    // Success
    this.setCurrentUser(matchedUser);
    this.addAuditLog({
      userId: matchedUser.id,
      userName: matchedUser.name,
      userRole: matchedUser.role,
      action: 'LOGIN_SUCCESS',
      resource: `/${requiredRole.toLowerCase()}/dashboard`,
      details: `Successful authenticated session started for ${matchedUser.role}.`,
      status: 'SUCCESS',
    });

    return { success: true, user: matchedUser };
  },

  registerFarmer(data: {
    name: string;
    phone: string;
    email: string;
    state: string;
    district: string;
    preferredLanguage: Language;
    initialFarmName?: string;
    initialPrimaryCrop?: string;
  }): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `user-farmer-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'FARMER',
      status: 'active',
      location: {
        state: data.state,
        district: data.district,
        lat: 13.1367 + (Math.random() - 0.5) * 0.1,
        lng: 78.1291 + (Math.random() - 0.5) * 0.1,
      },
      createdAt: new Date().toISOString(),
      preferredLanguage: data.preferredLanguage || 'en',
    };

    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);

    // If initial farm/field given
    if (data.initialFarmName || data.initialPrimaryCrop) {
      this.addField({
        farmId: `farm-${Date.now()}`,
        farmerId: newUser.id,
        name: data.initialFarmName || 'Main Plot 1',
        crop: data.initialPrimaryCrop || 'Tomato',
        variety: 'Local High Yield',
        cropStage: 'Vegetative Growth (Day 25)',
        areaAcres: 2.0,
        sowingDate: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
        soilCondition: 'Red Loam, Well drained',
        irrigationType: 'Drip Irrigation',
        healthStatus: 'Healthy',
        lat: newUser.location?.lat || 13.1367,
        lng: newUser.location?.lng || 78.1291,
        activeCasesCount: 0,
      });
    }

    this.setCurrentUser(newUser);
    this.addAuditLog({
      userId: newUser.id,
      userName: newUser.name,
      userRole: 'FARMER',
      action: 'FARMER_REGISTERED',
      resource: '/farmer/register',
      details: `New farmer registered in ${data.district}, ${data.state}.`,
      status: 'SUCCESS',
    });

    return { success: true, user: newUser };
  },

  logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.addAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'LOGOUT',
        resource: '/logout',
        details: 'User explicitly logged out and session cleared.',
        status: 'SUCCESS',
      });
    }
    this.setCurrentUser(null);
  },

  // --- Users ---
  getUsers(): User[] {
    return getStored<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  },

  updateUser(updatedUser: User): void {
    const users = this.getUsers().map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setStored(STORAGE_KEYS.USERS, users);
    if (this.getCurrentUser()?.id === updatedUser.id) {
      this.setCurrentUser(updatedUser);
    }
  },

  createUser(userData: Partial<User> & { name: string; email: string; role: UserRole }): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `user-${userData.role.toLowerCase()}-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '+91 90000 00000',
      role: userData.role,
      status: 'active',
      organization: userData.organization,
      specialization: userData.specialization,
      licenseNumber: userData.licenseNumber,
      location: userData.location || { state: 'Karnataka', district: 'Kolar', lat: 13.1367, lng: 78.1291 },
      createdAt: new Date().toISOString(),
      preferredLanguage: 'en',
    };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  toggleUserStatus(userId: string): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.status = user.status === 'active' ? 'suspended' : 'active';
      setStored(STORAGE_KEYS.USERS, users);
      return user;
    }
    return null;
  },

  // --- Fields ---
  getFields(farmerId?: string): Field[] {
    const all = getStored<Field[]>(STORAGE_KEYS.FIELDS, SEED_FIELDS);
    if (farmerId) {
      return all.filter((f) => f.farmerId === farmerId);
    }
    return all;
  },

  getFieldById(id: string): Field | undefined {
    return this.getFields().find((f) => f.id === id);
  },

  addField(fieldData: Omit<Field, 'id'>): Field {
    const fields = this.getFields();
    const newField: Field = {
      ...fieldData,
      id: `field-${Date.now()}`,
    };
    fields.push(newField);
    setStored(STORAGE_KEYS.FIELDS, fields);
    return newField;
  },

  updateField(updatedField: Field): void {
    const fields = this.getFields().map((f) => (f.id === updatedField.id ? updatedField : f));
    setStored(STORAGE_KEYS.FIELDS, fields);
  },

  // --- Cases ---
  getCases(filter?: { farmerId?: string; status?: CaseStatus; crop?: string }): CaseRecord[] {
    let cases = getStored<CaseRecord[]>(STORAGE_KEYS.CASES, SEED_CASES);
    if (filter?.farmerId) {
      cases = cases.filter((c) => c.farmerId === filter.farmerId);
    }
    if (filter?.status) {
      cases = cases.filter((c) => c.status === filter.status);
    }
    if (filter?.crop) {
      cases = cases.filter((c) => c.crop.toLowerCase().includes(filter.crop!.toLowerCase()));
    }
    return cases;
  },

  getCaseById(id: string): CaseRecord | undefined {
    return this.getCases().find((c) => c.id === id);
  },

  addCase(caseData: Omit<CaseRecord, 'id' | 'createdAt' | 'updatedAt'>): CaseRecord {
    const cases = this.getCases();
    const newCase: CaseRecord = {
      ...caseData,
      id: `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    cases.unshift(newCase);
    setStored(STORAGE_KEYS.CASES, cases);

    // Update field active case count & health status if risk is HIGH/CRITICAL
    const field = this.getFieldById(newCase.fieldId);
    if (field) {
      field.activeCasesCount = (field.activeCasesCount || 0) + 1;
      field.lastScannedAt = newCase.createdAt;
      if (newCase.riskAssessment.overallRisk === 'CRITICAL' || newCase.riskAssessment.overallRisk === 'HIGH') {
        field.healthStatus = 'High Risk';
      } else if (newCase.riskAssessment.overallRisk === 'MODERATE') {
        field.healthStatus = 'Attention Required';
      }
      this.updateField(field);
    }

    this.addAuditLog({
      userId: newCase.farmerId,
      userName: newCase.farmerName,
      userRole: 'FARMER',
      action: 'CASE_CREATED',
      resource: newCase.id,
      details: `Created new crop health diagnosis case for ${newCase.crop} (${newCase.aiPrediction.condition}).`,
      status: 'SUCCESS',
    });

    return newCase;
  },

  updateCase(updatedCase: CaseRecord): void {
    updatedCase.updatedAt = new Date().toISOString();
    const cases = this.getCases().map((c) => (c.id === updatedCase.id ? updatedCase : c));
    setStored(STORAGE_KEYS.CASES, cases);
  },

  addExpertReview(caseId: string, review: ExpertReview): CaseRecord | null {
    const caseItem = this.getCaseById(caseId);
    if (!caseItem) return null;

    caseItem.expertReview = review;
    if (review.action === 'Confirm Diagnosis') {
      caseItem.status = 'Expert Confirmed';
    } else if (review.action === 'Modify Diagnosis') {
      caseItem.status = 'Action Recommended';
    } else if (review.action === 'Reject') {
      caseItem.status = 'Expert Rejected';
    } else if (review.action === 'Escalate') {
      caseItem.status = 'Escalated';
    } else {
      caseItem.status = 'Follow-up Required';
    }

    caseItem.timeline.push({
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: review.expertName,
      actorRole: 'EXPERT',
      action: review.action,
      description: review.advisoryText.slice(0, 140) + '...',
      statusBadge: caseItem.status,
    });

    this.updateCase(caseItem);

    // Create Notification / Alert for the farmer
    this.addAlert({
      targetRole: 'FARMER',
      targetUserId: caseItem.farmerId,
      type: 'EXPERT_RESPONSE',
      title: `Expert Advisory Received: ${caseItem.crop} Case ${caseItem.id}`,
      message: `${review.expertName} confirmed diagnosis: "${review.confirmedCondition}". View prescribed IPM protocols.`,
      actionRequired: 'Review IPM instructions and schedule follow-up inspection.',
      level: 'success',
      linkedCaseId: caseItem.id,
    });

    this.addAuditLog({
      userId: review.expertId,
      userName: review.expertName,
      userRole: 'EXPERT',
      action: 'EXPERT_REVIEW_SUBMITTED',
      resource: caseId,
      details: `${review.action} for ${caseItem.crop}. Confirmed: ${review.confirmedCondition}.`,
      status: 'SUCCESS',
    });

    return caseItem;
  },

  addFollowUp(caseId: string, followUp: FollowUpEntry): CaseRecord | null {
    const caseItem = this.getCaseById(caseId);
    if (!caseItem) return null;

    caseItem.followUps.push(followUp);
    caseItem.timeline.push({
      id: `tl-fu-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: caseItem.farmerName,
      actorRole: 'FARMER',
      action: 'Follow-up Progress Submitted',
      description: `Status: ${followUp.symptomProgression}. Note: ${followUp.farmerNotes}`,
      statusBadge: 'Under Review',
    });

    if (followUp.symptomProgression === 'Significantly Improved') {
      caseItem.status = 'Resolved';
    }

    this.updateCase(caseItem);
    return caseItem;
  },

  // --- Hotspots ---
  getHotspots(): Hotspot[] {
    return getStored<Hotspot[]>(STORAGE_KEYS.HOTSPOTS, SEED_HOTSPOTS);
  },

  addHotspot(hotspotData: Omit<Hotspot, 'id'>): Hotspot {
    const hotspots = this.getHotspots();
    const newHotspot: Hotspot = {
      ...hotspotData,
      id: `hotspot-${Date.now()}`,
    };
    hotspots.push(newHotspot);
    setStored(STORAGE_KEYS.HOTSPOTS, hotspots);
    return newHotspot;
  },

  // --- Field Visits ---
  getFieldVisits(officerId?: string): FieldVisit[] {
    const all = getStored<FieldVisit[]>(STORAGE_KEYS.VISITS, SEED_FIELD_VISITS);
    if (officerId) {
      return all.filter((v) => v.assignedOfficerId === officerId);
    }
    return all;
  },

  addFieldVisit(visitData: Omit<FieldVisit, 'id'>): FieldVisit {
    const visits = this.getFieldVisits();
    const newVisit: FieldVisit = {
      ...visitData,
      id: `visit-${Date.now()}`,
    };
    visits.unshift(newVisit);
    setStored(STORAGE_KEYS.VISITS, visits);

    this.addAuditLog({
      userId: newVisit.assignedOfficerId,
      userName: newVisit.assignedOfficerName,
      userRole: 'OFFICER',
      action: 'FIELD_VISIT_CREATED',
      resource: newVisit.id,
      details: `Scheduled field inspection at ${newVisit.location} for reason: ${newVisit.reason}.`,
      status: 'SUCCESS',
    });

    return newVisit;
  },

  updateFieldVisitStatus(visitId: string, status: FieldVisit['status'], notes?: string): void {
    const visits = this.getFieldVisits().map((v) => {
      if (v.id === visitId) {
        return {
          ...v,
          status,
          notes: notes || v.notes,
          completedAt: status === 'Completed' ? new Date().toISOString() : undefined,
        };
      }
      return v;
    });
    setStored(STORAGE_KEYS.VISITS, visits);
  },

  // --- Alerts & Notifications ---
  getAlerts(userRole?: UserRole, userId?: string): AlertItem[] {
    const all = getStored<AlertItem[]>(STORAGE_KEYS.ALERTS, SEED_ALERTS);
    if (!userRole && !userId) return all;
    return all.filter((a) => {
      if (userId && a.targetUserId === userId) return true;
      if (a.targetRole === 'ALL') return true;
      if (userRole && a.targetRole === userRole) return true;
      return false;
    });
  },

  addAlert(alertData: Omit<AlertItem, 'id' | 'createdAt' | 'read'>): AlertItem {
    const alerts = getStored<AlertItem[]>(STORAGE_KEYS.ALERTS, SEED_ALERTS);
    const newAlert: AlertItem = {
      ...alertData,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    alerts.unshift(newAlert);
    setStored(STORAGE_KEYS.ALERTS, alerts);
    return newAlert;
  },

  markAlertRead(id: string): void {
    const alerts = getStored<AlertItem[]>(STORAGE_KEYS.ALERTS, SEED_ALERTS).map((a) =>
      a.id === id ? { ...a, read: true } : a
    );
    setStored(STORAGE_KEYS.ALERTS, alerts);
  },

  // --- Messages ---
  getMessages(userId: string): MessageItem[] {
    const all = getStored<MessageItem[]>(STORAGE_KEYS.MESSAGES, SEED_MESSAGES);
    return all.filter((m) => m.senderId === userId || m.recipientId === userId);
  },

  sendMessage(messageData: Omit<MessageItem, 'id' | 'timestamp' | 'read'>): MessageItem {
    const messages = getStored<MessageItem[]>(STORAGE_KEYS.MESSAGES, SEED_MESSAGES);
    const newMsg: MessageItem = {
      ...messageData,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    messages.push(newMsg);
    setStored(STORAGE_KEYS.MESSAGES, messages);
    return newMsg;
  },

  // --- Knowledge Documents ---
  getKnowledge(category?: string, query?: string): KnowledgeDocument[] {
    let docs = getStored<KnowledgeDocument[]>(STORAGE_KEYS.KNOWLEDGE, SEED_KNOWLEDGE);
    if (category && category !== 'All') {
      docs = docs.filter((d) => d.category === category);
    }
    if (query) {
      const q = query.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.crop.toLowerCase().includes(q) ||
          d.condition.toLowerCase().includes(q) ||
          d.symptoms.some((s) => s.toLowerCase().includes(q))
      );
    }
    return docs;
  },

  addKnowledgeDocument(docData: Omit<KnowledgeDocument, 'id' | 'lastUpdated'>): KnowledgeDocument {
    const docs = this.getKnowledge();
    const newDoc: KnowledgeDocument = {
      ...docData,
      id: `kb-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    docs.push(newDoc);
    setStored(STORAGE_KEYS.KNOWLEDGE, docs);
    return newDoc;
  },

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return getStored<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
  },

  addAuditLog(logData: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress'> & { ipAddress?: string }): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...logData,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ipAddress: logData.ipAddress || '127.0.0.1 (Authenticated Client)',
    };
    logs.unshift(newLog);
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // Reset demo state
  resetToDemo(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.FIELDS);
    localStorage.removeItem(STORAGE_KEYS.CASES);
    localStorage.removeItem(STORAGE_KEYS.HOTSPOTS);
    localStorage.removeItem(STORAGE_KEYS.VISITS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.KNOWLEDGE);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  }
};
