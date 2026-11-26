# Editing Shirone

Shirone is a blog with posts, series, short "moments", photo albums and a set of personal pages: projects, skills, timeline, devices, games, friends, a link compass and an anime list.

## Quick links

- [Posts](cloudcannon:collections/posts)
- [Series](cloudcannon:collections/series)
- [Moments](cloudcannon:collections/moments)
- [Albums](cloudcannon:collections/albums)
- [About page](cloudcannon:collections/spec)
- [Shared text](cloudcannon:collections/snippets)
- [Site settings](cloudcannon:collections/settings)
- [Page data](cloudcannon:collections/data)

## Writing

**Posts** are the articles on the home page. Add one with **+ Add**; it opens in the Content Editor. Turn on **Draft** to keep a post off the live site while you work on it. Pick a **Series** to add the post to one, and set **Order in series** to place it.

**Series** group posts. A new series previews on the "Markdown Syntax Guide" series page until it's published; if that series is deleted or renamed, new series have no preview.

**Moments** are short updates with optional photos, shown together on the Moments page. They have no page of their own, so they open in the Content Editor.

**Albums** are the photo galleries. **+ Add** creates an album with a photo list: upload each photo, give it a description, and pick a cover. Albums made from a folder of images (like "Some lovely pictures") are set up by a developer; their details are edited here.

Password-protected posts, moments and albums show their content only after a reader enters the password. Their protected text can't be edited on the page; edit it in the Content Editor.

## Pages

**About page** holds the text of the About page. Its title and subtitle are in Site settings → about.

**Shared text** holds passages that several posts include. Editing one updates every post that includes it.

## Site settings

Each file in **Site settings** controls one part of the site:

- **site**: site title, subtitle, language, theme colour and the home page banner
- **profile**: your avatar, name, bio and social links in the sidebar
- **announcement**: the announcement box in the sidebar
- **nav-bar**: the top menu
- **sidebar**: which sidebar widgets appear, where, and on which pages
- **post-list**, **article**, **license**: how posts are listed and what appears around them
- **about**, **friends**, **moments**, **albums**, **compass**, **projects**, **skills**, **timeline**, **devices**, **games**, **anime**, **series**: turn each page on or off, set its title and subtitle, and its filter categories
- **llms**: what the site publishes for AI tools

Page titles that start with `$t:` use the site's built-in, translated wording. Replace one with your own words to change it.

Changes to settings show on the site after the next build.

## Page data

**Page data** holds the entries on the personal pages: projects, skills, timeline, devices, games, friends, compass, anime and music. It also holds the lists of **tags** and **categories** offered when writing posts.

## Rich text components

The Content Editor's component button inserts the site's special blocks: note, info, tip, important, warning and caution boxes; details that open on click; steps; image grids; file and code trees; collapsible panels; GitHub cards; YouTube, Bilibili, AcFun and video players; spoilers; pronunciation audio; equations; abbreviations; footnotes; and shared text.

A few demo posts use layouts the Content Editor can't show. They open in the Data Editor, and their text is edited in the Source Editor.

## Writing limits

Text between two `$` signs becomes an equation, so write prices as "USD 5" rather than with a dollar sign.
