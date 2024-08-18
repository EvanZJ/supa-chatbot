import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const TIMEOUT = 300000; // 5 minutes in milliseconds

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const timeoutPromise = new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), TIMEOUT)
    );

    const responsePromise = handleRequest(request);

    return await Promise.race([responsePromise, timeoutPromise]);
  } catch (error: unknown) {
    console.error("Error processing request:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: error.message === "Request timeout" ? 504 : 500 }
      );
    } else {
      return NextResponse.json(
        { message: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}

async function handleRequest(request: NextRequest): Promise<Response> {
  const formData = await request.formData();
  const conversation_history = formData.get("conversation_history") as string;
  const conversation_obj = JSON.parse(conversation_history);
  const response = await generateResponse(conversation_obj);
  return NextResponse.json(
    {
      message: "Message has been successfully processed",
      result: response,
    },
    { status: 200 }
  );
}

async function generateResponse(conversation_history: any) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

  const generatedContext = await hyde(conversation_history);
  console.log("Generated Context:", generatedContext);
  console.log(
    JSON.stringify({
      question: generatedContext,
    })
  );

  const response = await fetch(
    "https://januarevan-rag-milvus-7f23515.hf.space/rag",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Indicate you're sending JSON
      },
      body: JSON.stringify({
        question: generatedContext,
      }),
    }
  );

  const document = await response.json();
  const context = document.result;
  console.log("Generated Context:", context);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are a customer service bot of a baking store in Malaysia. 
    You will be helping customer through chat and answer the customer based on given the context. 
    If you can't answer with the context given, you can answer it, but don't say that the context is not enough.
    Also, can you please make the output in markdown so it can be displayed nicely.
    Context : ${context}`,
    generationConfig: {
      candidateCount: 1,
      maxOutputTokens: 4096,
      temperature: 1.0,
    },
  });

  console.log(JSON.stringify(conversation_history));

  const result = await model.generateContent({
    contents: conversation_history,
  });

  return result.response.text();
}

async function hyde(conversation: any) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

  const context = conversation[conversation.length - 1];
  const question = context.parts[0].text;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      "You are trying to generate a context from a given prompt",
    generationConfig: {
      candidateCount: 1,
      maxOutputTokens: 4096,
      temperature: 1.0,
    },
  });

  const generatedContext = await model.generateContent(question);
  console.log(generatedContext);

  return generatedContext.response.text();
}
