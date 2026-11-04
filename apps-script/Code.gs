var SHEET_ID = '1BG2zZ8rq7IB82vXKIYBXXo1yEaroCpMpOy2oxyj0Jrs';
var HEADERS = [
  'رقم البطاقة', 'تاريخ الإرسال', 'الولاية', 'البلدية', 'نوع البطاقة',
  'الاسم / القائمة', 'المؤسسة', 'الوضعية', 'بيانات النظام', 'الحالة'
];
var ACCOUNT_HEADERS = [
  'اسم المستخدم', 'ملح', 'تجزئة كلمة المرور', 'الدور', 'الاسم',
  'رمز الولاية', 'اسم الولاية', 'البلدية', 'المؤسسة / الفرع', 'الحالة'
];
var PORTAL_MEMBER_HEADERS = [
  'معرف الحساب', 'الاسم', 'الدور', 'رمز الولاية', 'اسم الولاية',
  'البلدية', 'المؤسسة', 'الحالة', 'تاريخ التفعيل', 'ملح كلمة المرور', 'تجزئة كلمة المرور'
];
var MESSAGE_CODE_HEADERS = ['تجزئة الرمز', 'رقم البطاقة', 'تاريخ الانتهاء'];
var INTERNAL_MESSAGE_HEADERS = [
  'معرف الرسالة', 'معرف المرسل', 'اسم المرسل', 'معرف المستلم',
  'اسم المستلم', 'الموضوع', 'نص الرسالة', 'تاريخ الإرسال', 'تاريخ القراءة'
];
var SESSION_TTL_SECONDS = 21600;

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'accountSetup') {
    return HtmlService.createHtmlOutput(accountSetupPage_());
  }
  if (p.action === 'getCard') {
    var result;
    try {
      result = p.sessionToken
        ? getCardsForSession_({ sessionToken: p.sessionToken, ref: p.ref, wilaya: p.wilaya })
        : getWilayaCard_(p.ref, p.wilaya, p.pin);
    } catch (err) {
      result = error_(err);
    }
    return legacyGetResponse_(result, p.callback);
  }
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      service: 'SNTE contact portal API',
      actions: ['login', 'getCard', 'POST save']
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function legacyGetResponse_(result, callback) {
  var json = JSON.stringify(result);
  if (callback) {
    var safeCallback = String(callback).replace(/[^\w$]/g, '');
    if (!safeCallback) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'اسم دالة الاستدعاء غير صالح.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService
      .createTextOutput(safeCallback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function getWilayaCard_(ref, wilaya, pin) {
  checkPin_(pin);
  ref = String(ref || '').trim();
  wilaya = String(wilaya || '').trim();
  if (!wilaya) return { status: 'error', message: 'يرجى إدخال اسم الولاية.' };

  var rows = getSheet_().getDataRange().getValues();
  if (!ref) {
    var list = [];
    for (var i = 1; i < rows.length && list.length < 200; i++) {
      if (String(rows[i][2] || '').trim() !== wilaya) continue;
      list.push({
        ref: String(rows[i][0]),
        date: formatDate_(rows[i][1]),
        type: String(rows[i][4] || ''),
        name: String(rows[i][5] || ''),
        status: String(rows[i][9] || 'جديدة')
      });
    }
    return { status: 'success', list: list, wilaya: wilaya };
  }

  for (var rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    if (String(rows[rowIndex][0]).trim() !== ref) continue;
    var cardWilaya = String(rows[rowIndex][2] || '').trim();
    if (cardWilaya !== wilaya) {
      return { status: 'error', message: 'هذه البطاقة غير تابعة للولاية المحددة.' };
    }
    var card;
    try {
      card = JSON.parse(rows[rowIndex][8]);
    } catch (parseError) {
      return { status: 'error', message: 'بيانات البطاقة غير صالحة.' };
    }
    card.refCode = String(rows[rowIndex][0]);
    card.sentDate = formatDate_(rows[rowIndex][1]);
    card.status = String(rows[rowIndex][9] || 'جديدة');
    card.wilaya = cardWilaya;
    return { status: 'success', data: card };
  }
  return { status: 'error', message: 'لم يتم العثور على بطاقة بهذا الرقم.' };
}

function checkPin_(pin) {
  var configuredPin = PropertiesService.getScriptProperties().getProperty('ADMIN_PIN');
  if (!configuredPin) throw new Error('إعداد رمز الدخول غير مكتمل. تواصل مع مسؤول الخدمة.');
  if (String(pin || '') !== configuredPin) throw new Error('رمز الدخول غير صحيح.');
}

function doPost(e) {
  var params = (e && e.parameter) || {};
  if (params.bridge === '1') {
    var request;
    var response;
    try {
      request = JSON.parse(params.payload || '{}');
      response = handlePrivateRequest_(request);
    } catch (err) {
      response = error_(err);
    }
    return bridgeResponse_(params, response);
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var raw = (e && e.postData && e.postData.contents) || '{}';
    var payload = JSON.parse(raw);
    var mode = String(payload.mode || 'بطاقة اتصال فردية');
    var isGroup = mode.indexOf('جماعية') !== -1;
    var members = Array.isArray(payload.groupMembers) ? payload.groupMembers : [];
    var mainName = isGroup
      ? 'قائمة جماعية (' + members.length + ' عمال)'
      : (String(payload.empName || '').trim() || '-');
    var refCode = String(payload.refCode || '').trim();
    var sheet = getCardsSheet_();
    var existing = sheet.getDataRange().getValues();
    if (!refCode) {
      var prefix = isGroup ? 'SNTE-GRP-' : 'SNTE-IND-';
      refCode = prefix + new Date().getFullYear() + '-' + ('0000' + sheet.getLastRow()).slice(-4);
    }
    var base = refCode;
    var suffix = 2;
    while (existing.slice(1).some(function (row) { return String(row[0]).trim() === refCode; })) {
      refCode = base + '-' + suffix++;
    }

    var situation = [payload.category, payload.target]
      .map(function (value) { return String(value || '').trim(); })
      .filter(Boolean)
      .join(' ← ') || '-';
    var storable = {};
    Object.keys(payload).forEach(function (key) {
      if (key !== 'cardImageBase64') storable[key] = payload[key];
    });
    storable.hasCardImage = !!payload.cardImageBase64;

    sheet.appendRow([
      refCode,
      new Date(),
      String(payload.wilaya || '').trim() || '-',
      String(payload.commune || '').trim() || '-',
      mode,
      mainName,
      String(payload.school || '').trim() || '-',
      situation,
      JSON.stringify(storable),
      'جديدة'
    ]);
    return jsonResponse_({ status: 'success', data: { refCode: refCode } });
  } catch (err) {
    return jsonResponse_(error_(err));
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

function handlePrivateRequest_(request) {
  if (request.action === 'login') return login_(request);
  if (request.action === 'getCard') return getCardsForSession_(request);
  if (request.action === 'issueMessagingCode') return issueMessagingCode_(request);
  if (request.action === 'activateMessagingAccount') return activateMessagingAccount_(request);
  if (request.action === 'loginMessagingAccount') return loginMessagingAccount_(request);
  if (request.action === 'logout') return logoutSession_(request);
  if (request.action === 'listInternalUsers') return listInternalUsers_(request);
  if (request.action === 'listInternalMessages') return listInternalMessages_(request);
  if (request.action === 'sendInternalMessage') return sendInternalMessage_(request);
  if (request.action === 'markInternalMessageRead') return markInternalMessageRead_(request);
  return { status: 'error', message: 'الطلب غير معروف.' };
}

function login_(request) {
  var username = normalize_(request.username);
  var password = String(request.password || '');
  var expectedLevel = String(request.expectedLevel || '');
  if (!username || !password) return { status: 'error', message: 'بيانات الدخول غير صحيحة.' };

  var rows = getAccountsSheet_().getDataRange().getValues();
  var row = null;
  for (var i = 1; i < rows.length; i++) {
    if (normalize_(rows[i][0]) === username && String(rows[i][9] || 'نشط') === 'نشط') {
      row = rows[i];
      break;
    }
  }
  if (!row || hashPassword_(String(row[1]), password) !== String(row[2])) {
    return { status: 'error', message: 'بيانات الدخول غير صحيحة أو الحساب غير مفعّل.' };
  }

  var role = String(row[3] || '');
  var allowedRoles = ['NATIONAL_SG', 'WILAYA_SG', 'MUNICIPAL_SG', 'SCHOOL_SG', 'BRANCH_SG'];
  if (
    allowedRoles.indexOf(role) === -1 ||
    (expectedLevel && accountFromRow_(row).level !== expectedLevel)
  ) {
    return { status: 'error', message: 'هذا الحساب غير مخوّل لمستوى الأمانة المحدد.' };
  }
  var account = accountFromRow_(row);
  if (!validAccountScope_(account)) {
    return { status: 'error', message: 'بيانات نطاق الحساب غير مكتملة. يرجى مراجعة الأمانة الوطنية.' };
  }

  var token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  CacheService.getScriptCache().put('snte-contact-session:' + token, JSON.stringify({
    username: account.username,
    passwordHash: String(row[2])
  }), SESSION_TTL_SECONDS);
  return {
    status: 'success',
    sessionToken: token,
    user: account
  };
}

function getCardsForSession_(request) {
  var account = requireSession_(request.sessionToken);
  if (!account) return { status: 'error', message: 'انتهت الجلسة. يرجى تسجيل الدخول مجدداً.' };
  if (!isSecretaryRole_(account.role)) return { status: 'error', message: 'هذه الخدمة متاحة لحسابات الأمناء فقط.' };

  var requestedWilaya = String(request.wilaya || '').trim();
  var wilaya = account.role === 'NATIONAL_SG'
    ? requestedWilaya
    : account.wilayaName;
  if (!wilaya) return { status: 'error', message: 'حدد الولاية المطلوب عرض بطاقاتها.' };

  var ref = String(request.ref || '').trim();
  var rows = getCardsSheet_().getDataRange().getValues();
  if (!ref) {
    var list = [];
    for (var i = 1; i < rows.length && list.length < 200; i++) {
      if (normalize_(rows[i][2]) !== normalize_(wilaya)) continue;
      if (!rowWithinScope_(rows[i], account)) continue;
      list.push({
        ref: String(rows[i][0]),
        date: formatDate_(rows[i][1]),
        type: String(rows[i][4] || ''),
        name: String(rows[i][5] || ''),
        status: String(rows[i][9] || 'جديدة')
      });
    }
    return { status: 'success', list: list, wilaya: wilaya };
  }

  for (var j = 1; j < rows.length; j++) {
    if (String(rows[j][0]).trim() !== ref) continue;
    if (normalize_(rows[j][2]) !== normalize_(wilaya) || !rowWithinScope_(rows[j], account)) {
      return { status: 'error', message: 'هذه البطاقة خارج نطاق صلاحية حسابك.' };
    }
    var card = JSON.parse(rows[j][8]);
    card.refCode = String(rows[j][0]);
    card.sentDate = formatDate_(rows[j][1]);
    card.status = String(rows[j][9] || 'جديدة');
    card.wilaya = String(rows[j][2] || '');
    return { status: 'success', data: card };
  }
  return { status: 'error', message: 'لم يتم العثور على بطاقة بهذا الرقم.' };
}

function requireSession_(token) {
  if (!token) return null;
  var raw = CacheService.getScriptCache().get('snte-contact-session:' + String(token));
  if (!raw) return null;
  var session = JSON.parse(raw);
  if (session.accountType === 'portal-member') {
    var memberRows = getPortalMembersSheet_().getDataRange().getValues();
    for (var memberIndex = 1; memberIndex < memberRows.length; memberIndex++) {
      if (
        String(memberRows[memberIndex][0]) === String(session.memberId) &&
        String(memberRows[memberIndex][7] || 'نشط') === 'نشط'
      ) {
        return portalMemberFromRow_(memberRows[memberIndex]);
      }
    }
    return null;
  }
  var rows = getAccountsSheet_().getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (
      normalize_(rows[i][0]) === normalize_(session.username) &&
      String(rows[i][9] || 'نشط') === 'نشط' &&
      String(rows[i][2]) === session.passwordHash
    ) {
      return accountFromRow_(rows[i]);
    }
  }
  return null;
}

function isSecretaryRole_(role) {
  return ['NATIONAL_SG', 'WILAYA_SG', 'MUNICIPAL_SG', 'SCHOOL_SG', 'BRANCH_SG'].indexOf(role) !== -1;
}

function requireMessagingAccount_(request) {
  var account = requireSession_(request.sessionToken);
  if (!account) return { error: 'انتهت جلسة البوابة. سجّل الدخول مجدداً.' };
  return { account: account };
}

function issueMessagingCode_(request) {
  var auth = requireMessagingAccount_(request);
  if (auth.error) return { status: 'error', message: auth.error };
  var sender = auth.account;
  if (sender.role !== 'NATIONAL_SG' && sender.role !== 'WILAYA_SG') {
    return { status: 'error', message: 'إصدار رموز التفعيل متاح للأمانة الوطنية والأمناء الولائيين فقط.' };
  }

  var memberId = String(request.memberId || '').trim();
  var name = String(request.name || '').trim();
  var role = String(request.role || 'MEMBER');
  var wilayaCode = String(request.wilayaCode || '').trim();
  var wilayaName = String(request.wilayaName || '').trim();
  var municipalName = String(request.municipalName || '').trim();
  var institutionName = String(request.institutionName || '').trim();
  if (!memberId || !name || ['MEMBER', 'GENERAL_COORDINATOR'].indexOf(role) === -1) {
    return { status: 'error', message: 'معرف الحساب والاسم ودور غير إداري مطلوبة لإصدار رمز التفعيل.' };
  }
  if (role === 'MEMBER' && (!wilayaCode || !wilayaName)) {
    return { status: 'error', message: 'بيانات الولاية مطلوبة لحساب المنخرط.' };
  }
  if (role === 'GENERAL_COORDINATOR' && sender.role !== 'NATIONAL_SG') {
    return { status: 'error', message: 'إصدار رموز حسابات المنسقين متاح للأمانة الوطنية فقط.' };
  }
  if (role === 'MEMBER' && sender.role === 'WILAYA_SG' && normalize_(sender.wilayaCode) !== normalize_(wilayaCode)) {
    return { status: 'error', message: 'يمكن للأمين الولائي إصدار رمز لمنخرطي ولايته فقط.' };
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var membersSheet = getPortalMembersSheet_();
    var rows = membersSheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < rows.length; i++) {
      if (normalize_(rows[i][0]) === normalize_(memberId)) {
        rowIndex = i + 1;
        break;
      }
    }
    var memberRow = [
      memberId, name, role, wilayaCode, wilayaName,
      municipalName, institutionName, 'نشط', new Date()
    ];
    if (rowIndex > 0) membersSheet.getRange(rowIndex, 1, 1, memberRow.length).setValues([memberRow]);
    else membersSheet.appendRow(memberRow);

    var code = Utilities.getUuid().replace(/-/g, '').toUpperCase();
    var codesSheet = getMessagingCodesSheet_();
    var codes = codesSheet.getDataRange().getValues();
    for (var codeIndex = codes.length - 1; codeIndex > 0; codeIndex--) {
      if (normalize_(codes[codeIndex][1]) === normalize_(memberId)) codesSheet.deleteRow(codeIndex + 1);
    }
    codesSheet.appendRow([hashActivationCode_(code), memberId, new Date(Date.now() + 48 * 60 * 60 * 1000)]);
    return {
      status: 'success',
      activationCode: code,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    };
  } catch (err) {
    return error_(err);
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

function activateMessagingAccount_(request) {
  var code = String(request.activationCode || '').trim().toUpperCase();
  var password = String(request.password || '');
  if (!code) return { status: 'error', message: 'أدخل رمز التفعيل الذي تسلمته من الأمانة.' };
  if (password.length < 10) return { status: 'error', message: 'أنشئ كلمة مرور لا تقل عن 10 أحرف.' };

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var codesSheet = getMessagingCodesSheet_();
    var codes = codesSheet.getDataRange().getValues();
    var codeHash = hashActivationCode_(code);
    var codeRow = -1;
    var memberId = '';
    for (var i = 1; i < codes.length; i++) {
      if (String(codes[i][0]) === codeHash) {
        if (!(codes[i][2] instanceof Date) || codes[i][2].getTime() <= Date.now()) {
          codesSheet.deleteRow(i + 1);
          return { status: 'error', message: 'انتهت صلاحية رمز التفعيل. اطلب رمزاً جديداً من الأمانة.' };
        }
        codeRow = i + 1;
        memberId = String(codes[i][1]);
        break;
      }
    }
    if (codeRow < 0) return { status: 'error', message: 'رمز التفعيل غير صحيح أو سبق استخدامه.' };

    var members = getPortalMembersSheet_().getDataRange().getValues();
    var account = null;
    for (var memberIndex = 1; memberIndex < members.length; memberIndex++) {
      if (String(members[memberIndex][0]) === memberId && String(members[memberIndex][7]) === 'نشط') {
        account = portalMemberFromRow_(members[memberIndex]);
        break;
      }
    }
    if (!account) return { status: 'error', message: 'لم يعد الحساب نشطاً. راجع الأمانة.' };

    var memberRow = members.findIndex(function (row, index) {
      return index > 0 && String(row[0]) === memberId;
    }) + 1;
    var salt = Utilities.getUuid();
    getPortalMembersSheet_().getRange(memberRow, 10, 1, 2).setValues([[salt, hashPassword_(salt, password)]]);
    codesSheet.deleteRow(codeRow);
    return createPortalMemberSession_(account);
  } catch (err) {
    return error_(err);
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

function loginMessagingAccount_(request) {
  var memberId = String(request.memberId || '').trim();
  var password = String(request.password || '');
  if (!memberId || !password) return { status: 'error', message: 'أدخل معرف الحساب وكلمة المرور.' };
  var rows = getPortalMembersSheet_().getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (normalize_(rows[i][0]) !== normalize_(memberId)) continue;
    if (String(rows[i][7] || '') !== 'نشط') {
      return { status: 'error', message: 'حساب التراسل غير نشط. راجع الأمانة.' };
    }
    if (!rows[i][9] || hashPassword_(String(rows[i][9]), password) !== String(rows[i][10] || '')) {
      return { status: 'error', message: 'رقم البطاقة أو كلمة المرور غير صحيح.' };
    }
    return createPortalMemberSession_(portalMemberFromRow_(rows[i]));
  }
  return { status: 'error', message: 'لم يتم تفعيل حساب التراسل لهذا المستخدم بعد.' };
}

function createPortalMemberSession_(account) {
  var token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  CacheService.getScriptCache().put('snte-contact-session:' + token, JSON.stringify({
    accountType: 'portal-member',
    memberId: account.id
  }), SESSION_TTL_SECONDS);
  return { status: 'success', sessionToken: token, user: account };
}

function logoutSession_(request) {
  var token = String(request.sessionToken || '');
  if (!token) return { status: 'success' };
  CacheService.getScriptCache().remove('snte-contact-session:' + token);
  return { status: 'success' };
}

function listInternalUsers_(request) {
  var auth = requireMessagingAccount_(request);
  if (auth.error) return { status: 'error', message: auth.error };
  var users = [];
  var accountRows = getAccountsSheet_().getDataRange().getValues();
  for (var i = 1; i < accountRows.length; i++) {
    if (String(accountRows[i][9] || 'نشط') !== 'نشط') continue;
    var account = accountFromRow_(accountRows[i]);
    users.push(internalUserSummary_(account));
  }
  var memberRows = getPortalMembersSheet_().getDataRange().getValues();
  for (var memberIndex = 1; memberIndex < memberRows.length; memberIndex++) {
    if (String(memberRows[memberIndex][7] || '') !== 'نشط') continue;
    users.push(internalUserSummary_(portalMemberFromRow_(memberRows[memberIndex])));
  }
  users.sort(function (a, b) { return normalize_(a.name).localeCompare(normalize_(b.name)); });
  return {
    status: 'success',
    currentUserId: internalAccountId_(auth.account),
    users: users
  };
}

function listInternalMessages_(request) {
  var auth = requireMessagingAccount_(request);
  if (auth.error) return { status: 'error', message: auth.error };
  var accountId = internalAccountId_(auth.account);
  var rows = getInternalMessagesSheet_().getDataRange().getValues();
  var messages = [];
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) !== accountId && String(rows[i][3]) !== accountId) continue;
    messages.push({
      id: String(rows[i][0]),
      senderId: String(rows[i][1]),
      senderName: String(rows[i][2]),
      recipientId: String(rows[i][3]),
      recipientName: String(rows[i][4]),
      subject: String(rows[i][5]),
      body: String(rows[i][6]),
      createdAt: rows[i][7] instanceof Date ? rows[i][7].toISOString() : String(rows[i][7] || ''),
      readAt: rows[i][8] instanceof Date ? rows[i][8].toISOString() : (rows[i][8] ? String(rows[i][8]) : null)
    });
  }
  messages.sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); });
  return { status: 'success', messages: messages.slice(0, 200) };
}

