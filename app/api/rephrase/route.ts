import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const inputText = await req.text();
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        status: 400,
        message: "Bad Request",
        data: null,
      });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "You are a helpful assistant that rephrase the text given by the user for not lesser than three lines, in a profession manner and use simple english words relates to water and sewage pipelines asset management.",
    });

    const prompt = inputText;
    let output =
      "The generated content is insufficient. Please refine your input.";
    const result = await model.generateContent(prompt);
    if (result.response.candidates) {
      output = result.response.candidates[0].content.parts[0].text??"";
    }

    return NextResponse.json({
      status: 200,
      message: "OK",
      data: output,
    });
  } catch (e) {
    console.error("Error while generating text::", e);
    return NextResponse.json({
      status: 500,
      messsage: "Internal Server Error",
      data: null,
    });
  }
}
