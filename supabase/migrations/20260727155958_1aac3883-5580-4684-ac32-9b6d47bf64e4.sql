WITH p AS (
  INSERT INTO public.programs (slug, title, description, order_index, status)
  VALUES ('hn-ai-core','برنامج الذكاء الاصطناعي من الصفر','رحلة متدرّجة من أساسيات الذكاء الاصطناعي إلى بناء مشاريع حقيقية، 10 دقائق يوميًا.',0,'published')
  RETURNING id
), l1 AS (
  INSERT INTO public.levels (program_id, level_number, title, description, order_index, status)
  SELECT id,1,'المستوى 1 — الأساسيات','فهم ما هو الذكاء الاصطناعي وكيف يفكّر.',0,'published' FROM p RETURNING id
), l2 AS (
  INSERT INTO public.levels (program_id, level_number, title, description, order_index, status)
  SELECT id,2,'المستوى 2 — هندسة الأوامر','اكتب أوامر احترافية تحصل بها على نتائج مذهلة.',1,'published' FROM p RETURNING id
), c1 AS (
  INSERT INTO public.courses (level_id, slug, title, description, icon, color, difficulty, order_index, status)
  SELECT id,'ai-foundations','مدخل إلى الذكاء الاصطناعي','ما هو AI، كيف يتعلّم، وأين يُستخدم اليوم.','Brain','neon-purple','Beginner',0,'published' FROM l1 RETURNING id
), c2 AS (
  INSERT INTO public.courses (level_id, slug, title, description, icon, color, difficulty, order_index, status)
  SELECT id,'prompt-engineering','هندسة الأوامر العملية','قواعد كتابة الأوامر الفعّالة مع أمثلة.','Sparkles','neon-cyan','Intermediate',0,'published' FROM l2 RETURNING id
), ch1 AS (
  INSERT INTO public.chapters (course_id, title, description, order_index, status)
  SELECT id,'الفصل 1 — مفاهيم أساسية','التعريفات والمصطلحات التي تحتاجها.',0,'published' FROM c1 RETURNING id
), ch2 AS (
  INSERT INTO public.chapters (course_id, title, description, order_index, status)
  SELECT id,'الفصل 2 — كيف تتعلّم الآلة','من البيانات إلى النموذج.',1,'published' FROM c1 RETURNING id
), ch3 AS (
  INSERT INTO public.chapters (course_id, title, description, order_index, status)
  SELECT id,'الفصل 1 — قواعد الأوامر','بنية الأمر الاحترافي.',0,'published' FROM c2 RETURNING id
), u1 AS (
  INSERT INTO public.units (chapter_id, title, order_index, status)
  SELECT id,'الجزء 1 — البداية',0,'published' FROM ch1 RETURNING id
), u2 AS (
  INSERT INTO public.units (chapter_id, title, order_index, status)
  SELECT id,'الجزء 1 — التعلّم الآلي',0,'published' FROM ch2 RETURNING id
), u3 AS (
  INSERT INTO public.units (chapter_id, title, order_index, status)
  SELECT id,'الجزء 1 — إطار CRISP',0,'published' FROM ch3 RETURNING id
), ls AS (
  INSERT INTO public.lessons (unit_id, slug, title, summary, duration_minutes, xp_reward, order_index, status)
  SELECT id,'what-is-ai','ما هو الذكاء الاصطناعي؟','تعريف مبسّط للذكاء الاصطناعي وأمثلة من حياتك اليومية.',8,60,0,'published'::public.content_status FROM u1
  UNION ALL SELECT id,'ai-in-daily-life','الذكاء الاصطناعي حولك','أين يعمل الذكاء الاصطناعي في هاتفك كل يوم.',7,50,1,'published'::public.content_status FROM u1
  UNION ALL SELECT id,'how-models-learn','كيف تتعلّم النماذج؟','البيانات، التدريب، والتنبؤ بلغة بسيطة.',10,70,0,'published'::public.content_status FROM u2
  UNION ALL SELECT id,'llm-basics','ما هو النموذج اللغوي الكبير؟','كيف يتنبّأ ChatGPT بالكلمة التالية.',10,70,1,'published'::public.content_status FROM u2
  UNION ALL SELECT id,'prompt-crisp','إطار CRISP لكتابة الأوامر','خمس خطوات تحوّل أمرك العادي إلى أمر احترافي.',10,80,0,'published'::public.content_status FROM u3
  UNION ALL SELECT id,'prompt-mistakes','أخطاء شائعة في الأوامر','تجنّب الغموض واحصل على نتائج دقيقة.',8,60,1,'published'::public.content_status FROM u3
  RETURNING id, slug
), b AS (
  INSERT INTO public.lesson_blocks (lesson_id, kind, content, order_index)
  SELECT id,'text','الذكاء الاصطناعي هو قدرة الحاسوب على القيام بمهام تتطلب عادةً ذكاءً بشريًا: الفهم، التمييز، الترجمة، واتخاذ القرار. لا يوجد "وعي" داخل الآلة — بل أنماط رياضية تعلّمتها من كميات هائلة من البيانات.',0 FROM ls WHERE slug='what-is-ai'
  UNION ALL SELECT id,'text','عندما يقترح عليك هاتفك الكلمة التالية، أو يتعرّف على وجهك، أو يرشّح لك فيديو — كل ذلك ذكاء اصطناعي يعمل بصمت.',1 FROM ls WHERE slug='what-is-ai'
  UNION ALL SELECT id,'note','القاعدة الذهبية: الذكاء الاصطناعي أداة تضاعف قدرتك، لا تستبدلها. من يتقن استخدامه يسبق الجميع.',2 FROM ls WHERE slug='what-is-ai'
  UNION ALL SELECT id,'text','في كل يوم تستعمل الذكاء الاصطناعي عشرات المرات: فلترة الرسائل المزعجة، خرائط تحسب أسرع طريق، كاميرا تحسّن صورك، ومساعد صوتي يفهم كلامك.',0 FROM ls WHERE slug='ai-in-daily-life'
  UNION ALL SELECT id,'text','الفرق بين مستخدم عادي ومستخدم محترف هو الوعي: أن تعرف متى تستعمل الأداة المناسبة، وكيف تصوغ طلبك بوضوح.',1 FROM ls WHERE slug='ai-in-daily-life'
  UNION ALL SELECT id,'text','تتعلّم النماذج عبر ثلاث خطوات: جمع بيانات ← تدريب لاكتشاف الأنماط ← تنبؤ بنتيجة جديدة. كلما كانت البيانات أنظف وأكثر تنوعًا، كان النموذج أدق.',0 FROM ls WHERE slug='how-models-learn'
  UNION ALL SELECT id,'note','بيانات سيئة = نموذج سيئ. هذه أهم قاعدة في مجال التعلّم الآلي.',1 FROM ls WHERE slug='how-models-learn'
  UNION ALL SELECT id,'text','النموذج اللغوي الكبير (LLM) يتنبّأ بالكلمة التالية اعتمادًا على السياق. تدرَّب على مليارات النصوص حتى صار قادرًا على الكتابة والشرح والبرمجة.',0 FROM ls WHERE slug='llm-basics'
  UNION ALL SELECT id,'text','لأنه يتنبّأ ولا "يعلم"، قد يخطئ بثقة. لذلك تحقّق دائمًا من المعلومات الحسّاسة.',1 FROM ls WHERE slug='llm-basics'
  UNION ALL SELECT id,'text','إطار CRISP: السياق (Context)، الدور (Role)، التعليمة (Instruction)، التفاصيل (Specifics)، الصقل (Polish). كل عنصر يقلّل الغموض ويرفع جودة النتيجة.',0 FROM ls WHERE slug='prompt-crisp'
  UNION ALL SELECT id,'code','[Context] أنا طالب أتعلّم الذكاء الاصطناعي.
[Role] تصرّف كمعلّم خبير ومبسّط.
[Instruction] اشرح لي مفهوم التعلّم العميق.
[Specifics] في 5 نقاط، بلغة عربية بسيطة، مع مثال واقعي.
[Polish] اختم بسؤال يختبر فهمي.',1 FROM ls WHERE slug='prompt-crisp'
  UNION ALL SELECT id,'text','أشهر الأخطاء: أمر غامض بلا سياق، طلب طويل يخلط عدة مهام، وعدم تحديد شكل المخرجات (قائمة؟ جدول؟ عدد الكلمات؟).',0 FROM ls WHERE slug='prompt-mistakes'
  UNION ALL SELECT id,'note','حدّد دائمًا: من أنت، ماذا تريد، وبأي شكل تريده.',1 FROM ls WHERE slug='prompt-mistakes'
  RETURNING id
), q AS (
  INSERT INTO public.questions (lesson_id, prompt, explanation, xp, order_index)
  SELECT id,'ما هو التعريف الأدق للذكاء الاصطناعي؟','الذكاء الاصطناعي أنظمة تتعلّم أنماطًا من البيانات لأداء مهام تتطلب ذكاءً.',15,0 FROM ls WHERE slug='what-is-ai'
  UNION ALL SELECT id,'أي مما يلي ليس مثالًا على الذكاء الاصطناعي؟','الآلة الحاسبة تنفّذ عملية ثابتة بلا تعلّم من بيانات.',15,1 FROM ls WHERE slug='what-is-ai'
  UNION ALL SELECT id,'أي خدمة يومية تعتمد على الذكاء الاصطناعي؟','ترشيحات الفيديو تُبنى على نماذج تتعلّم من سلوكك.',15,0 FROM ls WHERE slug='ai-in-daily-life'
  UNION ALL SELECT id,'ما ترتيب مراحل تعلّم النموذج؟','البيانات أولًا، ثم التدريب، ثم التنبؤ.',15,0 FROM ls WHERE slug='how-models-learn'
  UNION ALL SELECT id,'ماذا يفعل النموذج اللغوي أساسًا؟','يتنبّأ بالكلمة التالية بناءً على السياق.',15,0 FROM ls WHERE slug='llm-basics'
  UNION ALL SELECT id,'ماذا يمثّل حرف S في إطار CRISP؟','Specifics أي التفاصيل: الطول، الشكل، اللغة، المثال.',20,0 FROM ls WHERE slug='prompt-crisp'
  UNION ALL SELECT id,'ما أكبر خطأ في كتابة الأوامر؟','الغموض وغياب السياق يجعلان النتيجة عامة وضعيفة.',15,0 FROM ls WHERE slug='prompt-mistakes'
  RETURNING id, lesson_id, order_index
)
INSERT INTO public.question_options (question_id, label, is_correct, order_index)
SELECT q.id, o.label, o.correct, o.idx
FROM q
JOIN LATERAL (
  SELECT * FROM (VALUES
    ('what-is-ai',0,'أنظمة تتعلّم أنماطًا من البيانات لأداء مهام ذكية',true,0),
    ('what-is-ai',0,'روبوت بشري يمتلك وعيًا',false,1),
    ('what-is-ai',0,'برنامج يعمل بلا كهرباء',false,2),
    ('what-is-ai',0,'نوع من أنواع الإنترنت',false,3),
    ('what-is-ai',1,'الآلة الحاسبة البسيطة',true,0),
    ('what-is-ai',1,'المساعد الصوتي',false,1),
    ('what-is-ai',1,'التعرّف على الوجه',false,2),
    ('what-is-ai',1,'الترجمة الآلية',false,3),
    ('ai-in-daily-life',0,'ترشيحات الفيديوهات',true,0),
    ('ai-in-daily-life',0,'مصباح الغرفة',false,1),
    ('ai-in-daily-life',0,'المروحة الكهربائية',false,2),
    ('ai-in-daily-life',0,'الساعة الرملية',false,3),
    ('how-models-learn',0,'بيانات ← تدريب ← تنبؤ',true,0),
    ('how-models-learn',0,'تنبؤ ← بيانات ← تدريب',false,1),
    ('how-models-learn',0,'تدريب ← تنبؤ ← بيانات',false,2),
    ('how-models-learn',0,'لا يحتاج بيانات إطلاقًا',false,3),
    ('llm-basics',0,'يتنبّأ بالكلمة التالية حسب السياق',true,0),
    ('llm-basics',0,'يبحث في الإنترنت لحظيًا دائمًا',false,1),
    ('llm-basics',0,'يخزّن كل الصفحات كما هي',false,2),
    ('llm-basics',0,'يعمل بقواعد يدوية فقط',false,3),
    ('prompt-crisp',0,'Specifics — التفاصيل',true,0),
    ('prompt-crisp',0,'Speed — السرعة',false,1),
    ('prompt-crisp',0,'Style — النمط فقط',false,2),
    ('prompt-crisp',0,'Search — البحث',false,3),
    ('prompt-mistakes',0,'الغموض وغياب السياق',true,0),
    ('prompt-mistakes',0,'استخدام لغة عربية',false,1),
    ('prompt-mistakes',0,'تحديد عدد النقاط',false,2),
    ('prompt-mistakes',0,'إعطاء مثال',false,3)
  ) AS v(slug, qidx, label, correct, idx)
) o ON o.qidx = q.order_index
JOIN public.lessons le ON le.id = q.lesson_id AND le.slug = o.slug;