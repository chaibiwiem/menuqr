const nodemailer = require('nodemailer');

const SUBJECTS = {
  reset: {
    fr: 'Réinitialisation de votre mot de passe — MenuQR',
    en: 'Reset your password — MenuQR',
    it: 'Reimposta la tua password — MenuQR',
    ar: 'إعادة تعيين كلمة المرور — MenuQR',
  },
};

const GREETINGS = {
  fr: (name) => `Bonjour ${name},`,
  en: (name) => `Hello ${name},`,
  it: (name) => `Ciao ${name},`,
  ar: (name) => `مرحباً ${name}،`,
};

const RESET_BODY = {
  fr: (url) => `
    <p>Vous avez demandé la réinitialisation de votre mot de passe MenuQR.</p>
    <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien est valable <strong>1 heure</strong>.</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="${url}" style="background:#6C47FF;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
        Réinitialiser mon mot de passe
      </a>
    </p>
    <p style="color:#999;font-size:13px;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
    <p style="color:#999;font-size:12px;word-break:break-all;">Lien direct : ${url}</p>
  `,
  en: (url) => `
    <p>You requested a password reset for your MenuQR account.</p>
    <p>Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="${url}" style="background:#6C47FF;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
        Reset my password
      </a>
    </p>
    <p style="color:#999;font-size:13px;">If you didn't request this, please ignore this email.</p>
    <p style="color:#999;font-size:12px;word-break:break-all;">Direct link: ${url}</p>
  `,
  it: (url) => `
    <p>Hai richiesto il ripristino della password del tuo account MenuQR.</p>
    <p>Clicca il pulsante qui sotto per impostare una nuova password. Il link è valido per <strong>1 ora</strong>.</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="${url}" style="background:#6C47FF;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
        Reimposta la mia password
      </a>
    </p>
    <p style="color:#999;font-size:13px;">Se non hai fatto questa richiesta, ignora questa email.</p>
    <p style="color:#999;font-size:12px;word-break:break-all;">Link diretto: ${url}</p>
  `,
  ar: (url) => `
    <p>طلبت إعادة تعيين كلمة مرور حسابك في MenuQR.</p>
    <p>انقر على الزر أدناه لتعيين كلمة مرور جديدة. هذا الرابط صالح لمدة <strong>ساعة واحدة</strong>.</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="${url}" style="background:#6C47FF;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
        إعادة تعيين كلمة المرور
      </a>
    </p>
    <p style="color:#999;font-size:13px;">إذا لم تطلب ذلك، يرجى تجاهل هذا البريد الإلكتروني.</p>
    <p style="color:#999;font-size:12px;word-break:break-all;">الرابط المباشر: ${url}</p>
  `,
};

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function buildHtml(greeting, bodyHtml, lang) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#6C47FF;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">MenuQR</h1>
            <p style="color:rgba(255,255,255,.75);margin:4px 0 0;font-size:13px;">Hannibal Advanced Solutions</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;color:#333;font-size:15px;line-height:1.6;">
            <p style="margin:0 0 16px;">${greeting}</p>
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="color:#bbb;font-size:12px;margin:0;">
              © ${new Date().getFullYear()} Hannibal Advanced Solutions — MenuQR
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

