---
layout: post
title: "Revolution in Pixels: Comparing the Top AI Image Generation Models"
date: 2024-02-07
categories: [data-science, machine-learning] 
tags: [midjourney, stable diffusion, dalle]
permalink: "/:year/Revolution-in-Pixels-Comparing-the-Top-AI-Image-Generation-Models"
sharing-img: "/assets/images/2024/img-gen-comp-cover.jpeg"
---

<style>
hr {
    margin-top: 2rem;
    margin-bottom: 2rem;
    border: 0;
    /* border-top: 10px solid #bbb; */
    height: 12px;
    background: linear-gradient(to right, #6e40aa,#7140ab,#743fac,#773fad,#7a3fae,#7d3faf,#803eb0,#833eb0,#873eb1,#8a3eb2,#8d3eb2,#903db2,#943db3,#973db3,#9a3db3,#9d3db3,#a13db3,#a43db3,#a73cb3,#aa3cb2,#ae3cb2,#b13cb2,#b43cb1,#b73cb0,#ba3cb0,#be3caf,#c13dae,#c43dad,#c73dac,#ca3dab,#cd3daa,#d03ea9,#d33ea7,#d53ea6,#d83fa4,#db3fa3,#de3fa1,#e040a0,#e3409e,#e5419c,#e8429a,#ea4298,#ed4396,#ef4494,#f14592,#f34590,#f5468e,#f7478c,#f9488a,#fb4987,#fd4a85,#fe4b83,#ff4d80,#ff4e7e,#ff4f7b,#ff5079,#ff5276,#ff5374,#ff5572,#ff566f,#ff586d,#ff596a,#ff5b68,#ff5d65,#ff5e63,#ff6060,#ff625e,#ff645b,#ff6659,#ff6857,#ff6a54,#ff6c52,#ff6e50,#ff704e,#ff724c,#ff744a,#ff7648,#ff7946,#ff7b44,#ff7d42,#ff8040,#ff823e,#ff843d,#ff873b,#ff893a,#ff8c38,#ff8e37,#fe9136,#fd9334,#fb9633,#f99832,#f89b32,#f69d31,#f4a030,#f2a32f,#f0a52f,#eea82f,#ecaa2e,#eaad2e,#e8b02e,#e6b22e,#e4b52e,#e2b72f,#e0ba2f,#debc30,#dbbf30,#d9c131,#d7c432,#d5c633,#d3c934,#d1cb35,#cece36,#ccd038,#cad239,#c8d53b,#c6d73c,#c4d93e,#c2db40,#c0dd42,#bee044,#bce247,#bae449,#b8e64b,#b6e84e,#b5ea51,#b3eb53,#b1ed56,#b0ef59,#adf05a,#aaf159,#a6f159,#a2f258,#9ef258,#9af357,#96f357,#93f457,#8ff457,#8bf457,#87f557,#83f557,#80f558,#7cf658,#78f659,#74f65a,#71f65b,#6df65c,#6af75d,#66f75e,#63f75f,#5ff761,#5cf662,#59f664,#55f665,#52f667,#4ff669,#4cf56a,#49f56c,#46f46e,#43f470,#41f373,#3ef375,#3bf277,#39f279,#37f17c,#34f07e,#32ef80,#30ee83,#2eed85,#2cec88,#2aeb8a,#28ea8d,#27e98f,#25e892,#24e795,#22e597,#21e49a,#20e29d,#1fe19f,#1edfa2,#1ddea4,#1cdca7,#1bdbaa,#1bd9ac,#1ad7af,#1ad5b1,#1ad4b4,#19d2b6,#19d0b8,#19cebb,#19ccbd,#19cabf,#1ac8c1,#1ac6c4,#1ac4c6,#1bc2c8,#1bbfca,#1cbdcc,#1dbbcd,#1db9cf,#1eb6d1,#1fb4d2,#20b2d4,#21afd5,#22add7,#23abd8,#25a8d9,#26a6db,#27a4dc,#29a1dd,#2a9fdd,#2b9cde,#2d9adf,#2e98e0,#3095e0,#3293e1,#3390e1,#358ee1,#378ce1,#3889e1,#3a87e1,#3c84e1,#3d82e1,#3f80e1,#417de0,#437be0,#4479df,#4676df,#4874de,#4a72dd,#4b70dc,#4d6ddb,#4f6bda,#5169d9,#5267d7,#5465d6,#5663d5,#5761d3,#595fd1,#5a5dd0,#5c5bce,#5d59cc,#5f57ca,#6055c8,#6153c6,#6351c4,#6450c2,#654ec0,#664cbe,#674abb,#6849b9,#6a47b7,#6a46b4,#6b44b2,#6c43af,#6d41ad,#6e40aa); 
}

div.note {
    padding: 1.2rem 1.3rem;
    background-color: #f1ecc3;
    border: 1px solid #867221;
}
</style>

<img src="/assets/images/2024/img-gen-comp-cover.jpeg" style="max-width:800px; width:100%">

Did you know that AI can now create images that are indistinguishable from those taken by top photographers or created by great designers? Not all AI models are created equal in this regard, this post aims to shed light on those that truly stand out in the world of image generation.

AI image generation started to take off in January 2022 when OpenAI launched their DALLE-2 model, then Midjourney launched their V4 model and Stability AI introduced and open-sourced Stable Diffusion 1.5. Those were all good models that shocked the world with their capabilities. 

But things got really exciting in 2023 with OpenAI's DALLE-3, Midjourney's V5 then V6, and Stable Diffusion's SDXL. 

In this post, I'll compare **Midjourney V6, Midjourney V5.2, DALLE-3, and SDXL**. I'll use different prompts (taken from public galleries) that cover many aspects, like photorealism, illustrations, imagining a new concept, logo creation, ability to show text, ability to follow details in the prompt. The comparison is comprised of **52 prompts**.

For each prompt, I'll score each model's generation out of 10, a score based on objective factors (like generation quality, following details, etc.) and subjective factors based on how I perceive the image and its aesthetics. I understand that the objective factors can have subjective elements as well, but at the end, these are just my scores :).

