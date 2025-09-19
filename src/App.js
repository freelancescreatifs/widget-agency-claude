import React, { useState, useEffect } from 'react';
import { Camera, Settings, RefreshCw, Edit3, X, ChevronLeft, ChevronRight, Play, AlertTriangle, Wifi, WifiOff, Plus, UserPlus } from 'lucide-react';

// Configuration de l'API
const API_BASE = 'https://widget-agency-claude.vercel.app/api';

// Composant Modal plein écran
const PostModal = ({ post, onClose, onPrevious, onNext, hasPrevious, hasNext }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!post) return null;

  const handlePrevious = () => {
    if (post.urls.length > 1) {
      setCurrentIndex(prev => prev === 0 ? post.urls.length - 1 : prev - 1);
    }
  };

  const handleNext = () => {
    if (post.urls.length > 1) {
      setCurrentIndex(prev => (prev + 1) % post.urls.length);
    }
  };

  const currentUrl = post.urls[currentIndex] || post.urls[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Navigation entre posts */}
        {hasPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

        {/* Contenu principal */}
        <div className="flex items-center justify-center w-full h-full p-8">
          <div className="relative max-w-md max-h-full">
            {/* Média */}
            <div className="relative">
              {post.type === 'Vidéo' ? (
                <video
                  src={currentUrl}
                  className="max-w-full max-h-[80vh] object-contain"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={currentUrl}
                  alt={post.title}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              )}

              {/* Navigation carrousel dans modal */}
              {post.type === 'Carrousel' && post.urls.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {post.urls.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {currentIndex + 1}/{post.urls.length}
                  </div>
                </>
              )}
            </div>

            {/* Informations du post */}
            <div className="mt-4 text-white text-center">
              <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
              {post.caption && (
                <p className="text-sm text-gray-300 whitespace-pre-line">{post.caption}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">{post.date}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour gérer les comptes
const AccountManager = ({ accounts, onAddAccount, onClose }) => {
  const [newAccountName, setNewAccountName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newAccountName.trim() && !accounts.includes(newAccountName.trim())) {
      onAddAccount(newAccountName.trim());
      setNewAccountName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Gérer les comptes Instagram</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Comptes existants :</h4>
            <div className="space-y-1">
              {accounts.map(account => (
                <div key={account} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{account}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-2">Ajouter un nouveau compte :</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="Ex: Freelance Créatif, Business, Personnel..."
                className="w-full p-2 border rounded text-sm"
              />
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
                💡 <strong>Astuce :</strong> Créez ce nom exactement dans la colonne "Compte Instagram" de votre base Notion pour voir les posts associés.
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!newAccountName.trim() || accounts.includes(newAccountName.trim())}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter le compte
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Fermer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher les erreurs
const ErrorDisplay = ({ error, onClose, onRetry }) => {
  if (!error) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold">Erreur</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <p className="text-gray-700">{error.message || error.error}</p>
          
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

// Composant pour les médias avec CAPTION dans le hover
const MediaDisplay = ({ urls, type, index, onClick, caption, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => prev === 0 ? urls.length - 1 : prev - 1);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % urls.length);
  };

  const handleDotClick = (e, dotIndex) => {
    e.stopPropagation();
    setCurrentIndex(dotIndex);
  };

  if (!urls || urls.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Post {index + 1}</span>
      </div>
    );
  }

  const currentUrl = urls[currentIndex] || urls[0];

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-gray-100 cursor-pointer"
      onClick={onClick}
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

      {/* Navigation carrousel MANUELLE SEULEMENT */}
      {type === 'Carrousel' && urls.length > 1 && (
        <>
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1}/{urls.length}
          </div>

          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-1 rounded-full z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-1 rounded-full z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {urls.map((_, dotIndex) => (
              <button
                key={dotIndex}
                onClick={(e) => handleDotClick(e, dotIndex)}
                className={`w-2 h-2 rounded-full transition-all z-10 ${
                  dotIndex === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Caption hover - 1/3 DE LA PAGE avec CAPTION */}
      {onClick && (
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-60 transition-all duration-200 flex items-end opacity-0 hover:opacity-100">
          <div className="w-full h-1/3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center p-4">
            <div className="text-white text-center text-xs">
              {caption ? (
                <div className="space-y-1">
                  <div className="font-medium">{title || 'Post'}</div>
                  <div className="text-gray-300 line-clamp-2">{caption}</div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="font-medium">Cliquer pour voir en détail</div>
                  {type === 'Carrousel' && <div className="text-gray-300">{urls.length} photos</div>}
                  {type === 'Vidéo' && <div className="text-gray-300">📹 Vidéo</div>}
                </div>
              )}
            </div>
          </div>
        </div>
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
  const [connectionStatus, setConnectionStatus] = useState('Non connecté');
  const [showSettings, setShowSettings] = useState(false);
  const [showAccountManager, setShowAccountManager] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [notionConfig, setNotionConfig] = useState({
    apiKey: '',
    databaseId: ''
  });

  // Profils par compte
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

  const [editingProfile, setEditingProfile] = useState(false);

  // Charger la configuration sauvegardée
  useEffect(() => {
    try {
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
    } catch (err) {
      console.warn('Erreur lors du chargement de la config:', err);
    }
  }, []);

  // Fermer automatiquement les paramètres après connexion réussie
  useEffect(() => {
    if (connectionStatus.includes('✅')) {
      setShowSettings(false);
    }
  }, [connectionStatus]);

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

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data);
        setConnectionStatus(`❌ ${data.error || 'Erreur de connexion'}`);
        return;
      }

      // Succès !
      const validPosts = Array.isArray(data.posts) ? data.posts : [];
      setPosts(validPosts);
      
      // Extraire les comptes uniques depuis la colonne "Compte Instagram"
      const uniqueAccounts = [...new Set(validPosts.map(post => post.account || 'Principal'))];
      if (uniqueAccounts.length > 0) {
        setAccounts(uniqueAccounts);
        if (!uniqueAccounts.includes(activeAccount)) {
          setActiveAccount(uniqueAccounts[0]);
        }
        
        // Créer des profils par défaut pour les nouveaux comptes
        const newProfiles = { ...profiles };
        uniqueAccounts.forEach(account => {
          if (!newProfiles[account]) {
            newProfiles[account] = {
              username: account.toLowerCase().replace(/\s+/g, '_'),
              fullName: account,
              bio: `🚀 Compte ${account}`,
              profilePhoto: '',
              stats: {
                posts: 'auto',
                followers: '1,234',
                following: '567'
              }
            };
          }
        });
        setProfiles(newProfiles);
      }
      
      const total = data.meta?.total || 0;
      const withMedia = data.meta?.withMedia || validPosts.length;
      
      setConnectionStatus(`✅ Connecté à Notion • ${withMedia}/${total} post(s)`);
      
      // Sauvegarder la config
      localStorage.setItem('notion-config', JSON.stringify(notionConfig));

    } catch (error) {
      console.error('❌ Connection Error:', error);
      setError({
        message: 'Erreur de connexion',
        type: 'network'
      });
      setConnectionStatus('❌ Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter un nouveau compte
  const addAccount = (accountName) => {
    const newAccounts = [...accounts, accountName];
    setAccounts(newAccounts);
    
    // Créer un profil par défaut pour le nouveau compte
    const newProfiles = {
      ...profiles,
      [accountName]: {
        username: accountName.toLowerCase().replace(/\s+/g, '_'),
        fullName: accountName,
        bio: `🚀 Compte ${accountName}\n📸 Contenu de qualité`,
        profilePhoto: '',
        stats: {
          posts: 'auto',
          followers: '1,234',
          following: '567'
        }
      }
    };
    setProfiles(newProfiles);
    
    // Sauvegarder
    localStorage.setItem('accounts-config', JSON.stringify(newAccounts));
    localStorage.setItem('profiles-config', JSON.stringify(newProfiles));
    
    // Changer vers le nouveau compte
    setActiveAccount(accountName);
    setShowAccountManager(false);
  };

  // Sauvegarde du profil
  const saveProfile = () => {
    localStorage.setItem('profiles-config', JSON.stringify(profiles));
    localStorage.setItem('accounts-config', JSON.stringify(accounts));
    setEditingProfile(false);
  };

  // Filtrer les posts par compte actuel
  const filteredPosts = posts.filter(post => post.account === activeAccount);

  // Profil du compte actuel
  const currentProfile = profiles[activeAccount] || profiles['Principal'];

  // Gestion de la modal
  const openModal = (post) => {
    setSelectedPost(post);
  };

  const closeModal = () => {
    setSelectedPost(null);
  };

  const navigatePost = (direction) => {
    if (!selectedPost) return;
    const currentIndex = filteredPosts.findIndex(p => p.id === selectedPost.id);
    let newIndex;
    
    if (direction === 'previous') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredPosts.length - 1;
    } else {
      newIndex = currentIndex < filteredPosts.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedPost(filteredPosts[newIndex]);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Camera className="w-6 h-6" />
          <span className="font-semibold text-lg">Instagram</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAccountManager(true)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            title="Gérer les comptes"
          >
            <UserPlus className="w-5 h-5" />
          </button>
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
                {currentProfile.profilePhoto ? (
                  <img 
                    src={currentProfile.profilePhoto} 
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
                {currentProfile.username}
              </span>
              <button
                onClick={() => setEditingProfile(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-gray-900 mb-2">
              {currentProfile.fullName}
            </div>
            <div className="flex gap-4 text-sm">
              <span>
                <strong className="text-gray-900">
                  {currentProfile.stats.posts === 'auto' ? filteredPosts.length : currentProfile.stats.posts}
                </strong>{' '}
                publications
              </span>
              <span 
                className="cursor-pointer text-gray-900 hover:text-gray-700"
                onClick={() => setEditingProfile(true)}
              >
                <strong>{currentProfile.stats.followers}</strong> abonnés
              </span>
              <span 
                className="cursor-pointer text-gray-900 hover:text-gray-700"
                onClick={() => setEditingProfile(true)}
              >
                <strong>{currentProfile.stats.following}</strong> suivi(e)s
              </span>
            </div>
          </div>
        </div>

        {currentProfile.bio && (
          <div 
            className="mt-3 text-sm whitespace-pre-line cursor-pointer hover:text-gray-700"
            onClick={() => setEditingProfile(true)}
          >
            {currentProfile.bio}
          </div>
        )}
      </div>

      {/* Edition du profil */}
      {editingProfile && (
        <div className="border-b bg-gray-50 p-4 space-y-3">
          <h3 className="font-medium text-gray-800 mb-3">Modifier le profil - {activeAccount}</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={currentProfile.username}
              onChange={(e) => setProfiles(prev => ({ 
                ...prev, 
                [activeAccount]: { ...prev[activeAccount], username: e.target.value }
              }))}
              className="w-full p-2 border rounded text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              value={currentProfile.fullName}
              onChange={(e) => setProfiles(prev => ({ 
                ...prev, 
                [activeAccount]: { ...prev[activeAccount], fullName: e.target.value }
              }))}
              className="w-full p-2 border rounded text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={currentProfile.bio}
              onChange={(e) => setProfiles(prev => ({ 
                ...prev, 
                [activeAccount]: { ...prev[activeAccount], bio: e.target.value }
              }))}
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
              value={currentProfile.profilePhoto}
              onChange={(e) => setProfiles(prev => ({ 
                ...prev, 
                [activeAccount]: { ...prev[activeAccount], profilePhoto: e.target.value }
              }))}
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
                value={currentProfile.stats.followers}
                onChange={(e) => setProfiles(prev => ({ 
                  ...prev, 
                  [activeAccount]: { 
                    ...prev[activeAccount], 
                    stats: { ...prev[activeAccount].stats, followers: e.target.value }
                  }
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
                value={currentProfile.stats.following}
                onChange={(e) => setProfiles(prev => ({ 
                  ...prev, 
                  [activeAccount]: { 
                    ...prev[activeAccount], 
                    stats: { ...prev[activeAccount].stats, following: e.target.value }
                  }
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

      {/* Configuration Notion - SEULEMENT si pas connecté */}
      {showSettings && !connectionStatus.includes('✅') && (
        <div className="border-b bg-gray-50 p-4 space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Configuration Notion</h3>
            <p className="text-sm text-blue-700 mb-3">
              Clé API format : <code className="bg-blue-100 px-1 rounded">ntn_...</code> 
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
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        {connectionStatus.includes('✅') && (
          <Wifi className="w-4 h-4 text-green-500" />
        )}
      </div>

      {/* Onglets des comptes */}
      {accounts.length > 1 && (
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {accounts.map(account => (
              <button
                key={account}
                onClick={() => setActiveAccount(account)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium border-b-2 ${
                  activeAccount === account
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {account}
                <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                  {posts.filter(p => p.account === account).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grille de posts */}
      <div className="p-1">
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 12 }).map((_, index) => {
            const post = filteredPosts[index];
            
            if (post) {
              return (
                <div
                  key={`post-${index}`}
                  className="aspect-[1080/1350] bg-gray-100 relative"
                >
                  <MediaDisplay
                    urls={post.urls}
                    type={post.type}
                    index={index}
                    onClick={() => openModal(post)}
                    caption={post.caption}
                    title={post.title}
                  />
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
      {filteredPosts.length === 0 && !isLoading && (
        <div className="p-8 text-center text-gray-500">
          <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm mb-2">Aucun post trouvé pour {activeAccount}</p>
          <p className="text-xs">
            Configurez Notion et ajoutez des images avec le tag "{activeAccount}"
          </p>
        </div>
      )}

      {/* Filigrane en bas - DESIGN PRÉCÉDENT */}
      <div className="w-full flex justify-center py-2 bg-gray-50 border-t">
        <a 
          href="https://www.instagram.com/freelance.creatif/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Créé par @Freelancecreatif
        </a>
      </div>

      {/* Modal de gestion des comptes */}
      {showAccountManager && (
        <AccountManager
          accounts={accounts}
          onAddAccount={addAccount}
          onClose={() => setShowAccountManager(false)}
        />
      )}

      {/* Modal plein écran */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={closeModal}
          onPrevious={() => navigatePost('previous')}
          onNext={() => navigatePost('next')}
          hasPrevious={filteredPosts.length > 1}
          hasNext={filteredPosts.length > 1}
        />
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
