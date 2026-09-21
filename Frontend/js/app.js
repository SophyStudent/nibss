/**
 * CSRevolus Bank / NIBSS Digital Banking Suite
 * Frontend Application Controller
 */

class BankingApp {
    constructor() {
        this.api = window.bankingApi;

        this.accounts = [];
        this.transactions = [];
        this.kycStatus = null;
        this.cardNumberRevealed = false;
        this.nameEnquiryTimer = null;

        // Session-cached verified KYC details to streamline account opening
        this.kycInput = {
            bvn: null,
            bvnDob: null,
            nin: null,
            ninDob: null
        };

        this.accountsLoaded = false;
        this.transactionsLoaded = false;

        this.init();
    }

    async init() {
        this.startClock();
        this.setupBaseUrlConfig();
        this.updateDemoBanner();
        this.updateAuthUi();

        if (this.api.isAuthenticated()) {
            await this.syncCustomerSession();
        } else {
            this.showSection("auth");
        }
    }

    // ============================================================
    // GENERAL UI & NAVIGATION
    // ============================================================

    startClock() {
        const clockEl = document.getElementById("liveClock");
        const update = () => {
            const now = new Date();
            if (clockEl) {
                clockEl.textContent = now.toLocaleTimeString("en-NG") + " WAT";
            }
        };
        update();
        setInterval(update, 1000);
    }

    updateDemoBanner() {
        const banner = document.getElementById("demoModeBanner");
        if (!banner) return;
        banner.style.display = this.api.isDemoMode() ? "block" : "none";

        const demoPill = document.getElementById("demoStatusPill");
        const chkDemo = document.getElementById("chkDemoMode");
        if (demoPill) {
            demoPill.textContent = this.api.isDemoMode() ? "Demo Sandbox Active" : "Live Backend Active";
            demoPill.className = `bofa-status-pill ${this.api.isDemoMode() ? "bofa-status-pending" : "bofa-status-success"}`;
        }
        if (chkDemo) {
            chkDemo.checked = this.api.isDemoMode();
        }
    }

    showSection(sectionId) {
        if (!this.api.isAuthenticated() && sectionId !== "auth" && sectionId !== "diagnostics") {
            this.showSection("auth");
            this.showToast("Please sign in to access your bank accounts.", "warning");
            return;
        }

        const sections = document.querySelectorAll(".bofa-section");
        sections.forEach(s => s.classList.remove("active"));

        const target = document.getElementById(`view-${sectionId}`);
        if (target) {
            target.classList.add("active");
        }

        const navItems = document.querySelectorAll(".bofa-nav-item");
        navItems.forEach(item => {
            if (item.dataset.section === sectionId) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });

        // Trigger view-specific data refreshes
        if (sectionId === "overview") {
            this.refreshOverview();
        } else if (sectionId === "accounts") {
            this.refreshAccounts();
        } else if (sectionId === "transfer") {
            this.setupTransferForm();
        } else if (sectionId === "kyc") {
            this.fetchKycStatus();
        } else if (sectionId === "activity") {
            this.refreshTransactions();
        } else if (sectionId === "diagnostics") {
            this.setupBaseUrlConfig();
        }
    }

    switchAuthTab(tab) {
        const loginForm = document.getElementById("loginForm");
        const registerForm = document.getElementById("registerForm");
        const tabBtnLogin = document.getElementById("tabBtnLogin");
        const tabBtnRegister = document.getElementById("tabBtnRegister");

        if (tab === "login") {
            loginForm.style.display = "block";
            registerForm.style.display = "none";
            tabBtnLogin.style.borderBottom = "2px solid var(--csr-crimson)";
            tabBtnLogin.style.color = "var(--csr-midnight-950)";
            tabBtnLogin.style.background = "white";
            tabBtnRegister.style.borderBottom = "none";
            tabBtnRegister.style.color = "#64748B";
            tabBtnRegister.style.background = "transparent";
        } else {
            loginForm.style.display = "none";
            registerForm.style.display = "block";
            tabBtnRegister.style.borderBottom = "2px solid var(--csr-crimson)";
            tabBtnRegister.style.color = "var(--csr-midnight-950)";
            tabBtnRegister.style.background = "white";
            tabBtnLogin.style.borderBottom = "none";
            tabBtnLogin.style.color = "#64748B";
            tabBtnLogin.style.background = "transparent";
        }
    }

    updateAuthUi() {
        const headerArea = document.getElementById("headerUserArea");
        const mainNav = document.getElementById("mainNav");
        if (!headerArea) return;

        if (this.api.isAuthenticated()) {
            const user = this.api.currentUser || {};
            const displayName = user.name || (user.email ? user.email.split("@")[0] : "Valued Client");
            const email = user.email || "";

            if (this.api.isDemoMode()) {
                headerArea.innerHTML = `
                    <div class="bofa-user-badge">
                        <div class="bofa-user-name">
                            ${this.escapeHtml(displayName)}
                            <span style="font-size: 0.65rem; background: #D97706; color: white; padding: 2px 6px; border-radius: 4px; vertical-align: middle; font-weight: 700;">DEMO</span>
                        </div>
                        <div class="bofa-user-email">${this.escapeHtml(email)}</div>
                    </div>
                    <button class="bofa-btn-signout" onclick="app.handleSignOut()">Exit Demo</button>
                `;
            } else {
                headerArea.innerHTML = `
                    <div class="bofa-user-badge">
                        <div class="bofa-user-name">${this.escapeHtml(displayName)}</div>
                        <div class="bofa-user-email">${this.escapeHtml(email)}</div>
                    </div>
                    <button class="bofa-btn-signout" onclick="app.handleSignOut()">Sign Out</button>
                `;
            }

            if (mainNav) mainNav.style.display = "flex";
        } else {
            headerArea.innerHTML = `
                <button class="bofa-btn bofa-btn-primary bofa-btn-sm" onclick="app.showSection('auth')">
                    Sign In
                </button>
            `;
            if (mainNav) mainNav.style.display = "none";
        }

        this.updateDemoBanner();
    }

