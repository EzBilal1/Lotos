let currentSurahNumber = 1;
let currentAyahIndex = 0;
let audio = null;
let ayahs = [];

// Function to display countdown timer
const startCountdown = (endDate) => {
  const countdownElement = document.getElementById("countdown");
  const interval = setInterval(() => {
    const now = new Date().getTime();
    const distance = endDate - now;

    if (distance < 0) {
      clearInterval(interval);
      document.getElementById("message-container").classList.add("hidden"); // Hide message container
      countdownElement.textContent = "تهنئتك جاهزة الآن!";
      document.getElementById("content-container").classList.remove("hidden");
    } else {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownElement.textContent = `${days} أيام ${hours} ساعات ${minutes} دقائق ${seconds} ثواني`;
    }
  }, 1000);
};

// Check the current date and time
const checkDate = () => {
  const targetDate = new Date("2024-06-16T23:59:00").getTime();
  const now = new Date().getTime();

  if (now < targetDate) {
    document.getElementById("message-container").classList.remove("hidden");
    startCountdown(targetDate);
  } else {
    document.getElementById("content-container").classList.remove("hidden");
  }
};

// Fetch and display the list of Surahs
const surahList = async () => {
  try {
    const response = await fetch("https://api.alquran.cloud/v1/surah");
    const jsonData = await response.json();

    const container = document.getElementById("container");

    if (jsonData.data) {
      jsonData.data.forEach((surah) => {
        const surahCard = document.createElement("div");
        surahCard.className = "surah-card";

        const surahTitle = document.createElement("h3");
        surahTitle.textContent = `${surah.number}. ${surah.name}`;
        surahCard.appendChild(surahTitle);

        const readButton = document.createElement("button");
        readButton.className = "read-button";
        readButton.textContent = "قراءة";
        readButton.onclick = () => displaySurah(surah.number);
        surahCard.appendChild(readButton);

        const listenButton = document.createElement("button");
        listenButton.className = "listen-button";
        listenButton.textContent = "استماع";
        listenButton.onclick = () => startListeningSurah(surah.number);
        surahCard.appendChild(listenButton);

        container.appendChild(surahCard);
      });
    }
  } catch (error) {
    console.error("Error fetching Surah list:", error);
  }
};

// Fetch and display the content of a specific Surah in the reading modal
const displaySurah = async (surahNumber) => {
  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}`
    );
    const jsonData = await response.json();

    const readingModalContent = document.getElementById("readingModalContent");
    readingModalContent.innerHTML = ""; // Clear previous content

    if (jsonData.data && jsonData.data.ayahs) {
      jsonData.data.ayahs.forEach((ayah) => {
        const ayahText = document.createElement("p");
        ayahText.textContent = ayah.text;
        readingModalContent.appendChild(ayahText);
      });
    }

    const readingModal = document.getElementById("readingModal");
    readingModal.style.display = "block";
  } catch (error) {
    console.error("Error fetching Surah content:", error);
  }
};

// Start listening to a specific Surah in the listening modal
const startListeningSurah = async (surahNumber) => {
  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`
    );
    const jsonData = await response.json();

    if (jsonData.data && jsonData.data.ayahs) {
      ayahs = jsonData.data.ayahs;
      currentSurahNumber = surahNumber;
      currentAyahIndex = 0;
      playAyah();
    }
  } catch (error) {
    console.error("Error fetching Surah content:", error);
  }
};

// Play a specific Ayah
const playAyah = () => {
  if (currentAyahIndex < ayahs.length) {
    const ayah = ayahs[currentAyahIndex];
    const audioUrl = ayah.audio;

    if (audio) {
      audio.pause();
    }

    audio = new Audio(audioUrl);
    audio.play();

    const ayahText = document.getElementById("ayah-text");
    ayahText.textContent = ayah.text;

    const listeningModal = document.getElementById("listeningModal");
    listeningModal.style.display = "block";

    audio.onended = () => {
      currentAyahIndex++;
      playAyah();
    };
  }
};

// Stop playing
document.getElementById("stop-button").onclick = () => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};

// Play the next Ayah
document.getElementById("next-button").onclick = () => {
  if (audio) {
    audio.pause();
  }
  currentAyahIndex++;
  playAyah();
};

// Close the reading modal
const readingModal = document.getElementById("readingModal");
const closeReadingModal = document.getElementById("closeReadingModal");
closeReadingModal.onclick = function () {
  readingModal.style.display = "none";
};

// Close the listening modal
const listeningModal = document.getElementById("listeningModal");
const closeListeningModal = document.getElementById("closeListeningModal");
closeListeningModal.onclick = function () {
  listeningModal.style.display = "none";
};

// Fetch and display the Surah list on page load
surahList();
checkDate();
