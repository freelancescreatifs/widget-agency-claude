module.exports = async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      status: "OK",
      message: "API Notion active",
      version: "6.0-native-fetch"
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      error: "Method not allowed",
      method: req.method,
      message: "Use POST to interact with Notion API"
    });
    return;
  }

  try {
    const { apiKey, databaseId, action, postId, newDate } = req.body;

    // Validation des paramètres
    if (!apiKey || !databaseId) {
      res.status(400).json({
        success: false,
        error: "Clé API et ID de base requis"
      });
      return;
    }

    // Validation format clé API
    if (!apiKey.startsWith('ntn_')) {
      res.status(400).json({
        success: false,
        error: "Format de clé API invalide. Utilisez le nouveau format ntn_..."
      });
      return;
    }

    // Action de mise à jour d'un post
    if (action === 'updatePost' && postId && newDate) {
      try {
        const updateResponse = await fetch(`https://api.notion.com/v1/pages/${postId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
          },
          body: JSON.stringify({
            properties: {
              Date: {
                date: { start: newDate }
              }
            }
          })
        });

        if (updateResponse.ok) {
          res.status(200).json({
            success: true,
            message: "Post mis à jour avec succès"
          });
        } else {
          res.status(400).json({
            success: false,
            error: "Erreur lors de la mise à jour du post"
          });
        }
        return;
      } catch (error) {
        res.status(500).json({
          success: false,
          error: "Erreur lors de la mise à jour"
        });
        return;
      }
    }

    // Récupération des posts (action par défaut)
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        sorts: [
          {
            property: 'Date',
            direction: 'descending'
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({
        success: false,
        error: `Erreur Notion API: ${response.status} - ${errorText}`
      });
      return;
    }

    const data = await response.json();

    // Traitement des posts
    const posts = data.results
      .filter(row => {
        // Filtrer les posts avec statut "Posté"
        const status = row.properties.Statut?.select?.name || 
                      row.properties.Status?.select?.name || '';
        return status.toLowerCase() !== 'posté' && status.toLowerCase() !== 'posted';
      })
      .map(row => {
        const properties = row.properties;
        
        // Extraction du titre
        const title = properties.Titre?.title?.[0]?.text?.content ||
                     properties.Title?.title?.[0]?.text?.content ||
                     properties.Name?.title?.[0]?.text?.content ||
                     'Post sans titre';

        // Extraction des fichiers média
        const contentProperty = properties.Contenu?.files || 
                               properties.Content?.files || 
                               properties.Media?.files || 
                               properties['Files & media']?.files || [];

        const urls = contentProperty
          .map(file => {
            if (file.type === 'file') {
              return file.file.url;
            } else if (file.type === 'external') {
              return file.external.url;
            }
            return null;
          })
          .filter(Boolean);

        // Extraction de la date
        const dateProperty = properties.Date?.date?.start ||
                           properties.Published?.date?.start ||
                           new Date().toISOString().split('T')[0];

        // Extraction du caption
        const caption = properties.Caption?.rich_text?.[0]?.text?.content ||
                       properties.Description?.rich_text?.[0]?.text?.content ||
                       properties.Text?.rich_text?.[0]?.text?.content || '';

        // Extraction du type
        const type = properties.Type?.select?.name ||
                    properties.Category?.select?.name ||
                    (urls.length > 1 ? 'Carrousel' : 
                     urls.some(url => url.match(/\.(mp4|mov|webm|avi)(\?|$)/i)) ? 'Vidéo' : 'Image');

        // Extraction du compte
        const account = properties['Compte Instagram']?.select?.name ||
                       properties.Account?.select?.name ||
                       properties.Compte?.select?.name || '';

        return {
          id: row.id,
          title,
          urls,
          date: dateProperty,
          caption,
          type,
          account
        };
      })
      .filter(post => post.urls.length > 0); // Seulement les posts avec média

    res.status(200).json({
      success: true,
      posts: posts,
      meta: {
        total: posts.length,
        accounts: [...new Set(posts.map(p => p.account).filter(Boolean))]
      }
    });

  } catch (error) {
    console.error('Erreur API Notion:', error);
    res.status(500).json({
      success: false,
      error: error.message || "Erreur serveur interne"
    });
  }
};
