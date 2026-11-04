/* ===== 07 · VIEW: LOGIN — light govt-portal login, photo bg, roles ===== */
function loginHTML(){
  return `<div class="login"><div class="lg-inner">
  <div class="lg-left">
    <img class="lg-emblem" src="${EMBLEM}" alt="State Emblem of India">
    <div class="lg-govt">Government of India · Government of Telangana<b>Ministry of Rural Development · Revenue Dept.</b></div>
    <div class="lg-hero">
      <h1>National Land<br>Acquisition &amp;<br>Management System</h1>
      <p>Real-Time Digital Monitoring &amp; Decision Support Platform — Telangana State Portal</p>
      <div class="lg-rule"><i style="background:#f97316"></i><i style="background:#dbe4f0"></i><i style="background:#16a34a"></i></div>
      <div class="lg-feats">
        <div class="lg-feat"><div class="fb" style="background:#16a34a">${ic('monitor',20)}</div><div><b>Real-Time Monitoring</b><span>Track land acquisition progress in real time</span></div></div>
        <div class="lg-feat"><div class="fb" style="background:#2563eb">${ic('eye2',20)}</div><div><b>Transparency &amp; Accountability</b><span>End-to-end digital process with audit trails</span></div></div>
        <div class="lg-feat"><div class="fb" style="background:#7c3aed">${ic('chart',20)}</div><div><b>Data-Driven Decisions</b><span>Analytics and insights for better decision making</span></div></div>
      </div>
    </div>
    <div class="lg-copy">© 2026 Government of Telangana. All Rights Reserved.</div>
  </div>
  <div class="lg-right">
    <div class="lg-card">
      <h2 style="font-size:22px;color:#122a4e">Welcome Back!</h2>
      <div class="sub" style="color:#64748b;margin:6px 0 22px;font-size:13.5px">Please sign in to continue</div>
      <div class="fld"><label>Email / Username</label><div class="inp"><input id="lg-user" value="sailaja.r@revenue.telangana.gov.in"></div></div>
      <div class="fld"><label>Password</label><div class="inp"><input id="lg-pass" type="password" value="demo@2026"></div></div>
      <div class="fld"><label>Select Role</label><div class="inp"><select id="lg-role">
        <option>State Authority (Telangana)</option><option>Central Authority</option>
        <option>District Authority</option><option>Field Officer</option></select></div></div>
      <button class="btn btn-primary btn-block" data-act="login" style="margin-top:8px">LOGIN</button>
      <div class="lg-or">or</div>
      <button class="btn btn-outline btn-block" data-act="demo">${ic('user',16)} DEMO ACCESS</button>
      <div class="lg-secure">${ic('lock',22)}<div><b>Secure Access</b><span>Your data is protected with advanced encryption</span></div></div>
    </div>
  </div>
</div></div>`;
}

