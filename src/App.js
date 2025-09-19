import React, { useState, useEffect } from 'react';
import { Camera, Settings, RefreshCw, Edit3, X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

// Configuration de l'API - À remplacer par votre domaine Vercel/Netlify
const API_BASE = window.location.origin + '/api';

// Composant pour afficher les médias avec modal et auto-slide
const MediaDisplay = ({ urls, type, title, caption, onOpenModal }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  if (!urls || urls.length === 0) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <Camera className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  // Auto-slide pour les carrousels
  useEffect(() => {
    if (type === 'Carrousel' && urls.length > 1 && !isHovered && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % urls.length);
      }, 3000); // Change toutes les 3 secondes

      return () => clearInterval(interval);
    }
  }, [type, urls.length, isHovered, isPaused, currentIndex]);

  const isVideo = (url) => {
    return url && (url.includes('.mp4') || url.includes('.mov') || url.includes('.webm'));
  };

  const currentUrl = urls[currentIndex];

  const nextImage = (e) => {
    e.stopPropagation();
    setIsPaused(true); // Pause l'auto-slide quand on navigue manuellement
    setCurrentIndex((prev) => (prev + 1) % urls.length);
    // Reprend l'auto-slide après 5 secondes
    setTimeout(() => setIsPaused(false), 5000);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setIsPaused(true); // Pause l'auto-slide quand on navigue manuellement
    setCurrentIndex((prev) => (prev - 1 + urls.length) % urls.length);
    // Reprend l'auto-slide après 5 secondes
    setTimeout(() => setIsPaused(false), 5000);
  };

  const goToSlide = (index, e) => {
    e.stopPropagation();
    setIsPaused(true); // Pause l'auto-slide
    setCurrentIndex(index);
    // Reprend l'auto-slide après 5 secondes
    setTimeout(() => setIsPaused(false), 5000);
  };

  return (
    <div 
      className="relative w-full h-full group cursor-pointer"
      onClick={() => onOpenModal && onOpenModal({ urls, type, title, caption, startIndex: currentIndex })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isVideo(currentUrl) ? (
        <div className="relative w-full h-full">
          <video
            src={currentUrl}
            className="w-full h-full object-cover"
            style={{ aspectRatio: '1080/1350', objectFit: 'cover', width: '100%', height: '100%' }}
            muted
            playsInline
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 rounded-full p-3">
              <Play className="w-8 h-8 text-white" fill="currentColor" />
            </div>
          </div>
        </div>
      ) : (
        <img
          src={currentUrl}
          alt={title}
          className="w-full h-full object-cover"
          style={{ 
            aspectRatio: '1080/1350', 
            objectFit: 'cover', 
            width: '100%', 
            height: '100%',
            minHeight: '100%',
            minWidth: '100%'
          }}
          loading="lazy"
        />
      )}

      {/* Icônes Instagram authentiques en haut à droite - Style discret */}
      <div className="absolute top-2 right-2 flex space-x-1">
        {type === 'Carrousel' && urls.length > 1 && (
          <div className="flex items-center justify-center w-6 h-6">
            {/* Icône carrousel - Multiple rectangles */}
            <svg 
              className="w-4 h-4 text-white drop-shadow-md" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <rect x="3" y="6" width="4" height="12" rx="1" />
              <rect x="10" y="6" width="4" height="12" rx="1" />
              <rect x="17" y="6" width="4" height="12" rx="1" />
            </svg>
          </div>
        )}
        {type === 'Vidéo' && (
          <div className="flex items-center justify-center w-6 h-6">
            {/* Icône vidéo - Caméra */}
            <svg 
              className="w-4 h-4 text-white drop-shadow-md" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path d="M23 7l-7 5 7 5V7z"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
        )}
      </div>

      {/* Navigation carrousel améliorée avec auto-slide */}
      {type === 'Carrousel' && urls.length > 1 && (
        <>
          {/* Flèches de navigation - Visibles par défaut, plus visibles au hover */}
          <button
            onClick={prevImage}
            className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 group-hover:bg-opacity-70 text-white rounded-full p-1.5 transition-all z-20 shadow-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 group-hover:bg-opacity-70 text-white rounded-full p-1.5 transition-all z-20 shadow-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          {/* Points de navigation en bas - Toujours visibles */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {urls.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToSlide(index, e)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white scale-110' 
                    : 'bg-white bg-opacity-60 hover:bg-opacity-80'
                }`}
              />
            ))}
          </div>
          
          {/* Indicateur de page actuelle en haut avec état auto-slide */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-0.5 rounded-full text-xs flex items-center space-x-1">
            <span>{currentIndex + 1}/{urls.length}</span>
            {!isPaused && !isHovered && (
              <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
            )}
          </div>

          {/* Barre de progression pour l'auto-slide */}
          {type === 'Carrousel' && !isPaused && !isHovered && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black bg-opacity-20">
              <div 
                className="h-full bg-white transition-all duration-300 ease-linear slide-progress"
                style={{ width: '100%' }}
              ></div>
            </div>
          )}
        </>
      )}

      {/* Caption au hover */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end p-3">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm">
          <p className="font-medium truncate">{title}</p>
          {caption && <p className="text-xs mt-1 line-clamp-2">{caption}</p>}
        </div>
      </div>
    </div>
  );
};

// Modal pour afficher le détail des posts
const PostModal = ({ post, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (post) {
      setCurrentIndex(post.startIndex || 0);
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const { urls, type, title, caption } = post;

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % urls.length);
  };

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + urls.length) % urls.length);
  };

  const isVideo = (url) => {
    return url && (url.includes('.mp4') || url.includes('.mov') || url.includes('.webm'));
  };

  const currentUrl = urls[currentIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media */}
        <div className="relative">
          {isVideo(currentUrl) ? (
            <video
              src={currentUrl}
              className="w-full max-h-[60vh] object-contain"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <img
              src={currentUrl}
              alt={title}
              className="w-full max-h-[60vh] object-contain"
              style={{ aspectRatio: '1080/1350' }}
            />
          )}

          {/* Navigation carrousel */}
          {urls.length > 1 && (
            <>
              <button
                onClick={prevMedia}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMedia}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Footer avec caption */}
        {caption && (
          <div className="p-4 border-t">
            <p className="text-sm text-gray-700">{caption}</p>
            {urls.length > 1 && (
              <div className="flex justify-center mt-3 space-x-1">
                {urls.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full cursor-pointer ${
                      index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Composant principal
function InstagramNotionWidget() {
  // États du widget
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]); // Tous les posts non filtrés
  const [availableAccounts, setAvailableAccounts] = useState(['Principal']);
  const [activeAccount, setActiveAccount] = useState('Principal');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalPost, setModalPost] = useState(null);
  const [draggedPost, setDraggedPost] = useState(null);

  // Configuration Notion
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
        posts: '',
        followers: '1,234',
        following: '567'
      }
    }
  });

  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState(profiles['Principal']);

  // Profil actuel basé sur le compte sélectionné
  const currentProfile = profiles[activeAccount] || profiles['Principal'];

  // Données mockées pour la démonstration - TOUTES au format 1080x1350 avec comptes
  const mockPosts = [
    {
      id: '1',
      title: 'Café matinal',
      date: '2024-09-20',
      urls: ['https://picsum.photos/1080/1350?random=10'],
      type: 'Image',
      caption: '☕ Perfect start to the day!',
      status: 'Programmé',
      account: 'Principal'
    },
    {
      id: '2',
      title: 'Mes vacances',
      date: '2024-09-19',
      urls: [
        'https://picsum.photos/1080/1350?random=11',
        'https://picsum.photos/1080/1350?random=12',
        'https://picsum.photos/1080/1350?random=13'
      ],
      type: 'Carrousel',
      caption: '🏖️ Souvenirs inoubliables de mes vacances',
      status: 'Brouillon',
      account: 'Principal'
    },
    {
      id: '3',
      title: 'Business Content',
      date: '2024-09-18',
      urls: ['https://picsum.photos/1080/1350?random=20'],
      type: 'Image',
      caption: '💼 Professional content for business account',
      status: 'À publier',
      account: 'Business'
    },
    {
      id: '4',
      title: 'Product Showcase',
      date: '2024-09-17',
      urls: [
        'https://picsum.photos/1080/1350?random=21',
        'https://picsum.photos/1080/1350?random=22'
      ],
      type: 'Carrousel',
      caption: '🛍️ Nouvelle collection disponible',
      status: 'Programmé',
      account: 'Business'
    },
    {
      id: '5',
      title: 'Personal Moment',
      date: '2024-09-16',
      urls: ['https://picsum.photos/1080/1350?random=30'],
      type: 'Image',
      caption: '🌟 Moment personnel à partager',
      status: 'Brouillon',
      account: 'Personnel'
    },
    {
      id: '6',
      title: 'Nature walk',
      date: '2024-09-15',
      urls: ['https://picsum.photos/1080/1350?random=17'],
      type: 'Image',
      caption: '🌿 Reconnexion avec la nature',
      status: 'À publier',
      account: 'Principal'
    }
  ].filter(post => post.status.toLowerCase() !== 'posté' && post.status.toLowerCase() !== 'posted');

  // Filtrer les posts par compte actif
  const filteredPosts = posts.filter(post => post.account === activeAccount);

  // Extraire les comptes uniques des données mockées
  const mockAccounts = [...new Set(mockPosts.map(post => post.account))];

  // Charger la configuration depuis localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('notionConfig');
    const savedProfiles = localStorage.getItem('instagramProfiles');
    const savedActiveAccount = localStorage.getItem('activeAccount');
    
    if (savedConfig) {
      setNotionConfig(JSON.parse(savedConfig));
    }
    if (savedProfiles) {
      const loadedProfiles = JSON.parse(savedProfiles);
      setProfiles(loadedProfiles);
      // Mettre à jour les comptes disponibles depuis les profils sauvés
      const savedAccounts = Object.keys(loadedProfiles);
      setAvailableAccounts(savedAccounts);
    }
    if (savedActiveAccount && savedActiveAccount !== 'null') {
      setActiveAccount(savedActiveAccount);
    }

    // Test de l'API au chargement
    testApiEndpoint();
  }, []);

  // Mettre à jour tempProfile quand on change de compte
  useEffect(() => {
    setTempProfile(currentProfile);
  }, [activeAccount, currentProfile]);

  // Effet pour filtrer les posts quand le compte actif change
  useEffect(() => {
    const filtered = allPosts.filter(post => post.account === activeAccount);
    setPosts(filtered);
  }, [activeAccount, allPosts]);

  // Test de connectivité de l'API
  const testApiEndpoint = async () => {
    try {
      const response = await fetch(`${API_BASE}/notion`);
      const data = await response.json();
      console.log('API Test Response:', response.status, data.error === "Method not allowed");
    } catch (error) {
      console.log('API Test Failed:', error.message);
    }
  };

  // Sauvegarder la configuration Notion
  const saveNotionConfig = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Validation du format de clé API
      if (!notionConfig.apiKey.startsWith('ntn_') && !notionConfig.apiKey.startsWith('secret_')) {
        setError('❌ Format de clé API invalide. Utilisez le nouveau format "ntn_..." depuis notion.so/my-integrations');
        setIsLoading(false);
        return;
      }

      // Test de connexion avec Notion
      const response = await fetch(`${API_BASE}/notion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test',
          apiKey: notionConfig.apiKey,
          databaseId: notionConfig.databaseId
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setConnectionStatus('connected');
        localStorage.setItem('notionConfig', JSON.stringify(notionConfig));
        setShowSettings(false);
        
        // Message de succès avec format d'API détecté
        setError(`✅ Connecté avec succès ! Format API: ${data.apiFormat || 'détecté'}`);
        
        // Charger les posts automatiquement
        await loadPostsFromNotion();
      } else {
        setConnectionStatus('error');
        setError(data.error || 'Erreur de connexion');
      }
    } catch (error) {
      setConnectionStatus('error');
      if (error.message.includes('fetch')) {
        setError('❌ Erreur de réseau - Vérifiez votre connexion et que l\'API est déployée');
      } else {
        setError(`❌ Erreur: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les posts depuis Notion
  const loadPostsFromNotion = async () => {
    if (!notionConfig.apiKey || !notionConfig.databaseId) {
      // Utiliser les données mockées et extraire les comptes
      setAllPosts(mockPosts);
      const accounts = mockAccounts;
      setAvailableAccounts(accounts);
      
      // Créer des profils par défaut pour les nouveaux comptes
      const newProfiles = { ...profiles };
      accounts.forEach(account => {
        if (!newProfiles[account]) {
          newProfiles[account] = {
            username: account.toLowerCase().replace(' ', '_'),
            fullName: `Compte ${account}`,
            bio: `🎯 Compte ${account}\n📸 Contenu spécialisé\n✨ Suivez-nous !`,
            profilePhoto: '',
            stats: {
              posts: '',
              followers: '1,234',
              following: '567'
            }
          };
        }
      });
      setProfiles(newProfiles);
      localStorage.setItem('instagramProfiles', JSON.stringify(newProfiles));
      
      // Filtrer pour le compte actif
      const filtered = mockPosts.filter(post => post.account === activeAccount);
      setPosts(filtered);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/notion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getPosts',
          apiKey: notionConfig.apiKey,
          databaseId: notionConfig.databaseId
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAllPosts(data.posts || []);
        
        // Gérer les comptes
        const accounts = data.accounts || ['Principal'];
        setAvailableAccounts(accounts);
        
        // Créer des profils par défaut pour les nouveaux comptes
        const newProfiles = { ...profiles };
        accounts.forEach(account => {
          if (!newProfiles[account]) {
            newProfiles[account] = {
              username: account.toLowerCase().replace(' ', '_'),
              fullName: `Compte ${account}`,
              bio: `🎯 Compte ${account}\n📸 Contenu spécialisé\n✨ Suivez-nous !`,
              profilePhoto: '',
              stats: {
                posts: '',
                followers: '1,234',
                following: '567'
              }
            };
          }
        });
        setProfiles(newProfiles);
        localStorage.setItem('instagramProfiles', JSON.stringify(newProfiles));
        
        // Filtrer pour le compte actif
        const filtered = (data.posts || []).filter(post => post.account === activeAccount);
        setPosts(filtered);
        
        setConnectionStatus('connected');
        const totalPosts = filtered.length;
        const totalRows = data.debug?.totalRows || totalPosts;
        const statusFilter = data.debug?.filterInfo?.statusFiltering === 'Active' ? ' (hors "Posté")' : '';
        setError(`✅ Connecté à Notion • ${totalPosts}/${totalRows} post(s)${statusFilter} • ${activeAccount}`);
      } else {
        setError(data.error || 'Erreur lors du chargement des posts');
        setAllPosts(mockPosts);
        const filtered = mockPosts.filter(post => post.account === activeAccount);
        setPosts(filtered);
      }
    } catch (error) {
      setError(`Erreur de chargement: ${error.message}`);
      setAllPosts(mockPosts);
      const filtered = mockPosts.filter(post => post.account === activeAccount);
      setPosts(filtered);
    }
  };

  // Actualiser les posts
  const refreshPosts = async () => {
    setIsRefreshing(true);
    await loadPostsFromNotion();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Mettre à jour la date d'un post dans Notion lors du drag & drop
  const updatePostDate = async (postId, newDate) => {
    if (!notionConfig.apiKey || !notionConfig.databaseId) return;

    try {
      await fetch(`${API_BASE}/notion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateDate',
          apiKey: notionConfig.apiKey,
          postId: postId,
          newDate: newDate
        })
      });
    } catch (error) {
      console.error('Erreur mise à jour date:', error);
    }
  };

  // Gestion des comptes/onglets
  const switchAccount = (accountName) => {
    setActiveAccount(accountName);
    localStorage.setItem('activeAccount', accountName);
    setEditMode(false); // Fermer le mode édition si ouvert
  };

  const addNewAccount = (accountName) => {
    if (!accountName || availableAccounts.includes(accountName)) return;
    
    const newAccounts = [...availableAccounts, accountName];
    setAvailableAccounts(newAccounts);
    
    // Créer un profil par défaut pour le nouveau compte
    const newProfiles = {
      ...profiles,
      [accountName]: {
        username: accountName.toLowerCase().replace(' ', '_'),
        fullName: `Compte ${accountName}`,
        bio: `🎯 Compte ${accountName}\n📸 Contenu spécialisé\n✨ Suivez-nous !`,
        profilePhoto: '',
        stats: {
          posts: '',
          followers: '1,234',
          following: '567'
        }
      }
    };
    setProfiles(newProfiles);
    localStorage.setItem('instagramProfiles', JSON.stringify(newProfiles));
    
    // Basculer vers le nouveau compte
    switchAccount(accountName);
  };

  const removeAccount = (accountName) => {
    if (accountName === 'Principal' || availableAccounts.length <= 1) return;
    
    const newAccounts = availableAccounts.filter(acc => acc !== accountName);
    setAvailableAccounts(newAccounts);
    
    const newProfiles = { ...profiles };
    delete newProfiles[accountName];
    setProfiles(newProfiles);
    localStorage.setItem('instagramProfiles', JSON.stringify(newProfiles));
    
    // Si on supprime le compte actif, basculer vers Principal
    if (activeAccount === accountName) {
      switchAccount('Principal');
    }
  };

  // Gestion du profil (adapté pour multi-comptes)
  const enterEditMode = () => {
    setEditMode(true);
    setTempProfile({ ...currentProfile });
  };

  const saveProfile = () => {
    const newProfiles = {
      ...profiles,
      [activeAccount]: tempProfile
    };
    setProfiles(newProfiles);
    localStorage.setItem('instagramProfiles', JSON.stringify(newProfiles));
    setEditMode(false);
  };

  const cancelEdit = () => {
    setTempProfile({ ...currentProfile });
    setEditMode(false);
  };

  // Statistiques calculées (adapté pour le compte actuel)
  const getDisplayStats = () => {
    const postsCount = currentProfile.stats.posts || filteredPosts.length.toString();
    return {
      posts: postsCount,
      followers: currentProfile.stats.followers,
      following: currentProfile.stats.following
    };
  };

  // Fonction pour éditer directement une statistique (adapté pour multi-comptes)
  const editStat = (statName) => {
    enterEditMode();
    // Auto-focus sur la section des statistiques
    setTimeout(() => {
      const statInput = document.querySelector(`input[name="stats.${statName}"]`);
      if (statInput) statInput.focus();
    }, 100);
  };

  // Drag & Drop avec mise à jour Notion
  const handleDragStart = (e, post) => {
    setDraggedPost(post);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    
    if (!draggedPost) return;

    const newPosts = [...posts];
    const draggedIndex = newPosts.findIndex(p => p.id === draggedPost.id);
    
    if (draggedIndex === -1 || draggedIndex === targetIndex) return;

    // Réorganiser les posts
    const [draggedItem] = newPosts.splice(draggedIndex, 1);
    newPosts.splice(targetIndex, 0, draggedItem);

    // Calculer la nouvelle date basée sur la position
    const targetPost = posts[targetIndex];
    let newDate;
    
    if (targetPost) {
      // Utiliser la date du post de destination
      newDate = targetPost.date;
    } else {
      // Si pas de post cible, utiliser la date d'aujourd'hui
      newDate = new Date().toISOString().split('T')[0];
    }

    // Mettre à jour localement
    draggedItem.date = newDate;
    setPosts(newPosts);

    // Mettre à jour dans Notion
    await updatePostDate(draggedItem.id, newDate);
    
    setDraggedPost(null);
  };

  // Ouvrir modal
  const openModal = (post) => {
    setModalPost(post);
  };

  const closeModal = () => {
    setModalPost(null);
  };

  // Redimensionner les images pour forcer le format 1080x1350
  const getResizedImageUrl = (originalUrl) => {
    // Si c'est une URL Picsum, on peut forcer la taille
    if (originalUrl.includes('picsum.photos')) {
      return originalUrl.replace(/\/\d+\/\d+/, '/1080/1350');
    }
    // Pour toutes les autres URLs, on ajoute des paramètres de redimensionnement si possible
    if (originalUrl.includes('unsplash.com')) {
      return `${originalUrl}?w=1080&h=1350&fit=crop`;
    }
    // Pour les URLs génériques, on garde l'originale mais on force le ratio en CSS
    return originalUrl;
  };

  // Grille de posts (3x4 = 12 positions fixes) - Posts filtrés par compte
  const gridPosts = Array(12).fill(null);
  filteredPosts.slice(0, 12).forEach((post, index) => {
    // Redimensionner les URLs d'images
    const resizedPost = {
      ...post,
      urls: post.urls?.map(getResizedImageUrl) || []
    };
    gridPosts[index] = resizedPost;
  });

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-200 font-sans relative">
      {/* Filigrane Freelance Créatif */}
      <div className="absolute top-2 left-2 z-10">
        <a 
          href="https://www.instagram.com/freelance.creatif/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors bg-white bg-opacity-80 px-2 py-1 rounded backdrop-blur-sm"
        >
          Créé par @Freelancecreatif
        </a>
      </div>

      {/* Header Instagram */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Camera className="w-6 h-6" />
          <span className="font-bold text-lg">Instagram</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshPosts}
            className={`p-2 rounded-full hover:bg-gray-100 ${isRefreshing ? 'animate-spin' : ''}`}
            title="Actualiser le feed"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Configuration"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Configuration Notion */}
      {showSettings && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold mb-3">⚙️ Configuration Notion</h3>
          
          {/* Aide pour le nouveau format */}
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <p className="font-medium text-blue-800">📢 Nouveau format API Notion (Sept 2024)</p>
            <p className="text-blue-600 mt-1">Les clés commencent maintenant par <code className="bg-blue-100 px-1 rounded">ntn_</code> au lieu de <code className="bg-blue-100 px-1 rounded">secret_</code></p>
            <p className="text-blue-600 mt-1">📍 Récupérez votre clé sur: <strong>notion.so/my-integrations</strong></p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Clé API Notion (ntn_...)
              </label>
              <input
                type="password"
                value={notionConfig.apiKey}
                onChange={(e) => setNotionConfig({...notionConfig, apiKey: e.target.value})}
                placeholder="ntn_abc123def456..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                ID de la base de données
              </label>
              <input
                type="text"
                value={notionConfig.databaseId}
                onChange={(e) => setNotionConfig({...notionConfig, databaseId: e.target.value})}
                placeholder="32 caractères de l'URL de votre base"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            {/* Gestion des comptes Instagram */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-2">📱 Comptes Instagram</h4>
              <p className="text-xs text-gray-600 mb-3">
                Ajoutez une colonne "Compte" ou "Instagram" dans votre base Notion avec les noms de vos comptes.
              </p>
              
              {/* Liste des comptes existants */}
              <div className="space-y-2 mb-3">
                {availableAccounts.map(account => (
                  <div key={account} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-sm font-medium">{account}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${account === activeAccount ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                        {account === activeAccount ? 'Actif' : 'Inactif'}
                      </span>
                      {account !== 'Principal' && availableAccounts.length > 1 && (
                        <button
                          onClick={() => removeAccount(account)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ajouter un nouveau compte */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Nom du nouveau compte"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      addNewAccount(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    if (input.value.trim()) {
                      addNewAccount(input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  ➕
                </button>
              </div>
            </div>
            
            <button
              onClick={saveNotionConfig}
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 rounded font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Connexion...' : 'Connecter'}
            </button>
          </div>
        </div>
      )}

      {/* Statut de connexion / Erreurs */}
      {error && (
        <div className={`p-3 text-sm ${error.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {error}
        </div>
      )}

      {/* Profil */}
      <div className="p-4 border-b border-gray-200">
        {!editMode ? (
          <>
            {/* Mode Affichage */}
            <div className="flex items-center space-x-4 mb-4">
              <div 
                className="relative group cursor-pointer"
                onClick={enterEditMode}
                title="Cliquer pour modifier"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5">
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
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  {/* Statistiques cliquables - EN NOIR */}
                  <div className="flex space-x-6">
                    <div 
                      className="text-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors group"
                      onClick={() => editStat('posts')}
                      title="Cliquez pour modifier"
                    >
                      <div className="font-bold text-gray-900 group-hover:text-black flex items-center">
                        {getDisplayStats().posts}
                        <Edit3 className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-sm text-gray-600">posts</div>
                    </div>
                    <div 
                      className="text-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors group"
                      onClick={() => editStat('followers')}
                      title="Cliquez pour modifier"
                    >
                      <div className="font-bold text-gray-900 group-hover:text-black flex items-center">
                        {getDisplayStats().followers}
                        <Edit3 className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-sm text-gray-600">abonnés</div>
                    </div>
                    <div 
                      className="text-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors group"
                      onClick={() => editStat('following')}
                      title="Cliquez pour modifier"
                    >
                      <div className="font-bold text-gray-900 group-hover:text-black flex items-center">
                        {getDisplayStats().following}
                        <Edit3 className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-sm text-gray-600">suivi(e)s</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div 
                className="font-bold cursor-pointer hover:text-blue-600 transition-colors"
                onClick={enterEditMode}
                title="Cliquer pour modifier"
              >
                {currentProfile.fullName}
              </div>
              <div 
                className="text-sm cursor-pointer hover:text-blue-600 transition-colors"
                onClick={enterEditMode}
                title="Cliquer pour modifier"
              >
                @{currentProfile.username}
              </div>
              <div 
                className="text-sm whitespace-pre-line cursor-pointer hover:text-blue-600 transition-colors"
                onClick={enterEditMode}
                title="Cliquer pour modifier"
              >
                {currentProfile.bio}
              </div>
              
              {/* Bouton rapide pour modifier les statistiques */}
              <button
                onClick={enterEditMode}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Modifier les statistiques</span>
              </button>
              <div className="text-xs text-gray-500">👆 Cliquez sur les chiffres pour les modifier</div>
            </div>
          </>
        ) : (
          <>
            {/* Mode Édition */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">✏️ Modifier le profil - {activeAccount}</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Photo de profil (URL)</label>
                <input
                  type="url"
                  value={tempProfile.profilePhoto}
                  onChange={(e) => setTempProfile({...tempProfile, profilePhoto: e.target.value})}
                  placeholder="https://exemple.com/photo.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nom d'utilisateur</label>
                <input
                  type="text"
                  value={tempProfile.username}
                  onChange={(e) => setTempProfile({...tempProfile, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nom complet</label>
                <input
                  type="text"
                  value={tempProfile.fullName}
                  onChange={(e) => setTempProfile({...tempProfile, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={tempProfile.bio}
                  onChange={(e) => setTempProfile({...tempProfile, bio: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Votre bio Instagram..."
                />
              </div>

              {/* Section statistiques bien visible */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-medium mb-3 text-blue-800">📊 Statistiques du profil</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-blue-600">Publications</label>
                    <input
                      type="text"
                      name="stats.posts"
                      value={tempProfile.stats.posts}
                      onChange={(e) => setTempProfile({
                        ...tempProfile, 
                        stats: {...tempProfile.stats, posts: e.target.value}
                      })}
                      placeholder="Auto"
                      className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-blue-600">Abonnés</label>
                    <input
                      type="text"
                      name="stats.followers"
                      value={tempProfile.stats.followers}
                      onChange={(e) => setTempProfile({
                        ...tempProfile, 
                        stats: {...tempProfile.stats, followers: e.target.value}
                      })}
                      placeholder="1,234"
                      className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-blue-600">Suivi(e)s</label>
                    <input
                      type="text"
                      name="stats.following"
                      value={tempProfile.stats.following}
                      onChange={(e) => setTempProfile({
                        ...tempProfile, 
                        stats: {...tempProfile.stats, following: e.target.value}
                      })}
                      placeholder="567"
                      className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                    />
                  </div>
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-blue-100 px-2 py-0.5 rounded">1,234</span>
                    <span className="bg-blue-100 px-2 py-0.5 rounded">15.2K</span>
                    <span className="bg-blue-100 px-2 py-0.5 rounded">2.5M</span>
                    <span className="bg-blue-100 px-2 py-0.5 rounded">10K+</span>
                  </div>
                  <p className="mt-1">Formats supportés: nombres, K, M, + etc.</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={saveProfile}
                  className="flex-1 bg-blue-500 text-white py-2 rounded font-medium hover:bg-blue-600"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded font-medium hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Onglets des comptes Instagram */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {availableAccounts.map(account => (
            <button
              key={account}
              onClick={() => switchAccount(account)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                account === activeAccount
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{account}</span>
                {account === activeAccount && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              {/* Nombre de posts pour ce compte */}
              <div className="text-xs text-gray-400 mt-1">
                {allPosts.filter(post => post.account === account).length} posts
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Grille de posts 3x4 avec drag & drop amélioré - Format 1080x1350 forcé */}
      <div className="grid grid-cols-3 gap-1">
        {gridPosts.map((post, index) => (
          <div
            key={post?.id || `empty-${index}`}
            className="relative group overflow-hidden bg-gray-100"
            draggable={!!post}
            onDragStart={(e) => post && handleDragStart(e, post)}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={handleDragOver}
            style={{ 
              aspectRatio: '1080/1350',
              width: '100%',
              height: 'auto'
            }}
          >
            {post ? (
              <MediaDisplay 
                urls={post.urls} 
                type={post.type} 
                title={post.title}
                caption={post.caption}
                onOpenModal={openModal}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ aspectRatio: '1080/1350' }}>
                <Camera className="w-8 h-8" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal pour afficher les posts en détail */}
      <PostModal 
        post={modalPost}
        isOpen={!!modalPost}
        onClose={closeModal}
      />
    </div>
  );
}

export default InstagramNotionWidget;
