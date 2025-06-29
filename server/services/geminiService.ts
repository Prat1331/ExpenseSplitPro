import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDJEOwgYfC1MWF-X4cuL8D4Vri-U0cRpJU";

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(API_KEY);

interface ExtractedBillData {
  merchantName: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  async extractBillData(imageBase64: string): Promise<ExtractedBillData> {
    try {
      const prompt = `
        Analyze this receipt/bill image and extract the following information in JSON format:
        {
          "merchantName": "Name of the restaurant/store",
          "items": [
            {
              "name": "Item name",
              "price": number,
              "quantity": number
            }
          ],
          "subtotal": number,
          "tax": number,
          "tip": number,
          "total": number
        }

        Rules:
        - Extract all menu items with their prices
        - If quantity is not specified, assume 1
        - If tip is not specified, set to 0
        - All monetary values should be numbers (no currency symbols)
        - Merchant name should be the restaurant/store name
        - Return only valid JSON, no additional text
      `;

      const imagePart = {
        inlineData: {
          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ""),
          mimeType: "image/jpeg",
        },
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Clean up the response to ensure it's valid JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const extractedData = JSON.parse(jsonMatch[0]) as ExtractedBillData;

      // Validate the extracted data
      if (!extractedData.merchantName || !extractedData.items || !Array.isArray(extractedData.items)) {
        throw new Error("Invalid bill data structure");
      }

      return extractedData;
    } catch (error) {
      console.error("Error extracting bill data:", error);
      
      // Return fallback data structure
      return {
        merchantName: "Unknown Merchant",
        items: [
          {
            name: "Item 1",
            price: 0,
            quantity: 1,
          },
        ],
        subtotal: 0,
        tax: 0,
        tip: 0,
        total: 0,
      };
    }
  }
}

export const geminiService = new GeminiService();
