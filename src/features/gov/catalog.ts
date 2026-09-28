import type { FaqItem, FormTemplate, GlossaryEntry, GovService } from './types'

export const agency = {
  name: '示範市市民服務處',
  office: '示範市中正路 100 號 1 樓',
  phone: '02-1234-5678',
  hours: '週一至週五 08:30–17:30，國定假日休',
  email: 'service@example.gov.tw',
}

export const timeSlots = ['09:00–09:30', '10:00–10:30', '11:00–11:30', '14:00–14:30', '15:00–15:30']

export const services: GovService[] = [
  {
    id: 'welfare-subsidy',
    name: '中低收入戶生活補助',
    category: '社會福利',
    summary: '符合設籍與收入條件的家庭，可申請每月生活補助。',
    audience: '設籍本市、家庭收入符合當年度標準的家庭。',
    duration: '文件齊全後 30 個工作天',
    feeText: '免規費',
    documents: ['國民身分證正反面', '全戶戶籍資料', '最近三個月收入證明'],
    keywords: ['補助', '低收', '社會福利', '生活費'],
    fields: [
      {
        key: 'householdSize',
        label: '共同生活人口',
        type: 'number',
        required: true,
        help: '請填現在一起生活、一起計算收入的人數，包含申請人本人。',
      },
      {
        key: 'monthlyIncome',
        label: '全家每月收入合計',
        type: 'number',
        required: true,
        help: '單位是元。請填稅前收入合計，沒有收入請填 0。',
      },
      {
        key: 'account',
        label: '撥款帳號',
        type: 'text',
        required: true,
        help: '此為示範，請填假帳號，例如 000-000000000000。不要填真實銀行帳號。',
        autocomplete: 'off',
      },
    ],
  },
  {
    id: 'disability-card',
    name: '身心障礙證明補發',
    category: '社會福利',
    summary: '證明遺失、毀損，或記載事項變更時，可申請補發。',
    audience: '已領有本市身心障礙證明，需要補發的本人或法定代理人。',
    duration: '5 個工作天',
    feeText: '免規費',
    documents: ['國民身分證正反面', '兩吋照片'],
    keywords: ['身障', '證明', '補發', '遺失'],
    fields: [
      {
        key: 'certificateNo',
        label: '原證明字號',
        type: 'text',
        required: true,
        help: '印在原證明正面。忘記字號可先填「不詳」，並在補件時更正。',
      },
      {
        key: 'reason',
        label: '補發原因',
        type: 'select',
        required: true,
        help: '請選最接近的一項。',
        options: [
          { value: 'lost', label: '遺失' },
          { value: 'damaged', label: '毀損' },
          { value: 'changed', label: '資料變更' },
        ],
      },
    ],
  },
  {
    id: 'facility-permit',
    name: '公共設施使用許可',
    category: '交通與場地',
    summary: '借用公園、活動中心或圖書館空間，先申請使用許可。',
    audience: '本市立案團體、學校，以及設籍市民個人。',
    duration: '10 個工作天',
    feeText: '核准後繳納使用規費，示範金額為新臺幣 1,200 元',
    documents: ['活動計畫摘要', '保險證明'],
    keywords: ['場地', '借用', '公園', '活動中心', '規費'],
    fields: [
      {
        key: 'facility',
        label: '場地',
        type: 'select',
        required: true,
        help: '一次申請一個場地。',
        options: [
          { value: 'park', label: '中正公園草地' },
          { value: 'hall', label: '市民活動中心禮堂' },
          { value: 'library', label: '圖書館研習室' },
        ],
      },
      {
        key: 'startDate',
        label: '使用開始日期',
        type: 'date',
        required: true,
        help: '請選擇今天以後的日期。格式為西元年-月-日。',
      },
      {
        key: 'endDate',
        label: '使用結束日期',
        type: 'date',
        required: true,
        help: '可以和開始日期同一天。不可早於開始日期。',
      },
      {
        key: 'purpose',
        label: '使用目的',
        type: 'textarea',
        required: true,
        help: '用兩三句話說明活動名稱、人數與是否對外開放。',
      },
    ],
  },
  {
    id: 'business-change',
    name: '營業登記事項變更',
    category: '產業與營業',
    summary: '負責人、地址或資本額變更時，申請改登記。',
    audience: '登記地址在本市的商業負責人。',
    duration: '7 個工作天',
    feeText: '免規費',
    documents: ['登記抄本', '負責人身分證明'],
    keywords: ['營業', '公司', '變更', '統一編號'],
    fields: [
      {
        key: 'ban',
        label: '統一編號',
        type: 'text',
        required: true,
        help: '8 碼數字。示範可填 12345675。不要填真實營利事業統一編號。',
        autocomplete: 'off',
      },
      {
        key: 'changeItem',
        label: '變更項目',
        type: 'select',
        required: true,
        help: '一次選一個主要項目。',
        options: [
          { value: 'owner', label: '負責人' },
          { value: 'address', label: '地址' },
          { value: 'capital', label: '資本額' },
        ],
      },
      {
        key: 'changeDetail',
        label: '變更後內容',
        type: 'textarea',
        required: true,
        help: '寫出變更後的文字。示範請用虛構資料。',
      },
    ],
  },
  {
    id: 'parking-appeal',
    name: '路邊停車費異議',
    category: '交通與場地',
    summary: '對停車費單據有疑問，可在期限內提出異議。',
    audience: '單據上的車輛使用人或所有人。',
    duration: '30 個工作天',
    feeText: '提出異議免規費。原停車費是否取消，依審查結果而定。',
    documents: ['單據正面照片', '行車證明或車籍資料'],
    keywords: ['停車', '罰單', '異議', '申訴', '車號'],
    fields: [
      {
        key: 'ticketNo',
        label: '單據號碼',
        type: 'text',
        required: true,
        help: '印在單據右上角。示範可填 PK-000001。',
      },
      {
        key: 'plate',
        label: '車號',
        type: 'text',
        required: true,
        help: '請包含英數字，例如 AAA-0001。',
        autocomplete: 'off',
      },
      {
        key: 'reason',
        label: '異議理由',
        type: 'textarea',
        required: true,
        help: '說明當時情形。只寫「不服」無法審查，請補充時間或地點。',
      },
    ],
  },
]

