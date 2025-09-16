document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".step");
  const stepContents = document.querySelectorAll(".step-content");
  const nextBtns = document.querySelectorAll(".next-btn");
  const prevBtns = document.querySelectorAll(".prev-btn");
  const restartBtn = document.querySelector(".restart-btn");

  // Quantity controls (increment/decrement)
  const qtyBtns = document.querySelectorAll(".qty-btn");
  qtyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input[type='number']");
      if (!input) return;

      let value = parseInt(input.value, 10) || 0;

      if (btn.classList.contains("plus")) {
        value++;
      } else if (btn.classList.contains("minus") && value > 0) {
        value--;
      }
      input.value = value;
    });
  });

  // Current step tracking
  let currentStep = 1;

  function showStep(step) {
    // Hide all step contents and deactivate all step buttons
    stepContents.forEach((content) => content.classList.remove("active"));
    steps.forEach((s) => s.classList.remove("active"));

    // Show current step content and activate step button
    const content = document.querySelector(`.step-content[data-step="${step}"]`);
    const stepBtn = document.querySelector(`.step[data-step="${step}"]`);

    if (content && stepBtn) {
      content.classList.add("active");
      stepBtn.classList.add("active");
      currentStep = step;

      // Initialize map on Step 5 once
      if (currentStep === 5) {
        initMapOnce();
      }
    }
  }

  // Initial display
  showStep(currentStep);

  // Next buttons
  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentStep < 5) {
        // Run calculation only on step 2 before moving forward
        if (currentStep === 2) {
          calculateMaterials();
        }
        showStep(currentStep + 1);
      }
    });
  });

  // Previous buttons
  prevBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    });
  });

  // Restart button reloads page if present
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      location.reload();
    });
  }

  // Material amounts per item (in grams)
  const materialRates = {
    "Appliances": { copper: 100, gold: 0.1, plastic: 500 },
    "Phones": { copper: 15, gold: 0.03, plastic: 40 },
    "Computers/Laptops": { copper: 200, gold: 0.2, plastic: 800 },
    "Batteries": { copper: 5, gold: 0, plastic: 10 },
    "Others": { copper: 50, gold: 0.05, plastic: 200 },
  };

  // Calculate materials based on quantities and update UI
  function calculateMaterials() {
    const totals = { copper: 0, gold: 0, plastic: 0 };

    document.querySelectorAll(".item-card").forEach((card) => {
      const itemName = card.querySelector("p")?.textContent.trim();
      const qty = parseInt(card.querySelector("input[type='number']")?.value) || 0;

      if (qty > 0 && materialRates[itemName]) {
        totals.copper += materialRates[itemName].copper * qty;
        totals.gold += materialRates[itemName].gold * qty;
        totals.plastic += materialRates[itemName].plastic * qty;
      }
    });

    // Update Step 3 UI elements
    const copperElem = document.getElementById("copper-value");
    const goldElem = document.getElementById("gold-value");
    const plasticElem = document.getElementById("plastic-value");

    if (copperElem) copperElem.textContent = `${totals.copper} g`;
    if (goldElem) goldElem.textContent = `${totals.gold.toFixed(2)} g`;
    if (plasticElem) plasticElem.textContent = `${totals.plastic} g`;
  }

  // === Step 5 Map initialization ===
  let mapInitialized = false;
  let map;
  const markers = {};

  function initMapOnce() {
    if (mapInitialized || typeof L === "undefined") return;

    // Initialize map at Davao City
    map = L.map("ewaste-map").setView([7.0731, 125.6128], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Define locations with approximate coordinates and notes
    const locations = {
      sm_ecoland: {
        name: "SM City Davao (Ecoland)",
        coords: [7.04973, 125.58801],
        note: "Cyberzone, 2F Annex Building – E-waste bin",
      },
      sm_lanang: {
        name: "SM Lanang",
        coords: [7.09880, 125.63114],
        note: "Cyberzone, 3F near Information Booth – E-waste bin",
      },
      abreeza: {
        name: "Abreeza Mall (Globe Store)",
        coords: [7.09122, 125.61150],
        note: "3rd Level – Globe’s E-Waste Zero Bin",
      },
    };

    // Add markers and popups
    Object.entries(locations).forEach(([key, loc]) => {
      markers[key] = L.marker(loc.coords)
        .addTo(map)
        .bindPopup(`<strong>${loc.name}</strong><br>${loc.note}`);
    });

    // Fit map view to markers with padding
    const group = L.featureGroup(Object.values(markers));
    map.fitBounds(group.getBounds().pad(0.2));

    // Add click event to location list items to focus on map markers
    const list = document.getElementById("location-list");
    if (list) {
      list.addEventListener("click", (e) => {
        const li = e.target.closest("li[data-key]");
        if (!li) return;

        const key = li.getAttribute("data-key");
        const marker = markers[key];
        if (marker) {
          map.setView(marker.getLatLng(), 15, { animate: true });
          marker.openPopup();
        }
      });
    }

    mapInitialized = true;
  }
});
