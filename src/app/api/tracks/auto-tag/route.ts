import { NextRequest, NextResponse } from 'next/server';

const anthropicApiKey = process.env.ANTHROPIC_API_KEY!;

/**
 * POST /api/tracks/auto-tag
 * Use Claude Haiku to automatically suggest genre, mood, and tags for a track
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description = '', genre = '' } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 400 }
      );
    }

    const prompt = `You are an expert music tagger for an AI-generated music platform. Given a track title and description, suggest:
- genre (one of: lo-fi, synthwave, ambient, hip-hop, dnb, techno, jazz, classical, pop, other)
- mood (one of: energetic, chill, melancholic, euphoric, dark, uplifting, focused, dreamy)
- tags (array of 3-5 relevant keywords, lowercase)

Respond with ONLY valid JSON in this exact format:
{
  "genre": "string",
  "mood": "string",
  "tags": ["tag1", "tag2", "tag3"]
}

Title: "${title}"
Description: "${description}"
${genre ? `Current Genre Hint: ${genre}` : ''}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to get AI suggestions', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    const responseText = data.content[0].text.trim();

    // Try to parse the JSON response
    let suggestions;
    try {
      suggestions = JSON.parse(responseText);
    } catch {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json(
          { error: 'Could not parse AI response as JSON' },
          { status: 500 }
        );
      }
    }

    // Validate the suggestions have required fields
    if (!suggestions.genre || !suggestions.mood || !Array.isArray(suggestions.tags)) {
      return NextResponse.json(
        { error: 'Invalid suggestion format from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      genre: suggestions.genre,
      mood: suggestions.mood,
      tags: suggestions.tags,
      confidence: 0.95,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