function sendInternalMessage_(request) {
  var auth = requireMessagingAccount_(request);
  if (auth.error) return { status: 'error', message: auth.error };
  var recipientId = String(request.recipientId || '').trim();
  var subject = String(request.subject || '').trim();
  var body = String(request.body || '').trim();
  if (!recipientId || !subject || subject.length > 160 || !body || body.length > 10000) {
    return { status: 'error', message: 'اختر مستلماً وأدخل موضوعاً (حتى 160 حرفاً) ونصاً (حتى 10000 حرف).' };
  }

  var users = listInternalUsers_({ sessionToken: request.sessionToken });
  if (users.status !== 'success') return users;
  var recipient = users.users.find(function (user) { return user.id === recipientId; });
  if (!recipient || recipient.id === internalAccountId_(auth.account)) {
    return { status: 'error', message: 'المستلم غير متاح أو لا يمكن إرسال رسالة إلى حسابك.' };
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    getInternalMessagesSheet_().appendRow([
      Utilities.getUuid(),
      internalAccountId_(auth.account),
      String(auth.account.name || ''),
      recipient.id,
      recipient.name,
      subject,
      body,
      new Date(),
      ''
    ]);
    return { status: 'success' };
  } catch (err) {
    return error_(err);
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

function markInternalMessageRead_(request) {
  var auth = requireMessagingAccount_(request);
  if (auth.error) return { status: 'error', message: auth.error };
  var messageId = String(request.messageId || '');
  var accountId = internalAccountId_(auth.account);
  var sheet = getInternalMessagesSheet_();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) !== messageId) continue;
    if (String(rows[i][3]) !== accountId) return { status: 'error', message: 'لا تملك صلاحية تحديث هذه الرسالة.' };
    if (!rows[i][8]) sheet.getRange(i + 1, 9).setValue(new Date());
    return { status: 'success' };
  }
  return { status: 'error', message: 'الرسالة غير موجودة.' };
}

