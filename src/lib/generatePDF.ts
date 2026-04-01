import { SignalResult } from "./analysisEngine";

export async function downloadReportAsPDF(reportData: {
  productTitle: string;
  platform: string;
  credibilityScore: number;
  confidenceLevel: string;
  recommendation: string;
  aiVerdict: string;
  aiSummary: string;
  aiPros: string[];
  aiCons: string[];
  aiWhoItsFor: string;
  signalResults: SignalResult[];
  totalReviews: number;
  suspiciousCount: number;
  genuineCount: number;
  shareUrl: string;
  createdAt: string;
}) {
  // Dynamically import to avoid SSR issues
  const { default: jsPDF } = await import("jspdf");
  const { default: html2canvas } = await import("html2canvas");

  const container = document.createElement("div");
  container.id = "pdf-report-container";
  container.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 800px; background: #ffffff; padding: 48px;
    font-family: Arial, sans-serif; color: #1a1a1a;
  `;

  const scoreColor = reportData.credibilityScore >= 70 ? "#16a34a"
    : reportData.credibilityScore >= 40 ? "#d97706" : "#dc2626";

  const recLabel = reportData.recommendation === "buy" ? "✓ Recommended"
    : reportData.recommendation === "caution" ? "⚠ Proceed with Caution"
    : "✗ Avoid this product";

  container.innerHTML = `
    <div style="border-bottom: 3px solid #00E5FF; padding-bottom: 24px; margin-bottom: 32px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h1 style="font-size:28px; font-weight:700; margin:0 0 4px;">ReviewRadar</h1>
          <p style="color:#666; font-size:14px; margin:0;">Fake Review Analysis Report</p>
        </div>
        <div style="text-align:right;">
          <div style="font-size:52px; font-weight:700; color:${scoreColor}; line-height:1;">${reportData.credibilityScore}</div>
          <div style="font-size:13px; color:#666;">out of 100 — ${reportData.confidenceLevel} confidence</div>
        </div>
      </div>
    </div>

    <div style="margin-bottom:24px;">
      <h2 style="font-size:18px; margin:0 0 6px;">${reportData.productTitle}</h2>
      <p style="color:#666; margin:0 0 12px; font-size:14px;">
        Platform: ${reportData.platform.charAt(0).toUpperCase() + reportData.platform.slice(1)} &nbsp;·&nbsp;
        Analysed: ${new Date(reportData.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })} &nbsp;·&nbsp;
        ${reportData.totalReviews} reviews analysed
      </p>
      <div style="display:inline-block; padding:8px 20px; border-radius:20px; background:${scoreColor}20; color:${scoreColor}; font-weight:600; font-size:14px;">
        ${recLabel}
      </div>
    </div>

    ${reportData.aiVerdict ? `
    <div style="background:#f8f9fa; border-left:4px solid ${scoreColor}; padding:20px; border-radius:0 8px 8px 0; margin-bottom:24px;">
      <h3 style="font-size:15px; font-weight:600; margin:0 0 10px;">AI Verdict</h3>
      <p style="font-size:14px; line-height:1.8; margin:0; color:#333;">${reportData.aiVerdict}</p>
    </div>` : ""}

    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:24px;">
      <div style="background:#f8f9fa; padding:16px; border-radius:8px; text-align:center;">
        <div style="font-size:28px; font-weight:700;">${reportData.totalReviews}</div>
        <div style="font-size:12px; color:#666;">Reviews analysed</div>
      </div>
      <div style="background:#fef2f2; padding:16px; border-radius:8px; text-align:center;">
        <div style="font-size:28px; font-weight:700; color:#dc2626;">${reportData.suspiciousCount}</div>
        <div style="font-size:12px; color:#666;">Suspicious reviews</div>
      </div>
      <div style="background:#f0fdf4; padding:16px; border-radius:8px; text-align:center;">
        <div style="font-size:28px; font-weight:700; color:#16a34a;">${reportData.genuineCount}</div>
        <div style="font-size:12px; color:#666;">Genuine reviews</div>
      </div>
    </div>

    <h3 style="font-size:15px; font-weight:600; margin:0 0 12px;">Signal Breakdown</h3>
    <table style="width:100%; border-collapse:collapse; margin-bottom:24px; font-size:13px;">
      <thead>
        <tr style="background:#f8f9fa;">
          <th style="text-align:left; padding:10px 12px; border:1px solid #e5e7eb;">Signal</th>
          <th style="text-align:center; padding:10px 12px; border:1px solid #e5e7eb;">Status</th>
          <th style="text-align:left; padding:10px 12px; border:1px solid #e5e7eb;">Details</th>
          <th style="text-align:right; padding:10px 12px; border:1px solid #e5e7eb;">Penalty</th>
        </tr>
      </thead>
      <tbody>
        ${reportData.signalResults.map(s => `
          <tr>
            <td style="padding:10px 12px; border:1px solid #e5e7eb;">${s.signalName}</td>
            <td style="padding:10px 12px; border:1px solid #e5e7eb; text-align:center;">
              <span style="padding:2px 10px; border-radius:12px; font-size:11px; font-weight:600;
                background:${s.status === "triggered" ? "#fef2f2" : s.status === "clean" ? "#f0fdf4" : "#f9fafb"};
                color:${s.status === "triggered" ? "#dc2626" : s.status === "clean" ? "#16a34a" : "#6b7280"};">
                ${s.status.charAt(0).toUpperCase() + s.status.slice(1)}
              </span>
            </td>
            <td style="padding:10px 12px; border:1px solid #e5e7eb; color:#555;">${s.details}</td>
            <td style="padding:10px 12px; border:1px solid #e5e7eb; text-align:right; font-weight:600;">
              ${s.status === "skipped" ? "—" : `-${s.penaltyApplied.toFixed(1)}`}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    ${reportData.aiSummary ? `
    <h3 style="font-size:15px; font-weight:600; margin:0 0 12px;">What real buyers say</h3>
    <p style="font-size:14px; line-height:1.8; color:#333; margin-bottom:16px;">${reportData.aiSummary}</p>
    ${reportData.aiPros.length > 0 ? `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
      <div>
        <p style="font-weight:600; font-size:13px; margin:0 0 8px; color:#16a34a;">✓ Pros</p>
        ${reportData.aiPros.map(p => `<p style="font-size:13px; margin:0 0 6px; padding-left:12px;">• ${p}</p>`).join("")}
      </div>
      <div>
        <p style="font-weight:600; font-size:13px; margin:0 0 8px; color:#dc2626;">✗ Cons</p>
        ${reportData.aiCons.length > 0
          ? reportData.aiCons.map(c => `<p style="font-size:13px; margin:0 0 6px; padding-left:12px;">• ${c}</p>`).join("")
          : `<p style="font-size:13px; color:#666; padding-left:12px;">No significant complaints</p>`}
      </div>
    </div>` : ""}
    <p style="font-size:13px; background:#f0fdfa; padding:10px 16px; border-radius:6px; color:#0f766e; margin-bottom:24px;">
      Best for: ${reportData.aiWhoItsFor}
    </p>` : ""}

    <div style="border-top:1px solid #e5e7eb; padding-top:16px; display:flex; justify-content:space-between; align-items:center;">
      <p style="font-size:12px; color:#9ca3af; margin:0;">Generated by ReviewRadar · reviewradar.vercel.app</p>
      <p style="font-size:12px; color:#9ca3af; margin:0;">Full report: ${reportData.shareUrl}</p>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `ReviewRadar-${reportData.productTitle.slice(0, 30).replace(/[^a-z0-9]/gi, "-")}-${reportData.credibilityScore}.pdf`;
    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}
