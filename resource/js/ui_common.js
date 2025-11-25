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
    const btnTop = document.querySelector(".btn-top");
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

    if (btnTop != null) {
        btnTop.addEventListener("mouseenter", () => {
            cursor.classList.add("active-lg");
        });
        btnTop.addEventListener("mouseleave", () => {
            cursor.classList.remove("active-lg");
        });
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

    const pjtTitle = document.querySelectorAll(".work-title");
    pjtTitle.forEach(text => {
        const textSize = text.getBoundingClientRect();

        text.addEventListener("mousemove", e => {
            const thisX = e.clientX - (textSize.left + textSize.width);
            const thisY = e.clientY - (textSize.top + textSize.height);

            gsap.to( text , {
                duration: .3,
                x: thisX * 0.1,
                y: thisY * 0.1
            } )
        })

        text.addEventListener("mouseleave", e => {
            gsap.to( text , {
                duration: .3,
                x: 'initial',
                y: 'initial'
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
                <a href="work06.html"><span>현대캐피탈</span><br><span>AutoDigital Project</span></a>
            </li>
            <li data-bg="work10/work10_main.jpg">
                <a href="work10.html"><span>행정안전부</span><br><span>국가공유데이터 플랫폼 구축</span></a>
            </li>
            <li data-bg="work11/work11_main.jpg">
                <a href="work11.html"><span>셀바스</span><br><span>아이스크림 AIDT</span></a>
            </li>
            <li data-bg="work12/work12_main.jpg">
                <a href="work12.html"><span>이음 파트너스</span><br><span>디지털 통합 장례 플랫폼 구축</span></a>
            </li>
            <li data-bg="work13/work13_main.jpg">
                <a href="work13.html"><span>천재교육</span><br><span>AIDT 지원센터</span></a>
            </li>
            <li data-bg="work14/work14_main.jpg">
                <a href="work14.html"><span>한국대학교육협의회</span><br><span>서류제출 시스템 구축</span></a>
            </li>
            <li data-bg="img_work.jpg">
                <a href="career.html"><span class="">More Project . . .</span></a>
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
    const tl = gsap.timeline({ repeat: -1, yoyo: false, repeatDelay: 0 })

    tl.to(text, 1, { text: "UI/UX", delay: 2.2 });
    tl.to(text, .5, { text: "", delay: .2 });
    tl.to(text, 1.5, { text: "Interaction", delay: .8 });
    tl.to(text, 1, { text: "", delay: .2 });
    tl.to(text, 1.5, { text: "Websites", delay: .6 });
    tl.to(text, 1, { text: "", delay: .2 });
    tl.to(text, 1, { text: "Motion", delay: .6 });
    tl.to(text, .5, { text: "", delay: .2 });
    tl.to(text, 1.5, { text: "Mobile Web", delay: .6 });
    tl.to(text, 1, { text: "", delay: .2 });
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
                let activeTitle;
                const swiperSlides = document.querySelectorAll(".swiper-slide");
                swiperSlides.forEach( slide => {
                    if ( slide.classList.contains('swiper-slide-active')) {
                        activeTitle = slide.dataset.title;
                    }
                })
                workTitleSplit.revert();
                document.querySelector(".work-title").innerText = activeTitle;
                workTitleSplit.split();

                if (activeTitle == "") document.querySelector(".work-title").innerHTML = '<span class="char"></span>';
            },
            slidePrevTransitionStart: function() {
                let activeSlide = document.querySelector(".work-title").querySelectorAll(".char");
                gsap.to(activeSlide, { delay: 0.3, duration: 0.5, scale: 1, x: 0, opacity: 1, stagger: { each: 0.02, ease: "none", from: "end" } })
            },
            slideNextTransitionStart: function() {
                let activeSlide = document.querySelector(".work-title").querySelectorAll(".char");
                gsap.to(activeSlide, { delay: 0.3, duration: 0.5, scale: 1, x: 0, opacity: 1, stagger: { each: 0.02, ease: "none" } })
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

/***** career, about *****/
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