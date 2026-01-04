class IntentInference {
  inferFromQuery(query) {
    const lower = query.toLowerCase();
    
    if (lower.includes('safe') || lower.includes('bad') || lower.includes('danger')) {
      return { primaryIntent: 'safety_check', confidence: 0.9 };
    }
    if (lower.includes('sugar') || lower.includes('carb') || lower.includes('fat')) {
      return { primaryIntent: 'macro_check', confidence: 0.85 };
    }
    if (lower.includes('vegan') || lower.includes('vegetarian') || lower.includes('halal')) {
      return { primaryIntent: 'dietary_compliance', confidence: 0.9 };
    }
    
    return { primaryIntent: 'general_inquiry', confidence: 0.5 };
  }

  generateSuggestedQuestions(analysis) {
    const questions = [];
    
    if (analysis.insights?.summary?.verdict === 'avoid') {
      questions.push("Why should I avoid this?");
      questions.push("What is a healthier alternative?");
    }
    
    if (analysis.ingredients?.length > 10) {
      questions.push("Which ingredients are preservatives?");
    }

    // Default fallbacks
    if (questions.length < 3) {
      questions.push("Is this safe for daily consumption?");
      questions.push("Explain the nutrition profile.");
    }

    return questions.slice(0, 3);
  }
}

export default new IntentInference();