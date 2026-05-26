/**
 * ScholarHub - jQuery: sự kiện, hiệu ứng, AJAX
 */
$(document).ready(function () {
    /* Navbar scroll shadow */
    $(window).on("scroll", function () {
        if ($(window).scrollTop() > 40) {
            $("#main-navbar").addClass("shadow-sm");
        } else {
            $("#main-navbar").removeClass("shadow-sm");
        }
    });

    /* Back to top - fadeIn / fadeOut */
    const $backTop = $("#back-to-top");
    if ($backTop.length) {
        $backTop.hide();
        $(window).on("scroll", function () {
            if ($(window).scrollTop() > 400) {
                $backTop.fadeIn(300);
            } else {
                $backTop.fadeOut(300);
            }
        });
        $backTop.on("click", function () {
            $("html, body").animate({ scrollTop: 0 }, 500);
        });
    }

    /* Mobile nav toggle - slideDown / slideUp */
    $("#nav-toggler").on("click", function () {
        const $menu = $("#mobile-nav-menu");
        if ($menu.is(":visible")) {
            $menu.slideUp(250);
        } else {
            $menu.slideDown(250);
        }
    });

    /* jQuery AJAX - lấy thống kê nhanh cho footer */
    if ($("#footer-doc-count").length && typeof SCHOLARHUB_CONFIG !== "undefined") {
        $.ajax({
            url: SCHOLARHUB_CONFIG.API_BASE + "/" + SCHOLARHUB_CONFIG.ENDPOINTS.documents,
            method: "GET",
            dataType: "json"
        })
            .done(function (data) {
                const approved = (data || []).filter(function (d) {
                    return (d.trang_thai || "Approved") === "Approved";
                });
                $("#footer-doc-count").html(approved.length + " tài liệu");
            })
            .fail(function () {
                $("#footer-doc-count").html("—");
            });
    }

    /* Tooltip init via jQuery attr for demo elements */
    $("[data-jq-tip]").each(function () {
        const tip = $(this).attr("data-jq-tip");
        if (tip) {
            $(this).attr("title", tip);
        }
    });
});

/**
 * jQuery append card vào grid (dùng từ main.js)
 */
function jqAppendDocCard(containerSelector, cardHtml) {
    $(containerSelector).append(cardHtml);
}

window.jqAppendDocCard = jqAppendDocCard;