export const forms: FormTemplate[] = [
  {
    id: 'form-welfare',
    serviceId: 'welfare-subsidy',
    name: '中低收入戶生活補助申請書',
    description: '紙本申請用。線上申請不必另填這份。',
    body: '示範市市民服務處\n中低收入戶生活補助申請書（示範）\n\n申請人：\n身分證字號：\n電話：\n地址：\n共同生活人口：\n全家每月收入合計：\n撥款帳號：\n\n本人確認以上資料正確，並了解這是無障礙流程示範，不具申請效力。\n\n簽名：\n日期：',
  },
  {
    id: 'form-disability',
    serviceId: 'disability-card',
    name: '身心障礙證明補發申請書',
    description: '給無法使用線上申請的人，可列印後臨櫃送件。',
    body: '身心障礙證明補發申請書（示範）\n\n申請人：\n原證明字號：\n補發原因（遺失／毀損／資料變更）：\n聯絡電話：\n\n附件：身分證影本、兩吋照片。',
  },
  {
    id: 'form-facility',
    serviceId: 'facility-permit',
    name: '公共設施使用申請書',
    description: '借用場地的紙本申請書。',
    body: '公共設施使用申請書（示範）\n\n申請單位或個人：\n場地：\n開始日期：\n結束日期：\n使用目的：\n聯絡電話：',
  },
  {
    id: 'form-business',
    serviceId: 'business-change',
    name: '營業登記事項變更申請書',
    description: '變更負責人、地址或資本額時使用。',
    body: '營業登記事項變更申請書（示範）\n\n商業名稱：\n統一編號：\n變更項目：\n變更前：\n變更後：\n負責人簽名：',
  },
  {
    id: 'form-parking',
    serviceId: 'parking-appeal',
    name: '路邊停車費異議書',
    description: '對停車費單據提出書面異議。',
    body: '路邊停車費異議書（示範）\n\n單據號碼：\n車號：\n異議人：\n電話：\n理由：\n\n請附單據與車籍資料影本。',
  },
]

