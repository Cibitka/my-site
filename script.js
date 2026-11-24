(function () {
  'use strict';

  /* =========================================================
     1. TOPOGRAPHIC ISOLINES BACKGROUND (3D Perlin + Marching Squares)
     Restored from original Cibitka/my-site
     ========================================================= */
  class FastNoise {
    constructor(seed = 1337) {
      this.p = new Uint8Array(512);
      const perm = new Uint8Array(256);
      for (let i = 0; i < 256; i++) perm[i] = i;
      let s = seed;
      for (let i = 255; i > 0; i--) {
        s = (s * 16807) % 2147483647;
        const j = s % (i + 1);
        const tmp = perm[i];
        perm[i] = perm[j];
        perm[j] = tmp;
      }
      for (let i = 0; i < 512; i++) this.p[i] = perm[i & 255];
    }
    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x, y, z) {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    noise3D(x, y, z) {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);
      const u = this.fade(x), v = this.fade(y), w = this.fade(z);
      const p = this.p;
      const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
      const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
      return this.lerp(
        w,
        this.lerp(v, this.lerp(u, this.grad(p[AA], x, y, z), this.grad(p[BA], x - 1, y, z)),
                     this.lerp(u, this.grad(p[AB], x, y - 1, z), this.grad(p[BB], x - 1, y - 1, z))),
        this.lerp(v, this.lerp(u, this.grad(p[AA + 1], x, y, z - 1), this.grad(p[BA + 1], x - 1, y, z - 1)),
                     this.lerp(u, this.grad(p[AB + 1], x, y - 1, z - 1), this.grad(p[BB + 1], x - 1, y - 1, z - 1)))
      );
    }
  }

  function initTopoBackground() {
    const canvas = document.getElementById('topo-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const noise = new FastNoise(42);
    const levels = [0.2, 0.35, 0.5, 0.65, 0.8];
    const scale = 0.5;
    const cellSize = 18;
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0, height = 0, cols = 0, rows = 0;
    let field = new Float32Array(0);
    let zOff = 0;
    let lastFrame = 0;
    let rafId = null;

    function resize() {
      width = Math.max(1, Math.floor(window.innerWidth * scale));
      height = Math.max(1, Math.floor(window.innerHeight * scale));
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / cellSize) + 1;
      rows = Math.ceil(height / cellSize) + 1;
      field = new Float32Array(cols * rows);
      drawFrame();
    }

    function interp(v1, v2, level) {
      const d = v2 - v1;
      if (Math.abs(d) < 1e-5) return 0.5;
      return Math.max(0, Math.min(1, (level - v1) / d));
    }

    function drawFrame() {
      ctx.clearRect(0, 0, width, height);
      const freq = 0.0042 / scale;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const n = noise.noise3D(x * cellSize * freq, y * cellSize * freq, zOff);
          field[y * cols + x] = (n + 1) * 0.5;
        }
      }

      ctx.lineWidth = 1;
      for (let li = 0; li < levels.length; li++) {
        const level = levels[li];
        ctx.strokeStyle = li % 2 === 0 ? 'rgba(32, 178, 170, 0.24)' : 'rgba(14, 101, 102, 0.32)';
        ctx.beginPath();

        for (let y = 0; y < rows - 1; y++) {
          for (let x = 0; x < cols - 1; x++) {
            const idx = y * cols + x;
            const tl = field[idx];
            const tr = field[idx + 1];
            const br = field[idx + cols + 1];
            const bl = field[idx + cols];

            let state = 0;
            if (tl > level) state |= 8;
            if (tr > level) state |= 4;
            if (br > level) state |= 2;
            if (bl > level) state |= 1;
            if (state === 0 || state === 15) continue;

            const px = x * cellSize;
            const py = y * cellSize;
            const top = [px + interp(tl, tr, level) * cellSize, py];
            const right = [px + cellSize, py + interp(tr, br, level) * cellSize];
            const bottom = [px + interp(bl, br, level) * cellSize, py + cellSize];
            const left = [px, py + interp(tl, bl, level) * cellSize];

            const seg = (a, b) => {
              ctx.moveTo(a[0], a[1]);
              ctx.lineTo(b[0], b[1]);
            };

            switch (state) {
              case 1: case 14: seg(left, bottom); break;
              case 2: case 13: seg(bottom, right); break;
              case 3: case 12: seg(left, right); break;
              case 4: case 11: seg(top, right); break;
              case 5: seg(left, top); seg(bottom, right); break;
              case 6: case 9: seg(top, bottom); break;
              case 7: case 8: seg(left, top); break;
              case 10: seg(left, bottom); seg(top, right); break;
            }
          }
        }
        ctx.stroke();
      }
    }

    function loop(ts) {
      rafId = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (ts - lastFrame < 33) return; // ~30 FPS cap
      lastFrame = ts;
      zOff += 0.0022;
      drawFrame();
    }

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    });

    resize();
    if (!reducedMotion) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(loop);
    }
  }

  /* =========================================================
     2. I18N & APP STATE
     ========================================================= */
  const i18n = {
    ru: {
      skip: 'Перейти к содержимому',
      nav_services: 'Услуги и цены',
      nav_portfolio: 'Портфолио',
      nav_stack: 'Стек',
      nav_process: 'Процесс',
      nav_about: 'О себе',
      nav_faq: 'FAQ',
      nav_contact: 'Контакты',
      hero_status: '// python backend · telegram bots · rust',
      hero_title_1: 'Александр (Cibitka) — ',
      hero_title_accent: 'Python-разработка',
      hero_title_2: ', боты и автоматизация',
      hero_sub: 'Делаю асинхронные API на FastAPI и Django, Telegram-ботов на aiogram 3, парсеры данных и нативные Linux-приложения на Rust. Фиксирую сроки и стоимость до старта, сдаю чистый код с инструкцией по запуску.',
      hero_cta_primary: 'Обсудить задачу',
      hero_cta_secondary: 'Проекты',
      metric_exp_val: '3+ года',
      metric_exp_lbl: 'опыта в Python',
      metric_os_val: 'Cibitube',
      metric_os_lbl: 'Open Source (MIT)',
      metric_ram_val: '~30 MB',
      metric_ram_lbl: 'RAM в Cibitube',
      term_title: 'cibitka@arch:~/portfolio',
      term_placeholder: 'Введите /help, /projects, /stack...',
      term_run: 'Run',
      services_kicker: '03 / Услуги и цены',
      services_title: 'Основные направления разработки',
      services_desc: 'Три профильных направления с ориентировочной стоимостью. Точная оценка зависит от объёма и фиксируется после обсуждения.',
      srv1_title: 'Backend & API',
      srv1_desc: 'Асинхронные REST и WebSocket API, проектирование БД и интеграции с внешними сервисами.',
      srv1_price: 'от 15 000 ₽',
      srv1_eta: 'от 5 дней',
      srv1_f1: 'FastAPI или Django / DRF с типизацией',
      srv1_f2: 'PostgreSQL, Redis, миграции и OpenAPI',
      srv1_f3: 'Сборка в Docker и деплой на сервер',
      srv2_title: 'Telegram-боты',
      srv2_desc: 'Боты для каталогов, заявок, записи, уведомлений, приёма платежей и связи с CRM.',
      srv2_price: 'от 8 000 ₽',
      srv2_eta: 'от 3 дней',
      srv2_f1: 'Асинхронный aiogram 3 и SQLAlchemy',
      srv2_f2: 'Вебхуки, платежи и админ-команды',
      srv2_f3: 'Логирование ошибок и автоперезапуск',
      srv3_title: 'Парсинг и автоматизация',
      srv3_desc: 'Сбор данных с сайтов, мониторинг цен, регулярные отчёты и синхронизация между сервисами.',
      srv3_price: 'от 5 000 ₽',
      srv3_eta: 'от 2 дней',
      srv3_f1: 'Playwright, httpx и BeautifulSoup4',
      srv3_f2: 'Выгрузка в CSV, Excel, Google Sheets или Telegram',
      srv3_f3: 'Запуск по расписанию (cron / Docker)',
      srv_btn: 'Выбрать услугу',
      pricing_note: 'Цены ориентировочные — итоговая стоимость и сроки согласовываются до начала разработки.',
      port_kicker: '04 / Портфолио',
      port_title: 'Проекты и рабочие демо',
      port_desc: 'Открытые репозитории на GitHub и интерактивные прототипы, которые можно проверить на месте.',
      filter_all: 'Все',
      filter_real: 'Open Source',
      filter_demo: 'Демо',
      p1_type: 'Open Source · Rust / Linux',
      p1_title: 'Cibitube — клиент YouTube Music для Linux',
      p1_desc: 'Нативный десктопный клиент на Rust (egui/eframe + MPV IPC + yt-dlp). Потребляет ~30 MB RAM против 500+ MB у Electron, поддерживает синхронизацию ПК ↔ Android через Google Drive, загрузку обложек и .lrc текстов (LRCLIB), интерфейс RU/EN и упаковку для AUR.',
      p1_btn_gh: 'Открыть на GitHub',
      p2_type: 'Демо · aiogram 3',
      p2_title: 'Демо Telegram-бота для заявок',
      p2_desc: 'Симулятор клиентского Telegram-бота: выбор услуги из каталога, проверка статуса заказа и оформление заявки через инлайн-кнопки.',
      p2_btn_demo: 'Открыть демо бота',
      p3_type: 'Демо · HTML / CSS / JS',
      p3_title: 'Демо коммерческого лендинга',
      p3_desc: 'Пример лёгкого лендинга для малого бизнеса с интерактивным калькулятором подписки и расчётом цены без фреймворков.',
      p3_btn_demo: 'Открыть демо лендинга',
      p4_type: 'Open Source · Frontend',
      p4_title: 'Cibitka v2.0 (my-site)',
      p4_desc: 'Этот сайт-портфолио: чистый HTML5, CSS3 и Vanilla JavaScript, топографический фон на 3D-шуме Перлина, интерактивный терминал и поддержка RU/EN.',
      p4_btn_gh: 'Исходный код',
      stack_kicker: '05 / Технологический стек',
      stack_title: 'Технологии в работе',
      stack_desc: 'Инструменты, которые реально применяются в моих проектах и репозиториях.',
      st1_title: 'Python & Backend',
      st2_title: 'Боты и автоматизация',
      st3_title: 'Базы данных и DevOps',
      st4_title: 'Системное и Frontend',
      proc_kicker: '06 / Этапы работы',
      proc_title: 'Как строится работа',
      proc_desc: 'Четыре последовательных шага от обсуждения до запуска.',
      pr1_t: 'Анализ и оценка',
      pr1_d: 'Разбираем требования, прорабатываем структуру БД и фиксируем сроки со стоимостью.',
      pr2_t: 'Разработка и демо',
      pr2_d: 'Пишу типизированный код и показываю рабочие промежуточные версии по мере готовности.',
      pr3_t: 'Тестирование',
      pr3_d: 'Проверяю обработку ошибок, производительность запросов и безопасность эндпоинтов.',
      pr4_t: 'Запуск и передача',
      pr4_d: 'Деплой через Docker / Nginx или GitHub Pages, передача репозитория и инструкции.',
      about_kicker: '07 / О себе',
      about_title: 'О разработчике',
      about_p1: 'Меня зовут Александр (Cibitka). Специализируюсь на Python-бэкенде, Telegram-ботах и автоматизации, а также пишу нативные Linux-утилиты на Rust.',
      about_p2: 'Стараюсь делать архитектуру простой для поддержки и быстрой в работе: без лишних зависимостей и перегруженных фреймворков там, где они не нужны.',
      ab_h1_t: 'Производительность',
      ab_h1_d: 'Cibitube потребляет ~30 MB RAM вместо 500+ MB у Electron-клиентов.',
      ab_h2_t: 'Безопасность',
      ab_h2_d: 'Никаких ключей и токенов в коде, аккуратная работа с конфигурациями и правами доступа.',
      ab_h3_t: 'Окружение',
      ab_h3_d: 'Ежедневно работаю в Linux (Arch / CachyOS), Git и Docker.',
      faq_kicker: '08 / FAQ',
      faq_title: 'Частые вопросы',
      faq1_q: 'Как формируется стоимость и как проходит оплата?',
      faq1_a: 'После обсуждения задачи я фиксирую итоговую сумму и сроки. Небольшие задачи можно оплатить после показа рабочего демо, более крупные — поэтапно (например, 50% после согласования ТЗ и 50% при передаче).',
      faq2_q: 'Что нужно для старта работы?',
      faq2_a: 'Достаточно описать задачу своими словами: какой нужен результат, кто будет пользоваться и есть ли примеры. Помогу составить список требований и выбрать стек.',
      faq3_q: 'Сколько времени занимает разработка?',
      faq3_a: 'Парсер или базовый Telegram-бот — обычно 2–5 дней. Backend API или бот со сложными интеграциями — от 1 до 3 недель в зависимости от объёма.',
      faq4_q: 'Как обстоят дела с правками?',
      faq4_a: 'Корректировки в рамках согласованного ТЗ вносятся бесплатно по ходу промежуточных показов. Дополнительные функции сверх плана оцениваются отдельно.',
      faq5_q: 'Помогаете с хостингом и деплоем?',
      faq5_a: 'Да: готовлю Docker-контейнеры, настраиваю запуск на VPS (Linux + Nginx + HTTPS) или публикацию статики на GitHub Pages и передаю исходный код.',
      faq6_q: 'Есть ли поддержка после сдачи?',
      faq6_a: 'В течение 14 дней после запуска бесплатно исправляю возможные баги. Дальнейшие доработки — по договорённости.',
      contact_kicker: '09 / Контакты',
      contact_title: 'Связаться со мной',
      contact_desc: 'Заполните короткую форму — она соберёт готовое сообщение для Telegram.',
      form_service: 'Направление',
      form_budget: 'Бюджет / срок',
      form_budget_ph: 'Например: до 15 000 ₽, за неделю',
      form_details: 'Описание задачи',
      form_details_ph: 'Что нужно сделать, какие функции важны...',
      form_copy: 'Скопировать текст',
      form_tg: 'Отправить в Telegram',
      ch_tg_sub: '@Zch_Cibitka',
      ch_gh_sub: 'github.com/Cibitka',
      ch_boosty_sub: 'boosty.to/zch_cibitka',
      footer_copy: '© 2026 Cibitka.',
      toast_copied: 'Текст скопирован',
      toast_service_selected: 'Направление выбрано в форме',
      toast_order_sent: 'Демо-заказ оформлен',
      modal_bot_title: 'Демо Telegram-бота (@CibitkaDemoBot)',
      modal_landing_title: 'Демо коммерческого лендинга — Nordic Roast'
    },
    en: {
      skip: 'Skip to content',
      nav_services: 'Services',
      nav_portfolio: 'Portfolio',
      nav_stack: 'Stack',
      nav_process: 'Process',
      nav_about: 'About',
      nav_faq: 'FAQ',
      nav_contact: 'Contact',
      hero_status: '// python backend · telegram bots · rust',
      hero_title_1: 'Alexander (Cibitka) — ',
      hero_title_accent: 'Python Backend',
      hero_title_2: ', Bots & Automation',
      hero_sub: 'I build async FastAPI/Django APIs, aiogram 3 Telegram bots, scrapers, and native Rust tools for Linux. Clear scope and pricing upfront, clean code with setup instructions.',
      hero_cta_primary: 'Discuss a project',
      hero_cta_secondary: 'Projects',
      metric_exp_val: '3+ years',
      metric_exp_lbl: 'Python experience',
      metric_os_val: 'Cibitube',
      metric_os_lbl: 'Open Source (MIT)',
      metric_ram_val: '~30 MB',
      metric_ram_lbl: 'RAM in Cibitube',
      term_title: 'cibitka@arch:~/portfolio',
      term_placeholder: 'Type /help, /projects, /stack...',
      term_run: 'Run',
      services_kicker: '03 / Services & Pricing',
      services_title: 'Core services',
      services_desc: 'Three focused engineering areas with indicative starting rates. Final quote is fixed after scoping.',
      srv1_title: 'Backend & API',
      srv1_desc: 'Async REST and WebSocket APIs, database design, and third-party integrations.',
      srv1_price: 'from 15,000 ₽',
      srv1_eta: 'from 5 days',
      srv1_f1: 'Typed FastAPI or Django / DRF codebase',
      srv1_f2: 'PostgreSQL, Redis, migrations, OpenAPI',
      srv1_f3: 'Docker packaging and server deployment',
      srv2_title: 'Telegram Bots',
      srv2_desc: 'Bots for catalogs, bookings, notifications, payments, and CRM workflows.',
      srv2_price: 'from 8,000 ₽',
      srv2_eta: 'from 3 days',
      srv2_f1: 'Async aiogram 3 + SQLAlchemy',
      srv2_f2: 'Webhooks, payments, admin commands',
      srv2_f3: 'Error logging and auto-restart',
      srv3_title: 'Scraping & Automation',
      srv3_desc: 'Data collection, price monitoring, scheduled reports, and service synchronization.',
      srv3_price: 'from 5,000 ₽',
      srv3_eta: 'from 2 days',
      srv3_f1: 'Playwright, httpx, and BeautifulSoup4',
      srv3_f2: 'Export to CSV, Excel, Google Sheets, or Telegram',
      srv3_f3: 'Scheduled runs (cron / Docker)',
      srv_btn: 'Select service',
      pricing_note: 'Indicative starting rates — final price and timeline are agreed before work begins.',
      port_kicker: '04 / Portfolio',
      port_title: 'Projects & live demos',
      port_desc: 'Public GitHub repositories and interactive prototypes you can test right here.',
      filter_all: 'All',
      filter_real: 'Open Source',
      filter_demo: 'Demos',
      p1_type: 'Open Source · Rust / Linux',
      p1_title: 'Cibitube — Native YouTube Music Client',
      p1_desc: 'Native Linux desktop client in Rust (egui/eframe + MPV IPC + yt-dlp). Uses ~30 MB RAM vs 500+ MB for Electron, with Google Drive PC ↔ Android sync, cover/LRCLIB .lrc downloads, RU/EN UI, and AUR packaging.',
      p1_btn_gh: 'View on GitHub',
      p2_type: 'Demo · aiogram 3',
      p2_title: 'Telegram Order Bot Demo',
      p2_desc: 'Interactive client bot simulator: service catalog, order status check, and inline-button requests.',
      p2_btn_demo: 'Open bot demo',
      p3_type: 'Demo · HTML / CSS / JS',
      p3_title: 'Commercial Landing Demo',
      p3_desc: 'Lightweight small-business landing page with an interactive subscription price calculator.',
      p3_btn_demo: 'Open landing demo',
      p4_type: 'Open Source · Frontend',
      p4_title: 'Cibitka v2.0 (my-site)',
      p4_desc: 'This portfolio: pure HTML5, CSS3, Vanilla JS, 3D Perlin noise topographic background, interactive terminal, and RU/EN support.',
      p4_btn_gh: 'Source code',
      stack_kicker: '05 / Tech Stack',
      stack_title: 'Tools in active use',
      stack_desc: 'Technologies used directly across my projects and repositories.',
      st1_title: 'Python & Backend',
      st2_title: 'Bots & Automation',
      st3_title: 'Databases & DevOps',
      st4_title: 'Systems & Frontend',
      proc_kicker: '06 / Process',
      proc_title: 'How I work',
      proc_desc: 'Four straightforward steps from scoping to deployment.',
      pr1_t: 'Scope & Quote',
      pr1_d: 'Align on requirements, DB structure, timeline, and fixed cost.',
      pr2_t: 'Build & Demos',
      pr2_d: 'Write typed code and share working intermediate builds.',
      pr3_t: 'Testing',
      pr3_d: 'Verify error handling, query performance, and endpoint security.',
      pr4_t: 'Launch & Handoff',
      pr4_d: 'Deploy via Docker / Nginx or GitHub Pages with full source and docs.',
      about_kicker: '07 / About',
      about_title: 'About me',
      about_p1: 'I am Alexander (Cibitka), focused on Python backend services, Telegram bots, automation, and native Rust tools for Linux.',
      about_p2: 'I prefer maintainable, fast architectures without unnecessary dependencies or heavy frameworks where plain tools work better.',
      ab_h1_t: 'Performance',
      ab_h1_d: 'Cibitube uses ~30 MB RAM compared to 500+ MB for Electron apps.',
      ab_h2_t: 'Security',
      ab_h2_d: 'No hardcoded tokens, clean configuration handling, strict file permissions.',
      ab_h3_t: 'Environment',
      ab_h3_d: 'Daily workflow on Linux (Arch / CachyOS), Git, and Docker.',
      faq_kicker: '08 / FAQ',
      faq_title: 'Frequently asked questions',
      faq1_q: 'How is pricing determined and paid?',
      faq1_a: 'After scoping I fix the total price and timeline. Small tasks can be paid after a live demo; larger ones are split into milestones (e.g., 50% / 50%).',
      faq2_q: 'What do you need to get started?',
      faq2_a: 'A short description in your own words: desired outcome, users, and any references. I will help turn it into a clear spec.',
      faq3_q: 'How long does development take?',
      faq3_a: 'A scraper or basic Telegram bot usually takes 2–5 days. A full Backend API or multi-integration bot takes 1–3 weeks.',
      faq4_q: 'How do revisions work?',
      faq4_a: 'Adjustments within the agreed scope are included during intermediate demos. Extra features outside scope are quoted separately.',
      faq5_q: 'Do you help with hosting and deployment?',
      faq5_a: 'Yes — Docker setup, VPS deployment (Linux + Nginx + HTTPS), or GitHub Pages with full source handoff.',
      faq6_q: 'Is post-launch support included?',
      faq6_a: '14 days of free bug fixes after launch, with ongoing updates available as needed.',
      contact_kicker: '09 / Contact',
      contact_title: 'Get in touch',
      contact_desc: 'Fill out the short form to generate a ready-to-send Telegram message.',
      form_service: 'Service',
      form_budget: 'Budget / timeline',
      form_budget_ph: 'e.g., $200, within 1 week',
      form_details: 'Project details',
      form_details_ph: 'Describe what needs to be built...',
      form_copy: 'Copy text',
      form_tg: 'Open in Telegram',
      ch_tg_sub: '@Zch_Cibitka',
      ch_gh_sub: 'github.com/Cibitka',
      ch_boosty_sub: 'boosty.to/zch_cibitka',
      footer_copy: '© 2026 Cibitka.',
      toast_copied: 'Text copied',
      toast_service_selected: 'Service selected in form',
      toast_order_sent: 'Demo order placed',
      modal_bot_title: 'Telegram Bot Demo (@CibitkaDemoBot)',
      modal_landing_title: 'Commercial Landing Demo — Nordic Roast'
    }
  };

  let savedLang = 'ru';
  try {
    const stored = localStorage.getItem('cibitka_lang');
    if (stored === 'ru' || stored === 'en') savedLang = stored;
  } catch (e) {}

  const state = {
    lang: savedLang,
    portfolioFilter: 'all',
    termHistory: [],
    termHistIdx: -1,
    landingPlan: 'standard',
    landingWeight: 500
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  let toastTimer = null;
  function showToast(msg) {
    const el = $('#toast');
    if (!el) return;
    $('#toast-text').textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  function applyLanguage(lang) {
    state.lang = lang;
    document.documentElement.lang = lang;
    try { localStorage.setItem('cibitka_lang', lang); } catch (e) {}

    const dict = i18n[lang] || i18n.ru;
    $$('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });
    $$('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
    });

    const langLabel = $('#lang-label');
    if (langLabel) langLabel.textContent = lang === 'ru' ? 'EN' : 'RU';

    updateBriefPreview();
  }

  const terminalCommands = ['/help', '/about', '/projects', '/stack', '/services', '/links', '/whoami', '/lang', '/clear'];

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[ch]);
  }

  function appendTerm(html) {
    const body = $('#terminal-body');
    if (!body) return;
    const div = document.createElement('div');
    div.className = 'terminal-line';
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function printWelcome() {
    const body = $('#terminal-body');
    if (!body) return;
    body.innerHTML = '';
    if (state.lang === 'ru') {
      appendTerm('<span class="t-cmd">$</span> <span class="t-strong">/whoami</span>\n<span class="t-strong">Александр (Cibitka)</span> · Python Backend, Telegram-боты, Rust (Arch / CachyOS)');
      appendTerm('<span class="t-cmd">$</span> <span class="t-strong">/help</span>\n  <span class="t-cmd">/projects</span> — Cibitube и рабочие демо\n  <span class="t-cmd">/stack</span>    — стек технологий\n  <span class="t-cmd">/services</span> — услуги и прайс\n  <span class="t-cmd">/links</span>    — Telegram, GitHub, Boosty');
    } else {
      appendTerm('<span class="t-cmd">$</span> <span class="t-strong">/whoami</span>\n<span class="t-strong">Alexander (Cibitka)</span> · Python Backend, Telegram Bots, Rust (Arch / CachyOS)');
      appendTerm('<span class="t-cmd">$</span> <span class="t-strong">/help</span>\n  <span class="t-cmd">/projects</span> — Cibitube & demos\n  <span class="t-cmd">/stack</span>    — tech stack\n  <span class="t-cmd">/services</span> — services & pricing\n  <span class="t-cmd">/links</span>    — Telegram, GitHub, Boosty');
    }
  }

  function runTerminalCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    state.termHistory.unshift(cmd);
    state.termHistIdx = -1;

    appendTerm(`<span class="t-cmd">$</span> <span class="t-strong">${escapeHtml(cmd)}</span>`);

    const isRu = state.lang === 'ru';
    switch (cmd) {
      case '/help':
      case 'help':
        appendTerm(
          isRu
            ? `<span class="t-strong">Команды:</span>\n  <span class="t-cmd">/whoami</span>    — о разработчике\n  <span class="t-cmd">/projects</span>  — Cibitube и демо\n  <span class="t-cmd">/stack</span>     — стек технологий\n  <span class="t-cmd">/services</span>  — услуги и цены\n  <span class="t-cmd">/links</span>     — GitHub, Telegram, Boosty\n  <span class="t-cmd">/lang</span>      — RU / EN\n  <span class="t-cmd">/clear</span>     — очистить`
            : `<span class="t-strong">Commands:</span>\n  <span class="t-cmd">/whoami</span>    — developer info\n  <span class="t-cmd">/projects</span>  — Cibitube & demos\n  <span class="t-cmd">/stack</span>     — tech stack\n  <span class="t-cmd">/services</span>  — services & rates\n  <span class="t-cmd">/links</span>     — GitHub, Telegram, Boosty\n  <span class="t-cmd">/lang</span>      — RU / EN\n  <span class="t-cmd">/clear</span>     — clear`
        );
        break;
      case '/whoami':
      case '/about':
        appendTerm(
          isRu
            ? `<span class="t-strong">Александр (Cibitka)</span> · Python Backend & Rust\nОпыт: 3+ года | ОС: Arch / CachyOS`
            : `<span class="t-strong">Alexander (Cibitka)</span> · Python Backend & Rust\nExperience: 3+ yrs | OS: Arch / CachyOS`
        );
        break;
      case '/projects':
        appendTerm(
          isRu
            ? `1. <a class="t-link" href="https://github.com/Cibitka/Cibitube" target="_blank" rel="noopener noreferrer">Cibitube v0.2.10</a> — YouTube Music для Linux (Rust, ~30 MB RAM)\n2. <span class="t-strong">Telegram Bot Demo</span> — симулятор aiogram 3\n3. <span class="t-strong">Nordic Roast</span> — демо коммерческого лендинга\n4. <a class="t-link" href="https://github.com/Cibitka/my-site" target="_blank" rel="noopener noreferrer">my-site v2.0</a> — портфолио на HTML/CSS/JS`
            : `1. <a class="t-link" href="https://github.com/Cibitka/Cibitube" target="_blank" rel="noopener noreferrer">Cibitube v0.2.10</a> — YouTube Music for Linux (Rust, ~30 MB RAM)\n2. <span class="t-strong">Telegram Bot Demo</span> — aiogram 3 simulator\n3. <span class="t-strong">Nordic Roast</span> — commercial landing demo\n4. <a class="t-link" href="https://github.com/Cibitka/my-site" target="_blank" rel="noopener noreferrer">my-site v2.0</a> — pure HTML/CSS/JS portfolio`
        );
        break;
      case '/stack':
        appendTerm(
          `Backend:  Python 3.11+, FastAPI, Django/DRF, Asyncio, SQLAlchemy\nBots:     aiogram 3, Playwright, httpx, BS4, Webhooks\nInfra:    PostgreSQL, Redis, SQLite, Docker, Nginx, Linux\nSystems:  Rust (egui/eframe), MPV IPC, HTML5/CSS3/Vanilla JS`
        );
        break;
      case '/services':
        appendTerm(
          isRu
            ? `• Backend & API             — от 15 000 ₽ (от 5 дней)\n• Telegram-боты             — от 8 000 ₽  (от 3 дней)\n• Парсинг и автоматизация   — от 5 000 ₽  (от 2 дней)`
            : `• Backend & API             — from 15,000 ₽ (5+ days)\n• Telegram Bots             — from 8,000 ₽  (3+ days)\n• Scraping & Automation     — from 5,000 ₽  (2+ days)`
        );
        break;
      case '/links':
        appendTerm(
          `1. Telegram: <a class="t-link" href="https://t.me/Zch_Cibitka" target="_blank" rel="noopener noreferrer">t.me/Zch_Cibitka</a>\n2. GitHub:   <a class="t-link" href="https://github.com/Cibitka" target="_blank" rel="noopener noreferrer">github.com/Cibitka</a>\n3. Boosty:   <a class="t-link" href="https://boosty.to/zch_cibitka" target="_blank" rel="noopener noreferrer">boosty.to/zch_cibitka</a>`
        );
        break;
      case '/lang':
        applyLanguage(state.lang === 'ru' ? 'en' : 'ru');
        appendTerm(state.lang === 'ru' ? 'Язык: RU' : 'Language: EN');
        break;
      case '/clear':
      case 'clear':
        printWelcome();
        break;
      default:
        appendTerm(
          isRu
            ? `<span class="t-muted">Неизвестная команда: ${escapeHtml(cmd)}. Введите <span class="t-cmd">/help</span>.</span>`
            : `<span class="t-muted">Unknown command: ${escapeHtml(cmd)}. Type <span class="t-cmd">/help</span>.</span>`
        );
    }
  }

  function setPortfolioFilter(filter) {
    state.portfolioFilter = filter;
    $$('.filter-btn').forEach((btn) => {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    $$('.project-card').forEach((card) => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !show);
    });
  }

  function initFaq() {
    $$('.faq-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        $$('.faq-item').forEach((other) => {
          other.classList.remove('open');
          const otherBtn = $('.faq-trigger', other);
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function buildBriefText() {
    const service = $('#brief-service') ? $('#brief-service').value : 'Backend & API';
    const budget = ($('#brief-budget') ? $('#brief-budget').value : '').trim();
    const details = ($('#brief-details') ? $('#brief-details').value : '').trim();
    if (state.lang === 'ru') {
      return [
        `Привет, Александр! Хочу обсудить задачу:`,
        `• Направление: ${service}`,
        `• Бюджет / сроки: ${budget || 'обсудим'}`,
        `• Описание: ${details || 'расскажу в чате'}`
      ].join('\n');
    }
    return [
      `Hi Alexander! I'd like to discuss a project:`,
      `• Service: ${service}`,
      `• Budget / timeline: ${budget || 'open to discuss'}`,
      `• Details: ${details || 'will share in chat'}`
    ].join('\n');
  }

  function updateBriefPreview() {
    const pre = $('#brief-preview');
    const tgLink = $('#brief-tg-link');
    const text = buildBriefText();
    if (pre) pre.textContent = text;
    if (tgLink) {
      tgLink.href = `https://t.me/Zch_Cibitka?text=${encodeURIComponent(text)}`;
    }
  }

  function copyTextSafe(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast(i18n[state.lang].toast_copied),
        () => fallbackCopy(text)
      );
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    showToast(i18n[state.lang].toast_copied);
  }

  function openModal(id) {
    const modal = $(`#${id}`);
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const closeBtn = $('.modal-close', modal);
    if (closeBtn) closeBtn.focus();
  }

  function closeAllModals() {
    $$('.modal-backdrop').forEach((m) => {
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
  }

  function appendBotMsg(text, role) {
    const log = $('#tg-chat-log');
    if (!log) return;
    const div = document.createElement('div');
    div.className = `tg-msg ${role}`;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function resetBotDemo() {
    const log = $('#tg-chat-log');
    if (!log) return;
    log.innerHTML = '';
    appendBotMsg(
      state.lang === 'ru'
        ? 'Демо-бот на aiogram 3.\nВыберите команду ниже для проверки сценария:'
        : 'aiogram 3 demo bot.\nPick a command below to test the flow:',
      'bot'
    );
  }

  function handleBotAction(action) {
    const isRu = state.lang === 'ru';
    if (action === 'reset') {
      resetBotDemo();
      return;
    }
    const actions = {
      catalog: {
        user: isRu ? 'Каталог услуг' : 'Service catalog',
        bot: isRu
          ? 'Направления:\n1. Backend API (FastAPI) — от 15 000 ₽\n2. Telegram-бот (aiogram 3) — от 8 000 ₽\n3. Парсер / автоматизация — от 5 000 ₽'
          : 'Services:\n1. Backend API (FastAPI) — from 15,000 ₽\n2. Telegram Bot (aiogram 3) — from 8,000 ₽\n3. Scraper / Automation — from 5,000 ₽'
      },
      status: {
        user: isRu ? 'Статус #402' : 'Status #402',
        bot: isRu
          ? 'Заказ #402 (Telegram-бот):\n• Этап: Тестирование вебхуков\n• Прогресс: 80%'
          : 'Order #402 (Telegram bot):\n• Stage: Webhook testing\n• Progress: 80%'
      },
      order: {
        user: isRu ? 'Оставить заявку' : 'Submit request',
        bot: isRu
          ? 'Заявка #403 сохранена и передана администратору.'
          : 'Request #403 saved and forwarded to admin.'
      }
    };
    const item = actions[action];
    if (!item) return;
    appendBotMsg(item.user, 'user');
    setTimeout(() => appendBotMsg(item.bot, 'bot'), 150);
  }

  function updateLandingDemo() {
    const basePrices = { starter: 890, standard: 1490, pro: 2590 };
    const weightMult = state.landingWeight === 250 ? 0.6 : state.landingWeight === 1000 ? 1.8 : 1;
    const total = Math.round((basePrices[state.landingPlan] || 1490) * weightMult);
    const totalEl = $('#landing-demo-total');
    if (totalEl) {
      totalEl.textContent = `${total.toLocaleString('ru-RU')} ₽ / мес`;
    }
  }

  function initNavObserver() {
    if (!('IntersectionObserver' in window)) return;
    const sections = $$('main section[id]');
    const navObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            $$('.nav-desktop .nav-link').forEach((a) => {
              a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-35% 0px -55% 0px' }
    );
    sections.forEach((s) => navObs.observe(s));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTopoBackground();
    applyLanguage(state.lang);
    printWelcome();
    initFaq();
    initNavObserver();
    resetBotDemo();
    updateLandingDemo();

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    const langBtn = $('#lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        applyLanguage(state.lang === 'ru' ? 'en' : 'ru');
        printWelcome();
        resetBotDemo();
      });
    }

    const menuBtn = $('#mobile-menu-btn');
    const mobileNav = $('#mobile-nav');
    if (menuBtn && mobileNav) {
      menuBtn.addEventListener('click', () => {
        const open = mobileNav.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(open));
      });
      $$('a', mobileNav).forEach((link) => {
        link.addEventListener('click', () => {
          mobileNav.classList.remove('open');
          menuBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }

    const termForm = $('#terminal-form');
    const termInput = $('#terminal-input');
    if (termForm && termInput) {
      termForm.addEventListener('submit', (e) => {
        e.preventDefault();
        runTerminalCommand(termInput.value);
        termInput.value = '';
      });
      termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const val = termInput.value.trim().toLowerCase();
          const match = terminalCommands.find((c) => c.startsWith(val));
          if (match) termInput.value = match;
        } else if (e.key === 'ArrowUp') {
          if (state.termHistory.length > 0) {
            e.preventDefault();
            state.termHistIdx = Math.min(state.termHistIdx + 1, state.termHistory.length - 1);
            termInput.value = state.termHistory[state.termHistIdx];
          }
        } else if (e.key === 'ArrowDown') {
          if (state.termHistIdx > 0) {
            e.preventDefault();
            state.termHistIdx -= 1;
            termInput.value = state.termHistory[state.termHistIdx];
          } else {
            state.termHistIdx = -1;
            termInput.value = '';
          }
        }
      });
    }

    $$('.term-chip').forEach((chip) => {
      chip.addEventListener('click', () => runTerminalCommand(chip.dataset.cmd || '/help'));
    });

    $$('.service-select-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.service;
        const sel = $('#brief-service');
        if (sel && val) {
          sel.value = val;
          updateBriefPreview();
          showToast(i18n[state.lang].toast_service_selected);
        }
      });
    });

    $$('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => setPortfolioFilter(btn.dataset.filter || 'all'));
    });

    $$('[data-open-modal]').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.dataset.openModal));
    });
    $$('.modal-close').forEach((btn) => {
      btn.addEventListener('click', closeAllModals);
    });
    $$('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeAllModals();
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllModals();
    });

    $$('[data-bot-action]').forEach((btn) => {
      btn.addEventListener('click', () => handleBotAction(btn.dataset.botAction));
    });

    const planSel = $('#landing-plan');
    const weightSel = $('#landing-weight');
    if (planSel) {
      planSel.addEventListener('change', (e) => {
        state.landingPlan = e.target.value;
        updateLandingDemo();
      });
    }
    if (weightSel) {
      weightSel.addEventListener('change', (e) => {
        state.landingWeight = Number(e.target.value);
        updateLandingDemo();
      });
    }
    const landingOrderBtn = $('#landing-demo-order');
    if (landingOrderBtn) {
      landingOrderBtn.addEventListener('click', () => {
        showToast(i18n[state.lang].toast_order_sent);
      });
    }

    ['#brief-service', '#brief-budget', '#brief-details'].forEach((id) => {
      const el = $(id);
      if (el) el.addEventListener('input', updateBriefPreview);
    });
    const copyBtn = $('#brief-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => copyTextSafe(buildBriefText()));
    }
  });
})();
