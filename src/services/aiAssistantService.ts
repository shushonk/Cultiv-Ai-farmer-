import { User, Field, CaseRecord } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export const AIAssistantService = {
  getInitialWelcomeMessage(user: User, field?: Field, activeCases?: CaseRecord[]): ChatMessage {
    const role = user.role;
    let text = '';
    let suggestions: string[] = [];

    if (role === 'FARMER') {
      const fieldName = field ? field.name : 'your crop parcel';
      const cropName = field ? field.crop : 'Tomato';
      text = `Namaste ${user.name}! I am your CultivAI Agronomy Assistant. I'm actively monitoring **${fieldName} (${cropName})**. How can I assist you with your field observations, weather alerts, or IPM guidance today?`;
      suggestions = [
        `Why are my ${cropName} leaves turning yellow with brown rings?`,
        `What should I inspect in my field today given the humid weather?`,
        `Is the current forecast risky for fungal spore spread?`,
        `How do I submit another leaf sample for Dr. Sunita Rao to review?`,
      ];
    } else if (role === 'EXPERT') {
      text = `Welcome, ${user.name}. I am CultivAI's Diagnostic Copilot. I can assist you with epidemiological correlations, pathogen symptomology, CIBRC chemical label checks, and IPM protocol drafting.`;
      suggestions = [
        'Summarize recent Alternaria resistance reports in Kolar belt',
        'Compare Tricyclazole vs Isoprothiolane Pre-Harvest Intervals',
        'Analyze temperature-humidity incubation curve for Downy Mildew',
      ];
    } else if (role === 'OFFICER') {
      text = `Greetings, Officer ${user.name}. I am your Regional Surveillance Assistant. I can help synthesize district outbreak clusters, calculate acreage at risk, and prepare extension advisories.`;
      suggestions = [
        'Which taluks have rising blast cluster alerts this week?',
        'Draft a community SMS advisory for high-humidity fungal risk',
        'List pending field verification visits in Mulbagal sector',
      ];
    } else {
      text = `Hello ${user.name}. CultivAI Admin Assistant is ready. System uptime is 99.98% across 10 monitored agro-climatic zones.`;
      suggestions = [
        'Review recent user role audit logs',
        'Check database sync and active session counts',
        'Add new crop variety into ontology registry',
      ];
    }

    return {
      id: `chat-init-${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions,
    };
  },

  async askAssistant(
    prompt: string,
    user: User,
    field?: Field,
    cases?: CaseRecord[]
  ): Promise<ChatMessage> {
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: prompt,
          role: user.role,
          crop: field?.crop || 'Tomato',
          location: `${user.location?.district || 'Kolar'}, ${user.location?.state || 'Karnataka'}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.answer) {
          return {
            id: `chat-resp-${Date.now()}`,
            sender: 'assistant',
            text: data.answer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: [
              `What is the recommended sprayer pressure and nozzle type for ${field?.crop || 'Tomato'}?`,
              `What bio-pesticide dosage is safe during early fruiting stage?`,
              `How do I protect my crop during humid overcast weather?`,
            ],
          };
        }
      }
    } catch (err) {
      console.warn('[CultivAI] Copilot API fetch error, using agronomic model fallback:', err);
    }

    // Dynamic agronomic fallback
    const cropName = field?.crop || 'Tomato';
    const fieldName = field?.name || 'Main Plot';
    return {
      id: `chat-resp-${Date.now()}`,
      sender: 'assistant',
      text: `### 🌱 CultivAI Agronomy Advisory\n\nRegarding your inquiry: **"${prompt}"**\n\n- **Field Location:** ${fieldName} (${cropName})\n- **Health Status:** ${field?.healthStatus || 'Active Surveillance'}\n\n**Agronomic Guidance:**\n1. Ensure adequate airflow in canopy by pruning lowest senescent leaves.\n2. Avoid late-afternoon overhead irrigation to limit canopy leaf wetness duration.\n3. For fungal or bacterial leaf spots, apply bio-agents like *Trichoderma harzianum* @ 5g/L or CIBRC approved protective sprays following recommended Pre-Harvest Intervals (PHI).\n\nConsult your local KVK extension officer for field verification.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'How do I calculate disease risk for my field?',
        'What are recommended IPM cultural practices?',
      ],
    };
  }
};
