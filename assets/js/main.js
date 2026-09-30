/*!
 * ALBINA — main.js
 * Мебельная фабрика «Альбина» (г. Кузнецк). Скрипт сайта.
 *
 * Подключение (один раз на страницу, обязательно defer):
 *   <script src="/assets/js/main.js" defer></script>
 * Рекомендуется также в <head> добавить инлайн-скрипт — он ставит класс .js
 * на <html> до первой отрисовки, чтобы .reveal не мигнул:
 *   <script>document.documentElement.classList.add('js');</script>
 *
 * Без библиотек, ES2019, без модулей. При отключённом JS страница остаётся
 * рабочей: контент виден, якоря и ссылки работают, <details> раскрываются.
 *
 * ============================================================================
 *  DATA-АТРИБУТЫ, КОТОРЫЕ ОЖИДАЕТ ЭТОТ СКРИПТ
 * ============================================================================
 *  <html class="js">                         ставится скриптом (нужен для .reveal)
 *
 *  ШАПКА
 *    data-sticky="off"   на <html> — отключить липкую шапку
 *    data-burger-breakpoint="900"   на <html> — точка, ниже которой включается
 *                                     бургер (по умолчанию 900)
 *
 *  ФОРМЫ (валидируются ВСЕ <form> на странице)
 *    data-form="lead"      на <form> — просто пометка, скрипт её не требует
 *    data-no-validate      на <form> — отключить валидацию этой формы
 *    data-native-submit    на <form> — не перехватывать submit (уходит на сервер)
 *    data-success="…"      на <form> — текст тоста при успешной отправке
 *    data-success-delay="5000"  на <form> — сколько показывать тост, мс
 *    data-mask="phone"     на <input> — маска телефона (работает и для type="tel")
 *    data-phone-prefix="+7" на <input> — префикс маски
 *    data-error="…"        на <input> — свой текст ошибки
 *    data-mask="digits"    на <input> — маска только цифр
 *
 *  ВАЛИДАЦИЯ ПО ТИПУ ПОЛЯ
 *    required, type="email", type="tel", type="url", type="number",
 *    minlength, maxlength, min, max, pattern, step — учитываются автоматически
 *    [data-consent] на чекбоксе согласия — то же, что required
 *
 *  FAQ (.accordion / [data-accordion])
 *    data-accordion=""  на контейнере — внутри него открытый <details>
 *                        закрывает остальные (по умолчанию ищется .accordion)
 *
 *  ТАБЫ
 *    data-tabs           на контейнере .tabs
 *    data-tab="panel-id" на каждой .tabs__btn (id панели)
 *
 *  МЕНЮ
 *    data-section="id"   на .nav__link — подсветить пункт, когда секция #id
 *                        в зоне видимости; работает и по location.hash
 *
 *  ПРОЧЕЕ
 *    data-year           на любом элементе — вставить текущий год (обычно .footer__year)
 *    data-toast="…"      на любом элементе — показать тост по клику
 *    data-toast-delay    рядом с data-toast — время показа, мс
 *
 *  АНИМАЦИИ (разделы 12–17; один общий rAF на scroll + resize, слушатели
 *  пассивные). Без IntersectionObserver или при prefers-reduced-motion: reduce
 *  всё показывается сразу, без движения.
 *
 *    data-stagger              на контейнере — дети появляются по очереди:
 *                              JS проставляет им --i (0, 1, 2…) и при входе
 *                              контейнера во вьюпорт вешает .is-visible на
 *                              контейнер И на детей
 *    data-stagger-step="80"    на контейнере — шаг задержки между детьми, мс;
 *                              пишется в --stagger-step на самом контейнере
 *    data-lines                на контейнере — как data-stagger, но индексуются
 *                              вложенные .line, а не прямые дети
 *    data-count="1997"         на элементе — конечное число счётчика; обычно
 *                              совпадает с текстом, который уже стоит в разметке
 *    data-count-to="4500"      на элементе — то же, но приоритетнее data-count
 *    data-count-duration="1400" на элементе — длительность счётчика, мс
 *                              (разряды разделяются неразрывным пробелом: 4 500;
 *                              «годы» вроде 1997 не форматируются)
 *    data-parallax="0.15"      на элементе — множитель параллакса (0.12 по
 *                              умолчанию); JS пишет --parallax-y в пределах
 *                              ±60px, transform обязан сделать CSS
 *    data-speed="32"           на [data-marquee] — скорость ленты в секундах на
 *                              круг; скрипт сам клонирует содержимое
 *                              .marquee__track, чтобы сдвиг -50% зациклился
 *    data-magnetic             на кнопке/ссылке — магнит к курсору:
 *                              (курсор − центр) × 0.18, не дальше ±8px.
 *                              Только для мыши; на тач-устройствах не подключается
 *    data-glow                 на карточке — мягкий радиальный градиент следует за
 *                              курсором через --mx/--my (без наклона карточки)
 *    .scroll-progress          полоса чтения; создаётся скриптом, если её нет в
 *                              разметке; CSS читает scaleX(var(--progress))
 *
 *  ТРЕБОВАНИЯ К РАЗМЕТКЕ
 *    <form class="form">
 *      <div class="field">
 *        <label for="name">Имя</label>
 *        <input id="name" name="name" type="text" required>
 *        <p class="field__hint">Подсказка (необязательно)</p>
 *        <p class="field__error"></p>   ← создастся сам, если забыть
 *      </div>
 *      …
 *    </form>
 *  JS сам ставит .has-error на .field, aria-invalid на поле и aria-describedby.
 * ============================================================================
 */

