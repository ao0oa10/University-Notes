const courseData = [
  {
    id: 'law-intro',
    title: 'مقدمة في القانون',
    description: 'تعريف القانون، مصادره، والفروق بين القواعد القانونية والاجتماعية.',
    exams: {
      midterm: [
        {
          title: 'مفهوم القانون ووظيفته',
          text: 'القانون مجموعة قواعد عامة ومجردة تنظم سلوك الأفراد داخل المجتمع، وتكفل الدولة احترامها.',
          concepts: [
            { q: 'لماذا نحتاج إلى القانون؟', a: 'لحفظ النظام العام ومنع النزاعات وتحديد الحقوق والواجبات.' },
            { q: 'ما معنى قاعدة عامة ومجردة؟', a: 'تنطبق على جميع من تنطبق عليهم شروطها دون تمييز شخصي.' }
          ],
          question: {
            prompt: 'ما الوظيفة الأساسية للقانون؟',
            options: ['تنظيم التجارة فقط', 'تنظيم العلاقات في المجتمع', 'تحديد أسعار المنتجات فقط'],
            correctIndex: 1,
            successText: 'إجابة صحيحة: القانون ينظم العلاقات ويضمن الحقوق.'
          }
        },
        {
          title: 'مصادر القاعدة القانونية',
          text: 'من أهم مصادر القانون: التشريع، العرف، ومبادئ الشريعة أو الفقه بحسب النظام القانوني.',
          concepts: [
            { q: 'ما المقصود بالتشريع؟', a: 'قواعد مكتوبة تصدرها السلطة المختصة في الدولة.' },
            { q: 'متى يُعتد بالعرف؟', a: 'عند استقرار سلوك الناس على عادة معينة مع الإلزام بها قانونياً.' }
          ],
          question: {
            prompt: 'أيّ مما يلي يُعد مصدرًا رسميًا للقانون؟',
            options: ['الآراء الشخصية', 'التشريع', 'المذكرات الدراسية غير المعتمدة'],
            correctIndex: 1,
            successText: 'صحيح: التشريع مصدر رسمي أساسي للقواعد القانونية.'
          }
        }
      ],
      final: [
        {
          title: 'تقسيمات القانون',
          text: 'ينقسم القانون غالبًا إلى قانون عام وقانون خاص بحسب طبيعة العلاقة والأطراف المعنية.',
          concepts: [
            { q: 'ما القانون العام؟', a: 'ينظم علاقات الدولة بالسلطات العامة والأفراد بصفتها صاحبة سيادة.' },
            { q: 'ما القانون الخاص؟', a: 'ينظم علاقات الأفراد فيما بينهم على قدم المساواة.' }
          ],
          question: {
            prompt: 'القانون الذي ينظم علاقة الفرد بالدولة بصفتها سلطة عامة هو:',
            options: ['القانون الخاص', 'القانون العام', 'لا يوجد فرق بينهما'],
            correctIndex: 1,
            successText: 'ممتاز: هذه من خصائص القانون العام.'
          }
        },
        {
          title: 'تدرج القواعد القانونية',
          text: 'تُرتّب القواعد القانونية هرميًا من الدستور ثم القوانين ثم اللوائح، ويجب ألا يخالف الأدنى الأعلى.',
          concepts: [
            { q: 'لماذا يهم التدرج؟', a: 'لضمان اتساق النظام القانوني ومنع تعارض القواعد.' },
            { q: 'ماذا يحدث عند التعارض؟', a: 'تُقدّم القاعدة الأعلى مرتبة ويتم إهمال المخالِفة.' }
          ],
          question: {
            prompt: 'عند تعارض لائحة مع قانون، أيهما يُطبّق؟',
            options: ['اللائحة لأنها أحدث', 'القانون لأنه أعلى مرتبة', 'يُترك للقاضي دون قاعدة'],
            correctIndex: 1,
            successText: 'إجابة صحيحة: القاعدة الأعلى مرتبة هي الواجبة التطبيق.'
          }
        }
      ]
    }
  },
  {
    id: 'arabic-language',
    title: 'اللغة العربية',
    description: 'مراجعة Midterm تفاعلية تشمل الدروس والبطاقات وبنك الأسئلة والاختبار التجريبي.',
    exams: {
      midterm: [],
      final: null
    }
  },
  {
    id: 'intro-management',
    title: 'مبادئ الإدارة',
    description: 'ملخص سريع لمفاهيم التخطيط والتنظيم والقيادة والرقابة.'
  },
  {
    id: 'economic-basics',
    title: 'أساسيات الاقتصاد',
    description: 'عرض تمهيدي لمبادئ العرض والطلب والتوازن في السوق.'
  }
];

