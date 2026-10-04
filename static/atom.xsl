<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="/atom:feed/atom:title"/> · Feed</title>
        <link rel="alternate" type="application/atom+xml">
          <xsl:attribute name="href"><xsl:value-of select="/atom:feed/atom:link[@rel='self']/@href"/></xsl:attribute>
          <xsl:attribute name="title"><xsl:value-of select="/atom:feed/atom:title"/></xsl:attribute>
        </link>
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
          h1 { font-size: 2rem; margin: 0 0 .25rem; letter-spacing: -.01em; }
          .tagline { margin: 0 0 1rem; color: #7a6f5f; }
          .subscribe { font-size: .875rem; }
          .subscribe a { color: #a8622a; }
          ol { list-style: none; padding: 0; margin: 0; }
          li { border-bottom: 1px solid #e3ddd4; padding: 1.5rem 0; }
          li:last-child { border-bottom: 0; }
          time { display: block; font-size: .75rem; letter-spacing: .06em; text-transform: uppercase; color: #7a6f5f; }
          h2 { font-size: 1.25rem; margin: .35rem 0 .5rem; }
          h2 a { color: inherit; text-decoration: none; }
          h2 a:hover { color: #a8622a; }
          .summary { margin: 0; color: #594f43; }
          .empty { color: #7a6f5f; font-style: italic; }
          footer { margin-top: 3rem; font-size: .8125rem; color: #7a6f5f; }
          @media (prefers-color-scheme: dark) {
            body { color: #f5f0e8; background: #1c1916; }
            header, li { border-color: #4a433c; }
            .tagline, time, .empty, footer { color: #c9c0b3; }
            .summary { color: #c7bdae; }
            h2 a:hover, .subscribe a { color: #f0ba7d; }
          }
        </style>
      </head>
      <body>
        <main>
          <header>
            <h1><xsl:value-of select="/atom:feed/atom:title"/></h1>
            <p class="tagline">Everything published here, newest first.</p>
            <p class="subscribe">
              <a href="/atom.xml">
                <xsl:text>Subscribe in your reader</xsl:text>
              </a>
              <xsl:text> · </xsl:text>
              <a href="/">
                <xsl:text>Visit the site</xsl:text>
              </a>
            </p>
          </header>

          <xsl:choose>
            <xsl:when test="/atom:feed/atom:entry">
              <ol>
                <xsl:for-each select="/atom:feed/atom:entry">
                  <li>
                    <time>
                      <xsl:attribute name="datetime"><xsl:value-of select="atom:published"/></xsl:attribute>
                      <xsl:value-of select="substring(atom:published, 0, 10)"/>
                    </time>
                    <h2>
                      <a>
                        <xsl:attribute name="href"><xsl:value-of select="atom:link[not(@rel) or @rel='alternate']/@href"/></xsl:attribute>
                        <xsl:value-of select="atom:title"/>
                      </a>
                    </h2>
                    <p class="summary">
                      <xsl:value-of select="atom:summary"/>
                    </p>
                  </li>
                </xsl:for-each>
              </ol>
            </xsl:when>
            <xsl:otherwise>
              <p class="empty">No entries yet.</p>
            </xsl:otherwise>
          </xsl:choose>

          <footer>
            <xsl:text>Generated from </xsl:text>
            <a href="/atom.xml"><xsl:text>atom.xml</xsl:text></a>
            <xsl:text>.</xsl:text>
          </footer>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>