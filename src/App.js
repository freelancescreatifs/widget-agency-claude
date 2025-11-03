import React, { useState, useEffect } from 'react';
import { Camera, Settings, RefreshCw, Edit3, X, ChevronLeft, ChevronRight, Play, Plus, ChevronDown } from 'lucide-react';

const API_BASE = 'https://freelance-creatif.vercel.app/api';

// 📋 Messages d'erreur détaillés en français
const ERROR_MESSAGES = {
  STORAGE_READ: "⚠️ Impossible de lire les données sauvegardées. Vérifiez que votre navigateur autorise le stockage local.",
  STORAGE_WRITE: "⚠️ Impossible de sauvegarder les données. Vérifiez l'espace de stockage disponible dans votre navigateur.",
  API_KEY_MISSING: "🔑 Veuillez d'abord saisir votre clé API Notion.\n\nRendez-vous sur notion.so/my-integrations pour créer une intégration et obtenir votre clé API.",
  DATABASE_ID_MISSING: "🗂️ Veuillez saisir l'ID de votre base de données Notion.\n\nVous pouvez le trouver dans l'URL de votre base de données.",
  EMPTY_FIELDS: "📝 Veuillez remplir tous les champs requis :\n• Clé API Notion\n• ID de la base de données",
  INVALID_API_KEY: "🔑 Format de clé API invalide.\n\nVotre clé doit commencer par 'secret_' ou 'ntn_' suivi de caractères alphanumériques.\n\nExemple: secret_abc123...",
  INVALID_DATABASE_ID: "🗂️ ID de base de données invalide.\n\nL'ID doit contenir exactement 32 caractères hexadécimaux (0-9, a-f).\n\nExemple: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p",
  NOTION_CONNECTION: "🔌 Impossible de se connecter à Notion.\n\nVérifications :\n✓ Votre connexion internet\n✓ Votre clé API est valide\n✓ L'intégration a accès à la base de données",
  NOTION_SYNC_ERROR: "❌ Erreur lors de la synchronisation avec Notion.\n\nVérifiez :\n• La clé API est correcte\n• L'ID de base de données est valide\n• L'intégration a les permissions nécessaires",
  NOTION_UPDATE_ERROR: "❌ Échec de la mise à jour dans Notion.\n\nAssurez-vous que :\n• L'intégration a les permissions d'écriture\n• La propriété 'Date' existe dans votre base\n• Le format de date est valide",
  NETWORK_ERROR: "🌐 Erreur réseau détectée.\n\nActions recommandées :\n• Vérifiez votre connexion internet\n• Réessayez dans quelques secondes\n• Rechargez la page si le problème persiste",
  ACCOUNT_NAME_REQUIRED: "👤 Veuillez entrer un nom pour le nouveau compte.",
  ACCOUNT_EXISTS: "⚠️ Un compte avec ce nom existe déjà.\n\nVeuillez choisir un nom différent.",
  NO_POSTS_FOUND: "📭 Aucun post trouvé dans cette base de données.\n\nAssurez-vous que :\n• Votre base Notion contient des entrées\n• Les propriétés requises sont présentes\n• L'intégration a accès à la base",
  PROPERTY_MISSING: "⚠️ Propriété Notion manquante.\n\nVérifiez que votre base Notion contient les colonnes suivantes :\n• Titre (Title)\n• Date (Date)\n• Caption (Text)\n• URLs (Files & media)",
  UNKNOWN_ERROR: "❌ Une erreur inattendue s'est produite.\n\nVeuillez réessayer. Si le problème persiste, vérifiez la console pour plus de détails."
};

