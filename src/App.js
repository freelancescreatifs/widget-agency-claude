import React, { useState, useEffect } from 'react';
import { Camera, Settings, RefreshCw, Edit3, X, ChevronLeft, ChevronRight, Play, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

// Configuration de l'API
const API_BASE = 'https://instagram-widget-claude.vercel.app/api';

// Composant pour afficher les erreurs
const ErrorDisplay = ({ error, onClose, onRetry }) => {
  if (!error) return null;

  const getErrorInfo = (error) => {
    // Erreurs réseau
    if (error.message && error.message.includes('Failed to fetch')) {
      return {
        title: 'Erreur de connexion',
        message: 'Impossible de contacter le serveur',
        type: 'network',
        icon: <WifiOff className="w-5 h-5" />,
        solutions: [
          'Vérifiez votre connexion internet',
          'Le serveur Vercel peut être en cours de redémarrage',
          'Réessayez dans quelques secondes'
        ]
      };
    }

    // Erreurs API
    if (error.code) {
      const errorMap = {
        'MISSING_API_KEY': {
          title: 'Clé API manquante',
          message: 'Vous devez entrer votre clé API Notion',
          type: 'config'
        },
        'INVALID_API_KEY_FORMAT': {
          title: 'Format de clé invalide',
          message: 'La clé doit commencer par "ntn_"',
          type: 'config'
        },
        'NOTION_API_ERROR': {
          title: 'Erreur Notion',
          message: error.message || 'Problème avec l\'API Notion',
          type: 'notion'
        }
      };

      return errorMap[error.code] || {
        title: 'Erreur inconnue',
        message: error.message || 'Une erreur inattendue s\'est produite',
        type: 'unknown'
      };
    }

    // Erreur générique
    return {
      title: 'Erreur',
      message: error.message || 'Une erreur s\'est produite',
      type: 'generic',
      icon: <AlertTriangle className="w-5 h-5" />
    };
  };

  const errorInfo = getErrorInfo(error);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2 text-red-600">
            {errorInfo.icon || <AlertTriangle className="w-5 h-5" />}
            <h3 className="font-semibold">{errorInfo.title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <p className="text-gray-700">{errorInfo.message}</p>
          
          {errorInfo.solutions && (
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-medium text-blue-800 mb-2">Solutions :</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {errorInfo.solutions.map((solution, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={onRetry}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Réessayer
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour les médias avec auto-slide
const MediaDisplay = ({ urls, type, index }) => {
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
        <span className="text-gray-400 text-sm">Pas de média</span>
      </div>
    );
  }

  const currentUrl = urls[currentIndex] || urls[0];

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-gray-100"
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
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4MCIgaGVpZ2h0PSIxMzUwIiB2aWV3Qm94PSIwIDAgMTA4MCAxMzUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTA4MCIgaGVpZ2h0PSIxMzUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01NDAgNjc1QzU2Ni01MjIgNjIyIDQ2NiA2NzUgNDY2QzcyOCA0NjYgNzg0IDUyMiA3ODQgNTc1Qzc4NCA2MjggNzI4IDY4NCA2NzUgNjg0QzYyMiA2ODQgNTY2IDYyOCA1NjYgNTc1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
          }}
        />
      )}

      {/* Icônes de type */}
      {type === 'Carrousel' && (
        <div className="absolute top-2 right-2">
          <div className="flex gap-0.5">
            <div className="w-1 h-3 bg-white rounded-full shadow"></div>
            <div className="w-1 h-3 bg-white rounded-full shadow"></div>
            <div className="w-1 h-3 bg-white rounded-full shadow"></div>
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
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1}/{urls.length}
          </div>

          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-1 rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-1 rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {urls.map((_, dotIndex) => (
              <button
                key={dotIndex}
                onClick={() => handleDotClick(dotIndex)}
                className={`w-2 h-2 rounded-full transition-all ${
                  dotIndex === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Composant principal
const InstagramNotionWidget = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Non connecté');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState(null);
  const [notionConfig, setNotionConfig] = useState({
    apiKey: '',
    databaseId: ''
  });

  // Profil par défaut
  const [profile, setProfile] = useState({
    username: 'votre_compte',
    fullName: 'Votre Nom',
    bio: '🚀 Entrepreneur Digital\n📸 Créateur de contenu\n🌟 Mentor business',
    profilePhoto: '',
    stats: {
      posts: 'auto',
      followers: '1,234',
      following: '567'
    }
  });

  const [editingProfile, setEditingProfile] = useState(false);

  // Charger la configuration sauvegardée
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('notion-config');
      const savedProfile = localStorage.getItem('profile-config');
      
      if (savedConfig) {
        setNotionConfig(JSON.parse(savedConfig));
      }
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (err) {
      console.warn('Erreur lors du chargement de la config:', err);
    }
  }, []);

  // Test de l'API
  const testAPI = async () => {
    try {
      const response = await fetch(`${API_BASE}/notion`);
      const data = await response.json();
      console.log('🧪 API Test:', data);
      return data.status === 'API Active';
    } catch (err) {
      console.error('❌ API Test Failed:', err);
      return false;
    }
  };

  // Connexion à Notion
  const connectToNotion = async () => {
    if (!notionConfig.apiKey || !notionConfig.databaseId) {
      setError({
        message: 'Veuillez remplir la clé API et l\'ID de base',
        code: 'MISSING_CREDENTIALS'
      });
      return;
    }

    setIsLoading(true);
    setConnectionStatus('🔄 Connexion...');
    setError(null);

    try {
      // Test de l'API d'abord
      const apiActive = await testAPI();
      if (!apiActive) {
        throw new Error('API non disponible');
      }

      const response = await fetch(`${API_BASE}/notion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: notionConfig.apiKey,
          databaseId: notionConfig.databaseId
        }),
      });

      const responseText = await response.text();
      console.log('📡 Raw Response:', responseText.substring(0, 200));

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Parse Error:', parseError);
        setError({
          message: 'Réponse du serveur invalide',
          debug: { responseStart: responseText.substring(0, 100) }
        });
        setConnectionStatus('❌ Erreur de format');
        return;
      }

      if (!response.ok || !data.success) {
        console.error('❌ API Error:', data);
        setError(data);
        setConnectionStatus(`❌ ${data.error || 'Erreur de connexion'}`);
        return;
      }

      // Succès !
      const validPosts = Array.isArray(data.posts) ? data.posts : [];
      setPosts(validPosts);
      
      const total = data.meta?.total || 0;
      const withMedia = data.meta?.withMedia || validPosts.length;
      
      setConnectionStatus(`✅ Connecté à Notion • ${withMedia}/${total} post(s)`);
      
      // Sauvegarder la config
      localStorage.setItem('notion-config', JSON.stringify(notionConfig));

    } catch (error) {
      console.error('❌ Connection Error:', error);
      setError({
        message: error.message || 'Erreur de connexion',
        type: 'network'
      });
      setConnectionStatus('❌ Erreur de réseau');
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarde du profil
  const saveProfile = () => {
    localStorage.setItem('profile-config', JSON.stringify(profile));
    setEditingProfile(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white relative">
      {/* Filigrane */}
      <div className="absolute top-2 left-2 z-20">
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
            title="Actualiser"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-600 hover:text-gray-800"
            title="Paramètres"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Profil */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-4">
          <div 
            className="relative cursor-pointer"
            onClick={() => setEditingProfile(true)}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                {profile.profilePhoto ? (
                  <img 
                    src={profile.profilePhoto} 
                    alt="Profil" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span 
                className="font-semibold text-gray-900 cursor-pointer hover:text-gray-700"
                onClick={() => setEditingProfile(true)}
              >
                {profile.username}
              </span>
              <button
                onClick={() => setEditingProfile(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-gray-900 mb-2">
              {profile.fullName}
            </div>
            <div className="flex gap-4 text-sm">
              <span>
                <strong className="text-gray-900">
                  {profile.stats.posts === 'auto' ? posts.length : profile.stats.posts}
                </strong>{' '}
                publications
              </span>
              <span 
                className="cursor-pointer text-gray-900 hover:text-gray-700"
                onClick={() => setEditingProfile(true)}
              >
                <strong>{profile.stats.followers}</strong> abonnés
              </span>
              <span 
                className="cursor-pointer text-gray-900 hover:text-gray-700"
                onClick={() => setEditingProfile(true)}
              >
                <strong>{profile.stats.following}</strong> suivi(e)s
              </span>
            </div>
          </div>
        </div>

        {profile.bio && (
          <div 
            className="mt-3 text-sm whitespace-pre-line cursor-pointer hover:text-gray-700"
            onClick={() => setEditingProfile(true)}
          >
            {profile.bio}
          </div>
        )}
      </div>

      {/* Edition du profil */}
      {editingProfile && (
        <div className="border-b bg-gray-50 p-4 space-y-3">
          <h3 className="font-medium text-gray-800 mb-3">Modifier le profil</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
              className="w-full p-2 border rounded text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full p-2 border rounded text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full p-2 border rounded text-sm h-20 resize-none"
              placeholder="Votre bio..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo de profil (URL)
            </label>
            <input
              type="url"
              value={profile.profilePhoto}
              onChange={(e) => setProfile(prev => ({ ...prev, profilePhoto: e.target.value }))}
              placeholder="https://exemple.com/photo.jpg"
              className="w-full p-2 border rounded text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Abonnés
              </label>
              <input
                type="text"
                value={profile.stats.followers}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  stats: { ...prev.stats, followers: e.target.value }
                }))}
                placeholder="1,234"
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suivi(e)s
              </label>
              <input
                type="text"
                value={profile.stats.following}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  stats: { ...prev.stats, following: e.target.value }
                }))}
                placeholder="567"
                className="w-full p-2 border rounded text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveProfile}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600"
            >
              Sauvegarder
            </button>
            <button
              onClick={() => setEditingProfile(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Configuration Notion */}
      {showSettings && (
        <div className="border-b bg-gray-50 p-4 space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Configuration Notion</h3>
            <p className="text-sm text-blue-700 mb-3">
              Nouvelle clé API format : <code className="bg-blue-100 px-1 rounded">ntn_...</code> 
              <br />
              <a href="https://notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Créer une intégration →
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
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de la base (32 caractères)
                </label>
                <input
                  type="text"
                  value={notionConfig.databaseId}
                  onChange={(e) => setNotionConfig(prev => ({ ...prev, databaseId: e.target.value }))}
                  placeholder="abc123def456..."
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              
              <button
                onClick={connectToNotion}
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Connexion...' : 'Connecter à Notion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 border-b flex items-center justify-between">
        <span>{connectionStatus}</span>
        {connectionStatus.includes('❌') && (
          <Wifi className="w-4 h-4 text-red-500" />
        )}
        {connectionStatus.includes('✅') && (
          <Wifi className="w-4 h-4 text-green-500" />
        )}
      </div>

      {/* Grille de posts */}
      <div className="p-1">
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 12 }).map((_, index) => {
            const post = posts[index];
            
            if (post) {
              return (
                <div
                  key={`post-${index}`}
                  className="aspect-[1080/1350] bg-gray-100 relative cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <MediaDisplay
                    urls={post.urls}
                    type={post.type}
                    index={index}
                  />
                  
                  {/* Caption au hover */}
                  {post.caption && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="text-white text-center text-xs p-2 max-w-full overflow-hidden">
                        <div className="line-clamp-3">{post.caption}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={`empty-${index}`}
                className="aspect-[1080/1350] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center"
              >
                <span className="text-gray-400 text-xs">Post {index + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message d'aide si pas de posts */}
      {posts.length === 0 && !isLoading && (
        <div className="p-8 text-center text-gray-500">
          <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm mb-2">Aucun post trouvé</p>
          <p className="text-xs">
            Configurez Notion et ajoutez des images dans votre base
          </p>
        </div>
      )}

      {/* Modal d'erreur */}
      <ErrorDisplay 
        error={error}
        onClose={() => setError(null)}
        onRetry={connectToNotion}
      />
    </div>
  );
};

export default InstagramNotionWidget;
