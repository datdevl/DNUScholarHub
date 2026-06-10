/**
 * Đánh dấu nav link active theo trang hiện tại
 */
document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.getAttribute("data-page");
    if (!page) return;
    const links = document.querySelectorAll("[data-nav]");
    for (let i = 0; i < links.length; i++) {
        if (links[i].getAttribute("data-nav") === page) {
            links[i].classList.add("active", "fw-semibold");
        }
    }
});
