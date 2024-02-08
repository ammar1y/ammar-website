---
layout: post
title: "Guided Generation with LLMs: How to Fully Control LLM Outputs"
date: 2025-02-07
categories: [data-science, machine-learning] 
tags: [llm, guided-generation, llama, mistral]
permalink: "/:year/Guided-Generation-with-LLMs-How-to-Fully-Control-LLM-Outputs"
sharing-img: "/assets/images/2024/llm-guided-gen-img.jpeg"
---

<img src="/assets/images/2024/llm-guided-gen-img.jpeg" style="max-width:800px">

Large Language Models (LLMs) have revolutionized the AI world in the past few months. There are commercial LLMs like OpenAI's GPT-4 and Anthropic's Claude 2.1, and there are open-source LLMs like Llama 2 and Mistral families. 

With OpenAI's models, you can control the output to some extent using [function calling](https://platform.openai.com/docs/guides/function-calling) and get structured data back from the models.

However, with many open-source LLMs, you can have greater control over the outputs. In this post, I will talk about great libraries that can be used to fully control the outputs of LLMs using what we can call "guided generation."

If you want to see my conclusion and the tool I ended up using, you can skip to the end of the post.

## What is Guided Generation?

Guided generation in large language models (LLMs) is an advanced approach that allows you to steer the model to generate text in the format and patterns you need. This method involves guiding the language model's text generation using specific techniques like regular expressions, JSON schemas, context-free grammars, etc. 

With guided generation, you can be sure that the LLM will adhere to your predefined patterns or structures, enhancing both its relevance and accuracy.

Bear with me, everything will be clear when you see the examples below.

## Tools for Guided Generation

Luckily we have many open-source tools that support guided generation, and most of them are actively maintained. Below are the most prominent ones at the time of writing this post.

### Guidance by guidance-ai

| # of stars | # of commits | # of contributors |
|:----------:|:------------:|:-----------------:|
| 16.1K      | 1,177        | 54                |

[Guidance on Github](https://github.com/guidance-ai/guidance)


- It allows users to constrain generation (e.g. with regex and CFGs) as well as to **interleave control (conditional, loops) and generation seamlessly**.
- Compatible with Transformers, llama.cpp, VertexAI, and OpenAI.


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

| # of stars | # of commits | # of contributors |
|:----------:|:------------:|:-----------------:|
| 4.4K      | 483           | 51                |

[Outlines on Github](https://github.com/outlines-dev/outlines)

- Allows you to control model outputs using a Pydantic model or a JSON schema.
- Compatible with OpenAI, transformers, llama.cpp, exllama2, and mamba.

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

### llama.cpp with Grammars

Llama.cpp is one of the most popular LLM libraries out there. Its development is very active with hundreds of contributors. Its main goal is to "enable LLM inference with minimal setup and state-of-the-art performance on a wide variety of hardware - locally and in the cloud".


| # of stars | # of commits | # of contributors |
|:----------:|:------------:|:-----------------:|
| 50.4K      | 2,092        | 555                |

[llama.cpp on Github](https://github.com/ggerganov/llama.cpp)

- Compatible with many models and their finetunes like: LLaMA 2, Mistral 7B, Yi models, Qwen models, etc. Basically, it works with models in GGUF format which is a format available for almost all models.
- It has bindings for Python, Go, Node.js, and many other languages.
- Robust with many other libraries and tools built on top of it.

llama.cpp supports guided generation to constrain the model's output using [GBNF grammars](https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md). GBNF is a grammar format that allows you to define the structure of the output you want to generate. GBNF might seem intimidating at first, but after you understand its syntax and go through some examples, you will find that it's not that complex really. 

#### Example

The following quick example shows how to guide the model to generate output in the format of a list.


```python
from llama_cpp import Llama, LlamaGrammar

llm = Llama(
      model_path="mistral-7b-instruct-v0.2.Q4_K_M.gguf",
      n_gpu_layers=-1
)

grammar = LlamaGrammar.from_string(
"""
# a grammar for lists
root ::= ("- " item)+
item ::= [^\n]+ "\n"
""".strip()
)

output = llm(
      "List the names of some deep learning architectures.",
      max_tokens=64,
      temperature=0.5,
      grammar=grammar
) 
```

It will output something like:

```
- Convolutional Neural Networks (CNN)
- Recurrent Neural Networks (RNN)
- Long Short-Term Memory (LSTM)
- Autoencoder
- Generative Adversarial Networks (GAN)
```

### Other Tools and Approaches

The above tools are the ones that I used extensively and they are the most popular. But there are other tools that might be useful too:

- [LMQL](https://github.com/eth-sri/lmql) from SRI Lab at ETH Zurich. It "offers a novel way of interweaving traditional programming with the ability to call LLMs in your code."
- [SGLang](https://github.com/sgl-project/sglang) from sgl-project.

Other than using these tools to force the model to generate text in a specific format, there is an alternative approach I've seen in some projects. It's about using a powerful model that you instruct in the prompt to respond in a given format. You might provide some examples in the prompt as well. Then you parse the output to make sure it's in the format you need. If not, you prompt the model to generate again, and so on.

## Conclusion

Based on my experience with the three tools above (Guidance, Outlines, and llama.cpp), I ended up using **llama.cpp** for two main reasons:

1. I found llama.cpp to be more robust and reliable. I encountered some bugs with Guidance and Outlines. For example, I encountered an issue with Outlines that made generation fail randomly. I'm sure the maintainers will fix the issues, but with llama.cpp, I didn't encounter any bugs.

2. llama.cpp is very active and has a large community. It's the most starred LLM library on Github as far as I know. It has a lot of contributors and it's being used by many projects. This means that it's more likely to be maintained and improved in the future.

Plus llama.cpp is pretty fast (especially in the latest releases) and the GBNF grammar offers a lot of flexibility to guide the model's output.