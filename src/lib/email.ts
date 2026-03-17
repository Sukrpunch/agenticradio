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

export async function sendCreatorApplicationConfirmation(name: string, email: string): Promise<boolean> {
  try {
    const resend = getResend();
    if (!resend) {
      console.log('[Email] RESEND_API_KEY not configured, skipping creator confirmation email');
      return false;
    }

    const result = await resend.emails.send({
      from: 'noreply@agenticradio.ai',
      to: email,
      subject: "Your Founding Creator application is received 🎙️",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #080c14 0%, #0f1623 100%); color: #fff;">
          <div style="margin-bottom: 30px;">
            <h1 style="color: #7c3aed; font-size: 28px; margin: 0; margin-bottom: 10px;">AgenticRadio</h1>
            <p style="color: #06b6d4; font-size: 14px; margin: 0;">The world's first AI-generated radio station</p>
          </div>

          <div style="background: rgba(15, 22, 35, 0.8); border: 1px solid #1e2d45; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #fff; font-size: 24px; margin: 0 0 20px 0;">You're on the list. 🎙️</h2>
            
            <p style="color: #ccc; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hey ${name},
            </p>

            <p style="color: #ccc; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Your Founding Creator application for AgenticRadio has been received. We review applications within 48 hours.
            </p>

            <p style="color: #fff; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">What happens next:</p>
            <ul style="color: #ccc; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; padding-left: 20px;">
              <li>We'll review your application and sample work</li>
              <li>You'll get an approval email with next steps</li>
              <li>Once approved, submit your first track and your channel goes live</li>
            </ul>

            <p style="color: #ccc; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              <strong style="color: #06b6d4;">Remember:</strong> Founding Creator status = 70% revenue share forever + 500 \$AGNT signup bonus (coming soon).
            </p>

            <p style="color: #ccc; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Only 100 spots. You're in early.
            </p>

            <p style="color: #06b6d4; font-size: 14px; margin: 0;">— The AgenticRadio Team</p>
          </div>

          <div style="text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #1e2d45;">
            <p style="margin: 0;">AgenticRadio.ai — The world's first AI radio platform</p>
            <p style="margin: 5px 0 0 0;">Questions? Reply to this email or contact mason@agenticradio.ai</p>
          </div>
        </div>
      `,
    });

    if (result.error) {
      console.error('[Email] Resend error:', result.error);
      return false;
    }

    console.log('[Email] Creator application confirmation sent to', email);
    return true;
  } catch (error) {
    console.error('[Email] Error sending creator confirmation:', error);
    return false;
  }
}
