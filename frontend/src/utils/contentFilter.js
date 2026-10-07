const VULGAR_WORDS = [
  // English
  "fuck",
  "fucking",
  "shit",
  "bitch",
  "bastard",
  "asshole",
  "motherfucker",
  "dick",
  "piss",
  "crap",

  // Nepali / Devanagari
  "मुर्ख",
  "हरामी",
  "छाडा",
  "गधा",

  // Romanized Nepali
  "muji",
  "mugi",
  "randi",
  "randiko",
  "chikne",
  "chikni",
  "jatha",
  "jhatha",
  "laude",
  "lado",
  "thukka",
];

const normalizeText = (text = "") => {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const containsVulgarWords = (text = "") => {
  const normalizedText = normalizeText(text);

  return VULGAR_WORDS.some((word) => {
    const normalizedWord = normalizeText(word);

    return normalizedText
      .split(" ")
      .includes(normalizedWord);
  });
};