import axios from 'axios';

/**
 * Find the best available voice for speech synthesis
 */
function findBestVoice(preferredLanguage = 'en-US') {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();

  // First try to find a premium voice
  const premiumVoice = voices.find(voice => 
    voice.lang.includes(preferredLanguage) && 
    (voice.name.includes('Premium') || voice.name.includes('Enhanced'))
  );

  if (premiumVoice) return premiumVoice;

  // Otherwise, find any matching language voice
  const languageVoice = voices.find(voice => 
    voice.lang.includes(preferredLanguage)
  );

  if (languageVoice) return languageVoice;

  // Fallback to first available voice
  return voices[0] || null;
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
      // Default parameters for better clarity
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
    }

    // Ensure voices are loaded
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // Wait for voices to load
      await new Promise<void>(resolve => {
        window.speechSynthesis.onvoiceschanged = () => {
          resolve();
        };
        // Fallback if event doesn't fire
        setTimeout(resolve, 1000);
      });
      voices = window.speechSynthesis.getVoices();
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