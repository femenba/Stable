const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://stableadhd.com').trim()
const ACCOUNT = `${APP_URL}/account`
const PRICING  = `${APP_URL}/pricing`
const SUPPORT  = 'support@stableadhd.com'

// ── Primitives ─────────────────────────────────────────────────────────────────

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>stable.</title>
<style>
  @media (max-width: 600px) {
    .outer   { padding: 24px 12px !important; }
    .card    { border-radius: 0 !important; }
    .body    { padding: 28px 24px !important; }
    .header  { padding: 24px 24px 20px !important; }
    .footer  { padding: 16px 24px !important; border-radius: 0 0 12px 12px !important; }
    .btn     { display: block !important; text-align: center !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#F0F4F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table class="outer" width="100%" cellpadding="0" cellspacing="0"
  style="background:#F0F4F1;padding:40px 16px;">
  <tr><td align="center">
    <table class="card" width="100%" cellpadding="0" cellspacing="0"
      style="max-width:560px;border-radius:14px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">

      <!-- Header -->
      <tr><td class="header"
        style="background:linear-gradient(135deg,#2E5540 0%,#4A7A5F 55%,#6B9E80 100%);
               padding:32px 40px 28px;">
        <p style="margin:0;color:#FFFFFF;font-size:28px;font-weight:800;letter-spacing:-0.8px;
                  line-height:1;">stable.</p>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.72);font-size:13px;letter-spacing:0.1px;">
          Support for the ADHD mind</p>
      </td></tr>

      <!-- Body -->
      <tr><td class="body"
        style="background:#FFFFFF;padding:36px 40px;
               border-left:1px solid #DDE8DE;border-right:1px solid #DDE8DE;">
        ${content}
      </td></tr>

      <!-- Footer -->
      <tr><td class="footer"
        style="background:#F0F4F1;border:1px solid #DDE8DE;border-top:none;
               border-radius:0 0 14px 14px;padding:20px 40px;">
        <p style="margin:0;color:#8FA898;font-size:12px;line-height:1.7;">
          You're receiving this because you have a stable. account.<br />
          Manage your subscription:&nbsp;
          <a href="${ACCOUNT}" style="color:#4A7A5F;text-decoration:none;">${ACCOUNT.replace('https://', '')}</a>
          &nbsp;·&nbsp;
          Questions? <a href="mailto:${SUPPORT}" style="color:#4A7A5F;text-decoration:none;">${SUPPORT}</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

function btn(label: string, href: string, secondary = false): string {
  const bg = secondary
    ? 'background:#F0F4F1;color:#4A7A5F;border:1.5px solid #B8CEBC;'
    : 'background:linear-gradient(135deg,#3D6B54 0%,#5E8B71 100%);color:#FFFFFF;border:none;'
  return `<a class="btn" href="${href}"
    style="display:inline-block;${bg}font-size:15px;font-weight:700;text-decoration:none;
           padding:13px 28px;border-radius:9px;letter-spacing:-0.2px;cursor:pointer;">${label}</a>`
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 14px;color:#1A2B1E;font-size:22px;font-weight:800;
                     line-height:1.3;letter-spacing:-0.3px;">${text}</h1>`
}

function p(text: string, small = false): string {
  const size = small ? '13px' : '15px'
  const color = small ? '#9EADA1' : '#4A5E50'
  return `<p style="margin:0 0 14px;color:${color};font-size:${size};line-height:1.7;">${text}</p>`
}

function hr(): string {
  return `<hr style="border:none;border-top:1px solid #E6EDEA;margin:24px 0;" />`
}

function infoBox(lines: string[]): string {
  const rows = lines
    .map(l => `<p style="margin:5px 0;color:#1A2B1E;font-size:14px;line-height:1.5;">${l}</p>`)
    .join('')
  return `<div style="background:#F5F9F5;border:1px solid #C8DDD0;border-radius:10px;
                      padding:16px 20px;margin:0 0 22px;">${rows}</div>`
}

function featureList(items: string[]): string {
  const rows = items
    .map(item => `<tr>
      <td style="padding:5px 0;color:#4A7A5F;font-size:16px;vertical-align:top;
                 width:22px;line-height:1.5;">✓</td>
      <td style="padding:5px 0;color:#1A2B1E;font-size:14px;line-height:1.6;">${item}</td>
    </tr>`)
    .join('')
  return `<table cellpadding="0" cellspacing="0"
    style="margin:4px 0 22px;border-spacing:0;">${rows}</table>`
}

function supportNote(): string {
  return p(
    `Questions? Reply to this email or write to
     <a href="mailto:${SUPPORT}" style="color:#4A7A5F;text-decoration:none;">${SUPPORT}</a>
     — we'll get back to you quickly.`,
    true,
  )
}

// ── Templates ──────────────────────────────────────────────────────────────────

/** Sent immediately when a trial subscription is created. */
export function welcomeTrialHtml(trialEndsAt: Date): string {
  const chargeDate = trialEndsAt.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  return layout(`
    ${h1('Welcome to Stable Pro — your free trial has started')}
    ${p("You're all set. Your 7-day free trial is now active. No charge until the trial ends.")}
    ${infoBox([
      `<strong>Trial ends:</strong> ${chargeDate}`,
      `<strong>First charge:</strong> ${chargeDate} — £4.99/month`,
      `<strong>Cancel anytime</strong> before ${chargeDate} and you won't be charged a penny.`,
    ])}
    ${p('<strong>Everything included in Stable Pro:</strong>')}
    ${featureList([
      'Full support tool library',
      'Guided focus sessions',
      'Wellbeing tracking',
      'Mood and focus history',
      'Priority access to new features',
    ])}
    <table cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
      <tr>
        <td style="padding-right:12px;">${btn('Open Stable', ACCOUNT)}</td>
        <td>${btn('Manage billing', ACCOUNT, true)}</td>
      </tr>
    </table>
    ${hr()}
    ${p('To cancel before your trial ends, open your account and tap <strong>Manage billing</strong>. Cancellations take effect immediately — you keep access until the trial ends.', true)}
    ${supportNote()}
  `)
}

/** Sent immediately when a non-trial Pro subscription is created. */
export function welcomeProHtml(): string {
  return layout(`
    ${h1('Welcome to Stable Pro')}
    ${p('Your Pro subscription is now active. Thank you for supporting stable.')}
    ${infoBox([
      `<strong>Plan:</strong> Stable Pro`,
      `<strong>Amount:</strong> £4.99/month`,
      `<strong>Billing:</strong> Monthly · cancel anytime`,
    ])}
    ${p('<strong>Everything included in your plan:</strong>')}
    ${featureList([
      'Full support tool library',
      'Guided focus sessions',
      'Wellbeing tracking',
      'Mood and focus history',
      'Priority access to new features',
    ])}
    ${btn('Open Stable', ACCOUNT)}
    ${hr()}
    ${p('You can cancel or change your plan at any time from your account page. Your data is always yours.', true)}
    ${supportNote()}
  `)
}

/** Sent ~24 hours before the trial ends (configure timing in Stripe Dashboard →
 *  Settings → Subscription behaviour → trial_will_end notification). */
export function trialEndingHtml(trialEndsAt: Date): string {
  const endDate = trialEndsAt.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  return layout(`
    ${h1('Your Stable Pro trial ends tomorrow')}
    ${p("Just a heads-up — your free trial is coming to an end. Here's what happens next.")}
    ${infoBox([
      `<strong>Trial ends:</strong> ${endDate}`,
      `<strong>Amount:</strong> £4.99/month`,
      `<strong>Next charge:</strong> ${endDate} — charged to your saved payment method`,
    ])}
    ${p('If you\'d like to keep your Pro access, no action is needed — your subscription continues automatically.')}
    ${p('Want to cancel? Open your account and tap <strong>Manage billing</strong> before the trial ends.')}
    <table cellpadding="0" cellspacing="0" style="margin:22px 0 8px;">
      <tr>
        <td style="padding-right:12px;">${btn('Manage billing', ACCOUNT)}</td>
        <td>${btn('Open Stable', ACCOUNT, true)}</td>
      </tr>
    </table>
    ${hr()}
    ${supportNote()}
  `)
}

/** Sent after the first successful monthly invoice payment. */
export function paymentSucceededHtml(): string {
  return layout(`
    ${h1('Payment confirmed — you\'re on Stable Pro')}
    ${p('Your payment was successful. Your Stable Pro subscription is active.')}
    ${infoBox([
      `<strong>Plan:</strong> Stable Pro`,
      `<strong>Amount charged:</strong> £4.99`,
      `<strong>Billing:</strong> Monthly · renews automatically`,
    ])}
    ${p('Thank you for supporting stable. — it helps us keep building tools that actually work for the ADHD mind.')}
    ${btn('Open Stable', ACCOUNT)}
    ${hr()}
    ${p('To cancel or update your payment method, visit your account page anytime.', true)}
    ${supportNote()}
  `)
}

/** Sent when a Stripe invoice payment fails. */
export function paymentFailedHtml(): string {
  return layout(`
    ${h1('Your payment didn\'t go through')}
    ${p("We weren't able to charge your saved payment method for your Stable Pro subscription.")}
    ${p('This sometimes happens when a card expires or your bank declines the charge temporarily.')}
    ${infoBox([
      `<strong>Action needed:</strong> Update your payment method`,
      `<strong>What happens next:</strong> Stripe will retry automatically`,
      `<strong>Pro access:</strong> Remains active during retries`,
    ])}
    ${p('To fix this now, update your card in the billing portal:')}
    ${btn('Update payment method', ACCOUNT)}
    ${hr()}
    ${p('If you don\'t update your payment method, your Pro access may be paused after several failed attempts. Your data will always be kept safe.', true)}
    ${supportNote()}
  `)
}

/** Sent when a subscription is cancelled. */
export function cancellationHtml(accessEndsAt: Date): string {
  const endDate = accessEndsAt.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  return layout(`
    ${h1('Subscription cancelled')}
    ${p('We\'ve confirmed your cancellation. No further charges will be made.')}
    ${infoBox([
      `<strong>Pro access until:</strong> ${endDate}`,
      `<strong>After that:</strong> Free plan — your data stays intact`,
      `<strong>Further billing:</strong> None`,
    ])}
    ${p(`You'll have full Pro access until <strong>${endDate}</strong>. After that, your account moves to the free plan automatically — no data is deleted.`)}
    ${p('Changed your mind? You can reactivate Pro anytime from the pricing page.')}
    ${btn('Reactivate Pro', PRICING)}
    ${hr()}
    ${p('If you cancelled by mistake or have feedback about why you left, we\'d love to hear from you.', true)}
    ${supportNote()}
  `)
}
