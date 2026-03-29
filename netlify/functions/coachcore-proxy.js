exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const body = event.body || "{}";
    const res = await fetch(
      "https://coachcore.netlify.app/.netlify/functions/ai-motor",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
      }
    );

    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Proxy-fel", details: error.message }),
    };
  }
};
