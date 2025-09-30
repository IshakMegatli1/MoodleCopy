document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formLogin");
  const btn = document.querySelector("button.login");
  if (!form || !btn) return;

  btn.addEventListener("click", async function () {
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    if (!email || !password) { alert("Email et mot de passe requis"); return; }

    try {
      const r = await fetch("/api/v1/enseignant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      let data = {};
      let isJson = true;
      try {
        data = await r.json();
      } catch (e) {
        isJson = false;
      }
      if (!r.ok) {
        let msg = (isJson && data && data.message) ? data.message : "Login invalide ou utilisateur inconnu.";
        alert(msg);
        form.email.value = "";
        form.password.value = "";
        form.email.focus();
        return;
      }

      localStorage.setItem("token", data.token);
      location.href = "/";
    } catch (err) {
      alert("Login invalide ou utilisateur inconnu.");
      form.email.value = "";
      form.password.value = "";
      form.email.focus();
    }
  });
});
