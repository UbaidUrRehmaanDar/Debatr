function renderResetPassword() {
  return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <img src="debatr-logo.png" alt="Debatr" class="auth-logo-img" />
          <span class="auth-logo-text">Debatr</span>
        </div>

        <div id="reset-form-view">
          <h1 class="auth-title">Create new password</h1>
          <p class="auth-subtitle">Choose a strong password for your account.</p>

          <div id="reset-error" class="form-error" style="display:none;margin-bottom:16px;padding:10px 14px;background:rgba(212,24,61,0.08);border-radius:var(--radius-md);"></div>

          <form class="auth-form" id="reset-form" onsubmit="return false;">
            <div class="form-group">
              <label class="form-label" for="reset-new-pw">New Password</label>
              <div style="position:relative;">
                <input class="form-input" type="password" id="reset-new-pw" autocomplete="new-password" placeholder="Enter new password" style="padding-right:40px;" />
                <button type="button" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted-foreground);cursor:pointer;padding:4px;font-size:16px;" onclick="var i=document.getElementById('reset-new-pw');i.type=i.type==='password'?'text':'password';this.textContent=i.type==='password'?'&#x1F441;':'&#x1F512;'" aria-label="Toggle password">&#x1F441;</button>
              </div>
              <div id="length-hint" style="font-size:12px;color:var(--muted-foreground);margin-top:6px;">Minimum 8 characters</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reset-confirm-pw">Confirm Password</label>
              <div style="position:relative;">
                <input class="form-input" type="password" id="reset-confirm-pw" autocomplete="new-password" placeholder="Confirm password" style="padding-right:40px;" />
                <button type="button" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted-foreground);cursor:pointer;padding:4px;font-size:16px;" onclick="var i=document.getElementById('reset-confirm-pw');i.type=i.type==='password'?'text':'password';this.textContent=i.type==='password'?'&#x1F441;':'&#x1F512;'" aria-label="Toggle password">&#x1F441;</button>
              </div>
              <div id="match-hint" style="font-size:12px;color:var(--muted-foreground);margin-top:6px;"></div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="width:100%;margin-top:8px;" id="reset-submit">Reset Password</button>
          </form>
        </div>

        <div id="reset-success" style="text-align:center;display:none;">
          <div style="width:64px;height:64px;margin:0 auto 20px;background:rgba(26,174,57,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;">&#x1F6E1;&#xFE0F;</div>
          <h2 style="font-size:20px;font-weight:var(--font-weight-medium);margin-bottom:8px;color:var(--foreground);">Password updated</h2>
          <p style="font-size:14px;color:var(--muted-foreground);margin-bottom:24px;">Your password has been reset successfully.</p>
          <button class="btn btn-primary btn-lg" onclick="navigate('sign-in')">Sign In</button>
        </div>
      </div>
    </div>
  `;
}
