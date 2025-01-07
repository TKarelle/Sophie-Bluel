document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    // Récupérer les données du formulaire
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Créer le corps de la requête
    const utilisateur = {
        email: email,
        password: password
    };

    // Envoyer les données au serveur
    fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(utilisateur)
    })
        .then(response => {
            if (response.ok) {
                return response.json(); // Convertir la réponse en JSON
            } else {
                throw new Error("Email ou mot de passe incorrect");
            }
        })
        .then(data => {
            // Si le token est présent, la connexion est réussie
            if (data.token) {
                localStorage.setItem("authToken", data.token); // Sauvegarder le token
                console.log(localStorage.getItem("authToken"));
                alert("Connexion réussie !");
                window.location.href = "index.html"; // Rediriger vers une autre page
            }
        })
        .catch(error => console.error('Erreur lors de la récupération des données :', error));
});