export const faqs: FaqItem[] = [
  {
    id: 'progress',
    question: '如何查詢案件進度？',
    answer: [
      '準備收件時拿到的案件編號，以及身分證後四碼。',
      '打開「案件查詢」，兩欄都填完後按「查詢案件」。系統不會在您打字時自動跳轉。',
      '若只有身分證字號、還沒有編號，可改選「以身分證字號查詢」。',
    ],
  },
  {
    id: 'supplement',
    question: '什麼是補正？',
    answer: [
      '補正是補齊或修正不符合規定的文件。案件狀態會顯示「待補正」，並寫明缺少什麼。',
      '請在該案件頁上傳補件。送出後狀態會回到「審核中」。此示範只記錄檔名，不會把檔案送到伺服器。',
    ],
  },
  {
    id: 'account',
    question: '申請需要先註冊會員嗎？',
    answer: [
      '這個示範不需要帳號。正式機關網站可能要使用自然人憑證或行動身分識別。',
      '請不要在表單輸入真實身分證、帳號或病歷。首頁和查詢頁已準備示範資料。',
    ],
  },
  {
    id: 'counter',
    question: '可以改到櫃檯辦理嗎？',
    answer: [
      '可以。每項服務都可以預約臨櫃。請先選服務、日期與時段，確認資料後才會成立預約。',
      '已額滿的時段不能選，按鈕會標示「已額滿」，不只用顏色區分。',
    ],
  },
  {
    id: 'text-size',
    question: '如何放大文字或改成高對比？',
    answer: [
      '每個頁面最上方有「無障礙設定」。文字可放大到原本的 200%，也可以加寬行距、改成高對比。',
      '設定只存在這台瀏覽器。放大後內容會改成直向排列，不需要左右捲動才能讀完一行。',
    ],
  },
  {
    id: 'privacy',
    question: '我送出的資料會存到哪裡？',
    answer: [
      '只存在您這台電腦的瀏覽器裡，重整頁面還在。清除瀏覽器網站資料，或到「網站導覽」按「還原示範資料」，就會刪除。',
      '沒有伺服器、沒有真實繳費，也不會寄信。',
    ],
  },
]

export const glossary: GlossaryEntry[] = [
  {
    term: '補正',
    definition: '補齊缺件，或修正填錯、不清楚的內容。補完之前，審查會先暫停。',
  },
  {
    term: '臨櫃',
    definition: '親自到機關櫃檯辦理，不是在網路上完成。',
  },
  {
    term: '規費',
    definition: '機關依規定收取的手續費或場地使用費。不是罰款。',
  },
  {
    term: '收件編號',
    definition: '受理申請後給的案件編號。本示範的編號格式是 GV114- 加上 6 碼數字。',
  },
  {
    term: '承辦人',
    definition: '負責審查這件申請的人員。本示範不提供真實承辦人姓名。',
  },
  {
    term: '異議',
    definition: '對收費或處分提出不同意見，請機關再審查一次。',
  },
]

export const demoCases = [
  {
    scene: '待補正，可練習補件',
    name: '陳安心',
    nationalId: 'A123456789',
    caseId: 'GV114-000128',
    last4: '6789',
    status: '待補正',
  },
  {
    scene: '審核中',
    name: '林宜君',
    nationalId: 'B123456780',
    caseId: 'GV114-000086',
    last4: '6780',
    status: '審核中',
  },
  {
    scene: '已核准，規費已繳',
    name: '張文彥',
    nationalId: 'C123456781',
    caseId: 'GV114-000041',
    last4: '6781',
    status: '已核准',
  },
  {
    scene: '已核准，可練習繳費',
    name: '黃秋月',
    nationalId: 'D123456782',
    caseId: 'GV114-000203',
    last4: '6782',
    status: '待繳規費',
  },
  {
    scene: '未核准，可看原因',
    name: '王大為',
    nationalId: 'E123456783',
    caseId: 'GV114-000156',
    last4: '6783',
    status: '未核准',
  },
]

