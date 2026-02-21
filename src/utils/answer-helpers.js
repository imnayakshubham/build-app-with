/**
 * Helper functions for processing user answers and feature selections
 * Follows Single Responsibility Principle
 */

import { VITE_PRESETS, PRESET_FEATURES } from '../constants/vite-features.js';

/**
 * Merges preset defaults with user selections
 * @param {Array} defaults - Default values from preset
 * @param {Array} userSelections - User selected values
 * @returns {Array} Merged array with no duplicates
 */
export function mergeFeatures(defaults, userSelections) {
  if (!userSelections || userSelections.length === 0) {
    return defaults;
  }
  return [...new Set([...defaults, ...userSelections])];
}

/**
 * Applies preset features to answers object
 * @param {Object} answers - User answers object
 * @param {string} preset - Preset name
 * @returns {Object} Updated answers object
 */
export function applyPresetFeatures(answers, preset) {
  const presetConfig = PRESET_FEATURES[preset];

  if (!presetConfig) {
    return answers;
  }

  // Apply defaults only if user hasn't selected anything
  // Routing
  if (!answers.routing || answers.routing.length === 0) {
    answers.routing = presetConfig.routing;
  } else if (presetConfig.routing.length > 0) {
    answers.routing = mergeFeatures(presetConfig.routing, answers.routing);
  }

  // State Management
  if (!answers.stateMgmt && presetConfig.stateMgmt) {
    answers.stateMgmt = presetConfig.stateMgmt;
  }

  // Forms
  if (!answers.forms || answers.forms.length === 0) {
    answers.forms = presetConfig.forms;
  } else if (presetConfig.forms.length > 0) {
    answers.forms = mergeFeatures(presetConfig.forms, answers.forms);
  }

  // Animations
  if (!answers.animations || answers.animations.length === 0) {
    answers.animations = presetConfig.animations;
  } else if (presetConfig.animations.length > 0) {
    answers.animations = mergeFeatures(presetConfig.animations, answers.animations);
  }

  // Utilities
  if (!answers.utilities || answers.utilities.length === 0) {
    answers.utilities = presetConfig.utilities;
  } else if (presetConfig.utilities.length > 0) {
    answers.utilities = mergeFeatures(presetConfig.utilities, answers.utilities);
  }

  return answers;
}

/**
 * Determines if user should see feature prompts
 * @param {Object} answers - User answers
 * @returns {boolean} True if feature prompts should be shown
 */
export function shouldShowFeaturePrompts(answers) {
  return answers.framework === 'vite-react' &&
    answers.vitePreset &&
    answers.vitePreset !== VITE_PRESETS.STARTER;
}

/**
 * Converts vitePreset to setupType for backward compatibility
 * @param {string} vitePreset - Vite preset value
 * @returns {string} Setup type value
 */
export function presetToSetupType(vitePreset) {
  return vitePreset === VITE_PRESETS.CUSTOM ? 'customize' : 'default';
}

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