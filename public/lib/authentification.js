document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formLogin");
  const btn = document.querySelector("button.login");
  const userType = document.getElementById("userType");
  if (!form || !btn || !userType) return;

  btn.addEventListener("click", async function () {
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    if (!email || !password) { alert("Email et mot de passe requis"); return; }

    const isEtudiant = userType.value === 'etudiant';
    const endpoint = isEtudiant ? "/api/v1/etudiant/login" : "/api/v1/enseignant/login";

    try {
      const r = await fetch(endpoint, {
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
        form.password.value = "";
        form.password.focus();
        return;
      }

      // Sauvegarder les informations de l'utilisateur
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      localStorage.setItem("userType", userType.value); // Sauvegarder le type d'utilisateur
      location.href = "/home";
    } catch (err) {
      alert("Login invalide ou utilisateur inconnu.");
      form.password.value = "";
      form.password.focus();
    }
  });
});
