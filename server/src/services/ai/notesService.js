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

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      {
        role: 'system',
        content: `You are a nursing education expert. Generate a comprehensive study note for the topic: "${topic}". 
        
        The note should be a JSON object with this exact structure:
        {
          "title": "Topic Title (uppercase)",
          "type": "${classification.type}",
          "icon": "${template.icon}",
          "sections": [
            {
              "title": "Section Title (title case)",
              "content": ["Detailed content as bullet points", "More details", "Key points"]
            }
          ],
          "golden_point": "One memorable exam tip or clinical pearl"
        }

        Sections to include: ${sections}

        Keep content concise, exam-focused, and clinically accurate. Each section should have 3-5 bullet points. Return ONLY valid JSON.`
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
    topic
  };
}