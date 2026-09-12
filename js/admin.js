/* =========================================================
   SAMIRA BEAUTY — PAINEL ADMINISTRATIVO
   Firebase Authentication + Firestore
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS PRINCIPAIS
    ===================================================== */

    const loader =
        document.getElementById("adminPageLoader");

    const sidebar =
        document.getElementById("adminSidebar");

    const sidebarOverlay =
        document.getElementById("adminSidebarOverlay");

    const menuButton =
        document.getElementById("adminMenuButton");

    const sidebarClose =
        document.getElementById("adminSidebarClose");

    const logoutButton =
        document.getElementById("adminLogoutButton");

    const refreshButton =
        document.getElementById("adminRefreshButton");

    const pageTitle =
        document.getElementById("adminPageTitle");

    const pageSubtitle =
        document.getElementById("adminPageSubtitle");

    const adminUserName =
        document.getElementById("adminUserName");

    const adminUserEmail =
        document.getElementById("adminUserEmail");

    const pendingBadge =
        document.getElementById("pendingAppointmentsBadge");

    const appointmentsList =
        document.getElementById("appointmentsList");

    const upcomingAppointments =
        document.getElementById("upcomingAppointments");

    const appointmentResultsCount =
        document.getElementById("appointmentResultsCount");

    const dateFilter =
        document.getElementById("appointmentDateFilter");

    const statusFilter =
        document.getElementById("appointmentStatusFilter");

    const searchInput =
        document.getElementById("appointmentSearch");

    const clearFiltersButton =
        document.getElementById("clearAppointmentFilters");

    const appointmentModal =
        document.getElementById("appointmentModal");

    const appointmentModalBody =
        document.getElementById("appointmentModalBody");

    const modalClose =
        document.querySelector(".admin-modal-close");

    const modalOverlay =
        document.querySelector(".admin-modal-overlay");

    const toast =
        document.getElementById("adminToast");

    const toastMessage =
        document.getElementById("adminToastMessage");


    /* =====================================================
       FIREBASE
    ===================================================== */

    const firebaseServices =
        window.samiraFirebase || {};

    const auth =
        firebaseServices.auth || null;

    const db =
        firebaseServices.db || null;


    let appointments = [];
    let currentUser = null;


    /* =====================================================
       ESCAPAR HTML
    ===================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       LOADER
    ===================================================== */

    function hideLoader() {

        if (!loader) {
            return;
        }

        loader.classList.add("hidden");

        setTimeout(() => {

            loader.style.display =
                "none";

        }, 450);

    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {

        if (
            !toast ||
            !toastMessage
        ) {
            return;
        }

        toastMessage.textContent =
            message;

        toast.classList.add("show");


        clearTimeout(
            window.samiraToastTimer
        );


        window.samiraToastTimer =
            setTimeout(() => {

                toast.classList.remove(
                    "show"
                );

            }, 3500);

    }


    /* =====================================================
       SIDEBAR MOBILE
    ===================================================== */

    function openSidebar() {

        if (sidebar) {
            sidebar.classList.add("open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.add(
                "active"
            );
        }

        document.body.style.overflow =
            "hidden";

    }


    function closeSidebar() {

        if (sidebar) {
            sidebar.classList.remove("open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove(
                "active"
            );
        }

        document.body.style.overflow =
            "";

    }


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            openSidebar
        );

    }


    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            closeSidebar
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    /* =====================================================
       NAVEGAÇÃO
    ===================================================== */

    const navItems =
        document.querySelectorAll(
            ".admin-nav-item"
        );

    const sections =
        document.querySelectorAll(
            "[data-section-content]"
        );


    const pageTexts = {

        dashboard: {
            title: "Visão geral",
            subtitle:
                "Acompanhe seus atendimentos e agendamentos."
        },

        appointments: {
            title: "Agendamentos",
            subtitle:
                "Gerencie os horários solicitados pelas clientes."
        },

        clients: {
            title: "Clientes",
            subtitle:
                "Visualize as clientes que realizaram agendamentos."
        },

        services: {
            title: "Serviços",
            subtitle:
                "Gerencie os procedimentos oferecidos."
        },

        gallery: {
            title: "Galeria",
            subtitle:
                "Organize as fotos dos seus trabalhos."
        }

    };


    function openSection(sectionName) {

        sections.forEach(section => {

            section.classList.remove(
                "active"
            );

        });


        navItems.forEach(item => {

            item.classList.remove(
                "active"
            );

        });


        const section =
            document.querySelector(
                `[data-section-content="${sectionName}"]`
            );


        const navItem =
            document.querySelector(
                `.admin-nav-item[data-section="${sectionName}"]`
            );


        if (section) {

            section.classList.add(
                "active"
            );

        }


        if (navItem) {

            navItem.classList.add(
                "active"
            );

        }


        const text =
            pageTexts[sectionName];


        if (text) {

            if (pageTitle) {
                pageTitle.textContent =
                    text.title;
            }

            if (pageSubtitle) {
                pageSubtitle.textContent =
                    text.subtitle;
            }

        }


        closeSidebar();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                openSection(
                    item.dataset.section
                );

            }
        );

    });


    document
        .querySelectorAll(
            "[data-section-target]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openSection(
                        button.dataset
                            .sectionTarget
                    );

                }
            );

        });


    /* =====================================================
       FORMATAÇÃO
    ===================================================== */

    function formatDate(dateString) {

        if (!dateString) {
            return "—";
        }


        const [
            year,
            month,
            day
        ] = dateString.split("-");


        return `${day}/${month}/${year}`;

    }


    function getShortDate(dateString) {

        if (!dateString) {

            return {
                day: "--",
                month: "---"
            };

        }


        const date =
            new Date(
                `${dateString}T12:00:00`
            );


        return {

            day:
                String(
                    date.getDate()
                ).padStart(2, "0"),

            month:
                date
                    .toLocaleDateString(
                        "pt-BR",
                        {
                            month: "short"
                        }
                    )
                    .replace(".", "")
                    .toUpperCase()

        };

    }


    function getStatusLabel(status) {

        const labels = {

            pending:
                "Aguardando",

            confirmed:
                "Confirmado",

            completed:
                "Realizado",

            cancelled:
                "Cancelado"

        };


        return (
            labels[status] ||
            "Aguardando"
        );

    }


    /* =====================================================
       CARREGAR AGENDAMENTOS
    ===================================================== */

    async function loadAppointments() {

        if (!db) {

            console.error(
                "Firestore não conectado."
            );

            showToast(
                "Não foi possível conectar ao banco."
            );

            return;

        }


        if (refreshButton) {

            refreshButton.classList.add(
                "rotating"
            );

            refreshButton.disabled =
                true;

        }


        try {

            const snapshot =
                await db
                    .collection(
                        "appointments"
                    )
                    .get();


            appointments =
                snapshot.docs.map(doc => {

                    const data =
                        doc.data();

                    return {

                        id:
                            doc.id,

                        slotId:
                            data.slotId ||
                            doc.id,

                        clientName:
                            data.clientName ||
                            "Cliente",

                        phone:
                            data.phone ||
                            "",

                        service:
                            data.service ||
                            "Não informado",

                        date:
                            data.date ||
                            "",

                        time:
                            data.time ||
                            "",

                        message:
                            data.message ||
                            "",

                        status:
                            data.status ||
                            "pending",

                        createdAt:
                            data.createdAt ||
                            null

                    };

                });


            appointments.sort(
                (a, b) => {

                    const aDate =
                        new Date(
                            `${a.date}T${a.time || "00:00"}`
                        );

                    const bDate =
                        new Date(
                            `${b.date}T${b.time || "00:00"}`
                        );


                    return (
                        aDate -
                        bDate
                    );

                }
            );


            updateStatistics();

            renderAppointments(
                getFilteredAppointments()
            );

            renderUpcomingAppointments();

            renderClients();

        } catch (error) {

            console.error(
                "Erro ao carregar agendamentos:",
                error
            );


            showToast(
                "Erro ao carregar agendamentos."
            );

        } finally {

            if (refreshButton) {

                refreshButton.classList.remove(
                    "rotating"
                );

                refreshButton.disabled =
                    false;

            }

        }

    }


    /* =====================================================
       ESTATÍSTICAS
    ===================================================== */

    function updateStatistics() {

        const total =
            appointments.length;


        const pending =
            appointments.filter(
                item =>
                    item.status ===
                    "pending"
            ).length;


        const confirmed =
            appointments.filter(
                item =>
                    item.status ===
                    "confirmed"
            ).length;


        const completed =
            appointments.filter(
                item =>
                    item.status ===
                    "completed"
            ).length;


        const totalElement =
            document.querySelector(
                '[data-stat="total"]'
            );

        const pendingElement =
            document.querySelector(
                '[data-stat="pending"]'
            );

        const confirmedElement =
            document.querySelector(
                '[data-stat="confirmed"]'
            );

        const completedElement =
            document.querySelector(
                '[data-stat="completed"]'
            );


        if (totalElement) {
            totalElement.textContent =
                total;
        }

        if (pendingElement) {
            pendingElement.textContent =
                pending;
        }

        if (confirmedElement) {
            confirmedElement.textContent =
                confirmed;
        }

        if (completedElement) {
            completedElement.textContent =
                completed;
        }


        if (pendingBadge) {

            pendingBadge.textContent =
                pending;

            pendingBadge.style.display =
                pending > 0
                    ? "flex"
                    : "none";

        }

    }


    /* =====================================================
       FILTROS
    ===================================================== */

    function getFilteredAppointments() {

        let result =
            [...appointments];


        const selectedDate =
            dateFilter
                ? dateFilter.value
                : "";


        const selectedStatus =
            statusFilter
                ? statusFilter.value
                : "";


        const search =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        if (selectedDate) {

            result =
                result.filter(
                    item =>
                        item.date ===
                        selectedDate
                );

        }


        if (selectedStatus) {

            result =
                result.filter(
                    item =>
                        item.status ===
                        selectedStatus
                );

        }


        if (search) {

            result =
                result.filter(item => {

                    const content =

                        `${item.clientName} ` +
                        `${item.phone} ` +
                        `${item.service}`

                            .toLowerCase();


                    return content.includes(
                        search
                    );

                });

        }


        return result;

    }


    function applyFilters() {

        renderAppointments(
            getFilteredAppointments()
        );

    }


    if (dateFilter) {

        dateFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }


    if (clearFiltersButton) {

        clearFiltersButton.addEventListener(
            "click",
            () => {

                if (dateFilter) {
                    dateFilter.value = "";
                }

                if (statusFilter) {
                    statusFilter.value = "";
                }

                if (searchInput) {
                    searchInput.value = "";
                }


                applyFilters();

            }
        );

    }


    /* =====================================================
       LISTA DE AGENDAMENTOS
    ===================================================== */

    function renderAppointments(list) {

        if (!appointmentsList) {
            return;
        }


        if (
            appointmentResultsCount
        ) {

            appointmentResultsCount.textContent =
                `${list.length} resultado${
                    list.length === 1
                        ? ""
                        : "s"
                }`;

        }


        if (!list.length) {

            appointmentsList.innerHTML = `

                <div class="admin-empty-state">

                    <div class="admin-empty-icon">
                        <i class="fa-regular fa-calendar-xmark"></i>
                    </div>

                    <h3>
                        Nenhum agendamento encontrado
                    </h3>

                    <p>
                        Não encontramos agendamentos
                        com esses filtros.
                    </p>

                </div>

            `;

            return;

        }


        appointmentsList.innerHTML =
            list.map(item => {

                const initial =
                    item.clientName
                        .charAt(0)
                        .toUpperCase();


                return `

                    <div
                        class="admin-appointment-row"
                        data-id="${escapeHTML(
                            item.id
                        )}"
                    >

                        <div class="admin-appointment-client">

                            <div class="admin-client-avatar">
                                ${escapeHTML(initial)}
                            </div>

                            <div class="admin-appointment-client-info">

                                <strong>
                                    ${escapeHTML(
                                        item.clientName
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        item.phone
                                    )}
                                </span>

                            </div>

                        </div>


                        <div class="admin-appointment-cell">

                            <strong>
                                ${escapeHTML(
                                    item.service
                                )}
                            </strong>

                            <span>
                                Serviço
                            </span>

                        </div>


                        <div class="admin-appointment-cell">

                            <strong>
                                ${formatDate(
                                    item.date
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    item.time
                                )}
                            </span>

                        </div>


                        <div>

                            <span
                                class="admin-status ${escapeHTML(
                                    item.status
                                )}"
                            >
                                ${getStatusLabel(
                                    item.status
                                )}
                            </span>

                        </div>


                        <div class="admin-appointment-actions">

                            <button
                                type="button"
                                class="admin-action-button"
                                title="Ver detalhes"
                                data-action="view"
                                data-id="${escapeHTML(
                                    item.id
                                )}"
                            >
                                <i class="fa-regular fa-eye"></i>
                            </button>


                            ${
                                item.status ===
                                "pending"
                                    ? `

                                        <button
                                            type="button"
                                            class="admin-action-button confirm"
                                            title="Confirmar"
                                            data-action="confirm"
                                            data-id="${escapeHTML(
                                                item.id
                                            )}"
                                        >
                                            <i class="fa-solid fa-check"></i>
                                        </button>

                                    `
                                    : ""
                            }


                            ${
                                item.status !==
                                "cancelled"
                                    ? `

                                        <button
                                            type="button"
                                            class="admin-action-button cancel"
                                            title="Cancelar"
                                            data-action="cancel"
                                            data-id="${escapeHTML(
                                                item.id
                                            )}"
                                        >
                                            <i class="fa-solid fa-xmark"></i>
                                        </button>

                                    `
                                    : ""
                            }

                        </div>

                    </div>

                `;

            }).join("");


        attachAppointmentButtons();

    }


    /* =====================================================
       PRÓXIMOS AGENDAMENTOS
    ===================================================== */

    function renderUpcomingAppointments() {

        if (!upcomingAppointments) {
            return;
        }


        const now =
            new Date();


        const upcoming =
            appointments
                .filter(item => {

                    if (
                        item.status ===
                        "cancelled"
                    ) {
                        return false;
                    }


                    const date =
                        new Date(
                            `${item.date}T${item.time || "00:00"}`
                        );


                    return (
                        date >= now
                    );

                })
                .slice(0, 5);


        if (!upcoming.length) {

            upcomingAppointments.innerHTML = `

                <div class="admin-empty-state">

                    <div class="admin-empty-icon">
                        <i class="fa-regular fa-calendar"></i>
                    </div>

                    <h3>
                        Nenhum atendimento próximo
                    </h3>

                    <p>
                        Os próximos horários aparecerão aqui.
                    </p>

                </div>

            `;

            return;

        }


        upcomingAppointments.innerHTML =
            upcoming.map(item => {

                const short =
                    getShortDate(
                        item.date
                    );


                return `

                    <div
                        class="admin-upcoming-item"
                        data-id="${escapeHTML(
                            item.id
                        )}"
                    >

                        <div class="admin-date-box">

                            <strong>
                                ${short.day}
                            </strong>

                            <span>
                                ${short.month}
                            </span>

                        </div>


                        <div class="admin-upcoming-info">

                            <strong>
                                ${escapeHTML(
                                    item.clientName
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    item.service
                                )}
                            </span>

                        </div>


                        <div class="admin-upcoming-time">

                            ${escapeHTML(
                                item.time
                            )}

                        </div>

                    </div>

                `;

            }).join("");

    }


    /* =====================================================
       CLIENTES
    ===================================================== */

    function renderClients() {

        const clientsSection =
            document.getElementById(
                "clientsSection"
            );


        if (!clientsSection) {
            return;
        }


        const panel =
            clientsSection.querySelector(
                ".admin-panel"
            );


        if (!panel) {
            return;
        }


        const clientMap =
            new Map();


        appointments.forEach(item => {

            const key =
                item.phone ||
                item.clientName;


            if (!clientMap.has(key)) {

                clientMap.set(
                    key,
                    {
                        name:
                            item.clientName,

                        phone:
                            item.phone,

                        appointments:
                            0
                    }
                );

            }


            clientMap.get(key)
                .appointments++;

        });


        const clients =
            [...clientMap.values()];


        if (!clients.length) {

            return;

        }


        panel.innerHTML = `

            <div
                style="
                    padding:20px;
                    display:grid;
                    grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
                    gap:12px;
                "
            >

                ${clients.map(client => `

                    <div
                        style="
                            padding:17px;
                            border:1px solid var(--border);
                            border-radius:14px;
                            background:#fffafd;
                        "
                    >

                        <strong
                            style="
                                display:block;
                                font-size:12px;
                                margin-bottom:5px;
                            "
                        >
                            ${escapeHTML(
                                client.name
                            )}
                        </strong>

                        <span
                            style="
                                display:block;
                                color:var(--text-muted);
                                font-size:10px;
                                margin-bottom:8px;
                            "
                        >
                            ${escapeHTML(
                                client.phone
                            )}
                        </span>

                        <small
                            style="
                                color:var(--pink-dark);
                                font-size:9px;
                                font-weight:700;
                            "
                        >
                            ${client.appointments}
                            agendamento${
                                client.appointments === 1
                                    ? ""
                                    : "s"
                            }
                        </small>

                    </div>

                `).join("")}

            </div>

        `;

    }


    /* =====================================================
       BOTÕES DOS AGENDAMENTOS
    ===================================================== */

    function attachAppointmentButtons() {

        document
            .querySelectorAll(
                "[data-action][data-id]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async event => {

                        event.stopPropagation();


                        const id =
                            button.dataset.id;


                        const action =
                            button.dataset.action;


                        if (
                            action ===
                            "view"
                        ) {

                            openAppointmentModal(
                                id
                            );

                        }


                        if (
                            action ===
                            "confirm"
                        ) {

                            await confirmAppointment(
                                id
                            );

                        }


                        if (
                            action ===
                            "cancel"
                        ) {

                            await cancelAppointment(
                                id
                            );

                        }

                    }
                );

            });

    }


    /* =====================================================
       MODAL
    ===================================================== */

    function openAppointmentModal(id) {

        const item =
            appointments.find(
                appointment =>
                    appointment.id === id
            );


        if (
            !item ||
            !appointmentModal ||
            !appointmentModalBody
        ) {
            return;
        }


        appointmentModalBody.innerHTML = `

            <div class="admin-detail-grid">

                <div class="admin-detail-item">

                    <span>
                        Cliente
                    </span>

                    <strong>
                        ${escapeHTML(
                            item.clientName
                        )}
                    </strong>

                </div>


                <div class="admin-detail-item">

                    <span>
                        WhatsApp
                    </span>

                    <strong>
                        ${escapeHTML(
                            item.phone
                        )}
                    </strong>

                </div>


                <div class="admin-detail-item">

                    <span>
                        Serviço
                    </span>

                    <strong>
                        ${escapeHTML(
                            item.service
                        )}
                    </strong>

                </div>


                <div class="admin-detail-item">

                    <span>
                        Status
                    </span>

                    <strong>
                        ${getStatusLabel(
                            item.status
                        )}
                    </strong>

                </div>


                <div class="admin-detail-item">

                    <span>
                        Data
                    </span>

                    <strong>
                        ${formatDate(
                            item.date
                        )}
                    </strong>

                </div>


                <div class="admin-detail-item">

                    <span>
                        Horário
                    </span>

                    <strong>
                        ${escapeHTML(
                            item.time
                        )}
                    </strong>

                </div>


                <div class="admin-detail-item full">

                    <span>
                        Observação
                    </span>

                    <strong>
                        ${
                            item.message
                                ? escapeHTML(
                                    item.message
                                )
                                : "Nenhuma observação"
                        }
                    </strong>

                </div>

            </div>


            <div class="admin-modal-actions">

                ${
                    item.status ===
                    "pending"
                        ? `

                            <button
                                type="button"
                                class="admin-modal-confirm"
                                id="modalConfirmAppointment"
                            >
                                <i class="fa-solid fa-check"></i>
                                Confirmar
                            </button>

                        `
                        : ""
                }


                ${
                    item.status ===
                    "confirmed"
                        ? `

                            <button
                                type="button"
                                class="admin-modal-confirm"
                                id="modalCompleteAppointment"
                            >
                                <i class="fa-solid fa-star"></i>
                                Marcar como realizado
                            </button>

                        `
                        : ""
                }


                ${
                    item.status !==
                    "cancelled"
                        ? `

                            <button
                                type="button"
                                class="admin-modal-cancel"
                                id="modalCancelAppointment"
                            >
                                <i class="fa-solid fa-xmark"></i>
                                Cancelar
                            </button>

                        `
                        : ""
                }

            </div>

        `;


        appointmentModal.classList.add(
            "active"
        );


        appointmentModal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";


        const confirmButton =
            document.getElementById(
                "modalConfirmAppointment"
            );


        const completeButton =
            document.getElementById(
                "modalCompleteAppointment"
            );


        const cancelButton =
            document.getElementById(
                "modalCancelAppointment"
            );


        if (confirmButton) {

            confirmButton.addEventListener(
                "click",
                async () => {

                    await confirmAppointment(
                        id
                    );

                    closeModal();

                }
            );

        }


        if (completeButton) {

            completeButton.addEventListener(
                "click",
                async () => {

                    await completeAppointment(
                        id
                    );

                    closeModal();

                }
            );

        }


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                async () => {

                    await cancelAppointment(
                        id
                    );

                    closeModal();

                }
            );

        }

    }


    function closeModal() {

        if (!appointmentModal) {
            return;
        }


        appointmentModal.classList.remove(
            "active"
        );


        appointmentModal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.style.overflow =
            "";

    }


    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeModal
        );

    }


    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            closeModal
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeModal();
                closeSidebar();

            }

        }
    );


    /* =====================================================
       CONFIRMAR
    ===================================================== */

    async function confirmAppointment(id) {

        if (!db) {
            return;
        }


        try {

            await db
                .collection(
                    "appointments"
                )
                .doc(id)
                .update({

                    status:
                        "confirmed",

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });


            showToast(
                "Agendamento confirmado com sucesso."
            );


            await loadAppointments();

        } catch (error) {

            console.error(
                "Erro ao confirmar:",
                error
            );


            showToast(
                "Não foi possível confirmar."
            );

        }

    }


    /* =====================================================
       CONCLUIR
    ===================================================== */

    async function completeAppointment(id) {

        if (!db) {
            return;
        }


        try {

            await db
                .collection(
                    "appointments"
                )
                .doc(id)
                .update({

                    status:
                        "completed",

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });


            showToast(
                "Atendimento marcado como realizado."
            );


            await loadAppointments();

        } catch (error) {

            console.error(
                "Erro ao concluir:",
                error
            );


            showToast(
                "Não foi possível atualizar."
            );

        }

    }


    /* =====================================================
       CANCELAR + LIBERAR HORÁRIO
    ===================================================== */

    async function cancelAppointment(id) {

        const appointment =
            appointments.find(
                item =>
                    item.id === id
            );


        if (
            !appointment ||
            !db
        ) {
            return;
        }


        const confirmed =
            window.confirm(
                `Cancelar o agendamento de ${appointment.clientName}? O horário ficará disponível novamente.`
            );


        if (!confirmed) {
            return;
        }


        try {

            const batch =
                db.batch();


            const appointmentRef =
                db
                    .collection(
                        "appointments"
                    )
                    .doc(id);


            const availabilityRef =
                db
                    .collection(
                        "availability"
                    )
                    .doc(
                        appointment.slotId ||
                        id
                    );


            batch.update(
                appointmentRef,
                {

                    status:
                        "cancelled",

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                }
            );


            /*
             * Excluímos o documento de disponibilidade.
             * Assim o horário volta a aparecer para clientes.
             */

            batch.delete(
                availabilityRef
            );


            await batch.commit();


            showToast(
                "Agendamento cancelado e horário liberado."
            );


            await loadAppointments();

        } catch (error) {

            console.error(
                "Erro ao cancelar:",
                error
            );


            showToast(
                "Não foi possível cancelar."
            );

        }

    }


    /* =====================================================
       ATUALIZAR
    ===================================================== */

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async () => {

                await loadAppointments();

                showToast(
                    "Informações atualizadas."
                );

            }
        );

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                if (!auth) {
                    return;
                }


                const confirmed =
                    window.confirm(
                        "Deseja sair do painel administrativo?"
                    );


                if (!confirmed) {
                    return;
                }


                try {

                    await auth.signOut();


                    window.location.href =
                        "admin-login.html";

                } catch (error) {

                    console.error(
                        "Erro no logout:",
                        error
                    );

                }

            }
        );

    }


    /* =====================================================
       AUTENTICAÇÃO
    ===================================================== */

    function initializeAuthentication() {

        if (!auth) {

            console.error(
                "Firebase Authentication não conectado."
            );


            hideLoader();

            return;

        }


        auth.onAuthStateChanged(
            async user => {

                if (!user) {

                    window.location.href =
                        "admin-login.html";

                    return;

                }


                currentUser =
                    user;


                if (adminUserName) {

                    adminUserName.textContent =
                        user.displayName ||
                        "Samira";

                }


                if (adminUserEmail) {

                    adminUserEmail.textContent =
                        user.email ||
                        "Administradora";

                }


                await loadAppointments();


                hideLoader();

            }
        );

    }


    /* =====================================================
       INICIALIZAÇÃO
    ===================================================== */

    initializeAuthentication();

});
