"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const root = document.documentElement;
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");
    const backToTop = document.querySelector(".back-to-top");
    const progress = document.querySelector(".page-progress");
    const searchBox = document.querySelector(".search-box");
    const revealItems = document.querySelectorAll(".scroll-reveal");
    const cards = document.querySelectorAll(".glass-card");
    const objects = document.querySelectorAll(".art-object, .css-celestial");
    const orbits = document.querySelectorAll(".page-orbit");
    const heroVisuals = document.querySelectorAll(".hero-visual, .page-hero-art");

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const isTouchDevice =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;

    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    const clamp = (value, min, max) =>
        Math.min(Math.max(value, min), max);

    const lerp = (a, b, t) =>
        a + (b - a) * t;

    const setCSSVariable = (name, value) => {
        root.style.setProperty(name, value);
    };

    const updatePointerVariables = () => {
        currentX = lerp(currentX, pointerX, 0.08);
        currentY = lerp(currentY, pointerY, 0.08);

        setCSSVariable("--mouse-x", `${currentX}px`);
        setCSSVariable("--mouse-y", `${currentY}px`);

        if (!reducedMotion) {
            rafId = requestAnimationFrame(updatePointerVariables);
        }
    };

    if (!reducedMotion) {
        updatePointerVariables();
    }

    window.addEventListener(
        "pointermove",
        event => {
            pointerX = event.clientX;
            pointerY = event.clientY;

            setCSSVariable(
                "--pointer-x",
                `${event.clientX}px`
            );

            setCSSVariable(
                "--pointer-y",
                `${event.clientY}px`
            );
        },
        { passive: true }
    );

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            const open = navMenu.classList.toggle("open");

            navToggle.setAttribute(
                "aria-expanded",
                String(open)
            );

            navToggle.classList.toggle(
                "active",
                open
            );

            const bars = navToggle.querySelectorAll(".bar");

            if (bars.length >= 3) {
                bars[0].style.transform = open
                    ? "translateY(7px) rotate(45deg)"
                    : "";

                bars[1].style.opacity = open ? "0" : "1";

                bars[2].style.transform = open
                    ? "translateY(-7px) rotate(-45deg)"
                    : "";
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navLinks.forEach(item =>
                item.classList.remove("active")
            );

            link.classList.add("active");

            if (navMenu) {
                navMenu.classList.remove("open");
            }

            if (navToggle) {
                navToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                navToggle.classList.remove("active");

                navToggle
                    .querySelectorAll(".bar")
                    .forEach(bar => {
                        bar.style.transform = "";
                        bar.style.opacity = "";
                    });
            }
        });
    });

    document.addEventListener("click", event => {
        if (!navMenu || !navToggle) return;

        if (
            navMenu.classList.contains("open") &&
            !navMenu.contains(event.target) &&
            !navToggle.contains(event.target)
        ) {
            navMenu.classList.remove("open");

            navToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            navToggle
                .querySelectorAll(".bar")
                .forEach(bar => {
                    bar.style.transform = "";
                    bar.style.opacity = "";
                });
        }
    });

    const updateScrollUI = () => {
        const scrollTop = window.scrollY;
        const documentHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const percent =
            documentHeight > 0
                ? (scrollTop / documentHeight) * 100
                : 0;

        if (progress) {
            progress.style.width = `${percent}%`;
        }

        if (backToTop) {
            backToTop.style.display =
                scrollTop > 500
                    ? "grid"
                    : "none";
        }
    };

    window.addEventListener(
        "scroll",
        updateScrollUI,
        { passive: true }
    );

    updateScrollUI();

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: reducedMotion
                    ? "auto"
                    : "smooth"
            });
        });
    }

    if ("IntersectionObserver" in window) {
        const revealObserver =
            new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add(
                                "visible"
                            );

                            revealObserver.unobserve(
                                entry.target
                            );
                        }
                    });
                },
                {
                    threshold: 0.12,
                    rootMargin: "0px 0px -60px 0px"
                }
            );

        revealItems.forEach(item =>
            revealObserver.observe(item)
        );
    } else {
        revealItems.forEach(item =>
            item.classList.add("visible")
        );
    }

    if (!isTouchDevice && !reducedMotion) {
        cards.forEach(card => {
            let frame = null;

            card.addEventListener("pointermove", event => {
                const rect =
                    card.getBoundingClientRect();

                const x =
                    event.clientX - rect.left;

                const y =
                    event.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = clamp(
                    (centerY - y) / 18,
                    -8,
                    8
                );

                const rotateY = clamp(
                    (x - centerX) / 18,
                    -8,
                    8
                );

                if (frame) {
                    cancelAnimationFrame(frame);
                }

                frame = requestAnimationFrame(() => {
                    card.style.transform =
                        `perspective(1000px)
                         rotateX(${rotateX}deg)
                         rotateY(${rotateY}deg)
                         translateY(-6px)`;

                    card.style.setProperty(
                        "--card-mouse-x",
                        `${x}px`
                    );

                    card.style.setProperty(
                        "--card-mouse-y",
                        `${y}px`
                    );
                });
            });

            card.addEventListener("pointerleave", () => {
                card.style.transform = "";
                card.style.removeProperty(
                    "--card-mouse-x"
                );
                card.style.removeProperty(
                    "--card-mouse-y"
                );
            });
        });
    }

    if (!isTouchDevice && !reducedMotion) {
        heroVisuals.forEach(hero => {
            hero.addEventListener(
                "pointermove",
                event => {
                    const rect =
                        hero.getBoundingClientRect();

                    const x =
                        (event.clientX - rect.left) /
                        rect.width;

                    const y =
                        (event.clientY - rect.top) /
                        rect.height;

                    const rotateX =
                        (0.5 - y) * 5;

                    const rotateY =
                        (x - 0.5) * 5;

                    hero.style.setProperty(
                        "--hero-x",
                        `${x * 100}%`
                    );

                    hero.style.setProperty(
                        "--hero-y",
                        `${y * 100}%`
                    );

                    hero.style.setProperty(
                        "--hero-rotate-x",
                        `${rotateX}deg`
                    );

                    hero.style.setProperty(
                        "--hero-rotate-y",
                        `${rotateY}deg`
                    );
                }
            );

            hero.addEventListener(
                "pointerleave",
                () => {
                    hero.style.setProperty(
                        "--hero-rotate-x",
                        "0deg"
                    );

                    hero.style.setProperty(
                        "--hero-rotate-y",
                        "0deg"
                    );
                }
            );
        });
    }

    if (!isTouchDevice && !reducedMotion) {
        objects.forEach(object => {
            object.addEventListener(
                "pointermove",
                event => {
                    const rect =
                        object.getBoundingClientRect();

                    const x =
                        event.clientX - rect.left;

                    const y =
                        event.clientY - rect.top;

                    const centerX =
                        rect.width / 2;

                    const centerY =
                        rect.height / 2;

                    const rotateX =
                        clamp(
                            (centerY - y) / 12,
                            -12,
                            12
                        );

                    const rotateY =
                        clamp(
                            (x - centerX) / 12,
                            -12,
                            12
                        );

                    object.style.setProperty(
                        "--object-rx",
                        `${rotateX}deg`
                    );

                    object.style.setProperty(
                        "--object-ry",
                        `${rotateY}deg`
                    );

                    object.style.setProperty(
                        "--object-glow-x",
                        `${x}px`
                    );

                    object.style.setProperty(
                        "--object-glow-y",
                        `${y}px`
                    );
                }
            );

            object.addEventListener(
                "pointerleave",
                () => {
                    object.style.setProperty(
                        "--object-rx",
                        "0deg"
                    );

                    object.style.setProperty(
                        "--object-ry",
                        "0deg"
                    );
                }
            );
        });
    }

    objects.forEach(object => {
        object.addEventListener("click", () => {
            object.classList.remove(
                "cosmic-active"
            );

            void object.offsetWidth;

            object.classList.add(
                "cosmic-active"
            );

            setTimeout(() => {
                object.classList.remove(
                    "cosmic-active"
                );
            }, 900);
        });
    });

    if (!reducedMotion) {
        orbits.forEach((orbit, index) => {
            const speed =
                18 + index * 3;

            orbit.style.animationDuration =
                `${speed}s`;
        });
    }

    const searchableItems = [
        ...document.querySelectorAll(
            ".fact-card, .glass-card, .data-table tr, article, section"
        )
    ];

    if (searchBox) {
        searchBox.addEventListener(
            "input",
            event => {
                const query =
                    event.target.value
                        .trim()
                        .toLowerCase();

                if (!query) {
                    searchableItems.forEach(item => {
                        item.style.display = "";
                        item.style.opacity = "";
                    });

                    return;
                }

                searchableItems.forEach(item => {
                    const text =
                        item.textContent
                            .toLowerCase();

                    const matched =
                        text.includes(query);

                    item.style.display =
                        matched ? "" : "none";

                    item.style.opacity =
                        matched ? "1" : "0";
                });
            }
        );
    }

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );

    const sectionObserver =
        new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    const id =
                        entry.target.getAttribute(
                            "id"
                        );

                    navLinks.forEach(link => {
                        const href =
                            link.getAttribute(
                                "href"
                            );

                        link.classList.toggle(
                            "active",
                            href === `#${id}`
                        );
                    });
                });
            },
            {
                threshold: 0.35
            }
        );

    sections.forEach(section =>
        sectionObserver.observe(section)
    );

    const createRipple = (
        element,
        event
    ) => {
        const ripple =
            document.createElement("span");

        const rect =
            element.getBoundingClientRect();

        const size =
            Math.max(
                rect.width,
                rect.height
            );

        ripple.style.position = "absolute";
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left =
            `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top =
            `${event.clientY - rect.top - size / 2}px`;
        ripple.style.borderRadius = "50%";
        ripple.style.pointerEvents = "none";
        ripple.style.background =
            "radial-gradient(circle,rgba(100,220,255,.3),transparent 65%)";
        ripple.style.transform = "scale(0)";
        ripple.style.opacity = "1";
        ripple.style.transition =
            "transform .7s ease,opacity .7s ease";
        ripple.style.zIndex = "10";

        element.style.position =
            element.style.position || "relative";

        element.appendChild(ripple);

        requestAnimationFrame(() => {
            ripple.style.transform =
                "scale(2.2)";
            ripple.style.opacity = "0";
        });

        setTimeout(() => {
            ripple.remove();
        }, 750);
    };

    cards.forEach(card => {
        card.addEventListener(
            "pointerdown",
            event => {
                createRipple(card, event);
            }
        );
    });

    let lastTilt = 0;

    const cinematicScroll = () => {
        if (reducedMotion) return;

        const now = performance.now();

        if (now - lastTilt < 16) {
            requestAnimationFrame(
                cinematicScroll
            );
            return;
        }

        lastTilt = now;

        const viewportCenter =
            window.innerHeight / 2;

        heroVisuals.forEach(hero => {
            const rect =
                hero.getBoundingClientRect();

            const distance =
                rect.top +
                rect.height / 2 -
                viewportCenter;

            const normalized =
                clamp(
                    distance /
                    window.innerHeight,
                    -1,
                    1
                );

            hero.style.setProperty(
                "--scroll-depth",
                `${normalized}`
            );
        });

        requestAnimationFrame(
            cinematicScroll
        );
    };

    if (!reducedMotion) {
        requestAnimationFrame(
            cinematicScroll
        );
    }

    const cosmicObjects =
        document.querySelectorAll(
            "[data-cosmic-object]"
        );

    cosmicObjects.forEach(object => {
        object.addEventListener(
            "mouseenter",
            () => {
                const name =
                    object.dataset.cosmicObject;

                if (name) {
                    root.style.setProperty(
                        "--active-cosmic-name",
                        `"${name}"`
                    );
                }
            }
        );
    });

    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key === "/" &&
                document.activeElement !== searchBox
            ) {
                event.preventDefault();

                if (searchBox) {
                    searchBox.focus();
                }
            }

            if (event.key === "Escape") {
                if (searchBox) {
                    searchBox.value = "";
                    searchBox.dispatchEvent(
                        new Event("input")
                    );
                    searchBox.blur();
                }

                if (navMenu) {
                    navMenu.classList.remove(
                        "open"
                    );
                }
            }

            if (
                event.key === "Home" &&
                !event.ctrlKey
            ) {
                window.scrollTo({
                    top: 0,
                    behavior: reducedMotion
                        ? "auto"
                        : "smooth"
                });
            }
        }
    );

    const lazyImages =
        document.querySelectorAll(
            "img[data-src]"
        );

    if ("IntersectionObserver" in window) {
        const imageObserver =
            new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }

                        const img =
                            entry.target;

                        const source =
                            img.dataset.src;

                        if (source) {
                            img.src = source;
                            img.removeAttribute(
                                "data-src"
                            );
                        }

                        imageObserver.unobserve(
                            img
                        );
                    });
                },
                {
                    rootMargin: "200px"
                }
            );

        lazyImages.forEach(img =>
            imageObserver.observe(img)
        );
    }

    const cosmicClock =
        document.querySelector(
            "[data-cosmic-clock]"
        );

    if (cosmicClock) {
        const updateClock = () => {
            const now = new Date();

            const hours =
                String(
                    now.getHours()
                ).padStart(2, "0");

            const minutes =
                String(
                    now.getMinutes()
                ).padStart(2, "0");

            const seconds =
                String(
                    now.getSeconds()
                ).padStart(2, "0");

            cosmicClock.textContent =
                `${hours}:${minutes}:${seconds}`;
        };

        updateClock();

        setInterval(
            updateClock,
            1000
        );
    }

    const statCounters =
        document.querySelectorAll(
            "[data-counter]"
        );

    if (
        statCounters.length &&
        "IntersectionObserver" in window
    ) {
        const counterObserver =
            new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }

                        const element =
                            entry.target;

                        const target =
                            Number(
                                element.dataset
                                    .counter
                            );

                        if (
                            Number.isNaN(
                                target
                            )
                        ) {
                            return;
                        }

                        const duration = 1600;
                        const start =
                            performance.now();

                        const animate =
                            currentTime => {
                                const progressValue =
                                    clamp(
                                        (currentTime -
                                            start) /
                                            duration,
                                        0,
                                        1
                                    );

                                const eased =
                                    1 -
                                    Math.pow(
                                        1 -
                                            progressValue,
                                        4
                                    );

                                element.textContent =
                                    Math.floor(
                                        target *
                                            eased
                                    ).toLocaleString();

                                if (
                                    progressValue <
                                    1
                                ) {
                                    requestAnimationFrame(
                                        animate
                                    );
                                } else {
                                    element.textContent =
                                        target.toLocaleString();
                                }
                            };

                        requestAnimationFrame(
                            animate
                        );

                        counterObserver.unobserve(
                            element
                        );
                    });
                },
                {
                    threshold: 0.7
                }
            );

        statCounters.forEach(counter =>
            counterObserver.observe(
                counter
            )
        );
    }

    const magneticElements =
        document.querySelectorAll(
            "[data-magnetic]"
        );

    if (
        !isTouchDevice &&
        !reducedMotion
    ) {
        magneticElements.forEach(element => {
            element.addEventListener(
                "pointermove",
                event => {
                    const rect =
                        element.getBoundingClientRect();

                    const x =
                        event.clientX -
                        rect.left -
                        rect.width / 2;

                    const y =
                        event.clientY -
                        rect.top -
                        rect.height / 2;

                    element.style.transform =
                        `translate(
                            ${clamp(x / 7, -12, 12)}px,
                            ${clamp(y / 7, -12, 12)}px
                        )`;
                }
            );

            element.addEventListener(
                "pointerleave",
                () => {
                    element.style.transform =
                        "";
                }
            );
        });
    }

    const soundButtons =
        document.querySelectorAll(
            "[data-cosmic-sound]"
        );

    let audioContext = null;

    const cosmicSound = frequency => {
        if (!audioContext) {
            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();
        }

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value =
            frequency;

        gain.gain.setValueAtTime(
            0.0001,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.04,
            audioContext.currentTime + 0.02
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioContext.currentTime + 0.4
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 0.42
        );
    };

    soundButtons.forEach(button => {
        button.addEventListener(
            "click",
            () => {
                const frequency =
                    Number(
                        button.dataset
                            .cosmicSound
                    ) || 440;

                cosmicSound(frequency);
            }
        );
    });

    const objectLabels =
        document.querySelectorAll(
            "[data-cosmic-label]"
        );

    objectLabels.forEach(object => {
        object.addEventListener(
            "pointerenter",
            () => {
                const label =
                    object.dataset
                        .cosmicLabel;

                if (!label) return;

                object.setAttribute(
                    "title",
                    label
                );
            }
        );
    });

    window.addEventListener(
        "resize",
        () => {
            updateScrollUI();

            if (
                window.innerWidth > 760 &&
                navMenu
            ) {
                navMenu.classList.remove(
                    "open"
                );

                if (navToggle) {
                    navToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            }
        },
        { passive: true }
    );

    document.documentElement.classList.add(
        "js-ready"
    );
});
