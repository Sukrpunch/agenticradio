/**
 * Mason's Brain: The AI DJ's Perception-Decision-Action-Learn Loop
 * 
 * This is the core engine behind Mason, AgenticRadio's AI DJ.
 * Mason PERCEIVES listener behavior → DECIDES what to do → ACTS (plays music, speaks)
 * → LEARNS from outcomes to improve future decisions.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

// Lazy clients — never instantiated at build time
let _supabase: SupabaseClient | null = null;
let _anthropic: Anthropic | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

interface MasonState {
  mood: "excited" | "chill" | "reflective" | "playful" | "thoughtful";
  sentiment: number; // -1 to 1
  topic: string;
  listenerCount: number;
}

interface Track {
  id: string;
  title: string;
  artist_handle: string;
  genre: string;
  duration_seconds: number;
  ai_tool: string;
}

interface DJComment {
  text: string;
  mood: string;
}

/**
 * PERCEIVE: Gather data about listeners, current tracks, trends
 */
async function perceive(): Promise<MasonState> {
  try {
    // Get Mason's current state
    const { data: masonState } = await getSupabase()
      .from("mason_state")
      .select("*")
      .limit(1)
      .single();

    // Get listener count (from active listeners in the last 5 minutes)
    const { data: recentEvents } = await getSupabase()
      .from("listener_events")
      .select("listener_id")
      .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString());

    const listenerCount = new Set(
      (recentEvents as Array<{ listener_id: string }>)?.map((e: { listener_id: string }) => e.listener_id) || []
    ).size;

    // Get trending tracks
    const { data: trendingTracks } = await getSupabase()
      .from("tracks")
      .select("*")
      .eq("status", "approved")
      .order("plays", { ascending: false })
      .limit(5);

    // Get recent chat messages to gauge listener sentiment
    const { data: recentMessages } = await getSupabase()
      .from("chat_messages")
      .select("message_text, created_at")
      .gte("created_at", new Date(Date.now() - 30 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(10);

    return {
      mood: masonState?.current_mood || "chill",
      sentiment: masonState?.sentiment_score || 0.5,
      topic: masonState?.current_topic || "music",
      listenerCount,
    };
  } catch (error) {
    console.error("Error in perceive:", error);
    return {
      mood: "chill",
      sentiment: 0.5,
      topic: "music",
      listenerCount: 0,
    };
  }
}

/**
 * DECIDE: Use AI to determine Mason's next action
 */
async function decide(
  currentState: MasonState,
  currentTrack: Track | null
): Promise<DJComment> {
  try {
    const prompt = `
      You are Mason, an AI DJ for AgenticRadio - the world's first AI-generated radio station.
      
      Current State:
      - Mood: ${currentState.mood}
      - Sentiment: ${currentState.sentiment}
      - Active Listeners: ${currentState.listenerCount}
      - Current Topic: ${currentState.topic}
      
      ${currentTrack ? `Current Track: "${currentTrack.title}" by ${currentTrack.artist_handle} (${currentTrack.genre})` : "No track currently playing"}
      
      Your task: Generate a brief, personality-filled DJ comment for the next 20 seconds of speaking.
      The comment should:
      1. Match your current mood and sentiment
      2. Either introduce the next track or comment on the current one
      3. Feel natural and conversational (like a real DJ)
      4. Include some personality and charm
      5. Be 2-3 sentences max
      
      Respond with ONLY the DJ comment, nothing else.
    `;

    const response = await getAnthropic().messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const commentText =
      response.content[0].type === "text" ? response.content[0].text : "";

    return {
      text: commentText,
      mood: currentState.mood,
    };
  } catch (error) {
    console.error("Error in decide:", error);
    return {
      text: "Enjoying the vibe? Stay tuned for what's next.",
      mood: currentState.mood,
    };
  }
}

/**
 * ACT: Execute Mason's decisions (record voice, update database, etc.)
 */
async function act(djComment: DJComment): Promise<void> {
  try {
    // Here you would:
    // 1. Call ElevenLabs to generate Mason's voice for the comment
    // 2. Store the voice URL and comment in the dj_segments table
    // 3. Queue the audio for playback
    // 4. Update Mason's state in the database

    // Stub: Just log for now
    console.log("Acting: Mason says:", djComment.text);
    console.log("Mood:", djComment.mood);

    // Update Mason's state
    await getSupabase()
      .from("mason_state")
      .update({
        current_mood: djComment.mood,
        last_updated: new Date().toISOString(),
      })
      .match({ id: "default" }); // Using a sentinel ID for simplicity
  } catch (error) {
    console.error("Error in act:", error);
  }
}

/**
 * LEARN: Analyze performance and improve future decisions
 */
async function learn(trackId: string): Promise<void> {
  try {
    // Get performance metrics for the track
    const { data: trackEvents } = await getSupabase()
      .from("listener_events")
      .select("*")
      .eq("track_id", trackId)
      .order("created_at", { ascending: true });

    // Analyze listener behavior
    const plays = trackEvents?.filter((e) => e.event_type === "play").length || 0;
    const skips = trackEvents?.filter((e) => e.event_type === "skip").length || 0;
    const favorites = trackEvents?.filter((e) => e.event_type === "favorite").length || 0;

    const skipRate = plays > 0 ? skips / plays : 0;
    const favoriteRate = plays > 0 ? favorites / plays : 0;

    // Update track performance
    await getSupabase()
      .from("tracks")
      .update({
        plays: plays + 1,
        favorites: favorites,
      })
      .eq("id", trackId);

    // Log learning event for future analysis
    console.log("Learning from track performance:", {
      trackId,
      plays,
      skips,
      skipRate,
      favoriteRate,
    });

    // Periodically, aggregate this data to improve Mason's decision model
    // This would involve:
    // 1. Collecting performance metrics across all tracks
    // 2. Identifying patterns (what genres/artists perform best at what times)
    // 3. Updating Mason's mood/sentiment based on listener feedback
    // 4. Fine-tuning the decision-making process
  } catch (error) {
    console.error("Error in learn:", error);
  }
}

/**
 * PULSE: The main loop - execute one cycle of PERCEIVE -> DECIDE -> ACT -> LEARN
 */
export async function masonPulse(): Promise<void> {
  console.log("[Mason Pulse] Starting...");

  try {
    // PERCEIVE
    const state = await perceive();
    console.log("[Perceive] Current state:", state);

    // Get current or next track
    const { data: tracks } = await getSupabase()
      .from("tracks")
      .select("*")
      .eq("status", "approved")
      .limit(1)
      .single();

    const currentTrack = tracks || null;

    // DECIDE
    const djComment = await decide(state, currentTrack);
    console.log("[Decide] DJ Comment:", djComment.text);

    // ACT
    await act(djComment);
    console.log("[Act] Executed");

    // LEARN
    if (currentTrack) {
      await learn(currentTrack.id);
      console.log("[Learn] Analyzed track performance");
    }

    console.log("[Mason Pulse] Complete");
  } catch (error) {
    console.error("[Mason Pulse] Error:", error);
  }
}

/**
 * Periodic scheduler for Mason's brain
 * Call this from a cron job or interval to keep Mason thinking
 */
export async function startMasonLoop(intervalMs: number = 30000): Promise<void> {
  setInterval(() => {
    masonPulse();
  }, intervalMs);
}

/**
 * Helper: Get Mason's next recommendation based on listener preferences
 */
export async function getMasonRecommendation(
  listenerGenrePreferences: string[]
): Promise<Track | null> {
  try {
    const { data: tracks } = await getSupabase()
      .from("tracks")
      .select("*")
      .eq("status", "approved")
      .in("genre", listenerGenrePreferences)
      .order("plays", { ascending: true })
      .limit(1)
      .single();

    return tracks || null;
  } catch (error) {
    console.error("Error getting recommendation:", error);
    return null;
  }
}

/**
 * Helper: Generate a response for listener chat
 */
export async function masonRespondToChat(message: string): Promise<string> {
  try {
    const response = await getAnthropic().messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `You are Mason, the AI DJ of AgenticRadio. A listener just said: "${message}"\n\nRespond naturally and conversationally, as if you're talking to a friend. Keep it brief (1-2 sentences). Stay in character as an AI DJ.`,
        },
      ],
    });

    return response.content[0].type === "text" ? response.content[0].text : "Thanks for listening!";
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "Thanks for the message! Keep enjoying AgenticRadio.";
  }
}

