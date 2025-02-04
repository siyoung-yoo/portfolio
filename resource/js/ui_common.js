gsap.registerPlugin(ScrollTrigger);

/***** intro *****/
var fn_setIntroAnimation = function () {
    const number = document.querySelector(".txt")
    var startCount = {var: 0};

    gsap.to( startCount, {
        var: 99,
        duration: 3,
        ease: "power3.out",
        delay: 0.5,
        onUpdate: function() {
            number.innerHTML = (startCount.var).toFixed();
        }
    })

    setTimeout(function() {
		window.location.href="html/main.html"
	}, 3700)
};

/***** Cursor Custom *****/
var fn_setCommonCursor = function() {
    const cursor = document.createElement("div");
    cursor.classList.add("mouse-cursor");
    document.querySelector(".all-wrap").append(cursor);

    document.addEventListener("mousemove", e => {
        gsap.to(cursor, {duration: 0.3, left: e.pageX -15, top: e.pageY -15});
    });

    const menu = document.querySelector(".menu");
    const logo = document.querySelector(".main-logo");
    const btnMore = document.querySelector(".btn-more")
    const arrowLink = document.querySelectorAll(".work-subtext a");
    const btnBlock = document.querySelectorAll(".btn-basic");
    const btnLink = document.querySelectorAll(".about-list .btn-link");

    menu.addEventListener("mouseenter", () => {
        cursor.classList.add("active-lg");
    });
    menu.addEventListener("mouseleave", () => {
        cursor.classList.remove("active-lg");
    });

    logo.addEventListener("mouseenter", () => {
        cursor.classList.add("active-logo");
    });
    logo.addEventListener("mouseleave", () => {
        cursor.classList.remove("active-logo");
    });

    if (btnMore != null) {
        btnMore.addEventListener("mouseenter", () => {
            cursor.classList.add("active-hide");
        });
        btnMore.addEventListener("mouseleave", () => {
            cursor.classList.remove("active-hide");
        });
    }

    if (arrowLink != null) {
        arrowLink.forEach(link => {
            link.addEventListener("mouseenter", () => {
                cursor.classList.add("active-lg");
            });
            link.addEventListener("mouseleave", () => {
                cursor.classList.remove("active-lg");
            });
        })
    }

    if (btnBlock != null) {
        btnBlock.forEach(btn => {
            btn.addEventListener("mouseenter", () => {
                cursor.classList.add("active-filter");
            });
            btn.addEventListener("mouseleave", () => {
                cursor.classList.remove("active-filter");
            });
        })
    }

    if (btnLink != null) {
        btnLink.forEach(link => {
            link.addEventListener("mouseenter", () => {
                cursor.classList.add("active-filter");
            });
            link.addEventListener("mouseleave", () => {
                cursor.classList.remove("active-filter");
            });
        })
    }
}

var fn_setMainCursor = function() {
    const cursor = document.querySelector(".mouse-cursor");
    const prev = document.querySelector(".arrow-wrap-prev");
    const prevIcon = document.querySelector(".swiper-button-prev");
    const next = document.querySelector(".arrow-wrap-next");
    const nextIcon = document.querySelector(".swiper-button-next");
    prev.addEventListener("mousemove", e => {
        cursor.classList.add("active-arrow");
        gsap.to( prevIcon, {
            duration: .3,
            ease: "power3",
            left: e.offsetX - e.target.clientWidth/2,
            top: e.offsetY - e.target.clientHeight/2
        })
    });
    prev.addEventListener("mouseleave", e => {
        cursor.classList.remove("active-arrow");
        gsap.to( prevIcon, {
            duration: .3,
            ease: "power1",
            left: 0,
            top: 0
        })
    })

    next.addEventListener("mousemove", e => {
        cursor.classList.add("active-arrow");
        gsap.to( nextIcon, {
            duration: .3,
            ease: "power1",
            left: e.offsetX - e.target.clientWidth/2,
            top: e.offsetY - e.target.clientHeight/2
        })
    });
    next.addEventListener("mouseleave", e => {
        cursor.classList.remove("active-arrow");
        gsap.to( nextIcon, {
            duration: .3,
            ease: "power1",
            left: 0,
            top: 0
        })
    })

    const btnMoreWrap = document.querySelector(".btn-more-wrap")
    const btnMore = document.querySelector(".btn-more")
    btnMoreWrap.addEventListener("mousemove", e => {
        gsap.to( btnMore, {
            duration: .3,
            ease: "power1",
            left: e.offsetX - e.target.clientWidth/2,
            top: e.offsetY - e.target.clientHeight/2
        })
    });

    btnMoreWrap.addEventListener("mouseleave", e => {
        gsap.to( btnMore, {
            duration: .3,
            ease: "power3",
            left: 0,
            top: 0
        })
    });

    const pjtImg = document.querySelectorAll(".work-img img");
    document.addEventListener("mousemove", e => {
        pjtImg.forEach(img => {
            gsap.to( img , {
                duration: .2,
                x: (window.outerWidth / 2 - e.pageX) / 200,
                y: (window.innerHeight / 2 - e.pageY) / 200
            } )
        })
    })
}

