import nodemailer from "nodemailer";
import { EVENT_CONFIG, SITE_CONFIG } from "./config";

// ── SMTP Transport ────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function baseTemplate(body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nepali New Year 2026</title>
  <style>
    body { font-family: Arial, sans-serif; background:#f9f5f0; margin:0; padding:0; }
    .wrapper { max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; }
    .header { background:linear-gradient(135deg, #c0392b 0%, #8e1a0e 100%); padding:32px 24px; text-align:center; }
    .header h1 { color:#fff; margin:0; font-size:22px; }
    .header p  { color:#ffcdd2; margin:4px 0 0; font-size:14px; }
    .body { padding:32px 24px; color:#333; line-height:1.6; }
    .ticket-box { background:#fff8f0; border:2px dashed #c0392b; border-radius:8px; padding:20px; margin:20px 0; text-align:center; }
    .ticket-number { font-size:28px; font-weight:bold; color:#c0392b; letter-spacing:2px; }
    .detail-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f0e6e0; font-size:14px; }
    .footer { background:#f9f5f0; padding:16px 24px; text-align:center; font-size:12px; color:#888; }
    .btn { display:inline-block; background:#c0392b; color:#fff; text-decoration:none; padding:12px 28px; border-radius:6px; font-weight:bold; margin:12px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🎉 ${EVENT_CONFIG.title}</h1>
      <p>${EVENT_CONFIG.nepaliTitle}</p>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      <p>${EVENT_CONFIG.venue} · ${EVENT_CONFIG.address}</p>
      <p>${EVENT_CONFIG.date} | Doors open ${EVENT_CONFIG.doorsOpen}</p>
      <p style="margin-top:8px;">
        Questions? <a href="mailto:${SITE_CONFIG.contactEmail}" style="color:#c0392b;">${SITE_CONFIG.contactEmail}</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ── Email Functions ────────────────────────────────────────────────────────────

export interface TicketEmailData {
  to: string;
  name: string;
  tickets: Array<{ ticketNumber: string; holderName?: string | null }>;
  orderId: string;
  quantity: number;
  total: number;
  appUrl: string;
}

export async function sendTicketConfirmationEmail(data: TicketEmailData) {
  const { to, name, tickets, orderId, quantity, total, appUrl } = data;

  const ticketRows = tickets
    .map(
      (t) => `
      <div class="ticket-box">
        <div class="ticket-number">${t.ticketNumber}</div>
        ${t.holderName ? `<div style="color:#666;margin-top:4px;">${t.holderName}</div>` : ""}
        <div style="font-size:12px;color:#999;margin-top:8px;">Scan this number at the door or show your QR code</div>
      </div>`,
    )
    .join("");

  const body = `
    <h2 style="color:#c0392b;">🎟️ Your tickets are confirmed!</h2>
    <p>Hi ${name},</p>
    <p>Thank you for purchasing tickets to the <strong>${EVENT_CONFIG.title}</strong>. 
       We can't wait to celebrate with you!</p>

    <div class="detail-row"><span>📅 Date</span><span>${EVENT_CONFIG.date}</span></div>
    <div class="detail-row"><span>⏰ Doors Open</span><span>${EVENT_CONFIG.doorsOpen}</span></div>
    <div class="detail-row"><span>📍 Venue</span><span>${EVENT_CONFIG.venue}</span></div>
    <div class="detail-row"><span>🎟️ Tickets</span><span>${quantity}</span></div>
    <div class="detail-row"><span>💳 Total Paid</span><span>$${(total / 100).toFixed(2)} CAD</span></div>

    <h3 style="color:#c0392b;margin-top:24px;">Your Ticket Numbers</h3>
    ${ticketRows}

    <p style="text-align:center;margin-top:24px;">
      <a href="${appUrl}/tickets" class="btn">View My Tickets & QR Codes</a>
    </p>

    <p style="font-size:13px;color:#666;margin-top:16px;">
      <strong>Order ID:</strong> ${orderId}<br/>
      Please save this email. Show your QR code or ticket number at the entrance.
    </p>

    <p style="font-size:13px;color:#666;">नयाँ वर्षको शुभकामना! 🙏 Happy Nepali New Year!</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? `"${EVENT_CONFIG.title}" <noreply@nepaliparty.ca>`,
    to,
    subject: `Your Tickets – ${EVENT_CONFIG.title} 🎉`,
    html: baseTemplate(body),
  });
}

export async function sendAdminNewOrderEmail(data: {
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  total: number;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const body = `
    <h2>New Ticket Order</h2>
    <div class="detail-row"><span>Order ID</span><span>${data.orderId}</span></div>
    <div class="detail-row"><span>Buyer</span><span>${data.buyerName} (${data.buyerEmail})</span></div>
    <div class="detail-row"><span>Tickets</span><span>${data.quantity}</span></div>
    <div class="detail-row"><span>Total</span><span>$${(data.total / 100).toFixed(2)} CAD</span></div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "noreply@nepaliparty.ca",
    to: adminEmail,
    subject: `[Admin] New order – ${data.quantity} ticket(s) from ${data.buyerName}`,
    html: baseTemplate(body),
  });
}
