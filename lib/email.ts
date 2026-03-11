import nodemailer from "nodemailer";
import { EVENT_CONFIG, SITE_CONFIG } from "./config";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function baseTemplate(body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${EVENT_CONFIG.title}</title>
  <style>
    body { font-family: Arial, sans-serif; background:#f4f4f5; margin:0; padding:0; }
    .wrapper { max-width:560px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; border:1px solid #e4e4e7; }
    .header { background:#18181b; padding:28px 24px; text-align:center; }
    .header h1 { color:#fafafa; margin:0; font-size:20px; font-weight:600; }
    .header p  { color:#a1a1aa; margin:4px 0 0; font-size:13px; }
    .body { padding:28px 24px; color:#27272a; line-height:1.6; font-size:14px; }
    .row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f4f4f5; font-size:13px; }
    .row span:first-child { color:#71717a; }
    .row span:last-child { color:#18181b; font-weight:500; }
    .footer { background:#fafafa; padding:16px 24px; text-align:center; font-size:11px; color:#a1a1aa; border-top:1px solid #e4e4e7; }
    .btn { display:inline-block; background:#18181b; color:#fafafa; text-decoration:none; padding:10px 24px; border-radius:6px; font-weight:500; font-size:13px; margin:16px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>${EVENT_CONFIG.title}</h1>
      <p>${EVENT_CONFIG.nepaliTitle}</p>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      <p>${EVENT_CONFIG.venue} &middot; ${EVENT_CONFIG.address}</p>
      <p>${EVENT_CONFIG.date} | Doors open ${EVENT_CONFIG.doorsOpen}</p>
      <p style="margin-top:6px;">
        Questions? <a href="mailto:${SITE_CONFIG.contactEmail}" style="color:#18181b;">${SITE_CONFIG.contactEmail}</a>
      </p>
    </div>
  </div>
</body>
</html>`.trim();
}

export interface TicketEmailData {
  to: string;
  name: string;
  tickets: Array<{ ticketNumber: string; holderName?: string | null }>;
  orderId: string;
  quantity: number;
  total: number;
  appUrl: string;
  pdfBuffers?: Array<{ filename: string; content: Buffer }>;
}

export async function sendTicketConfirmationEmail(data: TicketEmailData) {
  const { to, name, tickets, orderId, quantity, total, appUrl, pdfBuffers } = data;

  const ticketList = tickets
    .map((t) => `<div class="row"><span>${t.ticketNumber}</span><span>${t.holderName ?? ""}</span></div>`)
    .join("");

  const body = `
    <h2 style="color:#18181b;margin-top:0;">Your tickets are confirmed!</h2>
    <p>Hi ${name},</p>
    <p>Thank you for purchasing tickets to <strong>${EVENT_CONFIG.title}</strong>. Your PDF ticket${quantity > 1 ? "s are" : " is"} attached to this email — download and present at the door.</p>

    <div class="row"><span>Date </span><span>${EVENT_CONFIG.date}</span></div>
    <div class="row"><span>Doors Open </span><span>${EVENT_CONFIG.doorsOpen}</span></div>
    <div class="row"><span>Venue </span><span>${EVENT_CONFIG.venue}</span></div>
    <div class="row"><span>Tickets </span><span>${quantity}</span></div>
    <div class="row"><span>Total Paid </span><span>$${(total / 100).toFixed(2)} CAD</span></div>

    <h3 style="color:#18181b;margin-top:20px;">Ticket Numbers</h3>
    ${ticketList}

    <p style="font-size:12px;color:#71717a;margin-top:16px;">
      <strong>Order ID: </strong> ${orderId}<br/>
      Please save this email and the attached PDF. A valid photo ID is required at the door.
    </p>
  `;

  const attachments = pdfBuffers?.map((p) => ({
    filename: p.filename,
    content: p.content,
    contentType: "application/pdf",
  })) ?? [];

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? `"${EVENT_CONFIG.title}" <noreply@nepaliparty.ca>`,
    to,
    subject: `Your Tickets – ${EVENT_CONFIG.title}`,
    html: baseTemplate(body),
    attachments,
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
    <h2 style="margin-top:0;">New Ticket Order</h2>
    <div class="row"><span>Order ID</span><span>${data.orderId}</span></div>
    <div class="row"><span>Buyer</span><span>${data.buyerName} (${data.buyerEmail})</span></div>
    <div class="row"><span>Tickets</span><span>${data.quantity}</span></div>
    <div class="row"><span>Total</span><span>$${(data.total / 100).toFixed(2)} CAD</span></div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "noreply@nepaliparty.ca",
    to: adminEmail,
    subject: `[Admin] New order – ${data.quantity} ticket(s) from ${data.buyerName}`,
    html: baseTemplate(body),
  });
}

