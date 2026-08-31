function renderSignUp() {
  return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <img src="debatr-logo.png" alt="Debatr" class="auth-logo-img" />
          <span class="auth-logo-text">Debatr</span>
        </div>

        <h1 class="auth-title">Create your account</h1>
        <p class="auth-subtitle">Start debating with AI in a calm, focused workspace.</p>

        <div id="signup-error" class="form-error" style="display:none;margin-bottom:16px;padding:10px 14px;background:rgba(212,24,61,0.08);border-radius:var(--radius-md);"></div>

        <form class="auth-form" id="signup-form" onsubmit="return false;">
          <div class="form-group">
            <label class="form-label" for="signup-name">Full Name</label>
            <input class="form-input" type="text" id="signup-name" autocomplete="name" placeholder="Jane Doe" />
          </div>

          <div class="form-group">
            <label class="form-label" for="signup-email">Email</label>
            <input class="form-input" type="email" id="signup-email" autocomplete="email" placeholder="you@example.com" />
          </div>

          <div class="form-group">
            <label class="form-label" for="signup-password">Password</label>
            <div style="position:relative;">
              <input class="form-input" type="password" id="signup-password" autocomplete="new-password" placeholder="Create a strong password" style="padding-right:40px;" />
              <button type="button" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted-foreground);cursor:pointer;padding:4px;font-size:16px;" onclick="var i=document.getElementById('signup-password');i.type=i.type==='password'?'text':'password';this.textContent=i.type==='password'?'&#x1F441;':'&#x1F512;'" aria-label="Toggle password">&#x1F441;</button>
            </div>
            <div style="display:flex;gap:4px;margin-top:8px;">
              <div id="bar-1" style="flex:1;height:4px;border-radius:2px;background:var(--border);transition:background 0.2s;"></div>
              <div id="bar-2" style="flex:1;height:4px;border-radius:2px;background:var(--border);transition:background 0.2s;"></div>
              <div id="bar-3" style="flex:1;height:4px;border-radius:2px;background:var(--border);transition:background 0.2s;"></div>
              <div id="bar-4" style="flex:1;height:4px;border-radius:2px;background:var(--border);transition:background 0.2s;"></div>
            </div>
            <div id="strength-label" style="font-size:12px;margin-top:4px;color:var(--muted-foreground);"></div>
            <ul style="list-style:none;margin-top:8px;">
              <li id="rule-length" style="font-size:12px;color:var(--muted-foreground);display:flex;align-items:center;gap:6px;margin-bottom:2px;"><span class="icon">&#x25CB;</span> At least 8 characters</li>
              <li id="rule-upper" style="font-size:12px;color:var(--muted-foreground);display:flex;align-items:center;gap:6px;margin-bottom:2px;"><span class="icon">&#x25CB;</span> One uppercase letter</li>
              <li id="rule-lower" style="font-size:12px;color:var(--muted-foreground);display:flex;align-items:center;gap:6px;margin-bottom:2px;"><span class="icon">&#x25CB;</span> One lowercase letter</li>
              <li id="rule-number" style="font-size:12px;color:var(--muted-foreground);display:flex;align-items:center;gap:6px;margin-bottom:2px;"><span class="icon">&#x25CB;</span> One number</li>
            </ul>
          </div>

          <div class="form-group">
            <label class="form-label" for="signup-invite">Invite Code</label>
            <input class="form-input" type="text" id="signup-invite" placeholder="XXXX-XXXX" style="font-family:'SF Mono','Fira Code',monospace;letter-spacing:2px;text-transform:uppercase;" />
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;margin-top:8px;" id="signup-submit">Create Account</button>
        </form>

        <div class="auth-divider"><span>or</span></div>

        <div class="auth-footer">
          Already have an account? <a href="#" onclick="navigate('sign-in');return false;">Sign In</a>
        </div>
      </div>
    </div>
  `;
}
