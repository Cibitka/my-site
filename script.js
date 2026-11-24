(function () {
  'use strict';

  /* =========================================================
     1. CENTRALIZED PRICING CONFIG (Easy to edit)
     ========================================================= */
  const PRICING_CONFIG = {
    currency: '₽',
    projectTypes: [
      {
        id: 'backend',
        basePrice: 15000,
        name: { ru: 'Backend & API', en: 'Backend & API' },
        addons: [
          { id: 'auth', price: 4000, name: { ru: 'Авторизация JWT / OAuth', en: 'JWT / OAuth authentication' } },
          { id: 'db', price: 3500, name: { ru: 'Сложная схема БД + миграции', en: 'Complex DB schema + migrations' } },
          { id: 'redis', price: 2500, name: { ru: 'Кеширование Redis / очереди', en: 'Redis caching / queues' } },
          { id: 'docker', price: 2000, name: { ru: 'Docker Compose + деплой на VPS', en: 'Docker Compose + VPS deploy' } }
        ]
      },
      {
        id: 'bot',
        basePrice: 8000,
        name: { ru: 'Telegram-боты', en: 'Telegram Bots' },
        addons: [
          { id: 'bot_db', price: 2500, name: { ru: 'Хранение данных в PostgreSQL / SQLite', en: 'PostgreSQL / SQLite storage' } },
          { id: 'bot_admin', price: 3000, name: { ru: 'Админ-панель и рассылки', en: 'Admin panel & broadcasts' } },
          { id: 'bot_pay', price: 3500, name: { ru: 'Интеграция оплаты / вебхуков', en: 'Payments / webhooks integration' } },
          { id: 'bot_deploy', price: 1500, name: { ru: 'Запуск на сервере в Docker', en: 'Docker server deployment' } }
        ]
      },
      {
        id: 'parsing',
        basePrice: 5000,
        name: { ru: 'Парсинг и автоматизация', en: 'Scraping & Automation' },
        addons: [
          { id: 'js_render', price: 2500, name: { ru: 'Динамические сайты (Playwright)', en: 'Dynamic sites (Playwright)' } },
          { id: 'export', price: 1500, name: { ru: 'Выгрузка в Excel / Google Sheets', en: 'Excel / Google Sheets export' } },
          { id: 'schedule', price: 1500, name: { ru: 'Запуск по расписанию + уведомления', en: 'Scheduled runs + alerts' } },
          { id: 'proxy', price: 2000, name: { ru: 'Ротация прокси и ретраи', en: 'Proxy rotation & retries' } }
        ]
      },
      {
        id: 'bugfix',
        basePrice: 500,
        name: { ru: 'Исправление ошибок сайта', en: 'Website Bug Fixing' },
        addons: [
          { id: 'urgent', price: 500, name: { ru: 'Срочная диагностика и правка', en: 'Priority diagnosis & fix' } },
          { id: 'cross', price: 700, name: { ru: 'Проверка мобильных браузеров', en: 'Mobile browser QA' } },
          { id: 'js_bug', price: 800, name: { ru: 'Исправление логики JavaScript', en: 'JavaScript logic fix' } }
        ]
      },
      {
        id: 'site_upgrade',
        basePrice: 700,
        name: { ru: 'Доработка существующего сайта', en: 'Existing Site Improvements' },
        addons: [
          { id: 'new_block', price: 1000, name: { ru: 'Добавление новой секции', en: 'Add a new section' } },
          { id: 'form_mod', price: 900, name: { ru: 'Форма заявки / модальное окно', en: 'Contact form / modal' } },
          { id: 'seo_fix', price: 800, name: { ru: 'Базовая SEO-оптимизация', en: 'Basic SEO optimization' } }
        ]
      },
      {
        id: 'python_script',
        basePrice: 1000,
        name: { ru: 'Python-скрипты', en: 'Python Scripts' },
        addons: [
          { id: 'cli', price: 700, name: { ru: 'Удобный CLI-интерфейс и конфиг', en: 'CLI arguments & config' } },
          { id: 'files', price: 1000, name: { ru: 'Обработка Excel / CSV / JSON', en: 'Excel / CSV / JSON processing' } },
          { id: 'api_call', price: 1500, name: { ru: 'Интеграция с внешним API', en: 'External API integration' } }
        ]
      },
      {
        id: 'responsive_layout',
        basePrice: 1500,
        name: { ru: 'Адаптивная вёрстка', en: 'Responsive Layout' },
        addons: [
          { id: 'extra_sec', price: 1000, name: { ru: 'Дополнительные секции (до 3)', en: 'Extra sections (up to 3)' } },
          { id: 'micro', price: 800, name: { ru: 'Интерактивные элементы (JS)', en: 'Interactive JS elements' } },
          { id: 'a11y', price: 700, name: { ru: 'ARIA-доступность и клавиатура', en: 'ARIA & keyboard navigation' } }
        ]
      },
      {
        id: 'business_card',
        basePrice: 2500,
        name: { ru: 'Сайт-визитка', en: 'Business Card Website' },
        addons: [
          { id: 'ru_en', price: 1200, name: { ru: 'Переключение языка RU / EN', en: 'RU / EN language switcher' } },
          { id: 'gh_pages', price: 500, name: { ru: 'Публикация на GitHub Pages', en: 'GitHub Pages deployment' } },
          { id: 'seo_pack', price: 800, name: { ru: 'SEO, Open Graph и favicon', en: 'SEO, Open Graph & favicon' } }
        ]
      },
      {
        id: 'landing',
        basePrice: 4000,
        name: { ru: 'Коммерческий лендинг', en: 'Commercial Landing Page' },
        addons: [
          { id: 'l_calc', price: 2000, name: { ru: 'Интерактивный калькулятор цены', en: 'Interactive price calculator' } },
          { id: 'l_lang', price: 1500, name: { ru: 'Двуязычная версия RU / EN', en: 'Bilingual RU / EN version' } },
          { id: 'l_seo', price: 1000, name: { ru: 'Полный SEO-пакет + Schema.org', en: 'Full SEO pack + Schema.org' } },
          { id: 'l_deploy', price: 700, name: { ru: 'Настройка хостинга / GitHub Pages', en: 'Hosting / GitHub Pages setup' } }
        ]
      }
    ]
  };

  /* =========================================================
     2. CIBITUBE GALLERY & GITHUB API CONFIG (with Fallbacks)
     ========================================================= */
  const CIBITUBE_FALLBACK = {
    version: 'v0.2.10',
    stars: 0,
    updated: '2026-11-20',
    releaseUrl: 'https://github.com/Cibitka/Cibitube/releases/tag/v0.2.10'
  };

  const CIBITUBE_MEDIA = [
    {
      src: 'https://raw.githubusercontent.com/Cibitka/Cibitube/main/docs/media/now-playing.png',
      path: 'docs/media/now-playing.png',
      title: { ru: 'Now Playing — экран воспроизведения', en: 'Now Playing screen' }
    },
    {
      src: 'https://raw.githubusercontent.com/Cibitka/Cibitube/main/docs/media/favorites.png',
      path: 'docs/media/favorites.png',
      title: { ru: 'Favorites — избранные треки', en: 'Favorites playlist view' }
    },
    {
      src: 'https://raw.githubusercontent.com/Cibitka/Cibitube/main/docs/media/my-wave.png',
      path: 'docs/media/my-wave.png',
      title: { ru: 'My Wave — персональная волна', en: 'My Wave recommendations' }
    },
    {
      src: 'https://raw.githubusercontent.com/Cibitka/Cibitube/main/docs/media/terminal-lyrics.png',
      path: 'docs/media/terminal-lyrics.png',
      title: { ru: 'Terminal Lyrics — тексты песен в терминале', en: 'Terminal synced lyrics' }
    }
  ];

  /* =========================================================
     3. TOPOGRAPHIC ISOLINES BACKGROUND (Optimized)
     ========================================================= */
  class FastNoise {
    constructor(seed = 42) {
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
    const levels = [0.22, 0.38, 0.54, 0.7];
    const scale = 0.5;
    const cellSize = 20;
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
      const freq = 0.004 / scale;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          field[y * cols + x] = (noise.noise3D(x * cellSize * freq, y * cellSize * freq, zOff) + 1) * 0.5;
        }
      }
      ctx.lineWidth = 1;
      for (let li = 0; li < levels.length; li++) {
        const level = levels[li];
        ctx.strokeStyle = li % 2 === 0 ? 'rgba(32, 178, 170, 0.22)' : 'rgba(16, 122, 118, 0.28)';
        ctx.beginPath();
        for (let y = 0; y < rows - 1; y++) {
          for (let x = 0; x < cols - 1; x++) {
            const idx = y * cols + x;
            const tl = field[idx], tr = field[idx + 1], br = field[idx + cols + 1], bl = field[idx + cols];
            let st = 0;
            if (tl > level) st |= 8;
            if (tr > level) st |= 4;
            if (br > level) st |= 2;
            if (bl > level) st |= 1;
            if (st === 0 || st === 15) continue;

            const px = x * cellSize, py = y * cellSize;
            const top = [px + interp(tl, tr, level) * cellSize, py];
            const right = [px + cellSize, py + interp(tr, br, level) * cellSize];
            const bottom = [px + interp(bl, br, level) * cellSize, py + cellSize];
            const left = [px, py + interp(tl, bl, level) * cellSize];
            const seg = (a, b) => { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); };

            switch (st) {
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
      if (document.hidden) {
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(loop);
      if (ts - lastFrame < 36) return;
      lastFrame = ts;
      zOff += 0.002;
      drawFrame();
    }

    function startLoop() {
      if (!reducedMotion && !document.hidden && !rafId) {
        rafId = requestAnimationFrame(loop);
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else {
        startLoop();
      }
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 140);
    }, { passive: true });

    resize();
    startLoop();
  }

  /* =========================================================
     4. I18N DICTIONARY (RU / EN)
     ========================================================= */
  const i18n = {
    ru: {
      skip: 'Перейти к содержимому',
      nav_services: 'Услуги',
      nav_calc: 'Калькулятор',
      nav_portfolio: 'Портфолио',
      nav_stack: 'Стек',
      nav_process: 'Процесс',
      nav_about: 'О себе',
      nav_faq: 'FAQ',
      nav_contact: 'Контакты',
      hero_status: '// python backend · telegram bots · web · rust',
      hero_title_1: 'Александр (Cibitka) — ',
      hero_title_accent: 'Python-разработка',
      hero_title_2: ', боты и веб-задачи',
      hero_sub: 'Разрабатываю API на FastAPI и Django, Telegram-ботов на aiogram 3, парсеры, лендинги и выполняю точечные доработки сайтов. Смета и сроки фиксируются до начала работы.',
      hero_cta_calc: 'Рассчитать стоимость',
      hero_cta_secondary: 'Проекты и демо',
      metric_1_val: 'от 500 ₽',
      metric_1_lbl: 'мелкие правки',
      metric_2_val: 'Cibitube',
      metric_2_lbl: 'Open Source (MIT)',
      metric_3_val: 'RU / EN',
      metric_3_lbl: 'прямой контакт',
      term_title: 'cibitka@arch:~/portfolio (browser sim)',
      term_placeholder: 'Введите /help, /pricing, /projects...',
      term_run: 'Run',
      services_kicker: '03 / Услуги и цены',
      services_title: 'Основные направления и небольшие задачи',
      services_desc: 'Все цены ориентировочные. Выберите подходящий вариант — форма ТЗ и калькулятор заполнятся автоматически.',
      srv1_title: 'Backend & API',
      srv1_desc: 'Асинхронные REST и WebSocket API, проектирование БД и интеграции с внешними сервисами.',
      srv1_price: 'от 15 000 ₽',
      srv1_eta: 'ориентир',
      srv1_f1: 'FastAPI или Django / DRF',
      srv1_f2: 'PostgreSQL, Redis, документация OpenAPI',
      srv1_f3: 'Упаковка в Docker и настройка запуска',
      srv2_title: 'Telegram-боты',
      srv2_desc: 'Боты для каталогов, приёма заявок, уведомлений, рассылок и интеграции с БД.',
      srv2_price: 'от 8 000 ₽',
      srv2_eta: 'ориентир',
      srv2_f1: 'Асинхронный aiogram 3 и SQLAlchemy',
      srv2_f2: 'Вебхуки, роли и админ-команды',
      srv2_f3: 'Логирование ошибок и инструкция деплоя',
      srv3_title: 'Парсинг и автоматизация',
      srv3_desc: 'Сбор данных с сайтов, мониторинг цен, регулярные отчёты и синхронизация сервисов.',
      srv3_price: 'от 5 000 ₽',
      srv3_eta: 'ориентир',
      srv3_f1: 'Playwright, httpx и BeautifulSoup4',
      srv3_f2: 'Выгрузка в CSV, JSON, Excel или Telegram',
      srv3_f3: 'Запуск по расписанию (cron / Docker)',
      srv_btn: 'Выбрать услугу',
      small_tasks_heading: 'Небольшие заказы и точечные задачи',
      small_tasks_tag: 'быстрый старт',
      sm1_title: 'Исправление ошибок сайта',
      sm1_price: 'от 500 ₽',
      sm1_desc: 'Поиск и устранение багов вёрстки, стилей CSS, скриптов JavaScript и консольных ошибок.',
      sm1_f1: 'Диагностика проблемы и точечный фикс',
      sm1_f2: 'Проверка в мобильных и десктопных браузерах',
      sm2_title: 'Доработка существующего сайта',
      sm2_price: 'от 700 ₽',
      sm2_desc: 'Добавление новых блоков, форм, модальных окон, переключателей и улучшение структуры.',
      sm2_f1: 'Аккуратные правки в текущем стиле сайта',
      sm2_f2: 'Без поломки уже работающего функционала',
      sm3_title: 'Python-скрипты',
      sm3_price: 'от 1 000 ₽',
      sm3_desc: 'Утилиты для обработки файлов, CSV/Excel, автоматизации рутины и работы с API.',
      sm3_f1: 'Чистый Python-код с requirements.txt',
      sm3_f2: 'Понятная инструкция по запуску',
      sm4_title: 'Адаптивная вёрстка',
      sm4_price: 'от 1 500 ₽',
      sm4_desc: 'Вёрстка страниц и секций на HTML5/CSS3 (Grid/Flexbox) под смартфоны, планшеты и ПК.',
      sm4_f1: 'Семантическая разметка и базовое SEO',
      sm4_f2: 'Корректное отображение от 320px до 1920px',
      sm5_title: 'Сайт-визитка',
      sm5_price: 'от 2 500 ₽',
      sm5_desc: 'Лаконичный одностраничный сайт специалиста или студии с контактами и публикацией.',
      sm5_f1: 'Адаптивный HTML/CSS/JS без лишнего веса',
      sm5_f2: 'Помощь с размещением на GitHub Pages',
      sm6_title: 'Коммерческий лендинг',
      sm6_price: 'от 4 000 ₽',
      sm6_desc: 'Посадочная страница под услугу или продукт с блоком цен, FAQ, калькулятором и формой заявки.',
      sm6_f1: 'Интерактивные блоки, SEO-метатеги и OG',
      sm6_f2: 'Полная передача исходников и деплой',
      pricing_note: 'Все цены ориентировочные и не являются публичной офертой. Итоговая стоимость и сроки согласовываются после оценки ТЗ.',
      calc_kicker: '04 / Калькулятор стоимости',
      calc_title: 'Предварительный расчёт заказа',
      calc_desc: 'Выберите тип проекта и нужные опции — смета обновится автоматически. Готовый расчёт можно сразу перенести в форму ТЗ или отправить в Telegram.',
      calc_step1: '1. Выберите тип проекта',
      calc_step2: '2. Дополнительные опции для выбранного типа',
      calc_summary_title: 'Предварительная смета',
      calc_reset: 'Сбросить',
      calc_total_label: 'Ориентировочно:',
      calc_to_form: 'Передать в форму ТЗ',
      calc_copy: 'Скопировать',
      port_kicker: '05 / Портфолио',
      port_title: 'Реальный Open Source и рабочие демо',
      port_desc: 'Открытые проекты на GitHub и интерактивные браузерные демонстрации с тестовыми данными.',
      filter_all: 'Все',
      filter_real: 'Open Source',
      filter_demo: 'Демо',
      gallery_fullscreen: 'На весь экран',
      p1_type: 'Open Source · Rust / Linux',
      p1_title: 'Cibitube — нативный клиент YouTube Music',
      p1_desc: 'Десктопный клиент YouTube Music на Rust без Electron с собственным графическим интерфейсом, синхронизацией через Google Drive и загрузчиком с обложками и текстами .lrc.',
      gh_ver: 'Версия:',
      gh_stars: 'Звёзды:',
      gh_updated: 'Обновлён:',
      cibi_arch_lbl: 'Архитектура:',
      cibi_arch_val: 'Rust (2021), GUI на egui / eframe 0.30, воспроизведение через MPV IPC, загрузка и метаданные через yt-dlp + ffmpeg, тексты песен из LRCLIB, бессерверная синхронизация через cibitube_sync_state.json в Google Drive.',
      cibi_plat_lbl: 'Платформы:',
      cibi_plat_val: 'Linux (Arch Linux / AUR, Ubuntu / Debian, Fedora); Android-клиент в разработке.',
      p1_btn_gh: 'Исходный код',
      p1_btn_rel: 'Последний релиз',
      badge_browser_sim: 'Браузерная симуляция',
      p_api_type: 'Демо · REST API',
      p_api_title: 'Интерактивное демо REST API',
      p_api_desc: 'Тестовый клиент для проверки GET, POST и DELETE запросов на вымышленных задачах с кодами ответа и JSON-структурой. Работает локально в браузере (JS-симуляция, без реального Python-бэкенда).',
      p_api_btn: 'Открыть REST API демо',
      p2_type: 'Демо · Telegram-бот',
      p2_title: 'Демо Telegram-бота для заявок',
      p2_desc: 'Симуляция сценариев клиентского бота (каталог, статус заказа, создание заявки). Реализована на JavaScript в браузере для демонстрации UX-логики без подключения к серверу.',
      p2_btn_demo: 'Открыть демо бота',
      p3_type: 'Демо · Коммерческий лендинг',
      p3_title: 'Лендинг Nordic Roast и калькулятор подписки',
      p3_desc: 'Вымышленный концепт лендинга для малого бизнеса с интерактивным расчётом тарифа, веса и периодичности доставки прямо в браузере.',
      p3_btn_demo: 'Открыть демо лендинга',
      p4_type: 'Open Source · Frontend',
      p4_title: 'Cibitka v2.1 (my-site)',
      p4_desc: 'Этот сайт на чистом HTML, CSS и Vanilla JS без фреймворков: калькулятор стоимости, галерея Cibitube с GitHub API, терминал, SEO и полная локализация RU/EN.',
      p4_btn_gh: 'Исходный код',
      stack_kicker: '06 / Технологический стек',
      stack_title: 'Подтверждённые технологии',
      stack_desc: 'Инструменты, с которыми я реально работаю в проектах и публичных репозиториях.',
      st1_title: 'Python & Backend',
      st2_title: 'Боты и автоматизация',
      st3_title: 'Базы данных и DevOps',
      st4_title: 'Системное и Frontend',
      proc_kicker: '07 / Этапы работы',
      proc_title: 'Как проходит работа над заказом',
      proc_desc: 'Понятная последовательность шагов — удобно даже если вы заказываете разработку впервые.',
      pr1_t: 'Обсуждение и смета',
      pr1_d: 'Вы описываете задачу своими словами, я уточняю детали и фиксирую итоговую стоимость и сроки.',
      pr2_t: 'Разработка и показы',
      pr2_d: 'Реализую задачу по этапам и показываю промежуточные результаты, чтобы всё соответствовало ожиданиям.',
      pr3_t: 'Проверка и правки',
      pr3_d: 'Тестирую обработку ошибок, адаптивность и базовую безопасность, вношу согласованные корректировки.',
      pr4_t: 'Передача и запуск',
      pr4_d: 'Передаю исходный код, помогаю с публикацией (GitHub Pages / Docker / VPS) и оставляю инструкцию.',
      about_kicker: '08 / О себе',
      about_title: 'О разработчике',
      about_p1: 'Меня зовут Александр (Cibitka). Занимаюсь разработкой на Python (FastAPI, Django, aiogram 3, парсинг), вёрсткой сайтов на HTML/CSS/JS и развиваю открытый Linux-проект Cibitube на Rust.',
      about_p2: 'Предпочитаю простые и поддерживаемые решения без лишней сложности. Берусь как за небольшие правки и скрипты от 500 ₽, так и за полноценных ботов, API и лендинги.',
      ab_h1_t: 'Открытый код',
      ab_h1_d: 'Реальные проекты и коммиты доступны на GitHub без закрытых витрин.',
      ab_h2_t: 'Безопасность и порядок',
      ab_h2_d: 'Без ключей и токенов в публичном коде, аккуратная структура и валидация ввода.',
      ab_h3_t: 'Рабочее окружение',
      ab_h3_d: 'Linux (Arch / CachyOS), Git, Docker и GitHub Pages.',
      faq_kicker: '09 / FAQ',
      faq_title: 'Частые вопросы',
      faq1_q: 'Как формируется стоимость и как проходит оплата?',
      faq1_a: 'Калькулятор на сайте даёт ориентировочную оценку. После обсуждения деталей я называю точную стоимость и сроки. Небольшие задачи оплачиваются после демонстрации результата, крупные — поэтапно.',
      faq2_q: 'Можно ли обратиться без готового технического задания?',
      faq2_a: 'Да. Опишите задачу простыми словами в форме ниже или в Telegram — я задам несколько уточняющих вопросов и помогу оформить понятный план.',
      faq3_q: 'Берёте ли небольшие правки и скрипты?',
      faq3_a: 'Да: исправление ошибок сайта от 500 ₽, доработки от 700 ₽, Python-скрипты от 1 000 ₽ и адаптивная вёрстка от 1 500 ₽.',
      faq4_q: 'Помогаете с публикацией и запуском?',
      faq4_a: 'Да: помогаю опубликовать статический сайт на GitHub Pages или упаковать Python-сервис/бота в Docker с инструкцией по запуску на сервере.',
      contact_kicker: '10 / Контакты и генератор ТЗ',
      contact_title: 'Обсудить задачу',
      contact_desc: 'Заполните форму — она соберёт структурированное сообщение для Telegram. Данные не отправляются на сторонние серверы.',
      form_service: 'Тип проекта',
      form_estimate: 'Результат калькулятора',
      form_estimate_ph: 'Не рассчитано (можно заполнить в калькуляторе)',
      form_details: 'Описание задачи *',
      form_details_ph: 'Опишите, что нужно сделать или исправить...',
      form_features: 'Необходимый функционал',
      form_features_ph: 'Например: форма заявки, адаптив, выгрузка в CSV...',
      form_budget: 'Бюджет',
      form_budget_ph: 'Например: до 10 000 ₽',
      form_deadline: 'Желаемые сроки',
      form_deadline_ph: 'Например: 3–5 дней',
      form_preview_lbl: 'Предварительный просмотр сообщения',
      form_tg: 'Отправить в Telegram',
      form_copy: 'Скопировать ТЗ',
      footer_copy: '© 2026 Cibitka · v2.1',
      lb_prev: 'Предыдущий',
      lb_next: 'Следующий',
      modal_api_title: 'Демо REST API (симуляция)',
      sim_api_note: 'Это браузерная симуляция на JavaScript с вымышленными тестовыми данными. Реальный Python-сервер не запущен — интерфейс показывает формат REST-запросов и JSON-ответов.',
      api_payload_lbl: 'Тело запроса (JSON)',
      api_send: 'Отправить запрос',
      api_reset: 'Сбросить данные',
      modal_bot_title: 'Демо Telegram-бота (@CibitkaDemoBot)',
      sim_bot_note: 'Браузерная JS-симуляция на вымышленных данных — показывает логику меню aiogram 3 без подключения к Telegram API.',
      bot_btn_cat: 'Каталог услуг',
      bot_btn_st: 'Статус #402',
      bot_btn_ord: 'Оставить заявку',
      modal_landing_title: 'Демо лендинга — Nordic Roast',
      sim_landing_note: 'Демонстрационный коммерческий прототип с вымышленным брендом и тестовыми ценами.',
      nr_title: 'Подписка на свежеобжаренный кофе',
      nr_sub: 'Выберите сорт, вес и частоту доставки — цена пересчитается мгновенно.',
      nr_plan: 'Сорт',
      nr_weight: 'Вес',
      nr_freq: 'Частота доставки',
      nr_total_lbl: 'Итого',
      nr_order_btn: 'Оформить демо-заказ',
      toast_copied: 'Скопировано в буфер обмена',
      toast_calc_copied: 'Расчёт сметы скопирован',
      toast_calc_sent: 'Смета перенесена в форму ТЗ',
      toast_calc_reset: 'Параметры калькулятора сброшены',
      toast_service_selected: 'Услуга выбрана в форме ТЗ',
      toast_order_sent: 'Демо-заказ оформлен (тестовый режим)',
      err_details_req: 'Добавьте короткое описание задачи (минимум 5 символов).'
    },
    en: {
      skip: 'Skip to content',
      nav_services: 'Services',
      nav_calc: 'Calculator',
      nav_portfolio: 'Portfolio',
      nav_stack: 'Stack',
      nav_process: 'Process',
      nav_about: 'About',
      nav_faq: 'FAQ',
      nav_contact: 'Contact',
      hero_status: '// python backend · telegram bots · web · rust',
      hero_title_1: 'Alexander (Cibitka) — ',
      hero_title_accent: 'Python Backend',
      hero_title_2: ', Bots & Web Tasks',
      hero_sub: 'I build FastAPI & Django APIs, aiogram 3 Telegram bots, scrapers, landing pages, and targeted website fixes. Scope and pricing are agreed upfront.',
      hero_cta_calc: 'Estimate cost',
      hero_cta_secondary: 'Projects & demos',
      metric_1_val: 'from 500 ₽',
      metric_1_lbl: 'quick fixes',
      metric_2_val: 'Cibitube',
      metric_2_lbl: 'Open Source (MIT)',
      metric_3_val: 'RU / EN',
      metric_3_lbl: 'direct contact',
      term_title: 'cibitka@arch:~/portfolio (browser sim)',
      term_placeholder: 'Type /help, /pricing, /projects...',
      term_run: 'Run',
      services_kicker: '03 / Services & Pricing',
      services_title: 'Core services & small tasks',
      services_desc: 'All prices are indicative starting points. Pick any option to prefill the brief form and calculator.',
      srv1_title: 'Backend & API',
      srv1_desc: 'Async REST & WebSocket APIs, database design, and third-party integrations.',
      srv1_price: 'from 15,000 ₽',
      srv1_eta: 'indicative',
      srv1_f1: 'FastAPI or Django / DRF',
      srv1_f2: 'PostgreSQL, Redis, OpenAPI docs',
      srv1_f3: 'Docker setup and deployment guide',
      srv2_title: 'Telegram Bots',
      srv2_desc: 'Bots for catalogs, lead capture, notifications, broadcasts, and DB integration.',
      srv2_price: 'from 8,000 ₽',
      srv2_eta: 'indicative',
      srv2_f1: 'Async aiogram 3 + SQLAlchemy',
      srv2_f2: 'Webhooks, roles, admin commands',
      srv2_f3: 'Error logging and deployment guide',
      srv3_title: 'Scraping & Automation',
      srv3_desc: 'Web data collection, price monitoring, scheduled reports, and service sync.',
      srv3_price: 'from 5,000 ₽',
      srv3_eta: 'indicative',
      srv3_f1: 'Playwright, httpx, BeautifulSoup4',
      srv3_f2: 'Export to CSV, JSON, Excel, or Telegram',
      srv3_f3: 'Scheduled execution (cron / Docker)',
      srv_btn: 'Select service',
      small_tasks_heading: 'Small tasks & quick fixes',
      small_tasks_tag: 'fast turnaround',
      sm1_title: 'Website Bug Fixing',
      sm1_price: 'from 500 ₽',
      sm1_desc: 'Finding and fixing layout bugs, CSS glitches, JavaScript errors, and console issues.',
      sm1_f1: 'Root-cause check and clean patch',
      sm1_f2: 'Verified on mobile and desktop browsers',
      sm2_title: 'Existing Site Improvements',
      sm2_price: 'from 700 ₽',
      sm2_desc: 'Adding new sections, forms, modals, toggles, and structural improvements.',
      sm2_f1: 'Matches your existing site style',
      sm2_f2: 'Preserves working functionality',
      sm3_title: 'Python Scripts',
      sm3_price: 'from 1,000 ₽',
      sm3_desc: 'Utilities for file processing, CSV/Excel automation, and external API calls.',
      sm3_f1: 'Clean Python code with requirements.txt',
      sm3_f2: 'Clear setup and run instructions',
      sm4_title: 'Responsive Layout',
      sm4_price: 'from 1,500 ₽',
      sm4_desc: 'HTML5/CSS3 (Grid/Flexbox) pages and blocks adapting cleanly across screens.',
      sm4_f1: 'Semantic markup and baseline SEO',
      sm4_f2: 'Tested from 320px up to 1920px',
      sm5_title: 'Business Card Website',
      sm5_price: 'from 2,500 ₽',
      sm5_desc: 'Clean single-page site for a specialist or studio with contacts and hosting setup.',
      sm5_f1: 'Lightweight responsive HTML/CSS/JS',
      sm5_f2: 'GitHub Pages publishing support',
      sm6_title: 'Commercial Landing Page',
      sm6_price: 'from 4,000 ₽',
      sm6_desc: 'Conversion-ready landing page with pricing, FAQ, calculator, and contact form.',
      sm6_f1: 'Interactive blocks, SEO meta & Open Graph',
      sm6_f2: 'Full source handoff and deployment',
      pricing_note: 'All prices are indicative estimates. Final cost and timeline are agreed after scoping.',
      calc_kicker: '04 / Cost Calculator',
      calc_title: 'Preliminary project estimate',
      calc_desc: 'Select a project type and optional features to see a live itemized estimate. Transfer it directly to the brief form or Telegram.',
      calc_step1: '1. Choose project type',
      calc_step2: '2. Optional features for this type',
      calc_summary_title: 'Itemized estimate',
      calc_reset: 'Reset',
      calc_total_label: 'Estimated total:',
      calc_to_form: 'Send to brief form',
      calc_copy: 'Copy estimate',
      port_kicker: '05 / Portfolio',
      port_title: 'Real Open Source & interactive demos',
      port_desc: 'Public GitHub projects alongside browser-based interactive demos using fictional test data.',
      filter_all: 'All',
      filter_real: 'Open Source',
      filter_demo: 'Demos',
      gallery_fullscreen: 'Fullscreen',
      p1_type: 'Open Source · Rust / Linux',
      p1_title: 'Cibitube — Native YouTube Music Client',
      p1_desc: 'Native Rust desktop client for YouTube Music without Electron, featuring a custom UI, Google Drive sync, and cover + .lrc lyrics downloads.',
      gh_ver: 'Version:',
      gh_stars: 'Stars:',
      gh_updated: 'Updated:',
      cibi_arch_lbl: 'Architecture:',
      cibi_arch_val: 'Rust (2021), egui / eframe 0.30 GUI, playback via MPV IPC, downloads/metadata via yt-dlp + ffmpeg, LRCLIB synced lyrics, serverless sync via cibitube_sync_state.json on Google Drive.',
      cibi_plat_lbl: 'Platforms:',
      cibi_plat_val: 'Linux (Arch Linux / AUR, Ubuntu / Debian, Fedora); Android app in development.',
      p1_btn_gh: 'Source code',
      p1_btn_rel: 'Latest release',
      badge_browser_sim: 'Browser simulation',
      p_api_type: 'Demo · REST API',
      p_api_title: 'Interactive REST API Demo',
      p_api_desc: 'Test client for GET, POST, and DELETE requests against mock tasks with HTTP status codes and JSON responses. Runs locally in JavaScript (no live Python backend).',
      p_api_btn: 'Open REST API demo',
      p2_type: 'Demo · Telegram Bot',
      p2_title: 'Telegram Lead Bot Demo',
      p2_desc: 'Interactive client bot flow (catalog, order status, request submission). Built as a browser JavaScript simulation without connecting to Telegram servers.',
      p2_btn_demo: 'Open bot demo',
      p3_type: 'Demo · Commercial Landing',
      p3_title: 'Nordic Roast Landing & Subscription Calc',
      p3_desc: 'Fictional small-business landing concept with an interactive subscription calculator for roast tier, weight, and delivery cadence.',
      p3_btn_demo: 'Open landing demo',
      p4_type: 'Open Source · Frontend',
      p4_title: 'Cibitka v2.1 (my-site)',
      p4_desc: 'This portfolio built with pure HTML, CSS, and Vanilla JS: cost calculator, Cibitube gallery with GitHub API, terminal, SEO, and full RU/EN support.',
      p4_btn_gh: 'Source code',
      stack_kicker: '06 / Tech Stack',
      stack_title: 'Verified technologies',
      stack_desc: 'Tools actively used across my repositories and delivered work.',
      st1_title: 'Python & Backend',
      st2_title: 'Bots & Automation',
      st3_title: 'Databases & DevOps',
      st4_title: 'Systems & Frontend',
      proc_kicker: '07 / Process',
      proc_title: 'How a project runs',
      proc_desc: 'Clear steps designed to be straightforward even if you are hiring a developer for the first time.',
      pr1_t: 'Scope & Quote',
      pr1_d: 'Describe your task in plain words; I clarify details and fix the total price and timeline.',
      pr2_t: 'Build & Check-ins',
      pr2_d: 'I build iteratively and share intermediate results so everything stays aligned.',
      pr3_t: 'QA & Polish',
      pr3_d: 'I test edge cases, responsive views, and basic security, then apply agreed adjustments.',
      pr4_t: 'Handoff & Launch',
      pr4_d: 'Full source delivery, deployment help (GitHub Pages / Docker / VPS), and setup notes.',
      about_kicker: '08 / About',
      about_title: 'About the developer',
      about_p1: 'I am Alexander (Cibitka), working with Python (FastAPI, Django, aiogram 3, scraping), HTML/CSS/JS websites, and maintaining the open-source Rust app Cibitube.',
      about_p2: 'I favor clean, maintainable solutions without unnecessary bloat—handling both quick fixes from 500 ₽ and full bots, APIs, or landing pages.',
      ab_h1_t: 'Open code',
      ab_h1_d: 'Real projects and commit history are publicly inspectable on GitHub.',
      ab_h2_t: 'Security & hygiene',
      ab_h2_d: 'Zero hardcoded secrets, clean structure, and safe input handling.',
      ab_h3_t: 'Daily environment',
      ab_h3_d: 'Linux (Arch / CachyOS), Git, Docker, and GitHub Pages.',
      faq_kicker: '09 / FAQ',
      faq_title: 'Frequently asked questions',
      faq1_q: 'How is pricing calculated and paid?',
      faq1_a: 'The calculator provides an estimate. After discussing details I fix the final quote and timeline. Small tasks can be paid after a demo; larger ones by milestone.',
      faq2_q: 'Can I reach out without a formal specification?',
      faq2_a: 'Yes. Describe what you need in plain words in the form below or on Telegram, and I will help structure the requirements.',
      faq3_q: 'Do you take small fixes and scripts?',
      faq3_a: 'Yes: website bug fixes from 500 ₽, site improvements from 700 ₽, Python scripts from 1,000 ₽, and responsive layouts from 1,500 ₽.',
      faq4_q: 'Do you help with deployment?',
      faq4_a: 'Yes: GitHub Pages publishing for static sites, or Docker setup with server instructions for Python services and bots.',
      contact_kicker: '10 / Contact & Brief Builder',
      contact_title: 'Discuss your task',
      contact_desc: 'Fill out the form to generate a structured Telegram message. No personal data is sent to third-party servers.',
      form_service: 'Project type',
      form_estimate: 'Calculator estimate',
      form_estimate_ph: 'Not calculated yet (optional)',
      form_details: 'Task description *',
      form_details_ph: 'Describe what needs to be built or fixed...',
      form_features: 'Required features',
      form_features_ph: 'e.g., contact form, mobile layout, CSV export...',
      form_budget: 'Budget',
      form_budget_ph: 'e.g., up to 10,000 ₽',
      form_deadline: 'Desired timeline',
      form_deadline_ph: 'e.g., 3–5 days',
      form_preview_lbl: 'Message preview',
      form_tg: 'Open in Telegram',
      form_copy: 'Copy brief',
      footer_copy: '© 2026 Cibitka · v2.1',
      lb_prev: 'Previous',
      lb_next: 'Next',
      modal_api_title: 'REST API Demo (simulation)',
      sim_api_note: 'Browser-only JavaScript simulation using fictional mock data. No real Python backend is running—this demonstrates REST request/response formatting.',
      api_payload_lbl: 'Request body (JSON)',
      api_send: 'Send request',
      api_reset: 'Reset mock data',
      modal_bot_title: 'Telegram Bot Demo (@CibitkaDemoBot)',
      sim_bot_note: 'Browser JS simulation with mock data showing aiogram 3 menu flows without connecting to the Telegram API.',
      bot_btn_cat: 'Service catalog',
      bot_btn_st: 'Status #402',
      bot_btn_ord: 'Submit request',
      modal_landing_title: 'Landing Demo — Nordic Roast',
      sim_landing_note: 'Fictional commercial landing prototype with mock pricing.',
      nr_title: 'Freshly roasted coffee subscription',
      nr_sub: 'Pick roast, weight, and cadence to recalculate instantly.',
      nr_plan: 'Roast tier',
      nr_weight: 'Weight',
      nr_freq: 'Delivery cadence',
      nr_total_lbl: 'Total',
      nr_order_btn: 'Place demo order',
      toast_copied: 'Copied to clipboard',
      toast_calc_copied: 'Estimate copied to clipboard',
      toast_calc_sent: 'Estimate transferred to brief form',
      toast_calc_reset: 'Calculator reset',
      toast_service_selected: 'Service selected in brief form',
      toast_order_sent: 'Demo order placed (test mode)',
      err_details_req: 'Please add a short task description (at least 5 characters).'
    }
  };

  /* =========================================================
     5. STATE & DOM HELPERS
     ========================================================= */
  let savedLang = 'ru';
  try {
    const stored = localStorage.getItem('cibitka_lang');
    if (stored === 'ru' || stored === 'en') savedLang = stored;
  } catch (e) {}

  const state = {
    lang: savedLang,
    calcTypeId: 'backend',
    calcAddons: new Set(),
    galleryIdx: 0,
    portfolioFilter: 'all',
    termHistory: [],
    termHistIdx: -1,
    activeModal: null,
    lastFocused: null,
    apiEndpoint: 'health',
    apiTasks: [
      { id: 1, title: 'Создать REST API для каталога', status: 'in_progress', priority: 'high' },
      { id: 2, title: 'Настроить Telegram-уведомления', status: 'done', priority: 'medium' }
    ],
    landingPlan: 'standard',
    landingWeight: 500,
    landingFreq: 1
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function formatRub(num) {
    return `${num.toLocaleString('ru-RU')} ${PRICING_CONFIG.currency}`;
  }

  let toastTimer = null;
  function showToast(msg) {
    const el = $('#toast');
    const txt = $('#toast-text');
    if (!el || !txt) return;
    txt.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
  }

  function copyTextSafe(text, toastMsg) {
    const done = () => showToast(toastMsg || i18n[state.lang].toast_copied);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    if (cb) cb();
  }

  /* =========================================================
     6. COST CALCULATOR
     ========================================================= */
  function getActiveProjectType() {
    return PRICING_CONFIG.projectTypes.find((t) => t.id === state.calcTypeId) || PRICING_CONFIG.projectTypes[0];
  }

  function computeEstimate() {
    const type = getActiveProjectType();
    const selectedAddons = type.addons.filter((a) => state.calcAddons.has(a.id));
    const total = type.basePrice + selectedAddons.reduce((sum, a) => sum + a.price, 0);
    return { type, selectedAddons, total };
  }

  function formatEstimateText() {
    const { type, selectedAddons, total } = computeEstimate();
    const isRu = state.lang === 'ru';
    const lines = [
      isRu ? `Предварительный расчёт (Cibitka v2.1):` : `Preliminary estimate (Cibitka v2.1):`,
      `• ${type.name[state.lang]}: ${isRu ? 'от ' : 'from '}${formatRub(type.basePrice)}`
    ];
    selectedAddons.forEach((a) => {
      lines.push(`• + ${a.name[state.lang]}: ${formatRub(a.price)}`);
    });
    lines.push(`${isRu ? 'Итого ориентировочно: от ' : 'Estimated total: from '}${formatRub(total)}`);
    return lines.join('\n');
  }

  function renderCalculator() {
    const typesWrap = $('#calc-types');
    const addonsWrap = $('#calc-addons');
    const breakdownEl = $('#calc-breakdown');
    const totalEl = $('#calc-total-val');
    const tgLink = $('#calc-tg-link');
    if (!typesWrap || !addonsWrap || !breakdownEl || !totalEl) return;

    const isRu = state.lang === 'ru';

    // Render type buttons safely via DOM
    typesWrap.textContent = '';
    PRICING_CONFIG.projectTypes.forEach((pt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `calc-type-btn${pt.id === state.calcTypeId ? ' active' : ''}`;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(pt.id === state.calcTypeId));

      const nameSpan = document.createElement('span');
      nameSpan.className = 'calc-type-name';
      nameSpan.textContent = pt.name[state.lang];

      const priceSpan = document.createElement('span');
      priceSpan.className = 'calc-type-base';
      priceSpan.textContent = `${isRu ? 'от ' : 'from '}${formatRub(pt.basePrice)}`;

      btn.appendChild(nameSpan);
      btn.appendChild(priceSpan);
      btn.addEventListener('click', () => {
        state.calcTypeId = pt.id;
        state.calcAddons.clear();
        renderCalculator();
      });
      typesWrap.appendChild(btn);
    });

    // Render addons for selected type
    const activeType = getActiveProjectType();
    addonsWrap.textContent = '';
    activeType.addons.forEach((addon) => {
      const checked = state.calcAddons.has(addon.id);
      const label = document.createElement('label');
      label.className = `addon-label${checked ? ' checked' : ''}`;

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = checked;
      cb.addEventListener('change', () => {
        if (cb.checked) state.calcAddons.add(addon.id);
        else state.calcAddons.delete(addon.id);
        renderCalculator();
      });

      const info = document.createElement('span');
      info.className = 'addon-info';
      const n = document.createElement('span');
      n.className = 'addon-name';
      n.textContent = addon.name[state.lang];
      const p = document.createElement('span');
      p.className = 'addon-price';
      p.textContent = `+ ${formatRub(addon.price)}`;

      info.appendChild(n);
      info.appendChild(p);
      label.appendChild(cb);
      label.appendChild(info);
      addonsWrap.appendChild(label);
    });

    // Render itemized breakdown
    const { type, selectedAddons, total } = computeEstimate();
    breakdownEl.textContent = '';

    const baseLi = document.createElement('li');
    const baseName = document.createElement('span');
    baseName.textContent = type.name[state.lang];
    const baseVal = document.createElement('span');
    baseVal.textContent = formatRub(type.basePrice);
    baseLi.appendChild(baseName);
    baseLi.appendChild(baseVal);
    breakdownEl.appendChild(baseLi);

    selectedAddons.forEach((a) => {
      const li = document.createElement('li');
      const s1 = document.createElement('span');
      s1.textContent = `+ ${a.name[state.lang]}`;
      const s2 = document.createElement('span');
      s2.textContent = formatRub(a.price);
      li.appendChild(s1);
      li.appendChild(s2);
      breakdownEl.appendChild(li);
    });

    totalEl.textContent = `${isRu ? 'от ' : 'from '}${formatRub(total)}`;
    if (tgLink) {
      tgLink.href = `https://t.me/Zch_Cibitka?text=${encodeURIComponent(formatEstimateText())}`;
    }
  }

  /* =========================================================
     7. CIBITUBE GALLERY + LIGHTBOX + GITHUB API (CACHED)
     ========================================================= */
  function renderCibitubeGallery() {
    const mainImg = $('#cibitube-main-img');
    const fallback = $('#cibitube-img-fallback');
    const caption = $('#cibitube-caption');
    const thumbsWrap = $('#cibitube-thumbs');
    if (!mainImg || !thumbsWrap) return;

    const current = CIBITUBE_MEDIA[state.galleryIdx] || CIBITUBE_MEDIA[0];
    mainImg.style.display = 'block';
    if (fallback) fallback.style.display = 'none';
    mainImg.src = current.src;
    mainImg.alt = `Cibitube — ${current.title[state.lang]}`;
    mainImg.onerror = () => {
      mainImg.style.display = 'none';
      if (fallback) {
        fallback.style.display = 'block';
        fallback.textContent = `${current.path} (${current.title[state.lang]})`;
      }
    };
    if (caption) caption.textContent = `${current.path} — ${current.title[state.lang]}`;

    thumbsWrap.textContent = '';
    CIBITUBE_MEDIA.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `gallery-thumb${idx === state.galleryIdx ? ' active' : ''}`;
      btn.setAttribute('aria-label', item.title[state.lang]);
      btn.setAttribute('aria-pressed', String(idx === state.galleryIdx));

      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.title[state.lang];
      img.loading = 'lazy';
      btn.appendChild(img);

      btn.addEventListener('click', () => {
        state.galleryIdx = idx;
        renderCibitubeGallery();
      });
      thumbsWrap.appendChild(btn);
    });
  }

  function updateLightbox() {
    const item = CIBITUBE_MEDIA[state.galleryIdx] || CIBITUBE_MEDIA[0];
    const img = $('#lightbox-img');
    const title = $('#lightbox-title');
    const counter = $('#lightbox-counter');
    if (img) {
      img.src = item.src;
      img.alt = `Cibitube — ${item.title[state.lang]}`;
    }
    if (title) title.textContent = `Cibitube — ${item.title[state.lang]}`;
    if (counter) counter.textContent = `${state.galleryIdx + 1} / ${CIBITUBE_MEDIA.length}`;
  }

  function applyCibitubeMeta(data) {
    const verEl = $('#cibitube-version');
    const starsEl = $('#cibitube-stars');
    const updEl = $('#cibitube-updated');
    const relLink = $('#cibitube-release-link');
    if (verEl) verEl.textContent = data.version || CIBITUBE_FALLBACK.version;
    if (starsEl) starsEl.textContent = String(data.stars ?? CIBITUBE_FALLBACK.stars);
    if (updEl) updEl.textContent = data.updated || CIBITUBE_FALLBACK.updated;
    if (relLink && data.releaseUrl) relLink.href = data.releaseUrl;
  }

  async function loadCibitubeGitHubData() {
    const CACHE_KEY = 'cibitube_gh_cache_v1';
    const TTL = 15 * 60 * 1000;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.ts && Date.now() - parsed.ts < TTL && parsed.data) {
          applyCibitubeMeta(parsed.data);
          return;
        }
      }
    } catch (e) {}

    applyCibitubeMeta(CIBITUBE_FALLBACK);

    try {
      const [repoRes, relRes] = await Promise.all([
        fetch('https://api.github.com/repos/Cibitka/Cibitube', { headers: { Accept: 'application/vnd.github+json' } }),
        fetch('https://api.github.com/repos/Cibitka/Cibitube/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
      ]);
      const data = { ...CIBITUBE_FALLBACK };
      if (repoRes.ok) {
        const repo = await repoRes.json();
        if (typeof repo.stargazers_count === 'number') data.stars = repo.stargazers_count;
        if (typeof repo.pushed_at === 'string') data.updated = repo.pushed_at.slice(0, 10);
      }
      if (relRes.ok) {
        const rel = await relRes.json();
        if (typeof rel.tag_name === 'string') data.version = rel.tag_name;
        if (typeof rel.html_url === 'string' && rel.html_url.startsWith('https://github.com/')) {
          data.releaseUrl = rel.html_url;
        }
      }
      applyCibitubeMeta(data);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
      } catch (e) {}
    } catch (e) {
      applyCibitubeMeta(CIBITUBE_FALLBACK);
    }
  }

  /* =========================================================
     8. INTERACTIVE TERMINAL (Safe DOM Rendering, Zero innerHTML XSS)
     ========================================================= */
  const TERMINAL_COMMANDS = [
    '/help', '/whoami', '/projects', '/stack', '/services',
    '/pricing', '/github', '/contact', '/version', '/lang', '/clear'
  ];

  function createTermLine(parts) {
    const body = $('#terminal-body');
    if (!body) return;
    const div = document.createElement('div');
    div.className = 'terminal-line';
    parts.forEach((part) => {
      if (typeof part === 'string') {
        div.appendChild(document.createTextNode(part));
      } else if (part.href) {
        const a = document.createElement('a');
        a.className = 't-link';
        a.href = part.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = part.text;
        div.appendChild(a);
      } else {
        const span = document.createElement('span');
        if (part.cls) span.className = part.cls;
        span.textContent = part.text;
        div.appendChild(span);
      }
    });
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function printTerminalWelcome() {
    const body = $('#terminal-body');
    if (!body) return;
    body.textContent = '';
    const isRu = state.lang === 'ru';
    createTermLine([
      { cls: 't-cmd', text: '$ ' },
      { cls: 't-strong', text: '/whoami\n' },
      { cls: 't-strong', text: isRu ? 'Александр (Cibitka)' : 'Alexander (Cibitka)' },
      isRu
        ? ' · Python Backend, Telegram-боты, веб и Rust\n'
        : ' · Python Backend, Telegram Bots, Web & Rust\n',
      { cls: 't-muted', text: isRu ? 'Безопасная браузерная симуляция. Введите /help или нажмите команду ниже.' : 'Safe browser simulation. Type /help or click a command below.' }
    ]);
  }

  function runTerminalCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    state.termHistory.unshift(cmd);
    state.termHistIdx = -1;

    createTermLine([{ cls: 't-cmd', text: '$ ' }, { cls: 't-strong', text: cmd }]);

    const isRu = state.lang === 'ru';
    switch (cmd) {
      case '/help':
      case 'help':
        createTermLine([
          { cls: 't-strong', text: isRu ? 'Доступные команды:\n' : 'Available commands:\n' },
          '  /whoami   ', { cls: 't-muted', text: isRu ? '— о разработчике\n' : '— developer profile\n' },
          '  /projects ', { cls: 't-muted', text: isRu ? '— Cibitube и рабочие демо\n' : '— Cibitube & demos\n' },
          '  /stack    ', { cls: 't-muted', text: isRu ? '— стек технологий\n' : '— tech stack\n' },
          '  /services ', { cls: 't-muted', text: isRu ? '— направления работы\n' : '— services list\n' },
          '  /pricing  ', { cls: 't-muted', text: isRu ? '— ориентировочные цены\n' : '— starting prices\n' },
          '  /github   ', { cls: 't-muted', text: isRu ? '— ссылки на репозитории\n' : '— repository links\n' },
          '  /contact  ', { cls: 't-muted', text: isRu ? '— рабочие контакты\n' : '— work contacts\n' },
          '  /version  ', { cls: 't-muted', text: isRu ? '— версия сайта\n' : '— site version\n' },
          '  /lang     ', { cls: 't-muted', text: isRu ? '— переключить RU / EN\n' : '— toggle RU / EN\n' },
          '  /clear    ', { cls: 't-muted', text: isRu ? '— очистить вывод' : '— clear output' }
        ]);
        break;
      case '/whoami':
        createTermLine([
          { cls: 't-strong', text: isRu ? 'Александр (Cibitka)\n' : 'Alexander (Cibitka)\n' },
          isRu
            ? 'Специализация: Python (FastAPI, Django, aiogram 3, парсинг), HTML/CSS/JS, Rust.\nОкружение: Linux (Arch / CachyOS), Git, Docker.'
            : 'Focus: Python (FastAPI, Django, aiogram 3, scraping), HTML/CSS/JS, Rust.\nEnvironment: Linux (Arch / CachyOS), Git, Docker.'
        ]);
        break;
      case '/projects':
        createTermLine([
          '1. ', { href: 'https://github.com/Cibitka/Cibitube', text: 'Cibitube' },
          isRu ? ' — клиент YouTube Music на Rust (MIT)\n' : ' — Rust YouTube Music client (MIT)\n',
          '2. ', { href: 'https://github.com/Cibitka/my-site', text: 'my-site v2.1' },
          isRu ? ' — портфолио на HTML/CSS/JS\n' : ' — HTML/CSS/JS portfolio\n',
          isRu ? '3. Демо в браузере: REST API, Telegram-бот, Nordic Roast.' : '3. Browser demos: REST API, Telegram Bot, Nordic Roast.'
        ]);
        break;
      case '/stack':
        createTermLine([
          'Backend:  Python 3.11+, FastAPI, Django/DRF, Asyncio, SQLAlchemy\n',
          'Bots:     aiogram 3, Playwright, httpx, BeautifulSoup4\n',
          'Infra:    PostgreSQL, Redis, SQLite, Docker, Nginx, Linux\n',
          'Systems:  Rust (egui/eframe), MPV IPC, HTML5/CSS3/Vanilla JS'
        ]);
        break;
      case '/services':
        createTermLine([
          isRu
            ? 'Основные: Backend & API, Telegram-боты, Парсинг и автоматизация.\nМелкие задачи: исправление ошибок, доработки, Python-скрипты, вёрстка, визитки, лендинги.'
            : 'Core: Backend & API, Telegram Bots, Scraping & Automation.\nSmall tasks: bug fixes, site tweaks, Python scripts, layouts, business cards, landings.'
        ]);
        break;
      case '/pricing':
        createTermLine([
          PRICING_CONFIG.projectTypes
            .map((p) => `• ${p.name[state.lang]} — ${isRu ? 'от ' : 'from '}${formatRub(p.basePrice)}`)
            .join('\n')
        ]);
        break;
      case '/github':
        createTermLine([
          'Profile:  ', { href: 'https://github.com/Cibitka', text: 'github.com/Cibitka' }, '\n',
          'Cibitube: ', { href: 'https://github.com/Cibitka/Cibitube', text: 'github.com/Cibitka/Cibitube' }, '\n',
          'my-site:  ', { href: 'https://github.com/Cibitka/my-site', text: 'github.com/Cibitka/my-site' }
        ]);
        break;
      case '/contact':
        createTermLine([
          'Telegram: ', { href: 'https://t.me/Zch_Cibitka', text: 't.me/Zch_Cibitka' }, '\n',
          'GitHub:   ', { href: 'https://github.com/Cibitka', text: 'github.com/Cibitka' }, '\n',
          'Boosty:   ', { href: 'https://boosty.to/zch_cibitka', text: 'boosty.to/zch_cibitka' }
        ]);
        break;
      case '/version':
        createTermLine([
          'Cibitka Portfolio v2.1 (HTML5 / CSS3 / Vanilla JS · GitHub Pages)'
        ]);
        break;
      case '/lang':
        applyLanguage(state.lang === 'ru' ? 'en' : 'ru');
        createTermLine([state.lang === 'ru' ? 'Язык: RU' : 'Language: EN']);
        break;
      case '/clear':
      case 'clear':
        printTerminalWelcome();
        break;
      default:
        createTermLine([
          {
            cls: 't-muted',
            text: isRu
              ? `Команда «${cmd}» не найдена. Введите /help для списка команд.`
              : `Unknown command "${cmd}". Type /help to see available commands.`
          }
        ]);
    }
  }

  /* =========================================================
     9. REST API DEMO (Safe Browser Simulation)
     ========================================================= */
  function renderApiDemoState() {
    $$('.api-ep-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.apiEp === state.apiEndpoint);
    });
    const wrap = $('#api-payload-wrap');
    if (wrap) wrap.style.display = state.apiEndpoint === 'create' ? 'flex' : 'none';
  }

  function executeApiDemo() {
    const statusEl = $('#api-status-badge');
    const latencyEl = $('#api-latency');
    const preEl = $('#api-response-pre');
    if (!statusEl || !preEl) return;

    const ms = 8 + Math.floor(Math.random() * 14);
    if (latencyEl) latencyEl.textContent = `simulated · ${ms} ms`;

    let status = '200 OK';
    let payload = {};

    if (state.apiEndpoint === 'health') {
      payload = { status: 'ok', service: 'cibitka-mock-api', mode: 'browser-simulation', version: '2.1' };
    } else if (state.apiEndpoint === 'list') {
      payload = { count: state.apiTasks.length, items: state.apiTasks };
    } else if (state.apiEndpoint === 'create') {
      const raw = ($('#api-payload-input') ? $('#api-payload-input').value : '').trim();
      try {
        const parsed = JSON.parse(raw);
        if (!parsed.title || typeof parsed.title !== 'string') {
          status = '400 Bad Request';
          payload = { error: 'Field "title" (string) is required' };
        } else {
          const nextId = state.apiTasks.reduce((m, t) => Math.max(m, t.id), 0) + 1;
          const created = {
            id: nextId,
            title: parsed.title.slice(0, 80),
            status: 'new',
            priority: typeof parsed.priority === 'string' ? parsed.priority.slice(0, 20) : 'normal'
          };
          state.apiTasks.push(created);
          status = '201 Created';
          payload = { created, total: state.apiTasks.length };
        }
      } catch (e) {
        status = '400 Bad Request';
        payload = { error: 'Invalid JSON syntax' };
      }
    } else if (state.apiEndpoint === 'delete') {
      const idx = state.apiTasks.findIndex((t) => t.id === 1);
      if (idx === -1) {
        status = '404 Not Found';
        payload = { error: 'Task #1 already deleted (click Reset to restore)' };
      } else {
        const removed = state.apiTasks.splice(idx, 1)[0];
        status = '200 OK';
        payload = { deleted: removed, remaining: state.apiTasks.length };
      }
    }

    statusEl.textContent = status;
    preEl.textContent = JSON.stringify(payload, null, 2);
  }

  /* =========================================================
     10. TELEGRAM BOT & LANDING DEMOS
     ========================================================= */
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
    log.textContent = '';
    appendBotMsg(
      state.lang === 'ru'
        ? 'Демо-бот (браузерная симуляция aiogram 3).\nВыберите команду ниже:'
        : 'Demo bot (browser aiogram 3 simulation).\nPick a command below:',
      'bot'
    );
  }

  function handleBotAction(action) {
    const isRu = state.lang === 'ru';
    if (action === 'reset') {
      resetBotDemo();
      return;
    }
    const map = {
      catalog: {
        user: isRu ? 'Каталог услуг' : 'Service catalog',
        bot: isRu
          ? 'Тестовый каталог:\n• Backend & API — от 15 000 ₽\n• Telegram-бот — от 8 000 ₽\n• Мелкие правки — от 500 ₽'
          : 'Mock catalog:\n• Backend & API — from 15,000 ₽\n• Telegram Bot — from 8,000 ₽\n• Quick fixes — from 500 ₽'
      },
      status: {
        user: isRu ? 'Статус #402' : 'Status #402',
        bot: isRu
          ? 'Тестовый заказ #402:\n• Статус: В работе (проверка вебхуков)\n• Обновлено: сегодня'
          : 'Mock order #402:\n• Status: In progress (webhook QA)\n• Updated: today'
      },
      order: {
        user: isRu ? 'Оставить заявку' : 'Submit request',
        bot: isRu
          ? 'Тестовая заявка #403 сформирована (симуляция, реальная отправка не выполняется).'
          : 'Mock request #403 created (simulation only, nothing sent externally).'
      }
    };
    const item = map[action];
    if (!item) return;
    appendBotMsg(item.user, 'user');
    setTimeout(() => appendBotMsg(item.bot, 'bot'), 140);
  }

  function updateLandingDemo() {
    const base = { starter: 890, standard: 1490, pro: 2590 }[state.landingPlan] || 1490;
    const weightMult = state.landingWeight === 250 ? 0.6 : state.landingWeight === 1000 ? 1.8 : 1;
    const freqMult = state.landingFreq === 2 ? 1.8 : 1;
    const total = Math.round(base * weightMult * freqMult);
    const el = $('#landing-demo-total');
    if (el) el.textContent = `${formatRub(total)} / ${state.lang === 'ru' ? 'мес' : 'mo'}`;
  }

  /* =========================================================
     11. CONTACT BRIEF GENERATOR & VALIDATION
     ========================================================= */
  function populateBriefSelect() {
    const sel = $('#brief-service');
    if (!sel) return;
    const prev = sel.value || state.calcTypeId;
    sel.textContent = '';
    PRICING_CONFIG.projectTypes.forEach((pt) => {
      const opt = document.createElement('option');
      opt.value = pt.id;
      opt.textContent = pt.name[state.lang];
      sel.appendChild(opt);
    });
    if (PRICING_CONFIG.projectTypes.some((p) => p.id === prev)) sel.value = prev;
  }

  function buildBriefText() {
    const selId = $('#brief-service') ? $('#brief-service').value : 'backend';
    const typeObj = PRICING_CONFIG.projectTypes.find((p) => p.id === selId) || PRICING_CONFIG.projectTypes[0];
    const details = ($('#brief-details') ? $('#brief-details').value : '').trim();
    const features = ($('#brief-features') ? $('#brief-features').value : '').trim();
    const budget = ($('#brief-budget') ? $('#brief-budget').value : '').trim();
    const deadline = ($('#brief-deadline') ? $('#brief-deadline').value : '').trim();
    const estimate = ($('#brief-estimate') ? $('#brief-estimate').value : '').trim();

    if (state.lang === 'ru') {
      return [
        'Привет, Александр! Заявка с сайта Cibitka:',
        `• Тип проекта: ${typeObj.name.ru}`,
        `• Описание: ${details || 'уточню в переписке'}`,
        `• Функционал: ${features || 'обсудим'}`,
        `• Бюджет: ${budget || 'обсудим'}`,
        `• Сроки: ${deadline || 'обсудим'}`,
        `• Расчёт калькулятора: ${estimate || 'не выполнялся'}`
      ].join('\n');
    }
    return [
      'Hi Alexander! Inquiry from Cibitka portfolio:',
      `• Project type: ${typeObj.name.en}`,
      `• Description: ${details || 'will share in chat'}`,
      `• Features: ${features || 'open to discuss'}`,
      `• Budget: ${budget || 'open to discuss'}`,
      `• Timeline: ${deadline || 'open to discuss'}`,
      `• Calculator estimate: ${estimate || 'not calculated'}`
    ].join('\n');
  }

  function updateBriefPreview() {
    const pre = $('#brief-preview');
    const tgLink = $('#brief-tg-link');
    const text = buildBriefText();
    if (pre) pre.textContent = text;
    if (tgLink) tgLink.href = `https://t.me/Zch_Cibitka?text=${encodeURIComponent(text)}`;
  }

  function validateBrief() {
    const detailsEl = $('#brief-details');
    const errEl = $('#brief-details-error');
    if (!detailsEl || !errEl) return true;
    const val = detailsEl.value.trim();
    if (val.length < 5) {
      errEl.textContent = i18n[state.lang].err_details_req;
      detailsEl.focus();
      return false;
    }
    errEl.textContent = '';
    return true;
  }

  /* =========================================================
     12. MODALS WITH FOCUS TRAP & ESCAPE HANDLING
     ========================================================= */
  function getFocusable(container) {
    return $$(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      container
    );
  }

  function openModal(id) {
    const modal = $(`#${id}`);
    if (!modal) return;
    state.lastFocused = document.activeElement;
    state.activeModal = modal;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const focusables = getFocusable(modal);
    if (focusables.length) focusables[0].focus();
  }

  function closeAllModals() {
    $$('.modal-backdrop').forEach((m) => {
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
    state.activeModal = null;
    if (state.lastFocused && typeof state.lastFocused.focus === 'function') {
      state.lastFocused.focus();
      state.lastFocused = null;
    }
  }

  document.addEventListener('keydown', (e) => {
    if (!state.activeModal) return;
    if (e.key === 'Escape') {
      closeAllModals();
      return;
    }
    if (state.activeModal.id === 'modal-lightbox') {
      if (e.key === 'ArrowRight') {
        state.galleryIdx = (state.galleryIdx + 1) % CIBITUBE_MEDIA.length;
        renderCibitubeGallery();
        updateLightbox();
      } else if (e.key === 'ArrowLeft') {
        state.galleryIdx = (state.galleryIdx - 1 + CIBITUBE_MEDIA.length) % CIBITUBE_MEDIA.length;
        renderCibitubeGallery();
        updateLightbox();
      }
    }
    if (e.key === 'Tab') {
      const focusables = getFocusable(state.activeModal);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* =========================================================
     13. LANGUAGE APPLY & INITIALIZATION
     ========================================================= */
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

    populateBriefSelect();
    renderCalculator();
    renderCibitubeGallery();
    updateLandingDemo();
    updateBriefPreview();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTopoBackground();
    applyLanguage(state.lang);
    printTerminalWelcome();
    resetBotDemo();
    renderApiDemoState();
    executeApiDemo();
    loadCibitubeGitHubData();

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // Language toggle
    const langBtn = $('#lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        applyLanguage(state.lang === 'ru' ? 'en' : 'ru');
        printTerminalWelcome();
        resetBotDemo();
      });
    }

    // Mobile nav
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

    // Active nav observer
    if ('IntersectionObserver' in window) {
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
        { rootMargin: '-30% 0px -60% 0px' }
      );
      sections.forEach((s) => navObs.observe(s));
    }

    // Terminal events
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
          const match = TERMINAL_COMMANDS.find((c) => c.startsWith(val));
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

    // Services -> select in calculator + brief form
    $$('.service-select-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const typeId = btn.dataset.projectType;
        if (!typeId) return;
        state.calcTypeId = typeId;
        state.calcAddons.clear();
        renderCalculator();
        const sel = $('#brief-service');
        if (sel) sel.value = typeId;
        const { total } = computeEstimate();
        const estInput = $('#brief-estimate');
        if (estInput) estInput.value = `${state.lang === 'ru' ? 'от ' : 'from '}${formatRub(total)}`;
        updateBriefPreview();
        showToast(i18n[state.lang].toast_service_selected);
      });
    });

    // Calculator buttons
    const calcReset = $('#calc-reset-btn');
    if (calcReset) {
      calcReset.addEventListener('click', () => {
        state.calcTypeId = 'backend';
        state.calcAddons.clear();
        renderCalculator();
        showToast(i18n[state.lang].toast_calc_reset);
      });
    }

    const calcCopy = $('#calc-copy-btn');
    if (calcCopy) {
      calcCopy.addEventListener('click', () => copyTextSafe(formatEstimateText(), i18n[state.lang].toast_calc_copied));
    }

    const calcToForm = $('#calc-to-form-btn');
    if (calcToForm) {
      calcToForm.addEventListener('click', () => {
        const { type, selectedAddons, total } = computeEstimate();
        const sel = $('#brief-service');
        const feat = $('#brief-features');
        const est = $('#brief-estimate');
        if (sel) sel.value = type.id;
        if (feat) feat.value = selectedAddons.map((a) => a.name[state.lang]).join(', ');
        if (est) est.value = `${state.lang === 'ru' ? 'от ' : 'from '}${formatRub(total)}`;
        updateBriefPreview();
        showToast(i18n[state.lang].toast_calc_sent);
        const contact = $('#contact');
        if (contact) contact.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Portfolio filters
    $$('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter || 'all';
        state.portfolioFilter = filter;
        $$('.filter-btn').forEach((b) => {
          const active = b.dataset.filter === filter;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        $$('.project-card').forEach((card) => {
          card.classList.toggle('hidden', !(filter === 'all' || card.dataset.category === filter));
        });
      });
    });

    // Lightbox triggers
    const openLbBtn = $('#cibitube-open-lightbox');
    if (openLbBtn) {
      openLbBtn.addEventListener('click', () => {
        updateLightbox();
        openModal('modal-lightbox');
      });
    }
    const lbPrev = $('#lightbox-prev');
    const lbNext = $('#lightbox-next');
    if (lbPrev) {
      lbPrev.addEventListener('click', () => {
        state.galleryIdx = (state.galleryIdx - 1 + CIBITUBE_MEDIA.length) % CIBITUBE_MEDIA.length;
        renderCibitubeGallery();
        updateLightbox();
      });
    }
    if (lbNext) {
      lbNext.addEventListener('click', () => {
        state.galleryIdx = (state.galleryIdx + 1) % CIBITUBE_MEDIA.length;
        renderCibitubeGallery();
        updateLightbox();
      });
    }

    // Generic modals
    $$('[data-open-modal]').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.dataset.openModal));
    });
    $$('.modal-close').forEach((btn) => btn.addEventListener('click', closeAllModals));
    $$('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeAllModals();
      });
    });

    // REST API demo events
    $$('.api-ep-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.apiEndpoint = btn.dataset.apiEp || 'health';
        renderApiDemoState();
        executeApiDemo();
      });
    });
    const apiSend = $('#api-send-btn');
    if (apiSend) apiSend.addEventListener('click', executeApiDemo);
    const apiReset = $('#api-reset-btn');
    if (apiReset) {
      apiReset.addEventListener('click', () => {
        state.apiTasks = [
          { id: 1, title: 'Создать REST API для каталога', status: 'in_progress', priority: 'high' },
          { id: 2, title: 'Настроить Telegram-уведомления', status: 'done', priority: 'medium' }
        ];
        executeApiDemo();
      });
    }

    // Bot demo events
    $$('[data-bot-action]').forEach((btn) => {
      btn.addEventListener('click', () => handleBotAction(btn.dataset.botAction));
    });

    // Landing demo events
    const planSel = $('#landing-plan');
    const weightSel = $('#landing-weight');
    const freqSel = $('#landing-freq');
    if (planSel) planSel.addEventListener('change', (e) => { state.landingPlan = e.target.value; updateLandingDemo(); });
    if (weightSel) weightSel.addEventListener('change', (e) => { state.landingWeight = Number(e.target.value); updateLandingDemo(); });
    if (freqSel) freqSel.addEventListener('change', (e) => { state.landingFreq = Number(e.target.value); updateLandingDemo(); });
    const landingOrder = $('#landing-demo-order');
    if (landingOrder) landingOrder.addEventListener('click', () => showToast(i18n[state.lang].toast_order_sent));

    // FAQ accordion
    $$('.faq-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        $$('.faq-item').forEach((other) => {
          other.classList.remove('open');
          const ob = $('.faq-trigger', other);
          if (ob) ob.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Contact form listeners & validation
    ['#brief-service', '#brief-details', '#brief-features', '#brief-budget', '#brief-deadline'].forEach((id) => {
      const el = $(id);
      if (el) {
        el.addEventListener('input', () => {
          if (id === '#brief-details') {
            const err = $('#brief-details-error');
            if (err && el.value.trim().length >= 5) err.textContent = '';
          }
          updateBriefPreview();
        });
      }
    });

    const copyBriefBtn = $('#brief-copy-btn');
    if (copyBriefBtn) {
      copyBriefBtn.addEventListener('click', () => {
        if (!validateBrief()) return;
        copyTextSafe(buildBriefText(), i18n[state.lang].toast_copied);
      });
    }

    const tgBriefLink = $('#brief-tg-link');
    if (tgBriefLink) {
      tgBriefLink.addEventListener('click', (e) => {
        if (!validateBrief()) e.preventDefault();
      });
    }
  });
})();
