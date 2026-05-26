/**
 * ScholarHub API - Fetch CRUD với MockAPI.io
 */
class ScholarHubAPI {
    constructor() {
        const base = SCHOLARHUB_CONFIG.API_BASE;
        const ep = SCHOLARHUB_CONFIG.ENDPOINTS;
        this.urls = {
            documents: `${base}/${ep.documents}`,
            subjects: `${base}/${ep.subjects}`,
            users: `${base}/${ep.users}`
        };
    }

    /**
     * @param {string} url
     * @param {RequestInit} options
     * @returns {Promise<unknown>}
     */
    request(url, options = {}) {
        const defaults = {
            headers: { "Content-Type": "application/json" }
        };
        return fetch(url, { ...defaults, ...options })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                if (response.status === 204) {
                    return null;
                }
                return response.json();
            })
            .catch(function (error) {
                console.error("[ScholarHub API]", error);
                throw error;
            });
    }

    getUrl(resource) {
        return this.urls[resource] || null;
    }

    /* ---------- DOCUMENTS ---------- */
    getAllDocuments() {
        return this.request(this.urls.documents);
    }

    getDocumentById(id) {
        return this.request(`${this.urls.documents}/${id}`);
    }

    createDocument(data) {
        return this.request(this.urls.documents, {
            method: "POST",
            body: JSON.stringify(data)
        });
    }

    updateDocument(id, data) {
        return this.request(`${this.urls.documents}/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        });
    }

    deleteDocument(id) {
        return this.request(`${this.urls.documents}/${id}`, { method: "DELETE" });
    }

    /** Đếm lượt xem bằng PUT API */
    incrementView(id) {
        const self = this;
        return this.getDocumentById(id).then(function (doc) {
            const views = (Number(doc.so_luot_xem) || 0) + 1;
            return self.updateDocument(id, { ...doc, so_luot_xem: views });
        });
    }

    incrementDownload(id) {
        const self = this;
        return this.getDocumentById(id).then(function (doc) {
            const downloads = (Number(doc.so_luot_tai) || 0) + 1;
            return self.updateDocument(id, { ...doc, so_luot_tai: downloads });
        });
    }

    /* ---------- SUBJECTS ---------- */
    getAllSubjects() {
        return this.request(this.urls.subjects);
    }

    getSubjectById(id) {
        return this.request(`${this.urls.subjects}/${id}`);
    }

    createSubject(data) {
        return this.request(this.urls.subjects, {
            method: "POST",
            body: JSON.stringify(data)
        });
    }

    updateSubject(id, data) {
        return this.request(`${this.urls.subjects}/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        });
    }

    deleteSubject(id) {
        return this.request(`${this.urls.subjects}/${id}`, { method: "DELETE" });
    }

    /* ---------- USERS ---------- */
    getAllUsers() {
        return this.request(this.urls.users);
    }

    getUserById(id) {
        return this.request(`${this.urls.users}/${id}`);
    }

    createUser(data) {
        return this.request(this.urls.users, {
            method: "POST",
            body: JSON.stringify(data)
        });
    }

    updateUser(id, data) {
        return this.request(`${this.urls.users}/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        });
    }

    deleteUser(id) {
        return this.request(`${this.urls.users}/${id}`, { method: "DELETE" });
    }
}

const api = new ScholarHubAPI();
window.api = api;