var fn_setGnbHover = function() {
    new SplitType('.menu p', {
        types: 'chars',
        tagName: 'span',
    })

    const menuLink = document.querySelectorAll(".menu a");
    menuLink.forEach(menu => {
        menu.addEventListener("mouseenter", e => {
            TweenMax.staggerTo(e.target.getElementsByTagName("p")[0].querySelectorAll(".char"), 0.3, { y: "-100%", ease:Power1.easeInOut }, 0.02)
            TweenMax.staggerTo(e.target.getElementsByTagName("p")[1].querySelectorAll(".char"), 0.3, { y: "-100%", ease:Power1.easeInOut }, 0.02)
        })

        menu.addEventListener("mouseleave", e => {
            TweenMax.staggerTo(e.target.getElementsByTagName("p")[0].querySelectorAll(".char"), 0.3, { y: "0", ease:Power1.easeInOut }, 0.02)
            TweenMax.staggerTo(e.target.getElementsByTagName("p")[1].querySelectorAll(".char"), 0.3, { y: "0", ease:Power1.easeInOut }, 0.02)
        })
    })
}

var fn_menuInclude = function() {
    const menuWrap = document.createElement('div');
    menuWrap.classList.add('menu-wrap')
    document.body.appendChild(menuWrap)
    menuWrap.innerHTML = `
        <button type="button" class="btn-close">닫기버튼</button>
        <ul>
            <li data-bg="work06/work06_main.jpg">
                <a href="work06.html">AutoDigital Project</a>
            </li>
            <li data-bg="work07/work07_main.jpg">
                <a href="work07.html">Project Zaihan</a>
            </li>
            <li data-bg="work09/work09_main.jpg">
                <a href="work09.html">e-HR System</a>
            </li>
            <li data-bg="work02/work02_main.jpg">
                <a href="work02.html">MLC Platform</a>
            </li>
            <li data-bg="work01/work01_main.jpg">
                <a href="work01.html">Recruiting Site</a>
            </li>
            <li data-bg="work08/work08_main.jpg">
                <a href="work08.html">Hunet Labs</a>
            </li>
            <li data-bg="work03/work03_main.jpg">
                <a href="work03.html">Yoons ChoTong</a>
            </li>
            <li data-bg="work04/work04_main.jpg">
                <a href="work04.html">FIS System</a>
            </li>
            <li data-bg="work05/work05_main.jpg">
                <a href="work05.html">Research Portal</a>
            </li>
        </ul>`;
}

var fn_setMenuEvent = function () {
    const $menuWrap = document.querySelector(".menu-wrap");
    const $menuList = document.querySelectorAll(".menu-wrap li")
    let bgFileA, bgURLA, bgFileB, bgURLB;

    function changeBg(num) {
        bgFileA = $menuList[num].dataset.bg;
        bgURLA = "url(../resource/images/"+ bgFileA +")";
        $menuWrap.style.backgroundImage = bgURLA;

        if ( window.innerWidth < 769 ) {
            document.querySelectorAll(".menu-wrap a").forEach(function(list) {
                list.classList.remove("mb-active")
            })
            $menuList[num].querySelector("a").classList.add("mb-active");
        } else {
            document.querySelectorAll(".menu-wrap a").forEach(function(list) {
                list.classList.remove("active")
            })
            $menuList[num].querySelector("a").classList.add("active");
        }
    }

    var menuScrollEvent = function() {
        const menuWrap = document.querySelector(".menu-wrap")
        const menuList = document.querySelectorAll(".menu-wrap li")

        menuWrap.addEventListener("scroll", e => {
            let eventPosition = e.target.scrollTop + window.innerHeight * 0.45;

            menuList.forEach((list, index) => {
                if (eventPosition >= list.offsetTop) {
                    changeBg(index)
                }
            })
        })
    }

    document.querySelector(".btn-menu").addEventListener("click", () =>{
        document.body.classList.add("scroll-fix");
        $menuWrap.style.display = "block";
        $menuWrap.scrollTop = 0;
        changeBg(0);
        menuScrollEvent();
    })

    const menuAtag = document.querySelectorAll(".menu-wrap a");
    menuAtag.forEach(function(item) {
        item.addEventListener("mouseenter", () => {
            bgFileB = item.parentElement.dataset.bg;
            bgURLB = "url(../resource/images/"+ bgFileB +")";
            $menuWrap.style.backgroundImage = bgURLB;
        })
    })

    document.querySelector(".menu-wrap .btn-close").addEventListener("click", () => {
        document.querySelector('.menu-wrap').style.display = "none";
        document.body.classList.remove("scroll-fix");
    })
}