    showToast(message, type = "info") {
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `bofa-toast ${type}`;
        toast.innerHTML = `
            <div>${this.escapeHtml(message)}</div>
            <button style="background: none; border: none; color: #CBD5E1; cursor: pointer; margin-left: 12px; font-size: 1.1rem; line-height: 1;" onclick="this.parentElement.remove()">&times;</button>
        `;

        container.appendChild(toast);
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 5000);
    }

    // ============================================================
    // AUTHENTICATION CONTROLLER
    // ============================================================

    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const btn = document.getElementById("loginSubmitBtn");

        try {
            btn.disabled = true;
            btn.textContent = "Authenticating...";

            await this.api.login(email, password);
            this.showToast("Authentication successful. Welcome back!", "success");
            this.updateAuthUi();
            await this.syncCustomerSession();
        } catch (error) {
            this.showToast(error.message || "Failed to sign in. Please verify credentials.", "warning");
        } finally {
            btn.disabled = false;
            btn.textContent = "Secure Client Sign In";
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;
        const btn = document.getElementById("regSubmitBtn");

        try {
            btn.disabled = true;
            btn.textContent = "Enrolling client...";

            await this.api.register(name, email, password);
            this.showToast("Registration successful. Signing into your account...", "success");

            // Auto login after registration
            await this.api.login(email, password);
            this.updateAuthUi();
            await this.syncCustomerSession();
        } catch (error) {
            this.showToast(error.message || "Registration failed. Email may already be in use.", "warning");
        } finally {
            btn.disabled = false;
            btn.textContent = "Complete Client Enrollment";
        }
    }

    handleSignOut() {
        this.api.logout();
        this.accounts = [];
        this.transactions = [];
        this.kycStatus = null;
        this.updateAuthUi();
        this.showSection("auth");
        this.showToast("You have been securely signed out.", "info");
    }

    fillTestCustomer() {
        document.getElementById("loginEmail").value = "sophy@tsacademyonline.com";
        document.getElementById("loginPassword").value = "Password123!";
        this.showToast("Sample test credentials filled.", "info");
    }

    enableDemoBypass() {
        this.api.setDemoMode(true);
        this.api.setToken("demo-simulated-jwt-token", {
            id: 999,
            name: "Chisom Sophy",
            email: "sophy@tsacademyonline.com"
        });

        this.updateAuthUi();
        this.syncCustomerSession();
        this.showToast("Instant Demo Preview activated with sandbox data.", "success");
    }

    resetDemoSession() {
        localStorage.removeItem("nibss_auth_token");
        localStorage.removeItem("nibss_auth_user");
        localStorage.removeItem("nibss_demo_mode");
        localStorage.removeItem("nibss_demo_accounts");
        localStorage.removeItem("nibss_demo_transactions");
        localStorage.removeItem("nibss_demo_kyc_status");

        this.api.token = null;
        this.api.currentUser = null;
        this.api.demoMode = false;

        this.accounts = [];
        this.transactions = [];
        this.kycStatus = null;

        this.updateAuthUi();
        this.showSection("auth");
        this.showToast("Browser session cache cleared.", "info");
    }

    async syncCustomerSession() {
        try {
            await this.api.getProfile();
            this.updateAuthUi();
        } catch (e) {
            console.warn("Could not sync profile:", e.message);
        }

        await Promise.allSettled([
            this.refreshAccounts(),
            this.fetchKycStatus(),
            this.refreshTransactions()
        ]);

        this.showSection("overview");
    }

    async refreshAllData() {
        this.showToast("Synchronizing authoritative balances with NIBSS...", "info");
        await Promise.allSettled([
            this.refreshAccounts(),
            this.fetchKycStatus(),
            this.refreshTransactions()
        ]);
        this.refreshOverview();
        this.showToast("Accounts and balances up to date.", "success");
    }

    // ============================================================
    // 1. PORTFOLIO OVERVIEW CONTROLLER
    // ============================================================

    refreshOverview() {
        const user = this.api.currentUser || {};
        const displayName = user.name || (user.email ? user.email.split("@")[0] : "Distinguished Client");
        const email = user.email || "client@csrevolus.com";

        // 1. Who am I?
        const nameEl = document.getElementById("dashCustomerName");
        const emailEl = document.getElementById("dashCustomerEmail");
        const greetingEl = document.getElementById("dashGreeting");
        if (nameEl) nameEl.textContent = displayName;
        if (emailEl) emailEl.textContent = email;
        if (greetingEl) {
            greetingEl.innerHTML = `
                <span class="bofa-status-dot"></span>
                CSRevolus Private Wealth Portal &bull; ${this.api.isDemoMode() ? "Demo Sandbox" : "Live Banking"}
            `;
        }

        // 2. What do I have? (Total balance across accounts & Primary debit card)
        const totalBalance = this.accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
        const totalBalEl = document.getElementById("dashTotalBalance");
        if (totalBalEl) {
            totalBalEl.textContent = this.formatCurrency(totalBalance);
        }

        // Update executive card
        const cardHolderEl = document.getElementById("cardHolderName");
        if (cardHolderEl) cardHolderEl.textContent = displayName.toUpperCase();

        const primaryAccount = this.accounts[0];
        const cardMaskedEl = document.getElementById("cardMaskedNumber");
        if (cardMaskedEl) {
            const accNum = primaryAccount ? (primaryAccount.accountNumber || primaryAccount.account_number || "") : "";
            if (this.cardNumberRevealed && accNum) {
                cardMaskedEl.textContent = accNum.replace(/(\d{4})/g, "$1 ").trim();
            } else if (accNum) {
                cardMaskedEl.innerHTML = "&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; " + accNum.slice(-4);
            } else {
                cardMaskedEl.innerHTML = "&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;";
            }
        }

        // 3. Is my identity verified?
        this.updateOverviewKycPill();

        // 4. What have I done recently?
        this.renderOverviewRecentTransactions();
    }

    toggleCardNumberReveal() {
        this.cardNumberRevealed = !this.cardNumberRevealed;
        this.refreshOverview();
    }

    updateOverviewKycPill() {
        const pill = document.getElementById("dashKycPill");
        const bvnStatus = document.getElementById("dashBvnStatus");
        const ninStatus = document.getElementById("dashNinStatus");

        const isBvn = Boolean(this.kycStatus?.bvnVerified || this.kycStatus?.bvn_verified);
        const isNin = Boolean(this.kycStatus?.ninVerified || this.kycStatus?.nin_verified);

        if (bvnStatus) {
            bvnStatus.textContent = isBvn ? "Verified" : "Unverified";
            bvnStatus.style.color = isBvn ? "#059669" : "var(--csr-midnight-950)";
        }
        if (ninStatus) {
            ninStatus.textContent = isNin ? "Verified" : "Unverified";
            ninStatus.style.color = isNin ? "#059669" : "var(--csr-midnight-950)";
        }

        if (!pill) return;

        if (isBvn || isNin) {
            pill.textContent = "Tier 1 - Verified";
            pill.className = "bofa-status-pill bofa-status-success";
        } else {
            pill.textContent = "Tier 0 - Pending";
            pill.className = "bofa-status-pill bofa-status-pending";
        }
    }

    renderOverviewRecentTransactions() {
        const tbody = document.getElementById("dashTxnTableBody");
        if (!tbody) return;

        if (!this.transactions || this.transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #64748B; padding: 28px;">
                        No recent transactions recorded yet.
                    </td>
                </tr>
            `;
            return;
        }

        const recent = this.transactions.slice(0, 5);
        tbody.innerHTML = recent.map(tx => {
            const id = tx.transaction_id || tx.transactionId || "TX" + tx.id;
            const dateStr = this.formatDate(tx.created_at || tx.createdAt);
            const amountStr = this.formatCurrency(tx.amount || 0);
            const status = (tx.status || "SUCCESS").toUpperCase();
            const desc = tx.remarks || `Settlement to ${tx.to_account_number || tx.toAccount || "Beneficiary"}`;

            const isSuccess = status === "SUCCESS" || status === "SUCCESSFUL";

            return `
                <tr>
                    <td>${this.escapeHtml(dateStr)}</td>
                    <td style="font-family: 'Space Grotesk', monospace; font-size: 0.8rem; font-weight: 600;">${this.escapeHtml(id)}</td>
                    <td>${this.escapeHtml(desc)}</td>
                    <td>
                        <span class="bofa-status-pill ${isSuccess ? "bofa-status-success" : "bofa-status-pending"}">
                            ${this.escapeHtml(status)}
                        </span>
                    </td>
                    <td style="text-align: right; font-weight: 700; font-family: var(--csr-font-display);">₦${amountStr}</td>
                    <td style="text-align: center;">
                        <button class="bofa-btn bofa-btn-outline bofa-btn-sm" onclick="app.viewTransactionReceipt('${this.escapeHtml(id)}')">
                            View Slip
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // ============================================================
    // 2. BANK ACCOUNTS CONTROLLER
    // ============================================================

    async refreshAccounts() {
        const grid = document.getElementById("accountsGrid");
        const alertBox = document.getElementById("accountsEndpointAlert");

        try {
            const rawAccounts = await this.api.getAccounts();

            this.accounts = (rawAccounts || []).map(acc => ({
                id: acc.id,
                accountNumber: acc.account_number || acc.accountNumber || "",
                accountType: (acc.account_type || acc.accountType || "SAVINGS").toUpperCase(),
                bankName: acc.bank_name || acc.bankName || "CSREVOLUS BANK",
                balance: Number(acc.balance || 0),
                createdAt: acc.created_at || acc.createdAt || null
            }));

            // In live mode, fetch authoritative balance for each account
            if (!this.api.isDemoMode() && this.accounts.length > 0) {
                await Promise.allSettled(
                    this.accounts.map(async acc => {
                        if (!acc.accountNumber) return;
                        try {
                            const balData = await this.api.getAccountBalance(acc.accountNumber);
                            const bal = this.extractBalance(balData);
                            if (bal !== null) acc.balance = bal;
                        } catch (e) {
                            console.warn(`Balance query failed for ${acc.accountNumber}:`, e.message);
                        }
                    })
                );
            }

            this.accountsLoaded = true;
            if (alertBox) alertBox.style.display = "none";
        } catch (error) {
            console.error("Accounts error:", error);
            this.accountsLoaded = false;
            if (alertBox) {
                alertBox.style.display = "block";
                alertBox.textContent = `Account Service: ${error.message || "Failed to load bank accounts."}`;
            }
        }

        this.renderAccountsGrid();
        this.populateSourceAccounts();
        this.refreshOverview();
    }

    extractBalance(response) {
        if (typeof response === "number") return response;
        if (typeof response === "string" && response.trim() !== "") {
            const n = Number(response);
            return Number.isFinite(n) ? n : null;
        }
        if (response && typeof response.balance !== "undefined") {
            const inner = response.balance;
            if (typeof inner === "number") return inner;
            if (typeof inner === "object" && inner !== null && typeof inner.balance !== "undefined") {
                return Number(inner.balance);
            }
            const n = Number(inner);
            return Number.isFinite(n) ? n : null;
        }
        return null;
    }

    renderAccountsGrid() {
        const grid = document.getElementById("accountsGrid");
        if (!grid) return;

        if (!this.accounts || this.accounts.length === 0) {
            grid.innerHTML = `
                <div class="bofa-card" style="grid-column: 1 / -1; padding: 40px 24px; text-align: center;">
                    <div style="width: 56px; height: 56px; border-radius: 50%; background: #F1F5F9; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                    </div>
                    <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--csr-midnight-950); margin-bottom: 8px; font-family: var(--csr-font-display);">No Bank Accounts Found</h3>
                    <p style="font-size: 0.88rem; color: #64748B; max-width: 480px; margin: 0 auto 20px;">
                        You do not have any active bank accounts linked yet. Open an account to get started with instant NIBSS routing and automatic ₦15,000 pre-funding.
                    </p>
                    <button class="bofa-btn bofa-btn-primary" onclick="app.openCreateAccountModal()">
                        Open New Bank Account
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.accounts.map(acc => {
            const accNum = acc.accountNumber || "";
            const isSavings = acc.accountType.includes("SAVING");
            const typeLabel = isSavings ? "Standard Savings Account" : "Commercial Checking Account";

            return `
                <div class="bofa-card">
                    <div class="bofa-card-header">
                        <div>
                            <span class="bofa-card-title" style="font-size: 0.95rem;">${this.escapeHtml(typeLabel)}</span>
                            <div style="font-size: 0.7rem; color: #64748B; margin-top: 2px;">CSRevolus Direct NUBAN</div>
                        </div>
                        <span class="bofa-status-pill bofa-status-success">Active</span>
                    </div>
                    <div class="bofa-card-body">
                        <div style="margin-bottom: 16px;">
                            <div style="font-size: 0.72rem; text-transform: uppercase; color: #64748B; font-weight: 600;">NUBAN Account Number</div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                                <span style="font-family: 'Space Grotesk', monospace; font-size: 1.25rem; font-weight: 700; color: var(--csr-midnight-950); letter-spacing: 0.05em;">
                                    ${this.escapeHtml(accNum)}
                                </span>
                                <button class="bofa-btn-reveal" title="Copy NUBAN" onclick="app.copyToClipboard('${this.escapeHtml(accNum)}')">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                            </div>
                        </div>

                        <div style="margin-bottom: 20px; padding: 12px 14px; background: #F8FAFC; border: 1px solid var(--csr-border); border-radius: 8px;">
                            <div style="font-size: 0.72rem; color: #64748B; font-weight: 600; text-transform: uppercase;">Available Liquid Balance</div>
                            <div style="font-family: var(--csr-font-display); font-size: 1.45rem; font-weight: 800; color: var(--csr-midnight-950);">
                                ₦${this.formatCurrency(acc.balance)}
                            </div>
                        </div>

                        <div style="display: flex; gap: 8px;">
                            <button class="bofa-btn bofa-btn-primary bofa-btn-sm" style="flex: 1;" onclick="app.startTransferFrom('${this.escapeHtml(accNum)}')">
                                Transfer
                            </button>
                            <button class="bofa-btn bofa-btn-outline bofa-btn-sm" onclick="app.syncSingleAccountBalance('${this.escapeHtml(accNum)}')">
                                Sync Balance
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    async syncSingleAccountBalance(accNumber) {
        try {
            this.showToast(`Syncing balance for ${accNumber}...`, "info");
            const balData = await this.api.getAccountBalance(accNumber);
            const bal = this.extractBalance(balData);
            if (bal !== null) {
                const target = this.accounts.find(a => a.accountNumber === accNumber);
                if (target) target.balance = bal;
                this.renderAccountsGrid();
                this.refreshOverview();
                this.showToast(`Account ${accNumber} balance updated: ₦${this.formatCurrency(bal)}`, "success");
            }
        } catch (e) {
            this.showToast(e.message || "Failed to update balance.", "warning");
        }
    }

    startTransferFrom(accNumber) {
        this.showSection("transfer");
        const select = document.getElementById("transferFromAccount");
        if (select) {
            select.value = accNumber;
            this.onTransferSourceChanged();
        }
    }

    // Modal Create Account
    openCreateAccountModal() {
        const modal = document.getElementById("createAccountModal");
        if (!modal) return;

        // Auto-fill KYC info from session if verified
        const kycTypeSelect = document.getElementById("newAccountKycType");
        const kycIdInput = document.getElementById("newAccountKycId");
        const dobInput = document.getElementById("newAccountDob");
        const notice = document.getElementById("createAccountKycNotice");

        const hasBvn = Boolean(this.kycInput.bvn);
        const hasNin = Boolean(this.kycInput.nin);

        if (hasBvn) {
            if (kycTypeSelect) kycTypeSelect.value = "bvn";
            if (kycIdInput) kycIdInput.value = this.kycInput.bvn;
            if (dobInput && this.kycInput.bvnDob) dobInput.value = this.kycInput.bvnDob;
        } else if (hasNin) {
            if (kycTypeSelect) kycTypeSelect.value = "nin";
            if (kycIdInput) kycIdInput.value = this.kycInput.nin;
            if (dobInput && this.kycInput.ninDob) dobInput.value = this.kycInput.ninDob;
        }

        const isVerified = Boolean(this.kycStatus?.bvnVerified || this.kycStatus?.ninVerified || this.kycStatus?.bvn_verified || this.kycStatus?.nin_verified);
        if (notice) {
            notice.style.display = isVerified ? "none" : "block";
        }

        modal.classList.add("active");
    }

    closeCreateAccountModal(event) {
        if (event && event.target !== event.currentTarget) return;
        const modal = document.getElementById("createAccountModal");
        if (modal) modal.classList.remove("active");
    }

    onModalKycTypeChange(type) {
        const label = document.getElementById("modalKycIdLabel");
        if (label) {
            label.textContent = type === "bvn" ? "11-Digit BVN" : "11-Digit NIN";
        }
    }

    async handleCreateAccount(event) {
        event.preventDefault();
        const accountType = document.getElementById("newAccountType").value;
        const kycType = document.getElementById("newAccountKycType").value;
        const kycID = document.getElementById("newAccountKycId").value.trim();
        const dob = document.getElementById("newAccountDob").value;
        const btn = document.getElementById("createAccSubmitBtn");

        if (!/^\d{11}$/.test(kycID)) {
            this.showToast("KYC ID must be exactly 11 digits.", "warning");
            return;
        }

        try {
            btn.disabled = true;
            btn.textContent = "Provisioning account...";

            const res = await this.api.createAccount({
                accountType,
                kycType,
                kycID,
                dob
            });

            this.closeCreateAccountModal();
            this.showToast("Account successfully provisioned with ₦15,000 pre-funding!", "success");
            await this.refreshAccounts();
        } catch (error) {
            this.showToast(error.message || "Failed to create bank account. Ensure KYC is verified.", "warning");
        } finally {
            btn.disabled = false;
            btn.textContent = "Confirm & Open Account";
        }
    }

    // ============================================================
    // 3. PAY & TRANSFER CONTROLLER
    // ============================================================

    setupTransferForm() {
        this.populateSourceAccounts();
        this.updateTransferReview();

        const recipientNotice = document.getElementById("transferRecipientNotice");
        const nameBadge = document.getElementById("nameEnquiryResult");
        if (recipientNotice) {
            recipientNotice.style.display = this.api.isDemoMode() ? "none" : "flex";
        }
        if (nameBadge) {
            nameBadge.style.display = "none";
        }
    }

    populateSourceAccounts() {
        const select = document.getElementById("transferFromAccount");
        if (!select) return;

        const currentVal = select.value;
        select.innerHTML = `<option value="">Select source account...</option>`;

        this.accounts.forEach(acc => {
            const accNum = acc.accountNumber || "";
            const opt = document.createElement("option");
            opt.value = accNum;
            opt.textContent = `${accNum} (${acc.accountType}) - ₦${this.formatCurrency(acc.balance)}`;
            select.appendChild(opt);
        });

        if (currentVal && this.accounts.some(a => a.accountNumber === currentVal)) {
            select.value = currentVal;
        } else if (this.accounts.length > 0) {
            select.value = this.accounts[0].accountNumber;
        }

        this.onTransferSourceChanged();
    }

    onTransferSourceChanged() {
        const select = document.getElementById("transferFromAccount");
        const hint = document.getElementById("transferSourceBalanceHint");
        if (!select || !hint) return;

        const selectedAcc = this.accounts.find(a => a.accountNumber === select.value);
        if (selectedAcc) {
            hint.textContent = `Available liquid balance: ₦${this.formatCurrency(selectedAcc.balance)}`;
        } else {
            hint.textContent = "Available balance: ₦0.00";
        }
        this.updateTransferReview();
    }

    onRecipientInput(value) {
        this.updateTransferReview();

        // In Demo mode, simulate live recipient preview
        if (this.api.isDemoMode()) {
            clearTimeout(this.nameEnquiryTimer);
            const badge = document.getElementById("nameEnquiryResult");
            const text = document.getElementById("nameEnquiryText");

            if (value.length === 10) {
                badge.style.display = "flex";
                badge.className = "bofa-name-enquiry-badge loading";
                text.textContent = "Querying NIBSS Central Switch...";

                this.nameEnquiryTimer = setTimeout(async () => {
                    try {
                        const info = await this.api.nameEnquiry(value);
                        badge.className = "bofa-name-enquiry-badge success";
                        text.textContent = `${info.accountName} (${info.bankName})`;
                    } catch (e) {
                        badge.className = "bofa-name-enquiry-badge";
                        text.textContent = "Unregistered recipient account";
                    }
                }, 400);
            } else {
                if (badge) badge.style.display = "none";
            }
        }
    }

    setTransferAmount(val) {
        const input = document.getElementById("transferAmount");
        if (input) {
            const current = Number(input.value) || 0;
            input.value = current + val;
            this.updateTransferReview();
        }
    }

    quickTransferAmount(val) {
        this.showSection("transfer");
        const input = document.getElementById("transferAmount");
        if (input) {
            input.value = val;
            this.updateTransferReview();
        }
    }

    updateTransferReview() {
        const fromVal = document.getElementById("transferFromAccount")?.value || "--";
        const toVal = document.getElementById("transferToAccount")?.value || "--";
        const amountVal = Number(document.getElementById("transferAmount")?.value) || 0;

        const rFrom = document.getElementById("reviewFromAcc");
        const rTo = document.getElementById("reviewToAcc");
        const rAmount = document.getElementById("reviewAmount");

        if (rFrom) rFrom.textContent = fromVal;
        if (rTo) rTo.textContent = toVal;
        if (rAmount) rAmount.textContent = `₦${this.formatCurrency(amountVal)}`;
    }

    async handleTransfer(event) {
        event.preventDefault();

        const fromAccount = document.getElementById("transferFromAccount").value;
        const toAccount = document.getElementById("transferToAccount").value.trim();
        const amount = Number(document.getElementById("transferAmount").value);
        const remarks = document.getElementById("transferRemarks").value.trim();
        const btn = document.getElementById("transferSubmitBtn");

        if (!fromAccount) {
            this.showToast("Please select a source debit account.", "warning");
            return;
        }
        if (!/^\d{10}$/.test(toAccount)) {
            this.showToast("Recipient NUBAN must contain exactly 10 digits.", "warning");
            return;
        }
        if (!amount || amount < 100) {
            this.showToast("Transfer amount must be at least ₦100.", "warning");
            return;
        }

        const sender = this.accounts.find(a => a.accountNumber === fromAccount);
        if (sender && sender.balance < amount) {
            this.showToast("Insufficient liquid balance for this transfer.", "warning");
            return;
        }

        try {
            btn.disabled = true;
            btn.textContent = "Authorizing settlement via NIBSS...";

            const res = await this.api.transferFunds({
                fromAccount,
                toAccount,
                amount,
                remarks
            });

            this.showToast("Transfer successfully authorized and executed!", "success");

            // Extract reference from backend structure
            const txn = res?.result?.transaction || res?.transaction || {};
            const nibss = res?.result?.nibss || res?.nibss || {};
            const ref = txn.transaction_id || txn.transactionId || nibss.reference || ("TX" + Date.now());

            // Open Receipt Modal
            this.openReceiptModal({
                reference: ref,
                status: "SUCCESSFUL",
                date: new Date().toISOString(),
                fromAccount,
                toAccount,
                amount,
                remarks: remarks || "Interbank Funds Transfer"
            });

            // Reset transfer form
            document.getElementById("transferToAccount").value = "";
            document.getElementById("transferAmount").value = "";
            document.getElementById("transferRemarks").value = "";
            this.updateTransferReview();

            // Refresh data in background
            await Promise.allSettled([
                this.refreshAccounts(),
                this.refreshTransactions()
            ]);
        } catch (error) {
            this.showToast(error.message || "Transfer execution failed. Please verify recipient NUBAN.", "warning");
        } finally {
            btn.disabled = false;
            btn.textContent = "Step 5 • Authorize & Execute Transfer";
        }
    }

    // ============================================================
    // 4. IDENTITY & KYC CONTROLLER
    // ============================================================

    async fetchKycStatus() {
        try {
            const data = await this.api.getKycStatus();
            this.kycStatus = data?.status || data || {};
        } catch (e) {
            console.warn("KYC status query failed:", e.message);
            this.kycStatus = { bvnVerified: false, ninVerified: false };
        }

        this.renderKycUi();
        this.updateOverviewKycPill();
    }

    renderKycUi() {
        const isBvn = Boolean(this.kycStatus?.bvnVerified || this.kycStatus?.bvn_verified);
        const isNin = Boolean(this.kycStatus?.ninVerified || this.kycStatus?.nin_verified);

        // Overall Tier Card
        const titleEl = document.getElementById("kycTierTitle");
        const descEl = document.getElementById("kycTierDesc");
        const badgeEl = document.getElementById("kycOverallBadge");

        if (isBvn && isNin) {
            if (titleEl) titleEl.textContent = "Tier 1 • Fully Verified Client";
            if (descEl) descEl.textContent = "Both your BVN and NIN have been verified with NIBSS and NIMC. All banking features are unlocked.";
            if (badgeEl) {
                badgeEl.textContent = "Complete Compliance";
                badgeEl.className = "bofa-status-pill bofa-status-success";
            }
        } else if (isBvn || isNin) {
            const verifiedWhat = isBvn ? "BVN" : "NIN";
            const neededWhat = isBvn ? "NIN" : "BVN";
            if (titleEl) titleEl.textContent = "Tier 1 • Verified Client";
            if (descEl) descEl.textContent = `Your ${verifiedWhat} is verified. Verify your ${neededWhat} to maximize your account tier.`;
            if (badgeEl) {
                badgeEl.textContent = "Verified";
                badgeEl.className = "bofa-status-pill bofa-status-success";
            }
        } else {
            if (titleEl) titleEl.textContent = "Tier 0 • Unverified Client";
            if (descEl) descEl.textContent = "Verify your BVN or NIN with NIBSS to unlock account opening and interbank settlement.";
            if (badgeEl) {
                badgeEl.textContent = "Action Required";
                badgeEl.className = "bofa-status-pill bofa-status-pending";
            }
        }

        // BVN Card
        const bvnFormBox = document.getElementById("bvnOutstandingContainer");
        const bvnDoneBox = document.getElementById("bvnVerifiedPanel");
        const bvnPill = document.getElementById("bvnStatusPill");

        if (isBvn) {
            if (bvnFormBox) bvnFormBox.style.display = "none";
            if (bvnDoneBox) bvnDoneBox.style.display = "block";
            if (bvnPill) {
                bvnPill.textContent = "Verified";
                bvnPill.className = "bofa-status-pill bofa-status-success";
            }
        } else {
            if (bvnFormBox) bvnFormBox.style.display = "block";
            if (bvnDoneBox) bvnDoneBox.style.display = "none";
            if (bvnPill) {
                bvnPill.textContent = "Unverified";
                bvnPill.className = "bofa-status-pill bofa-status-pending";
            }
        }

        // NIN Card
        const ninFormBox = document.getElementById("ninOutstandingContainer");
        const ninDoneBox = document.getElementById("ninVerifiedPanel");
        const ninPill = document.getElementById("ninStatusPill");

        if (isNin) {
            if (ninFormBox) ninFormBox.style.display = "none";
            if (ninDoneBox) ninDoneBox.style.display = "block";
            if (ninPill) {
                ninPill.textContent = "Verified";
                ninPill.className = "bofa-status-pill bofa-status-success";
            }
        } else {
            if (ninFormBox) ninFormBox.style.display = "block";
            if (ninDoneBox) ninDoneBox.style.display = "none";
            if (ninPill) {
                ninPill.textContent = "Unverified";
                ninPill.className = "bofa-status-pill bofa-status-pending";
            }
        }
    }

    fillSampleBvn() {
        document.getElementById("bvnInput").value = "10840712848";
        document.getElementById("bvnFirstName").value = "Chisom";
        document.getElementById("bvnLastName").value = "Abraham";
        document.getElementById("bvnDob").value = "1995-06-15";
        document.getElementById("bvnPhone").value = "08012345678";
        this.showToast("Sample BVN credentials filled.", "info");
    }

    fillSampleNin() {
        document.getElementById("ninInput").value = "10840712849";
        document.getElementById("ninFirstName").value = "Chisom";
        document.getElementById("ninLastName").value = "Abraham";
        document.getElementById("ninDob").value = "1995-06-15";
        this.showToast("Sample NIN credentials filled.", "info");
    }

    async handleVerifyBvn(event) {
        event.preventDefault();
        const bvn = document.getElementById("bvnInput").value.trim();
        const firstName = document.getElementById("bvnFirstName").value.trim();
        const lastName = document.getElementById("bvnLastName").value.trim();
        const dob = document.getElementById("bvnDob").value;
        const phone = document.getElementById("bvnPhone").value.trim();
        const btn = document.getElementById("bvnSubmitBtn");

        if (!/^\d{11}$/.test(bvn)) {
            this.showToast("BVN must contain exactly 11 digits.", "warning");
            return;
        }

        try {
            btn.disabled = true;
            btn.textContent = "Verifying with NIBSS...";

            await this.api.verifyBvn({
                bvn,
                firstName,
                lastName,
                dob,
                phone
            });

            this.kycInput.bvn = bvn;
            this.kycInput.bvnDob = dob;

            this.showToast("BVN successfully verified and registered with NIBSS!", "success");
            await this.fetchKycStatus();
        } catch (error) {
            this.showToast(error.message || "BVN verification failed.", "warning");
        } finally {
            btn.disabled = false;
            btn.textContent = "Verify BVN with NIBSS";
        }
    }

    async handleVerifyNin(event) {
        event.preventDefault();
        const nin = document.getElementById("ninInput").value.trim();
        const firstName = document.getElementById("ninFirstName").value.trim();
        const lastName = document.getElementById("ninLastName").value.trim();
        const dob = document.getElementById("ninDob").value;
        const btn = document.getElementById("ninSubmitBtn");

        if (!/^\d{11}$/.test(nin)) {
            this.showToast("NIN must contain exactly 11 digits.", "warning");
            return;
        }

        try {
            btn.disabled = true;
            btn.textContent = "Verifying with NIMC...";

            await this.api.verifyNin({
                nin,
                firstName,
                lastName,
                dob
            });

            this.kycInput.nin = nin;
            this.kycInput.ninDob = dob;

            this.showToast("NIN successfully verified with NIMC!", "success");
            await this.fetchKycStatus();
        } catch (error) {
            this.showToast(error.message || "NIN verification failed.", "warning");
        } finally {
            btn.disabled = false;
            btn.textContent = "Verify NIN with NIMC";
        }
    }

    // ============================================================
    // 5. ACTIVITY & TSQ CONTROLLER
    // ============================================================

    async refreshTransactions() {
        const tbody = document.getElementById("fullTxnTableBody");

        try {
            const raw = await this.api.getTransactions();

            // Normalize backend snake_case fields
            this.transactions = (raw || []).map(t => ({
                id: t.id,
                transaction_id: t.transaction_id || t.transactionId || ("TX" + t.id),
                from_account_id: t.from_account_id || t.fromAccount || "N/A",
                to_account_number: t.to_account_number || t.toAccount || "N/A",
                amount: Number(t.amount || 0),
                status: (t.status || "SUCCESS").toUpperCase(),
                remarks: t.remarks || "Interbank Transfer",
                created_at: t.created_at || t.createdAt || new Date().toISOString()
            }));

            // Sort newest first
            this.transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            this.transactionsLoaded = true;
        } catch (error) {
            console.error("Transactions load error:", error);
            this.transactionsLoaded = false;
        }

        this.renderTransactionsTable();
        this.renderOverviewRecentTransactions();
    }

    renderTransactionsTable() {
        const tbody = document.getElementById("fullTxnTableBody");
        if (!tbody) return;

        if (!this.transactions || this.transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; color: #64748B; padding: 32px;">
                        No transaction records found.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.transactions.map(tx => {
            const id = tx.transaction_id;
            const dateStr = this.formatDate(tx.created_at);
            const amountStr = this.formatCurrency(tx.amount);
            const status = tx.status;
            const isSuccess = status === "SUCCESS" || status === "SUCCESSFUL";

            return `
                <tr>
                    <td style="white-space: nowrap;">${this.escapeHtml(dateStr)}</td>
                    <td style="font-family: 'Space Grotesk', monospace; font-size: 0.82rem; font-weight: 600;">
                        ${this.escapeHtml(id)}
                    </td>
                    <td>${this.escapeHtml(tx.from_account_id)}</td>
                    <td>${this.escapeHtml(tx.to_account_number)}</td>
                    <td>${this.escapeHtml(tx.remarks)}</td>
                    <td>
                        <span class="bofa-status-pill ${isSuccess ? "bofa-status-success" : "bofa-status-pending"}">
                            ${this.escapeHtml(status)}
                        </span>
                    </td>
                    <td style="text-align: right; font-weight: 700; font-family: var(--csr-font-display);">₦${amountStr}</td>
                    <td style="text-align: center;">
                        <button class="bofa-btn bofa-btn-outline bofa-btn-sm" onclick="app.viewTransactionReceipt('${this.escapeHtml(id)}')">
                            View Slip
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    async lookupTsq() {
        const input = document.getElementById("tsqInput");
        const ref = input ? input.value.trim() : "";

        if (!ref) {
            this.showToast("Please enter a transaction reference to query.", "warning");
            return;
        }

        try {
            this.showToast(`Querying NIBSS Transaction Status for ${ref}...`, "info");
            const txn = await this.api.getTransactionById(ref);

            if (!txn) {
                this.showToast(`Transaction reference ${ref} not found on central switch.`, "warning");
                return;
            }

            this.openReceiptModal({
                reference: txn.transaction_id || txn.transactionId || ref,
                status: (txn.status || "SUCCESSFUL").toUpperCase(),
                date: txn.created_at || txn.createdAt || new Date().toISOString(),
                fromAccount: txn.from_account_id || txn.fromAccount || "--",
                toAccount: txn.to_account_number || txn.toAccount || "--",
                amount: txn.amount || 0,
                remarks: txn.remarks || "Settled Transfer"
            });
        } catch (e) {
            this.showToast(e.message || "Transaction Status Query failed.", "warning");
        }
    }

    viewTransactionReceipt(transactionId) {
        const match = this.transactions.find(t => t.transaction_id === transactionId || String(t.id) === String(transactionId));
        if (match) {
            this.openReceiptModal({
                reference: match.transaction_id,
                status: match.status,
                date: match.created_at,
                fromAccount: match.from_account_id,
                toAccount: match.to_account_number,
                amount: match.amount,
                remarks: match.remarks
            });
        } else {
            this.lookupTsq();
        }
    }

    // ============================================================
    // 6. OFFICIAL RECEIPT MODAL CONTROLLER
    // ============================================================

    openReceiptModal(data) {
        const modal = document.getElementById("receiptModal");
        if (!modal) return;

        document.getElementById("rcptRef").textContent = data.reference || "TX-00000000";
        document.getElementById("rcptStatus").textContent = data.status || "SUCCESSFUL";
        document.getElementById("rcptDate").textContent = this.formatDate(data.date);
        document.getElementById("rcptFrom").textContent = data.fromAccount || "--";
        document.getElementById("rcptTo").textContent = data.toAccount || "--";
        document.getElementById("rcptAmount").textContent = `₦${this.formatCurrency(data.amount || 0)}`;
        document.getElementById("rcptRemarks").textContent = data.remarks || "Interbank Funds Transfer";

        modal.classList.add("active");
    }

    closeReceiptModal(event) {
        if (event && event.target !== event.currentTarget) return;
        const modal = document.getElementById("receiptModal");
        if (modal) modal.classList.remove("active");
    }

    // ============================================================
    // 7. DEVELOPER GATEWAY CONTROLLER
    // ============================================================

    setupBaseUrlConfig() {
        const input = document.getElementById("cfgBaseUrl");
        if (input) {
            input.value = this.api.baseUrl;
        }
        this.updateDemoBanner();
    }

    async saveApiConfig() {
        const input = document.getElementById("cfgBaseUrl");
        if (!input) return;

        const newUrl = input.value.trim();
        this.api.setBaseUrl(newUrl);
        this.showToast(`API Gateway Base URL updated: ${this.api.baseUrl}`, "info");

        await this.testBackendHealth();
    }

    resetApiConfig() {
        this.api.setBaseUrl("http://localhost:3000");
        this.setupBaseUrlConfig();
        this.showToast("Reset API Base URL to default (http://localhost:3000).", "info");
    }

    async toggleDemoMode(enabled) {
        if (enabled) {
            this.enableDemoBypass();
        } else {
            this.api.setDemoMode(false);
            this.updateAuthUi();
            if (this.api.isAuthenticated()) {
                await this.syncCustomerSession();
            } else {
                this.showSection("auth");
            }
            this.showToast("Live Banking active. Using real backend API.", "info");
        }
    }

    async testBackendHealth() {
        const resultBox = document.getElementById("backendHealthResult");
        if (!resultBox) return;

        resultBox.style.display = "block";
        resultBox.style.background = "#F1F5F9";
        resultBox.style.color = "#475569";
        resultBox.textContent = "Checking gateway reachability...";

        const res = await this.api.testConnection();

        if (res.online) {
            resultBox.style.background = "#F0FDF4";
            resultBox.style.color = "#166534";
            resultBox.style.border = "1px solid #BBF7D0";
            resultBox.innerHTML = `<strong>Connected:</strong> ${this.escapeHtml(res.message)}`;
        } else {
            resultBox.style.background = "#FEF2F2";
            resultBox.style.color = "#991B1B";
            resultBox.style.border = "1px solid #FCA5A5";
            resultBox.innerHTML = `<strong>Offline:</strong> ${this.escapeHtml(res.message)}`;
        }
    }

    // ============================================================
    // UTILITIES
    // ============================================================

    formatCurrency(amount) {
        const num = Number(amount) || 0;
        return num.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    formatDate(dateStr) {
        if (!dateStr) return "--";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString("en-NG", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch (e) {
            return dateStr;
        }
    }

    escapeHtml(str) {
        if (str === null || str === undefined) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text);
            this.showToast(`Copied ${text} to clipboard.`, "success");
        } else {
            const input = document.createElement("input");
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            this.showToast(`Copied ${text} to clipboard.`, "success");
        }
    }
}

// Instantiate global app controller
window.app = new BankingApp();