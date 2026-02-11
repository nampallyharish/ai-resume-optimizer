"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [jd, setJD] = useState("");
  const [exp, setExp] = useState("Fresher");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const generate = async () => {
    setError("");
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription: jd, experience: exp }),
    });
    const result = await res.json();
    if (result.error) setError(result.error);
    else setData(result);
  };

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        <button onClick={() => signIn("google")} className="bg-black text-white px-6 py-3">
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between mb-4">
        <p>{session.user.email}</p>
        <button onClick={signOut}>Logout</button>
      </div>

      <textarea
        className="w-full border p-3 mb-3"
        placeholder="Paste Job Description"
        onChange={(e) => setJD(e.target.value)}
      />

      <select className="border p-2 mb-3" onChange={(e) => setExp(e.target.value)}>
        <option>Fresher</option>
        <option>1-3 Years</option>
        <option>3-5 Years</option>
        <option>5+ Years</option>
      </select>

      <button onClick={generate} className="bg-black text-white px-4 py-2">
        Generate (3/day)
      </button>

      {error && <p className="text-red-500 mt-3">{error}</p>}

      {data && (
        <div className="mt-6">
          <p className="font-bold">ATS Score: {data.atsScore}%</p>
        </div>
      )}
    </main>
  );
}
