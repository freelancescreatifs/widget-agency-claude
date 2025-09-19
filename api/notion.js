export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(405).json({
      error: "Method not allowed",
      method: req.method,
      message: "Use POST to interact with Notion API",
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiKey, databaseId, action } = req.body;

    // Validation des paramètres
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'Clé API manquante',
        debug: 'apiKey is required'
      });
    }

    if (!databaseId) {
      return res.status(400).json({ 
        error: 'ID de base manquant',
        debug: 'databaseId is required'
      });
    }

    // Validation du format de la clé API
    if (!apiKey.startsWith('ntn_') && !apiKey.startsWith('secret_')) {
      return res.status(400).json({
        error: 'Format de clé API invalide',
        debug: `API key should start with 'ntn_' or 'secret_', got: ${apiKey.substring(0, 10)}...`,
        expectedFormat: 'ntn_abc123...'
      });
    }

    // Validation de l'ID de base (doit faire 32 caractères)
    if (databaseId.length !== 32) {
      return res.status(400).json({
        error: 'ID de base invalide',
        debug: `Database ID should be 32 characters, got: ${databaseId.length}`,
        example: 'abc123def456789012345678901234567890'
      });
    }

    console.log('🔍 Debug API Request:', {
      apiKeyFormat: apiKey.substring(0, 10) + '...',
      databaseIdLength: databaseId.length,
      action: action
    });

    // Test de connexion à l'API Notion
    const notionUrl = `https://api.notion.com/v1/databases/${databaseId}/query`;
    
    console.log('📡 Calling Notion API:', notionUrl);

    const response = await fetch(notionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        page_size: 100
      })
    });

    console.log('📊 Notion API Response Status:', response.status);
    console.log('📊 Notion API Response Headers:', Object.fromEntries(response.headers.entries()));

    // Lecture de la réponse
    const responseText = await response.text();
    console.log('📄 Raw Response Text:', responseText.substring(0, 200) + '...');

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      return res.status(500).json({
        error: 'Réponse API invalide',
        debug: {
          statusCode: response.status,
          responseStart: responseText.substring(0, 100),
          parseError: parseError.message
        },
        solutions: [
          'Vérifiez que votre clé API est valide',
          'Vérifiez que l\'ID de base est correct',
          'Vérifiez que l\'intégration a accès à la base'
        ]
      });
    }

    if (!response.ok) {
      console.error('❌ Notion API Error:', data);
      return res.status(response.status).json({
        error: 'Erreur API Notion',
        notionError: data,
        debug: {
          statusCode: response.status,
          url: notionUrl,
          apiKeyFormat: apiKey.substring(0, 10) + '...'
        }
      });
    }

    // Succès - analyser les données
    const results = data.results || [];
    const properties = results.length > 0 ? Object.keys(results[0].properties) : [];

    console.log('✅ Success! Found properties:', properties);

    // Filtrer les posts avec média et non "Posté"
    const postsWithMedia = results.filter(row => {
      const properties = row.properties;
      
      // Chercher la colonne de contenu (Files & Media)
      const contentProperty = properties['Contenu'] || properties['Content'] || 
                             properties['Media'] || properties['Fichiers'];
      
      // Chercher la colonne de statut
      const statusProperty = properties['Statut'] || properties['Status'] || 
                            properties['État'] || properties['State'];
      
      const hasFiles = contentProperty && 
                      contentProperty.files && 
                      contentProperty.files.length > 0;
      
      const isNotPosted = !statusProperty || 
                         !statusProperty.select || 
                         !['posté', 'posted'].includes(statusProperty.select.name.toLowerCase());
      
      return hasFiles && isNotPosted;
    });

    return res.status(200).json({
      success: true,
      debug: {
        totalRows: results.length,
        withMedia: postsWithMedia.length,
        properties: properties,
        apiKeyValid: true,
        databaseAccessible: true
      },
      meta: {
        total: results.length,
        withMedia: postsWithMedia.length,
        properties: properties
      },
      posts: postsWithMedia.slice(0, 20) // Limiter pour debug
    });

  } catch (error) {
    console.error('❌ Server Error:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      debug: {
        message: error.message,
        stack: error.stack?.substring(0, 500)
      },
      timestamp: new Date().toISOString()
    });
  }
}
