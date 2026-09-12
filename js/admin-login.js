/* =========================================================
   SAMIRA BEAUTY — LOGIN ADMINISTRATIVO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("adminLoginForm");
    const emailInput = document.getElementById("adminEmail");
    const passwordInput = document.getElementById("adminPassword");
    const passwordToggle = document.getElementById("adminPasswordToggle");
    const rememberInput = document.getElementById("rememberAdmin");
    const forgotButton = document.getElementById("forgotPassword");
    const loginButton = document.getElementById("adminLoginButton");
    const errorBox = document.getElementById("adminLoginError");
    const errorText = document.getElementById("adminLoginErrorText");

    /* -----------------------------------------------------
       FIREBASE
    ----------------------------------------------------- */

    function getAuth() {
        if (
            window.samiraFirebase &&
            window.samiraFirebase.auth
        ) {
            return window.samiraFirebase.auth;
        }

        return null;
    }

    /* -----------------------------------------------------
       VERIFICAR SE JÁ ESTÁ LOGADA
    ----------------------------------------------------- */

    const auth = getAuth();

    if (auth) {
        auth.onAuthStateChanged((user) => {

            if (user) {
                window.location.href = "admin.html";
            }

        });
    }

    /* -----------------------------------------------------
       MOSTRAR / OCULTAR SENHA
    ----------------------------------------------------- */

    if (passwordToggle && passwordInput) {

        passwordToggle.addEventListener("click", () => {

            const isPassword =
                passwordInput.type === "password";

            passwordInput.type =
                isPassword ? "text" : "password";

            const icon =
                passwordToggle.querySelector("i");

            if (icon) {
                icon.className =
                    isPassword
                        ? "fa-solid fa-eye-slash"
                        : "fa-solid fa-eye";
            }

        });

    }

    /* -----------------------------------------------------
       MENSAGEM DE ERRO
    ----------------------------------------------------- */

    function showError(message) {

        if (!errorBox) return;

        if (errorText) {
            errorText.textContent = message;
        }

        errorBox.classList.add("show");

    }

    function hideError() {

        if (!errorBox) return;

        errorBox.classList.remove("show");

    }

    /* -----------------------------------------------------
       LOADING DO BOTÃO
    ----------------------------------------------------- */

    function setLoading(isLoading) {

        if (!loginButton) return;

        loginButton.disabled = isLoading;

        if (isLoading) {
            loginButton.classList.add("loading");
        } else {
            loginButton.classList.remove("loading");
        }

    }

    /* -----------------------------------------------------
       TRADUZIR ERROS DO FIREBASE
    ----------------------------------------------------- */

    function firebaseErrorMessage(error) {

        if (!error || !error.code) {
            return "Não foi possível realizar o login. Tente novamente.";
        }

        switch (error.code) {

            case "auth/invalid-email":
                return "Digite um endereço de e-mail válido.";

            case "auth/user-disabled":
                return "Esta conta administrativa está desativada.";

            case "auth/user-not-found":
                return "E-mail ou senha incorretos.";

            case "auth/wrong-password":
                return "E-mail ou senha incorretos.";

            case "auth/invalid-credential":
                return "E-mail ou senha incorretos.";

            case "auth/too-many-requests":
                return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";

            case "auth/network-request-failed":
                return "Não foi possível conectar ao Firebase. Verifique sua internet.";

            case "auth/operation-not-allowed":
                return "O login por e-mail e senha ainda não está ativado no Firebase.";

            default:
                return "Não foi possível entrar. Verifique os dados e tente novamente.";
        }

    }

    /* -----------------------------------------------------
       LOGIN
    ----------------------------------------------------- */

    if (loginForm) {

        loginForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            hideError();

            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";

            const password =
                passwordInput
                    ? passwordInput.value
                    : "";

            if (!email) {
                showError("Digite seu e-mail administrativo.");
                emailInput?.focus();
                return;
            }

            if (!password) {
                showError("Digite sua senha.");
                passwordInput?.focus();
                return;
            }

            const currentAuth = getAuth();

            if (!currentAuth) {
                showError(
                    "O Firebase ainda não foi configurado. Verifique o arquivo js/firebase.js."
                );
                return;
            }

            setLoading(true);

            try {

                /*
                 * Persistência:
                 * - local = permanece conectado no navegador
                 * - session = permanece somente enquanto a sessão estiver aberta
                 */

                if (window.firebase && firebase.auth) {

                    const persistence =
                        rememberInput && rememberInput.checked
                            ? firebase.auth.Auth.Persistence.LOCAL
                            : firebase.auth.Auth.Persistence.SESSION;

                    await currentAuth.setPersistence(persistence);

                }

                await currentAuth.signInWithEmailAndPassword(
                    email,
                    password
                );

                window.location.href = "admin.html";

            } catch (error) {

                console.error(
                    "Erro no login administrativo:",
                    error
                );

                showError(
                    firebaseErrorMessage(error)
                );

                setLoading(false);

            }

        });

    }

    /* -----------------------------------------------------
       RECUPERAR SENHA
    ----------------------------------------------------- */

    if (forgotButton) {

        forgotButton.addEventListener("click", async () => {

            hideError();

            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";

            if (!email) {

                showError(
                    "Digite seu e-mail acima para receber o link de recuperação."
                );

                emailInput?.focus();

                return;
            }

            const currentAuth = getAuth();

            if (!currentAuth) {

                showError(
                    "O Firebase ainda não foi configurado."
                );

                return;
            }

            try {

                await currentAuth.sendPasswordResetEmail(email);

                showSuccess(
                    "Enviamos um link de recuperação para seu e-mail."
                );

            } catch (error) {

                console.error(
                    "Erro ao recuperar senha:",
                    error
                );

                showError(
                    firebaseErrorMessage(error)
                );

            }

        });

    }

    /* -----------------------------------------------------
       MENSAGEM DE SUCESSO
    ----------------------------------------------------- */

    function showSuccess(message) {

        if (!errorBox) return;

        errorBox.classList.add("show");

        errorBox.style.background = "#f1fff7";
        errorBox.style.borderColor = "#c8ead8";
        errorBox.style.color = "#28754f";

        if (errorText) {
            errorText.textContent = message;
        }

        const icon =
            errorBox.querySelector("i");

        if (icon) {
            icon.className =
                "fa-solid fa-circle-check";
        }

    }

    /* -----------------------------------------------------
       LIMPAR MENSAGEM AO DIGITAR
    ----------------------------------------------------- */

    [emailInput, passwordInput].forEach((input) => {

        if (!input) return;

        input.addEventListener("input", () => {

            if (errorBox) {
                errorBox.classList.remove("show");

                errorBox.style.background = "";
                errorBox.style.borderColor = "";
                errorBox.style.color = "";
            }

        });

    });

});
