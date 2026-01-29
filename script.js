const STORAGE_KEY_PREFIX = "ofelia_user_";

// Helper to get ID from URL
function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Index Page Logic
// List of authorized IDs
const VALID_IDS = [
  "DD2349X66",
  "OF6233Q81",
  "XG2867G11",
  "QZ3757G54",
  "WR9864H20",
  // Add more valid IDs here
];

// Index Page Logic
function initIndex() {
  // Check for ID in URL (QR Scan Scenario)
  const urlId = getUrlParameter("id");
  if (urlId) {
    if (!VALID_IDS.includes(urlId)) {
      alert("ID de pulsera no válido o no autorizado.");
      // Optionally redirect to a generic error page or stay on login
      return; 
    }

    const userData = localStorage.getItem(STORAGE_KEY_PREFIX + urlId);
    if (userData) {
      // User exists, go to profile
      window.location.href = `profile.html?id=${urlId}`;
    } else {
      // New user, go to register
      window.location.href = `register.html?id=${urlId}`;
    }
    return; // Stop further execution
  }

  const scanBtn = document.getElementById("scanBtn");
  const idInput = document.getElementById("qrId");

  if (scanBtn) {
    scanBtn.addEventListener("click", () => {
      const id = idInput.value.trim();
      if (!id) {
        alert("Por favor ingrese un ID de pulsera");
        return;
      }

      if (!VALID_IDS.includes(id)) {
        alert("ID de pulsera no válido o no autorizado.");
        return;
      }

      const userData = localStorage.getItem(STORAGE_KEY_PREFIX + id);

      if (userData) {
        // User exists, go to profile
        window.location.href = `profile.html?id=${id}`;
      } else {
        // New user, go to register
        window.location.href = `register.html?id=${id}`;
      }
    });
  }
}

// Register Page Logic
function initRegister() {
  const form = document.getElementById("registerForm");
  const id = getUrlParameter("id");

  if (!id) {
    alert("Error: No se detectó ID de pulsera");
    window.location.href = "login.html";
    return;
  }

  // Image Preview
  const photoInput = document.getElementById("photo");
  const preview = document.getElementById("photoPreview");
  let photoBase64 = "";

  photoInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = function () {
        photoBase64 = reader.result;
        preview.src = photoBase64;
        preview.style.display = "block";
        document.querySelector(".upload-text").style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  });

  // Multi-step Logic
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");

  if (nextBtn && backBtn) {
    nextBtn.addEventListener("click", () => {
      // Validate Step 1
      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const contactName1 = document.getElementById("contactName1").value.trim();
      const photoFile = document.getElementById("photo").files[0];

      // Check all required fields
      if (!photoFile) {
        alert("Por favor suba una foto de perfil.");
        return;
      }

      if (!firstName) {
        alert("Por favor ingrese el nombre.");
        return;
      }

      if (!lastName) {
        alert("Por favor ingrese el apellido.");
        return;
      }

      if (!phone) {
        alert("Por favor ingrese el teléfono de contacto principal.");
        return;
      }

      if (!contactName1) {
        alert("Por favor ingrese el nombre del contacto principal.");
        return;
      }

      // All validations passed, move to step 2
      step1.style.display = "none";
      step2.style.display = "block";
    });

    backBtn.addEventListener("click", () => {
      step2.style.display = "none";
      step1.style.display = "block";
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const userData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        contactName1: document.getElementById("contactName1").value,
        phone: document.getElementById("phone").value,
        contactName2: document.getElementById("contactName2").value,
        phone2: document.getElementById("phone2").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value,
        photo: photoBase64 || "https://via.placeholder.com/150?text=No+Photo", // Default if none
      };

      localStorage.setItem(STORAGE_KEY_PREFIX + id, JSON.stringify(userData));

      alert("¡Pulsera activada con éxito!");
      window.location.href = `profile.html?id=${id}`;
    });
  }
}

