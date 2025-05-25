// Netlify Function: /.netlify/functions/generate
import fetch from "node-fetch";

export const handler = async (event) => {
  try {
    const { quote, palette } = JSON.parse(event.body || "{}");

    if (!quote) return respond(400, { message: "Quote missing" });

    // Simple prompt template
    const STYLE = {
      sunset: "warm sunset gradient background, bold white serif font",
      mint:   "mint & teal minimal background, stylish black sans-serif font",
      royal:  "royal blue to violet gradient, elegant gold serif font",
      pastel: "pastel peach background, modern navy font",
      mono:   "clean light grey background, black monospace font",
    }[palette] || STYLE.sunset;

    const prompt = `Motivational quote poster, text: "${quote}", style: ${STYLE}, centred layout, 1080x1080, high resolution, no watermark`;

    // Call Replicate
    const rep = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version: "7be7cf1049c88968b0e1c1495b0621e91c4a3194db42dc123f1cad6d7b8a1013", // SDXL-text-image
        input: { prompt, width: 1080, height: 1080, num_inference_steps: 30 },
      }),
    }).then((r) => r.json());

    // Poll until finished
    let poll = rep;
    while (poll.status === "starting" || poll.status === "processing") {
      await new Promise((res) => setTimeout(res, 1500));
      poll = await fetch(
        `https://api.replicate.com/v1/predictions/${rep.id}`,
        { headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` } }
      ).then((r) => r.json());
    }

    if (poll.status !== "succeeded")
      return respond(500, { message: "Image generation failed" });

    return respond(200, { posterUrl: poll.output[0] });
  } catch (e) {
    return respond(500, { message: e.message });
  }
};

const respond = (code, body) => ({
  statusCode: code,
  headers: { "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify(body),
});

