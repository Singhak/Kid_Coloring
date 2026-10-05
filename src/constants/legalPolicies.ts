export interface LegalSection {
  id: string;
  title: string;
  content: string[];
  subsections?: { subtitle: string; details: string[] }[];
}

export interface LegalDocument {
  id: 'privacy' | 'terms' | 'refund' | 'contact';
  title: string;
  subtitle: string;
  badge: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const LEGAL_DOCUMENTS: Record<'privacy' | 'terms' | 'refund' | 'contact', LegalDocument> = {
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'Our steadfast commitment to children’s digital safety, COPPA compliance, and zero advertisements.',
    badge: 'Kid-Safe & COPPA Compliant',
    lastUpdated: 'September 2026',
    sections: [
      {
        id: 'overview',
        title: '1. Our Core Philosophy: Kids First',
        content: [
          'Coloro ("we", "us", or "our", operated by Storywalla) is dedicated to providing a safe, joyful, and creative digital coloring studio for children, parents, and educators worldwide.',
          'We believe children should be free to imagine, create, and learn without intrusive tracking, manipulative dark patterns, or behavioral advertising. Our platform adheres strictly to the Children’s Online Privacy Protection Act (COPPA), GDPR-K (General Data Protection Regulation for Children), and global child online protection principles.',
        ],
      },
      {
        id: 'no-ads',
        title: '2. Absolute Zero-Ad & No-Data-Selling Guarantee',
        content: [
          'Coloro is 100% ad-free across both Free and VIP tiers. We never display banner ads, video popups, or interstitial advertisements.',
          'We do not sell, rent, monetize, or trade children’s or parents’ personal information to third-party advertisers, data brokers, or marketing networks under any circumstance.',
        ],
      },
      {
        id: 'data-collection',
        title: '3. Information We Collect and How It Is Used',
        content: [
          'We practice strict data minimization and collect only what is strictly necessary to operate our creative studio:',
        ],
        subsections: [
          {
            subtitle: 'A. Guest & Anonymous Users',
            details: [
              'Children and parents can use Coloro freely without creating an account or providing an email address.',
              'Temporary drawing strokes and colors are processed locally in your browser canvas using HTML5 LocalStorage and are never sent to external servers.',
            ],
          },
          {
            subtitle: 'B. Registered Parent / User Accounts',
            details: [
              'If a parent chooses to sign in via Firebase Authentication (e.g., Google Sign-In), we store only basic account credentials: user email address, display name, and a unique authentication identifier.',
              'This is used exclusively to maintain your purchase history, restore access across devices, and manage your account.',
            ],
          },
          {
            subtitle: 'C. AI Prompt Generation Requests',
            details: [
              'When a user submits a prompt for AI line art generation (e.g., "friendly baby dinosaur having tea"), the text prompt is sent via encrypted HTTPS to our secure API backend (powered by Google Gemini 2.5 Flash).',
              'Prompts are processed ephemerally solely to generate SVG line art paths and are not retained or used to build behavioral user profiles.',
            ],
          },
          {
            subtitle: 'D. Photo-to-Line-Art Processing',
            details: [
              'When you upload a photo to turn into a coloring outline, image processing and edge detection are executed directly within your web browser using HTML5 Canvas.',
              'Your personal family photos and pet pictures are never uploaded, stored, or indexed on our public servers.',
            ],
          },
        ],
      },
      {
        id: 'payments',
        title: '4. Payment Information & Security',
        content: [
          'All payments for Coloro VIP Passes are processed securely through certified payment aggregators (Cashfree Payments).',
          'Coloro never captures, collects, or stores sensitive financial details such as credit card numbers, CVVs, debit card PINs, or UPI MPINs. All transactions comply with RBI guidelines and PCI-DSS Level 1 security standards.',
        ],
      },
      {
        id: 'parental-rights',
        title: '5. Parental Rights & Data Deletion Requests',
        content: [
          'Parents and legal guardians retain full control over their and their child’s information at all times. You have the right to:',
          '• Request a copy of all personal information associated with your account.',
          '• Request the immediate and permanent deletion of your account and all associated cloud data.',
          '• Refuse any further collection of information.',
          'To exercise these rights, simply email our dedicated privacy team at support@coloro.in. Requests are processed within 48 business hours.',
        ],
      },
      {
        id: 'cookies',
        title: '6. Cookies and Local Browser Storage',
        content: [
          'Coloro uses essential local storage strictly for functional application preferences: sound effects volume toggle, active canvas undo/redo states, and user session tokens.',
          'We do not employ third-party advertising cookies or cross-site tracking pixels.',
        ],
      },
      {
        id: 'contact',
        title: '7. Contact Us',
        content: [
          'If you have any questions, concerns, or feedback regarding our privacy practices or your child’s digital safety, please contact us:',
          '• Service Name: Coloro (Storywalla)',
          '• Website: https://coloro.in',
          '• Email: support@coloro.in',
          '• Response SLA: Within 24–48 business hours',
        ],
      },
    ],
  },
  terms: {
    id: 'terms',
    title: 'Terms & Conditions',
    subtitle: 'Rules, guidelines, and acceptable use terms for enjoying Coloro safely and creatively.',
    badge: 'User Agreement & Terms of Service',
    lastUpdated: 'September 2026',
    sections: [
      {
        id: 'agreement',
        title: '1. Acceptance of Terms',
        content: [
          'Welcome to Coloro (https://coloro.in), an interactive digital coloring and educational platform operated by Storywalla ("Company", "we", "us", or "our").',
          'By accessing or using our website, web application, or services, you ("User" or "Parent/Guardian") agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the service.',
        ],
      },
      {
        id: 'parental-supervision',
        title: '2. Child Safety & Parental Supervision',
        content: [
          'Coloro is designed for young children and families. Children under the age of 13 must use the application under the supervision and guidance of a parent, legal guardian, or educator.',
          'Parents and guardians are responsible for supervising their children’s digital screen time and overseeing any purchase decisions on the platform.',
        ],
      },
      {
        id: 'permitted-use',
        title: '3. License & Permitted Use of Coloring Art',
        content: [
          'Subject to these Terms, Coloro grants you a limited, non-exclusive, non-transferable, revocable license to use the platform for personal, non-commercial, and classroom educational purposes.',
        ],
        subsections: [
          {
            subtitle: 'A. Printable Sheets for Home & School',
            details: [
              'You are freely permitted to print coloring pages for your children at home, for school classrooms, daycares, libraries, and homeschool activities.',
              'Redistributing, reselling, packaging, or bulk-selling our coloring sheets or templates as commercial coloring books or digital downloads without prior written consent is strictly prohibited.',
            ],
          },
          {
            subtitle: 'B. User Finished Artworks',
            details: [
              'You retain ownership of the colored and decorated creations you export from Coloro. You are welcome to share your child’s artwork with friends and family on personal social media channels.',
            ],
          },
        ],
      },
      {
        id: 'ai-guidelines',
        title: '4. AI Generation & Safe Prompting Guidelines',
        content: [
          'Coloro incorporates Google Gemini 2.5 Flash artificial intelligence to assist users in creating coloring line art from text prompts.',
          'All user prompts pass through automated safety moderation filters. Users agree not to submit prompts containing:',
          '• Violence, weapons, hatred, discrimination, or adult/sexually explicit themes.',
          '• Harassment, defamation, or infringing content.',
          'We reserve the right to block prompts that violate child-safe content policies. AI-generated line art is provided on an "as-is" creative basis.',
        ],
      },
      {
        id: 'purchases-non-recurring',
        title: '5. Non-Recurring One-Time Purchases (No Auto-Renewals)',
        content: [
          'Coloro offers VIP Passes (e.g., 1-Month Pass at ₹99, 1-Year Pass at ₹499) that grant enhanced features such as unlimited AI generations, photo-to-sketch conversions, pro palettes, and exclusive stamps.',
          'IMPORTANT BILLING CLARIFICATION:',
          '• ALL PURCHASES ON COLORO ARE STRICTLY ONE-TIME, NON-RECURRING PAYMENTS.',
          '• We DO NOT practice auto-renewal or recurring card debits. There are NO unexpected future charges.',
          '• When your purchased pass period expires (after 30 days or 365 days), your account automatically returns to the Free tier. If you wish to continue using VIP superpowers, you must manually initiate a new purchase.',
          '• Prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes.',
        ],
      },
      {
        id: 'intellectual-property',
        title: '6. Intellectual Property Rights',
        content: [
          'The Coloro brand, software code, interactive canvas engine, UI design, illustrations, custom stamps, and logos are the proprietary intellectual property of Storywalla and are protected by applicable copyright, trademark, and intellectual property laws.',
        ],
      },
      {
        id: 'liability',
        title: '7. Disclaimer of Warranties & Limitation of Liability',
        content: [
          'Coloro is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for 99.9% uptime and joyful experiences, we do not warrant that service will be completely uninterrupted or error-free.',
          'To the maximum extent permitted by law, Storywalla shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.',
        ],
      },
      {
        id: 'governing-law',
        title: '8. Governing Law & Dispute Resolution',
        content: [
          'These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in India.',
          'For any inquiries or dispute resolution, please contact support@coloro.in.',
        ],
      },
    ],
  },
  refund: {
    id: 'refund',
    title: 'Refund & Cancellation Policy',
    subtitle: 'Clear, transparent policies regarding one-time purchases, non-refundable digital goods, and failed transaction resolution.',
    badge: 'Transparent & Fair Billing Policy',
    lastUpdated: 'September 2026',
    sections: [
      {
        id: 'non-recurring',
        title: '1. One-Time Purchase Model (No Recurring Debits)',
        content: [
          'At Coloro, we value transparency and parent peace of mind. We DO NOT use recurring subscriptions, hidden auto-debits, or surprise renewal charges.',
          'Every VIP pass purchase (such as a 1-Month Pass for ₹99 or 1-Year Pass for ₹499) is an upfront, ONE-TIME purchase for a fixed period of digital access.',
          'Because there is no recurring billing or automatic renewal, there are no standing subscription mandates to cancel.',
        ],
      },
      {
        id: 'no-refund-policy',
        title: '2. All Sales Final (Non-Refundable After Purchase)',
        content: [
          'Coloro provides instant, immediate digital fulfillment. The moment payment is completed, all premium features — including unlimited Gemini 2.5 Flash AI generation tokens, high-resolution vector PDF exports, photo-to-sketch tools, and all 50+ sticker stamps — are instantly unlocked and made available to your account.',
          'In accordance with standard digital goods and software access regulations:',
          '• ALL PURCHASES ARE FINAL AND NON-REFUNDABLE ONCE ACTIVATED.',
          '• We DO NOT offer money-back guarantees, post-purchase cancellations, or prorated refunds for unused time once access has been delivered.',
          '• We encourage all parents and educators to thoroughly explore our generous Free Forever tier (which includes daily free AI tokens, 100+ templates, stamps, and printable sheets) before making a purchase.',
        ],
      },
      {
        id: 'failed-transactions',
        title: '3. Failed Transactions & Duplicate Deductions (100% Protected)',
        content: [
          'While purchases are non-refundable once activated, we provide complete, 100% protection against technical payment errors and duplicate debits:',
        ],
        subsections: [
          {
            subtitle: 'A. Amount Debited But VIP Access Not Activated',
            details: [
              'If money was deducted from your bank account, UPI app (Google Pay, PhonePe, Paytm), or credit/debit card, but a network interruption or server glitch prevented your VIP pass from unlocking, please contact us.',
              'We will verify the Cashfree transaction ID and either instantly activate your pass or issue a 100% full refund.',
            ],
          },
          {
            subtitle: 'B. Duplicate Payment Deductions',
            details: [
              'If you were accidentally charged more than once for the same transaction due to a gateway timeout or double-click, the duplicate amount will be refunded in full.',
            ],
          },
          {
            subtitle: 'C. Refund Processing Timelines',
            details: [
              'Approved refunds for failed or duplicate transactions are initiated through our payment partner (Cashfree Payments) within 24–48 hours.',
              'The funds typically reflect in your original payment source (bank account, UPI, or card) within 5 to 7 business days, depending on your bank’s settlement processing schedule.',
            ],
          },
        ],
      },
      {
        id: 'how-to-contact',
        title: '4. How to Report a Payment Issue',
        content: [
          'If you experience any billing discrepancy, duplicate charge, or failed activation, our team is ready to assist you promptly:',
          '1. Send an email to support@coloro.in with the subject: "Payment Issue - [Your Registered Email]".',
          '2. Include your Cashfree Order ID or Payment Reference ID (received via SMS/Email from Cashfree or UPI).',
          '3. Attach a screenshot of the payment receipt showing the date, amount, and reference number.',
          'Our support team will review your case and resolve the issue within 24–48 business hours.',
        ],
      },
      {
        id: 'summary-table',
        title: '5. Summary of Purchase Terms',
        content: [
          '• Free Plan: Free forever, no credit card required, daily free AI tokens, standard templates.',
          '• VIP Pass: One-time payment, fixed duration, no auto-renewal, no recurring debits.',
          '• Cancellation: Not applicable as there is no recurring renewal mandate.',
          '• Refund: Non-refundable after instant digital activation; 100% refund for failed/duplicate charges.',
          '• Support Contact: support@coloro.in',
        ],
      },
    ],
  },
  contact: {
    id: 'contact',
    title: 'Contact Us',
    subtitle: 'We are here to assist parents, educators, and schools. Reach out to our dedicated support team.',
    badge: 'Customer Support & Business Inquiries',
    lastUpdated: 'September 2026',
    sections: [
      {
        id: 'official-support',
        title: '1. Customer Support & Inquiries',
        content: [
          'If you have any questions, encounter any technical difficulty, need billing assistance, or wish to share creative suggestions for new templates and tools, please reach out to us:',
          '• Official Support Email: support@coloro.in',
          '• Service Name: Coloro: Magic AI Coloring Book for Kids',
          '• Response Time SLA: Within 24–48 business hours',
          '• Support Operating Hours: Monday to Saturday, 9:00 AM – 6:00 PM IST',
        ],
      },
      {
        id: 'entity-details',
        title: '2. Operating Entity & Merchant Details',
        content: [
          'In accordance with payment gateway standards and consumer protection guidelines, here are our registered operating details:',
          '• Operating Entity: Storywalla (Operating Coloro)',
          '• Official Website: https://coloro.in',
          '• Operating Country: India',
          '• Category: Digital Educational Software & Creative Tools for Kids',
          '• Dedicated Grievance Desk: support@coloro.in',
        ],
      },
      {
        id: 'products-pricing',
        title: '3. Products & Services Offered (Pricing in INR)',
        content: [
          'Coloro provides digital creative web and mobile coloring tools. All prices are explicitly listed in Indian Rupees (INR) with no hidden fees:',
        ],
        subsections: [
          {
            subtitle: 'A. Free Forever Starter Tier — ₹0 (INR)',
            details: [
              '• 100+ standard coloring book templates (Animals, Alphabet, Numbers, Nature, Vehicles).',
              '• Full digital crayon and marker palette with sound effects.',
              '• Daily free AI magic prompt generation preview.',
              '• 1-Click home printable A4 PDF coloring sheets.',
              '• 100% ad-free child safe environment.',
            ],
          },
          {
            subtitle: 'B. VIP Magic Pass - Monthly — ₹99 (INR)',
            details: [
              '• 30 Days of unrestricted digital VIP Superpowers.',
              '• Unlimited Google Gemini AI Prompt Line Art Generator.',
              '• Unlimited Photo-to-Line-Art sketch conversions for family photos.',
              '• Special Glitter, Rainbow, and Pattern fills.',
              '• All 50+ collectible sticker stamps and character faces.',
              '• Strictly one-time payment: NO recurring debits or auto-renewals.',
            ],
          },
          {
            subtitle: 'C. VIP Magic Pass - Annual — ₹499 (INR)',
            details: [
              '• 365 Days (1 Full Year) of unrestricted VIP access + 15-day free trial on signup.',
              '• Full access to all current and weekly upcoming educational content drops.',
              '• Ultra-HD high-resolution PDF print exports with no watermark.',
              '• Strictly one-time payment: NO recurring debits or auto-renewals.',
            ],
          },
        ],
      },
      {
        id: 'billing-support',
        title: '4. Payment, Billing & Refund Assistance',
        content: [
          'For any transaction-related assistance, failed payments, or duplicate charge inquiries:',
          '• Please email support@coloro.in with your Cashfree Order ID or Payment Reference ID.',
          '• Approved refunds for duplicate debits are processed within 24–48 hours and credit back to the original source in 5–7 business days.',
        ],
      },
    ],
  },
};
