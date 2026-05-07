const APP_URL  = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://stableadhd.com').trim()
const ACCOUNT  = `${APP_URL}/account`
const PRICING  = `${APP_URL}/pricing`

// ── Shared layout ──────────────────────────────────────────────────────────────

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>stable.</title>
</head>
<body style="margin:0;padding:0;background:#F3F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F6F3;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#3D6B54 0%,#5E8B71 55%,#7BA68A 100%);border-radius:12px 12px 0 0;padding:32px 40px 28px;">
        <p style="margin:0;color:#FFFFFF;font-size:26px;font-weight:700;letter-spacing:-0.5px;">stable.</p>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Support for the ADHD mind</p>
      </td></tr>

      <!-- Body -->
      <tr><td style="background:#FFFFFF;padding:36px 40px;border-left:1px solid #E4EBE5;border-right:1px solid #E4EBE5;">
        ${content}
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#F3F6F3;border:1px solid #E4EBE5;border-top:none;border-radius:0 0 12px 12px;padding:20px 40px;">
        <p style="margin:0;color:#9EADA1;font-size:12px;line-height:1.6;">
          You're receiving this because you have a stable. account.<br />
          Manage your subscription at <a href="${ACCOUNT}" style="color:#4A7A5F;text-decoration:none;">${ACCOUNT.replace('https://', '')}</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

function btn(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#4A7A5F 0%,#5E8B71 100%);color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;padding:13px 28px;border-radius:8px;letter-spacing:-0.2px;">${label}</a>`
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 16px;color:#1A2B1E;font-size:22px;font-weight:700;line-height:1.3;">${text}</h1>`
}

function p(text: string, style = ''): string {
  return `<p style="margin:0 0 16px;color:#5A6B5E;font-size:15px;line-height:1.65;${style}">${text}</p>`
}

function hr(): string {
  return `<hr style="border:none;border-top:1px solid #E4EBE5;margin:24px 0;" />`
}

function featureList(items: string[]): string {
  const rows = items.map(item =>
    `<tr>
      <td style="padding:6px 0;color:#4A7A5F;font-size:16px;vertical-align:top;width:24px;">✓</td>
      <td style="padding:6px 0;color:#1A2B1E;font-size:14px;line-height:1.5;">${item}</td>
    </tr>`
  ).join('')
  return `<table cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">${rows}</table>`
}

function billingBox(lines: string[]): string {
  const content = lines.map(l => `<p style="margin:4px 0;color:#1A2B1E;font-size:14px;">${l}</p>`).join('')
  return `<div style="background:#F3F6F3;border:1px solid #D0DDD2;border-radius:8px;padding:16px 20px;margin:0 0 24px;">${content}</div>`
}

// ── Templates ──────────────────────────────────────────────────────────────────

export function trialStartedHtml(trialEndsAt: Date): string {
  const chargeDate   = trialEndsAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  return layout(`
    ${h1('Your Stable Pro trial has started')}
    ${p("You're all set. Your 7-day free trial is now active — no charge until the trial ends.")}
    ${billingBox([
      `<strong>Trial ends:</strong> ${chargeDate}`,
      `<strong>First charge:</strong> ${chargeDate} — £4.99/month`,
      `<strong>Cancel anytime</strong> before ${chargeDate} and you won't be charged.`,
    ])}
    ${p('Here\'s what\'s included in your Pro plan:')}
    ${featureList([
      'Full support tool library',
      'Guided focus sessions',
      'Wellbeing tracking',
      'Mood and focus history',
      'AI insights (when enabled)',
      'Priority access to new features',
    ])}
    ${btn('Go to my account', ACCOUNT)}
    ${hr()}
    ${p('To cancel before your trial ends, visit your account page and select <strong>Manage billing</strong>. Cancellations take effect immediately.', 'font-size:13px;color:#9EADA1;')}
  `)
}

export function trialEndingHtml(trialEndsAt: Date): string {
  const endDate = trialEndsAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  return layout(`
    ${h1('Your Stable Pro trial ends soon')}
    ${p('Just a heads-up — your free trial is coming to an end.')}
    ${billingBox([
      `<strong>Trial ends:</strong> ${endDate}`,
      `<strong>Amount:</strong> £4.99/month`,
      `<strong>Next charge:</strong> ${endDate}`,
    ])}
    ${p('If you\'d like to keep your Pro access, no action is needed — your subscription will continue automatically.')}
    ${p('To cancel before you\'re charged, visit your account and select <strong>Manage billing</strong>.')}
    ${btn('Manage my subscription', ACCOUNT)}
    ${hr()}
    ${p('Questions about billing? Just reply to this email.', 'font-size:13px;color:#9EADA1;')}
  `)
}

export function paymentSucceededHtml(): string {
  return layout(`
    ${h1('You\'re now on Stable Pro')}
    ${p('Your payment was successful and your Pro subscription is now active.')}
    ${billingBox([
      `<strong>Plan:</strong> Stable Pro`,
      `<strong>Amount:</strong> £4.99/month`,
      `<strong>Billing:</strong> Monthly`,
    ])}
    ${p('Thank you for supporting stable. — it helps us keep building tools that work for the ADHD mind.')}
    ${btn('Go to my account', ACCOUNT)}
    ${hr()}
    ${p('You can cancel or manage your subscription at any time from your account page.', 'font-size:13px;color:#9EADA1;')}
  `)
}

export function paymentFailedHtml(): string {
  return layout(`
    ${h1('Your payment didn\'t go through')}
    ${p('We weren\'t able to process your Stable Pro payment. This sometimes happens if a card expires or there\'s a temporary issue with your bank.')}
    ${p('To keep your Pro access, please update your payment method.')}
    ${btn('Update payment method', ACCOUNT)}
    ${hr()}
    ${p('If you don\'t update your payment method, your Pro access may be paused. Your data will always be safe.', 'font-size:13px;color:#9EADA1;')}
    ${p('If you think this is a mistake, reply to this email and we\'ll look into it.', 'font-size:13px;color:#9EADA1;')}
  `)
}

export function cancellationHtml(accessEndsAt: Date): string {
  const endDate = accessEndsAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  return layout(`
    ${h1('Your Stable Pro subscription has been cancelled')}
    ${p('We\'ve confirmed your cancellation. No further charges will be made.')}
    ${billingBox([
      `<strong>Pro access ends:</strong> ${endDate}`,
      `<strong>Billing:</strong> Stopped`,
    ])}
    ${p('You\'ll continue to have full Pro access until <strong>' + endDate + '</strong>. After that, your account will move to the free plan — your data stays intact.')}
    ${p('If you change your mind, you\'re always welcome back.')}
    ${btn('Reactivate Pro', PRICING)}
    ${hr()}
    ${p('If you cancelled by mistake or have feedback, reply to this email — we\'d love to hear from you.', 'font-size:13px;color:#9EADA1;')}
  `)
}