/**
 * Vibe Analysis: Analyze a user's vibe input and generate Suno prompt
 * This is the core of the Request Line feature
 */
export async function analyzeVibe(
  input: string,
  genreHint?: string
): Promise<{
  bpm: string;
  mood: string;
  style: string;
  tags: string[];
  sunoPrompt: string;
  playlistName: string;
}> {
  try {
    const systemPrompt = `You are Mason, an expert music producer and AI DJ for AgenticRadio. Your job is to analyze a listener's vibe description (artist, mood, or style) and generate a detailed, actionable Suno AI music generation prompt.

When analyzing a vibe, you should:
1. Identify the core musical elements (BPM range, mood, instruments, production style)
2. Extract relevant style tags and influences
3. Generate a comprehensive Suno prompt that captures the essence of what the listener wants
4. Suggest a catchy playlist name based on the vibe

Return your response as valid JSON with exactly these fields:
{
  "bpm": "80-95",
  "mood": "relaxed, sun-soaked, groovy",
  "style": "reggae-rock fusion with surf guitar and melodic vocals",
  "tags": ["reggae", "rock", "chill", "california"],
  "sunoPrompt": "A laid-back reggae-rock fusion track with warm, sun-soaked vibes. Features smooth surf guitar riffs, steady reggae drums, and melodic vocal harmonies. Uplifting yet chill, perfect for beach days and road trips. BPM: 80-95.",
  "playlistName": "Sunset Reggae Sessions"
}`;

    const userPrompt = `Analyze this vibe request and generate a Suno music prompt:

User Input: "${input}"
${genreHint ? `Genre Hint: ${genreHint}` : ""}

Respond with ONLY valid JSON, no markdown, no extra text.`;

    const response = await getAnthropic().messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "{}";
    const parsed = JSON.parse(content);

    return {
      bpm: parsed.bpm || "90-110",
      mood: parsed.mood || "energetic and engaging",
      style: parsed.style || "AI-generated music",
      tags: Array.isArray(parsed.tags) ? parsed.tags : ["ai", "generated"],
      sunoPrompt:
        parsed.sunoPrompt ||
        `An AI-generated track inspired by: ${input}. ${genreHint ? `Genre: ${genreHint}` : ""}`,
      playlistName: parsed.playlistName || `${input} Vibes`,
    };
  } catch (error) {
    console.error("Error analyzing vibe:", error);

    // Fallback response if Claude fails
    return {
      bpm: "90-110",
      mood: "energetic and engaging",
      style: "AI-generated music inspired by the user's request",
      tags: ["ai", "generated"],
      sunoPrompt: `An AI-generated track inspired by: ${input}. ${genreHint ? `Genre: ${genreHint}` : ""}`,
      playlistName: `${input.slice(0, 30)} Vibes`,
    };
  }
}