// Profile Page Logic
function initProfile() {
  const id = getUrlParameter("id");
  if (!id) {
    window.location.href = "login.html";
    return;
  }

  const userDataString = localStorage.getItem(STORAGE_KEY_PREFIX + id);
  if (!userDataString) {
    // If trying to access profile but not registered, go to register
    window.location.href = `register.html?id=${id}`;
    return;
  }

  const user = JSON.parse(userDataString);

  // Populate UI
  document.getElementById("profileName").textContent =
    `${user.firstName} ${user.lastName}`;
  document.getElementById("profilePhoto").src = user.photo;

  // Emergency Message
  const msgEl = document.getElementById("profileMessage");
  if (user.message) {
    msgEl.textContent = user.message;
  } else {
    msgEl.parentElement.style.display = "none";
  }

  // Contact Buttons Container
  const actionsContainer = document.getElementById("contactActions");
  actionsContainer.innerHTML = ""; // Clear previous

  // Helper to create buttons
  const createContactCard = (name, phone, label) => {
    if (!phone) return;

    const card = document.createElement("div");
    card.className = "contact-card";

    const nameEl = document.createElement("div");
    nameEl.className = "contact-name";
    nameEl.textContent = name || label;
    card.appendChild(nameEl);

    const buttonsRow = document.createElement("div");
    buttonsRow.className = "contact-buttons";

    // Call Button (Icon)
    const callBtn = document.createElement("a");
    callBtn.href = `tel:${phone}`;
    callBtn.className = "btn-icon btn-call";
    callBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.057 15.057 0 01-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1.01A11.36 11.36 0 018.59 3.99c0-.55-.45-1-1-1H4.39c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.61c0-.55-.45-1-1-1z"/></svg>`;

    // WhatsApp Button (Icon)
    const waBtn = document.createElement("a");
    const cleanPhone = phone.replace(/\D/g, "");
    waBtn.href = `https://wa.me/${cleanPhone}?text=Hola, encontré a ${user.firstName} y escaneé su pulsera Ofelia.`;
    waBtn.className = "btn-icon btn-whatsapp";
    waBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 16.61c-1.48 0-2.94-.4-4.21-1.15l-.3-.18-3.11.82.83-3.04-.19-.31a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 012.41 5.83c.02 4.54-3.68 8.23-8.23 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.24.25-.4.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.11s.9 1.96 1.02 2.13c.12.17 1.78 2.72 4.3 3.83.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18s-.27-.16-.51-.28z"/></svg>`;

    buttonsRow.appendChild(callBtn);
    buttonsRow.appendChild(waBtn);
    card.appendChild(buttonsRow);
    actionsContainer.appendChild(card);
  };

  createContactCard(user.contactName1, user.phone, "Contacto Principal");
  createContactCard(user.contactName2, user.phone2, "Contacto Alternativo");

  // Email Button (Global)
  if (user.email) {
    const emailWrapper = document.createElement("div");
    emailWrapper.style.marginBottom = "20px";

    const emailBtn = document.createElement("a");
    emailBtn.href = `mailto:${user.email}?subject=Alerta Ofelia: ${user.firstName}&body=Hola, escaneé la pulsera de ${user.firstName}.`;
    emailBtn.className = "btn btn-email";
    // Add SVG icon and text
    emailBtn.innerHTML = `
            <svg style="width: 20px; height: 20px; margin-right: 8px;" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            Enviar Email de Alerta
        `;

    emailWrapper.appendChild(emailBtn);
    actionsContainer.appendChild(emailWrapper);
  }
}

// Router
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (path.includes("login.html") || path.endsWith("/")) {
    initIndex();
  } else if (path.includes("register.html")) {
    initRegister();
  } else if (path.includes("profile.html")) {
    initProfile();
  }

  // Scroll Animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  document.querySelectorAll(".reveal").forEach((el) => {
    observer.observe(el);
  });
});
