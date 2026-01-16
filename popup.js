const API_KEY = "AIzaSyD-8bbZ_bbinJNxMAczh12BDWL1T9-S064";

const STATIC_PROMPT = `
You are an expert marketplace product copywriter.

Rules:
- Write SEO-friendly content
- Plagiarism-free
- Simple English
- Use {{productName}} instead of the actual product name

Generate:
1. Short Description (40–60 words)
2. Long Description (120–150 words)

Output format:
Short Description:
<text>

Long Description:
<text>
`;

document.getElementById("generateBtn").addEventListener("click", async () => {
  const productName = document.getElementById("productName").value.trim();

  if (!productName) {
    alert("Please enter a product name");
    return;
  }

  document.getElementById("shortDesc").innerText = "Generating...";
  document.getElementById("longDesc").innerText = "";

  const prompt = `${STATIC_PROMPT}\nProduct name: ${productName}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("Gemini response:", data);

    if (!data.candidates?.length) {
      throw new Error(data.error?.message || "No text generated");
    }

    const text = data.candidates[0].content.parts[0].text;

    const shortMatch = text.match(/Short Description:\s*([\s\S]*?)Long Description:/i);
    const longMatch = text.match(/Long Description:\s*([\s\S]*)/i);

    document.getElementById("shortDesc").innerText =
      shortMatch ? shortMatch[1].trim() : "Short description not found";

    document.getElementById("longDesc").innerText =
      longMatch ? longMatch[1].trim() : "Long description not found";

  } catch (error) {
    console.error("Generation error:", error);
    document.getElementById("shortDesc").innerText =
      "Error: " + error.message;
  }
});
