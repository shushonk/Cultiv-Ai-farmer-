import { AIPrediction, RiskLevel, SeverityLevel, WeatherCondition } from '../types';

export interface ImageQualityReport {
  passed: boolean;
  blurScore: number; // 0-100 (higher is sharper)
  exposureScore: number; // 0-100 (50 is optimal)
  resolution: string;
  isPlantDetected: boolean;
  message?: string;
}

export interface RiskCalculationResult {
  overallRisk: RiskLevel;
  score: number; // 0 - 100
  factors: {
    diseaseProbabilityScore: number;
    weatherSuitabilityScore: number;
    cropSusceptibilityScore: number;
    regionalPressureScore: number;
  };
  explanation: string;
}

export const AIEngine = {
  /**
   * Evaluates image quality prior to diagnostic analysis.
   */
  async validateImageQuality(file: File | string): Promise<ImageQualityReport> {
    // Simulate high-performance client-side WebGL / Canvas edge detection
    return new Promise((resolve) => {
      setTimeout(() => {
        // Random slight variance simulating edge sharpness and histogram calculation
        const blurScore = Math.floor(75 + Math.random() * 22);
        const exposureScore = Math.floor(70 + Math.random() * 25);
        const isPlantDetected = true;
        const passed = blurScore >= 60 && exposureScore >= 50 && isPlantDetected;

        resolve({
          passed,
          blurScore,
          exposureScore,
          resolution: '1080 x 1440 HD',
          isPlantDetected,
          message: passed
            ? 'Image sharpness, exposure, and leaf ROI verified.'
            : 'The image may be unclear or poorly lit. Please upload a closer image of the affected leaf or plant.',
        });
      }, 600);
    });
  },

  /**
   * Simulates computer vision deep-learning model prediction on crop leaf imagery.
   */
  async analyzeCrop(crop: string, stage: string, symptomsHint?: string): Promise<AIPrediction> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cropLower = crop.toLowerCase();

        if (cropLower.includes('tomato')) {
          resolve({
            condition: 'Tomato Early Blight',
            scientificName: 'Alternaria solani',
            confidence: 0.89,
            severity: 'Moderate',
            risk: 'HIGH',
            type: 'Fungal Disease',
            observedIndicators: [
              'Concentric dark brown circular lesions (target board pattern)',
              'Chlorotic yellow halos encircling older infected leaf tissue',
              'Lower canopy foliar necrosis with premature defoliation'
            ],
            riskFactors: [
              'Continuous relative humidity exceeding 82% during vegetative/flowering phases',
              'Warm canopy microclimate (25°C to 28°C) with morning dew accumulation',
              'Dense planting density restricting inter-row air circulation'
            ],
            recommendedSteps: [
              'Inspect adjacent tomato rows and mark plants showing concentric lesions.',
              'Prune senescent bottom leaves (up to 30 cm above soil) and safely dispose of debris.',
              'Apply prophylactic bio-fungicide: Pseudomonas fluorescens (0.5% w/v) or Trichoderma harzianum.',
              'If rapid sporulation occurs, apply contact copper fungicide (Copper Oxychloride 50 WP @ 2.5 g/L).',
              'Submit diagnostic case to expert queue and log 48-hour follow-up image.'
            ],
            boundingBoxes: [
              { x: 26, y: 32, width: 38, height: 30, label: 'Alternaria target lesion', confidence: 0.92 },
              { x: 58, y: 44, width: 26, height: 35, label: 'Marginal chlorosis', confidence: 0.86 }
            ],
            disclaimer: 'AI-generated preliminary assessment — not a laboratory-confirmed diagnosis. Follow locally approved IPM guidance.'
          });
        } else if (cropLower.includes('rice') || cropLower.includes('paddy')) {
          resolve({
            condition: 'Rice Blast',
            scientificName: 'Magnaporthe oryzae',
            confidence: 0.93,
            severity: 'High',
            risk: 'CRITICAL',
            type: 'Fungal Disease',
            observedIndicators: [
              'Spindle/diamond-shaped foliar lesions with greyish necrotic center and reddish-brown margin',
              'Collar blighting at the junction of leaf sheath and blade',
              'Early tillering node discoloration'
            ],
            riskFactors: [
              'High relative humidity (>90%) with prolonged leaf wetness period (>8 hrs)',
              'Excessive single-split application of nitrogenous fertilizer (Urea)',
              'Cool night temperatures (19-23°C) followed by cloudy overcast days'
            ],
            recommendedSteps: [
              'Suspend further split application of urea immediately to curtail succulent host growth.',
              'Regulate water level to 2-3 cm film; drain stagnant floodwater where practical.',
              'Spray systemic blast protectant: Tricyclazole 75 WP @ 0.6 g/L or Kasugamycin 3% SL @ 2 ml/L.',
              'Ensure thorough canopy spray penetration using a hollow-cone nozzle with adjuvant sticker.',
              'Coordinate with local agriculture officer for regional surveillance tracking.'
            ],
            boundingBoxes: [
              { x: 30, y: 25, width: 40, height: 45, label: 'Spindle blast lesion', confidence: 0.94 }
            ],
            disclaimer: 'AI-generated preliminary assessment — not a laboratory-confirmed diagnosis. Follow locally approved IPM guidance.'
          });
        } else if (cropLower.includes('chilli') || cropLower.includes('pepper')) {
          resolve({
            condition: 'Chilli Anthracnose / Die-back',
            scientificName: 'Colletotrichum capsici',
            confidence: 0.86,
            severity: 'Moderate',
            risk: 'HIGH',
            type: 'Fungal Disease',
            observedIndicators: [
              'Circular sunken spots on ripening fruit with concentric rings of dark acervuli',
              'Die-back necrosis starting from tender branch tips progressing downwards',
              'Foliar spotting with necrotic leaf drop'
            ],
            riskFactors: [
              'Heavy intermittent rains during fruit development stage',
              'Warm humid weather with temperature around 28°C and RH >80%',
              'Overhead irrigation splashing fungal spores from soil'
            ],
            recommendedSteps: [
              'Collect and burn infected twigs and mummified fruits on field perimeter.',
              'Spray Azoxystrobin 23% SC @ 1 ml/L or Mancozeb 75 WP @ 2.5 g/L.',
              'Maintain drip irrigation to avoid wet foliage during afternoon hours.',
              'Ensure adequate Potassium nutrition to strengthen fruit cuticle.',
              'Log progress in CultivAI Case timeline in 3 days.'
            ],
            boundingBoxes: [
              { x: 35, y: 40, width: 32, height: 35, label: 'Sunken anthracnose rot', confidence: 0.88 }
            ],
            disclaimer: 'AI-generated preliminary assessment — not a laboratory-confirmed diagnosis. Follow locally approved IPM guidance.'
          });
        } else if (cropLower.includes('cotton')) {
          resolve({
            condition: 'Cotton Bacterial Blight (Angular Leaf Spot)',
            scientificName: 'Xanthomonas citri pv. malvacearum',
            confidence: 0.85,
            severity: 'Moderate',
            risk: 'MODERATE',
            type: 'Bacterial Disease',
            observedIndicators: [
              'Water-soaked angular foliar spots bounded by leaf veins',
              'Black arm lesions on stems and petioles',
              'Boll rotting in advanced stages'
            ],
            riskFactors: [
              'Wind-driven rain spreading bacterial ooze between plants',
              'Warm temperatures between 28-32°C'
            ],
            recommendedSteps: [
              'Spray Streptocycline (100 ppm) 1 g/10 L + Copper Oxychloride 50 WP 25 g/10 L.',
              'Avoid working in wet cotton fields to prevent mechanical transmission.',
              'Maintain balanced soil drainage.'
            ],
            boundingBoxes: [
              { x: 28, y: 30, width: 44, height: 38, label: 'Angular vein-bound spot', confidence: 0.87 }
            ],
            disclaimer: 'AI-generated preliminary assessment — follow approved agronomy recommendations.'
          });
        } else {
          // General / Corn / Pulse
          resolve({
            condition: 'Foliar Leaf Spot & Nutrient Imbalance',
            scientificName: 'Cercospora spp. / Nitrogen Stress',
            confidence: 0.82,
            severity: 'Moderate',
            risk: 'MODERATE',
            type: 'Fungal Disease',
            observedIndicators: [
              'Irregular brown spotting on older foliage',
              'Interveinal chlorosis and leaf tip necrosis'
            ],
            riskFactors: [
              'Prolonged humidity with intermittent rain spells',
              'Leaching of soil macronutrients'
            ],
            recommendedSteps: [
              'Apply balanced foliar 19:19:19 water-soluble fertilizer @ 5g/L.',
              'Spray prophylactic bio-fungicide Trichoderma viride @ 5g/L.',
              'Request expert review for confirmation.'
            ],
            boundingBoxes: [
              { x: 30, y: 35, width: 40, height: 35, label: 'Cercospora spot', confidence: 0.84 }
            ],
            disclaimer: 'AI-generated preliminary assessment — not a laboratory-confirmed diagnosis.'
          });
        }
      }, 1200);
    });
  },

  /**
   * Explainable Multi-Factor Risk Calculation Engine:
   * Combines AI Disease Probability (35%), Microclimate Weather Suitability (25%),
   * Crop Phenological Susceptibility (20%), and Regional Epidemic Pressure (20%).
   */
  calculateRisk(
    diseaseProbScore: number, // 0-100
    weather: WeatherCondition,
    cropStage: string,
    regionalHotspotCaseCount: number = 25
  ): RiskCalculationResult {
    // 1. Weather Suitability Score (0-100)
    let weatherSuitabilityScore = 50;
    if (weather.humidity >= 85 && weather.temperature >= 24 && weather.temperature <= 32) {
      weatherSuitabilityScore = 92;
    } else if (weather.humidity >= 75) {
      weatherSuitabilityScore = 78;
    } else if (weather.humidity >= 60) {
      weatherSuitabilityScore = 55;
    } else {
      weatherSuitabilityScore = 30;
    }

    if (weather.rainProbability > 60 || weather.rainfallMm > 10) {
      weatherSuitabilityScore = Math.min(100, weatherSuitabilityScore + 10);
    }

    // 2. Crop Stage Susceptibility (0-100)
    let cropSusceptibilityScore = 60;
    const stageLower = cropStage.toLowerCase();
    if (stageLower.includes('flowering') || stageLower.includes('fruiting') || stageLower.includes('tillering')) {
      cropSusceptibilityScore = 85; // highly sensitive stages
    } else if (stageLower.includes('vegetative') || stageLower.includes('seedling')) {
      cropSusceptibilityScore = 70;
    } else if (stageLower.includes('maturity') || stageLower.includes('harvest')) {
      cropSusceptibilityScore = 45;
    }

    // 3. Regional Pressure Score (0-100)
    const regionalPressureScore = Math.min(100, Math.max(20, regionalHotspotCaseCount * 2.2));

    // Calculate weighted sum
    const overallScore = Math.round(
      diseaseProbScore * 0.35 +
      weatherSuitabilityScore * 0.25 +
      cropSusceptibilityScore * 0.20 +
      regionalPressureScore * 0.20
    );

    let overallRisk: RiskLevel = 'LOW';
    if (overallScore >= 80) overallRisk = 'CRITICAL';
    else if (overallScore >= 65) overallRisk = 'HIGH';
    else if (overallScore >= 45) overallRisk = 'MODERATE';
    else overallRisk = 'LOW';

    const explanation = `Overall risk calculated as ${overallRisk} (${overallScore}/100) based on ${diseaseProbScore}% disease detection probability, high microclimate suitability (${weatherSuitabilityScore}/100 due to ${weather.humidity}% RH & ${weather.temperature}°C), vulnerable ${cropStage} phase (${cropSusceptibilityScore}/100), and active regional pressure (${regionalPressureScore}/100).`;

    return {
      overallRisk,
      score: overallScore,
      factors: {
        diseaseProbabilityScore: diseaseProbScore,
        weatherSuitabilityScore,
        cropSusceptibilityScore,
        regionalPressureScore,
      },
      explanation,
    };
  }
};