exports.sendWelcomeOwner = async ({ to, name, username, tempPassword, restaurantName, loginUrl, language = 'fr' }) => {
  const lang = ['fr', 'en', 'it', 'ar'].includes(language) ? language : 'fr';
  const subjects = {
    fr: `Bienvenue sur MenuQR — ${restaurantName}`,
    en: `Welcome to MenuQR — ${restaurantName}`,
    it: `Benvenuto su MenuQR — ${restaurantName}`,
    ar: `مرحباً بك في MenuQR — ${restaurantName}`,
  };
  const bodies = {
    fr: `
      <p>Votre espace MenuQR pour <strong>${restaurantName}</strong> est prêt !</p>
      <p><strong>Identifiant :</strong> ${username}<br/><strong>Mot de passe temporaire :</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${tempPassword}</code></p>
      <p style="text-align:center;margin:32px 0;"><a href="${loginUrl}" style="background:#6C47FF;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Accéder à mon espace</a></p>
      <p style="color:#999;font-size:13px;">Vous serez invité à changer votre mot de passe lors de la première connexion.</p>
    `,
    en: `
      <p>Your MenuQR space for <strong>${restaurantName}</strong> is ready!</p>
      <p><strong>Username:</strong> ${username}<br/><strong>Temporary password:</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${tempPassword}</code></p>
      <p style="text-align:center;margin:32px 0;"><a href="${loginUrl}" style="background:#6C47FF;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Access my space</a></p>
      <p style="color:#999;font-size:13px;">You will be prompted to change your password on first login.</p>
    `,
    it: `
      <p>Il tuo spazio MenuQR per <strong>${restaurantName}</strong> è pronto!</p>
      <p><strong>Username:</strong> ${username}<br/><strong>Password temporanea:</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${tempPassword}</code></p>
      <p style="text-align:center;margin:32px 0;"><a href="${loginUrl}" style="background:#6C47FF;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Accedi al mio spazio</a></p>
      <p style="color:#999;font-size:13px;">Sarai invitato a cambiare la password al primo accesso.</p>
    `,
    ar: `
      <p>مساحتك في MenuQR لـ <strong>${restaurantName}</strong> جاهزة!</p>
      <p><strong>اسم المستخدم:</strong> ${username}<br/><strong>كلمة المرور المؤقتة:</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${tempPassword}</code></p>
      <p style="text-align:center;margin:32px 0;"><a href="${loginUrl}" style="background:#6C47FF;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">الدخول إلى حسابي</a></p>
      <p style="color:#999;font-size:13px;">ستُطلب منك تغيير كلمة المرور عند أول تسجيل دخول.</p>
    `,
  };

  const html = buildHtml(GREETINGS[lang](name), bodies[lang], lang);
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
    console.log(`[EMAIL] Welcome → ${to} | Username: ${username} | Pass: ${tempPassword}`);
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({ from: `"MenuQR" <${process.env.SMTP_USER}>`, to, subject: subjects[lang], html });
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatReservationDate(dateStr, lang) {
  const locales = { fr: 'fr-FR', en: 'en-GB', it: 'it-IT', ar: 'ar-TN' };
  return new Date(dateStr + 'T12:00:00').toLocaleDateString(locales[lang] || 'fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function zoneLabel(zone, lang) {
  const labels = {
    SALLE:    { fr: 'Salle intérieure', en: 'Indoor', it: 'Sala interna', ar: 'القاعة الداخلية' },
    TERRASSE: { fr: 'Terrasse', en: 'Terrace', it: 'Terrazza', ar: 'التراس' },
    ETAGE:    { fr: 'Étage', en: 'Upper floor', it: 'Piano superiore', ar: 'الطابق العلوي' },
  };
  return (labels[zone] || {})[lang] || zone;
}

function reservationInfoBlock(r, lang) {
  const date = formatReservationDate(r.reservation_date, lang);
  const time = r.reservation_time ? r.reservation_time.slice(0, 5) : '';
  const zone = zoneLabel(r.zone, lang);
  const labels = {
    fr: { date: 'Date', time: 'Heure', covers: 'Couverts', zone: 'Zone', ref: 'Référence' },
    en: { date: 'Date', time: 'Time', covers: 'Guests', zone: 'Area', ref: 'Reference' },
    it: { date: 'Data', time: 'Ora', covers: 'Coperti', zone: 'Zona', ref: 'Riferimento' },
    ar: { date: 'التاريخ', time: 'الوقت', covers: 'عدد الأشخاص', zone: 'المنطقة', ref: 'المرجع' },
  };
  const l = labels[lang] || labels.fr;
  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
      <tr style="background:#f9f9f9;"><td style="padding:8px 12px;color:#666;">${l.date}</td><td style="padding:8px 12px;font-weight:600;">${date}</td></tr>
      <tr><td style="padding:8px 12px;color:#666;">${l.time}</td><td style="padding:8px 12px;font-weight:600;">${time}</td></tr>
      <tr style="background:#f9f9f9;"><td style="padding:8px 12px;color:#666;">${l.covers}</td><td style="padding:8px 12px;font-weight:600;">${r.covers}</td></tr>
      <tr><td style="padding:8px 12px;color:#666;">${l.zone}</td><td style="padding:8px 12px;font-weight:600;">${zone}</td></tr>
      <tr style="background:#f9f9f9;"><td style="padding:8px 12px;color:#666;">${l.ref}</td><td style="padding:8px 12px;font-weight:600;">#${r.id}</td></tr>
    </table>`;
}

// ─── Reservation Confirmation ─────────────────────────────────────────────────

exports.sendReservationConfirmation = async ({ reservation: r, restaurantName, lang = 'fr', cancelUrl }) => {
  if (!r.email) return;
  const safeLang = ['fr', 'en', 'it', 'ar'].includes(lang) ? lang : 'fr';

  const subjects = {
    fr: `Votre réservation chez ${restaurantName} — Confirmation`,
    en: `Your reservation at ${restaurantName} — Confirmation`,
    it: `La tua prenotazione da ${restaurantName} — Conferma`,
    ar: `حجزك في ${restaurantName} — تأكيد`,
  };

  const isPending = r.status === 'EN_ATTENTE';

  const bodies = {
    fr: () => `
      <p>${isPending
        ? `Votre demande de réservation chez <strong>${restaurantName}</strong> a bien été reçue et est en attente de confirmation.`
        : `Votre réservation chez <strong>${restaurantName}</strong> est <strong style="color:#22c55e;">confirmée</strong> !`
      }</p>
      ${reservationInfoBlock(r, 'fr')}
      ${cancelUrl ? `<p style="font-size:13px;color:#999;">Pour annuler : <a href="${cancelUrl}" style="color:#6C47FF;">${cancelUrl}</a></p>` : ''}
    `,
    en: () => `
      <p>${isPending
        ? `Your reservation request at <strong>${restaurantName}</strong> has been received and is pending confirmation.`
        : `Your reservation at <strong>${restaurantName}</strong> is <strong style="color:#22c55e;">confirmed</strong>!`
      }</p>
      ${reservationInfoBlock(r, 'en')}
      ${cancelUrl ? `<p style="font-size:13px;color:#999;">To cancel: <a href="${cancelUrl}" style="color:#6C47FF;">${cancelUrl}</a></p>` : ''}
    `,
    it: () => `
      <p>${isPending
        ? `La tua richiesta di prenotazione da <strong>${restaurantName}</strong> è stata ricevuta ed è in attesa di conferma.`
        : `La tua prenotazione da <strong>${restaurantName}</strong> è <strong style="color:#22c55e;">confermata</strong>!`
      }</p>
      ${reservationInfoBlock(r, 'it')}
    `,
    ar: () => `
      <p>${isPending
        ? `تم استلام طلب حجزك في <strong>${restaurantName}</strong> وهو في انتظار التأكيد.`
        : `حجزك في <strong>${restaurantName}</strong> <strong style="color:#22c55e;">مؤكد</strong>!`
      }</p>
      ${reservationInfoBlock(r, 'ar')}
    `,
  };

  const name = `${r.first_name} ${r.last_name}`;
  const html = buildHtml(GREETINGS[safeLang](name), bodies[safeLang](), safeLang);

  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
    console.log(`[EMAIL] Reservation confirmation → ${r.email} | #${r.id} | ${restaurantName}`);
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({ from: `"${restaurantName}" <${process.env.SMTP_USER}>`, to: r.email, subject: subjects[safeLang], html });
};

// ─── Reservation Status Update ────────────────────────────────────────────────

exports.sendReservationStatusUpdate = async ({ reservation: r, restaurantName, lang = 'fr' }) => {
  if (!r.email) return;
  const safeLang = ['fr', 'en', 'it', 'ar'].includes(lang) ? lang : 'fr';

  const isConfirmed = r.status === 'CONFIRMEE';
  const isCancelled = ['ANNULEE', 'ANNULEE_RESTAURANT', 'REFUSEE'].includes(r.status);

  if (!isConfirmed && !isCancelled) return;

  const subjects = {
    confirmed: {
      fr: `Réservation confirmée — ${restaurantName}`,
      en: `Reservation confirmed — ${restaurantName}`,
      it: `Prenotazione confermata — ${restaurantName}`,
      ar: `تم تأكيد الحجز — ${restaurantName}`,
    },
    cancelled: {
      fr: `Réservation annulée — ${restaurantName}`,
      en: `Reservation cancelled — ${restaurantName}`,
      it: `Prenotazione annullata — ${restaurantName}`,
      ar: `تم إلغاء الحجز — ${restaurantName}`,
    },
  };

  const bodies = {
    fr: () => isConfirmed
      ? `<p>Bonne nouvelle ! Votre réservation chez <strong>${restaurantName}</strong> est <strong style="color:#22c55e;">confirmée</strong>.</p>${reservationInfoBlock(r, 'fr')}`
      : `<p>Votre réservation chez <strong>${restaurantName}</strong> a été <strong style="color:#ef4444;">annulée</strong>${r.cancel_reason ? ` : ${r.cancel_reason}` : ''}.</p>${reservationInfoBlock(r, 'fr')}`,
    en: () => isConfirmed
      ? `<p>Great news! Your reservation at <strong>${restaurantName}</strong> is <strong style="color:#22c55e;">confirmed</strong>.</p>${reservationInfoBlock(r, 'en')}`
      : `<p>Your reservation at <strong>${restaurantName}</strong> has been <strong style="color:#ef4444;">cancelled</strong>${r.cancel_reason ? `: ${r.cancel_reason}` : ''}.</p>${reservationInfoBlock(r, 'en')}`,
    it: () => isConfirmed
      ? `<p>Ottima notizia! La tua prenotazione da <strong>${restaurantName}</strong> è <strong style="color:#22c55e;">confermata</strong>.</p>${reservationInfoBlock(r, 'it')}`
      : `<p>La tua prenotazione da <strong>${restaurantName}</strong> è stata <strong style="color:#ef4444;">annullata</strong>.</p>${reservationInfoBlock(r, 'it')}`,
    ar: () => isConfirmed
      ? `<p>خبر سار! حجزك في <strong>${restaurantName}</strong> <strong style="color:#22c55e;">مؤكد</strong>.</p>${reservationInfoBlock(r, 'ar')}`
      : `<p>تم <strong style="color:#ef4444;">إلغاء</strong> حجزك في <strong>${restaurantName}</strong>.</p>${reservationInfoBlock(r, 'ar')}`,
  };

  const subjectKey = isConfirmed ? 'confirmed' : 'cancelled';
  const name = `${r.first_name} ${r.last_name}`;
  const html = buildHtml(GREETINGS[safeLang](name), bodies[safeLang](), safeLang);

  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
    console.log(`[EMAIL] Reservation status (${r.status}) → ${r.email} | #${r.id}`);
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({ from: `"${restaurantName}" <${process.env.SMTP_USER}>`, to: r.email, subject: subjects[subjectKey][safeLang], html });
};

// ─── Reservation Reminder J-1 ─────────────────────────────────────────────────

exports.sendReservationReminderJ1 = async ({ reservation: r, restaurantName, lang = 'fr' }) => {
  if (!r.email) return;
  const safeLang = ['fr', 'en', 'it', 'ar'].includes(lang) ? lang : 'fr';

  const subjects = {
    fr: `Rappel : votre réservation demain chez ${restaurantName}`,
    en: `Reminder: your reservation tomorrow at ${restaurantName}`,
    it: `Promemoria: la tua prenotazione domani da ${restaurantName}`,
    ar: `تذكير: حجزك غداً في ${restaurantName}`,
  };

  const bodies = {
    fr: () => `<p>Nous vous rappelons que vous avez une réservation demain chez <strong>${restaurantName}</strong>.</p>${reservationInfoBlock(r, 'fr')}<p style="color:#999;font-size:13px;">Si vous avez un empêchement, contactez-nous dès que possible.</p>`,
    en: () => `<p>This is a reminder that you have a reservation tomorrow at <strong>${restaurantName}</strong>.</p>${reservationInfoBlock(r, 'en')}<p style="color:#999;font-size:13px;">If you cannot make it, please contact us as soon as possible.</p>`,
    it: () => `<p>Ti ricordiamo che hai una prenotazione domani da <strong>${restaurantName}</strong>.</p>${reservationInfoBlock(r, 'it')}<p style="color:#999;font-size:13px;">Se non puoi venire, contattaci il prima possibile.</p>`,
    ar: () => `<p>نذكرك بأن لديك حجزاً غداً في <strong>${restaurantName}</strong>.</p>${reservationInfoBlock(r, 'ar')}<p style="color:#999;font-size:13px;">إذا لم تتمكن من الحضور، يرجى التواصل معنا في أقرب وقت.</p>`,
  };

  const name = `${r.first_name} ${r.last_name}`;
  const html = buildHtml(GREETINGS[safeLang](name), bodies[safeLang](), safeLang);

  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
    console.log(`[EMAIL] Reminder J-1 → ${r.email} | #${r.id} | ${restaurantName}`);
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({ from: `"${restaurantName}" <${process.env.SMTP_USER}>`, to: r.email, subject: subjects[safeLang], html });
};

// ─── Password Reset ───────────────────────────────────────────────────────────

exports.sendPasswordReset = async (to, name, token, lang = 'fr') => {
  const safeLang = ['fr', 'en', 'it', 'ar'].includes(lang) ? lang : 'fr';
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = buildHtml(
    GREETINGS[safeLang](name),
    RESET_BODY[safeLang](resetUrl),
    safeLang
  );

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"MenuQR" <${process.env.SMTP_USER}>`,
    to,
    subject: SUBJECTS.reset[safeLang],
    html,
  });
};