const state = {
  subjectId: null,
  examType: null,
  slideIndex: 0,
  answered: false
};

const homeView = document.getElementById('home-view');
const examView = document.getElementById('exam-view');
const studyView = document.getElementById('study-view');
const arabicView = document.getElementById('arabic-view');

const subjectsList = document.getElementById('subjects-list');
const examSubjectTitle = document.getElementById('exam-subject-title');
const examNote = document.getElementById('exam-note');
const examMidtermBtn = document.getElementById('exam-midterm-btn');
const examFinalBtn = document.getElementById('exam-final-btn');
const currentTrack = document.getElementById('current-track');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const slideTitle = document.getElementById('slide-title');
const slideContent = document.getElementById('slide-content');
const conceptsContainer = document.getElementById('concepts');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options');
const feedback = document.getElementById('feedback');

const retryBtn = document.getElementById('retry-btn');
const nextQuestionBtn = document.getElementById('next-question-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

function getSelectedSubject() {
  return courseData.find((subject) => subject.id === state.subjectId) || null;
}

function getSlides() {
  const subject = getSelectedSubject();
  if (!subject || !subject.exams || !subject.exams[state.examType]) return [];
  return subject.exams[state.examType];
}

function showView(viewName) {
  homeView.hidden = viewName !== 'home';
  examView.hidden = viewName !== 'exam';
  studyView.hidden = viewName !== 'study';
  arabicView.hidden = viewName !== 'arabic';
}

function resetQuestionUi() {
  state.answered = false;
  feedback.textContent = '';
  feedback.className = 'feedback';
  retryBtn.hidden = true;
  nextQuestionBtn.hidden = true;
}

function renderSubjects() {
  subjectsList.innerHTML = '';

  courseData.forEach((subject) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'subject-btn';

    if (subject.exams) {
      button.innerHTML = `<strong>${subject.title}</strong><span class="tag">متاح الآن</span><div class="helper">${subject.description}</div>`;
      button.addEventListener('click', () => {
        state.subjectId = subject.id;
        state.examType = null;
        state.slideIndex = 0;
        examSubjectTitle.textContent = subject.title;

        if (subject.id === 'arabic-language') {
          examFinalBtn.disabled = true;
          examFinalBtn.textContent = 'Final - قريبًا';
          examNote.hidden = false;
          examNote.textContent = 'Final لمادة اللغة العربية غير متاح حاليًا.';
        } else {
          examFinalBtn.disabled = false;
          examFinalBtn.textContent = 'Final - مراجعة نهائية';
          examNote.hidden = true;
          examNote.textContent = '';
        }

        showView('exam');
      });
    } else {
      button.disabled = true;
      button.style.opacity = '0.75';
      button.innerHTML = `<strong>${subject.title}</strong><span class="tag">قريبًا</span><div class="helper">${subject.description}</div>`;
    }

    subjectsList.appendChild(button);
  });
}

