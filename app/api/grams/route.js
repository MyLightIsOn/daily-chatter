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
          content: "You are a helpful assistant that selects interesting trending words or phrases."
        },
        {
          role: "user",
          content: `Here is a JSON array of trending words and phrases. Please select exactly 3 interesting grams from this data. Return only the 3 selected grams as a JSON array of strings, nothing else. Choose diverse and interesting grams that would make for a good word game.\n\n${fileContents}`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response to get the 3 grams
    const selectedGramsData = JSON.parse(response.choices[0].message.content);

    // Extract the grams array or create one from the response
    let grams = [];
    if (Array.isArray(selectedGramsData)) {
      // If the response is already an array
      grams = selectedGramsData;
    } else if (selectedGramsData.grams && Array.isArray(selectedGramsData.grams)) {
      // If the response has a grams property that is an array
      grams = selectedGramsData.grams;
    } else if (typeof selectedGramsData === 'object') {
      // If the response is an object with other properties
      // Try to extract gram values from the object
      const possibleGrams = Object.values(selectedGramsData)
        .filter(value => typeof value === 'string')
        .slice(0, 3);

      if (possibleGrams.length > 0) {
        grams = possibleGrams;
      }
    }

    // Ensure we have exactly 3 grams
    if (grams.length !== 3) {
      // If we don't have exactly 3 grams, extract from the original data
      const extractedGrams = wordsData
        .slice(0, 3)
        .map(item => item.gram);
      grams = extractedGrams;
    }

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
