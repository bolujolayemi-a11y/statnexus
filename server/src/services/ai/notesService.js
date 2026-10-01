import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY });

const NOTE_TEMPLATES = {
  drug: {
    sections: ['drug_class', 'mechanism', 'indications', 'contraindications', 'routes', 'dosage', 'side_effects', 'toxicity_signs', 'antidote', 'nursing_responsibilities', 'golden_point'],
    icon: '💊'
  },
  organ: {
    sections: ['location', 'anatomy', 'functions', 'blood_supply', 'innervation', 'physiology', 'clinical_relevance', 'common_disorders', 'golden_point'],
    icon: '🫀'
  },
  instrument: {
    sections: ['what_it_is', 'types', 'parts', 'indications', 'contraindications', 'equipment', 'procedure', 'precautions', 'complications', 'nursing_responsibilities', 'golden_point'],
    icon: '🩺'
  },
  disease: {
    sections: ['definition', 'causative_organism', 'transmission', 'risk_factors', 'pathophysiology', 'signs_symptoms', 'investigations', 'treatment', 'complications', 'prevention', 'nursing_management', 'golden_point'],
    icon: '🦠'
  },
  procedure: {
    sections: ['definition', 'indications', 'preparation', 'equipment', 'procedure_steps', 'post_procedure_care', 'complications', 'documentation', 'nursing_responsibilities', 'golden_point'],
    icon: '💉'
  },
  lab_test: {
    sections: ['definition', 'purpose', 'normal_values', 'abnormal_findings', 'clinical_significance', 'nursing_implications', 'patient_preparation', 'golden_point'],
    icon: '🧪'
  },
  emergency: {
    sections: ['definition', 'recognition', 'immediate_actions', 'secondary_assessment', 'treatment', 'medications', 'monitoring', 'documentation', 'golden_point'],
    icon: '🚑'
  },
  nursing_concept: {
    sections: ['definition', 'importance', 'principles', 'application', 'assessment', 'interventions', 'evaluation', 'golden_point'],
    icon: '📋'
  }
};

const WHO_GUIDANCE = [
  {
    title: 'WHO Labour Care Guide: User’s Manual',
    url: 'https://www.who.int/publications/i/item/9789240017566',
    focus: 'A woman-centred tool for monitoring labour, including supportive care and maternal and fetal wellbeing. Use its alert thresholds to prompt assessment, not as automatic indications for intervention.',
    keywords: ['labour', 'labor', 'childbirth', 'intrapartum', 'labour care guide', 'labor care guide', 'partograph', 'partogram']
  },
  {
    title: 'WHO E-MOTIVE approach to postpartum haemorrhage',
    url: 'https://www.who.int/teams/sexual-and-reproductive-health-and-research-(srh)/areas-of-work/maternal-and-perinatal-health/e-motive',
    focus: 'Early detection and bundled first-response treatment for postpartum haemorrhage; the bundle includes uterine massage, oxytocics, tranexamic acid, intravenous fluids, examination and escalation.',
    keywords: ['e-motive', 'emotive', 'postpartum haemorrhage', 'postpartum hemorrhage', 'post-partum haemorrhage', 'post-partum hemorrhage', 'pph', 'uterine atony']
  },
  {
    title: 'WHO recommendations on intrapartum care for a positive childbirth experience',
    url: 'https://www.who.int/publications/i/item/9789241550215',
    focus: 'Evidence-informed care during labour and childbirth, emphasizing respectful, person-centred care and positive childbirth experience.',
    keywords: ['intrapartum', 'childbirth', 'labour', 'labor', 'birth experience', 'delivery care']
  },
  {
    title: 'WHO recommendations on antenatal care for a positive pregnancy experience',
    url: 'https://www.who.int/publications/i/item/9789241549912',
    focus: 'Routine antenatal care, including nutrition, maternal and fetal assessment, preventive measures and quality of care.',
    keywords: ['antenatal', 'prenatal', 'pregnancy', 'anc', 'antenatal care']
  },
  {
    title: 'WHO recommendations on maternal and newborn care for a positive postnatal experience',
    url: 'https://www.who.int/publications/i/item/9789240045989',
    focus: 'Essential routine postnatal care for women and newborns in facility and community settings.',
    keywords: ['postnatal', 'postpartum care', 'newborn care', 'puerperium', 'breastfeeding', 'lactation']
  },
  {
    title: 'WHO medical eligibility criteria for contraceptive use',
    url: 'https://www.who.int/publications/i/item/9789241563888',
    focus: 'Evidence-based medical eligibility recommendations for contraceptive methods in people with specific characteristics or medical conditions.',
    keywords: ['contraception', 'contraceptive', 'family planning', 'birth control', 'intrauterine device', 'iud']
  },
  {
    title: 'WHO Abortion care guideline',
    url: 'https://www.who.int/publications/i/item/9789240039483',
    focus: 'Evidence-based recommendations for quality abortion care, including clinical care and service delivery.',
    keywords: ['abortion', 'misoprostol abortion', 'mifepristone', 'post-abortion care']
  },
  {
    title: 'WHO guidelines on hand hygiene in health care',
    url: 'https://www.who.int/publications/i/item/9789241597906',
    focus: 'Evidence review and recommendations to improve hand hygiene and reduce transmission of pathogens in healthcare settings.',
    keywords: ['hand hygiene', 'handwashing', 'hand washing', 'infection prevention', 'infection control', 'aseptic technique']
  },
  {
    title: 'WHO recommendations for prevention and treatment of pre-eclampsia and eclampsia',
    url: 'https://www.who.int/publications/i/item/9789241548335',
    focus: 'Evidence-informed recommendations to prevent and treat pre-eclampsia and eclampsia during pregnancy and childbirth.',
    keywords: ['pre-eclampsia', 'preeclampsia', 'eclampsia', 'pregnancy hypertension', 'hypertension in pregnancy']
  },
  {
    title: 'WHO consolidated guidelines on tuberculosis: drug-susceptible TB treatment',
    url: 'https://www.who.int/publications/i/item/9789240048126',
    focus: 'Current WHO recommendations for treatment and care of drug-susceptible tuberculosis; confirm regimen details against the latest WHO updates and local policy.',
    keywords: ['tuberculosis', 'tb treatment', 'drug-susceptible tb', 'rifampicin', 'isoniazid']
  },
  {
    title: 'Global Patient Safety Action Plan 2021-2030',
    url: 'https://www.who.int/publications/i/item/9789240032705',
    focus: 'WHO strategic framework for reducing avoidable harm and improving safety and quality across health services through 2030; it is a systems-level action plan, not a bedside procedure protocol.',
    keywords: ['patient safety', 'medication safety', 'medication error', 'adverse event', 'near miss', 'clinical handover', 'safety culture', 'fall prevention', 'falls prevention']
  },
  {
    title: 'WHO guideline on self-care interventions for health and well-being, 2022 revision',
    url: 'https://www.who.int/publications/i/item/9789240052192',
    focus: 'Revised WHO recommendations on self-care interventions; WHO identifies a living guideline version, so check the linked guideline platform for updates before using specific recommendations.',
    keywords: ['self-care', 'self care', 'self-management', 'self management', 'home care', 'health promotion']
  },
  {
    title: 'WHO core components of infection prevention and control programmes',
    url: 'https://www.who.int/publications/i/item/9789241549929',
    focus: 'Foundational 2016 WHO guidance for infection prevention and control programmes at national and health-facility levels; check current WHO updates and local IPC protocols for operational details.',
    keywords: ['infection prevention programme', 'infection prevention and control', 'ipc programme', 'healthcare-associated infection', 'hospital-acquired infection', 'isolation precautions', 'standard precautions']
  },
  {
    title: 'WHO-ICRC Basic Emergency Care: approach to the acutely ill and injured',
    url: 'https://www.who.int/publications/i/item/9789241513081',
    focus: 'WHO-ICRC first-contact emergency assessment and management resource. The WHO page includes postpartum-haemorrhage quick-card material updated in November 2025; follow linked current resources and local emergency protocols.',
    keywords: ['basic emergency care', 'emergency triage', 'acute illness', 'acutely ill', 'abcde', 'sbar', 'trauma assessment', 'emergency assessment', 'postpartum haemorrhage', 'postpartum hemorrhage', 'pph']
  }
];

