addEventListener("load", function () {
    var extLinks = document.querySelector("#external-links"),
        extLinksBottomPos,
        colorDivs = document.querySelector(".color-divs"),
        colorDivsTopPos;

    function avoidOverlap() {
        extLinksBottomPos = extLinks.getBoundingClientRect().bottom;
        colorDivsTopPos = colorDivs.getBoundingClientRect().top;
        if (window.innerWidth < 1100) {
            if (colorDivsTopPos - extLinksBottomPos < 20) {
                colorDivs.style.visibility = "hidden";
            } else {
                colorDivs.style.visibility = "visible";
            }
        }
        else {
            colorDivs.style.visibility = "visible";
        }
    }

    setTimeout(function () {
        avoidOverlap();
    }, 5300);
    var sch = false;
    addEventListener("resize", function () {
        if (!sch) {
            sch = true;
            setTimeout(function () {
                sch = false;
                avoidOverlap();
            }, 500);
        }
    });
});
