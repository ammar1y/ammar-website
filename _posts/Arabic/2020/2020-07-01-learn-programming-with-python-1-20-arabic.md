---
layout: post_ar
title: "تعلم البرمجة بلغة بايثون #20: الحلقات في بايثون Loops in Python: continue and break"
date: 2020-07-01
categories: [دورة-تعلم-البرمجة-بلغة-بايثون] 
tags: [بايثون, برمجة, لغات-برمجة, تعلم-البرمجة, البرمجة-للمبتدئين, تعلم-البرمجة-بالعربي]
postlang: arabic 
permalink: "/ar/:year/learn-programming-with-python-1-20-arabic"
sharing-img: "/assets/images/2020/pyc-20-1.png"
---

![تعلم البرمجة بلغة بايثون #20"](/assets/images/2020/pyc-20-1.png)

في هذا الدرس سنكمل حديثنا عن الحلقات في بايثون ونتحدث عن كلمتي break و continue وطريقة استخدامهما في الحلقات.

## تعليمة كسر الحلقة: break

هناك كلمة في بايثون يمكن أن نضعها داخل الحلقات. عندما يصل البرنامج إلى هذه الكلمة يتم الخروج مباشرة من الحلقة. هذه الكلمة هي `break`. لننظر إلى المثال التالي:

```python
while True:
  line = input()
  if line == 'قف':
    break
  print(line)
print('انتهى')
```

عندما ننظز إلى هذا المثال نرى حلقة تبدو لانهائية لأن شرط الحلقة هو `True` كما رأينا قبل قليل. ماذا يفعل هذا البرنامج؟ عندما يدخل البرنامج في حلقة `while` والتي نفترض أن تنفيذها سيستمر بلا توقف لأن شرطها `True`، عندما يدخل البرنامج هذه الحلقة يقرأ إدخالاً من المستخدم باستخدام الدالة `input` ويقوم بتخزين ما يقرؤه من المستخدم في متغير اسمه `line`. ثم يفحص ما أدخله المستخدم باستخدام `if`: إذا أدخل المستخدم كلمة "قف" سيواجه البرنامج كلمة `break` ويخرج من الحلقة مباشرة. أما إذا أدخل المستخدم أي شيء آخر سيطبع ما أدخله المستخدم ثم سيكرر تعليمات الحلقة ويقرأ منه إدخالاً آخراً ويستمر في تكرار الحلقة حتى يدخل المستخدم كلمة "قف". 

إذن `break` يمكن أن تستعمل مع الحلقات لتكرير تنفيذ مجموعة من التعليمات حتى يتحقق الشرط الذي نريده. هذا يمكن أن يكون له تطبيقات مفيدة في برامجك لاحقاً.

## تعليمة continue

هناك تعليمة أخرى تستعمل مع الحلقات وهي تعليمة `continue`. ماذا تفعل هذه التعليمة؟ هذه التعليمة تتخطى التكرار الحالي وتنتقل للتكرار التالي في الحلقة. سنرى مثالاً لتوضيحها.

```python
while True:
  line = input()
  if line[0] == '#':
    continue
  if line == 'قف':
    break
  print(line)
print('انتهى')
```

هذا المثال مشابه للمثال الذي رأيناه عندما تكلمنا عن `break`. الزيادة في هذا المثال هي:

```python
if line[0] == '#':
    continue
```

كما في مثال `break`: في هذا المثال يستمر البرنامج بقراءة إدخال من المستخدم ويطبع هذا الإدخال حتى يدخل المستخدم كلمة "قف". عندها يخرج البرنامج من الحلقة ويطبع "انتهى". لكن الزيادة هنا أنه إذا أدخل المستخدم شيئاً يبدأ بهذا الرمز: "#" فإن البرنامج يتجاوز بقية التعليمات داخل الحلقة ويعود إلى بداية الحلقة مرة أخرى، يعني عندما يرى البرنامج كلمة `continue` يقفز مباشرة إلى بداية الحلقة، إلى شرط الحلقة.

لاحظ أننا استخدمنا `line[0]` للوصول إلى أول حرف من النص الذي أدخله المستخدم. سنتعلم لاحقاً المزيد عن هذا الأمر.

إذن `break` تخرج من الحلقة إلى التعليمة التي بعد الحلقة. `continue` تخرج لتعود إلى بداية الحلقة (شرط الحلقة).

## فيديو الدرس

<iframe width="560" height="315" src="https://www.youtube.com/embed/qh5cmgraNO4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