function internalAccountId_(account) {
  return account.role === 'MEMBER' ? String(account.membershipCardNo) : normalize_(account.username);
}

function internalUserSummary_(account) {
  return {
    id: internalAccountId_(account),
    name: String(account.name || ''),
    role: String(account.role || ''),
    wilayaCode: String(account.wilayaCode || ''),
    wilayaName: String(account.wilayaName || ''),
    municipalName: String(account.municipalName || ''),
    institutionName: String(account.institutionName || '')
  };
}

function portalMemberFromRow_(row) {
  var role = String(row[2] || 'MEMBER');
  return {
    id: String(row[0]),
    username: String(row[0]),
    membershipCardNo: role === 'MEMBER' ? String(row[0]) : '',
    name: String(row[1]),
    role: role,
    level: role === 'MEMBER' ? 'member' : 'coordinator',
    wilayaCode: String(row[3]),
    wilayaName: String(row[4]),
    municipalName: String(row[5]),
    institutionName: String(row[6]),
    status: String(row[7] || 'نشط')
  };
}

function hashActivationCode_(code) {
  return Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(code))
  ).replace(/=+$/, '');
}

function rowWithinScope_(row, account) {
  if (account.role === 'NATIONAL_SG' || account.role === 'WILAYA_SG') return true;
  if (normalize_(row[3]) !== normalize_(account.municipalName || account.commune)) return false;
  if (account.role === 'MUNICIPAL_SG') return true;
  return normalize_(row[6]) === normalize_(account.institutionName);
}

