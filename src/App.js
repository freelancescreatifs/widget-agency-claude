import React, { useState, useEffect } from 'react';
import { Camera, Settings, RefreshCw, Edit3, X, ChevronLeft, ChevronRight, Play, Plus } from 'lucide-react';

// Configuration de l'API
const API_BASE = 'https://widget-agency-claude.vercel.app/api';

// Composant pour afficher les médias
const MediaDisplay = ({ urls, type }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!urls || urls.length === 0) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">Pas de média</span>
      </div>
    );
  }

  const isVideo = (url) => {
    return url.match(/\.(mp4|mov|webm|avi)(\?|$)/i) || type === 'Vidéo';
  };

  const currentUrl = urls[currentIndex];
  const isCurrentVideo = isVideo(currentUrl);

  return (
    <div className="relative w-full h-full group">
      {isCurrentVideo ? (
        <video
          src={currentUrl}
          className="w-full h-full object-cover"
          style={{ aspectRatio: '1080/1350' }}
          controls={false}
          muted
          loop
        />
      ) : (
        <img
          src={currentUrl}
          alt="Post"
          className="w-full h-full object-cover"
          style={{ aspectRatio: '1080/1350' }}
          onError={(e) => {
            e.target.src = `https://picsum.photos/1080/1350?random=${Date.now()}`;
          }}
        />
      )}

      {/* Icônes type de contenu */}
      {urls.length > 1 && (
        <div className="absolute top-2 right-2 text-white drop-shadow-md">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="6" height="18"/>
            <rect x="9" y="3" width="6" height="18"/>
            <rect x="15" y="3" width="6" height="18"/>
          </svg>
        </div>
      )}
      
      {isCurrentVideo && (
        <div className="absolute top-2 right-2 text-white drop-shadow-md">
          <Play size={16} fill="currentColor" />
        </div>
      )}

      {/* Navigation carrousel */}
      {urls.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(prev => prev > 0 ? prev - 1 : urls.length - 1);
            }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={16} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(prev => prev < urls.length - 1 ? prev + 1 : 0);
            }}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={16} />
          </button>

          {/* Points de navigation */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {urls.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Overlay au hover avec titre */}
      <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
        <div className="w-full bg-black bg-opacity-60 text-white text-xs p-2">
          <div className="font-medium truncate">
            {type === 'Carrousel' ? `${urls.length} photos` : type || 'Image'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Modal pour affichage détaillé
const PostModal = ({ post, isOpen, onClose, onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || !post) return null;

  const urls = post.urls || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X size={24} />
        </button>

        {/* Navigation entre posts */}
        {onNavigate && (
          <>
            <button
              onClick={() => onNavigate('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={() => onNavigate('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        <div className="flex flex-col items-center">
          {/* Média principal */}
          <div className="relative">
            {urls[currentIndex] && (
              <>
                {post.type === 'Vidéo' ? (
                  <video
                    src={urls[currentIndex]}
                    className="max-w-md max-h-[70vh] object-contain"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    src={urls[currentIndex]}
                    alt={post.title}
                    className="max-w-md max-h-[70vh] object-contain"
                  />
                )}

                {/* Navigation carrousel dans modal */}
                {urls.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : urls.length - 1)}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setCurrentIndex(prev => prev < urls.length - 1 ? prev + 1 : 0)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2"
                    >
                      <ChevronRight size={20} />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {urls.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Informations du post */}
          <div className="text-white text-center mt-4 max-w-md">
            <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
            {post.caption && <p className="text-sm text-gray-300 mb-2">{post.caption}</p>}
            <p className="text-xs text-gray-400">
              {post.date && new Date(post.date).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal
const InstagramNotionWidget = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isProfileEdit, setIsProfileEdit] = useState(false);
  const [notionApiKey, setNotionApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draggedPost, setDraggedPost] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Gestion multi-comptes
  const [accounts, setAccounts] = useState(['Principal']);
  const [activeAccount, setActiveAccount] = useState('Principal');
  const [isAccountManager, setIsAccountManager] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');

  // Profils par compte
  const [profiles, setProfiles] = useState({
    'Principal': {
      username: 'mon_compte',
      fullName: 'Mon Compte',
      bio: '🚀 Créateur de contenu\n📸 Planning Instagram\n📍 Paris, France',
      profilePhoto: '',
      posts: '0',
      followers: '1,234',
      following: '567'
    }
  });

  // Obtenir le profil du compte actif
  const getProfile = (account) => {
    return profiles[account] || profiles['Principal'];
  };

  // Charger les données au démarrage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('notionApiKey');
    const savedDbId = localStorage.getItem('databaseId');
    const savedProfiles = localStorage.getItem('instagramProfiles');
    const savedAccounts = localStorage.getItem('instagramAccounts');
    
    if (savedApiKey) setNotionApiKey(savedApiKey);
    if (savedDbId) setDatabaseId(savedDbId);
    if (savedProfiles) {
      try {
        setProfiles(JSON.parse(savedProfiles));
      } catch (e) {
        console.error('Erreur parsing profiles:', e);
      }
    }
    if (savedAccounts) {
      try {
        const accounts = JSON.parse(savedAccounts);
        setAccounts(accounts);
        if (accounts.length > 0) setActiveAccount(accounts[0]);
      } catch (e) {
        console.error('Erreur parsing accounts:', e);
      }
    }

    if (savedApiKey && savedDbId) {
      fetchPosts(savedApiKey, savedDbId);
    }
  }, []);

  // Fetch posts from Notion
  const fetchPosts = async (apiKey = notionApiKey, dbId = databaseId) => {
    try {
      setConnectionStatus('Connexion en cours...');
      
      const response = await fetch(`${API_BASE}/notion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey,
          databaseId: dbId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
        setConnectionStatus(`✅ Connecté à Notion • ${data.posts.length} post(s)`);
        setIsConfigOpen(false);
      } else {
        setConnectionStatus(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      setConnectionStatus('❌ Erreur de connexion Notion');
      console.error('Erreur:', error);
    }
  };

  // Connecter à Notion
  const connectToNotion = async () => {
    if (!notionApiKey || !databaseId) {
      setConnectionStatus('❌ Veuillez remplir tous les champs');
      return;
    }

    localStorage.setItem('notionApiKey', notionApiKey);
    localStorage.setItem('databaseId', databaseId);
    
    await fetchPosts();
  };

  // Sauvegarder profil
  const saveProfile = (account, profileData) => {
    const newProfiles = { ...profiles, [account]: profileData };
    setProfiles(newProfiles);
    localStorage.setItem('instagramProfiles', JSON.stringify(newProfiles));
  };

  // Ajouter un nouveau compte
  const addAccount = () => {
    if (!newAccountName.trim() || accounts.includes(newAccountName.trim())) {
      return;
    }

    const newAccount = newAccountName.trim();
    const newAccounts = [...accounts, newAccount];
    setAccounts(newAccounts);
    
    // Créer un profil par défaut pour le nouveau compte
    const newProfile = {
      username: newAccount.toLowerCase().replace(/\s+/g, '_'),
      fullName: newAccount,
      bio: `🚀 ${newAccount}\n📸 Créateur de contenu\n📍 Paris, France`,
      profilePhoto: '',
      posts: '0',
      followers: '1,234',
      following: '567'
    };
    
    const newProfiles = { ...profiles, [newAccount]: newProfile };
    setProfiles(newProfiles);
    
    // Sauvegarder
    localStorage.setItem('instagramAccounts', JSON.stringify(newAccounts));
    localStorage.setItem('instagramProfiles', JSON.stringify(newProfiles));
    
    setActiveAccount(newAccount);
    setNewAccountName('');
    setIsAccountManager(false);
  };

  // Supprimer un compte
  const removeAccount = (accountToRemove) => {
    if (accountToRemove === 'Principal' || accounts.length <= 1) return;
    
    const newAccounts = accounts.filter(acc => acc !== accountToRemove);
    setAccounts(newAccounts);
    
    if (activeAccount === accountToRemove) {
      setActiveAccount(newAccounts[0]);
    }
    
    // Supprimer le profil
    const newProfiles = { ...profiles };
    delete newProfiles[accountToRemove];
    setProfiles(newProfiles);
    
    localStorage.setItem('instagramAccounts', JSON.stringify(newAccounts));
    localStorage.setItem('instagramProfiles', JSON.stringify(newProfiles));
  };

  // Filtrer les posts par compte actif
  const filteredPosts = posts.filter(post => {
    if (activeAccount === 'Principal') {
      return !post.account || post.account === 'Principal' || post.account === '';
    }
    return post.account === activeAccount;
  });

  // Drag & Drop handlers (corrigés)
  const handleDragStart = (e, post, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Nécessaire pour certains navigateurs
    setDraggedPost({ post, originalIndex: index });
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    // Seulement clear si on quitte vraiment l'élément
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedPost || draggedPost.originalIndex === dropIndex) {
      setDraggedPost(null);
      return;
    }

    try {
      // Réorganiser les posts visuellement d'abord
      const newFilteredPosts = [...filteredPosts];
      const [movedPost] = newFilteredPosts.splice(draggedPost.originalIndex, 1);
      newFilteredPosts.splice(dropIndex, 0, movedPost);

      // Calculer les nouvelles dates
      const today = new Date();
      const postsWithNewDates = newFilteredPosts.map((post, index) => {
        const newDate = new Date(today);
        newDate.setDate(today.getDate() + index);
        return {
          ...post,
          date: newDate.toISOString().split('T')[0]
        };
      });

      // Mettre à jour l'état immédiatement pour un feedback visuel
      const updatedAllPosts = posts.map(post => {
        const updatedPost = postsWithNewDates.find(p => p.id === post.id);
        return updatedPost || post;
      });

      setPosts(updatedAllPosts);

      // Appel optionnel à l'API pour synchroniser avec Notion
      // (vous pouvez implémenter ceci plus tard)
      console.log('Posts réorganisés avec nouvelles dates:', postsWithNewDates);

    } catch (error) {
      console.error('Erreur lors de la réorganisation:', error);
    }

    setDraggedPost(null);
  };

  // Créer une grille de 12 éléments (3x4)
  const gridItems = Array.from({ length: 12 }, (_, index) => {
    const post = filteredPosts[index];
    return post || null;
  });

  const currentProfile = getProfile(activeAccount);

  return (
    <div className="w-full max-w-md mx-auto bg-white">
      {/* Header Instagram */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Camera size={24} />
          <span className="font-semibold text-lg">Instagram</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchPosts()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={() => setIsConfigOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Paramètres"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Profil Instagram */}
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div 
            className="relative cursor-pointer group"
            onClick={() => setIsProfileEdit(true)}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                {currentProfile.profilePhoto ? (
                  <img
                    src={currentProfile.profilePhoto}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                    <Camera size={24} className="text-gray-500" />
                  </div>
                )}
              </div>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Edit3 size={16} className="text-white" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{filteredPosts.length}</div>
                <div className="text-xs text-gray-500">publications</div>
              </div>
              <div 
                className="text-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                onClick={() => setIsProfileEdit(true)}
              >
                <div className="font-semibold text-gray-900">{currentProfile.followers}</div>
                <div className="text-xs text-gray-500">abonnés</div>
              </div>
              <div 
                className="text-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                onClick={() => setIsProfileEdit(true)}
              >
                <div className="font-semibold text-gray-900">{currentProfile.following}</div>
                <div className="text-xs text-gray-500">suivi(e)s</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div 
            className="font-semibold mb-1 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => setIsProfileEdit(true)}
          >
            {currentProfile.fullName}
          </div>
          <div className="text-sm whitespace-pre-line text-gray-700">
            {currentProfile.bio}
          </div>
        </div>
      </div>

      {/* Status de connexion */}
      {connectionStatus && (
        <div className="px-4 mb-4">
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {connectionStatus}
          </div>
        </div>
      )}

      {/* Onglets comptes avec bouton + */}
      <div className="flex items-center space-x-2 px-4 mb-4 overflow-x-auto">
        {accounts.map((account) => (
          <button
            key={account}
            onClick={() => setActiveAccount(account)}
            className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
              activeAccount === account
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {account}
            <span className="ml-1 text-xs opacity-75">
              ({posts.filter(p => 
                account === 'Principal' 
                  ? (!p.account || p.account === 'Principal' || p.account === '')
                  : p.account === account
              ).length})
            </span>
          </button>
        ))}
        
        <button
          onClick={() => setIsAccountManager(true)}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          title="Gérer les comptes"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Grille d'images 3x4 avec drag & drop */}
      <div className="grid grid-cols-3 gap-1 p-4">
        {gridItems.map((post, index) => (
          <div
            key={post?.id || `empty-${index}`}
            className={`relative bg-gray-100 transition-all duration-200 ${
              dragOverIndex === index ? 'bg-blue-200 scale-105 border-2 border-blue-400' : ''
            }`}
            style={{ aspectRatio: '1080/1350' }}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          >
            {post ? (
              <div
                className="w-full h-full cursor-move select-none"
                draggable={true}
                onDragStart={(e) => handleDragStart(e, post, index)}
                onClick={() => {
                  setSelectedPost(post);
                  setModalOpen(true);
                }}
              >
                <MediaDisplay urls={post.urls} type={post.type} />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                Vide
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Configuration Notion</h3>
              <button onClick={() => setIsConfigOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Clé API Notion
                </label>
                <input
                  type="text"
                  value={notionApiKey}
                  onChange={(e) => setNotionApiKey(e.target.value)}
                  placeholder="ntn_..."
                  className="w-full p-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: ntn_abc123... (nouveau format Notion)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  ID de la base de données
                </label>
                <input
                  type="text"
                  value={databaseId}
                  onChange={(e) => setDatabaseId(e.target.value)}
                  placeholder="32 caractères"
                  className="w-full p-2 border rounded"
                />
              </div>

              <button
                onClick={connectToNotion}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Connecter à Notion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gestion des comptes */}
      {isAccountManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Gérer les comptes</h3>
              <button onClick={() => setIsAccountManager(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Ajouter un compte */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ajouter un nouveau compte
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="Ex: Freelance Créatif"
                    className="flex-1 p-2 border rounded"
                    onKeyPress={(e) => e.key === 'Enter' && addAccount()}
                  />
                  <button
                    onClick={addAccount}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Liste des comptes existants */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Comptes existants
                </label>
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <div key={account} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="font-medium">{account}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setActiveAccount(account)}
                          className={`text-xs px-2 py-1 rounded ${
                            activeAccount === account 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          }`}
                        >
                          {activeAccount === account ? 'Actif' : 'Activer'}
                        </button>
                        {account !== 'Principal' && (
                          <button
                            onClick={() => removeAccount(account)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-500">
                💡 Astuce: Assignez vos posts aux comptes dans la colonne "Compte Instagram" de votre base Notion
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edition du profil */}
      {isProfileEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Modifier le profil - {activeAccount}</h3>
              <button onClick={() => setIsProfileEdit(false)}>
                <X size={20} />
              </button>
            </div>

            <ProfileEditForm
              profile={currentProfile}
              onSave={(profileData) => {
                saveProfile(activeAccount, profileData);
                setIsProfileEdit(false);
              }}
              onCancel={() => setIsProfileEdit(false)}
            />
          </div>
        </div>
      )}

      {/* Modal d'affichage détaillé */}
      <PostModal
        post={selectedPost}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPost(null);
        }}
        onNavigate={(direction) => {
          const currentIndex = filteredPosts.findIndex(p => p.id === selectedPost.id);
          let newIndex;
          if (direction === 'next') {
            newIndex = currentIndex < filteredPosts.length - 1 ? currentIndex + 1 : 0;
          } else {
            newIndex = currentIndex > 0 ? currentIndex - 1 : filteredPosts.length - 1;
          }
          setSelectedPost(filteredPosts[newIndex]);
        }}
      />

      {/* Filigrane discret en bas */}
      <div className="border-t bg-gray-50 py-2">
        <div className="text-center">
          <a
            href="https://www.instagram.com/freelance.creatif/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Créé par @Freelancecreatif
          </a>
        </div>
      </div>
    </div>
  );
};

// Composant pour éditer le profil
const ProfileEditForm = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState(profile);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nom d'utilisateur</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nom complet</label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          rows={3}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Photo de profil (URL)</label>
        <input
          type="url"
          value={formData.profilePhoto}
          onChange={(e) => setFormData({...formData, profilePhoto: e.target.value})}
          placeholder="https://..."
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Publications</label>
          <input
            type="text"
            value={formData.posts}
            onChange={(e) => setFormData({...formData, posts: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Abonnés</label>
          <input
            type="text"
            value={formData.followers}
            onChange={(e) => setFormData({...formData, followers: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Suivi(e)s</label>
          <input
            type="text"
            value={formData.following}
            onChange={(e) => setFormData({...formData, following: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => onSave(formData)}
          className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Sauvegarder
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

export default InstagramNotionWidget;
