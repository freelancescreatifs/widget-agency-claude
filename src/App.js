import React, { useState, useEffect } from 'react';
import { Camera, Settings, RefreshCw, Edit3, X, ChevronLeft, ChevronRight, Play, AlertTriangle } from 'lucide-react';

// Configuration de l'API - Remplacez par votre domaine Vercel
const API_BASE = 'https://instagram-widget-claude.vercel.app/api';

// Composant pour afficher les erreurs de debug
const ErrorDebugger = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-red-700">Erreur de connexion Notion</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-medium text-red-600">Message d'erreur :</h4>
            <p className="text-sm bg-red-50 p-2 rounded mt-1">{error.message}</p>
          </div>
          
          {error.debug && (
            <div>
              <h4 className="font-medium text-orange-600">Informations de debug :</h4>
              <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                {JSON.stringify(error.debug, null, 2)}
              </pre>
            </div>
          )}
          
          {error.solutions && (
            <div>
              <h4 className="font-medium text-blue-600">Solutions suggérées :</h4>
              <ul className="text-sm mt-1 space-y-1">
                {error.solutions.map((solution, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="bg-blue-50 p-3 rounded">
            <h4 className="font-medium text-blue-700 mb-2">Vérifications à faire :</h4>
            <ol className="text-sm space-y-1">
              <li>1. Clé API format <code className="bg-blue-100 px-1 rounded">ntn_...</code></li>
              <li>2. ID base = 32 caractères exactement</li>
              <li>3. Base partagée avec votre intégration</li>
              <li>4. Colonne "Contenu" avec type "Files & media"</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reste du composant App (composants MediaDisplay, PostModal, etc.)
const MediaDisplay = ({ urls, type, index, onImageChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(type === 'Carrousel');
  const [lastManualAction, setLastManualAction] = useState(0);

  useEffect(() => {
    if (type === 'Carrousel' && isAutoSliding && urls.length > 1) {
      const now = Date.now();
      if (now - lastManualAction < 5000) return;

      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % urls.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [type, isAutoSliding, urls.length, lastManualAction]);

  const handlePrevious = () => {
    setCurrentIndex(prev => prev === 0 ? urls.length - 1 : prev - 1);
    setLastManualAction(Date.now());
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % urls.length);
    setLastManualAction(Date.now());
  };

  const handleDotClick = (dotIndex) => {
    setCurrentIndex(dotIndex);
    setLastManualAction(Date.now());
  };

  if (!urls || urls.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">Pas de média</span>
      </div>
    );
  }

  const currentUrl = urls[currentIndex] || urls[0];

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setIsAutoSliding(false)}
      onMouseLeave={() => setIsAutoSliding(true)}
    >
      {type === 'Vidéo' ? (
        <video
          src={currentUrl}
          className="w-full h-full object-cover"
          style={{ aspectRatio: '1080/1350' }}
          muted
          onMouseEnter={(e) => e.target.play()}
          onMouseLeave={(e) => e.target.pause()}
        />
      ) : (
        <img
          src={currentUrl}
          alt=""
          className="w-full h-full object-cover"
          style={{ aspectRatio: '1080/1350' }}
        />
      )}

      {/* Icônes type de contenu */}
      {type === 'Carrousel' && (
        <div className="absolute top-2 right-2">
          <div className="flex gap-0.5">
            <div className="w-1 h-3 bg-white rounded-full"></div>
            <div className="w-1 h-3 bg-white rounded-full"></div>
            <div className="w-1 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      )}

      {type === 'Vidéo' && (
        <div className="absolute top-2 right-2">
          <svg width="16" height="12" viewBox="0 0 16 12" className="text-white drop-shadow-md">
            <rect x="0" y="2" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <polygon points="11,4 15,2 15,10 11,8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
      )}

      {/* Navigation carrousel */}
      {type === 'Carrousel' && urls.length > 1 && (
        <>
          {/* Compteur et statut */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center gap-2">
            <span>{currentIndex + 1}/{urls.length}</span>
            {isAutoSliding && Date.now() - lastManualAction >= 5000 && (
              <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
            )}
          </div>

          {/* Flèches de navigation */}
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-1 rounded-full transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-1 rounded-full transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Points de navigation */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {urls.map((_, dotIndex) => (
              <button
                key={dotIndex}
                onClick={() => handleDotClick(dotIndex)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  dotIndex === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>

          {/* Barre de progression auto-slide */}
          {isAutoSliding && Date.now() - lastManualAction >= 5000 && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black bg-opacity-30">
              <div className="h-full bg-white animate-pulse" style={{
                width: '100%',
                animation: 'progress 3s linear infinite'
              }}></div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Composant principal
const InstagramNotionWidget = () => {
  const [posts, setPosts] = useState([]);
  const [accounts, setAccounts] = useState(['Principal']);
  const [activeAccount, setActiveAccount] = useState('Principal');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showDebugError, setShowDebugError] = useState(false);
  const [debugError, setDebugError] = useState(null);
  const [notionConfig, setNotionConfig] = useState({
    apiKey: '',
    databaseId: ''
  });

  // Configuration du profil par compte
  const [profiles, setProfiles] = useState({
    'Principal': {
      username: 'votre_compte',
      fullName: 'Votre Nom',
      bio: '🚀 Entrepreneur Digital\n📸 Créateur de contenu\n🌟 Mentor business',
      profilePhoto: '',
      stats: {
        posts: 'auto',
        followers: '1,234',
        following: '567'
      }
    }
  });

  // Charger la configuration depuis localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('notion-config');
    const savedProfiles = localStorage.getItem('profiles-config');
    const savedAccounts = localStorage.getItem('accounts-config');
    
    if (savedConfig) {
      setNotionConfig(JSON.parse(savedConfig));
    }
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    }
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    }
  }, []);

  // Fonction de connexion à Notion avec debug avancé
  const connectToNotion = async () => {
    if (!notionConfig.apiKey || !notionConfig.databaseId) {
      setConnectionStatus('❌ Clé API et ID de base requis');
      return;
    }

    setIsLoading(true);
    setConnectionStatus('🔄 Connexion en cours...');
    setDebugError(null);

    try {
      const response = await fetch(`${API_BASE}/notion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: notionConfig.apiKey,
          databaseId: notionConfig.databaseId,
          action: 'test'
        }),
      });

      const responseText = await response.text();
      console.log('🔍 Raw API Response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        setDebugError({
          message: 'Réponse API invalide - Le serveur ne renvoie pas du JSON valide',
          debug: {
            responseStart: responseText.substring(0, 200),
            parseError: parseError.message,
            statusCode: response.status
          },
          solutions: [
            'Vérifiez que votre clé API commence par "ntn_"',
            'Vérifiez que l\'ID de base fait exactement 32 caractères',
            'Assurez-vous que la base est partagée avec votre intégration'
          ]
        });
        setShowDebugError(true);
        setConnectionStatus('❌ Erreur de format de réponse');
        return;
      }

      if (!response.ok || !data.success) {
        console.error('❌ API Error:', data);
        setDebugError(data);
        setShowDebugError(true);
        setConnectionStatus(`❌ ${data.error || 'Erreur de connexion'}`);
        return;
      }

      // Succès
      setPosts(data.posts || []);
      setConnectionStatus(`✅ Connecté à Notion • ${data.meta.withMedia}/${data.meta.total} post(s)`);
      
      // Sauvegarder la config
      localStorage.setItem('notion-config', JSON.stringify(notionConfig));

    } catch (error) {
      console.error('❌ Network Error:', error);
      setDebugError({
        message: 'Erreur de réseau - Impossible de contacter l\'API',
        debug: {
          error: error.message,
          apiUrl: `${API_BASE}/notion`
        },
        solutions: [
          'Vérifiez votre connexion internet',
          'L\'API Vercel est peut-être en cours de déploiement',
          'Essayez à nouveau dans quelques minutes'
        ]
      });
      setShowDebugError(true);
      setConnectionStatus('❌ Erreur de réseau');
    } finally {
      setIsLoading(false);
    }
  };

  // Interface simplifiée pour le test
  return (
    <div className="w-full max-w-md mx-auto bg-white">
      {/* Filigrane */}
      <div className="absolute top-2 left-2 z-10">
        <a 
          href="https://www.instagram.com/freelance.creatif/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded hover:bg-opacity-70 transition-opacity"
        >
          Créé par @Freelancecreatif
        </a>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Camera className="w-6 h-6" />
          <span className="font-semibold text-lg">Instagram</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={connectToNotion}
            disabled={isLoading}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-600 hover:text-gray-800"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Configuration */}
      {showSettings && (
        <div className="border-b bg-gray-50 p-4 space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Configuration Notion</h3>
            <p className="text-sm text-blue-700 mb-3">
              Format clé API : <code className="bg-blue-100 px-1 rounded">ntn_...</code> 
              <br />
              <a href="https://notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Obtenir une clé API →
              </a>
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clé API Notion
                </label>
                <input
                  type="password"
                  value={notionConfig.apiKey}
                  onChange={(e) => setNotionConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="ntn_abc123..."
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de la base de données (32 caractères)
                </label>
                <input
                  type="text"
                  value={notionConfig.databaseId}
                  onChange={(e) => setNotionConfig(prev => ({ ...prev, databaseId: e.target.value }))}
                  placeholder="abc123def456..."
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
              
              <button
                onClick={connectToNotion}
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connexion...' : 'Connecter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 border-b">
        {connectionStatus}
        {debugError && (
          <button
            onClick={() => setShowDebugError(true)}
            className="ml-2 text-red-600 hover:text-red-800 underline"
          >
            Voir détails →
          </button>
        )}
      </div>

      {/* Message d'information */}
      <div className="p-4 text-center text-gray-500">
        <p className="text-sm">
          Configurez votre connexion Notion ci-dessus pour voir vos posts Instagram.
        </p>
      </div>

      {/* Modal de debug */}
      <ErrorDebugger 
        error={debugError} 
        onClose={() => setShowDebugError(false)} 
      />

      {/* Style pour l'animation de progression */}
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default InstagramNotionWidget;
