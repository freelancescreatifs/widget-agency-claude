export default async function handler(req, res) {
  // Configuration CORS stricte
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Gestion OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Test endpoint pour GET
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'API Active',
      version: '2.0',
      timestamp: new Date().toISOString(),
      endpoint: '/api/notion',
      methods: ['POST'],
      message: 'Use POST with apiKey and databaseId to query Notion'
    });
  }

  // Seul POST est autorisé pour les requêtes Notion
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['POST'],
      received: req.method
    });
  }

  try {
    // Validation des paramètres d'entrée
    const { apiKey, databaseId } = req.body || {};

    // Vérification de base
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Clé API manquante',
        code: 'MISSING_API_KEY',
        message: 'Le paramètre apiKey est requis'
      });
    }

    if (!databaseId) {
      return res.status(400).json({
        success: false,
        error: 'ID de base manquant',
        code: 'MISSING_DATABASE_ID',
        message: 'Le paramètre databaseId est requis'
      });
    }

    // Validation du format de la clé API
    if (!apiKey.startsWith('ntn_') && !apiKey.startsWith('secret_')) {
      return res.status(400).json({
        success: false,
        error: 'Format de clé API invalide',
        code: 'INVALID_API_KEY_FORMAT',
        message: 'La clé doit commencer par "ntn_" ou "secret_"',
        received: apiKey.substring(0, 10) + '...'
      });
    }

    // Validation de l'ID de base
    if (databaseId.length !== 32) {
      return res.status(400).json({
        success: false,
        error: 'ID de base invalide',
        code: 'INVALID_DATABASE_ID',
        message: 'L\'ID doit faire exactement 32 caractères',
        received_length: databaseId.length
      });
    }

    console.log('📡 Attempting Notion API call...');

    // Appel à l'API Notion avec timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const notionResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        page_size: 100
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    console.log('📊 Notion Response Status:', notionResponse.status);

    // Lecture de la réponse
    const responseText = await notionResponse.text();
    console.log('📄 Response length:', responseText.length);

    let notionData;
    try {
      notionData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      return res.status(500).json({
        success: false,
        error: 'Réponse Notion invalide',
        code: 'INVALID_JSON_RESPONSE',
        message: 'Notion a renvoyé une réponse non-JSON',
        debug: {
          status: notionResponse.status,
          responseStart: responseText.substring(0, 100)
        }
      });
    }

    // Gestion des erreurs Notion
    if (!notionResponse.ok) {
      console.error('❌ Notion API Error:', notionData);
      return res.status(notionResponse.status).json({
        success: false,
        error: 'Erreur API Notion',
        code: 'NOTION_API_ERROR',
        message: notionData.message || 'Erreur inconnue de Notion',
        notion_error: notionData
      });
    }

    // Traitement des données
    const results = notionData.results || [];
    console.log('📋 Total rows found:', results.length);

    // Détection des propriétés
    const properties = results.length > 0 ? Object.keys(results[0].properties) : [];
    console.log('🏷️ Properties found:', properties);

    // Mapping des colonnes
    const propertyMap = {
      title: properties.find(p => 
        ['titre', 'title', 'nom', 'name'].includes(p.toLowerCase())
      ),
      content: properties.find(p => 
        ['contenu', 'content', 'media', 'fichiers', 'files'].includes(p.toLowerCase())
      ),
      date: properties.find(p => 
        ['date', 'publication', 'publish'].includes(p.toLowerCase())
      ),
      type: properties.find(p => 
        ['type', 'category', 'catégorie'].includes(p.toLowerCase())
      ),
      caption: properties.find(p => 
        ['caption', 'description', 'texte', 'text'].includes(p.toLowerCase())
      ),
      status: properties.find(p => 
        ['statut', 'status', 'état', 'state'].includes(p.toLowerCase())
      ),
      account: properties.find(p => 
        ['compte', 'account', 'profil', 'profile'].includes(p.toLowerCase())
      )
    };

    console.log('🗂️ Property mapping:', propertyMap);

    // Filtrage et traitement des posts
    const validPosts = [];
    
    for (const row of results) {
      try {
        const props = row.properties;
        
        // Vérifier le contenu média
        const contentProp = propertyMap.content ? props[propertyMap.content] : null;
        if (!contentProp || !contentProp.files || contentProp.files.length === 0) {
          continue; // Passer si pas de média
        }

        // Vérifier le statut (exclure "Posté")
        const statusProp = propertyMap.status ? props[propertyMap.status] : null;
        if (statusProp && statusProp.select && 
            ['posté', 'posted'].includes(statusProp.select.name.toLowerCase())) {
          continue; // Passer si posté
        }

        // Extraire les données
        const title = propertyMap.title && props[propertyMap.title] 
          ? (props[propertyMap.title].title?.[0]?.text?.content || 'Sans titre')
          : 'Sans titre';

        const date = propertyMap.date && props[propertyMap.date] 
          ? props[propertyMap.date].date?.start
          : new Date().toISOString().split('T')[0];

        const caption = propertyMap.caption && props[propertyMap.caption]
          ? (props[propertyMap.caption].rich_text?.[0]?.text?.content || '')
          : '';

        const account = propertyMap.account && props[propertyMap.account]
          ? (props[propertyMap.account].select?.name || 'Principal')
          : 'Principal';

        // Traiter les fichiers média
        const mediaUrls = contentProp.files.map(file => {
          if (file.type === 'file') {
            return file.file.url;
          } else if (file.type === 'external') {
            return file.external.url;
          }
          return null;
        }).filter(Boolean);

        if (mediaUrls.length === 0) continue;

        // Déterminer le type
        let type = 'Image';
        if (mediaUrls.length > 1) {
          type = 'Carrousel';
        } else if (mediaUrls[0].includes('.mp4') || mediaUrls[0].includes('video')) {
          type = 'Vidéo';
        }

        // Type personnalisé si défini
        if (propertyMap.type && props[propertyMap.type]?.select?.name) {
          type = props[propertyMap.type].select.name;
        }

        validPosts.push({
          id: row.id,
          title,
          date,
          caption,
          account,
          type,
          urls: mediaUrls,
          created_time: row.created_time
        });

      } catch (postError) {
        console.error('❌ Error processing post:', postError.message);
        continue; // Continuer avec le post suivant
      }
    }

    // Trier par date (plus récent en premier)
    validPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log('✅ Successfully processed:', validPosts.length, 'posts');

    // Réponse finale
    return res.status(200).json({
      success: true,
      posts: validPosts,
      meta: {
        total: results.length,
        withMedia: validPosts.length,
        properties: properties,
        propertyMap: propertyMap
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Server Error:', error);
    
    // Gestion des différents types d'erreurs
    if (error.name === 'AbortError') {
      return res.status(408).json({
        success: false,
        error: 'Timeout de connexion',
        code: 'REQUEST_TIMEOUT',
        message: 'La requête à Notion a pris trop de temps'
      });
    }

    if (error.message.includes('fetch')) {
      return res.status(502).json({
        success: false,
        error: 'Erreur de connexion à Notion',
        code: 'NOTION_CONNECTION_ERROR',
        message: 'Impossible de contacter l\'API Notion'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur serveur interne',
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
