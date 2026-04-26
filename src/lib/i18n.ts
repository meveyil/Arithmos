import type { BackupErrorCode } from "@/lib/backup-error-codes";
import enArchive from "@/lib/locales/en.json";
import ruArchive from "@/lib/locales/ru.json";

export const SUPPORTED_LOCALES = ["en", "ru"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const SUPPORTED_CURRENCIES = ["KZT", "USD", "EUR", "RUB"] as const;
export type AppCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const currencyByLocale: Record<AppLocale, AppCurrency> = {
  en: "USD",
  ru: "RUB",
};

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  ru: "Русский",
};

export const currencyLabels = {
  en: {
    KZT: "KZT — Kazakhstani tenge",
    USD: "USD — US dollar",
    EUR: "EUR — Euro",
    RUB: "RUB — Russian ruble",
  },
  ru: {
    KZT: "KZT — Казахстанский тенге",
    USD: "USD — Доллар США",
    EUR: "EUR — Евро",
    RUB: "RUB — Российский рубль",
  }
};

const en = {
  app: {
    metadataTitle: "Arithmos",
    metadataDescription: "Arithmos personal finance desktop app",
  },
  categories: {
    other: "Other",
    salary: "Salary",
    food: "Food",
    transport: "Transport",
    housing: "Housing",
    income: "Income",
  },
  templateDefaults: {
    tpl_default_1: "Salary",
    tpl_default_2: "Food",
    tpl_default_3: "Transport",
    tpl_default_4: "Rent",
  },
  sidebar: {
    menu: "Menu",
    dashboard: "Dashboard",
    transactions: "Transactions",
    archive: enArchive.sidebar.archive,
    templates: "Templates",
    settings: "Settings",
  },
  titleBar: {
    minimize: "Minimize",
    maximize: "Maximize",
    close: "Close",
  },
  common: enArchive.common,
  dashboard: {
    title: "Overview",
    subtitle: "Account summary and spending trend",
    balance: "Current balance",
    income: "Income",
    expense: "Expenses",
    chartTitle: "Income and expenses — last 30 days",
    chartHint: "Axis: every 5 days; exact date on hover",
    chartLoading: "Loading chart…",
    categoryRankTitle: "Top spending by category",
    categoryRankTotal: "total",
    categoryRankEmpty: "No expenses this month",
  },
  chart: {
    tooltipIncome: "Income",
    tooltipExpense: "Expense",
  },
  transactions: {
    title: "Transactions",
    subtitle: "History, search, and sort",
    add: "Add transaction",
    searchPlaceholder: "Search by description or category…",
    filterAll: "All",
    filterIncome: "Income",
    filterExpense: "Expenses",
    sortLabel: "Sort",
    sortDateDesc: "Date: newest first",
    sortDateAsc: "Date: oldest first",
    sortAmountDesc: "Amount: high to low",
    sortAmountAsc: "Amount: low to high",
    history: "History",
    empty: "No transactions match your filters",
  },
  archive: enArchive.archive,
  transactionRow: {
    deleteAria: "Delete transaction",
  },
  addTransaction: {
    title: "New transaction",
    close: "Close",
    quickTemplates: "Quick templates",
    templateHint:
      "Local time{hourMode}; when a template has a fixed amount it is filled in automatically.",
    hourMode24: " (24h)",
    hourMode12: " (12h)",
    description: "Description",
    descriptionPlaceholder: "e.g. Lunch",
    category: "Category",
    categoryPlaceholder: "Groceries, transport…",
    icon: "Icon",
    amount: "Amount",
    type: "Type",
    typeExpense: "Expense",
    typeIncome: "Income",
    datetime: "Date and time",
    cancel: "Cancel",
    submit: "Add",
  },
  templates: {
    title: "Templates",
    subtitle: "Quick entries when adding a transaction",
    create: "Create template",
    listTitle: "All templates",
    empty: "No templates yet",
    newTemplate: "New template",
    name: "Name",
    category: "Category",
    type: "Type",
    icon: "Icon",
    fixedAmount: "Fixed amount (optional)",
    cancel: "Cancel",
    save: "Save",
    deleteAria: "Delete template",
    typeIncome: "Income",
    typeExpense: "Expense",
  },
  settings: {
    title: "Settings",
    subtitle: "Appearance, startup, and data",
    themeTitle: "Theme",
    themeHint: "Default is light",
    themeLight: "Light",
    themeDark: "Dark",
    language: "Language",
    currency: "Currency",
    time24Title: "24-hour time",
    time24Example: "Example:",
    time24Toggle: "Toggle 24-hour time format",
    openAtLoginTitle: "Launch at system startup",
    openAtLoginHint: "Desktop app only (Electron, Windows)",
    openAtLoginToggle: "Toggle launch at login",
    dataSection: "Data and security",
    dataBlurb:
      "Export and import use format version 1. Import replaces all transactions and applies settings from the file. Back up before restoring.",
    exportJson: "Export to JSON",
    importJson: "Import from JSON",
    clearAll: "Clear all data",
    appVersion: "App version",
    importReadError: "Could not read the file",
    clearModalTitle: "Delete all history?",
    clearModalBody:
      "All transactions will be permanently removed from this device. Settings and templates are kept.",
    cancel: "Cancel",
    delete: "Delete",
    close: "Close",
  },
  backupErrors: {
    invalidJson: "Invalid JSON",
    versionExpected: "Expected version: 1",
    missingTransactions: "Missing transactions array",
    badTransactionRow: "Invalid transaction entry",
    settingsNotObject: "Field settings must be an object",
    templatesNotArray: "settings.templates must be an array",
    badTemplateRow: "Invalid entry in settings.templates",
  },
  onboarding: {
    welcome: "Welcome to {appName}",
    subtitle:
      "Choose your language and currency to continue. The rest of the app stays unavailable until you confirm.",
    language: "Language",
    currency: "Currency",
    continue: "Continue",
  },
  iconPicker: {
    aria: "Choose icon",
  },
};

