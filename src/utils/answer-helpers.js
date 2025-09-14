/**
 * Helper functions for safely accessing answer properties
 */

/**
 * Safely check if a feature is enabled
 */
export function hasFeature(answers, feature) {
  return answers.features && Array.isArray(answers.features) && answers.features.includes(feature);
}

/**
 * Get features array or empty array if undefined
 */
export function getFeatures(answers) {
  return answers.features || [];
}

/**
 * Safely get a property with a default value
 */
export function getProperty(answers, property, defaultValue = '') {
  return answers[property] || defaultValue;
}