import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'Privacy Policy · stable.',
  description: 'How stable. collects, uses, and protects your personal and wellbeing data.',
}

const FONT   = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const T1     = '#1A2B1E'
const T2     = '#5A6B5E'
const T3     = '#9EADA1'
const SAGE   = '#4A7A5F'
const BDR    = 'rgba(74,122,95,0.12)'
const CARD   = '#FFFFFF'

const UPDATED = '6 May 2025'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: T1, marginBottom: 14, letterSpacing: '-0.3px' }}>{title}</h2>
      <div style={{ fontSize: 15, lineHeight: 1.75, color: T2 }}>{children}</div>
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ marginBottom: 12 }}>{children}</p>
}

function UL({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
      {items.map((item) => (
        <li key={item} style={{ marginBottom: 8 }}>{item}</li>
      ))}
    </ul>
  )
}

export default function PrivacyPage() {
  return (
    <article style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(48px,6vw,80px) 24px 0', fontFamily: FONT }}>

      {/* Header */}
      <header style={{ marginBottom: 52 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: SAGE, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Legal</p>
        <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, color: T1, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 14 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: T3 }}>Last updated: {UPDATED}</p>
      </header>

      {/* Intro */}
      <div style={{ background: CARD, borderRadius: 20, padding: '24px 28px', border: `1px solid ${BDR}`, marginBottom: 48 }}>
        <p style={{ fontSize: 15, lineHeight: 1.75, color: T2, margin: 0 }}>
          stable. is a personal wellbeing and productivity application built for people who want to manage their focus, mood, and daily routines. We take your privacy seriously. This policy explains what data we collect, why we collect it, how we protect it, and what rights you have over it.
        </p>
      </div>

      <Section title="1. Information We Collect">
        <P><strong style={{ color: T1 }}>Account information.</strong> When you create an account, your authentication is handled by Clerk. This includes your name, email address, and any social login details (for example, your Google account name). We receive a user identifier from Clerk to associate your data with your account — we do not store your password.</P>
        <P><strong style={{ color: T1 }}>Wellbeing data.</strong> The core purpose of stable. is to help you track your focus, mood, and daily wellbeing. As part of using the app, we store:</P>
        <UL items={[
          'Mood check-in entries: your daily mood rating (1–5 scale) and the date it was logged',
          'Focus sessions: start/end times, session duration, and any task associated',
          'Tasks: task names, completion status, categories, and due dates',
          'Reminders: reminder text and scheduled times',
        ]} />
        <P><strong style={{ color: T1 }}>Usage data.</strong> We may collect basic technical data to keep the service running and secure — such as your device type, browser version, general location (country level), and pages or features accessed. This data is not sold or used for advertising.</P>
        <P><strong style={{ color: T1 }}>Preferences.</strong> Theme preferences (light/dark mode) are stored in your browser&apos;s local storage and remain on your device only. We do not transmit these to our servers.</P>
      </Section>

      <Section title="2. How We Use Your Information">
        <UL items={[
          'To provide the stable. service and keep your data accessible across your devices',
          'To personalise your experience — for example, displaying your mood history and weekly insights',
          'To send important service notifications (account changes, security alerts)',
          'To respond to support requests sent to support@stableadhd.com',
          'To analyse aggregated, anonymised usage trends so we can improve the product',
          'To comply with applicable legal obligations',
        ]} />
        <P>We do not sell your personal data. We do not use your wellbeing data for advertising or share it with data brokers.</P>
      </Section>

      <Section title="3. Data Storage and Security">
        <P>Your account authentication data is stored and managed by <strong style={{ color: T1 }}>Clerk</strong> (clerk.com), a dedicated authentication service. Clerk is SOC 2 Type II certified and applies industry-standard encryption.</P>
        <P>Your wellbeing and app data (tasks, mood entries, focus sessions) is stored in a secured <strong style={{ color: T1 }}>Supabase</strong> database with row-level security policies, meaning your data is only accessible to your account. Supabase servers are hosted within the European Union.</P>
        <P>All data transmission between your device and our servers uses HTTPS/TLS encryption.</P>
      </Section>

      <Section title="4. Third-Party Services">
        <P>stable. uses the following third-party services to operate:</P>
        <UL items={[
          'Clerk (clerk.com) — user authentication and identity management',
          'Supabase (supabase.com) — database storage for your wellbeing data',
          'Vercel (vercel.com) — web application hosting and delivery',
        ]} />
        <P><strong style={{ color: T1 }}>Future: Stripe.</strong> When Pro subscriptions launch, we will integrate Stripe (stripe.com) for payment processing. Stripe handles all payment card data directly — stable. will never store your card details. Stripe&apos;s privacy policy and data practices will apply to payment-related information at that point.</P>
        <P>Each of these providers operates under their own privacy policies and data processing agreements. We select partners who meet appropriate data protection standards.</P>
      </Section>

      <Section title="5. Cookies and Local Storage">
        <P>stable. uses browser local storage — not advertising cookies — to remember your preferences (such as dark/light mode). We do not use third-party tracking cookies or advertising pixels.</P>
        <P>Authentication session tokens set by Clerk are stored securely in cookies to keep you signed in. These are strictly necessary for the service to function.</P>
      </Section>

      <Section title="6. Data Retention">
        <P>We retain your account and wellbeing data for as long as your account is active. If you delete your account, we will permanently delete your associated data within 30 days, except where we are required by law to retain it for longer.</P>
        <P>Anonymous, aggregated analytics data may be retained indefinitely as it cannot be traced back to any individual user.</P>
      </Section>

      <Section title="7. Your Rights">
        <P>Depending on where you are located, you may have the following rights regarding your personal data:</P>
        <UL items={[
          'Right of access — request a copy of the personal data we hold about you',
          'Right to rectification — request correction of inaccurate or incomplete data',
          'Right to erasure — request deletion of your personal data ("right to be forgotten")',
          'Right to data portability — receive your data in a structured, machine-readable format',
          'Right to object — object to our processing of your data in certain circumstances',
          'Right to withdraw consent — where processing is based on consent, withdraw it at any time',
        ]} />
        <P>To exercise any of these rights, please email us at <a href="mailto:support@stableadhd.com" style={{ color: SAGE, fontWeight: 600 }}>support@stableadhd.com</a>. We will respond within 30 days.</P>
        <P>If you are located in the UK or EU, you also have the right to lodge a complaint with your local supervisory authority (in the UK, this is the Information Commissioner&apos;s Office — ico.org.uk).</P>
      </Section>

      <Section title="8. Children's Privacy">
        <P>stable. is not directed at children under the age of 13. We do not knowingly collect personal data from children under 13. If you believe a child under 13 has provided us with personal information, please contact us and we will delete it promptly.</P>
      </Section>

      <Section title="9. Changes to This Policy">
        <P>We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or by a prominent notice in the app. The &ldquo;Last updated&rdquo; date at the top of this page will always reflect the most recent version.</P>
        <P>Continued use of stable. after changes become effective constitutes your acceptance of the revised policy.</P>
      </Section>

      <Section title="10. Contact Us">
        <P>If you have any questions about this Privacy Policy or how we handle your data, please contact:</P>
        <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 16, padding: '18px 22px', display: 'inline-block' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: T1, marginBottom: 4 }}>stable. Support</p>
          <a href="mailto:support@stableadhd.com" style={{ fontSize: 14, color: SAGE, fontWeight: 600, textDecoration: 'none' }}>support@stableadhd.com</a>
        </div>
      </Section>

    </article>
  )
}
