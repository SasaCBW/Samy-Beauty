```javascript
/* =========================================================
   GALERIA — SAMIRA BEAUTY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       FILTROS
    ===================================================== */

    const filterButtons =
        document.querySelectorAll(".filter-button");

    const galleryPhotos =
        document.querySelectorAll(".gallery-photo");


    filterButtons.forEach(button => {

        button.addEventListener("click", () => {


            /* remover ativo */

            filterButtons.forEach(item => {

                item.classList.remove("active");

            });


            /* ativar botão */

            button.classList.add("active");


            /* categoria */

            const filter =
                button.dataset.filter;


            /* mostrar/esconder */

            galleryPhotos.forEach(photo => {

                const category =
                    photo.dataset.category;


                if (
                    filter === "all" ||
                    category === filter
                ) {

                    photo.classList.remove("hidden");

                } else {

                    photo.classList.add("hidden");

                }

            });

        });

    });



    /* =====================================================
       MODAL
    ===================================================== */

    const modal =
        document.getElementById("photoModal");

    const modalClose =
        document.getElementById("modalClose");

    const modalPlaceholder =
        document.getElementById("modalPlaceholder");

    const viewButtons =
        document.querySelectorAll(".view-photo");


    viewButtons.forEach(button => {

        button.addEventListener("click", event => {

            event.stopPropagation();


            const photo =
                button.closest(".gallery-photo");


            if (!photo || !modal) {
                return;
            }


            const title =
                photo.querySelector(
                    ".photo-placeholder span"
                );


            if (modalPlaceholder && title) {

                modalPlaceholder.innerHTML = `

                    <i class="fa-solid fa-image"></i>

                    <span>
                        ${title.textContent}
                    </span>

                `;

            }


            modal.classList.add("active");

            document.body.style.overflow = "hidden";

        });

    });



    /* =====================================================
       FECHAR MODAL
    ===================================================== */

    function closeModal() {

        if (!modal) {
            return;
        }

        modal.classList.remove("active");

        document.body.style.overflow = "";

    }


    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeModal
        );

    }


    if (modal) {

        modal.addEventListener("click", event => {

            if (
                event.target === modal
            ) {

                closeModal();

            }

        });

    }


    /* =====================================================
       ESC
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeModal();

            }

        }
    );


});
```
