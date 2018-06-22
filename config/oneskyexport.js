module.exports = {
  "options": {
    "authFile": "config/oneskyauthfile.json",
    "projectId": process.env.ONESKY_PROJECT_ID, // eslint-disable-line no-process-env
    "dest": "src/_locales/",
    "indent": 2,
    "sortKeys": false,
    "sourceFile": "messages.json",
    "exportType": "locale"
  },
  "nl": {"options": {"output": "nl/messages.json", "locale": "nl"}},
  "de": {"options": {"output": "de/messages.json", "locale": "de"}},
  "es": {"options": {"output": "es/messages.json", "locale": "es"}},
  "pl": {"options": {"output": "pl/messages.json", "locale": "pl"}},
  "da": {"options": {"output": "da/messages.json", "locale": "da"}},
  "fr": {"options": {"output": "fr/messages.json", "locale": "fr"}},
  "it": {"options": {"output": "it/messages.json", "locale": "it"}},
  "ja": {"options": {"output": "ja/messages.json", "locale": "ja"}},
  "ru": {"options": {"output": "ru/messages.json", "locale": "ru"}},
  "tr": {"options": {"output": "tr/messages.json", "locale": "tr"}},
  "th": {"options": {"output": "th/messages.json", "locale": "th"}},
  "ko": {"options": {"output": "ko/messages.json", "locale": "ko"}},
  "ar": {"options": {"output": "ar/messages.json", "locale": "ar"}},
  "zh-cn": {"options": {"output": "zh_CN/messages.json", "locale": "zh-CN"}},
  "zh-tw": {"options": {"output": "zh_TW/messages.json", "locale": "zh-TW"}},
  "pt-br": {"options": {"output": "pt_BR/messages.json", "locale": "pt-br"}}
}
