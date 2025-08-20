import { SubmissionStatus } from "@/constants/FrontEndContansts";

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
