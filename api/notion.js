// API Notion en syntaxe CommonJS pour Vercel
module.exports = async function handler(req, res) {
  // Headers CORS basiques
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Test endpoint pour GET - toujours répondre
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'OK',
      message: 'API Notion active',
      timestamp: new Date().toISOString(),
      version: '3.1-commonjs',
      build: 'success'
    });
  }

  // Seulement POST pour les requêtes Notion
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

    console.log('📡 Received request:', { 
      hasApiKey: !!apiKey, 
      hasDatabaseId: !!databaseId,
      method: req.method 
    });

    // Validation basique
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
        code: 'INVALID_API_KEY',
        received_format: apiKey.substring(0, 6) + '...'
      });
    }

    if (databaseId.length !== 32) {
      return res.status(400).json({
        success: false,
        error: 'ID de base invalide (doit faire 32 caractères)',
        code: 'INVALID_DATABASE_ID',
        received_length: databaseId.length
      });
    }

    console.log('✅ Validation passed, calling Notion API...');

    // Import dynamique de fetch pour Node.js si nécessaire
    const fetch = global.fetch || (await import('node-fetch')).default;

    // Appel Notion avec fetch simple
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

    console.log('📊 Notion response status:', notionResponse.status);

    // Lire la réponse
    let notionData;
    try {
      const responseText = await notionResponse.text();
      console.log('📄 Response length:', responseText.length);
      notionData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Parse error:', parseError.message);
      return res.status(500).json({
        success: false,
        error: 'Réponse Notion invalide',
        code: 'NOTION_PARSE_ERROR',
        details: parseError.message
      });
    }

    // Vérifier si la requête Notion a réussi
    if (!notionResponse.ok) {
      console.error('❌ Notion error:', notionData);
      return res.status(notionResponse.status).json({
        success: false,
        error: notionData.message || 'Erreur Notion',
        code: 'NOTION_ERROR',
        notion_error: notionData
      });
    }

    // Traitement des données
    const results = notionData.results || [];
    console.log('📋 Found rows:', results.length);

    // Extraction simple des posts
    const posts = [];
    let processedCount = 0;
    
    for (let i = 0; i < results.length && posts.length < 20; i++) {
      try {
        const row = results[i];
        const props = row.properties || {};
        
        // Chercher la colonne de contenu
        let contentProperty = null;
        const contentKeys = ['Contenu', 'Content', 'Media', 'Fichiers', 'Files'];
        
        for (const key of contentKeys) {
          if (props[key] && props[key].files && props[key].files.length > 0) {
            contentProperty = props[key];
            break;
          }
        }

        if (!contentProperty) {
          continue;
        }

        // Chercher le statut
        let isPosted = false;
        const statusKeys = ['Statut', 'Status', 'État', 'State'];
        
        for (const key of statusKeys) {
          if (props[key] && props[key].select) {
            const status = props[key].select.name.toLowerCase();
            if (status === 'posté' || status === 'posted') {
              isPosted = true;
              break;
            }
          }
        }

        if (isPosted) {
          continue;
        }

        // Extraire les données
        let title = 'Sans titre';
        const titleKeys = Object.keys(props).filter(key => props[key].title);
        if (titleKeys.length > 0) {
          const titleProp = props[titleKeys[0]];
          if (titleProp.title && titleProp.title[0]) {
            title = titleProp.title[0].text.content || 'Sans titre';
          }
        }

        let date = new Date().toISOString().split('T')[0];
        const dateKeys = Object.keys(props).filter(key => props[key].date);
        if (dateKeys.length > 0) {
          const dateProp = props[dateKeys[0]];
          if (dateProp.date && dateProp.date.start) {
            date = dateProp.date.start;
          }
        }

        let caption = '';
        const captionKeys = Object.keys(props).filter(key => props[key].rich_text);
        if (captionKeys.length > 0) {
          const captionProp = props[captionKeys[0]];
          if (captionProp.rich_text && captionProp.rich_text[0]) {
            caption = captionProp.rich_text[0].text.content || '';
          }
        }

        // URLs des fichiers
        const urls = [];
        for (const file of contentProperty.files) {
          if (file.type === 'file' && file.file && file.file.url) {
            urls.push(file.file.url);
          } else if (file.type === 'external' && file.external && file.external.url) {
            urls.push(file.external.url);
          }
        }

        if (urls.length === 0) {
          continue;
        }

        // Type automatique
        let type = 'Image';
        if (urls.length > 1) {
          type = 'Carrousel';
        } else if (urls[0].includes('.mp4') || urls[0].includes('video') || urls[0].includes('.mov')) {
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

        processedCount++;

      } catch (postError) {
        console.error('❌ Error processing post:', postError.message);
        continue;
      }
    }

    // Trier par date (plus récent en premier)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log('✅ Successfully processed:', posts.length, 'posts from', results.length, 'rows');

    // Réponse finale simple
    return res.status(200).json({
      success: true,
      posts: posts,
      meta: {
        total: results.length,
        withMedia: posts.length,
        processed: processedCount
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Server error:', error.message);
    console.error('❌ Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur interne',
      code: 'SERVER_ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