const ru: typeof en = {
  app: {
    metadataTitle: "Arithmos",
    metadataDescription: "Личные финансы — Arithmos",
  },
  categories: {
    other: "Прочее",
    salary: "Зарплата",
    food: "Продукты",
    transport: "Транспорт",
    housing: "Жильё",
    income: "Доход",
  },
  templateDefaults: {
    tpl_default_1: "Зарплата",
    tpl_default_2: "Еда",
    tpl_default_3: "Транспорт",
    tpl_default_4: "Аренда",
  },
  sidebar: {
    menu: "Меню",
    dashboard: "Дашборд",
    transactions: "Транзакции",
    archive: ruArchive.sidebar.archive,
    templates: "Шаблоны",
    settings: "Настройки",
  },
  titleBar: {
    minimize: "Свернуть",
    maximize: "Развернуть",
    close: "Закрыть",
  },
  common: ruArchive.common,
  dashboard: {
    title: "Обзор",
    subtitle: "Сводка по счетам и динамика расходов",
    balance: "Текущий баланс",
    income: "Доходы",
    expense: "Расходы",
    chartTitle: "Доходы и расходы за последние 30 дней",
    chartHint: "Ось: каждые 5 дней; точная дата — при наведении",
    chartLoading: "Загрузка графика…",
    categoryRankTitle: "Топ расходов по категориям",
    categoryRankTotal: "всего",
    categoryRankEmpty: "Нет расходов в этом месяце",
  },
  chart: {
    tooltipIncome: "Доходы",
    tooltipExpense: "Расходы",
  },
  transactions: {
    title: "Транзакции",
    subtitle: "История, поиск и сортировка",
    add: "Добавить транзакцию",
    searchPlaceholder: "Поиск по описанию или категории…",
    filterAll: "Все",
    filterIncome: "Доходы",
    filterExpense: "Расходы",
    sortLabel: "Сортировка",
    sortDateDesc: "Дата: новые сверху",
    sortDateAsc: "Дата: старые сверху",
    sortAmountDesc: "Сумма: по убыванию",
    sortAmountAsc: "Сумма: по возрастанию",
    history: "История",
    empty: "Нет операций по заданным условиям",
  },
  archive: ruArchive.archive,
  transactionRow: {
    deleteAria: "Удалить транзакцию",
  },
  addTransaction: {
    title: "Новая транзакция",
    close: "Закрыть",
    quickTemplates: "Быстрые шаблоны",
    templateHint:
      "Локальное время{hourMode}; при фиксированной сумме в шаблоне она подставляется автоматически.",
    hourMode24: " (24ч)",
    hourMode12: " (12ч)",
    description: "Описание",
    descriptionPlaceholder: "Например, обед",
    category: "Категория",
    categoryPlaceholder: "Продукты, транспорт…",
    icon: "Иконка",
    amount: "Сумма",
    type: "Тип",
    typeExpense: "Расход",
    typeIncome: "Доход",
    datetime: "Дата и время",
    cancel: "Отмена",
    submit: "Добавить",
  },
  templates: {
    title: "Шаблоны",
    subtitle: "Быстрые операции при добавлении транзакции",
    create: "Создать шаблон",
    listTitle: "Все шаблоны",
    empty: "Шаблонов пока нет",
    newTemplate: "Новый шаблон",
    name: "Название",
    category: "Категория",
    type: "Тип",
    icon: "Иконка",
    fixedAmount: "Фиксированная сумма (необяз.)",
    cancel: "Отмена",
    save: "Сохранить",
    deleteAria: "Удалить шаблон",
    typeIncome: "Доход",
    typeExpense: "Расход",
  },
  settings: {
    title: "Настройки",
    subtitle: "Внешний вид, автозапуск и данные",
    themeTitle: "Тема оформления",
    themeHint: "По умолчанию — светлая",
    themeLight: "Светлая",
    themeDark: "Тёмная",
    language: "Язык",
    currency: "Валюта",
    time24Title: "24-часовой формат",
    time24Example: "Пример:",
    time24Toggle: "Переключить 24-часовой формат",
    openAtLoginTitle: "Запускать при старте системы",
    openAtLoginHint: "Только в десктопном приложении (Electron, Windows)",
    openAtLoginToggle: "Автозапуск при входе в систему",
    dataSection: "Данные и безопасность",
    dataBlurb:
      "Экспорт и импорт используют формат version 1. Импорт заменяет все транзакции и применяет настройки из файла. Сделайте резервную копию перед восстановлением.",
    exportJson: "Экспорт в JSON",
    importJson: "Импорт из JSON",
    clearAll: "Очистить все данные",
    appVersion: "Версия приложения",
    importReadError: "Не удалось прочитать файл",
    clearModalTitle: "Удалить всю историю?",
    clearModalBody:
      "Все транзакции будут безвозвратно удалены с этого устройства. Настройки и шаблоны сохранятся.",
    cancel: "Отмена",
    delete: "Удалить",
    close: "Закрыть",
  },
  backupErrors: {
    invalidJson: "Некорректный JSON",
    versionExpected: "Ожидается version: 1",
    missingTransactions: "Отсутствует массив transactions",
    badTransactionRow: "Некорректная запись в transactions",
    settingsNotObject: "Поле settings должно быть объектом",
    templatesNotArray: "settings.templates должен быть массивом",
    badTemplateRow: "Некорректная запись в settings.templates",
  },
  onboarding: {
    welcome: "Добро пожаловать в {appName}",
    subtitle:
      "Выберите язык и валюту. Пока вы не подтвердите выбор, остальной интерфейс недоступен.",
    language: "Язык",
    currency: "Валюта",
    continue: "Продолжить",
  },
  
  iconPicker: {
    aria: "Выбор иконки",
  },
};

