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
    return new Promise((resolve) => {
      setTimeout(() => {
        const pLower = prompt.toLowerCase();
        let responseText = '';
        let newSuggestions: string[] = [];

        if (pLower.includes('yellow') || pLower.includes('blight') || pLower.includes('leaves') || pLower.includes('spot')) {
          responseText = `### 🌿 Diagnostic Assessment: Foliar Chlorosis & Concentric Spotting\n\nBased on your crop context (**${field?.crop || 'Tomato'}**, ${field?.cropStage || 'Flowering Stage'}) and current **84% Relative Humidity**:\n\n1. **Likely Cause:** Concentric yellow-haloed lesions are characteristic of **Alternaria Early Blight**.\n2. **Immediate Action:**\n   - Prune infected lower senescent leaves (bottom 25-30 cm) and avoid leaving debris in furrows.\n   - Avoid overhead watering during afternoon hours to reduce leaf wetness duration.\n3. **Safe Bio-Protection:** Spray *Pseudomonas fluorescens* (0.5% w/v) or *Trichoderma harzianum* during early morning hours.\n4. **Expert Escalation:** If lesions spread to upper third of canopy, submit an updated scan to Dr. Sunita Rao for chemical prescription.`;
          newSuggestions = [
            'What is the recommended sprayer pressure and nozzle type?',
            'How many days should I wait before uploading a follow-up picture?',
            'What is the Pre-Harvest Interval for copper sprays?',
          ];
        } else if (pLower.includes('weather') || pLower.includes('forecast') || pLower.includes('rain') || pLower.includes('risk')) {
          responseText = `### ☁️ Microclimate Weather Intelligence Risk Brief\n\n- **Current Conditions:** 27.5°C with **84% Relative Humidity** and intermittent overcast.\n- **Fungal Infection Potential:** **HIGH (Score 82/100)**. Alternaria and Phytophthora spores germinate when leaf wetness exceeds 6 hours.\n- **Pest Surge Index:** **MODERATE (Score 55/100)**. Thrips and whiteflies moderate; watch for aphid colonies on tender shoots.\n- **Actionable Advice:** Postpone any foliar chemical application until a guaranteed 4-hour dry rain-free window is available. Ensure drainage channels are clear.`;
          newSuggestions = [
            'Show 7-day weather trend for Kolar district',
            'Is it safe to apply fertigation today?',
          ];
        } else if (pLower.includes('expert') || pLower.includes('sample') || pLower.includes('submit')) {
          responseText = `### 👨‍🔬 Expert Verification Protocol\n\nYour case has been queued with our ICAR-certified plant pathology panel:\n\n1. **Lead Pathologist:** Dr. Sunita Rao, Ph.D. (IIHR)\n2. **Status:** Under Review (Priority High)\n3. **Average Turnaround:** Under 3 hours for critical cases.\n4. **Recommended Next Step:** Take 1 clear close-up picture of the upper leaf surface and 1 picture of the underside to assist laboratory review.`;
          newSuggestions = [
            'Open Case Management view',
            'Send a direct message to Dr. Sunita Rao',
          ];
        } else if (pLower.includes('advisory') || pLower.includes('sms') || pLower.includes('cluster') || pLower.includes('hotspot')) {
          responseText = `### 📢 Surveillance & Advisory Generator\n\n**Draft Alert for Kolar District (Mulbagal / Srinivaspur):**\n> *"ATTN FARMERS: Sustained morning fog and humidity >85% has triggered early blast and blight alerts across 420 acres. Inspect lower canopies immediately. Avoid excess nitrogen top-dressing. Contact extension officer for bio-control formulations."*\n\nWould you like to broadcast this alert to the 10 registered farmer contacts in this sector?`;
          newSuggestions = [
            'Approve and broadcast alert',
            'View regional hotspot coordinates',
          ];
        } else {
          responseText = `### 🌱 CultivAI Agronomy Insights\n\nI have analyzed your query regarding *"${prompt}"* against our agronomic knowledge base and microclimate sensor models:\n\n- **Field Focus:** ${field?.name || 'Main Parcel'} (${field?.crop || 'Tomato'})\n- **Health Metric:** ${field?.healthStatus || 'Under Surveillance'}\n- **Recommendation:** Maintain integrated pest management (IPM) practices, prioritize sanitation and bio-control agents, and maintain strict Pre-Harvest Intervals (PHI) for all interventions.\n\nLet me know if you would like me to check specific disease symptoms, soil nutrient parameters, or weather risks!`;
          newSuggestions = [
            'How do I calculate explainable disease risk?',
            'What are the safe IPM cultural practices for my field?',
          ];
        }

        resolve({
          id: `chat-resp-${Date.now()}`,
          sender: 'assistant',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: newSuggestions,
        });
      }, 700);
    });
  }
};
