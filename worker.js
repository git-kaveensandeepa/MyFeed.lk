export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // =========================================================================
    // CLOUDFLARE D1 RELATIONAL SQL DATABASE API ENDPOINTS (BYPASSES FIRESTORE)
    // =========================================================================

    if (url.pathname.startsWith('/api/db-') || url.pathname.match(/^\/api\/articles\/([^/]+)\/comments$/)) {
      // 1. Ensure database is bootstrapped with correct SQL tables
      if (env.DB) {
        await bootstrapDatabase(env.DB);
      } else {
        return new Response(JSON.stringify({ error: 'Cloudflare D1 DB binding is missing or not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // Handle CORS Preflight Options request
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
          }
        });
      }

      // GET /api/db-articles
      if (url.pathname === '/api/db-articles' && request.method === 'GET') {
        try {
          const { results } = await env.DB.prepare("SELECT * FROM articles ORDER BY createdAt DESC").all();
          
          // Seed database if completely empty
          if (results.length === 0) {
            await seedDefaultArticles(env.DB);
            const reFetch = await env.DB.prepare("SELECT * FROM articles ORDER BY createdAt DESC").all();
            return new Response(JSON.stringify(reFetch.results), {
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }

          return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
        }
      }

      // POST /api/db-articles
      if (url.pathname === '/api/db-articles' && request.method === 'POST') {
        try {
          const body = await request.json();
          const id = body.id || 'art-' + Math.random().toString(36).substring(2, 11);
          const slug = body.slug || id;
          const nowIso = new Date().toISOString();

          await env.DB.prepare(`
            INSERT INTO articles (id, slug, title, summary, content, category, imageUrl, date, readTime, views, createdAt, authorType)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            id,
            slug,
            body.title,
            body.summary || '',
            body.content || '',
            body.category || 'Tech',
            body.imageUrl || '',
            body.date || nowIso.split('T')[0],
            body.readTime || '3 min read',
            body.views || 0,
            nowIso,
            body.authorType || 'human'
          ).run();

          return new Response(JSON.stringify({ success: true, id }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
        }
      }

      // PUT /api/db-articles/:id
      const articleMatch = url.pathname.match(/^\/api\/db-articles\/([^/]+)$/);
      if (articleMatch && request.method === 'PUT') {
        const articleId = articleMatch[1];
        try {
          const body = await request.json();
          await env.DB.prepare(`
            UPDATE articles 
            SET title = ?, summary = ?, content = ?, category = ?, imageUrl = ?, readTime = ?
            WHERE id = ?
          `).bind(
            body.title,
            body.summary,
            body.content,
            body.category,
            body.imageUrl,
            body.readTime,
            articleId
          ).run();

          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
        }
      }

      // DELETE /api/db-articles/:id
      if (articleMatch && request.method === 'DELETE') {
        const articleId = articleMatch[1];
        try {
          await env.DB.prepare("DELETE FROM articles WHERE id = ?").bind(articleId).run();
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
        }
      }

      // GET /api/articles/:id/comments
      const commentsMatch = url.pathname.match(/^\/api\/articles\/([^/]+)\/comments$/);
      if (commentsMatch && request.method === 'GET') {
        const articleId = commentsMatch[1];
        try {
          const { results } = await env.DB.prepare("SELECT * FROM comments WHERE articleId = ? ORDER BY createdAt DESC").bind(articleId).all();
          return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
        }
      }

      // POST /api/articles/:id/comments
      if (commentsMatch && request.method === 'POST') {
        const articleId = commentsMatch[1];
        try {
          const body = await request.json();
          const id = 'comment-' + Math.random().toString(36).substring(2, 11);
          const nowIso = new Date().toISOString();

          await env.DB.prepare(`
            INSERT INTO comments (id, articleId, text, authorId, authorName, authorPhotoURL, authorVerified, authorRole, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            id,
            articleId,
            body.text.trim(),
            body.authorId,
            body.authorName || 'Anonymous',
            body.authorPhotoURL || '',
            body.authorVerified ? 1 : 0,
            body.authorRole || 'reader',
            nowIso
          ).run();

          // Increment article comments count
          try {
            await env.DB.prepare("UPDATE articles SET commentsCount = commentsCount + 1 WHERE id = ?").bind(articleId).run();
          } catch {}

          return new Response(JSON.stringify({ success: true, id }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
        }
      }

      // GET /api/db-quizzes
      if (url.pathname === '/api/db-quizzes' && request.method === 'GET') {
        try {
          const { results } = await env.DB.prepare("SELECT * FROM quizzes ORDER BY createdAt DESC").all();
          if (results.length === 0) {
            await seedDefaultQuizzes(env.DB);
            const reFetch = await env.DB.prepare("SELECT * FROM quizzes ORDER BY createdAt DESC").all();
            return new Response(JSON.stringify(reFetch.results), {
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }
          return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
        }
      }

      // GET /api/db-bytes
      if (url.pathname === '/api/db-bytes' && request.method === 'GET') {
        try {
          const { results } = await env.DB.prepare("SELECT * FROM bytes ORDER BY createdAt DESC").all();
          if (results.length === 0) {
            await seedDefaultBytes(env.DB);
            const reFetch = await env.DB.prepare("SELECT * FROM bytes ORDER BY createdAt DESC").all();
            return new Response(JSON.stringify(reFetch.results), {
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }
          return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
        }
      }
    }

    // =========================================================================
    // SERVE STATIC ASSETS AND ANGULAR SSR CATCH-ALL
    // =========================================================================

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};

// =========================================================================
// CLOUDFLARE D1 BOOTSTRAP AND SEED HELPERS
// =========================================================================

async function bootstrapDatabase(DB) {
  try {
    // 1. Create articles table
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE,
        title TEXT NOT NULL,
        summary TEXT,
        content TEXT,
        category TEXT,
        imageUrl TEXT,
        date TEXT,
        readTime TEXT,
        views INTEGER DEFAULT 0,
        reactions_like INTEGER DEFAULT 0,
        reactions_love INTEGER DEFAULT 0,
        reactions_haha INTEGER DEFAULT 0,
        reactions_wow INTEGER DEFAULT 0,
        reactions_sad INTEGER DEFAULT 0,
        commentsCount INTEGER DEFAULT 0,
        createdAt TEXT,
        authorType TEXT DEFAULT 'human'
      )
    `).run();

    // 2. Create comments table
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        articleId TEXT,
        text TEXT NOT NULL,
        authorId TEXT NOT NULL,
        authorName TEXT,
        authorPhotoURL TEXT,
        authorVerified INTEGER DEFAULT 0,
        authorRole TEXT DEFAULT 'reader',
        createdAt TEXT
      )
    `).run();

    // 3. Create quizzes table
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        title TEXT,
        titleSinhala TEXT,
        category TEXT,
        categoryColor TEXT,
        points INTEGER DEFAULT 50,
        durationMins INTEGER DEFAULT 3,
        questionsJson TEXT,
        createdAt TEXT
      )
    `).run();

    // 4. Create bytes table
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS bytes (
        id TEXT PRIMARY KEY,
        topic TEXT,
        category TEXT,
        icon TEXT,
        question TEXT,
        answer TEXT,
        sinhalaNote TEXT,
        createdAt TEXT
      )
    `).run();
  } catch (err) {
    console.error('Database bootstrap error:', err);
  }
}

async function seedDefaultArticles(DB) {
  const nowIso = new Date().toISOString();
  const defaultArticles = [
    {
      id: 'art-1',
      slug: 'apple-intelligence-iphone-17',
      title: 'Apple සමාගමෙන් නවතම iPhone 17 සහ Apple Intelligence සේවා නිල වශයෙන් හඳුන්වා දෙයි',
      summary: 'Apple සමාගම විසින් තම නවතම iPhone මාදිලි සමඟින් වඩාත් දියුණු Apple Intelligence කෘතිම බුද්ධි තාක්ෂණය ලෝකයටම විවෘත කර ඇත.',
      content: '<p class="lead font-medium text-lg mb-4">Apple සමාගම විසින් තම නවතම iPhone මාදිලි සමඟින් වඩාත් දියුණු Apple Intelligence කෘතිම බුද්ධි තාක්ෂණය ලෝකයටම විවෘත කර ඇත.</p><h2>නව විශේෂාංග සහ හැකියාවන්</h2><p>නව iPhone 17 ශ්‍රේණිය වඩාත් වේගවත් A19 Bionic චිප්සෙට් එකෙන් බලගන්වා ඇති අතර, ඡායාරූපකරණය සහ බැටරි ධාරිතාවය ඉතා ඉහළ මට්ටමකට නංවා තිබේ.</p>',
      category: 'Tech',
      imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&auto=format&fit=crop&q=80',
      date: nowIso.split('T')[0],
      readTime: '3 min read',
      authorType: 'human'
    },
    {
      id: 'art-2',
      slug: 'gemini-3-6-flash-fastest-ai',
      title: 'Gemini 3.6 Flash: Google වෙතින් ලොව වේගවත්ම AI මොඩලය නිල වශයෙන් මුදාහරියි',
      summary: 'Google සමාගම විසින් තම දියුණුම කෘතිම බුද්ධි මොඩලය වන Gemini 3.6 Flash සංවර්ධකයින් සඳහා නිල වශයෙන් මුදාහැර තිබේ.',
      content: '<p class="lead font-medium text-lg mb-4">Google සමාගම විසින් තම දියුණුම කෘතිම බුද්ධි මොඩලය වන Gemini 3.6 Flash සංවර්ධකයින් සඳහා නිල වශයෙන් මුදාහැර තිබේ.</p><h2>සුපිරි වේගය සහ කාර්යක්ෂමතාවය</h2><p>නව Gemini 3.6 Flash මාදිලිය මඟින් ලිපි ලේඛන සාරාංශ කිරීම, ක්‍රමලේඛනය (Coding) සහ භාෂා පරිවර්තන තත්පරයකටත් අඩු කාලයකදී සිදු කළ හැක.</p>',
      category: 'AI',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1200&auto=format&fit=crop&q=80',
      date: nowIso.split('T')[0],
      readTime: '4 min read',
      authorType: 'ai'
    }
  ];

  for (const art of defaultArticles) {
    try {
      await DB.prepare(`
        INSERT INTO articles (id, slug, title, summary, content, category, imageUrl, date, readTime, views, createdAt, authorType)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        art.id,
        art.slug,
        art.title,
        art.summary,
        art.content,
        art.category,
        art.imageUrl,
        art.date,
        art.readTime,
        1500,
        nowIso,
        art.authorType
      ).run();
    } catch {}
  }
}

async function seedDefaultQuizzes(DB) {
  const nowIso = new Date().toISOString();
  const staticQuizzes = [
    {
      id: 'quiz-1',
      title: 'AI & Generative Tech Challenge',
      titleSinhala: 'කෘතිම බුද්ධිය (AI) මූලික දැනුම',
      category: 'තාක්ෂණය',
      categoryColor: 'bg-[#007AFF]/15 text-[#007AFF]',
      points: 50,
      durationMins: 3,
      questionsJson: JSON.stringify([
        {
          text: 'ChatGPT සහ Gemini යනු කුමන තාක්ෂණයක්ද?',
          options: ['ලොකු භාෂා ආකෘති (LLM)', 'Operating Systems', 'වීඩියෝ ප්ලේයර්', 'වෛරස් ආරක්ෂණ මෘදුකාංග'],
          correctIndex: 0
        }
      ])
    }
  ];

  for (const q of staticQuizzes) {
    try {
      await DB.prepare(`
        INSERT INTO quizzes (id, title, titleSinhala, category, categoryColor, points, durationMins, questionsJson, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        q.id,
        q.title,
        q.titleSinhala,
        q.category,
        q.categoryColor,
        q.points,
        q.durationMins,
        q.questionsJson,
        nowIso
      ).run();
    } catch {}
  }
}

async function seedDefaultBytes(DB) {
  const nowIso = new Date().toISOString();
  const staticBytes = [
    {
      id: 'byte-1',
      topic: 'Passkeys Technology',
      category: 'Cybersecurity',
      icon: 'lock',
      question: 'Passkey යනු කුමක්ද?',
      answer: 'Passkey යනු සාම්ප්‍රදායික මුරපද (Passwords) වෙනුවට ඔබගේ ඇඟිලි සලකුණ (Fingerprint) හෝ මුහුණ හඳුනාගැනීම (Face ID) භාවිතා කරමින් වඩාත් ආරක්ෂිතව වෙබ් අඩවිවලට ලොග් විය හැකි නවීන තාක්ෂණයකි.',
      sinhalaNote: 'මෙමඟින් හැකර්වරුන්ට ඔබගේ ගිණුම් සොරකම් කිරීම 100% ක් වළක්වයි!'
    }
  ];

  for (const b of staticBytes) {
    try {
      await DB.prepare(`
        INSERT INTO bytes (id, topic, category, icon, question, answer, sinhalaNote, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        b.id,
        b.topic,
        b.category,
        b.icon,
        b.question,
        b.answer,
        b.sinhalaNote,
        nowIso
      ).run();
    } catch {}
  }
}
