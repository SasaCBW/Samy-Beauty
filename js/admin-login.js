/* =========================================================
   SAMIRA BEAUTY — LOGIN ADMINISTRATIVO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("adminLoginForm");
    const emailInput = document.getElementById("adminEmail");
    const passwordInput = document.getElementById("adminPassword");

    const passwordToggle = document.getElementById("passwordToggle");
    const rememberCheckbox = document.getElementById("rememberAdmin");

    const errorMessage = document.getElementById("adminLoginError");
    const errorText = document.getElementById("adminLoginErrorText");

    const loginButton = document.getElementById("adminLoginButton");
    const buttonText = document.getElementById("loginButtonText");
    const loadingContent = document.getElementById("loginLoading");

    const forgotPassword = document.getElementById("forgotPassword");

    /* =====================================================
       FIREBASE
       ===================================================== */

    let auth = null;

    if (
        window.samiraFirebase &&
        window.samiraFirebase.auth
    ) {
        auth = window.samiraFirebase.auth;
    }

    /* =====================================================
       VERIFICAÇÃO DE ELEMENTOS
       ===================================================== */

    if (!form) {
        console.error("Formulário administrativo não encontrado.");
        return;
    }

    /* =====================================================
       MOSTRAR / OCULTAR SENHA
       ===================================================== */

    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener("click", () => {
            const isPassword =
                passwordInput.getAttribute("type") === "password";

            passwordInput.setAttribute(
                "type",
                isPassword ? "text" : "password"
            );

            const icon = passwordToggle.querySelector("i");

            if (icon) {
                icon.classList.toggle("fa-eye", !isPassword);
                icon.classList.toggle("fa-eye-slash", isPassword);
            }

            passwordToggle.setAttribute(
                "aria-label",
                isPassword ? "Ocultar senha" : "Mostrar senha"
            );
        });
    }

    /* =====================================================
       MENSAGENS DE ERRO
       ===================================================== */

    function showError(message) {
        if (!errorMessage) return;

        if (errorText) {
            errorText.textContent = message;
        }

        errorMessage.hidden = false;
        errorMessage.setAttribute("role", "alert");
    }

    function hideError() {
        if (!errorMessage) return;

        errorMessage.hidden = true;
    }

    /* =====================================================
       LOADING
       ===================================================== */

    function setLoading(isLoading) {
        if (!loginButton) return;

        loginButton.disabled = isLoading;

        if (buttonText) {
            buttonText.hidden = isLoading;
        }

        if (loadingContent) {
            loadingContent.hidden = !isLoading;
        }
    }

    /* =====================================================
       VALIDAR EMAIL
       ===================================================== */

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /* =====================================================
       ERROS DO FIREBASE
       ===================================================== */

    function firebaseErrorMessage(error) {
        if (!error || !error.code) {
            return "Não foi possível entrar. Tente novamente.";
        }

        switch (error.code) {
            case "auth/invalid-email":
                return "Digite um endereço de e-mail válido.";

            case "auth/user-not-found":
                return "E-mail ou senha incorretos.";

            case "auth/wrong-password":
                return "E-mail ou senha incorretos.";

            case "auth/invalid-credential":
                return "E-mail ou senha incorretos.";

            case "auth/user-disabled":
                return "Esta conta administrativa foi desativada.";

            case "auth/too-many-requests":
                return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";

            case "auth/network-request-failed":
                return "Verifique sua conexão com a internet.";

            case "auth/operation-not-allowed":
                return "O login por e-mail ainda não está habilitado no Firebase.";

            default:
                console.error("Erro Firebase:", error);
                return "Não foi possível realizar o login. Tente novamente.";
        }
    }

    /* =====================================================
       REDIRECIONAMENTO
       ===================================================== */

    function goToAdmin() {
        window.location.href = "admin.html";
    }

    /* =====================================================
       LOGIN
       ===================================================== */

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        hideError();

        const email = emailInput
            ? emailInput.value.trim()
            : "";

        const password = passwordInput
            ? passwordInput.value
            : "";

        /* -----------------------------------------------
           VALIDAÇÕES
           ----------------------------------------------- */

        if (!email) {
            showError("Digite o e-mail administrativo.");
            emailInput?.focus();
            return;
        }

        if (!isValidEmail(email)) {
            showError("Digite um endereço de e-mail válido.");
            emailInput?.focus();
            return;
        }

        if (!password) {
            showError("Digite sua senha.");
            passwordInput?.focus();
            return;
        }

        if (password.length < 6) {
            showError("A senha deve possuir pelo menos 6 caracteres.");
            passwordInput?.focus();
            return;
        }

        /* -----------------------------------------------
           VERIFICA FIREBASE
           ----------------------------------------------- */

        if (!auth) {
            showError(
                "O Firebase ainda não está configurado. Confira o arquivo js/firebase.js."
            );
            return;
        }

        setLoading(true);

        try {
            /* -------------------------------------------
               LOGIN FIREBASE
               ------------------------------------------- */

            await auth.signInWithEmailAndPassword(
                email,
                password
            );

            /* -------------------------------------------
               SALVAR PREFERÊNCIA
               ------------------------------------------- */

            if (rememberCheckbox?.checked) {
                localStorage.setItem(
                    "samiraAdminRemember",
                    "true"
                );
            } else {
                localStorage.removeItem(
                    "samiraAdminRemember"
                );
            }

            localStorage.setItem(
                "samiraAdminEmail",
                email
            );

            /* -------------------------------------------
               REDIRECIONAR
               ------------------------------------------- */

            goToAdmin();

        } catch (error) {
            setLoading(false);
            showError(firebaseErrorMessage(error));

            if (passwordInput) {
                passwordInput.value = "";
                passwordInput.focus();
            }
        }
    });

    /* =====================================================
       RECUPERAÇÃO DE SENHA
       ===================================================== */

    if (forgotPassword) {
        forgotPassword.addEventListener("click", async () => {
            hideError();

            const email = emailInput
                ? emailInput.value.trim()
                : "";

            if (!email) {
                showError(
                    "Digite seu e-mail para receber o link de recuperação."
                );
                emailInput?.focus();
                return;
            }

            if (!isValidEmail(email)) {
                showError(
                    "Digite um endereço de e-mail válido."
                );
                emailInput?.focus();
                return;
            }

            if (!auth) {
                showError(
                    "O Firebase ainda não está configurado."
                );
                return;
            }

            forgotPassword.disabled = true;

            try {
                await auth.sendPasswordResetEmail(email);

                showError(
                    "Enviamos um link de recuperação para seu e-mail. Verifique também a caixa de spam."
                );

                if (errorMessage) {
                    errorMessage.style.background =
                        "rgba(201, 71, 136, 0.08)";

                    errorMessage.style.borderColor =
                        "rgba(201, 71, 136, 0.18)";

                    errorMessage.style.color =
                        "#8f245f";
                }

            } catch (error) {
                showError(firebaseErrorMessage(error));
            } finally {
                forgotPassword.disabled = false;
            }
        });
    }

    /* =====================================================
       RECUPERAR E-MAIL SALVO
       ===================================================== */

    const savedEmail =
        localStorage.getItem("samiraAdminEmail");

    const shouldRemember =
        localStorage.getItem("samiraAdminRemember") === "true";

    if (emailInput && savedEmail && shouldRemember) {
        emailInput.value = savedEmail;

        if (rememberCheckbox) {
            rememberCheckbox.checked = true;
        }
    }

    /* =====================================================
       LIMPAR ERRO AO DIGITAR
       ===================================================== */

    emailInput?.addEventListener("input", () => {
        hideError();
    });

    passwordInput?.addEventListener("input", () => {
        hideError();
    });

    /* =====================================================
       VERIFICAR SE JÁ ESTÁ LOGADA
       ===================================================== */

    if (auth) {
        auth.onAuthStateChanged((user) => {
            if (user) {
                /*
                 * Não redirecionamos imediatamente enquanto
                 * a página carrega, pois assim a Samira pode
                 * visualizar o login mesmo estando autenticada.
                 */
                console.log(
                    "Usuária administrativa autenticada:",
                    user.email
                );
            }
        });
    }

    /* =====================================================
       ENTER NO TECLADO
       ===================================================== */

    [emailInput, passwordInput].forEach((input) => {
        input?.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                form.requestSubmit();
            }
        });
    });
});
