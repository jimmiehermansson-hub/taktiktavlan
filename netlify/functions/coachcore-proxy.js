export default async function handler(req) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("", { status: 200, headers });
  }

  try {
    const body = await req.json();
    const res = await fetch(
      "https://coachcore.netlify.app/.netlify/functions/ai-motor",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Proxy-fel", details: error.message }),
      { status: 500, headers }
    );
  }
}
