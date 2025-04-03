
import axios from 'axios';

// Interface for speech synthesis parameters
interface VoiceParams {
  rate: number;
  pitch: number;
  volume: number;
  preferredVoice?: string;
}

// Cache available voices
let availableVoices: SpeechSynthesisVoice[] = [];

// Initialize voices when speech synthesis is ready
if (typeof window !== 'undefined' && window.speechSynthesis) {
  const loadVoices = () => {
    availableVoices = window.speechSynthesis.getVoices();
  };
  
  // Load voices if already available
  loadVoices();
  
  // Set up event listener for when voices change or load
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Find the best matching voice based on preferences
 */
function findBestVoice(preferredVoice?: string): SpeechSynthesisVoice | undefined {
  if (!availableVoices.length) {
    availableVoices = window.speechSynthesis.getVoices();
  }
  
  // First try to find the preferred voice
  if (preferredVoice) {
    const exactMatch = availableVoices.find(v => v.name === preferredVoice);
    if (exactMatch) return exactMatch;
    
    // Try to find a voice that contains the preferred name (partial match)
    const partialMatch = availableVoices.find(v => v.name.includes(preferredVoice));
    if (partialMatch) return partialMatch;
  }
  
  // Preferred neural voices in order of preference
  const preferredVoices = [
    'Google US English', 'Google UK English Female', 
    'Microsoft David - English (United States)',
    'Microsoft Zira - English (United States)',
    'en-US', 'en-GB'
  ];
  
  // Try to find one of the preferred voices
  for (const voiceName of preferredVoices) {
    const voice = availableVoices.find(v => 
      v.name.includes(voiceName) || 
      v.lang.includes(voiceName)
    );
    if (voice) return voice;
  }
  
  // Fall back to the first English voice
  return availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
}

/**
 * Speak text with improved quality
 */
export async function speak(text: string): Promise<void> {
  try {
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    // Get optimized text and voice parameters from the server
    const response = await axios.post('/api/speak', { text });
    const { optimizedText, voiceParams } = response.data;
    
    // Create speech utterance with improved parameters
    const utterance = new SpeechSynthesisUtterance(optimizedText || text);
    
    // Apply voice parameters
    if (voiceParams) {
      utterance.rate = voiceParams.rate;
      utterance.pitch = voiceParams.pitch;
      utterance.volume = voiceParams.volume;
    } else {
      // Default parameters for better quality
      utterance.rate = 0.9;  // Slightly slower for better clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
    }
    
    // Select the best available voice
    utterance.voice = findBestVoice(voiceParams?.preferredVoice);
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
    
    return new Promise((resolve) => {
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
    });
  } catch (error) {
    console.error('Error in text-to-speech:', error);
  }
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export default {
  speak,
  stopSpeaking
};
