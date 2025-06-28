document.getElementById("predictForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const input = document.getElementById("input").value.trim();
  const features = input.split(",").map(Number);
  const resultDiv = document.getElementById("result");

  if (features.length !== 10 || features.some(isNaN)) {
    resultDiv.innerText = "❌ Please enter exactly 10 valid numbers, separated by commas.";
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features }),
    });

    const data = await response.json();

    if (response.ok) {
      const labelMap = {
        0: "❌ Sell",
        1: "⏸️ Hold",
        2: "✅ Buy"
      };

      const predictionLabel = labelMap[data.prediction] || `Unknown class (${data.prediction})`;
      resultDiv.innerText = "📊 Prediction: " + predictionLabel;
    } else {
      resultDiv.innerText = "⚠️ Error: " + data.error;
    }
  } catch (err) {
    resultDiv.innerText = "🚫 Could not connect to backend. Make sure Flask is running.";
  }
});
