import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
);

// convert messages from the Vercel AI SDK Format to the format
// that is expected by the Google GenAI SDK
// const buildGoogleGenAIPrompt = (messages: Message[]) => ({
//   contents: messages
//     .filter(
//       (message) => message.role === "user" || message.role === "assistant"
//     )
//     .map((message) => ({
//       role: message.role === "user" ? "user" : "model",
//       parts: [{ text: message.content }],
//     })),
// });

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  //   const { messages } = await req.json();
  try {
    const message =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, I and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started? || If you could have dinner with any historical figure, who would it be? || What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const geminiStream = await genAI
      .getGenerativeModel({ model: "gemini-1.5-flash" })
      .generateContentStream(message);

    // Convert the response into a friendly text-stream
    const stream = GoogleGenerativeAIStream(geminiStream);

    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log("Failed to get messages", error);
    return Response.json({ error: "Failed to get messages" }, { status: 500 });
  }
}
