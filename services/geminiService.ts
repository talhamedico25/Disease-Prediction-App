
import { GoogleGenAI, Type } from "@google/genai";
import { DataPoint, ForecastResponse } from "../types";

export const getAIForecast = async (
  diseaseName: string,
  historicalData: DataPoint[],
  unit: string
): Promise<ForecastResponse> => {
  // Use process.env.API_KEY directly in the GoogleGenAI instance to ensure latest key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Format data for the prompt
  const dataString = historicalData
    .map(p => `Date: ${p.date}, Cases: ${p.actual}`)
    .join("\n");

  const prompt = `
    You are a Senior Epidemiologist and Data Scientist. 
    Below is historical weekly case data for ${diseaseName}.
    
    HISTORICAL DATA:
    ${dataString}
    
    TASK:
    1. Perform a short-term 4-week forecast using a simulated statistical model (like Prophet or ARIMA).
    2. Provide 95% confidence intervals (lower and upper bounds).
    3. Explain the reasoning behind this forecast in terms of recent trends and epidemiology.
    4. Provide an 'Academic Framing' section explaining why this specific forecasting matters for public health resource allocation.

    Ensure values are integers. The start date for the forecast should be the week after the last historical date.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          forecasts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                value: { type: Type.NUMBER },
                ciLower: { type: Type.NUMBER },
                ciUpper: { type: Type.NUMBER }
              },
              required: ["date", "value", "ciLower", "ciUpper"]
            }
          },
          explanation: { type: Type.STRING },
          academicFraming: { type: Type.STRING }
        },
        required: ["forecasts", "explanation", "academicFraming"]
      }
    }
  });

  return JSON.parse(response.text.trim());
};
