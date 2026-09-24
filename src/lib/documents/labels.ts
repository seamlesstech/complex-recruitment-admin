/** Short, human label for a document's stored (server-verified) MIME type. */
export function documentFileType(mimeType: string): string {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType === "application/msword") return "DOC";
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "DOCX";
  return mimeType.split("/")[1]?.toUpperCase() ?? mimeType;
}
