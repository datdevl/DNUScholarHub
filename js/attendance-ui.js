/** Debounce cập nhật DOM trợ lý AI — tránh nhảy liên tục */
const AttendanceUiThrottle = (function () {
    let lastLiveHtml = "";
    let lastHudKey = "";

    function setLiveStatusHtml(html) {
        if (html === lastLiveHtml) return;
        lastLiveHtml = html;
        const el = document.getElementById("liveStatus");
        if (el) el.innerHTML = html;
    }

    function shouldUpdateHud(key) {
        if (key === lastHudKey) return false;
        lastHudKey = key;
        return true;
    }

    function reset() {
        lastLiveHtml = "";
        lastHudKey = "";
    }

    return { setLiveStatusHtml, shouldUpdateHud, reset };
})();
