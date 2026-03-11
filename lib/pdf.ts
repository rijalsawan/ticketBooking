import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { EVENT_CONFIG } from "./config";

interface TicketPDFData {
  ticketNumber: string;
  holderName: string;
  holderEmail: string;
  orderId: string;
  quantity: number;
  total: number;
  groupMembers?: string[];
  ticketType: string;
}

/**
 * Generates a PDF ticket as a Buffer that can be attached to an email.
 */
export async function generateTicketPDF(data: TicketPDFData): Promise<Buffer> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
  const w = doc.internal.pageSize.getWidth(); // 148mm
  const centerX = w / 2;

  // Colors
  const bg = "#09090b";
  const card = "#18181b";
  const accent = "#f59e0b";
  const fg = "#fafafa";
  const muted = "#a1a1aa";
  const border = "#27272a";

  // Background
  doc.setFillColor(bg);
  doc.rect(0, 0, w, doc.internal.pageSize.getHeight(), "F");

  // Card
  const cardX = 10;
  const cardY = 10;
  const cardW = w - 20;
  const cardH = 185;
  doc.setFillColor(card);
  doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, "F");
  doc.setDrawColor(border);
  doc.setLineWidth(0.3);
  doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, "S");

  // Title
  let y = 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(fg);
  doc.text(EVENT_CONFIG.title, centerX, y, { align: "center" });

  // Nepali subtitle
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(muted);
  doc.text(EVENT_CONFIG.nepaliTitle ?? "Nava Varsha 2083", centerX, y, { align: "center" });

  // Divider
  y += 6;
  doc.setDrawColor(border);
  doc.setLineWidth(0.2);
  doc.line(cardX + 8, y, cardX + cardW - 8, y);

  // Event details
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(muted);

  const details = [
    ["Date", EVENT_CONFIG.date],
    ["Doors Open", EVENT_CONFIG.doorsOpen],
    ["Venue", EVENT_CONFIG.venue],
    ["Address", EVENT_CONFIG.address ?? "Winnipeg, MB"],
  ];

  for (const [label, value] of details) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(muted);
    doc.text(label, cardX + 14, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(fg);
    doc.text(value, cardX + cardW - 14, y, { align: "right" });
    y += 6;
  }

  // Divider
  y += 2;
  doc.setDrawColor(border);
  doc.line(cardX + 8, y, cardX + cardW - 8, y);

  // QR Code
  y += 6;
  const qrDataUrl = await QRCode.toDataURL(data.ticketNumber, {
    width: 400,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#111111", light: "#ffffff" },
  });
  const qrSize = 42;
  doc.addImage(qrDataUrl, "PNG", centerX - qrSize / 2, y, qrSize, qrSize);

  // Ticket number under QR
  y += qrSize + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(accent);
  doc.text(data.ticketNumber, centerX, y, { align: "center" });

  // Holder info
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(muted);
  doc.text(`Name: ${data.holderName}`, centerX, y, { align: "center" });

  y += 5;
  doc.text(`Type: ${data.ticketType === "GROUP" ? `Group (${data.quantity})` : "Individual"}`, centerX, y, { align: "center" });

  if (data.groupMembers && data.groupMembers.length > 0) {
    y += 5;
    const membersStr = data.groupMembers.join(", ");
    const truncated = membersStr.length > 60 ? membersStr.slice(0, 57) + "..." : membersStr;
    doc.text(`Members: ${truncated}`, centerX, y, { align: "center" });
  }

  // Footer
  y += 10;
  doc.setFontSize(7);
  doc.setTextColor(muted);
  doc.text("Present this QR code and a valid photo ID at the door.", centerX, y, { align: "center" });
  y += 4;
  doc.text(`Order: ${data.orderId}`, centerX, y, { align: "center" });

  // Convert to Buffer
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