// 📊 Messages de succès
const SUCCESS_MESSAGES = {
  POSTS_LOADED: (count) => `✅ ${count} post${count > 1 ? 's' : ''} chargé${count > 1 ? 's' : ''} avec succès`,
  NEW_POSTS: (count) => `🎉 ${count} nouveau${count > 1 ? 'x' : ''} post${count > 1 ? 's' : ''} ajouté${count > 1 ? 's' : ''}`,
  FEED_UP_TO_DATE: "✓ Votre feed est à jour",
  DATE_UPDATED: (date) => `📅 Date mise à jour : ${new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
  PROFILE_SAVED: "✓ Profil sauvegardé avec succès",
  ACCOUNT_ADDED: (name) => `✓ Compte "${name}" ajouté`,
  ACCOUNT_REMOVED: (name) => `✓ Compte "${name}" supprimé`,
  CONFIG_SAVED: "✓ Configuration sauvegardée",
  MAPPINGS_SAVED: "✅ Configuration des propriétés sauvegardée avec succès"
};

const detectMediaType = (urls) => {
  if (!urls || urls.length === 0) return 'Image';
  
  const hasVideo = urls.some(url => 
    url.match(/\.(mp4|mov|webm|avi|m4v)(\?|$)/i) ||
    url.includes('video') ||
    url.includes('.mp4')
  );
  
  if (hasVideo) return 'Vidéo';
  if (urls.length > 1) return 'Carrousel';
  return 'Image';
};

const MediaDisplay = ({ urls, type, caption }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!urls || urls.length === 0) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500 text-xs">Pas de média</span>
      </div>
    );
  }

  const detectedType = detectMediaType(urls);
  const isVideo = detectedType === 'Vidéo';
  const isCarousel = urls.length > 1;
  const currentUrl = urls[currentIndex];

  return (
    <div className="relative w-full h-full group">
      {currentUrl && currentUrl.match(/\.(mp4|mov|webm|avi|m4v)(\?|$)/i) ? (
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

      {isCarousel && (
        <div className="absolute top-2 right-2 text-white drop-shadow-lg z-10">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="6" height="18"/>
            <rect x="9" y="3" width="6" height="18"/>
            <rect x="15" y="3" width="6" height="18"/>
          </svg>
        </div>
      )}
      
      {isVideo && (
        <div className="absolute top-2 right-2 text-white drop-shadow-lg z-10">
          <Play size={16} fill="white" stroke="white" />
        </div>
      )}

      {isCarousel && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(prev => prev > 0 ? prev - 1 : urls.length - 1);
            }}
            className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            style={{ width: '28px', height: '28px' }}
          >
            <ChevronLeft size={16} className="mx-auto" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(prev => prev < urls.length - 1 ? prev + 1 : 0);
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            style={{ width: '28px', height: '28px' }}
          >
            <ChevronRight size={16} className="mx-auto" />
          </button>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-10">
            {urls.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-60'
                }`}
              />
            ))}
          </div>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ height: '40px' }}>
        <div className="absolute bottom-1 left-2 right-2 text-white text-xs font-medium truncate">
          {caption || 'Cliquer pour voir en détail'}
        </div>
      </div>
    </div>
  );
};