function renderSlide() {
  const subject = getSelectedSubject();
  const slides = getSlides();
  const slide = slides[state.slideIndex];

  if (!subject || !slide) {
    goHome();
    return;
  }

  currentTrack.textContent = `${subject.title} • ${state.examType === 'midterm' ? 'Midterm' : 'Final'}`;
  slideTitle.textContent = slide.title;
  slideContent.textContent = slide.text;
  progressText.textContent = `الشريحة ${state.slideIndex + 1} من ${slides.length}`;
  progressBar.style.width = `${((state.slideIndex + 1) / slides.length) * 100}%`;
  prevBtn.disabled = state.slideIndex === 0;
  nextBtn.disabled = state.slideIndex === slides.length - 1;

  conceptsContainer.innerHTML = '';
  slide.concepts.forEach((concept) => {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const answer = document.createElement('p');
    summary.textContent = concept.q;
    answer.textContent = concept.a;
    details.appendChild(summary);
    details.appendChild(answer);
    conceptsContainer.appendChild(details);
  });

  questionText.textContent = slide.question.prompt;
  optionsContainer.innerHTML = '';
  slide.question.options.forEach((option, index) => {
    const optionBtn = document.createElement('button');
    optionBtn.type = 'button';
    optionBtn.className = 'option-btn';
    optionBtn.textContent = option;
    optionBtn.addEventListener('click', () => handleAnswer(index));
    optionsContainer.appendChild(optionBtn);
  });

  resetQuestionUi();
  const firstOption = optionsContainer.querySelector('button');
  if (firstOption) firstOption.focus();
}

function handleAnswer(selectedIndex) {
  if (state.answered) return;

  state.answered = true;
  const slide = getSlides()[state.slideIndex];
  const buttons = Array.from(optionsContainer.querySelectorAll('button'));
  const isCorrect = selectedIndex === slide.question.correctIndex;

  buttons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === slide.question.correctIndex) {
      btn.classList.add('correct');
    }
    if (!isCorrect && index === selectedIndex) {
      btn.classList.add('wrong');
    }
  });

  if (isCorrect) {
    feedback.textContent = `✅ ${slide.question.successText}`;
    feedback.classList.add('success');
    if (state.slideIndex < getSlides().length - 1) {
      nextQuestionBtn.hidden = false;
      nextQuestionBtn.focus();
    }
  } else {
    feedback.textContent = '❌ إجابة غير صحيحة. راجع المفهوم ثم أعد المحاولة.';
    feedback.classList.add('error');
    retryBtn.hidden = false;
    retryBtn.focus();
  }
}

function retryQuestion() {
  const buttons = Array.from(optionsContainer.querySelectorAll('button'));
  buttons.forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove('correct', 'wrong');
  });
  resetQuestionUi();
  if (buttons[0]) buttons[0].focus();
}

function nextSlide() {
  const slides = getSlides();
  if (state.slideIndex < slides.length - 1) {
    state.slideIndex += 1;
    renderSlide();
  }
}

function prevSlide() {
  if (state.slideIndex > 0) {
    state.slideIndex -= 1;
    renderSlide();
  }
}

function openExam(examType) {
  if (state.subjectId === 'arabic-language') {
    if (examType === 'final') return;
    state.examType = 'midterm';
    showView('arabic');
    if (window.ArabicMidtermApp) {
      window.ArabicMidtermApp.open();
    }
    return;
  }

  state.examType = examType;
  state.slideIndex = 0;
  showView('study');
  renderSlide();
}

function goHome() {
  state.subjectId = null;
  state.examType = null;
  state.slideIndex = 0;
  resetQuestionUi();
  if (window.ArabicMidtermApp) {
    window.ArabicMidtermApp.resetPanel();
  }
  showView('home');
}

examMidtermBtn.addEventListener('click', () => openExam('midterm'));
examFinalBtn.addEventListener('click', () => openExam('final'));
document.getElementById('exam-back-home').addEventListener('click', goHome);
document.getElementById('back-to-exams').addEventListener('click', () => showView('exam'));
document.getElementById('study-home').addEventListener('click', goHome);
document.getElementById('arabic-back-to-exams').addEventListener('click', () => showView('exam'));
document.getElementById('arabic-home').addEventListener('click', goHome);
prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);
retryBtn.addEventListener('click', retryQuestion);
nextQuestionBtn.addEventListener('click', nextSlide);

renderSubjects();
showView('home');
