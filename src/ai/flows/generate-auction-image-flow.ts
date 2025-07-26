
'use server';
/**
 * @fileOverview A flow for generating auction images using AI.
 * - generateAuctionImage: A function that takes auction details and returns a generated image URL.
 * - GenerateAuctionImageInput: The input type for the image generation.
 * - GenerateAuctionImageOutput: The output type for the image generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateAuctionImageInputSchema = z.object({
  title: z.string().describe('The title of the auction.'),
  description: z.string().describe('A brief description of the auction item or service.'),
});
export type GenerateAuctionImageInput = z.infer<typeof GenerateAuctionImageInputSchema>;

const GenerateAuctionImageOutputSchema = z.object({
  imageUrl: z.string().describe("The data URI of the generated image. Format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateAuctionImageOutput = z.infer<typeof GenerateAuctionImageOutputSchema>;

export async function generateAuctionImage(input: GenerateAuctionImageInput): Promise<GenerateAuctionImageOutput> {
  return generateAuctionImageFlow(input);
}

const generateAuctionImageFlow = ai.defineFlow(
  {
    name: 'generateAuctionImageFlow',
    inputSchema: GenerateAuctionImageInputSchema,
    outputSchema: GenerateAuctionImageOutputSchema,
  },
  async ({ title, description }) => {
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a professional, high-quality, photorealistic image for a business auction listing. 
      The image should be visually appealing and relevant to the following auction details. 
      Do not include any text in the image.
      
      Title: "${title}"
      Description: "${description}"`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('Image generation failed to return media.');
    }

    return { imageUrl: media.url };
  }
);

    