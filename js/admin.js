/* =========================================================
   SAMIRA BEAUTY — ADMIN.JS
   Painel administrativo
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS PRINCIPAIS
       ===================================================== */

    const sidebar = document.querySelector(".admin-sidebar");
    const sidebarOverlay = document.querySelector(".admin-sidebar-overlay");
    const menuButton = document.querySelector(".admin-menu-button");
    const closeSidebarButton = document.querySelector(".admin-sidebar-close");

    const navItems = document.querySelectorAll(".admin-nav-item");
    const sections = document.querySelectorAll(".admin-section");

    const logoutButton = document.querySelector(".admin-logout-button");

    const pageLoader = document.querySelector(".admin-page-loader");

    /* =====================================================
       FIREBASE
       ===================================================== */

    const firebaseData = window.samiraFirebase || {};

    const db = firebaseData.db || null;
    const auth = firebaseData.auth || null;

    let currentUser = null;
    let appointments = [];

    /* =====================================================
       LOADER
       ===================================================== */

    function hideLoader() {
        if (!pageLoader) return;

        setTimeout(() => {
            pageLoader.classList.add("hidden");
        }, 300);
    }

    /* =====================================================
       SIDEBAR MOBILE
       ===================================================== */

    function openSidebar() {
        if (sidebar) {
            sidebar.classList.add("open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.add("active");
        }

        document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
        if (sidebar) {
            sidebar.classList.remove("open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("active");
        }

        document.body.style.overflow = "";
    }

    if (menuButton) {
        menuButton.addEventListener("click", openSidebar);
    }

    if (closeSidebarButton) {
        closeSidebarButton.addEventListener("click", closeSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeSidebar);
    }

    /* =====================================================
       NAVEGAÇÃO DO PAINEL
       ===================================================== */

    function showSection(sectionId) {

        sections.forEach(section => {
            section.classList.remove("active");
        });

        navItems.forEach(item => {
            item.classList.remove("active");
        });

        const targetSection = document.getElementById(sectionId);

        if (targetSection) {
            targetSection.classList.add("active");
        }

        const activeNav = document.querySelector(
            `.admin-nav-item[data-section="${sectionId}"]`
        );

        if (activeNav) {
            activeNav.classList.add("active");
        }

        closeSidebar();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    navItems.forEach(item => {

        item.addEventListener("click", () => {

            const sectionId = item.dataset.section;

            if (sectionId) {
                showSection(sectionId);
            }

        });

    });

    /* =====================================================
       BOTÕES "VER TODOS"
       ===================================================== */

    document.querySelectorAll("[data-go-section]").forEach(button => {

        button.addEventListener("click", () => {

            const section = button.dataset.goSection;

            if (section) {
                showSection(section);
            }

        });

    });

    /* =====================================================
       DATA ATUAL
       ===================================================== */

    function getTodayString() {

        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    /* =====================================================
       FORMATAR DATA
       ===================================================== */

    function formatDate(dateString) {

        if (!dateString) {
            return "—";
        }

        const date = new Date(`${dateString}T12:00:00`);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }

    function formatShortDate(dateString) {

        if (!dateString) {
            return {
                day: "--",
                month: "---"
            };
        }

        const date = new Date(`${dateString}T12:00:00`);

        if (Number.isNaN(date.getTime())) {
            return {
                day: "--",
                month: "---"
            };
        }

        return {
            day: String(date.getDate()).padStart(2, "0"),
            month: date.toLocaleDateString("pt-BR", {
                month: "short"
            }).replace(".", "")
        };
    }

    /* =====================================================
       TOAST
       ===================================================== */

    function showToast(title, message, type = "success") {

        const toast = document.querySelector(".admin-toast");

        if (!toast) {
            return;
        }

        const icon = toast.querySelector(".admin-toast-icon");
        const titleElement = toast.querySelector(".admin-toast-content strong");
        const messageElement = toast.querySelector(".admin-toast-content span");

        if (titleElement) {
            titleElement.textContent = title;
        }

        if (messageElement) {
            messageElement.textContent = message;
        }

        if (icon) {

            icon.className = "admin-toast-icon";

            if (type === "error") {
                icon.style.background = "var(--danger-bg)";
                icon.style.color = "var(--danger)";
                icon.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
            } else if (type === "warning") {
                icon.style.background = "var(--warning-bg)";
                icon.style.color = "var(--warning)";
                icon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
            } else {
                icon.style.background = "var(--success-bg)";
                icon.style.color = "var(--success)";
                icon.innerHTML = '<i class="fa-solid fa-check"></i>';
            }
        }

        toast.hidden = false;

        clearTimeout(window.adminToastTimer);

        window.adminToastTimer = setTimeout(() => {
            toast.hidden = true;
        }, 4500);
    }

    const toastClose = document.querySelector(".admin-toast-close");

    if (toastClose) {

        toastClose.addEventListener("click", () => {

            const toast = document.querySelector(".admin-toast");

            if (toast) {
                toast.hidden = true;
            }

        });

    }

    /* =====================================================
       USUÁRIO LOGADO
       ===================================================== */

    function updateUserInterface(user) {

        if (!user) {
            return;
        }

        const emailElements = document.querySelectorAll(
            "[data-admin-email], .admin-user-info span"
        );

        emailElements.forEach(element => {
            element.textContent = user.email || "Conta administrativa";
        });

        const nameElements = document.querySelectorAll(
            "[data-admin-name], .admin-user-info strong"
        );

        nameElements.forEach(element => {

            if (
                user.displayName &&
                user.displayName.trim()
            ) {
                element.textContent = user.displayName;
            } else {
                element.textContent = "Samira";
            }

        });
    }

    /* =====================================================
       PROTEÇÃO DA ÁREA ADMIN
       ===================================================== */

    function checkAuthentication() {

        if (!auth) {

            console.warn(
                "Firebase Auth ainda não está configurado."
            );

            hideLoader();

            return;
        }

        auth.onAuthStateChanged(user => {

            if (!user) {

                window.location.href = "admin-login.html";

                return;
            }

            currentUser = user;

            updateUserInterface(user);

            hideLoader();

            loadAppointments();

        });

    }

    /* =====================================================
       LOGOUT
       ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener("click", async () => {

            if (!auth) {
                window.location.href = "admin-login.html";
                return;
            }

            const confirmed = window.confirm(
                "Deseja realmente sair da área administrativa?"
            );

            if (!confirmed) {
                return;
            }

            try {

                await auth.signOut();

                window.location.href = "admin-login.html";

            } catch (error) {

                console.error("Erro ao sair:", error);

                showToast(
                    "Não foi possível sair",
                    "Tente novamente.",
                    "error"
                );

            }

        });

    }

    /* =====================================================
       CONVERTER DADOS DO FIRESTORE
       ===================================================== */

    function normalizeAppointment(doc) {

        const data = doc.data ? doc.data() : doc;

        return {
            id: doc.id || data.id || "",
            clientName:
                data.clientName ||
                data.name ||
                data.nome ||
                "Cliente",

            phone:
                data.phone ||
                data.whatsapp ||
                data.clientPhone ||
                "",

            service:
                data.service ||
                data.servico ||
                "Serviço",

            date:
                data.date ||
                data.data ||
                "",

            time:
                data.time ||
                data.hora ||
                "",

            message:
                data.message ||
                data.observations ||
                data.obs ||
                "",

            status:
                data.status ||
                "pending",

            createdAt:
                data.createdAt ||
                null
        };
    }

    /* =====================================================
       CARREGAR AGENDAMENTOS
       ===================================================== */

    async function loadAppointments() {

        if (!db) {

            console.warn(
                "Firestore ainda não está configurado."
            );

            appointments = [];

            updateDashboard();

            renderAppointments();

            return;
        }

        try {

            const snapshot = await db
                .collection("appointments")
                .get();

            appointments = snapshot.docs
                .map(normalizeAppointment)
                .sort((a, b) => {

                    const dateA = `${a.date} ${a.time}`;
                    const dateB = `${b.date} ${b.time}`;

                    return dateA.localeCompare(dateB);
                });

            updateDashboard();
            renderAppointments();
            updateAppointmentBadge();

        } catch (error) {

            console.error(
                "Erro ao carregar agendamentos:",
                error
            );

            showToast(
                "Erro ao carregar",
                "Não foi possível buscar os agendamentos.",
                "error"
            );

            appointments = [];

            updateDashboard();
            renderAppointments();

        }

    }

    /* =====================================================
       CONTADORES
       ===================================================== */

    function updateDashboard() {

        const today = getTodayString();

        const total = appointments.length;

        const pending = appointments.filter(
            appointment =>
                appointment.status === "pending"
        ).length;

        const confirmed = appointments.filter(
            appointment =>
                appointment.status === "confirmed"
        ).length;

        const todayAppointments = appointments.filter(
            appointment =>
                appointment.date === today &&
                appointment.status !== "cancelled"
        ).length;

        setCounter(
            [
                "[data-stat='total']",
                "#totalAppointments",
                "#statTotal"
            ],
            total
        );

        setCounter(
            [
                "[data-stat='pending']",
                "#pendingAppointments",
                "#statPending"
            ],
            pending
        );

        setCounter(
            [
                "[data-stat='confirmed']",
                "#confirmedAppointments",
                "#statConfirmed"
            ],
            confirmed
        );

        setCounter(
            [
                "[data-stat='today']",
                "#todayAppointments",
                "#statToday"
            ],
            todayAppointments
        );

    }

    function setCounter(selectors, value) {

        for (const selector of selectors) {

            const elements =
                document.querySelectorAll(selector);

            if (!elements.length) {
                continue;
            }

            elements.forEach(element => {
                element.textContent = value;
            });

            return;
        }
    }

    /* =====================================================
       BADGE DE PENDENTES
       ===================================================== */

    function updateAppointmentBadge() {

        const pending = appointments.filter(
            appointment =>
                appointment.status === "pending"
        ).length;

        const badges = document.querySelectorAll(
            ".admin-nav-badge"
        );

        badges.forEach(badge => {

            badge.textContent = pending;

            badge.hidden = pending === 0;

        });

    }

    /* =====================================================
       STATUS
       ===================================================== */

    function getStatusLabel(status) {

        const labels = {
            pending: "Pendente",
            confirmed: "Confirmado",
            completed: "Concluído",
            cancelled: "Cancelado"
        };

        return labels[status] || "Pendente";
    }

    /* =====================================================
       PRÓXIMOS AGENDAMENTOS
       ===================================================== */

    function getUpcomingAppointments() {

        const now = new Date();

        return appointments
            .filter(appointment => {

                if (!appointment.date) {
                    return false;
                }

                if (appointment.status === "cancelled") {
                    return false;
                }

                const appointmentDate =
                    new Date(
                        `${appointment.date}T${appointment.time || "00:00"}`
                    );

                return appointmentDate >= now;

            })
            .sort((a, b) => {

                const dateA =
                    new Date(
                        `${a.date}T${a.time || "00:00"}`
                    );

                const dateB =
                    new Date(
                        `${b.date}T${b.time || "00:00"}`
                    );

                return dateA - dateB;

            });

    }

    /* =====================================================
       RENDERIZAR PRÓXIMOS
       ===================================================== */

    function renderUpcomingAppointments() {

        const containers = document.querySelectorAll(
            ".admin-upcoming-list, #upcomingAppointments, [data-upcoming]"
        );

        if (!containers.length) {
            return;
        }

        const upcoming =
            getUpcomingAppointments().slice(0, 5);

        containers.forEach(container => {

            if (!upcoming.length) {

                container.innerHTML = `
                    <div class="admin-empty-state">
                        <div class="admin-empty-icon">
                            <i class="fa-regular fa-calendar"></i>
                        </div>

                        <h4>Nenhum agendamento próximo</h4>

                        <p>
                            Quando uma cliente marcar um horário,
                            ele aparecerá aqui.
                        </p>
                    </div>
                `;

                return;
            }

            container.innerHTML = upcoming
                .map(createAppointmentHTML)
                .join("");

        });

    }

    /* =====================================================
       HTML DO AGENDAMENTO
       ===================================================== */

    function createAppointmentHTML(appointment) {

        const date =
            formatShortDate(appointment.date);

        return `
            <article
                class="admin-appointment-item"
                data-appointment-id="${escapeHTML(appointment.id)}"
            >

                <div class="admin-appointment-date">
                    <strong>${escapeHTML(date.day)}</strong>
                    <span>${escapeHTML(date.month)}</span>
                </div>

                <div class="admin-appointment-client">

                    <strong>
                        ${escapeHTML(appointment.clientName)}
                    </strong>

                    <span>
                        ${escapeHTML(appointment.service)}
                    </span>

                </div>

                <div class="admin-appointment-time">
                    <i class="fa-regular fa-clock"></i>
                    ${escapeHTML(appointment.time || "--:--")}
                </div>

                <span class="admin-status ${escapeHTML(
                    appointment.status
                )}">
                    ${getStatusLabel(appointment.status)}
                </span>

            </article>
        `;
    }

    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =====================================================
       LISTA COMPLETA DE AGENDAMENTOS
       ===================================================== */

    function renderAppointments(list = appointments) {

        const containers = document.querySelectorAll(
            "#appointmentsList, .admin-appointments-list, [data-appointments-list]"
        );

        containers.forEach(container => {

            if (!list.length) {

                container.innerHTML = `
                    <div class="admin-empty-state">
                        <div class="admin-empty-icon">
                            <i class="fa-regular fa-calendar-xmark"></i>
                        </div>

                        <h4>Nenhum agendamento encontrado</h4>

                        <p>
                            Ainda não há horários registrados
                            ou nenhum resultado corresponde aos filtros.
                        </p>
                    </div>
                `;

                return;
            }

            container.innerHTML = list
                .map(appointment => {

                    const date =
                        formatShortDate(appointment.date);

                    return `
                        <article
                            class="admin-appointment-item"
                            data-appointment-id="${escapeHTML(appointment.id)}"
                        >

                            <div class="admin-appointment-date">
                                <strong>${escapeHTML(date.day)}</strong>
                                <span>${escapeHTML(date.month)}</span>
                            </div>

                            <div class="admin-appointment-client">
                                <strong>
                                    ${escapeHTML(
                                        appointment.clientName
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        appointment.service
                                    )}
                                </span>
                            </div>

                            <div class="admin-appointment-time">
                                <i class="fa-regular fa-clock"></i>
                                ${escapeHTML(
                                    appointment.time || "--:--"
                                )}
                            </div>

                            <span class="admin-status ${escapeHTML(
                                appointment.status
                            )}">
                                ${getStatusLabel(
                                    appointment.status
                                )}
                            </span>

                        </article>
                    `;

                })
                .join("");

        });

        const resultCount =
            document.querySelectorAll(
                ".admin-result-count, [data-result-count]"
            );

        resultCount.forEach(element => {
            element.textContent =
                `${list.length} resultado${list.length === 1 ? "" : "s"}`;
        });

        renderUpcomingAppointments();

        attachAppointmentClickEvents();

    }

    /* =====================================================
       CLICAR NO AGENDAMENTO
       ===================================================== */

    function attachAppointmentClickEvents() {

        document
            .querySelectorAll(
                ".admin-appointment-item[data-appointment-id]"
            )
            .forEach(item => {

                item.style.cursor = "pointer";

                item.addEventListener("click", () => {

                    const id =
                        item.dataset.appointmentId;

                    openAppointmentDetails(id);

                });

            });

    }

    /* =====================================================
       MODAL DE DETALHES
       ===================================================== */

    function openAppointmentDetails(id) {

        const appointment =
            appointments.find(
                item => item.id === id
            );

        if (!appointment) {
            return;
        }

        const modal =
            document.querySelector(".admin-modal");

        if (!modal) {
            return;
        }

        const modalBody =
            modal.querySelector(".admin-modal-body");

        if (!modalBody) {
            return;
        }

        modalBody.innerHTML = `
            <div class="admin-account-info">

                <div class="admin-account-row">
                    <span>Cliente</span>
                    <strong>
                        ${escapeHTML(appointment.clientName)}
                    </strong>
                </div>

                <div class="admin-account-row">
                    <span>WhatsApp</span>
                    <strong>
                        ${escapeHTML(
                            appointment.phone || "Não informado"
                        )}
                    </strong>
                </div>

                <div class="admin-account-row">
                    <span>Serviço</span>
                    <strong>
                        ${escapeHTML(appointment.service)}
                    </strong>
                </div>

                <div class="admin-account-row">
                    <span>Data</span>
                    <strong>
                        ${formatDate(appointment.date)}
                    </strong>
                </div>

                <div class="admin-account-row">
                    <span>Horário</span>
                    <strong>
                        ${escapeHTML(
                            appointment.time || "Não informado"
                        )}
                    </strong>
                </div>

                <div class="admin-account-row">
                    <span>Status</span>
                    <strong>
                        ${getStatusLabel(appointment.status)}
                    </strong>
                </div>

            </div>

            ${
                appointment.message
                    ? `
                        <div
                            style="
                                margin-top:20px;
                                padding:15px;
                                border-radius:12px;
                                background:var(--pink-pale);
                                color:var(--text-light);
                                font-size:.72rem;
                                line-height:1.6;
                            "
                        >
                            <strong
                                style="
                                    display:block;
                                    margin-bottom:6px;
                                    color:var(--text);
                                "
                            >
                                Observação
                            </strong>

                            ${escapeHTML(
                                appointment.message
                            )}
                        </div>
                    `
                    : ""
            }

            <div
                style="
                    display:flex;
                    flex-wrap:wrap;
                    gap:8px;
                    margin-top:20px;
                "
            >

                ${
                    appointment.status !== "confirmed"
                        ? `
                            <button
                                class="admin-primary-button"
                                type="button"
                                data-modal-action="confirm"
                                data-id="${escapeHTML(id)}"
                            >
                                <i class="fa-solid fa-check"></i>
                                Confirmar
                            </button>
                        `
                        : ""
                }

                ${
                    appointment.status !== "completed"
                        ? `
                            <button
                                class="admin-secondary-button"
                                type="button"
                                data-modal-action="complete"
                                data-id="${escapeHTML(id)}"
                            >
                                <i class="fa-solid fa-circle-check"></i>
                                Concluir
                            </button>
                        `
                        : ""
                }

                ${
                    appointment.status !== "cancelled"
                        ? `
                            <button
                                class="admin-secondary-button"
                                type="button"
                                data-modal-action="cancel"
                                data-id="${escapeHTML(id)}"
                            >
                                <i class="fa-solid fa-xmark"></i>
                                Cancelar
                            </button>
                        `
                        : ""
                }

            </div>
        `;

        modal.hidden = false;

        document.body.style.overflow = "hidden";

        modal
            .querySelectorAll("[data-modal-action]")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const action =
                        button.dataset.modalAction;

                    const appointmentId =
                        button.dataset.id;

                    changeAppointmentStatus(
                        appointmentId,
                        action
                    );

                });

            });

    }

    /* =====================================================
       FECHAR MODAL
       ===================================================== */

    function closeModal() {

        const modal =
            document.querySelector(".admin-modal");

        if (!modal) {
            return;
        }

        modal.hidden = true;

        document.body.style.overflow = "";

    }

    document
        .querySelectorAll(
            ".admin-modal-close, .admin-modal-overlay"
        )
        .forEach(element => {

            element.addEventListener(
                "click",
                closeModal
            );

        });

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            closeModal();
            closeSidebar();

        }

    });

    /* =====================================================
       ALTERAR STATUS
       ===================================================== */

    async function changeAppointmentStatus(id, action) {

        const appointment =
            appointments.find(
                item => item.id === id
            );

        if (!appointment) {
            return;
        }

        const statusMap = {
            confirm: "confirmed",
            complete: "completed",
            cancel: "cancelled"
        };

        const newStatus =
            statusMap[action];

        if (!newStatus) {
            return;
        }

        if (newStatus === "cancelled") {

            const confirmed =
                window.confirm(
                    "Deseja realmente cancelar este agendamento?"
                );

            if (!confirmed) {
                return;
            }

        }

        if (!db) {

            appointment.status = newStatus;

            updateDashboard();
            renderAppointments();

            closeModal();

            showToast(
                "Status atualizado",
                "A alteração foi feita localmente.",
                "warning"
            );

            return;
        }

        try {

            await db
                .collection("appointments")
                .doc(id)
                .update({
                    status: newStatus,
                    updatedAt:
                        firebase.firestore.FieldValue.serverTimestamp()
                });

            appointment.status = newStatus;

            updateDashboard();
            renderAppointments();
            updateAppointmentBadge();

            closeModal();

            const messages = {
                confirmed:
                    "O agendamento foi confirmado.",
                completed:
                    "O atendimento foi marcado como concluído.",
                cancelled:
                    "O agendamento foi cancelado."
            };

            showToast(
                "Agendamento atualizado",
                messages[newStatus],
                newStatus === "cancelled"
                    ? "warning"
                    : "success"
            );

        } catch (error) {

            console.error(
                "Erro ao atualizar status:",
                error
            );

            showToast(
                "Não foi possível atualizar",
                "Verifique a conexão com o Firebase.",
                "error"
            );

        }

    }

    /* =====================================================
       FILTROS
       ===================================================== */

    const dateFilter =
        document.querySelector(
            "#appointmentDateFilter, [data-filter-date]"
        );

    const statusFilter =
        document.querySelector(
            "#appointmentStatusFilter, [data-filter-status]"
        );

    const searchFilter =
        document.querySelector(
            "#appointmentSearch, [data-filter-search]"
        );

    function applyFilters() {

        let filtered =
            [...appointments];

        const date =
            dateFilter?.value || "";

        const status =
            statusFilter?.value || "";

        const search =
            searchFilter?.value
                .trim()
                .toLowerCase() || "";

        if (date) {

            filtered =
                filtered.filter(
                    appointment =>
                        appointment.date === date
                );

        }

        if (status) {

            filtered =
                filtered.filter(
                    appointment =>
                        appointment.status === status
                );

        }

        if (search) {

            filtered =
                filtered.filter(appointment => {

                    const content = [
                        appointment.clientName,
                        appointment.phone,
                        appointment.service,
                        appointment.date,
                        appointment.time
                    ]
                        .join(" ")
                        .toLowerCase();

                    return content.includes(search);

                });

        }

        renderAppointments(filtered);

    }

    [
        dateFilter,
        statusFilter,
        searchFilter
    ].forEach(element => {

        if (!element) {
            return;
        }

        element.addEventListener(
            "input",
            applyFilters
        );

        element.addEventListener(
            "change",
            applyFilters
        );

    });

    /* =====================================================
       LIMPAR FILTROS
       ===================================================== */

    document
        .querySelectorAll(
            ".admin-clear-filter, [data-clear-filters]"
        )
        .forEach(button => {

            button.addEventListener("click", () => {

                if (dateFilter) {
                    dateFilter.value = "";
                }

                if (statusFilter) {
                    statusFilter.value = "";
                }

                if (searchFilter) {
                    searchFilter.value = "";
                }

                renderAppointments();

            });

        });

    /* =====================================================
       ATUALIZAR MANUALMENTE
       ===================================================== */

    document
        .querySelectorAll(
            ".admin-refresh-button, [data-refresh]"
        )
        .forEach(button => {

            button.addEventListener("click", async () => {

                const icon =
                    button.querySelector("i");

                if (icon) {
                    icon.classList.add("fa-spin");
                }

                await loadAppointments();

                if (icon) {
                    icon.classList.remove("fa-spin");
                }

                showToast(
                    "Agenda atualizada",
                    "Os dados foram atualizados.",
                    "success"
                );

            });

        });

    /* =====================================================
       ATUALIZAÇÃO AUTOMÁTICA
       ===================================================== */

    setInterval(() => {

        if (
            currentUser &&
            document.visibilityState === "visible"
        ) {
            loadAppointments();
        }

    }, 60000);

    /* =====================================================
       DATA MÍNIMA DOS FILTROS
       ===================================================== */

    if (dateFilter) {
        dateFilter.min = getTodayString();
    }

    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    checkAuthentication();

});
