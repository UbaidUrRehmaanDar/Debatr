function renderSignIn() {
  return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <img src="debatr-logo.png" alt="Debatr" class="auth-logo-img" />
          <span class="auth-logo-text">Debatr</span>
        </div>

        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to continue your debates.</p>

        <div id="signin-error" class="form-error" style="display:none;margin-bottom:16px;padding:10px 14px;background:rgba(212,24,61,0.08);border-radius:var(--radius-md);"></div>

        <form class="auth-form" id="signin-form" onsubmit="return false;">
          <div class="form-group">
            <label class="form-label" for="signin-email">Email</label>
            <input class="form-input" type="email" id="signin-email" autocomplete="email" autofocus placeholder="you@example.com" />
          </div>

          <div class="form-group">
            <label class="form-label" for="signin-password">Password</label>
            <div style="position:relative;">
              <input class="form-input" type="password" id="signin-password" autocomplete="current-password" placeholder="Enter your password" style="padding-right:40px;" />
              <button type="button" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted-foreground);cursor:pointer;padding:4px;font-size:16px;" onclick="var i=document.getElementById('signin-password');i.type=i.type==='password'?'text':'password';this.textContent=i.type==='password'?'&#x1F441;':'&#x1F512;'" aria-label="Toggle password">&#x1F441;</button>
            </div>
            <div style="text-align:right;margin-top:8px;">
              <a href="#" style="font-size:13px;color:var(--foreground);font-weight:500;text-decoration:none;" onclick="navigate('forgot-password');return false;">Forgot password?</a>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;margin-top:8px;" id="signin-submit">Sign In</button>
        </form>

        <div class="auth-divider"><span>or</span></div>

        <div class="auth-footer">
          Don't have an account? <a href="#" onclick="navigate('sign-up');return false;">Sign Up</a>
        </div>
      </div>
    </div>
  `;
}
