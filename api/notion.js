export default async function handler(req, res) {
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
      version: '3.0'
    });
  }

  // Seulement POST pour les requêtes Notion
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    const body = req.body || {};
    const { apiKey, databaseId } = body;

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

    console.log('📡 Calling Notion API...');

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

    console.log('📊 Notion status:', notionResponse.status);

    // Lire la réponse
    let notionData;
    try {
      const responseText = await notionResponse.text();
      notionData = JSON.parse(responseText);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        error: 'Réponse Notion invalide',
        code: 'NOTION_PARSE_ERROR'
      });
    }

    // Vérifier si la requête Notion a réussi
    if (!notionResponse.ok) {
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
    
    for (let i = 0; i < results.length && posts.length < 20; i++) {
      const row = results[i];
      const props = row.properties || {};
      
      // Chercher la colonne de contenu
      let contentProperty = null;
      const contentKeys = ['Contenu', 'Content', 'Media', 'Fichiers'];
      for (const key of contentKeys) {
        if (props[key] && props[key].files && props[key].files.length > 0) {
          contentProperty = props[key];
          break;
        }
      }

      if (!contentProperty) continue;

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

      if (isPosted) continue;

      // Extraire les données
      const title = Object.keys(props).find(key => props[key].title) 
        ? (props[Object.keys(props).find(key => props[key].title)].title[0]?.text?.content || 'Sans titre')
        : `Post ${i + 1}`;

      const date = Object.keys(props).find(key => props[key].date)
        ? props[Object.keys(props).find(key => props[key].date)].date?.start
        : new Date().toISOString().split('T')[0];

      const caption = Object.keys(props).find(key => props[key].rich_text)
        ? (props[Object.keys(props).find(key => props[key].rich_text)].rich_text[0]?.text?.content || '')
        : '';

      // URLs des fichiers
      const urls = contentProperty.files.map(file => {
        if (file.type === 'file') return file.file.url;
        if (file.type === 'external') return file.external.url;
        return null;
      }).filter(Boolean);

      if (urls.length === 0) continue;

      // Type automatique
      let type = 'Image';
      if (urls.length > 1) type = 'Carrousel';
      else if (urls[0].includes('.mp4') || urls[0].includes('video')) type = 'Vidéo';

      posts.push({
        id: row.id,
        title,
        date,
        caption,
        type,
        urls,
        account: 'Principal'
      });
    }

    // Trier par date
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log('✅ Processed posts:', posts.length);

    // Réponse finale simple
    return res.status(200).json({
      success: true,
      posts: posts,
      meta: {
        total: results.length,
        withMedia: posts.length
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      code: 'SERVER_ERROR',
      message: error.message
    });
  }
}
