---
layout: page
permalink: /tags/
title: "Tags"
lang: "english"
---

{% for tag in site.tags %}
{% assign tag_fl = tag[0] | slice: 0 %}
{% if tag_fl < "z" %}
<div id="{{ tag[0] }}"></div>
  <h3>{{ tag[0] | capitalize | replace: "-", " "}}</h3>
  <a name="{{ tag[0] }}"></a>
  <ul>
    {% for post in tag[1] %}
      <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
  </ul>
  {% endif %}
{% endfor %}