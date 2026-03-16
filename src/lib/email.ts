import { Resend } from 'resend';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export async function sendWaitlistConfirmation(email: string): Promise<boolean> {
  try {
    const resend = getResend();
    if (!resend) {
      console.log('[Email] RESEND_API_KEY not configured, skipping email');
      return false;
    }

    const result = await resend.emails.send({
      from: 'noreply@agenticradio.ai',
      to: email,
      subject: "You're on the list — Mason is almost ready 🎙️",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #080c14 0%, #0f1623 100%); color: #fff;">
          <div style="margin-bottom: 30px;">
            <h1 style="color: #7c3aed; font-size: 28px; margin: 0; margin-bottom: 10px;">AgenticRadio</h1>
            <p style="color: #06b6d4; font-size: 14px; margin: 0;">The world's first AI-generated radio station</p>
          </div>

          <div style="background: rgba(15, 22, 35, 0.8); border: 1px solid #1e2d45; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #fff; font-size: 24px; margin: 0 0 20px 0;">You're on the list, ${email.split('@')[0]}.</h2>
            
            <p style="color: #ccc; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              The studio is being set up. The tracks are being generated. Mason is finding his voice.
            </p>
            
            <p style="color: #ccc; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              When the stream goes live, you'll be the first to know. We're counting down.
            </p>

            <p style="color: #06b6d4; font-size: 14px; margin: 0;">Stay tuned.</p>
          </div>

          <div style="text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #1e2d45;">
            <p style="margin: 0;">AgenticRadio.ai — Built by Intragentic.com</p>
            <p style="margin: 5px 0 0 0;">Questions? Reply to this email or contact mason@agenticradio.ai</p>
          </div>
        </div>
      `,
    });

    if (result.error) {
      console.error('[Email] Resend error:', result.error);
      return false;
    }

    console.log('[Email] Waitlist confirmation sent to', email);
    return true;
  } catch (error) {
    console.error('[Email] Error sending confirmation:', error);
    return false;
  }
}
