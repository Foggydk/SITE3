// ===== PRELOADER =====
document.addEventListener('DOMContentLoaded', function () {
    // Скрываем preloader через 1.5 секунды
    setTimeout(function () {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.classList.add('hidden');

            // Удаляем preloader из DOM после завершения анимации
            setTimeout(function () {
                preloader.style.display = 'none';
            }, 500);
        }
    }, 1500);

    // ===== HEADER =====
    const header = document.querySelector('.header');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const langButtons = document.querySelectorAll('.lang-btn');

    // Проверяем существование элементов
    if (!header || !hamburger || !navMenu) return;

    // Эффект при скролле
    let isScrolling = false;
    window.addEventListener('scroll', function () {
        if (!isScrolling) {
            isScrolling = true;

            requestAnimationFrame(function () {
                if (window.scrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }

                // Активная секция в навигации
                const sections = document.querySelectorAll('section');
                let current = '';

                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.clientHeight;

                    if (window.scrollY >= (sectionTop - 200)) {
                        current = section.getAttribute('id');
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${current}`) {
                        link.classList.add('active');
                    }
                });

                isScrolling = false;
            });
        }
    });

    // Мобильное меню
    hamburger.addEventListener('click', function () {
        const isActive = navMenu.classList.contains('active');
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = isActive ? '' : 'hidden';

        // Анимация гамбургера в крестик
        const bars = hamburger.querySelectorAll('.bar');
        if (!isActive) {
            bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            bars[1].style.opacity = '0';
            bars[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            hamburger.setAttribute('aria-expanded', 'true');
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    // Закрытие меню при клике на ссылку
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            // Закрываем меню
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            hamburger.setAttribute('aria-expanded', 'false');

            // Сбрасываем анимацию гамбургера
            const bars = hamburger.querySelectorAll('.bar');
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        });
    });

    // Переключение языка
    langButtons.forEach(button => {
        button.addEventListener('click', function () {
            langButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // ===== HERO VIDEO =====
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        // Автовоспроизведение с обработкой ошибок
        heroVideo.play().catch(error => {
            console.log('Автовоспроизведение видео заблокировано:', error);
            // Можно показать кнопку воспроизведения для пользователя
        });

        // Пауза/воспроизведение видео при видимости
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    heroVideo.play().catch(e => console.log('Воспроизведение заблокировано'));
                } else {
                    heroVideo.pause();
                }
            });
        }, { threshold: 0.5 });

        videoObserver.observe(heroVideo);
    }

    // ===== ПЛАВНАЯ ПРОКРУТКА =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== ПАРАЛЛАКС ЭФФЕКТ В HERO =====
    let lastScrollTop = 0;
    const videoOverlay = document.querySelector('.video-overlay');

    if (videoOverlay) {
        window.addEventListener('scroll', function () {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');

            if (hero) {
                const rate = scrolled * -0.5;
                videoOverlay.style.transform = `translate3d(0, ${rate}px, 0)`;

                // Эффект затемнения при скролле
                const opacity = Math.max(0.4, 0.8 - (scrolled / 1000));
                videoOverlay.style.opacity = opacity;

                // Оптимизация: только если есть разница в скролле
                if (Math.abs(lastScrollTop - scrolled) > 10) {
                    lastScrollTop = scrolled;
                }
            }
        }, { passive: true });
    }

    // ===== АНИМАЦИЯ ПРИ СКРОЛЛЕ (Intersection Observer) =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');

                // Для счетчиков запускаем анимацию чисел
                const counter = entry.target.querySelector('.stat-number');
                if (counter) {
                    animateCounter(counter);
                }
            }
        });
    }, observerOptions);

    // Наблюдаем за всеми элементами с анимацией
    document.querySelectorAll('.animate-on-scroll, .stat-item, .feature-card, .service-card, .info-card').forEach(el => {
        scrollObserver.observe(el);
    });

    // ===== АНИМАЦИЯ СЧЕТЧИКОВ =====
    function animateCounter(counter) {
        const target = parseInt(counter.getAttribute('data-count'));
        const current = parseInt(counter.textContent) || 0;

        if (current >= target) return; // Уже анимировано
        if (counter.classList.contains('animating')) return; // Уже анимируется

        counter.classList.add('animating');

        const duration = 2000; // 2 секунды
        const stepTime = 20; // кадр каждые 20мс
        const steps = duration / stepTime;
        const increment = target / steps;
        let currentValue = current;

        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= target) {
                currentValue = target;
                clearInterval(timer);
                counter.classList.remove('animating');
            }
            counter.textContent = Math.floor(currentValue);
        }, stepTime);
    }

    // Инициализация счетчиков при загрузке видимых элементов
    function initCounters() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            // Если счетчик уже в viewport при загрузке
            const rect = counter.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                animateCounter(counter);
            }
        });
    }

    // Запускаем после полной загрузки страницы
    window.addEventListener('load', initCounters);

    // ===== ПАРАЛЛАКС ДЛЯ ABOUT IMAGE =====
    const aboutImage = document.querySelector('.about-image');
    if (aboutImage) {
        window.addEventListener('scroll', function () {
            const aboutSection = document.querySelector('.about');
            if (aboutSection) {
                const rect = aboutSection.getBoundingClientRect();

                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const rate = (rect.top - window.innerHeight) * 0.1;
                    aboutImage.style.transform = `translateY(${rate}px)`;
                }
            }
        }, { passive: true });
    }

    // ===== SERVICES SECTION ANIMATIONS =====
    const servicesSection = document.querySelector('.services');
    if (servicesSection) {
        // Анимация иконок при hover
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', function () {
                const icon = this.querySelector('.service-icon i');
                if (icon) {
                    icon.style.transform = 'translate(-50%, -50%) scale(1.1) rotate(5deg)';
                }

                const listItems = this.querySelectorAll('.service-list li');
                listItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.transform = 'translateX(5px)';
                    }, index * 50);
                });
            });

            card.addEventListener('mouseleave', function () {
                const icon = this.querySelector('.service-icon i');
                if (icon) {
                    icon.style.transform = 'translate(-50%, -50%)';
                }

                const listItems = this.querySelectorAll('.service-list li');
                listItems.forEach(item => {
                    item.style.transform = 'translateX(0)';
                });
            });
        });

        // Анимация CTA блока
        const servicesCTA = document.querySelector('.services-cta');
        if (servicesCTA) {
            const ctaObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                        entry.target.style.animation = 'bounceIn 0.6s ease forwards';
                    }
                });
            }, { threshold: 0.3 });

            ctaObserver.observe(servicesCTA);
        }
    }

    // ===== TESTIMONIALS SLIDER =====
    const testimonialsSlider = document.querySelector('.testimonials-slider');
    if (testimonialsSlider) {
        class TestimonialsSlider {
            constructor() {
                this.slides = document.querySelectorAll('.testimonial-slide');
                this.dots = document.querySelectorAll('.slider-dot');
                this.prevBtn = document.querySelector('.slider-prev');
                this.nextBtn = document.querySelector('.slider-next');
                this.currentIndex = 0;
                this.autoSlideInterval = null;
                this.autoSlideDelay = 5000; // 5 секунд
                this.isAutoPlaying = true;
                this.touchStartX = 0;
                this.touchEndX = 0;

                this.init();
            }

            init() {
                // Проверяем наличие элементов
                if (this.slides.length === 0) return;

                // Инициализация событий
                if (this.prevBtn) {
                    this.prevBtn.addEventListener('click', () => this.prevSlide());
                }
                if (this.nextBtn) {
                    this.nextBtn.addEventListener('click', () => this.nextSlide());
                }

                // Клики по точкам
                this.dots.forEach((dot, index) => {
                    dot.addEventListener('click', () => this.goToSlide(index));
                });

                // Автоматическое переключение
                this.startAutoSlide();

                // Остановка автослайда при взаимодействии
                testimonialsSlider.addEventListener('mouseenter', () => this.pauseAutoSlide());
                testimonialsSlider.addEventListener('mouseleave', () => this.resumeAutoSlide());

                // Свайп для мобильных устройств
                this.initTouchEvents();

                // Инициализация первого слайда
                this.goToSlide(0);
            }

            goToSlide(index) {
                // Проверка индекса
                if (index < 0 || index >= this.slides.length) return;

                // Убираем активный класс у текущего слайда и точки
                this.slides[this.currentIndex].classList.remove('active');
                this.dots[this.currentIndex].classList.remove('active');

                // Устанавливаем новый индекс
                this.currentIndex = index;

                // Добавляем активный класс новому слайду и точке
                this.slides[this.currentIndex].classList.add('active');
                this.dots[this.currentIndex].classList.add('active');

                // Обновляем состояние кнопок
                this.updateButtons();

                // Перезапускаем автослайд
                this.restartAutoSlide();
            }

            nextSlide() {
                const nextIndex = (this.currentIndex + 1) % this.slides.length;
                this.goToSlide(nextIndex);
            }

            prevSlide() {
                const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
                this.goToSlide(prevIndex);
            }

            updateButtons() {
                // Обновляем ARIA-атрибуты для доступности
                this.dots.forEach((dot, index) => {
                    dot.setAttribute('aria-selected', index === this.currentIndex ? 'true' : 'false');
                });

                // Для кнопок можно добавить disabled состояния если нужно
                if (this.prevBtn && this.nextBtn) {
                    this.prevBtn.disabled = this.currentIndex === 0;
                    this.nextBtn.disabled = this.currentIndex === this.slides.length - 1;
                }
            }

            startAutoSlide() {
                if (!this.isAutoPlaying) return;

                this.stopAutoSlide();
                this.autoSlideInterval = setInterval(() => this.nextSlide(), this.autoSlideDelay);
            }

            stopAutoSlide() {
                if (this.autoSlideInterval) {
                    clearInterval(this.autoSlideInterval);
                    this.autoSlideInterval = null;
                }
            }

            pauseAutoSlide() {
                this.isAutoPlaying = false;
                this.stopAutoSlide();
            }

            resumeAutoSlide() {
                this.isAutoPlaying = true;
                this.startAutoSlide();
            }

            restartAutoSlide() {
                this.stopAutoSlide();
                this.startAutoSlide();
            }

            initTouchEvents() {
                testimonialsSlider.addEventListener('touchstart', (e) => {
                    this.touchStartX = e.touches[0].clientX;
                    this.pauseAutoSlide();
                }, { passive: true });

                testimonialsSlider.addEventListener('touchmove', (e) => {
                    this.touchEndX = e.touches[0].clientX;
                }, { passive: true });

                testimonialsSlider.addEventListener('touchend', () => {
                    const threshold = 50; // Минимальное расстояние для свайпа

                    if (this.touchStartX - this.touchEndX > threshold) {
                        // Свайп влево - следующий слайд
                        this.nextSlide();
                    } else if (this.touchEndX - this.touchStartX > threshold) {
                        // Свайп вправо - предыдущий слайд
                        this.prevSlide();
                    }

                    this.resumeAutoSlide();
                }, { passive: true });
            }

            destroy() {
                this.stopAutoSlide();
                // Удаляем все обработчики событий
                if (this.prevBtn) this.prevBtn.removeEventListener('click', () => this.prevSlide());
                if (this.nextBtn) this.nextBtn.removeEventListener('click', () => this.nextSlide());
            }
        }

        // Инициализация слайдера
        new TestimonialsSlider();
    }

    // Анимация для логотипов клиентов
    const logosContainer = document.querySelector('.logos-container');
    if (logosContainer) {
        const logosObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');

                    const logoItems = entry.target.querySelectorAll('.logo-item');
                    logoItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            });
        }, { threshold: 0.3 });

        logosObserver.observe(logosContainer);
    }

    // ===== CONTACT FORM VALIDATION =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const formInputs = contactForm.querySelectorAll('.form-input, .form-select, .form-textarea');
        const budgetSlider = document.getElementById('budget');
        const budgetLabels = document.querySelectorAll('.slider-labels span');
        const submitBtn = contactForm.querySelector('.btn-submit');
        const formSuccess = contactForm.querySelector('.form-success');

        // Инициализация слайдера бюджета
        function initBudgetSlider() {
            if (!budgetSlider || !budgetLabels.length) return;

            const track = document.querySelector('.slider-track');
            if (track) {
                track.style.setProperty('--track-width', '40%'); // Начальное значение
            }

            updateBudgetSlider(parseInt(budgetSlider.value));

            budgetSlider.addEventListener('input', function () {
                updateBudgetSlider(parseInt(this.value));
            });

            budgetLabels.forEach((label, index) => {
                label.addEventListener('click', function () {
                    budgetSlider.value = index;
                    updateBudgetSlider(index);
                    budgetSlider.dispatchEvent(new Event('input'));
                });
            });
        }

        function updateBudgetSlider(value) {
            const track = document.querySelector('.slider-track');
            if (track) {
                const percent = (value / 5) * 100;
                track.style.setProperty('--track-width', `${percent}%`);
            }

            budgetLabels.forEach((label, index) => {
                if (label) {
                    label.classList.toggle('active', index === value);
                }
            });
        }

        // Валидация формы
        function validateForm() {
            let isValid = true;
            clearErrors();

            const requiredFields = contactForm.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    showError(field, 'Это поле обязательно для заполнения');
                    isValid = false;
                }
            });

            // Проверка email
            const emailField = document.getElementById('email');
            if (emailField && emailField.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailField.value)) {
                    showError(emailField, 'Введите корректный email адрес');
                    isValid = false;
                }
            }

            // Проверка телефона (опционально)
            const phoneField = document.getElementById('phone');
            if (phoneField && phoneField.value.trim()) {
                const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
                if (!phoneRegex.test(phoneField.value)) {
                    showError(phoneField, 'Введите корректный номер телефона');
                    isValid = false;
                }
            }

            // Проверка чекбокса
            const privacyCheckbox = document.getElementById('privacy');
            if (privacyCheckbox && !privacyCheckbox.checked) {
                showError(privacyCheckbox, 'Необходимо согласие на обработку данных');
                isValid = false;
            }

            return isValid;
        }

        function showError(field, message) {
            const formGroup = field.closest('.form-group');
            if (!formGroup) return;

            const errorElement = formGroup.querySelector('.form-error');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.add('active');
                errorElement.setAttribute('role', 'alert');

                if (field.style) {
                    field.style.borderColor = '#ff4757';
                    field.style.animation = 'shake 0.5s ease';
                    setTimeout(() => field.style.animation = '', 500);
                }
            }
        }

        function clearErrors() {
            const errorElements = contactForm.querySelectorAll('.form-error');
            errorElements.forEach(element => {
                if (element) {
                    element.textContent = '';
                    element.classList.remove('active');
                    element.removeAttribute('role');
                }
            });

            formInputs.forEach(input => {
                if (input && input.style) {
                    input.style.borderColor = '';
                }
            });
        }

        // Анимации полей формы
        formInputs.forEach(input => {
            if (!input) return;

            const formGroup = input.closest('.form-group');

            input.addEventListener('focus', function () {
                formGroup?.classList.add('focused');
            });

            input.addEventListener('blur', function () {
                formGroup?.classList.remove('focused');
                if (this.hasAttribute('required') && this.value.trim()) {
                    clearErrors();
                }
            });

            input.addEventListener('input', function () {
                formGroup?.classList.toggle('has-value', this.value.trim() !== '');

                // Скрываем ошибку при исправлении
                const errorElement = formGroup?.querySelector('.form-error');
                if (errorElement?.classList.contains('active')) {
                    errorElement.classList.remove('active');
                    errorElement.removeAttribute('role');
                    if (this.style) this.style.borderColor = '';
                }
            });
        });

        // Отправка формы
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (validateForm()) {
                if (submitBtn) {
                    submitBtn.classList.add('loading');
                    submitBtn.disabled = true;
                    submitBtn.setAttribute('aria-busy', 'true');
                }

                try {
                    // Симуляция отправки на сервер (замените на реальный fetch)
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    // Показываем сообщение об успехе
                    if (formSuccess) {
                        formSuccess.classList.add('active');
                        formSuccess.setAttribute('role', 'alert');
                        formSuccess.style.animation = 'fadeInUp 0.5s ease forwards';
                    }

                    // Сбрасываем форму
                    setTimeout(() => {
                        contactForm.reset();
                        updateBudgetSlider(2); // Сброс слайдера

                        if (formSuccess) {
                            formSuccess.classList.remove('active');
                            formSuccess.removeAttribute('role');
                        }
                    }, 3000);

                } catch (error) {
                    console.error('Ошибка отправки формы:', error);
                    showError(contactForm, 'Произошла ошибка при отправке формы');
                } finally {
                    if (submitBtn) {
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                        submitBtn.removeAttribute('aria-busy');
                    }
                }
            } else {
                // Анимация ошибки валидации
                contactForm.style.animation = 'shake 0.5s ease';
                setTimeout(() => contactForm.style.animation = '', 500);
            }
        });

        // Инициализация слайдера бюджета
        initBudgetSlider();

        // Добавляем CSS для анимаций
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            @keyframes bounceIn {
                0% { transform: scale(0.95); opacity: 0; }
                60% { transform: scale(1.05); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            @keyframes fadeInUp {
                0% { transform: translateY(20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            
            .slider-track::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: var(--track-width, 40%);
                background-color: var(--accent-color);
                border-radius: 2px;
                transition: width 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // ===== ОБЩИЕ ФУНКЦИИ =====
    // Debounce функция для оптимизации скролла
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle функция для ограничения частоты вызовов
    function throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ===== ОБРАБОТЧИКИ ОШИБОК =====
    window.addEventListener('error', function (e) {
        console.error('JavaScript ошибка:', e.message, e.filename, e.lineno);
    });

    // ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ =====
    // Гарантируем, что все будет работать после полной загрузки
    window.addEventListener('load', function () {
        console.log('Dkey Group сайт успешно загружен');

        // Триггерим скролл событие для инициализации состояния
        window.dispatchEvent(new Event('scroll'));
    });
});
