(() => {
  const STORAGE_KEY = 'universityNotes.arabic.midterm.v1';
  const DATA_PATH = 'data/arabic-midterm.json';

  const panelContainer = document.getElementById('arabic-panel');
  const summaryEl = document.getElementById('arabic-summary');
  const navButtons = Array.from(document.querySelectorAll('.arabic-nav-btn'));
  const resetProgressBtn = document.getElementById('arabic-reset-progress');

  const sourceStatusLabels = {
    'course-file': 'من ملفات المقرر',
    'course-file-with-note': 'من ملفات المقرر + ملاحظة',
    supplementary: 'محتوى تكميلي'
  };

  const appState = {
    data: null,
    panel: 'mindmap',
    selectedLessonId: null,
    flashcardsLessonId: null,
    questionBankIndex: 0,
    progress: loadProgress()
  };

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          completedLessonIds: [],
          mastery: {},
          mistakes: []
        };
      }
      const parsed = JSON.parse(raw);
      return {
        completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
        mastery: parsed.mastery && typeof parsed.mastery === 'object' ? parsed.mastery : {},
        mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : []
      };
    } catch (error) {
      return {
        completedLessonIds: [],
        mastery: {},
        mistakes: []
      };
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.progress));
    updateSummary();
  }

  function updateSummary() {
    if (!appState.data) {
      summaryEl.textContent = 'جارٍ تحميل بيانات مادة اللغة العربية...';
      return;
    }
    const lessonsTotal = appState.data.lessons.length;
    const completed = appState.progress.completedLessonIds.length;
    const percent = Math.round((completed / lessonsTotal) * 100);
    const mistakes = appState.progress.mistakes.length;
    summaryEl.textContent = `التقدم: ${completed}/${lessonsTotal} درس مكتمل (${percent}%) • أسئلة تحتاج مراجعة: ${mistakes}`;
  }

  function normalizePromptId(prompt) {
    return prompt.replace(/\s+/g, '-').slice(0, 48);
  }

  function addMistake(question, lessonTitle) {
    const id = question.id || `prompt-${normalizePromptId(question.prompt)}`;
    if (appState.progress.mistakes.some((item) => item.id === id)) return;
    appState.progress.mistakes.push({
      id,
      prompt: question.prompt,
      type: question.type,
      modelAnswer: question.modelAnswer || question.answer || '',
      explanation: question.explanation || '',
      correctAnswer: typeof question.correctAnswer === 'boolean' ? question.correctAnswer : null,
      lessonTitle: lessonTitle || question.category || 'مراجعة عامة'
    });
    saveProgress();
  }

  function removeMistake(id) {
    appState.progress.mistakes = appState.progress.mistakes.filter((item) => item.id !== id);
    saveProgress();
  }

  function setPanel(panelName) {
    appState.panel = panelName;
    navButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.panel === panelName));
    });
    renderPanel();
  }

  function sectionToHtml(section) {
    if (section.type === 'paragraph') {
      return `<section class="arabic-block"><h4>${section.title}</h4><p>${section.text}</p></section>`;
    }

    if (section.type === 'list') {
      const tag = section.ordered ? 'ol' : 'ul';
      return `<section class="arabic-block"><h4>${section.title}</h4><${tag}>${section.items.map((item) => `<li>${item}</li>`).join('')}</${tag}></section>`;
    }

    if (section.type === 'table') {
      return `<section class="arabic-block"><h4>${section.title}</h4><div class="arabic-table-wrap"><table><thead><tr>${section.headers.map((head) => `<th>${head}</th>`).join('')}</tr></thead><tbody>${section.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
    }

    if (section.type === 'callout') {
      const toneClass = section.tone === 'warning' ? 'arabic-callout-warning' : 'arabic-callout-note';
      return `<section class="arabic-block arabic-callout ${toneClass}"><h4>${section.title}</h4><p>${section.text}</p></section>`;
    }

    return '';
  }

  function renderShortAnswerQuestion(question, lessonTitle, indexLabel = '') {
    const wrapper = document.createElement('article');
    wrapper.className = 'arabic-question-card';

    const title = indexLabel ? `${indexLabel} ${question.prompt}` : question.prompt;

    wrapper.innerHTML = `
      <h4>${title}</h4>
      <textarea class="arabic-answer-input" rows="3" placeholder="اكتب محاولتك هنا (اختياري)"></textarea>
      <div class="inline-actions">
        <button type="button" class="action-btn show-answer-btn">عرض نموذج الإجابة</button>
      </div>
      <div class="arabic-model-answer" hidden>
        <p><strong>نموذج الإجابة:</strong> ${question.modelAnswer || question.answer || ''}</p>
      </div>
      <div class="inline-actions mark-actions" hidden>
        <button type="button" class="action-btn mark-correct">أجبت بشكل صحيح ✅</button>
        <button type="button" class="action-btn muted-btn mark-review">أحتاج مراجعة ❌</button>
      </div>
      <p class="feedback" aria-live="polite"></p>
    `;

    const showAnswerBtn = wrapper.querySelector('.show-answer-btn');
    const modelAnswer = wrapper.querySelector('.arabic-model-answer');
    const markActions = wrapper.querySelector('.mark-actions');
    const feedback = wrapper.querySelector('.feedback');

    showAnswerBtn.addEventListener('click', () => {
      modelAnswer.hidden = false;
      markActions.hidden = false;
      feedback.textContent = 'بعد المقارنة، حدّد هل إجابتك صحيحة أم تحتاج مراجعة.';
    });

    wrapper.querySelector('.mark-correct').addEventListener('click', () => {
      if (question.id) removeMistake(question.id);
      feedback.textContent = '✅ ممتاز، تم تسجيل السؤال كإجابة صحيحة.';
      feedback.className = 'feedback success';
    });

    wrapper.querySelector('.mark-review').addEventListener('click', () => {
      addMistake(question, lessonTitle);
      feedback.textContent = '❌ تمت إضافة السؤال إلى قائمة أخطائي للمراجعة.';
      feedback.className = 'feedback error';
    });

    return wrapper;
  }

  function renderTrueFalseQuestion(question, lessonTitle) {
    const wrapper = document.createElement('article');
    wrapper.className = 'arabic-question-card';
    wrapper.innerHTML = `
      <h4>${question.prompt}</h4>
      <div class="inline-actions">
        <button type="button" class="option-btn answer-true">صح</button>
        <button type="button" class="option-btn answer-false">خطأ</button>
      </div>
      <p class="feedback" aria-live="polite"></p>
      <p class="helper">${question.explanation || ''}</p>
    `;

    const feedback = wrapper.querySelector('.feedback');
    const trueBtn = wrapper.querySelector('.answer-true');
    const falseBtn = wrapper.querySelector('.answer-false');

    const submit = (answer) => {
      trueBtn.disabled = true;
      falseBtn.disabled = true;
      const correct = answer === question.correctAnswer;
      if (correct) {
        feedback.textContent = `✅ إجابة صحيحة: ${question.explanation || ''}`;
        feedback.className = 'feedback success';
      } else {
        feedback.textContent = `❌ إجابة غير صحيحة: ${question.explanation || ''}`;
        feedback.className = 'feedback error';
        addMistake(question, lessonTitle);
      }
    };

    trueBtn.addEventListener('click', () => submit(true));
    falseBtn.addEventListener('click', () => submit(false));

    return wrapper;
  }

  function renderQuestionByType(question, lessonTitle, indexLabel = '') {
    if (question.type === 'true-false') {
      return renderTrueFalseQuestion(question, lessonTitle);
    }
    return renderShortAnswerQuestion(question, lessonTitle, indexLabel);
  }

  function renderMindMap() {
    const map = appState.data.mindMap;
    panelContainer.innerHTML = `
      <section class="arabic-block">
        <h3>${map.root}</h3>
        ${map.branches
          .map(
            (branch) => `<article class="arabic-branch"><h4>${branch.title}</h4><ul>${branch.items.map((item) => `<li>${item}</li>`).join('')}</ul></article>`
          )
          .join('')}
      </section>
    `;
  }

  function renderLessonList() {
    const orderedLessons = [...appState.data.lessons].sort((a, b) => a.order - b.order);
    panelContainer.innerHTML = `
      <section class="arabic-block">
        <h3>الدروس الستة</h3>
        <div class="stack" id="lessons-list"></div>
      </section>
      <div id="lesson-detail"></div>
    `;

    const lessonsList = panelContainer.querySelector('#lessons-list');
    const detail = panelContainer.querySelector('#lesson-detail');

    orderedLessons.forEach((lesson) => {
      const done = appState.progress.completedLessonIds.includes(lesson.id);
      const sourceLabel = sourceStatusLabels[lesson.sourceStatus] || lesson.sourceStatus;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'subject-btn';
      button.innerHTML = `<strong>${lesson.order}. ${lesson.title}</strong><span class="tag">${sourceLabel}</span>${done ? '<span class="tag">مكتمل</span>' : ''}`;
      button.addEventListener('click', () => {
        appState.selectedLessonId = lesson.id;
        renderLessonDetail(lesson, detail);
      });
      lessonsList.appendChild(button);
    });

    if (appState.selectedLessonId) {
      const selected = orderedLessons.find((lesson) => lesson.id === appState.selectedLessonId);
      if (selected) renderLessonDetail(selected, detail);
    }
  }

  function renderLessonDetail(lesson, container) {
    const sourceLabel = sourceStatusLabels[lesson.sourceStatus] || lesson.sourceStatus;
    const questionMap = new Map(appState.data.questionBank.map((question) => [question.id, question]));
    const practiceQuestions = lesson.practiceQuestionIds.map((id) => questionMap.get(id)).filter(Boolean);
    const masteryState = appState.progress.mastery[lesson.id];

    container.innerHTML = `
      <section class="arabic-block">
        <h3>${lesson.title} <span class="tag ${lesson.sourceStatus === 'supplementary' ? 'tag-supplementary' : ''}">${sourceLabel}</span></h3>
        <p class="helper">المصدر: ${lesson.sources.map((source) => source.file || source.note).join(' • ')}</p>
      </section>

      <section class="arabic-block">
        <h4>1) خلاصة في دقيقة</h4>
        <ul>${lesson.oneMinuteSummary.map((item) => `<li>${item}</li>`).join('')}</ul>
      </section>

      <section class="arabic-block">
        <h4>2) أهداف التعلم وطريقة الفهم</h4>
        <ul>${lesson.learningObjectives.map((goal) => `<li>${goal}</li>`).join('')}</ul>
        <p>${lesson.studyMethod}</p>
      </section>

      <section class="arabic-block">
        <h4>3) الشرح الكامل والأمثلة والجداول</h4>
        ${lesson.sections.map(sectionToHtml).join('')}
      </section>

      <section class="arabic-block">
        <h4>4) بطاقات الاسترجاع</h4>
        <div class="stack">${lesson.flashcards
          .map((card) => `<details><summary>${card.front}</summary><p>${card.back}</p></details>`)
          .join('')}</div>
      </section>

      <section class="arabic-block" id="source-exercises-wrap">
        <h4>5) تطبيقات من ملفات المقرر</h4>
      </section>

      <section class="arabic-block" id="practice-wrap">
        <h4>6) تدريب جديد من بنك الأسئلة</h4>
      </section>

      <section class="arabic-block">
        <h4>7) اختبار إتقان</h4>
        <p class="helper">النجاح يتطلب ${lesson.mastery.passPercent}% على الأقل.</p>
        ${masteryState ? `<p class="helper">آخر نتيجة: ${masteryState.percent}% (${masteryState.correct}/${masteryState.total})</p>` : ''}
        <div class="inline-actions">
          <button type="button" class="action-btn" id="start-mastery">بدء اختبار الإتقان</button>
        </div>
        <div id="mastery-area"></div>
      </section>
    `;

    const sourceWrap = container.querySelector('#source-exercises-wrap');
    lesson.sourceExercises.forEach((question) => {
      sourceWrap.appendChild(renderQuestionByType(question, lesson.title));
    });

    const practiceWrap = container.querySelector('#practice-wrap');
    practiceQuestions.forEach((question, index) => {
      practiceWrap.appendChild(renderQuestionByType(question, lesson.title, `${index + 1})`));
    });

    container.querySelector('#start-mastery').addEventListener('click', () => {
      startMasteryTest(lesson, practiceQuestions, container.querySelector('#mastery-area'));
    });
  }

  function startMasteryTest(lesson, questions, target) {
    const minimum = lesson.mastery.minimumQuestions;
    const testQuestions = questions.slice(0, Math.max(minimum, 1));
    let index = 0;
    let correct = 0;

    const renderCurrent = () => {
      const current = testQuestions[index];
      if (!current) {
        const percent = Math.round((correct / testQuestions.length) * 100);
        const passed = percent >= lesson.mastery.passPercent;

        appState.progress.mastery[lesson.id] = {
          percent,
          correct,
          total: testQuestions.length,
          passed
        };

        if (passed) {
          if (!appState.progress.completedLessonIds.includes(lesson.id)) {
            appState.progress.completedLessonIds.push(lesson.id);
          }
        } else {
          appState.progress.completedLessonIds = appState.progress.completedLessonIds.filter((id) => id !== lesson.id);
        }

        saveProgress();
        target.innerHTML = `<p class="feedback ${passed ? 'success' : 'error'}">${passed ? '✅' : '❌'} نتيجتك ${percent}% (${correct}/${testQuestions.length}).</p>`;
        return;
      }

      target.innerHTML = `
        <article class="arabic-question-card">
          <h4>سؤال ${index + 1} من ${testQuestions.length}: ${current.prompt}</h4>
          <textarea class="arabic-answer-input" rows="3" placeholder="اكتب إجابتك"></textarea>
          <div class="inline-actions">
            <button type="button" class="action-btn" id="mastery-show-answer">عرض نموذج الإجابة</button>
          </div>
          <p id="mastery-answer" hidden><strong>الإجابة:</strong> ${current.modelAnswer || ''}</p>
          <div class="inline-actions" id="mastery-eval" hidden>
            <button type="button" class="action-btn" id="mastery-correct">أجبت بشكل صحيح ✅</button>
            <button type="button" class="action-btn muted-btn" id="mastery-wrong">أحتاج مراجعة ❌</button>
          </div>
        </article>
      `;

      target.querySelector('#mastery-show-answer').addEventListener('click', () => {
        target.querySelector('#mastery-answer').hidden = false;
        target.querySelector('#mastery-eval').hidden = false;
      });

      target.querySelector('#mastery-correct').addEventListener('click', () => {
        removeMistake(current.id);
        correct += 1;
        index += 1;
        renderCurrent();
      });

      target.querySelector('#mastery-wrong').addEventListener('click', () => {
        addMistake(current, lesson.title);
        index += 1;
        renderCurrent();
      });
    };

    renderCurrent();
  }

  function renderFlashcardsPanel() {
    const lessons = [...appState.data.lessons].sort((a, b) => a.order - b.order);
    if (!appState.flashcardsLessonId) appState.flashcardsLessonId = lessons[0].id;
    const selectedLesson = lessons.find((lesson) => lesson.id === appState.flashcardsLessonId) || lessons[0];

    panelContainer.innerHTML = `
      <section class="arabic-block">
        <h3>بطاقات الاسترجاع</h3>
        <div class="stack" id="flashcards-lessons"></div>
      </section>
      <section class="arabic-block">
        <h4>${selectedLesson.title}</h4>
        <div class="stack">${selectedLesson.flashcards
          .map((card) => `<details><summary>${card.front}</summary><p>${card.back}</p></details>`)
          .join('')}</div>
      </section>
    `;

    const lessonsWrap = panelContainer.querySelector('#flashcards-lessons');
    lessons.forEach((lesson) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'subject-btn';
      button.textContent = `${lesson.title} (${lesson.flashcards.length})`;
      button.addEventListener('click', () => {
        appState.flashcardsLessonId = lesson.id;
        renderFlashcardsPanel();
      });
      lessonsWrap.appendChild(button);
    });
  }

  function renderQuestionBank() {
    const questions = appState.data.questionBank;
    if (questions.length === 0) {
      panelContainer.innerHTML = '<p class="helper">لا توجد أسئلة في بنك الأسئلة.</p>';
      return;
    }

    if (appState.questionBankIndex > questions.length - 1) {
      appState.questionBankIndex = questions.length - 1;
    }

    const current = questions[appState.questionBankIndex];
    panelContainer.innerHTML = `
      <section class="arabic-block">
        <h3>بنك الأسئلة (${questions.length} سؤالًا)</h3>
        <p class="helper">الفئة: ${current.category}</p>
        <p class="helper">السؤال ${appState.questionBankIndex + 1} من ${questions.length}</p>
        <div id="question-bank-card"></div>
        <div class="inline-actions">
          <button type="button" class="action-btn muted-btn" id="qb-prev" ${appState.questionBankIndex === 0 ? 'disabled' : ''}>السابق</button>
          <button type="button" class="action-btn" id="qb-next" ${appState.questionBankIndex === questions.length - 1 ? 'disabled' : ''}>التالي</button>
        </div>
      </section>
    `;

    panelContainer.querySelector('#question-bank-card').appendChild(renderShortAnswerQuestion(current, current.category));

    panelContainer.querySelector('#qb-prev').addEventListener('click', () => {
      appState.questionBankIndex -= 1;
      renderQuestionBank();
    });

    panelContainer.querySelector('#qb-next').addEventListener('click', () => {
      appState.questionBankIndex += 1;
      renderQuestionBank();
    });
  }

  function renderMockExam() {
    const mock = appState.data.mockExam;
    const sectionTotals = mock.questions.reduce((acc, question) => {
      acc[question.section] = (acc[question.section] || 0) + question.marks;
      return acc;
    }, {});

    panelContainer.innerHTML = `
      <section class="arabic-block">
        <h3>${mock.title}</h3>
        <p class="helper">المدة المقترحة: ${mock.recommendedMinutes} دقيقة.</p>
        <p>${mock.instructions}</p>
        <ul>${Object.entries(sectionTotals)
          .map(([section, total]) => `<li>${section}: ${total} درجات</li>`)
          .join('')}</ul>
      </section>
      <section class="arabic-block" id="mock-questions-wrap">
        <h4>أسئلة الاختبار التجريبي</h4>
      </section>
    `;

    const wrap = panelContainer.querySelector('#mock-questions-wrap');
    mock.questions.forEach((question, index) => {
      const normalized = {
        ...question,
        modelAnswer: question.answer,
        category: question.section
      };
      wrap.appendChild(renderShortAnswerQuestion(normalized, question.section, `${index + 1})`));
    });
  }

  function renderMistakes() {
    const mistakes = appState.progress.mistakes;
    panelContainer.innerHTML = `
      <section class="arabic-block">
        <h3>أخطائي / الأسئلة التي تحتاج مراجعة</h3>
        <p class="helper">عدد الأسئلة الحالية: ${mistakes.length}</p>
        <div id="mistakes-list"></div>
      </section>
    `;

    const list = panelContainer.querySelector('#mistakes-list');
    if (mistakes.length === 0) {
      list.innerHTML = '<p class="helper">لا توجد أسئلة بحاجة مراجعة الآن.</p>';
      return;
    }

    mistakes.forEach((mistake, index) => {
      const block = document.createElement('article');
      block.className = 'arabic-question-card';
      block.innerHTML = `
        <h4>${index + 1}) ${mistake.prompt}</h4>
        <p class="helper">التصنيف: ${mistake.lessonTitle}</p>
        <details>
          <summary>عرض نموذج الإجابة</summary>
          <p>${mistake.modelAnswer || mistake.explanation || 'لا يوجد نموذج متاح.'}</p>
        </details>
        <div class="inline-actions">
          <button type="button" class="action-btn" data-review-done="${mistake.id}">تمت المراجعة ✅</button>
        </div>
      `;
      list.appendChild(block);
    });

    list.querySelectorAll('[data-review-done]').forEach((button) => {
      button.addEventListener('click', () => {
        removeMistake(button.dataset.reviewDone);
        renderMistakes();
      });
    });
  }

  function renderPanel() {
    if (!appState.data) {
      panelContainer.innerHTML = '<p class="helper">جارٍ تحميل بيانات اللغة العربية...</p>';
      return;
    }

    if (appState.panel === 'mindmap') {
      renderMindMap();
      return;
    }

    if (appState.panel === 'lessons') {
      renderLessonList();
      return;
    }

    if (appState.panel === 'flashcards') {
      renderFlashcardsPanel();
      return;
    }

    if (appState.panel === 'question-bank') {
      renderQuestionBank();
      return;
    }

    if (appState.panel === 'mock-exam') {
      renderMockExam();
      return;
    }

    renderMistakes();
  }

  async function loadArabicData() {
    if (appState.data) return appState.data;
    const response = await fetch(DATA_PATH, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('تعذر تحميل ملف بيانات اللغة العربية.');
    }
    const data = await response.json();

    if (!Array.isArray(data.lessons) || data.lessons.length !== 6) {
      throw new Error('بيانات الدروس غير صحيحة: يجب أن تكون 6 دروس.');
    }
    if (!Array.isArray(data.questionBank) || data.questionBank.length !== 58) {
      throw new Error('بيانات بنك الأسئلة غير صحيحة: يجب أن تكون 58 سؤالًا.');
    }
    const mockTotal = data.mockExam.questions.reduce((total, q) => total + q.marks, 0);
    if (mockTotal !== 20) {
      throw new Error('درجات الاختبار التجريبي غير صحيحة: المجموع يجب أن يكون 20.');
    }

    appState.data = data;
    return data;
  }

  async function openArabicMidterm() {
    panelContainer.innerHTML = '<p class="helper">جارٍ تحميل المادة...</p>';
    updateSummary();

    try {
      await loadArabicData();
      updateSummary();
      setPanel(appState.panel || 'mindmap');
    } catch (error) {
      panelContainer.innerHTML = `<p class="feedback error">${error.message}</p>`;
    }
  }

  function resetProgress() {
    if (!confirm('هل أنت متأكد من مسح كل تقدم مادة اللغة العربية؟')) return;
    appState.progress = {
      completedLessonIds: [],
      mastery: {},
      mistakes: []
    };
    saveProgress();
    renderPanel();
  }

  navButtons.forEach((button) => {
    button.addEventListener('click', () => setPanel(button.dataset.panel));
  });

  resetProgressBtn.addEventListener('click', resetProgress);

  window.ArabicMidtermApp = {
    open: openArabicMidterm,
    resetPanel: () => {
      appState.panel = 'mindmap';
      appState.selectedLessonId = null;
    }
  };
})();
