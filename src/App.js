import React, { useState, useEffect } from 'react';
import { Camera, Settings, RefreshCw, Edit3, X, ChevronLeft, ChevronRight, Play, Plus, ChevronDown, Layers } from 'lucide-react';

const API_BASE = 'https://freelance-creatif.vercel.app/api';

// GÉNÉRATION D'UN ID UNIQUE PAR WIDGET
const generateWidgetId = () => {
  // Utilisation de crypto.randomUUID si disponible, sinon fallback avec plus d'entropie
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return 'widget_' + crypto.randomUUID().replace(/-/g, '');
  }
  
  // Fallback avec plus d'entropie
  const timestamp = Date.now();
  const random1 = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  const performance = typeof performance !== 'undefined' ? performance.now().toString(36) : '';
  
  return `widget_${timestamp}_${random1}_${random2}_${performance}`.replace(/\./g, '');
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

const InstagramNotionWidget = ({ widgetKey = null }) => {
  // NAMESPACE UNIQUE PAR INSTANCE DE WIDGET (pas par session)
  const widgetNamespace = useRef(null);
  
  if (!widgetNamespace.current) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extraRandom = Math.random().toString(36).substring(2, 10);
    widgetNamespace.current = `widget_ns_${timestamp}_${random}_${extraRandom}`;
    console.log(`🏷️ Namespace unique créé: ${widgetNamespace.current}`);
  }

  // ID UNIQUE DU WIDGET basé sur le namespace
  const widgetIdRef = useRef(null);
  
  if (!widgetIdRef.current) {
    widgetIdRef.current = `${widgetNamespace.current}_instance`;
    console.log(`🆔 Widget ID unique: ${widgetIdRef.current}`);
  }
  
  const widgetId = widgetIdRef.current;

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isProfileEdit, setIsProfileEdit] = useState(false);
  const [notionApiKey, setNotionApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showRefreshMenu, setShowRefreshMenu] = useState(false);
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);

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
    }, 3000);
  };

  // Charger la configuration du workspace avec namespace isolé par instance
  const loadWorkspaceConfig = (workspaceId) => {
    try {
      const configKey = `config_${widgetNamespace.current}`;
      const savedConfig = localStorage.getItem(configKey);
      
      console.log(`🔍 [${widgetNamespace.current}] Chargement config: ${configKey}`);
      
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        console.log(`🔑 [${widgetNamespace.current}] Configuration trouvée:`, config);
        
        setNotionApiKey(config.apiKey || '');
        setDatabaseId(config.databaseId || '');
        setWorkspaceName(config.name || '');
        setProfiles(config.profiles || profiles);
        setAccounts(config.accounts || []);
        setShowAllTab(config.showAllTab !== undefined ? config.showAllTab : true);
        
        if (config.apiKey && config.databaseId) {
          fetchPosts(config.apiKey, config.databaseId);
        }
        
        return true;
      }
      
      console.log(`📝 [${widgetNamespace.current}] Aucune configuration trouvée - nouveau widget`);
      return false;
    } catch (e) {
      console.error(`❌ [${widgetNamespace.current}] Erreur chargement:`, e);
      return false;
    }
  };

  // Sauvegarder la configuration du workspace avec isolation complète
  const saveWorkspaceConfig = () => {
    if (!widgetId || !widgetNamespace.current) {
      console.warn('⚠️ Tentative de sauvegarde sans ID/namespace');
      return;
    }
    
    const configKey = `config_${widgetNamespace.current}`;
    const config = {
      widgetId: widgetId,
      namespace: widgetNamespace.current,
      name: workspaceName || databaseId?.substring(0, 8) || 'Widget',
      apiKey: notionApiKey,
      databaseId: databaseId,
      profiles: profiles,
      accounts: accounts,
      showAllTab: showAllTab,
      lastUpdate: new Date().toISOString()
    };
    
    console.log(`💾 [${widgetNamespace.current}] Sauvegarde:`, configKey, config);
    localStorage.setItem(configKey, JSON.stringify(config));
    
    // Pas de liste globale - chaque widget est complètement isolé
  };

  // Charger au démarrage
  useEffect(() => {
    console.log(`🆔 [${widgetNamespace.current}] Widget chargé avec namespace unique`);
    const loaded = loadWorkspaceConfig(widgetId);
    
    if (!loaded) {
      console.log(`📝 [${widgetNamespace.current}] Nouveau widget, configuration vide`);
      setIsConfigOpen(true);
    }
  }, [widgetId]);

  // Sauvegarder automatiquement à chaque changement (avec délai pour éviter les race conditions)
  useEffect(() => {
    if (notionApiKey && databaseId && widgetId && widgetNamespace.current) {
      const timeoutId = setTimeout(() => {
        console.log(`⏱️ [${widgetNamespace.current}] Sauvegarde automatique`);
        saveWorkspaceConfig();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [notionApiKey, databaseId, profiles, accounts, showAllTab, workspaceName, widgetId]);

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
        }),
      });

      const data = await response.json();

      if (data.success) {
        const oldPostIds = new Set(posts.map(p => p.id));
        const newPosts = data.posts.filter(p => !oldPostIds.has(p.id));
        
        setPosts(data.posts);
        
        if (posts.length === 0 && data.posts.length > 0) {
          showNotification(`${data.posts.length} posts chargés`, 'success');
        } else if (newPosts.length > 0) {
          showNotification(`${newPosts.length} nouveau(x) post(s) ajouté(s)`, 'success');
        } else {
          showNotification('Feed à jour', 'info');
        }
        
        setIsConfigOpen(false);
      } else {
        console.error('Erreur Notion:', data.error);
        showNotification(`Erreur: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Erreur fetch:', error);
      showNotification('Erreur de connexion', 'error');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

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
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Date mise à jour dans Notion');
        showNotification(`Date mise à jour: ${new Date(newDate).toLocaleDateString('fr-FR')}`, 'success');
        
        setTimeout(() => {
          fetchPosts();
        }, 1000);
      } else {
        console.error('Erreur:', result.error);
        showNotification('Erreur lors de la mise à jour', 'error');
      }
      
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      showNotification('Erreur de connexion', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const connectToNotion = async () => {
    if (!notionApiKey || !databaseId) {
      showNotification('Veuillez remplir tous les champs', 'error');
      return;
    }

    saveWorkspaceConfig();
    await fetchPosts();
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
    const newProfiles = { ...profiles, [account]: profileData };
    setProfiles(newProfiles);
  };

  const hideAllTab = () => {
    setShowAllTab(false);
    if (activeAccount === 'All' && accounts.length > 0) {
      setActiveAccount(accounts[0]);
    }
  };

  const addAccount = () => {
    if (!newAccountName.trim() || accounts.includes(newAccountName.trim())) {
      return;
    }

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
    
    setActiveAccount(newAccount);
    setNewAccountName('');
    setIsAccountManager(false);
  };

  const removeAccount = (accountToRemove) => {
    const newAccounts = accounts.filter(acc => acc !== accountToRemove);
    setAccounts(newAccounts);
    
    if (activeAccount === accountToRemove) {
      if (newAccounts.length > 0) {
        setActiveAccount(newAccounts[0]);
      } else {
        setActiveAccount('All');
        setShowAllTab(true);
      }
    }
    
    const newProfiles = { ...profiles };
    delete newProfiles[accountToRemove];
    setProfiles(newProfiles);
  };

  const removeAllAccounts = () => {
    setAccounts([]);
    setActiveAccount('All');
    
    const newProfiles = { 'All': profiles['All'] || getProfile('All') };
    setProfiles(newProfiles);
    
    setIsAccountManager(false);
  };

  const renameAccount = (oldName, newName) => {
    if (!newName.trim() || newName === oldName || accounts.includes(newName.trim())) {
      setEditingAccount(null);
      setEditAccountName('');
      return;
    }

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
    
    setEditingAccount(null);
    setEditAccountName('');
  };

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

    const prevPost = dropIndex > 0 ? filteredPosts[dropIndex - 1] : null;
    const nextPost = dropIndex < filteredPosts.length ? filteredPosts[dropIndex] : null;
    
    const newDate = calculateNewDate(prevPost, nextPost);
    
    console.log(`📅 Nouvelle date calculée: ${newDate}`);
    console.log(`📅 Entre: ${prevPost?.date || 'début'} et ${nextPost?.date || 'fin'}`);

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

  // Chaque widget est maintenant complètement isolé - pas de liste globale

  return (
    <div className="w-full max-w-md mx-auto bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Camera size={24} className="text-gray-800" />
          <span className="font-semibold text-lg text-gray-800">Instagram</span>
          {workspaceName && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {workspaceName}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {(isSyncing || isRefreshing) && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600">
                {isSyncing ? 'Sync...' : 'Chargement...'}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Configuration Notion</h3>
              <button onClick={() => setIsConfigOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 p-3 rounded-lg text-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Layers size={16} className="text-green-600" />
                  <span className="font-medium text-green-800">Widget complètement isolé</span>
                </div>
                <p className="text-green-700 text-xs">
                  Ce widget est totalement indépendant. Chaque instance a son propre espace de stockage unique !
                </p>
                <p className="text-green-600 text-xs mt-1">
                  Namespace: {widgetNamespace.current?.substring(10, 25)}...
                </p>
                <p className="text-green-600 text-xs">
                  ID: {widgetId?.substring(widgetNamespace.current?.length + 1, widgetNamespace.current?.length + 15)}...
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Nom du workspace (optionnel)
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Ex: Business, Personnel..."
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Clé API Notion
                </label>
                <input
                  type="text"
                  value={notionApiKey}
                  onChange={(e) => setNotionApiKey(e.target.value)}
                  placeholder="ntn_..."
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
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
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-xs">
                <p className="font-medium mb-2">📋 Colonnes Notion requises :</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• <strong>Couverture</strong> (Files & media) - Vos images/vidéos</li>
                  <li>• <strong>Date</strong> (Date) - Date de publication</li>
                  <li>• <strong>Caption</strong> (Text) - Description</li>
                  <li>• <strong>Compte Instagram</strong> (Select) - Multi-comptes</li>
                </ul>
              </div>

              <button
                onClick={connectToNotion}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Connecter à Notion
              </button>
            </div>
          </div>
        </div>
      )}

{isAccountManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Gérer les comptes</h3>
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
                    placeholder="Ex: Freelance Créatif"
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
                        Supprimer tous les comptes
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

      {notification && (
        <div 
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          } text-white font-medium`}
          style={{
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && <span>✓</span>}
            {notification.type === 'error' && <span>✕</span>}
            {notification.type === 'info' && <span>ℹ</span>}
            <span>{notification.message}</span>
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
          Sauvegarder
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
