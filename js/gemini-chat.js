/**
 * ScholarHub - AI Chat Integration (via OpenRouter)
 * Gọi AI miễn phí từ client
 */

var GeminiChat = (function () {
    var DEFAULT_API_KEY = "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";
    var API_KEY = localStorage.getItem("scholarhub_ai_apikey") || DEFAULT_API_KEY;
    var API_URL = "https://openrouter.ai/api/v1/chat/completions";
    // Sử dụng model miễn phí từ OpenRouter
    var DEFAULT_MODEL = "openrouter/free";
    var MODEL_ID = localStorage.getItem("scholarhub_ai_model") || DEFAULT_MODEL;

    var conversationHistory = [];

    var SYSTEM_PROMPT = [
        "Bạn là ScholarBot — trợ lý AI thông minh của ScholarHub, nền tảng chia sẻ tài liệu học tập trực tuyến dành cho sinh viên Trường Đại học Đại Nam (DNU).",
        "",
        "## Thông tin về ScholarHub:",
        "- Website chia sẻ tài liệu học tập: đề thi, slide bài giảng, ghi chép, tài liệu tham khảo",
        "- Thuộc Khoa Công nghệ Thông tin (FIT) - Trường Đại học Đại Nam",
        "- Địa chỉ: Số 1 Phố Xốm, Hà Đông, Hà Nội",
        "- Phát triển bởi: Nhóm 11 FIT-DNU",
        "",
        "## Các tính năng chính:",
        "1. **Kho tài liệu**: Tìm kiếm, tải tài liệu",
        "2. **Tài liệu VIP**: Mua bằng Xu",
        "3. **Hệ thống Xu**: Đăng ký nhận 50 Xu, upload +10 Xu",
        "4. **Điểm danh Face ID (EduAttend)**: Điểm danh bằng khuôn mặt",
        "5. **Bảng xếp hạng**: Rank theo Xu hoặc điểm tích lũy",
        "",
        "## Môn học tiêu biểu:",
        "- FIT201 (CTDL & GT), MATH101 (Giải tích 1), FIT302 (OOP), FIT303 (CSDL)",
        "",
        "## Hướng dẫn trả lời:",
        "- Trả lời bằng tiếng Việt, cực kỳ thân thiện, xưng mình/bạn.",
        "- Giữ câu trả lời siêu ngắn gọn, trực diện (không dài dòng).",
        "- Dùng emoji vui vẻ.",
        "- Nếu người dùng hỏi cách làm gì, chỉ họ bấm vào menu trên website."
    ].join("\n");

    // Khởi tạo context với system prompt
    conversationHistory.push({ role: "system", content: SYSTEM_PROMPT });

    function enrichWithContext(userMessage) {
        var extra = "";
        try {
            var user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
            if (user && user.id) {
                extra = " [Thông tin User đang đăng nhập: " + (user.ho_ten || user.ten_dang_nhap) + ", Xu: " + (user.so_xu || 0) + "]";
            }
        } catch (e) {}
        return userMessage + extra;
    }

    function sendMessage(userMessage, onSuccess, onError) {
        var enrichedMessage = enrichWithContext(userMessage);

        var requestMessages = conversationHistory.slice();
        requestMessages.push({ role: "user", content: enrichedMessage });

        var body = {
            model: MODEL_ID,
            messages: requestMessages,
            temperature: 0.7,
            max_tokens: 500
        };

        var xhr = new XMLHttpRequest();
        xhr.open("POST", API_URL, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer " + API_KEY);
        // Bắt buộc cho OpenRouter free tier
        xhr.setRequestHeader("HTTP-Referer", window.location.href);
        xhr.setRequestHeader("X-Title", "ScholarHub");

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;

            if (xhr.status === 200) {
                try {
                    var resp = JSON.parse(xhr.responseText);
                    var text = resp.choices && resp.choices[0] && resp.choices[0].message && resp.choices[0].message.content;

                    if (text) {
                        conversationHistory.push({ role: "user", content: userMessage });
                        conversationHistory.push({ role: "assistant", content: text });

                        // Giới hạn bộ nhớ tránh dài quá (chừa lại câu system đầu tiên)
                        if (conversationHistory.length > 21) {
                            var systemMsg = conversationHistory[0];
                            var recentMsgs = conversationHistory.slice(-16);
                            conversationHistory = [systemMsg].concat(recentMsgs);
                        }

                        onSuccess(text);
                    } else {
                        onError("Không nhận được phản hồi từ AI.");
                    }
                } catch (e) {
                    onError("Lỗi xử lý phản hồi AI.");
                }
            } else {
                var errMsg = "Lỗi kết nối AI (Mã lỗi: " + xhr.status + ")";
                try {
                    var errResp = JSON.parse(xhr.responseText);
                    if (errResp.error && errResp.error.message) {
                        errMsg = errResp.error.message;
                    }
                } catch (e) {}
                onError(errMsg);
            }
        };

        xhr.onerror = function () {
            onError("Không thể kết nối tới AI. Vui lòng kiểm tra mạng.");
        };

        xhr.send(JSON.stringify(body));
    }

    function formatResponse(text) {
        var html = text;
        html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
        html = html.replace(/`(.+?)`/g, '<code>$1</code>');
        html = html.replace(/\n/g, "<br>");
        html = html.replace(/^- /gm, "• ");
        return html;
    }

    function clearHistory() {
        conversationHistory = [{ role: "system", content: SYSTEM_PROMPT }];
    }

    function setModel(modelId) {
        MODEL_ID = modelId;
        localStorage.setItem("scholarhub_ai_model", modelId);
    }
    
    function getModel() {
        return MODEL_ID;
    }

    return {
        sendMessage: sendMessage,
        formatResponse: formatResponse,
        clearHistory: clearHistory,
        setModel: setModel,
        getModel: getModel,
        setApiKey: function(key) {
            API_KEY = key || DEFAULT_API_KEY;
            if(key) localStorage.setItem("scholarhub_ai_apikey", key);
            else localStorage.removeItem("scholarhub_ai_apikey");
        },
        getApiKey: function() { return localStorage.getItem("scholarhub_ai_apikey") || ""; }
    };
})();

window.GeminiChat = GeminiChat;
