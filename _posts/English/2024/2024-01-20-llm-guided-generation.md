---
layout: post
title: "Guided Generation with LLMs: How to Fully Control LLM Outputs"
date: 2025-01-20
categories: [data-science, machine-learning, nlp] 
tags: [llm, guided-generation, llama, mistral]
permalink: "/:year/Guided-Generation-with-LLMs-How-to-Fully-Control-LLM-Outputs"
sharing-img: "/assets/images/2024/the-hundre-years-war-cover.jpeg"
---

Large Language Models (LLMs) have revolutionized the AI world in the past few months. There are commercial LLMs like OpenAI's GPT-4 and Anthropic's Claude 2.1, and there are open-source LLMs like Llama 2 and Mistral families. 

With OpenAI's models, you can control the output to some extent using [function calling](https://platform.openai.com/docs/guides/function-calling) and get structured data back from the models.

However, with many open-source LLMs, you can have greater control over the outputs. In this post, I will show you how to fully control the outputs of LLMs using a technique called Guided Generation.

## What is Guided Generation?

Guided generation in large language models (LLMs) is an advanced approach that allows you to steer the model to generate text in the format and patterns you need. This method involves guiding the language model's text generation using specific techniques like regular expressions, JSON schemas, context-free grammars, etc. 

With guided generation, you can be sure that the LLM will adhere to your predefined patterns or structures, enhancing both its relevance and accuracy.

Bear with me, everything will be clear when you see the examples below.

## Tools for Guided Generation

Luckily we have many open-source tools that support guided generation, and most of them are actively maintained. Below are the most prominent ones at the time of writing this post.

### Guidance by guidance-ai

| # of stars | # of commits | # of contributors | last updated |
|:----------:|:------------:|:-----------------:|:------------:|
| 15.8K      | 1,144        | 53                | 5 days ago   |

[Guidance on Github](https://github.com/guidance-ai/guidance)

- It allows users to constrain generation (e.g. with regex and CFGs) as well as to **interleave control (conditional, loops) and generation seamlessly**.

- Compatible with Transformers, llama.cpp, VertexAI, and OpenAI models.

#### Examples

```python
from guidance import models, gen

lm = models.LlamaCpp("path/to/llama2.gguf", n_gpu_layers=-1, n_ctx=4096)

# capture our selection under the name 'answer'
lm = lm + f"Do you want a joke or a poem? A {select(['joke', 'poem'], name='answer')}.\n"

# make a choice based on the model's previous selection
if lm["answer"] == "joke":
    lm += f"Here is a one-line joke about cats: " + gen('output', stop='\n')
else:
    lm += f"Here is a one-line poem about dogs: " + gen('output', stop='\n')
```

which will output something like:

```
Who won the last Kentucky derby and by how much?

The last Kentucky Derby was held on
```

```python
from guidance import models, gen

lm = models.LlamaCpp("path/to/llama2.gguf", n_gpu_layers=-1, n_ctx=4096)

@guidance
def qa_bot(lm, query):
    lm += f'''\
    Q: {query}
    Now I will choose to either SEARCH the web or RESPOND.
    Choice: {select(["SEARCH", "RESPOND"], name="choice")}
    '''
    if lm["choice"] == "SEARCH":
        lm += "A: I don't know, Google it!"
    else:
        lm += f'A: {gen(stop="Q:", name="answer")}'
    return lm

query = "Who won the last Kentucky derby and by how much?"
lm + qa_bot(query)
```

which will output something like:

```
Q: Who won the last Kentucky derby and by how much?
Now I will choose to either SEARCH the web or RESPOND.
Choice: SEARCH
A: I don't know, Google it!
```

Notice how you can mix model generations with Python logic. For example, model selection between "SEARCH" and "RESPOND" is saved in `choice` variable, then it's used to decide what to do next. This can be a powerful feature that allows seamless integration of LLMs within your code.


### Outlines by outlines-dev

| # of stars | # of commits | # of contributors | last updated |
|:----------:|:------------:|:-----------------:|:------------:|
| 15.8K      | 1,144        | 53                | 5 days ago   |

[Outlines on Github](https://github.com/outlines-dev/outlines)

- Allows you to control model outputs using a Pydantic model or a JSON schema.
- Compatible with OpenAI, transformers, llama.cpp, exllama2, and mamba models.

#### Examples

```python
import outlines

model = outlines.models.transformers("mistralai/Mistral-7B-v0.1")

generator = outlines.generate.choice(model, ["Blue", "Red", "Yellow"])

color = generator("What is the closest color to Indigo? ")
print(color)
```

which will output something like:

```
Blue
```

```python
from enum import Enum
from pydantic import BaseModel, constr, conint

import outlines

class Armor(str, Enum):
    leather = "leather"
    chainmail = "chainmail"
    plate = "plate"


class Character(BaseModel):
    name: constr(max_length=10)
    age: conint(gt=18, lt=99)
    armor: Armor
    strength: conint(gt=1, lt=100)

model = outlines.models.transformers("mistralai/Mistral-7B-v0.1")
generator = outlines.generate.json(model, Character)

character = generator(
    "Generate a new character for my awesome game: "
    + "name, age (between 1 and 99), armor and strength. "
    )
print(character)
```

which will output something like:

```
name='Orla' age=21 armor=<Armor.plate: 'plate'> strength=8
```

