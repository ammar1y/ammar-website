AUTHOR = "Ammar Alyousfi"
SITENAME = "Ammar Alyousfi's Blog"
SITENAME_AR = "مدونة عمار اليوسفي"
SITESUBTITLE = "A blog about data science."
SITEURL = ""

PATH = "content"

TIMEZONE = "Asia/Dubai"
DEFAULT_LANG = "en"

ARTICLE_PATHS = ["blog/en", "blog/ar"]
PAGE_PATHS = ["pages", "pages/ar"]
STATIC_PATHS = [
    "assets",
    "other",
    "resume",
    "s-resume",
    "color-palettes",
    "extra",
]
EXTRA_PATH_METADATA = {
    "extra/CNAME": {"path": "CNAME"},
}

ARTICLE_URL = "{date:%Y}/{slug}.html"
ARTICLE_SAVE_AS = "{date:%Y}/{slug}.html"
ARTICLE_LANG_URL = "{lang}/{date:%Y}/{slug}.html"
ARTICLE_LANG_SAVE_AS = "{lang}/{date:%Y}/{slug}.html"

PAGE_URL = "{slug}/"
PAGE_SAVE_AS = "{slug}/index.html"

DEFAULT_PAGINATION = 100

THEME = "themes/ammar"

SOCIAL = (
    ("github", "https://github.com/ammar1y"),
    ("linkedin", "https://www.linkedin.com/in/ammar-alyousfi/"),
    ("kaggle", "https://www.kaggle.com/ammar111"),
    ("stackoverflow", "https://stackoverflow.com/users/2282785/ammar-alyousfi"),
    ("quora", "https://www.quora.com/profile/Ammar-Alyousfi"),
    ("instagram", "https://www.instagram.com/ammar.you/"),
)

GOOGLE_ANALYTICS = "UA-117443607-1"
DISQUS_SITENAME = None

FEED_ALL_ATOM = "feed.xml"
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

RELATIVE_URLS = False

MARKDOWN = {
    "extension_configs": {
        "markdown.extensions.codehilite": {"css_class": "highlight"},
        "markdown.extensions.extra": {},
        "markdown.extensions.meta": {},
        "markdown.extensions.toc": {"permalink": False},
        "markdown.extensions.smarty": {},
    },
    "output_format": "html5",
}

DEFAULT_DATE = "fs"

INDEX_SAVE_AS = 'blog/index.html'
INDEX_URL = 'blog/'

PAGINATED_TEMPLATES = {
    'index': 100,
}

DIRECT_TEMPLATES = ['index']

CATEGORY_SAVE_AS = ''
CATEGORIES_SAVE_AS = ''
TAG_SAVE_AS = ''
TAGS_SAVE_AS = ''
AUTHOR_SAVE_AS = ''
AUTHORS_SAVE_AS = ''
