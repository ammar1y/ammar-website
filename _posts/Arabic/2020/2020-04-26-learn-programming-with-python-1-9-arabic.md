---
layout: post_ar
title: "تعلم البرمجة بلغة بايثون - الدرس التاسع: تحويل أنواع البيانات في بايثون"
date: 2020-04-26
categories: [دورة-تعلم-البرمجة-بلغة-بايثون] 
tags: [بايثون, برمجة, لغات-برمجة, تعلم-البرمجة, البرمجة-للمبتدئين, تعلم-البرمجة-بالعربي]
postlang: arabic 
permalink: "/ar/:year/learn-programming-with-python-1-9-arabic"
sharing-img: "/assets/images/2020/pyc-9-1.png"
---

![تعلم البرمجة بلغة بايثون - الدرس التاسع: تحويل أنواع البيانات في بايثون](/assets/images/2020/pyc-9-1.png)

في هذا الدرس سنتعرف على كيفية تحويل أنواع البيانات في بايثون وسنرى متى سنحتاج إلى ذلك في برامجنا.

### تحويل أنواع البيانات (Data-Type Conversion)

توفر بايثون لنا دوالاً تمكننا من تحويل نوع البيانات، فمثلاً يمكننا تحويل عدد صحيح إلى عشري أو العكس:

```python
>>> x = 3
>>> float(x)
3.0
>>> y = 4.5
>>> int(y)
4
```

في السطر الأول قمنا بتعريف متغير اسمه `x` ووضعنا فيه العدد الصحيح `3`؛ في هذه الحالة فإن نوع `x` سيكون `int`. ثم في السطر الثاني قمنا بتحويل نوع المتغير إلى `float` باستخدام الدالة المسماة `float()` ونرى أن الناتج هو `3.0`. صحيح أن `3` يساوي في الحقيقة `3.0` لكن نوعهما مختلفان بالنسبة لبايثون: عندما تضيف الفاصلة العشرية لرقم يصبح نوعه `float`. 

في السطر الثالث قمنا بتعريف متغير اسمه `y` ووضعنا فيه عدداً عشرياً قيمته `4.5` وهذا سيجعل `y` من نوع `float`. في السطر الرابع قمنا بتحويل نوع هذا المتغير إلى عدد صحيح `int` باستخدام الدالة المسماة `int()` وكان ناتج التحويل `4` حيث أن دالة `int()` تقوم بأخذ الرقم الذي على يسار الفاصلة العشرية وتترك ما على يمينها.

أيضاً يمكننا استخدام الدوال `int()` و `float()` لتحويل السلاسل النصية إلى أرقام. لماذا قد نحتاج لذلك؟ لأنه في الكثير من الأحيان عندما تستقبل برامجنا بيانات من مصادر خارجية مثل الانترنت - كما سنرى لاحقاً - فإن هذه البيانات تأتي على شكل سلاسل نصية حتى لو كانت في حقيقتها تعبر عن أرقام. مثلاً:

```python
>>> str_val = "123"
>>> type(str_val)
str
>>> print(str_val + 3)
```

في السطر الأول نعرف متغيراً اسمه `str_val` ونضع فيه سلسلة نصية هي `"123"`. لاحظ أن السلسلة تحوي أرقاماً ولكن بايثون تعاملها كنص كما تعامل `"abc"` بالضبط. لدلك عندما نحاول جمع هذه السلسلة النصية والرقم `3` في السطر الأخير فإن بايثون ستخبرنا بأن خطأ وقع يشبه الخطأ الذي رأيناه في الأعلى.فبايثون لا تكترث إذا كانت السلسلة النصية تحتوي أرقاماً أو أحرفاً؛ المهم أنها سلسلة نصية، فعندما تحاول جمع رقم مع سلسلة نصية فإن بايثون ستواجه خطأ في التنفيذ.

لذلك إذا أردنا التعامل مع الرقم الموجود في هذه السلسلة النصية كرقم وليس كنص فعلينا استخدام الدالة `int()` لتحويل هذه السلسلة إلى رقم صحيح كالتالي:

```python
>>> int_val = int(str_val)
>>> type(int_val)
int
>>> print(int_val + 3)
126
```

في السطر الأول حولنا السلسلة النصية إلى عدد صحيح ثم في السطر الأخير أضفنا `3` إليه وكان الناتج `126`.

لكن هناك أمر يجب التنبه له وهو أنه يجب أن تحتوي السلسلة النصية فقط على رقم حتى تستطيع تحويل نوعها باستخدام `int()` أو `float()`. في المثال التالي نقوم بمحاولة تحويل سلسلة نصية إلى رقم:

```python
es = 'hello'
es = int(es)
```

عندما تقوم بايثون بتنفيذ السطر الثاني فستواجه خطأ لأن السلسلة `es` لا تحتوي على أرقام.

أخيراً: فإنه يمكن تحويل الأرقام الصحيحة والعشرية إلى سلاسل نصية باستخدام دالة `str()`. نحتاج إلى ذلك عندما نريد إدراج رقم في داخل نص موجود لدينا كما سنرى في العديد من الأمثلة مستقبلاً إن شاء الله. مثال:

```python
>>> num = 13
>>> s = str(num)
>>> type(s)
'str'
>>> 'Your age is: ' + s
'Your age is: 13'
```

### ملاحظات

عندما تجمع عدد صحيح وعدد عشري في بايثون فإن الناتج سيكون عدداً عشرياً وعندما تقسم عدداً على أي عدد آخر فإن الناتج سيكون أيضاً عدداً عشرياً (float):

```python
>>> 123 + 45.2
168.2
>>> 4 / 2
2.0
```

## فيديو الدرس

<iframe width="560" height="315" src="https://www.youtube.com/embed/qbMZMkEb_As" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

