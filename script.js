/* =========================================================
   株式会社あさつゆ住建 会社サイト 共通スクリプト
   1. スマホのメニュー開閉
   2. 施工事例の絞り込み（works.html）
   3. お問い合わせフォームの入力チェックとダミー送信（contact.html）
   ========================================================= */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. スマホのメニュー開閉 ---------- */
  var header = document.querySelector('.header');
  var menuBtn = document.querySelector('.menu-btn');
  if (header && menuBtn) {
    var label = menuBtn.querySelector('.sr-only');
    var setOpen = function (open) {
      header.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? 'メニューを閉じる' : 'メニューを開く';
    };
    menuBtn.addEventListener('click', function () {
      setOpen(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    // メニュー内のリンクを押したら閉じる（ページ内リンクのとき用）
    header.querySelectorAll('.gnav a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    // Escキーで閉じる
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        setOpen(false);
        menuBtn.focus();
      }
    });
    // PC幅に広げたら閉じた状態に戻す
    window.matchMedia('(min-width: 1100px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* ---------- 2. 施工事例の絞り込み ---------- */
  var filter = document.querySelector('.filter');
  if (filter) {
    var buttons = filter.querySelectorAll('button[data-filter]');
    var cases = document.querySelectorAll('.case-grid .case');
    var status = document.querySelector('.filter-status');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.dataset.filter;
        var shown = 0;
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        cases.forEach(function (c) {
          var match = cat === 'all' || c.dataset.cat === cat;
          c.hidden = !match;
          if (match) shown++;
        });
        if (status) {
          status.textContent = (cat === 'all' ? 'すべての分類' : btn.textContent) + 'の施工事例を' + shown + '件表示しています。';
        }
      });
    });
  }

  /* ---------- 3. お問い合わせフォーム（ダミー送信） ---------- */
  var form = document.querySelector('form[data-demo]');
  if (form) {
    var done = form.querySelector('.form__done');

    // ご希望の連絡方法で選ばれているもの（未選択なら空文字）
    var contactMethod = function () {
      var c = form.querySelector('input[name="ご希望の連絡方法"]:checked');
      return c ? c.value : '';
    };

    // 各項目のチェック。問題なければ空文字、あればエラー文を返す
    var rules = {
      'ご相談の種類': function (f) { return f.querySelector('input:checked') ? '' : 'ご相談の種類を選んでください。'; },
      '工事したい場所[]': function (f) { return f.querySelector('input:checked') ? '' : '工事したい場所を1つ以上選んでください。'; },
      'お名前': function (f) { return f.querySelector('input').value.trim() ? '' : 'お名前を入力してください。'; },
      '電話番号': function (f) {
        var v = f.querySelector('input').value.replace(/[\s\-‐－()（）]/g, '');
        if (!v) return contactMethod() === '電話' ? '電話番号を入力してください。' : '';
        return /^[0-9０-９]{10,11}$/.test(v) ? '' : '電話番号は10〜11桁の数字で入力してください。';
      },
      'メールアドレス': function (f) {
        var v = f.querySelector('input').value.trim();
        if (!v) return contactMethod() === 'メール' ? 'メールアドレスを入力してください。' : '';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'メールアドレスの形式を確かめてください。';
      },
      'お住まいの市区町村': function (f) { return f.querySelector('input').value.trim() ? '' : 'お住まいの市区町村を入力してください。'; },
      'ご希望の連絡方法': function (f) { return f.querySelector('input:checked') ? '' : 'ご希望の連絡方法を選んでください。'; }
    };

    var check = function (field) {
      var msg = rules[field.dataset.field](field);
      var err = field.querySelector('.field__error');
      field.classList.toggle('is-error', !!msg);
      if (err) err.textContent = msg;
      field.querySelectorAll('input').forEach(function (i) {
        if (msg) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid');
      });
      return !msg;
    };

    var fields = form.querySelectorAll('.field[data-field]');
    // 一度エラーが出た項目は、直したらすぐにエラーを消す
    fields.forEach(function (field) {
      field.addEventListener('change', function () { if (field.classList.contains('is-error')) check(field); });
      field.addEventListener('input', function () { if (field.classList.contains('is-error')) check(field); });
    });

    // 連絡方法で選んだほうだけを「必須」にし、選んでいないほうは「任意」と表示する
    var contactFields = { '電話': form.querySelector('[data-field="電話番号"]'), 'メール': form.querySelector('[data-field="メールアドレス"]') };
    var updateContactRequired = function () {
      var method = contactMethod();
      Object.keys(contactFields).forEach(function (key) {
        var field = contactFields[key];
        var isReq = method === key;
        var tag = field.querySelector('[data-contact-tag]');
        tag.className = isReq ? 'req-tag' : 'opt-tag';
        tag.textContent = isReq ? '必須' : '任意';
        field.querySelector('input').required = isReq;
        if (field.classList.contains('is-error')) check(field);
      });
    };
    form.querySelectorAll('input[name="ご希望の連絡方法"]').forEach(function (r) {
      r.addEventListener('change', updateContactRequired);
    });
    updateContactRequired();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstError = null;
      fields.forEach(function (field) {
        if (!check(field) && !firstError) firstError = field;
      });
      if (firstError) {
        done.classList.remove('is-show');
        var target = firstError.querySelector('input');
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (target) target.focus({ preventScroll: true });
        return;
      }
      // デモのため送信しない。SSGformなどに差し替えるときは、この submit の処理を外して form の action を設定する
      var data = {};
      new FormData(form).forEach(function (value, key) {
        if (data[key]) data[key] = [].concat(data[key], value);
        else data[key] = value;
      });
      console.log('お問い合わせ内容（デモのため送信していません）', data);
      done.classList.add('is-show');
      done.focus();
    });
  }
});
