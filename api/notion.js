// API Notion moderne en ESM pour Vercel
export default async function handler(req, res) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Test endpoint pour GET
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'OK',
      message: 'API Notion active',
      timestamp: new Date().toISOString(),
      version: '4.0-esm',
      build: 'success',
      method: 'GET'
    });
  }

  // POST pour Notion
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      allowed: ['GET', 'POST']
    });
  }

  try {
    const body = req.body || {};
    const { apiKey, databaseId } = body;

    console.log('📡 API Request received:', { 
      hasApiKey: !!apiKey, 
      hasDatabaseId: !!databaseId,
      timestamp: new Date().toISOString()
    });

    // Validation
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Clé API manquante',
        code: 'MISSING_API_KEY'
      });
    }

    if (!databaseId) {
      return res.status(400).json({
        success: false,
        error: 'ID de base manquant', 
        code: 'MISSING_DATABASE_ID'
      });
    }

    // Validation format
    if (!apiKey.startsWith('ntn_') && !apiKey.startsWith('secret_')) {
      return res.status(400).json({
        success: false,
        error: 'Format de clé invalide (doit commencer par ntn_)',
        code: 'INVALID_API_KEY'
      });
    }

    if (databaseId.length !== 32) {
      return res.status(400).json({
        success: false,
        error: 'ID de base invalide (doit faire 32 caractères)',
        code: 'INVALID_DATABASE_ID'
      });
    }

    console.log('✅ Validation OK, calling Notion...');

    // Appel Notion
    const notionUrl = `https://api.notion.com/v1/databases/${databaseId}/query`;
    
    const notionResponse = await fetch(notionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        page_size: 50
      })
    });

    console.log('📊 Notion status:', notionResponse.status);

    if (!notionResponse.ok) {
      const errorText = await notionResponse.text();
      console.error('❌ Notion error:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      return res.status(notionResponse.status).json({
        success: false,
        error: 'Erreur Notion',
        code: 'NOTION_ERROR',
        notion_error: errorData
      });
    }

    // Parse response
    const notionData = await notionResponse.json();
    const results = notionData.results || [];
    
    console.log('📋 Rows found:', results.length);

    // Process posts
    const posts = [];
    
    for (const row of results) {
      try {
        const props = row.properties || {};
        
        // Find content property
        let contentProperty = null;
        for (const [key, value] of Object.entries(props)) {
          if (value.files && value.files.length > 0) {
            contentProperty = value;
            break;
          }
        }

        if (!contentProperty) continue;

        // Check status
        let isPosted = false;
        for (const [key, value] of Object.entries(props)) {
          if (value.select && value.select.name) {
            const status = value.select.name.toLowerCase();
            if (status === 'posté' || status === 'posted') {
              isPosted = true;
              break;
            }
          }
        }

        if (isPosted) continue;

        // Extract data
        let title = 'Sans titre';
        for (const [key, value] of Object.entries(props)) {
          if (value.title && value.title[0] && value.title[0].text) {
            title = value.title[0].text.content;
            break;
          }
        }

        let date = new Date().toISOString().split('T')[0];
        for (const [key, value] of Object.entries(props)) {
          if (value.date && value.date.start) {
            date = value.date.start;
            break;
          }
        }

        let caption = '';
        for (const [key, value] of Object.entries(props)) {
          if (value.rich_text && value.rich_text[0] && value.rich_text[0].text) {
            caption = value.rich_text[0].text.content;
            break;
          }
        }

        // Extract URLs
        const urls = [];
        for (const file of contentProperty.files) {
          if (file.type === 'file' && file.file && file.file.url) {
            urls.push(file.file.url);
          } else if (file.type === 'external' && file.external && file.external.url) {
            urls.push(file.external.url);
          }
        }

        if (urls.length === 0) continue;

        // Determine type
        let type = 'Image';
        if (urls.length > 1) {
          type = 'Carrousel';
        } else if (urls[0].match(/\.(mp4|mov|webm|avi)(\?|$)/i)) {
          type = 'Vidéo';
        }

        posts.push({
          id: row.id,
          title,
          date,
          caption,
          type,
          urls,
          account: 'Principal'
        });

        if (posts.length >= 20) break;

      } catch (error) {
        console.error('❌ Error processing row:', error.message);
        continue;
      }
    }

    // Sort by date
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log('✅ Processed posts:', posts.length);

    return res.status(200).json({
      success: true,
      posts: posts,
      meta: {
        total: results.length,
        withMedia: posts.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      code: 'SERVER_ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