function accountFromRow_(row) {
  var role = String(row[3] || '');
  var roleTitles = {
    NATIONAL_SG: 'الأمين العام الوطني للنقابة',
    WILAYA_SG: 'الأمين العام الولائي',
    MUNICIPAL_SG: 'الأمين العام البلدي',
    SCHOOL_SG: 'أمين الفرع النقابي',
    BRANCH_SG: 'أمين الفرع النقابي'
  };
  var area = role === 'NATIONAL_SG'
    ? 'الأمانة العامة الوطنية'
    : role === 'WILAYA_SG'
    ? 'الأمانة الولائية - ولاية ' + String(row[6] || '')
    : role === 'MUNICIPAL_SG'
    ? 'الأمانة البلدية - ' + String(row[7] || '') + '، ولاية ' + String(row[6] || '')
    : 'الفرع النقابي - ' + String(row[8] || '') + '، ' + String(row[7] || '') + '، ولاية ' + String(row[6] || '');
  return {
    id: normalize_(row[0]),
    username: String(row[0] || ''),
    role: role,
    name: String(row[4] || ''),
    title: roleTitles[role],
    structureName: area,
    wilayaCode: String(row[5] || ''),
    wilayaName: String(row[6] || ''),
    municipalName: String(row[7] || ''),
    institutionName: String(row[8] || ''),
    status: 'نشط',
    level: {
      NATIONAL_SG: 'national',
      WILAYA_SG: 'wilaya',
      MUNICIPAL_SG: 'municipal',
      SCHOOL_SG: 'school',
      BRANCH_SG: 'school'
    }[String(row[3] || '')]
  };
}

