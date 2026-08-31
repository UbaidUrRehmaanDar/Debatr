function renderForgotPassword() {
  return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <img src="debatr-logo.png" alt="Debatr" class="auth-logo-img" />
          <span class="auth-logo-text">Debatr</span>
        </div>

        <div id="forgot-form-view">
          <h1 class="auth-title">Reset your password</h1>
          <p class="auth-subtitle">Enter your email address and we'll send you a link to reset your password.</p>

          <div id="forgot-error" class="form-error" style="display:none;margin-bottom:16px;padding:10px 14px;background:rgba(212,24,61,0.08);border-radius:var(--radius-md);"></div>

          <form class="auth-form" id="forgot-form" onsubmit="return false;">
            <div class="form-group">
              <label class="form-label" for="forgot-email">Email</label>
              <input class="form-input" type="email" id="forgot-email" autocomplete="email" autofocus placeholder="you@example.com" />
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%;margin-top:8px;" id="forgot-submit">Send Reset Link</button>
          </form>
        </div>

        <div id="forgot-success" style="text-align:center;display:none;">
          <div style="width:64px;height:64px;margin:0 auto 20px;background:rgba(98,174,240,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;">&#x1F512;</div>
          <h2 style="font-size:20px;font-weight:var(--font-weight-medium);margin-bottom:8px;color:var(--foreground);">Check your email</h2>
          <p style="font-size:14px;color:var(--muted-foreground);margin-bottom:24px;">We sent a password reset link to <strong id="forgot-sent-email"></strong></p>
          <a href="#" style="color:var(--foreground);font-size:14px;text-decoration:none;font-weight:500;" onclick="document.getElementById('forgot-form-view').style.display='block';document.getElementById('forgot-success').style.display='none';return false;">Try another email</a>
        </div>

        <div class="auth-footer" style="margin-top:24px;">
          Remember your password? <a href="#" onclick="navigate('sign-in');return false;">Sign In</a>
        </div>
      </div>
    </div>
  `;
}