export const announcements = [
  {
    id: 'a1',
    date: '2026-09-01',
    title: '線上申請與進度查詢已開放示範',
    body: '可以練習申請、查詢、補件、預約與繳費。所有資料都留在您的瀏覽器。',
  },
  {
    id: 'a2',
    date: '2026-08-18',
    title: '文字可放大到 200%，並提供高對比',
    body: '請使用頁面最上方的無障礙設定。連結一律加底線，不只靠顏色辨識。',
  },
  {
    id: 'a3',
    date: '2026-07-30',
    title: '請勿輸入真實個人資料',
    body: '查詢頁列有示範身分證與案件編號，足夠走完每一種狀態。',
  },
]

export interface GuidePage {
  title: string
  href: string
  text: string
}

export const guidePages: GuidePage[] = [
  {
    title: '服務總覽',
    href: '/services',
    text: '分類瀏覽各項申請，進入服務說明後再決定線上申請或預約臨櫃。',
  },
  {
    title: '案件查詢',
    href: '/services/query',
    text: '用案件編號與身分證後四碼查進度，或用身分證字號列出案件。補件與結果也從這裡進入。',
  },
  {
    title: '臨櫃預約',
    href: '/services/appointments',
    text: '選擇服務、平日日期與時段。送出前會先請您確認。',
  },
  {
    title: '規費繳納',
    href: '/services/fees',
    text: '查詢待繳規費。確認金額後才會完成示範繳費，不會真正扣款。',
  },
  {
    title: '表單下載',
    href: '/services/forms',
    text: '紙本申請書以文字呈現，可在頁面上閱讀，也可以下載純文字檔。',
  },
  {
    title: '常見問答',
    href: '/services/faq',
    text: '進度查詢、補正、會員、臨櫃、文字大小與資料存放位置。',
  },
  {
    title: '網站導覽',
    href: '/services/guide',
    text: '全站地圖、快速鍵與詞彙解釋。可還原示範資料。',
  },
  {
    title: '無障礙聲明',
    href: '/services/accessibility',
    text: '本示範對照的無障礙作法，以及尚未經過人工檢測的範圍。',
  },
]

export function getService(id: string) {
  return services.find((item) => item.id === id)
}

export function getForm(id: string) {
  return forms.find((item) => item.id === id)
}

export function optionLabel(serviceId: string, key: string, value: string) {
  const field = getService(serviceId)?.fields.find((item) => item.key === key)
  return field?.options?.find((item) => item.value === value)?.label || value || '未填'
}

export interface SearchHit {
  title: string
  href: string
  excerpt: string
}

export function searchContent(keyword: string): SearchHit[] {
  const key = keyword.trim()
  if (!key) return []
  const hits: SearchHit[] = []

  for (const service of services) {
    const haystack = [service.name, service.summary, service.category, service.audience, ...service.keywords].join(
      '',
    )
    if (haystack.includes(key)) {
      hits.push({
        title: service.name,
        href: `/services/items/${service.id}`,
        excerpt: service.summary,
      })
    }
  }

  for (const form of forms) {
    if (`${form.name}${form.description}`.includes(key)) {
      hits.push({
        title: form.name,
        href: `/services/forms/${form.id}`,
        excerpt: form.description,
      })
    }
  }

  for (const faq of faqs) {
    if (`${faq.question}${faq.answer.join('')}`.includes(key)) {
      hits.push({
        title: faq.question,
        href: `/services/faq#${faq.id}`,
        excerpt: faq.answer[0] || '',
      })
    }
  }

  for (const page of guidePages) {
    if (`${page.title}${page.text}`.includes(key)) {
      hits.push({ title: page.title, href: page.href, excerpt: page.text })
    }
  }

  return hits
}