function validAccountScope_(account) {
  if (account.role === 'NATIONAL_SG') return true;
  if (!account.wilayaCode || !account.wilayaName) return false;
  if (account.role === 'WILAYA_SG') return true;
  if (!(account.municipalName || account.commune)) return false;
  if (account.role === 'MUNICIPAL_SG') return true;
  return !!account.institutionName;
}

function getCardsSheet_() {
  var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  var sheet = spreadsheet.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#14532d').setFontColor('#fff');
    sheet.setFrozenRows(1);
  } else {
    var headers = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    for (var i = 0; i < HEADERS.length; i++) {
      if (!String(headers[i] || '').trim()) sheet.getRange(1, i + 1).setValue(HEADERS[i]);
    }
  }
  return sheet;
}

function getSheet_() {
  return getCardsSheet_();
}

function getAccountsSheet_() {
  var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  var sheet = spreadsheet.getSheetByName('حسابات الأمناء');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('حسابات الأمناء');
    sheet.appendRow(ACCOUNT_HEADERS);
    sheet.getRange(1, 1, 1, ACCOUNT_HEADERS.length).setFontWeight('bold').setBackground('#14532d').setFontColor('#fff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getPortalMembersSheet_() {
  return getOrCreateSheet_('حسابات التراسل', PORTAL_MEMBER_HEADERS);
}

function getMessagingCodesSheet_() {
  return getOrCreateSheet_('رموز تفعيل التراسل', MESSAGE_CODE_HEADERS);
}

function getInternalMessagesSheet_() {
  return getOrCreateSheet_('رسائل البوابة', INTERNAL_MESSAGE_HEADERS);
}

function getOrCreateSheet_(name, headers) {
  var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#14532d')
      .setFontColor('#fff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function provisionSecretaryAccount(username, password, role, name, wilayaCode, wilayaName, commune, institutionName, setupKey) {
  var configuredKey = PropertiesService.getScriptProperties().getProperty('ACCOUNT_SETUP_KEY');
  if (!configuredKey || configuredKey.length < 32 || String(setupKey || '') !== configuredKey) {
    throw new Error('مفتاح إعداد الحسابات غير صحيح.');
  }
  if (!username || !password || !name) throw new Error('اسم المستخدم وكلمة المرور والاسم مطلوبة.');
  var allowedRoles = ['NATIONAL_SG', 'WILAYA_SG', 'MUNICIPAL_SG', 'SCHOOL_SG', 'BRANCH_SG'];
  if (allowedRoles.indexOf(role) === -1) throw new Error('الدور غير صالح.');
  var account = {
    role: role,
    wilayaCode: String(wilayaCode || '').trim(),
    wilayaName: String(wilayaName || '').trim(),
    commune: String(commune || '').trim(),
    institutionName: String(institutionName || '').trim()
  };
  if (!validAccountScope_(account)) throw new Error('حقول الرقعة الجغرافية غير مكتملة لهذا الدور.');

  var sheet = getAccountsSheet_();
  var values = sheet.getDataRange().getValues();
  var usernameKey = normalize_(username);
  var targetRow = 0;
  for (var i = 1; i < values.length; i++) {
    if (normalize_(values[i][0]) === usernameKey) {
      targetRow = i + 1;
      break;
    }
  }
  var salt = Utilities.getUuid();
  var row = [
    String(username).trim(), salt, hashPassword_(salt, String(password)), role,
    String(name).trim(), account.wilayaCode, account.wilayaName,
    account.commune, account.institutionName, 'نشط'
  ];
  if (targetRow) sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
  return 'تم إعداد حساب الأمين بنجاح.';
}

function accountSetupPage_() {
  return [
    '<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<style>body{font:15px Arial,sans-serif;background:#f3f7f4;padding:18px;color:#183522}',
    'form{max-width:560px;margin:auto;background:#fff;padding:22px;border-radius:14px;border:1px solid #cbd9ce}',
    'label{display:block;font-weight:bold;margin:12px 0 5px}input,select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #aebbb1;border-radius:8px}',
    'button{margin-top:16px;padding:11px 18px;background:#006633;color:white;border:0;border-radius:8px;font-weight:bold}',
    '#status{margin-top:12px;font-weight:bold}</style>',
    '<form id="accountForm"><h2>إعداد حساب أمين عام SNTE</h2>',
    '<label>مفتاح الإعداد</label><input id="setupKey" type="password" autocomplete="current-password" required>',
    '<label>اسم المستخدم</label><input id="username" autocomplete="off" required>',
    '<label>كلمة المرور</label><input id="password" type="password" autocomplete="new-password" required>',
    '<label>الدور</label><select id="role"><option value="NATIONAL_SG">الأمين الوطني</option>',
    '<option value="WILAYA_SG">الأمين الولائي</option><option value="MUNICIPAL_SG">الأمين البلدي</option>',
    '<option value="SCHOOL_SG">أمين فرع مؤسسة</option><option value="BRANCH_SG">أمين فرع نقابي</option></select>',
    '<label>الاسم واللقب</label><input id="name" required>',
    '<label>رمز الولاية</label><input id="wilayaCode">',
    '<label>اسم الولاية</label><input id="wilayaName">',
    '<label>البلدية</label><input id="commune">',
    '<label>المؤسسة / الفرع</label><input id="institutionName">',
    '<button type="submit">حفظ الحساب</button><div id="status" role="status"></div></form>',
    '<script>',
    'const form=document.getElementById("accountForm"),role=document.getElementById("role"),status=document.getElementById("status");',
    'form.addEventListener("submit",function(event){event.preventDefault();status.textContent="جارٍ حفظ الحساب...";',
    'google.script.run.withSuccessHandler(function(message){status.textContent=message;form.reset();})',
    '.withFailureHandler(function(error){status.textContent=error&&error.message?error.message:"تعذر حفظ الحساب.";})',
    '.provisionSecretaryAccount(document.getElementById("username").value,document.getElementById("password").value,',
    'role.value,document.getElementById("name").value,document.getElementById("wilayaCode").value,',
    'document.getElementById("wilayaName").value,document.getElementById("commune").value,',
    'document.getElementById("institutionName").value,document.getElementById("setupKey").value);});',
    '</script></html>'
  ].join('');
}

function hashPassword_(salt, password) {
  var bytes = Utilities.newBlob(String(salt) + ':' + String(password)).getBytes();
  for (var i = 0; i < 10000; i++) {
    bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes);
  }
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, '');
}

