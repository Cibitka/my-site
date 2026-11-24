# Cibitka v2.0 (`my-site`)

Обновлённая версия сайта-портфолио для репозитория [Cibitka/my-site](https://github.com/Cibitka/my-site).

## Что реализовано по чек-листу v2.0
- **10 секций по плану:** Header, Hero + интерактивный терминал, Services & Pricing (3 профильные услуги), Portfolio (Cibitube + интерактивные демо Telegram-бота и коммерческого лендинга + `my-site`), Tech Stack, Process, About, FAQ, Contact (конструктор брифа + Telegram/GitHub/Boosty), Footer.
- **Палитра и типографика:** `#090D14`, `#131C28`, `#5EEAD4`, `#F1F5F9`, `#94A3B8` + `Manrope`, `Inter`, `JetBrains Mono`.
- **Техническая часть:** чистые HTML5 / CSS3 / Vanilla JS, Lucide Icons, `IntersectionObserver` + `prefers-reduced-motion`, ARIA-доступность, клавиатурная навигация, SEO & Open Graph, встроенный SVG favicon, переключение языка **RU / EN**.

## Как опубликовать на GitHub Pages
1. Замените `index.html`, `style.css` и `script.js` в корне репозитория `https://github.com/Cibitka/my-site` файлами из этой папки.
2. В настройках репозитория откройте **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**.
3. Добавьте реальные скриншоты **Cibitube** в папку `assets/` (в формате `.webp`) и замените блок `.app-window` в карточке Cibitube на `<img src="./assets/cibitube.webp" alt="Интерфейс Cibitube" loading="lazy">`.
4. При необходимости скорректируйте ориентировочные цены в `index.html` и словаре `i18n` в `script.js`.
