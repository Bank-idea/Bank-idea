// Navigation Mobile Menu
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    // Close menu when clicking on a link
    document.querySelectorAll(".nav-link").forEach((n) =>
      n.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      }),
    )
  }

  // Initialize other features
  initializeSlider()
  initializeCounters()
  initializeForm()
  initializeArchiveFilters()
  initializeNewsModal()
})

// Slider Functionality
let currentSlideIndex = 0
const slides = document.querySelectorAll(".slide")
const indicators = document.querySelectorAll(".indicator")

function initializeSlider() {
  if (slides.length === 0) return

  // Auto-slide every 5 seconds
  setInterval(() => {
    changeSlide(1)
  }, 5000)
}

function showSlide(index) {
  slides.forEach((slide) => slide.classList.remove("active"))
  indicators.forEach((indicator) => indicator.classList.remove("active"))

  if (slides[index]) {
    slides[index].classList.add("active")
  }
  if (indicators[index]) {
    indicators[index].classList.add("active")
  }
}

function changeSlide(direction) {
  currentSlideIndex += direction

  if (currentSlideIndex >= slides.length) {
    currentSlideIndex = 0
  } else if (currentSlideIndex < 0) {
    currentSlideIndex = slides.length - 1
  }

  showSlide(currentSlideIndex)
}

function currentSlide(index) {
  currentSlideIndex = index - 1
  showSlide(currentSlideIndex)
}

// Counter Animation
function initializeCounters() {
  const counters = document.querySelectorAll(".stat-number")

  const observerOptions = {
    threshold: 0.5,
    rootMargin: "0px 0px -100px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target)
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  counters.forEach((counter) => {
    observer.observe(counter)
  })
}

function animateCounter(element) {
  const target = Number.parseInt(element.getAttribute("data-target"))
  const duration = 2000
  const step = target / (duration / 16)
  let current = 0

  const timer = setInterval(() => {
    current += step
    if (current >= target) {
      current = target
      clearInterval(timer)
    }
    element.textContent = Math.floor(current)
  }, 16)
}

// Form Functionality
function initializeForm() {
  const form = document.getElementById("ideaForm")
  if (!form) return

  form.addEventListener("submit", handleFormSubmit)
}

async function handleFormSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const data = Object.fromEntries(formData.entries())

  // Add timestamp
  data.submissionDate = new Date().toISOString()

  try {
    // Show loading state
    const submitBtn = document.querySelector(".btn-primary")
    const originalText = submitBtn.innerHTML
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...'
    submitBtn.disabled = true

    // Send to Google Sheets
    await sendToGoogleSheets(data)

    // Show success message
    showSuccessMessage()

    // Reset form
    e.target.reset()

    // Reset button
    submitBtn.innerHTML = originalText
    submitBtn.disabled = false
  } catch (error) {
    console.error("Error during submission:", error)
    alert("Error during submission. Please try again.")

    // Reset button
    const submitBtn = document.querySelector(".btn-primary")
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Idea'
    submitBtn.disabled = false
  }
}

// Google Sheets Configuration - UPDATE WITH YOUR SHEET
const GOOGLE_SHEETS_CONFIG = {
  // Your Google Apps Script URL (replace after deployment)
  scriptURL: "https://script.google.com/macros/s/AKfycbzc9ohn8INbstJb137DSSkxgG3NEsCzz0_T8DVmhEPXKNigZ_hIC2aua7eB45uWA0-log/exec",
  // Your Google Sheets ID
  sheetId: "1dbxWSQUfsuHZCpthdf2N_twcCbC6qbiLUL8Sl09K7nE",
}

// Send data to Google Sheets
async function sendToGoogleSheets(data) {
  try {
    console.log("Sending data to Google Sheets...", data)

    const response = await fetch(GOOGLE_SHEETS_CONFIG.scriptURL, {
      method: "POST",
      mode: "no-cors", // Important for Google Apps Script
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    // With 'no-cors' mode, we can't read the response
    // but if no error is thrown, it worked
    console.log("Data successfully sent to Google Sheets")
    return { success: true }
  } catch (error) {
    console.error("Error sending to Google Sheets:", error)
    throw new Error("Error sending to Google Sheets")
  }
}

function showSuccessMessage() {
  const successMessage = document.getElementById("successMessage")
  if (successMessage) {
    successMessage.style.display = "flex"
  }
}

function hideSuccessMessage() {
  const successMessage = document.getElementById("successMessage")
  if (successMessage) {
    successMessage.style.display = "none"
  }
}

function resetForm() {
  const form = document.getElementById("ideaForm")
  if (form) {
    form.reset()
  }
}

// Archive Filters
function initializeArchiveFilters() {
  const categoryFilter = document.getElementById("categoryFilter")
  const statusFilter = document.getElementById("statusFilter")
  const searchInput = document.getElementById("searchInput")

  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterIdeas)
  }
  if (statusFilter) {
    statusFilter.addEventListener("change", filterIdeas)
  }
  if (searchInput) {
    searchInput.addEventListener("input", debounce(filterIdeas, 300))
  }
}

function filterIdeas() {
  const categoryFilter = document.getElementById("categoryFilter")
  const statusFilter = document.getElementById("statusFilter")
  const searchInput = document.getElementById("searchInput")
  const ideaCards = document.querySelectorAll(".idea-archive-card")

  const selectedCategory = categoryFilter ? categoryFilter.value : ""
  const selectedStatus = statusFilter ? statusFilter.value : ""
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : ""

  ideaCards.forEach((card) => {
    const category = card.getAttribute("data-category")
    const status = card.getAttribute("data-status")
    const title = card.querySelector("h3").textContent.toLowerCase()
    const description = card.querySelector(".card-content p").textContent.toLowerCase()

    const matchesCategory = !selectedCategory || category === selectedCategory
    const matchesStatus = !selectedStatus || status === selectedStatus
    const matchesSearch = !searchTerm || title.includes(searchTerm) || description.includes(searchTerm)

    if (matchesCategory && matchesStatus && matchesSearch) {
      card.style.display = "block"
      card.style.animation = "fadeInUp 0.3s ease"
    } else {
      card.style.display = "none"
    }
  })
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// News Modal Functionality
function initializeNewsModal() {
  const modal = document.getElementById("newsModal")
  const readMoreButtons = document.querySelectorAll(".read-more")
  const closeModal = document.querySelector(".close-modal")

  // Open modal when read more is clicked
  if (readMoreButtons && modal) {
    readMoreButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault()
        modal.style.display = "block"
        document.body.style.overflow = "hidden" // Prevent background scrolling
      })
    })
  }

  // Close modal when X is clicked
  if (closeModal && modal) {
    closeModal.addEventListener("click", () => {
      modal.style.display = "none"
      document.body.style.overflow = "auto" // Restore background scrolling
    })

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none"
        document.body.style.overflow = "auto"
      }
    })
  }

  // Close modal with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.style.display === "block") {
      modal.style.display = "none"
      document.body.style.overflow = "auto"
    }
  })
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Add loading animation to buttons
document.querySelectorAll("button, .btn-primary, .btn-secondary").forEach((button) => {
  button.addEventListener("click", function () {
    if (!this.disabled) {
      this.style.transform = "scale(0.95)"
      setTimeout(() => {
        this.style.transform = ""
      }, 150)
    }
  })
})

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animation = "fadeInUp 0.6s ease forwards"
    }
  })
}, observerOptions)

// Observe elements for animation
document.querySelectorAll(".idea-card, .stat-card, .tip-card, .idea-archive-card").forEach((el) => {
  observer.observe(el)
})