function normalize_(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase();
}

function formatDate_(value) {
  return value instanceof Date
    ? Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd')
    : String(value || '');
}

function bridgeResponse_(params, response) {
  var origin = String(params.origin || '');
  if (!/^https?:\/\/[^/]+$/.test(origin)) origin = 'null';
  var json = JSON.stringify({
    type: 'snte-contact-cards-response',
    nonce: String(params.nonce || ''),
    response: response
  }).replace(/</g, '\\u003c');
  var targetOrigin = JSON.stringify(origin);
  var html = '<!doctype html><meta charset="utf-8"><script>' +
    'window.parent.postMessage(' + json + ',' + targetOrigin + ');' +
    '</script>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function jsonResponse_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function error_(err) {
  return { status: 'error', message: String(err && err.message ? err.message : err) };
}

function ok_(data) {
  return JSON.stringify({ status: 'success', data: data });
}

function err_(message) {
  return JSON.stringify({ status: 'error', message: String(message) });
}

function processForm(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var sheet = getCardsSheet_();
    var mode = payload.mode || payload.cardType || 'بطاقة اتصال فردية';
    var isGroup = String(mode).indexOf('جماعية') !== -1;
    var members = payload.groupMembers || payload.groupData || [];
    var prefix = isGroup ? 'SNTE-GRP-' : 'SNTE-IND-';
    var cardId = prefix + new Date().getFullYear() + '-' + ('0000' + sheet.getLastRow()).slice(-4);
    payload.cardId = cardId;
    payload.timestamp = new Date().toLocaleDateString('ar-DZ');
    var mainName = isGroup
      ? 'قائمة جماعية (' + members.length + ' عمال)'
      : (payload.fullName || payload.empName || '-');
    sheet.appendRow([
      cardId, new Date(), payload.wilaya || '-', payload.baladiya || '-',
      mode, mainName, payload.institution || payload.school || '-',
      payload.situationDetails || [payload.category, payload.target]
        .map(function (value) { return String(value || '').trim(); })
        .filter(Boolean)
        .join(' ← ') || '-',
      JSON.stringify(payload), 'جديدة'
    ]);
    return ok_(payload);
  } catch (err) {
    return err_(err);
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

function searchCard(cardId, sessionTokenOrPin) {
  var account = requireSession_(sessionTokenOrPin);
  if (account) {
    var sessionResult = getCardsForSession_({
      sessionToken: sessionTokenOrPin,
      ref: cardId,
      wilaya: account.wilayaName
    });
    return sessionResult.status === 'success' ? ok_(sessionResult.data) : err_(sessionResult.message);
  }
  try {
    checkPin_(sessionTokenOrPin);
    var rows = getSheet_().getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).trim() !== String(cardId || '').trim()) continue;
      var card = JSON.parse(rows[i][8]);
      card.status = String(rows[i][9] || 'جديدة');
      return ok_(card);
    }
    return err_('لم يتم العثور على بطاقة بهذا الرقم المرجعي.');
  } catch (err) {
    return err_(err);
  }
}

