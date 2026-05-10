// Mobile Menu Toggle
function toggleMobileMenu() {
  const navLinks = document.getElementById("navLinks")
  navLinks.classList.toggle("active")
}

// Signup Form Handler
function handleSignup(event) {
  event.preventDefault()
  alert("Thank you for signing up! Your account has been created.")
  event.target.reset()
}

// Verification Form Handler
function handleVerification(event) {
  event.preventDefault()

  // Show loading state
  const form = event.target
  const resultDiv = document.getElementById("verificationResult")

  // Hide form and show result
  form.style.display = "none"
  resultDiv.style.display = "block"

  // Simulate verification process
  setTimeout(() => {
    const score = Math.floor(Math.random() * 40) + 60 // Random score between 60-100
    const scoreElement = document.getElementById("resultScore")
    const statusElement = document.getElementById("resultStatus")
    const messageElement = document.getElementById("resultMessage")

    // Update score
    scoreElement.querySelector(".score-value").textContent = score + "%"

    // Update status based on score
    if (score >= 80) {
      scoreElement.style.background = "linear-gradient(135deg, #dcfce7, #bbf7d0)"
      scoreElement.querySelector(".score-value").style.color = "#166534"
      scoreElement.querySelector(".score-label").style.color = "#166534"
      messageElement.textContent = "This content appears to be credible and verified."
    } else if (score >= 50) {
      scoreElement.style.background = "linear-gradient(135deg, #fef3c7, #fde68a)"
      scoreElement.querySelector(".score-value").style.color = "#92400e"
      scoreElement.querySelector(".score-label").style.color = "#92400e"
      messageElement.textContent = "This content contains some questionable elements."
    } else {
      scoreElement.style.background = "linear-gradient(135deg, #fee2e2, #fecaca)"
      scoreElement.querySelector(".score-value").style.color = "#991b1b"
      scoreElement.querySelector(".score-label").style.color = "#991b1b"
      messageElement.textContent = "This content appears to be false or misleading."
    }

    // Update detail bars
    document.getElementById("sourceBar").style.width = score - 5 + "%"
    document.getElementById("consistencyBar").style.width = score + 3 + "%"
    document.getElementById("factBar").style.width = score - 2 + "%"
  }, 1500)
}

// Reset Verification Form
function resetForm() {
  const form = document.querySelector(".verify-form")
  const resultDiv = document.getElementById("verificationResult")

  form.style.display = "block"
  resultDiv.style.display = "none"
  form.reset()
}

// Alert Filters
function filterAlerts(type) {
  const buttons = document.querySelectorAll(".filter-btn")
  buttons.forEach((btn) => btn.classList.remove("active"))
  event.target.classList.add("active")

  // In a real app, this would filter the alerts
  console.log("Filtering alerts by:", type)
}

// Repository Search
function searchRepository(event) {
  const query = event.target.value.toLowerCase()
  console.log("Searching for:", query)
  // In a real app, this would filter the repository items
}

// Repository Filters
function filterByCategory(category) {
  console.log("Filtering by category:", category)
  // In a real app, this would filter the repository items
}

function filterByStatus(status) {
  console.log("Filtering by status:", status)
  // In a real app, this would filter the repository items
}

// Report Form Handler
function handleReport(event) {
  event.preventDefault()
  alert("Thank you for your report! Our team will review it shortly.")
  event.target.reset()
}

// Close mobile menu when clicking outside
document.addEventListener("click", (event) => {
  const nav = document.querySelector(".nav")
  const navLinks = document.getElementById("navLinks")
  const menuBtn = document.querySelector(".mobile-menu-btn")

  if (navLinks && navLinks.classList.contains("active")) {
    if (!nav.contains(event.target)) {
      navLinks.classList.remove("active")
    }
  }
})
