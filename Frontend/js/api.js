/**
 * CSRevolus Bank - Digital Banking Frontend
 * Centralized API Integration Service
 *
 * Live mode:
 * - Uses the real Express backend only.
 * - No simulated data or endpoint fallbacks.
 *
 * Demo mode:
 * - Uses isolated browser-stored simulation data.
 * - Never sends simulated requests to the live backend.
 */

class BankingApi {
    constructor() {
        this.baseUrl = localStorage.getItem("nibss_api_base_url") || "http://localhost:3000";
        this.token = localStorage.getItem("nibss_auth_token") || null;
        this.currentUser = this._loadStoredUser();
        this.demoMode = localStorage.getItem("nibss_demo_mode") === "true";
    }

    _loadStoredUser() {
        try {
            const rawUser = localStorage.getItem("nibss_auth_user");
            if (!rawUser) return null;
            return JSON.parse(rawUser);
        } catch (error) {
            localStorage.removeItem("nibss_auth_user");
            return null;
        }
    }

    setBaseUrl(url) {
        this.baseUrl = String(url || "").trim().replace(/\/+$/, "");
        localStorage.setItem("nibss_api_base_url", this.baseUrl);
    }

    setToken(token, user = null) {
        this.token = token || null;

        if (this.token) {
            localStorage.setItem("nibss_auth_token", this.token);
        } else {
            localStorage.removeItem("nibss_auth_token");
        }

        if (user) {
            this.currentUser = user;
            localStorage.setItem("nibss_auth_user", JSON.stringify(user));
        } else if (!this.token) {
            this.currentUser = null;
            localStorage.removeItem("nibss_auth_user");
        }
    }

    setDemoMode(enabled) {
        this.demoMode = Boolean(enabled);
        localStorage.setItem("nibss_demo_mode", this.demoMode ? "true" : "false");
    }

    isDemoMode() {
        return this.demoMode === true && this.token === "demo-simulated-jwt-token";
    }

