/* front-end logic */
const form   = document.getElementById("posterForm");
const quote  = document.getElementById("quote");
const palette= document.getElementById("palette");
const imgBox = document.getElementById("posterImg");
const result = document.getElementById("result");
const loader = document.getElementById("loader");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  result.classList.add("hidden");
  loader.classList.remove("hidden");

  const payload = { quote: quote.value.trim(), palette: palette.value };

  try {
    const r = await fetch("/.netlify/functions/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await r.json();

    if (!data.posterUrl) throw new Error(data.message || "No image");

    imgBox.src = data.posterUrl + "?cache=" + Date.now();
    loader.classList.add("hidden");
    result.classList.remove("hidden");
  } catch (err) {
    alert("⚠️ " + err.message);
    loader.classList.add("hidden");
  }
});