const PostModal = ({ post, isOpen, onClose, onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || !post) return null;

  const urls = post.urls || [];
  const detectedType = detectMediaType(urls);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50" 
      onClick={onClose}
    >
      <div 
        className="relative max-w-2xl max-h-[90vh] w-full h-full flex items-center justify-center" 
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-20 bg-black bg-opacity-50 rounded-full p-2"
        >
          <X size={24} />
        </button>

        {onNavigate && (
          <>
            <button
              onClick={() => onNavigate('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-20 bg-black bg-opacity-50 rounded-full p-2"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={() => onNavigate('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-20 bg-black bg-opacity-50 rounded-full p-2"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        <div className="flex flex-col items-center max-w-lg">
          <div className="relative bg-black rounded-lg overflow-hidden">
            {urls[currentIndex] && (
              <>
                {urls[currentIndex].match(/\.(mp4|mov|webm|avi|m4v)(\?|$)/i) ? (
                  <video
                    src={urls[currentIndex]}
                    className="max-w-sm max-h-[60vh] object-contain"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    src={urls[currentIndex]}
                    alt={post.title}
                    className="max-w-sm max-h-[60vh] object-contain"
                  />
                )}

                {urls.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : urls.length - 1)}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white rounded-full p-2"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setCurrentIndex(prev => prev < urls.length - 1 ? prev + 1 : 0)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white rounded-full p-2"
                    >
                      <ChevronRight size={20} />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {urls.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`w-2.5 h-2.5 rounded-full ${
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

          <div className="text-white text-center mt-6 px-4">
            <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
            {post.caption && (
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">{post.caption}</p>
            )}
            <div className="text-xs text-gray-400 space-y-1">
              <p>📅 {post.date && new Date(post.date).toLocaleDateString('fr-FR')}</p>
              <p>📷 {detectedType} {urls.length > 1 && `(${urls.length} médias)`}</p>
              {post.account && <p>👤 {post.account}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InstagramNotionWidget = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isProfileEdit, setIsProfileEdit] = useState(false);
  const [notionApiKey, setNotionApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showRefreshMenu, setShowRefreshMenu] = useState(false);

  // 🔧 État pour la configuration des propriétés Notion
  const [propertyMappings, setPropertyMappings] = useState({
    title: 'Titre',
    date: 'Date',
    caption: 'Caption',
    urls: 'Couverture',
    account: 'Compte Instagram'
  });
  const [isPropertyConfig, setIsPropertyConfig] = useState(false);

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState('All');
  const [showAllTab, setShowAllTab] = useState(true);
  const [isAccountManager, setIsAccountManager] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [editingAccount, setEditingAccount] = useState(null);
  const [editAccountName, setEditAccountName] = useState('');

  const [profiles, setProfiles] = useState({
    'All': {
      username: 'mon_compte',
      fullName: 'Mon Compte Principal',
      bio: '🚀 Créateur de contenu\n📸 Planning Instagram\n📍 Paris, France',
      profilePhoto: '',
      followers: '1,234',
      following: '567'
    }
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, type === 'error' ? 5000 : 3000); // Plus de temps pour lire les erreurs
  };

  // 🔐 Validation de la clé API
  const validateApiKey = (key) => {
    if (!key || !key.trim()) return false;
    const trimmedKey = key.trim();
    // Accepter les clés qui commencent par 'secret_' ou 'ntn_'
    return trimmedKey.startsWith('secret_') || trimmedKey.startsWith('ntn_');
  };

  // 🗂️ Validation de l'ID de base de données
  const validateDatabaseId = (id) => {
    if (!id || !id.trim()) return false;
    // Enlever les tirets et vérifier 32 caractères hexadécimaux
    const cleanId = id.trim().replace(/-/g, '');
    return /^[a-f0-9]{32}$/i.test(cleanId);
  };

  useEffect(() => {
    try {
      const savedApiKey = localStorage.getItem('notionApiKey');
      const savedDbId = localStorage.getItem('databaseId');
      const savedProfiles = localStorage.getItem('instagramProfiles');
      const savedAccounts = localStorage.getItem('instagramAccounts');
      const savedShowAllTab = localStorage.getItem('showAllTab');
      const savedMappings = localStorage.getItem('propertyMappings');
      
      if (savedApiKey) setNotionApiKey(savedApiKey);
      if (savedDbId) setDatabaseId(savedDbId);
      
      if (savedMappings) {
        try {
          setPropertyMappings(JSON.parse(savedMappings));
        } catch (e) {
          console.error('Erreur parsing mappings:', e);
        }
      }
      
      if (savedProfiles) {
        try {
          setProfiles(JSON.parse(savedProfiles));
        } catch (e) {
          console.error('Erreur parsing profiles:', e);
          showNotification(ERROR_MESSAGES.STORAGE_READ, 'error');
        }
      }
      
      if (savedShowAllTab !== null) {
        setShowAllTab(savedShowAllTab === 'true');
      }
      
      if (savedAccounts) {
        try {
          const accounts = JSON.parse(savedAccounts);
          setAccounts(accounts);
          if (accounts.length > 0) {
            setActiveAccount(accounts[0]);
          }
        } catch (e) {
          console.error('Erreur parsing accounts:', e);
          setAccounts([]);
          showNotification(ERROR_MESSAGES.STORAGE_READ, 'error');
        }
      }

      if (savedApiKey && savedDbId) {
        fetchPosts(savedApiKey, savedDbId);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      showNotification(ERROR_MESSAGES.STORAGE_READ, 'error');
    }
  }, []);

  const fetchPosts = async (apiKey = notionApiKey, dbId = databaseId) => {
    setIsRefreshing(true);
    setShowRefreshMenu(false);
    
    try {
      const response = await fetch(`${API_BASE}/notion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey,
          databaseId: dbId,
          propertyMappings: propertyMappings
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        const oldPostIds = new Set(posts.map(p => p.id));
        const newPosts = data.posts.filter(p => !oldPostIds.has(p.id));
        
        setPosts(data.posts);
        
        if (data.posts.length === 0) {
          showNotification(ERROR_MESSAGES.NO_POSTS_FOUND, 'error');
        } else if (posts.length === 0 && data.posts.length > 0) {
          showNotification(SUCCESS_MESSAGES.POSTS_LOADED(data.posts.length), 'success');
        } else if (newPosts.length > 0) {
          showNotification(SUCCESS_MESSAGES.NEW_POSTS(newPosts.length), 'success');
        } else {
          showNotification(SUCCESS_MESSAGES.FEED_UP_TO_DATE, 'info');
        }
        
        setIsConfigOpen(false);
      } else {
        console.error('❌ Erreur Notion:', data.error);
        
        // Messages d'erreur plus spécifiques selon le type d'erreur
        let errorMessage = ERROR_MESSAGES.NOTION_SYNC_ERROR;
        
        if (data.error.includes('API key') || data.error.includes('Unauthorized')) {
          errorMessage = ERROR_MESSAGES.INVALID_API_KEY;
        } else if (data.error.includes('database') || data.error.includes('not found')) {
          errorMessage = ERROR_MESSAGES.INVALID_DATABASE_ID;
        } else if (data.error.includes('property') || data.error.includes('column')) {
          errorMessage = ERROR_MESSAGES.PROPERTY_MISSING;
        } else if (data.error.includes('network') || data.error.includes('fetch')) {
          errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
        }
        
        showNotification(`${errorMessage}\n\n💡 Détail technique : ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('❌ Erreur fetch:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        showNotification(ERROR_MESSAGES.NETWORK_ERROR, 'error');
      } else if (error.message.includes('HTTP')) {
        showNotification(`${ERROR_MESSAGES.NOTION_CONNECTION}\n\n💡 ${error.message}`, 'error');
      } else {
        showNotification(`${ERROR_MESSAGES.UNKNOWN_ERROR}\n\n💡 ${error.message}`, 'error');
      }
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // Calculer une nouvelle date entre deux posts
  const calculateNewDate = (prevPost, nextPost) => {
    const now = new Date();
    
    if (!prevPost && !nextPost) {
      return now.toISOString().split('T')[0];
    }
    
    if (!prevPost) {
      const nextDate = new Date(nextPost.date);
      const newDate = new Date(nextDate.getTime() + 24 * 60 * 60 * 1000);
      return newDate.toISOString().split('T')[0];
    }
    
    if (!nextPost) {
      const prevDate = new Date(prevPost.date);
      const newDate = new Date(prevDate.getTime() - 24 * 60 * 60 * 1000);
      return newDate.toISOString().split('T')[0];
    }
    
    const prevTime = new Date(prevPost.date).getTime();
    const nextTime = new Date(nextPost.date).getTime();
    const middleTime = (prevTime + nextTime) / 2;
    
    return new Date(middleTime).toISOString().split('T')[0];
  };

  // Synchroniser la nouvelle date avec Notion
  const syncDateToNotion = async (postId, newDate) => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    console.log(`🔄 Mise à jour de la date pour ${postId}: ${newDate}`);

    try {
      const response = await fetch(`${API_BASE}/notion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: notionApiKey,
          databaseId: databaseId,
          action: 'updateDate',
          postId: postId,
          newDate: newDate,
          propertyMappings: propertyMappings
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Date mise à jour dans Notion');
        showNotification(SUCCESS_MESSAGES.DATE_UPDATED(newDate), 'success');
        
        setTimeout(() => {
          fetchPosts();
        }, 1000);
      } else {
        console.error('❌ Erreur:', result.error);
        showNotification(`${ERROR_MESSAGES.NOTION_UPDATE_ERROR}\n\n💡 ${result.error}`, 'error');
      }
      
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      if (error.message.includes('Failed to fetch')) {
        showNotification(ERROR_MESSAGES.NETWORK_ERROR, 'error');
      } else {
        showNotification(`${ERROR_MESSAGES.NOTION_UPDATE_ERROR}\n\n💡 ${error.message}`, 'error');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const connectToNotion = async () => {
    // Validation complète
    if (!notionApiKey || !notionApiKey.trim()) {
      showNotification(ERROR_MESSAGES.API_KEY_MISSING, 'error');
      return;
    }

    if (!databaseId || !databaseId.trim()) {
      showNotification(ERROR_MESSAGES.DATABASE_ID_MISSING, 'error');
      return;
    }

    if (!validateApiKey(notionApiKey)) {
      showNotification(ERROR_MESSAGES.INVALID_API_KEY, 'error');
      return;
    }

    if (!validateDatabaseId(databaseId)) {
      showNotification(ERROR_MESSAGES.INVALID_DATABASE_ID, 'error');
      return;
    }

    try {
      localStorage.setItem('notionApiKey', notionApiKey.trim());
      localStorage.setItem('databaseId', databaseId.trim());
      showNotification(SUCCESS_MESSAGES.CONFIG_SAVED, 'success');
      
      await fetchPosts();
    } catch (error) {
      showNotification(ERROR_MESSAGES.STORAGE_WRITE, 'error');
    }
  };

  // 💾 Sauvegarder la configuration des propriétés
  const savePropertyMappings = () => {
    try {
      localStorage.setItem('propertyMappings', JSON.stringify(propertyMappings));
      showNotification(SUCCESS_MESSAGES.MAPPINGS_SAVED, 'success');
      setIsPropertyConfig(false);
    } catch (error) {
      showNotification(ERROR_MESSAGES.STORAGE_WRITE, 'error');
    }
  };

  const getProfile = (account) => {
    if (profiles[account]) {
      return profiles[account];
    }
    return profiles['All'] || {
      username: 'mon_compte',
      fullName: 'Mon Compte',
      bio: '🚀 Créateur de contenu\n📸 Planning Instagram\n📍 Paris, France',
      profilePhoto: '',
      followers: '1,234',
      following: '567'
    };
  };

  const saveProfile = (account, profileData) => {
    try {
      const newProfiles = { ...profiles, [account]: profileData };
      setProfiles(newProfiles);
      localStorage.setItem('instagramProfiles', JSON.stringify(newProfiles));
      showNotification(SUCCESS_MESSAGES.PROFILE_SAVED, 'success');
    } catch (error) {
      showNotification(ERROR_MESSAGES.STORAGE_WRITE, 'error');
    }
  };

  const hideAllTab = () => {
    try {
      setShowAllTab(false);
      localStorage.setItem('showAllTab', 'false');
      if (activeAccount === 'All' && accounts.length > 0) {
        setActiveAccount(accounts[0]);
      }
    } catch (error) {
      showNotification(ERROR_MESSAGES.STORAGE_WRITE, 'error');
    }
  };

  const addAccount = () => {
    if (!newAccountName || !newAccountName.trim()) {
      showNotification(ERROR_MESSAGES.ACCOUNT_NAME_REQUIRED, 'error');
      return;
    }

    if (accounts.includes(newAccountName.trim())) {
      showNotification(ERROR_MESSAGES.ACCOUNT_EXISTS, 'error');
      return;
    }

    try {
      const newAccount = newAccountName.trim();
      const newAccounts = [...accounts, newAccount];
      setAccounts(newAccounts);
      
      const newProfile = {
        username: newAccount.toLowerCase().replace(/\s+/g, '_'),
        fullName: newAccount,
        bio: `🚀 ${newAccount}\n📸 Créateur de contenu\n📍 Paris, France`,
        profilePhoto: '',
        followers: '1,234',
        following: '567'
      };
      
      const newProfiles = { ...profiles, [newAccount]: newProfile };
      setProfiles(newProfiles);
      
      localStorage.setItem('instagramAccounts', JSON.stringify(newAccounts));
      localStorage.setItem('instagramProfiles', JSON.stringify(newProfiles));
      
      setActiveAccount(newAccount);
      setNewAccountName('');
      setIsAccountManager(false);
      
      showNotification(SUCCESS_MESSAGES.ACCOUNT_ADDED(newAccount), 'success');
    } catch (error) {
      showNotification(ERROR_MESSAGES.STORAGE_WRITE, 'error');
    }
  };

  const removeAccount = (accountToRemove) => {
    try {
      const newAccounts = accounts.filter(acc => acc !== accountToRemove);
      setAccounts(newAccounts);
      
      if (activeAccount === accountToRemove) {
        if (newAccounts.length > 0) {
          setActiveAccount(newAccounts[0]);
        } else {
          setActiveAccount('All');
          setShowAllTab(true);
          localStorage.setItem('showAllTab', 'true');
        }
      }
      
      const newProfiles = { ...profiles };
      delete newProfiles[accountToRemove];
      setProfiles(newProfiles);
      
      localStorage.setItem('instagramAccounts', JSON.stringify(newAccounts));
      localStorage.setItem('instagramProfiles', JSON.stringify(newProfiles));
      
      showNotification(SUCCESS_MESSAGES.ACCOUNT_REMOVED(accountToRemove), 'success');
    } catch (error) {
      showNotification(ERROR_MESSAGES.STORAGE_WRITE, 'error');
    }
  };

  const removeAllAccounts = () => {
    if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer tous les comptes ?')) {
      return;
    }

    try {
      setAccounts([]);
      setActiveAccount('All');
      
      const newProfiles = { 'All': profiles['All'] || getProfile('All') };
      setProfiles(newProfiles);
      
      localStorage.setItem('instagramAccounts', JSON.stringify([]));
      localStorage.setItem('instagramProfiles', JSON.stringify(newProfiles));
      setIsAccountManager(false);
      
      showNotification('✓ Tous les comptes ont été supprimés', 'success');
    } catch (error) {
      showNotification(ERROR_MESSAGES.STORAGE_WRITE, 'error');
    }
  };

  const renameAccount = (oldName, newName) => {
    if (!newName.trim() || newName === oldName) {
      setEditingAccount(null);
      setEditAccountName('');
      return;
    }

    if (accounts.includes(newName.trim())) {
      showNotification(ERROR_MESSAGES.ACCOUNT_EXISTS, 'error');
      setEditingAccount(null);
      setEditAccountName('');
      return;
    }

    try {
      const trimmedNewName = newName.trim();
      
      const newAccounts = accounts.map(acc => acc === oldName ? trimmedNewName : acc);
      setAccounts(newAccounts);
      
      if (activeAccount === oldName) {
        setActiveAccount(trimmedNewName);
      }
      
      const newProfiles = { ...profiles };
      if (profiles[oldName]) {
        newProfiles[trimmedNewName] = { ...profiles[oldName] };
        delete newProfiles[oldName];
        setProfiles(newProfiles);
      }
      
      localStorage.setItem('instagramAccounts', JSON.stringify(newAccounts));
      localStorage.setItem('instagramProfiles', JSON.stringify(newProfiles));
      
      setEditingAccount(null);
      setEditAccountName('');
      
      showNotification(`✓ Compte renommé en "${trimmedNewName}"`, 'success');
    } catch (error) {
      showNotification(ERROR_MESSAGES.STORAGE_WRITE, 'error');
    }
  };

  // Filtrer et trier les posts par date (chronologique inversé = plus récent en premier)
  const getOrderedFilteredPosts = () => {
    const accountFiltered = posts.filter(post => {
      if (activeAccount === 'All' || accounts.length === 0) {
        return true;
      }
      return post.account === activeAccount;
    });

    return accountFiltered.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  };

  const filteredPosts = getOrderedFilteredPosts();

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = (e) => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || 
        e.clientY < rect.top || e.clientY > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const sourcePost = filteredPosts[draggedIndex];
    if (!sourcePost) {
      setDraggedIndex(null);
      return;
    }

    console.log(`🔄 DRAG & DROP: "${sourcePost.title}" de position ${draggedIndex} → ${dropIndex}`);

    // Calculer la nouvelle date basée sur les posts adjacents
    const prevPost = dropIndex > 0 ? filteredPosts[dropIndex - 1] : null;
    const nextPost = dropIndex < filteredPosts.length ? filteredPosts[dropIndex] : null;
    
    const newDate = calculateNewDate(prevPost, nextPost);
    
    console.log(`📅 Nouvelle date calculée: ${newDate}`);
    console.log(`📅 Entre: ${prevPost?.date || 'début'} et ${nextPost?.date || 'fin'}`);

    // Synchroniser avec Notion
    await syncDateToNotion(sourcePost.id, newDate);

    setDraggedIndex(null);
  };

  const gridItems = Array.from({ length: 60 }, (_, index) => {
    const post = filteredPosts[index];
    return post || null;
  });

  const currentProfile = getProfile(activeAccount);
  const shouldShowTabs = accounts.length > 0;
  const shouldShowAllTab = accounts.length > 1 && showAllTab;

  return (
    <div className="w-full max-w-md mx-auto bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Camera size={24} className="text-gray-800" />
          <span className="font-semibold text-lg text-gray-800">Instagram</span>
        </div>
        <div className="flex items-center space-x-2">
          {(isSyncing || isRefreshing) && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600">
                {isSyncing ? 'Synchronisation...' : 'Chargement...'}
              </span>
            </div>
          )}
          
          <div className="relative">
            <button
              onClick={() => setShowRefreshMenu(!showRefreshMenu)}
              disabled={isRefreshing || isSyncing}
              className={`flex items-center space-x-1 p-2 hover:bg-gray-100 rounded-full transition-all ${
                (isRefreshing || isSyncing) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Options d'actualisation"
            >
              <RefreshCw 
                size={20} 
                className={`text-gray-700 transition-transform ${
                  (isRefreshing || isSyncing) ? 'animate-spin' : ''
                }`}
              />
              <ChevronDown size={14} className="text-gray-700" />
            </button>

            {showRefreshMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  onClick={() => fetchPosts()}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <RefreshCw size={16} className="text-blue-600" />
                  <div>
                    <div className="text-sm font-medium">Actualiser</div>
                    <div className="text-xs text-gray-500">Récupérer nouveaux posts</div>
                  </div>
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsConfigOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Paramètres"
          >
            <Settings size={20} className="text-gray-700" />
          </button>
        </div>
      </div>

      {showRefreshMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowRefreshMenu(false)}
        />
      )}

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

      {shouldShowTabs && (
        <div className="flex items-center space-x-2 px-4 mb-4 overflow-x-auto">
          {shouldShowAllTab && (
            <button
              onClick={() => setActiveAccount('All')}
              className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                activeAccount === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
              <span className="ml-1 text-xs opacity-75">
                ({posts.length})
              </span>
            </button>
          )}

          {accounts.map((account) => {
            const accountPostCount = posts.filter(p => p.account === account).length;
              
            return (
              <button
                key={account}
                onClick={() => setActiveAccount(account)}
                className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                  activeAccount === account
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {account}
                <span className="ml-1 text-xs opacity-75">
                  ({accountPostCount})
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-center px-4 mb-4">
        <button
          onClick={() => setIsAccountManager(true)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors"
          title="Gérer les comptes"
        >
          <Plus size={16} />
          <span>{accounts.length === 0 ? 'Ajouter des comptes' : 'Gérer les comptes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1 p-4">
        {gridItems.map((post, index) => (
          <div
            key={post?.id || `empty-${index}`}
            className={`relative bg-gray-100 transition-all duration-200 ${
              dragOverIndex === index 
                ? 'bg-green-200 scale-105 border-2 border-green-500 shadow-lg ring-2 ring-green-300' 
                : draggedIndex === index
                ? 'bg-blue-200 scale-95 opacity-80'
                : 'hover:scale-102'
            }`}
            style={{ aspectRatio: '1080/1350' }}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          >
            {post ? (
              <div
                className="w-full h-full select-none rounded-sm overflow-hidden cursor-move transition-all duration-200"
                draggable={true}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onClick={(e) => {
                  if (draggedIndex === null) {
                    setSelectedPost(post);
                    setModalOpen(true);
                  }
                }}
              >
                <MediaDisplay urls={post.urls} type={post.type} caption={post.caption} />
                
                {draggedIndex === index && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-25 flex items-center justify-center z-10">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>Déplacement...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div 
                className={`w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-50 rounded-sm border-2 border-dashed transition-all duration-200 ${
                  dragOverIndex === index 
                    ? 'border-green-400 bg-green-50 text-green-600 scale-105' 
                    : 'border-gray-200'
                }`}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="text-center">
                  <div>{dragOverIndex === index ? '📍' : 'Vide'}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isConfigOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">⚙️ Configuration Notion</h3>
              <button onClick={() => setIsConfigOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  🔑 Clé API Notion
                </label>
                <input
                  type="text"
                  value={notionApiKey}
                  onChange={(e) => setNotionApiKey(e.target.value)}
                  placeholder="secret_... ou ntn_..."
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Créez une intégration sur <a href="https://notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">notion.so/my-integrations</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  🗂️ ID de la base de données
                </label>
                <input
                  type="text"
                  value={databaseId}
                  onChange={(e) => setDatabaseId(e.target.value)}
                  placeholder="32 caractères hexadécimaux"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Trouvez-le dans l'URL de votre base de données Notion
                </p>
              </div>

              {/* 🔧 Configuration des propriétés Notion */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    🔧 Noms des propriétés Notion
                  </label>
                  <button
                    onClick={() => setIsPropertyConfig(!isPropertyConfig)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <Settings size={14} />
                    <span>{isPropertyConfig ? 'Masquer' : 'Configurer'}</span>
                  </button>
                </div>

                {!isPropertyConfig && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <p className="font-medium mb-1">📌 Configuration actuelle :</p>
                    <div className="space-y-0.5">
                      <p>• Titre → <strong>{propertyMappings.title}</strong></p>
                      <p>• Date → <strong>{propertyMappings.date}</strong></p>
                      <p>• Caption → <strong>{propertyMappings.caption}</strong></p>
                      <p>• Médias → <strong>{propertyMappings.urls}</strong></p>
                      <p>• Compte → <strong>{propertyMappings.account}</strong></p>
                    </div>
                  </div>
                )}

                {isPropertyConfig && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
                    <div className="text-sm text-yellow-800 mb-3">
                      <p className="font-medium mb-1">💡 Personnalisez les noms</p>
                      <p className="text-xs">
                        Si vos colonnes Notion ont des noms différents (ex: "Date de publication" au lieu de "Date"), modifiez-les ici.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Titre du post</label>
                        <input
                          type="text"
                          value={propertyMappings.title}
                          onChange={(e) => setPropertyMappings({...propertyMappings, title: e.target.value})}
                          placeholder="Ex: Titre, Title, Nom..."
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700">Date de publication</label>
                        <input
                          type="text"
                          value={propertyMappings.date}
                          onChange={(e) => setPropertyMappings({...propertyMappings, date: e.target.value})}
                          placeholder="Ex: Date, Date de publication..."
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700">Légende/Caption</label>
                        <input
                          type="text"
                          value={propertyMappings.caption}
                          onChange={(e) => setPropertyMappings({...propertyMappings, caption: e.target.value})}
                          placeholder="Ex: Caption, Description..."
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700">Médias (Images/Vidéos)</label>
                        <input
                          type="text"
                          value={propertyMappings.urls}
                          onChange={(e) => setPropertyMappings({...propertyMappings, urls: e.target.value})}
                          placeholder="Ex: Couverture, Médias..."
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700">Compte Instagram</label>
                        <input
                          type="text"
                          value={propertyMappings.account}
                          onChange={(e) => setPropertyMappings({...propertyMappings, account: e.target.value})}
                          placeholder="Ex: Compte, Account..."
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    <button
                      onClick={savePropertyMappings}
                      className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 text-sm font-medium"
                    >
                      💾 Sauvegarder la configuration
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-xs border border-blue-200">
                <p className="font-medium mb-2 text-blue-900">📋 Propriétés Notion requises :</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• <strong>{propertyMappings.urls}</strong> (Files & media) - Images/vidéos</li>
                  <li>• <strong>{propertyMappings.date}</strong> (Date) - Date de publication</li>
                  <li>• <strong>{propertyMappings.caption}</strong> (Text) - Description</li>
                  <li>• <strong>{propertyMappings.account}</strong> (Select) - Multi-comptes</li>
                </ul>
                <p className="text-blue-700 mt-2 font-medium">
                  ✨ L'ordre est géré automatiquement par les dates !
                </p>
                <p className="text-blue-600 mt-1">
                  Glissez-déposez un post = sa date change dans Notion
                </p>
              </div>

              <button
                onClick={connectToNotion}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Connexion...' : '🔌 Connecter à Notion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAccountManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">👤 Gérer les comptes</h3>
              <button onClick={() => setIsAccountManager(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ajouter un nouveau compte
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="Ex: Mon Compte Pro"
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addAccount()}
                  />
                  <button
                    onClick={addAccount}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              {(accounts.length > 0 || shouldShowAllTab) && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Comptes existants
                  </label>
                  <div className="space-y-2">
                    
                    {shouldShowAllTab && (
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">All</span>
                          <span className="text-xs text-gray-500">(Tous les posts)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setActiveAccount('All')}
                            className={`text-xs px-3 py-1 rounded-full transition-colors ${
                              activeAccount === 'All' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                          >
                            {activeAccount === 'All' ? 'Actif' : 'Activer'}
                          </button>
                          <button
                            onClick={hideAllTab}
                            className="text-xs text-red-600 hover:text-red-800 px-2"
                            title="Masquer l'onglet All"
                          >
                            Masquer
                          </button>
                        </div>
                      </div>
                    )}

                    {accounts.map((account) => (
                      <div key={account} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        {editingAccount === account ? (
                          <div className="flex-1 flex items-center space-x-2">
                            <input
                              type="text"
                              value={editAccountName}
                              onChange={(e) => setEditAccountName(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  renameAccount(account, editAccountName);
                                } else if (e.key === 'Escape') {
                                  setEditingAccount(null);
                                  setEditAccountName('');
                                }
                              }}
                              className="flex-1 p-1 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => renameAccount(account, editAccountName)}
                              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                setEditingAccount(null);
                                setEditAccountName('');
                              }}
                              className="text-xs bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{account}</span>
                              <button
                                onClick={() => {
                                  setEditingAccount(account);
                                  setEditAccountName(account);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800"
                                title="Renommer"
                              >
                                ✏️
                              </button>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setActiveAccount(account)}
                                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                  activeAccount === account 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                }`}
                              >
                                {activeAccount === account ? 'Actif' : 'Activer'}
                              </button>
                              <button
                                onClick={() => removeAccount(account)}
                                className="text-xs text-red-600 hover:text-red-800 px-2"
                              >
                                Supprimer
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {accounts.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <button
                        onClick={removeAllAccounts}
                        className="w-full text-sm text-red-600 hover:text-red-800 hover:bg-red-50 py-2 px-3 rounded-lg transition-colors"
                      >
                        🗑️ Supprimer tous les comptes
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isProfileEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">✏️ Modifier le profil - {activeAccount}</h3>
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

      <div className="border-t bg-gray-50 py-3">
        <div className="text-center">
          
            href="https://www.instagram.com/freelance.creatif/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Créé par @Freelancecreatif
          </a>
        </div>
      </div>

      {notification && (
        <div 
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl transition-all duration-300 max-w-md ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          } text-white`}
          style={{
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {notification.type === 'success' && <span className="text-xl">✓</span>}
              {notification.type === 'error' && <span className="text-xl">✕</span>}
              {notification.type === 'info' && <span className="text-xl">ℹ</span>}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium whitespace-pre-line leading-relaxed">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

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
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nom complet</label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          rows={3}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Photo de profil (URL)</label>
        <input
          type="url"
          value={formData.profilePhoto}
          onChange={(e) => setFormData({...formData, profilePhoto: e.target.value})}
          placeholder="https://..."
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Abonnés</label>
          <input
            type="text"
            value={formData.followers}
            onChange={(e) => setFormData({...formData, followers: e.target.value})}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Suivi(e)s</label>
          <input
            type="text"
            value={formData.following}
            onChange={(e) => setFormData({...formData, following: e.target.value})}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => onSave(formData)}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          💾 Sauvegarder
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

export default InstagramNotionWidget;
