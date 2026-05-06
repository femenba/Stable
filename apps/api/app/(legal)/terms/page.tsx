import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'Terms of Service · stable.',
  description: 'The terms and conditions governing your use of the stable. app and services.',
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

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(192,85,112,0.07)', border: '1px solid rgba(192,85,112,0.18)', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
      <p style={{ fontSize: 14, color: '#A03D58', lineHeight: 1.7, margin: 0, fontWeight: 600 }}>{children}</p>
    </div>
  )
}

export default function TermsPage() {
  return (
    <article style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(48px,6vw,80px) 24px 0', fontFamily: FONT }}>

      {/* Header */}
      <header style={{ marginBottom: 52 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: SAGE, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Legal</p>
        <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, color: T1, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 14 }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 14, color: T3 }}>Last updated: {UPDATED}</p>
      </header>

      {/* Intro */}
      <div style={{ background: CARD, borderRadius: 20, padding: '24px 28px', border: `1px solid ${BDR}`, marginBottom: 48 }}>
        <p style={{ fontSize: 15, lineHeight: 1.75, color: T2, margin: 0 }}>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of stable. (&ldquo;the Service&rdquo;), operated by the stable. team (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By creating an account or using the Service, you agree to be bound by these Terms. Please read them carefully.
        </p>
      </div>

      <Section title="1. Acceptance of Terms">
        <P>By accessing or using stable., you confirm that you are at least 13 years of age, have read and understood these Terms, and agree to be bound by them. If you do not agree, you must not use the Service.</P>
        <P>If you use the Service on behalf of an organisation, you represent that you have authority to bind that organisation to these Terms.</P>
      </Section>

      <Section title="2. Description of Service">
        <P>stable. is a personal wellbeing and productivity application designed to help users manage daily tasks, run focus sessions, track mood patterns, and access evidence-based emotional support tools. The Service is available via web browser and as a Progressive Web App (PWA) that can be installed on your home screen.</P>
        <P>We reserve the right to modify, suspend, or discontinue any part of the Service at any time. Where reasonably practicable, we will provide advance notice of significant changes.</P>
      </Section>

      <Section title="3. Account Registration">
        <P>Account creation and authentication are handled through Clerk, our third-party identity provider. You are responsible for:</P>
        <UL items={[
          'Providing accurate and current information during registration',
          'Maintaining the security and confidentiality of your account',
          'All activity that occurs under your account',
          'Notifying us promptly at support@stableadhd.com if you suspect unauthorised access',
        ]} />
        <P>You may not create accounts for others without their consent, or use another person&apos;s account.</P>
      </Section>

      <Section title="4. Important Medical Disclaimer">
        <Alert>
          stable. is a personal productivity and emotional support tool. It is NOT a medical service. It does not provide medical advice, diagnosis, or treatment. Nothing within the Service should be construed as a substitute for professional medical, psychological, or psychiatric advice. Always seek the guidance of a qualified health professional for any concerns about your mental or physical health.
        </Alert>
        <P>The support tools, mood tracking features, and any AI-generated insights in stable. are designed for general wellbeing purposes only. If you are experiencing a mental health crisis, please contact your local emergency services or a crisis helpline immediately.</P>
      </Section>

      <Section title="5. Subscription Plans and Payments">
        <P><strong style={{ color: T1 }}>Free plan.</strong> stable. offers a free tier with no time limit. The Free plan includes core features as described on our Pricing page. We reserve the right to adjust which features are included in the Free plan with reasonable notice.</P>
        <P><strong style={{ color: T1 }}>Pro plan (coming soon).</strong> A paid Pro subscription will be made available at £4.99 per month (GBP). Pro subscribers will have access to additional features as described at the time of launch. Prices are inclusive of applicable VAT.</P>
        <P><strong style={{ color: T1 }}>Billing.</strong> When the Pro plan launches, payments will be processed through Stripe, a third-party payment processor. By subscribing, you authorise us to charge your payment method on a recurring monthly basis until you cancel.</P>
        <P><strong style={{ color: T1 }}>Cancellations.</strong> You may cancel your Pro subscription at any time. Cancellations take effect at the end of the current billing period — you will not be charged again and will retain access to Pro features until the period ends.</P>
        <P><strong style={{ color: T1 }}>Refunds.</strong> We offer a 7-day money-back guarantee on the first payment of a new Pro subscription. After this period, subscription payments are non-refundable unless required by applicable law. Refund requests should be submitted to support@stableadhd.com.</P>
      </Section>

      <Section title="6. Acceptable Use">
        <P>You agree not to use stable. to:</P>
        <UL items={[
          'Violate any applicable laws or regulations',
          'Transmit content that is harmful, offensive, or unlawful',
          'Attempt to gain unauthorised access to any part of the Service or its systems',
          'Interfere with or disrupt the integrity or performance of the Service',
          'Scrape, copy, or harvest data from the Service without our express written consent',
          'Impersonate another person or entity',
          'Use the Service for commercial purposes without our prior written consent',
        ]} />
      </Section>

      <Section title="7. Your Content">
        <P>You retain ownership of the data you enter into stable. — your tasks, mood entries, focus records, and reminders are yours. By using the Service, you grant us a limited, non-exclusive licence to store and process this data solely to provide you with the Service.</P>
        <P>We do not use your personal wellbeing data for advertising or share it with third parties for commercial purposes.</P>
      </Section>

      <Section title="8. Intellectual Property">
        <P>The stable. name, logo, design, and all original content, features, and functionality are owned by us and are protected by applicable intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of the Service without our express written consent.</P>
      </Section>

      <Section title="9. Limitation of Liability">
        <P>To the maximum extent permitted by applicable law, stable. and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, loss of profits, or business interruption, arising out of or in connection with your use of the Service.</P>
        <P>Our total liability to you for any claims arising under these Terms shall not exceed the amount you paid us in the 12 months preceding the claim, or £50 (GBP), whichever is greater.</P>
        <P>Nothing in these Terms limits our liability for death or personal injury caused by our negligence, or for fraud or fraudulent misrepresentation.</P>
      </Section>

      <Section title="10. Indemnification">
        <P>You agree to indemnify and hold harmless stable. and its operators from any claims, damages, losses, or expenses (including reasonable legal fees) arising from your use of the Service, your violation of these Terms, or your infringement of any third-party rights.</P>
      </Section>

      <Section title="11. Service Availability">
        <P>We aim to provide a reliable service but do not guarantee uninterrupted availability. The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied. We may perform maintenance, updates, or experience downtime beyond our control.</P>
      </Section>

      <Section title="12. Account Termination">
        <P>You may delete your account at any time via account settings or by contacting us at support@stableadhd.com. Upon deletion, your personal data will be removed in accordance with our Privacy Policy.</P>
        <P>We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or otherwise harm other users or the Service. Where possible, we will provide notice before taking such action.</P>
      </Section>

      <Section title="13. Governing Law">
        <P>These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</P>
      </Section>

      <Section title="14. Changes to These Terms">
        <P>We may update these Terms from time to time to reflect changes in the Service or applicable law. When we make material changes, we will notify you by email or by a prominent notice in the app. The &ldquo;Last updated&rdquo; date at the top of this page will reflect the most recent version.</P>
        <P>Continued use of the Service after changes take effect constitutes your acceptance of the revised Terms.</P>
      </Section>

      <Section title="15. Contact">
        <P>For questions about these Terms, please contact:</P>
        <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 16, padding: '18px 22px', display: 'inline-block' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: T1, marginBottom: 4 }}>stable. Support</p>
          <a href="mailto:support@stableadhd.com" style={{ fontSize: 14, color: SAGE, fontWeight: 600, textDecoration: 'none' }}>support@stableadhd.com</a>
        </div>
      </Section>

    </article>
  )
}