Note that for all the models I show 4 images per prompt except for SDXL where I show 1 image because it was faster for me to do it this way. After testing, I believe this approach doesn't compromise the quality or fairness of the comparison; when you use these models to generate multiple images, the images tend to be similar and of the same quality.

For the generation, for Midjourney models, I used their Discord interface. For DALLE-3, I used [Microsoft Image Creator](https://www.bing.com/images/create). For SDXL, I used [the official Stability AI's offering on Replicate](https://replicate.com/stability-ai/sdxl) with default settings except for steps (I used 60) and size (I used 1024 x 1024).

Feel free to skip to the [end of the post](#conclusion) to see the results, but I encourage you to take a look at the images and enjoy watching the magic of AI image generation.

Now **let's get started** with the comparison...

### Prompt #1

zen modern bauhaus abstract design with boho influence. Minimalistic and symmetrical, abundance of consistently-equal lines and only 1 shape, yellow-garnet and cream colour balance, spacious and breathability

### Midjourney V6 (8/10)

![gc-mj-1](/assets/images/2024/gc-mj-1.jpeg)

### Midjourney V5.2 (6/10)

![gc-mj5-1](/assets/images/2024/gc-mj5-1.jpeg)

### SDXL (3/10)

![gc-sdxl-1](/assets/images/2024/gc-sdxl-1.jpeg)

### DALLE-3 (5/10)

![gc-dl-1](/assets/images/2024/gc-dl-1.jpeg)

---

### Prompt #2

Sad alien smoking, sitting on a ground, An alien ship crashed into the ground, desert 

### Midjourney V6 (7/10)

![gc-mj-2](/assets/images/2024/gc-mj-2.jpeg)

### Midjourney V5.2 (6/10)

![gc-mj5-2](/assets/images/2024/gc-mj5-2.jpeg)

### SDXL (4/10)

![gc-sdxl-2](/assets/images/2024/gc-sdxl-2.jpeg)

### DALLE-3 (8/10)

![gc-dl-2](/assets/images/2024/gc-dl-2.jpeg)

---

### Prompt #3

minimalism ,a delicate golden sailboat, sailing on translucent jade water with fluorescent purple, 3D,fluorescent green, light blue, light green, gold accents,spathoid, color gradients, fusion, flowing water pattern shapes, overhead, ultra wide Angle, Bright colors, color art, detail UHD,16K

### Midjourney V6 (9.5/10)

![53-gc-mj6](/assets/images/2024/53-gc-mj6.jpeg)

### DALLE-3 (6.5/10)

![53-gc-dl](/assets/images/2024/53-gc-dl.jpeg)

---

### Prompt #4

fried egg flowers in the bacon garden shallow depth of field, highly detailed, high budget, bokeh, film grain, grainy

### Midjourney V6 (6/10)

![4-gc-mj6](/assets/images/2024/4-gc-mj6.jpeg)

### Midjourney V5.2 (5/10)

![4-gc-mj5](/assets/images/2024/4-gc-mj5.jpeg)

### SDXL (5/10)

![4-gc-sdxl](/assets/images/2024/4-gc-sdxl.jpeg)

### DALLE-3 (6/10)

![4-gc-dl](/assets/images/2024/4-gc-dl.jpeg)

---

### Prompt #5

Illuminated ("The moon, a silver boat, sails through the sea of stars, painting dreams on the night sky.":1.2) , Suffering, hillside, Cubism, side lit, Selective focus, Kodachrome, gilded technique, Batik

### Midjourney V6 (7/10)

![5-gc-mj6](/assets/images/2024/5-gc-mj6.jpeg)

### Midjourney V5.2 (8/10)

![5-gc-mj5](/assets/images/2024/5-gc-mj5.jpeg)

### SDXL (4/10)

![5-gc-sdxl](/assets/images/2024/5-gc-sdxl.jpeg)

### DALLE-3 (4/10)

![5-gc-dl](/assets/images/2024/5-gc-dl.jpeg)

---

### Prompt #6

circuitboard egyptian pyramid, ((focus))

### Midjourney V6 (9/10)

![6-gc-mj6](/assets/images/2024/6-gc-mj6.jpeg)

### Midjourney V5.2 (7/10)

![6-gc-mj5](/assets/images/2024/6-gc-mj5.jpeg)

### SDXL (5/10)

![6-gc-sdxl](/assets/images/2024/6-gc-sdxl.jpeg)

### DALLE-3 (8/10)

![6-gc-dl](/assets/images/2024/6-gc-dl.jpeg)

---

### Prompt #7

A man stands in the wilderness, blue dot light spinning, Vincent van Gogh's painting style, pointillism style, magnificent landscapes, illustrations, negative space, intagliography, art, minimalism

### Midjourney V6 (9/10)

![7-gc-mj6](/assets/images/2024/7-gc-mj6.jpeg)

### Midjourney V5.2 (8/10)

![7-gc-mj5](/assets/images/2024/7-gc-mj5.jpeg)

### SDXL (3/10)

![7-gc-sdxl](/assets/images/2024/7-gc-sdxl.jpeg)

### DALLE-3 (6/10)

![7-gc-dl](/assets/images/2024/7-gc-dl.jpeg)

---

### Prompt #8

An illustration of an avocado sitting in a therapist's chair, saying 'I just feel so empty inside' with a pit-sized hole in its center. The therapist, a spoon, scribbles notes.

### Midjourney V6 (6/10)

![8-gc-mj6](/assets/images/2024/8-gc-mj6.jpeg)

### Midjourney V5.2 (3/10)

![8-gc-mj5](/assets/images/2024/8-gc-mj5.jpeg)

### SDXL (3/10)

![8-gc-sdxl](/assets/images/2024/8-gc-sdxl.jpeg)

### DALLE-3 (8/10)

![8-gc-dl](/assets/images/2024/8-gc-dl.jpeg)

---

### Prompt #9

A 2D animation of a folk music band composed of anthropomorphic autumn leaves, each playing traditional bluegrass instruments, amidst a rustic forest setting dappled with the soft light of a harvest moon. 

### Midjourney V6 (6.5/10)

![9-gc-mj6](/assets/images/2024/9-gc-mj6.jpeg)

### Midjourney V5.2 (5/10)

![9-gc-mj5](/assets/images/2024/9-gc-mj5.jpeg)

### SDXL (2.5/10)

![9-gc-sdxl](/assets/images/2024/9-gc-sdxl.jpeg)

### DALLE-3 (10/10)

![9-gc-dl](/assets/images/2024/9-gc-dl.jpeg)

---

### Prompt #10

Photo of a lychee-inspired spherical chair, with a bumpy white exterior and plush interior, set against a tropical wallpaper.

### Midjourney V6 (8/10)

![10-gc-mj6](/assets/images/2024/10-gc-mj6.jpeg)

### Midjourney V5.2 (6.5/10)

![10-gc-mj5](/assets/images/2024/10-gc-mj5.jpeg)

### SDXL (4/10)

![10-gc-sdxl](/assets/images/2024/10-gc-sdxl.jpeg)

### DALLE-3 (9/10)

![10-gc-dl](/assets/images/2024/10-gc-dl.jpeg)

---

<div class="note">
Looking at the results of the 10 prompts above, I thought that I can proceed with Midjourney V6 and DALLE-3 only. SDXL generations seem ugly or very low quality compared to others. Midjourney V5.2 is almost always inferior to its successor (V6). So it makes sense to exclude these two for the rest of this comparison and focus on the top models.
</div>

### Prompt #11

An expressive oil painting of a basketball player dunking, depicted as an explosion of a nebula

### Midjourney V6 (8/10)

![11-gc-mj6](/assets/images/2024/11-gc-mj6.jpeg)

### DALLE-3 (8/10)

![11-gc-dl](/assets/images/2024/11-gc-dl.jpeg)

---

### Prompt #12

An ink sketch style illustration of a small hedgehog holding a piece of watermelon with its tiny paws, taking little bites with its eyes closed in delight.

### Midjourney V6 (7/10)

![12-gc-mj6](/assets/images/2024/12-gc-mj6.jpeg)

### DALLE-3 (8.5/10)

![12-gc-dl](/assets/images/2024/12-gc-dl.jpeg)

---

### Prompt #13

A vintage travel poster for Venus in portrait orientation. The scene portrays the thick, yellowish clouds of Venus with a silhouette of a vintage rocket ship approaching. Mysterious shapes hint at mountains and valleys below the clouds. The bottom text reads, 'Explore Venus: Beauty Behind the Mist'. The color scheme consists of golds, yellows, and soft oranges, evoking a sense of wonder.

### Midjourney V6 (5/10)

![13-gc-mj6](/assets/images/2024/13-gc-mj6.jpeg)

### DALLE-3 (7.5/10)

![13-gc-dl](/assets/images/2024/13-gc-dl.jpeg)

---

### Prompt #14

Tiny potato kings wearing majestic crowns, sitting on thrones, overseeing their vast potato kingdom filled with potato subjects and potato castles.

### Midjourney V6 (8/10)

![14-gc-mj6](/assets/images/2024/14-gc-mj6.jpeg)

### DALLE-3 (6.5/10)

![14-gc-dl](/assets/images/2024/14-gc-dl.jpeg)

---

### Prompt #15

A stylized portrait-oriented depiction where a tiger serves as the dividing line between two contrasting worlds. To the left, fiery reds and oranges dominate as flames consume trees. To the right, a rejuvenated forest flourishes with fresh green foliage. The tiger, depicted with exaggerated and artistic features, stands tall and undeterred, symbolizing nature’s enduring spirit amidst chaos and rebirth.

### Midjourney V6 (8.5/10)

![15-gc-mj6](/assets/images/2024/15-gc-mj6.jpeg)

### DALLE-3 (5.5/10)

![15-gc-dl](/assets/images/2024/15-gc-dl.jpeg)

---

### Prompt #16

A 3D render of a coffee mug placed on a window sill during a stormy day. The storm outside the window is reflected in the coffee, with miniature lightning bolts and turbulent waves seen inside the mug. The room is dimly lit, adding to the dramatic atmosphere.

### Midjourney V6 (8/10)

![16-gc-mj6](/assets/images/2024/16-gc-mj6.jpeg)

### DALLE-3 (7/10)

![16-gc-dl](/assets/images/2024/16-gc-dl.jpeg)

---

### Prompt #17

An illustration of a human heart made of translucent glass, standing on a pedestal amidst a stormy sea. Rays of sunlight pierce the clouds, illuminating the heart, revealing a tiny universe within. The quote 'Find the universe within you' is etched in bold letters across the horizon. 

### Midjourney V6 (7.5/10)

![17-gc-mj6](/assets/images/2024/17-gc-mj6.jpeg)

### DALLE-3 (7.5/10)

![17-gc-dl](/assets/images/2024/17-gc-dl.jpeg)

---

### Prompt #18

An antique botanical illustration drawn with fine lines and a touch of watercolour whimsy, depicting a strange lily crossed with a Venus flytrap, its petals poised as if ready to snap shut on any unsuspecting insects.

### Midjourney V6 (9/10)

![18-gc-mj6](/assets/images/2024/18-gc-mj6.jpeg)

### DALLE-3 (7/10)

![18-gc-dl](/assets/images/2024/18-gc-dl.jpeg)

---

### Prompt #19

A vibrant yellow banana-shaped couch sits in a cozy living room, its curve cradling a pile of colorful cushions. on the wooden floor, a patterned rug adds a touch of eclectic charm, and a potted plant sits in the corner, reaching towards the sunlight filtering through the window. 

### Midjourney V6 (8.5/10)

![19-gc-mj6](/assets/images/2024/19-gc-mj6.jpeg)

### DALLE-3 (7.5/10)

![19-gc-dl](/assets/images/2024/19-gc-dl.jpeg)

---

### Prompt #20

A minimalist, logo featuring a sleek and stylized black falcon head against a white background awesome, professional, vector logo, simple

### Midjourney V6 (10/10)

![20-gc-mj6](/assets/images/2024/20-gc-mj6.jpeg)

### DALLE-3 (8.5/10)

![20-gc-dl](/assets/images/2024/20-gc-dl.jpeg)

---

### Prompt #21

Create cool Asian Design red white black with tress and The Moon

### Midjourney V6 (10/10)

![21-gc-mj6](/assets/images/2024/21-gc-mj6.jpeg)

### DALLE-3 (6/10)

![21-gc-dl](/assets/images/2024/21-gc-dl.jpeg)

---

### Prompt #22

ornaments on a manuscript, cohesive colors of crimson and golden, geometry art, sacred ratios

### Midjourney V6 (10/10)

![22-gc-mj6](/assets/images/2024/22-gc-mj6.jpeg)

### DALLE-3 (7.5/10)

![22-gc-dl](/assets/images/2024/22-gc-dl.jpeg)

---

### Prompt #23

a chicken in a suit

### Midjourney V6 (10/10)

![23-gc-mj6](/assets/images/2024/23-gc-mj6.jpeg)

### DALLE-3 (8/10)

![23-gc-dl](/assets/images/2024/23-gc-dl.jpeg)

---

### Prompt #24

a real photo of a Luminescent radiant sun, black background 

### Midjourney V6 (9/10)

![24-gc-mj6](/assets/images/2024/24-gc-mj6.jpeg)

### DALLE-3 (8/10)

![24-gc-dl](/assets/images/2024/24-gc-dl.jpeg)

---

### Prompt #25

A man standing in the street, golden hour, 1990s

### Midjourney V6 (10/10)

![25-gc-mj6](/assets/images/2024/25-gc-mj6.jpeg)

### DALLE-3 (7/10)

![25-gc-dl](/assets/images/2024/25-gc-dl.jpeg)

---

### Prompt #26

STICKER, popping art, company building collage art, white background,.jpeg transparent, colorful, color shading

### Midjourney V6 (9/10)

![26-gc-mj6](/assets/images/2024/26-gc-mj6.jpeg)

### DALLE-3 (7.5/10)

![26-gc-dl](/assets/images/2024/26-gc-dl.jpeg)

---

### Prompt #27

mindface electrical diagram. Cellular marble cutaway by junji ito, Akira toriyama, Jean Leon Gerome

### Midjourney V6 (9.5/10)

![27-gc-mj6](/assets/images/2024/27-gc-mj6.jpeg)

### DALLE-3 (7/10)

![27-gc-dl](/assets/images/2024/27-gc-dl.jpeg)

---

### Prompt #28

Anthropomorphic lion wearing a ski jumpsuit and gloves standing in the snow

### Midjourney V6 (10/10)

![28-gc-mj6](/assets/images/2024/28-gc-mj6.jpeg)

### DALLE-3 (6/10)

![28-gc-dl](/assets/images/2024/28-gc-dl.jpeg)

---

### Prompt #29

a man in high-fashion campaign for Balmain jewelry, glittercore long exposure beauty shot in gigantic mirror prism, hundreds of reflections. Utilize 50mm lens, full-frame camera with a depth of field set to 16f and shutter speed at 4 seconds, dynamic compositions and storytelling, ensuring the scene captivates with both fashion finesse and narrative intrigue

### Midjourney V6 (10/10)

![29-gc-mj6](/assets/images/2024/29-gc-mj6.jpeg)

### DALLE-3 (6/10)

![29-gc-dl](/assets/images/2024/29-gc-dl.jpeg)

---

### Prompt #30

ultramodern minimal living room with colorful ammolite stone pattern floor, colorful ammolite stone pattern floor

### Midjourney V6 (10/10)

![30-gc-mj6](/assets/images/2024/30-gc-mj6.jpeg)

### DALLE-3 (7.5/10)

![30-gc-dl](/assets/images/2024/30-gc-dl.jpeg)

---

### Prompt #31

colorful dark baroque-inspired graphic fantasy novel illustration on rough paper, vintage poster style oil on canvas with expressive brush strokes and visible canvas weave texture minimalist cartoon illustration surrealism

### Midjourney V6 (8/10)

![31-gc-mj6](/assets/images/2024/31-gc-mj6.jpeg)

### DALLE-3 (6/10)

![31-gc-dl](/assets/images/2024/31-gc-dl.jpeg)

---

### Prompt #32

Floral bouquet ornament frame background with Watercolor, isolated white background ,cartoon style, thick line,low detail,no shading

### Midjourney V6 (9/10)

![32-gc-mj6](/assets/images/2024/32-gc-mj6.jpeg)

### DALLE-3 (6/10)

![32-gc-dl](/assets/images/2024/32-gc-dl.jpeg)

---

### Prompt #33

Based on the movie - Ferris Beuller’s Day Off - Cameron's House - Model: Teen boy, pensive look, dark hair. - Clothing: Preppy sweater, collared shirt, khakis. - Shoes: Classic loafers. - Background: Darker, moody room, 80s memorabilia. - Mood: Reluctant, worried. - Camera: Nikon Z7, full-body shot. - Lighting: Dim, soft light. - Angle: Slightly high, showing the room's depth. Shot should be hyper-realistic and cinematic, capturing the essence of the iconic film while showcasing the 80s inspired fashion in a full-body, distance photograph. HYPER REALISTIC PHOTOGRAPH - FULL BODY IMAGE - MUST SHOW SHOES

### Midjourney V6 (8.5/10)

![33-gc-mj6](/assets/images/2024/33-gc-mj6.jpeg)

### DALLE-3 (5/10)

![33-gc-dl](/assets/images/2024/33-gc-dl.jpeg)

---

### Prompt #34

sheep pasture, portrait of a young man, small geometrically cut photo collage, distorted, broken, fragmented maximalist, Picasso, very detailed

### Midjourney V6 (10/10)

![34-gc-mj6](/assets/images/2024/34-gc-mj6.jpeg)

### DALLE-3 (6/10)

![34-gc-dl](/assets/images/2024/34-gc-dl.jpeg)

---

### Prompt #35

ethereal, contemporary portrait photograph, a man's contemplative face partially emerges from deep shadows, surrounded by a soft blur. The muted orange tones envelop the subject, while a prism-like rainbow spectrum highlights his eye, invoking a sense of mystery. The composition leverages the interplay of light and shadow, creating a dynamic yet introspective mood

### Midjourney V6 (10/10)

![35-gc-mj6](/assets/images/2024/35-gc-mj6.jpeg)

### DALLE-3 (7/10)

![35-gc-dl](/assets/images/2024/35-gc-dl.jpeg)

---

### Prompt #36

abstract art by Mondrian with solid lines and blocks of color, there are illustrated cats placed in the colored boxes in various cute poses

### Midjourney V6 (10/10)

![36-gc-mj6](/assets/images/2024/36-gc-mj6.jpeg)

### DALLE-3 (7/10)

![36-gc-dl](/assets/images/2024/36-gc-dl.jpeg)

---

### Prompt #37

mushrooms different varieties watercolor

### Midjourney V6 (9.5/10)

![37-gc-mj6](/assets/images/2024/37-gc-mj6.jpeg)

### DALLE-3 (8/10)

![37-gc-dl](/assets/images/2024/37-gc-dl.jpeg)

---

### Prompt #38

the most beautiful picture on earth

### Midjourney V6 (8/10)

![38-gc-mj6](/assets/images/2024/38-gc-mj6.jpeg)

### DALLE-3 (5/10)

![38-gc-dl](/assets/images/2024/38-gc-dl.jpeg)

---

### Prompt #39

logo of two letters "AI" in Knitted STYLE

### Midjourney V6 (7.5/10)

![39-gc-mj6](/assets/images/2024/39-gc-mj6.jpeg)

### DALLE-3 (8.5/10)

![39-gc-dl](/assets/images/2024/39-gc-dl.jpeg)

---

### Prompt #40

Gold coins were scattered on the wet rock steps, and a golden sunshine shone down on an area, reflecting the glittering gold,Photorealistic, Global Illumination, 32k, Ray Tracing Ambient Occlusion, Hyperrealistic

### Midjourney V6 (10/10)

![40-gc-mj6](/assets/images/2024/40-gc-mj6.jpeg)

### DALLE-3 (8/10)

![40-gc-dl](/assets/images/2024/40-gc-dl.jpeg)

---

### Prompt #41

this logo won the best logo of all time award

### Midjourney V6 (8/10)

![41-gc-mj6](/assets/images/2024/41-gc-mj6.jpeg)

### DALLE-3 (8/10)

![41-gc-dl](/assets/images/2024/41-gc-dl.jpeg)

---

### Prompt #42

a logo for a software for quality managers using the quality colorus red, green and orange as well as underline the brand values: undestanding, relationship and dependability as well as the characteristics friendly, easy, masculine, serious and industrial

### Midjourney V6 (7/10)

![42-gc-mj6](/assets/images/2024/42-gc-mj6.jpeg)

### DALLE-3 (3/10)

![42-gc-dl](/assets/images/2024/42-gc-dl.jpeg)

---

### Prompt #43

a simple vector art symbol logo for a flower and fire,, and war. No color. No watermark. White background, black lines only. Simple line art.

### Midjourney V6 (9/10)

![43-gc-mj6](/assets/images/2024/43-gc-mj6.jpeg)

### DALLE-3 (6/10)

![43-gc-dl](/assets/images/2024/43-gc-dl.jpeg)

---

### Prompt #44

a sharply-focused black and white painting based on a squared-shaped face with various surrounding geometric shapes, in the style of hundertwasser, in the style of elke trittel, mechanical whimsy, columns and totems, mixed-media sculptor, folk art painting, yaka art, collage and mixed media

### Midjourney V6 (9/10)

![44-gc-mj6](/assets/images/2024/44-gc-mj6.jpeg)

### DALLE-3 (5/10)

![44-gc-dl](/assets/images/2024/44-gc-dl.jpeg)

---

### Prompt #45

a complex logo for a university named Princess X for Science

### Midjourney V6 (7/10)

![45-gc-mj6](/assets/images/2024/45-gc-mj6.jpeg)

### DALLE-3 (7/10)

![45-gc-dl](/assets/images/2024/45-gc-dl.jpeg)

---

### Prompt #46

Risographic style geometric

### Midjourney V6 (10/10)

![46-gc-mj6](/assets/images/2024/46-gc-mj6.jpeg)

### DALLE-3 (6.5/10)

![46-gc-dl](/assets/images/2024/46-gc-dl.jpeg)

---

### Prompt #47

An abstract work of art consisting of various geometric figures, vignetting photography, photo grade, 2K, hyper quality

### Midjourney V6 (10/10)

![47-gc-mj6](/assets/images/2024/47-gc-mj6.jpeg)

### DALLE-3 (6/10)

![47-gc-dl](/assets/images/2024/47-gc-dl.jpeg)

---

### Prompt #48

Create an illustration of a protractor, a triangle, and a square. Use simple shapes and clear lines.

### Midjourney V6 (8/10)

![48-gc-mj6](/assets/images/2024/48-gc-mj6.jpeg)

### DALLE-3 (7/10)

![48-gc-dl](/assets/images/2024/48-gc-dl.jpeg)

---

### Prompt #49

universe

### Midjourney V6 (9/10)

![49-gc-mj6](/assets/images/2024/49-gc-mj6.jpeg)

### DALLE-3 (8/10)

![49-gc-dl](/assets/images/2024/49-gc-dl.jpeg)

---

### Prompt #50

There is a yellow bird in the middle of the black flock, comic

### Midjourney V6 (10/10)

![50-gc-mj6](/assets/images/2024/50-gc-mj6.jpeg)

### DALLE-3 (7.5/10)

![50-gc-dl](/assets/images/2024/50-gc-dl.jpeg)

---

### Prompt #51

Pareidolia, scifi pulp magazine style, by Lisa Frank

### Midjourney V6 (7/10)

![51-gc-mj6](/assets/images/2024/51-gc-mj6.jpeg)

### DALLE-3 (5/10)

![51-gc-dl](/assets/images/2024/51-gc-dl.jpeg)

---

### Prompt #52

Drawing on paper with colored pencils. The kitten is cute cartoon, smiling and sitting on the grass. Against the background of the landscape

### Midjourney V6 (10/10)

![52-gc-mj6](/assets/images/2024/52-gc-mj6.jpeg)

### DALLE-3 (6.5/10)

![52-gc-dl](/assets/images/2024/52-gc-dl.jpeg)

---

<div id="conclusion"></div>
# Conclusion

My rating of the tested models:

1. **🥇Midjourney V6**: What a great model! I still can't believe we are at a time where we can generate such beautiful and high quality images using AI. If you are looking for beauty, quality, and/or photorealism, this model is your first choice.
2. **DALLE-3**: This model has less aesthetic outputs than Midjourney but its power lies in its ability to 1) follow details in the prompt which it does better than Midjourney in some cases and 2) deal with text almost perfectly. 
3. **Midjourney V5.2**: Good model but in most cases, V6 gives better images.
4. **SDXL**: I was a fan of Stability AI's models since 1.5 because they're open source, but when I compare SDXL to Midjourney and DALLE-3, especially the former, the quality gap is VERY wide. However, because SDXL is open source, there are some powerful things you can do with it that you can't do with the other models. For example, you can fine-tune it to generate images in a specific style or you can use Controlnet to control the generation process in many ways.

---

##### Disclaimers

- I don't claim to compare all top models available. For example, I'm using SDXL which is at the pinnacle of open-source models. I know that there are so many SDXL fine-tunings out there that might be better in some areas, but my thinking is that SDXL will capture the essence of those fine-tunings because it's their base.
- As mentioned above, I used prompts collected from different communities. I don't understand every single term used in these prompts, but I understand most of them after spending a lot of time generating images with these models since their launch.