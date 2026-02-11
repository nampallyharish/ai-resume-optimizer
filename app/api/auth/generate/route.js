import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Request from "@/models/Request";
import { analyzeJD } from "@/lib/analyze";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  const { jobDescription, experience } = await req.json();

  await connectDB();
  const user = await User.findOne({ email: session.user.email });

  const today = new Date().toDateString();
  if (user.lastUsed?.toDateString() !== today) {
    user.dailyCount = 0;
  }

  if (user.dailyCount >= 3) {
    return Response.json({ error: "Daily limit reached" }, { status: 403 });
  }

  const prompt = `
Generate:
1 resume summary
5 resume objectives
Experience: ${experience}
Job Description: ${jobDescription}
`;

  const ai = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = ai.choices[0].message.content.split("\n").filter(Boolean);
  const summary = text.shift();
  const objectives = text;

  const analysis = analyzeJD(jobDescription, objectives.join(" "));

  user.dailyCount += 1;
  user.lastUsed = new Date();
  await user.save();

  await Request.create({
    userEmail: user.email,
    jobDescription,
    experience,
    objectives,
    summary,
    ...analysis,
  });

  return Response.json({ summary, objectives, ...analysis });
}
