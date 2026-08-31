function renderVerifyEmail() {
  return `
    <div class="auth-page">
      <div class="auth-card" style="text-align:center;">
        <div class="auth-logo">
          <img src="debatr-logo.png" alt="Debatr" class="auth-logo-img" />
          <span class="auth-logo-text">Debatr</span>
        </div>

        <div id="state-verifying" style="display:none;">
          <div style="width:80px;height:80px;margin:0 auto 24px;border-radius:50%;border:3px solid var(--notion-accent-sky);border-top-color:transparent;display:flex;align-items:center;justify-content:center;animation:spin 0.8s linear infinite;"></div>
          <h1 class="auth-title">Verifying your email...</h1>
          <p class="auth-subtitle">Please wait while we verify your email address.</p>
        </div>

        <div id="state-verified" style="display:none;">
          <div style="width:80px;height:80px;margin:0 auto 24px;border-radius:50%;background:rgba(26,174,57,0.1);display:flex;align-items:center;justify-content:center;font-size:40px;color:var(--notion-accent-green);">&#x2713;</div>
          <h1 class="auth-title">Email verified!</h1>
          <p class="auth-subtitle">Your email has been verified successfully.</p>
          <button class="btn btn-primary btn-lg" onclick="navigate('debates')">Go to debates</button>
        </div>

        <div id="state-failed" style="display:none;">
          <div style="width:80px;height:80px;margin:0 auto 24px;border-radius:50%;background:rgba(212,24,61,0.1);display:flex;align-items:center;justify-content:center;font-size:40px;color:var(--destructive);">&#x2715;</div>
          <h1 class="auth-title">Verification failed</h1>
          <p class="auth-subtitle">The verification link is invalid or has expired.</p>
          <button class="btn btn-primary btn-lg" onclick="navigate('sign-up')">Create a new account</button>
        </div>

        <div id="state-waiting">
          <div style="width:80px;height:80px;margin:0 auto 24px;border-radius:50%;background:rgba(98,174,240,0.1);display:flex;align-items:center;justify-content:center;font-size:40px;">&#x2709;&#xFE0F;</div>
          <h1 class="auth-title">Verify your email</h1>
          <p class="auth-subtitle">We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.</p>
          <button class="btn btn-primary btn-lg" id="resend-btn" onclick="this.disabled=true;this.innerHTML='<span class=\\'spinner\\'></span> Sending...';setTimeout(function(){this.disabled=false;this.textContent='Resend verification email';}.bind(this),1500);">Resend verification email</button>
          <div style="margin-top:12px;">
            <a href="#" style="color:var(--foreground);font-size:14px;text-decoration:none;font-weight:500;" onclick="navigate('sign-up');return false;">Create a new account</a>
          </div>
        </div>

        <div class="auth-footer" style="margin-top:24px;">
          <a href="#" onclick="navigate('sign-in');return false;">Back to Sign In</a>
        </div>
      </div>
    </div>
  `;
}
