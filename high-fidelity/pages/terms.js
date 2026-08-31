function renderTerms() {
  const sections = [
    { title: '1. Acceptance of Terms', content: 'By accessing or using Debatr, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.' },
    { title: '2. Eligibility', content: 'You must be at least 16 years old to use Debatr. By using the platform, you represent that you meet this age requirement.' },
    { title: '3. Account Registration', content: 'You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials.' },
    { title: '4. Acceptable Use', content: 'You agree not to misuse the platform, including but not limited to: harassment, hate speech, spam, impersonation, attempts to compromise system security, or using AI features to generate harmful content.' },
    { title: '5. Content & Intellectual Property', content: 'You retain ownership of content you create on Debatr. By posting content, you grant us a limited license to display and process it within the platform. You must not post content that infringes on third-party rights.' },
    { title: '6. Privacy', content: 'Your use of Debatr is also governed by our Privacy Policy. By using the platform, you consent to the collection and use of data as described therein.' },
    { title: '7. Termination', content: 'We may suspend or terminate your account at our discretion for violations of these terms. You may also delete your account at any time through your settings.' },
    { title: '8. Disclaimers', content: 'Debatr is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation. AI-generated content should not be relied upon as professional legal, medical, or financial advice.' },
    { title: '9. Limitation of Liability', content: 'To the maximum extent permitted by law, Debatr shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.' },
    { title: '10. Indemnification', content: 'You agree to indemnify and hold harmless Debatr and its affiliates from any claims, losses, or damages resulting from your use of the platform or violation of these terms.' },
    { title: '11. Governing Law', content: 'These terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles.' },
    { title: '12. Dispute Resolution', content: 'Any disputes arising from these terms shall be resolved through binding arbitration under the rules of the American Arbitration Association, unless you opt out within 30 days of account creation.' },
    { title: '13. Changes to These Terms', content: 'We may revise these terms from time to time. Continued use after changes constitutes acceptance. We will notify you of material changes via email or in-app notice.' },
    { title: '14. Contact', content: 'For questions about these terms, contact us at legal@debatr.app.' },
    { title: '15. Entire Agreement', content: 'These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and Debatr regarding use of the platform.' },
  ];

  return `
    <div class="page-content-narrow">
      <div class="page-header" style="text-align:center;">
        <div style="width:64px;height:64px;margin:0 auto 20px;background:var(--notion-accent-sky);border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center;color:#fff;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <h1>Terms of Service</h1>
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
