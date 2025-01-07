// Récupérer les projets
let allProjects = [];
let allCategories = [];


// Fonction pour afficher les projets dans la gallerie 
function afficherProject(data) {
    const galleryContainer = document.getElementById("gallery");
    galleryContainer.innerHTML = ""; // Réinitialiser le conteneur

    data.forEach((project) => {
        const projectElement = document.createElement('figure');
        projectElement.innerHTML = `
            <img src="${project.imageUrl}" alt="${project.title}">
            <figcaption>${project.title}</figcaption>
        `;
        galleryContainer.appendChild(projectElement);
    });
}

// Récupérer les projets depuis l'API
function fetchProjects() {
    fetch('http://localhost:5678/api/works')
        .then(response => response.json())
        .then(projects => {
            allProjects = projects;
            afficherProject(allProjects);
            galleryModal(allProjects);
        })
        .catch(error => console.error('Erreur lors de la récupération des projets :', error));
}
// Récupérer les catégories depuis l'API
function fetchCategories() {
    fetch('http://localhost:5678/api/categories')
        .then(response => response.json())
        .then(categories => {
            allCategories = categories;
            setupFilters();
        })
        .catch(error => console.error('Erreur lors de la récupération des catégories :', error));
}
// Configuration des filtres
function setupFilters() {
    const filterContainer = document.querySelector(".filter_container");
    const categorySelect = document.getElementById("modal_picture-category");
    const categoriesArray = [{ id: "Tous", name: "Tous" }, ...allCategories];

    filterContainer.innerHTML = ""; // Réinitialiser le conteneur des filtres
    categoriesArray.forEach(category => {
        const filterItem = document.createElement('p');
        filterItem.textContent = category.name;
        filterContainer.appendChild(filterItem);

        filterItem.addEventListener('click', () => {
            const filteredProjects = filterByCategory(category.id);
            afficherProject(filteredProjects);
        });
    });

    allCategories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// Fonction de filtrage par catégorie
function filterByCategory(categoryId) {
    if (categoryId === "Tous") {
        return allProjects; // Retourne tous les projets
    }
    return allProjects.filter(project => project.categoryId === categoryId); // Filtre par catégorie
}

// Vérifier si l'utilisateur est connecté
function isLoggedIn() {
    return !!localStorage.getItem("authToken");
}


// Fonction pour mettre à jour l'interface utilisateur
function updatePortfolio() {
    const logIn = document.getElementById("login");
    const modifyPortfolio = document.getElementById("portfolio_modify");
    if (isLoggedIn()) {
        modifyPortfolio.style.display = "block"; // Affiche la section protégée
        logIn.textContent = "Logout"; // Change le texte en "Logout"
    } else {
        modifyPortfolio.style.display = "none"; // Cache la section protégée
        logIn.textContent = "Login"; // Change le texte en "Login"
    }
}

// Fonction de déconnexion
function logout() {
    localStorage.removeItem("authToken"); // Supprime le token
    updatePortfolio(); // Met à jour l'interface
}

// === Événements ===

document.addEventListener("DOMContentLoaded", () => {
    fetchProjects();
    fetchCategories();
    updatePortfolio();
});

document.getElementById("login").addEventListener("click", () => {
    isLoggedIn() ? logout() : window.location.href = "login.html";
});



//Fonction afficher les images dans le modal 
function galleryModal(data) {
    const galleryModalContainer = document.getElementById("modal_gallery");
    galleryModalContainer.innerHTML = "";

    data.forEach((project) => {
        const imageElement = document.createElement("div"); // Crée un élément image
        imageElement.innerHTML = `
            <img src="${project.imageUrl}" alt="${project.title}">
            <button type="button" class="delete-btn" data-id="${project.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        // Ajouter l'image au conteneur de la galerie
        galleryModalContainer.appendChild(imageElement);
    });
    // Ajouter des gestionnaires d'événements pour chaque bouton de suppression
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const projectId = button.getAttribute("data-id"); // Récupérer l'ID de la photo
            deleteProject(projectId); // Appeler la fonction de suppression
        });
    });
}

//Fonction pour supprimé des projets
function deleteProject(projectId) {
    const token = localStorage.getItem("authToken"); // Récupérer le token

    if (!token) {
        alert("Vous devez être connecté pour effectuer cette action.");
        return;
    }

    fetch(`http://localhost:5678/api/works/${projectId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`, // Envoyer le token dans l'en-tête
        },
    })
        .then((response) => {
            if (response.status === 401) {
                alert("Votre session a expiré. Veuillez vous reconnecter.");
                logout();
            }
            if (!response.ok) {
                throw new Error("Erreur lors de la suppression de la photo");
            }
            
            // Mettre à jour la galerie après suppression
            return fetch('http://localhost:5678/api/works'); // Récupérer à nouveau les projets
        })
        .then((response) => response.json())
        .then((updatedProjects) => {
            allProjects = updatedProjects; // Mettre à jour les données locales
            galleryModal(allProjects); // Réactualiser la galerie modale
        })
        .catch((error) => console.error("Erreur :", error));
}


