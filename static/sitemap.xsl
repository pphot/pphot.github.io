<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Sitemap</title>
        <link rel="alternate" type="application/xml" href="/sitemap.xml" title="sitemap.xml"/>
        <style>
          :root { color-scheme: light dark; }
          body {
            margin: 0;
            padding: 2.5rem 1.25rem 5rem;
            font-family: Georgia, 'Iowan Old Style', 'Times New Roman', serif;
            line-height: 1.7;
            color: #241f1a;
            background: #faf8f5;
          }
          main { max-width: 44rem; margin: 0 auto; }
          header { border-bottom: 1px solid #e3ddd4; padding-bottom: 1.5rem; margin-bottom: 2.5rem; }
          h1 { font-size: 2rem; margin: 0 0 .25rem; }
          .tagline { margin: 0 0 1rem; color: #7a6f5f; }
          ol { list-style: none; padding: 0; margin: 0; }
          li { border-bottom: 1px solid #e3ddd4; }
          li:last-child { border-bottom: 0; }
          a { display: flex; flex-wrap: wrap; gap: .75rem; align-items: baseline; padding: .6rem 0; color: inherit; text-decoration: none; }
          a:hover { color: #a8622a; }
          .path { font-size: .8125rem; color: #7a6f5f; word-break: break-all; }
          a:hover .path { color: inherit; }
          .count { margin-left: auto; font-size: .75rem; color: #7a6f5f; }
          .empty { color: #7a6f5f; font-style: italic; }
          footer { margin-top: 3rem; font-size: .8125rem; color: #7a6f5f; }
          @media (prefers-color-scheme: dark) {
            body { color: #f5f0e8; background: #1c1916; }
            header, li { border-color: #4a433c; }
            .tagline, .path, .count, .empty, footer { color: #c9c0b3; }
            a:hover { color: #f0ba7d; }
          }
        </style>
      </head>
      <body>
        <main>
          <header>
            <h1>Sitemap</h1>
            <p class="tagline">
              <xsl:value-of select="count(/s:urlset/s:url)"/>
              <xsl:text> pages on this site.</xsl:text>
            </p>
            <p class="tagline">
              <a href="/"><xsl:text>Visit the site</xsl:text></a>
              <xsl:text> · </xsl:text>
              <a href="/atom.xml"><xsl:text>Subscribe to the feed</xsl:text></a>
            </p>
          </header>

          <xsl:choose>
            <xsl:when test="/s:urlset/s:url">
              <ol>
                <xsl:for-each select="/s:urlset/s:url">
                  <li>
                    <a>
                      <xsl:attribute name="href"><xsl:value-of select="s:loc"/></xsl:attribute>
                      <span class="path"><xsl:value-of select="substring-after(s:loc, 'https://pphot.blog')"/></span>
                      <span class="count"><xsl:value-of select="s:lastmod"/></span>
                    </a>
                  </li>
                </xsl:for-each>
              </ol>
            </xsl:when>
            <xsl:otherwise>
              <p class="empty">No pages yet.</p>
            </xsl:otherwise>
          </xsl:choose>

          <footer>
            <xsl:text>Generated from </xsl:text>
            <a href="/sitemap.xml"><xsl:text>sitemap.xml</xsl:text></a>
            <xsl:text>.</xsl:text>
          </footer>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>