export const messages = {
  en,
  ru,
} as const;

export type Messages = (typeof messages)[AppLocale];

export function getMessages(locale: AppLocale): Messages {
  return messages[locale];
}

export function translateCategory(messages: Messages, categoryKey: string): string {
  const k = categoryKey as keyof typeof messages.categories;
  if (k in messages.categories) return messages.categories[k];
  return categoryKey;
}

export function translateDefaultTemplateName(
  templateId: string,
  messages: Messages,
): string | undefined {
  switch (templateId) {
    case "tpl-default-1":
      return messages.templateDefaults.tpl_default_1;
    case "tpl-default-2":
      return messages.templateDefaults.tpl_default_2;
    case "tpl-default-3":
      return messages.templateDefaults.tpl_default_3;
    case "tpl-default-4":
      return messages.templateDefaults.tpl_default_4;
    default:
      return undefined;
  }
}

export function interpolate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => vars[name] ?? "");
}

const backupErrorKey: Record<BackupErrorCode, keyof Messages["backupErrors"]> = {
  INVALID_JSON: "invalidJson",
  VERSION_EXPECTED: "versionExpected",
  MISSING_TRANSACTIONS: "missingTransactions",
  BAD_TRANSACTION_ROW: "badTransactionRow",
  SETTINGS_NOT_OBJECT: "settingsNotObject",
  TEMPLATES_NOT_ARRAY: "templatesNotArray",
  BAD_TEMPLATE_ROW: "badTemplateRow",
};

export function translateBackupError(
  messages: Messages,
  code: BackupErrorCode,
): string {
  return messages.backupErrors[backupErrorKey[code]];
}
