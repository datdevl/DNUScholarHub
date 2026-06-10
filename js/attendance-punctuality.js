/**
 * Quy tắc Kịp / Trễ — dùng chung điểm danh & quản lý
 * Sáng: 06:15 – 07:30 | Chiều: 12:15 – 13:15 → Kịp; còn lại → Trễ
 */
const AttendancePunctuality = (function () {
    const MORNING_START_MIN = 6 * 60 + 15;
    const MORNING_END_MIN = 7 * 60 + 30;
    const AFTERNOON_START_MIN = 12 * 60 + 15;
    const AFTERNOON_END_MIN = 13 * 60 + 15;

    function parseViDateTime(raw) {
        const v = (raw || "").toString().trim();
        const m = v.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}).*?(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (!m) {
            const d = new Date(v);
            return Number.isNaN(d.getTime()) ? null : d;
        }
        return new Date(
            Number(m[3]),
            Number(m[2]) - 1,
            Number(m[1]),
            Number(m[4]),
            Number(m[5]),
            Number(m[6] || 0)
        );
    }

    function normalizeSession(sessionText, hour) {
        const s = (sessionText || "").toLowerCase();
        if (s.includes("sáng") || s.includes("sang")) return "morning";
        if (s.includes("chiều") || s.includes("chieu")) return "afternoon";
        if (hour >= 5 && hour < 11) return "morning";
        if (hour >= 11 && hour < 18) return "afternoon";
        return "unknown";
    }

    function getPunctualStatus(timeText, sessionText) {
        const dt = parseViDateTime(timeText);
        if (!dt) {
            return { key: "late", label: "Trễ", sheetStatus: "🟠 Trễ", cls: "late" };
        }
        const mins = dt.getHours() * 60 + dt.getMinutes();
        const session = normalizeSession(sessionText, dt.getHours());

        function inMorning() {
            return mins >= MORNING_START_MIN && mins <= MORNING_END_MIN;
        }
        function inAfternoon() {
            return mins >= AFTERNOON_START_MIN && mins <= AFTERNOON_END_MIN;
        }

        let onTime = false;
        if (session === "morning") onTime = inMorning();
        else if (session === "afternoon") onTime = inAfternoon();
        else onTime = inMorning() || inAfternoon();

        if (onTime) {
            return { key: "onTime", label: "Kịp", sheetStatus: "🟢 Kịp", cls: "ok" };
        }
        return { key: "late", label: "Trễ", sheetStatus: "🟠 Trễ", cls: "late" };
    }

    function getPunctualStatusNow(sessionText) {
        const now = new Date();
        const timeText = now.toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            hour12: false
        });
        return getPunctualStatus(timeText, sessionText);
    }

    function getWorkSession(date) {
        const d = date || new Date();
        return d.getHours() < 12 ? "Sáng" : "Chiều";
    }

    return {
        getPunctualStatus,
        getPunctualStatusNow,
        getWorkSession,
        parseViDateTime,
        normalizeSession
    };
})();

window.AttendancePunctuality = AttendancePunctuality;
window.getPunctualStatus = AttendancePunctuality.getPunctualStatus;
