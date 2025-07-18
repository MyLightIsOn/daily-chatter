import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

export async function GET() {
  try {
    // Read the JSON file
    const filePath = path.join(process.cwd(), 'data', 'top_100_words_2025071021.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const wordsData = JSON.parse(fileContents);

    // Send to ChatGPT and ask for 3 grams
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You will select 3 words for a hangman like game. Here is a JSON array of words and phrases. The word selection should be random. Do not just pick the first few words. Look through the entire JSON first. It is a game so the words should not be offensive, adult content, too short, or too long. Return only the 3 selected grams as an array of strings, nothing else. Choose diverse and interesting grams that would make for a good word game.\n\n${fileContents}`
        }
      ],
    });

    // Parse the response to get the 3 grams
    const selectedGramsData = JSON.parse(response.choices[0].message.content);
    const grams = selectedGramsData


    // Return the selected grams in the expected format
    return NextResponse.json({ grams });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grams' },
      { status: 500 }
    );
  }
}