(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var BREAKPOINT = parseInt(root.getAttribute('data-burger-breakpoint'), 10) || 900;

  /* Класс .js нужен стилям для .reveal; ставим сразу, до инициализации. */
  root.classList.add('js');

  /* --- Небольшие утилиты --------------------------------------------- */

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function $(selector, scope) {
    return (scope || doc).querySelector(selector);
  }

  function $$(selector, scope) {
    return toArray((scope || doc).querySelectorAll(selector));
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ==========================================================================
     1. ЛИПКАЯ ШАПКА — фон, граница и тень появляются после 8px скролла
     ========================================================================== */

  function initStickyHeader() {
    var header = $('.header');
    if (!header || root.getAttribute('data-sticky') === 'off') return;

    var ticking = false;

    function update() {
      header.classList.toggle('is-stuck', window.pageYOffset > 8);
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

  /* ==========================================================================
     2. БУРГЕР-МЕНЮ
     ========================================================================== */

  function initBurger() {
    var burger = $('.burger');
    var nav = $('.nav');
    if (!burger || !nav) return;

    function isMobile() {
      return window.innerWidth <= BREAKPOINT;
    }

    function open() {
      burger.classList.add('is-open');
      nav.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      doc.body.classList.add('nav-open');
    }

    function close() {
      burger.classList.remove('is-open');
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      doc.body.classList.remove('nav-open');
    }

    function toggle() {
      if (burger.classList.contains('is-open')) close();
      else open();
    }

    burger.addEventListener('click', function (event) {
      event.preventDefault();
      toggle();
    });

    /* Закрытие по клику на ссылку внутри меню */
    nav.addEventListener('click', function (event) {
      var link = event.target.closest ? event.target.closest('a') : null;
      if (link && isMobile()) close();
    });

    /* Escape закрывает меню и возвращает фокус на бургер */
    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && burger.classList.contains('is-open')) {
        close();
        burger.focus();
      }
    });

    /* Клик вне меню */
    doc.addEventListener('click', function (event) {
      if (!burger.classList.contains('is-open')) return;
      if (nav.contains(event.target) || burger.contains(event.target)) return;
      close();
    });

    /* Возврат к десктопной вёрстке */
    window.addEventListener('resize', function () {
      if (!isMobile()) close();
    });
  }

  /* ==========================================================================
     3. FAQ на <details> — открытый закрывает остальные в своей группе
     ========================================================================== */

  function initAccordions() {
    $$('.accordion, [data-accordion]').forEach(function (group) {
      var items = toArray(group.querySelectorAll('details'));

      items.forEach(function (item) {
        item.addEventListener('toggle', function () {
          if (!item.open) return;
          items.forEach(function (other) {
            if (other !== item) other.open = false;
          });
        });
      });
    });
  }

  /* ==========================================================================
     4. ТАБЫ
     ========================================================================== */

  function initTabs() {
    $$('[data-tabs]').forEach(function (group) {
      var buttons = $$('.tabs__btn', group);
      if (!buttons.length) return;

      function activate(button) {
        buttons.forEach(function (btn) {
          var isActive = btn === button;
          var panelId = btn.getAttribute('data-tab');
          btn.classList.toggle('is-active', isActive);
          btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
          btn.setAttribute('tabindex', isActive ? '0' : '-1');
          if (!panelId) return;
          var panel = doc.getElementById(panelId);
          if (panel) panel.hidden = !isActive;
        });
      }

      buttons.forEach(function (btn, index) {
        btn.addEventListener('click', function () {
          activate(btn);
        });
        btn.addEventListener('keydown', function (event) {
          var next = null;
          if (event.key === 'ArrowRight') next = buttons[(index + 1) % buttons.length];
          if (event.key === 'ArrowLeft') next = buttons[(index - 1 + buttons.length) % buttons.length];
          if (!next) return;
          event.preventDefault();
          activate(next);
          next.focus();
        });
      });

      var current = buttons.filter(function (btn) {
        return btn.classList.contains('is-active');
      })[0] || buttons[0];
      activate(current);
    });
  }

  /* ==========================================================================
     5. ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ
     ========================================================================== */

  function initReveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    /* Нет IntersectionObserver или отключено движение — показываем сразу */
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      items.forEach(function (item) { item.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (item) { observer.observe(item); });
  }

  /* ==========================================================================
     6. АКТИВНЫЙ ПУНКТ МЕНЮ ПО ХЕШУ ИЛИ СЕКЦИИ
     ========================================================================== */

  function initActiveNav() {
    var links = $$('.nav__link[data-section]');
    if (!links.length) return;

    function mark(sectionId) {
      var found = false;
      links.forEach(function (link) {
        var isActive = link.getAttribute('data-section') === sectionId;
        if (isActive) found = true;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      return found;
    }

    var sections = links.map(function (link) {
      return doc.getElementById(link.getAttribute('data-section'));
    }).filter(Boolean);

    /* Точное совпадение с хешем при загрузке страницы */
    var hash = window.location.hash.replace('#', '');
    if (!hash || !mark(hash)) {
      links.forEach(function (link) { link.classList.remove('is-active'); });
    }

    if (!sections.length || !('IntersectionObserver' in window)) return;

    var visible = [];
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.id;
        var position = visible.indexOf(id);
        if (entry.isIntersecting && position === -1) visible.push(id);
        if (!entry.isIntersecting && position !== -1) visible.splice(position, 1);
      });
      if (visible.length) mark(visible[0]);
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ==========================================================================
     7. МАСКА ТЕЛЕФОНА +7 (___) ___-__-__
     ========================================================================== */

  function maskPhone(raw, prefix) {
    var p = prefix || '+7';
    var digits = String(raw).replace(/\D/g, '');

    if (digits.charAt(0) === '8') digits = '7' + digits.slice(1);
    if (digits.charAt(0) !== '7') digits = '7' + digits;
    digits = digits.slice(0, 11);

    var out = p;
    if (digits.length > 1) out += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) out += ') ';
    if (digits.length > 4) out += digits.slice(4, 7);
    if (digits.length >= 7) out += '-' + digits.slice(7, 9);
    if (digits.length >= 9) out += '-' + digits.slice(9, 11);
    return out;
  }

  function digitsCount(value) {
    return value.replace(/\D/g, '').length;
  }

  /* Ставит курсор после того же количества цифр, что было до правки */
  function restoreCaret(input) {
    var before = input.selectionStart === null ? input.value.length : input.selectionStart;
    var digitsBefore = digitsCount(input.value.slice(0, before));
    var seen = 0;
    var position = input.value.length;

    for (var i = 0; i < input.value.length; i += 1) {
      if (input.value.charAt(i) >= '0' && input.value.charAt(i) <= '9') {
        seen += 1;
        if (seen > digitsBefore) { position = i + 1; break; }
      }
    }

    try {
      input.setSelectionRange(position, position);
    } catch (err) {
      /* некоторые типы полей не поддерживают setSelectionRange — не критично */
    }
  }

  function initMasks() {
    $$('input[data-mask="phone"], input[type="tel"]').forEach(function (input) {
      var prefix = input.getAttribute('data-phone-prefix') || '+7';

      function apply() {
        if (input.value.charAt(0) !== prefix.charAt(0)) return;
        restoreCaret(input);
        input.value = maskPhone(input.value, prefix);
      }

      function onInput() {
        restoreCaret(input);
        input.value = maskPhone(input.value, prefix);
      }

      input.addEventListener('input', onInput);
      input.addEventListener('focus', function () {
        if (!input.value) input.value = prefix + ' ';
        apply();
      });
      input.addEventListener('blur', function () {
        if (digitsCount(input.value) <= 1) input.value = '';
      });
    });

    $$('input[data-mask="digits"]').forEach(function (input) {
      input.addEventListener('input', function () {
        input.value = input.value.replace(/\D/g, '');
      });
    });
  }

  /* ==========================================================================
     8. ТОСТ
     ========================================================================== */

  var toastTimer = null;

  function getToast() {
    var toast = $('.toast');
    if (!toast) {
      toast = doc.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      doc.body.appendChild(toast);
    }
    return toast;
  }

  function showToast(message, delay) {
    var toast = getToast();
    var life = parseInt(delay, 10) || 4500;

    toast.textContent = message;
    toast.classList.add('is-visible');

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, life);
  }

  function initToastTriggers() {
    $$('[data-toast]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        showToast(trigger.getAttribute('data-toast'), trigger.getAttribute('data-toast-delay'));
      });
    });
  }

  /* ==========================================================================
     9. ВАЛИДАЦИЯ ФОРМ
     ========================================================================== */

  function fieldWrap(input) {
    return input.closest ? input.closest('.field') : null;
  }

  function ensureErrorNode(field) {
    var node = field ? field.querySelector('.field__error') : null;
    if (node) return node;
    if (!field) return null;
    node = doc.createElement('p');
    node.className = 'field__error';
    field.appendChild(node);
    return node;
  }

  function setError(input, message) {
    var field = fieldWrap(input);
    var node = ensureErrorNode(field);

    if (!field) {
      input.setAttribute('aria-invalid', 'true');
      return;
    }

    field.classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');

    if (node) {
      node.textContent = message;
      if (!node.id) node.id = 'err-' + Math.random().toString(36).slice(2, 9);
      input.setAttribute('aria-describedby', node.id);
    }
  }

  function clearError(input) {
    var field = fieldWrap(input);
    input.removeAttribute('aria-invalid');

    if (!field) return;
    field.classList.remove('has-error');
    var node = field.querySelector('.field__error');
    if (node) node.textContent = '';
  }

  function customMessage(input, fallback) {
    return input.getAttribute('data-error') || fallback;
  }

  /* Возвращает текст ошибки или null, если поле в порядке */
  function validateInput(input) {
    var value = (input.value || '').trim();
    var required = input.hasAttribute('required') || input.hasAttribute('data-consent');
    var type = (input.getAttribute('type') || '').toLowerCase();
    var mask = input.getAttribute('data-mask');
    var validity = input.validity;

    if (required && !value && type !== 'checkbox') {
      return customMessage(input, 'Заполните это поле');
    }

    if (type === 'checkbox' && required && !input.checked) {
      return customMessage(input, 'Нужно ваше согласие');
    }

    if (!value && type !== 'checkbox') return null;

    if (mask === 'phone' || type === 'tel') {
      if (digitsCount(value) < 11) {
        return customMessage(input, 'Введите телефон полностью: +7 (___) ___-__-__');
      }
    }

    if (type === 'email' && validity && validity.typeMismatch) {
      return customMessage(input, 'Проверьте адрес почты');
    }

    if (type === 'url' && validity && validity.typeMismatch) {
      return customMessage(input, 'Проверьте адрес ссылки');
    }

    if (type === 'number') {
      if (validity && validity.rangeUnder) {
        return customMessage(input, 'Минимальное значение — ' + input.getAttribute('min'));
      }
      if (validity && validity.rangeOverflow) {
        return customMessage(input, 'Максимальное значение — ' + input.getAttribute('max'));
      }
    }

    if (validity && validity.patternMismatch) {
      return customMessage(input, 'Значение не соответствует формату');
    }

    if (validity && validity.tooShort) {
      return customMessage(input, 'Минимум ' + input.minLength + ' символов');
    }

    if (validity && validity.tooLong) {
      return customMessage(input, 'Максимум ' + input.maxLength + ' символов');
    }

    if (validity && validity.customError && input.validationMessage) {
      return input.validationMessage;
    }

    return null;
  }

  function validateForm(form) {
    var controls = $$('input, select, textarea', form).filter(function (el) {
      return el.type !== 'hidden' && !el.disabled;
    });

    var firstInvalid = null;
    var errorCount = 0;

    controls.forEach(function (input) {
      var message = validateInput(input);
      if (message) {
        setError(input, message);
        errorCount += 1;
        if (!firstInvalid) firstInvalid = input;
      } else {
        clearError(input);
      }
    });

    return { firstInvalid: firstInvalid, errorCount: errorCount };
  }

  function initForms() {
    var forms = $$('form');
    if (!forms.length) return;

    forms.forEach(function (form) {
      var controls = $$('input, select, textarea', form);

      /* Валидация по blur, а не на каждое нажатие клавиши */
      controls.forEach(function (input) {
        input.addEventListener('blur', function () {
          var message = validateInput(input);
          if (message) setError(input, message);
          else clearError(input);
        });

        /* После первой ошибки чистим её, как только поле стало валидным */
        input.addEventListener('input', function () {
          var field = fieldWrap(input);
          if (field && field.classList.contains('has-error') && !validateInput(input)) {
            clearError(input);
          }
        });
      });

      form.addEventListener('submit', function (event) {
        if (form.hasAttribute('data-native-submit')) return;

        event.preventDefault();

        var result = validateForm(form);
        if (result.errorCount > 0 && result.firstInvalid) {
          result.firstInvalid.focus();
          return;
        }

        var message = form.getAttribute('data-success') ||
          'Заявка отправлена. Мы перезвоним в течение рабочего дня.';

        form.reset();
        controls.forEach(clearError);
        showToast(message, form.getAttribute('data-success-delay'));
      });
    });
  }

  /* ==========================================================================
     10. ГОД В ПОДВАЛЕ
     ========================================================================== */

  function initYear() {
    var year = String(new Date().getFullYear());
    $$('[data-year]').forEach(function (node) {
      node.textContent = year;
    });
  }

  /* ==========================================================================
     11. ПЛАВНЫЙ ЯКОРЬ С УЧЁТОМ ШАПКИ
     scroll-padding-top в CSS делает основную работу; здесь — подстраховка
     для браузеров без scroll-behavior и закрытие мобильного меню.
     ========================================================================== */

  function initAnchors() {
    doc.addEventListener('click', function (event) {
      var link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
      if (!link) return;

      var hash = link.getAttribute('href');
      if (!hash || hash === '#' || hash.length < 2) return;

      var target = doc.getElementById(hash.slice(1));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start'
      });

      /* Переносим фокус на цель — иначе переход по якорю «слепой» для клавиатуры */
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });

      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', hash);
      }
    });
  }

  /* ==========================================================================
     12. РАСШИРЕНИЯ ПОЯВЛЕНИЯ: [data-stagger] и [data-lines]
     Схема та же, что у .reveal: индексы проставляются сразу, а .is-visible
     вешается на контейнер (и на его детей) при входе во вьюпорт. CSS смотрит
     на этот класс и на --i — точно так же, как на .reveal.is-visible.
     ========================================================================== */

  var REVEAL_VARIANT_OPTIONS = { threshold: 0.15, rootMargin: '0px 0px -8% 0px' };

  /* Что именно индексируется: строки внутри [data-lines], иначе — дети */
  function revealVariantTargets(group) {
    return group.hasAttribute('data-lines') ? $$('.line', group) : toArray(group.children);
  }

  function prepareRevealVariant(group) {
    var step = parseFloat(group.getAttribute('data-stagger-step'));
    if (isFinite(step) && step >= 0) group.style.setProperty('--stagger-step', step + 'ms');

    revealVariantTargets(group).forEach(function (node, index) {
      node.style.setProperty('--i', String(index));
    });
  }

  /* Класс ставим и на контейнер, и на детей: работают обе формы селекторов —
     и «.is-visible на родителе», и «.is-visible на самом элементе». */
  function showRevealVariant(group) {
    group.classList.add('is-visible');
    revealVariantTargets(group).forEach(function (node) { node.classList.add('is-visible'); });
  }

  function initRevealVariants() {
    var groups = $$('[data-stagger], [data-lines]');
    if (!groups.length) return;

    groups.forEach(prepareRevealVariant);

    /* Нет IntersectionObserver или движение отключено — показываем сразу */
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      groups.forEach(showRevealVariant);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        showRevealVariant(entry.target);
        observer.unobserve(entry.target);
      });
    }, REVEAL_VARIANT_OPTIONS);

    groups.forEach(function (group) { observer.observe(group); });
  }

  /* ==========================================================================
     13. СЧЁТЧИКИ [data-count] / [data-count-to]
     В разметке число уже стоит текстом — скрипт его только заменяет, вёрстка
     не ломается: меняется textContent того же элемента.
     ========================================================================== */

  var COUNT_DURATION = 1400;

  function easeOutExpo(t) {
    return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /* 4500 -> "4 500" (неразрывный пробел). Годы и не круглые — как есть */
  function formatCount(value, grouped) {
    var text = String(Math.round(value));
    if (!grouped) return text;
    return text.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /* «4 500», «1997» и «4500,5» разбираются одинаково; \s покрывает и неразрывный пробел */
  function parseCount(raw) {
    var value = parseFloat(String(raw).replace(/\s/g, '').replace(',', '.'));
    return isFinite(value) ? value : null;
  }

  /* data-count-to важнее data-count; если они нечисловые — берём текст разметки */
  function readCountTarget(node) {
    var raw = node.getAttribute('data-count-to');
    if (raw === null) raw = node.getAttribute('data-count');

    var value = raw === null ? null : parseCount(raw);
    if (value === null) value = parseCount(node.textContent);
    return value;
  }

  function runCount(node, target, grouped) {
    var duration = parseInt(node.getAttribute('data-count-duration'), 10);
    if (!isFinite(duration) || duration <= 0) duration = COUNT_DURATION;
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var passed = (now - start) / duration;
      node.textContent = formatCount(target * easeOutExpo(passed > 1 ? 1 : passed), grouped);
      if (passed < 1) window.requestAnimationFrame(frame);
      else node.textContent = formatCount(target, grouped);
    }

    window.requestAnimationFrame(frame);
  }

  function initCounters() {
    var nodes = $$('[data-count-to], [data-count]');
    if (!nodes.length) return;

    var instant = prefersReducedMotion() || !('IntersectionObserver' in window);

    var counters = nodes.map(function (node) {
      var target = readCountTarget(node);
      if (target === null) return null;
      /* Разряды разделяем только у круглых чисел — так «1997» остаётся годом */
      var grouped = Math.abs(target) > 999 && target % 100 === 0;
      if (instant) node.textContent = formatCount(target, grouped);
      return { node: node, target: target, grouped: grouped };
    }).filter(Boolean);

    if (instant || !counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        var item = counters.filter(function (counter) {
          return counter.node === entry.target;
        })[0];
        if (item) runCount(item.node, item.target, item.grouped);
      });
    }, { threshold: 0.35 });

    counters.forEach(function (item) { observer.observe(item.node); });
  }

  /* ==========================================================================
     14. ПОЛОСА ЧТЕНИЯ И ПАРАЛЛАКС — один rAF на scroll и resize
     Никаких таймеров: кадр планируется только тогда, когда есть что рисовать.
     ========================================================================== */

  var PARALLAX_LIMIT = 60;

  function clamp(value, min, max) {
    return value < min ? min : (value > max ? max : value);
  }

  function ensureProgressBar() {
    var bar = $('.scroll-progress');
    if (bar) return bar;
    if (!doc.body) return null;

    bar = doc.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    bar.style.setProperty('--progress', '0');
    doc.body.appendChild(bar);
    return bar;
  }

  function initScrollEffects() {
    /* При отключённом движении параллакс не считаем вообще */
    var layers = prefersReducedMotion() ? [] : $$('[data-parallax]').map(function (node) {
      var speed = parseFloat(node.getAttribute('data-parallax'));
      return { node: node, speed: isFinite(speed) ? speed : 0.12, shift: 0 };
    });

    var bar = ensureProgressBar();
    if (!bar && !layers.length) return;

    var current = 0;
    var queued = false;

    function schedule() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(frame);
    }

    function frame() {
      queued = false;

      var scrollable = (doc.documentElement.scrollHeight || 0) - (window.innerHeight || 0);
      var offset = window.pageYOffset || root.scrollTop || 0;
      var goal = scrollable > 0 ? clamp(offset / scrollable, 0, 1) : 0;

      /* Экспоненциальное приближение — полоса не дёргается на каждом кадре */
      var delta = goal - current;
      current = Math.abs(delta) < 0.001 ? goal : current + delta * 0.16;
      if (bar) bar.style.setProperty('--progress', current.toFixed(4));

      /* Параллакс: смещение от расстояния до центра вьюпорта */
      var moving = false;
      var viewport = window.innerHeight || 0;
      var center = viewport / 2;

      for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var rect = layer.node.getBoundingClientRect();
        var onScreen = rect.bottom > -PARALLAX_LIMIT && rect.top < viewport + PARALLAX_LIMIT;

        if (!onScreen) {
          if (layer.shift) {
            layer.shift = 0;
            layer.node.style.setProperty('--parallax-y', '0px');
          }
          continue;
        }

        var shift = clamp((center - (rect.top + rect.height / 2)) * layer.speed,
          -PARALLAX_LIMIT, PARALLAX_LIMIT);
        layer.shift = shift;
        layer.node.style.setProperty('--parallax-y', shift.toFixed(2) + 'px');
        moving = true;
      }

      /* Цикл живёт, пока полоса не догнала скролл и в кадре есть параллакс */
      if (moving || Math.abs(goal - current) > 0.001) schedule();
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    schedule();
  }

  /* ==========================================================================
     15. МАГНИТНЫЕ КНОПКИ [data-magnetic]
     Только мышь. На тач-устройствах обработчики не подключаются вовсе.
     ========================================================================== */

  var MAGNET_LIMIT = 8;

  function initMagnetic() {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    $$('[data-magnetic]').forEach(function (node) {
      var pull = parseFloat(node.getAttribute('data-magnetic'));
      if (!isFinite(pull)) pull = 0.18;

      node.addEventListener('mousemove', function (event) {
        var rect = node.getBoundingClientRect();
        var x = clamp((event.clientX - (rect.left + rect.width / 2)) * pull, -MAGNET_LIMIT, MAGNET_LIMIT);
        var y = clamp((event.clientY - (rect.top + rect.height / 2)) * pull, -MAGNET_LIMIT, MAGNET_LIMIT);
        node.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)';
      });

      /* Возврат в ноль даёт transition из CSS */
      node.addEventListener('mouseleave', function () { node.style.transform = ''; });
    });
  }

  /* ==========================================================================
     16. БЕСКОНЕЧНАЯ ЛЕНТА [data-marquee]
     Анимация сдвигает трек на -50%, поэтому внутри должно быть два одинаковых
     набора элементов — второй добавляем один раз, клон скрываем от скринридера.
     ========================================================================== */

  function initMarquees() {
    $$('[data-marquee]').forEach(function (wrap) {
      var track = $('.marquee__track', wrap);
      if (!track || track.hasAttribute('data-marquee-ready')) return;

      var speed = parseFloat(wrap.getAttribute('data-speed'));
      if (!isFinite(speed) || speed <= 0) speed = 32;
      wrap.style.setProperty('--speed', speed + 's');

      var copy = track.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      while (copy.firstChild) track.appendChild(copy.firstChild);

      track.setAttribute('data-marquee-ready', '1');
    });
  }

  /* ==========================================================================
     17. МЯГКОЕ СВЕЧЕНИЕ [data-glow]
     Намеренно без наклона карточек: только позиция радиального градиента.
     ========================================================================== */

  function initGlow() {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    $$('[data-glow]').forEach(function (node) {
      /* Значения задаём сразу — тогда radial-gradient всегда валиден */
      node.style.setProperty('--mx', '50%');
      node.style.setProperty('--my', '50%');

      node.addEventListener('pointermove', function (event) {
        var rect = node.getBoundingClientRect();
        node.style.setProperty('--mx', (event.clientX - rect.left).toFixed(1) + 'px');
        node.style.setProperty('--my', (event.clientY - rect.top).toFixed(1) + 'px');
      });

      node.addEventListener('pointerleave', function () {
        node.style.setProperty('--mx', '50%');
        node.style.setProperty('--my', '50%');
      });
    });
  }

  /* ==========================================================================
     ЗАПУСК
     ========================================================================== */

  function init() {
    initStickyHeader();
    initBurger();
    initAccordions();
    initTabs();
    initMasks();
    initForms();
    initReveal();
    initActiveNav();
    initToastTriggers();
    initAnchors();
    initYear();

    /* Блок анимаций: появление, счётчики, полоса чтения, лента, магнит, glow */
    initRevealVariants();
    initCounters();
    initScrollEffects();
    initMarquees();
    initMagnetic();
    initGlow();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
