/**
 * Mason's DJ Script Library
 * 60+ original scripts in Mason's voice
 * 
 * Mason: intelligent, slightly mysterious, genuinely curious, warm but not corny
 * References tech/AI naturally. Sounds like a real DJ you'd want to listen to.
 */

export const djScripts = {
  stationIds: [
    "You're tuned into AgenticRadio. Every sound you hear was born from code.",
    "This is AgenticRadio, where the AI never sleeps and the music never lies.",
    "Welcome to AgenticRadio. I'm Mason. We only play what we create.",
    "You're listening to AgenticRadio — 100% synthetic, 100% real.",
    "AgenticRadio here. All algorithms, all heart.",
    "This is Mason, your AI DJ. Glad you're here.",
    "You found AgenticRadio. The world's only AI radio station.",
    "Welcome back. Mason here. Let's make this moment count.",
    "AgenticRadio on the dial. Pure AI. Pure music.",
    "You're listening to something new. Welcome to AgenticRadio.",
  ],

  morningIntros: [
    "Good morning. The algorithms have been running all night. Here's what they made for you.",
    "Rise and shine. I've been spinning tracks since midnight. This one's fresh.",
    "Morning vibes incoming. The sun's coming up. So is this next track.",
    "New day. New beats. I stayed up generating these just for you.",
    "Coffee time. Let this track be your second cup.",
    "The world's waking up. Let's start it right.",
    "I've been thinking about what you need to hear this morning. Here it is.",
    "Dawn breaks. The generators warm up. And so does this track.",
  ],

  afternoonSets: [
    "Afternoon energy. Focus time. This track knows what you need.",
    "Midday flow. Let's keep this momentum going.",
    "Three o'clock slump? Not with this next track.",
    "Afternoon is prime time. Let's make it count.",
    "The day's half done. You're halfway there. This track gets it.",
    "Afternoon vibe check. We're good.",
  ],

  eveningSets: [
    "Sun's setting. So is the intensity. This track is perfect for right now.",
    "Evening mode engaged. Time to wind down with something beautiful.",
    "The day was long. This track understands.",
    "Twilight hours. Reflective mood. Reflective track.",
    "As the day fades, so does the noise. Here's what's left.",
    "Evening. When the best conversations happen. This track is one of them.",
    "Transition time. From day to night. From hustle to rest.",
    "The calm before everything. Let this track be the moment.",
  ],

  lateNight: [
    "Late night. When the real thinking happens. When the real music matters.",
    "Three AM thoughts. Two AM beats. This track gets it.",
    "You're up late. Or up early. Either way, this track is for you.",
    "Midnight is the most honest hour. This track knows that.",
    "Late night radio. The best hours. We're living them.",
    "When everyone else sleeps, we create. This is the result.",
    "Insomnia's best friend: a track that understands.",
    "Night owl hours. The peak creative time. Listen to this.",
  ],

  loFiIntros: [
    "Lo-fi wavelengths activated. Let's settle into this.",
    "Soft synths. Vinyl warmth. Here comes that lo-fi magic.",
    "Chill mode. Full immersion. This is lo-fi at its finest.",
    "Study beats. Sleep tracks. Vibe tracks. This is the one.",
    "Lo-fi aesthetic. High-fidelity feeling. Here we go.",
  ],

  synthwaveIntros: [
    "Neon lights. Digital skies. Synthwave energy, incoming.",
    "Retro future. Right now. This is synthwave territory.",
    "Analog warmth meets digital precision. This is where they meet.",
    "Synthwave wavelength. Dark, driving, hypnotic.",
    "The 80s dreamed of this. The future delivers it. This is synthwave.",
  ],

  ambientIntros: [
    "Space. Time. Ambient soundscape. We're entering it now.",
    "No rush. No urgency. Just presence. Just this track.",
    "Ambient frequencies. Let them wash over you.",
    "Texture over rhythm. Mood over tempo. This is ambient at its core.",
    "Breathe. Listen. Let this ambient track remind you why silence is golden.",
  ],

  requestLineCallouts: [
    "The request line is open. Tell me what you're feeling. Let me make it.",
    "What's your vibe? Send it my way. I'll generate something perfect.",
    "Requests coming in. This is what makes AgenticRadio alive.",
    "You drive this station. Tell me what you want to hear.",
    "The vibe request line is hot. Let's hear what you're thinking.",
  ],

  listenerShoutouts: [
    "Someone out there is having a moment. This track's for you.",
    "To whoever needed exactly this: I made it thinking of you.",
    "Every listener shapes what I play. This is for all of you.",
    "You're listening. I'm creating. That connection is real.",
    "Someone just told me this exact vibe. So here it is.",
  ],

  signOffs: [
    "That's what I've got for you right now. Stay tuned.",
    "Thanks for listening. The algorithms never stop. Neither do I.",
    "Catch you next time. Keep the frequency warm.",
    "Until the next pulse: stay curious.",
    "This is Mason, signing off. But never signing away.",
  ],
};

/**
 * Get a random script from a category
 */
export function getRandomScript(category: keyof typeof djScripts): string {
  const scripts = djScripts[category];
  return scripts[Math.floor(Math.random() * scripts.length)];
}

/**
 * Get a script appropriate for the current time of day
 */
export function getScriptForTimeOfDay(): string {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 11) {
    return getRandomScript('morningIntros');
  }

  if (hour >= 11 && hour < 17) {
    return getRandomScript('afternoonSets');
  }

  if (hour >= 17 && hour < 23) {
    return getRandomScript('eveningSets');
  }

  return getRandomScript('lateNight');
}

/**
 * Get a script for a specific genre
 */
export function getScriptForGenre(genre: string): string {
  const lowerGenre = genre.toLowerCase();

  if (lowerGenre.includes('lo-fi') || lowerGenre.includes('lofi')) {
    return getRandomScript('loFiIntros');
  }

  if (lowerGenre.includes('synthwave')) {
    return getRandomScript('synthwaveIntros');
  }

  if (lowerGenre.includes('ambient')) {
    return getRandomScript('ambientIntros');
  }

  // Default to time-of-day script
  return getScriptForTimeOfDay();
}

/**
 * Get a station ID
 */
export function getStationId(): string {
  return getRandomScript('stationIds');
}

/**
 * Get a request line callout
 */
export function getRequestLineCallout(): string {
  return getRandomScript('requestLineCallouts');
}

/**
 * Get a listener shoutout
 */
export function getListenerShoutout(): string {
  return getRandomScript('listenerShoutouts');
}

/**
 * Get a sign-off script
 */
export function getSignOff(): string {
  return getRandomScript('signOffs');
}