var fn_textTyping = function() {

    const text = document.querySelector("#type-text")
    const tl = gsap.timeline({ repeat: -1, yoyo: false, repeatDelay: .5 })

    tl.to(text, 1, { text: "UI/UX", delay: 2.5 });
    tl.to(text, .5, { text: "", delay: .5 });
    tl.to(text, 1.5, { text: "Interaction", delay: 1 });
    tl.to(text, 1, { text: "", delay: .5 });
    tl.to(text, 1.5, { text: "Websites", delay: 1 });
    tl.to(text, 1, { text: "", delay: .5 });
    tl.to(text, 1, { text: "Motion", delay: 1 });
    tl.to(text, .5, { text: "", delay: .5 });
    tl.to(text, 1.5, { text: "Mobile Web", delay: 1 });
    tl.to(text, 1, { text: "", delay: .5 });
}

/***** main *****/
var fn_setMainPage = function () {
    gsap.registerPlugin(TextPlugin);
    fn_setCommonCursor();
    fn_setMainCursor();
    fn_setGnbHover();
    fn_menuInclude();
    fn_setMenuEvent();
    fn_textTyping();

    document.querySelector(".btn-more").addEventListener("click", () => {
        const fileName = document.querySelector(".swiper-slide-active").dataset.file;
        document.querySelector(".btn-more").href = fileName+'.html'
    })

    var workTitleSplit = new SplitType('.work-title', {
        types: 'chars, words',
        tagName: 'span',
    })

    new Swiper(".main-swiper", {
        speed: 600,
        loop: true,
        mousewheel: true,
        grabCursor: true,
        pagination: {
            el: ".swiper-pagination",
            type: "fraction",
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        on: {
            init: function() {
                if ( this.realIndex == 0 ) {
                    document.body.classList.add("bg-change")
                    document.querySelector('.btn-more-wrap').classList.add("hide")
                } else {
                    document.body.classList.remove("bg-change")
                    document.querySelector('.btn-more-wrap').classList.remove("hide")
                }
            },
            slideChange: function() {
                if ( this.realIndex == 0 ) {
                    document.body.classList.add("bg-change")
                    document.querySelector('.btn-more-wrap').classList.add("hide")
                } else {
                    document.body.classList.remove("bg-change")
                    document.querySelector('.btn-more-wrap').classList.remove("hide")
                }
            },
            slideChangeTransitionStart: function() {
                let activeTitle, prevTitle, nextTitle;
                const swiperSlides = document.querySelectorAll(".swiper-slide");
                swiperSlides.forEach( slide => {
                    if ( slide.classList.contains('swiper-slide-active')) {
                        activeTitle = slide.dataset.title;
                    }
                    if ( slide.classList.contains('swiper-slide-prev')) {
                        prevTitle = slide.dataset.title;
                    }
                    if ( slide.classList.contains('swiper-slide-next')) {
                        nextTitle = slide.dataset.title;
                    }
                })
                workTitleSplit.revert();
                document.querySelector(".work-title.active").innerText = activeTitle;
                document.querySelector(".work-title.prev").innerText = prevTitle;
                document.querySelector(".work-title.next").innerText = nextTitle;
                workTitleSplit.split();

                if (activeTitle == "") document.querySelector(".work-title.active").innerHTML = '<span class="char"></span>';
                if (prevTitle == "") document.querySelector(".work-title.prev").innerHTML = '<span class="char"></span>';
                if (nextTitle == "") document.querySelector(".work-title.next").innerHTML = '<span class="char"></span>';
            },
            slidePrevTransitionStart: function() {
                let prevSlide = document.querySelector(".work-title.prev").querySelectorAll(".char");
                let activeSlide = document.querySelector(".work-title.active").querySelectorAll(".char");
                let nextSlide = document.querySelector(".work-title.next").querySelectorAll(".char");

                gsap.to(prevSlide, { duration: 0.5, scale: 1.1, x: -100, opacity: 0, stagger: { each: 0.02, ease: "none", from: "end" } })
                gsap.to(activeSlide, { delay: 0.3, duration: 0.5, scale: 1, x: 0, opacity: 1, stagger: { each: 0.02, ease: "none", from: "end" } })
                gsap.to(nextSlide, { duration: 0.5, scale: 0.9, x: 100, opacity: 0, stagger: { each: 0.02, ease: "none", from: "end" } })
            },
            slideNextTransitionStart: function() {
                let prevSlide = document.querySelector(".work-title.prev").querySelectorAll(".char");
                let activeSlide = document.querySelector(".work-title.active").querySelectorAll(".char");
                let nextSlide = document.querySelector(".work-title.next").querySelectorAll(".char");

                gsap.to(prevSlide, { duration: 0.5, scale: 0.9, x: -100, opacity: 0, stagger: { each: 0.02, ease: "none" } })
                gsap.to(activeSlide, { delay: 0.3, duration: 0.5, scale: 1, x: 0, opacity: 1, stagger: { each: 0.02, ease: "none" } })
                gsap.to(nextSlide, { duration: 0.5, scale: 1.1, x: 100, opacity: 0, stagger: { each: 0.02, ease: "none" } })
            },
            touchStart: function(e) {
                if ( !e.target.classList.contains('swiper-button-prev') && !e.target.classList.contains('swiper-button-next')) {
                    document.querySelector('.mouse-cursor').classList.add("active-grab")
                }
            },
            touchMove: function(e) {
                if ( !e.target.classList.contains('swiper-button-prev') && !e.target.classList.contains('swiper-button-next')) {
                    document.querySelector('.mouse-cursor').classList.add("active-grab")
                }
            },
            touchEnd: function() {
                document.querySelector('.mouse-cursor').classList.remove("active-grab")
            },
        }
    })
}


/***** work *****/
var fn_setWorkPage = function () {
    fn_setCommonCursor();
    fn_setGnbHover();
    fn_menuInclude();
    fn_setMenuEvent();

    setTimeout(function() {
        document.querySelector(".menu").classList.add("bg-dark")
    }, 1000)

    gsap.utils.toArray(".img-list li").forEach((item) => {
        if (item.querySelector("img") !== null) {
            ScrollTrigger.create({
                trigger: item,
                start: "top 70%",
                onEnter: () => { item.classList.add("img-show") }
            });
        }
    });

    document.querySelector(".btn-top").addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    })

    let pjtName = document.querySelector(".next-pjt");
        pjtName.classList.add("name-block");
        pjtName.classList.remove("next-pjt");
    var cloneNameBlock = pjtName.cloneNode(true);
        pjtName.insertAdjacentElement("afterend", cloneNameBlock)

    var pjtNameRemake = document.createElement("div");
        pjtNameRemake.classList.add("next-pjt")
        pjtName.insertAdjacentElement("beforebegin",pjtNameRemake);

    var nameBlocks = document.querySelectorAll(".name-block");
    var pjtNameWrap = document.querySelector(".next-pjt");
    nameBlocks.forEach(item => { pjtNameWrap.appendChild(item) })

    var nextPjtTitleSplit = new SplitType('.name-block', {
        types: 'chars',
        tagName: 'span',
        splitClass: 'letter'
    })
    nextPjtTitleSplit.split();

    document.querySelector(".next-pjt").addEventListener("mouseenter", () => {
        TweenMax.staggerTo(".name-block:nth-child(1) .letter", 0.3, { y: "-100%", ease:Power1.easeInOut }, 0.02)
        TweenMax.staggerTo(".name-block:nth-child(2) .letter", 0.3, { y: "-100%", ease:Power1.easeInOut }, 0.02)
    })

    document.querySelector(".next-pjt").addEventListener("mouseleave", () => {
        TweenMax.staggerTo(".name-block:nth-child(1) .letter", 0.3, { y: "0", ease:Power1.easeInOut }, 0.02)
        TweenMax.staggerTo(".name-block:nth-child(2) .letter", 0.3, { y: "0", ease:Power1.easeInOut }, 0.02)
    })
}

var setSubPage = function() {
    fn_setCommonCursor();
    fn_setGnbHover();
    fn_menuInclude();
    fn_setMenuEvent();

    setTimeout(function() {
        document.querySelector(".menu").classList.add("bg-dark")
    }, 1000)
}

document.addEventListener("DOMContentLoaded", function(){
    document.body.style.height = window.innerHeight+'px';
});

window.addEventListener("resize", () => {
    document.body.style.height = window.innerHeight+'px';
})