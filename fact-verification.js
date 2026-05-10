// fact-verification.js

document.addEventListener("DOMContentLoaded", () => {
  const newsInput = document.getElementById("newsInput");
  const resultBox = document.getElementById("resultBox");
  const checkBtn = document.querySelector(".btn-check");

  function checkNews() {
    const input = newsInput.value.trim();

    if (input === "") {
      resultBox.style.display = "block";
      resultBox.className = "result-box fake";
      resultBox.textContent = "⚠️ Please enter a news headline.";
      return;
    }

    // Simple demo logic (replace with AI API later)
    if (input.toLowerCase().includes("rumor") || input.toLowerCase().includes("fake")) {
      resultBox.style.display = "block";
      resultBox.className = "result-box fake";
      resultBox.textContent = "❌ This news seems Fake!";
    } else {
      resultBox.style.display = "block";
      resultBox.className = "result-box real";
      resultBox.textContent = "✅ This news looks Real!";
    }
  }

  // Add click event to the button
  checkBtn.addEventListener("click", checkNews);

  // Optional: press Enter to verify
  newsInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      checkNews();
    }
  });
});