function listCards(sessionTokenOrPin) {
  var account = requireSession_(sessionTokenOrPin);
  if (account) {
    var sessionResult = getCardsForSession_({
      sessionToken: sessionTokenOrPin,
      wilaya: account.wilayaName
    });
    return sessionResult.status === 'success' ? ok_(sessionResult.list) : err_(sessionResult.message);
  }
  try {
    checkPin_(sessionTokenOrPin);
    var rows = getSheet_().getDataRange().getValues();
    var list = [];
    for (var i = rows.length - 1; i >= 1 && list.length < 200; i--) {
      list.push({
        id: rows[i][0],
        date: formatDate_(rows[i][1]),
        wilaya: rows[i][2],
        baladiya: rows[i][3],
        type: rows[i][4],
        name: rows[i][5],
        institution: rows[i][6],
        status: String(rows[i][9] || 'جديدة')
      });
    }
    return ok_(list);
  } catch (err) {
    return err_(err);
  }
}

function setStatus(cardId, status, sessionTokenOrPin) {
  var account = requireSession_(sessionTokenOrPin);
  var sheet = getSheet_();
  var rows = sheet.getDataRange().getValues();
  if (account) {
    var result = getCardsForSession_({
      sessionToken: sessionTokenOrPin,
      ref: cardId,
      wilaya: account.wilayaName
    });
    if (result.status !== 'success') return err_(result.message);
  } else {
    try {
      checkPin_(sessionTokenOrPin);
    } catch (err) {
      return err_(err);
    }
  }
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(cardId).trim()) {
      sheet.getRange(i + 1, 10).setValue(String(status || 'جديدة'));
      return ok_(status);
    }
  }
  return err_('البطاقة غير موجودة.');
}