document.querySelector('form').addEventListener('submit', (event) => {
    // Empêcher le rechargement par défaut de la page
    event.preventDefault();
    const title = document.getElementById('modal_picture-title').value.trim();
    const category = document.getElementById('modal_picture-category').value;
    const file = document.getElementById('image_input').files[0];
    
    if (!title || !category || !file) {
    
        alert("Tous les champs sont obligatoires.");
        return; // On arrête ici si les champs sont vides
    }

    if (file.size > 4 * 1024 * 1024) {
        alert("Le fichier dépasse la taille limite de 4 Mo.");
        return;
    }

    event.preventDefault();
    const formData = new FormData(event.target);//Crée un objet FormData à partir du formulaire (cela permet de préparer les données pour l'envoi avec fetch).

    fetch('http://localhost:5678/api/works', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
    })
    .then(response => {
        if (!response.ok) throw new Error('Erreur lors de l\'ajout de la photo');
        return response.json();
    })
    .then(newProject => {
        allProjects.push(newProject);
        afficherProject(allProjects); // Mise à jour de la galerie principale
    })
    .catch(error => console.error('Erreur:', error));
    
});

//Ajout d'un aperçu de  l'image 
document.getElementById("image_input").addEventListener("change", (event) => { //event = (l'élément sur lequel l'événement a été déclenché).
    const file = event.target.files[0]; // Récupère le fichier sélectionné; target = fait référence à l'élément qui a déclenché l'événement, file FileList, ce qui est un tableau-like d'objets File. Chaque objet File représente un fichier sélectionné.
    const previewContainer = document.getElementById("image_preview");
    previewContainer.innerHTML = ""; // Efface l'ancien aperçu

    if (file) {
        const reader = new FileReader();//fichier sélectionné en tant qu'URL de données (base64).
        reader.onload = function (e) {//onload : Cet événement est déclenché lorsque la lecture du fichier est terminée avec succès.
            const img = document.createElement("img");//la variable e représente l'événement qui est déclenché lorsque la lecture du fichier est terminée avec succès.
            img.src = e.target.result;//Lorsque l'événement load est déclenché, result contient le résultat de la lecture du fichier. Cela peut être un base64 pour une image
            img.classList.add("preview_img");
            previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    } else {
        previewContainer.textContent = "Aucun fichier sélectionné";
    }
});

document.getElementById('showModal').addEventListener("click", () =>{
    const showModal = document.getElementById("modal");
    showModal.classList.toggle("modal_none");//Visible
});

document.getElementById('close-btn').addEventListener("click", () => {
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modal_content");
    const modalAddPicture = document.getElementById("modal_add-picture");
    modal.classList.toggle("modal_none");//Masqué le modal   
    modalAddPicture.classList.remove("modal_add-picture");
    modalAddPicture.classList.add("modal_add-picture-none");
    modalContent.classList.add("modal_content");
    modalContent.classList.remove("modal_content-none");
    const previewContainer = document.getElementById("image_preview");
    previewContainer.innerHTML = ""; // Efface l'ancien aperçu

});

document.getElementById('add-btn').addEventListener("click", () =>{
    const modalContent = document.getElementById("modal_content");
    const modalAddPicture = document.getElementById("modal_add-picture");

    modalContent.classList.remove("modal_content");
    modalContent.classList.add("modal_content-none");
    console.log("Switch modal add picture");
    modalAddPicture.classList.remove("modal_add-picture-none");
    modalAddPicture.classList.add("modal_add-picture");
    console.log("Switch modal content");
});

document.getElementById('return-btn').addEventListener("click", ()=> {
    const modalContent = document.getElementById("modal_content");
    const modalAddPicture = document.getElementById("modal_add-picture");
    
    modalContent.classList.remove("modal_content-none");
    modalContent.classList.add("modal_content");
    console.log("Switch modal add picture");
    modalAddPicture.classList.remove("modal_add-picture");
    modalAddPicture.classList.add("modal_add-picture-none");
    console.log("Switch modal content");

});



