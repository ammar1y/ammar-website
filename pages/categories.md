---
layout: page
title: Categories
permalink: /categories/
lang: "english"
order: "a1"
---

{% for category in site.categories %}
{% assign cat_fl = category[0] | slice: 0 %}
{% if cat_fl < "z" %}
<div id="{{ category[0] }}"></div>
  <h3>{{ category[0] | capitalize | replace: "-", " "}}</h3>
  <a name="{{ category[0] }}"></a>
  <ul>
    {% for post in category[1] %}
      <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
  </ul>
  {% endif %}
{% endfor %}