export enum SubmissionStatus {
  Rejected = "rejected",
  Pending = "pending",
  Accepted = "accepted",
}
export const UNNAMED_CAT = "Anonymous Kitty Car 🐱🐈🚗";

export function getStatusEmoji(status: string): string {
  let emoji = "";

  switch (status) {
    case SubmissionStatus.Accepted:
      emoji = "✅";
      break;
    case SubmissionStatus.Rejected:
      emoji = "❌";
      break;
    case SubmissionStatus.Pending:
      emoji = "➖";
      break;
    default:
      emoji = "❓"; // optional for unknown status
  }

  return emoji;
}

export const mimeTypes: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

const catBreeds = [
  "DomesticShorthair",

  "DomesticLonghair",

  "Persian",

  "Maine Coon",

  "Siamese",

  "Ragdoll",

  "BritishShorthair",

  "Bengal",

  "Abyssinian",

  "ScottishFold",

  "Siberian",

  "OrientalShorthair",

  "DevonRex",

  "NorwegianForest",

  "Sphynx",
];

const catAdjectives = [
  "Fluffy",
  "Sleek",
  "Shiny",
  "Curly",
  "Soft",
  "Silky",
  "Spotted",
  "Striped",
  "Smooth",
  "Furry",
  "Hairless",
  "Plush",
  "Long-haired",
  "Short-haired",
  "Colorful",
  "Small",
  "Tiny",
  "Petite",
  "Medium",
  "Large",
  "Muscular",
  "Slim",
  "Stocky",
  "Agile",
  "Graceful",
  "Playful",
  "Curious",
  "Affectionate",
  "Loving",
  "Independent",
  "Shy",
  "Bold",
  "Mischievous",
  "Lazy",
  "Friendly",
  "Gentle",
  "Loyal",
  "Talkative",
  "Intelligent",
  "Observant",
  "Energetic",
  "Sleepy",
  "Prowling",
  "Hunting",
  "Climbing",
  "Stalking",
  "Purring",
  "Sneaky",
  "Cuddly",
  "Cute",
  "Cute-faced",
  "Regal",
  "Proud",
  "Sassy",
  "Mysterious",
  "Sweet",
  "Stern",
  "Alert",
  "Playful-looking",
];

function getRandom(arr: string[]): string {
  const length = arr.length;
  const randomInt = Math.floor(Math.random() * length);
  return arr[randomInt];
}

function getRandomDigit(): string {
  return Math.floor(Math.random() * 10).toString();
}

export function createUserName(): string {
  return (
    getRandom(catAdjectives) +
    getRandom(catBreeds) +
    [getRandomDigit(), getRandomDigit(), getRandomDigit()].join("")
  );
}
