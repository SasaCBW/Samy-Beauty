```javascript
/* =========================================================
   SAMIRA BEAUTY
   JAVASCRIPT PRINCIPAL
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MENU MOBILE
    ===================================================== */

    const menuButton = document.getElementById("menuButton");
    const mobileMenu = document.getElementById("mobileMenu");
    const closeMenu = document.getElementById("closeMenu");

    if (menuButton && mobileMenu) {

        menuButton.addEventListener("click", () => {
            mobileMenu.classList.add("active");

            document.body.style.overflow = "hidden";
        });

    }

    if (closeMenu && mobileMenu) {

        closeMenu.addEventListener("click", () => {
            mobileMenu.classList.remove("active");

            document.body.style.overflow = "";
        });

    }


    /* =====================================================
       FECHAR MENU AO CLICAR EM UM LINK
    ===================================================== */

    const mobileLinks = document.querySelectorAll(".mobile-menu a");

    mobileLinks.forEach(link => {

        link.addEventListener("click", () => {

            mobileMenu.classList.remove("active");

            document.body.style.overflow = "";

        });

    });


    /* =====================================================
       FECHAR MENU COM ESC
    ===================================================== */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            if (mobileMenu) {
                mobileMenu.classList.remove("active");
            }

            document.body.style.overflow = "";

        }

    });


    /* =====================================================
       ANIMAÇÃO DOS ELEMENTOS AO ENTRAREM NA TELA
    ===================================================== */

    const animatedElements = document.querySelectorAll(
        ".service-card, .gallery-item, .about-content, .about-image"
    );

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.12
        }
    );


    animatedElements.forEach(element => {

        element.classList.add("scroll-animation");

        observer.observe(element);

    });


    /* =====================================================
       ANO AUTOMÁTICO NO FOOTER
    ===================================================== */

    const footerBottom = document.querySelector(".footer-bottom");

    if (footerBottom) {

        const year = new Date().getFullYear();

        footerBottom.innerHTML = footerBottom.innerHTML.replace(
            "2026",
            year
        );

    }


    /* =====================================================
       HEADER AO ROLAR A PÁGINA
    ===================================================== */

    const header = document.querySelector(".header");

    if (header) {

        window.addEventListener("scroll", () => {

            if (window.scrollY > 80) {

                header.classList.add("scrolled");

            } else {

                header.classList.remove("scrolled");

            }

        });

    }


    /* =====================================================
       LINKS INTERNOS COM SCROLL SUAVE
    ===================================================== */

    const internalLinks = document.querySelectorAll(
        'a[href^="#"]'
    );

    internalLinks.forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                const headerHeight = header
                    ? header.offsetHeight
                    : 0;

                const targetPosition =
                    target.getBoundingClientRect().top +
                    window.scrollY -
                    headerHeight -
                    20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });

            }

        });

    });


    /* =====================================================
       EFEITO DE BRILHO NO MOUSE
    ===================================================== */

    const cards = document.querySelectorAll(
        ".service-card, .gallery-item"
    );

    cards.forEach(card => {

        card.addEventListener("mousemove", event => {

            const rect = card.getBoundingClientRect();

            const x =
                ((event.clientX - rect.left) / rect.width) * 100;

            const y =
                ((event.clientY - rect.top) / rect.height) * 100;

            card.style.setProperty("--mouse-x", `${x}%`);
            card.style.setProperty("--mouse-y", `${y}%`);

        });

    });

});
```
