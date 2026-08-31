function renderPrivacy() {
  const sections = [
    { title: '1. Introduction', content: 'Debatr ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.' },
    { title: '2. Information We Collect', content: 'We collect information you provide directly, including account details (name, email), debate content, messages, and feedback. We also collect usage data such as pages visited, features used, and device information.' },
    { title: '3. How We Use Your Information', content: 'Your information is used to provide and improve our services, personalize your experience, communicate with you, ensure platform security, and generate anonymized analytics.' },
    { title: '4. Sharing Your Information', content: 'We do not sell your personal information. We may share data with service providers who assist in operating the platform, comply with legal obligations, or protect the rights and safety of Debatr and its users.' },
    { title: '5. AI Services', content: 'Debate content may be processed by AI services to provide coaching and fact-checking. Content is processed in real-time and is not used to train AI models. Your debate transcripts remain private.' },
    { title: '6. Data Security', content: 'We implement industry-standard encryption, access controls, and regular security audits. While no method of transmission is 100% secure, we take reasonable measures to protect your data.' },
    { title: '7. Data Retention', content: 'We retain your account information for as long as your account is active. Debate data is retained according to your account settings. You may request deletion at any time.' },
    { title: '8. Your Rights', content: 'You have the right to access, correct, export, or delete your personal data. Contact us at privacy@debatr.app to exercise these rights.' },
    { title: '9. Children\'s Privacy', content: 'Debatr is not intended for users under 16. We do not knowingly collect data from children. If we learn that we have collected data from a child, we will delete it promptly.' },
    { title: '10. Changes to This Policy', content: 'We may update this policy from time to time. We will notify you of significant changes via email or in-app notification. Continued use constitutes acceptance of the updated policy.' },
    { title: '11. Contact Us', content: 'For privacy-related inquiries, contact us at privacy@debatr.app.' },
  ];

  return `
    <div class="page-content-narrow">
      <div class="page-header" style="text-align:center;">
        <div style="width:64px;height:64px;margin:0 auto 20px;background:var(--notion-accent-green);border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center;color:#fff;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h1>Privacy Policy</h1>
        <p>Effective: July 31, 2026</p>
      </div>

      <div class="card">
        ${sections.map(s => `
          <div style="margin-bottom:24px;">
            <h2 style="font-size:15px;font-weight:500;color:var(--foreground);margin-bottom:8px;">${s.title}</h2>
            <p style="font-size:13.5px;color:var(--muted-foreground);line-height:1.7;">${s.content}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