export function findWhoGuidance(topic) {
  const normalizedTopic = topic.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  return WHO_GUIDANCE
    .filter((guidance) => guidance.keywords.some((keyword) => normalizedTopic.includes(keyword)))
    .slice(0, 4)
    .map(({ title, url, focus }) => ({ title, url, focus }));
}

async function classifyTopic(topic) {
  try {
    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: `You are a medical classification expert. Classify the given nursing/medical topic into one of these categories: drug, organ, instrument, disease, procedure, lab_test, emergency, nursing_concept. Return ONLY the category name as a single word.`
        },
        {
          role: 'user',
          content: topic
        }
      ],
      temperature: 0.1,
      max_tokens: 10
    });

    const classification = response.choices[0].message.content.toLowerCase().trim();
    return { type: classification, template: NOTE_TEMPLATES[classification] || NOTE_TEMPLATES.nursing_concept };
  } catch (error) {
    console.error('Classification error:', error);
    return { type: 'nursing_concept', template: NOTE_TEMPLATES.nursing_concept };
  }
}

async function generateStructuredNote(topic, classification) {
  const template = classification.template;
  const sections = template.sections.join(', ');
  const whoGuidance = findWhoGuidance(topic);
  const whoContext = whoGuidance.length
    ? whoGuidance.map(({ title, focus, url }) => `- ${title}: ${focus} Official source: ${url}`).join('\n')
    : 'No directly matched WHO guideline is in the curated reference list. Do not imply that the note is based on a specific WHO guideline.';

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      {
        role: 'system',
        content: `You are a nursing education expert. Generate a comprehensive study note for the topic: "${topic}".

        WHO guidance context for this topic:
        ${whoContext}

        Use relevant WHO guidance context when applicable. Do not invent exact recommendation wording, thresholds, dates, or recommendation strength. Distinguish WHO guidance from local protocols, and flag details that should be checked in the linked current source. If no relevant source is listed, do not claim WHO endorsement.
        
        The note should be a JSON object with this exact structure:
        {
          "title": "Topic Title (uppercase)",
          "type": "${classification.type}",
          "icon": "${template.icon}",
          "sections": [
            {
              "title": "Section Title (title case, uppercase style like a poster banner)",
              "content": [
                {"heading": "Short bold key term (2-5 words)", "description": "One or two short supporting sentences"},
                {"heading": "Next key term", "description": "Short supporting detail"}
              ]
            }
          ],
          "golden_point": "One memorable exam tip or clinical pearl"
        }

        Sections to include: ${sections}

        Keep content concise, exam-focused, and clinically accurate. Each section should have 2-5 items, each item being a short bold heading (2-5 words) with a one-to-two sentence description. Return ONLY valid JSON.`
      },
      {
        role: 'user',
        content: topic
      }
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function generateStudyNote(topic, classifyOnly = false) {
  // First classify the topic
  const classification = await classifyTopic(topic);
  
  if (classifyOnly) {
    return classification;
  }

  // Generate the structured note
  const note = await generateStructuredNote(topic, classification);
  
  return {
    ...note,
    generated_at: new Date().toISOString(),
    topic,
    who_guidance: findWhoGuidance(topic)
  };
}