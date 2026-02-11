import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Request from "../../../../models/Request";
import { analyzeJD } from "../../../../lib/analyze";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const session = await getServerSession();

  if (!session) {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  const { jobDescription, experience } = await req.json();

  await connectDB();

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const today = new Date().toDateString();

  if (!user.lastUsed || user.lastUsed.toDateString() !== today) {
    user.dailyCount = 0;
  }

  if (user.dailyCount >= 5) {
    return Response.json({ error: "Daily limit reached" }, { status: 403 });
  }

  // Generate resume objective using OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a professional resume writer.",
      },
      {
        role: "user",
        content: `Generate a strong resume objective for:
        Job Description: ${jobDescription}
        Experience: ${experience}`,
      },
    ],
  });

  const objective = completion.choices[0].message.content;

  // Analyze JD for ATS
  const analysis = analyzeJD(jobDescription, experience);

  const newRequest = await Request.create({
    userEmail: user.email,
    jobDescription,
    experience,
    objectives: [objective],
    summary: objective,
    atsScore: analysis.atsScore,
    missingSkills: analysis.missingSkills,
    keywords: analysis.keywords,
  });

  user.dailyCount += 1;
  user.lastUsed = new Date();
  await user.save();

  return Response.json({
    objective,
    atsScore: analysis.atsScore,
    missingSkills: analysis.missingSkills,
    keywords: analysis.keywords,
  });
}