    isAuthenticated() {
        return Boolean(this.token);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const headers = {
            ...(options.headers || {})
        };

        if (options.body !== undefined) {
            headers["Content-Type"] = headers["Content-Type"] || "application/json";
        }

        if (this.token && !headers.Authorization) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const contentType = response.headers.get("content-type") || "";
            let data = null;

            if (contentType.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                let message = `Request failed with status ${response.status}`;

                if (typeof data === "object" && data !== null) {
                    message = data.message || data.error || (data.errors && data.errors[0]?.message) || message;
                } else if (typeof data === "string" && data.trim()) {
                    message = data;
                }

                const error = new Error(message);
                error.status = response.status;
                error.data = data;
                error.endpoint = endpoint;
                throw error;
            }

            return data;
        } catch (error) {
            if (error instanceof TypeError) {
                const networkError = new Error(
                    `Cannot reach backend at ${this.baseUrl}. Please ensure your Express server is active.`
                );
                networkError.isNetworkError = true;
                networkError.originalError = error;
                throw networkError;
            }
            throw error;
        }
    }

    // =========================================================
    // SYSTEM / GATEWAY HEALTH
    // =========================================================

    async testConnection() {
        if (this.isDemoMode()) {
            return {
                online: true,
                mode: "demo",
                message: "Instant Demo Preview Sandbox is operational"
            };
        }

        try {
            const response = await fetch(`${this.baseUrl}/api-docs/`, {
                method: "HEAD",
                headers: { Accept: "*/*" }
            });

            return {
                online: response.ok || response.status < 500,
                status: response.status,
                message: response.ok ? "Gateway Online & Reachable" : `Gateway responded with HTTP ${response.status}`
            };
        } catch (error) {
            return {
                online: false,
                status: 0,
                message: `Gateway unreachable at ${this.baseUrl}`
            };
        }
    }

    // =========================================================
    // AUTHENTICATION
    // =========================================================

    async register(name, email, password) {
        this.setDemoMode(false);
        return await this.request("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password })
        });
    }

    async login(email, password) {
        this.setDemoMode(false);
        const data = await this.request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        if (data && data.token) {
            this.setToken(data.token, data.customer || { email });
        }

        return data;
    }

    logout() {
        this.setDemoMode(false);
        this.setToken(null, null);
    }

    // =========================================================
    // CUSTOMER PROFILE
    // =========================================================

    async getProfile() {
        if (this.isDemoMode()) {
            return {
                customer: this.currentUser || {
                    name: "Chisom Sophy",
                    email: "sophy@tsacademyonline.com"
                }
            };
        }

        const data = await this.request("/api/customers/me");

        if (data && data.customer) {
            this.currentUser = {
                ...this.currentUser,
                ...data.customer
            };
            localStorage.setItem("nibss_auth_user", JSON.stringify(this.currentUser));
        }

        return data;
    }

    // =========================================================
    // KYC (BVN & NIN)
    // =========================================================

    async getKycStatus() {
        if (this.isDemoMode()) {
            const demoKyc = this._getDemoStorage("kyc_status", {
                bvnVerified: true,
                ninVerified: true
            });
            return { status: demoKyc };
        }

        return await this.request("/api/kyc/status");
    }

    async verifyBvn(bvnData) {
        const payload = typeof bvnData === "object" ? bvnData : { bvn: bvnData };

        if (this.isDemoMode()) {
            const current = this._getDemoStorage("kyc_status", {
                bvnVerified: true,
                ninVerified: true
            });
            this._setDemoStorage("kyc_status", {
                ...current,
                bvnVerified: true
            });
            return {
                message: "BVN verified successfully (Demo Sandbox)",
                result: { bvn: payload.bvn, status: "VERIFIED" }
            };
        }

        return await this.request("/api/kyc/bvn", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    }

    async verifyNin(ninData) {
        const payload = typeof ninData === "object" ? ninData : { nin: ninData };

        if (this.isDemoMode()) {
            const current = this._getDemoStorage("kyc_status", {
                bvnVerified: true,
                ninVerified: true
            });
            this._setDemoStorage("kyc_status", {
                ...current,
                ninVerified: true
            });
            return {
                message: "NIN verified successfully (Demo Sandbox)",
                result: { nin: payload.nin, status: "VERIFIED" }
            };
        }

        return await this.request("/api/kyc/nin", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    }

    // =========================================================
    // ACCOUNTS
    // =========================================================

    async createAccount(accountData = {}) {
        const { accountType = "savings", kycType, kycID, dob } = accountData;

        if (this.isDemoMode()) {
            return this._mockCreateAccount(accountType);
        }

        return await this.request("/api/accounts", {
            method: "POST",
            body: JSON.stringify({
                accountType,
                kycType,
                kycID,
                dob
            })
        });
    }

    async getAccounts() {
        if (this.isDemoMode()) {
            return this._mockGetAccounts();
        }

        const data = await this.request("/api/accounts");

        if (data && Array.isArray(data.accounts)) {
            return data.accounts;
        }
        if (Array.isArray(data)) {
            return data;
        }
        return [];
    }

    async getAccountByNumber(accountNumber) {
        if (this.isDemoMode()) {
            const accounts = this._mockGetAccounts();
            const found = accounts.find(a => a.accountNumber === accountNumber || a.account_number === accountNumber);
            if (!found) throw new Error("Account not found in demo storage");
            return found;
        }

        return await this.request(`/api/accounts/${encodeURIComponent(accountNumber)}`);
    }

    async getAccountBalance(accountNumber) {
        if (this.isDemoMode()) {
            const accounts = this._mockGetAccounts();
            const account = accounts.find(a => a.accountNumber === accountNumber || a.account_number === accountNumber);
            return {
                accountNumber,
                balance: account ? account.balance : 15000
            };
        }

        return await this.request(`/api/accounts/${encodeURIComponent(accountNumber)}/balance`);
    }

    /*
     * Note: In Live mode, recipient validation is handled natively by NIBSS
     * within the transfer workflow. Demo mode retains simulated preview.
     */
    async nameEnquiry(accountNumber) {
        if (this.isDemoMode()) {
            return this._mockNameEnquiry(accountNumber);
        }

        throw new Error("Recipient verification is performed by NIBSS during transfer authorization.");
    }

    // =========================================================
    // TRANSFERS
    // =========================================================

    async transferFunds(transferData) {
        const payload = {
            fromAccount: String(transferData.fromAccount).trim(),
            toAccount: String(transferData.toAccount).trim(),
            amount: Number(transferData.amount)
        };

        if (this.isDemoMode()) {
            return this._mockTransfer(payload);
        }

        return await this.request("/api/transactions/transfer", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    }

    // =========================================================
    // TRANSACTIONS
    // =========================================================

    async getTransactions() {
        if (this.isDemoMode()) {
            return this._mockGetTransactions();
        }

        const data = await this.request("/api/transactions");

        if (data && Array.isArray(data.transactions)) {
            return data.transactions;
        }
        if (Array.isArray(data)) {
            return data;
        }
        return [];
    }

    async getTransactionById(transactionId) {
        if (this.isDemoMode()) {
            const transactions = this._mockGetTransactions();
            const found = transactions.find(t =>
                String(t.transaction_id || t.transactionId) === String(transactionId)
            );
            return found || null;
        }

        const data = await this.request(`/api/transactions/${encodeURIComponent(transactionId)}`);

        if (data && data.transaction) {
            return data.transaction;
        }
        return data;
    }

    // =========================================================
    // DEMO LOCAL STORAGE ENGINE
    // =========================================================

    _getDemoStorage(key, defaultValue) {
        try {
            const data = localStorage.getItem(`nibss_demo_${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    }

    _setDemoStorage(key, value) {
        localStorage.setItem(`nibss_demo_${key}`, JSON.stringify(value));
    }

    _mockGetAccounts() {
        const stored = this._getDemoStorage("accounts", null);
        if (Array.isArray(stored) && stored.length > 0) {
            return stored;
        }

        const initial = [
            {
                id: 1,
                account_number: "1084071287",
                accountNumber: "1084071287",
                account_type: "SAVINGS",
                accountType: "SAVINGS",
                bank_name: "CSREVOLUS BANK",
                bankName: "CSREVOLUS BANK",
                balance: 15000.00,
                created_at: new Date().toISOString()
            }
        ];

        this._setDemoStorage("accounts", initial);
        return initial;
    }

    _mockCreateAccount(accountType) {
        const accounts = this._mockGetAccounts();
        const randomDigits = Math.floor(1000000 + Math.random() * 9000000);
        const accNum = `108${randomDigits}`;
        const typeNormalized = (accountType || "SAVINGS").toUpperCase();

        const newAccount = {
            id: accounts.length + 1,
            account_number: accNum,
            accountNumber: accNum,
            account_type: typeNormalized,
            accountType: typeNormalized,
            bank_name: "CSREVOLUS BANK",
            bankName: "CSREVOLUS BANK",
            balance: 15000.00,
            created_at: new Date().toISOString()
        };

        accounts.push(newAccount);
        this._setDemoStorage("accounts", accounts);
        return {
            message: "Account created successfully",
            result: {
                account: newAccount
            }
        };
    }

    _mockNameEnquiry(accountNumber) {
        const knownAccounts = {
            "1084071287": { accountName: "Onyekachi Obute", bankName: "KAC Bank 9263" },
            "1087207670": { accountName: "John Oloruntobi", bankName: "Phoenix Apex Bank" },
            "1089921443": { accountName: "Chisom Sophy", bankName: "TS Federal Trust" }
        };

        if (knownAccounts[accountNumber]) {
            return {
                accountNumber,
                accountName: knownAccounts[accountNumber].accountName,
                bankName: knownAccounts[accountNumber].bankName
            };
        }

        return {
            accountNumber,
            accountName: "Verified NIBSS Customer",
            bankName: "Interbank Partner Institution"
        };
    }

    _mockGetTransactions() {
        const stored = this._getDemoStorage("transactions", null);
        if (Array.isArray(stored)) {
            return stored;
        }

        const defaultTransactions = [
            {
                id: 1,
                transaction_id: "TX" + (Date.now() - 86400000),
                transactionId: "TX" + (Date.now() - 86400000),
                from_account_id: "NIBSS-CENTRAL-SETTLEMENT",
                fromAccount: "NIBSS-CENTRAL-SETTLEMENT",
                to_account_number: "1084071287",
                toAccount: "1084071287",
                amount: 15000.00,
                status: "SUCCESS",
                remarks: "Initial Account Pre-Funding",
                type: "CREDIT",
                created_at: new Date(Date.now() - 86400000).toISOString()
            }
        ];

        this._setDemoStorage("transactions", defaultTransactions);
        return defaultTransactions;
    }

    _mockTransfer(data) {
        const accounts = this._mockGetAccounts();
        const sender = accounts.find(a => (a.accountNumber || a.account_number) === data.fromAccount);

        if (!sender) {
            const error = new Error("Sender account not found in demo storage.");
            error.status = 404;
            throw error;
        }

        if (sender.balance < data.amount) {
            const error = new Error("Insufficient funds for transfer");
            error.status = 400;
            throw error;
        }

        sender.balance -= data.amount;
        this._setDemoStorage("accounts", accounts);

        const transactions = this._mockGetTransactions();
        const txnRef = "TX" + Date.now();
        const newTransaction = {
            id: transactions.length + 1,
            transaction_id: txnRef,
            transactionId: txnRef,
            from_account_id: data.fromAccount,
            fromAccount: data.fromAccount,
            to_account_number: data.toAccount,
            toAccount: data.toAccount,
            amount: data.amount,
            status: "SUCCESS",
            remarks: "Interbank Funds Transfer",
            type: "DEBIT",
            created_at: new Date().toISOString()
        };

        transactions.unshift(newTransaction);
        this._setDemoStorage("transactions", transactions);

        return {
            message: "Transfer successful",
            result: {
                transaction: newTransaction,
                nibss: {
                    reference: txnRef,
                    status: "SUCCESSFUL",
                    senderAccount: data.fromAccount,
                    recipientAccount: data.toAccount,
                    amount: data.amount
                }
            }
        };
    }
}

window.bankingApi = new BankingApi();