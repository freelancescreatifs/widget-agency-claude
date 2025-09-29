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
    const { apiKey, databaseId, action, postId, newDate, pageId, position } = req.body;

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

    // ========== NOUVELLE ACTION : Mise à jour de la position ==========
    if (action === 'updatePosition' && (postId || pageId) && position !== undefined) {
      try {
        const updateResponse = await fetch(`https://api.notion.com/v1/pages/${postId || pageId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
          },
          body: JSON.stringify({
            properties: {
              "Position": {
                number: position
              }
            }
          })
        });

        const updateResult = await updateResponse.json();

        if (updateResponse.ok) {
          res.status(200).json({
            success: true,
            message: `Position ${position} mise à jour`,
            data: updateResult
          });
        } else {
          res.status(400).json({
            success: false,
            error: `Erreur mise à jour position: ${updateResponse.status}`,
            details: updateResult
          });
        }
        return;
      } catch (error) {
        res.status(500).json({
          success: false,
          error: "Erreur lors de la mise à jour de la position",
          details: error.message
        });
        return;
      }
    }

    // Action de mise à jour d'un post (existant)
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
              "Date": {
                date: { start: newDate }
              }
            }
          })
        });

        const updateResult = await updateResponse.json();

        if (updateResponse.ok) {
          res.status(200).json({
            success: true,
            message: "Post mis à jour avec succès",
            data: updateResult
          });
        } else {
          res.status(400).json({
            success: false,
            error: `Erreur mise à jour: ${updateResponse.status}`,
            details: updateResult
          });
        }
        return;
      } catch (error) {
        res.status(500).json({
          success: false,
          error: "Erreur lors de la mise à jour",
          details: error.message
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
            property: 'Position',
            direction: 'ascending'
          },
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
                     `Post ${row.id.slice(-6)}`;

        // Extraction des fichiers média - ajout de "Couverture"
        const contentProperty = properties.Couverture?.files ||
                               properties.Contenu?.files || 
                               properties.Content?.files || 
                               properties.Media?.files || 
                               properties['Files & media']?.files ||
                               properties.Fichiers?.files ||
                               properties.Images?.files || [];

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
                           properties.Publish?.date?.start ||
                           new Date().toISOString().split('T')[0];

        // Extraction du caption
        const caption = properties.Caption?.rich_text?.[0]?.text?.content ||
                       properties.Description?.rich_text?.[0]?.text?.content ||
                       properties.Text?.rich_text?.[0]?.text?.content ||
                       properties.Texte?.rich_text?.[0]?.text?.content || 
                       '';

        // Extraction du type
        const type = properties.Type?.select?.name ||
                    properties.Category?.select?.name ||
                    properties.Catégorie?.select?.name ||
                    (urls.length > 1 ? 'Carrousel' : 
                     urls.some(url => url.match(/\.(mp4|mov|webm|avi)(\?|$)/i)) ? 'Vidéo' : 'Image');

        // Extraction du compte
        const account = properties['Compte Instagram']?.select?.name ||
                       properties['Account Instagram']?.select?.name ||
                       properties.Account?.select?.name ||
                       properties.Compte?.select?.name ||
                       properties.Instagram?.select?.name || '';

        // Extraction de la position
        const position = properties.Position?.number || 0;

        return {
          id: row.id,
          title,
          urls,
          date: dateProperty,
          caption,
          type,
          account,
          position
        };
      })
      .filter(post => post.urls.length > 0);

    // Extraction des comptes uniques
    const accounts = [...new Set(posts.map(p => p.account).filter(Boolean))];

    res.status(200).json({
      success: true,
      posts: posts,
      meta: {
        total: posts.length,
        accounts: accounts
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
